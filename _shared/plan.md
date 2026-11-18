# Phase 0 Architecture & Parallel Sub-Agent Execution Plan

## 1. Codebase Scan & Stack Findings
- **Stack**: Next.js 15 (App Router, Node/Edge runtimes) + TypeScript + Tailwind CSS.
- **Database & Data Access**: Dual-layer architecture:
  - PostgreSQL via Supabase migrations (`supabase/migrations/`).
  - In-memory DAL (`src/lib/mock-db.ts`) for offline and sandbox runtimes.
- **Authentication Model**:
  - Stateless tamper-proof session JWT cookie (`sbs_session`) via `src/lib/session.ts`.
  - Roles: `admin`, `faculty`, `student`. Verified using `authenticateUser(req, allowedRoles)`.
- **AI Infrastructure**:
  - Previous implementations used Anthropic SDK in `src/lib/claude.ts`.
  - Groq client and wrapper will be housed in `src/lib/groq/` adhering to Groq API contracts with real `usage` metric extraction (`prompt_tokens`, `completion_tokens`, `total_tokens`).

---

## 2. File Ownership by Agent (Zero Conflicts)

### Agent A: Backend Usage Tracking & Groq Wrapper
- **Files Owned**:
  - `src/lib/groq/client.ts`
  - `src/lib/groq/tracking.ts`
  - `supabase/migrations/00013_token_usage.sql`
- **Responsibilities**: Thin Groq API client with atomic usage logging (`token_usage` table and `mockStore`). Safe stream/non-stream extraction.

### Agent B: Budget & Breakdown API Endpoints
- **Files Owned**:
  - `src/app/api/usage/summary/route.ts`
  - `src/app/api/usage/breakdown/route.ts`
  - `src/lib/groq/types.ts`
- **Responsibilities**: `GET /api/usage/summary` and `GET /api/usage/breakdown` with atomic aggregation, role authorization, and env-configured thresholds (`TOKEN_BUDGET=500000`, `WARN_AT=80`, `CRITICAL_AT=95`).

### Agent C: Frontend Warning Banner Component
- **Files Owned**:
  - `src/components/TokenBudgetBanner.tsx`
  - `src/app/dashboard/page.tsx` (banner integration)
- **Responsibilities**: Reusable banner matching BANNER SPEC (soft beige background, circular progress ring, serif title, status badge, monospace usage subtext, breakdown drawer, quota upgrade link, session dismiss with critical override).

### Agent D: Enforcement, Rate Limits & Safety
- **Files Owned**:
  - `src/lib/groq/enforcement.ts`
- **Responsibilities**: Enforces 100% budget blocking with standard 429 JSON payload (`BUDGET_EXHAUSTED`), admin override bypass flag, Groq rate-limit exponential backoff, and secret masking.

### Agent E: Tests & Documentation
- **Files Owned**:
  - `scripts/test-token-budget.ts`
  - `README.md`
  - `.env.example`
- **Responsibilities**: Comprehensive verification suite (0%, 79%, 80%, 95%, 100%, >100% math, thresholds, role gates), documentation of env vars and usage counting.

---

## 3. Communication & Reports
- Conflicts / notes logged in `_shared/notes.md`.
- Individual reports: `_shared/report-agent-a.md` through `_shared/report-agent-e.md`.
- Final audit summary in `_shared/FINAL-SUMMARY.md`.
