package models

import (
	"errors"
	"net/http"
	"time"

	"gorm.io/gorm"
)

type PublicSettings struct {
	Photographer Photographer `json:"photographer"`
	Theme        Theme        `json:"theme"`
}

type Settings struct {
	gorm.Model
	// Update is a flag that indicates if the client has backend updates to catch up on.
	Update bool `json:"update" gorm:"default:false"`
	// // Photographer is the photographer's information.
	// Photographer Photographer `json:"photographer" gorm:"embedded;embeddedPrefix:photographer_"`
	// // The theme for the frontend.
	// Theme Theme `json:"theme" gorm:"embedded;embeddedPrefix:theme_"`
	// Client webhook URL for redeploying the client.
	ClientWebhookURL *string `json:"client_webhook_url"`
	// Server uptime
	Uptime time.Duration `json:"uptime" gorm:"-:all"`
	// Server version ignored by GORM
	Version string `json:"version" gorm:"-:all"`
}

type Photographer struct {
	Name      *string `json:"photographer_name"`
	Email     *string `json:"photographer_email"`
	Phone     *string `json:"photographer_phone"`
	Website   *string `json:"photographer_website"`
	Instagram *string `json:"photographer_instagram"`
	Facebook  *string `json:"photographer_facebook"`
	Twitter   *string `json:"photographer_twitter"`
	LinkedIn  *string `json:"photographer_linkedin"`
	YouTube   *string `json:"photographer_youtube"`
	Pinterest *string `json:"photographer_pinterest"`
	TikTok    *string `json:"photographer_tiktok"`
}

type Theme struct {
	PrimaryColor *string `json:"theme_primary_color"`
	TextColor    *string `json:"theme_text_color"`
	HeroEnabled  bool    `json:"theme_hero_enabled" gorm:"default:true"`
}

// SendRedeployHook sends a post request to the client webhook URL to redeploy the client.
func (settings Settings) SendRedeployHook() error {
	if settings.ClientWebhookURL == nil {
		return errors.New("client_webhook_url is nil")
	}

	// Send post request to redeploy hook from settings
	_, err := http.Post(*settings.ClientWebhookURL, "application/json", nil)

	return err
}
