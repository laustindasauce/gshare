package controllers

import (
	"fmt"
	"image"
	"image/png"
	"os"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/auth"
	"github.com/austinbspencer/gshare-server/pkg/images"
	"github.com/austinbspencer/gshare-server/pkg/utils"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/skip2/go-qrcode"
)

// @Description  Create a new gallery.
// @Summary      create a new gallery
// @Tags         Gallery
// @Accept       json
// @Produce      json
// @Param   	 payload   body    models.Gallery    false  "New Gallery"
// @Security     ApiKeyAuth
// @Success      201        {object}  models.Gallery
// @Router       /v1/galleries [post]
func CreateGallery(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	gallery := new(models.Gallery)

	// Store the body in the gallery and return error if encountered
	if err := c.BodyParser(gallery); err != nil {
		log.Errorf("Unable to parse new gallery: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"issue": err.Error(),
			},
		})
	}

	galleryQueries := queries.NewGalleryRepository()

	if err := galleryQueries.CreateNewGallery(gallery); err != nil {
		log.Errorf("Unable to create new gallery in DB: %v\n", err)
		// Return status 500 and error message.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	settingsQueries := queries.NewSettingsRepository()
	if err := settingsQueries.SetSettingsUpdate(true); err != nil {
		log.Errorf("Error setting settings update to false: %v\n", err)
	}

	// Return the created gallery
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   gallery,
	})
}

// @Description  Get all galleries.
// @Summary      get all galleries that exist
// @Tags         Gallery
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200        {object}  []models.Gallery
// @Router       /v1/galleries [get]
func GetGalleries(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	galleryQueries := queries.NewGalleryRepository()

	galleries, err := galleryQueries.GetGalleries()
	if err != nil {
		log.Errorf("Error retrieving galleries from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Set the images count for each gallery
	for idx := range galleries {
		count, err := galleryQueries.GetGalleryImagesCount(galleries[idx].ID)
		if err != nil {
			log.Errorf("Error retrieving images count for gallery: %v\n", err)
		} else {
			galleries[idx].ImagesCount = count
		}
	}

	// Return success and all galleries
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   galleries,
	})
}

// @Description  Get all public galleries.
// @Summary      get all galleries that are public and live
// @Tags         Gallery
// @Produce      json
// @Success      200        {object}  []models.Gallery
// @Router       /v1/galleries/public [get]
func GetPublicGalleries(c *fiber.Ctx) error {
	galleryQueries := queries.NewGalleryRepository()

	galleries, err := galleryQueries.GetPublicGalleries()
	if err != nil {
		log.Errorf("Error retrieving public galleries from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Set the images count for each gallery
	for idx := range galleries {
		count, err := galleryQueries.GetGalleryImagesCount(galleries[idx].ID)
		if err != nil {
			log.Errorf("Error retrieving images count for gallery: %v\n", err)
		} else {
			galleries[idx].ImagesCount = count
		}

		// If featured image isn't set, set a random image as featured
		if galleries[idx].FeaturedImage.ID == 0 {
			log.Debugf("No featured image set for gallery: %s\n", galleries[idx].Title)
			featImg, err := galleryQueries.GetRandomGalleryImage(galleries[idx].ID)
			if err != nil {
				log.Errorf("Error retrieving random image for gallery: %v\n", err)
			} else {
				galleries[idx].FeaturedImage = *featImg
			}
		}
	}

	// Return success and all galleries
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   galleries,
	})
}

// @Description  Get all live galleries.
// @Summary      get all galleries that are live
// @Tags         Gallery
// @Produce      json
// @Success      200        {object}  []models.Gallery
// @Router       /v1/galleries/live [get]
func GetLiveGalleries(c *fiber.Ctx) error {
	galleryQueries := queries.NewGalleryRepository()

	galleries, err := galleryQueries.GetLiveGalleries()
	if err != nil {
		log.Errorf("Error retrieving live galleries from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Set the images count for each gallery
	for idx := range galleries {
		count, err := galleryQueries.GetGalleryImagesCount(galleries[idx].ID)
		if err != nil {
			log.Errorf("Error retrieving images count for gallery: %v\n", err)
		} else {
			galleries[idx].ImagesCount = count
		}
	}

	// Return success and all galleries
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   galleries,
	})
}

