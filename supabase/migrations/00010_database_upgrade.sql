-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) AI Case Study Platform
-- Migration: 00010_database_upgrade.sql
-- Description: Phase 1 Database Architecture Upgrade:
--   1. Profiles: Strict 3 roles (admin, faculty, student), program, semester, is_graduated, consent_at
--   2. Cases: Expanded status (draft, in_review, approved, rejected)
--   3. Missing tables: certificates, payments, notifications, rate_limits
--   4. Audit log synonym/view & usage_log indexing
--   5. Comprehensive RLS policies and role-change prevention trigger
--   6. Allowed domain enforcement trigger for @shantibschool.edu.in
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. UPDATE PROFILES TABLE
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS program TEXT DEFAULT 'PGDM',
  ADD COLUMN IF NOT EXISTS semester INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_graduated BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dpdp_consent_at TIMESTAMPTZ;

-- Normalize any historical alumni role to student with graduated flag
UPDATE public.profiles
SET role = 'student', is_graduated = true
WHERE role = 'alumni';

-- Enforce strict 3 roles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'faculty', 'student'));

-- Ensure email unique constraint on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- 3. UPDATE CASES STATUS CONSTRAINT
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_status_check;
ALTER TABLE public.cases ADD CONSTRAINT cases_status_check 
  CHECK (status IN ('draft', 'in_review', 'approved', 'rejected', 'changes_requested'));

