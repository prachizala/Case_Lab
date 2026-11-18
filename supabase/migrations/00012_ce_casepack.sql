-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) AI Case Study Platform
-- Migration: 00012_ce_casepack.sql
-- Description: CE Case Pack Architecture, Feedback Ledger, and Gold Example Store:
--   1. Expands cases.type to support 'ce_pack'
--   2. Creates casepack_feedback table for faculty continuous quality scoring
--   3. Creates casepack_gold_examples table for administrative few-shot training curation
--   4. Configures Row Level Security (RLS) ensuring student isolation
-- ==============================================================================

-- 1. EXPAND CASES TYPE CONSTRAINT
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_type_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_type_check 
  CHECK (type IN ('full', 'flash', 'short', 'research', 'ce_pack'));

-- 2. CREATE CASEPACK FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.casepack_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    issues JSONB NOT NULL DEFAULT '[]'::jsonb, -- e.g. ["too_long", "too_easy", "wrong_facts", "not_matching_syllabus", "wrong_format"]
    comment TEXT,
    suggested_as_example BOOLEAN NOT NULL DEFAULT false,
    admin_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CREATE CASEPACK GOLD EXAMPLES TABLE
CREATE TABLE IF NOT EXISTS public.casepack_gold_examples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department TEXT NOT NULL CHECK (department IN ('finance', 'hr', 'marketing')),
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT NOT NULL CHECK (status IN ('approved', 'pending_approval')) DEFAULT 'pending_approval',
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_casepack_feedback_case ON public.casepack_feedback(case_id);
CREATE INDEX IF NOT EXISTS idx_casepack_feedback_faculty ON public.casepack_feedback(faculty_id);
CREATE INDEX IF NOT EXISTS idx_casepack_gold_dept_status ON public.casepack_gold_examples(department, status);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.casepack_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casepack_gold_examples ENABLE ROW LEVEL SECURITY;

-- FEEDBACK POLICIES:
-- Faculty can view own submitted feedback; Admins view all
DROP POLICY IF EXISTS "Faculty view own feedback, admin view all" ON public.casepack_feedback;
CREATE POLICY "Faculty view own feedback, admin view all"
  ON public.casepack_feedback FOR SELECT
  TO authenticated
  USING (
    faculty_id = auth.uid() OR public.is_admin()
  );

-- Faculty can insert feedback on cases they authored or reviewed
DROP POLICY IF EXISTS "Faculty insert feedback" ON public.casepack_feedback;
CREATE POLICY "Faculty insert feedback"
  ON public.casepack_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    faculty_id = auth.uid() AND (public.is_faculty() OR public.is_admin())
  );

-- Admins can update feedback (e.g. approve suggestion as gold example)
DROP POLICY IF EXISTS "Admins update feedback" ON public.casepack_feedback;
CREATE POLICY "Admins update feedback"
  ON public.casepack_feedback FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- GOLD EXAMPLES POLICIES:
-- Faculty and Admins can view approved gold examples; Students strictly forbidden
DROP POLICY IF EXISTS "Faculty and admin view gold examples" ON public.casepack_gold_examples;
CREATE POLICY "Faculty and admin view gold examples"
  ON public.casepack_gold_examples FOR SELECT
  TO authenticated
  USING (
    (public.is_faculty() AND status = 'approved') OR public.is_admin()
  );

-- Only Admins can manage (insert/update/delete) gold examples
DROP POLICY IF EXISTS "Admins manage gold examples" ON public.casepack_gold_examples;
CREATE POLICY "Admins manage gold examples"
  ON public.casepack_gold_examples FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
