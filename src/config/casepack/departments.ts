/**
 * SBS CaseLab - CE Case Pack Department Profiles Configuration
 * 
 * Configures department-specific pedagogical rules, syllabus units,
 * analytical frameworks, case requirements, question/answer patterns,
 * quantitative flags, and deterministic validation rules for Finance, HR, and Marketing.
 * 
 * Editable by administrative curriculum directors.
 */

export interface TopicUnit {
  unit: number;
  title: string;
  topics: string[];
  quantitative?: boolean;
}

export interface ExamMetadataDefaults {
  course_code: string;
  ce_no: string;
  set: string;
  maximum_marks: number;
  marks_per_question: number;
  date?: string;
}

export interface DepartmentProfile {
  id: "finance" | "hr" | "marketing";
  name: string;
  code: string;
  units: TopicUnit[];
  frameworks: string[];
  case_requirements: string[];
  question_patterns: string[];
  answer_patterns: string[];
  quantitative: boolean;
  validators: string[];
  exam_metadata_defaults: ExamMetadataDefaults;
  /**
   * Evaluates whether a given topic within this department is quantitative
   */
  isQuantitativeTopic: (topic: string) => boolean;
}

export const FINANCE_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "finance",
  name: "Finance",
  code: "FIN",
  quantitative: true, // Quantitative for Financial Management topics, qualitative for Financial Services
  units: [
    {
      unit: 1,
      title: "Financial Services & Institutional Instruments",
      quantitative: false,
      topics: [
        "Factoring (Recourse vs. Non-Recourse)",
        "Forfaiting & Export Receivables Financing",
        "Leasing (Operating vs. Financial / Lease vs. Buy)",
        "Hire Purchase Financing & Asset Ownership",
        "Credit Rating Mechanisms & Sovereign/Corporate Methodologies",
        "Merchant Banking, Issue Management & Underwriting",
        "Venture Capital & Private Equity Structuring",
        "Mutual Funds & Asset Management Company Operations",
      ],
    },
    {
      unit: 2,
      title: "Financial Management & Capital Allocation",
      quantitative: true,
      topics: [
        "Capital Budgeting (NPV, IRR, Payback, Profitability Index)",
        "Working Capital Management & Operating Cycle Optimization",
        "Cost of Capital & Weighted Average Cost of Capital (WACC)",
        "Operating, Financial & Combined Leverage",
        "Capital Structure Decisions & EBIT-EPS Indifference",
        "Dividend Policies & Valuation Models (Walter, Gordon, MM)",
      ],
    },
  ],
  frameworks: [
    "Net Present Value (NPV)",
    "Internal Rate of Return (IRR)",
    "Payback Period & Discounted Payback",
    "Profitability Index (PI)",
    "Degree of Operating & Financial Leverage (DOL, DFL, DCL)",
    "Working Capital Operating Cycle",
    "EBIT-EPS Indifference Analysis",
    "Lease vs. Buy Decision Model",
    "Weighted Average Cost of Capital (WACC)",
    "Economic Order Quantity (EOQ) & Cash Budgeting",
  ],
  case_requirements: [
    "Indian enterprise context with realistic scale, sector headwinds, and regulatory compliance (RBI / SEBI).",
    "All financial figures clearly denominated in Indian Rupees (Crore / Lakh).",
    "At least one comprehensive financial data table (cash flow streams, balance sheet extract, cost of funds, or discount rates).",
    "Every financial instrument or concept must appear in an authentic managerial dilemma, clearly presenting both distinct advantages AND associated risks/costs (dilution, default risk, liquidity drag, high fees).",
  ],
  question_patterns: [
    "Q1 Analyze / Compare: Compare and evaluate the strategic and financial suitability of alternative financing instruments or structures under the protagonist's constraints.",
    "Q2 Evaluate / Justify: 'In your opinion, was the management's capital allocation or instrument selection appropriate given the company's risk profile? Justify with reference to case facts.'",
    "Quantitative Extension: Compute key investment or leverage metrics (NPV, WACC, DOL/DFL) and recommend the financially optimal pathway based on step-by-step calculations.",
  ],
  answer_patterns: [
    "Structured Introduction contextualizing the company's financial dilemma.",
    "Numbered analytical sections directly addressing each question.",
    "For each evaluated strategic alternative: explicit 'Evaluation' bullet points, dedicated 'Limitation' identification, and 'Overall' synthesis.",
    "Structured Comparison Table with columns: Basis of Comparison | Option A | Option B (at least 4 comparison dimensions for comparative questions).",
    "For quantitative calculations: Explicit Formula, Input Variables from Case, Step-by-Step Mathematical Working, Calculated Result with Units, and Clear Financial Decision Rule.",
    "Overall Assessment evaluating long-term balance sheet health and solvency.",
    "Executive Conclusion with practical risk mitigation recommendations.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "answer_structure",
    "case_facts_density",
    "consistent_terminology",
    "no_placeholders",
    "gold_overlap_threshold",
    "finance_data_table",
    "finance_quantitative_recalculation",
  ],
  exam_metadata_defaults: {
    course_code: "FIN-501",
    ce_no: "CE-3",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (topic: string): boolean => {
    const lower = topic.toLowerCase();
    return (
      lower.includes("capital budgeting") ||
      lower.includes("npv") ||
      lower.includes("irr") ||
      lower.includes("wacc") ||
      lower.includes("cost of capital") ||
      lower.includes("working capital") ||
      lower.includes("leverage") ||
      lower.includes("ebit") ||
      lower.includes("dividend") ||
      lower.includes("eoq")
    );
  },
};

