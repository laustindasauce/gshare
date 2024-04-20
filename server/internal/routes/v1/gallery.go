package v1routes

import (
	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/austinbspencer/gshare-server/pkg/middleware"
	"github.com/gofiber/fiber/v2"
)

func GalleryPublicRoutes(a fiber.Router) {
	// Create routes group.
	route := a.Group("/api/v1")

	gallery := route.Group("/galleries")

	gallery.Get("/public", controllers.GetPublicGalleries)
	gallery.Get("/live", controllers.GetLiveGalleries)
	gallery.Get("/path/:galleryPath", controllers.GetGalleryByPath)
	gallery.Post("/path/:galleryPath", controllers.UnlockGallery)
	gallery.Get("/id/:galleryID/qr-code", controllers.GetGalleryQRCode)
}

func GalleryPrivateRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	gallery := route.Group("/galleries", middleware.JWTProtected())

	gallery.Post("", controllers.CreateGallery)
	gallery.Get("", controllers.GetGalleries)
	gallery.Get("/id/:galleryID", controllers.GetGallery)
	gallery.Put("/id/:galleryID", controllers.UpdateGallery)
	gallery.Delete("/id/:galleryID", controllers.DeleteGallery)
	gallery.Post("/id/:galleryID/images", controllers.UploadGalleryImage)
	gallery.Put("/id/:galleryID/images", controllers.UpdateGalleryImagesOrder)
	gallery.Post("/id/:galleryID/images/zip", controllers.CreateGalleryImageZips)
}
