package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/dto"
	"github.com/shudipta/rx-desk/backend/internal/models"
)

// ListFavoriteMedicines retrieves all favorite medicines sorted alphabetically
func ListFavoriteMedicines(c *gin.Context) {
	var items []models.FavoriteMedicine
	if err := database.DB.Order("name ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorite medicines"})
		return
	}
	c.JSON(http.StatusOK, dto.MapFavoriteMedicines(items))
}

// ListFavoriteTests retrieves all favorite tests sorted alphabetically
func ListFavoriteTests(c *gin.Context) {
	var items []models.FavoriteTest
	if err := database.DB.Order("name ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorite tests"})
		return
	}
	c.JSON(http.StatusOK, dto.MapFavoriteTests(items))
}

// ListAdviceTemplates retrieves all advice templates sorted alphabetically by title
func ListAdviceTemplates(c *gin.Context) {
	var items []models.AdviceTemplate
	if err := database.DB.Order("title ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch advice templates"})
		return
	}
	c.JSON(http.StatusOK, dto.MapAdviceTemplates(items))
}

// ListFollowupTemplates retrieves all followup templates sorted alphabetically by title
func ListFollowupTemplates(c *gin.Context) {
	var items []models.FollowupTemplate
	if err := database.DB.Order("title ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch followup templates"})
		return
	}
	c.JSON(http.StatusOK, dto.MapFollowupTemplates(items))
}
