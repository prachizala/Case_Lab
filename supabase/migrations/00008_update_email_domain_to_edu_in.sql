-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) Migration 00008
-- Update institutional domain check and existing users to @shantibschool.edu.in
-- ==============================================================================

-- 1. UPDATE EXISTING DEMO & REGISTERED PROFILES
UPDATE public.profiles
SET email = REPLACE(email, '@shantibschool.edu', '@shantibschool.edu.in')
WHERE email LIKE '%@shantibschool.edu';

UPDATE public.profiles
SET email = REPLACE(email, '@alumni.shantibschool.edu', '@shantibschool.edu.in')
WHERE email LIKE '%@alumni.shantibschool.edu';

-- Update auth.users if available in Supabase Auth schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    UPDATE auth.users
    SET email = REPLACE(email, '@shantibschool.edu', '@shantibschool.edu.in')
    WHERE email LIKE '%@shantibschool.edu';

    UPDATE auth.users
    SET email = REPLACE(email, '@alumni.shantibschool.edu', '@shantibschool.edu.in')
    WHERE email LIKE '%@alumni.shantibschool.edu';
  END IF;
END $$;

-- 2. EXACT DOMAIN VALIDATION HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_valid_college_email(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_domain TEXT;
BEGIN
  IF p_email IS NULL OR p_email = '' THEN
    RETURN FALSE;
  END IF;
  
  -- Extract domain part after @ and normalize to lowercase
  v_domain := lower(trim(split_part(p_email, '@', 2)));
  
  -- Enforce exact match on shantibschool.edu.in (subdomains not permitted)
  RETURN (v_domain = 'shantibschool.edu.in');
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
  -- Extract domain from email (lowercase & trimmed)
  v_domain := lower(trim(split_part(new.email, '@', 2)));
  
  -- Enforce allowed domain for Shanti Business School (SBS) - exact match after @
  IF v_domain <> 'shantibschool.edu.in' THEN
    RAISE EXCEPTION 'Registration rejected: please use your official SBS email ending with @shantibschool.edu.in.';
  END IF;

  -- Auto-approve admin if email matches admin@shantibschool.edu.in
  IF lower(trim(new.email)) = 'admin@shantibschool.edu.in' THEN
    v_role := 'admin';
    v_approved := true;
  END IF;

  INSERT INTO public.profiles (id, email, name, role, is_approved, plan)
  VALUES (
    new.id,
    lower(trim(new.email)),
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
COMMENT ON FUNCTION public.handle_new_user() IS 'Enforces @shantibschool.edu.in domain and configures profile for Shanti Business School (SBS)';
