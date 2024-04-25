package main

import (
	"os"
	"os/signal"

	"github.com/austinbspencer/gshare-server/internal/routes"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/austinbspencer/gshare-server/pkg/middleware"
	"github.com/austinbspencer/gshare-server/platform/database"
	"github.com/austinbspencer/gshare-server/platform/docker"
	"github.com/austinbspencer/gshare-server/platform/email"
	"github.com/austinbspencer/gshare-server/runner"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"

	_ "github.com/joho/godotenv/autoload" // load .env file automatically
)

func init() {
	// Test docker setup
	err := docker.TestDockerConnection()
	if err != nil {
		log.Warnf("Error encountered while testing the docker connection: %v\n", err)
	}

	database.Connect()
	email.TestEmailConnection()
	// Set swagger docs
	configs.SetDocsInfo()
	// Set Fiber logging
	configs.FiberLogging()
}

// @contact.name gshare API Support
// @contact.email austin.spencer2097@gmail.com
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
func main() {
	// Define a new Fiber app with config.
	app := fiber.New(configs.FiberConfig())

	// Register Middlewares.
	middleware.FiberMiddleware(app)

	// Set routes
	routes.ConfigureRouter(app)

	// Run scheduled scripts
	runner.RunScripts()

	// starting server with a graceful shutdown.
	startServerWithGracefulShutdown(app)
}

// starting server with a graceful shutdown.
func startServerWithGracefulShutdown(a *fiber.App) {
	// Create channel for idle connections.
	idleConnsClosed := make(chan struct{})

	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt) // Catch OS signals.
		<-sigint

		// Received an interrupt signal, shutdown.
		if err := a.Shutdown(); err != nil {
			// Error from closing listeners, or context timeout:
			log.Errorf("Oops... Server is not shutting down! Reason: %v", err)
		}

		close(idleConnsClosed)
	}()

	// Run server.
	if err := a.Listen("0.0.0.0:8323"); err != nil {
		log.Errorf("Oops... Server is not running! Reason: %v", err)
	}

	<-idleConnsClosed
}
