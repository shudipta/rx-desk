# RxDesk Backend

This is the Go backend skeleton for the RxDesk prescription acceleration system, built with Gin, GORM, and SQLite.

## Requirements

- [Go](https://golang.org/doc/install) 1.25 or higher

## Setup and Running

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Download dependencies**:
   ```bash
   go mod download
   ```

3. **Start the server**:
   ```bash
   go run cmd/server/main.go
   ```

By default, the server runs on port `:8080` and creates an SQLite database file named `rx_desk.db` in the current directory.

## Verify the Server is Running

You can test the health check endpoint using `curl`:

```bash
curl http://localhost:8080/health
```

Expected JSON response:
```json
{
  "message": "RxDesk Backend API is running",
  "status": "healthy"
}
```

## Configuration

You can configure the server port and database file location using environment variables:

- `PORT`: Set the port on which the server runs (default: `8080`).
- `DATABASE_URL`: Set the SQLite database file path (default: `rx_desk.db`).

Example:
```bash
PORT=9000 DATABASE_URL=my_rx_desk.db go run cmd/server/main.go
```
