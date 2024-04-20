package routes

import (
	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/monitor"
)

// API health routes
func HealthRoutes(a *fiber.App) {
	route := a.Group("/api")

	route.Get("/ping", func(c *fiber.Ctx) error {
		return c.JSON(models.APIResponse{
			Status: "success",
			Data:   "pong",
		})
	})

	route.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(models.APIResponse{
			Status: "success",
			Data:   "alive",
		})
	})

	route.Get("/monitor", monitor.New(monitor.Config{Title: "gshare API Monitor"}))

	// TODO: Potentially add a server statistics endpoint within health
	// health.Get("/stats", controllers.ServerStats)
}
