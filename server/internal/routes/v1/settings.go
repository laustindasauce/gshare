package v1routes

import (
	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/austinbspencer/gshare-server/pkg/middleware"
	"github.com/gofiber/fiber/v2"
)

func SettingsPublicRoutes(a fiber.Router) {
	// Create routes group.
	route := a.Group("/api/v1")

	settings := route.Group("/settings")

	settings.Get("/public", controllers.GetPublicSettings)
}

func SettingsPrivateRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	settings := route.Group("/settings", middleware.JWTProtected())

	settings.Get("", controllers.GetSettings)
	settings.Put("", controllers.UpdateSettings)
	settings.Post("/redeploy", controllers.RedeployClient)
}
