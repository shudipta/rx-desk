package database

import (
	"fmt"
	"log"

	"github.com/shudipta/rx-desk/backend/internal/models"
	"gorm.io/gorm"
)

// seedIfEmpty inserts items only when the table has never had rows (deleted
// rows included). Once seeded, the doctor owns the list: deleted templates do
// not come back, and a restart never re-inserts a name that already exists.
func seedIfEmpty[T any](tx *gorm.DB, items []T) error {
	var count int64
	if err := tx.Unscoped().Model(new(T)).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}
	return tx.Create(&items).Error
}

// Seed populates the database with initial seed data in an idempotent manner
func Seed(db *gorm.DB) error {
	log.Println("Seeding database...")

	return db.Transaction(func(tx *gorm.DB) error {
		favoriteMedicines := []models.FavoriteMedicine{}
		for _, name := range []string{
			"Comet", "Bigmet", "Metsa", "Diamicron MR", "Dimerol", "Secrin",
			"Lijenta", "Lijenta-M", "Glipita", "Glipita-M", "Wikitin", "Empazin",
			"Jardiance", "Eltroxin", "Thyrox", "Neomazole", "Thyromazol",
			"Progest", "Artigest", "Cabergol", "Cabaser",
		} {
			favoriteMedicines = append(favoriteMedicines, models.FavoriteMedicine{Name: name})
		}
		if err := seedIfEmpty(tx, favoriteMedicines); err != nil {
			return fmt.Errorf("failed to seed favorite medicines: %w", err)
		}

		favoriteTests := []models.FavoriteTest{}
		for _, name := range []string{
			"TSH", "FT3", "FT4", "FBS", "HbA1c", "Anti-TPO Antibodies", "Prolactin",
			"Testosterone", "LH", "FSH", "DHEA-S", "Cortisol", "ACTH",
			"Lipid Profile", "Serum Insulin",
		} {
			favoriteTests = append(favoriteTests, models.FavoriteTest{Name: name})
		}
		if err := seedIfEmpty(tx, favoriteTests); err != nil {
			return fmt.Errorf("failed to seed favorite tests: %w", err)
		}

		if err := seedIfEmpty(tx, []models.AdviceTemplate{
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
		}); err != nil {
			return fmt.Errorf("failed to seed advice templates: %w", err)
		}

		if err := seedIfEmpty(tx, []models.FollowupTemplate{
			{Title: "2 Weeks", Value: "2 Weeks"},
			{Title: "6 Weeks", Value: "6 Weeks"},
			{Title: "3 Months", Value: "3 Months"},
			{Title: "6 Months", Value: "6 Months"},
			{Title: "12 Months", Value: "12 Months"},
		}); err != nil {
			return fmt.Errorf("failed to seed followup templates: %w", err)
		}

		// Doctor Profile (single row, id=1)
		defaultProfile := models.DoctorProfile{
			Model:              gorm.Model{ID: 1},
			DoctorName:         "Dr. [Doctor's Name]",
			Qualification:      "MD",
			Specialization:     "Senior Endocrinologist & Diabetologist",
			RegistrationNo:     "BMDC/2026/A-12345",
			ClinicName:         "OPD Endocrinology Clinic",
			HospitalName:       "RxDesk Hospital, OPD-1",
			Phone:              "+880-2-1234567",
			VisitingSchedule:   "Sat-Thu: 9AM - 5PM",
			AppointmentContact: "+880-1XXX-XXXXXX",
		}

		var existingProfile models.DoctorProfile
		if err := tx.First(&existingProfile).Error; err != nil {
			if err := tx.Create(&defaultProfile).Error; err != nil {
				return fmt.Errorf("failed to seed doctor profile: %w", err)
			}
			existingProfile = defaultProfile
		} else {
			// Fill in any empty fields with seed defaults (preserves user edits)
			updates := map[string]any{}
			if existingProfile.DoctorName == "" {
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

		log.Println("Seeding completed successfully.")
		return nil
	})
}
