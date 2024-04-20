package configs

import (
	"errors"
	"strings"
	"time"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/pkg/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

// FiberConfig func for configuration Fiber app.
// See: https://docs.gofiber.io/api/fiber#config
func FiberConfig() fiber.Config {
	// Define server settings.
	readTimeoutSecondsCountEnv := Getenv("SERVER_READ_TIMEOUT", "60")
	readTimeoutSecondsCount, err := utils.ParseSize(readTimeoutSecondsCountEnv)
	if err != nil {
		log.Warnf("Your SERVER_READ_TIMEOUT value of '%s' is not a valid value. Defaulting to '60'.\nError: %v\n", readTimeoutSecondsCountEnv, err)
		// Use a default value if the environment variable is invalid
		readTimeoutSecondsCount = 60 // this is the default read timeout
	}

	// Get max body size from environment
	maxBodySizeEnv := Getenv("MAX_BODY_SIZE", "20")
	maxBodySize, err := utils.ParseSize(maxBodySizeEnv)
	if err != nil {
		log.Warnf("Your MAX_BODY_SIZE value of '%s' is not a valid value. Defaulting to '20MB'.\nError: %v\n", maxBodySizeEnv, err)
		// Use a default value if the environment variable is invalid
		maxBodySize = 20 * 1024 * 1024 // this is the default limit of 20MB
	}

	// Return Fiber configuration.
	return fiber.Config{
		ReadTimeout:   time.Second * time.Duration(readTimeoutSecondsCount),
		CaseSensitive: false,
		AppName:       "gshare",
		// Override default error handler
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			// Status code defaults to 500
			code := fiber.StatusInternalServerError

			// Retrieve the custom status code if it's a *fiber.Error
			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}

			// Use JSend structure
			return c.Status(code).JSON(models.APIErrorResponse{
				Status:  "error",
				Message: err.Error(),
			})
		},
		BodyLimit: maxBodySize,
	}
}

func FiberLogging() {
	var level log.Level

	switch strings.ToLower(Getenv("LOG_LEVEL", "info")) {
	case "fatal":
		level = log.LevelFatal
	case "panic":
		level = log.LevelPanic
	case "error":
		level = log.LevelError
	case "warn":
		level = log.LevelWarn
	case "info":
		level = log.LevelInfo
	case "debug":
		level = log.LevelDebug
	case "trace":
		level = log.LevelTrace
	default:
		log.Warnf("Invalid log level: %s. Defaulting to 'info'.\n", strings.ToLower(Getenv("LOG_LEVEL", "info")))
		level = log.LevelInfo
	}

	log.SetLevel(level)
}
