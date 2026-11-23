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
	PatientID    uint                      `json:"patient_id" gorm:"not null;index"`
	Patient      *Patient                  `json:"patient,omitempty" gorm:"foreignKey:PatientID"`
	Title        string                    `json:"title" gorm:"not null"` // e.g. "Diabetes Follow-up", "Initial Consultation"
	VisitType    string                    `json:"visit_type" gorm:"not null"`
	Followup     string                    `json:"followup"`
	Notes        string                    `json:"notes"`
	Medicines    []PrescriptionMedicine    `json:"medicines,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Tests        []PrescriptionTest        `json:"tests,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Advices      []PrescriptionAdvice      `json:"advices,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Diagnoses    []PrescriptionDiagnosis   `json:"diagnoses,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Complaints   []PrescriptionComplaint   `json:"complaints,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Histories    []PrescriptionHistory     `json:"histories,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
	Examinations []PrescriptionExamination `json:"examinations,omitempty" gorm:"foreignKey:PrescriptionID;constraint:OnDelete:CASCADE;"`
}

// PrescriptionMedicine represents a single medicine prescribed in a prescription
type PrescriptionMedicine struct {
	gorm.Model
	PrescriptionID uint   `json:"prescription_id" gorm:"not null;index"`
	MedicineName   string `json:"medicine_name" gorm:"not null"`
	Dosage         string `json:"dosage"`
	Duration       string `json:"duration"`
	Instructions   string `json:"instructions"`
	MealTiming     string `json:"meal_timing"` // "before", "after" or "" (not specified)
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

// PrescriptionDiagnosis represents a single diagnosis record for a prescription
type PrescriptionDiagnosis struct {
	gorm.Model
	PrescriptionID uint   `json:"prescription_id" gorm:"not null;index"`
	DiagnosisText  string `json:"diagnosis_text" gorm:"not null"`
}

// PrescriptionComplaint is a chief complaint (C/C): what the patient reports
type PrescriptionComplaint struct {
	gorm.Model
	PrescriptionID uint   `json:"prescription_id" gorm:"not null;index"`
	ComplaintText  string `json:"complaint_text" gorm:"not null"`
}

// PrescriptionHistory is a past-history (P/H) entry: earlier illnesses, surgery, etc.
type PrescriptionHistory struct {
	gorm.Model
	PrescriptionID uint   `json:"prescription_id" gorm:"not null;index"`
	HistoryText    string `json:"history_text" gorm:"not null"`
}

// PrescriptionExamination is an on-examination (O/E) finding: what the doctor
// observes or measures (BP, pulse, weight, thyroid, ...)
type PrescriptionExamination struct {
	gorm.Model
	PrescriptionID  uint   `json:"prescription_id" gorm:"not null;index"`
	ExaminationText string `json:"examination_text" gorm:"not null"`
}

// Clinical template sections
const (
	SectionComplaint   = "cc"
	SectionHistory     = "ph"
	SectionExamination = "oe"
	SectionDiagnosis   = "dx"
)

// ClinicalTemplate is a one-click quick pick for the C/C, P/H, O/E and
// diagnosis sections. Text ending in ":" (e.g. "BP:") is a prefix the doctor
// completes with a value.
type ClinicalTemplate struct {
	gorm.Model
	Section string `json:"section" gorm:"not null;index"`
	Text    string `json:"text" gorm:"not null"`
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

// DoctorProfile represents the doctor's personal and clinic information
type DoctorProfile struct {
	gorm.Model
	DoctorName         string `json:"doctor_name" gorm:"not null"`
	Qualification      string `json:"qualification"`
	Specialization     string `json:"specialization"`
	RegistrationNo     string `json:"registration_no"`
	ClinicName         string `json:"clinic_name"`
	HospitalName       string `json:"hospital_name" gorm:"not null"`
	Address            string `json:"address"`
	Phone              string `json:"phone"`
	Email              string `json:"email"`
	VisitingSchedule   string `json:"visiting_schedule"`
	AppointmentContact string `json:"appointment_contact"`

	// Bangla versions, printed in the right column of the prescription header
	DoctorNameBn         string `json:"doctor_name_bn"`
	QualificationBn      string `json:"qualification_bn"`
	SpecializationBn     string `json:"specialization_bn"`
	RegistrationNoBn     string `json:"registration_no_bn"`
	ClinicNameBn         string `json:"clinic_name_bn"`
	HospitalNameBn       string `json:"hospital_name_bn"`
	AddressBn            string `json:"address_bn"`
	VisitingScheduleBn   string `json:"visiting_schedule_bn"`
	AppointmentContactBn string `json:"appointment_contact_bn"`
}
