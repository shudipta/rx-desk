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
	PatientID    uint                     `json:"patient_id" binding:"required"`
	Title        string                   `json:"title" binding:"required"`
	VisitType    string                   `json:"visit_type" binding:"required"`
	Followup     string                   `json:"followup"`
	Notes        string                   `json:"notes"`
	Complaints   []CreateComplaintInput   `json:"complaints" binding:"dive"`
	Histories    []CreateHistoryInput     `json:"histories" binding:"dive"`
	Examinations []CreateExaminationInput `json:"examinations" binding:"dive"`
	Diagnoses    []CreateDiagnosisInput   `json:"diagnoses" binding:"dive"`
	Medicines    []CreateMedicineInput    `json:"medicines" binding:"dive"`
	Tests        []CreateTestInput        `json:"tests" binding:"dive"`
	Advices      []CreateAdviceInput      `json:"advices" binding:"dive"`
}

// CreateComplaintInput defines nested input for chief complaints (C/C)
type CreateComplaintInput struct {
	ComplaintText string `json:"complaint_text" binding:"required"`
}

// CreateHistoryInput defines nested input for past history (P/H)
type CreateHistoryInput struct {
	HistoryText string `json:"history_text" binding:"required"`
}

// CreateExaminationInput defines nested input for on-examination findings (O/E)
type CreateExaminationInput struct {
	ExaminationText string `json:"examination_text" binding:"required"`
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
	MealTiming   string `json:"meal_timing" binding:"omitempty,oneof=before after"`
}

// CreateTestInput defines nested input for prescription tests
type CreateTestInput struct {
	TestName string `json:"test_name" binding:"required"`
}

// CreateAdviceInput defines nested input for prescription advices
type CreateAdviceInput struct {
	AdviceText string `json:"advice_text" binding:"required"`
}

// itemModels lists every per-prescription item table, for deleting on update
var itemModels = []any{
	&models.PrescriptionComplaint{},
	&models.PrescriptionHistory{},
	&models.PrescriptionExamination{},
	&models.PrescriptionDiagnosis{},
	&models.PrescriptionMedicine{},
	&models.PrescriptionTest{},
	&models.PrescriptionAdvice{},
}

// saveItems inserts all nested items of a prescription, keeping input order
func saveItems(tx *gorm.DB, rxID uint, in CreatePrescriptionInput) error {
	var rows []any
	for _, x := range in.Complaints {
		rows = append(rows, &models.PrescriptionComplaint{PrescriptionID: rxID, ComplaintText: x.ComplaintText})
	}
	for _, x := range in.Histories {
		rows = append(rows, &models.PrescriptionHistory{PrescriptionID: rxID, HistoryText: x.HistoryText})
	}
	for _, x := range in.Examinations {
		rows = append(rows, &models.PrescriptionExamination{PrescriptionID: rxID, ExaminationText: x.ExaminationText})
	}
	for _, x := range in.Diagnoses {
		rows = append(rows, &models.PrescriptionDiagnosis{PrescriptionID: rxID, DiagnosisText: x.DiagnosisText})
	}
	for _, x := range in.Medicines {
		rows = append(rows, &models.PrescriptionMedicine{
			PrescriptionID: rxID,
			MedicineName:   x.MedicineName,
			Dosage:         x.Dosage,
			Duration:       x.Duration,
			Instructions:   x.Instructions,
			MealTiming:     x.MealTiming,
		})
	}
	for _, x := range in.Tests {
		rows = append(rows, &models.PrescriptionTest{PrescriptionID: rxID, TestName: x.TestName})
	}
	for _, x := range in.Advices {
		rows = append(rows, &models.PrescriptionAdvice{PrescriptionID: rxID, AdviceText: x.AdviceText})
	}
	for _, row := range rows {
		if err := tx.Create(row).Error; err != nil {
			return err
		}
	}
	return nil
}

// loadPrescription fetches a prescription with its patient and every nested item
func loadPrescription(id any) (models.Prescription, error) {
	var rx models.Prescription
	err := database.DB.
		Preload("Patient").
		Preload("Complaints").
		Preload("Histories").
		Preload("Examinations").
		Preload("Diagnoses").
		Preload("Medicines").
		Preload("Tests").
		Preload("Advices").
		First(&rx, id).Error
	return rx, err
}

// CreatePrescription creates a new prescription with all its nested items in a transaction
func CreatePrescription(c *gin.Context) {
	var input CreatePrescriptionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var patient models.Patient
	if err := database.DB.First(&patient, input.PatientID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Patient not found"})
		return
	}

	prescription := models.Prescription{
		PatientID: input.PatientID,
		Title:     input.Title,
		VisitType: input.VisitType,
		Followup:  input.Followup,
		Notes:     input.Notes,
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&prescription).Error; err != nil {
			return err
		}
		return saveItems(tx, prescription.ID, input)
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create prescription: " + err.Error()})
		return
	}

	created, err := loadPrescription(prescription.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load created prescription"})
		return
	}
	c.JSON(http.StatusCreated, dto.MapPrescription(created))
}

// UpdatePrescription replaces an existing prescription and all its nested items in a transaction
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
		// A map (not a struct) so that cleared follow-up/notes are saved as empty
		if err := tx.Model(&prescription).Updates(map[string]any{
			"title":      input.Title,
			"visit_type": input.VisitType,
			"followup":   input.Followup,
			"notes":      input.Notes,
		}).Error; err != nil {
			return err
		}
		for _, m := range itemModels {
			if err := tx.Where("prescription_id = ?", prescription.ID).Delete(m).Error; err != nil {
				return err
			}
		}
		return saveItems(tx, prescription.ID, input)
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update prescription: " + err.Error()})
		return
	}

	updated, err := loadPrescription(prescription.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load updated prescription"})
		return
	}
	c.JSON(http.StatusOK, dto.MapPrescription(updated))
}

// GetPrescription retrieves a single prescription with its patient and all nested items
func GetPrescription(c *gin.Context) {
	prescription, err := loadPrescription(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prescription not found"})
		return
	}
	c.JSON(http.StatusOK, dto.MapPrescription(prescription))
}

// GetPatientPrescriptions retrieves all prescriptions for a specific patient, returning latest first
func GetPatientPrescriptions(c *gin.Context) {
	patientID := c.Param("id")

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
