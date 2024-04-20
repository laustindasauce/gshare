package controllers

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/images"
	"github.com/austinbspencer/gshare-server/pkg/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

// @Description  Download image by ID.
// @Summary      download an image by ID
// @Tags         Download
// @Produce      json
// @Param        size      path       string  true  "Image Size"
// @Param        imageID   path       string  true  "Image ID"
// @Success      200        {object}  models.Image
// @Router       /v1/download/{size}/image/{imageID} [get]
func DownloadImage(c *fiber.Ctx) error {
	// Read the param imageID
	size := strings.ToLower(c.Params("size"))
	imageID := c.Params("imageID")
	imageSize := models.ImageSize(size)

	// Check the given size is valid
	if !models.ValidImageSize(imageSize) {
		log.Warnf("Invalid download size was given: %s\n", imageSize)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"size": "Size is not valid. Must be one of (web, original)",
			},
		})
	}

	imageQueries := queries.NewImageRepository()

	image, err := imageQueries.GetImageByID(imageID)
	if err != nil || image == nil {
		log.Error("Image not found for download")
		return fiber.NewError(fiber.StatusNotFound, "No image with the given ID")
	}

	imgPath := images.GetImagePath(image.GalleryID, string(imageSize), image.Filename)

	// Read the image from disk
	imageBytes, err := os.ReadFile(imgPath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Resized image not found",
		})
	}

	_, err = c.Write(imageBytes)
	if err != nil {
		log.Errorf("Caught an error while writing the image for download: %v\n", err)
		// Return status 500 and error message.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	contentType := utils.GetMimeTypeFromExtension(image.Filename)

	log.Debugf("Setting content disposition to %s\n", image.Filename)

	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", image.Filename))
	c.Set("Content-Type", contentType)
	c.Set("Content-Length", fmt.Sprintf("%d", len(imageBytes)))

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(fmt.Sprint(image.GalleryID))
	if err != nil || gallery == nil {
		log.Errorf("No gallery with the given ID: %v\n", err)
		return c.Send(imageBytes)
	}

	// Set cache time so we don't repeat processing on each request
	// for the exact same image download
	// Setting the cache duration as the time until expiration of the gallery
	duration := gallery.Expiration.Sub(time.Now())

	log.Debugf("Setting cache expiration time for image download to %s\n", time.Now().Add(duration))

	c.Set("Cache-Time", fmt.Sprint(int(duration.Seconds())))

	// Return success and the individual image
	return c.Send(imageBytes)
}

// @Description  Download multiple images by ID.
// @Summary      download any number of images in a gallery
// @Tags         Download
// @Produce      json
// @Param        size      path       string  true  "Image Size"
// @Param        imageID   path       string  true  "Comma separated Image IDs"
// @Success      200        {object}  models.Image
// @Router       /v1/download/{size}/images/{imageIDs} [get]
func DownloadImages(c *fiber.Ctx) error {
	// Read the param imageID
	size := strings.ToLower(c.Params("size"))
	imageIDsParam := c.Params("imageIDs")
	imageSize := models.ImageSize(size)

	imageIDsStr := strings.Split(imageIDsParam, ",")
	var imageIDs []uint
	for _, id := range imageIDsStr {
		uintId, err := strconv.ParseUint(id, 10, 64)
		if err != nil {
			log.Errorf("Invalid image ID given to download: %v\n", err)
			continue
		}
		imageIDs = append(imageIDs, uint(uintId))
	}

	// Check the given size is valid
	if !models.ValidImageSize(imageSize) {
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"size": "Size is not valid. Must be one of (web, original)",
			},
		})
	}

	imageQueries := queries.NewImageRepository()

	specificImages, err := imageQueries.GetSpecificImages(imageIDs)
	if err != nil {
		log.Errorf("Unable to find image requested for download: %v\n", err)
		return fiber.NewError(fiber.StatusNotFound, "No image with the given ID")
	}

	if len(specificImages) == 0 {
		log.Warn("No images were found for download.")
		return fiber.NewError(fiber.StatusNotFound, "No images match your request.")
	}

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(fmt.Sprint(specificImages[0].GalleryID))
	if err != nil || gallery == nil {
		log.Errorf("No gallery with the given ID: %v\n", err)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	// Convert the images to an array of filenames
	var imageFilenames []string
	for _, img := range specificImages {
		imageFilenames = append(imageFilenames, img.Filename)
	}

	// Generate the zip on demand
	zipBytes, err := images.GenerateZipOnDemand(gallery.ID, string(imageSize), imageFilenames)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Unable to generate zip file for download.",
		})
	}

	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", gallery.Path+".zip"))
	c.Set("Content-Type", "application/octet-stream")
	c.Set("Content-Length", fmt.Sprintf("%d", len(zipBytes)))

	// Set cache time so we don't repeat processing on each request
	// for the exact same images download
	// Setting the cache duration as the time until expiration of the gallery
	duration := gallery.Expiration.Sub(time.Now())

	log.Debugf("Setting cache time for images download to %s\n", time.Now().Add(duration))

	c.Set("Cache-Time", fmt.Sprint(int(duration.Seconds())))

	// Return success and the zip of images
	return c.Send(zipBytes)
}

