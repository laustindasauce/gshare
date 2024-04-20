package images

import (
	"os"

	"github.com/gofiber/fiber/v2/log"
)

// RemoveImage removes all sizes of an image from the gallery directory
func RemoveImage(galleryID uint, filename string) error {
	// Remove the original size
	if err := os.Remove(GetImagePath(galleryID, "original", filename)); err != nil {
		log.Errorf("Unable to remove image: %v\n", err)
		return err
	}

	// Remove the web size
	if err := os.Remove(GetImagePath(galleryID, "web", filename)); err != nil {
		log.Errorf("Unable to remove image: %v\n", err)
		return err
	}

	return nil
}
