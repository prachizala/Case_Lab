-- ==============================================================================
-- Migration: 00005_live_classroom_integrity_reflections.sql
-- Description: Live Socratic Classroom, Digital Board Plan, Audio Briefings,
--              Academic Integrity Reports, and Alumni Practitioner Reflections
-- ==============================================================================

-- 1. Classroom Sessions (Live Socratic Discussions & Real-time Polls)
CREATE TABLE IF NOT EXISTS public.classroom_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    current_poll JSONB NOT NULL DEFAULT '{}'::jsonb,
    cold_call_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    board_plan JSONB NOT NULL DEFAULT '{"board_1_dilemma": "", "board_2_alternatives": "", "board_3_action_plan": ""}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_classroom_sessions_case ON public.classroom_sessions(case_id);
CREATE INDEX IF NOT EXISTS idx_classroom_sessions_faculty ON public.classroom_sessions(faculty_id);

-- 2. Audio Executive Briefs ("CasePod")
CREATE TABLE IF NOT EXISTS public.audio_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE UNIQUE,
    title TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 120,
    executive_summary TEXT NOT NULL,
    dialogue JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audio_briefs_case ON public.audio_briefs(case_id);

-- 3. Academic Integrity & Case Grounding Reports
CREATE TABLE IF NOT EXISTS public.integrity_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE UNIQUE,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    originality_score NUMERIC(5,2) NOT NULL DEFAULT 100.0,
    case_citation_density NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    ai_probability_score NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    key_frameworks_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
    hallucination_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    verdict TEXT NOT NULL CHECK (verdict IN ('High Integrity', 'Acceptable', 'Manual Review Recommended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integrity_reports_answer ON public.integrity_reports(answer_id);
CREATE INDEX IF NOT EXISTS idx_integrity_reports_student ON public.integrity_reports(student_id);

-- 4. Alumni Practitioner Reflections
CREATE TABLE IF NOT EXISTS public.practitioner_reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    alumni_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    alumni_name TEXT NOT NULL,
    alumni_title TEXT NOT NULL,
    company TEXT NOT NULL,
    reflection_text TEXT NOT NULL,
    practical_takeaway TEXT NOT NULL,
    upvotes INTEGER NOT NULL DEFAULT 0,
    upvoted_by JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_verified_alumni BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_practitioner_reflections_case ON public.practitioner_reflections(case_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_reflections_alumni ON public.practitioner_reflections(alumni_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.classroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrity_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_reflections ENABLE ROW LEVEL SECURITY;

-- Classroom Sessions RLS
CREATE POLICY "Classroom sessions viewable by authenticated users"
ON public.classroom_sessions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Faculty can manage classroom sessions"
ON public.classroom_sessions FOR ALL
TO authenticated
USING (auth.uid() = faculty_id OR public.is_admin());

-- Audio Briefs RLS
CREATE POLICY "Audio briefs viewable by authenticated users"
ON public.audio_briefs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Faculty and admin can manage audio briefs"
ON public.audio_briefs FOR ALL
TO authenticated
USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin')
));

-- Integrity Reports RLS
CREATE POLICY "Integrity reports viewable by faculty and admin"
ON public.integrity_reports FOR SELECT
TO authenticated
USING (public.is_admin() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('faculty', 'admin')
));

-- Practitioner Reflections RLS
CREATE POLICY "Practitioner reflections viewable by all authenticated users"
ON public.practitioner_reflections FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Alumni can create reflections"
ON public.practitioner_reflections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = alumni_id AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('alumni', 'admin')
));

CREATE POLICY "Alumni can update own reflections"
ON public.practitioner_reflections FOR UPDATE
TO authenticated
USING (auth.uid() = alumni_id OR public.is_admin());
