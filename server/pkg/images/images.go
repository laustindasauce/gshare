package images

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/gofiber/fiber/v2/log"
)

var (
	BaseImagesDir  string = "/app/images"
	FilenameLength int    = 12
	WebSizeWidth   int    = 1080
)

func init() {
	// Create the directory for the images storage if it doesn't exist
	err := createImagesDirectory()
	if err != nil {
		log.Fatalf("Unable to create images directory: %v\n", err)
	}

	// Get the value of the WEB_SIZE_WIDTH environment variable, or use the default value of WebSizeWidth
	// This is a common pattern in Go to allow for easy configuration of the application
	WebSizeWidth = configs.GetenvInt("IMAGES_WEB_SIZE_WIDTH", WebSizeWidth)
}

// Create the directory for the images storage if it doesn't exist
func createImagesDirectory() error {
	// Get the value of the IMAGES_DIRECTORY environment variable, or use the default value of BaseImagesDir
	// This is a common pattern in Go to allow for easy configuration of the application
	BaseImagesDir = configs.Getenv("IMAGES_DIRECTORY", BaseImagesDir)

	return os.MkdirAll(BaseImagesDir, 0755)
}

// Create the directory for the gallery if it doesn't exist
func CreateGalleryDirectory(galleryID uint) error {
	// Create the directory for the original size images if it doesn't exist
	if err := os.MkdirAll(filepath.Join(GetGalleryPath(galleryID),
		"original"), 0755); err != nil {
		log.Errorf("Unable to create gallery directory: %v\n", err)
		return err
	}

	// Create the directory for the web size images if it doesn't exist
	if err := os.MkdirAll(filepath.Join(GetGalleryPath(galleryID),
		"web"), 0755); err != nil {
		log.Errorf("Unable to create gallery directory: %v\n", err)
		return err
	}

	return nil
}

// Create the directory for the gallery zips if it doesn't exist
func CreateGalleryZipsDirectory(galleryID uint) error {
	err := os.MkdirAll(GetZipsPath(galleryID), 0755)
	if err != nil {
		log.Errorf("Unable to create gallery zips directory: %v\n", err)
		return err
	}

	return nil
}

// GetGalleryPath returns the path to the gallery
func GetGalleryPath(galleryID uint) string {
	return filepath.Join(BaseImagesDir, fmt.Sprint(galleryID))
}

// GetImagePath returns the path to the image
func GetImagePath(galleryID uint, size, filename string) string {
	return filepath.Join(BaseImagesDir, fmt.Sprint(galleryID), size, filename)
}

func GetZipsPath(galleryID uint) string {
	return filepath.Join(BaseImagesDir, fmt.Sprint(galleryID), "zips")
}

func GetZipPath(galleryID uint, size string) string {
	return filepath.Join(BaseImagesDir, fmt.Sprint(galleryID), "zips",
		fmt.Sprintf("gallery_%s.zip", size))
}
