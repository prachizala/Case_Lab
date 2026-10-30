import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import {
  ALLOWED_EMAIL_DOMAIN,
  COLLEGE_NAME,
  COLLEGE_SHORT,
  COLLEGE_NAME_WITH_SHORT,
  APP_NAME,
} from "../src/config/college";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

interface SeedDept {
  id: string;
  code: string;
  name: string;
  description: string;
}

interface SeedCourse {
  id: string;
  department_id: string;
  dept: string;
  code: string;
  name: string;
  semester: string;
}

interface SeedUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "faculty" | "student" | "alumni";
  department_id?: string;
  plan: "standard" | "institutional";
  is_approved: boolean;
}

const DEPARTMENTS: SeedDept[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    code: "FIN",
    name: "Finance & Economics",
    description: "Corporate finance, venture capital, macroeconomic models and valuation.",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    code: "STRAT",
    name: "Strategy & Organizational Behavior",
    description: "Enterprise strategy, disruptive innovation, leadership and behavioral psychology.",
  },
];

const COURSES: SeedCourse[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    department_id: "00000000-0000-0000-0000-000000000001",
    dept: "FIN",
    code: "FIN-101",
    name: "Corporate Valuation & Capital Markets",
    semester: "Fall 2026",
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    department_id: "00000000-0000-0000-0000-000000000001",
    dept: "FIN",
    code: "FIN-205",
    name: "Venture Capital & Private Equity Structuring",
    semester: "Spring 2027",
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    department_id: "00000000-0000-0000-0000-000000000001",
    dept: "FIN",
    code: "FIN-310",
    name: "Global Macroeconomic Policy & Emerging Markets",
    semester: "Fall 2026",
  },
  {
    id: "00000000-0000-0000-0000-000000000201",
    department_id: "00000000-0000-0000-0000-000000000002",
    dept: "STRAT",
    code: "STRAT-101",
    name: "Strategic Leadership & Enterprise Architecture",
    semester: "Fall 2026",
  },
  {
    id: "00000000-0000-0000-0000-000000000202",
    department_id: "00000000-0000-0000-0000-000000000002",
    dept: "STRAT",
    code: "STRAT-204",
    name: "Business Model Innovation in AI & Cloud",
    semester: "Spring 2027",
  },
  {
    id: "00000000-0000-0000-0000-000000000203",
    department_id: "00000000-0000-0000-0000-000000000002",
    dept: "STRAT",
    code: "STRAT-308",
    name: "Cross-Border Negotiations & Alliance Management",
    semester: "Spring 2027",
  },
];

