# SBS CaseLab: Institutional Case Study Repository Architecture & Implementation Plan

## Executive Overview
This document specifies the end-to-end plan to transition **SBS CaseLab** (Shanti Business School) into a full-lifecycle **Academic Case Study Repository** covering:
1. **Creation**: Department-calibrated case pack generation (CE Case Pack, 5/10 pages) for both faculty and students.
2. **Review & Rotation**: Automated, fair, atomic round-robin reviewer assignment across departmental faculty.
3. **Approval & Upload Gate**: Multi-round peer review with reviewer comments; strict upload gate locking cases to the permanent repository upon approval.
4. **Repository & Access Control**: Departmental repository with permissioned downloads, confidential asset stripping (Answer Keys/Teaching Notes hidden from students), and DPDP-compliant user lifecycle management.

---

## 1. Files to be Changed and Added

### Database & Schema (Phase 1)
- `supabase/migrations/00015_case_repository_schema.sql` (NEW):
  - Lookup tables: `batches`, `faculty_types`, `case_categories`, `case_types`.
  - Extensions to `profiles`: `personal_email`, `mobile`, `enrollment_no`, `roll_no`, `course_id`, `batch_id`, `faculty_type_id`, `is_reviewer`, `reviewer_since`, `access_start`, `access_end`, `access_status`, `approved_by`, `approved_at`, `registered_at`.
  - Extensions to `cases`: `case_category_id`, `keywords`, `page_target`, `author_role`, `review_status`.
  - New operational tables: `review_rounds`, `review_comments`, `reviewer_rotation`, `repository_items`, `download_log`.
- `supabase/migrations/00016_case_repository_rls_functions.sql` (NEW):
  - RLS policies enforcing student confidential asset protection, personal data privacy (mobile/personal email visible only to self & admin).
  - PostgreSQL function `assign_reviewer(p_case_id)` with row-level locking for atomic, fair round-robin rotation.
- `src/lib/types.ts`: Update TypeScript models for profiles, lookup entities, review rounds, rotation, repository items, and download logs.
- `src/lib/mock-db.ts`: In-memory implementation of lookup tables, user access lifecycle, reviewer rotation algorithm, repository storage, and search filters.
- `scripts/seed.ts`: Update seed blueprint for exactly 1 Admin (Dr. Neha Sharma), 2 Faculty Reviewers in same department (Ms. Reena Paswan + 1), and 1 Student (Zala Prachi, BCA 2024-27).
- `scripts/test-repository-rls.ts` (NEW): SQL and in-memory RLS verification test suite.

### Authentication & Access Lifecycle (Phase 2)
- `src/lib/auth-security.ts`: Add `checkAccess(user)` helper; Indian mobile validator; enrollment/employee ID regex checks; Kolkata date calculators.
- `src/lib/auth.ts`: Shared Zod validation schema for student vs faculty registration.
- `src/app/signup/page.tsx`: Two-stage user type selection ("Student" or "Faculty"), dynamic field display, single shared strict Zod schema, explicit statutory consent statement.
- `src/app/login/page.tsx`: Dual-login support allowing login with official SBS email OR verified personal email.
- `src/app/api/auth/route.ts`: Enforce registration approval workflow (`REQUIRE_ADMIN_APPROVAL`), role tampering rejection, personal email OTP verification.
- `src/app/api/admin/pending-registrations/route.ts`: Approval/rejection with automatic `access_start` and `access_end` calculation (batch end date + 1 year for students).
- `src/app/api/cron/access-expiry/route.ts` (NEW): Daily access expiration cron job with 30-day and 7-day reminders.
- `src/middleware.ts`: Integrated `checkAccess` enforcement across protected routes.
- `scripts/test-auth-access-lifecycle.ts` (NEW): Verification suite for registration, approval, date bounds, expiry, and dual-email login.

### Case Creation & Submission (Phase 3)
- `src/app/create/page.tsx`: Pre-fill department and course from user profile; page target selector (5 or 10 pages based on `WORDS_PER_PAGE=450`); keywords input chips (minimum 3 required); student-friendly creation interface; similarity check pre-computation.
- `src/app/cases/[id]/page.tsx`: Multi-tab view: `Case`, `Questions`, `Answer Key` (faculty/reviewer/admin only), `Checks`. Inline section editing and autosave.
- `src/app/cases/[id]/submit/route.ts` (NEW): Submission validation, similarity n-gram calculation, status transition to `submitted`, version snapshot creation, and triggering of reviewer rotation.
- `src/app/my-cases/page.tsx`: Personal cases dashboard with review status badges and reviewer revision feedback.
- `src/app/api/cases/[id]/export/docx/route.ts` & `src/app/api/cases/[id]/export/pdf/route.ts`: Strict server-side stripping of Answer Keys for students.
- `scripts/test-case-creation-submission.ts` (NEW): Verification suite for creation limits, student answer hiding, similarity scoring, and submission locking.

