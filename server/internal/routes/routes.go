package routes

import "github.com/gofiber/fiber/v2"

func ConfigureRouter(app *fiber.App) {
	// Register Versioned Routes
	VersionedRoutes(app)

	// Register Special Routes
	HealthRoutes(app)  // Register a route for the monitoring interface
	SwaggerRoute(app)  // Register a route for API Docs (Swagger).
	NotFoundRoute(app) // Register route for 404 Error.
}