// @Description  Download gallery by ID.
// @Summary      download an entire gallery by ID
// @Tags         Download
// @Produce      json
// @Param        size           path       string  true  "Image Size"
// @Param        galleryID      path       string  true  "Gallery ID"
// @Success      200        {object}  models.Image
// @Router       /v1/download/{size}/gallery/{galleryID} [get]
func DownloadGallery(c *fiber.Ctx) error {
	// Read the param galleryID
	size := strings.ToLower(c.Params("size"))
	galleryID := c.Params("galleryID")
	imageSize := models.ImageSize(size)

	// Check the given size is valid
	if !models.ValidImageSize(imageSize) {
		log.Warnf("Invalid download size was given: %s\n", imageSize)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"size": "Size is not valid. Must be one of (web, original)",
			},
		})
	}

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil || gallery == nil {
		log.Warnf("No gallery with the given ID: %v\n", err)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	var fileBytes []byte
	var exists bool = false

	// If the zips are ready, confirm that they actually exist
	if gallery.ZipsReady {
		exists = images.ZipExists(gallery.ID, string(imageSize))
	}

	if !exists {
		log.Warnf("Unable to find zip for gallery: %s\n", galleryID)
		// The zip likely doesn't exist -- Generate the zip on demand
		// We need to get the filenames of all the images in the gallery
		// Convert the images to an array of filenames
		var imageFilenames []string

		for _, img := range gallery.Images {
			imageFilenames = append(imageFilenames, img.Filename)
		}

		fileBytes, err = images.GenerateZipOnDemand(gallery.ID, string(imageSize), imageFilenames)
		if err != nil {
			log.Errorf("Unable to generate zip for gallery: %v\n", err)
			// Return status 500 and error message.
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
	} else {
		fileBytes, err = os.ReadFile(images.GetZipPath(gallery.ID, string(imageSize)))
		if err != nil {
			log.Errorf("Unable to read bytes from zip file: %v\n", err)
			// Return status 500 and error message.
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
	}

	_, err = c.Write(fileBytes)
	if err != nil {
		log.Errorf("Unable to write bytes in response: %v\n", err)
		// Return status 500 and error message.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", gallery.Path+".zip"))
	c.Set("Content-Type", "application/zip")
	c.Set("Content-Length", fmt.Sprintf("%d", len(fileBytes)))

	// Set cache time so we don't repeat processing on each request
	// for the exact same images download
	// Not sure if we want to cache this at all, would mean that if the
	// gallery is updated, the zip would not be updated until the cache
	// time expires or the cache is cleared.
	// Setting the cache duration as the time until expiration of the gallery
	duration := gallery.Expiration.Sub(time.Now())

	log.Debugf("Setting cache time for images download to %s\n", time.Now().Add(duration))

	c.Set("Cache-Time", fmt.Sprint(int(duration.Seconds())))

	// Return success and the zip file
	return c.Send(fileBytes)
}
