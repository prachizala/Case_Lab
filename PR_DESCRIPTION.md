# Security & DPDP Compliance Remediation

## Overview
This pull request addresses 4 critical security, privacy, and compliance issues identified during institutional security review for Shanti Business School (SBS) CaseLab. All fixes maintain existing design tokens, college branding, and AI engine architecture while establishing strict enterprise security controls.

---

## 🛡️ Summary of Changes

### 1. Verification Code Security & Transactional Email Abstraction (Step 1)
- **Eliminated OTP Exposure**: Removed the "Verification code auto-detected" banner and debug OTP fields from all production UI and API responses.
- **Transactional Email Gateway**: Introduced `src/lib/email/send.ts` supporting Resend/transactional providers via environment variables (`EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM`).
- **Pending Admin Approval Fallback**: If an email provider is unconfigured in production, accounts are set to `pending_admin_approval` with a dedicated Admin review queue (`/api/admin/pending-registrations`), preventing unauthorized registrations.
- **Production Guard**: Fatal boot check prevents server startup if `DEMO_OTP_ON_SCREEN=true` is present in a production environment.
- **Cryptographic Hardening**: 6-digit OTPs generated with `crypto.randomInt`, stored strictly as salted SHA-256 hashes, with 10-minute expiry, single-use invalidation, 5-attempt incorrect limit (triggering 15-minute lockout), and a maximum of 3 resends per hour per email/IP.

### 2. Active DPDP Act 2023 Consent & Statutory Rights (Step 2)
- **Active Choice Architecture**: The signup consent checkbox is unchecked by default; the submit button remains disabled until explicitly ticked.
- **Plain-Language Legal Disclosure**: Clear disclosure detailing data collected (name, email, role, answers, grades, certificates), educational processing purposes, access controls, and links to the Privacy Policy.
- **Server Enforcement & Audit Versioning**: Added server validation rejecting registrations without explicit consent; added tracking for `consent_version` (`2023.1`), `policy_version` (`v1.2`), and timestamp `dpdp_consent_at`.
- **Consent Withdrawal & Erasure**: Enabled statutory consent withdrawal at `/api/user/consent-withdraw` alongside existing data export and irreversible deletion.
- **Legal Advisory Note**: Annotated `README.md` that statutory disclosures should receive final sign-off from college legal counsel.

### 3. Role Boundaries & Configurable Student Case Generation (Step 3)
- **Role Boundary Restoration**: Protected `/create`, `/api/casepack/generate`, `/api/generate`, and `/api/casepack/syllabus` so only faculty and admin roles have access by default. Students visiting `/create` are redirected with institutional messaging.
- **Configurable Student Practice Flag (`STUDENT_CASE_GENERATION`)**:
  - Configurable via `STUDENT_CASE_GENERATION=false` (default) or `true`.
  - When enabled, students may generate practice cases with strict server-side safeguards:
    - **Asset Stripping**: Model answer keys, faculty teaching notes, marking criteria, and validation checks are stripped on the server before dispatch.
    - **Practice Isolation**: Practice cases are marked `student_practice: true` with status `draft`, isolated from the public case library.
    - **Daily Quota**: Enforces a strict daily cap (default 3/day, configurable via `STUDENT_GENERATION_LIMIT`).
    - **Audit & Token Accounting**: Student generations record `user_role: "student"` and decrement the institutional token budget.

### 4. Demo Credential Hardening & Enterprise Password Security (Step 4)
- **Purge of Weak Passwords**: Eradicated all hardcoded occurrences of weak demo credentials across the codebase, seed blueprints, test fixtures, and documentation (`git grep -i "pass"+"word123"` returns 0).
- **Hardened Seed Engine**: `scripts/seed.ts` reads `DEMO_USER_PASSWORD` from the environment or generates cryptographically secure 18+ character passwords printed once to stdout. Execution in production is strictly blocked without `--allow-production`.
- **Enterprise Password Policy**: Enforced on signup (minimum 10 characters, at least one uppercase letter, one lowercase letter, one digit, and dictionary password blacklist).
- **Brute-Force Lockout**: Accounts automatically lock for 15 minutes following 5 consecutive failed login attempts.

---

## 🗄️ Database Migrations to Apply

Please apply the following migrations to the Supabase PostgreSQL database in order:

| Migration Number & Name | Target Table | Description |
|---|---|---|
| `00013_token_usage.sql` | `public.token_usage` | Creates the institutional token usage table, indexes for month/model/feature grouping, and RLS policies for atomic LLM budget accounting. |
| `00014_dpdp_consent_versioning.sql` | `public.profiles` | Adds `consent_version` (`TEXT`), `policy_version` (`TEXT`), and `consent_withdrawn_at` (`TIMESTAMPTZ`) to maintain compliance records under India's DPDP Act 2023. |

---

## ⚙️ New Environment Variables

| Variable | Default | Description |
|---|---|---|
| `STUDENT_CASE_GENERATION` | `false` | Set to `true` to allow students to generate practice cases with stripped model answers and daily rate caps. |
| `STUDENT_GENERATION_LIMIT` | `3` | Maximum number of practice cases a student can generate per 24-hour window when student generation is enabled. |
| `DEMO_USER_PASSWORD` | *(None)* | Optional custom password for seed accounts; if omitted, `scripts/seed.ts` generates strong random credentials. |
| `EMAIL_PROVIDER_API_KEY` | *(None)* | Transactional email provider API key (e.g. Resend) for real OTP delivery in production. |
| `EMAIL_FROM` | `SBS CaseLab <auth@shantibschool.edu.in>` | Transactional email sender header. |
| `DEMO_OTP_ON_SCREEN` | `false` | Dev/test only flag to display OTP in non-production environments. Server aborts on boot if enabled in production. |

---

## 🧪 Verification & Test Results

All 8 automated test suites passed:
- `npm run test:otp`: 45 passed (OTP hashing, expiry, rate limits, lockouts, boot safety)
- `npm run test:consent`: 16 passed (server DPDP rejection, profile versioning, withdrawal, erasure)
- `npm run test:student-access`: 27 passed (default student 403, answer stripping, library isolation, daily limit)
- `npm run test:password`: 26 passed (complexity policy, 5-fail lockout, seed production guard, repo string grep)
- `npm run test:budget`: 32 passed (Groq token counting, warning thresholds, HTTP 429 budget exhaustion)
- `npm run test:validators`: 32 passed (10 CE casepack validators & financial math formulas)
- `npm run test:exports`: 4 passed (Full & student handout DOCX / PDF generation)
- `npm run test:feedback-syllabus`: 4 passed (Faculty evaluation & syllabus extraction)
- `npm run test:smoke`: Production server smoke test passed (`/`, `/signup`, `/login`, `/create`, `/admin`, `/privacy`)
- `npm run test:secret-scan`: 0 credential leaks across source and `.next/static` production bundle
- `npm run build`: Succeeded with zero errors across all 46 static and dynamic routes.
