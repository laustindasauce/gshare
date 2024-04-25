package models

// Response format for success and fail responses
// Follows the JSend structure
// Documentation: https://github.com/omniti-labs/jsend
type APIResponse struct {
	// Status of the request (success, fail)
	Status string `json:"status"`
	// Data of the response
	Data any `json:"data"`
}

// Response format for error responses
// Follows the JSend structure
// Documentation: https://github.com/omniti-labs/jsend
type APIErrorResponse struct {
	// Status of the request (error)
	Status string `json:"status"`
	// Meaningful, end-user-readable (or at the least log-worthy) message,
	// explaining what went wrong
	Message string `json:"message"`
	// A generic container for any other information about the error, i.e.
	// the conditions that caused the error, stack traces, etc.
	Data any `json:"data,omitempty"`
}

// Array of IDs expected when doing a bulk select of items
type BulkSelect struct {
	IDs []uint `json:"ids"`
}
