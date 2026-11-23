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

		// Advice is printed for the patient, so the content is in Bangla
		adviceSeeds := []struct{ title, oldContent, content string }{
			{
				title: "Diabetes Advice",
				oldContent: `- Low carbohydrate diet
- Regular exercise
- Weight reduction
- Avoid sugary foods
- Monitor blood glucose regularly`,
				content: `- শর্করা জাতীয় খাবার কম খাবেন
- নিয়মিত ব্যায়াম করবেন
- ওজন কমাবেন
- চিনি ও মিষ্টি জাতীয় খাবার খাবেন না
- নিয়মিত রক্তের গ্লুকোজ পরীক্ষা করবেন`,
			},
			{
				title: "Thyroid Advice",
				oldContent: `- Take medicine on an empty stomach
- Take medication at the same time daily
- Follow-up thyroid function tests regularly`,
				content: `- ঔষধ খালি পেটে খাবেন
- প্রতিদিন একই সময়ে ঔষধ খাবেন
- নিয়মিত থাইরয়েড পরীক্ষা করাবেন`,
			},
			{
				title: "PCOS Advice",
				oldContent: `- Weight management
- Regular exercise
- Healthy diet
- Adequate sleep`,
				content: `- ওজন নিয়ন্ত্রণে রাখবেন
- নিয়মিত ব্যায়াম করবেন
- স্বাস্থ্যকর খাবার খাবেন
- পর্যাপ্ত ঘুমাবেন`,
			},
			{
				title: "Obesity Advice",
				oldContent: `- Calorie controlled diet
- Daily physical activity
- Weight monitoring`,
				content: `- পরিমিত ক্যালরির খাবার খাবেন
- প্রতিদিন শারীরিক পরিশ্রম করবেন
- নিয়মিত ওজন মাপবেন`,
			},
		}
		adviceTemplates := []models.AdviceTemplate{}
		for _, a := range adviceSeeds {
			adviceTemplates = append(adviceTemplates, models.AdviceTemplate{Title: a.title, Content: a.content})
		}
		if err := seedIfEmpty(tx, adviceTemplates); err != nil {
			return fmt.Errorf("failed to seed advice templates: %w", err)
		}
		// Switch the original English seeds to Bangla, but only while the doctor
		// has not edited them; a changed template is left alone.
		for _, a := range adviceSeeds {
			if err := tx.Model(&models.AdviceTemplate{}).
				Where("title = ? AND content = ?", a.title, a.oldContent).
				Update("content", a.content).Error; err != nil {
				return fmt.Errorf("failed to translate advice template %q: %w", a.title, err)
			}
		}

		// Follow-up is printed for the patient, so it is in Bangla
		followupSeeds := []struct{ old, bn string }{
			{"2 Weeks", "২ সপ্তাহ পর"},
			{"6 Weeks", "৬ সপ্তাহ পর"},
			{"3 Months", "৩ মাস পর"},
			{"6 Months", "৬ মাস পর"},
			{"12 Months", "১২ মাস পর"},
		}
		followupTemplates := []models.FollowupTemplate{}
		for _, f := range followupSeeds {
			followupTemplates = append(followupTemplates, models.FollowupTemplate{Title: f.bn, Value: f.bn})
		}
		if err := seedIfEmpty(tx, followupTemplates); err != nil {
			return fmt.Errorf("failed to seed followup templates: %w", err)
		}
		// Switch the original English seeds to Bangla while the doctor has not edited them
		for _, f := range followupSeeds {
			if err := tx.Model(&models.FollowupTemplate{}).
				Where("title = ? AND value = ?", f.old, f.old).
				Updates(map[string]any{"title": f.bn, "value": f.bn}).Error; err != nil {
				return fmt.Errorf("failed to translate followup template %q: %w", f.old, err)
			}
		}

		// Clinical quick picks. Text ending in ":" is a prefix the doctor completes.
		clinical := []models.ClinicalTemplate{}
		add := func(section string, texts ...string) {
			for _, t := range texts {
				clinical = append(clinical, models.ClinicalTemplate{Section: section, Text: t})
			}
		}
		add(models.SectionComplaint,
			"Polyuria", "Polydipsia", "Weight loss", "Weight gain", "Fatigue",
			"Neck swelling", "Palpitation", "Heat intolerance", "Cold intolerance",
			"Irregular menstruation", "Excess facial hair", "Tingling of hands & feet",
		)
		add(models.SectionHistory,
			"Known case of T2DM", "Hypertension", "Hypothyroidism", "IHD", "CKD",
			"Bronchial asthma", "Thyroid surgery", "No significant past illness",
		)
		add(models.SectionExamination,
			"BP:", "Pulse:", "Weight (kg):", "Height (cm):", "BMI:",
			"Thyroid:", "Acanthosis nigricans", "Anaemia: absent", "Oedema: absent",
		)
		add(models.SectionDiagnosis,
			"Type 2 Diabetes Mellitus", "Prediabetes", "Hypothyroidism",
			"Hyperthyroidism (Graves' disease)", "PCOS", "Obesity", "Dyslipidaemia",
			"Hypertension", "Hyperprolactinaemia", "Vitamin D deficiency",
		)
		if err := seedIfEmpty(tx, clinical); err != nil {
			return fmt.Errorf("failed to seed clinical templates: %w", err)
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
		bangla := map[string]any{
			"doctor_name_bn":         "ডাঃ [ডাক্তারের নাম]",
			"qualification_bn":       "এমডি",
			"specialization_bn":      "হরমোন ও ডায়াবেটিস রোগ বিশেষজ্ঞ",
			"clinic_name_bn":         "ওপিডি এন্ডোক্রাইনোলজি ক্লিনিক",
			"hospital_name_bn":       "আরএক্সডেস্ক হাসপাতাল, ওপিডি-১",
			"visiting_schedule_bn":   "শনি-বৃহস্পতি: সকাল ৯টা - বিকাল ৫টা",
			"appointment_contact_bn": "+৮৮০-১XXX-XXXXXX",
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

		// Bangla placeholders only while every Bangla field is still empty, so a
		// field the doctor clears on purpose stays cleared.
		p := existingProfile
		if p.DoctorNameBn == "" && p.QualificationBn == "" && p.SpecializationBn == "" &&
			p.ClinicNameBn == "" && p.HospitalNameBn == "" && p.AddressBn == "" &&
			p.VisitingScheduleBn == "" && p.AppointmentContactBn == "" {
			if err := tx.Model(&models.DoctorProfile{}).Where("id = ?", p.ID).Updates(bangla).Error; err != nil {
				return fmt.Errorf("failed to seed Bangla doctor profile: %w", err)
			}
		}

		log.Println("Seeding completed successfully.")
		return nil
	})
}
