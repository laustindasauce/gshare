package controllers

import (
	"encoding/json"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/austinbspencer/gshare-server/pkg/auth"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
)

// @Description  Create an event.
// @Summary      create a new event.
// @Tags         Event
// @Accept       json
// @Produce      json
// @Param   	 payload   body    models.Event    false  "New Event"
// @Success      201        {object}  models.Event
// @Router       /v1/events [post]
func CreateEvent(c *fiber.Ctx) error {
	event := new(models.Event)

	// I need to log what the body of the request is as json formatted
	var requestBody map[string]interface{}
	if err := json.Unmarshal(c.Body(), &requestBody); err != nil {
		return err // Handle error if unable to unmarshal JSON
	}

	// Log the request body as pretty-printed JSON
	requestBodyJSON, err := json.MarshalIndent(requestBody, "", "  ")
	if err != nil {
		return err // Handle error if unable to marshal JSON
	}
	log.Debugf("Request Body:\n%s\n", requestBodyJSON)

	// Store the body in the event and return error if encountered
	if err := c.BodyParser(event); err != nil {
		log.Errorf("Unable to parse new event: %v\n", err)
		// Return status 400 and error message.
		return c.Status(fiber.StatusBadRequest).JSON(models.APIResponse{
			Status: "fail",
			Data: fiber.Map{
				"issue": err.Error(),
			},
		})
	}

	// Update the event requestor to the IP and port of the request
	event.Requestor = c.IP() + ":" + c.Port()

	log.Infof("The Gallery ID is: %d\n", event.GalleryID)

	log.Debugf("New event: %v\n", event)

	eventQueries := queries.NewEventRepository()

	if err := eventQueries.CreateNewEvent(event); err != nil {
		log.Errorf("Unable to add new event to DB: %v\n", err)
		// Return status 500 and error message.
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Return the created event
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   event,
	})
}

// @Description  Get event by ID.
// @Summary      get a event by ID
// @Tags         Event
// @Produce      json
// @Param        eventID   path       string  true  "Event ID"
// @Security     ApiKeyAuth
// @Success      200        {object}  models.Event
// @Router       /v1/events/{eventID} [get]
func GetEvent(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param eventID
	eventID := c.Params("eventID")

	eventQueries := queries.NewEventRepository()

	event, err := eventQueries.GetEventByID(eventID)
	if err != nil || event == nil {
		log.Warnf("Event with ID %s was not found in the DB\n", eventID)
		return fiber.NewError(fiber.StatusNotFound, "No event with the given ID")
	}

	// Return success and the individual event
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   event,
	})
}

// @Description  Get all events.
// @Summary      get all events that exist
// @Tags         Event
// @Produce      json
// @Security     ApiKeyAuth
// @Success      200        {object}  []models.Event
// @Router       /v1/events [get]
func GetEvents(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	eventQueries := queries.NewEventRepository()

	events, err := eventQueries.GetEvents()
	if err != nil {
		log.Errorf("Unable to retrieve events from database: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}

	// Return success and all events
	return c.JSON(models.APIResponse{
		Status: "success",
		Data:   events,
	})
}

// @Description  Delete event by given ID.
// @Summary      remove event by given ID
// @Tags         Event
// @Produce      json
// @Param        eventID   path      string  true  "Event ID"
// @Security     ApiKeyAuth
// @Success      200
// @Router       /v1/event/{eventID} [delete]
func DeleteEvent(c *fiber.Ctx) error {
	_, _, err := auth.IsAuthenticated(c)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}

	// Read the param
	eventID := c.Params("eventID")

	eventQueries := queries.NewEventRepository()

	event, err := eventQueries.GetEventByID(eventID)
	if err != nil {
		log.Warnf("Unable to find event with ID %s in DB\n", eventID)
		return fiber.NewError(fiber.StatusNotFound, "No event with the given ID")
	}

	if err := eventQueries.DeleteEvent(event); err != nil {
		log.Errorf("Error removing event from DB: %v\n", err)
		return fiber.NewError(fiber.StatusInternalServerError, "Event unable to be deleted.")
	}

	// Return success
	return c.JSON(models.APIResponse{
		Status: "success",
	})
}
