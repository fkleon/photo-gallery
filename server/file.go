package main

import (
	"bufio"
	"errors"
	"image"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/mholt/goexif2/exif"
)

type File struct {
	Type   string       `json:"type"`
	MIME   string       `json:"mime"`
	Url    string       `json:"url"`
	Path   string       `json:"-"`
	Ext    string       `json:"-"`
	Format string       `json:"-"`
	Info   image.Config `json:"-"`
	Exif   *exif.Exif   `json:"-"`
}

func (file *File) Name() string {
	return path.Base(file.Path)
}

// Find which type (image or video) and MIME-type of the file
func (file *File) DetermineTypeAndMIME() error {
	f, err := os.Open(file.Path)
	if err != nil {
		return err
	}
	defer f.Close()

	// Only the first 512 bytes are used to sniff the content type,
	// as specified in http.DetectContentType
	buffer := make([]byte, 512)
	_, err = f.Read(buffer)
	if err != nil {
		return err
	}

	// Use the net/http package's handy DectectContentType function. Always returns a valid
	// content-type by returning "application/octet-stream" if no others seemed to match.
	file.MIME = http.DetectContentType(buffer)
	file.Ext = strings.ToLower(path.Ext(file.Path))

	switch {
	case strings.HasPrefix(file.MIME, "image/"):
		file.Type = "image"
	case strings.HasPrefix(file.Type, "video/"):
		file.Type = "video"
	default:
		// Unknown MIME types, determine using file extension
		switch file.Ext {
		case ".heic", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".tiff", ".tif":
			file.Type = "image"
		case ".mov", ".mp4", ".mpeg", ".avi":
			file.Type = "video"
			file.MIME = "video/mp4" // FIXME: force MP4 for the browser to be happy and play the video
		default:
			log.Printf("Unknown file type - ext: %s, mime: %s\n", file.Ext, file.Type)
			// TODO: handle unknown file types
		}
	}
	return nil
}
func (file *File) ExtractInfo() (err error) {
	switch file.Type {
	case "image":
		file.Format, file.Info, file.Exif, err = ExtractImageInfo(file.Path)
	case "video":
		return errors.New("unsupported extraction")
	default:
		return errors.New("invalid extraction")
	}
	return
}

// If the file requires transcoding
func (file *File) RequiresConvertion() bool {
	if file.Type == "image" && file.Ext == ".heic" {
		return true
	}

	return false
}

func (file *File) Convert(w *bufio.Writer) error {
	switch file.Type {
	case "image":
		// Check for EXIF
		_, _, exifInfo, _ := ExtractImageInfo(file.Path)
		var exifData []byte
		if exifInfo != nil {
			exifData = exifInfo.Raw
		}

		// Decode original image
		img, err := DecodeImage(file.Path)
		if err != nil {
			return err
		}

		// Encode thumbnail
		err = EncodeImage(w, img, exifData)
		if err != nil {
			return err
		}
	case "video":
		return errors.New("unsupported conversion")
	}
	return errors.New("invalid conversion")
}

func (file File) CreateThumbnail(thumbpath string, w io.Writer) (err error) {
	var img image.Image

	switch file.Type {
	case "image":
		// Decode original image
		img, err = DecodeImage(file.Path)
	case "video":
		// Get a frame from the video
		img, err = GetVideoFrame(file.Path)
	}

	// Error decoding image from source
	if err != nil {
		return
	}

	return CreateThumbnailFromImage(img, thumbpath, w)
}
