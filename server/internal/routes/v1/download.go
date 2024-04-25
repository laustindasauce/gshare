package v1routes

import (
	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/gofiber/fiber/v2"
)

func DownloadPublicRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	download := route.Group("/download/:size")

	download.Get("/image/:imageID", controllers.DownloadImage)
	download.Get("/gallery/:galleryID", controllers.DownloadGallery)
	download.Post("/images", controllers.DownloadImages)
}