### Review, Approval, Upload Gate & Repository (Phase 4)
- `src/app/api/cases/[id]/workflow/route.ts`: Implement `assign_reviewer` integration, reviewer actions (Request changes, Approve, Reject), round tracking.
- `src/app/review-queue/page.tsx`: Reviewer dashboard with tabs (Pending, In Progress, Done), section comments drawer, and decision actions.
- `src/app/api/cases/[id]/upload/route.ts` (NEW): Strict upload gate (HTTP 403 if status !== `approved`), generating frozen DOCX/PDF artifacts, creating `repository_items` record.
- `src/app/library/page.tsx`: Full repository interface with faceted filters (department, course, category, keywords, case type, year), metadata inspection, and permissioned downloads via `canDownload()`.
- `src/app/api/repository/download/route.ts` (NEW): Central download handler writing to `download_log` and enforcing student answer stripping.
- `scripts/test-reviewer-rotation-repository.ts` (NEW): Verification suite for atomic rotation, fair distribution, upload gate enforcement, and private storage.

### Admin Control Center (Phase 5)
- `src/app/admin/page.tsx`:
  - Dashboard telemetry cards (total students, faculty, reviewers; submissions in progress; reviewer loads; repository items).
  - Faculty directory with reviewer assignment toggle ("Faculty Member and Reviewer" label, audit logged).
  - Students directory with course, batch, enrollment, access expiry dates, and bulk renewal/deactivation.
  - Submissions tracking with reviewer rotation load inspector and manual reassignment.
  - Academic lookup tables manager (departments, courses, batches, faculty types, categories).
  - Repository item moderation (unpublish / republish).
- `scripts/test-admin-repository-management.ts` (NEW): Admin verification test suite.

### Extension Points & Documentation (Phase 6 & 7)
- `docs/PHASE3_PAYMENTS.md` (NEW): Architecture specification for commercial case downloads, creator revenue splits, and alumni subscriptions.
- `README.md` & `.env.example`: Updated environment variables, role definitions, and workflow diagrams.

---

## 2. Existing Code Reused Without Duplication
1. **CE Case Pack Generator & Validators**:
   - `src/lib/casepack/generate.ts` and `src/lib/casepack/validate.ts` provide complete 10-check validation suite, Bloom taxonomy mapping, and deterministic financial math. Kept intact as default format.
2. **Export Engines**:
   - Server-side DOCX and PDF export generation with multi-page formatting, standard Latin typography, and Indian business symbols.
3. **Session & Security Infrastructure**:
   - `src/lib/session.ts`: Tamper-proof signed session cookies and `authenticateUser` middleware.
   - `src/lib/auth-security.ts`: Enterprise password hashing, brute-force lockout, single-use 6-digit OTPs.
   - `src/lib/rate-limit.ts`: Token bucket rate limiting.
4. **Design System & Theme Tokens**:
   - CSS variables in `src/app/globals.css` and `src/config/theme.ts`.

---

## 3. Potential Conflicts and Strategic Resolutions

| Area | Existing Behavior | Target Requirement | Resolution Strategy |
|---|---|---|---|
| **Approval Authority** | Only Admin could approve cases in `/api/cases/[id]/workflow`. | Assigned Faculty Reviewers approve cases; Admin can reassign. | Refactor workflow endpoint to authorize the assigned reviewer for that round, or institutional Admin. |
| **Student Case Creation** | Previously toggled via `STUDENT_CASE_GENERATION`. | Both students and faculty can create cases; students never see answer keys. | Allow case authoring for active students while strictly scrubbing Answer Keys, Teaching Notes, and Marking Rubrics on server for any student request. |
| **Registration Status** | Created accounts were auto-approved in dev/demo mode. | Registration must create accounts in `pending` status (`REQUIRE_ADMIN_APPROVAL=true`). | Unify signup flow to create `access_status: "pending"`; Admin explicitly approves with Asia/Kolkata date calculations. |
| **Legacy Features** | Student answers, AI grading, Rubrics, Certificates, CO/PO NBA analytics. | Keep code intact but hidden behind feature flags. | Wrap legacy navigation links and routes in `FEATURE_STUDENT_ANSWERS`, `FEATURE_CERTIFICATES`, `FEATURE_PORTFOLIO`, `FEATURE_OBE_ANALYTICS` (all defaulting to `false`). |

---

## 4. Planned Supabase Migrations

1. `00015_case_repository_schema.sql`:
   - Tables: `academic_batches`, `faculty_types`, `case_categories`, `case_types`.
   - Alter `profiles`: add `personal_email`, `mobile`, `enrollment_no`, `roll_no`, `course_id`, `batch_id`, `faculty_type_id`, `is_reviewer`, `reviewer_since`, `access_start`, `access_end`, `access_status`, `approved_by`, `approved_at`, `registered_at`.
   - Alter `cases`: add `case_category_id`, `keywords`, `page_target`, `author_role`, `review_status`.
   - Tables: `review_rounds`, `review_comments`, `reviewer_rotation`, `repository_items`, `download_log`.
2. `00016_case_repository_rls_functions.sql`:
   - Stored procedure: `assign_reviewer(p_case_id UUID) RETURNS UUID` (atomic round-robin).
   - RLS policies on `profiles`, `cases`, `review_rounds`, `repository_items`.
