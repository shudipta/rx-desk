package router

import (
	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/handlers"
)

// SetupRouter configures the endpoints and middleware for the Gin engine
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Simple CORS middleware to allow future frontend interaction
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Register routes
	r.GET("/health", handlers.HealthCheck)

	return r
}