export const HR_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "hr",
  name: "Human Resources",
  code: "HR",
  quantitative: false,
  units: [
    {
      unit: 1,
      title: "Strategic Talent Acquisition & Workforce Planning",
      quantitative: false,
      topics: [
        "Human Resource Planning (HRP) & Forecasting",
        "Strategic Recruitment & Modern Sourcing Channels",
        "Competency-Based Selection & Assessment Centers",
      ],
    },
    {
      unit: 2,
      title: "Learning, Development & Performance Engineering",
      quantitative: false,
      topics: [
        "Training Needs Analysis (TNA) & Organizational Capability",
        "Performance Appraisal Architectures (BARS, 360-Degree, MBO)",
        "Performance Management Systems & Continuous Feedback",
      ],
    },
    {
      unit: 3,
      title: "Rewards, Engagement & People Analytics",
      quantitative: false,
      topics: [
        "Total Rewards & Compensation Structuring",
        "Employee Retention & Engagement Architecture",
        "Workforce Analytics & People Metric Dashboards",
      ],
    },
    {
      unit: 4,
      title: "Industrial Relations, Culture & Organizational Health",
      quantitative: false,
      topics: [
        "Industrial Relations & Collective Bargaining",
        "Diversity, Equity & Inclusion (DEI) Integration",
        "Talent Management, Succession Planning & Leadership Development",
      ],
    },
  ],
  frameworks: [
    "Maslow's Hierarchy of Human Needs",
    "Herzberg's Two-Factor (Motivation-Hygiene) Theory",
    "McGregor's Theory X and Theory Y Leadership Model",
    "Employee Life Cycle (ELC) Framework",
    "Performance Appraisal Methodologies (BARS, 360-Degree, MBO)",
    "Kirkpatrick's Four-Level Training Evaluation Model",
    "Ulrich's HR Business Partner (HRBP) Operating Model",
    "Hackman & Oldham's Job Characteristics Model",
  ],
  case_requirements: [
    "Identifiable named managerial stakeholders (Founder/CEO, CHRO / Head of HR, Departmental Line Managers, Employee Representatives).",
    "At least one illustrative HR metrics table (headcount trend, attrition % by department, cost per hire, employee engagement score / eNPS).",
    "A clear interpersonal, cultural, or structural workplace conflict with competing interests among stakeholders.",
    "Realistic policy or programmatic options actively weighed prior to managerial execution.",
  ],
  question_patterns: [
    "Diagnose the underlying behavioral and organizational root causes driving attrition, morale deficits, or appraisal breakdowns.",
    "Recommend actionable retention, performance appraisal, or talent development improvements grounded in named HR theories.",
    "Identify the evaluation or recruitment methodology applied, detailing its operational strengths and systemic weaknesses.",
    "Critically evaluate proposed HR policy interventions and forecast their long-term impact on culture and employer brand.",
  ],
  answer_patterns: [
    "Executive Introduction characterizing the organizational culture and people challenges.",
    "Thematic breakdown grouping root causes into distinct structural, leadership, and motivational vectors.",
    "Theoretical analysis systematically applying named models (e.g., Herzberg's Hygiene vs. Motivator factors, McGregor's management assumptions).",
    "Structured Strengths vs. Weaknesses comparison table for evaluated policies.",
    "Pragmatic phased recommendation roadmap with clear operational milestones and change management tactics.",
    "Overall Assessment detailing stakeholder alignment and risk mitigation.",
    "Executive Conclusion emphasizing sustainable cultural vitality.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "answer_structure",
    "case_facts_density",
    "consistent_terminology",
    "no_placeholders",
    "gold_overlap_threshold",
    "hr_metrics_table",
    "hr_named_stakeholders",
  ],
  exam_metadata_defaults: {
    course_code: "HRM-502",
    ce_no: "CE-3",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (_topic: string): boolean => false,
};

