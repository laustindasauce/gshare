package queries

import (
	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/platform/database"
	"gorm.io/gorm"
)

type EventRepository interface {
	GetEventByID(id string) (*models.Event, error)
	GetEvents() ([]models.Event, error)
	CreateNewEvent(event *models.Event) error
	DeleteEvent(event *models.Event) error
}

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository() EventRepository {
	return &eventRepository{db: database.Postgres}
}

func (r *eventRepository) GetEventByID(id string) (*models.Event, error) {
	var event models.Event
	if err := r.db.Model(models.Event{}).First(&event, id).Error; err != nil {
		return nil, err
	}
	return &event, nil
}

func (r *eventRepository) GetEvents() ([]models.Event, error) {
	var events []models.Event

	err := r.db.Model(&models.Event{}).Find(&events).Error
	if err != nil {
		return nil, err
	}

	return events, nil
}

func (r *eventRepository) CreateNewEvent(event *models.Event) error {
	if err := r.db.Create(event).Error; err != nil {
		return err
	}
	return nil
}

// Fully delete event from database
func (r *eventRepository) DeleteEvent(event *models.Event) error {
	// Delete with unscoped as there is no need to persist individual
	// events after deletion
	return r.db.Unscoped().Delete(&event, event.ID).Error
}
