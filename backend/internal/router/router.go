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
	r.GET("/api/health", handlers.HealthCheck)

	// All data endpoints live under /api so they never share a path with a
	// page: reloading /patients/5 in the browser must get the app, not JSON.
	api := r.Group("/api")

	// Dashboard stats
	api.GET("/stats/dashboard", handlers.GetDashboardStats)

	// Patient routes
	api.GET("/patients", handlers.ListPatients)
	api.GET("/patients/search", handlers.SearchPatients)
	api.GET("/patients/:id", handlers.GetPatient)
	api.POST("/patients", handlers.CreatePatient)
	api.PUT("/patients/:id", handlers.UpdatePatient)
	api.GET("/patients/:id/prescriptions", handlers.GetPatientPrescriptions)

	// Prescription routes
	api.POST("/prescriptions", handlers.CreatePrescription)
	api.GET("/prescriptions/:id", handlers.GetPrescription)
	api.PUT("/prescriptions/:id", handlers.UpdatePrescription)

	// Doctor profile routes
	api.GET("/doctor/profile", handlers.GetDoctorProfile)
	api.PUT("/doctor/profile", handlers.UpdateDoctorProfile)

	// Template routes
	api.GET("/favorite-medicines", handlers.ListFavoriteMedicines)
	api.POST("/favorite-medicines", handlers.CreateFavoriteMedicine)
	api.PUT("/favorite-medicines/:id", handlers.UpdateFavoriteMedicine)
	api.DELETE("/favorite-medicines/:id", handlers.DeleteFavoriteMedicine)

	api.GET("/favorite-tests", handlers.ListFavoriteTests)
	api.POST("/favorite-tests", handlers.CreateFavoriteTest)
	api.PUT("/favorite-tests/:id", handlers.UpdateFavoriteTest)
	api.DELETE("/favorite-tests/:id", handlers.DeleteFavoriteTest)

	api.GET("/advice-templates", handlers.ListAdviceTemplates)
	api.POST("/advice-templates", handlers.CreateAdviceTemplate)
	api.PUT("/advice-templates/:id", handlers.UpdateAdviceTemplate)
	api.DELETE("/advice-templates/:id", handlers.DeleteAdviceTemplate)

	api.GET("/followup-templates", handlers.ListFollowupTemplates)
	api.POST("/followup-templates", handlers.CreateFollowupTemplate)
	api.PUT("/followup-templates/:id", handlers.UpdateFollowupTemplate)
	api.DELETE("/followup-templates/:id", handlers.DeleteFollowupTemplate)

	api.GET("/clinical-templates", handlers.ListClinicalTemplates)
	api.POST("/clinical-templates", handlers.CreateClinicalTemplate)
	api.PUT("/clinical-templates/:id", handlers.UpdateClinicalTemplate)
	api.DELETE("/clinical-templates/:id", handlers.DeleteClinicalTemplate)

	return r
}