// @Description  Get gallery by ID.
// @Summary      get a gallery by ID
// @Tags         Gallery
// @Produce      json
// @Param        galleryID   path       string  true  "Gallery ID"
// @Security     ApiKeyAuth
// @Success      200        {object}  models.Gallery
// @Router       /v1/galleries/id/{galleryID} [get]
func GetGallery(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param galleryID
	galleryID := c.Params("galleryID")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil || gallery == nil {
		log.Debugf("No gallery with ID %s in DB\n", galleryID)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	// Return success and the individual gallery
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   gallery,
	})
}

// @Description  Get gallery by path.
// @Summary      get a gallery by path which must be public and live
// @Tags         Gallery
// @Produce      json
// @Param        galleryPath   path       string  true  "Gallery Path"
// @Success      200        {object}  models.Gallery
// @Router       /v1/galleries/path/{galleryPath} [get]
func GetGalleryByPath(c *fiber.Ctx) error {
	// Read the param galleryPath
	galleryPath := c.Params("galleryPath")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByPath(galleryPath)
	if err != nil || gallery == nil {
		log.Debugf("No live gallery with path %s in DB\n", galleryPath)
		return fiber.NewError(fiber.StatusNotFound, "No live gallery with the given path")
	}

	// Return success and the individual gallery
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   gallery,
	})
}

// @Description  Generate the QR Code for the gallery with the ID given.
// @Summary      create a QR Code for the gallery
// @Tags         Gallery
// @Produce      json
// @Param        galleryID   path       string  true  "Gallery ID"
// @Success      200        {object}  models.Gallery
// @Router       /v1/galleries/id/{galleryID}/qr-code [get]
func GetGalleryQRCode(c *fiber.Ctx) error {
	// Read the param galleryID
	galleryID := c.Params("galleryID")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil || gallery == nil {
		log.Debugf("No gallery with ID %s in DB\n", galleryID)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	// Generate the QR code
	q, err := qrcode.New(fmt.Sprintf("%s/%s", os.Getenv("NEXT_PUBLIC_CLIENT_URL"), gallery.Path), qrcode.Medium)
	if err != nil {
		log.Errorf("Error generating QR code for gallery: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Error generating QR code")
	}

	// Set the response header to indicate PNG format
	c.Set("Content-Type", "image/png")

	// Write the QR code as PNG to the response writer
	err = png.Encode(c.Response().BodyWriter(), q.Image(256)) // You can adjust the size (256) as needed
	if err != nil {
		log.Errorf("Error sending QR Code of gallery as PNG: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Error sending QR Code as PNG")
	}

	return nil
}

// @Description  Unlock the gallery by password.
// @Summary      unlock the gallery if the given password is correct
// @Tags         Gallery
// @Accept       json
// @Produce      json
// @Param        galleryPath   path       string  true  "Gallery Path"
// @Success      201
// @Router       /v1/galleries/path/{galleryPath} [post]
func UnlockGallery(c *fiber.Ctx) error {
	// Read the param galleryPath
	galleryPath := c.Params("galleryPath")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByPath(galleryPath)
	if err != nil || gallery == nil {
		log.Debugf("No gallery with path %s in DB\n", galleryPath)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	galleryAuth := new(models.GalleryAuth)

	if err := c.BodyParser(galleryAuth); err != nil {
		log.Errorf("Error parsing gallery auth: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"password": "password is required",
			},
		})
	}

	if err := gallery.CheckPassword(galleryAuth.Password); err != nil {
		hashedPass, _ := utils.HashPassword(galleryAuth.Password)
		log.Debugf("Incorrect password given (%s) to unlock gallery (%s) with password (%s): %v\n", *hashedPass, gallery.Title, *gallery.Password, err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"password": "password is incorrect",
			},
		})
	}

	// Return success
	return c.JSON(models.APIResponse{
		Status: "success",
	})
}

