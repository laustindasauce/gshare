package queries

import (
	"time"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/platform/database"
	"gorm.io/gorm"
)

type GalleryRepository interface {
	GetGalleryByID(id string) (*models.Gallery, error)
	GetGalleryByPath(path string) (*models.Gallery, error)
	GetGalleries() ([]models.Gallery, error)
	GetPublicGalleries() ([]models.Gallery, error)
	GetLiveGalleries() ([]models.Gallery, error)
	GetGalleryImagesCount(galleryID uint) (*int64, error)
	UpdateGallery(gallery *models.Gallery, updateGallery models.GalleryUpdate) error
	SetZipsReady(gallery *models.Gallery, value bool) error
	GetRandomGalleryImage(galleryID uint) (*models.Image, error)
	CreateNewGallery(gallery *models.Gallery) error
	DeleteGallery(gallery *models.Gallery) error
}

type galleryRepository struct {
	db *gorm.DB
}

func NewGalleryRepository() GalleryRepository {
	return &galleryRepository{db: database.DB}
}

func (r *galleryRepository) GetGalleryByID(id string) (*models.Gallery, error) {
	var gallery models.Gallery

	err := r.db.Model(&models.Gallery{}).
		Preload("Events", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).Preload("Images", func(db *gorm.DB) *gorm.DB {
		return db.Order("images.position")
	}).Preload("FeaturedImage").First(&gallery, id).Error
	if err != nil {
		return nil, err
	}

	return &gallery, nil
}

// Get the gallery by path .. requires the gallery to be live
func (r *galleryRepository) GetGalleryByPath(path string) (*models.Gallery, error) {
	var gallery models.Gallery

	err := r.db.Model(&models.Gallery{}).
		Preload("Images", func(db *gorm.DB) *gorm.DB {
			return db.Order("images.position")
		}).Preload("FeaturedImage").
		Where("live <= ? AND expiration >= ?", time.Now(), time.Now()).
		First(&gallery, "path = ?", path).Error
	if err != nil {
		return nil, err
	}

	return &gallery, nil
}

func (r *galleryRepository) GetGalleries() ([]models.Gallery, error) {
	var galleries []models.Gallery

	err := r.db.Model(&models.Gallery{}).
		Preload("FeaturedImage").Order("live DESC").
		Find(&galleries).Error
	if err != nil {
		return nil, err
	}

	return galleries, nil
}

// Get all public galleries that are currently live
func (r *galleryRepository) GetPublicGalleries() ([]models.Gallery, error) {
	var galleries []models.Gallery

	err := r.db.Model(&models.Gallery{}).Preload("FeaturedImage").
		Where("live <= ? AND expiration >= ? AND public = true AND protected = false", time.Now(), time.Now()).
		Order("live DESC").
		Find(&galleries).Error
	if err != nil {
		return nil, err
	}

	return galleries, nil
}

// Get all galleries that are currently live
func (r *galleryRepository) GetLiveGalleries() ([]models.Gallery, error) {
	var galleries []models.Gallery

	err := r.db.Model(&models.Gallery{}).Preload("FeaturedImage").
		Where("live <= ? AND expiration >= ?", time.Now(), time.Now()).
		Find(&galleries).Error
	if err != nil {
		return nil, err
	}

	return galleries, nil
}

// Get count of images in gallery
func (r *galleryRepository) GetGalleryImagesCount(galleryID uint) (*int64, error) {
	count := new(int64)

	err := r.db.Table("images").Where("gallery_id = ?", galleryID).Count(count).Error
	if err != nil {
		return nil, err
	}

	return count, nil
}

// Update the Gallery
func (r *galleryRepository) UpdateGallery(gallery *models.Gallery, updateGallery models.GalleryUpdate) error {
	// Edit the gallery
	if updateGallery.Title != nil {
		gallery.Title = *updateGallery.Title
	}
	if updateGallery.Path != nil {
		gallery.Path = *updateGallery.Path
	}

	gallery.EventDate = updateGallery.EventDate

	if updateGallery.Live != nil {
		gallery.Live = *updateGallery.Live
	}
	if updateGallery.Expiration != nil {
		gallery.Expiration = *updateGallery.Expiration
	}
	if updateGallery.Public != nil {
		gallery.Public = *updateGallery.Public
	}
	if updateGallery.Protected != nil {
		gallery.Protected = *updateGallery.Protected
	}
	if updateGallery.Password != nil {
		if *updateGallery.Password == "" {
			gallery.Password = nil
		} else {
			gallery.Password = updateGallery.Password
		}
	}
	if updateGallery.Reminder != nil {
		gallery.Reminder = *updateGallery.Reminder
	}
	if updateGallery.ReminderEmails != nil {
		if *updateGallery.ReminderEmails == "" {
			gallery.ReminderEmails = nil
		} else {
			gallery.ReminderEmails = updateGallery.ReminderEmails
		}
	}

	// Save the Changes and return the resulting error or nil
	return r.db.Save(&gallery).Error
}

// Set the zips ready field
func (r *galleryRepository) SetZipsReady(gallery *models.Gallery, value bool) error {
	return r.db.Model(&gallery).Update("ZipsReady", value).Error
}

// Get a random image from the gallery
func (r *galleryRepository) GetRandomGalleryImage(galleryID uint) (*models.Image, error) {
	var image models.Image

	// Get a random image from the gallery sorting first by random
	// and then by aspect ratio prioritizing landscape images
	err := r.db.Model(&models.Image{}).Where("gallery_id = ?", galleryID).
		Order("RANDOM(), CASE WHEN width > height THEN 0 ELSE 1 END").
		First(&image).Error
	if err != nil {
		return nil, err
	}

	return &image, nil
}

func (r *galleryRepository) CreateNewGallery(gallery *models.Gallery) error {
	return r.db.Create(gallery).Error
}

// Fully delete gallery from database
func (r *galleryRepository) DeleteGallery(gallery *models.Gallery) error {
	// Delete with unscoped so we don't have issue with reusing path
	// after a gallery has been deleted
	return r.db.Unscoped().Delete(&gallery, gallery.ID).Error
}
