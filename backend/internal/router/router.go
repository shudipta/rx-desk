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

	// Dashboard stats
	r.GET("/stats/dashboard", handlers.GetDashboardStats)

	// Patient routes
	r.GET("/patients", handlers.ListPatients)
	r.GET("/patients/search", handlers.SearchPatients)
	r.GET("/patients/:id", handlers.GetPatient)
	r.POST("/patients", handlers.CreatePatient)
	r.PUT("/patients/:id", handlers.UpdatePatient)
	r.GET("/patients/:id/prescriptions", handlers.GetPatientPrescriptions)

	// Prescription routes
	r.POST("/prescriptions", handlers.CreatePrescription)
	r.GET("/prescriptions/:id", handlers.GetPrescription)
	r.PUT("/prescriptions/:id", handlers.UpdatePrescription)

	// Doctor profile routes
	r.GET("/doctor/profile", handlers.GetDoctorProfile)
	r.PUT("/doctor/profile", handlers.UpdateDoctorProfile)

	// Template routes
	r.GET("/favorite-medicines", handlers.ListFavoriteMedicines)
	r.POST("/favorite-medicines", handlers.CreateFavoriteMedicine)
	r.PUT("/favorite-medicines/:id", handlers.UpdateFavoriteMedicine)
	r.DELETE("/favorite-medicines/:id", handlers.DeleteFavoriteMedicine)

	r.GET("/favorite-tests", handlers.ListFavoriteTests)
	r.POST("/favorite-tests", handlers.CreateFavoriteTest)
	r.PUT("/favorite-tests/:id", handlers.UpdateFavoriteTest)
	r.DELETE("/favorite-tests/:id", handlers.DeleteFavoriteTest)

	r.GET("/advice-templates", handlers.ListAdviceTemplates)
	r.POST("/advice-templates", handlers.CreateAdviceTemplate)
	r.PUT("/advice-templates/:id", handlers.UpdateAdviceTemplate)
	r.DELETE("/advice-templates/:id", handlers.DeleteAdviceTemplate)

	r.GET("/followup-templates", handlers.ListFollowupTemplates)
	r.POST("/followup-templates", handlers.CreateFollowupTemplate)
	r.PUT("/followup-templates/:id", handlers.UpdateFollowupTemplate)
	r.DELETE("/followup-templates/:id", handlers.DeleteFollowupTemplate)

	return r
}
