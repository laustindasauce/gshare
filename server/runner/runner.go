package runner

import (
	"fmt"
	"os"
	"time"

	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/austinbspencer/gshare-server/platform/docker"
	"github.com/austinbspencer/gshare-server/platform/email"
	"github.com/go-co-op/gocron"
	"github.com/gofiber/fiber/v2/log"
)

var (
	galleriesInterval int    = 10
	reminderDays      int    = 5
	reminderMessage   string = ""
)

func init() {
	// Set galleriesInterval with env variable
	galleriesInterval = configs.GetenvInt("CRON_GALLERIES_INTERVAL", galleriesInterval)
}

// RunScripts runs all scheduled scripts
func RunScripts() {
	if !configs.GetenvBool("CRON_ENABLED", false) {
		log.Info("Cron is disabled")
		return
	}

	// Create a new scheduler
	s := gocron.NewScheduler(time.Local)

	s.Every(galleriesInterval).Minutes().Do(checkGalleries)
	// s.Every(3).Hours().Do()
	s.Every(1).Day().At("08:00").Do(sendReminders)

	// starts the scheduler asynchronously
	s.StartAsync()
}

// checkGalleries checks if any galleries are turning live or expiring
func checkGalleries() {
	log.Debug("Checking galleries for newly live / expired")

	// Get query interfaces
	galleryQueries := queries.NewGalleryRepository()
	settingsQueries := queries.NewSettingsRepository()

	galleries, err := galleryQueries.GetGalleries()
	if err != nil {
		log.Errorf("Error getting galleries: %v\n", err)
		return
	}

	log.Debugf("Checking %d galleries for newly live/expired.\n", len(galleries))

	// Check if any galleries are turning live or expiring
	for _, gallery := range galleries {
		if gallery.IsLive() {
			log.Debugf("Gallery %d is live\n", gallery.ID)
			// Check if the gallery went live within the galleriesInterval
			if gallery.Live.Add(time.Duration(galleriesInterval) * time.Minute).After(time.Now()) {
				log.Debugf("Gallery %d went live within the last %d minutes\n", gallery.ID, galleriesInterval)
				// Since gallery went live within the last interval, we need to redeploy client
				log.Debug("Restarting client container")
				err = docker.RestartClientContainer()
				if err != nil {
					msg := fmt.Sprintf("Error restarting client container: %v", err)
					log.Error(msg)
					// Send alert email
					userQueries := queries.NewUserRepository()
					admin, err := userQueries.GetUserByID("1")
					if err != nil {
						log.Errorf("Unable to retrieve admin user from DB: %v\n", err)
					} else {
						if err := email.SendAlertEmail(admin.Email, "gshare automated alert", msg); err != nil {
							log.Errorf("Unable to send alert email: %v\n", err)
						}
					}
				} else {
					msg := fmt.Sprintf("Client container restarted to make gallery %d live", gallery.ID)
					log.Info(msg)

					if err := settingsQueries.SetSettingsUpdate(false); err != nil {
						log.Errorf("Error setting settings update to false: %v\n", err)
					}

					// Send alert email
					userQueries := queries.NewUserRepository()
					admin, err := userQueries.GetUserByID("1")
					if err != nil {
						log.Errorf("Unable to retrieve admin user from DB: %v\n", err)
					} else {
						if err := email.SendAlertEmail(admin.Email, "gshare automated alert", msg); err != nil {
							log.Errorf("Unable to send alert email: %v\n", err)
						}
					}
				}
			}

		}

		if gallery.IsExpired() {
			log.Debugf("Gallery %d has expired\n", gallery.ID)
			// Check if the gallery expired within the galleriesInterval
			if gallery.Expiration.Add(time.Duration(galleriesInterval) * time.Minute).After(time.Now()) {
				log.Debugf("Gallery %d expired within the last %d minutes\n", gallery.ID, galleriesInterval)
				// Since gallery expired within the last interval, we need to redeploy client
				log.Debug("Restarting client container")
				err = docker.RestartClientContainer()
				if err != nil {
					log.Errorf("Error restarting client container: %v\n", err)
				} else {
					log.Infof("Client container restarted to make gallery %d expired\n", gallery.ID)
					if err := settingsQueries.SetSettingsUpdate(false); err != nil {
						log.Errorf("Error setting settings update to false: %v\n", err)
					}
				}
			}
		}
	}

	log.Debug("Finished checking galleries for newly live / expired")
}

func sendReminders() {
	log.Debug("Checking if reminders need to be sent out!")

	galleryQueries := queries.NewGalleryRepository()

	galleries, err := galleryQueries.GetLiveGalleries()
	if err != nil {
		log.Errorf("Error getting galleries in reminders cron: %v\n", err)
		return
	}

	if len(galleries) == 0 {
		log.Debug("No live galleries to check for reminders.")
	}

	log.Debugf("Checking %d live galleries for reminders to be sent.\n", len(galleries))

	for _, gallery := range galleries {
		if !gallery.Reminder {
			log.Debugf("The %s gallery does not have reminders enabled.\n", gallery.Title)
			continue
		}

		// Set the reminder date
		reminderDate := gallery.Expiration.AddDate(0, 0, -reminderDays)

		// Get the current time
		currentTime := time.Now()

		// Check if the expiration time minus 5 days is equal to today
		if currentTime.Year() == reminderDate.Year() &&
			currentTime.Month() == reminderDate.Month() &&
			currentTime.Day() == reminderDate.Day() {
			// The expiration time minus 5 days is equal to today
			log.Debugf("The gallery %s is ready for reminder.\n", gallery.Title)
			if gallery.ReminderEmails == nil {
				log.Warn("Missing reminder emails to send to.")
				continue
			}

			clientBaseURL := os.Getenv("NEXT_PUBLIC_CLIENT_URL")
			err = email.SendReminderEmail(*gallery.ReminderEmails,
				fmt.Sprintf("%s/%s", clientBaseURL, gallery.Path),
				gallery.Expiration.Format("January 2, 2006"))

			if err != nil {
				log.Fatalf("Unable to send reminder email for %s gallery: %v\n", gallery.Title, err)
				continue
			}

			log.Infof("%s gallery reminder emails sent successfully.\n", gallery.Title)
		}
	}
}
