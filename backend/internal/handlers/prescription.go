package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/dto"
	"github.com/shudipta/rx-desk/backend/internal/models"
	"gorm.io/gorm"
)

// CreatePrescriptionInput defines the validation structure for creating a prescription
type CreatePrescriptionInput struct {
	PatientID uint                    `json:"patient_id" binding:"required"`
	Title     string                  `json:"title" binding:"required"`
	VisitType string                  `json:"visit_type" binding:"required"`
	Followup  string                  `json:"followup"`
	Notes     string                  `json:"notes"`
	Diagnoses []CreateDiagnosisInput  `json:"diagnoses"`
	Medicines []CreateMedicineInput   `json:"medicines"`
	Tests     []CreateTestInput       `json:"tests"`
	Advices   []CreateAdviceInput     `json:"advices"`
}

// CreateDiagnosisInput defines nested input for prescription diagnoses
type CreateDiagnosisInput struct {
	DiagnosisText string `json:"diagnosis_text" binding:"required"`
}

// CreateMedicineInput defines nested input for prescription medicines
type CreateMedicineInput struct {
	MedicineName string `json:"medicine_name" binding:"required"`
	Dosage       string `json:"dosage"`
	Duration     string `json:"duration"`
	Instructions string `json:"instructions"`
}

// CreateTestInput defines nested input for prescription tests
type CreateTestInput struct {
	TestName string `json:"test_name" binding:"required"`
}

// CreateAdviceInput defines nested input for prescription advices
type CreateAdviceInput struct {
	AdviceText string `json:"advice_text" binding:"required"`
}

// CreatePrescription creates a new prescription with all its nested items in a transaction
func CreatePrescription(c *gin.Context) {
	var input CreatePrescriptionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify patient exists
	var patient models.Patient
	if err := database.DB.First(&patient, input.PatientID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	// Construct Prescription object
	prescription := models.Prescription{
		PatientID: input.PatientID,
		Title:     input.Title,
		VisitType: input.VisitType,
		Followup:  input.Followup,
		Notes:     input.Notes,
	}

	// Execute inside a database transaction to ensure atomicity
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// Save root prescription
		if err := tx.Create(&prescription).Error; err != nil {
			return err
		}

		// Save diagnoses
		for _, d := range input.Diagnoses {
			diag := models.PrescriptionDiagnosis{
				PrescriptionID: prescription.ID,
				DiagnosisText:  d.DiagnosisText,
			}
			if err := tx.Create(&diag).Error; err != nil {
				return err
			}
		}

		// Save medicines
		for _, m := range input.Medicines {
			medicine := models.PrescriptionMedicine{
				PrescriptionID: prescription.ID,
				MedicineName:   m.MedicineName,
				Dosage:         m.Dosage,
				Duration:       m.Duration,
				Instructions:   m.Instructions,
			}
			if err := tx.Create(&medicine).Error; err != nil {
				return err
			}
		}

		// Save tests
		for _, t := range input.Tests {
			test := models.PrescriptionTest{
				PrescriptionID: prescription.ID,
				TestName:       t.TestName,
			}
			if err := tx.Create(&test).Error; err != nil {
				return err
			}
		}

		// Save advices
		for _, a := range input.Advices {
			advice := models.PrescriptionAdvice{
				PrescriptionID: prescription.ID,
				AdviceText:     a.AdviceText,
			}
			if err := tx.Create(&advice).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription: " + err.Error()})
		return
	}

	// Preload nested models to return the full payload
	if err := database.DB.Preload("Medicines").Preload("Tests").Preload("Advices").Preload("Diagnoses").First(&prescription, prescription.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load created prescription"})
		return
	}

	c.JSON(http.StatusCreated, dto.MapPrescription(prescription))
}

// UpdatePrescription updates an existing prescription with all its nested items in a transaction
func UpdatePrescription(c *gin.Context) {
	id := c.Param("id")

	var prescription models.Prescription
	if err := database.DB.First(&prescription, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}

	var input CreatePrescriptionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// Update root fields
		if err := tx.Model(&prescription).Updates(models.Prescription{
			Title:     input.Title,
			VisitType: input.VisitType,
			Followup:  input.Followup,
			Notes:     input.Notes,
		}).Error; err != nil {
			return err
		}

		// Delete old nested items
		if err := tx.Where("prescription_id = ?", prescription.ID).Delete(&models.PrescriptionDiagnosis{}).Error; err != nil {
			return err
		}
		if err := tx.Where("prescription_id = ?", prescription.ID).Delete(&models.PrescriptionMedicine{}).Error; err != nil {
			return err
		}
		if err := tx.Where("prescription_id = ?", prescription.ID).Delete(&models.PrescriptionTest{}).Error; err != nil {
			return err
		}
		if err := tx.Where("prescription_id = ?", prescription.ID).Delete(&models.PrescriptionAdvice{}).Error; err != nil {
			return err
		}

		// Recreate diagnoses
		for _, d := range input.Diagnoses {
			if err := tx.Create(&models.PrescriptionDiagnosis{
				PrescriptionID: prescription.ID,
				DiagnosisText:  d.DiagnosisText,
			}).Error; err != nil {
				return err
			}
		}

		// Recreate medicines
		for _, m := range input.Medicines {
			if err := tx.Create(&models.PrescriptionMedicine{
				PrescriptionID: prescription.ID,
				MedicineName:   m.MedicineName,
				Dosage:         m.Dosage,
				Duration:       m.Duration,
				Instructions:   m.Instructions,
			}).Error; err != nil {
				return err
			}
		}

		// Recreate tests
		for _, t := range input.Tests {
			if err := tx.Create(&models.PrescriptionTest{
				PrescriptionID: prescription.ID,
				TestName:       t.TestName,
			}).Error; err != nil {
				return err
			}
		}

		// Recreate advices
		for _, a := range input.Advices {
			if err := tx.Create(&models.PrescriptionAdvice{
				PrescriptionID: prescription.ID,
				AdviceText:     a.AdviceText,
			}).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update prescription: " + err.Error()})
		return
	}

	if err := database.DB.Preload("Medicines").Preload("Tests").Preload("Advices").Preload("Diagnoses").Preload("Patient").First(&prescription, prescription.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated prescription"})
		return
	}

	c.JSON(http.StatusOK, dto.MapPrescription(prescription))
}

// GetPrescription retrieves a single prescription by ID preloading Patient, Medicines, Tests, Advices, and Diagnoses
func GetPrescription(c *gin.Context) {
	id := c.Param("id")
	var prescription models.Prescription
	if err := database.DB.Preload("Patient").Preload("Medicines").Preload("Tests").Preload("Advices").Preload("Diagnoses").First(&prescription, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}
	c.JSON(http.StatusOK, dto.MapPrescription(prescription))
}

// GetPatientPrescriptions retrieves all prescriptions for a specific patient, returning latest first
func GetPatientPrescriptions(c *gin.Context) {
	patientID := c.Param("id")

	// Verify patient exists
	var patient models.Patient
	if err := database.DB.First(&patient, patientID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	var prescriptions []models.Prescription
	err := database.DB.
		Select("id, title, visit_type, followup, created_at").
		Where("patient_id = ?", patientID).
		Order("created_at DESC").
		Find(&prescriptions).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch prescriptions: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, dto.MapPatientPrescriptions(prescriptions))
}
