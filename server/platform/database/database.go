package database

import (
	"log"
	"os"
	"strings"

	"github.com/austinbspencer/gshare-server/pkg/configs"
	fiberLog "github.com/gofiber/fiber/v2/log"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Declare the variable for the database
var DB *gorm.DB

func Connect() {
	driver := strings.ToLower(configs.Getenv("DB_DRIVER", "sqlite"))

	fiberLog.Infof("Connecting database with driver: %s\n", driver)

	if driver == "sqlite" {
		connectSqlite()
	} else if driver == "postgres" {
		connectPostgres()
	} else {
		log.Fatalf("%s is not a valid database driver. this must be one of (sqlite, postgres).", driver)
	}
}

func getCustomLogger() logger.Interface {
	return logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			// SlowThreshold:             time.Second,   // Slow SQL threshold
			LogLevel: getGormLogLevel(configs.Getenv("GORM_LOG_LEVEL", "warn")), // Log level
			// IgnoreRecordNotFoundError: true,          // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries: true, // Don't include params in the SQL log
			// Colorful:                  false,         // Disable color
		},
	)
}

// Helper function to get GORM log level
func getGormLogLevel(level string) logger.LogLevel {
	switch strings.ToLower(level) {
	case "silent":
		return logger.Silent
	case "error":
		return logger.Error
	case "warn":
		return logger.Warn
	case "info":
		return logger.Info
	default:
		fiberLog.Warnf("Invalid GORM log level: '%s'. Defaulting to 'warn'.\n", level)
		return logger.Warn
	}
}
