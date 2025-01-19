package main

import (
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestCreateThumbnails(t *testing.T) {
	collection := &Collection{
		Name:       "Photos",
		PhotosPath: "tests/",
		ThumbsPath: t.TempDir()}

	err := collection.cache.Init(collection, true)
	require.NoError(t, err)

	collection.CreateThumbnails()
	// Wait to thumbnails to finish
	wgThumbs.Wait()
}

func TestBenchmarkThumbnails(t *testing.T) {
	t.Skip("fixme: test does not finish")

	collection := &Collection{
		Name:       "Photos",
		PhotosPath: "tests/",
		ThumbsPath: t.TempDir()}

	err := collection.cache.Init(collection, true)
	require.NoError(t, err)

	var sum time.Duration = 0
	var bytes = 0
	albums, err := collection.GetAlbums()
	require.NoError(t, err)

	for _, album := range albums {
		err := album.GetPhotos(collection, false, []PseudoAlbumEntry{}...)
		require.NoError(t, err)

		start := time.Now()
		for _, photo := range album.photosMap {
			file, _ := os.ReadFile(photo.ThumbnailPath(collection))
			bytes += len(file)
		}
		sum += time.Since(start)
	}
	t.Log("Total time (ms):", sum.Milliseconds())
	t.Log("Total size (b):", bytes)
}

func TestBenchmarkThumbnailAlbum(t *testing.T) {
	t.Skip("fixme: test does not finish")

	collection := &Collection{
		Name:       "Photos",
		PhotosPath: "tests/",
		ThumbsPath: t.TempDir()}

	err := collection.cache.Init(collection, true)
	require.NoError(t, err)

	var sum time.Duration = 0
	var bytes = 0
	album, err := collection.GetAlbum("album1")
	require.NoError(t, err)

	err = album.GetPhotos(collection, false, []PseudoAlbumEntry{}...)
	require.NoError(t, err)

	start := time.Now()
	for _, photo := range album.photosMap {
		file, _ := os.ReadFile(photo.ThumbnailPath(collection))
		bytes += len(file)
	}
	sum += time.Since(start)

	t.Log("Total time (ms):", sum.Milliseconds())
	t.Log("Total size (b):", bytes)
}
