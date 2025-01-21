package main

import (
	"fmt"
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
	file, err := os.Open("tests/Ricoh_Caplio_RR330.jpg")
	require.NoError(t, err)

	_, _, exifData, _, err := ExtractImageInfoOpened(file, "image/jpg")
	require.NoError(t, err)
	assert.NotNil(t, exifData)

	exifVersion, _ := exifData.Get("ExifVersion")
	exifVersionStr := string(exifVersion.Val)
	assert.Equal(t, "0220", exifVersionStr)
}

func TestExtractPNGTextChunks(t *testing.T) {
	file, err := os.Open("tests/KTM-Class-29.png")
	require.NoError(t, err)

	meta, err := ExtractPNGTextChunksOpened(file)
	require.NoError(t, err)

	assert.Equal(t, map[string]string{
		"date:create": "2021-03-22T11:16:58+00:00",
		"date:modify": "2016-04-20T07:07:19+00:00",
		"Software":    "www.inkscape.org",
	}, meta)
}

func TestExtractImageInfo_PNG(t *testing.T) {
	file, err := os.Open("tests/KTM-Class-29.png")
	require.NoError(t, err)

	format, config, exifData, fooocusData, err := ExtractImageInfoOpened(file, "image/png")
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

			format, config, exifData, fooocusData, err := ExtractImageInfoOpened(file, fmt.Sprintf("image/%s", tc.format))
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
