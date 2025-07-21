#!/bin/sh

#go run -ldflags "-X main.curVersion=$(git describe --always --long) -X 'main.curBuild=$(date)'" main.go
echo "GIT Commit:"
git describe --always --long

echo "Building for Linux/AMD64..."
env GOOS=linux GOARCH=amd64  go build -o teVis -ldflags "-X main.curVersion=$(git describe --always --long) -X 'main.curBuild=$(date)'" cmd/tevis/main.go 

echo "Done!"