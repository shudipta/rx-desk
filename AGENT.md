# RxDesk

RxDesk is a prescription management software for doctors.

Initial target user:

* Endocrinologist OPD doctor

Primary goal:

* Reduce prescription writing time
* Fast patient lookup
* Fast medicine selection
* Fast advice selection
* Fast test selection

---

# Tech Stack

Backend:

* Go
* Gin
* GORM
* SQLite

Frontend:

* React
* Vite
* TypeScript
* Ant Design
* React Router

---

# Backend Status

Completed.

## Patient APIs

GET /patients

GET /patients/search

GET /patients/:id

POST /patients

PUT /patients/:id

---

## Prescription APIs

POST /prescriptions

GET /prescriptions/:id

GET /patients/:id/prescriptions

---

## Template APIs

GET /favorite-medicines

GET /favorite-tests

GET /advice-templates

GET /followup-templates

---

# Domain Model

Patient

└── Prescriptions

```
├── Diagnoses[]

├── Advices[]

├── Medicines[]

├── Tests[]

└── Followup
```

Diagnosis is stored in a separate table.

Advice is stored in a separate table.

One prescription may contain multiple diagnoses.

One prescription may contain multiple advice items.

---

# Important Business Rules

Multiple Diagnoses:

* Supported

Multiple Advices:

* Supported

Multiple Medicines:

* Supported

Multiple Tests:

* Supported

Followup:

* Single value

---

# DTO Policy

Never expose GORM models directly.

Always use DTOs for API responses.

Never expose:

* CreatedAt
* UpdatedAt
* DeletedAt
* Foreign key fields unless required

---

# Current Goal

Build frontend.

Do not redesign backend.

Do not redesign database.

Do not change API contracts.

Use existing APIs.

---

# Frontend Pages

1. Patient List

2. Patient Details

3. Prescription Create

4. Prescription View

---

# Development Rules

Always propose architecture before code.

Always show API usage before implementation.

Keep implementation simple.

Avoid overengineering.

Do not introduce:

* Redux
* Microservices
* CQRS
* Event sourcing

Focus on fast delivery and doctor usability.
