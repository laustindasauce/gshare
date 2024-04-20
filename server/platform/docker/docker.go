package docker

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/austinbspencer/gshare-server/pkg/configs"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/gofiber/fiber/v2/log"
)

var dockerHost = "unix:///var/run/docker.sock"

func TestDockerConnection() error {
	ctx := context.Background()
	dockerClient, err := client.NewClientWithOpts(client.WithHost(dockerHost), client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	containers, err := dockerClient.ContainerList(ctx, container.ListOptions{})
	if err != nil {
		return err
	}

	if len(containers) == 0 {
		return errors.New("Unable to find any containers with Docker connection!")
	}

	return nil
}

func GetClientContainerID() (string, error) {
	var clientContainerID string

	ctx := context.Background()
	dockerClient, err := client.NewClientWithOpts(client.WithHost(dockerHost), client.WithAPIVersionNegotiation())
	if err != nil {
		return clientContainerID, err
	}

	containers, err := dockerClient.ContainerList(ctx, container.ListOptions{})
	if err != nil {
		return clientContainerID, err
	}

	clientContainerName := configs.Getenv("CLIENT_CONTAINER", "gshare-client")

	// Set the client container ID with the container name
	for _, container := range containers {
		if strings.Contains(container.Image, "gshare") {
			log.Debugf("gshare image found: %s\n", container.Image)
			for _, name := range container.Names {
				if strings.Contains(name, clientContainerName) {
					log.Infof("Setting client container ID: %s\n", clientContainerID)
					clientContainerID = container.ID
				}
			}
		}
	}

	if clientContainerID == "" {
		return clientContainerID, errors.New("Unable to find gshare client image in Docker.")
	}

	log.Debugf("Client container ID: %s\n", clientContainerID)

	// Get information about the container
	containerInfo, err := dockerClient.ContainerInspect(ctx, clientContainerID)
	if err != nil {
		// Return empty client container ID since inspect command failed
		return "", err
	}

	// Print the container information
	log.Debugf("Container ID: %s\n", containerInfo.ID)
	log.Debugf("Container Name: %s\n", containerInfo.Name)
	log.Debugf("Container State: %s\n", containerInfo.State.Status)

	return clientContainerID, nil
}

func RestartClientContainer() error {
	// Run again in case client container has changed since last set
	clientContainerID, err := GetClientContainerID()
	if err != nil {
		return fmt.Errorf("gshare client docker container unable to find: %v\n", err)
	}

	ctx := context.Background()
	dockerClient, err := client.NewClientWithOpts(client.WithHost(dockerHost), client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	log.Infof("Restarting container with ID: %s\n", clientContainerID)

	return dockerClient.ContainerRestart(ctx, clientContainerID, container.StopOptions{})
}
