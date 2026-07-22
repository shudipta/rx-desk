package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/models"
)

// Favorite Medicine CRUD

func ListFavoriteMedicines(c *gin.Context) {
	var items []models.FavoriteMedicine
	if err := database.DB.Order("name ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorite medicines"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func CreateFavoriteMedicine(c *gin.Context) {
	var input struct{ Name string `json:"name" binding:"required"` }
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item := models.FavoriteMedicine{Name: input.Name}
	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create favorite medicine"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func UpdateFavoriteMedicine(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var item models.FavoriteMedicine
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Favorite medicine not found"})
		return
	}
	var input struct{ Name string `json:"name" binding:"required"` }
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.Name = input.Name
	if err := database.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update favorite medicine"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func DeleteFavoriteMedicine(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.FavoriteMedicine{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete favorite medicine"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Favorite Test CRUD

func ListFavoriteTests(c *gin.Context) {
	var items []models.FavoriteTest
	if err := database.DB.Order("name ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch favorite tests"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func CreateFavoriteTest(c *gin.Context) {
	var input struct{ Name string `json:"name" binding:"required"` }
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item := models.FavoriteTest{Name: input.Name}
	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create favorite test"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func UpdateFavoriteTest(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var item models.FavoriteTest
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Favorite test not found"})
		return
	}
	var input struct{ Name string `json:"name" binding:"required"` }
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.Name = input.Name
	if err := database.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update favorite test"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func DeleteFavoriteTest(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.FavoriteTest{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete favorite test"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Advice Template CRUD

func ListAdviceTemplates(c *gin.Context) {
	var items []models.AdviceTemplate
	if err := database.DB.Order("title ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch advice templates"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func CreateAdviceTemplate(c *gin.Context) {
	var input struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item := models.AdviceTemplate{Title: input.Title, Content: input.Content}
	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create advice template"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func UpdateAdviceTemplate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var item models.AdviceTemplate
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Advice template not found"})
		return
	}
	var input struct {
		Title   string `json:"title" binding:"required"`
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.Title = input.Title
	item.Content = input.Content
	if err := database.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update advice template"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func DeleteAdviceTemplate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.AdviceTemplate{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete advice template"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}

// Followup Template CRUD

func ListFollowupTemplates(c *gin.Context) {
	var items []models.FollowupTemplate
	if err := database.DB.Order("title ASC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch followup templates"})
		return
	}
	c.JSON(http.StatusOK, items)
}

func CreateFollowupTemplate(c *gin.Context) {
	var input struct {
		Title string `json:"title" binding:"required"`
		Value string `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item := models.FollowupTemplate{Title: input.Title, Value: input.Value}
	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create followup template"})
		return
	}
	c.JSON(http.StatusCreated, item)
}

func UpdateFollowupTemplate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	var item models.FollowupTemplate
	if err := database.DB.First(&item, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Followup template not found"})
		return
	}
	var input struct {
		Title string `json:"title" binding:"required"`
		Value string `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.Title = input.Title
	item.Value = input.Value
	if err := database.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update followup template"})
		return
	}
	c.JSON(http.StatusOK, item)
}

func DeleteFollowupTemplate(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := database.DB.Delete(&models.FollowupTemplate{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete followup template"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
