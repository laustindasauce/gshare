package database

import (
	"fmt"
	"log"
	"os"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/pkg/configs"
	fiberLog "github.com/gofiber/fiber/v2/log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// Connect to sqlite db
func connectSqlite() {
	dbPath := configs.Getenv("DB_PATH", "/data")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		fiberLog.Infof("Database directory not found at %s, creating it.\n", dbPath)
		if err := os.MkdirAll(dbPath, 0600); err != nil {
			fiberLog.Errorf("Failed to create database directory: %v\n", err)
			log.Fatal(err)
		}
		fiberLog.Infof("Database directory created at %s\n", dbPath)
	}

	dbLoc := fmt.Sprintf("%s/gshare.db", dbPath)
	if _, err := os.Stat(dbLoc); os.IsNotExist(err) {
		fiberLog.Infof("Database file not found at %s, creating a new one.\n", dbLoc)
		if _, err := os.Create(dbLoc); err != nil {
			fiberLog.Errorf("Failed to create database file: %v\n", err)
			log.Fatal(err)
		}
		fiberLog.Infof("Database file created at %s\n", dbLoc)
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbLoc), &gorm.Config{
		Logger: getCustomLogger(),
	})
	if err != nil {
		fiberLog.Errorf("Error connecting to database: %v", err)
		log.Fatal(err)
	}

	fiberLog.Info("Connection Opened to sqlite database.")

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

	fiberLog.Info("sqlite database Migrated")
}