export const MARKETING_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "marketing",
  name: "Marketing",
  code: "MKTG",
  quantitative: false,
  units: [
    {
      unit: 1,
      title: "Market Environment & Consumer Intelligence",
      quantitative: false,
      topics: [
        "Marketing Environment Analysis & Competitive SWOT",
        "Consumer Decision-Making Journey & Buyer Psychology",
        "Marketing Research Methodologies & Consumer Insights",
      ],
    },
    {
      unit: 2,
      title: "Strategic Marketing Foundation (STP)",
      quantitative: false,
      topics: [
        "Market Segmentation (Demographic, Psychographic, Behavioral)",
        "Target Market Selection & Segment Prioritization",
        "Brand Positioning & Value Proposition Design",
      ],
    },
    {
      unit: 3,
      title: "Tactical Marketing Mix: Product & Pricing",
      quantitative: false,
      topics: [
        "Product Strategy, Line Extensions & Brand Architecture",
        "New Product Development (NPD) & Product Life Cycle (PLC)",
        "Strategic Pricing Frameworks (Skimming, Penetration, Value-Based)",
      ],
    },
    {
      unit: 4,
      title: "Go-to-Market Channels, Promotion & Services",
      quantitative: false,
      topics: [
        "Omnichannel Distribution & Trade Channel Management",
        "Integrated Marketing Communications (IMC) & Promotion Mix",
        "Digital Marketing, Performance Ads & Social Media Strategy",
        "Services Marketing & The Extended 7Ps Framework",
      ],
    },
  ],
  frameworks: [
    "Segmentation, Targeting, and Positioning (STP)",
    "The 4Ps (Product, Price, Place, Promotion) and Extended 7Ps Framework",
    "Product Life Cycle (PLC) Stages & Strategic Transitions",
    "Ansoff Growth Matrix (Market Penetration, Market Development, Diversification)",
    "BCG Growth-Share Matrix (Stars, Cash Cows, Question Marks, Dogs)",
    "Customer-Based Brand Equity (CBBE) Pyramid",
    "Standardized Positioning Statement Template: 'For [target segment], [brand] offers [value proposition] because [reason to believe]'",
    "Customer Journey Mapping & AIDA / Funnel Conversion Model",
  ],
  case_requirements: [
    "Fictional consumer brand, B2B provider, or fast-growing startup competing in Indian urban or tier-2/3 markets.",
    "At least one comprehensive market data table (market share %, customer segment demographics, price points across competitors, channel distribution split).",
    "A clear, high-stakes commercial decision point (new product launch, repositioning, direct-to-consumer pivot, pricing discount dilemma, or campaign rollout).",
  ],
  question_patterns: [
    "Design and justify an integrated marketing mix (4Ps / 7Ps) specifically tailored to the target segment's behavior.",
    "Formulate an STP strategy and compose an exact positioning statement following the institutional template.",
    "Critically evaluate a proposed pricing or distribution channel decision in the face of aggressive competitor counter-actions.",
  ],
  answer_patterns: [
    "Strategic Introduction analyzing market opportunity, customer pain points, and competitive threats.",
    "Comprehensive STP & Situation Diagnosis identifying addressable segments.",
    "Structured Marketing Mix Table (Marketing Element | Strategic Decision | Commercial Justification).",
    "Formal Positioning Statement strictly following the canonical template: 'For [target segment], [brand] offers [value proposition] because [reason to believe]'.",
    "Implementation Vulnerabilities & Competitive Counter-Strategy Analysis.",
    "Executive Conclusion outlining 12-month commercial milestones.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "answer_structure",
    "case_facts_density",
    "consistent_terminology",
    "no_placeholders",
    "gold_overlap_threshold",
    "marketing_data_table",
    "marketing_positioning_template",
  ],
  exam_metadata_defaults: {
    course_code: "MKT-501",
    ce_no: "CE-3",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (_topic: string): boolean => false,
};

export const DEPARTMENT_PROFILES: Record<"finance" | "hr" | "marketing", DepartmentProfile> = {
  finance: FINANCE_DEPARTMENT_PROFILE,
  hr: HR_DEPARTMENT_PROFILE,
  marketing: MARKETING_DEPARTMENT_PROFILE,
};

export function getDepartmentProfile(departmentId: string): DepartmentProfile {
  const normalized = departmentId.toLowerCase().trim() as "finance" | "hr" | "marketing";
  return DEPARTMENT_PROFILES[normalized] || FINANCE_DEPARTMENT_PROFILE;
}

export function getAllDepartmentProfiles(): DepartmentProfile[] {
  return [FINANCE_DEPARTMENT_PROFILE, HR_DEPARTMENT_PROFILE, MARKETING_DEPARTMENT_PROFILE];
}
