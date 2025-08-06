#!/bin/sh

echo "Starting..."
podman run --rm \
-p 8090:8090 \
-v $PWD:/app docker.io/dirkw85/dev-golang:latest \
go run -ldflags "-X main.curVersion=$(git rev-list --count HEAD)-$(git describe --always --long) -X 'main.curBuild=$(date)'" cmd/tevis/main.go 
