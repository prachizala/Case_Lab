export type UserRole = "admin" | "faculty" | "student";

export type UserType = "sbs_member" | "external";

export type UserPlan = "standard" | "premium" | "institutional" | "lifetime";

export interface PlatformSettings {
  external_free_limit: number;
  sbs_fair_use_limit: number;
  allowed_domains: string[];
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  department_id: string;
  dept: string;
  code: string;
  name: string;
  semester: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  user_type?: UserType;
  email_verified_at?: string | null;
  free_cases_used_this_month?: number;
  free_cases_reset_at?: string;
  verification_otp?: string | null;
  otp_expires_at?: string | null;
  department_id?: string | null;
  plan: UserPlan;
  is_approved: boolean;
  is_reviewer?: boolean; // Faculty marked as reviewer by admin
  portfolio_public?: boolean; // Student public portfolio toggle
  watch_industries?: string[]; // Faculty watch industries (up to 8)
  subscription_status?: "active" | "expired" | "none"; // For alumni continuing education
  monthly_generation_limit?: number; // Monthly case generations quota
  monthly_generations_used?: number; // Monthly case generations used
  sbs_eligible?: boolean; // Verified Shanti Business School affiliate
  dpdp_consent?: boolean; // DPDP Act 2023 consent
  dpdp_consent_at?: string; // DPDP Act 2023 consent timestamp
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CaseType = "short" | "full" | "research" | "flash";
export type CaseFormat = "hypothetical" | "real_signal";
export type CaseStatus = "draft" | "in_review" | "approved" | "published" | "archived" | "changes_requested";
export type CaseVisibility = "private" | "sbs_only" | "public";
export type CaseLanguage = "en" | "hi" | "gu";

export type CaseDomain =
  | "Marketing"
  | "Finance"
  | "HR"
  | "Supply Chain"
  | "Operations"
  | "Strategy"
  | "Analytics"
  | "Entrepreneurship"
  | "Other";
export type CaseDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type CaseTargetAudience = "Undergraduate" | "MBA" | "Executive";
export type CaseTone = "Academic" | "Journalistic" | "Executive Briefing";
export type CaseBloomsLevel = "Remember & Understand" | "Apply & Analyze" | "Evaluate & Create";
export type CaseExhibitType = "financials" | "org_chart" | "market_data" | "table";

export interface KeyDataRow {
  metric: string;
  value: string;
  period?: string;
  notes?: string;
}

export interface CaseExhibit {
  id: string;
  title: string;
  type: CaseExhibitType;
  description?: string;
  data: any;
}

export interface TeachingNote {
  objectives: string[];
  class_flow: {
    phase: string;
    duration_minutes: number;
    activity: string;
  }[];
  frameworks: {
    name: string;
    application: string;
    key_takeaway: string;
  }[];
}

export interface CaseContent {
  title: string;
  summary: string;
  background: string;
  challenge: string;
  key_data: KeyDataRow[];
  decision_point: string;
  discussion_questions: string[]; // typically 3 to 5
  teaching_note?: TeachingNote;
  exhibits?: CaseExhibit[];
  primary_company?: string;
  location_market?: string;
  central_dilemma?: string;
  key_decision_maker?: string;
  protagonists?: string;
  learning_objectives?: string[];
  tone?: CaseTone;
  blooms_level?: string;
  domain?: CaseDomain;
  difficulty?: CaseDifficulty;
  target_audience?: CaseTargetAudience;
  verify_facts_flag?: boolean; // For real_signal cases
  figures_disclaimer?: string; // "illustrative"
  visibility?: CaseVisibility;
}

export interface CaseVersion {
  id: string;
  case_id: string;
  version_number: number;
  title: string;
  content: CaseContent;
  updated_by: string;
  change_summary?: string;
  created_at: string;
}

export interface CaseCollection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  case_ids: string[];
  created_at: string;
  updated_at?: string;
}

