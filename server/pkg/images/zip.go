package images

import (
	"archive/zip"
	"bytes"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2/log"
)

func GenerateGalleryZips(galleryID uint) error {
	// Create the directory for the gallery zips if it doesn't exist
	err := CreateGalleryZipsDirectory(galleryID)
	if err != nil {
		log.Errorf("Unable to create gallery zips directory: %v\n", err)
		return err
	}

	// Generate the zip file for the gallery original images
	err = GenerateGalleryZip(galleryID, "original")
	if err != nil {
		log.Errorf("Unable to generate gallery zip for originals: %v\n", err)
		return err
	}

	// Generate the zip file for the gallery web images
	err = GenerateGalleryZip(galleryID, "web")
	if err != nil {
		log.Errorf("Unable to generate gallery zip for web sizes: %v\n", err)
		return err
	}

	return nil
}

// Generate the zip file for the gallery
func GenerateGalleryZip(galleryID uint, size string) error {
	// Create a new zip file
	zipFile, err := os.Create(GetZipPath(galleryID, size))
	if err != nil {
		log.Errorf("Unable to create zip file: %v\n", err)
		return err
	}
	defer zipFile.Close()

	// Create a new zip writer
	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Walk through the directory
	err = filepath.Walk(filepath.Join(BaseImagesDir, fmt.Sprint(galleryID)), func(path string, info os.FileInfo, err error) error {
		// Skip directories and non-image files
		if info.IsDir() || !isImage(path) {
			return nil
		}

		// Open the file
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()

		// Create a new file in the zip archive
		zipFile, err := zipWriter.Create(info.Name())
		if err != nil {
			return err
		}

		// Copy file contents to the zip file
		_, err = io.Copy(zipFile, file)
		if err != nil {
			return err
		}

		return nil
	})

	return err
}

func GenerateZipOnDemand(galleryID uint, size string, images []string) ([]byte, error) {
	// Create a new buffer
	buf := new(bytes.Buffer)

	// Create a new zip writer
	zipWriter := zip.NewWriter(buf)

	for _, imageName := range images {
		imagePath := GetImagePath(galleryID, size, imageName)

		// Skip non-image files
		if !isImage(imagePath) {
			continue
		}

		// Open the file
		file, err := os.Open(imagePath)
		if err != nil {
			return nil, err
		}
		defer file.Close()

		// Create a new file in the zip archive
		zipFile, err := zipWriter.Create(imageName)
		if err != nil {
			return nil, err
		}

		// Copy file contents to the zip file
		_, err = io.Copy(zipFile, file)
		if err != nil {
			return nil, err
		}
	}

	// Close the zip writer
	if err := zipWriter.Close(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// Check if the file is an image
func isImage(filename string) bool {
	// Check if the file has an image extension
	ext := filepath.Ext(filename)
	switch ext {
	case ".jpg", ".jpeg", ".png":
		return true
	}
	return false
}

func ZipExists(galleryID uint, size string) bool {
	// Check if the zip file exists
	_, err := os.Stat(GetZipPath(galleryID, size))
	if err == nil {
		return true // File exists
	}
	if os.IsNotExist(err) {
		return false // File does not exist
	}
	// Error occurred while checking for file existence
	return false
}
