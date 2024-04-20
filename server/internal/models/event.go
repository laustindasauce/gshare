package models

import "gorm.io/gorm"

type Event struct {
	gorm.Model
	GalleryID uint `gorm:"not null" json:"gallery_id"`
	// Image ID is null if the event is downloading entire gallery
	ImageID *uint `json:"image_id"`
	// Requestor is the host that requested the download
	Requestor string `gorm:"not null" json:"requestor"`
	// Filename is the name of the file downloaded
	Filename string `gorm:"not null" json:"filename"`
	// Size is the size of the image downloaded (web, original)
	Size ImageSize `gorm:"not null" json:"size"`
	// Bytes is the size of the download file in bytes
	Bytes int64 `gorm:"not null" json:"bytes"`
}
