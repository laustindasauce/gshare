package routes

import (
	v1routes "github.com/austinbspencer/gshare-server/internal/routes/v1"
	"github.com/gofiber/fiber/v2"
)

func VersionedRoutes(a *fiber.App) {
	v1routes.AuthPublicRoutes(a)
	v1routes.AuthPrivateRoutes(a)
	v1routes.DownloadPublicRoutes(a)
	v1routes.EventPublicRoutes(a)
	v1routes.EventPrivateRoutes(a)
	v1routes.GalleryPublicRoutes(a)
	v1routes.GalleryPrivateRoutes(a)
	v1routes.ImagePublicRoutes(a)
	v1routes.ImagePrivateRoutes(a)
	v1routes.SettingsPublicRoutes(a)
	v1routes.SettingsPrivateRoutes(a)
}
