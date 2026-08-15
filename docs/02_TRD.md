# Technical Requirement Document (TRD) — AarFin Nest

## 1. System Architecture Overview
AarFin Nest is built as a full-stack Web Application utilizing a modern Next.js App Router architecture connected to an isolated backend service layer and Supabase PostgreSQL database.

```
[ FRONTEND UI (React 19 Client Components) ]
                   │
                   ▼ (HTTP REST APIs - /api/*)
[ NEXT.JS API ROUTE CONTROLLERS (src/app/api/) ]
                   │
                   ▼
[ DECOUPLED BACKEND SERVICES (src/backend/services/dbService.ts) ]
                   │
                   ▼ (Server-Side Admin REST Client - src/backend/config/supabaseAdmin.ts)
[ Supabase PostgreSQL Database (public schema) ]
```

---

## 2. Technology Stack & Dependencies
- **Frontend Framework**: Next.js 15 / 16 (App Router with Client Components).
- **Backend Architecture**: Decoupled API Route Controllers (`/api/customers`, `/api/batches`, `/api/groups`, `/api/payments`, `/api/audit`) & Isolated Service Layer (`src/backend/services/dbService.ts`).
- **Security & Config**: Centralized `.env.local` store, Server-Side `SUPABASE_SERVICE_ROLE_KEY` authorization.
- **Language**: TypeScript 5.7.
- **Styling & UI**: Vanilla CSS Design Tokens, TailwindCSS v4, Lucide React Icons.
- **Backend & Database**: Native Server-Side Fetch Client against Supabase PostgREST Engine.
- **State Management**: React `useState`, `useMemo`, `useEffect`, Optimistic UI Updates.
- **Reporting Engine**: HTML5 Media Print Styles & Vector Browser PDF Engine (`window.print()`).

---

## 3. Date & Timezone Handling
- **Timezone Standard**: Local Indian Standard Time (IST UTC+5:30) with explicit local component extraction (`[year, month, day]`).
- **UTC Date Normalization**: Prevents ISO timezone offsets (`toISOString()`) from shifting midnight dates backwards.

---

## 4. Calculation Engine Logic

### 4.1 Frequency Interval Math
Given a Customer Joining Date $D_{\text{join}}$ and Today's Date $D_{\text{today}}$:
- **Elapsed Days**: $\Delta = \max(0, \lfloor (D_{\text{today}} - D_{\text{join}}) / 86400000 \rfloor)$.
- **Current Active Cycle Number**:
  - `DAILY`: $C_{\text{active}} = \lfloor \Delta / 1 \rfloor + 1$.
  - `WEEKLY`: $C_{\text{active}} = \lfloor \Delta / 7 \rfloor + 1$.
  - `MONTHLY`: $C_{\text{active}} = \lfloor \Delta / 30 \rfloor + 1$.

### 4.2 Paid Cycles & Dues Evaluation
- **Total DB Amount Paid**: $A_{\text{paid}} = \sum \text{payments.amount\_paid}$.
- **Paid Cycles Count**: $C_{\text{paid}} = \lfloor A_{\text{paid}} / \text{Installment Amount} \rfloor$.
- **Pending Dues Evaluation**:
  - If $C_{\text{paid}} \ge C_{\text{active}}$: Dues Status = `UP_TO_DATE` / `FUTURE_ADVANCE_PAID`.
  - If $C_{\text{paid}} < C_{\text{active}}$: Dues Status = `PENDING_DUES` ($C_{\text{active}} - C_{\text{paid}}$ cycles overdue).
