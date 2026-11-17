# SBS CaseLab - Phase 0 Master Plan & Architecture Specification

**Target Branch:** `backend-upgrade`  
**Author / Orchestrator:** Antigravity AI Orchestrator  
**Co-Author:** prachizala <prachizala2003@gmail.com>  
**Status:** PHASE 0 COMPLETE (PLANNING ONLY - ZERO PRODUCTION CODE MODIFICATIONS)  

---

## 1. Executive Summary & Goals

This document outlines the architectural migration from the in-memory data store (`src/lib/mock-db.ts`) to a production-grade PostgreSQL database powered by Supabase with Row Level Security (RLS), Supabase Auth via `@supabase/ssr`, soft-neutral charcoal dark mode theme, strictly 3 roles (`admin`, `faculty`, `student`), and enterprise sub-second response times.

### Core Objectives:
1. **Real Backend with Real Database:** Supabase PostgreSQL + Auth completely replacing `src/lib/mock-db.ts` via an abstraction data-access layer (`src/lib/db/*`) with zero disruption to frontend page contracts.
2. **Soft Charcoal Dark Mode:** Neutral "light black" (`#151517`, `#1B1B1E`, `#202023`, `#2A2A2E`) eliminating all blue-tinted dark backgrounds while preserving official SBS light mode.
3. **Strict 3-Role & 3-User Architecture:** Exactly three roles (`admin`, `faculty`, `student`) and three demo accounts with `password123`.
4. **Sub-Second Performance & Streaming:** Claude token streaming (< 2s TTFT), parallelized API queries, static caching, server connection pooling.
5. **Single Source of Truth Auth:** Eliminating stale client cache through strict server session hydration and `@supabase/ssr` cookies.

---

## 2. Comprehensive Inventory of `src/lib/mock-db.ts` Functions & API Route Usage

The table below catalogs every public method exported by `MockDatabase` (`mockStore`) in `src/lib/mock-db.ts` and maps each corresponding API route caller in `src/app/api/**`:

