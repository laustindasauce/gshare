package auth

import (
	"os"
	"strconv"
	"time"

	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/gofiber/fiber/v2/log"
	"github.com/golang-jwt/jwt/v4"
)

// GenerateNewAccessToken func for generate a new Access token.
func GenerateNewAccessToken(userID string) (string, error) {
	// Set secret key from environment
	secret := os.Getenv("JWT_SECRET_KEY")

	// Set expires minutes count for secret key from .env file.
	minutesCount, err := strconv.Atoi(configs.Getenv("JWT_SECRET_KEY_EXPIRE_MINUTES_COUNT", "0"))
	if err != nil {
		log.Warnf("The JWT_SECRET_KEY_EXPIRE_MINUTES_COUNT has an invalid value (%s). Defaulting to '0' due to error: %v\n",
			os.Getenv("JWT_SECRET_KEY_EXPIRE_MINUTES_COUNT"), err)
	}
	hoursCount, err := strconv.Atoi(configs.Getenv("JWT_SECRET_KEY_EXPIRE_HOURS_COUNT", "6"))
	if err != nil {
		log.Warnf("The JWT_SECRET_KEY_EXPIRE_HOURS_COUNT has an invalid value (%s). Defaulting to '0' due to error: %v\n",
			os.Getenv("JWT_SECRET_KEY_EXPIRE_HOURS_COUNT"), err)
	}
	daysCount, err := strconv.Atoi(configs.Getenv("JWT_SECRET_KEY_EXPIRE_DAYS_COUNT", "0"))
	if err != nil {
		log.Warnf("The JWT_SECRET_KEY_EXPIRE_DAYS_COUNT has an invalid value (%s). Defaulting to '0' due to error: %v\n",
			os.Getenv("JWT_SECRET_KEY_EXPIRE_DAYS_COUNT"), err)
	}

	// Create a new claims.
	claims := jwt.MapClaims{}

	var minuteTime time.Duration = 0
	var hoursTime time.Duration = 0
	var daysTime time.Duration = 0

	if minutesCount != 0 {
		minuteTime = time.Minute * time.Duration(minutesCount)
	}

	if hoursCount != 0 {
		hoursTime = time.Hour * time.Duration(hoursCount)
	}

	if daysCount != 0 {
		daysTime = time.Hour * 24 * time.Duration(daysCount)
	}

	// Set public claims:
	claims["exp"] = time.Now().Add(minuteTime + hoursTime + daysTime).Unix()
	claims["userID"] = userID

	// Create a new JWT access token with claims.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate token.
	t, err := token.SignedString([]byte(secret))
	if err != nil {
		// Return error, it JWT token generation failed.
		return "", err
	}

	return t, nil
}
