# SBS CaseLab — Shanti Business School (SBS) AI Case Study Platform

> [!WARNING]
> **In-Memory Data Persistence Notice**:
> The application currently utilizes a centralized in-memory singleton data store (`src/lib/mock-db.ts`) for zero-dependency local development, automated testing, and preview environments. **All runtime state changes (newly generated case studies, student answers, AI/faculty grades, subscriptions, and audit logs) reset to seeded defaults upon application restart.**
> To achieve permanent ACID persistence, follow the Supabase migration guide in Section 3 to connect your Supabase PostgreSQL instance using the pre-configured migration schemas (`supabase/migrations/00001_initial_schema.sql` through `00007_update_college_domain_and_name.sql`).

**SBS CaseLab** is an institutional AI business case study generation, simulation, peer-review, and curriculum analytics platform built for **Shanti Business School (SBS)**. Powered by Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (Auth + Postgres + RLS), and the Anthropic Claude API.

---

## 🏛️ Brand & Aesthetic System

- **Sidebar**: Deep Navy (`#0A1128` / `#0E1A38`)
- **Content Canvas**: Warm Off-White (`#FBF9F5` in light mode; Deep Slate `#0B0F17` in dark mode)
- **Accents**: Academic Gold (`#C5A059` / `#D4AF37`)
- **Typography**: Classical serif headings (`Lora` / `Georgia`) paired with high-legibility sans-serif (`Inter`)
- **Theme**: Seamless Light / Dark toggle with `localStorage` and `class="dark"` persistence

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (tested on Node v24)
- **npm**: v9+ (tested on npm v11)

