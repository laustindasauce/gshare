package v1routes

import (
	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/austinbspencer/gshare-server/pkg/middleware"
	"github.com/gofiber/fiber/v2"
)

func EventPublicRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	event := route.Group("/events")

	event.Post("", controllers.CreateEvent)
}

func EventPrivateRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	event := route.Group("/events", middleware.JWTProtected())

	event.Get("", controllers.GetEvents)
	event.Get("/:eventID", controllers.GetEvent)
	event.Delete("/:eventID", controllers.DeleteEvent)
}
