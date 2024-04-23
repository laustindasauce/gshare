package database

import (
	"fmt"
	"strconv"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	fiberLog "github.com/gofiber/fiber/v2/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Connect to Postgres db
func connectPostgres() {
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
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: getCustomLogger(),
	})
	if err != nil {
		panic("failed to connect database ")
	}

	fiberLog.Infof("Connection Opened to Database: %s\n", dbName)

	// Migrate the models into DB
	DB.AutoMigrate(
		&models.User{},
		&models.Client{},
		&models.Gallery{},
		&models.Image{},
		&models.Event{},
		&models.Settings{},
	)

	// Create settings if not exists
	DB.Where("id = 1").FirstOrCreate(&models.Settings{})

	fiberLog.Infof("Database `%s` Migrated\n", dbName)
}