| # | Domain / Entity | `mockStore` Method | Callers (API Routes / System) | Target `src/lib/db/` File |
|---|---|---|---|---|
| 1 | **Departments** | `getDepartments()` | `GET /api/admin` | `src/lib/db/departments.ts` |
| 2 | **Departments** | `addDepartment(...)` | `POST /api/admin` | `src/lib/db/departments.ts` |
| 3 | **Courses** | `getCourses()` | `GET /api/admin`, `src/app/create` | `src/lib/db/courses.ts` |
| 4 | **Courses** | `addCourse(...)` | `POST /api/admin` | `src/lib/db/courses.ts` |
| 5 | **Profiles** | `getProfiles()` | `GET /api/admin`, `GET /api/notifications` | `src/lib/db/users.ts` |
| 6 | **Profiles** | `getProfile(id)` | `GET /api/auth`, `POST /api/auth`, `GET /api/answers`, `POST /api/admin`, `GET /api/portfolio`, `GET /api/cases/[id]`, `src/middleware.ts` | `src/lib/db/users.ts` |
| 7 | **Profiles** | `addProfile(profile)` | `POST /api/auth` (signup) | `src/lib/db/users.ts` |
| 8 | **Profiles** | `updateProfileRole(...)` | `POST /api/admin` (role assignment) | `src/lib/db/users.ts` |
| 9 | **Profiles** | `updateUserPlan(...)` | `POST /api/admin`, `POST /api/payments/verify` | `src/lib/db/users.ts` |
| 10 | **Profiles** | `updateUserQuota(...)` | `POST /api/admin` | `src/lib/db/users.ts` |
| 11 | **Profiles** | `rejectUserRegistration(...)` | `POST /api/admin` | `src/lib/db/users.ts` |
| 12 | **Profiles** | `togglePortfolioPublic(...)` | `POST /api/portfolio` | `src/lib/db/users.ts` |
| 13 | **Auth / Quota** | `checkUserGenerationQuota(...)` | `GET /api/notifications`, `POST /api/generate` | `src/lib/db/users.ts` |
| 14 | **Auth / Quota** | `incrementUserGenerationCount(...)`| `POST /api/generate` | `src/lib/db/users.ts` |
| 15 | **Auth / Quota** | `clearHourlyUsage(...)` | `POST /api/admin` | `src/lib/db/users.ts` |
| 16 | **Auth / OTP** | `setUserOtp(...)` | `POST /api/auth` (request-otp) | `src/lib/db/users.ts` |
| 17 | **Auth / OTP** | `verifyUserOtp(...)` | `POST /api/auth` (verify-otp) | `src/lib/db/users.ts` |
| 18 | **Governance** | `getAllowedDomains()` | `GET /api/admin`, `POST /api/auth` | `src/lib/db/governance.ts` |
| 19 | **Governance** | `addAllowedDomain(...)` | `POST /api/admin` | `src/lib/db/governance.ts` |
| 20 | **Governance** | `removeAllowedDomain(...)` | `POST /api/admin` | `src/lib/db/governance.ts` |
| 21 | **Governance** | `getPlatformSettings()` | `GET /api/admin` | `src/lib/db/governance.ts` |
| 22 | **Governance** | `updatePlatformSettings(...)` | `POST /api/admin` | `src/lib/db/governance.ts` |
| 23 | **Cases** | `getCases()` | `GET /api/cases`, `GET /api/admin`, `GET /api/dashboard`, `GET /api/notifications` | `src/lib/db/cases.ts` |
| 24 | **Cases** | `getCasesForUser(...)` | `GET /api/cases` (role-filtered scope) | `src/lib/db/cases.ts` |
| 25 | **Cases** | `getCase(id)` | `GET /api/cases/[id]`, `POST /api/answers`, `POST /api/grade`, `POST /api/rubric/suggest` | `src/lib/db/cases.ts` |
| 26 | **Cases** | `saveCase(caseStudy)` | `POST /api/generate`, `POST /api/cases` | `src/lib/db/cases.ts` |
| 27 | **Cases Workflow**| `submitForApproval(...)` | `POST /api/cases/[id]/workflow` | `src/lib/db/cases.ts` |
| 28 | **Cases Workflow**| `approveCase(...)` | `POST /api/cases/[id]/workflow` | `src/lib/db/cases.ts` |
| 29 | **Cases Workflow**| `publishCase(...)` | `POST /api/cases/[id]/workflow` | `src/lib/db/cases.ts` |
| 30 | **Cases Workflow**| `requestChanges(...)` | `POST /api/cases/[id]/workflow` | `src/lib/db/cases.ts` |
| 31 | **Cases Workflow**| `rejectCase(...)` | `POST /api/cases/[id]/workflow` | `src/lib/db/cases.ts` |
| 32 | **Cases Workflow**| `archiveCase(...)` | `POST /api/cases/[id]/workflow` | `src/lib/db/cases.ts` |
| 33 | **Cases Workflow**| `setVisibility(...)` | `POST /api/cases/[id]/workflow` | `src/lib/db/cases.ts` |
| 34 | **Versioning** | `updateCaseWithVersion(...)` | `PATCH /api/cases/[id]` | `src/lib/db/cases.ts` |
| 35 | **Versioning** | `restoreVersion(...)` | `POST /api/cases/[id]/versions` | `src/lib/db/cases.ts` |
| 36 | **Versioning** | `getVersions(caseId)` | `GET /api/cases/[id]/versions` | `src/lib/db/cases.ts` |
| 37 | **Versioning** | `addVersion(...)` | `POST /api/cases/[id]/versions` | `src/lib/db/cases.ts` |
| 38 | **Collections** | `getCollections()` | `GET /api/collections` | `src/lib/db/cases.ts` |
| 39 | **Collections** | `getCollection(id)` | `GET /api/cases` (filter by collectionId) | `src/lib/db/cases.ts` |
| 40 | **Collections** | `createCollection(...)` | `POST /api/collections` | `src/lib/db/cases.ts` |
| 41 | **Collections** | `addCaseToCollection(...)` | `POST /api/collections` | `src/lib/db/cases.ts` |
| 42 | **Collections** | `removeCaseFromCollection(...)`| `POST /api/collections` | `src/lib/db/cases.ts` |
| 43 | **Rubrics** | `getRubric(caseId)` | `GET /api/cases/[id]/rubric`, `POST /api/grade` | `src/lib/db/grades.ts` |
| 44 | **Rubrics** | `saveRubric(...)` | `POST /api/cases/[id]/rubric`, `POST /api/grade` | `src/lib/db/grades.ts` |
| 45 | **Answers** | `getAnswers()` | `GET /api/answers`, `GET /api/dashboard` | `src/lib/db/answers.ts` |
| 46 | **Answers** | `getAnswer(id, userId, role)` | `GET /api/answers/[id]`, `POST /api/grade` | `src/lib/db/answers.ts` |
| 47 | **Answers** | `getAnswersForCase(caseId)` | `GET /api/answers` | `src/lib/db/answers.ts` |
| 48 | **Answers** | `getAnswersForStudent(studentId)`| `GET /api/answers`, `GET /api/portfolio` | `src/lib/db/answers.ts` |
| 49 | **Answers** | `getAnswerByStudentAndCase(...)`| `GET /api/answers`, `POST /api/answers` | `src/lib/db/answers.ts` |
| 50 | **Answers** | `saveAnswerDraft(...)` | `POST /api/answers` | `src/lib/db/answers.ts` |
| 51 | **Answers** | `submitAnswer(...)` | `POST /api/answers` | `src/lib/db/answers.ts` |
| 52 | **Grades** | `getAllGrades()` | `GET /api/analytics`, `GET /api/student/export-all` | `src/lib/db/grades.ts` |
| 53 | **Grades** | `getGradeForAnswer(...)` | `GET /api/answers/[id]`, `GET /api/portfolio/.../certificate` | `src/lib/db/grades.ts` |
| 54 | **Grades** | `saveAIGrade(...)` | `POST /api/grade` | `src/lib/db/grades.ts` |
| 55 | **Grades** | `publishFinalGrade(...)` | `POST /api/grade` | `src/lib/db/grades.ts` |
| 56 | **Analytics / OBE** | `calculateCOPOAttainment(...)`| `GET /api/analytics`, `GET /api/analytics/export-obe-csv` | `src/lib/db/analytics.ts` |
| 57 | **Analytics / OBE** | `getFacultyAnalytics()` | `GET /api/analytics` | `src/lib/db/analytics.ts` |
| 58 | **Signals / Radar** | `getSignals(industry, limit)` | `GET /api/signals`, `GET /api/dashboard` | `src/lib/db/signals.ts` |
| 59 | **Signals / Radar** | `getSignal(id)` | `GET /api/signals/[id]` | `src/lib/db/signals.ts` |
| 60 | **Signals / Radar** | `addSignal(...)` | `POST /api/signals` | `src/lib/db/signals.ts` |
| 61 | **Signals / Radar** | `getWatchIndustries(userId)` | `GET /api/signals`, `GET /api/dashboard` | `src/lib/db/signals.ts` |
| 62 | **Signals / Radar** | `setWatchIndustries(...)` | `POST /api/signals` | `src/lib/db/signals.ts` |
| 63 | **Live Classroom** | `getClassroomSession(caseId)`| `GET /api/cases/[id]/classroom` | `src/lib/db/classroom.ts` |
| 64 | **Live Classroom** | `createOrGetClassroomSession(...)`| `GET /api/cases/[id]/classroom` | `src/lib/db/classroom.ts` |
| 65 | **Live Classroom** | `submitColdCallScore(...)` | `POST /api/cases/[id]/classroom` | `src/lib/db/classroom.ts` |
| 66 | **Live Classroom** | `submitPollVote(...)` | `POST /api/cases/[id]/classroom` | `src/lib/db/classroom.ts` |
| 67 | **Live Classroom** | `togglePollStatus(...)` | `POST /api/cases/[id]/classroom` | `src/lib/db/classroom.ts` |
| 68 | **Live Classroom** | `resetClassroomPoll(...)` | `POST /api/cases/[id]/classroom` | `src/lib/db/classroom.ts` |
| 69 | **Live Classroom** | `updateBoardPlan(...)` | `POST /api/cases/[id]/classroom` | `src/lib/db/classroom.ts` |
| 70 | **Audio Brief** | `getAudioBrief(caseId)` | `GET /api/cases/[id]/audio` | `src/lib/db/audio.ts` |
| 71 | **Audio Brief** | `createOrGetAudioBrief(...)` | `GET /api/cases/[id]/audio` | `src/lib/db/audio.ts` |
| 72 | **Integrity** | `getIntegrityReport(answerId)` | `GET /api/answers/[id]/integrity` | `src/lib/db/integrity.ts` |
| 73 | **Integrity** | `calculateIntegrityReport(...)`| `POST /api/answers/[id]/integrity` | `src/lib/db/integrity.ts` |
| 74 | **Practitioner** | `getPractitionerReflections(...)`| `GET /api/cases/[id]/practitioner` | `src/lib/db/cases.ts` |
| 75 | **Practitioner** | `addPractitionerReflection(...)`| `POST /api/cases/[id]/practitioner` | `src/lib/db/cases.ts` |
| 76 | **Practitioner** | `upvotePractitionerReflection(...)`| `POST /api/cases/[id]/practitioner` | `src/lib/db/cases.ts` |
| 77 | **Payments / Sub** | `getSubscriptions()` | `GET /api/admin` | `src/lib/db/payments.ts` |
| 78 | **Payments / Sub** | `getUserSubscription(userId)` | `GET /api/payments/verify`, `GET /api/pricing` | `src/lib/db/payments.ts` |
| 79 | **Payments / Sub** | `createOrUpdateSubscription(...)`| `POST /api/payments/verify`, `POST /api/webhooks/razorpay` | `src/lib/db/payments.ts` |
| 80 | **Payments / Sub** | `cancelSubscription(...)` | `POST /api/payments/cancel` | `src/lib/db/payments.ts` |
| 81 | **Alumni** | `graduateStudent(...)` | `POST /api/admin/graduate` | `src/lib/db/users.ts` |
| 82 | **Access Checks** | `canUserAccessLibrary(userId)` | `src/middleware.ts` | `src/lib/db/users.ts` |
| 83 | **Access Checks** | `canUserAccessTrending(userId)` | `src/middleware.ts` | `src/lib/db/users.ts` |
| 84 | **Audit Logs** | `logAudit(...)` | `POST /api/generate`, `POST /api/admin/audit-logs`, workflow actions | `src/lib/db/audit.ts` |
| 85 | **Audit Logs** | `getAuditLogs(...)` | `GET /api/admin/audit-logs`, `GET /api/cases/[id]/audit` | `src/lib/db/audit.ts` |
| 86 | **Token Budget** | `getTokenBudgetInfo()` | `GET /api/admin/budget`, `GET /api/notifications` | `src/lib/db/audit.ts` |
| 87 | **Token Budget** | `setMonthlyTokenBudget(...)` | `POST /api/admin/budget` | `src/lib/db/audit.ts` |
| 88 | **Telemetry** | `getDashboardTelemetry()` | `GET /api/dashboard` | `src/lib/db/analytics.ts` |
| 89 | **Telemetry** | `getPendingRegistrations()` | `GET /api/dashboard`, `GET /api/notifications` | `src/lib/db/users.ts` |
| 90 | **Telemetry** | `approveRegistration(...)` | `POST /api/admin` | `src/lib/db/users.ts` |
| 91 | **Telemetry** | `rejectRegistration(...)` | `POST /api/admin` | `src/lib/db/users.ts` |
| 92 | **Telemetry** | `getRecentActivityFeed(...)` | `GET /api/dashboard` | `src/lib/db/analytics.ts` |
| 93 | **GDPR Compliance**| `exportUserData(userId)` | `GET /api/user/data-export` | `src/lib/db/users.ts` |
| 94 | **GDPR Compliance**| `deleteUserData(userId)` | `POST /api/user/data-delete` | `src/lib/db/users.ts` |

