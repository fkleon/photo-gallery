package main

import (
	"os"
	"testing"
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
