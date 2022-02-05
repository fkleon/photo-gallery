package main

import (
	"image"
	_ "image/gif"
	"image/jpeg"
	_ "image/png"
	"io"
	"log"
	"os"

	heif "github.com/adrium/goheif"
	"github.com/nfnt/resize"
	"github.com/rwcarlsen/goexif/exif"
	_ "golang.org/x/image/bmp"
	_ "golang.org/x/image/vp8"
	_ "golang.org/x/image/webp"
)

// Skip Writer for exif writing
type writerSkipper struct {
	w           io.Writer
	bytesToSkip int
}

func (w *writerSkipper) Write(data []byte) (int, error) {
	if w.bytesToSkip <= 0 {
		return w.w.Write(data)
	}

	if dataLen := len(data); dataLen < w.bytesToSkip {
		w.bytesToSkip -= dataLen
		return dataLen, nil
	}

	if n, err := w.w.Write(data[w.bytesToSkip:]); err == nil {
		n += w.bytesToSkip
		w.bytesToSkip = 0
		return n, nil
	} else {
		return n, err
	}
}

func newWriterExif(w io.Writer, exif []byte) (io.Writer, error) {
	writer := &writerSkipper{w, 2}
	soi := []byte{0xff, 0xd8}
	if _, err := w.Write(soi); err != nil {
		return nil, err
	}

	if exif != nil {
		app1Marker := 0xe1
		markerlen := 2 + len(exif)
		marker := []byte{0xff, uint8(app1Marker), uint8(markerlen >> 8), uint8(markerlen & 0xff)}
		if _, err := w.Write(marker); err != nil {
			return nil, err
		}

		if _, err := w.Write(exif); err != nil {
			return nil, err
		}
	}

	return writer, nil
}

func EncodeImage(w io.Writer, image image.Image, exifData []byte) error {
	writer, err := newWriterExif(w, exifData)
	if err != nil {
		log.Println("Warning: could not write EXIF data")
	}

	return jpeg.Encode(writer, image, nil)
}

func DecodeImage(filepath string) (image.Image, []byte, error) {
	var err error

	// Open input file image
	fin, err := os.Open(filepath)
	if err != nil {
		return nil, nil, err
	}
	defer fin.Close()

	_, format, err := image.DecodeConfig(fin)
	if err != nil {
		return nil, nil, err
	}

	// Rewind to the start
	fin.Seek(0, io.SeekStart)

	// Extract EXIF
	var exifData []byte
	switch format {
	case "heic":
		exifData, err = heif.ExtractExif(fin)
	case "jpeg":
		x, e := exif.Decode(fin)
		exifData, err = x.Raw, e
	default:
		exifData, err = nil, nil
	}
	if exifData == nil || err != nil {
		log.Println("Warning: error while extracting EXIF from image")
	}

	// Rewind to the start
	fin.Seek(0, io.SeekStart)

	// Decode image
	img, _, err := image.Decode(fin)
	if err != nil {
		log.Println("Warning: error while decoding image")
	}

	return img, exifData, err
}

func CreateThumbnail(filepath string, thumbpath string) error {
	// Decode original image
	img, exif, err := DecodeImage(filepath)
	if err != nil {
		return err
	}

	// Open output file thumbnail
	fout, err := os.OpenFile(thumbpath, os.O_RDWR|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer fout.Close()

	// Resize image for thumbnail size
	resized := resize.Resize(0, 200, img, resize.Lanczos3)

	// Encode thumbnail
	err = EncodeImage(fout, resized, exif)
	if err != nil {
		return err
	}

	return nil // No error
}
