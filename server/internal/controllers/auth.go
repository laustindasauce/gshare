package controllers

import (
	"fmt"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/auth"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

// @Description  Authenticate a user.
// @Summary      authenticate a user
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param   	 payload   body    models.Auth    false  "User credentials"
// @Success      200        {object}  models.APIResponse
// @Router       /v1/auth [post]
func GetNewAccessToken(c *fiber.Ctx) error {
	creds := new(models.Auth)

	if err := c.BodyParser(&creds); err != nil {
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"email":    "Email is required",
				"password": "Password is required",
			},
		})
	}

	userQueries := queries.NewUserRepository()

	user, err := userQueries.GetFullUserByEmail(creds.Email)
	if err != nil {
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"email": "No user exists with the given email.",
			},
		})
	}

	// Check if the password is correct
	if err := user.CheckPassword(creds.Password); err != nil {
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"password": "Password is incorrect",
			},
		})
	}

	// Check if two-factor authentication is enabled
	if configs.GetenvBool("TWO_FACTOR_AUTHENTICATION", false) {
		log.Infof("2FA is enabled for user %s", user.Email)

		// Generate 2FA code
		err = auth.GenerateTwoFactorAuthCode(user)
		if err != nil {
			// Return status 500 and 2FA code generation error.
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}

		// Return status 200 and 2FA code request message.
		return c.JSON(models.APIResponse{
			Status: "success",
			Data: fiber.Map{
				"message": "2FA code sent to email",
			},
		})
	}

	// Generate a new Access token.
	token, err := auth.GenerateNewAccessToken(fmt.Sprint(user.ID))
	if err != nil {
		log.Errorf("Caught an error while generating access token: %v\n", err)
		// Return status 500 and token generation error.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(models.APIResponse{
		Status: "success",
		Data: fiber.Map{
			"user":  user,
			"token": token,
		},
	})
}

// @Description  Get the authenticated user.
// @Summary      get the authenticated user, if there is one.
// @Tags         Auth
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200        {object}  models.APIResponse
// @Router       /v1/auth [get]
func GetAuthenticatedUser(c *fiber.Ctx) error {
	_, user, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   user,
	})
}

// @Description  Update user.
// @Summary      update the user with given payload
// @Tags         User
// @Produce      json
// @Param   	 payload   body    models.User    false  "Updated User"
// @Param        userID   path      string  true  "User ID"
// @Security     ApiKeyAuth
// @Success      200  {object}  models.User
// @Router       /v1/auth [put]
func UpdateAuthenticatedUser(c *fiber.Ctx) error {
	user, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	userQueries := queries.NewUserRepository()

	userUpdate := new(models.User)

	if err := c.BodyParser(userUpdate); err != nil {
		log.Errorf("error parsing user update: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"user": err.Error(),
			},
		})
	}

	// Update fields available for update
	user.Email = userUpdate.Email
	if userUpdate.Password != nil {
		// No need to hash password here since it is done in the
		// BeforeUpdate hook with Gorm
		user.Password = userUpdate.Password
	}

	if err := userQueries.UpdateUser(user); err != nil {
		log.Errorf("Caught an error while updating the user: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Return the updated user
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   user,
	})
}

// @Description  Authenticate a user with their 2FA code.
// @Summary      authenticate a user with given 2FA code
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param   	 payload   body    models.TwoFactorAuth    false  "Two Factor auth credentials"
// @Success      200        {object}  models.APIResponse
// @Router       /v1/auth/2fa [post]
func TwoFactorAuth(c *fiber.Ctx) error {
	creds := new(models.TwoFactorAuth)

	if err := c.BodyParser(&creds); err != nil {
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"code": "2FA code is required",
			},
		})
	}

	userQueries := queries.NewUserRepository()

	user, err := userQueries.GetFullUserByEmail(creds.Email)
	if err != nil {
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"email": "No user exists with the given email.",
			},
		})
	}

	// Check if the 2FA code is correct
	if err := user.CheckTwoFactorAuthCode(creds.Code); err != nil {
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"code": "2FA code is incorrect",
			},
		})
	}

	// Generate a new Access token.
	token, err := auth.GenerateNewAccessToken(fmt.Sprint(user.ID))
	if err != nil {
		log.Errorf("Caught an error while generating access token: %v\n", err)
		// Return status 500 and token generation error.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	return c.JSON(models.APIResponse{
		Status: "success",
		Data: fiber.Map{
			"user":  user,
			"token": token,
		},
	})
}
