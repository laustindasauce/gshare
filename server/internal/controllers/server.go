package controllers

import (
	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/gofiber/fiber/v2"
)

// @Description  Clear all cache for the server.
// @Summary      clear all existing cache
// @Tags         Server
// @Security     ApiKeyAuth
// @Success      200
// @Router       /v1/server/cache/clear [get]
// func ClearCache(c *fiber.Ctx) error {
// 	_, _, err := auth.IsAuthenticated(c)
// 	if err != nil {
// 		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
// 	}

// 	// Return success and the individual server
// 	return c.JSON(models.APIResponse{
// 		Status: "success",
// 	})
// }

// @Description  Simple ping endpoint to check if the server is alive.
// @Summary      ping the server
// @Tags         Server
// @Success      200
// @Router       /ping [get]
func Ping(c *fiber.Ctx) error {
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   "pong",
	})
}

// @Description  Simple health check endpoint to check if the server is alive.
// @Summary      confirm the server is alive
// @Tags         Server
// @Success      200
// @Router       /live [get]
func LivenessProbe(c *fiber.Ctx) bool {
	return true
}

// @Description  Simple health check endpoint to check if the server is ready.
// @Summary      confirm the server is ready
// @Tags         Server
// @Success      200
// @Router       /ready [get]
func ReadinessProbe(c *fiber.Ctx) bool {
	return true
}
