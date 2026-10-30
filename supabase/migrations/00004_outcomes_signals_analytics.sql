-- ========================================================================
-- Migration: 00004_outcomes_signals_analytics.sql
-- Description: Outcomes (CO/PO), Case-Outcome mappings, Case Signals,
--              Watch Industries, and Accreditation Analytics tables.
-- ========================================================================

-- 1. OUTCOMES (Course Outcomes [CO] & Program Outcomes [PO])
CREATE TABLE IF NOT EXISTS public.outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('CO', 'PO')),
    code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for speedy outcome lookups by course
CREATE INDEX IF NOT EXISTS idx_outcomes_course_id ON public.outcomes(course_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_type ON public.outcomes(type);

-- 2. CASE_OUTCOMES (Many-to-many relationship between Cases and Outcomes)
CREATE TABLE IF NOT EXISTS public.case_outcomes (
    case_id VARCHAR(64) NOT NULL,
    outcome_id UUID NOT NULL REFERENCES public.outcomes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (case_id, outcome_id)
);

CREATE INDEX IF NOT EXISTS idx_case_outcomes_case ON public.case_outcomes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_outcomes_outcome ON public.case_outcomes(outcome_id);

-- 3. SIGNALS (Curriculum Radar & Indian Business Case Signals from RSS + Claude)
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    source VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    potential_score NUMERIC(3,1) NOT NULL CHECK (potential_score >= 1.0 AND potential_score <= 10.0),
    potential_reason TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_signals_industry ON public.signals(industry);
CREATE INDEX IF NOT EXISTS idx_signals_potential_score ON public.signals(potential_score DESC);

-- 4. ADD WATCH_INDUSTRIES TO PROFILES
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS watch_industries TEXT[] DEFAULT ARRAY[
    'Fintech & Banking',
    'Renewable Energy & CleanTech',
    'Supply Chain & Manufacturing',
    'Consumer & Retail'
];

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES: OUTCOMES
-- Read outcomes: all authenticated users
CREATE POLICY "Authenticated users can view outcomes"
    ON public.outcomes FOR SELECT
    TO authenticated
    USING (true);

-- Manage outcomes: faculty and admin
CREATE POLICY "Faculty and admin can manage outcomes"
    ON public.outcomes FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('faculty', 'admin')
        )
    );

-- 7. POLICIES: CASE_OUTCOMES
CREATE POLICY "Authenticated users can view case outcomes"
    ON public.case_outcomes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Faculty and admin can link case outcomes"
    ON public.case_outcomes FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('faculty', 'admin')
        )
    );

-- 8. POLICIES: SIGNALS
-- Authenticated users can view signals
CREATE POLICY "Authenticated users can view signals"
    ON public.signals FOR SELECT
    TO authenticated
    USING (true);

-- Service role & admin can insert/update signals (via cron)
CREATE POLICY "Service role and admin can manage signals"
    ON public.signals FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'faculty')
        )
    );
