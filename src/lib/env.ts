import { z } from "zod";

const envSchema = z.object({
  // Application branding & domain
  NEXT_PUBLIC_APP_NAME: z.string().default("SBS CaseLab"),
  NEXT_PUBLIC_COLLEGE_NAME: z.string().default("Shanti Business School"),
  NEXT_PUBLIC_COLLEGE_SHORT: z.string().default("SBS"),
  NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN: z.string().default("shantibschool.edu.in"),

  // Runtime data source mode
  DATA_SOURCE: z.enum(["supabase", "mock"]).default("mock"),
  NEXT_PUBLIC_ENABLE_DEMO_MODE: z.string().default("true"),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid Supabase project URL").default("https://example-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required").default("placeholder-anon-key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required").default("placeholder-service-key"),

  // Session security (Server Only)
  SESSION_SECRET: z.string().default("sbs-caselab-secure-auth-secret-key-32chars"),

  // AI & Payment Credentials (Optional in local dev/demo)
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional().default("rzp_test_51H8gAbcDef123"),
  RAZORPAY_KEY_SECRET: z.string().optional().default("test_secret_key_placeholder_998877"),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default("test_webhook_secret_key"),
  DEMO_PAYMENTS: z.string().default("false"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let cachedEnv: EnvConfig | null = null;

export function validateEnv(strictSupabaseCheck = false): EnvConfig {
  if (cachedEnv && !strictSupabaseCheck) {
    return cachedEnv;
  }

  const rawEnv = {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_COLLEGE_NAME: process.env.NEXT_PUBLIC_COLLENAME || process.env.NEXT_PUBLIC_COLLEGE_NAME,
    NEXT_PUBLIC_COLLEGE_SHORT: process.env.NEXT_PUBLIC_COLLEGE_SHORT,
    NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN: process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN,
    DATA_SOURCE: process.env.DATA_SOURCE,
    NEXT_PUBLIC_ENABLE_DEMO_MODE: process.env.NEXT_PUBLIC_ENABLE_DEMO_MODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    DEMO_PAYMENTS: process.env.DEMO_PAYMENTS,
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error("❌ Environment validation error:");
    parsed.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    });
    throw new Error(
      `Invalid environment configuration. Please check your .env.local file.\n${parsed.error.issues.map((i) => `  * ${i.path.join(".")}: ${i.message}`).join("\n")}`
    );
  }

  const config = parsed.data;

  // Strict check when running with real Supabase
  if (strictSupabaseCheck || config.DATA_SOURCE === "supabase") {
    const missing: string[] = [];
    if (!config.NEXT_PUBLIC_SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL.includes("example-project")) {
      missing.push("NEXT_PUBLIC_SUPABASE_URL");
    }
    if (!config.NEXT_PUBLIC_SUPABASE_ANON_KEY || config.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder")) {
      missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
    if (!config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_SERVICE_ROLE_KEY.includes("placeholder")) {
      missing.push("SUPABASE_SERVICE_ROLE_KEY");
    }

    if (missing.length > 0) {
      const err = `❌ Missing real Supabase credentials in .env.local for DATA_SOURCE=supabase:\n${missing.map((k) => `   - ${k}`).join("\n")}\nPlease create your Supabase project and paste your keys into .env.local.`;
      console.error(err);
      if (strictSupabaseCheck) {
        throw new Error(err);
      }
    }
  }

  cachedEnv = config;
  return config;
}

export const env = validateEnv(false);
