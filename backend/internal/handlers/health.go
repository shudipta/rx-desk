package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// HealthCheck responds with a simple JSON message indicating server health
func HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"message": "RxDesk Backend API is running",
	})
}