export interface CaseStudy {
  id: string;
  author_id: string;
  author_name?: string;
  title: string;
  status: CaseStatus;
  visibility?: CaseVisibility;
  type: CaseType;
  format: CaseFormat;
  industry: string;
  function: string;
  domain?: CaseDomain;
  difficulty?: CaseDifficulty;
  target_audience?: CaseTargetAudience;
  primary_company?: string;
  location_market?: string;
  central_dilemma?: string;
  key_decision_maker?: string;
  protagonists?: string;
  learning_objectives?: string[];
  tone?: CaseTone;
  blooms_level?: string;
  course_id?: string | null;
  course_name?: string | null;
  department_id?: string | null; // For department student visibility
  level: string;
  language: CaseLanguage;
  complexity: number; // 1 - 10
  tags?: string[]; // Pedagogy tags & keywords
  content: CaseContent;
  source_notes?: string;
  version?: number; // current version number
  reviewer_id?: string | null;
  reviewer_comment?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  tokens_used: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  model: string;
  case_id?: string | null;
  created_at: string;
}

// Student Experience: Rubrics, Answers & Grades
export interface RubricCriterion {
  name: string;
  max_marks: number;
  description: string;
  outcome_ids?: string[]; // Mapped to CO/PO IDs
}

export interface Rubric {
  id: string;
  case_id: string;
  criteria: RubricCriterion[];
  created_at?: string;
  updated_at?: string;
}

export type AnswerStatus = "draft" | "submitted";

