package auth

import (
	"errors"
	"time"

	"github.com/austinbspencer/gshare-server/internal/models"
	"github.com/austinbspencer/gshare-server/internal/queries"
	"github.com/gofiber/fiber/v2"
)

// Check if the user is authenticated
func IsAuthenticated(c *fiber.Ctx) (*models.User, *models.APIUser, error) {
	// Get now time.
	now := time.Now().Unix()

	// Get claims from JWT.
	claims, err := ExtractTokenMetadata(c)
	if err != nil {
		// Return JWT parse error.
		return nil, nil, err
	}

	// Set expiration time from JWT data of current user.
	expires := claims.Expires

	// Checking, if now time greater than expiration from JWT.
	if now > expires {
		// Return expired error
		return nil, nil, errors.New("unauthorized, check expiration time of your token")
	}

	userQueries := queries.NewUserRepository()

	reqUser, err := userQueries.GetFullUserByID(claims.UserID)
	if err != nil {
		return nil, nil, errors.New("unauthorized, jwt token user was not found")
	}

	apiUser := reqUser.GetAPIUser()

	return reqUser, &apiUser, nil
}
