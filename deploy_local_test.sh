#!/bin/bash

# Define variables
IMAGE_NAME="goldpriceaiservicetest"
IMAGE_TAG="latest"
CONTAINER_NAME="goldpriceaiservice_test"
DOCKERFILE="DockerfileTest"

# Remove existing container if it exists
docker rm -f $CONTAINER_NAME 2>/dev/null || true

# Remove existing image if it exists
docker rmi $IMAGE_NAME:$IMAGE_TAG 2>/dev/null || true

# Build and run the container
docker build --pull --rm -f "$DOCKERFILE" -t "$IMAGE_NAME:$IMAGE_TAG" '.'
docker run -d --name $CONTAINER_NAME $IMAGE_NAME:$IMAGE_TAG
