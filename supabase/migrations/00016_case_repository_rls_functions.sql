-- ==============================================================================
-- SBS CaseLab: Shanti Business School (SBS) Academic Case Study Repository
-- Migration: 00016_case_repository_rls_functions.sql
-- Description:
--   1. Function assign_reviewer(p_case_id UUID) with atomic row locking
--   2. Enhanced prevent_self_role_change trigger (protects role, faculty_type, is_reviewer, access_status)
--   3. Row Level Security policies for review_rounds, review_comments, repository_items, download_log
--   4. Student Answer Key & Teaching Note Protection (secure view and rubrics policy)
-- ==============================================================================

-- 1. ENHANCED SELF-ROLE & STATUS PROTECTION TRIGGER
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If role, faculty_type_id, is_reviewer, or access_status is changing, verify admin privilege
  IF (OLD.role IS DISTINCT FROM NEW.role OR
      OLD.faculty_type_id IS DISTINCT FROM NEW.faculty_type_id OR
      OLD.is_reviewer IS DISTINCT FROM NEW.is_reviewer OR
      OLD.access_status IS DISTINCT FROM NEW.access_status) THEN
    IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access denied: users cannot modify their own role, faculty type, reviewer status, or access status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ATOMIC REVIEWER ROTATION FUNCTION
CREATE OR REPLACE FUNCTION public.assign_reviewer(p_case_id UUID)
RETURNS UUID AS $$
DECLARE
  v_author_id UUID;
  v_department_id UUID;
  v_case_title TEXT;
  v_scope_key TEXT;
  v_last_reviewer_id TEXT;
  v_next_reviewer_id UUID;
  v_round_no INTEGER;
  v_round_id UUID;
  v_candidates UUID[];
  v_idx INTEGER;
  v_total INTEGER;
BEGIN
  -- Fetch case metadata
  SELECT author_id, department_id, title
  INTO v_author_id, v_department_id, v_case_title
  FROM public.cases
  WHERE id = p_case_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Case % not found.', p_case_id;
  END IF;

  -- Define rotation scope key (department specific or global fallback)
  v_scope_key := 'dept:' || COALESCE(v_department_id::text, 'general');

  -- Ensure rotation tracker row exists, then lock atomically
  INSERT INTO public.reviewer_rotation (scope_key, last_reviewer_id, updated_at)
  VALUES (v_scope_key, NULL, NOW())
  ON CONFLICT (scope_key) DO NOTHING;

  SELECT last_reviewer_id
  INTO v_last_reviewer_id
  FROM public.reviewer_rotation
  WHERE scope_key = v_scope_key
  FOR UPDATE;

  -- 1st Priority: Active departmental faculty reviewers (excluding author)
  SELECT ARRAY_AGG(id ORDER BY id ASC)
  INTO v_candidates
  FROM public.profiles
  WHERE role = 'faculty'
    AND is_reviewer = true
    AND access_status = 'active'
    AND id <> v_author_id
    AND (department_id = v_department_id OR v_department_id IS NULL);

  -- 2nd Priority: Fallback to any active faculty reviewer (excluding author)
  IF v_candidates IS NULL OR ARRAY_LENGTH(v_candidates, 1) = 0 THEN
    SELECT ARRAY_AGG(id ORDER BY id ASC)
    INTO v_candidates
    FROM public.profiles
    WHERE role = 'faculty'
      AND is_reviewer = true
      AND access_status = 'active'
      AND id <> v_author_id;
  END IF;

  v_total := COALESCE(ARRAY_LENGTH(v_candidates, 1), 0);
  IF v_total = 0 THEN
    RAISE EXCEPTION 'No eligible faculty reviewer available for case assignment.';
  END IF;

  -- Round robin selection
  v_next_reviewer_id := NULL;
  IF v_last_reviewer_id IS NOT NULL THEN
    FOR i IN 1..v_total LOOP
      IF v_candidates[i]::text = v_last_reviewer_id THEN
        v_idx := (i % v_total) + 1;
        v_next_reviewer_id := v_candidates[v_idx];
        EXIT;
      END IF;
    END LOOP;
  END IF;

  -- If last reviewer wasn't in candidates or was null, choose 1st candidate
  IF v_next_reviewer_id IS NULL THEN
    v_next_reviewer_id := v_candidates[1];
  END IF;

  -- Update rotation state atomically
  UPDATE public.reviewer_rotation
  SET last_reviewer_id = v_next_reviewer_id::text,
      updated_at = NOW()
  WHERE scope_key = v_scope_key;

  -- Calculate next round number
  SELECT COALESCE(MAX(round_no), 0) + 1
  INTO v_round_no
  FROM public.review_rounds
  WHERE case_id = p_case_id;

  -- Create review round
  INSERT INTO public.review_rounds (
    case_id,
    round_no,
    reviewer_id,
    assigned_at,
    due_at,
    decision,
    created_at
  )
  VALUES (
    p_case_id,
    v_round_no,
    v_next_reviewer_id::text,
    NOW(),
    NOW() + INTERVAL '3 days',
    'pending',
    NOW()
  )
  RETURNING id INTO v_round_id;

  -- Update case status
  UPDATE public.cases
  SET status = 'in_review',
      review_status = 'in_review',
      reviewer_id = v_next_reviewer_id,
      updated_at = NOW()
  WHERE id = p_case_id;

  -- Send notification to reviewer
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link,
    created_at
  )
  VALUES (
    v_next_reviewer_id,
    'case_review',
    'Peer Review Assignment Required',
    'You have been assigned to review institutional case: ' || COALESCE(v_case_title, 'Untitled'),
    '/reviewer/review/' || p_case_id::text,
    NOW()
  );

  -- Record audit log
  INSERT INTO public.audit_logs (
    actor_id,
    action,
    target_type,
    target_id,
    details,
    created_at
  )
  VALUES (
    COALESCE(auth.uid(), v_author_id),
    'assign_reviewer',
    'case',
    p_case_id,
    jsonb_build_object(
      'round_id', v_round_id,
      'round_no', v_round_no,
      'reviewer_id', v_next_reviewer_id,
      'scope_key', v_scope_key
    ),
    NOW()
  );

  RETURN v_next_reviewer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewer_rotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repository_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_log ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR LOOKUP TABLES
