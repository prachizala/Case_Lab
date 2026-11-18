# feat: CE Case Pack generator (Finance, HR, Marketing)

## Summary
Implements the continuous evaluation "CE Case Pack" generator for SBS CaseLab. Every case produced follows the standardized classroom & examination format modeled after the benchmark reference standards:
1. **Teaching Case Narrative**: Rich Indian business dilemmas with contextual corporate data tables.
2. **Exam Questions**: 2-4 questions adhering strictly to Bloom's taxonomy verbs and syllabus-grounded concepts.
3. **Faculty-Only Model Answer Key**: Structured introduction, numbered evaluation sections, basis comparison matrices, step-by-step financial calculations, overall assessments, and concise conclusions.
4. **Teaching Notes & Marking Scheme**: Pedagogical synopsis, course learning outcomes, common student pitfalls, and marking criteria.
5. **Departmental Profiles**: Dedicated profiles with specialized unit-grouped topics, frameworks, and decision requirements for **Finance**, **HR**, and **Marketing**.

All generation runs through a 3-pass pipeline with deterministic programmatic quality checks, strict student data stripping, syllabus document parsing (PDF/DOCX), export facilities (DOCX & PDF), and a faculty continuous improvement feedback loop.

---

## What Changed (By Step)

- **Step 1: Department Profiles** (`src/config/casepack/departments.ts`):
  - Defined `FINANCE_DEPARTMENT_PROFILE`, `HR_DEPARTMENT_PROFILE`, and `MARKETING_DEPARTMENT_PROFILE` with syllabus units, frameworks, question templates, answer structures, and validation rules.
- **Step 2: Pedagogical Style Guide & Reference Isolation** (`reference/STYLE_GUIDE.md`, `.gitignore`):
  - Authored comprehensive style guide defining case structure, length, academic tone, Bloom question architecture, and model answer depth.
  - Added `reference/gold/originals/` to `.gitignore` to keep faculty reference files private and local.
- **Step 3: Schema & Database Migration** (`src/lib/casepack/schema.ts`, `supabase/migrations/00012_ce_casepack.sql`, `src/lib/types.ts`):
  - Authored strict Zod schema `CECasePackSchema` with type inferences.
  - Added `"ce_pack"` to `CaseType` union.
  - Created forward-compatible SQL migration for the cases table.
- **Step 4: Multi-Pass Generation Pipeline & API** (`src/lib/casepack/generate.ts`, `src/app/api/casepack/generate/route.ts`):
  - Engineered 3-pass sequential generation (Narrative -> Questions -> Answers/Notes) using Server-Sent Events (SSE) streaming with live progress reporting.
  - Protected with `requireUser(["admin", "faculty"])` and rate limiting.
- **Step 5: Deterministic Programmatic Validators** (`src/lib/casepack/validate.ts`, `scripts/test-casepack-validators.ts`):
  - Implemented 10 deterministic quality controls: schema check, word count bounds, concept presence in narrative, Bloom verbs check, answer architecture, case fact citations, terminology consistency, placeholder prohibition, gold isolation, and department-specific rules.
  - Built pure math formulas for financial validation (`NPV`, `Payback`, `WACC`, `DOL`, `DFL`, `EOQ`, `Working Capital Cycle`).
  - Unit test suite with 32/32 tests passing (`npm run test:validators`).
- **Step 6: Curate Studio UI & Student Role Gating** (`src/components/casepack/CECasePackView.tsx`, `src/app/create/page.tsx`, `src/app/cases/[id]/page.tsx`, `src/app/api/cases/route.ts`, `src/app/api/cases/[id]/route.ts`):
  - Designed tabbed viewer (`Case | Questions | Model Answer Key | Teaching Notes | Checks`).
  - Integrated 4-step progress bar and live text buffer in `/create`.
  - Enforced strict server-side student gating: unauthenticated or student requests have `answers`, `teaching_notes`, and `quality` stripped prior to delivery.
- **Step 7: DOCX & PDF Institutional Exports** (`src/app/api/cases/[id]/export/docx/route.ts`, `src/app/api/cases/[id]/export/pdf/route.ts`, `scripts/test-casepack-export.ts`):
  - Formatted DOCX and vector PDF outputs with formal SBS header rules, data tables, questions with Bloom levels, and confidential answer keys with explicit page breaks.
  - Implemented Student Handout mode (`?mode=student`) where answers and teaching notes are omitted.
  - Automated export test suite with 4/4 tests passing (`npm run test:exports`).
