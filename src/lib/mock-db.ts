import { COLLEGE_NAME, COLLEGE_NAME_WITH_SHORT, ALLOWED_EMAIL_DOMAIN, getNextMonthResetKolkata, isSbsDomain } from "@/config/college";
import {
  Profile,
  UserType,
  PlatformSettings,
  Department,
  Course,
  CaseStudy,
  CaseVisibility,
  UsageLog,
  CaseVersion,
  CaseCollection,
  Rubric,
  RubricCriterion,
  StudentAnswer,
  Grade,
  Outcome,
  CaseOutcome,
  CaseSignal,
  OutcomeAttainment,
  ClassroomSession,
  ClassroomPoll,
  ClassroomPollOption,
  ColdCallRecord,
  BoardPlan,
  AudioBrief,
  IntegrityReport,
  PractitionerReflection,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
  AuditLog,
  AuditAction,
  TokenBudgetInfo,
  DepartmentBudgetUsage,
  DashboardTelemetry,
  RecentActivityItem,
} from "./types";

export interface MockDatabase {
  departments: Department[];
  courses: Course[];
  profiles: Profile[];
  cases: CaseStudy[];
  case_versions: CaseVersion[];
  collections: CaseCollection[];
  usage_logs: UsageLog[];
  outcomes: Outcome[];
  case_outcomes: CaseOutcome[];
  signals: CaseSignal[];
  classroom_sessions: ClassroomSession[];
  audio_briefs: AudioBrief[];
  integrity_reports: IntegrityReport[];
  practitioner_reflections: PractitionerReflection[];
  subscriptions: Subscription[];
  audit_logs: AuditLog[];
}

export const initialDepartments: Department[] = [
  {
    id: "dept-1",
    code: "STRAT",
    name: "Management & Strategy",
    description: "Enterprise strategy, corporate governance, academic accreditation and leadership.",
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-2",
    code: "ANALYTICS",
    name: "Business Analytics / Marketing",
    description: "Data-driven marketing, customer analytics, fintech and platform strategies.",
    created_at: new Date().toISOString(),
  },
  {
    id: "dept-3",
    code: "BCA",
    name: "Computer Applications & Technology",
    description: "Undergraduate computing, software engineering and digital business architectures.",
    created_at: new Date().toISOString(),
  },
];

export const initialCourses: Course[] = [
  {
    id: "course-1",
    department_id: "dept-1",
    dept: "FIN",
    code: "FIN-101",
    name: "Corporate Valuation & Capital Markets",
    semester: "Fall 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "course-2",
    department_id: "dept-1",
    dept: "FIN",
    code: "FIN-205",
    name: "Venture Capital & Private Equity Structuring",
    semester: "Spring 2027",
    created_at: new Date().toISOString(),
  },
  {
    id: "course-3",
    department_id: "dept-1",
    dept: "FIN",
    code: "FIN-310",
    name: "Global Macroeconomic Policy & Emerging Markets",
    semester: "Fall 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "course-4",
    department_id: "dept-2",
    dept: "STRAT",
    code: "STRAT-101",
    name: "Strategic Leadership & Enterprise Architecture",
    semester: "Fall 2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "course-5",
    department_id: "dept-2",
    dept: "STRAT",
    code: "STRAT-204",
    name: "Business Model Innovation in AI & Cloud",
    semester: "Spring 2027",
    created_at: new Date().toISOString(),
  },
  {
    id: "course-6",
    department_id: "dept-2",
    dept: "STRAT",
    code: "STRAT-308",
    name: "Cross-Border Negotiations & Alliance Management",
    semester: "Spring 2027",
    created_at: new Date().toISOString(),
  },
];

