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

		// 4. Seed Followup Templates
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
