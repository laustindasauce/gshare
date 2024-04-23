package v1routes

import (
	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/austinbspencer/gshare-server/pkg/middleware"
	"github.com/gofiber/fiber/v2"
)

func UserPublicRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	users := route.Group("/users")

	users.Post("/admin/create", controllers.CreateFirstUser)
}

func UserPrivateRoutes(a *fiber.App) {
	// Create routes group.
	route := a.Group("/api/v1")

	users := route.Group("/users", middleware.JWTProtected())

	users.Put("/:userID", controllers.UpdateUser)
}
