package models

import (
	"gorm.io/gorm"
)

// Patient represents a patient record
type Patient struct {
	gorm.Model
	Name          string         `json:"name" gorm:"not null"`
	Age           int            `json:"age" gorm:"not null"`
	Gender        string         `json:"gender" gorm:"not null"`
	Phone         string         `json:"phone" gorm:"not null"`
	Prescriptions []Prescription `json:"prescriptions,omitempty" gorm:"foreignKey:PatientID;constraint:OnDelete:CASCADE;"`
}

// Prescription represents a complete patient prescription
type Prescription struct {
	gorm.Model
	PatientID uint                   `json:"patient_id" gorm:"not null;index"`
	Patient   *Patient               `json:"patient,omitempty" gorm:"foreignKey:PatientID"`
	Title     string                 `json:"title" gorm:"not null"` // e.g. "Diabetes Follow-up", "Initial Consultation"
	VisitType string                 `json:"visit_type" gorm:"not null"`
	Diagnosis string                 `json:"diagnosis"`
	Followup  string                 `json:"followup"`
	Notes     string                 `json:"notes"`
	Medicines []PrescriptionMedicine `json:"medicines,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Tests     []PrescriptionTest     `json:"tests,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Advices   []PrescriptionAdvice   `json:"advices,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
}

// PrescriptionMedicine represents a single medicine prescribed in a prescription
type PrescriptionMedicine struct {
	gorm.Model
	PrescriptionID uint   `json:"prescription_id" gorm:"not null;index"`
	MedicineName   string `json:"medicine_name" gorm:"not null"`
	Dosage         string `json:"dosage"`
	Duration       string `json:"duration"`
	Instructions   string `json:"instructions"`
}

// PrescriptionTest represents a single diagnostic test ordered in a prescription
type PrescriptionTest struct {
	gorm.Model
	PrescriptionID uint   `json:"prescription_id" gorm:"not null;index"`
	TestName       string `json:"test_name" gorm:"not null"`
}

// PrescriptionAdvice represents a single advice given in a prescription
type PrescriptionAdvice struct {
	gorm.Model
	PrescriptionID uint   `json:"prescription_id" gorm:"not null;index"`
	AdviceText     string `json:"advice_text" gorm:"not null"`
}

// FavoriteMedicine represents a doctor's frequently used medicine list
type FavoriteMedicine struct {
	gorm.Model
	Name string `json:"name" gorm:"uniqueIndex;not null"`
}

// FavoriteTest represents a doctor's frequently ordered diagnostic test list
type FavoriteTest struct {
	gorm.Model
	Name string `json:"name" gorm:"uniqueIndex;not null"`
}

// AdviceTemplate represents reusable instructions/advices to include in prescriptions
type AdviceTemplate struct {
	gorm.Model
	Title   string `json:"title" gorm:"uniqueIndex;not null"`
	Content string `json:"content" gorm:"not null"`
}

// FollowupTemplate represents reusable follow-up duration/instructions
type FollowupTemplate struct {
	gorm.Model
	Title string `json:"title" gorm:"uniqueIndex;not null"`
	Value string `json:"value" gorm:"not null"`
}
