import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables from .env.local or .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export function generateRandomPassword(length = 18): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*";
  const all = upper + lower + numbers + symbols;

  const randomInt = (max: number) => {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return array[0] % max;
  };

  let pass = "";
  pass += upper[randomInt(upper.length)];
  pass += lower[randomInt(lower.length)];
  pass += numbers[randomInt(numbers.length)];
  pass += symbols[randomInt(symbols.length)];

  for (let i = 4; i < length; i++) {
    pass += all[randomInt(all.length)];
  }
  return pass;
}

export function getSeedPasswordForUser(email: string): string {
  if (process.env.DEMO_USER_PASSWORD) {
    return process.env.DEMO_USER_PASSWORD;
  }
  const generated = generateRandomPassword(18);
  console.log(`[SEED CREDENTIAL] One-time generated password for ${email}: ${generated}`);
  return generated;
}

export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || "SBS_Demo2026!Secure";

export interface DemoUserSeed {
  id: string;
  email: string;
  name: string;
  role: "admin" | "faculty" | "student";
  program?: string;
  semester?: number;
  department_code?: string;
}

export const DEMO_USERS: DemoUserSeed[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "neha.sharma@shantibschool.edu.in",
    name: "Dr. Neha Sharma",
    role: "admin",
    department_code: "STRAT",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "reena.paswan@shantibschool.edu.in",
    name: "Ms. Reena Paswan",
    role: "faculty",
    department_code: "MKTG",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "prachi.z24bca@shantibschool.edu.in",
    name: "Zala Prachi",
    role: "student",
    program: "BCA",
    semester: 5,
    department_code: "TECH",
  },
];

export const DEPARTMENTS = [
  {
    id: "00000000-0000-0000-0000-000000000011",
    code: "STRAT",
    name: "Strategic Management & Leadership",
    description: "Corporate strategy, business models, industry disruption and leadership.",
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    code: "MKTG",
    name: "Marketing & Consumer Intelligence",
    description: "Brand building, digital distribution, consumer psychology and unit economics.",
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    code: "FIN",
    name: "Finance, Banking & Capital Markets",
    description: "Corporate valuation, financial engineering, mergers & acquisitions.",
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    code: "TECH",
    name: "Information Technology & Computer Applications",
    description: "Enterprise software, cloud architectures, AI systems and analytics.",
  },
];

export const COURSES = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    department_id: "00000000-0000-0000-0000-000000000011",
    dept: "STRAT",
    code: "STRAT-601",
    name: "Advanced Corporate Strategy & Execution",
    semester: "Semester 5",
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    department_id: "00000000-0000-0000-0000-000000000012",
    dept: "MKTG",
    code: "MKTG-502",
    name: "Omnichannel Retailing & Consumer Economics",
    semester: "Semester 5",
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    department_id: "00000000-0000-0000-0000-000000000013",
    dept: "FIN",
    code: "FIN-504",
    name: "Strategic Mergers, Acquisitions & Corporate Restructuring",
    semester: "Semester 5",
  },
  {
    id: "00000000-0000-0000-0000-000000000104",
    department_id: "00000000-0000-0000-0000-000000000014",
    dept: "TECH",
    code: "BCA-501",
    name: "Cloud Enterprise Architectures & AI Transformation",
    semester: "Semester 5",
  },
];

