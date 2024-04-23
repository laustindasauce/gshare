package models

import (
	"time"

	"gorm.io/gorm"
)

type Settings struct {
	gorm.Model
	// Update is a flag that indicates if the client has backend updates to catch up on.
	Update bool `json:"update" gorm:"default:false"`
	// NewApplication will alert the frontend that there are no users and we need to create admin
	NewApplication *bool `json:"new_application,omitempty" gorm:"-:all"`
	// Server uptime
	Uptime time.Duration `json:"uptime" gorm:"-:all"`
	// Server version ignored by GORM
	Version string `json:"version" gorm:"-:all"`
}
