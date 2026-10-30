-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) Migration 00009
-- Free Usage Rules, External User Support, and Email Verification
-- ==============================================================================

-- 1. PLATFORM SETTINGS TABLE (Configurable quotas and allowed domains)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  external_free_limit INT NOT NULL DEFAULT 3,
  sbs_fair_use_limit INT NOT NULL DEFAULT 30,
  allowed_domains TEXT[] NOT NULL DEFAULT ARRAY['shantibschool.edu.in'],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial platform settings if not present
INSERT INTO public.platform_settings (id, external_free_limit, sbs_fair_use_limit, allowed_domains)
VALUES ('default', 3, 30, ARRAY['shantibschool.edu.in'])
ON CONFLICT (id) DO NOTHING;

-- 2. ADD COLUMNS TO PROFILES FOR USER CLASSIFICATION & FREE USAGE
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'external',
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS free_cases_used_this_month INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_cases_reset_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_otp TEXT,
ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMPTZ;

-- 3. BACKFILL EXISTING PROFILES
-- Existing official SBS accounts are pre-verified with sbs_member classification
UPDATE public.profiles
SET
  user_type = CASE
    WHEN lower(trim(split_part(email, '@', 2))) = 'shantibschool.edu.in' THEN 'sbs_member'
    ELSE 'external'
  END,
  email_verified_at = COALESCE(email_verified_at, '2026-01-01 00:00:00+00'::timestamptz),
  free_cases_used_this_month = COALESCE(monthly_generations_used, 0),
  free_cases_reset_at = COALESCE(free_cases_reset_at, (date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') + interval '1 month') AT TIME ZONE 'Asia/Kolkata');

-- 4. FUNCTION TO CLASSIFY USER BASED ON ALLOWED DOMAINS
CREATE OR REPLACE FUNCTION public.is_sbs_member_email(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_domain TEXT;
  v_allowed TEXT[];
BEGIN
  IF p_email IS NULL OR p_email = '' THEN
    RETURN FALSE;
  END IF;

  v_domain := lower(trim(split_part(p_email, '@', 2)));
  
  SELECT allowed_domains INTO v_allowed
  FROM public.platform_settings
  WHERE id = 'default'
  LIMIT 1;

  IF v_allowed IS NULL THEN
    v_allowed := ARRAY['shantibschool.edu.in'];
  END IF;

  RETURN (v_domain = ANY(v_allowed));
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. FUNCTION TO ATOMICALLY INCREMENT AND CHECK QUOTA (ASIA/KOLKATA CALENDAR RESET)
CREATE OR REPLACE FUNCTION public.increment_user_case_generation(p_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user public.profiles%ROWTYPE;
  v_now_kolkata TIMESTAMPTZ := now() AT TIME ZONE 'Asia/Kolkata';
  v_next_reset_kolkata TIMESTAMPTZ := (date_trunc('month', v_now_kolkata) + interval '1 month') AT TIME ZONE 'Asia/Kolkata';
  v_limit INT;
  v_settings public.platform_settings%ROWTYPE;
BEGIN
  SELECT * INTO v_settings FROM public.platform_settings WHERE id = 'default' LIMIT 1;
  SELECT * INTO v_user FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
  END IF;

  -- Email verification check
  IF v_user.email_verified_at IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email verification required before generating cases',
      'error_code', 'UNVERIFIED_EMAIL'
    );
  END IF;

  -- Lazy monthly quota reset on the 1st of month at 00:00 Asia/Kolkata
  IF v_user.free_cases_reset_at IS NULL OR now() >= v_user.free_cases_reset_at THEN
    v_user.free_cases_used_this_month := 0;
    v_user.monthly_generations_used := 0;
    v_user.free_cases_reset_at := v_next_reset_kolkata;
  END IF;

  -- Determine user quota limit
  IF v_user.user_type = 'sbs_member' THEN
    v_limit := COALESCE(v_user.monthly_generation_limit, v_settings.sbs_fair_use_limit);
  ELSE
    v_limit := COALESCE(v_user.monthly_generation_limit, v_settings.external_free_limit);
  END IF;

  -- Enforce quota limit
  IF v_user.free_cases_used_this_month >= v_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', CASE WHEN v_user.user_type = 'external' THEN 'Free generation limit reached' ELSE 'Fair-use quota reached' END,
      'error_code', CASE WHEN v_user.user_type = 'external' THEN 'LIMIT_REACHED' ELSE 'FAIR_USE_LIMIT_REACHED' END,
      'used', v_user.free_cases_used_this_month,
      'limit', v_limit,
      'remaining', 0,
      'reset_at', v_user.free_cases_reset_at
    );
  END IF;

  -- Atomic increment
  v_user.free_cases_used_this_month := v_user.free_cases_used_this_month + 1;
  v_user.monthly_generations_used := v_user.free_cases_used_this_month;
  v_user.updated_at := now();

  UPDATE public.profiles
  SET
    free_cases_used_this_month = v_user.free_cases_used_this_month,
    monthly_generations_used = v_user.monthly_generations_used,
    free_cases_reset_at = v_user.free_cases_reset_at,
    updated_at = v_user.updated_at
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'used', v_user.free_cases_used_this_month,
    'limit', v_limit,
    'remaining', GREATEST(0, v_limit - v_user.free_cases_used_this_month),
    'reset_at', v_user.free_cases_reset_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. REVISED TRIGGER TO ALLOW OPEN REGISTRATION WITH STUDENT DEFAULT ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT := 'student';
  v_is_sbs BOOLEAN := false;
  v_user_type TEXT := 'external';
BEGIN
  -- Determine SBS membership based on allowed domain
  v_is_sbs := public.is_sbs_member_email(new.email);
  IF v_is_sbs THEN
    v_user_type := 'sbs_member';
  END IF;

  -- Preserve admin role only for official administrator
  IF lower(trim(new.email)) = 'admin@shantibschool.edu.in' THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    user_type,
    email_verified_at,
    is_approved,
    plan,
    free_cases_used_this_month,
    free_cases_reset_at
  )
  VALUES (
    new.id,
    lower(trim(new.email)),
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    v_role,
    v_user_type,
    NULL, -- Requires email verification OTP
    true,
    'standard',
    0,
    (date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') + interval '1 month') AT TIME ZONE 'Asia/Kolkata'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.platform_settings IS 'Platform settings including generation quotas and allowed SBS domains';
COMMENT ON COLUMN public.profiles.user_type IS 'Classifies user as sbs_member (30 cases/month fair-use) or external (3 free cases/month)';
COMMENT ON COLUMN public.profiles.email_verified_at IS 'Verification timestamp. Mandatory for case generation.';
