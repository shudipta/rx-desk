package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/dto"
	"github.com/shudipta/rx-desk/backend/internal/models"
)

type DoctorProfileInput struct {
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

func GetDoctorProfile(c *gin.Context) {
	var profile models.DoctorProfile
	if err := database.DB.First(&profile).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor profile not found"})
		return
	}
	c.JSON(http.StatusOK, dto.MapDoctorProfile(profile))
}

// UpdateDoctorProfile upserts the single-row profile (id=1)
func UpdateDoctorProfile(c *gin.Context) {
	var input DoctorProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var profile models.DoctorProfile
	if err := database.DB.First(&profile).Error; err != nil {
		profile.ID = 1
	}

	profile.DoctorName = input.DoctorName
	profile.Qualification = input.Qualification
	profile.Specialization = input.Specialization
	profile.RegistrationNo = input.RegistrationNo
	profile.ClinicName = input.ClinicName
	profile.HospitalName = input.HospitalName
	profile.Address = input.Address
	profile.Phone = input.Phone
	profile.Email = input.Email
	profile.VisitingSchedule = input.VisitingSchedule
	profile.AppointmentContact = input.AppointmentContact
	profile.DoctorNameBn = input.DoctorNameBn
	profile.QualificationBn = input.QualificationBn
	profile.SpecializationBn = input.SpecializationBn
	profile.RegistrationNoBn = input.RegistrationNoBn
	profile.ClinicNameBn = input.ClinicNameBn
	profile.HospitalNameBn = input.HospitalNameBn
	profile.AddressBn = input.AddressBn
	profile.VisitingScheduleBn = input.VisitingScheduleBn
	profile.AppointmentContactBn = input.AppointmentContactBn

	// Save inserts when ID has no row yet and updates otherwise
	if err := database.DB.Save(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save doctor profile"})
		return
	}
	c.JSON(http.StatusOK, dto.MapDoctorProfile(profile))
}