DROP POLICY IF EXISTS "Batches readable by authenticated" ON public.batches;
CREATE POLICY "Batches readable by authenticated" ON public.batches FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Faculty types readable by authenticated" ON public.faculty_types;
CREATE POLICY "Faculty types readable by authenticated" ON public.faculty_types FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Case categories readable by authenticated" ON public.case_categories;
CREATE POLICY "Case categories readable by authenticated" ON public.case_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Case types readable by authenticated" ON public.case_types;
CREATE POLICY "Case types readable by authenticated" ON public.case_types FOR SELECT TO authenticated USING (true);

-- Admin management for lookup tables
DROP POLICY IF EXISTS "Admin manages batches" ON public.batches;
CREATE POLICY "Admin manages batches" ON public.batches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages faculty types" ON public.faculty_types;
CREATE POLICY "Admin manages faculty types" ON public.faculty_types FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages case categories" ON public.case_categories;
CREATE POLICY "Admin manages case categories" ON public.case_categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin manages case types" ON public.case_types;
CREATE POLICY "Admin manages case types" ON public.case_types FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. RLS POLICIES FOR CASES (UPDATED FOR PEER REVIEW & STUDENTS)
DROP POLICY IF EXISTS "Cases select policy" ON public.cases;
CREATE POLICY "Cases select policy"
  ON public.cases FOR SELECT
  TO authenticated
  USING (
    -- Admin sees everything
    public.is_admin()
    -- Authors see their own cases regardless of status
    OR author_id = auth.uid()
    -- Assigned reviewers see cases assigned to them
    OR EXISTS (
      SELECT 1 FROM public.review_rounds rr
      WHERE rr.case_id = cases.id
        AND rr.reviewer_id = auth.uid()::text
    )
    -- Faculty see approved cases in their department
    OR (
      public.is_faculty()
      AND status = 'approved'
      AND (
        department_id IS NULL OR
        department_id = (SELECT department_id FROM public.profiles WHERE id = auth.uid())
      )
    )
    -- Students see ONLY approved cases
    OR (
      public.get_current_role() = 'student'
      AND status = 'approved'
    )
  );

