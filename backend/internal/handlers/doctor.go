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
}

func GetDoctorProfile(c *gin.Context) {
	var profile models.DoctorProfile
	if err := database.DB.First(&profile).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Doctor profile not found"})
		return
	}
	c.JSON(http.StatusOK, dto.MapDoctorProfile(profile))
}

func UpdateDoctorProfile(c *gin.Context) {
	var input DoctorProfileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var profile models.DoctorProfile
	if err := database.DB.First(&profile).Error; err != nil {
		// Create new profile with id=1
		profile = models.DoctorProfile{
			DoctorName:         input.DoctorName,
			Qualification:      input.Qualification,
			Specialization:     input.Specialization,
			RegistrationNo:     input.RegistrationNo,
			ClinicName:         input.ClinicName,
			HospitalName:       input.HospitalName,
			Address:            input.Address,
			Phone:              input.Phone,
			Email:              input.Email,
			VisitingSchedule:   input.VisitingSchedule,
			AppointmentContact: input.AppointmentContact,
		}
		profile.ID = 1
		if err := database.DB.Create(&profile).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create doctor profile"})
			return
		}
	} else {
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
		if err := database.DB.Save(&profile).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update doctor profile"})
			return
		}
	}

	c.JSON(http.StatusOK, dto.MapDoctorProfile(profile))
}
