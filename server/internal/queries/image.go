package queries

import (
	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/platform/database"
	"gorm.io/gorm"
)

type ImageRepository interface {
	GetImageByID(id string) (*models.Image, error)
	GetGalleryImageByID(galleryID, id string) (*models.Image, error)
	GetImages() ([]models.Image, error)
	GetSpecificImages(ids []uint) ([]models.Image, error)
	GetGalleryImages(galleryID uint) ([]models.Image, error)
	SetImagePosition(imageID int, position int) error
	SetImageAsFeatImg(image *models.Image, galleryID *uint) error
	CreateNewImage(image *models.Image) error
	DeleteImage(image *models.Image) error
}

type imageRepository struct {
	db *gorm.DB
}

func NewImageRepository() ImageRepository {
	return &imageRepository{db: database.Postgres}
}

func (r *imageRepository) GetImageByID(id string) (*models.Image, error) {
	var image models.Image

	err := r.db.Model(&models.Image{}).First(&image, id).Error
	if err != nil {
		return nil, err
	}

	return &image, nil
}

func (r *imageRepository) GetGalleryImageByID(galleryID, id string) (*models.Image, error) {
	var image models.Image

	if err := r.db.Model(&models.Image{}).Where("gallery_id = ?", galleryID).
		First(&image, id).Error; err != nil {
		return nil, err
	}

	return &image, nil
}

func (r *imageRepository) GetImages() ([]models.Image, error) {
	var images []models.Image

	err := r.db.Model(&models.Image{}).Find(&images).Error
	if err != nil {
		return nil, err
	}

	return images, nil
}

func (r *imageRepository) GetSpecificImages(ids []uint) ([]models.Image, error) {
	var images []models.Image

	err := r.db.Model(&models.Image{}).Where("id IN ?", ids).Find(&images).Error
	if err != nil {
		return nil, err
	}

	return images, nil
}

func (r *imageRepository) GetGalleryImages(galleryID uint) ([]models.Image, error) {
	var images []models.Image

	err := r.db.Model(&models.Image{}).
		Where("gallery_id = ?", galleryID).Find(&images).Error
	if err != nil {
		return nil, err
	}

	return images, nil
}

// Set gallery image position
func (r *imageRepository) SetImagePosition(imageID, position int) error {
	var image models.Image
	image.ID = uint(imageID)

	return r.db.Model(&image).Update("Position", position).Error
}

// Set or remove as the featured image of the gallery
func (r *imageRepository) SetImageAsFeatImg(image *models.Image, galleryID *uint) error {
	return r.db.Model(&image).Update("FeaturedGalleryID", galleryID).Error
}

func (r *imageRepository) CreateNewImage(image *models.Image) error {
	return r.db.Create(image).Error
}

// Fully delete image from database
func (r *imageRepository) DeleteImage(image *models.Image) error {
	// Delete with unscoped as there is no need to persist individual
	// images after deletion
	return r.db.Unscoped().Delete(&image, image.ID).Error
}
