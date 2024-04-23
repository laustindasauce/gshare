package utils

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"math/big"
	"mime/multipart"
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2/log"
	"github.com/nfnt/resize"
	"golang.org/x/crypto/bcrypt"
)

// Difference returns the elements in `a` that aren't in `b`.
func Difference(a, b []string) []string {
	mb := make(map[string]struct{}, len(b))
	for _, x := range b {
		mb[x] = struct{}{}
	}
	var diff []string
	for _, x := range a {
		if _, found := mb[x]; !found {
			diff = append(diff, x)
		}
	}
	return diff
}

// Generate a random string for oauth2.0 state
func GenerateRandomState(length *int) string {
	b := make([]byte, 32) // 32 bytes will produce 43 characters when encoded to base64
	_, err := rand.Read(b)
	if err != nil {
		// Handle the error (optional)
		return ""
	}

	if length != nil {
		return base64.URLEncoding.EncodeToString(b)[:*length]
	}

	return base64.URLEncoding.EncodeToString(b)
}

// Contains returns whether or not the string exists in the slice
func Contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func GetFileType(file *multipart.FileHeader) (string, error) {
	var contentType string

	// Get Buffer from file
	buffer, err := file.Open()
	if err != nil {
		return contentType, err
	}

	defer buffer.Close()

	buf := bytes.NewBuffer(nil)
	if _, err := io.Copy(buf, buffer); err != nil {
		return contentType, err
	}
	contentType = http.DetectContentType(buf.Bytes())

	return contentType, nil
}

// Use bcrypt to hash a password with cost of 8
func HashPassword(rawPassword string) (*string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(rawPassword), 8)
	if err != nil {
		return nil, err
	}

	hash := string(hashedPassword)

	return &hash, nil
}

func GetMimeTypeFromExtension(filename string) string {
	// Mapping of file extensions to MIME types
	extensionToMimeType := map[string]string{
		".jpg":  "image/jpeg",
		".jpeg": "image/jpeg",
		".png":  "image/png",
	}

	// Convert the filename to lowercase for case-insensitive matching
	filenameLower := strings.ToLower(filename)

	// Iterate through the map to find the MIME type
	for ext, mimeType := range extensionToMimeType {
		if strings.HasSuffix(filenameLower, ext) {
			return mimeType
		}
	}

	// Default to application/octet-stream if no match is found
	return "application/octet-stream"
}

func ResizeImage(input []byte, width, quality uint, contentType string) ([]byte, error) {
	img, _, err := image.Decode(bytes.NewReader(input))
	if err != nil {
		return nil, err
	}

	// Calculate the corresponding height to maintain the aspect ratio
	originalWidth := uint(img.Bounds().Dx())
	originalHeight := uint(img.Bounds().Dy())
	newHeight := uint(float64(width) / float64(originalWidth) * float64(originalHeight))

	resizedImg := resize.Resize(width, newHeight, img, resize.Lanczos3)

	var resizedBuffer bytes.Buffer
	switch contentType {
	case "image/jpeg":
		err := jpeg.Encode(&resizedBuffer, resizedImg, &jpeg.Options{Quality: int(quality)})
		if err != nil {
			log.Errorf("Error with encoding file: %v\n", err)
			return nil, err
		}
	default:
		err := png.Encode(&resizedBuffer, resizedImg)
		if err != nil {
			log.Errorf("Error with encoding file: %v\n", err)
			return nil, err
		}
	}

	return resizedBuffer.Bytes(), nil
}

// ParseSize parses a human-readable size string (e.g., "10")
// and returns the corresponding number of bytes in MB.
func ParseSize(sizeStr string) (int, error) {
	value, err := strconv.Atoi(sizeStr)
	if err != nil {
		return 0, fmt.Errorf("failed to parse size value: %w", err)
	}

	return value * 1024 * 1024, nil // Convert to bytes (1 MB = 1024 * 1024 bytes)
}

// Generate2FACode generates a random 6-digit number for 2FA
func Generate2FACode() (string, error) {
	// Generate a random 6-digit number
	code := ""
	for i := 0; i < 6; i++ {
		// Generate a random number between 0 and 9
		num, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		// Append the random number to the code
		code += num.String()
	}
	return code, nil
}
