-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) Case Study Repository
-- Migration: 00018_add_domain_column_to_cases.sql
-- Description:
--   1. Adds nullable text column `domain` to `cases` and `repository_items`
--   2. Adds b-tree indexes on `domain` for performant faceted filtering
--   3. Best-effort backfill mapping historical cases to 8 canonical domain IDs
--   4. Unmapped rows remain NULL (rendered as "Unassigned" in UI filters)
--   5. NO CHECK constraint (guarantees zero breakage on legacy records)
-- ==============================================================================

-- 1. ADD NULLABLE DOMAIN COLUMN
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS domain TEXT;

ALTER TABLE public.repository_items
  ADD COLUMN IF NOT EXISTS domain TEXT;

-- 2. CREATE INDEXES FOR FAST FILTERING
CREATE INDEX IF NOT EXISTS idx_cases_domain
  ON public.cases(domain);

CREATE INDEX IF NOT EXISTS idx_repository_items_domain
  ON public.repository_items(domain);

-- 3. BEST-EFFORT BACKFILL FOR EXISTING CASES (MAP TO 8 CANONICAL DOMAIN IDS)
-- Canonical IDs: 'finance', 'marketing', 'hr', 'it', 'supply-chain', 'strategy', 'analytics', 'operations'

-- Finance
UPDATE public.cases
SET domain = 'finance'
WHERE domain IS NULL AND (
  LOWER(COALESCE(industry, '')) LIKE '%finance%' OR
  LOWER(COALESCE(industry, '')) LIKE '%banking%' OR
  LOWER(COALESCE(industry, '')) LIKE '%fintech%' OR
  LOWER(COALESCE(function, '')) LIKE '%finance%'
);

-- Marketing
UPDATE public.cases
SET domain = 'marketing'
WHERE domain IS NULL AND (
  LOWER(COALESCE(industry, '')) LIKE '%marketing%' OR
  LOWER(COALESCE(industry, '')) LIKE '%brand%' OR
  LOWER(COALESCE(industry, '')) LIKE '%fmcg%' OR
  LOWER(COALESCE(industry, '')) LIKE '%consumer%' OR
  LOWER(COALESCE(function, '')) LIKE '%marketing%'
);

-- HR
UPDATE public.cases
SET domain = 'hr'
WHERE domain IS NULL AND (
  LOWER(COALESCE(industry, '')) LIKE '%human resource%' OR
  LOWER(COALESCE(industry, '')) LIKE '%talent%' OR
  LOWER(COALESCE(function, '')) LIKE '%hr%' OR
  LOWER(COALESCE(function, '')) LIKE '%leadership%' OR
  LOWER(COALESCE(function, '')) LIKE '%governance%'
);

-- IT
UPDATE public.cases
SET domain = 'it'
WHERE domain IS NULL AND (
  LOWER(COALESCE(industry, '')) LIKE '%software%' OR
  LOWER(COALESCE(industry, '')) LIKE '%deeptech%' OR
  LOWER(COALESCE(industry, '')) LIKE '%saas%' OR
  LOWER(COALESCE(industry, '')) LIKE '%semiconductor%' OR
  LOWER(COALESCE(function, '')) LIKE '%it%' OR
  LOWER(COALESCE(function, '')) LIKE '%ai%'
);

-- Supply Chain
UPDATE public.cases
SET domain = 'supply-chain'
WHERE domain IS NULL AND (
  LOWER(COALESCE(industry, '')) LIKE '%supply chain%' OR
  LOWER(COALESCE(industry, '')) LIKE '%logistics%' OR
  LOWER(COALESCE(industry, '')) LIKE '%agri-tech%' OR
  LOWER(COALESCE(function, '')) LIKE '%supply%'
);

-- Operations
UPDATE public.cases
SET domain = 'operations'
WHERE domain IS NULL AND (
  LOWER(COALESCE(industry, '')) LIKE '%manufacturing%' OR
  LOWER(COALESCE(industry, '')) LIKE '%textile%' OR
  LOWER(COALESCE(function, '')) LIKE '%operations%' OR
  LOWER(COALESCE(function, '')) LIKE '%process%'
);

-- Analytics
UPDATE public.cases
SET domain = 'analytics'
WHERE domain IS NULL AND (
  LOWER(COALESCE(function, '')) LIKE '%analytics%' OR
  LOWER(COALESCE(title, '')) LIKE '%analytics%' OR
  LOWER(COALESCE(title, '')) LIKE '%data%'
);

-- Strategy
UPDATE public.cases
SET domain = 'strategy'
WHERE domain IS NULL AND (
  LOWER(COALESCE(function, '')) LIKE '%strategy%' OR
  LOWER(COALESCE(function, '')) LIKE '%strategic%' OR
  LOWER(COALESCE(function, '')) LIKE '%merger%' OR
  LOWER(COALESCE(function, '')) LIKE '%alliance%'
);

-- 4. PROPAGATE DOMAIN TO REPOSITORY_ITEMS FROM UNDERLYING CASES
UPDATE public.repository_items ri
SET domain = c.domain
FROM public.cases c
WHERE ri.case_id = c.id
  AND ri.domain IS NULL
  AND c.domain IS NOT NULL;
