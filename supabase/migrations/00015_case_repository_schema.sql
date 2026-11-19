-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) Academic Case Study Repository
-- Migration: 00015_case_repository_schema.sql
-- Description: Core schema for Case Study Repository:
--   1. Lookup tables: batches, faculty_types, case_categories, case_types
--   2. Profiles lifecycle extensions: personal_email, mobile, enrollment, access dates, status
--   3. Cases lifecycle extensions: keywords, page_target, review_status, author_role
--   4. Peer review infrastructure: review_rounds, review_comments, reviewer_rotation
--   5. Repository storage & downloads: repository_items, download_log
-- ==============================================================================

-- 1. LOOKUP TABLES
CREATE TABLE IF NOT EXISTS public.batches (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL UNIQUE, -- e.g. '2024-27'
  start_year INTEGER NOT NULL,
  end_year INTEGER NOT NULL,
  end_date TIMESTAMPTZ NOT NULL, -- e.g. 30 June of end_year in Asia/Kolkata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faculty_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'Full-time', 'Visiting', 'Guest', 'Adjunct'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.case_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE, -- 'CE Case Pack', 'Full Case Study', 'Short Case', 'Flash Case'
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure lookup tables on departments and courses have is_active column
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Seed lookup departments (BCA/IT, Finance, Marketing, HR)
INSERT INTO public.departments (id, code, name, description, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000014', 'TECH', 'BCA & Information Technology', 'Enterprise systems, cloud computing, AI architectures', true),
  ('00000000-0000-0000-0000-000000000013', 'FIN', 'Finance & Banking', 'Corporate valuation, investment banking, M&A, FinTech', true),
  ('00000000-0000-0000-0000-000000000012', 'MKTG', 'Marketing & Digital Strategy', 'Brand management, consumer behavior, omnichannel retail', true),
  ('00000000-0000-0000-0000-000000000015', 'HR', 'Human Resources & Organizational Behavior', 'People analytics, organizational transformation, leadership', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Seed lookup courses (BCA, BBA, PGDM)
INSERT INTO public.courses (id, department_id, dept, code, name, semester, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000014', 'TECH', 'BCA', 'Bachelor of Computer Applications', 'Semesters 1-6', true),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000012', 'MKTG', 'BBA', 'Bachelor of Business Administration', 'Semesters 1-6', true),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000013', 'FIN', 'PGDM', 'Post Graduate Diploma in Management', 'Trimesters 1-6', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  dept = EXCLUDED.dept,
  is_active = EXCLUDED.is_active;

-- Seed lookup placeholder values
INSERT INTO public.batches (id, label, start_year, end_year, end_date, is_active)
VALUES
  ('batch-2023-26', '2023-26', 2023, 2026, '2026-06-30 23:59:59+05:30', true),
  ('batch-2024-27', '2024-27', 2024, 2027, '2027-06-30 23:59:59+05:30', true),
  ('batch-2025-28', '2025-28', 2025, 2028, '2028-06-30 23:59:59+05:30', true)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  end_date = EXCLUDED.end_date,
  is_active = EXCLUDED.is_active;

INSERT INTO public.faculty_types (id, name, description, is_active)
VALUES
  ('ft-fulltime', 'Full-time', 'Regular tenured or tenure-track institutional faculty', true),
  ('ft-visiting', 'Visiting', 'Visiting scholar or guest academic specialist', true),
  ('ft-guest', 'Guest', 'Industry practitioner invited for specialized modules', true),
  ('ft-adjunct', 'Adjunct', 'Affiliated adjunct faculty conducting elective seminars', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.case_categories (id, name, description, is_active)
VALUES
  ('cat-strat', 'Strategic Transformation', 'Corporate strategy, pivot models, competitive positioning', true),
  ('cat-fin', 'Financial Restructuring', 'Capital allocation, debt restructuring, valuation, M&A', true),
  ('cat-mktg', 'Marketing & Brand Strategy', 'Customer acquisition, omnichannel retail, market positioning', true),
  ('cat-hr', 'Organizational Behavior & HR', 'Workforce transformation, change management, retention', true),
  ('cat-ops', 'Supply Chain & Operations', 'Logistics density, manufacturing turnarounds, dark stores', true),
  ('cat-tech', 'Digital Governance & AI', 'Technology disruption, cloud adoption, enterprise software', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.case_types (id, name, description, is_active)
VALUES
  ('type-ce-pack', 'CE Case Pack', 'Structured case study with Bloom-mapped questions and model answer key', true),
  ('type-full', 'Full Case Study', 'Comprehensive multi-page Harvard/Ivey standard institutional case', true),
  ('type-short', 'Short Case', 'Rapid boardroom crisis drill for focused single-session discussion', true),
  ('type-flash', 'Flash Case', 'Single decision-point operational problem with immediate exhibits', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. ENHANCE PROFILES TABLE
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS personal_email TEXT,
  ADD COLUMN IF NOT EXISTS mobile TEXT,
  ADD COLUMN IF NOT EXISTS enrollment_no TEXT,
  ADD COLUMN IF NOT EXISTS roll_no TEXT,
  ADD COLUMN IF NOT EXISTS course_id TEXT,
  ADD COLUMN IF NOT EXISTS batch_id TEXT,
  ADD COLUMN IF NOT EXISTS faculty_type_id TEXT,
  ADD COLUMN IF NOT EXISTS is_reviewer BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewer_since TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ DEFAULT NOW();

-- Constraints on profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_access_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_access_status_check
  CHECK (access_status IN ('pending', 'active', 'expired', 'inactive'));

-- Ensure personal email is unique when set
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_personal_email_unique
  ON public.profiles (LOWER(TRIM(personal_email)))
  WHERE personal_email IS NOT NULL AND personal_email <> '';

-- Ensure enrollment_no is unique when set
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_enrollment_no_unique
  ON public.profiles (UPPER(TRIM(enrollment_no)))
  WHERE enrollment_no IS NOT NULL AND enrollment_no <> '';

-- Constraints enforcing email rules
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_personal_email_sbs_domain_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_personal_email_sbs_domain_check
  CHECK (
    personal_email IS NULL OR
    (
      LOWER(personal_email) NOT LIKE '%@shantibschool.edu.in' AND
      LOWER(personal_email) <> LOWER(email)
    )
  );

-- Constraint enforcing that admin has no access_end date
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_admin_no_end_date_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_admin_no_end_date_check
  CHECK (role <> 'admin' OR access_end IS NULL);

-- Mobile normalization & validation (10 digits with optional +91 prefix)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_mobile_format_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_mobile_format_check
  CHECK (mobile IS NULL OR mobile ~ '^(\+91[\-\s]?)?[6789]\d{9}$');

-- Integrity check: faculty cannot have batch_id
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_faculty_no_batch_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_faculty_no_batch_check
  CHECK (role <> 'faculty' OR batch_id IS NULL);

-- Integrity check: active students must have course, batch, and enrollment number
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_active_student_fields_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_active_student_fields_check
  CHECK (
    access_status <> 'active' OR
    role <> 'student' OR
    (course_id IS NOT NULL AND batch_id IS NOT NULL AND enrollment_no IS NOT NULL)
  );

-- Integrity check: active faculty must have department and faculty type
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_active_faculty_fields_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_active_faculty_fields_check
  CHECK (
    access_status <> 'active' OR
    role <> 'faculty' OR
    (department_id IS NOT NULL AND faculty_type_id IS NOT NULL)
  );

-- 3. ENHANCE CASES TABLE
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS case_category_id TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS case_type TEXT DEFAULT 'ce_pack',
  ADD COLUMN IF NOT EXISTS page_target INTEGER DEFAULT 5,
  ADD COLUMN IF NOT EXISTS author_role TEXT DEFAULT 'faculty',
  ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'draft';

-- Constraints on cases
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_page_target_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_page_target_check
  CHECK (page_target IN (5, 10));

ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_author_role_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_author_role_check
  CHECK (author_role IN ('faculty', 'student', 'admin'));

ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_status_check
  CHECK (status IN ('draft', 'submitted', 'in_review', 'changes_requested', 'approved', 'uploaded', 'rejected'));

-- 4. PEER REVIEW INFRASTRUCTURE
CREATE TABLE IF NOT EXISTS public.review_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  round_no INTEGER NOT NULL DEFAULT 1,
  reviewer_id TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  decision TEXT NOT NULL DEFAULT 'pending' CHECK (decision IN ('approved', 'changes_requested', 'rejected', 'pending')),
  comments TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id, round_no)
);

CREATE TABLE IF NOT EXISTS public.review_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID NOT NULL REFERENCES public.review_rounds(id) ON DELETE CASCADE,
  section TEXT NOT NULL, -- e.g. 'abstract', 'exhibits', 'questions', 'general'
  text TEXT NOT NULL,
  author_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviewer_rotation (
  scope_key TEXT PRIMARY KEY, -- e.g. 'dept:dept-1', 'dept:dept-2'
  last_reviewer_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. REPOSITORY STORAGE AND DOWNLOADS
CREATE TABLE IF NOT EXISTS public.repository_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE RESTRICT,
  approved_version_id UUID,
  author_id TEXT NOT NULL,
  reviewer_id TEXT NOT NULL,
  department_id TEXT,
  course_id TEXT,
  category_id TEXT,
  keywords TEXT[] DEFAULT '{}',
  approval_status TEXT NOT NULL DEFAULT 'approved',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  file_docx_path TEXT NOT NULL,
  file_pdf_path TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  author_consent_at TIMESTAMPTZ,
  author_consent_version TEXT DEFAULT '2023.1',
  similarity_score NUMERIC(5,2) DEFAULT 0.00,
  ai_assisted BOOLEAN NOT NULL DEFAULT true,
  price_inr NUMERIC(10,2) DEFAULT NULL,
  creator_share_pct NUMERIC(5,2) DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(case_id)
);

CREATE TABLE IF NOT EXISTS public.download_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.repository_items(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kind TEXT NOT NULL CHECK (kind IN ('pdf', 'docx', 'student_handout', 'full_pack'))
);

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_cases_department ON public.cases (department_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_author ON public.cases (author_id);
CREATE INDEX IF NOT EXISTS idx_review_rounds_case ON public.review_rounds (case_id);
CREATE INDEX IF NOT EXISTS idx_review_rounds_reviewer ON public.review_rounds (reviewer_id, decision);
CREATE INDEX IF NOT EXISTS idx_repository_items_dept ON public.repository_items (department_id, is_published);
CREATE INDEX IF NOT EXISTS idx_repository_items_course ON public.repository_items (course_id);
CREATE INDEX IF NOT EXISTS idx_repository_items_category ON public.repository_items (category_id);
CREATE INDEX IF NOT EXISTS idx_download_log_item ON public.download_log (item_id, at);
CREATE INDEX IF NOT EXISTS idx_download_log_user ON public.download_log (user_id);
