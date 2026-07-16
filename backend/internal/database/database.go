package database

import (
	"fmt"
	"log"

	"github.com/shudipta/rx-desk/backend/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB is the global database instance
var DB *gorm.DB

// InitDB initializes the SQLite database connection using GORM
func InitDB(dbPath string) (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Run GORM auto-migrations to sync schema to SQLite
	err = db.AutoMigrate(
		&models.Patient{},
		&models.Prescription{},
		&models.PrescriptionMedicine{},
		&models.PrescriptionTest{},
		&models.FavoriteMedicine{},
		&models.FavoriteTest{},
		&models.AdviceTemplate{},
		&models.FollowupTemplate{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to run database automigration: %w", err)
	}

	DB = db
	log.Printf("Successfully connected and migrated SQLite database at: %s", dbPath)
	return DB, nil
}