export interface StudentAnswer {
  id: string;
  case_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  text: string;
  status: AnswerStatus;
  word_count?: number;
  submitted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Grade {
  id: string;
  answer_id: string;
  case_id?: string;
  student_id?: string;
  ai_marks: Record<string, number>;
  ai_feedback: string;
  final_marks: number | null;
  criterion_scores?: Record<string, number>;
  faculty_comment?: string | null;
  graded_by?: string | null;
  is_published: boolean;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ==========================================
// OUTCOMES & CURRICULUM ACCREDITATION (CO / PO)
// ==========================================
export type OutcomeType = "CO" | "PO";

export interface Outcome {
  id: string;
  course_id?: string | null;
  course_code?: string;
  type: OutcomeType;
  code: string; // e.g. "CO-1", "PO-1"
  description: string;
  created_at?: string;
}

export interface CaseOutcome {
  case_id: string;
  outcome_id: string;
}

export interface OutcomeAttainment {
  outcome_id: string;
  course_id?: string;
  course_code?: string;
  course_name?: string;
  type: OutcomeType;
  code: string;
  description: string;
  target_threshold: number; // default 60%
  total_students_evaluated: number;
  students_meeting_target: number;
  attainment_percentage: number;
  status: "Attained" | "Needs Attention";
  average_score_percentage: number;
}

// ==========================================
// CASE SIGNALS (Indian Business News Radar)
// ==========================================
export interface CaseSignal {
  id: string;
  title: string;
  url: string;
  source: string;
  industry: string;
  summary: string;
  potential_score: number; // 1 - 10
  potential_reason: string;
  published_at: string;
  created_at: string;
}

// ==========================================
// LIVE SOCRATIC CLASSROOM & DECISION ROOM
// ==========================================
export interface ClassroomPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface ClassroomPoll {
  id: string;
  question: string;
  options: ClassroomPollOption[];
  total_votes: number;
  phase: "before_debate" | "after_debate";
  is_open: boolean;
}

export interface ColdCallRecord {
  student_id: string;
  student_name: string;
  timestamp: string;
  score?: number; // 1 - 5 stars
  notes?: string;
}

export interface BoardPlan {
  board_1_dilemma: string;
  board_2_alternatives: string;
  board_3_action_plan: string;
  updated_at?: string;
}

export interface ClassroomSession {
  id: string;
  case_id: string;
  case_title?: string;
  faculty_id: string;
  status: "active" | "completed";
  current_poll: ClassroomPoll;
  cold_call_history: ColdCallRecord[];
  board_plan: BoardPlan;
  created_at: string;
  updated_at: string;
}

// ==========================================
// EXECUTIVE AUDIO BRIEF ("CasePod")
// ==========================================
export interface AudioBriefDialogue {
  speaker: "Professor" | "Senior Analyst" | "Protagonist";
  timestamp: string;
  text: string;
}

export interface AudioBrief {
  case_id: string;
  title: string;
  duration_seconds: number;
  executive_summary: string;
  dialogue: AudioBriefDialogue[];
}

// ==========================================
// ACADEMIC INTEGRITY & CASE GROUNDING REPORT
// ==========================================
export interface IntegrityReport {
  answer_id: string;
  case_id: string;
  student_id: string;
  originality_score: number; // 0 - 100%
  case_citation_density: number; // 0 - 100%
  ai_probability_score: number; // 0 - 100%
  key_frameworks_detected: string[];
  hallucination_flags: string[];
  verdict: "High Integrity" | "Acceptable" | "Manual Review Recommended";
  created_at: string;
}

// ==========================================
// ALUMNI PRACTITIONER REFLECTIONS
// ==========================================
export interface PractitionerReflection {
  id: string;
  case_id: string;
  alumni_id: string;
  alumni_name: string;
  alumni_title: string; // e.g. "Vice President of Strategy, Alphabet"
  company: string;
  reflection_text: string;
  practical_takeaway: string;
  upvotes: number;
  upvoted_by?: string[];
  is_verified_alumni: boolean;
  created_at: string;
}

// ==========================================
// SUBSCRIPTIONS & RAZORPAY BILLING
// ==========================================
export type SubscriptionPlan = "monthly" | "yearly" | "lifetime";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  amount_paise: number; // 9900 (Rs 99), 60000 (Rs 600), 250000 (Rs 2500)
  currency: string; // "INR"
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  start_date: string;
  end_date: string;
  renewal_reminder_sent?: boolean;
  created_at: string;
  updated_at: string;
}

// ==========================================
// AUDIT LOGGING & COMPLIANCE
// ==========================================
export type AuditAction =
  | "role_change"
  | "case_created"
  | "case_submitted"
  | "case_approval"
  | "case_published"
  | "case_changes_requested"
  | "case_rejected"
  | "case_archived"
  | "case_restored"
  | "case_updated"
  | "registration_approved"
  | "registration_rejected"
  | "grade_override"
  | "user_graduation"
  | "user_quota_updated"
  | "user_plan_updated"
  | "user_rejected"
  | "email_verified"
  | "allowed_domain_added"
  | "allowed_domain_removed"
  | "platform_settings_updated"
  | "subscription_created"
  | "data_export"
  | "data_erasure"
  | "admin_action";

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  actor_name?: string;
  action: AuditAction;
  target_id: string;
  target_type: "user" | "case" | "grade" | "subscription" | "data_subject" | "platform_settings";
  details?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// ==========================================
// INSTITUTIONAL TOKEN BUDGET MONITORING
// ==========================================
export interface DepartmentBudgetUsage {
  department_id: string;
  department_name: string;
  tokens_used: number;
  percentage: number;
}

export interface TokenBudgetInfo {
  college_name: string;
  monthly_budget_tokens: number; // e.g. 500,000
  tokens_used_this_month: number;
  remaining_tokens: number;
  usage_percentage: number;
  is_warning_threshold: boolean; // >= 80%
  warning: boolean; // >= 80% warning flag
  is_blocked?: boolean; // >= 100% blocked state
  billing_cycle_start: string;
  billing_cycle_end: string;
  department_breakdown?: DepartmentBudgetUsage[];
}

// ==========================================
// DASHBOARD STATS & RECENT ACTIVITY
// ==========================================
export interface DashboardTelemetry {
  totalCases: number;
  pendingApprovals: number;
  activeFaculty: number;
  activeStudents: number;
  casesCreatedThisMonth: number;
}

export interface RecentActivityItem {
  id: string;
  type: "case_created" | "case_submitted" | "case_approved" | "case_published" | "registration_approved" | "registration_rejected";
  title: string;
  actor_name: string;
  actor_role: UserRole;
  timestamp: string;
  case_id?: string;
  details?: string;
}