// @Description  Create the zips of the gallery.
// @Summary      create the zip files of the gallery
// @Tags         Gallery
// @Accept       json
// @Produce      json
// @Param        galleryID   path       string  true  "Gallery ID"
// @Security     ApiKeyAuth
// @Success      201
// @Router       /v1/galleries/id/{galleryID}/images/zips [post]
func CreateGalleryImageZips(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param galleryID
	galleryID := c.Params("galleryID")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil || gallery == nil {
		log.Debugf("No gallery with ID %s in DB\n", galleryID)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	// Generate the zips
	if err := images.GenerateGalleryZips(gallery.ID); err != nil {
		log.Errorf("Error generating zips for gallery: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Set the ZipsReady field to true
	if err := galleryQueries.SetZipsReady(gallery, true); err != nil {
		log.Errorf("Unable to update the ZipsReady field for the gallery: %v\n", err)
	}

	// Return success
	return c.Status(fiber.StatusCreated).JSON(models.APIResponse{
		Status: "success",
	})
}

// @Description  Upload a new Image.
// @Summary      upload a new Image to the gallery
// @Tags         Gallery
// @Accept       json
// @Produce      json
// @Param        galleryID   path       string  true  "Gallery ID"
// @Param        src        formData	file	true  "Image file to upload"
// @Security     ApiKeyAuth
// @Success      201        {object}  models.Image
// @Router       /v1/galleries/id/{galleryID}/images [post]
func UploadGalleryImage(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param galleryID
	galleryID := c.Params("galleryID")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil {
		log.Debugf("No gallery with ID %s in DB\n", galleryID)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	file, err := c.FormFile("src")
	if err != nil {
		log.Errorf("Unable to get image from request to upload: %v\n", err)
		c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"src": "The image file must be at 'src'",
			},
		})
	}

	// Get Buffer from file
	buffer, err := file.Open()
	if err != nil {
		log.Errorf("Unable to open image from request to upload: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"src": "Unable to open file.",
			},
		})
	}
	defer buffer.Close()

	// Retrieve image dimensions (width and height)
	img, _, err := image.DecodeConfig(buffer)
	if err != nil {
		log.Errorf("Unable to get image dimensions from request to upload: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"src": "Failed to retrieve image dimensions.",
			},
		})
	}

	validMimeTypes := []string{"image/jpeg", "image/png"}
	contentType, err := utils.GetFileType(file)
	if err != nil || !utils.Contains(validMimeTypes, contentType) {
		log.Errorf("Invalid image filetype (%s) for upload: %v\n", contentType, err)
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"src": "Invalid file type; File must be of type: jpeg, jpg or png",
			},
		})
	}

	filename := utils.GenerateRandomState(&images.FilenameLength)

	if contentType == "image/jpeg" {
		filename += ".jpg"
	} else {
		filename += ".png"
	}

	// Reset the buffer to the beginning
	buffer.Seek(0, 0)

	// Upload the image to disk
	if err := images.UploadGalleryImage(gallery.ID, contentType, filename, buffer); err != nil {
		log.Errorf("Unable to upload image to gallery: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Create the image in the DB
	galleryImage := models.Image{
		GalleryID: gallery.ID,
		Size:      file.Size,
		Filename:  filename,
		Width:     img.Width,
		Height:    img.Height,
	}

	imageQueries := queries.NewImageRepository()

	if err := imageQueries.CreateNewImage(&galleryImage); err != nil {
		log.Errorf("Error adding new image to DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// If zips are ready, set the ZipsReady field to false
	if gallery.ZipsReady {
		if err := galleryQueries.SetZipsReady(gallery, false); err != nil {
			log.Errorf("Unable to update ZipsReady field in gallery: %v\n", err)
		}
	}

	if gallery.IsLive() {
		// Set update as true if the gallery was updated while live
		settingsQueries := queries.NewSettingsRepository()
		if err := settingsQueries.SetSettingsUpdate(true); err != nil {
			log.Errorf("Error setting settings update to false: %v\n", err)
		}
	}

	// Return success
	return c.Status(fiber.StatusCreated).JSON(models.APIResponse{
		Status: "success",
		Data:   galleryImage,
	})
}

// @Description  Update gallery.
// @Summary      update the gallery with given payload
// @Tags         Gallery
// @Produce      json
// @Param   	 payload   body    models.GalleryUpdate    false  "Updated Gallery"
// @Param        galleryID   path      string  true  "Gallery ID"
// @Security     ApiKeyAuth
// @Success      200  {object}  models.Gallery
// @Router       /v1/galleries/id/{galleryID} [put]
func UpdateGallery(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param galleryID
	galleryID := c.Params("galleryID")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil {
		log.Debugf("No gallery with ID %s in DB\n", galleryID)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	galleryUpdate := new(models.GalleryUpdate)

	if err := c.BodyParser(galleryUpdate); err != nil {
		log.Debugf("Error parsing gallery update: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"gallery": err.Error(),
			},
		})
	}

	// Handle featured image updates here
	if galleryUpdate.FeaturedImageID != nil {
		if *galleryUpdate.FeaturedImageID != gallery.FeaturedImage.ID {
			// Need to update featured image
			imageQueries := queries.NewImageRepository()
			// Only query for images within the given gallery
			newFeatImg, err := imageQueries.GetGalleryImageByID(galleryID, fmt.Sprint(*galleryUpdate.FeaturedImageID))
			if err != nil {
				log.Errorf("Error retrieving new featured image from DB: %v\n", err)
				return fiber.NewError(fiber.StatusNotFound, "Invalid id given for new featured image")
			}

			// Remove existing featured image if exists
			if gallery.FeaturedImage.ID != 0 {
				if err := imageQueries.SetImageAsFeatImg(&gallery.FeaturedImage, nil); err != nil {
					log.Errorf("Error adding new image to DB: %v\n", err)
					return fiber.NewError(fiber.StatusInternalServerError, err.Error())
				}
			}

			// Set new featured image
			if err := imageQueries.SetImageAsFeatImg(newFeatImg, &gallery.ID); err != nil {
				log.Errorf("Error setting the image as featured image: %v\n", err)
				return fiber.NewError(fiber.StatusInternalServerError, err.Error())
			}

			gallery.FeaturedImage = *newFeatImg
		}
	}

	if err := galleryQueries.UpdateGallery(gallery, *galleryUpdate); err != nil {
		log.Errorf("Error updating the gallery in DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	if gallery.IsLive() {
		// Set update as true if the gallery was updated while live
		settingsQueries := queries.NewSettingsRepository()
		if err := settingsQueries.SetSettingsUpdate(true); err != nil {
			log.Errorf("Error setting settings update to false: %v\n", err)
		}
	}

	// Return the updated gallery
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   gallery,
	})
}

// @Description  Update gallery images order.
// @Summary      update gallery images order
// @Tags         Gallery
// @Produce      json
// @Param        galleryID   path	string  	true  "Gallery ID"
// @Param        images  	 body   []string 	true  "Image IDs"
// @Success      200  {string}  status  "ok"
// @Security     ApiKeyAuth
// @Router       /v1/galleries/id/{galleryID}/images [put]
func UpdateGalleryImagesOrder(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param galleryID
	galleryID := c.Params("galleryID")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil {
		log.Debugf("No gallery with ID %s in DB\n", galleryID)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	var images []int

	if err := c.BodyParser(&images); err != nil {
		log.Errorf("Error parsing gallery update: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"images": "Array of image IDs is expected in the payload.",
			},
		})
	}

	imageQueries := queries.NewImageRepository()

	// Loop through the array of IDs and set the position for each.
	for idx, photoID := range images {
		if err := imageQueries.SetImagePosition(photoID, idx); err != nil {
			log.Errorf("Error setting new image position in DB: %v\n", err)
			return fiber.NewError(fiber.StatusInternalServerError, err.Error())
		}
	}

	if gallery.IsLive() {
		// Set update as true if the gallery was updated while live
		settingsQueries := queries.NewSettingsRepository()
		if err := settingsQueries.SetSettingsUpdate(true); err != nil {
			log.Errorf("Error setting settings update to false: %v\n", err)
		}
	}

	// Return success
	return c.JSON(models.APIResponse{
		Status: "success",
	})
}

