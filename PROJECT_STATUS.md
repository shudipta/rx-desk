# RxDesk Status

## Backend
- Completed

## Backend APIs
- Patient CRUD (GET list, GET by id, POST, PUT)
- Patient search (`GET /patients/search?q=`)
- Prescription CRUD: POST, GET by id, PUT /prescriptions/:id (update)
- Patient prescriptions list (`GET /patients/:id/prescriptions`)
- Template CRUD (all 4 types):
  - POST/PUT/DELETE /favorite-medicines/:id
  - POST/PUT/DELETE /favorite-tests/:id
  - POST/PUT/DELETE /advice-templates/:id
  - POST/PUT/DELETE /followup-templates/:id
- Dashboard stats (`GET /stats/dashboard`)
- Doctor profile (`GET /doctor/profile`, `PUT /doctor/profile`) with single-row upsert (includes visiting_schedule, appointment_contact)
- SQLite, auto-migrate, seed data

## Frontend

### Pages

#### Patient List (`/`)
- Stats cards (total patients, today's consultations) with gradient backgrounds
- Search with 300ms debounce
- Patient table with avatar initials, age/gender tags
- Row click → Patient Details
- Add Patient modal (`POST /patients`)
- Edit Patient modal (`PUT /patients/:id`)
- Loading, error, empty states

#### Patient Details (`/patients/:id`)
- Patient info card with avatar, tags, prescription count
- New Prescription button
- Prescription history table with visit type tags
- Row click → Prescription View
- Empty state with "Create First Prescription" CTA
- Loading and error states

#### Prescription Create (`/patients/:id/new-prescription`)
- Form: title, visit type, followup, notes
- Diagnoses: dynamic add/remove, Enter to add
- Medicines: table with name, 3-slot M/A/E dosage (+/- buttons), duration/instructions (Select presets)
- Tests: dynamic add/remove, Enter to add
- Advices: TextArea rows=4, dynamic add/remove
- Auto-clone latest prescription on page load
- Clone from older prescription (switch select)
- Edit mode: reads editPrescriptionId from location.state, calls PUT vs POST, heading shows "Edit Prescription" vs "New Prescription"
- Quick Reference: right sidebar only (removed inline tags, one-click favorites with selected highlighting via checkmark + solid color)
- Inline followup quick-tags under followup input
- Submit shows "Update Prescription" vs "Create Prescription" based on edit mode
- Loading and error states

#### Prescription View (`/prescriptions/:id`)
- A4-size paper layout (816×1155px) with redesigned Bangladesh prescription format:
  - Light teal header/footer bands (#e8f4f4)
  - Vertical separator between body columns
  - Teal section titles, doctor name, info labels
  - Teal medicine table header border
  - print-color-adjust: exact for background printing
- Doctor letterhead with clinic info (dynamically fetched from doctor profile API)
- Patient info in bordered table
- 2-col body: left (diagnoses/tests), right (medicines/advices)
- Rx symbol before medicines table
- Footer: follow-up left, signature right
- Print CSS: @page { margin: 0.3in; }, hides .ant-layout-sider, header, layout padding
- Toolbar: Edit button (navigates to /patients/:id/new-prescription with editPrescriptionId), Print button (ghost primary)
- Loading and error states

#### Settings (`/settings`)
- Doctor Profile section:
  - Editable form with all fields including visiting_schedule, appointment_contact
  - Qualification as TextArea (3 rows)
  - Save button with loading/success states
- Quick Reference Templates section (below Doctor Profile):
  - 4 cards: Favorite Medicines, Favorite Tests, Advice Templates, Followup Templates
  - Each card: title with colored icon, primary ghost "Add" button, item list
  - Items: label + optional subtext (content/value for advices/followups)
  - Edit/Delete buttons per item with Modal.confirm dialog
  - Modal for add/edit: title/name field + content/value field (for advices/followups only)

### Design System
- Primary: `#006D77` (teal), Accent: `#E29578` (warm coral)
- Font: Inter (Google Fonts)
- Custom Ant Design theme via `src/styles/theme.ts`
- Global CSS: `src/styles/global.css`
- Layout: Fixed 220px sidebar (teal gradient) + sticky 64px header
- Cards: 12-16px border radius, Buttons: 8-10px border radius
- Print styles: @page { margin: 0.3in; }, print-color-adjust: exact
- Print layout: hides .ant-layout-sider, header, layout padding

### API Client
- `apiGet`: in-flight request deduplication via `Map<string, Promise>` keyed by `"GET {path}"`
- `apiPost`, `apiPut`, `apiDelete` functions
- Template CRUD functions: `create/update/delete` for all 4 types (favorite medicines, tests, advice templates, followup templates)
- Prescription update: `updatePrescription()` function

### Doctor-First UX Decisions
1. **Auto-clone**: Latest Rx loaded automatically on page load — zero clicks
2. **Auto-focus**: Title field focused on page load — start typing immediately
3. **3-slot dosage**: Visual M/A/E +/- buttons instead of typing (format: "1+0+1")
4. **Searchable presets**: Duration and instructions use Select presets
5. **Quick Reference sidebar**: All favorites visible at a glance, one-click add
6. **Selected highlighting**: Added items show checkmark + solid color
7. **Enter to add**: Enter in Diagnoses/Tests/Advices adds new row
8. **Inline followup tags**: Quick followup values as clickable tags
9. **Edit mode**: Clone specific prescription via editPrescriptionId state, calls PUT vs POST
10. **Template management**: Centralized settings for all quick reference items with add/edit/delete

### Known Quirks
- Backend uses `omitempty` → empty arrays are `undefined` in JS, always use `?.`
- Build warning: chunk size > 500kB (Ant Design bundle), acceptable for now

---

## Run Commands

```bash
# Backend
cd backend && go run ./cmd/server

# Frontend dev
cd frontend && npm run dev

# Verify build
cd frontend && npm run build
```
