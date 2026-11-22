package main

import (
	"io/fs"
	"log"
	"mime"
	"os"
	gopath "path/filepath"
	"strings"

	"github.com/shudipta/rx-desk/backend/internal/database"
	"github.com/shudipta/rx-desk/backend/internal/router"
	"github.com/gin-gonic/gin"
)

func main() {
	dbPath := os.Getenv("DATABASE_URL")
	if dbPath == "" {
		dbPath = "rx_desk.db"
	}

	_, err := database.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := router.SetupRouter()

	staticFS, err := frontendFS()
	if err != nil {
		log.Fatalf("Failed to get frontend filesystem: %v", err)
	}

	indexData, err := fs.ReadFile(staticFS, "index.html")
	if err != nil {
		log.Fatalf("Failed to read index.html: %v", err)
	}

	r.GET("/", func(c *gin.Context) {
		c.Data(200, "text/html; charset=utf-8", indexData)
	})

	r.NoRoute(func(c *gin.Context) {
		path := strings.TrimPrefix(c.Request.URL.Path, "/")
		if path == "" {
			c.Data(200, "text/html; charset=utf-8", indexData)
			return
		}
		data, err := fs.ReadFile(staticFS, path)
		if err == nil {
			ext := gopath.Ext(path)
			mimeType := mime.TypeByExtension(ext)
			if mimeType == "" {
				mimeType = "application/octet-stream"
			}
			c.Data(200, mimeType, data)
			return
		}
		if strings.Contains(path, ".") {
			c.Status(404)
			return
		}
		c.Data(200, "text/html; charset=utf-8", indexData)
	})

	// Patient data has no login in front of it, so only this machine can reach
	// the server unless HOST is set (e.g. HOST=0.0.0.0 to share on the network).
	host := os.Getenv("HOST")
	if host == "" {
		host = "127.0.0.1"
	}

	log.Printf("Starting RxDesk server on http://%s:%s ...", host, port)
	if err := r.Run(host + ":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