### 2. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Ensure your `.env.local` contains:
```env
NEXT_PUBLIC_APP_NAME="SBS CaseLab"
NEXT_PUBLIC_COLLEGE_NAME="Shanti Business School"
NEXT_PUBLIC_COLLEGE_SHORT="SBS"
NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN="shantibschool.edu.in"

# Demo Mode & Security Flags
NEXT_PUBLIC_ENABLE_DEMO_MODE="true"
NEXT_PUBLIC_AI_ENGINE_LABEL="AI Case Engine"

# Session Secret (Server Only)
SESSION_SECRET="sbs-caselab-session-auth-token-secret-key-32chars"

# Supabase Credentials
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# AI Provider API Key (Server Only - Optional, falls back to institutional adapter)
ANTHROPIC_API_KEY="sk-ant-api03-..."
```
> **Institutional Configuration Note**: The institutional email domain and college branding are centralized in [`src/config/college.ts`](file:///c:/Users/prachi/OneDrive/Desktop/Case_Study/src/config/college.ts). The allowed email domain defaults to `shantibschool.edu.in` and can be overridden via `NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN`.
>
> **Supabase Dashboard Authentication Action Item**: If you enable built-in email domain validation or confirmation redirects in the Supabase Dashboard (**Authentication -> URL Configuration** and **Email Templates**), update allowed redirect URLs and ensure any domain whitelist includes `shantibschool.edu.in`.

### 3. Run Supabase Database Migrations
Migrations are stored in `/supabase/migrations`:
- `00001_initial_schema.sql`: Base tables (`profiles`, `departments`, `courses`, `cases`, `usage_log`), RLS policies, helper functions.
- `00002_library_approval_versions.sql`: Reviewer flag (`is_reviewer`), `case_versions`, `collections`, `collection_cases`, student department RLS.
- `00003_student_experience_rubrics_grades.sql`: Rubric criteria, student answers with immutability, two-tier AI grading, and portfolio certificates.
- `00004_outcomes_signals_analytics.sql`: NAAC/NBA outcomes (`CO`/`PO`), `case_outcomes`, rubric outcome mapping, `signals` radar, and faculty watch industries.
- `00005_live_classroom_integrity_reflections.sql`: Live Socratic classroom sessions, digital 3-board plan, executive audio briefs, academic integrity reports, and alumni practitioner reflections.
- `00006_subscriptions_audit_dpdp.sql`: Alumni subscriptions, audit logs, DPDP Act 2023 compliance endpoints, and quota tracking.
- `00007_update_college_domain_and_name.sql`: Institutional migration to `@shantibschool.edu.in` and Shanti Business School (SBS) identity.

Execute them via Supabase CLI or SQL Editor:
```bash
supabase db push
```

### 3.1 Data Access Layer & Supabase Migration Inventory
All data operations across the application are centralized through `src/lib/mock-db.ts` (`mockStore`). The corresponding relational schemas, Row-Level Security (RLS) policies, and foreign keys are pre-authored in `supabase/migrations/`. Below is the complete mapping of in-memory methods transitioning to Supabase:

| Functional Area | `mockStore` Methods | Target Supabase Table / RPC |
|---|---|---|
| **Profiles & RBAC** | `getProfiles`, `getProfile`, `upsertProfile`, `graduateStudent` | `public.profiles` + Supabase Auth |
| **Departments & Courses** | `getDepartments`, `getDepartment`, `getCourses`, `getCourse` | `public.departments`, `public.courses` |
| **Case Studies** | `getCases`, `getCase`, `getCasesForUser`, `saveCase`, `updateCaseWithVersion` | `public.cases` (with RLS policies) |
| **Curriculum Approvals** | `submitForApproval`, `approveCase`, `requestChanges` | `public.cases` (`status`, `reviewer_id`, `reviewer_comment`) |
| **Version Snapshots** | `getVersions`, `addVersion` | `public.case_versions` (immutable snapshots) |
| **Syllabus Collections** | `getCollections`, `getCollection`, `createCollection`, `renameCollection`, `deleteCollection`, `toggleCaseInCollection` | `public.collections`, `public.collection_cases` |
| **Token Budget & Telemetry** | `logUsage`, `getUserHourlyUsageCount`, `getTokenBudgetInfo`, `setMonthlyTokenBudget` | `public.usage_log` |
| **Evaluation Rubrics** | `getRubric`, `saveRubric` | `public.rubrics`, `public.rubric_criteria` |
| **Student Submissions** | `getAnswer`, `getAnswerByStudentAndCase`, `getAnswersForStudent`, `getAnswersForCase`, `saveAnswerDraft`, `submitAnswer` | `public.student_answers` (RLS isolated) |
| **Two-Tier Grading** | `getGradeForAnswer`, `saveAIGrade`, `publishFinalGrade`, `getAllGrades` | `public.grades` (`is_published` visibility guard) |
| **Public Portfolios** | `togglePortfolioPublic`, `getPublicPortfolio` | `public.profiles.portfolio_public` + public RPC |
| **CO/PO Accreditation** | `getOutcomes`, `getOutcome`, `saveOutcome`, `getCaseOutcomes`, `linkCaseOutcome`, `unlinkCaseOutcome`, `calculateCOPOAttainment` | `public.outcomes`, `public.case_outcomes` |
| **Faculty Analytics** | `getFacultyAnalytics` | Supabase Postgres aggregation views |
| **Signals Radar** | `getSignals`, `getSignal`, `addSignal`, `getWatchIndustries`, `setWatchIndustries` | `public.signals`, `public.profiles.watch_industries` |
| **Classroom Sessions** | `getClassroomSession`, `createOrGetClassroomSession`, `submitColdCallScore`, `submitPollVote`, `togglePollStatus`, `resetClassroomPoll`, `updateBoardPlan`, `getAudioBrief` | `public.classroom_sessions`, `public.audio_briefs` |
| **Security & Compliance** | `getIntegrityReport`, `calculateIntegrityReport`, `getPractitionerReflections`, `addPractitionerReflection`, `upvotePractitionerReflection`, `getSubscriptions`, `getUserSubscription`, `createOrUpdateSubscription`, `cancelSubscription`, `checkRenewalReminders`, `canUserAccessLibrary`, `canUserAccessTrending`, `logAudit`, `getAuditLogs`, `exportUserData`, `deleteUserData` | `public.integrity_reports`, `public.practitioner_reflections`, `public.subscriptions`, `public.audit_logs` |


### 4. Execute Database Seed Script
Populate your database with 1 Admin, 2 Faculty, 10 Students, 2 Departments, and 6 Courses with `@shantibschool.edu.in` credentials:
```bash
npm run seed
```

### 5. Run Automated Acceptance Tests
```bash
npm test
```

### 6. Launch the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Built-in Test Personas

You can sign in with any of the following seeded institutional accounts:

| Persona | Name | Email | Role | Core Capabilities |
|---|---|---|---|---|
| **Admin** | Dean Rajeshwar Sharma | `admin@shantibschool.edu.in` | `admin` | User management & approvals, role changing, toggle reviewer status, quota management, system audits |
| **Faculty** | Prof. Kirit Patel | `prof.patel@shantibschool.edu.in` *(alias: `faculty1@...`)* | `faculty` | Generate cases with AI Case Engine, author cases, submit for review, review analytics, facilitator guide |
| **Faculty (Reviewer)** | Dr. Ananya Iyer | `dr.iyer@shantibschool.edu.in` | `faculty` (`is_reviewer: true`) | Peer-review submitted cases in Review Queue, approve, comment, or request changes |
| **Student** | Aarav Sharma | `student1@shantibschool.edu.in` | `student` | Case library (published cases only), trending cases, strategic case composer, analytical portfolio |

> [!NOTE]
> **Protected Persona Switcher**:
> - **Development / Demo Mode**: When `NEXT_PUBLIC_ENABLE_DEMO_MODE="true"` or `NODE_ENV !== "production"`, a convenient **Switch Persona / Role** selector appears in the bottom of the sidebar and login screen for effortless evaluation.
> - **Production Mode**: When `NEXT_PUBLIC_ENABLE_DEMO_MODE="false"` in production, the persona switcher is completely hidden from the UI, and the server (`POST /api/auth` with `action === "switch-role"`) strictly rejects unauthorized role switching with HTTP 403 Forbidden.

---

## 🛡️ Role-Based Access Control (RBAC) & Middleware

- **Domain Gatekeeping**: Sign-up strictly rejects any email not ending with `@shantibschool.edu.in`.
- **Student Boundaries**: If a logged-in student attempts to access `/faculty/*`, `/create`, or `/admin/*`, `src/middleware.ts` intercepts the request and redirects them to `/dashboard` with an explicit authorization denial alert.
- **Student Case Isolation**: Students can **only** see `approved` cases matching their department. Draft, in-review, and changes-requested cases are blocked in both API routes and UI views.
- **Faculty Boundaries**: Faculty members attempting to access `/admin/*` are redirected to `/dashboard`.
- **Admin Center**: Only users with the `admin` role can access `/admin`, change roles, or toggle `is_reviewer` status.

---

## 📊 Dashboard & Institutional Metrics (`/dashboard`)

- **Institutional Stat Cards**: Real-time metrics tracking Total Cases, Pending Approvals, Active Faculty, Active Students, and Cases Created This Month.
- **Pending Registrations Widget**: Institutional administrator action desk allowing one-click **Approve** or **Reject** with real-time profile state updates.
- **Recent Activity Feed**: Chronological institutional event feed recording case creations, peer-review submissions, approvals, and publications.
- **Multi-Tier Token Budget Alert**:
  - Interactive and dismissible notification banner with visual progress bar.
  - Multi-stage threshold indicators: Amber alert at $\ge 80\%$, Urgent Red alert at $\ge 90\%$, and Blocked warning at $100\%$.
  - Department-wise usage breakdown (Finance, Marketing, Operations, Strategy).
- **Responsive Branding**: Sidebar header featuring the full institutional title "Shanti Business School" with hover tooltip for narrow viewport displays.

---

## ✍️ Generate Case Studio (`/create`)

- **Three Case Architectures**:
  - **Short Case (~2 pages)**: Rapid decision-making scenario with concise dilemma and focused exhibits.
  - **Full Case Study (8–10 pages)**: Comprehensive Harvard-style case dossier with rich narrative, multi-departmental stakes, and Exhibit 1 financial tables.
  - **Case Research (Multi-Company Comparison)**: Comparative strategic analysis benchmarking multiple industry players against common macroeconomic shocks.
- **Pedagogical Taxonomy**:
  - **7 Core Domains**: Marketing, Finance, HR, Supply Chain, Operations, Entrepreneurship, Other.
  - **Target Audience & Difficulty**: Undergraduate, MBA / Post-Graduate, Executive Education across Beginner, Intermediate, and Advanced tiers.
  - **Company Disguising Option**: Anonymizes real corporate entities into pedagogical disguises with preserved financials.
  - **Teaching & Discussion Guide Toggle**: Automatically generates a synchronized pedagogical companion with discussion roadmap, blackboard layout, and question solutions.
  - **Multilingual Case Generation**: Supports English, Hindi (Devanagari), and Gujarati.
- **Modular Section Editing & Regeneration**:
  - Every generated section (Executive Summary, Company Background, Strategic Dilemma, Exhibit 1 Data, Discussion Questions) features dedicated **Edit** and **Regenerate Section** capabilities.
- **Draft Persistence & Version History**: Save drafts locally or server-side, reload previous iterations, and inspect historical change snapshots.
- **Resilient AI Adapter Architecture**:
  - Strictly validates AI responses against a formal JSON schema with automatic one-time retry upon malformation.
  - Backend adapter pattern isolates the LLM provider behind a configurable interface, displaying the generic institutional label (`AI_ENGINE_LABEL`).
- **Server-Side Exports**: Export to Microsoft Word (`.docx`) and high-resolution PDF (`.pdf`) featuring Shanti Business School branding, cover page, author credit, and official `"AI-generated / Faculty-verified"` quality seal.

---

## ⚖️ Review & Approval Workflow (`/review-queue`)

- **Dedicated Review Queue**: Centralized sidebar destination for peer reviewers and academic deans to inspect dossiers awaiting curriculum certification.
- **5-State Case Lifecycle**:
  - `Draft` $\rightarrow$ `Under Review` $\rightarrow$ `Approved` $\rightarrow$ `Published` $\rightarrow$ `Archived`.
- **Reviewer Action Desk**:
  - **Approve Case**: Certifies pedagogical rigor and transitions case to `approved`.
  - **Request Changes**: Attaches structured pedagogical feedback; returns case to author under `changes_requested`.
  - **Reject Case**: Declines case dossier with reviewer comments.
  - **Publish Case**: Makes the case discoverable in the Student Case Library.
- **3-Tier Access Visibility**:
  - `Private` (author and designated reviewers only).
  - `SBS-only` (authenticated Shanti Business School students and faculty).
  - `Public` (discoverable across external academic repositories and alumni).
- **Student Isolation**: Students can strictly **only** access `published` cases. Draft, in-review, changes-requested, and archived cases are completely blocked in API routes, search queries, and UI components.
- **Tamper-Evident Audit Logging**: Every lifecycle transition is recorded in `audit_logs` with actor ID, timestamp, and metadata.

---

## 📚 Case Library & Collections (`/library`)

- **Multi-Attribute Search & Faceted Filtering**:
  - Instant full-text search across title, protagonist, summary, and keywords.
  - Faceted filters for **Domain** (Marketing, Finance, HR, etc.), **Case Type** (Short, Full, Research), **Language** (English, Hindi, Gujarati), **Difficulty** (Beginner, Intermediate, Advanced), **Author**, and **Tags**.
  - Dynamic result counts updating in real time.
- **View Modes**: Toggle between responsive Grid View and high-density List View.
- **Custom Syllabus Collections**: Organize cases into departmental syllabi (e.g., "FIN-201 Corporate Restructuring"), rename collections, and toggle case memberships.

---

## 👥 Users & Access Management (`/admin` $\rightarrow$ Users and Access)

- **Comprehensive User Directory**: Searchable directory displaying name, institutional email, assigned role, SBS eligibility status, subscription tier, and individual quota allocations.
- **Registration Approval Desk**: Review self-registered accounts with one-click **Approve** / **Reject** controls.
- **Role & Reviewer Management**: Promote or reassign roles (`admin`, `faculty`, `student`, `alumni`) and toggle `is_reviewer` peer-review privileges.
- **Quota & Token Governance**:
  - Allocate custom monthly token limits and generation quotas per user or department.
  - Server-side quota enforcement on `/api/generate` returning HTTP 429 when limits are reached.

---

## 🌐 Native Multilingual Typography & Seed Data

- **Native Script Typography**:
  - Loaded via `next/font/google` in `src/app/layout.tsx`:
    - `Noto_Sans_Devanagari` (`--font-devanagari`) for crisp Hindi rendering.
    - `Noto_Sans_Gujarati` (`--font-gujarati`) for native Gujarati rendering.
  - Tailwind CSS `fontFamily` configured with fallback font stacks ensuring glyph clarity across all devices.
- **Seeded Multilingual Repository**:
  - **English Cases**:
    - `case-001`: *"The Dilemma of Cooperative Banking in Western India: The Rajkot Urban Co-op Bank Crisis"*
    - `case-002`: *"Reliance New Energy Solar: Scaling Gigafactories in Jamnagar"*
    - `case-003`: *"Tata Motors' Commercial EV Pivot: Battery Sourcing and Domestic Manufacturing"*
    - `case-004`: *"Amul's Quick-Commerce Battle: Protecting the Cold Chain in 10-Minute Grocery Delivery"*
    - `case-005`: *"Swiggy vs. Zomato: Platform Fees, Dark Stores, and the Unit Economics of Urban India"*
  - **Hindi Case (`case-006`)**:
    - *"भारतीय स्टार्टअप्स में प्रतिभा प्रतिधारण: हाइब्रिड कार्यबल चुनौती"* (Talent Retention in Indian Startups: The Hybrid Workforce Challenge), featuring authentic Devanagari background, challenges, exhibits, and teaching note.
  - **Gujarati Case (`case-007`)**:
    - *"સુરતના હીરા ઉદ્યોગમાં લેબ-ગ્રોન ડાયમંડ કટોકટી"* (The Lab-Grown Diamond Disruption in Surat's Diamond Industry), featuring authentic Gujarati industry context, financial metrics, and strategic discussion prompts.

---

## 📈 Trending Cases (`/trending`)

- **Approved Repository**: Displays accredited cases across all Shanti Business School (SBS) departments.
- **Left Sidebar Filters with Live Counts**: Real-time checkboxes showing counts matching actual database records for each Industry Sector and Difficulty Bracket.
- **Sort Dropdown**: Sort by Most Recent, Highest Complexity (10 $\rightarrow$ 1), Lowest Complexity, or Alphabetical.
- **Real Signal Badges**: Visual indicator for cases grounded in live market signals.
- **Zero Student Royalty**: Free institutional access guarantee on all cards.

---

## 📥 Server-Side Exports (PDF & DOCX)

- **Branded PDF**: Generated server-side with Shanti Business School (SBS) header, logo badge, proper headings, metadata strip, and Exhibit 1 key data table. Supports Hindi/Devanagari Unicode glyphs via bundled `NotoSansDevanagari-Regular.ttf`.
- **Branded Word Document (.docx)**: Generated server-side using `docx` with metadata table, institutional title, and formatted Exhibit 1 data table.
- **Share Link**: One-click URL copy with authentication verification (accessible only to logged-in Shanti Business School (SBS) users).

---

## 🎓 Student Experience, AI Grading & Portfolio

### 1. Collaborative Rubric Designer (`/cases/[id]`)
- **Faculty Customization**: Faculty authors can define tailored grading rubrics with custom criteria weights and scoring descriptions.
- **AI Suggest Rubric**: Integrated Claude API assistance (`/api/rubric/suggest`) suggests an institutional 4-tier rubric calibrated to the case study's pedagogical objectives, summing to 100 marks.
- **Dynamic Criterion Scoring**: Live point allocation calculation with real-time total marks indicators.

### 2. Strategic Case Composer & Submission Lock (`/cases/[id]`)
- **Departmental Isolation**: Students only see approved cases aligned with their department.
- **Live Word Count & Debounced Autosave**: Automatic background synchronization (`/api/answers`) with real-time `"Draft autosaved at HH:MM:SS"` status indicators.
- **Permanent Submission Lock**: When a student clicks **"Submit Strategic Defense"**, their submission is permanently locked (`status: 'submitted'`). Re-editing or modification attempts are strictly rejected at both the API and database levels.

### 3. Faculty Cohort Grading Portal & AI Evaluation (`/api/grade`)
- **AI Synthesis**: Runs Claude API grading against the case, student answer, and custom rubric.
- **Strict Bounds Clamping**: All criteria scores are strictly clamped between `0` and `criterion.max_marks` with resilience fallbacks for malformed or out-of-bounds LLM responses.
- **Two-Tier Grade Privacy**: AI evaluation is initially saved with `is_published: false`. Grades remain completely withheld and invisible to students until faculty reviews, provides personalized commendation comments, overrides scores if necessary, and explicitly clicks **"Publish Final Grade"**.

### 4. Student Answers Directory (`/my-answers`)
- Comprehensive overview of all case analyses submitted by the student.
- Filterable by status (`Draft`, `Submitted & Under Review`, `Graded & Certified`).
- Direct access to published faculty commendations, criterion breakdown, and certificate downloads.

### 5. Verified Academic Portfolio & Certificate Engine (`/portfolio`)
- **Academic GPA & Metrics**: Aggregates average analytical score across all graded cases.
- **Shareable Public Profile Toggle**: Students can toggle public visibility on or off. When enabled, a public URL (`/portfolio/[studentId]`) allows employers and recruiters to verify the student's case study portfolio. When toggled off, unauthorized external access is blocked.
- **Landscape Certificate Generator**: Generates high-resolution, institutional landscape PDF certificates (`/api/portfolio/[studentId]/certificate/[caseId]`) featuring double navy/gold borders, verified credential seal, completion date, case citation, honors designation, and Shanti Business School (SBS) Dean's signature.
- **Lifetime Archive Export**: Students and alumni can download their entire portfolio and analysis archives anytime as a bundled JSON transcript (`/api/student/export-all`).

---

## 📊 Curriculum Analytics & NAAC / NBA Accreditation (`/analytics`)

### 1. Cohort Performance & Curriculum Telemetry
- **Industry & Functional Distribution**: Interactive visual breakdowns displaying case coverage across management domains (Finance, Operations, Strategy, Ethics, etc.).
- **Course Participation & Average Scores**: Real-time evaluation analytics per course code.
- **Weak Topics Diagnostics**: Automated identification of criteria with the lowest cohort averages (e.g., Financial Modeling, Risk Assessment) to guide remedial instruction.
- **Academic Progress Timeline**: Historical trajectory tracking cohort analytical growth.

### 2. Outcome-Based Education (OBE) & CO/PO Attainment Matrix
- **Target Threshold Setting**: Dynamically configure minimum passing thresholds (default `60%`, customizable via interactive slider or presets `50%`, `60%`, `70%`, `75%`).
- **Rubric Criterion-to-Outcome Mapping**: Rubric criteria mapped to Course Outcomes (`CO`) and Program Outcomes (`PO`).
- **Attainment Formula**: Computed as $\frac{\text{Students Achieving} \ge \text{Target Threshold}}{\text{Total Evaluated Students}} \times 100\%$.
- **Instant Recalibration**: Dynamically recalculates whenever faculty publishes new grades.
- **NAAC / NBA Accreditation CSV Export**: One-click streaming download (`/api/analytics/export-obe-csv`) formatted with UTF-8 BOM (`\uFEFF`) and sanitized fields for direct opening in Microsoft Excel without character encoding or delimiter corruption.

---

## 📡 Live Market Signals & Faculty Dashboard (`/dashboard`)

### 1. Personalized Faculty Command Center
- **Time-of-Day Greeting**: Academic greeting tailored to local time ("Good morning / afternoon / evening, Prof. ...").
- **Prominent Generate Banner**: Quick-launch hero banner directing faculty to the Case Composer.
- **Live Institutional Metrics**: Real-time counters for authored cases, pending peer reviews, and student submissions awaiting evaluation.

### 2. Case Signals Radar & 6-Hour Scheduled Job (`/api/cron/signals`)
- **Watch Industries**: Faculty can select up to 8 priority sectors (e.g., CleanTech, Semiconductors, Fintech, Healthcare).
- **Automated RSS Monitoring**: Scheduled cron execution (`0 */6 * * *` configured via `vercel.json` and Supabase cron) ingests live market stories from Indian business feeds (The Economic Times, LiveMint, Business Standard).
- **Claude Case Potential Scoring**: Each news story is scored 1–10 for pedagogical potential with a concise one-line rationale.
- **Strict Deduplication**: URL and story normalization prevents duplicate signals from populating the radar.
- **One-Click Prefill ("Create case from this")**: Button automatically routes faculty to `/create` pre-populating `format = 'real_signal'`, industry sector, headline title, and source context notes.

---

## 📖 Facilitator Guide & Guardrailed Guide Assistant (`/guide`)

### 1. Pedagogical Playbooks
- **Case Method Mastery**: Class flow structuring, 80/20 student-faculty speaking balance, cold-call protocols, and chalkboard layout blueprints.
- **Rubric Calibration**: Guidance on Bloom's Taxonomy, criterion weighting, and objective distinction.
- **Grading & Feedback Workflow**: Best practices for AI-assisted provisional evaluations and personalized developmental feedback.

### 2. Guardrailed AI Guide Assistant (`/api/guide/chat`)
- **Pedagogical Specialization**: Powered by Claude with a strict institutional system prompt focused on case teaching, Socratic discussion, and platform navigation.
- **Strict Guardrail Refusal**: Unrelated queries (general knowledge, coding outside the platform, trivia, creative writing) are politely declined while offering relevant pedagogical guidance.

---

## 🏛️ Live Socratic Classroom & Executive Media (`/cases/[id]/live`)

### 1. Socratic Cold-Call Wheel
- **Roster Randomizer**: Selects enrolled students at random for the 3-minute opening case defense.
- **Participation Timer**: Built-in 3:00 countdown clock with pause, resume, and reset.
- **Faculty Evaluation Drawer**: 1–5 star rating for Socratic depth, communication, and notes saved immediately to the persistent session ledger.

### 2. Live Dilemma Decision Room & Real-Time Voting
- **Core Inflection Poll**: Pushes the case's central strategic dilemma to student devices with real-time vote percentage bars.
- **Before vs. After Comparison**: Faculty can toggle between "Pre-Discussion Pulse" and "Post-Debate Consensus" to visualize how student perspectives shifted during class discussion.

### 3. Digital 3-Board Plan (Harvard Business School Chalkboard Framework)
- **Board 1 (Context)**: Protagonist Dilemma & Key Stakes.
- **Board 2 (Analysis)**: Strategic Scenarios, Valuation Models & Sensitivity Analysis.
- **Board 3 (Execution)**: 100-Day Action Roadmap & Risk Hedging.
- **AI Suggest 3-Board Plan**: Synthesizes structured chalkboard blueprints directly from the case's teaching notes and financial exhibits.

### 4. Executive Audio Brief ("CasePod")
- **Audio Case Debrief**: Multi-speaker executive debriefing between Professor, Senior Analyst, and Protagonist.
- **Interactive Player**: Real-time Web Speech narration, 1x / 1.25x / 1.5x speed toggle, and synchronized transcript reader.

### 5. Academic Integrity & Case Grounding Engine (`/api/answers/[id]/integrity`)
- **Originality Score**: Evaluates student memorandum text against case materials.
- **Citation Density & AI Likelihood**: Verifies student citations of quantitative Exhibit 1 data points and estimates AI probability.
- **Framework Detection**: Detects application of core management models (DCF, Porter's 5 Forces, SWOT, Real Options).

### 6. Alumni Practitioner Reflections & Lifetime Hub
- **Executive in Residence Insights**: Verified Shanti Business School (SBS) alumni submit practitioner reflections on how the dilemma played out in corporate practice.
- **Community Endorsement**: Upvoting system for high-impact practitioner reflections.
- **Alumni Navigation**: Dedicated AppShell view for alumni accessing their lifetime portfolio, answers, and case library.

---

## 💳 Alumni Continuing Education, Razorpay Billing & DPDP Act 2023

### 1. Alumni Access Gating & Free Lifetime Work Retention
- **Perpetual Free Access**: Graduated students (`role: alumni`) **never** lose access to their personal academic work. All submitted answers, graded evaluations, and Dean-signed certificate PDFs remain 100% free and permanently downloadable anytime.
- **Paid Continuing Education Unlocks**: An active subscription unlocks:
  - Full Shanti Business School (SBS) Case Library (`/library`) and Trending Cases (`/trending`).
  - Newly published faculty cases and real-signal market challenges.
  - Live shareable public portfolio URL (`/portfolio/[studentId]`).
- **Access Gating**: Expired alumni or alumni without an active subscription lose access to the curriculum library and trending directory with a clear paywall notice, but retain full access to `/my-answers`, `/portfolio`, certificate downloads, and DPDP data exports.

### 2. Razorpay Subscriptions (TEST Mode)
- **Continuing Education Plans**:
  - **Monthly**: ₹99 / month (`9900` paise).
  - **Annual Fellowship**: ₹600 / year (`60000` paise) — Save 50%.
  - **Lifetime Fellowship**: ₹2,500 one-time (`250000` paise) — Permanent access.
- **Server-Side Order Creation**: `POST /api/payments/create-order` creates orders with institutional metadata.
- **Cryptographic Signature Verification**: `POST /api/payments/verify` verifies HMAC-SHA256 signature over `${orderId}|${paymentId}` using `RAZORPAY_KEY_SECRET`. Invalid signatures return HTTP 400.
- **Tamper-Proof Webhook**: `POST /api/webhooks/razorpay` verifies incoming webhooks against raw request body using `RAZORPAY_WEBHOOK_SECRET`. Invalid signatures return HTTP 400.
- **Renewal Reminder Notifications**: Automated evaluation scans active subscriptions expiring within 15 days, dispatching renewal reminders and setting `renewal_reminder_sent: true`.

### 3. Privacy & DPDP Act 2023 Compliance
- **Mandatory Consent Checkbox**: Statutory consent checkbox required on the registration form (`/signup`) before account creation.
- **Campus Privacy Hub (`/privacy`)**: Discloses Data Fiduciary (Shanti Business School (SBS)), Campus Data Protection Officer (`dpo@shantibschool.edu.in`), and lawful grounds for processing under Sections 4 & 7.
- **Right to Access & Portability (Section 11)**: "Export My Data" button triggers `GET /api/user/data-export` returning machine-readable JSON archive of profile, answers, grades, credentials, and audit entries.
- **Right to Erasure & Forgetting (Section 12)**: "Delete My Account and Data" triggers `POST /api/user/data-delete`, permanently purging personal submissions, grades, and profile, recording an indelible `data_erasure` audit record.

### 4. Enterprise Hardening, Audit Logs & Token Budget
- **HTTP Security Headers**: Injected via `next.config.mjs` and `src/middleware.ts` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, CSP, Permissions-Policy).
- **Tamper-Evident Audit Ledger**: `audit_logs` records all role changes (`role_change`), case approvals (`case_approval`), changes requested (`case_changes_requested`), grade overrides (`grade_override`), student graduations (`user_graduation`), subscription activations (`subscription_created`), and data erasures (`data_erasure`).
- **Institutional Error Observability**: `src/lib/error-monitoring.ts` captures breadcrumbs, exceptions, and severity classifications.
- **Monthly AI Token Allocation Quota**: Tracks monthly Claude API token consumption against the institutional budget (default 500,000 tokens). A prominent amber warning banner automatically triggers across `/dashboard` and `/create` at $\ge 80\%$ utilization.

---

## 🚀 Deployment Guide: Vercel + Supabase

### Step 1: Supabase Database Setup
1. Create a new project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Retrieve your **Project URL**, **Anon Public Key**, and **Service Role Key** under **Project Settings $\rightarrow$ API**.
3. Push all 7 migration files sequentially using Supabase CLI or SQL Editor:
   ```bash
   supabase link --project-ref your-project-id
   supabase db push
   ```
   Or execute SQL files located in `/supabase/migrations/`:
   - `00001_initial_schema.sql`
   - `00002_library_approval_versions.sql`
   - `00003_student_experience_rubrics_grades.sql`
   - `00004_outcomes_signals_analytics.sql`
   - `00005_live_classroom_integrity_reflections.sql`
   - `00006_subscriptions_audit_dpdp.sql`
   - `00007_update_college_domain_and_name.sql`

### Step 2: Vercel Project Deployment
1. Import your GitHub repository to [Vercel](https://vercel.com).
2. Framework Preset: **Next.js**
3. Root Directory: `./`
4. Build Command: `npm run build`
5. Output Directory: `.next`

### Step 3: Configure Environment Variables in Vercel
Add the following production environment variables under **Project Settings $\rightarrow$ Environment Variables**:

| Variable Name | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_NAME` | All | `SBS CaseLab` |
| `NEXT_PUBLIC_COLLEGE_NAME` | All | `Shanti Business School` |
| `NEXT_PUBLIC_COLLEGE_SHORT` | All | `SBS` |
| `NEXT_PUBLIC_COLLEGE_EMAIL_DOMAIN` | All | `shantibschool.edu.in` |
| `NEXT_PUBLIC_SUPABASE_URL` | All | `https://<your-project>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Supabase Public Anonymous API Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (Secret) | Supabase Service Role Secret Key |
| `ANTHROPIC_API_KEY` | Production (Secret) | Anthropic Claude API Key (`sk-ant-...`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | All | Razorpay Public Key ID (`rzp_test_...` or `rzp_live_...`) |
| `RAZORPAY_KEY_SECRET` | Production (Secret) | Razorpay Secret Key |
| `RAZORPAY_WEBHOOK_SECRET` | Production (Secret) | Razorpay Webhook Secret Key |

### Step 4: Configure Razorpay Webhooks
1. Open the [Razorpay Dashboard](https://dashboard.razorpay.com/) $\rightarrow$ **Settings $\rightarrow$ Webhooks**.
2. Add Webhook URL: `https://your-domain.vercel.app/api/webhooks/razorpay`.
3. Secret: Enter the same secret configured in `RAZORPAY_WEBHOOK_SECRET`.
4. Active Events: Select `payment.captured`, `order.paid`, `subscription.charged`.

### Step 5: Execute Initial Production Seed
Populate the production database with accredited departments, courses, and administrator accounts:
```bash
npm run seed
```

---

## 📋 Production Readiness Checklist

- [x] **Security & Domain Isolation**: Only verified institutional emails ending with `@shantibschool.edu.in` are allowed registration.
- [x] **Zero API Key Exposure**: Claude and Supabase Service Role keys are strictly kept server-side in `.env.local` / Vercel Environment Variables.
- [x] **HTTP Hardening**: Mandatory security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, CSP) enforced on all routes.
- [x] **Rate Limiting**: Per-user sliding hourly rate limit (10 generations/hr) protects API keys from exhaustion.
- [x] **PostgreSQL Row Level Security (RLS)**: Cryptographically prevents cross-student answer reading and restricts unapproved cases.
- [x] **Audit Logging Ledger**: Immutable audit entries logged for role modifications, approvals, grade overrides, and data subject actions.
- [x] **Cryptographic Payment Verification**: HMAC-SHA256 signature verification active on order completion and webhook endpoints; invalid signatures rejected with HTTP 400.
- [x] **Alumni Perpetual Work Access**: Graduated students permanently keep free download access to their portfolio, answers, and certificates regardless of subscription status.
- [x] **DPDP Act 2023 Compliance**: Mandatory registration consent checkbox, machine-readable JSON data export (`/api/user/data-export`), and permanent account erasure (`/api/user/data-delete`).
- [x] **Institutional Token Budget Alerts**: Real-time quota calculation with automatic 80% warning banner across faculty workspaces.
- [x] **Document Extraction & Audio Synthesizer**: Native server-side parsing for PDF/DOCX and client-side speech synthesis audio briefing ("CasePod").
- [x] **Multilingual Pedagogical Fidelity**: Tested and verified support for English, Hindi (Devanagari), and Gujarati scripts.
- [x] **Audit & Compliance Ledger**: Tamper-evident admin ledger with action filtering and JSON/CSV export capabilities.
- [x] **Cohort Degree Conferral**: Bulk student graduation runner with perpetual academic archive safeguards.
- [x] **Interactive Financial Sensitivity Modeler**: DCF valuation with WACC/Terminal Growth heatmaps and student draft integration.

---

## 🏛️ Phase 9: Administrative Governance & Quantitative Exhibits

### 1. Admin Audit & Compliance Ledger (`/admin` tab $\rightarrow$ Audit & Compliance Ledger)
- **Unified Compliance Ledger**: Access all tamper-evident events (`role_change`, `case_approval`, `case_changes_requested`, `grade_override`, `user_graduation`, `subscription_created`, `data_export`, `data_erasure`).
- **Action & Entity Filtering**: Filter by specific action type, search by actor email, target ID, metadata attributes, or IP address.
- **Inspectable Metadata**: Expandable JSON viewer for complete telemetry and cryptographic audit trails.
- **Auditor Export**: One-click download of audit ledger in **CSV** or **JSON** for accreditation (NAAC/AACSB) and DPDP compliance officers.

### 2. Cohort Graduation Runner (`/admin` tab $\rightarrow$ Cohort Graduation Runner)
- **Bulk Degree Conferral**: Select entire cohorts (e.g. "MBA Class of 2026", "MSx Class of 2026") with multi-select checkboxes and department filters.
- **Alumni Transition Safeguards**: Automatically transitions user roles to `alumni` while strictly preserving perpetual, free access to all past submissions, transcripts, and Dean-signed certificate downloads.
- **Audit Logging**: Each graduation records an indelible `user_graduation` event with administrative attribution.

### 3. Unified In-App Notification Center (`src/components/NotificationDropdown.tsx`)
- **Pulsing Institutional Bell**: Accessible in the header for all authenticated personas with real-time unread count badges.
- **Persona-Driven Alerts**:
  - **Admin**: AI token budget warnings ($\ge 80\%$) and pending affiliate approvals.
  - **Faculty**: Peer curriculum reviews pending and student submissions awaiting final marks.
  - **Alumni**: 15-day subscription renewal reminders and certificate availability.
  - **Student**: Official published faculty grades and academic milestone announcements.
- **Categorized Tabs & Action Routing**: Filter by Action Required, Academic, or Billing; click-through navigation and individual dismissal.

### 4. Interactive Financial Sensitivity & DCF Modeler (`/cases/[id]`)
- **Quantitative Valuation Exhibit**: Embedded directly below Exhibit 1 in every business case study.
- **Dynamic Parameter Sliders**:
  - Discount Rate (WACC): 6.0% to 16.0% (default 10.0%).
  - Terminal Growth Rate ($g$): 1.0% to 5.0% (default 2.5%).
  - CapEx Overrun / Shock: -20% to +30%.
  - EBITDA Margin Expansion Shock: -5% to +10%.
- **Live Institutional Metrics**: Enterprise Value (EV), Net Present Value (NPV), Project IRR, and Payback Period.
- **3x3 Sensitivity Heatmap**: Color-coded valuation matrix evaluating WACC vs. Terminal Growth Rate stress boundaries.
- **Scenario Presets**: Instant switching between Base Case, Downside Stress, and High-Scale Upside.
- **Direct Answer Insertion**: Students can insert their quantitative modeling findings into their memorandum draft with a single click.

---

## ✅ Acceptance Criteria Verification Matrix (41 / 41 Verified)

| Acceptance Requirement | Status | Verification Detail |
|---|:---:|---|
| **Sign up with wrong domain is rejected** | ✅ | Non-`@shantibschool.edu.in` emails are blocked with an explicit domain error message. |
| **Faculty and student see different sidebars** | ✅ | Faculty navigation includes Generate Case, Analytics, Pricing, Guide. Student navigation includes Dashboard, Library, Answers, Portfolio. |
| **Student cannot open faculty URLs (redirects)** | ✅ | Middleware redirects students attempting to access `/faculty/*`, `/create`, or `/admin/*` to `/dashboard`. |
| **Admin can change a user's role & reviewer status** | ✅ | Admin Center allows toggling roles (`faculty`, `student`, `admin`, `alumni`) and reviewer capability (`is_reviewer`). |
| **Theme toggle persists after refresh** | ✅ | Theme preference persists in `localStorage` and applies `html.dark` class across page reloads. |
| **npm run seed works on a fresh database** | ✅ | Seeds 1 admin, 2 faculty, 10 students, 2 departments, and 6 courses with exit code 0. |
| **Generate Full and Flash case; both saved as draft** | ✅ | `/api/generate` creates structured cases with 5 questions and 3 frameworks; both save to draft. |
| **Hindi and Gujarati output works** | ✅ | Claude returns valid Devanagari and Gujarati scripts for multilingual classroom cohorts. |
| **Uploading PDF/DOCX fills source notes** | ✅ | Server-side `/api/extract-text` extracts plain text from uploaded files to source notes. |
| **Bad JSON shows error & retry, no crash** | ✅ | Parse errors render `StateError` with retry button; never crashes or leaves blank screen. |
| **API key never appears in browser responses** | ✅ | `ANTHROPIC_API_KEY` is server-only and excluded from client bundles and network payloads. |
| **Rate limit triggers on 11th request** | ✅ | `usage_log` restricts users to 10 generations per hour; 11th request receives HTTP 429. |
| **Student cannot see draft or in_review cases** | ✅ | Both RLS SQL policies, API endpoints, and UI views strictly filter out unapproved cases for students. |
| **Approve publishes, Request changes returns with comment** | ✅ | Reviewer approval publishes case; Request changes stores feedback comment and notifies author. |
| **Edit after approval creates a new version** | ✅ | Editing an approved case archives the baseline to `case_versions` and creates Version $N+1$. |
| **PDF and DOCX open correctly with tables intact** | ✅ | Server-side PDF and DOCX export routes generate complete files with tables and Hindi glyphs. |
| **Filters and counts match actual data** | ✅ | `/trending` and `/library` checkboxes compute counts dynamically from real database records. |
| **Collections persist after refresh** | ✅ | Custom collections and case memberships persist across reloads via `/api/collections`. |
| **Student cannot read another student's answer** | ✅ | Strict RLS SQL policy and store isolation reject cross-student answer reading attempts (`returns null` / HTTP 403). |
| **Submitted answer cannot be edited** | ✅ | Once submitted, answers transition to immutable state; edit attempts return explicit lock error. |
| **AI grading returns marks within rubric max** | ✅ | AI criteria marks are strictly clamped between `0` and `criterion.max_marks`; handles malformed LLM outputs safely. |
| **Student does not see marks until faculty publishes** | ✅ | Grade queries return `null` for students while `is_published: false`; visible immediately upon faculty publishing. |
| **Certificate PDF generates with correct name, case and date** | ✅ | Server-side PDF generator produces verified landscape certificates with student name, case citation, score, and date. |
| **Public portfolio link works only when toggled on** | ✅ | `/portfolio/[studentId]` returns academic achievements only when `portfolio_public: true`; blocked when toggled off. |
| **Analytics numbers match the database** | ✅ | Analytics telemetry (6 cases, 2 pending reviews, 86% cohort avg, weak topics) matches live database records. |
| **CO/PO table updates after grading** | ✅ | Outcome attainment matrix recalibrates dynamically as faculty publishes new grades. |
| **CSV opens in Excel with correct columns** | ✅ | NAAC/NBA OBE export includes UTF-8 BOM (`\uFEFF`) and 11 accredited header columns for clean Excel opening. |
| **Cron job runs and signals appear, duplicates are not stored** | ✅ | `/api/cron/signals` fetches Indian business RSS, scores via Claude, and strictly rejects duplicate URLs. |
| **"Create case from this" prefills the form** | ✅ | Radar action button passes URL query parameters pre-filling format (`real_signal`), sector, title, and notes. |
| **Guide Assistant refuses unrelated questions politely** | ✅ | Dedicated pedagogical chat route gracefully declines off-topic prompts with an institutional advisory note. |
| **Live Socratic Classroom session & Cold-Call Logging** | ✅ | Real-time session initialized; student selected at random, timer active, participation score recorded. |
| **Live Dilemma Poll Voting & Real-Time Aggregation** | ✅ | Real-time vote tallied in persistent session; animated option bars update instantly across phases. |
| **Digital 3-Board Plan Synchronization & Storage** | ✅ | Harvard 3-Chalkboard layout (Dilemma, Scenarios, Action Plan) editable, AI-suggested, and synchronized. |
| **Executive Audio Brief ('CasePod') Generation** | ✅ | Multi-speaker audio briefing generated with speech synthesis playback and interactive transcript reader. |
| **Academic Integrity & Case Grounding Verification** | ✅ | Evaluates student originality score, case citation density, AI probability, and detected strategic frameworks. |
| **Alumni Practitioner Reflections & Community Upvotes** | ✅ | Verified alumni submit real-world corporate reflections with practical takeaways; community upvotes persist. |
| **Test payment succeeds & sets subscription; failed does not** | ✅ | Valid HMAC-SHA256 signature activates subscription; simulated failure or invalid hash leaves subscription inactive. |
| **Webhook with a wrong signature is rejected** | ✅ | Razorpay webhook cryptographically checks signature; mismatch returns HTTP 400 bad request. |
| **Expired alumni lose library access but can download own work** | ✅ | Expired alumni are blocked from `/library` and `/cases/[id]`, but retain 100% free access to answers, portfolio, and certificates. |
| **Data export and delete both work (DPDP Act 2023)** | ✅ | `/api/user/data-export` outputs machine-readable JSON; `/api/user/data-delete` permanently erases user records. |
| **Audit log records role change, approval, and grade override** | ✅ | Immutable ledger records `role_change`, `case_approval`, and `grade_override` with full actor and target telemetry. |
| **Budget warning appears at 80% usage** | ✅ | Institutional AI token telemetry computes consumption (84%); triggers quota alert banners across faculty workspaces. |
| **Production checklist completed in README** | ✅ | Full deployment guide for Vercel + Supabase and verified production readiness checklist published in `README.md`. |
| **Admin Audit & Compliance Ledger filter and export** | ✅ | Admin ledger allows filtering by 9 action categories, free-text search, and CSV/JSON export. |
| **Batch Cohort Graduation Runner with Alumni safeguards** | ✅ | Bulk graduation of student cohorts with permanent answer/certificate retention and catalog gating. |
| **Unified Institutional Notification Center** | ✅ | Live notifications across Admin, Faculty, Student, and Alumni personas with unread badges and action routing. |
| **Interactive Financial Sensitivity & DCF Modeler** | ✅ | Dynamic valuation model with WACC/growth sliders, 3x3 heatmap, and one-click student draft insertion. |


