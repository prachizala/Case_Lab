-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) AI Case Study Platform
-- Supabase Migration: 00001_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    dept TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    semester TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PROFILES TABLE
-- Roles: admin, faculty, student, alumni
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'faculty', 'student', 'alumni')),
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    plan TEXT NOT NULL DEFAULT 'standard' CHECK (plan IN ('standard', 'premium', 'institutional')),
    is_approved BOOLEAN NOT NULL DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CASES TABLE
-- Types: full, flash
-- Formats: hypothetical, real_signal
-- Status: draft, in_review, approved
-- Language: en, hi, gu
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_review', 'approved')),
    type TEXT NOT NULL DEFAULT 'full' CHECK (type IN ('full', 'flash')),
    format TEXT NOT NULL DEFAULT 'hypothetical' CHECK (format IN ('hypothetical', 'real_signal')),
    industry TEXT NOT NULL,
    function TEXT NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    level TEXT NOT NULL DEFAULT 'MBA / Intermediate',
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'gu')),
    complexity INTEGER NOT NULL DEFAULT 5 CHECK (complexity BETWEEN 1 AND 10),
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    source_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. USAGE_LOG TABLE (Token usage tracking & rate limiting)
CREATE TABLE IF NOT EXISTS public.usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    model TEXT NOT NULL,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CREATE INDEXES FOR FAST QUERYING & RATE LIMIT LOOKUPS
CREATE INDEX IF NOT EXISTS idx_usage_log_user_hour ON public.usage_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_author ON public.cases(author_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases(status);
CREATE INDEX IF NOT EXISTS idx_courses_dept ON public.courses(department_id);

-- 7. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('faculty', 'admin')
  );
$$;

-- Function to check hourly generation limit (10 generations per user per hour)
CREATE OR REPLACE FUNCTION public.check_hourly_generation_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.usage_log
  WHERE user_id = p_user_id
    AND created_at >= (now() - INTERVAL '1 hour');
  
  RETURN v_count < 10;
END;
$$;

-- 8. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

-- DEPARTMENTS POLICIES
CREATE POLICY "Departments are viewable by authenticated users"
    ON public.departments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Departments can be modified only by admin"
    ON public.departments FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- COURSES POLICIES
CREATE POLICY "Courses are viewable by authenticated users"
    ON public.courses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Courses can be modified only by admin"
    ON public.courses FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- PROFILES POLICIES
CREATE POLICY "Profiles are viewable by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile basic info"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (
        auth.uid() = id OR public.is_admin()
    );

-- CASES POLICIES
-- Faculty see their own cases.
-- Approved cases are visible to everyone authenticated.
-- Admins can view and manage all cases.
CREATE POLICY "Cases visibility policy"
    ON public.cases FOR SELECT
    TO authenticated
    USING (
        author_id = auth.uid() 
        OR status = 'approved' 
        OR public.is_admin()
    );

CREATE POLICY "Faculty and admin can insert cases"
    ON public.cases FOR INSERT
    TO authenticated
    WITH CHECK (
        (auth.uid() = author_id AND (public.is_faculty() OR public.is_admin()))
        OR public.is_admin()
    );

CREATE POLICY "Authors and admins can update cases"
    ON public.cases FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid() 
        OR public.is_admin()
    )
    WITH CHECK (
        author_id = auth.uid() 
        OR public.is_admin()
    );

CREATE POLICY "Authors and admins can delete cases"
    ON public.cases FOR DELETE
    TO authenticated
    USING (
        author_id = auth.uid() 
        OR public.is_admin()
    );

-- USAGE LOG POLICIES
CREATE POLICY "Users can view their own usage logs"
    ON public.usage_log FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert their own usage log"
    ON public.usage_log FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 9. TRIGGER FOR AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT := 'student';
  v_approved BOOLEAN := false;
  v_domain TEXT;
BEGIN
  -- Extract domain from email
  v_domain := split_part(new.email, '@', 2);
  
  -- Auto-approve admin if email matches admin@stanford.edu or configured admin
  IF new.email = 'admin@stanford.edu' THEN
    v_role := 'admin';
    v_approved := true;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_approved, plan)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', v_role),
    COALESCE((new.raw_user_meta_data->>'is_approved')::boolean, v_approved),
    COALESCE(new.raw_user_meta_data->>'plan', 'standard')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
