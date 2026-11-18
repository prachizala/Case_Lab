-- ==============================================================================
-- Migration: 00014_dpdp_consent_versioning.sql
-- Description: Adds consent_version, policy_version, and withdrawal tracking to profiles
-- ==============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS consent_version TEXT DEFAULT '2023.1',
ADD COLUMN IF NOT EXISTS policy_version TEXT DEFAULT 'v1.2',
ADD COLUMN IF NOT EXISTS consent_withdrawn_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.profiles.consent_version IS 'DPDP Act 2023 consent specification version accepted during signup';
COMMENT ON COLUMN public.profiles.policy_version IS 'Privacy Policy version accepted by user';
COMMENT ON COLUMN public.profiles.consent_withdrawn_at IS 'Timestamp when user exercised statutory right to withdraw consent';
