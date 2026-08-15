# Implementation Plan & Execution Roadmap — AarFin Nest

## 1. Project Initialization & Setup
- [x] Configure Next.js App Router codebase (`/src/app`).
- [x] Integrate Supabase JS SDK (`@supabase/supabase-js`) in `src/lib/supabase/client.ts`.
- [x] Add Service Role Key bypass logic to resolve PostgREST RLS permission errors.
- [x] Build Finance-Themed Full-Screen Page Loading Overlay in `src/components/layout/PageLoadingOverlay.tsx`.

---

## 2. Database & Schema Deployment
- [x] Create PostgreSQL table DDL script (`supabase/setup_tables.sql`).
- [x] Add customer policy columns (`joining_date`, `late_joiner_policy`) to `public.customers`.
- [x] Add `receipt_no`, `payment_method`, `amount_paid`, and `reference_no` to `public.payments`.

---

## 3. Module Development

### Module 3.1: Scheme Batches & Route Groups Management
- [x] Build Batch Creation Modal with total cycles, installment amounts, and frequency type selection (`/batches`).
- [x] Build Route Group Management with parent batch filtering (`/groups`).

### Module 3.2: Customer Directory & Onboarding
- [x] Add cascading Batch and Route Group dropdown selection (`/customers`).
- [x] Integrate Customer Joining Date input (defaults dynamically to today's live date).
- [x] Add Late Joiner Policy Selector:
  - Option A: Start from Joining Date (Dynamic Timeline)
  - Option B: Carry Previous Dues as Pending (Carried Overdue)
  - Option C: Skip Disallowed Past Cycles (₹0 Skipped)
- [x] Build Section 3 Dynamic Installment Schedule Preview Table:
  - Batch Start Date, Batch End Date, Customer Joining Date, Scheme Commitment Telemetry Banner
  - Pre-join cycles marked as `SKIPPED (₹0)` or `OVERDUE (CARRIED PENDING)`
  - Immediate joining date cycle marked as `DUE PENDING (JOIN DAY DUE)`
- [x] Add clickable table rows to open Member View/Edit Modal with Dues Health & Financial Breakdown.

### Module 3.3: Field Collections Hub & Ledger
- [x] Build Summary Financial KPI Counters (Total Active Members, Overdue Pending Members, Up To Date Members, Total Collection Logged).
- [x] Build Member Search bar and Batch Filter dropdown (`/collections`).
- [x] Connect `selectedMemberLedger` calculation engine directly to live database payment records.
- [x] Build Multi-Parameter Targeted Payment Collection Form:
  - Target Cycle Selection (`Auto FIFO Allocation`, `Cycle #1 Overdue`, `Cycle #2 Active Due`, `Cycle #3 Advance`)
  - Payment Category (`Full Installment`, `Partial Payment`, `Overdue Clearance`, `Advance Payment`)
- [x] Build Cycle-Wise Breakdown Grid (`PAID CLEAR`, `OVERDUE PENDING`, `ACTIVE DUE TODAY`, `UPCOMING`).
- [x] Build DB Recorded Receipts Log displaying receipt numbers (`REC-YYYYMMDD-XXXX`), notes metadata, and payment modes.

### Module 3.4: PDF Reports Studio
- [x] Build Scope Selector (Single Customer, All Batch Groups, Single Group, Multi-Groups, Entire Organization).
- [x] Add Timeline Preset Filters (Daily Wise, Weekly Wise, Monthly Wise, Selective Custom Date Range).
- [x] Implement vector browser PDF export engine (`/reports`).

### Module 3.5: Decoupled Backend Architecture & API Layer
- [x] Create server-side REST helper client in `src/backend/config/supabaseAdmin.ts`.
- [x] Create isolated service layer (`src/backend/services/dbService.ts`) for customers, batches, groups, payments, and audit logs.
- [x] Build API Route Controllers (`/api/customers`, `/api/batches`, `/api/groups`, `/api/payments`, `/api/audit`).
- [x] Remove 100% of direct database calls from frontend React components.
- [x] Secure API secrets exclusively within `.env.local`.

---

## 4. Verification & Testing Checklist
- [x] Verify `npm run dev` builds clean with zero console runtime errors.
- [x] Test Customer Registration with past, present, and future joining dates under Options A, B, and C.
- [x] Test Field Payment Entry in Collections Hub and verify receipt creation in Supabase DB.
- [x] Test Advance Payment math (e.g. 5 cycles paid ahead showing `ADVANCE PAID FOR NEXT 5 CYCLES`).
- [x] Test PDF Export functionality for single member, batch group, route group, and custom date range filters.
