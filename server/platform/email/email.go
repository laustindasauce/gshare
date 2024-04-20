package email

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"text/template"

	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/gofiber/fiber/v2/log"
)

var (
	twoFactorTemplatePath = "templates/twofactor.html"
	twoFactorTemplate     = "twofactor.html"

	reminderTemplatePath = "templates/reminder.html"
	reminderTemplate     = "reminder.html"
)

// TestEmailConnection is a function to test the SMTP connection.
func TestEmailConnection() {
	// Check if TWO_FA is enabled
	if !configs.GetenvBool("TWO_FACTOR_AUTHENTICATION", false) {
		log.Info("Two-Factor Authentication is not enabled.")
		return
	}

	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")

	// SMTP server details
	smtpHost := configs.Getenv("SMTP_HOST", "smtp.gmail.com")
	smtpPort := configs.Getenv("SMTP_PORT", "587")

	// Connect to the SMTP server
	auth := smtp.PlainAuth("", username, password, smtpHost)
	smtpAddress := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
	connection, err := smtp.Dial(smtpAddress)
	if err != nil {
		log.Errorf("Error connecting to SMTP server:", err)
		return
	}
	defer connection.Close()

	// Start TLS if available
	if configs.GetenvBool("SMTP_TLS", true) {
		if err := connection.StartTLS(&tls.Config{ServerName: smtpHost}); err != nil {
			log.Errorf("Error starting TLS:", err)
			return
		}
	}

	// Authenticate
	if err := connection.Auth(auth); err != nil {
		log.Errorf("Error authenticating:", err)
		return
	}

	log.Info("SMTP authentication successful.")
}

// loadTemplate will load the html file an input any variables
func loadTemplate(temp, path string, emailVars any) (string, error) {
	t := template.New(temp)
	var err error
	var result string

	t, err = t.ParseFiles(path)
	if err != nil {
		return result, err
	}

	var tpl bytes.Buffer
	if err := t.Execute(&tpl, emailVars); err != nil {
		return result, err
	}

	result = tpl.String()

	return result, nil
}

func SendEmail(to string, msg []byte) error {
	from := os.Getenv("SMTP_USERNAME")

	// Sender email, username and password
	username := os.Getenv("SMTP_USERNAME")
	password := os.Getenv("SMTP_PASSWORD")

	// SMTP server details
	smtpHost := configs.Getenv("SMTP_HOST", "smtp.gmail.com")
	smtpPort := configs.Getenv("SMTP_PORT", "587")

	// Authentication credentials
	auth := smtp.PlainAuth("", username, password, smtpHost)

	// Connect to the SMTP server
	serverAddr := smtpHost + ":" + smtpPort
	conn, err := smtp.Dial(serverAddr)
	if err != nil {
		log.Errorf("Unable to connect to SMTP server (%s) with error: %v\n", serverAddr, err)
		return err
	}

	// Close the connection
	defer conn.Quit()

	// Start TLS if available
	if configs.GetenvBool("SMTP_TLS", true) {
		if err := conn.StartTLS(&tls.Config{ServerName: smtpHost}); err != nil {
			log.Errorf("Error starting TLS: %v\n", err)
			return err
		}
	}

	// Authenticate
	if err := conn.Auth(auth); err != nil {
		log.Errorf("SMTP authentication failed: %v\n", err)
		return err
	}

	// // Set the sender and recipient
	if err := conn.Mail(from); err != nil {
		log.Errorf("Unable to set the sender (%s) for SMTP: %v\n", from, err)
		return err
	}

	// Handle multiple recipients
	recipients := strings.Split(to, " ")

	for _, recipient := range recipients {
		if err := conn.Rcpt(strings.TrimSpace(recipient)); err != nil {
			log.Errorf("Unable to set the recipient (%s) for SMTP: %v\n", to, err)
			return err
		}
	}

	// Send the email body
	wc, err := conn.Data()
	if err != nil {
		log.Errorf("Unable to open data connection with SMTP: %v\n", err)
		return err
	}
	_, err = wc.Write(msg)
	if err != nil {
		log.Errorf("Unable to write to SMTP WriteCloser: %v\n", err)
		return err
	}
	err = wc.Close()
	if err != nil {
		log.Errorf("Unable to close SMTP WriteCloser: %v\n", err)
	}

	log.Info("Email sent successfully.")

	return nil
}

func Send2FAEmail(to, code string) error {
	from := configs.Getenv("SMTP_FROM", os.Getenv("SMTP_USERNAME"))

	// Email subject and body
	subject := "Two-Factor Authentication Code"

	emailVars := struct {
		Code string
	}{
		Code: code,
	}

	body, err := loadTemplate(twoFactorTemplate, twoFactorTemplatePath, emailVars)
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

func SendReminderEmail(to, galleryLink, expiration string) error {
	from := configs.Getenv("SMTP_FROM", os.Getenv("SMTP_USERNAME"))

	// Email subject and body
	subject := "Friendly Reminder: Gallery Expiring Soon"

	emailVars := struct {
		ExpirationDate   string
		GalleryLink      string
		PhotographerName string
	}{
		ExpirationDate:   expiration,
		GalleryLink:      galleryLink,
		PhotographerName: configs.Getenv("NEXT_PUBLIC_PHOTOGRAPHER_NAME", "Your Photographer"),
	}

	body, err := loadTemplate(reminderTemplate, reminderTemplatePath, emailVars)
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
