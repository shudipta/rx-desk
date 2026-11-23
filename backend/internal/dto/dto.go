package dto

import (
	"time"

	"github.com/shudipta/rx-desk/backend/internal/models"
)

type PatientDTO struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	Age    int    `json:"age"`
	Gender string `json:"gender"`
	Phone  string `json:"phone"`
}

type PrescriptionDTO struct {
	ID           uint                         `json:"id"`
	Title        string                       `json:"title"`
	VisitType    string                       `json:"visit_type"`
	Followup     string                       `json:"followup"`
	Notes        string                       `json:"notes"`
	CreatedAt    time.Time                    `json:"created_at"`
	Patient      *PatientDTO                  `json:"patient,omitempty"`
	Medicines    []PrescriptionMedicineDTO    `json:"medicines,omitempty"`
	Tests        []PrescriptionTestDTO        `json:"tests,omitempty"`
	Advices      []PrescriptionAdviceDTO      `json:"advices,omitempty"`
	Diagnoses    []PrescriptionDiagnosisDTO   `json:"diagnoses,omitempty"`
	Complaints   []PrescriptionComplaintDTO   `json:"complaints"`
	Histories    []PrescriptionHistoryDTO     `json:"histories"`
	Examinations []PrescriptionExaminationDTO `json:"examinations"`
}

type PrescriptionComplaintDTO struct {
	ID            uint   `json:"id"`
	ComplaintText string `json:"complaint_text"`
}

type PrescriptionHistoryDTO struct {
	ID          uint   `json:"id"`
	HistoryText string `json:"history_text"`
}

type PrescriptionExaminationDTO struct {
	ID              uint   `json:"id"`
	ExaminationText string `json:"examination_text"`
}

type ClinicalTemplateDTO struct {
	ID      uint   `json:"id"`
	Section string `json:"section"`
	Text    string `json:"text"`
}

type PrescriptionMedicineDTO struct {
	ID           uint   `json:"id"`
	MedicineName string `json:"medicine_name"`
	Dosage       string `json:"dosage"`
	Duration     string `json:"duration"`
	Instructions string `json:"instructions"`
	MealTiming   string `json:"meal_timing"`
}

type PrescriptionTestDTO struct {
	ID       uint   `json:"id"`
	TestName string `json:"test_name"`
}

type PrescriptionAdviceDTO struct {
	ID         uint   `json:"id"`
	AdviceText string `json:"advice_text"`
}

type PrescriptionDiagnosisDTO struct {
	ID            uint   `json:"id"`
	DiagnosisText string `json:"diagnosis_text"`
}

type PatientPrescriptionDTO struct {
	ID        uint      `json:"id"`
	Title     string    `json:"title"`
	VisitType string    `json:"visit_type"`
	Followup  string    `json:"followup"`
	CreatedAt time.Time `json:"created_at"`
}

type FavoriteMedicineDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type FavoriteTestDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type AdviceTemplateDTO struct {
	ID      uint   `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

type FollowupTemplateDTO struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
	Value string `json:"value"`
}

// MapPatient maps a models.Patient into PatientDTO
func MapPatient(p models.Patient) PatientDTO {
	return PatientDTO{
		ID:     p.ID,
		Name:   p.Name,
		Age:    p.Age,
		Gender: p.Gender,
		Phone:  p.Phone,
	}
}

// MapPatients maps a slice of models.Patient into a slice of PatientDTO
func MapPatients(patients []models.Patient) []PatientDTO {
	dtos := make([]PatientDTO, len(patients))
	for i, p := range patients {
		dtos[i] = MapPatient(p)
	}
	return dtos
}

// MapPrescription maps a models.Prescription into PrescriptionDTO
func MapPrescription(p models.Prescription) PrescriptionDTO {
	var patientDTO *PatientDTO
	if p.Patient != nil {
		pDTO := MapPatient(*p.Patient)
		patientDTO = &pDTO
	}

	var medicineDTOs []PrescriptionMedicineDTO
	if len(p.Medicines) > 0 {
		medicineDTOs = make([]PrescriptionMedicineDTO, len(p.Medicines))
		for i, m := range p.Medicines {
			medicineDTOs[i] = PrescriptionMedicineDTO{
				ID:           m.ID,
				MedicineName: m.MedicineName,
				Dosage:       m.Dosage,
				Duration:     m.Duration,
				Instructions: m.Instructions,
				MealTiming:   m.MealTiming,
			}
		}
	} else {
		medicineDTOs = []PrescriptionMedicineDTO{}
	}

	var testDTOs []PrescriptionTestDTO
	if len(p.Tests) > 0 {
		testDTOs = make([]PrescriptionTestDTO, len(p.Tests))
		for i, t := range p.Tests {
			testDTOs[i] = PrescriptionTestDTO{
				ID:       t.ID,
				TestName: t.TestName,
			}
		}
	} else {
		testDTOs = []PrescriptionTestDTO{}
	}

	var adviceDTOs []PrescriptionAdviceDTO
	if len(p.Advices) > 0 {
		adviceDTOs = make([]PrescriptionAdviceDTO, len(p.Advices))
		for i, a := range p.Advices {
			adviceDTOs[i] = PrescriptionAdviceDTO{
				ID:         a.ID,
				AdviceText: a.AdviceText,
			}
		}
	} else {
		adviceDTOs = []PrescriptionAdviceDTO{}
	}

	var diagnosisDTOs []PrescriptionDiagnosisDTO
	if len(p.Diagnoses) > 0 {
		diagnosisDTOs = make([]PrescriptionDiagnosisDTO, len(p.Diagnoses))
		for i, d := range p.Diagnoses {
			diagnosisDTOs[i] = PrescriptionDiagnosisDTO{
				ID:            d.ID,
				DiagnosisText: d.DiagnosisText,
			}
		}
	} else {
		diagnosisDTOs = []PrescriptionDiagnosisDTO{}
	}

	return PrescriptionDTO{
		ID:        p.ID,
		Title:     p.Title,
		VisitType: p.VisitType,
		Followup:  p.Followup,
		CreatedAt: p.CreatedAt,
		Notes:     p.Notes,
		Patient:   patientDTO,
		Medicines: medicineDTOs,
		Tests:     testDTOs,
		Advices:   adviceDTOs,
		Diagnoses: diagnosisDTOs,
		Complaints: mapItems(p.Complaints, func(x models.PrescriptionComplaint) PrescriptionComplaintDTO {
			return PrescriptionComplaintDTO{ID: x.ID, ComplaintText: x.ComplaintText}
		}),
		Histories: mapItems(p.Histories, func(x models.PrescriptionHistory) PrescriptionHistoryDTO {
			return PrescriptionHistoryDTO{ID: x.ID, HistoryText: x.HistoryText}
		}),
		Examinations: mapItems(p.Examinations, func(x models.PrescriptionExamination) PrescriptionExaminationDTO {
			return PrescriptionExaminationDTO{ID: x.ID, ExaminationText: x.ExaminationText}
		}),
	}
}

// mapItems maps a slice, always returning a non-nil slice so JSON gets [] not null
func mapItems[T, D any](items []T, f func(T) D) []D {
	out := make([]D, len(items))
	for i, x := range items {
		out[i] = f(x)
	}
	return out
}

func MapFavoriteMedicine(x models.FavoriteMedicine) FavoriteMedicineDTO {
	return FavoriteMedicineDTO{ID: x.ID, Name: x.Name}
}

func MapFavoriteTest(x models.FavoriteTest) FavoriteTestDTO {
	return FavoriteTestDTO{ID: x.ID, Name: x.Name}
}

func MapAdviceTemplate(x models.AdviceTemplate) AdviceTemplateDTO {
	return AdviceTemplateDTO{ID: x.ID, Title: x.Title, Content: x.Content}
}

func MapFollowupTemplate(x models.FollowupTemplate) FollowupTemplateDTO {
	return FollowupTemplateDTO{ID: x.ID, Title: x.Title, Value: x.Value}
}

func MapClinicalTemplate(x models.ClinicalTemplate) ClinicalTemplateDTO {
	return ClinicalTemplateDTO{ID: x.ID, Section: x.Section, Text: x.Text}
}

func MapClinicalTemplates(items []models.ClinicalTemplate) []ClinicalTemplateDTO {
	return mapItems(items, MapClinicalTemplate)
}

// MapPatientPrescription maps a single models.Prescription to PatientPrescriptionDTO
func MapPatientPrescription(p models.Prescription) PatientPrescriptionDTO {
	return PatientPrescriptionDTO{
		ID:        p.ID,
		Title:     p.Title,
		VisitType: p.VisitType,
		Followup:  p.Followup,
		CreatedAt: p.CreatedAt,
	}
}

// MapPatientPrescriptions maps a slice of models.Prescription to a slice of PatientPrescriptionDTO
func MapPatientPrescriptions(prescriptions []models.Prescription) []PatientPrescriptionDTO {
	dtos := make([]PatientPrescriptionDTO, len(prescriptions))
	for i, p := range prescriptions {
		dtos[i] = MapPatientPrescription(p)
	}
	return dtos
}

// MapFavoriteMedicines maps a slice of models.FavoriteMedicine into a slice of FavoriteMedicineDTO
func MapFavoriteMedicines(items []models.FavoriteMedicine) []FavoriteMedicineDTO {
	dtos := make([]FavoriteMedicineDTO, len(items))
	for i, item := range items {
		dtos[i] = FavoriteMedicineDTO{
			ID:   item.ID,
			Name: item.Name,
		}
	}
	return dtos
}

// MapFavoriteTests maps a slice of models.FavoriteTest into a slice of FavoriteTestDTO
func MapFavoriteTests(items []models.FavoriteTest) []FavoriteTestDTO {
	dtos := make([]FavoriteTestDTO, len(items))
	for i, item := range items {
		dtos[i] = FavoriteTestDTO{
			ID:   item.ID,
			Name: item.Name,
		}
	}
	return dtos
}

// MapAdviceTemplates maps a slice of models.AdviceTemplate into a slice of AdviceTemplateDTO
func MapAdviceTemplates(items []models.AdviceTemplate) []AdviceTemplateDTO {
	dtos := make([]AdviceTemplateDTO, len(items))
	for i, item := range items {
		dtos[i] = AdviceTemplateDTO{
			ID:      item.ID,
			Title:   item.Title,
			Content: item.Content,
		}
	}
	return dtos
}

// MapFollowupTemplates maps a slice of models.FollowupTemplate into a slice of FollowupTemplateDTO
func MapFollowupTemplates(items []models.FollowupTemplate) []FollowupTemplateDTO {
	dtos := make([]FollowupTemplateDTO, len(items))
	for i, item := range items {
		dtos[i] = FollowupTemplateDTO{
			ID:    item.ID,
			Title: item.Title,
			Value: item.Value,
		}
	}
	return dtos
}

type DoctorProfileDTO struct {
	ID                 uint   `json:"id"`
	DoctorName         string `json:"doctor_name"`
	Qualification      string `json:"qualification"`
	Specialization     string `json:"specialization"`
	RegistrationNo     string `json:"registration_no"`
	ClinicName         string `json:"clinic_name"`
	HospitalName       string `json:"hospital_name"`
	Address            string `json:"address"`
	Phone              string `json:"phone"`
	Email              string `json:"email"`
	VisitingSchedule   string `json:"visiting_schedule"`
	AppointmentContact string `json:"appointment_contact"`
}

func MapDoctorProfile(p models.DoctorProfile) DoctorProfileDTO {
	return DoctorProfileDTO{
		ID:                 p.ID,
		DoctorName:         p.DoctorName,
		Qualification:      p.Qualification,
		Specialization:     p.Specialization,
		RegistrationNo:     p.RegistrationNo,
		ClinicName:         p.ClinicName,
		HospitalName:       p.HospitalName,
		Address:            p.Address,
		Phone:              p.Phone,
		Email:              p.Email,
		VisitingSchedule:   p.VisitingSchedule,
		AppointmentContact: p.AppointmentContact,
	}
}
