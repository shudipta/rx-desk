package main

import (
	"log"
	"os"

	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/router"
)

func main() {
	// Determine the database file path (defaults to rx_desk.db)
	dbPath := os.Getenv("DATABASE_URL")
	if dbPath == "" {
		dbPath = "rx_desk.db"
	}

	// Initialize the SQLite database connection using GORM
	_, err := database.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Determine the server port (defaults to 8080)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Setup routes
	r := router.SetupRouter()

	// Start HTTP server
	log.Printf("Starting RxDesk server on port %s...", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