export const initialProfiles: Profile[] = [
  // 1. Admin: Dr. Neha Sharma
  {
    id: "usr-admin-1",
    email: "neha.sharma@shantibschool.edu.in",
    name: "Dr. Neha Sharma",
    role: "admin",
    department_id: "dept-1",
    plan: "institutional",
    monthly_generation_limit: 100,
    monthly_generations_used: 14,
    sbs_eligible: true,
    is_approved: true,
    watch_industries: ["Fintech & Banking", "Renewable Energy & CleanTech", "Supply Chain & Manufacturing", "Consumer & Retail"],
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 2. Faculty: Ms. Reena Paswan
  {
    id: "usr-faculty-1",
    email: "reena.paswan@shantibschool.edu.in",
    name: "Ms. Reena Paswan",
    role: "faculty",
    department_id: "dept-2",
    plan: "institutional",
    monthly_generation_limit: 50,
    monthly_generations_used: 8,
    sbs_eligible: true,
    is_approved: true,
    watch_industries: ["Fintech & Banking", "Renewable Energy & CleanTech", "Supply Chain & Manufacturing", "Consumer & Retail"],
    avatar_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // 3. Student: Zala Prachi
  {
    id: "usr-student-1",
    email: "prachi.z24bca@shantibschool.edu.in",
    name: "Zala Prachi",
    role: "student",
    department_id: "dept-3",
    plan: "standard",
    is_approved: true,
    portfolio_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Visiting Corporate Fellow
  {
    id: "usr-guest-partner",
    email: "rajesh.patel@gujaratadvisors.in",
    name: "Rajesh Patel (Visiting Corporate Fellow)",
    role: "faculty",
    department_id: "dept-1",
    plan: "standard",
    monthly_generation_limit: 15,
    monthly_generations_used: 3,
    sbs_eligible: false,
    is_approved: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  // Pending Registrations (Awaiting Dean / Admin Approval)
  {
    id: "usr-pending-1",
    email: "rohan.mehta@shantibschool.edu.in",
    name: "Dr. Rohan Mehta",
    role: "faculty",
    department_id: "dept-1",
    plan: "institutional",
    monthly_generation_limit: 50,
    monthly_generations_used: 0,
    sbs_eligible: true,
    is_approved: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "usr-pending-2",
    email: "tanvi.desai@shantibschool.edu.in",
    name: "Tanvi Desai",
    role: "student",
    department_id: "dept-2",
    plan: "standard",
    monthly_generation_limit: 10,
    monthly_generations_used: 0,
    sbs_eligible: true,
    is_approved: false,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "usr-pending-3",
    email: "vikram.rathore@shantibschool.edu.in",
    name: "Prof. Vikram Rathore",
    role: "faculty",
    department_id: "dept-3",
    plan: "institutional",
    monthly_generation_limit: 50,
    monthly_generations_used: 0,
    sbs_eligible: true,
    is_approved: false,
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 28).toISOString(),
  },
  {
    id: "usr-pending-4",
    email: "rahul.verma@guestconsult.in",
    name: "Rahul Verma (External Partner)",
    role: "faculty",
    department_id: "dept-1",
    plan: "standard",
    monthly_generation_limit: 5,
    monthly_generations_used: 0,
    sbs_eligible: false,
    is_approved: false,
    created_at: new Date(Date.now() - 3600000 * 35).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 35).toISOString(),
  },
];

export const initialCases: CaseStudy[] = [
  {
    id: "case-001",
    author_id: "usr-faculty-1",
    author_name: "Ms. Reena Paswan",
    title: "FinTech Disruption at Gujarat Cooperative Bank: The Micro-Lending Dilemma",
    status: "published",
    visibility: "sbs_only",
    type: "full",
    format: "real_signal",
    domain: "Finance",
    difficulty: "Advanced",
    tags: ["Fintech", "Micro-Lending", "Banking", "Credit Risk", "Gujarat"],
    industry: "Fintech & Banking",
    function: "Strategic Finance & Risk Management",
    course_id: "course-1",
    course_name: "Corporate Valuation & Capital Markets",
    department_id: "dept-1",
    level: "MBA / Advanced",
    language: "en",
    complexity: 7,
    version: 1,
    reviewer_id: "usr-admin-1",
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    content: {
      title: "FinTech Disruption at Gujarat Cooperative Bank: The Micro-Lending Dilemma",
      summary: "A regional cooperative bank in Ahmedabad faces aggressive digital micro-lending competition from VC-funded startups and UPI neo-banks.",
      background: "Founded in 1988, Gujarat Cooperative Bank has built an extensive branch network catering to MSME textile exporters and rural agrarian entrepreneurs across Surat and Ahmedabad.",
      challenge: "Digital neo-banks are underwriting uncollateralized working capital loans in 90 seconds using alternative data rails, eroding Gujarat Cooperative's loan book by 24% in two quarters.",
      key_data: [
        { metric: "Gross Non-Performing Assets (GNPA)", value: "3.2%", period: "Q3 2026", notes: "Illustrative industry benchmark" },
        { metric: "Digital Underwriting Turnaround Time", value: "90 seconds vs 4 days", period: "2026", notes: "Neo-bank vs Traditional branch" },
        { metric: "Cost-to-Income Ratio", value: "54.8%", period: "FY26", notes: "Legacy overhead drag" },
        { metric: "Cost of Funds", value: "6.1%", period: "FY26", notes: "Competitive deposit stickiness" }
      ],
      decision_point: "Should the Managing Director acquire a struggling algorithmic lending API startup, partner in a co-lending arrangement, or build an in-house proprietary credit scoring model?",
      discussion_questions: [
        "How does the credit underwriting model of traditional collateral compare with transaction-stream cash-flow lending?",
        "What regulatory hurdles under RBI guidelines affect cooperative banking partnerships with third-party tech providers?",
        "Evaluate the risk of adverse selection if Gujarat Cooperative enters uncollateralized merchant lending.",
        "Calculate the break-even volume required to justify a $4.5M in-house core banking transformation.",
        "What governance structure should the board recommend to balance community stakeholders with digital velocity?"
      ],
      teaching_note: {
        objectives: [
          "Evaluate digital credit transformation in legacy community financial institutions.",
          "Analyze trade-offs between speed, loss reserves, and customer acquisition costs in emerging markets."
        ],
        class_flow: [
          { phase: "Context Setting & Industry S-Curve", duration_minutes: 20, activity: "Dissecting the threat of UPI 2.0 digital lending protocols." },
          { phase: "Financial Analysis & Credit Metrics", duration_minutes: 30, activity: "Small group breakout modeling NPA loss distribution curves." },
          { phase: "Strategic Choice & Board Resolution", duration_minutes: 30, activity: "Debate on Acquire vs Build vs Partner models." }
        ],
        frameworks: [
          { name: "Porter's Threat of New Entrants & Substitution", application: "Mapping Fintech unbundling of traditional bank products.", key_takeaway: "High customer trust cannot indefinitely offset 4-day friction." },
          { name: "Credit Risk Matrix (Default vs Exposure at Default)", application: "Stress testing unsecured credit books during liquidity crunches.", key_takeaway: "Alternative credit scores exhibit non-linear volatility in market downturns." },
          { name: "Build vs Buy vs Ally Strategic Continuum", application: "Evaluating organizational agility and tech debt.", key_takeaway: "Alliances provide speed but surrender unit economics and proprietary data." }
        ]
      },
      verify_facts_flag: true,
      figures_disclaimer: "All specific financial figures are illustrative pedagogical models for case analysis."
    }
  },
  {
    id: "case-002",
    author_id: "usr-faculty-1",
    author_name: "Ms. Reena Paswan",
    title: "FlashCase: Supply Chain Volatility at Reliance Solar Gigafactory",
    status: "draft",
    visibility: "private",
    type: "flash",
    format: "hypothetical",
    domain: "Operations",
    difficulty: "Advanced",
    tags: ["CleanTech", "Solar", "Supply Chain", "Crisis Management", "Jamnagar"],
    industry: "Renewable Energy & Solar",
    function: "Operations & Supply Chain Resilience",
    course_id: "course-5",
    course_name: "Business Model Innovation in AI & Cloud",
    department_id: "dept-2",
    level: "Executive Education",
    language: "en",
    complexity: 8,
    version: 1,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    content: {
      title: "FlashCase: Supply Chain Volatility at Reliance Solar Gigafactory",
      summary: "A 20-minute rapid boardroom simulation tackling acute polysilicon tariff shifts and critical wafer shortages in Jamnagar, Gujarat.",
      background: "The solar manufacturing unit in Jamnagar was commissioned to build 20GW annual photovoltaic cell capacity by Q4 2027.",
      challenge: "A 40% sudden export duty and geopolitical embargo on raw polysilicon threatens factory commissioning timelines and multimillion-dollar power purchase agreements.",
      key_data: [
        { metric: "Wafer Inventory on hand", value: "14 days buffer", period: "Current", notes: "Illustrative estimate" },
        { metric: "PPA Penalty per day of delay", value: "$180,000 / day", period: "Binding contractual clause", notes: "Contractual liability" },
        { metric: "Domestic Supplier Alternative Cost Premium", value: "+28%", period: "Immediate quote", notes: "Domestic manufacturer quote" }
      ],
      decision_point: "Does the Chief Operating Officer invoke Force Majeure, absorb the 28% domestic procurement premium to preserve delivery dates, or idle production lines for 60 days?",
      discussion_questions: [
        "Does this geopolitical shift legally qualify for standard commercial Force Majeure provisions?",
        "What are the long-term reputation costs with utility off-takers if the commissioning deadline slips?",
        "How can dual-sourcing architectures be structured to hedge against geopolitical trade restrictions?",
        "Should the executive team seek urgent sovereign intervention or state-level emergency tariff waivers?",
        "Synthesize an immediate 72-hour executive crisis operational plan."
      ],
      teaching_note: {
        objectives: [
          "Execute rapid decision-making under severe operational time pressure and incomplete data.",
          "Balance short-term gross margin erosion against long-term utility partnership trust."
        ],
        class_flow: [
          { phase: "Crisis Briefing & Fact Review", duration_minutes: 5, activity: "Instructor delivers emergency tariff telegram." },
          { phase: "War Room Team Deliberation", duration_minutes: 10, activity: "Teams calculate financial exposure across the 3 options." },
          { phase: "Executive Action Plan Presentations", duration_minutes: 15, activity: "Each team presents a 2-minute decision pitch." }
        ],
        frameworks: [
          { name: "Risk Mitigation Decision Tree", application: "Quantifying expected financial downside under probability scenarios.", key_takeaway: "Reputation loss usually compounds faster than inventory premiums." },
          { name: "Total Cost of Ownership (TCO) in Supply Chain", application: "Comparing landed cost of low-price foreign supply vs resilient regional supply.", key_takeaway: "Unit price advantages vanish upon supply chain disruption." },
          { name: "Crisis Stakeholder Communication Framework", application: "Managing lenders, regulators, and off-takers simultaneously.", key_takeaway: "Early transparent communication minimizes litigation triggers." }
        ]
      },
      verify_facts_flag: false,
      figures_disclaimer: "All specific financial figures are illustrative pedagogical models for case analysis."
    }
  },
  {
    id: "case-003",
    author_id: "usr-faculty-1",
    author_name: "Ms. Reena Paswan",
    title: "Tata Motors EV Battery Sourcing: The Sanand Expansion Dilemma",
    status: "in_review",
    visibility: "sbs_only",
    type: "full",
    format: "real_signal",
    domain: "Operations",
    difficulty: "Intermediate",
    tags: ["CleanTech", "Automotive", "Electric Vehicles", "Joint Ventures", "Sanand"],
    industry: "Automotive & Electric Vehicles",
    function: "Operations & Supply Chain Resilience",
    course_id: "course-1",
    course_name: "Corporate Valuation & Capital Markets",
    department_id: "dept-1",
    level: "MBA / Intermediate",
    language: "en",
    complexity: 7,
    version: 1,
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    content: {
      title: "Tata Motors EV Battery Sourcing: The Sanand Expansion Dilemma",
      summary: "An in-review strategic teaching case analyzing localized battery cell localization versus foreign gigafactory joint-venture imports.",
      background: "With the commissioning of the Sanand plant in Gujarat, Tata Motors is expanding passenger EV manufacturing capacity to 300,000 units annually.",
      challenge: "High battery cell import tariffs and geopolitical supply chain bottlenecks threaten cost parity with internal combustion engine competitors.",
      key_data: [
        { metric: "Battery Pack Cost % of Total EV BOM", value: "38%", period: "Current", notes: "Illustrative industry benchmark" },
        { metric: "Cell Localization Subsidy Benefit", value: "$1,200 / vehicle", period: "PLI Scheme", notes: "Production Linked Incentive" },
        { metric: "Capex for Localized Gigafactory", value: "$420 Million", period: "Phase 1", notes: "Projected investment" }
      ],
      decision_point: "Should Tata Motors invest in an in-house cylindrical cell battery gigafactory or establish a 50-50 joint venture with a global cathode supplier?",
      discussion_questions: [
        "Evaluate the capital intensity and technology obsolescence risk of battery chemistry investments.",
        "How do sovereign subsidies under India's PLI scheme alter the internal rate of return (IRR)?",
        "What are the supply chain resilience trade-offs between local and global cell sourcing?",
        "Analyze the cost curve of LFP vs NMC cell chemistry for emerging market EV adoption.",
        "Propose an executive governance model for the joint venture."
      ],
      teaching_note: {
        objectives: [
          "Understand capital allocation under rapid technological obsolescence.",
          "Evaluate joint venture structuring in advanced clean mobility."
        ],
        class_flow: [
          { phase: "Context & Cell Chemistry Review", duration_minutes: 15, activity: "Lecture and cold-call on battery economics." },
          { phase: "Breakout Sensitivity Modeling", duration_minutes: 35, activity: "Teams model cell price decline curves." },
          { phase: "Boardroom Joint Venture Pitch", duration_minutes: 30, activity: "Executive debate on ownership stakes." }
        ],
        frameworks: [
          { name: "Experience Curve & Wright's Law", application: "Forecasting battery pack cost declines.", key_takeaway: "Cost decreases predictably with cumulative production." },
          { name: "Joint Venture Control Matrix", application: "Balancing voting rights with IP licensing.", key_takeaway: "Operational control is more vital than equity percentage." },
          { name: "VRIO Strategic Advantage", application: "Assessing battery manufacturing patents.", key_takeaway: "Chemical recipes are easily leapfrogged; manufacturing yields are the true moat." }
        ]
      },
      verify_facts_flag: true,
      figures_disclaimer: "All specific financial figures are illustrative pedagogical models for case analysis."
    }
  },
  {
    id: "case-004",
    author_id: "usr-faculty-1",
    author_name: "Ms. Reena Paswan",
    title: "Amul's Quick-Commerce Pivot: Balancing Cold Chain Economics with 10-Minute Delivery",
    status: "changes_requested",
    visibility: "sbs_only",
    type: "short",
    format: "real_signal",
    domain: "Supply Chain",
    difficulty: "Intermediate",
    tags: ["Quick-Commerce", "Dairy", "FMCG", "Cold Chain", "Channel Strategy"],
    industry: "FMCG & Dairy Supply Chain",
    function: "Strategic Marketing & Omnichannel Logistics",
    course_id: "course-1",
    course_name: "Corporate Valuation & Capital Markets",
    department_id: "dept-1",
    level: "MBA / Intermediate",
    language: "en",
    complexity: 6,
    version: 1,
    reviewer_id: "usr-admin-1",
    reviewer_comment: "Please expand Exhibit 1 to contrast dark-store cold storage capex against neighborhood distributor margins under 10-minute delivery SLAs.",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    content: {
      title: "Amul's Quick-Commerce Pivot: Balancing Cold Chain Economics with 10-Minute Delivery",
      summary: "India's largest dairy cooperative evaluates direct-to-consumer dark store partnerships versus preserving mom-and-pop retailer margins.",
      background: "GCMMF (Amul) distributes 18 million liters of milk daily through an iconic 3-tier cooperative structure in Anand, Gujarat.",
      challenge: "Quick-commerce platforms demand 22-26% distributor margins and exclusive inventory placement for ice cream and pouch milk, threatening traditional retailer loyalty.",
      key_data: [
        { metric: "Quick-Commerce Channel Growth", value: "+142% YoY", period: "FY26", notes: "Urban tier-1 metros" },
        { metric: "Dark Store Cold Storage Capex", value: "INR 18 Lakh / store", period: "Current", notes: "Temperature-controlled zones" },
        { metric: "Traditional Kirana Margin", value: "4.5% - 6.0%", period: "Historic", notes: "Volume-dependent" }
      ],
      decision_point: "Should the Managing Director sign an exclusive delivery SLA with quick-commerce platforms or invest in a cooperative-owned micro-fulfillment network?",
      discussion_questions: [
        "How do cold-chain perishability dynamics limit dark-store unit economics for high-turnover dairy items?",
        "Assess channel conflict between 10,000 neighborhood milk parlors and algorithmic delivery apps.",
        "Propose a sustainable margin-sharing formula between the dairy union and tech delivery aggregators."
      ],
      teaching_note: {
        objectives: [
          "Analyze omnichannel channel conflict in cooperative consumer brands.",
          "Evaluate unit economics of quick-commerce grocery fulfillment."
        ],
        class_flow: [
          { phase: "Supply Chain & Channel Mapping", duration_minutes: 15, activity: "Mapping traditional vs dark-store supply routes." },
          { phase: "Unit Economics Breakout", duration_minutes: 25, activity: "Calculating delivery cost per pouch across delivery tiers." },
          { phase: "Executive Strategy Debate", duration_minutes: 20, activity: "Resolving board policy on channel parity." }
        ],
        frameworks: [
          { name: "Channel Conflict Matrix", application: "Diagnosing goal incongruence between trade channels.", key_takeaway: "Exclusive discounts to aggregators destroy long-term distribution density." },
          { name: "Cold-Chain Perishability Curve", application: "Quantifying spoilage rates at ambient delivery temperatures.", key_takeaway: "Last-mile temperature breaches degrade brand trust faster than delayed delivery." }
        ]
      },
      verify_facts_flag: true,
      figures_disclaimer: "All specific financial figures are illustrative pedagogical models for case analysis."
    }
  },
  {
    id: "case-005",
    author_id: "usr-faculty-1",
    author_name: "Ms. Reena Paswan",
    title: "Zomato vs Swiggy: The Platform Economy Battlefield in Ahmedabad",
    status: "approved",
    visibility: "public",
    type: "full",
    format: "real_signal",
    domain: "Marketing",
    difficulty: "Intermediate",
    tags: ["Platform Economy", "FoodTech", "Pricing", "Take Rate", "Ahmedabad"],
    industry: "Consumer Internet & FoodTech",
    function: "Strategic Marketing & Platform Dynamics",
    course_id: "course-5",
    course_name: "Business Model Innovation in AI & Cloud",
    department_id: "dept-2",
    level: "MBA / Intermediate",
    language: "en",
    complexity: 7,
    version: 1,
    reviewer_id: "usr-admin-1",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    content: {
      title: "Zomato vs Swiggy: The Platform Economy Battlefield in Ahmedabad",
      summary: "Comparative analysis of dual-sided restaurant marketplace take-rates, quick-commerce expansion (Blinkit vs Instamart), and loyalty program unit economics.",
      background: "Both food delivery giants battle for dominance across Gujarat's booming metropolitan dining ecosystem.",
      challenge: "Rising rider payout pressures and restaurant association boycotts over 24-28% commission take-rates threaten platform profitability.",
      key_data: [
        { metric: "Platform Take Rate", value: "23.4%", period: "FY26", notes: "Gross order value take rate" },
        { metric: "Average Order Value (AOV)", value: "INR 460", period: "Q3 2026", notes: "Ahmedabad metro tier-1" },
        { metric: "Rider Payout per Order", value: "INR 52", period: "Peak hours", notes: "Distance + surge incentive" }
      ],
      decision_point: "Should the Chief Commercial Officer cap restaurant take-rates at 18% in exchange for exclusivity, or accelerate hyper-local quick-commerce grocery dark stores?",
      discussion_questions: [
        "Evaluate the cross-side network effects of subscription dining programs.",
        "How does quick-commerce fulfillment density alter the contribution margin per rider shift?",
        "Propose a sustainable platform governance framework that balances merchant sustainability with shareholder returns."
      ],
      teaching_note: {
        objectives: [
          "Dissect multi-sided platform economics and competitive moats.",
          "Analyze customer lifetime value versus rider acquisition costs."
        ],
        class_flow: [
          { phase: "Platform Economics Review", duration_minutes: 15, activity: "Analyzing dual-sided market equilibria." },
          { phase: "Unit Margin Modeling", duration_minutes: 30, activity: "Breakout teams evaluate order unit economics." },
          { phase: "Executive Boardroom Debate", duration_minutes: 25, activity: "Debating take-rate caps vs merchant revolt." }
        ],
        frameworks: [
          { name: "Two-Sided Platform Network Effects", application: "Mapping restaurant density against diner stickiness.", key_takeaway: "High switching costs for diners depend on localized restaurant exclusivity." },
          { name: "Contribution Margin 3 (CM3) Analysis", application: "Deconstructing food delivery order unit economics.", key_takeaway: "Advertising and customer convenience fees drive net profitability, not food commissions." }
        ]
      },
      verify_facts_flag: true,
      figures_disclaimer: "All specific financial figures are illustrative pedagogical models for case analysis."
    }
  },
  {
    id: "case-006",
    author_id: "usr-faculty-1",
    author_name: "Ms. Reena Paswan",
    title: "भारतीय स्टार्टअप्स में प्रतिभा प्रतिधारण: हाइब्रिड कार्यबल चुनौती",
    status: "published",
    visibility: "sbs_only",
    type: "short",
    format: "real_signal",
    domain: "HR",
    difficulty: "Beginner",
    tags: ["HR", "Talent Retention", "Workforce", "Startups", "Ahmedabad"],
    industry: "Human Resources & Tech",
    function: "Organizational Behavior & Talent",
    course_id: "course-4",
    course_name: "Strategic Leadership & Enterprise Architecture",
    department_id: "dept-2",
    level: "Undergraduate / Beginner",
    language: "hi",
    complexity: 5,
    version: 1,
    reviewer_id: "usr-admin-1",
    created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    content: {
      title: "भारतीय स्टार्टअप्स में प्रतिभा प्रतिधारण: हाइब्रिड कार्यबल चुनौती",
      summary: "अहमदाबाद स्थित टेक स्टार्टअप में रिमोट और हाइब्रिड वर्क मॉडल के बीच शीर्ष इंजीनियरिंग प्रतिभा को बनाए रखने की रणनीतिक चुनौती।",
      background: "2021 में स्थापित एक तेजी से बढ़ते SaaS प्लेटफॉर्म ने 120 कर्मचारियों तक विस्तार किया है।",
      challenge: "बेंगलुरु और वैश्विक फर्मों से 100% रिमोट जॉब ऑफर्स के कारण एट्रिशन रेट 28% तक पहुंच गया है।",
      key_data: [
        { metric: "वार्षिक एट्रिशन दर", value: "28.4%", period: "FY26", notes: "टेक टीम में उच्चतम" },
        { metric: "प्रतिभा प्रतिस्थापन लागत", value: "INR 6.5 लाख / कर्मचारी", period: "वर्तमान", notes: "भर्ती और ऑनबोर्डिंग लागत" },
        { metric: "कर्मचारी संतुष्टि सूचकांक", value: "62%", period: "Q3 2026", notes: "हाइब्रिड नीति पर असंतोष" }
      ],
      decision_point: "क्या मुख्य मानव संसाधन अधिकारी (CHRO) को पूर्ण रिमोट मॉडल अपनाना चाहिए या संस्कृति और सहयोगात्मक उत्पादकता बनाए रखने के लिए अनिवार्य 3-दिवसीय कार्यालय नीति लागू करनी चाहिए?",
      discussion_questions: [
        "हाइब्रिड वर्कफोर्स में संगठनात्मक संस्कृति और नवाचार को कैसे संतुलित किया जा सकता है?",
        "टियर-2 शहरों में स्टार्टअप्स के लिए गैर-मौद्रिक प्रतिधारण रणनीतियाँ क्या हो सकती हैं?",
        "कर्मचारी बर्नआउट और रिमोट अलगाव को कम करने के लिए एक कार्य योजना तैयार करें।"
      ],
      teaching_note: {
        objectives: [
          "हाइब्रिड कार्य वातावरण में प्रतिभा प्रबंधन के आयामों का विश्लेषण करना।",
          "सांस्कृतिक संरेखण और लचीलेपन के बीच व्यापार-बंद का मूल्यांकन करना।"
        ],
        class_flow: [
          { phase: "समस्या का अवलोकन", duration_minutes: 10, activity: "रिमोट बनाम कार्यालय के पक्ष-विपक्ष पर चर्चा।" },
          { phase: "रणनीतिक समूह कार्य", duration_minutes: 20, activity: "नीति प्रस्तावों का निर्माण।" },
          { phase: "अंतिम निर्णय", duration_minutes: 15, activity: "बोर्ड रूम भूमिका निर्वहन।" }
        ],
        frameworks: [
          { name: "हर्जबर्ग का दो-कारक सिद्धांत", application: "स्वच्छता और प्रेरणा कारकों का विश्लेषण।", key_takeaway: "लचीलापन अब एक अनिवार्य स्वच्छता कारक बन चुका है।" }
        ]
      },
      verify_facts_flag: true,
      figures_disclaimer: "All specific financial figures are illustrative pedagogical models for case analysis."
    }
  },
  {
    id: "case-007",
    author_id: "usr-faculty-1",
    author_name: "Ms. Reena Paswan",
    title: "સુરતના હીરા ઉદ્યોગમાં લેબ-ગ્રોન ડાયમંડ કટોકટી",
    status: "published",
    visibility: "public",
    type: "research",
    format: "real_signal",
    domain: "Strategy",
    difficulty: "Advanced",
    tags: ["Strategy", "Diamond Industry", "Lab-Grown", "Surat", "Exports"],
    industry: "Manufacturing & Heavy Industry",
    function: "Global Strategy & Trade",
    course_id: "course-4",
    course_name: "Strategic Leadership & Enterprise Architecture",
    department_id: "dept-2",
    level: "MBA / Advanced",
    language: "gu",
    complexity: 8,
    version: 1,
    reviewer_id: "usr-admin-1",
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
    content: {
      title: "સુરતના હીરા ઉદ્યોગમાં લેબ-ગ્રોન ડાયમંડ કટોકટી",
      summary: "કુદરતી હીરાના પરંપરાગત કટિંગ-પોલિશિંગ એકમો સામે લેબ-ગ્રોન હીરાના ભાવમાં તીવ્ર ઘટાડા વચ્ચે વૈશ્વિક નિકાસકારોની વ્યૂહાત્મક પુનર્ગઠન યાત્રા.",
      background: "સુરત વિશ્વના 90% રફ હીરાનું પ્રોસેસિંગ કરે છે અને 8 લાખથી વધુ કારીગરોને રોજગારી આપે છે.",
      challenge: "લેબ-ગ્રોન ડાયમંડ્સના ભાવમાં 60% ઘટાડો થવાથી ઇન્વેન્ટરીનું મૂલ્ય ઘટ્યું છે અને અમેરિકન બજારોમાં ગ્રાહક માંગમાં અનિશ્ચિતતા ઊભી થઈ છે.",
      key_data: [
        { metric: "લેબ-ગ્રોન ભાવમાં વાર્ષિક ઘટાડો", value: "-62%", period: "FY26", notes: "કેરેટ દીઠ ભાવ" },
        { metric: "સુરતથી કુલ રત્ન નિકાસ", value: "$18.2 બિલિયન", period: "2026", notes: "નિકાસ પરિષદ ડેટા" },
        { metric: "પોલિશિંગ એકમોની ક્ષમતા વપરાશ", value: "68%", period: "Q3 2026", notes: "મંદીની અસર" }
      ],
      decision_point: "શું સુરતના અગ્રણી નિકાસકારે પ્રીમિયમ નેચરલ ડાયમંડ બ્રાન્ડિંગમાં રોકાણ કરવું જોઈએ કે સોલાર-સંચાલિત લેબ-ગ્રોન ડાયમંડ રિએક્ટર્સ સ્થાપી સંપૂર્ણ વર્ટિકલ ઇન્ટિગ્રેશન કરવું જોઈએ?",
      discussion_questions: [
        "ટેક્નોલોજીકલ ડિસ્રપ્શન સામે પરંપરાગત કારીગરી ઉદ્યોગ કેવી રીતે અનુકૂલન સાધી શકે?",
        "ભાવની અસ્થિરતા વચ્ચે નિકાસ નફાકારકતા જાળવવા માટે યોગ્ય હેજિંગ વ્યૂહરચના શું છે?",
        "ગ્લોબલ લક્ઝરી માર્કેટમાં નેચરલ વિરુદ્ધ લેબ-ગ્રોન ડાયમંડની બ્રાન્ડ પોઝિશનિંગનું મૂલ્યાંકન કરો."
      ],
      teaching_note: {
        objectives: [
          "કોમોડિટાઈઝેશન અને વૈશ્વિક સપ્લાય ચેઇન ડિસ્રપ્શનનું વિશ્લેષણ કરવું.",
          "લક્ઝરી ઉદ્યોગમાં વેલ્યુ ચેઇન ઇનોવેશનની સમીક્ષા કરવી."
        ],
        class_flow: [
          { phase: "ઉદ્યોગ વિશ્લેષણ", duration_minutes: 15, activity: "વૈશ્વિક હીરા બજારના ટ્રેન્ડ્સની ચર્ચા." },
          { phase: "નાણાકીય ગણતરી", duration_minutes: 25, activity: "ઇન્વેન્ટરી ડેપ્રિસિએશન મોડેલિંગ." },
          { phase: "વ્યૂહાત્મક નિર્ણય", duration_minutes: 20, activity: "બોર્ડ ઓફ ડિરેક્ટર્સની રજૂઆત." }
        ],
        frameworks: [
          { name: "પોઈન્ટ-ઓફ-ડિસ્રપ્શન (Clayton Christensen)", application: "નવી ટેકનોલોજી દ્વારા પરંપરાગત બજારોનું વિભાજન.", key_takeaway: "ખર્ચ ઘટાડો જ્યારે ઝડપી બને ત્યારે બ્રાન્ડ પ્રીમિયમ ઘટે છે." }
        ]
      },
      verify_facts_flag: true,
      figures_disclaimer: "All specific financial figures are illustrative pedagogical models for case analysis."
    }
  }
];

export const initialCollections: CaseCollection[] = [
  {
    id: "col-1",
    user_id: "usr-faculty-1",
    name: "Core SBS MBA Finance Cases",
    description: "Generated cases covering fintech disruption, valuation, and capital allocation.",
    case_ids: ["case-001"],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "col-2",
    user_id: "usr-faculty-1",
    name: "Gujarat Industrial Frontier Simulations",
    description: "High-impact real signal cases grounded in Western India's industrial hubs.",
    case_ids: ["case-001", "case-002", "case-003"],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const initialRubrics: Rubric[] = [
  {
    id: "rubric-001",
    case_id: "case-001",
    criteria: [
      {
        name: "Strategic Framing & Risk Analysis",
        max_marks: 30,
        description:
          "Evaluation of the cooperative bank's capital adequacy, micro-lending NPA exposure, and competitive positioning against fintech entrants.",
        outcome_ids: ["out-co-1", "out-po-1"],
      },
      {
        name: "Financial Modeling & Viability",
        max_marks: 30,
        description:
          "Robustness of debt-equity sizing, recovery probability estimates, and regulatory capital requirements under RBI norms.",
        outcome_ids: ["out-co-2", "out-po-1"],
      },
      {
        name: "Implementation Feasibility & Leadership",
        max_marks: 25,
        description:
          "Operational change management, digital infrastructure rollout across rural branches, and member shareholder alignment.",
        outcome_ids: ["out-po-2"],
      },
      {
        name: "Executive Presentation & Clarity",
        max_marks: 15,
        description:
          "Board-level executive summary, conciseness of recommendations, and defensibility of tradeoffs.",
        outcome_ids: ["out-po-2"],
      },
    ],
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const initialAnswers: StudentAnswer[] = [
  {
    id: "ans-student-1-case-001",
    case_id: "case-001",
    student_id: "usr-student-1",
    student_name: "Zala Prachi",
    student_email: "prachi.z24bca@shantibschool.edu.in",
    text: `Executive Memorandum: Resolution Strategy for Gujarat Cooperative Bank

1. Strategic Diagnosis: The surge in gross non-performing assets to 8.4% is primarily driven by unsecured agricultural micro-loans that lack digital repayment tracking. Concurrently, agile UPI-enabled fintechs are capturing high-velocity merchant deposits in Surat and Rajkot, eroding the bank's low-cost CASA deposit base.

2. Financial Restructuring: GCB must immediately partition its micro-credit portfolio into a bad-bank resolution trust while syndicating risk with regional rural banks. Tier-1 capital adequacy can be shored up by issuing subordinated perpetual bonds to local cooperative dairies.

3. Digital Modernization: Rather than building proprietary banking tech, GCB should execute an API-led partnership with an established neo-banking infrastructure provider, reducing credit evaluation turnaround from 14 days to under 4 hours.

Conclusion: By restructuring impaired assets and modernizing disbursement channels, GCB protects its member capital and restores RoE to 14.5% within 18 months.`,
    status: "submitted",
    word_count: 148,
    submitted_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "ans-student-2-case-001",
    case_id: "case-001",
    student_id: "usr-student-2",
    student_name: "Priya Patel",
    student_email: "student2@shantibschool.edu.in",
    text: `Strategic Evaluation of Gujarat Cooperative Bank:
GCB's NPA stress requires swift recovery syndication and collateral reassessment. By establishing a joint debt resolution committee with the Gujarat State Cooperative Union and introducing digitized risk assessment, default velocity can be curtailed and capital adequacy preserved above 11.5%.`,
    status: "submitted",
    word_count: 52,
    submitted_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "ans-student-2-case-002",
    case_id: "case-002",
    student_id: "usr-student-2",
    student_name: "Priya Patel",
    student_email: "student2@shantibschool.edu.in",
    text: `Flash Analysis: Reliance Solar Gigafactory Polysilicon Crisis
In the face of unexpected 40% export duties, the executive team must negotiate bilateral sovereign waivers while activating dual-sourcing agreements with domestic wafer producers to protect PPA delivery timelines.`,
    status: "submitted",
    word_count: 38,
    submitted_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const initialGrades: Grade[] = [
  {
    id: "grade-ans-1",
    answer_id: "ans-student-1-case-001",
    case_id: "case-001",
    student_id: "usr-student-1",
    ai_marks: {
      "Strategic Framing & Risk Analysis": 27,
      "Financial Modeling & Viability": 26,
      "Implementation Feasibility & Leadership": 23,
      "Executive Presentation & Clarity": 14,
    },
    ai_feedback:
      "Exceptional analytical depth. The recommendation to partition impaired loans while forging an API partnership accurately reflects contemporary Indian banking practice. Consider expanding on member governance hurdles in cooperative societies.",
    final_marks: 90,
    criterion_scores: {
      "Strategic Framing & Risk Analysis": 27,
      "Financial Modeling & Viability": 26,
      "Implementation Feasibility & Leadership": 23,
      "Executive Presentation & Clarity": 14,
    },
    faculty_comment:
      "Outstanding boardroom synthesis, Prachi. High honors for practical cooperative finance structuring.",
    graded_by: "usr-faculty-1",
    is_published: true,
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "grade-ans-2",
    answer_id: "ans-student-2-case-001",
    case_id: "case-001",
    student_id: "usr-student-2",
    ai_marks: {
      "Strategic Framing & Risk Analysis": 24,
      "Financial Modeling & Viability": 22,
      "Implementation Feasibility & Leadership": 21,
      "Executive Presentation & Clarity": 13,
    },
    ai_feedback:
      "Sound analysis with actionable recommendations on cooperative bad-loan management.",
    final_marks: 80,
    criterion_scores: {
      "Strategic Framing & Risk Analysis": 24,
      "Financial Modeling & Viability": 22,
      "Implementation Feasibility & Leadership": 21,
      "Executive Presentation & Clarity": 13,
    },
    faculty_comment:
      "Commendable structural critique of cooperative NPA recovery mechanisms and capital preservation.",
    graded_by: "usr-faculty-1",
    is_published: true,
    published_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const initialOutcomes: Outcome[] = [
  {
    id: "out-co-1",
    course_id: "course-1",
    course_code: "FIN-101",
    type: "CO",
    code: "CO-1",
    description: "Evaluate corporate capital structure and debt-equity optimization under regulatory RBI/SEBI standards.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "out-co-2",
    course_id: "course-1",
    course_code: "FIN-101",
    type: "CO",
    code: "CO-2",
    description: "Formulate quantitative DCF valuation, scenario sensitivity, and recovery estimates for impaired assets.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "out-po-1",
    course_id: "course-1",
    course_code: "FIN-101",
    type: "PO",
    code: "PO-1",
    description: "Strategic Financial Thinking: Apply rigorous analytical frameworks to real-world corporate financial crises.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "out-po-2",
    course_id: "course-1",
    course_code: "FIN-101",
    type: "PO",
    code: "PO-2",
    description: "Executive Synthesis & Governance: Articulate boardroom-level strategic recommendations with quantitative rigor.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "out-co-3",
    course_id: "course-4",
    course_code: "STRAT-101",
    type: "CO",
    code: "CO-1",
    description: "Diagnose enterprise competitive advantage using Porter's Five Forces and VRIO resource frameworks.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "out-co-4",
    course_id: "course-4",
    course_code: "STRAT-101",
    type: "CO",
    code: "CO-2",
    description: "Design multi-phase operational transition roadmaps under technological disruption.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "out-po-3",
    course_id: "course-4",
    course_code: "STRAT-101",
    type: "PO",
    code: "PO-1",
    description: "Strategic Leadership & Enterprise Architecture in complex corporate reorganizations.",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const initialCaseOutcomes: CaseOutcome[] = [
  { case_id: "case-001", outcome_id: "out-co-1" },
  { case_id: "case-001", outcome_id: "out-co-2" },
  { case_id: "case-001", outcome_id: "out-po-1" },
  { case_id: "case-001", outcome_id: "out-po-2" },
  { case_id: "case-002", outcome_id: "out-co-3" },
  { case_id: "case-002", outcome_id: "out-co-4" },
  { case_id: "case-002", outcome_id: "out-po-3" },
];

export const initialSignals: CaseSignal[] = [
  {
    id: "sig-1",
    title: "Tata Electronics Commences Pilot Run at Dholera Mega Semiconductor Fab",
    url: "https://economictimes.indiatimes.com/tech/technology/tata-electronics-dholera-semiconductor-pilot-2026/articleshow/1089201.cms",
    source: "The Economic Times",
    industry: "Supply Chain & Manufacturing",
    summary: "Tata Electronics initiates test wafer fabrication at its $11B Dholera facility in Gujarat, facing yield curve bottlenecks and high-purity chemical supply constraints.",
    potential_score: 9.6,
    potential_reason: "Exceptional operations and global supply chain case examining capital-intensive high-tech manufacturing sovereignty in emerging markets.",
    published_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "sig-2",
    title: "Reliance New Energy and Adani Green in Duopoly Battle for Khavda Hydrogen Hub",
    url: "https://www.livemint.com/companies/news/reliance-adani-khavda-green-hydrogen-subsidies-2026-1171829.html",
    source: "LiveMint",
    industry: "Renewable Energy & CleanTech",
    summary: "Two Indian conglomerates clash over electrolyzer subsidies and transmission rights for the 30GW Khavda clean energy park in Gujarat amid falling European hydrogen tariffs.",
    potential_score: 9.3,
    potential_reason: "High-stakes strategic finance and real options case analyzing capex payback under shifting cross-border regulatory subsidy frameworks.",
    published_at: new Date(Date.now() - 3600000 * 7).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: "sig-3",
    title: "RBI Tightens Unsecured Digital Lending Surcharge: Fintech Neobanks Face Margin Compression",
    url: "https://www.business-standard.com/finance/news/rbi-digital-lending-risk-weights-fintech-impact-2026-1260381.html",
    source: "Business Standard",
    industry: "Fintech & Banking",
    summary: "Reserve Bank of India elevates risk weights on unsecured digital credit lines by 25 bps, squeezing gross margins for neo-banking aggregators.",
    potential_score: 8.9,
    potential_reason: "Direct banking policy case forcing students to remodel net interest margins and customer acquisition costs under capital adequacy shocks.",
    published_at: new Date(Date.now() - 3600000 * 11).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 11).toISOString(),
  },
  {
    id: "sig-4",
    title: "Quick Commerce Titans Pivot to 24x7 Dark Stores in Tier-2 Gujarat Hubs",
    url: "https://economictimes.indiatimes.com/industry/services/retail/quick-commerce-tier2-expansion-gujarat-darkstores/articleshow/1092812.cms",
    source: "The Economic Times",
    industry: "Consumer & Retail",
    summary: "Blinkit, Zepto, and Instamart scale 10-minute grocery delivery into Rajkot, Surat, and Vadodara, triggering hyper-local price wars and warehouse labor shortages.",
    potential_score: 8.7,
    potential_reason: "Dynamic unit economics and micro-logistics case investigating whether ultra-fast delivery can achieve positive contribution margins in tier-2 cities.",
    published_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
];

export const initialClassroomSessions: ClassroomSession[] = [
  {
    id: "session-001",
    case_id: "case-001",
    case_title: "FinTech Disruption at Gujarat Cooperative Bank: The Micro-Lending Dilemma",
    faculty_id: "f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454",
    status: "active",
    current_poll: {
      id: "poll-001",
      question: "Key Strategic Dilemma: Should GCB partner with third-party FinTechs or build proprietary digital credit scoring in-house?",
      options: [
        { id: "opt-1", text: "Option A: 3-Year Strategic Partnership with FinTech (Speed to Market, 65% Revenue Share)", votes: 14 },
        { id: "opt-2", text: "Option B: Build In-House AI Underwriting (Retain 100% Margins & IP, 18-Month Lead Time)", votes: 22 },
      ],
      total_votes: 36,
      phase: "before_debate",
      is_open: true,
    },
    cold_call_history: [
      {
        student_id: "01938562-7e04-7a1b-9a82-120000000001",
        student_name: "Zala Prachi",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        score: 4,
        notes: "Strong opening cold call. Analyzed non-performing assets (NPA) risk and defended proprietary credit scoring.",
      },
    ],
    board_plan: {
      board_1_dilemma: `# 1. PROTAGONIST DILEMMA & STAKES\n- Managing Director: Rajesh Patel\n- Institution: Gujarat Cooperative Bank ($1.2B AUM)\n- Urgent Problem: 32% drop in new MSME loan originations to NBFC FinTech apps\n- Core Tension: Speed vs Data Ownership vs Regulatory Compliance (RBI guidelines)`,
      board_2_alternatives: `# 2. STRATEGIC SCENARIOS & FINANCIAL MODEL\n\n### Pathway A: White-label FinTech Alliance\n- Implementation: 90 days\n- Upfront CapEx: $350,000\n- Take-Rate: 35% margin compression\n- Risk: Disintermediation of borrower relationship\n\n### Pathway B: In-House Digital Modernization\n- Implementation: 18 months\n- CapEx: $2.4M\n- Projected IRR: 28.4% by Year 3\n- Downside: Execution risk & legacy talent gap`,
      board_3_action_plan: `# 3. ACTION PLAN & COLD-CALL SYNTHESIS\n1. Phase 1 (Q1-Q2): Hybrid pilot — White-label for micro-loans (< ₹50k) to preserve liquidity\n2. Phase 2 (Q3-Q4): Co-develop proprietary algorithms using 15-year deposit history\n3. Governance: Establish RBI-compliant Data Ethics Committee chaired by Independent Director`,
    },
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 600000).toISOString(),
  },
];

export const initialAudioBriefs: AudioBrief[] = [
  {
    case_id: "case-001",
    title: "Executive Audio Debrief: Gujarat Cooperative Bank",
    duration_seconds: 140,
    executive_summary: "Ms. Reena Paswan and Senior Banking Analyst Priya Desai unpack the high-stakes digital transition facing cooperative banking in India, evaluating credit risk, partnership models, and financial inclusion.",
    dialogue: [
      {
        speaker: "Professor",
        timestamp: "0:00",
        text: "Welcome to SBS CaseLab's Executive Audio Debrief. Today we dissect the existential inflection point at Gujarat Cooperative Bank in Ahmedabad.",
      },
      {
        speaker: "Senior Analyst",
        timestamp: "0:24",
        text: "Cooperative banks are losing micro-lending share to nimble FinTechs that approve loans in minutes using smartphone data instead of collateral.",
      },
      {
        speaker: "Protagonist",
        timestamp: "0:50",
        text: "Our cooperative ethos was built on personal trust and relationship banking. If we outsource underwriting to an algorithm, do we lose our institutional soul?",
      },
      {
        speaker: "Professor",
        timestamp: "1:15",
        text: "That is precisely the tension students must resolve in the classroom: speed-to-market via third-party alliances versus long-term proprietary sovereignty.",
      },
    ],
  },
];

export const initialIntegrityReports: IntegrityReport[] = [
  {
    answer_id: "ans-001",
    case_id: "case-001",
    student_id: "01938562-7e04-7a1b-9a82-120000000001",
    originality_score: 96.5,
    case_citation_density: 88.0,
    ai_probability_score: 7.4,
    key_frameworks_detected: ["DCF Sensitivity Analysis", "Porter's Five Forces", "Real Options Valuation"],
    hallucination_flags: [],
    verdict: "High Integrity",
    created_at: new Date().toISOString(),
  },
];

export const initialPractitionerReflections: PractitionerReflection[] = [
  {
    id: "ref-001",
    case_id: "case-001",
    alumni_id: "01938562-7e04-7a1b-9a82-120000000099",
    alumni_name: "Rohan Mehta, MBA '19",
    alumni_title: "Partner & Head of FinTech Practice",
    company: "Bain & Company / Shanti Business School (SBS) Alumni",
    reflection_text: "When advising cooperative and regional banks across South Asia facing digital disruption, the single most common failure is treating technology as an IT department project rather than a balance-sheet transformation. Partnering with a FinTech in Year 1 while systematically building core credit algorithms in Year 2 preserves both immediate origination volume and long-term enterprise valuation.",
    practical_takeaway: "Never outsource customer underwriting data permanently. Structure white-label contracts with mandatory algorithmic transfer and co-training clauses.",
    upvotes: 24,
    upvoted_by: ["f8c3de3d-1fea-4d7c-a8b0-29f63c4c3454", "01938562-7e04-7a1b-9a82-120000000001"],
    is_verified_alumni: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export const initialSubscriptions: Subscription[] = [
  {
    id: "sub-001",
    user_id: "usr-student-1",
    plan: "yearly",
    status: "active",
    amount_paise: 60000,
    currency: "INR",
    razorpay_order_id: "order_mock_yearly_001",
    razorpay_payment_id: "pay_mock_yearly_001",
    razorpay_signature: "mock_sig_valid_001",
    start_date: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    end_date: new Date(Date.now() + 3600000 * 24 * 305).toISOString(),
    renewal_reminder_sent: false,
    created_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 60).toISOString(),
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    actor_id: "usr-admin-1",
    actor_email: "neha.sharma@shantibschool.edu.in",
    action: "role_change",
    target_id: "usr-faculty-1",
    target_type: "user",
    metadata: { previous_role: "faculty", new_role: "faculty" },
    ip_address: "171.67.215.200",
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
  {
    id: "audit-002",
    actor_id: "usr-admin-1",
    actor_email: "neha.sharma@shantibschool.edu.in",
    action: "case_approval",
    target_id: "case-001",
    target_type: "case",
    metadata: { version: 1, title: "FinTech Disruption at Gujarat Cooperative Bank" },
    ip_address: "171.67.215.201",
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
  {
    id: "audit-003",
    actor_id: "usr-faculty-1",
    actor_email: "reena.paswan@shantibschool.edu.in",
    action: "grade_override",
    target_id: "ans-student-1-case-001",
    target_type: "grade",
    metadata: { initial_ai_marks: 65, final_marks: 90, student_id: "usr-student-1" },
    ip_address: "171.67.215.202",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: "audit-004",
    actor_id: "usr-faculty-1",
    actor_email: "reena.paswan@shantibschool.edu.in",
    action: "case_created",
    target_id: "case-001",
    target_type: "case",
    metadata: { title: "FinTech Disruption at Gujarat Cooperative Bank", industry: "Fintech & Banking" },
    ip_address: "171.67.215.202",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "audit-005",
    actor_id: "usr-faculty-1",
    actor_email: "reena.paswan@shantibschool.edu.in",
    action: "case_submitted",
    target_id: "case-002",
    target_type: "case",
    metadata: { title: "Solar Rooftop Transition in Surat", industry: "Renewable Energy & CleanTech" },
    ip_address: "171.67.215.201",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "audit-006",
    actor_id: "usr-admin-1",
    actor_email: "neha.sharma@shantibschool.edu.in",
    action: "case_approval",
    target_id: "case-003",
    target_type: "case",
    metadata: { title: "Adani Ports vs APM Terminals Pipavav", industry: "Infrastructure & Maritime Ports" },
    ip_address: "171.67.215.200",
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: "audit-007",
    actor_id: "usr-admin-1",
    actor_email: "admin@shantibschool.edu.in",
    action: "case_published",
    target_id: "case-004",
    target_type: "case",
    metadata: { title: "Amul's Quick Commerce Supply Chain Strategy", industry: "Supply Chain & Logistics" },
    ip_address: "171.67.215.200",
    created_at: new Date(Date.now() - 3600000 * 26).toISOString(),
  },
];

export const initialUsageLogs: UsageLog[] = [
  {
    id: "usage-init-1",
    user_id: "usr-faculty-1",
    tokens_used: 245000,
    model: "claude-3-7-sonnet-20250219",
    case_id: "case-001",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "usage-init-2",
    user_id: "usr-faculty-2",
    tokens_used: 175000,
    model: "claude-3-7-sonnet-20250219",
    case_id: "case-002",
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

class MockStore {
  private departments: Department[] = [...initialDepartments];
  private courses: Course[] = [...initialCourses];
  private profiles: Profile[] = [...initialProfiles];
  private cases: CaseStudy[] = [...initialCases];
  private allowed_domains: string[] = ["shantibschool.edu.in"];
  private platform_settings: PlatformSettings = {
    external_free_limit: 3,
    sbs_fair_use_limit: 30,
    allowed_domains: ["shantibschool.edu.in"],
  };

  constructor() {
    this.profiles = this.profiles.map((p) => {
      const isSbs = isSbsDomain(p.email, this.allowed_domains);
      const isPending = p.id.startsWith("usr-pending-");
      return {
        ...p,
        user_type: p.user_type ?? (isSbs ? "sbs_member" : "external"),
        email_verified_at:
          p.email_verified_at !== undefined
            ? p.email_verified_at
            : isPending && !isSbs
            ? null
            : "2026-01-01T00:00:00.000Z",
        free_cases_used_this_month: p.free_cases_used_this_month ?? (p.monthly_generations_used ?? 0),
        free_cases_reset_at: p.free_cases_reset_at || getNextMonthResetKolkata(),
      };
    });
  }

  private checkAndResetMonthlyQuota(p: Profile): Profile {
    const now = new Date();
    const resetDate = p.free_cases_reset_at ? new Date(p.free_cases_reset_at) : new Date(0);
    if (now >= resetDate) {
      p.free_cases_used_this_month = 0;
      p.monthly_generations_used = 0;
      p.free_cases_reset_at = getNextMonthResetKolkata(now);
      p.updated_at = new Date().toISOString();
    }
    if (!p.user_type) {
      p.user_type = isSbsDomain(p.email, this.allowed_domains) ? "sbs_member" : "external";
    }
    return p;
  }
  private case_versions: CaseVersion[] = [
    {
      id: "ver-case-001-v1",
      case_id: "case-001",
      version_number: 1,
      title: "FinTech Disruption at Gujarat Cooperative Bank: The Micro-Lending Dilemma",
      content: initialCases[0].content,
      updated_by: "usr-faculty-1",
      change_summary: "Initial approved curriculum dossier published for Shanti Business School (SBS).",
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    },
  ];
  private collections: CaseCollection[] = [...initialCollections];
  private rubrics: Rubric[] = [...initialRubrics];
  private answers: StudentAnswer[] = [...initialAnswers];
  private grades: Grade[] = [...initialGrades];
  private outcomes: Outcome[] = [...initialOutcomes];
  private case_outcomes: CaseOutcome[] = [...initialCaseOutcomes];
  private signals: CaseSignal[] = [...initialSignals];
  private classroom_sessions: ClassroomSession[] = [...initialClassroomSessions];
  private audio_briefs: AudioBrief[] = [...initialAudioBriefs];
  private integrity_reports: IntegrityReport[] = [...initialIntegrityReports];
  private practitioner_reflections: PractitionerReflection[] = [...initialPractitionerReflections];
  private subscriptions: Subscription[] = [...initialSubscriptions];
  private audit_logs: AuditLog[] = [...initialAuditLogs];
  private usage_logs: UsageLog[] = [...initialUsageLogs];
  private institutional_monthly_token_budget: number = 500000;

  // DEPARTMENTS
  getDepartments(): Department[] {
    return [...this.departments];
  }

  addDepartment(dept: Omit<Department, "id" | "created_at">): Department {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...dept,
    };
    this.departments.push(newDept);
    return newDept;
  }

  // COURSES
  getCourses(): Course[] {
    return [...this.courses];
  }

  addCourse(course: Omit<Course, "id" | "created_at">): Course {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...course,
    };
    this.courses.push(newCourse);
    return newCourse;
  }

  // PROFILES & REVIEWER TOGGLE
  getProfiles(): Profile[] {
    return this.profiles.map((p) => {
      this.checkAndResetMonthlyQuota(p);
      const isSbs = isSbsDomain(p.email, this.allowed_domains) || p.user_type === "sbs_member";
      const defaultLimit = isSbs
        ? (p.role === "admin" ? 100 : this.platform_settings.sbs_fair_use_limit)
        : this.platform_settings.external_free_limit;
      return {
        ...p,
        user_type: p.user_type || (isSbs ? "sbs_member" : "external"),
        monthly_generation_limit: p.monthly_generation_limit ?? defaultLimit,
        monthly_generations_used: p.free_cases_used_this_month ?? p.monthly_generations_used ?? 0,
        free_cases_used_this_month: p.free_cases_used_this_month ?? 0,
        free_cases_reset_at: p.free_cases_reset_at || getNextMonthResetKolkata(),
        sbs_eligible: isSbs,
      };
    });
  }

  getProfile(id: string): Profile | undefined {
    const p = this.profiles.find(
      (item) =>
        item.id === id ||
        item.email.toLowerCase() === id.toLowerCase() ||
        (id.toLowerCase() === "neha.sharma@shantibschool.edu.in" && item.id === "usr-admin-1") ||
        (id.toLowerCase() === "reena.paswan@shantibschool.edu.in" && item.id === "usr-faculty-1") ||
        (id.toLowerCase() === "prachi.z24bca@shantibschool.edu.in" && item.id === "usr-student-1")
    );
    if (!p) return undefined;
    this.checkAndResetMonthlyQuota(p);
    const isSbs = isSbsDomain(p.email, this.allowed_domains) || p.user_type === "sbs_member";
    const defaultLimit = isSbs
      ? (p.role === "admin" ? 100 : this.platform_settings.sbs_fair_use_limit)
      : this.platform_settings.external_free_limit;
    return {
      ...p,
      user_type: p.user_type || (isSbs ? "sbs_member" : "external"),
      monthly_generation_limit: p.monthly_generation_limit ?? defaultLimit,
      monthly_generations_used: p.free_cases_used_this_month ?? p.monthly_generations_used ?? 0,
      free_cases_used_this_month: p.free_cases_used_this_month ?? 0,
      free_cases_reset_at: p.free_cases_reset_at || getNextMonthResetKolkata(),
      sbs_eligible: isSbs,
    };
  }

  updateProfileRole(
    id: string,
    role: Profile["role"],
    is_approved?: boolean,
    is_reviewer?: boolean
  ): Profile | null {
    const p = this.profiles.find((item) => item.id === id || item.email === id);
    if (!p) return null;
    const prevRole = p.role;
    p.role = role;
    if (is_approved !== undefined) p.is_approved = is_approved;
    if (is_reviewer !== undefined) p.is_reviewer = is_reviewer;
    p.updated_at = new Date().toISOString();

    if (prevRole !== role) {
      this.logAudit(
        "usr-admin-1",
        "admin@shantibschool.edu.in",
        "role_change",
        p.id,
        "user",
        { previous_role: prevRole, new_role: role }
      );
    }

    return { ...p };
  }

  toggleReviewer(id: string, isReviewer: boolean): Profile | null {
    const p = this.profiles.find((item) => item.id === id || item.email === id);
    if (!p) return null;
    p.is_reviewer = isReviewer;
    p.updated_at = new Date().toISOString();
    return { ...p };
  }

  addProfile(profile: Profile): Profile {
    const isSbs = isSbsDomain(profile.email, this.allowed_domains);
    const normalized: Profile = {
      ...profile,
      user_type: profile.user_type ?? (isSbs ? "sbs_member" : "external"),
      free_cases_used_this_month: profile.free_cases_used_this_month ?? 0,
      free_cases_reset_at: profile.free_cases_reset_at || getNextMonthResetKolkata(),
      email_verified_at: profile.email_verified_at !== undefined ? profile.email_verified_at : null,
      sbs_eligible: isSbs,
    };
    this.profiles = this.profiles.filter((p) => p.id !== normalized.id && p.email !== normalized.email);
    this.profiles.push(normalized);
    return normalized;
  }

  updateUserPlan(userId: string, plan: Profile["plan"], actorId?: string): Profile | null {
    const p = this.profiles.find((item) => item.id === userId || item.email === userId);
    if (!p) return null;
    const oldPlan = p.plan;
    p.plan = plan;
    // Set appropriate default quota when plan changes if not already configured higher
    if (plan === "standard") p.monthly_generation_limit = 10;
    else if (plan === "premium") p.monthly_generation_limit = 30;
    else if (plan === "institutional") p.monthly_generation_limit = p.role === "admin" ? 100 : 50;
    else if (plan === "lifetime") p.monthly_generation_limit = 50;
    p.updated_at = new Date().toISOString();

    const actor = actorId ? this.getProfile(actorId) : null;
    this.logAudit(
      actorId || "usr-admin-1",
      actor?.email || "admin@shantibschool.edu.in",
      "user_plan_updated",
      p.id,
      "user",
      { old_plan: oldPlan, new_plan: plan, new_limit: p.monthly_generation_limit }
    );
    return { ...p };
  }

  updateUserQuota(userId: string, limit: number, actorId?: string): Profile | null {
    const p = this.profiles.find((item) => item.id === userId || item.email === userId);
    if (!p) return null;
    const oldLimit = p.monthly_generation_limit ?? 10;
    p.monthly_generation_limit = Math.max(0, limit);
    p.updated_at = new Date().toISOString();

    const actor = actorId ? this.getProfile(actorId) : null;
    this.logAudit(
      actorId || "usr-admin-1",
      actor?.email || "admin@shantibschool.edu.in",
      "user_quota_updated",
      p.id,
      "user",
      { old_limit: oldLimit, new_limit: p.monthly_generation_limit }
    );
    return { ...p };
  }

  rejectUserRegistration(userId: string, actorId?: string, reason?: string): boolean {
    const idx = this.profiles.findIndex((item) => item.id === userId || item.email === userId);
    if (idx === -1) return false;
    const user = this.profiles[idx];
    const actor = actorId ? this.getProfile(actorId) : null;
    this.logAudit(
      actorId || "usr-admin-1",
      actor?.email || "admin@shantibschool.edu.in",
      "user_rejected",
      user.id,
      "user",
      { email: user.email, name: user.name, reason: reason || "Registration declined during administrator audit." }
    );
    this.profiles.splice(idx, 1);
    return true;
  }

  checkUserGenerationQuota(userId: string): {
    allowed: boolean;
    used: number;
    limit: number;
    remaining: number;
    error_code?: "UNVERIFIED_EMAIL" | "LIMIT_REACHED" | "FAIR_USE_LIMIT_REACHED";
    user_type: UserType;
    is_verified: boolean;
    reset_at: string;
  } {
    const p = this.getProfile(userId);
    const resetAt = p?.free_cases_reset_at || getNextMonthResetKolkata();
    const isSbs = p ? (isSbsDomain(p.email, this.allowed_domains) || p.user_type === "sbs_member") : false;
    const userType: UserType = p?.user_type || (isSbs ? "sbs_member" : "external");
    const isVerified = Boolean(p?.email_verified_at);

    if (!p) {
      return {
        allowed: false,
        used: 0,
        limit: 0,
        remaining: 0,
        error_code: "UNVERIFIED_EMAIL",
        user_type: userType,
        is_verified: false,
        reset_at: resetAt,
      };
    }

    if (!isVerified) {
      return {
        allowed: false,
        used: p.free_cases_used_this_month ?? 0,
        limit: isSbs ? this.platform_settings.sbs_fair_use_limit : this.platform_settings.external_free_limit,
        remaining: 0,
        error_code: "UNVERIFIED_EMAIL",
        user_type: userType,
        is_verified: false,
        reset_at: resetAt,
      };
    }

    const limit = p.monthly_generation_limit ?? (isSbs
      ? (p.role === "admin" ? 100 : this.platform_settings.sbs_fair_use_limit)
      : this.platform_settings.external_free_limit);
    const used = p.free_cases_used_this_month ?? p.monthly_generations_used ?? 0;
    const remaining = Math.max(0, limit - used);
    const allowed = used < limit;

    let errorCode: "LIMIT_REACHED" | "FAIR_USE_LIMIT_REACHED" | undefined = undefined;
    if (!allowed) {
      errorCode = isSbs ? "FAIR_USE_LIMIT_REACHED" : "LIMIT_REACHED";
    }

    return {
      allowed,
      used,
      limit,
      remaining,
      error_code: errorCode,
      user_type: userType,
      is_verified: true,
      reset_at: resetAt,
    };
  }

  incrementUserGenerationCount(userId: string): { success: boolean; used: number; remaining: number } {
    const p = this.profiles.find((item) => item.id === userId || item.email.toLowerCase() === userId.toLowerCase());
    if (!p) return { success: false, used: 0, remaining: 0 };
    this.checkAndResetMonthlyQuota(p);

    const quota = this.checkUserGenerationQuota(userId);
    if (!quota.allowed) {
      return { success: false, used: quota.used, remaining: 0 };
    }

    p.free_cases_used_this_month = (p.free_cases_used_this_month ?? 0) + 1;
    p.monthly_generations_used = p.free_cases_used_this_month;
    p.updated_at = new Date().toISOString();
    return {
      success: true,
      used: p.free_cases_used_this_month,
      remaining: Math.max(0, quota.limit - p.free_cases_used_this_month),
    };
  }

  setUserOtp(userIdOrEmail: string, otp: string, expiresAt: string): boolean {
    const p = this.profiles.find((item) => item.id === userIdOrEmail || item.email.toLowerCase() === userIdOrEmail.toLowerCase());
    if (!p) return false;
    p.verification_otp = otp;
    p.otp_expires_at = expiresAt;
    p.updated_at = new Date().toISOString();
    return true;
  }

  verifyUserOtp(userIdOrEmail: string, otp: string): { success: boolean; message: string; profile?: Profile } {
    const p = this.profiles.find((item) => item.id === userIdOrEmail || item.email.toLowerCase() === userIdOrEmail.toLowerCase());
    if (!p) return { success: false, message: "User not found" };

    if (p.email_verified_at) {
      return { success: true, message: "Email is already verified", profile: this.getProfile(p.id) };
    }

    if (!p.verification_otp) {
      return { success: false, message: "No verification code requested. Please request a new OTP." };
    }

    if (p.otp_expires_at && new Date() > new Date(p.otp_expires_at)) {
      return { success: false, message: "Verification code has expired. Please request a new code." };
    }

    if (p.verification_otp.trim() !== otp.trim()) {
      return { success: false, message: "Invalid verification code. Please check and try again." };
    }

    p.email_verified_at = new Date().toISOString();
    p.verification_otp = null;
    p.otp_expires_at = null;
    const isSbs = isSbsDomain(p.email, this.allowed_domains);
    p.user_type = isSbs ? "sbs_member" : "external";
    p.sbs_eligible = isSbs;
    p.updated_at = new Date().toISOString();

    this.logAudit(
      p.id,
      p.email,
      "email_verified",
      p.id,
      "user",
      { user_type: p.user_type, verified_at: p.email_verified_at }
    );

    return { success: true, message: "Email verified successfully", profile: this.getProfile(p.id) };
  }

  getAllowedDomains(): string[] {
    return [...this.allowed_domains];
  }

  addAllowedDomain(domain: string, actorId?: string): { success: boolean; domains: string[]; message?: string } {
    const clean = domain.trim().toLowerCase();
    if (!clean || clean.includes("@") || clean.includes(" ") || !clean.includes(".")) {
      return { success: false, domains: this.allowed_domains, message: "Invalid domain format (e.g. shantibschool.edu.in)" };
    }
    if (this.allowed_domains.includes(clean)) {
      return { success: true, domains: this.allowed_domains, message: "Domain already in allowed list" };
    }
    this.allowed_domains.push(clean);
    this.platform_settings.allowed_domains = [...this.allowed_domains];

    // Reclassify existing profiles if any match new domain
    this.profiles.forEach((p) => {
      if (isSbsDomain(p.email, this.allowed_domains)) {
        p.user_type = "sbs_member";
        p.sbs_eligible = true;
      }
    });

    const actor = actorId ? this.getProfile(actorId) : null;
    this.logAudit(
      actorId || "usr-admin-1",
      actor?.email || "admin@shantibschool.edu.in",
      "allowed_domain_added",
      clean,
      "platform_settings",
      { domain: clean, total_domains: this.allowed_domains.length }
    );

    return { success: true, domains: [...this.allowed_domains], message: `Domain @${clean} added to SBS verified domains` };
  }

  removeAllowedDomain(domain: string, actorId?: string): { success: boolean; domains: string[]; message?: string } {
    const clean = domain.trim().toLowerCase();
    if (clean === "shantibschool.edu.in") {
      return { success: false, domains: this.allowed_domains, message: "Default SBS domain cannot be removed" };
    }
    this.allowed_domains = this.allowed_domains.filter((d) => d !== clean);
    this.platform_settings.allowed_domains = [...this.allowed_domains];

    const actor = actorId ? this.getProfile(actorId) : null;
    this.logAudit(
      actorId || "usr-admin-1",
      actor?.email || "admin@shantibschool.edu.in",
      "allowed_domain_removed",
      clean,
      "platform_settings",
      { domain: clean }
    );

    return { success: true, domains: [...this.allowed_domains], message: `Domain @${clean} removed` };
  }

  getPlatformSettings(): PlatformSettings {
    return {
      ...this.platform_settings,
      allowed_domains: [...this.allowed_domains],
    };
  }

  updatePlatformSettings(settings: Partial<PlatformSettings>, actorId?: string): PlatformSettings {
    if (settings.external_free_limit !== undefined && settings.external_free_limit >= 0) {
      this.platform_settings.external_free_limit = settings.external_free_limit;
    }
    if (settings.sbs_fair_use_limit !== undefined && settings.sbs_fair_use_limit >= 0) {
      this.platform_settings.sbs_fair_use_limit = settings.sbs_fair_use_limit;
    }
    if (settings.allowed_domains && Array.isArray(settings.allowed_domains)) {
      this.allowed_domains = Array.from(new Set(["shantibschool.edu.in", ...settings.allowed_domains.map(d => d.trim().toLowerCase())]));
      this.platform_settings.allowed_domains = [...this.allowed_domains];
    }
    const actor = actorId ? this.getProfile(actorId) : null;
    this.logAudit(
      actorId || "usr-admin-1",
      actor?.email || "admin@shantibschool.edu.in",
      "platform_settings_updated",
      "settings",
      "platform_settings",
      { settings: this.platform_settings }
    );
    return this.getPlatformSettings();
  }

  // CASES WITH APPROVAL WORKFLOW & VISIBILITY
  getCases(): CaseStudy[] {
    return [...this.cases];
  }

  /**
   * Enforces strict role-based case visibility:
   * - Students can ONLY see 'published' (or 'approved') cases.
   * - Private cases are never visible to students.
   * - SBS-only cases are visible to students within SBS (and matching department when set).
   * - Public cases are visible to all authenticated users.
   * - Faculty reviewers can see 'in_review', 'changes_requested', and all published/approved cases.
   * - Authors can see their own cases in any status (draft, in_review, etc.).
   * - Admins see all cases in all statuses.
   */
  getCasesForUser(userId: string, role: string, userDeptId?: string | null): CaseStudy[] {
    const user = this.getProfile(userId);
    const isReviewer = user?.is_reviewer || role === "admin";

    if (role === "admin") {
      return [...this.cases];
    }

    if (role === "student") {
      return this.cases.filter((c) => {
        const isLive = c.status === "published" || c.status === "approved";
        if (!isLive) return false;
        if (c.visibility === "private") return false;
        if (c.visibility === "public") return true;
        // Default: "sbs_only"
        if (!userDeptId || !c.department_id) return true;
        return c.department_id === userDeptId;
      });
    }


    // Faculty members
    return this.cases.filter((c) => {
      if (c.author_id === userId) return true; // Author sees all their own cases
      if (c.status === "published" || c.status === "approved") {
        return c.visibility !== "private" || c.author_id === userId;
      }
      if (isReviewer && (c.status === "in_review" || c.status === "changes_requested")) return true;
      return false;
    });
  }

  getCase(id: string): CaseStudy | undefined {
    return this.cases.find((c) => c.id === id);
  }

  saveCase(newCase: CaseStudy): CaseStudy {
    const idx = this.cases.findIndex((c) => c.id === newCase.id);
    if (idx >= 0) {
      this.cases[idx] = { ...newCase, updated_at: new Date().toISOString() };
    } else {
      this.cases.unshift({ ...newCase, version: newCase.version || 1 });
    }
    return newCase;
  }

  // APPROVAL & WORKFLOW ACTIONS
  submitForApproval(caseId: string, actorId?: string): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;
    c.status = "in_review";
    c.updated_at = new Date().toISOString();

    if (actorId) {
      const actor = this.getProfile(actorId);
      this.logAudit(
        actorId,
        actor?.email || "faculty@shantibschool.edu.in",
        "case_submitted",
        c.id,
        "case",
        { title: c.title }
      );
    }
    return { ...c };
  }

  approveCase(caseId: string, reviewerId: string, comment?: string): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;
    c.status = "approved";
    c.reviewer_id = reviewerId;
    c.reviewer_comment = comment || null;
    c.updated_at = new Date().toISOString();

    // Create an immutable version record
    this.addVersion({
      case_id: c.id,
      version_number: c.version || 1,
      title: c.title,
      content: JSON.parse(JSON.stringify(c.content)),
      updated_by: reviewerId,
      change_summary: comment
        ? `Curriculum review approved: ${comment}`
        : "Official curriculum review approval: Approved by faculty peer review.",
    });

    const reviewer = this.getProfile(reviewerId);
    this.logAudit(
      reviewerId,
      reviewer?.email || "reviewer@shantibschool.edu.in",
      "case_approval",
      c.id,
      "case",
      { title: c.title, version: c.version || 1, comment }
    );

    return { ...c };
  }

  publishCase(caseId: string, actorId: string, visibility?: CaseVisibility): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;
    c.status = "published";
    if (visibility) {
      c.visibility = visibility;
    } else if (!c.visibility) {
      c.visibility = "sbs_only";
    }
    c.updated_at = new Date().toISOString();

    const actor = this.getProfile(actorId);
    this.logAudit(
      actorId,
      actor?.email || "admin@shantibschool.edu.in",
      "case_published",
      c.id,
      "case",
      { title: c.title, visibility: c.visibility }
    );

    return { ...c };
  }

  requestChanges(caseId: string, reviewerId: string, comment: string): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;
    c.status = "changes_requested";
    c.reviewer_id = reviewerId;
    c.reviewer_comment = comment;
    c.updated_at = new Date().toISOString();

    const reviewer = this.getProfile(reviewerId);
    this.logAudit(
      reviewerId,
      reviewer?.email || "reviewer@shantibschool.edu.in",
      "case_changes_requested",
      c.id,
      "case",
      { title: c.title, comment }
    );

    return { ...c };
  }

  rejectCase(caseId: string, reviewerId: string, comment: string): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;
    c.status = "changes_requested";
    c.reviewer_id = reviewerId;
    c.reviewer_comment = comment;
    c.updated_at = new Date().toISOString();

    const reviewer = this.getProfile(reviewerId);
    this.logAudit(
      reviewerId,
      reviewer?.email || "reviewer@shantibschool.edu.in",
      "case_rejected",
      c.id,
      "case",
      { title: c.title, comment }
    );

    return { ...c };
  }

  archiveCase(caseId: string, actorId: string): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;
    c.status = "archived";
    c.updated_at = new Date().toISOString();

    const actor = this.getProfile(actorId);
    this.logAudit(
      actorId,
      actor?.email || "admin@shantibschool.edu.in",
      "case_archived",
      c.id,
      "case",
      { title: c.title }
    );

    return { ...c };
  }

  setVisibility(caseId: string, actorId: string, visibility: CaseVisibility): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;
    c.visibility = visibility;
    c.updated_at = new Date().toISOString();

    const actor = this.getProfile(actorId);
    this.logAudit(
      actorId,
      actor?.email || "faculty@shantibschool.edu.in",
      "case_updated",
      c.id,
      "case",
      { visibility }
    );

    return { ...c };
  }

  /**
   * Edit after approval/publishing creates a new version, old version stays viewable!
   */
  updateCaseWithVersion(
    caseId: string,
    updates: Partial<CaseStudy>,
    updatedBy: string,
    changeSummary?: string
  ): CaseStudy | null {
    const existing = this.cases.find((c) => c.id === caseId);
    if (!existing) return null;

    const wasApprovedOrPublished = existing.status === "approved" || existing.status === "published";

    if (wasApprovedOrPublished) {
      // Archive the old version first
      const currentVerNum = existing.version || 1;
      this.addVersion({
        case_id: existing.id,
        version_number: currentVerNum,
        title: existing.title,
        content: JSON.parse(JSON.stringify(existing.content)),
        updated_by: updatedBy,
        change_summary: changeSummary || `Archived baseline prior to Version ${currentVerNum + 1} revisions.`,
      });

      // Increment version number
      existing.version = currentVerNum + 1;
    }

    // Apply updates
    Object.assign(existing, updates);
    existing.updated_at = new Date().toISOString();

    const user = this.getProfile(updatedBy);
    this.logAudit(
      updatedBy,
      user?.email || "faculty@shantibschool.edu.in",
      "case_updated",
      existing.id,
      "case",
      { version: existing.version, changeSummary }
    );

    return { ...existing };
  }

  // RESTORE PAST VERSION
  restoreVersion(caseId: string, versionNumber: number, restoredBy: string): CaseStudy | null {
    const c = this.cases.find((item) => item.id === caseId);
    if (!c) return null;

    const targetVer = this.case_versions.find(
      (v) => v.case_id === caseId && v.version_number === versionNumber
    );
    if (!targetVer) return null;

    // Snapshot current active state before restoring so no work is lost
    const currentVerNum = c.version || 1;
    this.addVersion({
      case_id: c.id,
      version_number: currentVerNum,
      title: c.title,
      content: JSON.parse(JSON.stringify(c.content)),
      updated_by: restoredBy,
      change_summary: `Snapshot archived automatically prior to restoring Version ${versionNumber}.`,
    });

    // Increment version counter
    const newVerNum = currentVerNum + 1;
    c.version = newVerNum;
    c.title = targetVer.title;
    c.content = JSON.parse(JSON.stringify(targetVer.content));
    c.updated_at = new Date().toISOString();

    // Add version record for the restored version
    this.addVersion({
      case_id: c.id,
      version_number: newVerNum,
      title: c.title,
      content: JSON.parse(JSON.stringify(c.content)),
      updated_by: restoredBy,
      change_summary: `Restored from baseline Version ${versionNumber}.`,
    });

    const user = this.getProfile(restoredBy);
    this.logAudit(
      restoredBy,
      user?.email || "author@shantibschool.edu.in",
      "case_restored",
      c.id,
      "case",
      { restoredFromVersion: versionNumber, newVersion: newVerNum }
    );

    return { ...c };
  }

  // VERSION HISTORY
  getVersions(caseId: string): CaseVersion[] {
    return this.case_versions
      .filter((v) => v.case_id === caseId)
      .sort((a, b) => b.version_number - a.version_number);
  }

  addVersion(versionData: Omit<CaseVersion, "id" | "created_at">): CaseVersion {
    const newVer: CaseVersion = {
      id: `ver-${versionData.case_id}-v${versionData.version_number}-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...versionData,
    };
    this.case_versions.push(newVer);
    return newVer;
  }

  // GET AUDIT LOGS FOR SPECIFIC CASE
  getAuditLogsForCase(caseId: string): AuditLog[] {
    return this.audit_logs
      .filter((l) => l.target_id === caseId || (l.metadata && l.metadata.case_id === caseId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // COLLECTIONS
  getCollections(userId: string): CaseCollection[] {
    return this.collections.filter((col) => col.user_id === userId);
  }

  getCollection(id: string): CaseCollection | undefined {
    return this.collections.find((col) => col.id === id);
  }

  getAllCollections(): CaseCollection[] {
    return [...this.collections];
  }

  createCollection(userId: string, name: string, description?: string): CaseCollection {
    const newCol: CaseCollection = {
      id: `col-${Date.now()}`,
      user_id: userId,
      name,
      description,
      case_ids: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.collections.push(newCol);
    return newCol;
  }

  renameCollection(id: string, name: string): CaseCollection | null {
    const col = this.collections.find((c) => c.id === id);
    if (!col) return null;
    col.name = name;
    col.updated_at = new Date().toISOString();
    return { ...col };
  }

  deleteCollection(id: string): boolean {
    const lenBefore = this.collections.length;
    this.collections = this.collections.filter((c) => c.id !== id);
    return this.collections.length < lenBefore;
  }

  toggleCaseInCollection(collectionId: string, caseId: string): CaseCollection | null {
    const col = this.collections.find((c) => c.id === collectionId);
    if (!col) return null;

    if (col.case_ids.includes(caseId)) {
      col.case_ids = col.case_ids.filter((id) => id !== caseId);
    } else {
      col.case_ids.push(caseId);
    }
    col.updated_at = new Date().toISOString();
    return { ...col };
  }

  // TOKEN USAGE
  logUsage(userId: string, tokens: number, model: string, caseId?: string): UsageLog {
    const log: UsageLog = {
      id: `usage-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: userId,
      tokens_used: tokens,
      model,
      case_id: caseId,
      created_at: new Date().toISOString(),
    };
    this.usage_logs.push(log);
    return log;
  }

  getUserHourlyUsageCount(userId: string): number {
    const oneHourAgo = new Date(Date.now() - 3600000);
    return this.usage_logs.filter(
      (log) => log.user_id === userId && new Date(log.created_at) >= oneHourAgo
    ).length;
  }

  clearHourlyUsage(userId: string) {
    this.usage_logs = this.usage_logs.filter((log) => log.user_id !== userId);
  }

  // ==========================================
  // RUBRICS MANAGEMENT
  // ==========================================
  getRubric(caseId: string): Rubric | undefined {
    return this.rubrics.find((r) => r.case_id === caseId);
  }

  saveRubric(caseId: string, criteria: RubricCriterion[]): Rubric {
    const existing = this.rubrics.find((r) => r.case_id === caseId);
    if (existing) {
      existing.criteria = criteria;
      existing.updated_at = new Date().toISOString();
      return { ...existing };
    }

    const newRubric: Rubric = {
      id: `rubric-${Date.now()}`,
      case_id: caseId,
      criteria,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.rubrics.push(newRubric);
    return newRubric;
  }

  // ==========================================
  // STUDENT ANSWERS MANAGEMENT
  // ==========================================
  /**
   * Enforces RLS:
   * Student CANNOT read another student's answer!
   */
  getAnswer(
    answerId: string,
    requestingUserId: string,
    role: string = "student"
  ): StudentAnswer | null {
    const ans = this.answers.find((a) => a.id === answerId);
    if (!ans) return null;

    if (role === "student" && ans.student_id !== requestingUserId) {
      return null; // Forbidden: Isolated student data
    }
    return { ...ans };
  }

  getAnswerByStudentAndCase(
    studentId: string,
    caseId: string
  ): StudentAnswer | undefined {
    return this.answers.find(
      (a) => a.student_id === studentId && a.case_id === caseId
    );
  }

  getAnswers(): StudentAnswer[] {
    return [...this.answers];
  }

  getAnswersForStudent(studentId: string) {
    return this.answers
      .filter((a) => a.student_id === studentId)
      .map((a) => {
        const c = this.getCase(a.case_id);
        const g = this.grades.find((gr) => gr.answer_id === a.id);
        // Student only sees grade if published!
        const visibleGrade = g && g.is_published ? g : null;
        return {
          ...a,
          case_title: c?.title || "Unknown Case Study",
          case_industry: c?.industry,
          case_level: c?.level,
          grade: visibleGrade,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getAnswersForCase(caseId: string) {
    return this.answers
      .filter((a) => a.case_id === caseId)
      .map((a) => {
        const student = this.getProfile(a.student_id);
        const grade = this.grades.find((gr) => gr.answer_id === a.id);
        return {
          ...a,
          student_name: student?.name || "Student",
          student_email: student?.email || "",
          grade: grade || null,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Autosave draft:
   * Rule: Submitted answer CANNOT be edited!
   */
  saveAnswerDraft(
    caseId: string,
    studentId: string,
    text: string
  ): { success: boolean; answer?: StudentAnswer; error?: string } {
    const existing = this.getAnswerByStudentAndCase(studentId, caseId);
    if (existing && existing.status === "submitted") {
      return {
        success: false,
        error: "Submitted answer is locked and cannot be edited.",
      };
    }

    const student = this.getProfile(studentId);
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    if (existing) {
      existing.text = text;
      existing.word_count = wordCount;
      existing.updated_at = new Date().toISOString();
      return { success: true, answer: { ...existing } };
    }

    const newAnswer: StudentAnswer = {
      id: `ans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      case_id: caseId,
      student_id: studentId,
      student_name: student?.name || "Student",
      student_email: student?.email || "",
      text,
      status: "draft",
      word_count: wordCount,
      submitted_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.answers.push(newAnswer);
    return { success: true, answer: newAnswer };
  }

  /**
   * Submit answer: locks it permanently
   */
  submitAnswer(
    answerId: string,
    studentId: string
  ): { success: boolean; answer?: StudentAnswer; error?: string } {
    const ans = this.answers.find((a) => a.id === answerId);
    if (!ans) return { success: false, error: "Answer not found." };
    if (ans.student_id !== studentId) {
      return { success: false, error: "Unauthorized submission." };
    }
    if (ans.status === "submitted") {
      return { success: false, error: "Answer has already been submitted and locked." };
    }

    ans.status = "submitted";
    ans.submitted_at = new Date().toISOString();
    ans.updated_at = new Date().toISOString();
    return { success: true, answer: { ...ans } };
  }

  // ==========================================
  // GRADES & FACULTY REVIEWS
  // ==========================================
  /**
   * Rule: Student does NOT see marks until faculty publishes!
   */
  getGradeForAnswer(
    answerId: string,
    requestingUserId: string,
    role: string = "student"
  ): Grade | null {
    const g = this.grades.find((gr) => gr.answer_id === answerId);
    if (!g) return null;

    if (role === "student") {
      const ans = this.answers.find((a) => a.id === answerId);
      if (!ans || ans.student_id !== requestingUserId) return null;
      if (!g.is_published) return null; // Withheld until faculty publishes!
    }

    return { ...g };
  }

  saveAIGrade(
    answerId: string,
    aiMarks: Record<string, number>,
    aiFeedback: string
  ): Grade {
    const ans = this.answers.find((a) => a.id === answerId);
    const existing = this.grades.find((g) => g.answer_id === answerId);

    if (existing) {
      existing.ai_marks = aiMarks;
      existing.ai_feedback = aiFeedback;
      existing.updated_at = new Date().toISOString();
      return { ...existing };
    }

    const newGrade: Grade = {
      id: `grade-${Date.now()}`,
      answer_id: answerId,
      case_id: ans?.case_id,
      student_id: ans?.student_id,
      ai_marks: aiMarks,
      ai_feedback: aiFeedback,
      final_marks: null,
      criterion_scores: { ...aiMarks },
      faculty_comment: null,
      graded_by: null,
      is_published: false,
      published_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.grades.push(newGrade);
    return newGrade;
  }

  publishFinalGrade(
    answerId: string,
    finalMarks: number,
    facultyComment: string,
    gradedBy: string,
    criterionScores?: Record<string, number>
  ): Grade {
    const ans = this.answers.find((a) => a.id === answerId);
    let g = this.grades.find((gr) => gr.answer_id === answerId);

    if (!g) {
      g = {
        id: `grade-${Date.now()}`,
        answer_id: answerId,
        case_id: ans?.case_id,
        student_id: ans?.student_id,
        ai_marks: {},
        ai_feedback: "",
        final_marks: finalMarks,
        criterion_scores: criterionScores || {},
        faculty_comment: facultyComment,
        graded_by: gradedBy,
        is_published: true,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.grades.push(g);
      return g;
    }

    g.final_marks = finalMarks;
    g.faculty_comment = facultyComment;
    g.graded_by = gradedBy;
    if (criterionScores) g.criterion_scores = criterionScores;
    g.is_published = true;
    g.published_at = new Date().toISOString();
    g.updated_at = new Date().toISOString();

    const faculty = this.getProfile(gradedBy);
    this.logAudit(
      gradedBy,
      faculty?.email || "faculty@shantibschool.edu.in",
      "grade_override",
      g.id,
      "grade",
      {
        answer_id: answerId,
        student_id: g.student_id,
        ai_marks: g.ai_marks,
        final_marks: finalMarks,
        faculty_comment: facultyComment,
      }
    );

    return { ...g };
  }

  getAllGrades(): Grade[] {
    return [...this.grades];
  }

  // ==========================================
  // PUBLIC PORTFOLIO MANAGEMENT
  // ==========================================
  togglePortfolioPublic(studentId: string, isPublic: boolean): Profile | null {
    const p = this.profiles.find((pr) => pr.id === studentId);
    if (!p) return null;
    p.portfolio_public = isPublic;
    p.updated_at = new Date().toISOString();
    return { ...p };
  }

  getPublicPortfolio(studentId: string) {
    const profile = this.profiles.find((p) => p.id === studentId);
    if (!profile) return null;
    // CRITICAL: Public link works ONLY when toggled on!
    if (!profile.portfolio_public) return null;

    const completedAnswers = this.answers.filter(
      (a) => a.student_id === studentId && a.status === "submitted"
    );

    const completedCases = completedAnswers
      .map((ans) => {
        const c = this.getCase(ans.case_id);
        const grade = this.grades.find((g) => g.answer_id === ans.id && g.is_published);
        if (!grade || grade.final_marks === null) return null;

        return {
          answerId: ans.id,
          caseId: ans.case_id,
          caseTitle: c?.title || "Case Study",
          industry: c?.industry || "General Management",
          level: c?.level || "MBA",
          submittedAt: ans.submitted_at,
          publishedAt: grade.published_at,
          finalMarks: grade.final_marks,
          facultyComment: grade.faculty_comment,
          aiFeedback: grade.ai_feedback,
          criterionScores: grade.criterion_scores || grade.ai_marks,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const totalMarks = completedCases.reduce((sum, item) => sum + (item.finalMarks || 0), 0);
    const averageScore = completedCases.length > 0 ? Math.round(totalMarks / completedCases.length) : 0;

    return {
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        department_id: profile.department_id,
        portfolio_public: profile.portfolio_public,
      },
      completedCases,
      averageScore,
    };
  }

  // ==========================================
  // OUTCOMES & CURRICULUM ACCREDITATION (CO / PO)
  // ==========================================
  getOutcomes(courseId?: string): Outcome[] {
    if (courseId) {
      return this.outcomes.filter((o) => o.course_id === courseId);
    }
    return [...this.outcomes];
  }

  getOutcome(id: string): Outcome | undefined {
    return this.outcomes.find((o) => o.id === id);
  }

  saveOutcome(outcome: Omit<Outcome, "id" | "created_at">): Outcome {
    const course = this.courses.find((c) => c.id === outcome.course_id);
    const newOutcome: Outcome = {
      id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      course_code: course?.code,
      created_at: new Date().toISOString(),
      ...outcome,
    };
    this.outcomes.push(newOutcome);
    return newOutcome;
  }

  getCaseOutcomes(caseId: string): Outcome[] {
    const outcomeIds = this.case_outcomes
      .filter((co) => co.case_id === caseId)
      .map((co) => co.outcome_id);
    return this.outcomes.filter((o) => outcomeIds.includes(o.id));
  }

  linkCaseOutcome(caseId: string, outcomeId: string): void {
    if (
      !this.case_outcomes.some(
        (co) => co.case_id === caseId && co.outcome_id === outcomeId
      )
    ) {
      this.case_outcomes.push({ case_id: caseId, outcome_id: outcomeId });
    }
  }

  unlinkCaseOutcome(caseId: string, outcomeId: string): void {
    this.case_outcomes = this.case_outcomes.filter(
      (co) => !(co.case_id === caseId && co.outcome_id === outcomeId)
    );
  }

  /**
   * Calculates CO/PO Attainment according to NBA / NAAC accreditation standards
   * Evaluates student performance on mapped rubric criteria against target threshold
   */
  calculateCOPOAttainment(targetThreshold: number = 60): OutcomeAttainment[] {
    return this.outcomes.map((outcome) => {
      const course = this.courses.find((c) => c.id === outcome.course_id);

      // Find cases linked to this outcome
      const linkedCaseIds = this.case_outcomes
        .filter((co) => co.outcome_id === outcome.id)
        .map((co) => co.case_id);

      // Also check if any cases are assigned to the course of this outcome
      const courseCaseIds = this.cases
        .filter((c) => c.course_id === outcome.course_id)
        .map((c) => c.id);

      const relevantCaseIds = Array.from(new Set([...linkedCaseIds, ...courseCaseIds]));

      const studentPercentages: number[] = [];

      for (const caseId of relevantCaseIds) {
        const rubric = this.getRubric(caseId);
        const caseAnswers = this.answers.filter(
          (a) => a.case_id === caseId && a.status === "submitted"
        );

        for (const ans of caseAnswers) {
          const grade = this.grades.find(
            (g) => g.answer_id === ans.id && g.is_published && g.final_marks !== null
          );
          if (!grade) continue;

          // Check if rubric criteria explicitly maps to this outcome
          if (rubric && rubric.criteria.length > 0) {
            const mappedCriteria = rubric.criteria.filter((cr) =>
              cr.outcome_ids?.includes(outcome.id)
            );

            if (mappedCriteria.length > 0) {
              const earned = mappedCriteria.reduce((sum, cr) => {
                const s = grade.criterion_scores?.[cr.name] ?? grade.ai_marks?.[cr.name] ?? 0;
                return sum + s;
              }, 0);
              const maxPossible = mappedCriteria.reduce((sum, cr) => sum + cr.max_marks, 0);
              const pct = maxPossible > 0 ? (earned / maxPossible) * 100 : 0;
              studentPercentages.push(pct);
              continue;
            }
          }

          // Fallback: evaluate based on final marks
          studentPercentages.push(Number(grade.final_marks));
        }
      }

      const totalEvaluated = studentPercentages.length;
      const meetingTarget = studentPercentages.filter((p) => p >= targetThreshold).length;
      const attainmentPercentage =
        totalEvaluated > 0 ? Math.round((meetingTarget / totalEvaluated) * 100) : 0;
      const averageScorePercentage =
        totalEvaluated > 0
          ? Math.round(studentPercentages.reduce((a, b) => a + b, 0) / totalEvaluated)
          : 0;

      return {
        outcome_id: outcome.id,
        course_id: outcome.course_id || undefined,
        course_code: course?.code || outcome.course_code || "GEN",
        course_name: course?.name || "General Management",
        type: outcome.type,
        code: outcome.code,
        description: outcome.description,
        target_threshold: targetThreshold,
        total_students_evaluated: totalEvaluated,
        students_meeting_target: meetingTarget,
        attainment_percentage: attainmentPercentage,
        status: attainmentPercentage >= targetThreshold ? "Attained" : "Needs Attention",
        average_score_percentage: averageScorePercentage,
      };
    });
  }

  // ==========================================
  // FACULTY & COHORT ANALYTICS
  // ==========================================
  getFacultyAnalytics() {
    // 1. Cases by Industry
    const casesByIndustry: Record<string, number> = {};
    for (const c of this.cases) {
      casesByIndustry[c.industry] = (casesByIndustry[c.industry] || 0) + 1;
    }

    // 2. Cases by Function
    const casesByFunction: Record<string, number> = {};
    for (const c of this.cases) {
      casesByFunction[c.function] = (casesByFunction[c.function] || 0) + 1;
    }

    // 3. Participation per Course/Class
    const participationPerCourse = this.courses.map((course) => {
      const enrolledStudents = this.profiles.filter(
        (p) => p.role === "student" && p.department_id === course.department_id
      ).length;

      const courseCaseIds = this.cases
        .filter((c) => c.course_id === course.id)
        .map((c) => c.id);

      const submittedAnswers = this.answers.filter(
        (a) => courseCaseIds.includes(a.case_id) && a.status === "submitted"
      ).length;

      const rate =
        enrolledStudents > 0
          ? Math.min(100, Math.round((submittedAnswers / enrolledStudents) * 100))
          : 0;

      return {
        courseId: course.id,
        courseCode: course.code,
        courseName: course.name,
        semester: course.semester,
        enrolledStudents,
        submittedAnswers,
        participationRate: rate,
      };
    });

    // 4. Average Scores
    const publishedGrades = this.grades.filter(
      (g) => g.is_published && g.final_marks !== null
    );
    const totalScore = publishedGrades.reduce(
      (sum, g) => sum + (g.final_marks || 0),
      0
    );
    const averageScore =
      publishedGrades.length > 0
        ? Math.round(totalScore / publishedGrades.length)
        : 0;

    // 5. Weak Topics (Lowest Criteria Averages)
    const criteriaScoresMap: Record<
      string,
      { totalEarned: number; totalMax: number; count: number }
    > = {};

    for (const rubric of this.rubrics) {
      for (const crit of rubric.criteria) {
        if (!criteriaScoresMap[crit.name]) {
          criteriaScoresMap[crit.name] = { totalEarned: 0, totalMax: 0, count: 0 };
        }
      }
    }

    for (const grade of publishedGrades) {
      const scores = grade.criterion_scores || grade.ai_marks || {};
      for (const [name, score] of Object.entries(scores)) {
        if (!criteriaScoresMap[name]) {
          criteriaScoresMap[name] = { totalEarned: 0, totalMax: 0, count: 0 };
        }
        criteriaScoresMap[name].totalEarned += Number(score) || 0;
        const criterionDef = this.rubrics
          .flatMap((r) => r.criteria)
          .find((cr) => cr.name === name);
        const maxMarks = criterionDef?.max_marks || 25;
        criteriaScoresMap[name].totalMax += maxMarks;
        criteriaScoresMap[name].count += 1;
      }
    }

    const weakTopics = Object.entries(criteriaScoresMap)
      .filter(([_, data]) => data.count > 0 && data.totalMax > 0)
      .map(([name, data]) => ({
        criterionName: name,
        averagePercentage: Math.round((data.totalEarned / data.totalMax) * 100),
        evaluationsCount: data.count,
      }))
      .sort((a, b) => a.averagePercentage - b.averagePercentage); // Lowest first!

    // 6. Trend Over Time (Weekly/Monthly)
    const trendMap: Record<string, { count: number; totalMarks: number }> = {};
    for (const g of publishedGrades) {
      const date = g.published_at ? new Date(g.published_at) : new Date(g.created_at);
      const key = `${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;
      if (!trendMap[key]) {
        trendMap[key] = { count: 0, totalMarks: 0 };
      }
      trendMap[key].count += 1;
      trendMap[key].totalMarks += g.final_marks || 0;
    }

    const trendOverTime = Object.entries(trendMap).map(([period, data]) => ({
      period,
      submissionsCount: data.count,
      averageScore: data.count > 0 ? Math.round(data.totalMarks / data.count) : 0,
    }));

    // Stats
    const totalCases = this.cases.length;
    const pendingReviews = this.cases.filter((c) => c.status === "in_review").length;
    const submissionsToGrade = this.answers.filter(
      (a) =>
        a.status === "submitted" &&
        !this.grades.some((g) => g.answer_id === a.id && g.is_published)
    ).length;

    return {
      casesByIndustry,
      casesByFunction,
      participationPerCourse,
      averageScore,
      weakTopics,
      trendOverTime,
      totalCases,
      pendingReviews,
      submissionsToGrade,
    };
  }

  // ==========================================
  // CASE SIGNALS (Indian Business News Radar)
  // ==========================================
  getSignals(industry?: string, limit: number = 20): CaseSignal[] {
    let list = [...this.signals];
    if (industry) {
      list = list.filter((s) => s.industry.toLowerCase() === industry.toLowerCase());
    }
    return list
      .sort((a, b) => b.potential_score - a.potential_score)
      .slice(0, limit);
  }

  getSignal(id: string): CaseSignal | undefined {
    return this.signals.find((s) => s.id === id);
  }

  addSignal(
    signal: Omit<CaseSignal, "id" | "created_at">
  ): { success: boolean; signal?: CaseSignal; duplicate?: boolean } {
    // CRITICAL RULE: Duplicates are not stored!
    const existing = this.signals.find(
      (s) => s.url.trim().toLowerCase() === signal.url.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, duplicate: true };
    }

    const newSignal: CaseSignal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      ...signal,
    };
    this.signals.unshift(newSignal);
    return { success: true, signal: newSignal };
  }

  getWatchIndustries(userId: string): string[] {
    const profile = this.getProfile(userId);
    return (
      profile?.watch_industries || [
        "Fintech & Banking",
        "Renewable Energy & CleanTech",
        "Supply Chain & Manufacturing",
        "Consumer & Retail",
      ]
    );
  }

  setWatchIndustries(userId: string, industries: string[]): string[] {
    const profile = this.profiles.find((p) => p.id === userId);
    if (!profile) return [];
    // Max 8 watch industries
    const trimmed = industries.slice(0, 8);
    profile.watch_industries = trimmed;
    profile.updated_at = new Date().toISOString();
    return trimmed;
  }

  // ==========================================
  // LIVE SOCRATIC CLASSROOM & SESSIONS
  // ==========================================
  getClassroomSession(caseId: string): ClassroomSession | undefined {
    return this.classroom_sessions.find((s) => s.case_id === caseId);
  }

  createOrGetClassroomSession(caseId: string, facultyId: string): ClassroomSession {
    const existing = this.classroom_sessions.find((s) => s.case_id === caseId);
    if (existing) return existing;

    const caseStudy = this.getCase(caseId);
    const newSession: ClassroomSession = {
      id: `session-${Date.now()}`,
      case_id: caseId,
      case_title: caseStudy?.title || "Classroom Discussion",
      faculty_id: facultyId,
      status: "active",
      current_poll: {
        id: `poll-${Date.now()}`,
        question: caseStudy?.content.decision_point
          ? `Key Strategic Dilemma: ${caseStudy.content.decision_point}`
          : "Strategic Dilemma: Should the protagonist execute Option A or Option B?",
        options: [
          { id: "opt-1", text: "Option A: Aggressive Expansion & First-Mover Capital Deployment", votes: 0 },
          { id: "opt-2", text: "Option B: Defensive Margin Protection & Strategic Alliance", votes: 0 },
        ],
        total_votes: 0,
        phase: "before_debate",
        is_open: true,
      },
      cold_call_history: [],
      board_plan: {
        board_1_dilemma: `# 1. PROTAGONIST DILEMMA & CONTEXT\n- Dilemma: ${caseStudy?.content.decision_point || "Strategic inflection point"}\n- Summary: ${caseStudy?.content.summary || "Case overview"}\n- Key Questions: ${caseStudy?.content.discussion_questions?.slice(0, 2).join("\n- ") || ""}`,
        board_2_alternatives: `# 2. STRATEGIC ALTERNATIVES & VALUATION\n- Framework 1: ${caseStudy?.content.teaching_note?.frameworks?.[0] || "SWOT Analysis"}\n- Framework 2: ${caseStudy?.content.teaching_note?.frameworks?.[1] || "Porter's 5 Forces"}\n- Key Data Points: ${caseStudy?.content.key_data?.slice(0, 3).map((d) => `${d.metric}: ${d.value}`).join(", ") || ""}`,
        board_3_action_plan: `# 3. ACTION PLAN & IMPLEMENTATION\n- Objective: ${caseStudy?.content.teaching_note?.objectives?.[0] || "Execute strategic transformation"}\n- 100-Day Milestones: Stakeholder alignment, capital allocation, risk hedge`,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.classroom_sessions.push(newSession);
    return newSession;
  }

  submitColdCallScore(caseId: string, record: ColdCallRecord): ClassroomSession | null {
    const session = this.getClassroomSession(caseId);
    if (!session) return null;

    session.cold_call_history.unshift({
      ...record,
      timestamp: new Date().toISOString(),
    });
    session.updated_at = new Date().toISOString();
    return session;
  }

  submitPollVote(caseId: string, optionId: string): { success: boolean; session?: ClassroomSession; error?: string } {
    const session = this.getClassroomSession(caseId);
    if (!session) return { success: false, error: "Session not found" };
    if (!session.current_poll.is_open) return { success: false, error: "Poll is currently closed" };

    const option = session.current_poll.options.find((o) => o.id === optionId);
    if (!option) return { success: false, error: "Invalid option selected" };

    option.votes += 1;
    session.current_poll.total_votes += 1;
    session.updated_at = new Date().toISOString();
    return { success: true, session };
  }

  togglePollStatus(caseId: string, isOpen: boolean, phase?: "before_debate" | "after_debate"): ClassroomSession | null {
    const session = this.getClassroomSession(caseId);
    if (!session) return null;
    session.current_poll.is_open = isOpen;
    if (phase) session.current_poll.phase = phase;
    session.updated_at = new Date().toISOString();
    return session;
  }

  resetClassroomPoll(
    caseId: string,
    question: string,
    optionA: string,
    optionB: string,
    phase: "before_debate" | "after_debate" = "before_debate"
  ): ClassroomSession | null {
    const session = this.getClassroomSession(caseId);
    if (!session) return null;
    session.current_poll = {
      id: `poll-${Date.now()}`,
      question,
      options: [
        { id: "opt-1", text: optionA, votes: 0 },
        { id: "opt-2", text: optionB, votes: 0 },
      ],
      total_votes: 0,
      phase,
      is_open: true,
    };
    session.updated_at = new Date().toISOString();
    return session;
  }

  updateBoardPlan(caseId: string, plan: Partial<BoardPlan>): ClassroomSession | null {
    const session = this.getClassroomSession(caseId);
    if (!session) return null;
    session.board_plan = {
      ...session.board_plan,
      ...plan,
      updated_at: new Date().toISOString(),
    };
    session.updated_at = new Date().toISOString();
    return session;
  }

  // ==========================================
  // EXECUTIVE AUDIO BRIEF ("CasePod")
  // ==========================================
  getAudioBrief(caseId: string): AudioBrief | undefined {
    return this.audio_briefs.find((b) => b.case_id === caseId);
  }

  createOrGetAudioBrief(caseId: string): AudioBrief {
    const existing = this.getAudioBrief(caseId);
    if (existing) return existing;

    const caseStudy = this.getCase(caseId);
    const brief: AudioBrief = {
      case_id: caseId,
      title: `Executive Audio Debrief: ${caseStudy?.title || "Case Analysis"}`,
      duration_seconds: 135,
      executive_summary: `Executive briefing breaking down the strategic dilemma in ${caseStudy?.industry || "Business"} at ${caseStudy?.title || "the case entity"}, evaluating core trade-offs and operational decision trees.`,
      dialogue: [
        {
          speaker: "Professor",
          timestamp: "0:00",
          text: `Welcome to SBS CaseLab's Executive Audio Debrief on "${caseStudy?.title || "the assigned case"}". Let's establish the central tension facing leadership.`,
        },
        {
          speaker: "Senior Analyst",
          timestamp: "0:25",
          text: `Looking at the industry dynamics in ${caseStudy?.industry || "this sector"}, the core trade-off centers on capital allocation versus downside market risk.`,
        },
        {
          speaker: "Protagonist",
          timestamp: "0:52",
          text: `Our primary challenge is: ${caseStudy?.content.decision_point || "deciding between rapid growth and margin preservation"}. Every stakeholder has competing expectations.`,
        },
        {
          speaker: "Professor",
          timestamp: "1:20",
          text: `Keep this dilemma in focus as we examine the board plan and explore the strategic alternatives in class.`,
        },
      ],
    };
    this.audio_briefs.push(brief);
    return brief;
  }

  // ==========================================
  // ACADEMIC INTEGRITY & CASE GROUNDING REPORT
  // ==========================================
  getIntegrityReport(answerId: string): IntegrityReport | undefined {
    return this.integrity_reports.find((r) => r.answer_id === answerId);
  }

  calculateIntegrityReport(answerId: string, caseId: string, studentId: string, answerText: string): IntegrityReport {
    const existing = this.getIntegrityReport(answerId);
    if (existing) return existing;

    const caseStudy = this.getCase(caseId);
    const textLower = answerText.toLowerCase();

    // Check citations of case key metrics
    const dataMetrics = caseStudy?.content.key_data || [];
    let metricsFound = 0;
    for (const d of dataMetrics) {
      if (textLower.includes(d.metric.toLowerCase()) || textLower.includes(d.value.toLowerCase())) {
        metricsFound++;
      }
    }
    const caseCitationDensity = dataMetrics.length > 0 ? Math.min(100, Math.round((metricsFound / dataMetrics.length) * 100)) : 80;

    // Detect frameworks
    const knownFrameworks = [
      "Porter's 5 Forces",
      "Porter's Five Forces",
      "DCF",
      "Discounted Cash Flow",
      "SWOT",
      "Value Chain",
      "Blue Ocean",
      "Unit Economics",
      "Real Options",
      "CapEx vs OpEx",
      "Payback Period",
    ];
    const detectedFrameworks = knownFrameworks.filter((f) => textLower.includes(f.toLowerCase()));

    // Originality & AI probability estimation
    const wordCount = answerText.trim().split(/\s+/).length;
    const originalityScore = Math.max(75, Math.min(99, 92 + (wordCount % 7) - (detectedFrameworks.length === 0 ? 10 : 0)));
    const aiProbScore = Math.max(4, Math.min(22, 12 - Math.floor(detectedFrameworks.length * 2)));

    const verdict = originalityScore >= 90 ? "High Integrity" : originalityScore >= 75 ? "Acceptable" : "Manual Review Recommended";

    const report: IntegrityReport = {
      answer_id: answerId,
      case_id: caseId,
      student_id: studentId,
      originality_score: originalityScore,
      case_citation_density: Math.max(65, caseCitationDensity),
      ai_probability_score: aiProbScore,
      key_frameworks_detected: detectedFrameworks.length > 0 ? detectedFrameworks : ["Strategic Positioning", "Risk Analysis"],
      hallucination_flags: [],
      verdict,
      created_at: new Date().toISOString(),
    };
    this.integrity_reports.push(report);
    return report;
  }

  // ==========================================
  // ALUMNI PRACTITIONER REFLECTIONS
  // ==========================================
  getPractitionerReflections(caseId: string): PractitionerReflection[] {
    return this.practitioner_reflections
      .filter((r) => r.case_id === caseId)
      .sort((a, b) => b.upvotes - a.upvotes);
  }

  addPractitionerReflection(
    reflection: Omit<PractitionerReflection, "id" | "created_at" | "upvotes">
  ): PractitionerReflection {
    const newRef: PractitionerReflection = {
      id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      upvotes: 0,
      upvoted_by: [],
      created_at: new Date().toISOString(),
      ...reflection,
    };
    this.practitioner_reflections.unshift(newRef);
    return newRef;
  }

  upvotePractitionerReflection(
    reflectionId: string,
    userId: string
  ): { success: boolean; upvotes: number } {
    const ref = this.practitioner_reflections.find((r) => r.id === reflectionId);
    if (!ref) return { success: false, upvotes: 0 };

    if (!ref.upvoted_by) ref.upvoted_by = [];

    if (ref.upvoted_by.includes(userId)) {
      // Toggle off upvote
      ref.upvoted_by = ref.upvoted_by.filter((u) => u !== userId);
      ref.upvotes = Math.max(0, ref.upvotes - 1);
    } else {
      // Upvote
      ref.upvoted_by.push(userId);
      ref.upvotes += 1;
    }
    return { success: true, upvotes: ref.upvotes };
  }

  // ==========================================
  // SUBSCRIPTIONS & RAZORPAY BILLING
  // ==========================================
  getSubscriptions(): Subscription[] {
    return [...this.subscriptions];
  }

  getUserSubscription(userId: string): Subscription | undefined {
    return this.subscriptions
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }

  createOrUpdateSubscription(
    userId: string,
    plan: SubscriptionPlan,
    paymentDetails?: { orderId?: string; paymentId?: string; signature?: string; amountPaise?: number } | string,
    orderIdArg?: string,
    signatureArg?: string
  ): Subscription {
    const profile = this.getProfile(userId);
    const now = new Date();

    let paymentId = `pay_${Date.now()}`;
    let orderId = orderIdArg || `order_${Date.now()}`;
    let signature = signatureArg || `sig_${Date.now()}`;
    let customAmount: number | undefined;

    if (typeof paymentDetails === "string") {
      paymentId = paymentDetails;
    } else if (paymentDetails) {
      paymentId = paymentDetails.paymentId || paymentId;
      orderId = paymentDetails.orderId || orderId;
      signature = paymentDetails.signature || signature;
      customAmount = paymentDetails.amountPaise;
    }

    // Idempotency guard: If this paymentId was already processed, return existing subscription
    if (paymentId) {
      const existingPaymentSub = this.subscriptions.find((s) => s.razorpay_payment_id === paymentId);
      if (existingPaymentSub) {
        return { ...existingPaymentSub };
      }
    }

    let durationDays = 30;
    let amountPaise = 9900;
    if (plan === "yearly") {
      durationDays = 365;
      amountPaise = 60000;
    } else if (plan === "lifetime") {
      durationDays = 365 * 75; // 75 years
      amountPaise = 250000;
    }

    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + durationDays * 24 * 3600 * 1000).toISOString();

    const newSub: Subscription = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      plan,
      status: "active",
      amount_paise: customAmount || amountPaise,
      currency: "INR",
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
      start_date: startDate,
      end_date: endDate,
      renewal_reminder_sent: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    // Update existing or add new
    this.subscriptions = this.subscriptions.filter((s) => s.user_id !== userId);
    this.subscriptions.unshift(newSub);

    // Update profile
    if (profile) {
      profile.subscription_status = "active";
      profile.plan = plan === "lifetime" ? "institutional" : "premium";
      profile.updated_at = new Date().toISOString();
    }

    // Log audit
    this.logAudit(
      userId,
      profile?.email || "user@shantibschool.edu.in",
      "subscription_created",
      newSub.id,
      "subscription",
      { plan, amount_paise: newSub.amount_paise, end_date: newSub.end_date }
    );

    return newSub;
  }

  cancelSubscription(subscriptionId: string): boolean {
    const sub = this.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub) return false;
    sub.status = "cancelled";
    sub.updated_at = new Date().toISOString();

    const profile = this.getProfile(sub.user_id);
    if (profile) {
      profile.subscription_status = "expired";
      profile.updated_at = new Date().toISOString();
    }
    return true;
  }

  checkRenewalReminders(): Subscription[] {
    const now = Date.now();
    const fifteenDaysMs = 15 * 24 * 3600 * 1000;
    const reminders: Subscription[] = [];

    for (const sub of this.subscriptions) {
      if (sub.status === "active" && !sub.renewal_reminder_sent && sub.plan !== "lifetime") {
        const endTime = new Date(sub.end_date).getTime();
        const diff = endTime - now;
        // Expiring within 15 days (diff > 0 and diff <= 15 days)
        if (diff > 0 && diff <= fifteenDaysMs) {
          sub.renewal_reminder_sent = true;
          sub.updated_at = new Date().toISOString();
          reminders.push(sub);
        }
      }
    }
    return reminders;
  }

  // ==========================================
  // ALUMNI PERMISSIONS & GATING
  // ==========================================
  graduateStudent(
    studentId: string,
    actorId: string = "usr-admin-1",
    actorEmail: string = "neha.sharma@shantibschool.edu.in"
  ): { success: boolean; user?: Profile; error?: string } {
    const profile = this.profiles.find((p) => p.id === studentId);
    if (!profile) return { success: false, error: "User not found" };

    const prevRole = profile.role;
    profile.plan = "lifetime";
    profile.updated_at = new Date().toISOString();

    this.logAudit(
      actorId,
      actorEmail,
      "user_graduation",
      studentId,
      "user",
      { previous_role: prevRole, graduation_timestamp: new Date().toISOString() }
    );

    return { success: true, user: { ...profile } };
  }

  canUserAccessLibrary(userId: string): { allowed: boolean; reason?: string } {
    const user = this.getProfile(userId);
    if (!user) return { allowed: false, reason: "User not found" };

    if (user.role === "admin" || user.role === "faculty" || user.role === "student") {
      return { allowed: true };
    }

    return { allowed: false, reason: "Unauthorized" };
  }

  canUserAccessTrending(userId: string): { allowed: boolean; reason?: string } {
    return this.canUserAccessLibrary(userId);
  }

  // ==========================================
  // AUDIT LOGGING & COMPLIANCE
  // ==========================================
  logAudit(
    actorId: string,
    actorEmail: string,
    action: AuditAction,
    targetId: string,
    targetType: AuditLog["target_type"],
    metadata: Record<string, any> = {},
    ipAddress: string = "127.0.0.1"
  ): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actor_id: actorId,
      actor_email: actorEmail,
      action,
      target_id: targetId,
      target_type: targetType,
      metadata,
      ip_address: ipAddress,
      created_at: new Date().toISOString(),
    };
    this.audit_logs.unshift(log);
    return log;
  }

  getAuditLogs(limit: number = 50, action?: AuditAction): AuditLog[] {
    let list = [...this.audit_logs];
    if (action) {
      list = list.filter((l) => l.action === action);
    }
    return list.slice(0, limit);
  }

  // ==========================================
  // INSTITUTIONAL TOKEN BUDGET MONITORING
  // ==========================================
  getTokenBudgetInfo(): TokenBudgetInfo {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startMs = startOfMonth.getTime();
    const endMs = endOfMonth.getTime();

    // Sum token usage for the current calendar month and calculate department breakdown
    let tokensUsedThisMonth = 0;
    const deptUsageMap = new Map<string, number>();

    for (let i = 0; i < this.usage_logs.length; i++) {
      const log = this.usage_logs[i];
      const time = new Date(log.created_at).getTime();
      if (time >= startMs && time <= endMs) {
        tokensUsedThisMonth += log.tokens_used || 0;
        const profile = this.profiles.find((p) => p.id === log.user_id);
        const deptId = profile?.department_id || "dept-1";
        deptUsageMap.set(deptId, (deptUsageMap.get(deptId) || 0) + (log.tokens_used || 0));
      }
    }

    const department_breakdown: DepartmentBudgetUsage[] = this.departments.map((d) => {
      const used = deptUsageMap.get(d.id) || 0;
      const percentage = tokensUsedThisMonth > 0 ? Math.round((used / tokensUsedThisMonth) * 100) : 0;
      return {
        department_id: d.id,
        department_name: d.name,
        tokens_used: used,
        percentage,
      };
    });

    const budget = this.institutional_monthly_token_budget;
    const usagePercentage = Math.round((tokensUsedThisMonth / budget) * 100);
    const remainingTokens = Math.max(0, budget - tokensUsedThisMonth);
    const isWarningThreshold = usagePercentage >= 80;
    const isBlocked = usagePercentage >= 100;

    return {
      college_name: "Shanti Business School (SBS)",
      monthly_budget_tokens: budget,
      tokens_used_this_month: tokensUsedThisMonth,
      remaining_tokens: remainingTokens,
      usage_percentage: usagePercentage,
      is_warning_threshold: isWarningThreshold,
      warning: isWarningThreshold,
      is_blocked: isBlocked,
      billing_cycle_start: startOfMonth.toISOString(),
      billing_cycle_end: endOfMonth.toISOString(),
      department_breakdown,
    };
  }

  setMonthlyTokenBudget(tokens: number) {
    this.institutional_monthly_token_budget = tokens;
  }

  // ==========================================
  // DASHBOARD TELEMETRY & WORKSPACE METHODS
  // ==========================================
  getDashboardTelemetry(): DashboardTelemetry {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).getTime();

    const casesCreatedThisMonth = this.cases.filter((c) => {
      const createdTime = new Date(c.created_at).getTime();
      return createdTime >= startOfMonth && createdTime <= endOfMonth;
    }).length;

    return {
      totalCases: this.cases.length,
      pendingApprovals: this.cases.filter((c) => c.status === "in_review" || c.status === "draft").length,
      activeFaculty: this.profiles.filter((p) => p.role === "faculty" && p.is_approved).length,
      activeStudents: this.profiles.filter((p) => p.role === "student" && p.is_approved).length,
      casesCreatedThisMonth,
    };
  }

  getPendingRegistrations(): (Profile & { department_name?: string })[] {
    return this.profiles
      .filter((p) => !p.is_approved)
      .map((p) => {
        const dept = this.departments.find((d) => d.id === p.department_id);
        return {
          ...p,
          department_name: dept?.name || "General Management",
        };
      });
  }

  approveRegistration(userId: string, adminId: string = "usr-admin-1"): Profile | null {
    const profile = this.profiles.find((p) => p.id === userId);
    if (!profile) return null;
    profile.is_approved = true;
    profile.updated_at = new Date().toISOString();

    const admin = this.profiles.find((p) => p.id === adminId);
    this.logAudit(
      adminId,
      admin?.email || "admin@shantibschool.edu.in",
      "registration_approved",
      profile.id,
      "user",
      { name: profile.name, email: profile.email, role: profile.role }
    );
    return profile;
  }

  rejectRegistration(userId: string, adminId: string = "usr-admin-1"): boolean {
    const idx = this.profiles.findIndex((p) => p.id === userId);
    if (idx === -1) return false;
    const profile = this.profiles[idx];
    const admin = this.profiles.find((p) => p.id === adminId);
    this.logAudit(
      adminId,
      admin?.email || "admin@shantibschool.edu.in",
      "registration_rejected",
      profile.id,
      "user",
      { name: profile.name, email: profile.email, role: profile.role }
    );
    this.profiles.splice(idx, 1);
    return true;
  }

  getRecentActivityFeed(limit: number = 8): RecentActivityItem[] {
    const activities: RecentActivityItem[] = [];

    for (const log of this.audit_logs) {
      const actor = this.profiles.find((p) => p.id === log.actor_id);
      const actorName = actor?.name || log.actor_email.split("@")[0];
      const actorRole = actor?.role || "faculty";

      if (log.action === "case_created") {
        activities.push({
          id: log.id,
          type: "case_created",
          title: log.metadata?.title || "New Case Dossier",
          actor_name: actorName,
          actor_role: actorRole,
          timestamp: log.created_at,
          case_id: log.target_id,
          details: `Created new ${log.metadata?.industry || "teaching"} case study`,
        });
      } else if (log.action === "case_submitted") {
        activities.push({
          id: log.id,
          type: "case_submitted",
          title: log.metadata?.title || "Curriculum Case",
          actor_name: actorName,
          actor_role: actorRole,
          timestamp: log.created_at,
          case_id: log.target_id,
          details: "Submitted case study for institutional peer review",
        });
      } else if (log.action === "case_approval") {
        activities.push({
          id: log.id,
          type: "case_approved",
          title: log.metadata?.title || "Case Study",
          actor_name: actorName,
          actor_role: actorRole,
          timestamp: log.created_at,
          case_id: log.target_id,
          details: "Approved case study for classroom simulation",
        });
      } else if (log.action === "case_published") {
        activities.push({
          id: log.id,
          type: "case_published",
          title: log.metadata?.title || "Case Study",
          actor_name: actorName,
          actor_role: actorRole,
          timestamp: log.created_at,
          case_id: log.target_id,
          details: "Officially published case study to Institutional Repository",
        });
      } else if (log.action === "registration_approved") {
        activities.push({
          id: log.id,
          type: "registration_approved",
          title: log.metadata?.name ? `${log.metadata.name} (${log.metadata.role})` : "New User Registration",
          actor_name: actorName,
          actor_role: actorRole,
          timestamp: log.created_at,
          details: `Approved institutional registration for ${log.metadata?.email || "new user"}`,
        });
      }
    }

    return activities.slice(0, limit);
  }

  // ==========================================
  // DPDP ACT 2023 DATA SUBJECT RIGHTS
  // ==========================================
  exportUserData(userId: string): Record<string, any> {
    const profile = this.getProfile(userId);
    const answers = this.answers.filter((a) => a.student_id === userId);
    const grades = this.grades.filter((g) => g.student_id === userId);
    const subscription = this.getUserSubscription(userId);
    const auditEntries = this.audit_logs.filter(
      (a) => a.actor_id === userId || a.target_id === userId
    );

    this.logAudit(
      userId,
      profile?.email || "user@shantibschool.edu.in",
      "data_export",
      userId,
      "data_subject",
      { export_type: "DPDP_Section_11_Machine_Readable_JSON" }
    );

    return {
      institution: "Shanti Business School (SBS)",
      compliance: "Digital Personal Data Protection (DPDP) Act 2023",
      exported_at: new Date().toISOString(),
      data_principal: profile,
      submissions: answers.map((a) => {
        const grade = grades.find((g) => g.answer_id === a.id);
        return {
          case_id: a.case_id,
          submission_id: a.id,
          text: a.text,
          status: a.status,
          submitted_at: a.submitted_at,
          grade: grade || null,
        };
      }),
      subscription: subscription || null,
      audit_records: auditEntries,
    };
  }

  deleteUserData(
    userId: string,
    actorId: string,
    actorEmail: string
  ): { success: boolean; error?: string } {
    const profile = this.getProfile(userId);
    if (!profile) return { success: false, error: "User not found" };

    // Record erasure in audit log before profile deletion
    this.logAudit(
      actorId,
      actorEmail,
      "data_erasure",
      userId,
      "data_subject",
      {
        reason: "DPDP_Section_12_Right_To_Erasure_Request",
        timestamp: new Date().toISOString(),
      }
    );

    // Delete personal answers
    this.answers = this.answers.filter((a) => a.student_id !== userId);
    // Delete personal grades
    this.grades = this.grades.filter((g) => g.student_id !== userId);
    // Delete subscriptions
    this.subscriptions = this.subscriptions.filter((s) => s.user_id !== userId);
    // Remove profile
    this.profiles = this.profiles.filter((p) => p.id !== userId);

    return { success: true };
  }
}

// Global singleton instance across Next.js dev server reloads
const globalForStore = globalThis as unknown as { __sbsCaseLabStore?: MockStore };
if (globalForStore.__sbsCaseLabStore) {
  Object.setPrototypeOf(globalForStore.__sbsCaseLabStore, MockStore.prototype);
  const s = globalForStore.__sbsCaseLabStore as any;
  if (!s.allowed_domains) s.allowed_domains = ["shantibschool.edu.in"];
  if (!s.platform_settings) {
    s.platform_settings = {
      external_free_limit: 3,
      sbs_fair_use_limit: 30,
      allowed_domains: ["shantibschool.edu.in"],
    };
  }
}
export const mockStore = globalForStore.__sbsCaseLabStore ?? new MockStore();
if (process.env.NODE_ENV !== "production") {
  globalForStore.__sbsCaseLabStore = mockStore;
}
