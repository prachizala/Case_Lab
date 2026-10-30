-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) AI Case Study Platform
-- Supabase Migration: 00002_library_approval_versions.sql
-- ==============================================================================

-- 1. ADD REVIEWER & REFINEMENTS TO PROFILES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_reviewer BOOLEAN NOT NULL DEFAULT false;

-- 2. REFINEMENTS TO CASES TABLE
ALTER TABLE public.cases 
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewer_comment TEXT;

-- Update status check constraint to include changes_requested
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_status_check 
  CHECK (status IN ('draft', 'in_review', 'approved', 'changes_requested'));

-- 3. CASE VERSIONS TABLE (Immutable historical records)
CREATE TABLE IF NOT EXISTS public.case_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    change_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_case_versions_case ON public.case_versions(case_id, version_number DESC);

-- 4. COLLECTIONS TABLES
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.collection_cases (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    PRIMARY KEY (collection_id, case_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON public.collections(user_id);

-- 5. RLS POLICIES FOR SECURE ACCESS
ALTER TABLE public.case_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_cases ENABLE ROW LEVEL SECURITY;

-- CASES SELECT POLICY:
-- CRITICAL RULE: Students can NEVER see draft, in_review, or changes_requested cases.
DROP POLICY IF EXISTS "Cases visibility policy" ON public.cases;
CREATE POLICY "Cases visibility policy"
    ON public.cases FOR SELECT
    TO authenticated
    USING (
        -- Admins see everything
        public.is_admin()
        -- Authors see all of their own cases
        OR author_id = auth.uid()
        -- Designated Faculty Reviewers see all cases in review or approved
        OR ((SELECT is_reviewer FROM public.profiles WHERE id = auth.uid()) = true AND status IN ('in_review', 'approved'))
        -- Students see ONLY approved cases
        OR (public.get_current_role() = 'student' AND status = 'approved' AND (department_id IS NULL OR department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid())))
        -- Other faculty see approved cases
        OR (public.is_faculty() AND status = 'approved')
    );

-- CASE VERSIONS POLICIES:
CREATE POLICY "Case versions viewable by authorized users"
    ON public.case_versions FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases c 
            WHERE c.id = case_id 
              AND (c.author_id = auth.uid() OR c.status = 'approved' OR public.is_admin())
        )
    );

CREATE POLICY "Authors and admins can insert case versions"
    ON public.case_versions FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cases c 
            WHERE c.id = case_id 
              AND (c.author_id = auth.uid() OR public.is_admin())
        )
    );

-- COLLECTIONS POLICIES:
CREATE POLICY "Users can manage their own collections"
    ON public.collections FOR ALL
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can manage cases in their own collections"
    ON public.collection_cases FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.collections col 
            WHERE col.id = collection_id AND (col.user_id = auth.uid() OR public.is_admin())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections col 
            WHERE col.id = collection_id AND (col.user_id = auth.uid() OR public.is_admin())
        )
    );
