package main

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDecodeEncodeImage(t *testing.T) {
	img, err := DecodeImage("tests/album1/image3.heic", orientationUnspecified)
	require.NoError(t, err, "Failed to decode image")

	fo, err := os.OpenFile("tests/.thumbs/out.jpg", os.O_TRUNC|os.O_RDWR|os.O_CREATE, 0644)
	require.NoError(t, err, "Failed to create output file")
	defer fo.Close()

	err = EncodeImage(fo, img, nil)
	require.NoError(t, err, "Failed to encode")
}

func TestExtractExif(t *testing.T) {
	// From https://github.com/ianare/exif-samples/blob/master/jpg/Ricoh_Caplio_RR330.jpg
	file, err := os.Open("tests/Ricoh_Caplio_RR330.jpg")
	require.NoError(t, err)

	_, _, exifData, _, err := ExtractImageInfoOpened(file)
	require.NoError(t, err)
	assert.NotNil(t, exifData)

	exifVersion, _ := exifData.Get("ExifVersion")
	exifVersionStr := string(exifVersion.Val)
	assert.Equal(t, "0220", exifVersionStr)
}

func TestExtractImageInfo_PNG(t *testing.T) {
	file, err := os.Open("tests/KTM-Class-29.png")
	require.NoError(t, err)

	format, config, exifData, fooocusData, err := ExtractImageInfoOpened(file)
	require.NoError(t, err)

	assert.Equal(t, "png", format)
	assert.NotNil(t, config)
	assert.Nil(t, exifData)
	assert.Nil(t, fooocusData)
}

func TestExtractImageInfo_FooocusMeta(t *testing.T) {
	testCases := []struct {
		file    string
		format  string
		hasExif bool
	}{
		{"fooocus-meta.png", "png", false},
		{"fooocus-meta.jpeg", "jpeg", true},
	}

	for _, tc := range testCases {
		t.Run(tc.file, func(t *testing.T) {
			file, err := os.Open(filepath.Join("tests", tc.file))
			require.NoError(t, err)

			format, config, exifData, fooocusData, err := ExtractImageInfoOpened(file)
			require.NoError(t, err)

			assert.Equal(t, tc.format, format)
			assert.NotNil(t, config)
			if tc.hasExif {
				assert.NotNil(t, exifData)
			} else {
				assert.Nil(t, exifData)
			}

			require.NotNil(t, fooocusData)
			assert.Equal(t, "Fooocus v2.5.5", fooocusData.Version)
		})
	}
}
