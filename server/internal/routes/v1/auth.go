package v1routes

import (
	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/austinbspencer/gshare-server/pkg/middleware"
	"github.com/gofiber/fiber/v2"
)

func AuthPublicRoutes(a fiber.Router) {
	// Create routes group.
	route := a.Group("/api/v1")

	auth := route.Group("/auth")

	auth.Post("", controllers.GetNewAccessToken)
	auth.Post("/2fa", controllers.TwoFactorAuth)
}

func AuthPrivateRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	auth := route.Group("/auth", middleware.JWTProtected())

	auth.Get("", controllers.GetAuthenticatedUser)
	auth.Put("", controllers.UpdateAuthenticatedUser)
}