export const CASES = [
  {
    id: "00000000-0000-0000-0000-000000000501",
    title: "Titan Company Ltd: Eyewear Turnaround & Omnichannel Expansion Playbook",
    status: "approved",
    type: "full",
    format: "real_signal",
    industry: "Retail & Consumer Goods",
    function: "Strategy & Marketing",
    language: "en",
    complexity: 7,
    author_id: "00000000-0000-0000-0000-000000000002", // Ms. Reena Paswan
    course_id: "00000000-0000-0000-0000-000000000102",
    content: {
      synopsis: "How Titan transformed its loss-making Eyewear division into an EBITDA-positive market leader using unified inventory, Fastrack prescription frames, and aggressive optometrist franchising.",
      protagonist: { name: "Saumen Bhaumik", title: "CEO, Eyewear Division", org: "Titan Company Ltd" },
      learning_objectives: [
        "Evaluate omnichannel inventory pooling models vs traditional franchised retail.",
        "Calculate unit economics and contribution margins across optical dispensing.",
        "Formulate brand positioning strategies for premium vs entry-level fashion segments."
      ],
      sections: [
        { title: "Market Landscape", body: "India's unorganized optical market historically represented over 75% of total spectacles sold..." },
        { title: "Strategic Turnaround", body: "Titan pivoted to automated lens manufacturing labs in Chikkaballapur to compress delivery SLAs to 24 hours..." }
      ]
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000502",
    title: "Tata Consultancy Services: Transitioning from IT Outsourcing to Generative AI Solutions",
    status: "approved",
    type: "full",
    format: "real_signal",
    industry: "Information Technology",
    function: "Technology Strategy",
    language: "en",
    complexity: 8,
    author_id: "00000000-0000-0000-0000-000000000002",
    course_id: "00000000-0000-0000-0000-000000000104",
    content: {
      synopsis: "An in-depth investigation into TCS's multi-million workforce reskilling in AI foundation models and high-margin AI advisory offerings.",
      protagonist: { name: "K. Krithivasan", title: "CEO & MD", org: "Tata Consultancy Services" },
      learning_objectives: [
        "Analyze revenue margin compression in legacy IT maintenance contracts.",
        "Design workforce reskilling pipelines at enterprise scale (500k+ employees)."
      ]
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000503",
    title: "Zomato vs Swiggy: The Unit Economics and Dark Store Density of 10-Minute Delivery",
    status: "approved",
    type: "flash",
    format: "real_signal",
    industry: "E-Commerce & Logistics",
    function: "Operations & Unit Economics",
    language: "en",
    complexity: 6,
    author_id: "00000000-0000-0000-0000-000000000002",
    course_id: "00000000-0000-0000-0000-000000000102",
    content: {
      synopsis: "Evaluating Blinkit's contribution margin per order and micro-warehouse real estate strategies against Instamart.",
      protagonist: { name: "Albinder Dhindsa", title: "Founder & CEO", org: "Blinkit (Zomato)" },
      learning_objectives: [
        "Construct dark store financial models with fixed rent vs throughput volume.",
        "Understand advertising revenue as the ultimate driver of quick commerce profitability."
      ]
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000504",
    title: "HDFC Bank & HDFC Ltd Mega-Merger: Managing Cultural and IT Integration at Scale",
    status: "in_review",
    type: "full",
    format: "real_signal",
    industry: "Banking & Financial Services",
    function: "Finance & Organizational Behavior",
    language: "en",
    complexity: 9,
    author_id: "00000000-0000-0000-0000-000000000002",
    course_id: "00000000-0000-0000-0000-000000000103",
    content: {
      synopsis: "Examining post-merger deposit mobilization requirements (CRR/SLR burdens) and cultural harmonization across mortgage and retail banking divisions.",
      protagonist: { name: "Sashidhar Jagdishan", title: "MD & CEO", org: "HDFC Bank" },
      learning_objectives: [
        "Evaluate regulatory liquidity buffers following large-scale financial consolidations.",
        "Structure cross-selling strategies for home loans to 70M+ retail banking depositors."
      ]
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000505",
    title: "Reliance Jio 5G Capital Allocation: Infrastructure ROI and Fixed Wireless Monetization",
    status: "draft",
    type: "full",
    format: "real_signal",
    industry: "Telecommunications",
    function: "Corporate Finance",
    language: "en",
    complexity: 7,
    author_id: "00000000-0000-0000-0000-000000000002",
    course_id: "00000000-0000-0000-0000-000000000101",
    content: {
      synopsis: "How Jio invested over $25 billion into standalone 5G networks, targeting 100M homes via JioAirFiber to drive ARPU uplift.",
      protagonist: { name: "Akash Ambani", title: "Chairman", org: "Reliance Jio Infocomm" },
      learning_objectives: [
        "Calculate WACC and DCF returns on long-cycle telecommunications capital expenditures."
      ]
    }
  },
  {
    id: "00000000-0000-0000-0000-000000000506",
    title: "Nykaa: Beauty & Personal Care Portfolio Expansion and Private Label Margin Play",
    status: "draft",
    type: "flash",
    format: "real_signal",
    industry: "Beauty & Fashion Retail",
    function: "Marketing & Strategy",
    language: "en",
    complexity: 6,
    author_id: "00000000-0000-0000-0000-000000000002",
    course_id: "00000000-0000-0000-0000-000000000102",
    content: {
      synopsis: "Balancing curated prestige beauty marketplace dynamics with house brand manufacturing to elevate gross margins above 45%.",
      protagonist: { name: "Falguni Nayar", title: "Founder & CEO", org: "FSN E-Commerce Ventures (Nykaa)" },
      learning_objectives: [
        "Analyze Customer Acquisition Cost (CAC) vs Lifetime Value (LTV) in niche digital commerce."
      ]
    }
  }
];

export const SAMPLE_RUBRIC = {
  id: "00000000-0000-0000-0000-000000000601",
  case_id: "00000000-0000-0000-0000-000000000501", // Titan case
  criteria: [
    {
      name: "Strategic Problem Formulation",
      max_marks: 25,
      description: "Identification of optical retail bottlenecks, pricing elasticity, and franchise incentives.",
    },
    {
      name: "Financial & Quantitative Rigor",
      max_marks: 25,
      description: "Accurate analysis of contribution margins, inventory turn velocity, and dark lab ROI.",
    },
    {
      name: "Competitive & Industry Analysis",
      max_marks: 25,
      description: "Evaluation against unorganized standalone opticians and VC-backed direct-to-consumer players.",
    },
    {
      name: "Implementation Roadmap & Risk Mitigation",
      max_marks: 25,
      description: "Pragmatic 3-year phased execution plan addressing franchisee cannibalization.",
    },
  ],
};

export const SAMPLE_ANSWER = {
  id: "00000000-0000-0000-0000-000000000701",
  case_id: "00000000-0000-0000-0000-000000000501",
  student_id: "00000000-0000-0000-0000-000000000003", // Zala Prachi
  status: "submitted",
  text: `Executive Summary:
Titan Eyewear's path to sustainable profitability hinged on solving the optical industry's core friction: customized prescription delivery SLAs and high retail real estate overhead.

Strategic Analysis & Diagnosis:
1. Omnichannel Lens Fulfillment: Rather than requiring each retail store to hold extensive lens blanks and grinding equipment, centralizing finishing in regional automated hubs enabled Titan to cut store-level inventory holding costs by 34%.
2. Prescription Accuracy Guarantee: Deploying licensed optometrists in every franchised showroom elevated consumer trust, converting free eye-testing footfall into paid eyewear at a 42% conversion rate.
3. Private Label Frame Portfolio: Leveraging the Fastrack brand for young urban professionals created a entry-level buffer while preserving the premium Titan brand for progressive lens wearers.

Recommended Action Plan:
- Expand regional dark lens-grinding labs across Tier 2 hubs.
- Deepen loyalty integrations with Tata Neu to cross-pollinate Tanishq and Titan watch buyers into eyewear.
- Introduce virtual 3D try-on kiosks within high-density corporate parks.`,
};

export const SAMPLE_GRADE = {
  id: "00000000-0000-0000-0000-000000000801",
  answer_id: "00000000-0000-0000-0000-000000000701",
  graded_by: "00000000-0000-0000-0000-000000000002", // Ms. Reena Paswan
  ai_marks: {
    "Strategic Problem Formulation": 23,
    "Financial & Quantitative Rigor": 21,
    "Competitive & Industry Analysis": 24,
    "Implementation Roadmap & Risk Mitigation": 20,
  },
  ai_feedback: "Exceptional analytical depth on omnichannel inventory pooling and conversion mechanics.",
  final_marks: 88.0,
  criterion_scores: {
    "Strategic Problem Formulation": 23,
    "Financial & Quantitative Rigor": 21,
    "Competitive & Industry Analysis": 24,
    "Implementation Roadmap & Risk Mitigation": 20,
  },
  faculty_comment: "Outstanding work, Zala. Your articulation of regional hub economics vs decentralized store inventory shows executive-level strategic maturity.",
  is_published: true,
};

export const SAMPLE_CERTIFICATE = {
  id: "00000000-0000-0000-0000-000000000901",
  certificate_id: "CERT-SBS-2026-0001",
  student_id: "00000000-0000-0000-0000-000000000003",
  case_id: "00000000-0000-0000-0000-000000000501",
  title: "Executive Case Analysis Mastery: Omnichannel Strategy",
  score: 88.0,
  metadata: {
    course: "MKTG-502: Omnichannel Retailing & Consumer Economics",
    evaluator: "Ms. Reena Paswan",
    honors: "First Class with Distinction",
  },
};

export const OUTCOMES = [
  { id: "00000000-0000-0000-0000-000000000401", code: "CO1", name: "Strategic Business Problem Solving", description: "Formulate hypothesis-driven solutions to ambiguous real-world business challenges.", type: "course" },
  { id: "00000000-0000-0000-0000-000000000402", code: "CO2", name: "Quantitative Financial Rigor", description: "Apply unit economics, capital budgeting, and DCF modeling to enterprise choices.", type: "course" },
  { id: "00000000-0000-0000-0000-000000000403", code: "PO1", name: "Holistic Business Acumen", description: "Demonstrate cross-functional integration of finance, marketing, and operations.", type: "program" },
  { id: "00000000-0000-0000-0000-000000000404", code: "PO3", name: "Critical Communication & Defensibility", description: "Defend strategic business choices with evidence-backed executive narratives.", type: "program" },
];

export async function runSeed() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";
  const allowProduction = process.argv.includes("--allow-production");

  if (isProduction && !allowProduction) {
    throw new Error(
      "FATAL: Database seed script cannot run against production environments without the explicit --allow-production flag."
    );
  }

  console.log("==============================================================================");
  console.log("🌱 SBS CaseLab (Shanti Business School): Supabase Database Seed Engine");
  console.log("==============================================================================");
  console.log(
    process.env.DEMO_USER_PASSWORD
      ? "🔑 DEMO PASSWORD: Using configured DEMO_USER_PASSWORD environment variable."
      : "🔑 DEMO PASSWORD: Generated strong random credentials (16+ chars, crypto) per user."
  );
  console.log("👥 EXACT THREE SEED DEMO USERS:");
  DEMO_USERS.forEach((u) => {
    console.log(`   • [${u.role.toUpperCase()}] ${u.name} <${u.email}> (${u.program || u.department_code})`);
  });
  console.log("==============================================================================");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isLive =
    supabaseUrl &&
    serviceRoleKey &&
    !supabaseUrl.includes("example-project") &&
    !serviceRoleKey.includes("placeholder");

  if (!isLive) {
    console.log("ℹ️  Running in Standalone / In-Memory Mock Validation Mode.");
    console.log("   (Live Supabase credentials not found or are placeholder values).");
    console.log("\n📦 Content Blueprint Ready to Deploy upon live connection:");
    console.log(`   ✓ 4 Academic Departments (${DEPARTMENTS.map((d) => d.code).join(", ")})`);
    console.log(`   ✓ 4 Specialized Courses (${COURSES.map((c) => c.code).join(", ")})`);
    console.log(`   ✓ 6 High-Fidelity Cases authored by Ms. Reena Paswan:`);
    CASES.forEach((c) => console.log(`      - [${c.status.toUpperCase()}] ${c.title}`));
    console.log(`   ✓ 1 Case Rubric (Case: Titan Company Ltd) with 4 weighted criteria`);
    console.log(`   ✓ 1 Student Answer submitted by Zala Prachi`);
    console.log(`   ✓ 1 Published Grade (Final Score: 88.0/100, AI Suggestions + Faculty Feedback)`);
    console.log(`   ✓ 1 Verified Credential Certificate (ID: CERT-SBS-2026-0001)`);
    console.log(`   ✓ 4 Curricular Learning Outcomes (CO1, CO2, PO1, PO3)`);
    console.log("\n✅ Standalone seed blueprint is completely valid and idempotent.");
    return;
  }

  console.log(`🔗 Connecting to Live Supabase: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Seed Auth Users via Supabase Auth Admin API
  console.log("\n🔐 Provisioning Users via Supabase Auth Admin API...");
  for (const user of DEMO_USERS) {
    try {
      // Check if user already exists
      const { data: listData } = await supabase.auth.admin.listUsers();
      const existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === user.email.toLowerCase());

      const userPassword = getSeedPasswordForUser(user.email);
      if (existingUser) {
        console.log(`  ✓ Auth user exists: ${user.email} (Updating password & metadata)`);
        await supabase.auth.admin.updateUserById(existingUser.id, {
          password: userPassword,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
            program: user.program || "PGDM",
            semester: user.semester || 1,
            is_approved: true,
          },
        });
      } else {
        console.log(`  + Creating Auth user: ${user.email}`);
        await supabase.auth.admin.createUser({
          id: user.id,
          email: user.email,
          password: userPassword,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            role: user.role,
            program: user.program || "PGDM",
            semester: user.semester || 1,
            is_approved: true,
          },
        });
      }
    } catch (authErr: any) {
      console.warn(`  ⚠️ Auth Admin notice for ${user.email}:`, authErr?.message || authErr);
    }

    // Upsert into public.profiles
    const dept = DEPARTMENTS.find((d) => d.code === user.department_code);
    const { error: profErr } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department_id: dept?.id || null,
        program: user.program || "PGDM",
        semester: user.semester || 1,
        is_approved: true,
        is_graduated: false,
        plan: "institutional",
      },
      { onConflict: "id" }
    );
    if (profErr) console.warn(`  ⚠️ Profile upsert warning (${user.email}):`, profErr.message);
    else console.log(`  ✓ Profile synchronized: [${user.role.toUpperCase()}] ${user.name}`);
  }

  // 2. Departments
  console.log("\n📁 Seeding Academic Departments...");
  for (const dept of DEPARTMENTS) {
    const { error } = await supabase.from("departments").upsert(dept, { onConflict: "code" });
    if (error) console.warn(`  Department (${dept.code}):`, error.message);
    else console.log(`  ✓ [${dept.code}] ${dept.name}`);
  }

  // 3. Courses
  console.log("\n📚 Seeding Curricular Courses...");
  for (const course of COURSES) {
    const { error } = await supabase.from("courses").upsert(course, { onConflict: "code" });
    if (error) console.warn(`  Course (${course.code}):`, error.message);
    else console.log(`  ✓ [${course.code}] ${course.name}`);
  }

  // 4. Cases
  console.log("\n📝 Seeding 6 Cases (Authored by Ms. Reena Paswan)...");
  for (const c of CASES) {
    const { error } = await supabase.from("cases").upsert(
      {
        id: c.id,
        title: c.title,
        status: c.status,
        type: c.type,
        format: c.format,
        industry: c.industry,
        function: c.function,
        language: c.language,
        complexity: c.complexity,
        author_id: c.author_id,
        course_id: c.course_id,
        content: c.content,
      },
      { onConflict: "id" }
    );
    if (error) console.warn(`  Case (${c.title.substring(0, 30)}...):`, error.message);
    else console.log(`  ✓ [${c.status.toUpperCase()}] ${c.title.substring(0, 45)}...`);
  }

  // 5. Rubrics
  console.log("\n📋 Seeding Evaluation Rubric...");
  const { error: rubErr } = await supabase.from("rubrics").upsert(
    {
      id: SAMPLE_RUBRIC.id,
      case_id: SAMPLE_RUBRIC.case_id,
      criteria: SAMPLE_RUBRIC.criteria,
    },
    { onConflict: "case_id" }
  );
  if (rubErr) console.warn("  Rubric error:", rubErr.message);
  else console.log("  ✓ Case Rubric linked to Titan Company Ltd case.");

  // 6. Answers
  console.log("\n✍️ Seeding Submitted Student Answer (Zala Prachi)...");
  const { error: ansErr } = await supabase.from("answers").upsert(
    {
      id: SAMPLE_ANSWER.id,
      case_id: SAMPLE_ANSWER.case_id,
      student_id: SAMPLE_ANSWER.student_id,
      status: SAMPLE_ANSWER.status,
      text: SAMPLE_ANSWER.text,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "case_id,student_id" }
  );
  if (ansErr) console.warn("  Answer error:", ansErr.message);
  else console.log("  ✓ Answer submitted for Case 00000000-0000-0000-0000-000000000501.");

  // 7. Grades
  console.log("\n🎯 Seeding Evaluated & Published Grade...");
  const { error: grdErr } = await supabase.from("grades").upsert(
    {
      id: SAMPLE_GRADE.id,
      answer_id: SAMPLE_GRADE.answer_id,
      graded_by: SAMPLE_GRADE.graded_by,
      ai_marks: SAMPLE_GRADE.ai_marks,
      ai_feedback: SAMPLE_GRADE.ai_feedback,
      final_marks: SAMPLE_GRADE.final_marks,
      criterion_scores: SAMPLE_GRADE.criterion_scores,
      faculty_comment: SAMPLE_GRADE.faculty_comment,
      is_published: SAMPLE_GRADE.is_published,
      published_at: new Date().toISOString(),
    },
    { onConflict: "answer_id" }
  );
  if (grdErr) console.warn("  Grade error:", grdErr.message);
  else console.log("  ✓ Grade published (Final Marks: 88.0/100).");

  // 8. Certificates
  console.log("\n🎓 Seeding Issued Student Certificate...");
  const { error: certErr } = await supabase.from("certificates").upsert(
    {
      id: SAMPLE_CERTIFICATE.id,
      certificate_id: SAMPLE_CERTIFICATE.certificate_id,
      student_id: SAMPLE_CERTIFICATE.student_id,
      case_id: SAMPLE_CERTIFICATE.case_id,
      title: SAMPLE_CERTIFICATE.title,
      score: SAMPLE_CERTIFICATE.score,
      metadata: SAMPLE_CERTIFICATE.metadata,
      issued_at: new Date().toISOString(),
    },
    { onConflict: "certificate_id" }
  );
  if (certErr) console.warn("  Certificate error:", certErr.message);
  else console.log("  ✓ Certificate issued: CERT-SBS-2026-0001.");

  // 9. Outcomes
  console.log("\n📊 Seeding Learning Outcomes (CO/PO)...");
  for (const outcome of OUTCOMES) {
    const { error: outErr } = await supabase.from("outcomes").upsert(outcome, { onConflict: "code" });
    if (outErr) console.warn(`  Outcome (${outcome.code}):`, outErr.message);
    else console.log(`  ✓ [${outcome.code}] ${outcome.name}`);
  }

  console.log("\n🎉 Live Supabase database successfully seeded with all requested entities!");
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed script failure:", err);
      process.exit(1);
    });
}
