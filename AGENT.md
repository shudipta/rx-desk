# RxDesk

RxDesk is a prescription acceleration system for a hospital OPD endocrinologist.

Goal:
Reduce prescription creation time from 270 seconds to under 60 seconds.

Current breakdown:
- Diagnosis: 20 sec
- Medicines: 130 sec
- Tests: 50 sec
- Advice: 50 sec
- Follow-up: 20 sec

Tech Stack:
- Backend: Go, Gin, Gorm, SQLite
- Frontend: Next.js, TypeScript, Tailwind, shadcn/ui

MVP Features:
- Patient Management
- Prescription Management
- Favorite Medicines
- Favorite Tests
- Advice Templates
- Follow-up Templates
- Clone Previous Prescription
- Printable Prescription

Out of Scope:
- Authentication
- AI
- Billing
- Inventory
- Appointments
- Multi Doctor
- Hospital Management

Engineering Rules:
- Keep code simple
- No DDD
- No CQRS
- No Event Bus
- No Microservices
- REST APIs only
- SQLite only
