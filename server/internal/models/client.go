package models

import "gorm.io/gorm"

type Client struct {
	gorm.Model
	Email string `gorm:"unique;not null" json:"email"`
}
