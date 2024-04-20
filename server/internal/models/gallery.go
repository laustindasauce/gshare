package models

import (
	"errors"
	"time"

	"github.com/austinbspencer/gshare-server/pkg/utils"
	"github.com/gofiber/fiber/v2/log"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Gallery struct {
	gorm.Model
	// All images in the gallery
	Images []Image `json:"images" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:GalleryID"`
	// Featured image for the gallery
	FeaturedImage Image `json:"featured_image" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:FeaturedGalleryID"`
	// Title of the gallery
	Title string `json:"title" gorm:"unique;not null"`
	// Path for the gallery on frontend
	Path string `json:"path" gorm:"unique;not null"`
	// The date the event occurred
	EventDate *time.Time `json:"event_date"`
	// Date the gallery goes live
	Live time.Time `json:"live" gorm:"not null"`
	// Determines if the collection is visible on the homepage
	// If protected is true, then it won't show regardless
	Public bool `json:"public" gorm:"not null"`
	// If the gallery is password protected
	Protected bool `json:"protected" gorm:"not null"`
	// If the gallery should send out an automated reminder
	// Reminder gets sent 5 days prior to expiration
	Reminder bool `json:"reminder"`
	// If reminders are enabled, we need to have the emails to send to
	// These are a space separated list of emails
	ReminderEmails *string `json:"reminder_emails,omitempty"`
	// Password required to access the gallery
	// json restricted so you send or receive password
	Password *string `json:"-"`
	// Date the gallery expires and will no longer be visible
	Expiration time.Time `json:"expiration,omitempty" gorm:"not null"`
	// Total number of images in the gallery
	ImagesCount *int64 `json:"images_count" gorm:"-:all"`
	// ZipsReady will track if the zip files are created and up to date
	// If a new image is uploaded/deleted since zips were created will switch to false
	ZipsReady bool `json:"zips_ready" gorm:"not null"`
	// All events related to this gallery
	Events []Event `json:"events" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;foreignKey:GalleryID"`
}

// Model to handle updates for the gallery
type GalleryUpdate struct {
	Title           *string    `json:"title"`
	Path            *string    `json:"path"`
	EventDate       *time.Time `json:"event_date"`
	Live            *time.Time `json:"live"`
	Expiration      *time.Time `json:"expiration,omitempty"`
	Public          *bool      `json:"public"`
	Protected       *bool      `json:"protected"`
	Password        *string    `json:"password"`
	FeaturedImageID *uint      `json:"featured_image_id"`
	Reminder        *bool      `json:"reminder"`
	ReminderEmails  *string    `json:"reminder_emails"`
}

// Used to handle unlocking the gallery for clients
type GalleryAuth struct {
	Password string `json:"password"`
}

// IsLive checks if the current time is between 'Live' and
// 'Expiration' dates
func (g *Gallery) IsLive() bool {
	currentTime := time.Now()
	return currentTime.After(g.Live) && currentTime.Before(g.Expiration)
}

// IsExpired checks if the current time is after the 'Expiration' date
func (g *Gallery) IsExpired() bool {
	return time.Now().After(g.Expiration)
}

func (g *Gallery) BeforeCreate(tx *gorm.DB) (err error) {
	// Set the password as a hash if it isn't nil
	if g.Password != nil {
		if err := g.SetPassword(); err != nil {
			return errors.New("unable to hash password")
		}
	}

	if g.Path == "admin" {
		return errors.New("The path 'admin' is reserved.")
	}

	return
}

func (g *Gallery) BeforeUpdate(tx *gorm.DB) (err error) {
	// If the password is updated -- hash it
	if g.Password != nil && tx.Model(g).UpdateColumn("Password", g.Password).RowsAffected > 0 {
		log.Debug("Password being updated for gallery to ", *g.Password)
		hashedPassword, err := utils.HashPassword(*g.Password)
		if err != nil {
			return errors.New("Unable to hash password")
		}
		g.Password = hashedPassword
	}
	log.Debug("Gallery is being updated")
	return
}

// Set the password as an encrypted string of the raw password
func (g *Gallery) SetPassword() error {
	hashedPassword, err := utils.HashPassword(*g.Password)
	if err != nil {
		return err
	}

	// set the password as the hash of the password
	g.Password = hashedPassword

	return nil
}

// Check if the raw password is a match with the encrypted version
func (g Gallery) CheckPassword(p string) error {
	// Compare the stored hashed password, with the hashed version of the password that was received
	if err := bcrypt.CompareHashAndPassword([]byte(*g.Password), []byte(p)); err != nil {
		// If the two passwords don't match, return error
		return bcrypt.ErrMismatchedHashAndPassword
	}

	return nil
}
