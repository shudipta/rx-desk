package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/models"
)

type DashboardStats struct {
	TotalPatients      int64 `json:"total_patients"`
	TodayConsultations int64 `json:"today_consultations"`
}

func GetDashboardStats(c *gin.Context) {
	var stats DashboardStats

	database.DB.Model(&models.Patient{}).Count(&stats.TotalPatients)

	database.DB.Model(&models.Prescription{}).
		Where("DATE(created_at) = DATE('now')").
		Count(&stats.TodayConsultations)

	c.JSON(http.StatusOK, stats)
}
