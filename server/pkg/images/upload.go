package images

import (
	"bytes"
	"errors"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"os"

	"github.com/gofiber/fiber/v2/log"
	"github.com/nfnt/resize"
)

// UploadGalleryImage uploads an image to the gallery directory
func UploadGalleryImage(galleryID uint, contentType, imageFilename string, file multipart.File) error {
	// Create the directory for the gallery if it doesn't exist
	err := CreateGalleryDirectory(galleryID)
	if err != nil {
		log.Errorf("Unable to create gallery directory: %v\n", err)
		return err
	}

	// Create the full path for the image
	imageLocation := GetImagePath(galleryID, "original", imageFilename)

	// Create the file for the uploaded image
	outFile, err := os.Create(imageLocation)
	if err != nil {
		log.Errorf("Unable to create file: %v\n", err)
		return err
	}
	defer outFile.Close()

	// Copy the uploaded image data to the file
	if _, err := io.Copy(outFile, file); err != nil {
		log.Errorf("Unable to copy file: %v\n", err)
		return err
	}

	log.Debugf("Image uploaded to: %s\n", imageLocation)

	file.Seek(0, 0) // Reset file position to the beginning

	img, _, err := image.Decode(file)
	if err != nil {
		log.Errorf("Error with image.Decode: %v\n", err)
		return err
	}

	if err := uploadWebSizedImage(galleryID, imageFilename, contentType, img); err != nil {
		log.Errorf("Error with uploading web-sized image: %v\n",
			err)
		return err
	}

	log.Infof("Image uploaded to gallery %d\n", galleryID)

	return nil
}

func uploadWebSizedImage(galleryID uint, imageFilename, contentType string, img image.Image) error {
	aspectRatio := float64(img.Bounds().Dx()) / float64(img.Bounds().Dy())
	height := uint(float64(WebSizeWidth) / aspectRatio)

	resizedImg := resize.Resize(uint(WebSizeWidth), height, img, resize.Lanczos3)

	// Convert the resized image to a buffer
	var resizedBuffer bytes.Buffer
	switch contentType {
	case "image/jpeg":
		err := jpeg.Encode(&resizedBuffer, resizedImg, nil)
		if err != nil {
			log.Errorf("Error with encoding file: %v\n", err)
			return err
		}
	case "image/png":
		err := png.Encode(&resizedBuffer, resizedImg)
		if err != nil {
			log.Errorf("Error with encoding file: %v\n", err)
			return err
		}
	default:
		log.Errorf("Unsupported file format: %s\n", contentType)
		return errors.New("unsupported file format")
	}

	// Create the full path for the image
	imageLocation := GetImagePath(galleryID, "web", imageFilename)

	// Create the file for the uploaded image
	outFile, err := os.Create(imageLocation)
	if err != nil {
		log.Errorf("Unable to create file: %v\n", err)
		return err
	}
	defer outFile.Close()

	// Copy the uploaded image data to the file
	if _, err := io.Copy(outFile, &resizedBuffer); err != nil {
		log.Errorf("Unable to copy file: %v\n", err)
		return err
	}

	log.Debugf("Image uploaded to: %s\n", imageLocation)

	return nil
}
