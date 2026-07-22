# RxDesk

RxDesk is a prescription management software for doctors.

Initial target user:
- Endocrinologist OPD doctor

Primary goal:
- Reduce prescription writing time
- Fast patient lookup
- Fast medicine selection
- Fast advice selection
- Fast test selection

---

# Tech Stack

Backend:
- Go
- Gin
- GORM
- SQLite

Frontend:
- React 18
- Vite 5
- TypeScript 5
- Ant Design 5
- React Router 6

---

# Design Philosophy (Doctor-First UX)

- **Minimize clicks**: Inline favorites (one-click add), auto-clone latest Rx on page load, no popover indirection
- **Minimize typing**: Dosage input uses 3-slot M/A/E with +/- buttons (format: "1+0+1"), dropdown presets for duration/instructions
- **Increase confidence**: Quick Reference sidebar tags show checkmark when item already added; color changes from light to solid
- **Reduce cognitive load**: Quick Reference is the single source for favorites — no inline quick-add duplication
- **Speed**: Auto-focus title field on page load, Enter adds new rows, all favorites visible as clickable tags

---

# Backend APIs

## Patient APIs

GET /patients
GET /patients/search?q=
GET /patients/:id
POST /patients
PUT /patients/:id

## Prescription APIs

POST /prescriptions
GET /prescriptions/:id
GET /patients/:id/prescriptions

## Template APIs

GET /favorite-medicines
GET /favorite-tests
GET /advice-templates
GET /followup-templates

## Doctor Profile APIs

GET /doctor/profile
  Response: { id, doctor_name, qualification, specialization, registration_no, clinic_name, hospital_name, address, phone, email }

PUT /doctor/profile
  Body: { doctor_name, qualification, specialization, registration_no, clinic_name, hospital_name, address, phone, email }
  Upserts single-row profile (id=1). Creates if missing, updates if exists.

## Dashboard APIs

GET /stats/dashboard
  Response: { total_patients: number, today_consultations: number }

---

# Domain Model

Patient
  └── Prescriptions
        ├── Diagnoses[]
        ├── Advices[]
        ├── Medicines[]
        ├── Tests[]
        └── Followup (single value)

Diagnosis, Advice, Medicine, Test are stored in separate tables.

---

# Important Business Rules

- Multiple Diagnoses supported
- Multiple Advices supported
- Multiple Medicines supported
- Multiple Tests supported
- Followup: single value

# DTO Policy

Never expose GORM models directly. Always use DTOs for API responses.
Never expose: CreatedAt, UpdatedAt, DeletedAt, foreign key fields unless required.

---

# JSON Quirk (omitempty)

Backend uses `omitempty` on JSON tags. Empty arrays are omitted from the response,
resulting in `undefined` in JavaScript. Always use optional chaining (`?.`)
when accessing nested arrays from backend responses (e.g., `rx.diagnoses?.map(...)`).

---

# Frontend Pages

1. Patient List (`/`) — stats cards, search, patient table, add/edit modals
2. Patient Details (`/patients/:id`) — patient info card, prescription history table
3. Prescription Create (`/patients/:id/new-prescription`) — full form, auto-clone, 3-slot dosage, Quick Reference sidebar
4. Prescription View (`/prescriptions/:id`) — A4 print-friendly Bangladesh-format prescription, doctor profile from API
5. Settings (`/settings`) — editable doctor profile form (all fields from DoctorProfile model)

---

# Frontend Conventions

## Theme & Styling
- Custom Ant Design theme in `src/styles/theme.ts` (teal primary #006D77, Inter font)
- Global CSS in `src/styles/global.css` (scrollbar, card radius, table headers)
- No CSS modules — all component styles are inline or Ant Design props

## Layout
- Fixed sidebar (220px, teal gradient) + sticky header bar (64px)
- Content area: 28px padding, light gray background (#f0f2f5)

## Doctor Profile (Single-Row Pattern)

The `DoctorProfile` model stores a single row (always id=1) for the doctor's
name, qualifications, specialization, registration number, clinic info, address,
phone, and email. The GET endpoint returns the single row; PUT upserts it.
The AppLayout, PrescriptionViewPage, and SettingsPage all fetch the profile.

## Key Components

### DosageInput
- 3-slot visual input: M (Morning) / A (Afternoon) / E (Evening)
- Each slot: − / number / + buttons
- Stored format: "1+0+1" (values joined by +)
- Used in Medicine table rows

### Quick Reference (right sidebar on PrescriptionCreatePage)
- Separate sections for Medicines, Tests, Advices, Followups
- Each item is a clickable Tag
- Selected state: solid color + checkmark icon + full opacity
- Unselected state: light color + plus icon + 0.8 opacity

## Auto-Clone Logic
- On PrescriptionCreatePage load, if patient has previous prescriptions, latest is auto-cloned
- Green "Auto-cloned" badge shown in header
- If multiple previous Rxs exist, a compact "Switch to:" select appears below header

---

# Development Rules

Always propose architecture before code.
Always show API usage before implementation.
Keep implementation simple.
Avoid overengineering.

Do not introduce:
- Redux
- Microservices
- CQRS
- Event sourcing

Focus on fast delivery and doctor usability.

---

# Build & Run

## Backend
```bash
cd backend && go run ./cmd/server
```

## Frontend
```bash
cd frontend && npm run dev
```

## Verify Build
```bash
cd frontend && npm run build
```
