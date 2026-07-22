package database

import (
	"fmt"
	"log"

	"github.com/shudipta/rx-desk/backend/internal/models"
	"gorm.io/gorm"
)

// Seed populates the database with initial seed data in an idempotent manner
func Seed(db *gorm.DB) error {
	log.Println("Seeding database...")

	return db.Transaction(func(tx *gorm.DB) error {
		// 1. Seed Favorite Medicines
		favoriteMedicines := []models.FavoriteMedicine{
			{Name: "Comet"},
			{Name: "Bigmet"},
			{Name: "Metsa"},
			{Name: "Diamicron MR"},
			{Name: "Dimerol"},
			{Name: "Secrin"},
			{Name: "Lijenta"},
			{Name: "Lijenta-M"},
			{Name: "Glipita"},
			{Name: "Glipita-M"},
			{Name: "Wikitin"},
			{Name: "Empazin"},
			{Name: "Jardiance"},
			{Name: "Eltroxin"},
			{Name: "Thyrox"},
			{Name: "Neomazole"},
			{Name: "Thyromazol"},
			{Name: "Progest"},
			{Name: "Artigest"},
			{Name: "Cabergol"},
			{Name: "Cabaser"},
		}

		for _, item := range favoriteMedicines {
			var medicine models.FavoriteMedicine
			if err := tx.Where(models.FavoriteMedicine{Name: item.Name}).FirstOrCreate(&medicine).Error; err != nil {
				return fmt.Errorf("failed to seed favorite medicine %s: %w", item.Name, err)
			}
		}

		// 2. Seed Favorite Tests
		favoriteTests := []models.FavoriteTest{
			{Name: "TSH"},
			{Name: "FT3"},
			{Name: "FT4"},
			{Name: "FBS"},
			{Name: "HbA1c"},
			{Name: "Anti-TPO Antibodies"},
			{Name: "Prolactin"},
			{Name: "Testosterone"},
			{Name: "LH"},
			{Name: "FSH"},
			{Name: "DHEA-S"},
			{Name: "Cortisol"},
			{Name: "ACTH"},
			{Name: "Lipid Profile"},
			{Name: "Serum Insulin"},
		}

		for _, item := range favoriteTests {
			var test models.FavoriteTest
			if err := tx.Where(models.FavoriteTest{Name: item.Name}).FirstOrCreate(&test).Error; err != nil {
				return fmt.Errorf("failed to seed favorite test %s: %w", item.Name, err)
			}
		}

		// 3. Seed Advice Templates
		adviceTemplates := []models.AdviceTemplate{
			{
				Title: "Diabetes Advice",
				Content: `- Low carbohydrate diet
- Regular exercise
- Weight reduction
- Avoid sugary foods
- Monitor blood glucose regularly`,
			},
			{
				Title: "Thyroid Advice",
				Content: `- Take medicine on an empty stomach
- Take medication at the same time daily
- Follow-up thyroid function tests regularly`,
			},
			{
				Title: "PCOS Advice",
				Content: `- Weight management
- Regular exercise
- Healthy diet
- Adequate sleep`,
			},
			{
				Title: "Obesity Advice",
				Content: `- Calorie controlled diet
- Daily physical activity
- Weight monitoring`,
			},
		}

		for _, item := range adviceTemplates {
			var advice models.AdviceTemplate
			if err := tx.Where(models.AdviceTemplate{Title: item.Title}).Attrs(models.AdviceTemplate{Content: item.Content}).FirstOrCreate(&advice).Error; err != nil {
				return fmt.Errorf("failed to seed advice template %s: %w", item.Title, err)
			}
		}

		// 4. Seed Doctor Profile (single row, id=1) — upsert: fills in any new fields
		defaultProfile := models.DoctorProfile{
			Model:              gorm.Model{ID: 1},
			DoctorName:         "Dr. [Doctor's Name]",
			Qualification:      "MD",
			Specialization:     "Senior Endocrinologist & Diabetologist",
			RegistrationNo:     "BMDC/2026/A-12345",
			ClinicName:         "OPD Endocrinology Clinic",
			HospitalName:       "RxDesk Hospital, OPD-1",
			Address:            "",
			Phone:              "+880-2-1234567",
			Email:              "",
			VisitingSchedule:   "Sat-Thu: 9AM - 5PM",
			AppointmentContact: "+880-1XXX-XXXXXX",
		}
		var existingProfile models.DoctorProfile
		if err := tx.First(&existingProfile).Error; err != nil {
			if err := tx.Create(&defaultProfile).Error; err != nil {
				return fmt.Errorf("failed to seed doctor profile: %w", err)
			}
		} else {
			// Fill in any empty fields with seed defaults (preserves user edits)
			updates := map[string]interface{}{}
			if existingProfile.DoctorName == "" || existingProfile.DoctorName == "Dr. [Doctor's Name]" {
				updates["doctor_name"] = defaultProfile.DoctorName
			}
			if existingProfile.Qualification == "" {
				updates["qualification"] = defaultProfile.Qualification
			}
			if existingProfile.Specialization == "" {
				updates["specialization"] = defaultProfile.Specialization
			}
			if existingProfile.RegistrationNo == "" {
				updates["registration_no"] = defaultProfile.RegistrationNo
			}
			if existingProfile.HospitalName == "" {
				updates["hospital_name"] = defaultProfile.HospitalName
			}
			if existingProfile.Phone == "" {
				updates["phone"] = defaultProfile.Phone
			}
			if existingProfile.VisitingSchedule == "" {
				updates["visiting_schedule"] = defaultProfile.VisitingSchedule
			}
			if existingProfile.AppointmentContact == "" {
				updates["appointment_contact"] = defaultProfile.AppointmentContact
			}
			if len(updates) > 0 {
				if err := tx.Model(&existingProfile).Updates(updates).Error; err != nil {
					return fmt.Errorf("failed to update seed doctor profile: %w", err)
				}
			}
		}

		// 5. Seed Followup Templates
		followupTemplates := []models.FollowupTemplate{
			{Title: "2 Weeks", Value: "2 Weeks"},
			{Title: "6 Weeks", Value: "6 Weeks"},
			{Title: "3 Months", Value: "3 Months"},
			{Title: "6 Months", Value: "6 Months"},
			{Title: "12 Months", Value: "12 Months"},
		}

		for _, item := range followupTemplates {
			var followup models.FollowupTemplate
			if err := tx.Where(models.FollowupTemplate{Title: item.Title}).Attrs(models.FollowupTemplate{Value: item.Value}).FirstOrCreate(&followup).Error; err != nil {
				return fmt.Errorf("failed to seed followup template %s: %w", item.Title, err)
			}
		}

		log.Println("Seeding completed successfully.")
		return nil
	})
}
