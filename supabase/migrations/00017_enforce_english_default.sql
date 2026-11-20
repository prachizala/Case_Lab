-- Migration 00017: Enforce English default for cases while preserving legacy historical records
-- Non-destructive: sets language column default to 'en', preserves existing rows and backward compatibility.

ALTER TABLE public.cases 
  ALTER COLUMN language SET DEFAULT 'en';

-- Document institutional transition to English-only curriculum standard
COMMENT ON COLUMN public.cases.language IS 'Curricular instruction language. Default and standard is en. Historical legacy records may contain hi or gu.';
