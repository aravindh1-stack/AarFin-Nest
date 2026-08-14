# App Flow & Navigation Specifications — AarFin Nest

## 1. Application Navigation Map

```
                     ┌──────────────────────────┐
                     │   Login / Auth Screen    │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │   Dashboard Overview     │
                     └────────────┬─────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Scheme Batches  │    │   Route Groups   │    │Customer Directory│
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                        │                        │
         └────────────────────────┴────────────────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │     Collections Hub      │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │  PDF Reports Studio      │
                     └──────────────────────────┘
```

---

## 2. Page Specifications & User Flows

### Flow 1: Customer Registration & Batch Enrollment
1. Admin opens **Customer Directory** (`/customers`).
2. Clicks **+ Register New Customer**.
3. Enters Personal Details (Full Name, Phone, Address, ID Proof).
4. Selects **Scheme Batch** (e.g. *Weekly Scheme 2026*).
5. Cascading dropdown automatically filters **Route Group** choices.
6. Selects **Customer Joining Date** (defaults to today's date).
7. Selects **Late Joiner Dues Policy** (Option A, Option B, or Option C).
8. Inspects **Section 3: Dynamic Installment Schedule Preview Table** (shows skipped cycles @ ₹0 or carried overdue).
9. Submits form → Instant optimistic UI render & background Supabase DB sync.

### Flow 2: Field Collection & Payment Recording
1. Agent opens **Collections Hub** (`/collections`).
2. Views real-time financial summary KPI counters (Total Active Members, Overdue Pending, Up To Date, Total Collection Logged).
3. Searches for member by Name, Customer Code (`#104`), or Phone Number.
4. Clicks member card to open **Member Ledger Drawer**.
5. Reviews Dues Status Banner (`OVERDUE PENDING INSTALLMENTS` or `ALL COMPLETED CYCLES CLEAR`).
6. Inspects **Cycle-Wise Breakdown Table** and **DB Recorded Receipts Log**.
7. Fills Payment Recording Form:
   - Target Cycle (`Auto FIFO`, `Cycle #1 Overdue`, `Cycle #2 Active Due`, `Cycle #3 Advance`)
   - Payment Category (`Full Installment`, `Partial Payment`, `Overdue Clearance`, `Advance Payment`)
   - Collection Amount & Payment Mode (Cash, UPI, Bank Transfer)
   - Reference / UTR Number & Notes
8. Clicks **Confirm & Submit Collection** → Auto-generates receipt `#REC-YYYYMMDD-XXXX`, logs into DB, and refreshes ledger.

### Flow 3: PDF Report Exporting
1. Admin opens **PDF Reports Studio** (`/reports`).
2. Selects **Report Target Scope** (Single Customer, All Batch Groups, Single Group, Multi-Groups, Entire Organization).
3. Selects **Timeline Preset Filter** (All-Time, Daily, Weekly, Monthly, Selective Custom Range).
4. Inspects Summary Total & Data Preview Table.
5. Clicks **DOWNLOAD PDF REPORT** → Launches native vector PDF export dialog.
