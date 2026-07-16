# RxDesk

A prescription acceleration system for endocrinologists.

Goal:
Reduce prescription creation time from 4.5 minutes to under 1 minute.

## Repository Structure

- [backend/](file:///Users/rocketman/src/go/src/github.com/shudipta/rx-desk/backend) - Go, Gin, GORM, SQLite backend.
- `frontend/` - Next.js client application (TBD).

## Backend Setup & Running

For detailed setup instructions, refer to the [backend README](file:///Users/rocketman/src/go/src/github.com/shudipta/rx-desk/backend/README.md).

Quick run:
```bash
cd backend
go run cmd/server/main.go
```

Verify health:
```bash
curl http://localhost:8080/health
```

