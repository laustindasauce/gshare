package controllers

import (
	"time"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/auth"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/austinbspencer/gshare-server/platform/docker"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

// @Description  Get the server settings
// @Summary      get the server settings
// @Tags         Settings
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200        {object}  models.Settings
// @Router       /v1/settings [get]
func GetSettings(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	settingsQueries := queries.NewSettingsRepository()

	settings, err := settingsQueries.GetSettings()
	if err != nil || settings == nil {
		log.Warn("Settings not found in the DB")
		return fiber.NewError(fiber.StatusNotFound, "No settings found in the DB")
	}

	settings.Version = configs.Version
	// Calculate uptime of the server
	settings.Uptime = time.Since(configs.StartTime)

	// Return success and the server settings
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   settings,
	})
}

// @Description  Get the server public settings
// @Summary      get the server public settings
// @Tags         Settings
// @Produce      json
// @Success      200        {object}  models.Settings
// @Router       /v1/settings/public [get]
func GetPublicSettings(c *fiber.Ctx) error {
	settingsQueries := queries.NewSettingsRepository()

	settings, err := settingsQueries.GetSettings()
	if err != nil || settings == nil {
		log.Warn("Settings not found in the DB")
		return fiber.NewError(fiber.StatusNotFound, "No settings found in the DB")
	}

	userQueries := queries.NewUserRepository()

	userCount, err := userQueries.GetUserCount()
	if err != nil {
		log.Errorf("Unable to retrieve the number of users in DB: %v\n", err)
		return fiber.NewError(fiber.StatusNotFound, "No users found in the DB")
	}

	if userCount == 0 {
		newApp := true
		settings.NewApplication = &newApp
	}

	// Return success and the server settings
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   settings,
	})
}

// @Description  Update the server settings
// @Summary      update the server settings
// @Tags         Settings
// @Accept       json
// @Produce      json
// @Param   	 payload   body    models.Settings    false  "Updated Settings"
// @Security     ApiKeyAuth
// @Success      200        {object}  models.Settings
// @Router       /v1/settings [put]
func UpdateSettings(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Parse the request body
	// var settings models.Settings
	// if err := c.BodyParser(&settings); err != nil {
	// 	return fiber.NewError(fiber.StatusBadRequest, err.Error())
	// }

	settingsQueries := queries.NewSettingsRepository()

	settings, err := settingsQueries.GetSettings()
	if err != nil {
		log.Errorf("Unable to retrieve settings from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Update the settings
	if err := settingsQueries.SetSettingsUpdate(!settings.Update); err != nil {
		log.Errorf("Error setting settings update to false: %v\n", err)
	}

	settings.Version = configs.Version
	// Calculate uptime of the server
	settings.Uptime = time.Since(configs.StartTime)

	// Return success and the updated server settings
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   settings,
	})
}

// @Description  Redeploy the site
// @Summary      redeploy the client site
// @Tags         Settings
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200        {object}  models.Settings
// @Router       /v1/settings/redeploy [post]
func RedeployClient(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	settingsQueries := queries.NewSettingsRepository()

	// Restart client container
	log.Debug("Restarting client container")
	err = docker.RestartClientContainer()
	if err != nil {
		log.Errorf("Error restarting client container: %v\n", err)
	} else {
		log.Info("Client container restart initiated by client side request")
		if err := settingsQueries.SetSettingsUpdate(false); err != nil {
			log.Errorf("Error setting settings update to false: %v\n", err)
		}
	}

	// Return success
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   nil,
	})
}