- **Step 8: Faculty Feedback Loop & Admin Quality Dashboard** (`src/lib/casepack/feedback-store.ts`, `src/app/api/casepack/feedback/route.ts`, `src/app/admin/page.tsx`, `src/components/casepack/CECasePackView.tsx`):
  - Created faculty evaluation widget (1-5 star rating, defect checklist, gold candidate nomination).
  - Added "CE Case Pack Quality" tab in `/admin` with department quality analytics, gold reference library management, and review ledger.
- **Step 9: Syllabus Document Grounding** (`src/app/api/casepack/syllabus/route.ts`, `src/app/create/page.tsx`, `scripts/test-casepack-feedback-syllabus.ts`):
  - Built file upload endpoint parsing PDF, DOCX, and TXT syllabi using `pdf-parse` and `mammoth`.
  - Added heuristic unit/topic chunking and framework matching to dynamically pre-fill curriculum topics.
  - Automated verification suite with 4/4 tests passing (`npm run test:feedback-syllabus`).

---

## How to Test

### 1. Run Automated Test Suites
Execute the following verification suites from the terminal:
```bash
# 1. Deterministic Validators Unit Suite (32 tests)
npm run test:validators

# 2. DOCX & PDF Export Verification Suite (4 tests)
npm run test:exports

# 3. Faculty Feedback & Syllabus Extraction Suite (4 tests)
npm run test:feedback-syllabus

# 4. Production Next.js Build
npm run build
```

### 2. Manual UI Verification in Browser
1. Start dev server: `npm run dev` (or run on port 3001 if 3000 is occupied: `npx next dev -p 3001`).
2. Navigate to **http://localhost:3001/create**:
   - Verify **"CE Case Pack (Departmental Exam & Teaching Standard)"** is selected by default.
   - Switch between **FINANCE**, **HR**, and **MARKETING** tabs; observe syllabus units and topics update dynamically.
   - Click **"Upload Syllabus"** and choose a sample PDF/DOCX syllabus document; verify units and suggested topics are parsed and displayed.
   - Click **"Generate Complete Case Pack"**:
     - Observe live 4-step progress: *Pass 1: Drafting Teaching Narrative* -> *Pass 2: Formulating Exam Questions* -> *Pass 3: Model Answers & Notes* -> *Pass 4: Programmatic Quality Checks*.
     - Verify resulting tabbed viewer displays all sections with 10/10 green validation badges.
3. Test Exports:
   - Click **"Export Full Pack (DOCX)"** and **"Export Full Pack (PDF)"** — verify complete faculty pack with answer key and page breaks.
   - Click **"Export Student Handout (DOCX)"** and **"Export Student Handout (PDF)"** — verify answer key and teaching notes are absent.
4. Test Student Role Gating:
   - Switch user role to **Student** (via persona switcher or login as student).
   - Navigate to `/cases/[id]` or request `/api/cases/[id]` — verify `answers` and `teaching_notes` tabs/fields are completely hidden and stripped from the network response.
5. Test Admin Quality Dashboard:
   - Navigate to **http://localhost:3001/admin** as an Administrator.
   - Click the **"CE Case Pack Quality"** tab.
   - Verify faculty ratings, department quality metrics, and Gold Standard Reference library status.

---

## Security Notes (Answer Key Visibility & Role Isolation)
- **Zero Client-Side Leaks**: Student protection is enforced on the server. In `/api/cases`, `/api/cases/[id]`, `/api/cases/[id]/export/docx`, and `/api/cases/[id]/export/pdf`, whenever the authenticated user's role is `"student"`, the model answers, teaching notes, and evaluation rubrics are removed from the memory payload prior to JSON serialization or document rendering.
- **Export Isolation**: Even if a student manually modifies query parameters to request `?mode=full`, server-side role inspection overrides the parameter to `mode = "student"`.
- **Secret Hygiene**: Zero API keys or tokens are exposed in server-side logs, client responses, or commits.

---

## Known Limitations
- The syllabus parser relies on regex-based heuristic chunking for unit headers (`Unit`, `Module`, `Chapter`, etc.). Highly idiosyncratic syllabus layouts without standard section headers fall back to two default logical units ("Core Concepts" and "Applied Topics").
- In mock mode (without Supabase configured), generated case packs persist across the application runtime session via `mockStore`.

---

## Checklist
- [x] `npm run build` passes with zero errors (44/44 static pages compiled).
- [x] All 3 automated test suites pass (40 total assertions passed).
- [x] No `.env`, secrets, or credentials committed.
- [x] Original faculty reference files in `reference/gold/originals/` are excluded by `.gitignore`.
- [x] Strict conventional commit history with required author and co-author trailers.
- [x] Branch pushed to `origin feature/ce-case-pack` (default branch `main` remains untouched).
