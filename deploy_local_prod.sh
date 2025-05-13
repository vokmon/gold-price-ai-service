#!/bin/bash

# Define variables
CONTAINER_NAME="goldpriceaiservice"
IMAGE_NAME="goldpriceaiservice:latest"
DOCKERFILE="Dockerfile"

# Stop and remove existing container if it exists
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Remove existing image if it exists
docker rmi $IMAGE_NAME 2>/dev/null || true

# Build and run the container
docker build --pull --rm -f "$DOCKERFILE" -t "$IMAGE_NAME" '.'
docker run -d --name $CONTAINER_NAME $IMAGE_NAME
