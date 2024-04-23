package configs

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/austinbspencer/gshare-server/docs"
	"github.com/gofiber/fiber/v2/log"
)

var (
	Version   = ""
	StartTime = time.Now()
)

// Programmatically set Swagger docs info
func SetDocsInfo() {
	setAppVersion()

	docs.SwaggerInfo.Host = Getenv("SWAGGER_URL", "localhost:8323")
	docs.SwaggerInfo.Schemes = strings.Split(strings.TrimSpace(Getenv("SWAGGER_PROTOCOL", "http,https")), ",")
	docs.SwaggerInfo.BasePath = "/api"
	docs.SwaggerInfo.Title = fmt.Sprintf("gshare %s", Version)
	docs.SwaggerInfo.Description = "Auto-generated API documentation for the gshare REST API."
}

// Set the App's version using the version file
func setAppVersion() {
	version, err := os.ReadFile("version")
	if err != nil {
		log.Fatalf("Missing or corrupted version file: %v\n", err)
	}

	docs.SwaggerInfo.Version = string(version)

	// Set global var
	Version = string(version)
}
