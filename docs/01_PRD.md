# Product Requirement Document (PRD) — AarFin Nest Financial & Chit Fund System

## 1. Executive Summary
**AarFin Nest** is an enterprise-grade financial management platform specifically designed for Chit Funds, Recurring Deposit Schemes, and Field Collection Management. It supports real-time ledger tracking, dynamic late-joiner dues calculation, multi-frequency collection cycles, and granular report exports.

---

## 2. Business Goals & Objectives
- **Automated Collection Ledger**: Eliminates manual paper tracking by automating cycle calculations for Daily, Weekly, and Monthly schemes.
- **Fair Late-Joiner Policies**: Provides flexible onboarding policies (Start from Join Date, Carry Previous Dues, Skip Disallowed Past Cycles) for late-enrolled customers.
- **High-Capacity Operations**: Built to handle 2,000+ active collection members per route with zero performance degradation.
- **100% Audit Compliance**: Captures verified receipt numbers, collection timestamps, and payment modes (Cash, UPI, Bank Transfer).

---

## 3. Core Features & Capabilities

### 3.1 Customer Directory & Dynamic Registration
- Auto-generated Customer Codes (`CUST-001`, `CUST-002`).
- Dynamic Batch & Group cascading dropdowns during registration (filtering route groups by selected scheme batch).
- Selectable Customer Joining Date with automatic fallback to live system date (`new Date()`).
- Dynamic Late Joiner Dues Policy configuration:
  - **Option A: Join Date Timeline (Dynamic Start)**: Cycle #1 starts fresh strictly on the customer's joining date.
  - **Option B: Carry Previous Dues (Carried Overdue)**: Missed batch cycles prior to customer joining date are carried over as pending overdue installments.
  - **Option C: Skip Disallowed Past Cycles (₹0 Skipped)**: Missed batch cycles prior to customer joining date are automatically skipped at ₹0 amount.

### 3.2 Real-Time Collections Hub & Field Ledger
- Live Member Search by Name, Customer Code (`#104`), or Phone Number.
- Summary Financial KPI Cards (Total Active Members, Overdue Pending Members, Up To Date Members, Total Collection Logged).
- Dynamic Dues Status Banner per member:
  - `ALL COMPLETED CYCLES CLEAR — NO DUES`
  - `ADVANCE PAID FOR NEXT N CYCLES` (e.g. Paid 5 cycles ahead)
  - `PREVIOUS DUES PENDING (N Cycle(s) Overdue)`
  - `DUE NOT STARTED (Starts YYYY-MM-DD)`
- Dynamic Target Cycle Selection (`Auto FIFO Allocation`, `Cycle #1 Overdue`, `Cycle #2 Active Due`, `Cycle #3 Advance`).
- Payment Category Tagging (`Full Installment`, `Partial Payment`, `Overdue Clearance`, `Advance Payment`).
- Live Cycle-Wise Breakdown Grid (`PAID CLEAR`, `OVERDUE PENDING`, `ACTIVE DUE TODAY`, `UPCOMING`).
- DB Recorded Receipts Audit Trail displaying receipt numbers (`REC-YYYYMMDD-XXXX`), payment modes (Cash, UPI, Bank Transfer), and notes metadata.

### 3.3 Advanced PDF Financial Reports & Export Studio
- Granular Scope Selection:
  - Entire Organization Ledger
  - Single Customer Specific Statement
  - All Groups in a Scheme Batch
  - Single Specific Route Group
  - Multiple Selective Route Groups
- Timeline Presets: Daily (Today), Weekly (Past 7 Days), Monthly (Current Month), Selective Custom Date Range.
- Printable Vector PDF Export with Company Branding, Telemetry Header, and Total Summary Footer.

---

## 4. User Roles & Permissions
- **Admin**: Full access to create scheme batches, route groups, customer registration, audit logs, and PDF exports.
- **Field Collection Agent**: Dedicated access to Collections Hub to record payments via Cash/UPI with live receipt generation.
