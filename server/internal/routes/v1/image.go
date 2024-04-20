package v1routes

import (
	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/austinbspencer/gshare-server/pkg/middleware"
	"github.com/gofiber/fiber/v2"
)

func ImagePublicRoutes(a fiber.Router) {
	// Create routes group.
	route := a.Group("/api/v1")

	image := route.Group("/images")

	image.Get("/:imageID/:width/:quality", controllers.GetImageSized)
}

func ImagePrivateRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	image := route.Group("/images", middleware.JWTProtected())

	image.Get("", controllers.GetImages)
	image.Get("/:imageID", controllers.GetImage)
	image.Delete("/:imageID", controllers.DeleteImage)
}
