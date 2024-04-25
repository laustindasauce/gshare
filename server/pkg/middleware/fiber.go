package middleware

import (
	"strconv"
	"strings"
	"time"

	"github.com/austinbspencer/gshare-server/internal/controllers"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/fiber/v2/middleware/cache"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/favicon"
	"github.com/gofiber/fiber/v2/middleware/healthcheck"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/utils"
	"github.com/gofiber/storage/memory/v2"
	"github.com/gofiber/storage/redis/v3"
)

// Get the cache storage option
func getStorage() fiber.Storage {
	var store fiber.Storage
	if strings.ToLower(configs.Getenv("CACHE_DRIVER", "memory")) == "redis" {
		log.Info("Using Redis for cache storage")
		store = redis.New(redis.Config{
			Host:     configs.Getenv("REDIS_HOST", "localhost"),
			Port:     configs.GetenvInt("REDIS_PORT", 6379),
			Username: configs.Getenv("REDIS_USER", ""),
			Password: configs.Getenv("REDIS_PASSWORD", ""),
			Database: 0,
		})
	} else {
		log.Info("Using Memory for cache storage")
		// Default is in memory
		store = memory.New()
	}

	return store
}

// Get the limiter expiration time
func getLimiterExpiration() time.Duration {
	expiry := configs.GetenvInt("LIMITER_EXPIRATION", 5)

	expiration := time.Duration(expiry) * time.Second

	return expiration
}

// FiberMiddleware provide Fiber's built-in middlewares.
// See: https://docs.gofiber.io/api/middleware
func FiberMiddleware(a *fiber.App) {
	a.Use(
		// Add CORS to each route.
		cors.New(cors.Config{
			AllowOrigins:     configs.Getenv("ALLOWED_ORIGINS", "http://localhost:3000, http://localhost:8323"),
			AllowMethods:     "GET, POST, OPTIONS, PUT, DELETE",
			AllowHeaders:     "Origin, Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Cache-Time",
			ExposeHeaders:    "Origin",
			AllowCredentials: true,
		}),
		// Add simple logger.
		logger.New(logger.Config{
			Format:   "[${ip}]:${port} - ${method} ${path} ${queryParams} - ${status}\n",
			TimeZone: configs.Getenv("TZ", "UTC"),
		}),
		// Add simple Favicon
		favicon.New(favicon.Config{
			File: "./favicon.ico",
		}),
		// Recover from panic
		recover.New(),
		// Health check built in middleware
		healthcheck.New(healthcheck.Config{
			LivenessProbe:     controllers.LivenessProbe,
			LivenessEndpoint:  "/api/live",
			ReadinessProbe:    controllers.ReadinessProbe,
			ReadinessEndpoint: "/api/ready",
		}),
	)

	// Only add cache when enabled
	if configs.GetenvBool("CACHE_ENABLED", true) {
		a.Use(
			// Add cache for api
			cache.New(cache.Config{
				Next: func(c *fiber.Ctx) bool {
					return c.Query("noCache") == "true"
				},
				ExpirationGenerator: func(c *fiber.Ctx, cfg *cache.Config) time.Duration {
					// Default of no cache
					newCacheTime, _ := strconv.Atoi(c.GetRespHeader("Cache-Time", "0"))

					// If the cache time is less than or equal to 0, then we don't cache
					if newCacheTime <= 0 {
						return time.Duration(0)
					}

					if newCacheTime > 0 {
						log.Debugf("Setting cache expiration time for %s to %d\n", c.Path(), newCacheTime)
					}

					// Return the cache time
					return time.Second * time.Duration(newCacheTime)
				},
				KeyGenerator: func(c *fiber.Ctx) string {
					return utils.CopyString(c.Path())
				},
				Storage: getStorage(),
			}),
		)
	}

	// Only add limiter when enabled
	if configs.GetenvBool("LIMITER_ENABLED", false) {
		a.Use(
			// Add simple limiter
			limiter.New(limiter.Config{Max: configs.GetenvInt("LIMITER_REQUESTS", 100),
				Expiration: getLimiterExpiration()}),
		)
	}
}
