package queries

import (
	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/platform/database"
	"gorm.io/gorm"
)

// SettingsRepository is the interface for settings queries.
type SettingsRepository interface {
	GetSettings() (*models.Settings, error)
	GetPublicSettings() (*models.PublicSettings, error)
	UpdateSettings(settings *models.Settings) error
	SetSettingsUpdate(update bool) error
}

type settingsRepository struct {
	db *gorm.DB
}

// NewSettingsRepository creates a new settings repository.
func NewSettingsRepository() SettingsRepository {
	return &settingsRepository{db: database.Postgres}
}

// GetSettings gets the settings for the server.
func (r *settingsRepository) GetSettings() (*models.Settings, error) {
	var settings models.Settings
	if err := r.db.Model(models.Settings{}).First(&settings).Error; err != nil {
		return nil, err
	}
	return &settings, nil
}

// GetPublicSettings gets the public settings for the server.
func (r *settingsRepository) GetPublicSettings() (*models.PublicSettings, error) {
	var settings models.PublicSettings
	if err := r.db.Model(models.Settings{}).First(&settings).Error; err != nil {
		return nil, err
	}
	return &settings, nil
}

// UpdateSettings updates the settings for the server.
func (r *settingsRepository) UpdateSettings(settings *models.Settings) error {
	return r.db.Model(models.Settings{}).Updates(settings).Error
}

func (r *settingsRepository) SetSettingsUpdate(update bool) error {
	return r.db.Model(models.Settings{}).Where("id = 1").Update("update", update).Error
}
