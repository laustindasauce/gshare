# Start from golang alpine image with specific version
FROM golang:1.22.2-alpine3.18 AS builder

# Add Maintainer Info
LABEL maintainer="Austin Spencer <gshare@austinbspencer.com>"

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY server/go.mod server/go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source from the current directory to the Working Directory inside the container
COPY server/. .
# Copy the version file
COPY version version

# Tidy the go.mod
RUN go mod tidy

# Build the Go app
RUN go build -o server .

FROM alpine:3.18 AS runner

# Set the Current Working Directory inside the container
WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/server /app/server
COPY --from=builder /app/version /app/version
COPY --from=builder /app/templates /app/templates
COPY --from=builder /app/favicon.ico /app/favicon.ico

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["./server"]