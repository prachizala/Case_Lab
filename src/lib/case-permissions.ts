import { mockStore } from "./mock-db";
import { CaseStudy } from "./types";
import { CECasePack } from "./casepack/schema";

/**
 * Checks whether student case generation is permitted via environment variable.
 * Default is TRUE (students can generate cases freely).
 * Can be explicitly disabled by setting STUDENT_CASE_GENERATION=false.
 */
export function isStudentCaseGenerationEnabled(): boolean {
  return process.env.STUDENT_CASE_GENERATION !== "false";
}

/**
 * Retrieves the maximum number of cases a student may generate per day.
 * Default is 0 (0 means unlimited case generation).
 * Can be configured via env STUDENT_GENERATION_LIMIT (e.g. "3").
 */
export function getStudentDailyGenerationLimit(): number {
  const envVal = process.env.STUDENT_GENERATION_LIMIT;
  if (envVal !== undefined && envVal !== "") {
    const parsed = parseInt(envVal, 10);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }
  return 0; // 0 = unlimited by default
}

/**
 * Checks role-based permission to initiate case generation.
 * Faculty, admin, and students can generate cases freely.
 */
export function checkCaseGenerationAccess(userRole: string): {
  allowed: boolean;
  status: number;
  error?: string;
  code?: string;
} {
  if (userRole === "admin" || userRole === "faculty") {
    return { allowed: true, status: 200 };
  }

  if (userRole === "student") {
    if (isStudentCaseGenerationEnabled()) {
      return { allowed: true, status: 200 };
    }
    return {
      allowed: false,
      status: 403,
      error: "Students are restricted from generating case packs by institutional policy.",
      code: "STUDENT_GENERATION_DISABLED",
    };
  }

  return {
    allowed: false,
    status: 403,
    error: "Unauthorized role for case generation.",
    code: "UNAUTHORIZED_ROLE",
  };
}

/**
 * Checks student daily generation rate limit.
 * By default, STUDENT_GENERATION_LIMIT=0 (unlimited).
 * If a positive limit is explicitly configured, rate limiting is enforced.
 */
export function checkStudentDailyLimit(userId: string): {
  allowed: boolean;
  count: number;
  limit: number;
  remaining: number;
} {
  const limit = getStudentDailyGenerationLimit();
  const count = mockStore.getUserDailyUsageCount(userId);
  if (limit === 0) {
    return {
      allowed: true,
      count,
      limit: 0,
      remaining: 999999,
    };
  }
  const remaining = Math.max(0, limit - count);
  return {
    allowed: count < limit,
    count,
    limit,
    remaining,
  };
}

/**
 * Strips confidential faculty assets (Model Answer Keys, Teaching Notes, Checks)
 * from CE Case Pack or Case Study payloads returned to students.
 */
export function sanitizeCasePackForStudent(casePack: CECasePack): CECasePack {
  return {
    ...casePack,
    answers: [], // Model answers strictly stripped on the server
    teaching_notes: {
      synopsis: "Student practice mode: Teaching notes are reserved for instructional faculty.",
      objectives: casePack.teaching_notes?.objectives || [],
      teaching_approach: "Independent analytical practice",
      frameworks: casePack.teaching_notes?.frameworks || [],
      common_mistakes: [],
      marking_scheme: [],
    },
    quality: {
      facts_to_verify: [],
      illustrative_figures: [],
    },
  };
}

/**
 * Sanitizes CaseStudy for students: marks practice mode and strips faculty notes.
 */
export function sanitizeCaseStudyForStudent(caseStudy: CaseStudy): CaseStudy {
  const sanitized: CaseStudy = {
    ...caseStudy,
    student_practice: true,
    status: "draft",
  };

  if (sanitized.content) {
    const content = { ...sanitized.content } as any;
    if (content.teaching_note) {
      delete content.teaching_note;
    }
    if (content.teaching_notes) {
      delete content.teaching_notes;
    }
    if (content.answer_key) {
      delete content.answer_key;
    }
    if (content.answers) {
      content.answers = [];
    }
    if (content.model_answers) {
      delete content.model_answers;
    }
    if (content.solution_keys) {
      delete content.solution_keys;
    }
    if (content.pedagogical_checks) {
      delete content.pedagogical_checks;
    }
    if (content.rubrics) {
      delete content.rubrics;
    }
    if (Array.isArray(content.discussion_questions)) {
      content.discussion_questions = content.discussion_questions.map((q: any) => {
        if (typeof q === "object" && q !== null) {
          const { suggested_answer, model_answer, solution, ...rest } = q;
          return rest;
        }
        return q;
      });
    }
    if (Array.isArray(content.questions)) {
      content.questions = content.questions.map((q: any) => {
        if (typeof q === "object" && q !== null) {
          const { suggested_answer, model_answer, solution, ...rest } = q;
          return rest;
        }
        return q;
      });
    }
    sanitized.content = content;
  }

  return sanitized;
}
