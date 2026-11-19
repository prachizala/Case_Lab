import { z } from "zod";
import { isSbsDomain } from "@/config/college";

/**
 * Normalizes and validates Indian mobile phone numbers.
 * Valid numbers are 10 digits starting with 6, 7, 8, or 9,
 * with optional +91, 91, or leading 0 prefix.
 * Normalized format: +91XXXXXXXXXX
 */
export function normalizeIndianMobile(raw: string): { valid: boolean; normalized?: string; error?: string } {
  if (!raw || typeof raw !== "string") {
    return { valid: false, error: "Mobile number is required." };
  }

  // Strip spaces, dashes, parentheses, dots
  const cleaned = raw.replace(/[\s\-\(\)\.]/g, "");

  // Match optional prefix followed by 10 digits starting with 6-9
  const match = cleaned.match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  if (!match) {
    return {
      valid: false,
      error: "Please enter a valid 10-digit Indian mobile number (e.g., +91 98765 43210).",
    };
  }

  return {
    valid: true,
    normalized: `+91${match[1]}`,
  };
}

/**
 * Validates personal email:
 * 1. Must be a valid email format.
 * 2. Must NOT be an official SBS domain address.
 * 3. Must not match the SBS institutional email.
 */
export function validatePersonalEmail(personalEmail: string, sbsEmail?: string): { valid: boolean; error?: string } {
  if (!personalEmail || typeof personalEmail !== "string") {
    return { valid: false, error: "Personal email address is required." };
  }

  const trimmed = personalEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Please enter a valid personal email address." };
  }

  if (isSbsDomain(trimmed)) {
    return {
      valid: false,
      error: "Personal email must be a non-SBS address (e.g. Gmail, Yahoo, Outlook) for alumni records.",
    };
  }

  if (sbsEmail && trimmed === sbsEmail.trim().toLowerCase()) {
    return {
      valid: false,
      error: "Personal email cannot be identical to your institutional SBS email.",
    };
  }

  return { valid: true };
}

// Password strength schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one digit.")
  .refine(
    (pwd) => !/^(password|12345678|qwertyui|admin123)/i.test(pwd),
    "Password cannot be a common or easily guessable sequence."
  );

// Student registration schema
export const studentSignupSchema = z
  .object({
    user_type: z.literal("student"),
    name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z
      .string()
      .email("Invalid institutional email format.")
      .refine((val) => isSbsDomain(val), "Must use an authorized @shantibschool.edu.in email address."),
    personal_email: z.string().email("Invalid personal email format."),
    mobile: z.string().min(10, "Mobile number is required."),
    enrollment_no: z.string().min(3, "Enrollment number is required for students."),
    roll_no: z.string().optional().nullable(),
    course_id: z.string().min(1, "Please select your academic course/program."),
    batch_id: z.string().min(1, "Please select your academic batch."),
    faculty_type_id: z.undefined().or(z.null()),
    department_id: z.string().optional().nullable(),
    password: passwordSchema,
    confirm_password: z.string(),
    dpdp_consent: z.literal(true, {
      message: "Statutory consent under DPDP Act 2023 is mandatory.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine((data) => !isSbsDomain(data.personal_email), {
    message: "Personal email cannot be an institutional @shantibschool.edu.in address.",
    path: ["personal_email"],
  })
  .refine((data) => data.personal_email.toLowerCase() !== data.email.toLowerCase(), {
    message: "Personal email cannot match your institutional email.",
    path: ["personal_email"],
  });

// Faculty registration schema
export const facultySignupSchema = z
  .object({
    user_type: z.literal("faculty"),
    name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z
      .string()
      .email("Invalid institutional email format.")
      .refine((val) => isSbsDomain(val), "Must use an authorized @shantibschool.edu.in email address."),
    personal_email: z.string().email("Invalid personal email format."),
    mobile: z.string().min(10, "Mobile number is required."),
    enrollment_no: z.string().min(3, "Employee ID is required for faculty members."),
    department_id: z.string().min(1, "Please select the academic department you teach in."),
    course_id: z.string().min(1, "Please select your primary course."),
    faculty_type_id: z.string().min(1, "Please select your faculty appointment type."),
    batch_id: z.undefined().or(z.null()),
    roll_no: z.undefined().or(z.null()),
    password: passwordSchema,
    confirm_password: z.string(),
    dpdp_consent: z.literal(true, {
      message: "Statutory consent under DPDP Act 2023 is mandatory.",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  })
  .refine((data) => !isSbsDomain(data.personal_email), {
    message: "Personal email cannot be an institutional @shantibschool.edu.in address.",
    path: ["personal_email"],
  })
  .refine((data) => data.personal_email.toLowerCase() !== data.email.toLowerCase(), {
    message: "Personal email cannot match your institutional email.",
    path: ["personal_email"],
  });

// Unified Signup Schema
export const signupSchema = z.discriminatedUnion("user_type", [
  studentSignupSchema,
  facultySignupSchema,
]);

export type StudentSignupInput = z.infer<typeof studentSignupSchema>;
export type FacultySignupInput = z.infer<typeof facultySignupSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