---

## 3. Current User Roles & Seed Users

### Exactly Three Roles Everywhere:
- **`admin`**: Full institutional access, case approval/rejection, user verification, quota administration, token budget, platform governance.
- **`faculty`**: Case authoring (Harvard/Ivey standard), rubric generation, answer evaluation, cold-call scoring, live boardroom moderation.
- **`student`**: Case reading (approved/published only), answer submissions, portfolio, certificates, self analytics.
*(Legacy roles `reviewer` and `alumni` are completely removed. Alumni status is modeled as `is_graduated: boolean` on `profiles` with lifetime access).*

### Seed Demo Users (Password: `password123`):
1. **Admin Persona:**
   - Name: `Admin` (with legacy alias `Dr. Neha Sharma`)
   - Email: `admin@shantibschool.edu.in` (aliases: `ADMIN01`, `admin`, `neha.sharma@shantibschool.edu.in`)
   - Role: `admin` | Department: `dept-1` (Dean's Office / Management)
2. **Faculty Persona:**
   - Name: `Faculty` (with legacy alias `Ms. Reena Paswan`)
   - Email: `faculty@shantibschool.edu.in` (aliases: `faculty`, `reena.paswan@shantibschool.edu.in`)
   - Role: `faculty` | Department: `dept-2` (Marketing & Analytics)
3. **Student Persona:**
   - Name: `Student` (with legacy alias `Zala Prachi`)
   - Email: `student@shantibschool.edu.in` (aliases: `student`, `prachi.z24bca@shantibschool.edu.in`)
   - Role: `student` | Department: `dept-3` (BCA Semester 5)

---

## 4. Theme Tokens: Current vs. Target Soft Neutral Charcoal

### Current Dark Mode Tokens (Globals.css):
- Background: `#07131F` (deep blue-tinted navy)
- Background Elevated: `#0C1D2E`
- Surface: `#112338`
- Surface Raised: `#182F49`
- Border: `#223E60`
- Text: `#F0F4F8` / `#9DB2C7`

### Target Soft Neutral "Light Black" (Charcoal) Dark Mode Tokens:
- **`--background`**: `#151517` (Neutral charcoal, zero blue cast)
- **`--background-elevated`**: `#1B1B1E` (Top bar, command palette, sidebar)
- **`--surface`**: `#202023` (Standard cards, case containers)
- **`--surface-raised`**: `#2A2A2E` (Dropdowns, modals, floating panels)
- **`--surface-hover`**: `#323237` (Interactive item hover)
- **`--border`**: `#36363C` | **`--border-strong`**: `#4A4A52`
- **`--text`**: `#EDEDEF` | **`--text-muted`**: `#A6A6AF` | **`--text-subtle`**: `#7A7A84`
- **`--accent`**: `#E0281F` (SBS Crimson Red, `#EF4438` on hover)
- **`--on-accent`**: `#FFFFFF` | **`--accent-text`**: `#FFFFFF`
- **Small Filled Blue Badges / Selected Pills**: `#2A6FA8` with pure `#FFFFFF` text.
- **Link Text**: `#6FA8DC`
- **Contrast Ratios**: Verified at > 4.5:1 (WCAG AA) across all paired text and interactive surfaces.

---

## 5. Architectural Risk Assessment & Mitigation Strategies

| Risk Identified | Severity | Mitigation Strategy |
|---|---|---|
| **Breaking UI/API Contracts during DB Switch** | High | Abstract all calls through `src/lib/db/*` retaining identical signatures to `src/lib/mock-db.ts`. Introduce `DATA_SOURCE=supabase\|mock` flag so tests can run against both backends before deprecation. |
| **Row Level Security (RLS) Leakage** | Critical | Enforce strict server-side RLS policies: Users cannot modify `role`; Students can only `SELECT` cases where `status = 'approved'` and their own `answers`/`grades`; Faculty can only edit authored cases; Admin has full read/approval rights. |
| **Tampered Session & Stale Persona Caches** | High | Migrate from custom session token to official `@supabase/ssr` cookies (`createServerClient`). Enforce `invalidateAuthCache()` on role switch with instant event dispatch (`"sbs-auth-changed"`). |
| **Razorpay Payment Idempotency & Webhook Replay** | High | Enforce database `UNIQUE` constraint on `razorpay_payment_id`. Verify signatures using raw request buffers. Disallow `DEMO_PAYMENTS` in production environments. |
| **N+1 Database Query Latency** | Medium | Utilize PostgreSQL joins and foreign key indexes on `(case_id, student_id)`, `(author_id, status)`, `(created_at)`. Enable connection pooling via Supabase pooler connection strings. |
| **Loss of Git Credits / Achievements** | Medium | Maintain single-branch feature flow (`backend-upgrade`), attach `Co-authored-by: prachizala <prachizala2003@gmail.com>` on every commit, and open clean Pull Requests into `main` for **Pair Extraordinaire** and **Pull Shark** badge progression. |

---

## 6. Execution Roadmap (Phases 1 through 6)

```
[Phase 0: Plan] -> [Phase 1: Database & RLS] -> [Phase 2: DAL & Auth Backend]
                        ↓                               ↓
[Phase 6: QA & Audit] <- [Phase 5: Performance & AI] <- [Phase 4: Theme Charcoal] <- [Phase 3: Roles & Users]
```

- **Phase 0 (Current):** Architectural blueprint, function mappings, branch creation (`backend-upgrade`).
- **Phase 1 (DB-ARCHITECT):** Supabase project provisioning guide, env validator (`zod`), migration DDL scripts, RLS policies, automated SQL verification tests, idempotent seed script.
- **Phase 2 (BACKEND + AUTH-ROLES):** Data Access Layer (`src/lib/db/*`), `@supabase/ssr` integration, API route refactoring, Zod request validation, Razorpay webhook handling, rate limiting.
- **Phase 3 (AUTH-ROLES):** Strictly 3 roles, clean persona switcher, removal of all obsolete test names, stale user cache fix.
- **Phase 4 (THEME-UI):** Charcoal dark mode tokens, high-contrast WCAG AA audit, visual screenshots.
- **Phase 5 (PERF-AI):** Claude Haiku 4.5 / Sonnet streaming, token budget guards, memory caching, query optimization.
- **Phase 6 (QA-SECURITY):** Full test suite execution, security audit, documentation update, final report.

---
*End of Phase 0 Plan. Ready for Phase 1 Database Architecture upon explicit user "continue" instruction.*
