package controllers

import (
	"encoding/json"
	"fmt"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/auth"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

// @Description  Create first admin user.
// @Summary      create the first admin user.
// @Tags         User
// @Accept       json
// @Produce      json
// @Param   	 payload   body    models.User    false  "New User"
// @Success      201        {object}  models.User
// @Router       /v1/users/admin/create [post]
func CreateFirstUser(c *fiber.Ctx) error {
	user := new(models.User)

	userQueries := queries.NewUserRepository()

	userCount, err := userQueries.GetUserCount()
	if err != nil {
		log.Errorf("Unable to retrieve the number of users in DB: %v\n", err)
		return fiber.NewError(fiber.StatusNotFound, "No users found in the DB")
	}

	if userCount != 0 {
		log.Error("Admin user already exists.")
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"issue": "Admin user already exists.",
			},
		})
	}

	// I need to log what the body of the request is as json formatted
	var requestBody map[string]interface{}
	if err := json.Unmarshal(c.Body(), &requestBody); err != nil {
		return err // Handle error if unable to unmarshal JSON
	}

	// Log the request body as pretty-printed JSON
	requestBodyJSON, err := json.MarshalIndent(requestBody, "", "  ")
	if err != nil {
		return err // Handle error if unable to marshal JSON
	}
	log.Debugf("Request Body:\n%s\n", requestBodyJSON)

	// Store the body in the user and return error if encountered
	if err := c.BodyParser(user); err != nil {
		log.Errorf("Unable to parse new user: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"issue": err.Error(),
			},
		})
	}

	log.Debugf("New admin user: %v\n", user)

	if err := userQueries.CreateNewUser(user); err != nil {
		log.Errorf("Unable to add new user to DB: %v\n", err)
		// Return status 500 and error message.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
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

// @Description  Update user.
// @Summary      update the user.
// @Tags         User
// @Accept       json
// @Produce      json
// @Param   	 payload   body    models.UserUpdate    false  "Updated User"
// @Security     ApiKeyAuth
// @Success      201        {object}  models.User
// @Router       /v1/users/{userID} [put]
func UpdateUser(c *fiber.Ctx) error {
	log.Info("Updating user")
	userID := c.Params("userID")

	updatedUser := new(models.UserUpdate)

	// Store the body in the user and return error if encountered
	if err := c.BodyParser(updatedUser); err != nil {
		log.Errorf("Unable to parse new user: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"issue": err.Error(),
			},
		})
	}

	userQueries := queries.NewUserRepository()

	user, err := userQueries.GetFullUserByID(userID)
	if err != nil {
		log.Errorf("Unable to find existing user in DB: %v\n", err)
		// Return status 400 and error message.
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// check which values are updated
	if updatedUser.Email != nil {
		user.Email = *updatedUser.Email
	}

	if updatedUser.Password != nil {
		user.Password = updatedUser.Password
	}

	if err := userQueries.UpdateUser(user); err != nil {
		log.Errorf("Unable to add new user to DB: %v\n", err)
		// Return status 500 and error message.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
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