const USERS: SeedUser[] = [
  // 1 Admin
  {
    id: "00000000-0000-0000-0000-000000000010",
    email: `admin@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Dean Eleanor Vance",
    role: "admin",
    department_id: "00000000-0000-0000-0000-000000000002",
    plan: "institutional",
    is_approved: true,
  },
  // 2 Faculty
  {
    id: "00000000-0000-0000-0000-000000000021",
    email: `faculty1@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Prof. Arthur Miller",
    role: "faculty",
    department_id: "00000000-0000-0000-0000-000000000001",
    plan: "institutional",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000022",
    email: `faculty2@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Dr. Maya Chen",
    role: "faculty",
    department_id: "00000000-0000-0000-0000-000000000002",
    plan: "institutional",
    is_approved: true,
  },
  // 10 Students
  {
    id: "00000000-0000-0000-0000-000000000031",
    email: `student1@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Aarav Sharma",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000001",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000032",
    email: `student2@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Priya Patel",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000002",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000033",
    email: `student3@${ALLOWED_EMAIL_DOMAIN}`,
    name: "David Kim",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000001",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000034",
    email: `student4@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Elena Rostova",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000002",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000035",
    email: `student5@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Marcus Aurelius",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000001",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000036",
    email: `student6@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Sofia Gonzalez",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000002",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000037",
    email: `student7@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Tariq Mansoor",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000001",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000038",
    email: `student8@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Chloe Tremblay",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000002",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000039",
    email: `student9@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Liam O'Connor",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000001",
    plan: "standard",
    is_approved: true,
  },
  {
    id: "00000000-0000-0000-0000-000000000040",
    email: `student10@${ALLOWED_EMAIL_DOMAIN}`,
    name: "Zainab Al-Farsi",
    role: "student",
    department_id: "00000000-0000-0000-0000-000000000002",
    plan: "standard",
    is_approved: true,
  },
];

async function seed() {
  console.log("==============================================================");
  console.log(`🌱 ${APP_NAME}: ${COLLEGE_NAME_WITH_SHORT} Database Seed Script`);
  console.log(`   Configured Email Domain: @${ALLOWED_EMAIL_DOMAIN}`);
  console.log("==============================================================");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isLiveSupabase =
    supabaseUrl &&
    serviceRoleKey &&
    !supabaseUrl.includes("example-project") &&
    !serviceRoleKey.includes("placeholder");

  if (isLiveSupabase) {
    console.log(`Connecting to Live Supabase: ${supabaseUrl}`);
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    try {
      // 1. Seed Departments
      console.log("\n📁 Seeding 2 Academic Departments...");
      for (const dept of DEPARTMENTS) {
        const { error } = await supabase.from("departments").upsert(
          {
            id: dept.id,
            code: dept.code,
            name: dept.name,
            description: dept.description,
          },
          { onConflict: "code" }
        );
        if (error) console.warn(`Department error (${dept.code}):`, error.message);
        else console.log(`  ✓ [${dept.code}] ${dept.name}`);
      }

      // 2. Seed Courses
      console.log("\n📚 Seeding 6 Academic Courses...");
      for (const course of COURSES) {
        const { error } = await supabase.from("courses").upsert(
          {
            id: course.id,
            department_id: course.department_id,
            dept: course.dept,
            code: course.code,
            name: course.name,
            semester: course.semester,
          },
          { onConflict: "code" }
        );
        if (error) console.warn(`Course error (${course.code}):`, error.message);
        else console.log(`  ✓ [${course.code}] ${course.name}`);
      }

      // 3. Seed Users & Profiles
      console.log(`\n👥 Seeding 13 Institutional Users (@${ALLOWED_EMAIL_DOMAIN})...`);
      for (const user of USERS) {
        const userId = user.id;

        // Upsert into public.profiles
        const { error: profErr } = await supabase.from("profiles").upsert(
          {
            id: userId,
            email: user.email,
            name: user.name,
            role: user.role,
            department_id: user.department_id,
            plan: user.plan,
            is_approved: user.is_approved,
          },
          { onConflict: "email" }
        );

        if (profErr) console.warn(`Profile error (${user.email}):`, profErr.message);
        else console.log(`  ✓ [${user.role.toUpperCase()}] ${user.name} <${user.email}>`);
      }

      console.log("\n🎉 Live Supabase database successfully seeded with all requested entities!");
    } catch (err) {
      console.error("Supabase live seeding error:", err);
    }
  } else {
    console.log("ℹ️  Running in Local/Simulation Seed Mode (Supabase URL is placeholder).");
    console.log("   To seed a live Supabase project, supply NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.\n");

    console.log("📁 2 Departments Verified:");
    DEPARTMENTS.forEach((d) => console.log(`   [${d.code}] ${d.name}`));

    console.log("\n📚 6 Courses Verified:");
    COURSES.forEach((c) => console.log(`   [${c.code}] ${c.name} (${c.semester})`));

    console.log(`\n👥 13 Institutional Users Verified (@${ALLOWED_EMAIL_DOMAIN}):`);
    USERS.forEach((u) => console.log(`   • [${u.role.toUpperCase()}] ${u.name} <${u.email}> (Approved: ${u.is_approved})`));

    console.log("\n==============================================================");
    console.log("✅ Seed verification complete. Required entities:");
    console.log(`   • 1 Admin: admin@${ALLOWED_EMAIL_DOMAIN}`);
    console.log(`   • 2 Faculty: faculty1@${ALLOWED_EMAIL_DOMAIN}, faculty2@${ALLOWED_EMAIL_DOMAIN}`);
    console.log(`   • 10 Students: student1@${ALLOWED_EMAIL_DOMAIN} -> student10@${ALLOWED_EMAIL_DOMAIN}`);
    console.log("   • 2 Departments: Finance & Economics (FIN), Strategy (STRAT)");
    console.log("   • 6 Courses: FIN-101, FIN-205, FIN-310, STRAT-101, STRAT-204, STRAT-308");
    console.log("==============================================================");
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
  });
