package email

import (
	"os"

	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/gofiber/fiber/v2/log"
)

var (
	alertTemplatePath = "templates/alert.html"
	alertTemplate     = "alert.html"
)

func SendAlertEmail(to, subject, message string) error {
	from := configs.Getenv("SMTP_FROM", os.Getenv("SMTP_USERNAME"))

	emailVars := struct {
		Message string
	}{
		Message: message,
	}

	body, err := loadTemplate(alertTemplate, alertTemplatePath, emailVars)
	if err != nil {
		return err
	}

	// Construct the email message
	msg := []byte("From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n" +
		"\r\n" +
		body + "\r\n")

	// Send the email
	err = SendEmail(to, msg)
	if err != nil {
		log.Errorf("Error sending 2FA email: %v\n", err)
		return err
	}

	return nil
}
