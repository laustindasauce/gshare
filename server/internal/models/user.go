package models

import (
	"errors"
	"time"

	"github.com/austinbspencer/gshare-server/pkg/utils"
	"github.com/gofiber/fiber/v2/log"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Auth represents the authentication credentials of a user.
type Auth struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// TwoFactorAuth represents the 2FA code of a user.
type TwoFactorAuth struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

// User represents a user in the system.
type User struct {
	gorm.Model
	Email    string  `json:"email" gorm:"unique;not null"`
	Password *string `json:"password,omitempty" gorm:"not null"`
	// 2FA
	AuthCode *string `json:"-"`
}

// UserUpdate is a model to handle updates on the user
type UserUpdate struct {
	Email    *string `json:"email"`
	Password *string `json:"password"`
}

// APIUser represents a user in the API response.
type APIUser struct {
	ID        uint
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt
	Email     string `json:"email"`
}

// BeforeCreate is a GORM hook that is called before creating a new user record.
// It sets the password as a hash.
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if err := u.SetPassword(); err != nil {
		return errors.New("unable to hash password")
	}

	return
}

// BeforeUpdate is a GORM hook that is called before updating an existing user record.
// It hashes the password if it has been updated.
func (u *User) BeforeUpdate(tx *gorm.DB) (err error) {
	if tx.Model(u).UpdateColumn("Password", u.Password).RowsAffected > 0 {
		log.Info("Password being updated for gallery to ", *u.Password)
		hashedPassword, err := utils.HashPassword(*u.Password)
		if err != nil {
			return errors.New("unable to hash password")
		}
		u.Password = hashedPassword
	}
	return
}

// SetPassword sets the password as an encrypted string of the raw password.
func (u *User) SetPassword() error {
	hashedPassword, err := utils.HashPassword(*u.Password)
	if err != nil {
		return err
	}

	u.Password = hashedPassword

	return nil
}

// CheckPassword checks if the raw password matches the encrypted version.
func (u User) CheckPassword(p string) error {
	if err := bcrypt.CompareHashAndPassword([]byte(*u.Password), []byte(p)); err != nil {
		return bcrypt.ErrMismatchedHashAndPassword
	}

	return nil
}

// CheckTwoFactorAuthCode checks if the 2FA code matches the user's 2FA code.
func (u User) CheckTwoFactorAuthCode(p string) error {
	if *u.AuthCode != p {
		return errors.New("2FA code does not match")
	}

	return nil
}

// GetAPIUser returns an APIUser representation of the user.
func (u User) GetAPIUser() APIUser {
	return APIUser{
		ID:        u.ID,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
		DeletedAt: u.DeletedAt,
		Email:     u.Email,
	}
}