-- 4. CREATE CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. CREATE PAYMENTS TABLE (Strict Razorpay idempotency)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT NOT NULL UNIQUE,
    razorpay_signature TEXT NOT NULL,
    amount_paise INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'captured' CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('system', 'case_approval', 'case_review', 'grade_published', 'subscription', 'announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. CREATE RATE_LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
    window_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. COMPLIANCE & AUDIT LOG SYNONYM
-- Provide singular view public.audit_log over public.audit_logs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    CREATE OR REPLACE VIEW public.audit_log AS SELECT * FROM public.audit_logs;
  END IF;
END $$;

-- 9. PERFORMANCE INDEXES ON FOREIGN KEYS & COMMON FILTERS
CREATE INDEX IF NOT EXISTS idx_cases_filter ON public.cases(status, author_id, course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_created ON public.cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_student_case ON public.answers(student_id, case_id, status);
CREATE INDEX IF NOT EXISTS idx_grades_answer_pub ON public.grades(answer_id, is_published);
CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay ON public.payments(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_exp ON public.rate_limits(key, window_expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_log_user_tokens ON public.usage_log(user_id, created_at DESC);

-- 10. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at triggers
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_cases_updated_at ON public.cases;
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON public.cases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_rubrics_updated_at ON public.rubrics;
CREATE TRIGGER trg_rubrics_updated_at BEFORE UPDATE ON public.rubrics
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_answers_updated_at ON public.answers;
CREATE TRIGGER trg_answers_updated_at BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_grades_updated_at ON public.grades;
CREATE TRIGGER trg_grades_updated_at BEFORE UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_certificates_updated_at ON public.certificates;
CREATE TRIGGER trg_certificates_updated_at BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 11. SECURITY: PREVENT USERS FROM CHANGING THEIR OWN ROLE
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role is changing, check whether current user is an admin
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access denied: users cannot modify their own role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_change();

-- 12. DOMAIN ENFORCEMENT & AUTO PROFILE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT := 'student';
  v_approved BOOLEAN := false;
  v_domain TEXT;
  v_clean_email TEXT;
BEGIN
  v_clean_email := lower(trim(NEW.email));
  v_domain := lower(trim(split_part(v_clean_email, '@', 2)));

  -- Enforce official domain check (@shantibschool.edu.in)
  IF v_domain <> 'shantibschool.edu.in' THEN
    RAISE EXCEPTION 'Registration rejected: Institutional access requires an official @shantibschool.edu.in email address.';
  END IF;

  -- Admin automatic assignment for primary administrative emails
  IF v_clean_email IN ('admin@shantibschool.edu.in', 'neha.sharma@shantibschool.edu.in') THEN
    v_role := 'admin';
    v_approved := true;
  ELSIF v_clean_email IN ('faculty@shantibschool.edu.in', 'reena.paswan@shantibschool.edu.in') THEN
    v_role := 'faculty';
    v_approved := true;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    is_approved,
    plan,
    program,
    semester,
    consent_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_clean_email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(v_clean_email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', v_role),
    COALESCE((NEW.raw_user_meta_data->>'is_approved')::boolean, v_approved),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'standard'),
    COALESCE(NEW.raw_user_meta_data->>'program', 'PGDM'),
    COALESCE((NEW.raw_user_meta_data->>'semester')::integer, 1),
    now(),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. ENABLE ROW LEVEL SECURITY (RLS) ACROSS ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 14. COMPREHENSIVE RLS POLICIES

-- PROFILES
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile except role" ON public.profiles;
CREATE POLICY "Users can update own profile except role"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- CASES
DROP POLICY IF EXISTS "Cases select policy" ON public.cases;
CREATE POLICY "Cases select policy"
  ON public.cases FOR SELECT
  TO authenticated
  USING (
    -- Admin sees everything
    public.is_admin()
    -- Authors see all of their own cases (draft, in_review, approved, rejected)
    OR author_id = auth.uid()
    -- Students see ONLY approved cases
    OR (public.get_current_role() = 'student' AND status = 'approved')
    -- Faculty see approved cases and cases within their department
    OR (public.is_faculty() AND (status = 'approved' OR author_id = auth.uid()))
  );

DROP POLICY IF EXISTS "Faculty and admin can insert cases" ON public.cases;
CREATE POLICY "Faculty and admin can insert cases"
  ON public.cases FOR INSERT
  TO authenticated
  WITH CHECK (
    (public.is_faculty() OR public.is_admin()) AND author_id = auth.uid()
  );

DROP POLICY IF EXISTS "Faculty can update own draft cases, admin can update any" ON public.cases;
CREATE POLICY "Faculty can update own draft cases, admin can update any"
  ON public.cases FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() 
    OR (author_id = auth.uid() AND status IN ('draft', 'rejected', 'changes_requested'))
  )
  WITH CHECK (
    public.is_admin() 
    OR (author_id = auth.uid() AND status IN ('draft', 'in_review'))
  );

-- ANSWERS
DROP POLICY IF EXISTS "Answers select policy" ON public.answers;
CREATE POLICY "Answers select policy"
  ON public.answers FOR SELECT
  TO authenticated
  USING (
    -- Students see ONLY their own answers
    (public.get_current_role() = 'student' AND student_id = auth.uid())
    -- Faculty see answers for cases they authored or course
    OR (public.is_faculty() AND EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.author_id = auth.uid()))
    -- Admin sees all
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Students can insert own answers" ON public.answers;
CREATE POLICY "Students can insert own answers"
  ON public.answers FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id = auth.uid() AND EXISTS (SELECT 1 FROM public.cases c WHERE c.id = case_id AND c.status = 'approved')
  );

DROP POLICY IF EXISTS "Students can update own draft answers" ON public.answers;
CREATE POLICY "Students can update own draft answers"
  ON public.answers FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() AND status = 'draft')
  WITH CHECK (student_id = auth.uid());

-- GRADES
DROP POLICY IF EXISTS "Grades select policy" ON public.grades;
CREATE POLICY "Grades select policy"
  ON public.grades FOR SELECT
  TO authenticated
  USING (
    -- Students see grades ONLY if published AND answers belong to them
    (
      public.get_current_role() = 'student' 
      AND is_published = true 
      AND EXISTS (SELECT 1 FROM public.answers a WHERE a.id = answer_id AND a.student_id = auth.uid())
    )
    -- Faculty & Admin see all grades
    OR public.is_faculty()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Faculty and admin manage grades" ON public.grades;
CREATE POLICY "Faculty and admin manage grades"
  ON public.grades FOR ALL
  TO authenticated
  USING (public.is_faculty() OR public.is_admin())
  WITH CHECK (public.is_faculty() OR public.is_admin());

-- CERTIFICATES
DROP POLICY IF EXISTS "Certificates select policy" ON public.certificates;
CREATE POLICY "Certificates select policy"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR public.is_faculty() OR public.is_admin()
  );

-- PAYMENTS (SERVER-ONLY / SERVICE ROLE WRITES, USER CAN VIEW OWN)
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can read own notifications" ON public.notifications;
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can mark own notifications as read" ON public.notifications;
CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RATE LIMITS & AUDIT LOGS (SERVER-ONLY / SERVICE ROLE)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());
