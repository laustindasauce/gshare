package configs

import (
	"fmt"
	"strings"
	"time"

	"github.com/austinbspencer/gshare-server/docs"
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

// Set the App's version using the environment variable
func setAppVersion() {
	Version = Getenv("APP_VERSION", "vx.x.x")

	docs.SwaggerInfo.Version = Version
}
