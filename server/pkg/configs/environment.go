package configs

import (
	baseLog "log"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2/log"
)

func init() {
	requiredVars := []string{"JWT_SECRET_KEY"}

	for _, envVar := range requiredVars {
		if GetenvPointer(envVar, nil) == nil {
			baseLog.Fatalf("Missing required environment variable: %s", envVar)
		}
	}
}

// Get the environment variable
// return the specified default value if environment variable not set
func Getenv(key, defaultValue string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return value
}

// Get the environment variable
// return the specified default value if environment variable not set
func GetenvPointer(key string, defaultValue *string) *string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}
	return &value
}

// Get the environment variable as an integer
// return the specified default value if environment variable not set
func GetenvInt(key string, defaultValue int) int {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}

	// Convert the value to an integer
	// If the value is not a valid integer, return the default value
	intValue, err := strconv.Atoi(value)
	if err != nil {
		log.Warnf("The %s value (%s) is invalid. Value must be a positive integer.\nDefaulting to %d.\n",
			key, value, defaultValue)
		return defaultValue
	}

	return intValue
}

func GetenvBool(key string, defaultValue bool) bool {
	value, exists := os.LookupEnv(key)
	if !exists {
		return defaultValue
	}

	// Convert the value to a boolean
	// If the value is not a valid boolean, return the default value
	boolValue, err := strconv.ParseBool(value)
	if err != nil {
		log.Warnf("The %s value (%s) is invalid. Value must be a boolean.\nDefaulting to %t.\n",
			key, value, defaultValue)
		return defaultValue
	}

	return boolValue
}