// @Description  Delete gallery by given ID.
// @Summary      remove gallery by given ID
// @Tags         Gallery
// @Produce      json
// @Param        galleryID   path      string  true  "Gallery ID"
// @Security     ApiKeyAuth
// @Success      200
// @Router       /v1/galleries/id/{galleryID} [delete]
func DeleteGallery(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param
	galleryID := c.Params("galleryID")

	galleryQueries := queries.NewGalleryRepository()

	gallery, err := galleryQueries.GetGalleryByID(galleryID)
	if err != nil {
		log.Debugf("No gallery with ID %s in DB\n", galleryID)
		return fiber.NewError(fiber.StatusNotFound, "No gallery with the given ID")
	}

	// Before deleting - delete the gallery images directory
	err = os.RemoveAll(images.GetGalleryPath(gallery.ID))
	if err != nil {
		log.Warnf("Unable to remove images directory for gallery: %v\n", err)
	}

	if err := galleryQueries.DeleteGallery(gallery); err != nil {
		log.Errorf("Unable to delete gallery from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	if gallery.IsLive() {
		// Set update as true if the gallery was updated while live
		settingsQueries := queries.NewSettingsRepository()
		if err := settingsQueries.SetSettingsUpdate(true); err != nil {
			log.Errorf("Error setting settings update to false: %v\n", err)
		}
	}

	// Return success
	return c.JSON(models.APIResponse{
		Status: "success",
	})
}
