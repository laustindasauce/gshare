package auth

import (
	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/utils"
	"github.com/austinbspencer/gshare-server/platform/email"
	"github.com/gofiber/fiber/v2/log"
)

func GenerateTwoFactorAuthCode(user *models.User) error {
	// Generate 2FA code
	code, err := utils.Generate2FACode()
	if err != nil {
		log.Errorf("Error generating 2FA code: %v\n", err)
		// Return status 500 and 2FA code generation error.
		return err
	}

	userQueries := queries.NewUserRepository()

	// Set 2FA code for user
	err = userQueries.SetTwoFactorAuthCode(user, code)
	if err != nil {
		log.Errorf("Error setting 2FA code: %v\n", err)
		// Return status 500 and 2FA code setting error.
		return err
	}

	// Send email
	err = email.Send2FAEmail(user.Email, code)
	if err != nil {
		log.Errorf("Error sending email: %v\n", err)
		// Return status 500 and email sending error.
		return err
	}

	return nil
}
