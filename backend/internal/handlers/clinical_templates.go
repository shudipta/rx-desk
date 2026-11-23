package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/dto"
	"github.com/shudipta/rx-desk/backend/internal/models"
)

// Clinical templates: one-click quick picks for the C/C, P/H, O/E and
// diagnosis sections, stored in one table keyed by section.

type clinicalTemplateInput struct {
	Section string `json:"section" binding:"required,oneof=cc ph oe dx"`
	Text    string `json:"text" binding:"required"`
}

// ListClinicalTemplates returns all templates, or one section with ?section=
func ListClinicalTemplates(c *gin.Context) {
	q := database.DB.Order("section, id")
	if section := c.Query("section"); section != "" {
		q = q.Where("section = ?", section)
	}
	var items []models.ClinicalTemplate
	if err := q.Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch clinical templates"})
		return
	}
	c.JSON(http.StatusOK, dto.MapClinicalTemplates(items))
}

func CreateClinicalTemplate(c *gin.Context) {
	var input clinicalTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item := models.ClinicalTemplate{Section: input.Section, Text: strings.TrimSpace(input.Text)}
	if err := database.DB.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create clinical template"})
		return
	}
	c.JSON(http.StatusCreated, dto.MapClinicalTemplate(item))
}

func UpdateClinicalTemplate(c *gin.Context) {
	var item models.ClinicalTemplate
	if err := database.DB.First(&item, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Clinical template not found"})
		return
	}
	var input clinicalTemplateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	item.Section = input.Section
	item.Text = strings.TrimSpace(input.Text)
	if err := database.DB.Save(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update clinical template"})
		return
	}
	c.JSON(http.StatusOK, dto.MapClinicalTemplate(item))
}

func DeleteClinicalTemplate(c *gin.Context) {
	if err := database.DB.Delete(&models.ClinicalTemplate{}, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete clinical template"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Deleted"})
}
