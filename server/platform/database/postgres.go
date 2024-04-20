package database

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	fiberLog "github.com/gofiber/fiber/v2/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Declare the variable for the database
var Postgres *gorm.DB

// Connect connect to db
func Connect() {
	var err error
	port, err := strconv.ParseUint(configs.Getenv("DB_PORT", "5432"), 10, 32)
	if err != nil {
		fiberLog.Warnf("Environment variable DB_PORT is invalid or not set! Using default: 5432")
		port = 5432
	}

	dbName := configs.Getenv("DB_NAME", "gshare_db")

	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable timezone=America/Phoenix",
		configs.Getenv("DB_HOST", "localhost"), port, configs.Getenv("DB_USER", "gallery"), configs.Getenv("DB_PASSWORD", "insecure"), dbName)

	// Connect to the DB and initialize the DB variable
	Postgres, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: getCustomLogger(),
	})
	if err != nil {
		panic("failed to connect database ")
	}

	fiberLog.Infof("Connection Opened to Database: %s\n", dbName)

	// Migrate the models into DB
	Postgres.AutoMigrate(
		&models.User{},
		&models.Client{},
		&models.Gallery{},
		&models.Image{},
		&models.Event{},
		&models.Settings{},
	)

	adminPassword := configs.Getenv("ADMIN_PASSWORD", "insecure")

	// Create admin user if not exists
	Postgres.FirstOrCreate(&models.User{
		Email:    configs.Getenv("ADMIN_EMAIL", "admin@domain.dev"),
		Password: &adminPassword,
	})

	// Create settings if not exists
	Postgres.Where("id = 1").FirstOrCreate(&models.Settings{})

	fiberLog.Infof("Database `%s` Migrated\n", dbName)
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
