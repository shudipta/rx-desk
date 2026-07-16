package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/models"
)

// PatientInput defines the validation structure for creating and updating patients
type PatientInput struct {
	Name   string `json:"name" binding:"required"`
	Age    int    `json:"age" binding:"required,gt=0"`
	Gender string `json:"gender" binding:"required"`
	Phone  string `json:"phone" binding:"required"`
}

// ListPatients retrieves all patients
func ListPatients(c *gin.Context) {
	var patients []models.Patient
	if err := database.DB.Find(&patients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch patients"})
		return
	}
	c.JSON(http.StatusOK, patients)
}

// GetPatient retrieves a single patient by ID
func GetPatient(c *gin.Context) {
	id := c.Param("id")
	var patient models.Patient
	if err := database.DB.First(&patient, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}
	c.JSON(http.StatusOK, patient)
}

// SearchPatients searches patients by name or phone (case-insensitive)
func SearchPatients(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	lowerQuery := "%" + strings.ToLower(query) + "%"

	var patients []models.Patient
	// SQLite LIKE is case-insensitive for ASCII by default, but LOWER() ensures correctness
	err := database.DB.Where("LOWER(name) LIKE ? OR LOWER(phone) LIKE ?", lowerQuery, lowerQuery).Find(&patients).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search patients"})
		return
	}

	c.JSON(http.StatusOK, patients)
}

// CreatePatient creates a new patient record
func CreatePatient(c *gin.Context) {
	var input PatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient := models.Patient{
		Name:   input.Name,
		Age:    input.Age,
		Gender: input.Gender,
		Phone:  input.Phone,
	}

	if err := database.DB.Create(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create patient"})
		return
	}

	c.JSON(http.StatusCreated, patient)
}

// UpdatePatient updates an existing patient record
func UpdatePatient(c *gin.Context) {
	id := c.Param("id")
	var patient models.Patient
	if err := database.DB.First(&patient, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	var input PatientInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	patient.Name = input.Name
	patient.Age = input.Age
	patient.Gender = input.Gender
	patient.Phone = input.Phone

	if err := database.DB.Save(&patient).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update patient"})
		return
	}

	c.JSON(http.StatusOK, patient)
}
