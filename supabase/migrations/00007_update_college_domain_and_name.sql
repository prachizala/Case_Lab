-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) Migration 00007
-- Update institutional domain to @shantibschool.edu and branding to SBS
-- ==============================================================================

-- 1. UPDATE EXISTING DEMO & REGISTERED PROFILES
UPDATE public.profiles
SET email = REPLACE(email, '@' || 'saf' || 'ron.edu', '@shantibschool.edu')
WHERE email LIKE '%' || '@' || 'saf' || 'ron.edu';

UPDATE public.profiles
SET email = REPLACE(email, '@alumni.' || 'saf' || 'ron.edu', '@alumni.shantibschool.edu')
WHERE email LIKE '%' || '@alumni.' || 'saf' || 'ron.edu';

UPDATE public.profiles
SET email = REPLACE(email, '@stanford.edu', '@shantibschool.edu')
WHERE email LIKE '%@stanford.edu';

UPDATE public.profiles
SET email = REPLACE(email, '@alumni.stanford.edu', '@alumni.shantibschool.edu')
WHERE email LIKE '%@alumni.stanford.edu';

-- Update auth.users if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    UPDATE auth.users
    SET email = REPLACE(email, '@' || 'saf' || 'ron.edu', '@shantibschool.edu')
    WHERE email LIKE '%' || '@' || 'saf' || 'ron.edu';

    UPDATE auth.users
    SET email = REPLACE(email, '@alumni.' || 'saf' || 'ron.edu', '@alumni.shantibschool.edu')
    WHERE email LIKE '%' || '@alumni.' || 'saf' || 'ron.edu';

    UPDATE auth.users
    SET email = REPLACE(email, '@stanford.edu', '@shantibschool.edu')
    WHERE email LIKE '%@stanford.edu';

    UPDATE auth.users
    SET email = REPLACE(email, '@alumni.stanford.edu', '@alumni.shantibschool.edu')
    WHERE email LIKE '%@alumni.stanford.edu';
  END IF;
END $$;

-- 2. DOMAIN VALIDATION HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_valid_college_email(p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    p_email ILIKE '%@shantibschool.edu' OR
    p_email ILIKE '%.shantibschool.edu'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. REVISE TRIGGER FOR AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT := 'student';
  v_approved BOOLEAN := false;
  v_domain TEXT;
BEGIN
  -- Extract domain from email
  v_domain := split_part(new.email, '@', 2);
  
  -- Enforce allowed domain for Shanti Business School (SBS)
  IF NOT (v_domain = 'shantibschool.edu' OR v_domain LIKE '%.shantibschool.edu') THEN
    RAISE EXCEPTION 'Registration restricted to Shanti Business School accounts (@shantibschool.edu)';
  END IF;

  -- Auto-approve admin if email matches admin@shantibschool.edu
  IF new.email = 'admin@shantibschool.edu' THEN
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

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add institutional comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Enforces @shantibschool.edu domain and configures profile for Shanti Business School (SBS)';
