package main

import (
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/timshannon/bolthold"
)

func (collection *Collection) Scan(fullScan bool) {
	albums, err := collection.GetAlbums()
	if err != nil {
		log.Println(err)
		return
	}

	defer collection.cache.FinishFlush()

	// Quick scan
	if !fullScan {
		for _, album := range albums {
			if !collection.cache.IsAlbumFullyScanned(album) { // Skip album if it was already scanned
				collection.GetAlbumWithPhotos(album.Name, true, true)
			}
		}
		return
	}

	// Full scan
	for _, album := range albums {
		// Load album
		album, err = collection.GetAlbumWithPhotos(album.Name, true, true)
		if err != nil {
			log.Println(err)
		}

		// Validate if photos have thumbnails
		for _, photo := range album.photosMap {
			thumbPath := photo.ThumbnailPath(collection)

			// If the file doesn't exist
			_, err := os.Stat(thumbPath)
			hasThumb := !os.IsNotExist(err)

			// Update flag if it is different than stored
			if photo.HasThumb != hasThumb {
				photo.HasThumb = hasThumb
				collection.cache.AddPhotoInfo(photo)
			}
		}

		// Validate if all entries in the cacheDB are still valid
		var photos []*Photo
		err = collection.cache.store.Find(&photos, bolthold.Where("Album").Eq(album.Name).And("Id").MatchFunc(
			func(id string) (bool, error) {
				p, e := album.GetPhoto(id)
				if e == nil && p != nil {
					return false, nil
				}
				return true, nil
			}))
		if err == nil {
			collection.cache.DeletePhotoInfo(photos...)
		}
	}

	// Clean entries in the cacheDB of deleted albums
	var photos []*Photo
	err = collection.cache.store.Find(&photos, bolthold.Where("Album").MatchFunc(
		func(album string) (bool, error) {
			return !collection.cache.IsAlbum(album), nil
		}))
	if err == nil {
		collection.cache.DeletePhotoInfo(photos...)
	} else {
		log.Println(err)
	}
}

func (collection *Collection) CreateThumbnails() {
	start := time.Now()
	println("AGGREGATE:", collection.Name)

	q := bolthold.Query{}
	result, err := collection.cache.store.FindAggregate(ThumbQueue{}, q.Index("Album"), "Album")
	if err != nil {
		log.Print(err)
		return
	}
	println("DONE AGGREGATE", time.Since(start).Milliseconds())

	for _, albumResult := range result {
		var albumName string
		var queue []*ThumbQueue
		var photos []*Photo

		// Get album
		albumResult.Group(&albumName)
		album, err := collection.GetAlbum(albumName)
		if err != nil {
			log.Println(err)
			continue
		}

		// Get photos to be processed
		albumResult.Reduction(&queue)
		for _, entry := range queue {
			var photo *Photo
			err = collection.cache.store.Get(entry.PhotoKey, &photo)
			if err != nil {
				log.Println(err)
				continue
			}
			photos = append(photos, photo)
		}

		// Add work to generate thumbnails in background
		AddThumbsBackground(collection, album, photos...)
	}
}

func CleanupThumbnails(collections map[string]*Collection) {
	keep := map[string]struct{}{}

	// Step 1: Create a map of files to keep
	for _, collection := range collections {
		// Get all photos with thumbnail
		var photos []*Photo
		err := collection.cache.store.Find(&photos, bolthold.Where("HasThumb").Eq(true))
		if err != nil {
			log.Println(err)
			return
		}

		// Get path for the thumbnail for each photo
		for _, photo := range photos {
			path := photo.ThumbnailPath(collection)
			keep[path] = struct{}{}
		}
	}

	// Step 2: Traverse the thumbnails directory for each collection
	for _, collection := range collections {
		// As defined in photo.ThumbnailPath, is exactly "d1/d2/1234567.jpg"
		path := filepath.Join(collection.ThumbsPath, "??", "??", "???????.jpg")
		// Gather all files from thumbs folders
		folder, err := filepath.Glob(path)
		if err != nil {
			log.Println(err)
			continue
		}

		// Files in ThumbsPath that match the pattern
		for _, file := range folder {
			// but does not have the corresponding photo
			if _, ok := keep[file]; !ok {
				// Delete the file
				log.Println("Deleting thumbnail", file)
				err := os.Remove(file)
				if err != nil {
					log.Println(err)
				}
			}
		}
	}
}
