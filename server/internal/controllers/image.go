package controllers

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/auth"
	"github.com/austinbspencer/gshare-server/pkg/images"
	"github.com/austinbspencer/gshare-server/pkg/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

// @Description  Get image by ID.
// @Summary      get an image by ID
// @Tags         Image
// @Produce      json
// @Param        imageID   path       string  true  "Image ID"
// @Security     ApiKeyAuth
// @Success      200        {object}  models.Image
// @Router       /v1/images/{imageID} [get]
func GetImage(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param imageID
	imageID := c.Params("imageID")

	imageQueries := queries.NewImageRepository()

	image, err := imageQueries.GetImageByID(imageID)
	if err != nil || image == nil {
		log.Debugf("No image with ID %s in DB\n", imageID)
		return fiber.NewError(fiber.StatusNotFound, "No image with the given ID")
	}

	// Return success and the individual image
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   image,
	})
}

// @Description  Get all images.
// @Summary      get all images that exist
// @Tags         Image
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200        {object}  []models.Image
// @Router       /v1/images [get]
func GetImages(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	imageQueries := queries.NewImageRepository()

	images, err := imageQueries.GetImages()
	if err != nil {
		log.Errorf("Error retrieving images from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Return success and all images
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   images,
	})
}

// @Description  Get image with specified size.
// @Summary      get an image with the desired width and quality; quality only works with
// the image as jpeg
// @Tags         Image
// @Accept       json
// @Produce      json
// @Param        imageID   path       string  true  "Image ID"
// @Param        width     path       int     true  "Image Width"
// @Param        quality    path       int     true  "Image Quality"
// @Success      200
// @Router       /v1/images/{imageID}/{width}/{quality} [get]
func GetImageSized(c *fiber.Ctx) error {
	// Read the param imageID
	imageID := c.Params("imageID")
	width := c.Params("width")
	quality := c.Params("quality")

	imageQueries := queries.NewImageRepository()

	image, err := imageQueries.GetImageByID(imageID)
	if err != nil || image == nil {
		log.Debugf("No image with ID %s in DB\n", imageID)
		return fiber.NewError(fiber.StatusNotFound, "No image with the given ID")
	}

	var widthInt uint64

	if models.ValidImageSize(models.ImageSize(width)) == false {
		// Convert params to int
		widthInt, err = strconv.ParseUint(width, 10, 32)
		if err != nil {
			log.Errorf("Invalid width given (%s): %v\n", width, err)
			return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
				Status: "fail",
				Data: fiber.Map{
					"width": "Width must be a valid integer.",
				},
			})
		}
	} else {
		// If the width is a valid image size, set the width to the correct value
		if models.ImageSize(width) == models.Web {
			widthInt = uint64(images.WebSizeWidth)
		} else {
			widthInt = uint64(image.Width)
		}
	}

	qualityInt, err := strconv.ParseUint(quality, 10, 32)
	if err != nil {
		log.Errorf("Invalid quality given (%s): %v\n", quality, err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"quality": "Quality must be a valid integer (1-100).",
			},
		})
	}

	// Check which size to get based on the width
	// If the width is less than or equal to web size, return the web size
	// If the width is greater than web size, return original
	imageSize := "original"
	if uint(widthInt) <= uint(images.WebSizeWidth) {
		imageSize = "web"
	}

	imgPath := images.GetImagePath(image.GalleryID, imageSize, image.Filename)

	// Read the image from disk
	imageBytes, err := os.ReadFile(imgPath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resized image not found",
		})
	}

	contentType := utils.GetMimeTypeFromExtension(image.Filename)

	// Resize the image
	resizedImage, err := utils.ResizeImage(imageBytes, uint(widthInt), uint(qualityInt), contentType)
	if err != nil {
		log.Errorf("Unable to resize image: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Error encountered while resizing the image.")
	}

	// Set the headers for the file transfer and return the file
	c.Set("Content-Description", "File Transfer")
	c.Set("Content-Transfer-Encoding", "binary")
	c.Set("Content-Disposition", fmt.Sprintf("inline; filename=%s", image.Filename))
	// No need to get mime type with data received since we set
	// file extension with evaluated mimetype on upload
	c.Set("Content-Type", contentType)
	c.Set("Content-Length", fmt.Sprintf("%d", len(resizedImage)))

	// Get the gallery to set the cache time
	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(fmt.Sprint(image.GalleryID))
	if err != nil || gallery == nil {
		log.Errorf("No gallery with the given ID: %v\n", err)
		return c.Send(resizedImage)
	}

	// Set cache time so we don't repeat processing on each request
	// for the exact same image and dimensions
	// Set the cache time to the expiration time of the gallery
	duration := gallery.Expiration.Sub(time.Now())

	log.Warnf("Setting cache expiration time for image to %s\n", time.Now().Add(duration))

	c.Set("Cache-Time", fmt.Sprint(int(duration.Seconds())))

	return c.Send(resizedImage)
}

// @Description  Delete image by given ID.
// @Summary      remove image by given ID
// @Tags         Image
// @Produce      json
// @Param        imageID   path      string  true  "Image ID"
// @Security     ApiKeyAuth
// @Success      200
// @Router       /v1/images/{imageID} [delete]
func DeleteImage(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param
	imageID := c.Params("imageID")

	imageQueries := queries.NewImageRepository()

	image, err := imageQueries.GetImageByID(imageID)
	if err != nil {
		log.Debugf("No image with ID %s in DB\n", imageID)
		return fiber.NewError(fiber.StatusNotFound, "No image with the given ID")
	}

	galleryID := fmt.Sprint(image.GalleryID)

	// Remove the image from disk
	if err := images.RemoveImage(image.GalleryID, image.Filename); err != nil {
		log.Errorf("Error removing image from gallery directory: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Error removing image from gallery directory.")
	}

	if err := imageQueries.DeleteImage(image); err != nil {
		log.Errorf("Error removing image from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Image removed but not removed from DB.")
	}

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil || gallery == nil {
		log.Warn("Image that was removed was not linked to a valid gallery.")
		// Return success
		return c.JSON(models.APIResponse{
			Status: "success",
			Data:   "Image that was removed was not linked to a valid gallery.",
		})
	}

	if gallery.ZipsReady {
		if err := galleryQueries.SetZipsReady(gallery, false); err != nil {
			log.Errorf("Unable to update ZipsReady field in gallery: %v\n", err)
		}
		log.Debug("Gallery ZipsReady is already set to false, skipping update query.")
	}

	settingsQueries := queries.NewSettingsRepository()
	if err := settingsQueries.SetSettingsUpdate(true); err != nil {
		log.Errorf("Error setting settings update to false: %v\n", err)
	}

	// Return success
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   "Image removed.",
	})
}
