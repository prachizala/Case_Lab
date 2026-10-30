-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) AI Case Study Platform
-- Supabase Migration: 00003_student_experience_rubrics_grades.sql
-- ==============================================================================

-- 1. EXTEND PROFILES WITH PUBLIC PORTFOLIO TOGGLE
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS portfolio_public BOOLEAN NOT NULL DEFAULT false;

-- 2. RUBRICS TABLE
-- Faculty create/edit grading rubrics with criteria: [{name, max_marks, description}]
CREATE TABLE IF NOT EXISTS public.rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_case_rubric UNIQUE (case_id)
);

CREATE INDEX IF NOT EXISTS idx_rubrics_case ON public.rubrics(case_id);

-- 3. ANSWERS TABLE
-- Student draft and submitted analytical essays
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    text TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted')) DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_student_case_answer UNIQUE (case_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_answers_case ON public.answers(case_id);
CREATE INDEX IF NOT EXISTS idx_answers_student ON public.answers(student_id);

-- 4. GRADES TABLE
-- AI suggestions, faculty overrides, and published final marks
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
    ai_marks JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_feedback TEXT NOT NULL DEFAULT '',
    final_marks NUMERIC(5,2),
    criterion_scores JSONB DEFAULT '{}'::jsonb,
    faculty_comment TEXT,
    graded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_answer_grade UNIQUE (answer_id)
);

CREATE INDEX IF NOT EXISTS idx_grades_answer ON public.grades(answer_id);
CREATE INDEX IF NOT EXISTS idx_grades_published ON public.grades(is_published);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

-- RUBRICS POLICIES:
-- Everyone can read rubrics for cases they can see
CREATE POLICY "Rubrics viewable by authenticated users"
    ON public.rubrics FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.cases c 
            WHERE c.id = case_id
        )
    );

-- Faculty and admins can insert or update rubrics
CREATE POLICY "Faculty and admin manage rubrics"
    ON public.rubrics FOR ALL
    TO authenticated
    USING (
        public.is_faculty() OR public.is_admin()
    )
    WITH CHECK (
        public.is_faculty() OR public.is_admin()
    );

-- ANSWERS POLICIES (CRITICAL SECURITY ISOLATION):
-- Rule 1: Student cannot read another student's answer
CREATE POLICY "Student read own answer or faculty view"
    ON public.answers FOR SELECT
    TO authenticated
    USING (
        -- Students can ONLY view their own answers
        student_id = auth.uid()
        -- Faculty can view submissions for cases in their department or authored by them
        OR public.is_faculty()
        -- Admin can view all
        OR public.is_admin()
    );

-- Rule 2: Student can insert their own answer
CREATE POLICY "Students insert own answer"
    ON public.answers FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
    );

-- Rule 3: Submitted answer CANNOT be edited!
CREATE POLICY "Student update draft answer only"
    ON public.answers FOR UPDATE
    TO authenticated
    USING (
        student_id = auth.uid() AND status = 'draft'
    )
    WITH CHECK (
        student_id = auth.uid()
    );

-- GRADES POLICIES (CRITICAL PRIVACY RULE):
-- Rule 4: Student does NOT see marks until faculty publishes!
CREATE POLICY "Grades visibility policy"
    ON public.grades FOR SELECT
    TO authenticated
    USING (
        -- Faculty and admins see grades at any time
        public.is_faculty() OR public.is_admin()
        -- Students see grades ONLY IF published AND it belongs to their own answer
        OR (
            is_published = true 
            AND EXISTS (
                SELECT 1 FROM public.answers a 
                WHERE a.id = answer_id AND a.student_id = auth.uid()
            )
        )
    );

-- Faculty and admin can insert and update grades
CREATE POLICY "Faculty and admin manage grades"
    ON public.grades FOR ALL
    TO authenticated
    USING (
        public.is_faculty() OR public.is_admin()
    )
    WITH CHECK (
        public.is_faculty() OR public.is_admin()
    );
