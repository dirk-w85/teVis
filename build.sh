#!/bin/sh

#go run -ldflags "-X main.curVersion=$(git describe --always --long) -X 'main.curBuild=$(date)'" main.go
echo "GIT Commit: $(git describe --always --long)"
#git describe --always --long

echo "Building for Linux/AMD64..."
podman run --rm \
-v $PWD:/app docker.io/dirkw85/dev-golang:latest \
env GOOS=linux GOARCH=amd64 go build -o teVis -ldflags "-X main.curVersion=$(git rev-list --count HEAD)-$(git describe --always --long) -X 'main.curBuild=$(date)'" cmd/tevis/main.go 

echo "Code Build completed!"

podman build -f Dockerfile -t docker.io/dirkw85/tevis:$(git describe --always --long)
#podman build -f Dockerfile -t docker.io/dirkw85/tevis:latest

echo "Container Build completed!"