-- Both faculty and students can insert cases (author_role reflects role)
DROP POLICY IF EXISTS "Users can insert cases" ON public.cases;
CREATE POLICY "Users can insert cases"
  ON public.cases FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
  );

-- 6. RLS POLICIES FOR PEER REVIEW ROUNDS & COMMENTS
DROP POLICY IF EXISTS "Review rounds select policy" ON public.review_rounds;
CREATE POLICY "Review rounds select policy"
  ON public.review_rounds FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR reviewer_id = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = review_rounds.case_id AND c.author_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Reviewers and admin can update review rounds" ON public.review_rounds;
CREATE POLICY "Reviewers and admin can update review rounds"
  ON public.review_rounds FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR reviewer_id = auth.uid()::text
  )
  WITH CHECK (
    public.is_admin() OR reviewer_id = auth.uid()::text
  );

DROP POLICY IF EXISTS "Review comments select policy" ON public.review_comments;
CREATE POLICY "Review comments select policy"
  ON public.review_comments FOR SELECT
  TO authenticated
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.review_rounds rr
      JOIN public.cases c ON c.id = rr.case_id
      WHERE rr.id = review_comments.round_id
        AND (rr.reviewer_id = auth.uid()::text OR c.author_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Reviewers and admin can insert review comments" ON public.review_comments;
CREATE POLICY "Reviewers and admin can insert review comments"
  ON public.review_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.review_rounds rr
      WHERE rr.id = round_id AND rr.reviewer_id = auth.uid()::text
    )
  );

-- 7. RLS POLICIES FOR REPOSITORY ITEMS & DOWNLOAD LOGS
DROP POLICY IF EXISTS "Repository items select policy" ON public.repository_items;
CREATE POLICY "Repository items select policy"
  ON public.repository_items FOR SELECT
  TO authenticated
  USING (
    is_published = true
    OR author_id = auth.uid()::text
    OR reviewer_id = auth.uid()::text
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Faculty and admin manage repository items" ON public.repository_items;
CREATE POLICY "Faculty and admin manage repository items"
  ON public.repository_items FOR ALL
  TO authenticated
  USING (public.is_faculty() OR public.is_admin())
  WITH CHECK (public.is_faculty() OR public.is_admin());

DROP POLICY IF EXISTS "Download log insert policy" ON public.download_log;
CREATE POLICY "Download log insert policy"
  ON public.download_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

DROP POLICY IF EXISTS "Download log select policy" ON public.download_log;
CREATE POLICY "Download log select policy"
  ON public.download_log FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid()::text);

-- 8. STUDENT PRIVACY: RESTRICT RUBRICS & MODEL ANSWER KEYS
DROP POLICY IF EXISTS "Rubrics faculty and admin only" ON public.rubrics;
CREATE POLICY "Rubrics faculty and admin only"
  ON public.rubrics FOR SELECT
  TO authenticated
  USING (public.is_faculty() OR public.is_admin());

-- Secure View for Student Repository (Strips teaching notes and model answers at DB level)
CREATE OR REPLACE VIEW public.student_repository_cases AS
SELECT
  r.id AS repository_item_id,
  r.case_id,
  r.department_id,
  r.course_id,
  r.category_id,
  r.keywords,
  r.uploaded_at,
  r.file_pdf_path,
  r.file_docx_path,
  c.title,
  c.industry,
  c.function,
  c.level,
  c.language,
  c.complexity,
  c.author_role,
  (
    c.content
    - 'teaching_note'
    - 'model_answers'
    - 'solution_keys'
    - 'rubrics'
    - 'pedagogical_checks'
  ) AS student_safe_content
FROM public.repository_items r
JOIN public.cases c ON r.case_id = c.id
WHERE r.is_published = true;
