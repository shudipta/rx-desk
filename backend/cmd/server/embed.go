package main

import (
	"embed"
	"io/fs"
)

//go:embed frontend-dist
var frontendDist embed.FS

func frontendFS() (fs.FS, error) {
	return fs.Sub(frontendDist, "frontend-dist")
}
