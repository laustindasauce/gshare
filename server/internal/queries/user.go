package queries

import (
	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/platform/database"
	"gorm.io/gorm"
)

// UserRepository is the interface for user queries.
type UserRepository interface {
	GetUserByID(id string) (*models.APIUser, error)
	GetFullUserByID(id string) (*models.User, error)
	GetUserByEmail(email string) (*models.APIUser, error)
	GetFullUserByEmail(email string) (*models.User, error)
	UpdateUser(user *models.User) error
	SetTwoFactorAuthCode(user *models.User, code string) error
	RemoveTwoFactorAuthCode(user *models.User) error
	SetClientUpdateAvailable(user *models.User, available bool) error
	CreateNewUser(user *models.User) error
}

type userRepository struct {
	db *gorm.DB
}

// NewUserRepository creates a new user repository.
func NewUserRepository() UserRepository {
	return &userRepository{db: database.Postgres}
}

// GetUserByID gets a user by their ID.
func (r *userRepository) GetUserByID(id string) (*models.APIUser, error) {
	var user models.APIUser
	if err := r.db.Model(models.User{}).First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetFullUserByID gets a user by their ID.
func (r *userRepository) GetFullUserByID(id string) (*models.User, error) {
	var user models.User
	if err := r.db.Model(models.User{}).First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail gets a user by their email.
func (r *userRepository) GetUserByEmail(email string) (*models.APIUser, error) {
	var user models.APIUser
	if err := r.db.Model(models.User{}).First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetFullUserByEmail gets a user by their email.
func (r *userRepository) GetFullUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Model(models.User{}).First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser updates a user in the database.
func (r *userRepository) UpdateUser(user *models.User) error {
	if err := r.db.Save(user).Error; err != nil {
		return err
	}
	return nil
}

// SetTwoFactorAuthCode sets the 2FA code for a user.
func (r *userRepository) SetTwoFactorAuthCode(user *models.User, code string) error {
	// Save the Changes
	return r.db.Model(&user).Updates(map[string]any{
		"auth_code": code,
	}).Error
}

// RemoveTwoFactorAuthCode removes the 2FA code for a user.
func (r *userRepository) RemoveTwoFactorAuthCode(user *models.User) error {
	// Save the Changes
	return r.db.Model(&user).Updates(map[string]any{
		"auth_code": nil,
	}).Error
}

// Set client update available flag
func (r *userRepository) SetClientUpdateAvailable(user *models.User, available bool) error {
	// Save the Changes
	return r.db.Model(&user).Updates(map[string]any{
		"client_update_available": available,
	}).Error
}

// CreateNewUser creates a new user in the database.
func (r *userRepository) CreateNewUser(user *models.User) error {
	if err := r.db.Create(user).Error; err != nil {
		return err
	}
	return nil
}
