import { z } from "zod";

/**
 * SBS CaseLab - CE Case Pack Zod Validation Schema
 * 
 * Defines the strict structural contract for teaching cases, examination questions,
 * faculty model answer keys, teaching notes, and quality controls.
 */

export const CasePackMetaSchema = z.object({
  department: z.enum(["finance", "hr", "marketing"]),
  subject: z.string().min(1, "Subject is required"),
  topic: z.array(z.string()).min(1, "At least one topic is required"),
  concepts: z.array(z.string()).min(1, "At least one concept is required"),
  course_code: z.string().optional(),
  ce_no: z.string().optional(),
  set: z.string().optional(),
  level: z.string().default("MBA / PGDM"),
  language: z.string().optional().default("en"),
  industry: z.string().min(1, "Industry is required"),
  geography: z.string().min(1, "Geography is required"),
  length: z.enum(["short", "standard"]).default("standard"),
  max_marks: z.number().int().positive().optional().default(40),
});

export const CaseSectionSchema = z.object({
  heading: z.string().min(1, "Section heading is required"),
  paragraphs: z.array(z.string()).min(1, "At least one paragraph is required"),
  bullets: z.array(z.string()).optional(),
});

export const DataTableSchema = z.object({
  title: z.string().min(1, "Data table title is required"),
  columns: z.array(z.string()).min(2, "At least two columns are required"),
  rows: z.array(z.array(z.union([z.string(), z.number()]))).min(1, "At least one row is required"),
});

export const CaseBodySchema = z.object({
  title: z.string().min(1, "Case title is required"),
  sections: z.array(CaseSectionSchema).min(2, "At least two sections are required"),
  data_tables: z.array(DataTableSchema).min(1, "At least one data table is required"),
  word_count: z.number().int().nonnegative(),
});

export const CaseQuestionSchema = z.object({
  id: z.string().min(1),
  bloom_verb: z.string().min(1, "Bloom verb is required"),
  text: z.string().min(10, "Question text must be substantive"),
  concepts: z.array(z.string()).min(1, "Must name concepts"),
  marks: z.number().int().positive().optional().default(20),
  co: z.string().optional(),
  k_level: z.string().optional(),
});

export const AnswerSectionSchema = z.object({
  heading: z.string().min(1),
  points: z.array(z.string()).optional().default([]),
  evaluation: z.array(z.string()).optional(),
  limitation: z.string().optional(),
  overall: z.string().optional(),
});

export const ComparisonTableSchema = z.object({
  columns: z.array(z.string()).min(2, "Comparison table must have at least 2 columns"),
  rows: z.array(z.array(z.union([z.string(), z.number()]))).min(2, "Comparison table must have at least 2 rows"),
});

export const CalculationStepSchema = z.object({
  label: z.string(),
  formula: z.string(),
  inputs: z.union([z.record(z.string(), z.any()), z.string()]),
  steps: z.array(z.string()),
  result: z.union([z.string(), z.number()]),
});

export const CaseAnswerSchema = z.object({
  question_id: z.string().min(1),
  introduction: z.string().min(10, "Introduction is required"),
  sections: z.array(AnswerSectionSchema).min(1, "At least one analytical section is required"),
  comparison_table: ComparisonTableSchema.optional(),
  calculations: z.array(CalculationStepSchema).optional(),
  overall_assessment: z.string().optional(),
  conclusion: z.string().min(10, "Conclusion is required"),
  word_count: z.number().int().nonnegative(),
});

export const MarkingCriterionSchema = z.object({
  criterion: z.string().min(1, "Criterion title is required"),
  marks: z.number().positive("Criterion marks must be positive"),
});

export const TeachingNotesSchema = z.object({
  synopsis: z.string().min(10, "Synopsis is required"),
  objectives: z.array(z.string()).min(1, "At least one objective is required"),
  teaching_approach: z.string().min(10, "Teaching approach is required"),
  frameworks: z.array(z.string()).min(1, "At least one framework is required"),
  common_mistakes: z.array(z.string()).min(1, "At least one common mistake is required"),
  marking_scheme: z.array(MarkingCriterionSchema).min(1, "At least one marking criterion is required"),
});

export const QualityChecksSchema = z.object({
  facts_to_verify: z.array(z.string()).default([]),
  illustrative_figures: z.array(z.string()).default([]),
});

export const CECasePackSchema = z.object({
  id: z.string().optional(),
  status: z
    .enum(["draft", "in_review", "approved", "rejected", "changes_requested", "pending_approval"])
    .default("draft"),
  notes: z.string().optional(),
  meta: CasePackMetaSchema,
  case: CaseBodySchema,
  questions: z.array(CaseQuestionSchema).min(1, "Case pack must have at least one question"),
  answers: z.array(CaseAnswerSchema).min(1, "Case pack must have at least one model answer"),
  teaching_notes: TeachingNotesSchema,
  quality: QualityChecksSchema,
});

export type CasePackMeta = z.infer<typeof CasePackMetaSchema>;
export type CaseSection = z.infer<typeof CaseSectionSchema>;
export type DataTable = z.infer<typeof DataTableSchema>;
export type CaseBody = z.infer<typeof CaseBodySchema>;
export type CaseQuestion = z.infer<typeof CaseQuestionSchema>;
export type AnswerSection = z.infer<typeof AnswerSectionSchema>;
export type ComparisonTable = z.infer<typeof ComparisonTableSchema>;
export type CalculationStep = z.infer<typeof CalculationStepSchema>;
export type CaseAnswer = z.infer<typeof CaseAnswerSchema>;
export type MarkingCriterion = z.infer<typeof MarkingCriterionSchema>;
export type TeachingNotes = z.infer<typeof TeachingNotesSchema>;
export type QualityChecks = z.infer<typeof QualityChecksSchema>;
export type CECasePack = z.infer<typeof CECasePackSchema>;

/**
 * Validates arbitrary input data against the complete CE Case Pack schema
 */
export function validateCECasePack(data: unknown): { success: true; data: CECasePack } | { success: false; errors: string[] } {
  const result = CECasePackSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map((err) => `${err.path.join(".")}: ${err.message}`),
  };
}
