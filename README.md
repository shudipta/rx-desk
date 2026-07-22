# RxDesk

A prescription acceleration system for endocrinologists.

**Goal:** Reduce prescription creation time from 4.5 minutes to under 1 minute.

## Repository Structure

```
backend/   — Go, Gin, GORM, SQLite
frontend/  — React 18, Vite 5, TypeScript 5, Ant Design 5
```

## Quick Start

### Backend
```bash
cd backend
go run ./cmd/server
# Server starts on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Dev server starts on http://localhost:5173
```

### Verify health
```bash
curl http://localhost:8080/health
```

## Build

```bash
cd frontend && npm run build
```

## Current Status

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed project status.
