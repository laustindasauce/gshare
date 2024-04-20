package models

import "gorm.io/gorm"

type ImageSize string

type ImageSources map[ImageSize]string

type Image struct {
	gorm.Model
	// The gallery this image is linked to
	GalleryID uint `gorm:"not null" json:"gallery_id"`
	// If this image is the feature image it will have the gallery ID here
	FeaturedGalleryID *uint `json:"featured_gallery_id,omitempty"`
	// Size of the image in bytes
	Size int64 `gorm:"not null" json:"size"`
	// Height for the original image
	Height int `gorm:"not null" json:"height"`
	// Width for the original image
	Width int `gorm:"not null" json:"width"`
	// Position in the gallery
	Position int `gorm:"not null;default:0" json:"position"`
	// Image filename
	Filename string `json:"filename" gorm:"not null;unique"`
}

var (
	Original ImageSize = "original"
	Web      ImageSize = "web"

	AllSizes = []ImageSize{
		Original,
		Web,
	}

	ZipSizes = []ImageSize{
		Original,
		Web,
	}
)

// ValidImageSize checks if the given size is a valid image size
func ValidImageSize(size ImageSize) bool {
	for _, s := range AllSizes {
		if s == size {
			return true
		}
	}
	return false
}
