/**
 * SBS CaseLab - CE Case Pack Department Profiles Configuration
 * 
 * Configures department-specific pedagogical rules, syllabus units,
 * analytical frameworks, case requirements, question/answer patterns,
 * quantitative flags, and deterministic validation rules for Finance, HR, and Marketing.
 * 
 * Editable by administrative curriculum directors.
 */

import { getDomainByName } from "@/config/domains";

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
  id: string;
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

export const IT_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "it",
  name: "IT",
  code: "IT",
  quantitative: true,
  units: [
    {
      unit: 1,
      title: "Cloud Infrastructure, Migration & 6Rs Framework",
      quantitative: true,
      topics: [
        "Cloud Migration Strategy (Rehost, Replatform, Refactor, Repurchase, Retire, Retain)",
        "Total Cost of Ownership (TCO) & Cloud ROI Modeling",
        "Public vs Private vs Hybrid Multi-Cloud Architecture",
      ],
    },
    {
      unit: 2,
      title: "Enterprise Cybersecurity & Zero Trust Architecture",
      quantitative: false,
      topics: [
        "NIST Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover)",
        "Zero Trust Architecture & Identity Access Management (IAM)",
        "Ransomware Incident Response & Disaster Recovery RPO/RTO",
      ],
    },
    {
      unit: 3,
      title: "Legacy Modernization & Technical Debt Management",
      quantitative: true,
      topics: [
        "Monolithic vs Microservices Decoupling (Strangler Fig Pattern)",
        "Technical Debt Interest & Maintenance Overhead Index",
        "API Gateway, Service Mesh & Event-Driven Architecture",
      ],
    },
    {
      unit: 4,
      title: "Data Engineering, MLOps & System Reliability",
      quantitative: true,
      topics: [
        "High-Availability Uptime SLAs (99.9% vs 99.99%) & Outage Downtime Cost",
        "Data Lakehouse & Streaming Pipeline Governance",
        "DevOps / SRE Practices & DORA Delivery Metrics",
      ],
    },
  ],
  frameworks: [
    "AWS / Gartner Cloud 6Rs Migration Framework",
    "NIST Cybersecurity Framework (CSF v2.0)",
    "Zero Trust Security Maturity Model",
    "Strangler Fig Legacy Modernization Pattern",
    "CAP Theorem & Distributed Data Consistency",
    "DORA Metrics (Deployment Frequency, Lead Time, Change Fail Rate, MTTR)",
    "RPO (Recovery Point Objective) & RTO (Recovery Time Objective) Matrix",
  ],
  case_requirements: [
    "Enterprise IT dilemma set in an Indian banking, telecom, or SaaS organization.",
    "Technical exhibit table with system metrics: legacy maintenance costs, cloud runaway spend, downtime hours, SLA penalties.",
    "Clear architectural crossroad: lift-and-shift vs native cloud refactor vs private data center modernization.",
  ],
  question_patterns: [
    "Evaluate the proposed cloud migration strategy using the 6Rs framework and compute the 3-year TCO differential.",
    "Formulate a zero-trust incident response roadmap to address high-severity vulnerability disclosures.",
    "Analyze the operational risks of migrating from a legacy monolithic core to containerized microservices.",
  ],
  answer_patterns: [
    "Executive IT Problem Diagnosis detailing technical debt and system bottlenecks.",
    "Architecture Trade-Off Analysis evaluating performance, security, and cost.",
    "Structured Cloud / Infrastructure Comparison Table.",
    "Risk Mitigation Roadmap including rollback procedures and SLA governance.",
    "Executive Conclusion with 18-month technology milestones.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "no_placeholders",
  ],
  exam_metadata_defaults: {
    course_code: "IT-501",
    ce_no: "CE-2",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (topic: string): boolean => {
    const lower = topic.toLowerCase();
    return lower.includes("tco") || lower.includes("cost") || lower.includes("sla") || lower.includes("uptime") || lower.includes("rpo") || lower.includes("rto") || lower.includes("roi");
  },
};

export const SUPPLY_CHAIN_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "supply-chain",
  name: "Supply Chain",
  code: "SCM",
  quantitative: true,
  units: [
    {
      unit: 1,
      title: "Strategic Sourcing & Kraljic Portfolio Management",
      quantitative: true,
      topics: [
        "Kraljic Matrix (Strategic, Bottleneck, Leverage, Non-Critical Items)",
        "Total Cost of Ownership (TCO) in Global Sourcing",
        "Supplier Relationship Management & Single vs Dual Sourcing",
      ],
    },
    {
      unit: 2,
      title: "Inventory Optimization & Demand Planning",
      quantitative: true,
      topics: [
        "Economic Order Quantity (EOQ) & Quantity Discounts",
        "Safety Stock & Service Level Reorder Point (ROP)",
        "Bullwhip Effect Causes & Upstream Demand Distortion",
      ],
    },
    {
      unit: 3,
      title: "Logistics Networks & Fulfillment Architecture",
      quantitative: true,
      topics: [
        "Hub-and-Spoke vs Direct Point-to-Point Distribution",
        "Cold Chain Logistics & Temperature Excursion Monitoring",
        "Warehouse Automation & Automated Storage and Retrieval (ASRS)",
      ],
    },
    {
      unit: 4,
      title: "Supply Chain Resilience & Risk Governance",
      quantitative: false,
      topics: [
        "Supply Chain Geopolitical Disruptions & Nearshoring",
        "On-Time In-Full (OTIF) Delivery & Fulfillment Scorecards",
        "Circular Supply Chains & Reverse Logistics Economics",
      ],
    },
  ],
  frameworks: [
    "Kraljic Portfolio Purchasing Matrix",
    "SCOR (Supply Chain Operations Reference) Model",
    "Economic Order Quantity (EOQ) & Reorder Point (ROP)",
    "Bullwhip Effect Counter-Distortion Strategy",
    "On-Time In-Full (OTIF) Metric & Fill Rate Scorecard",
    "ABC-XYZ Inventory Segmentation Analysis",
    "Days of Sales Inventory (DOS) & Working Capital Cycle",
  ],
  case_requirements: [
    "Real-world supply chain dilemma set in Indian manufacturing, FMCG, retail, or automotive logistics.",
    "At least one comprehensive supply chain exhibit: lead times, freight tariffs, inventory holding costs, stockouts, OTIF %.",
    "Operational conflict between inventory holding costs (CFO) vs order fill rates (VP Sales) vs factory run rates (COO).",
  ],
  question_patterns: [
    "Diagnose the root causes of upstream demand amplification using the Bullwhip Effect framework.",
    "Compute optimal safety stock and reorder point given lead-time variability and targeted 98% service level.",
    "Formulate a dual-sourcing procurement strategy using the Kraljic Matrix to mitigate supplier dependency.",
  ],
  answer_patterns: [
    "Supply Chain Diagnostic identifying delivery bottlenecks and inventory carrying costs.",
    "Quantitative Reorder Point & EOQ Mathematical Working.",
    "Procurement Strategy Comparison across supplier tiers.",
    "Logistics Network Realignment Roadmap with warehouse hub layout.",
    "Executive Conclusion with OTIF performance milestones.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "no_placeholders",
  ],
  exam_metadata_defaults: {
    course_code: "SCM-501",
    ce_no: "CE-2",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (topic: string): boolean => {
    const lower = topic.toLowerCase();
    return lower.includes("eoq") || lower.includes("safety stock") || lower.includes("reorder") || lower.includes("inventory") || lower.includes("otif") || lower.includes("cost") || lower.includes("tco");
  },
};

export const STRATEGY_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "strategy",
  name: "Strategy",
  code: "STR",
  quantitative: false,
  units: [
    {
      unit: 1,
      title: "Industry Structure & Macro-Environment",
      quantitative: false,
      topics: [
        "Porter's Five Forces Industry Attractiveness Analysis",
        "PESTLE Structural Macro-Environmental Scanning",
        "Strategic Group Mapping & Competitor Trajectory",
      ],
    },
    {
      unit: 2,
      title: "Internal Resources, Core Competencies & Moats",
      quantitative: false,
      topics: [
        "Barney's VRIO Capability & Sustainable Competitive Advantage",
        "Porter's Value Chain Primary & Support Activities",
        "Dynamic Capabilities & Organizational Agility",
      ],
    },
    {
      unit: 3,
      title: "Corporate Growth Strategies & Diversification",
      quantitative: false,
      topics: [
        "Ansoff Product-Market Growth Matrix",
        "BCG Portfolio Growth-Share Matrix (Stars, Cows, Dogs, Questions)",
        "Vertical Integration vs Strategic Outsourcing",
      ],
    },
    {
      unit: 4,
      title: "Business Model Innovation & Strategic Alliances",
      quantitative: false,
      topics: [
        "Blue Ocean Strategy & Four Actions ERRC Grid",
        "Mergers & Acquisitions Synergy Realization & Due Diligence",
        "Platform Ecosystems & Two-Sided Network Effects",
      ],
    },
  ],
  frameworks: [
    "Porter's Five Forces Industry Analysis",
    "Barney's VRIO Framework (Valuable, Rare, Inimitable, Organized)",
    "Blue Ocean Strategy (Value Innovation & ERRC Grid)",
    "Ansoff Growth Matrix",
    "BCG Growth-Share Matrix",
    "Porter's Generic Strategies (Cost Leadership, Differentiation, Focus)",
    "Post-Merger Integration & Synergy Valuation Scorecard",
  ],
  case_requirements: [
    "High-stakes boardroom strategy case set in an Indian conglomerate, unicorn startup, or transforming incumbent.",
    "Rich strategic exhibit: market share concentration, competitor margin benchmarking, strategic group coordinates.",
    "Three mutually exclusive strategic paths requiring rigorous qualitative and commercial trade-off analysis.",
  ],
  question_patterns: [
    "Conduct a comprehensive VRIO audit of the company's internal capabilities to identify defensible competitive moats.",
    "Using Porter's Five Forces, evaluate whether the proposed industry pivot improves long-term economic returns.",
    "Formulate an ERRC (Eliminate, Reduce, Raise, Create) grid to unlock an uncontested Blue Ocean market space.",
  ],
  answer_patterns: [
    "Executive Strategic Problem Diagnosis framing the boardroom inflection point.",
    "Detailed Framework Application (VRIO / Porter / Blue Ocean).",
    "Structured Strategic Alternatives Trade-Off Table.",
    "Governance & Organizational Change Management Protocol.",
    "Executive Conclusion with 3-year phased strategic milestones.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "no_placeholders",
  ],
  exam_metadata_defaults: {
    course_code: "STR-501",
    ce_no: "CE-1",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (_topic: string): boolean => false,
};

export const ANALYTICS_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "analytics",
  name: "Analytics",
  code: "ANA",
  quantitative: true,
  units: [
    {
      unit: 1,
      title: "Business Intelligence & Executive Telemetry",
      quantitative: true,
      topics: [
        "Executive KPI Dashboard Architecture & Metrics Hierarchy",
        "Descriptive vs Diagnostic Telemetry Analytics",
        "Data Quality Profiling & Missingness Remediation",
      ],
    },
    {
      unit: 2,
      title: "Predictive Analytics & Statistical Modeling",
      quantitative: true,
      topics: [
        "Hypothesis Testing, p-values & Statistical Significance",
        "Linear & Logistic Regression for Managerial Decisions",
        "Time-Series Forecasting & Seasonality Deconstruction",
      ],
    },
    {
      unit: 3,
      title: "Machine Learning & Customer Intelligence",
      quantitative: true,
      topics: [
        "Confusion Matrix Evaluation (Precision, Recall, F1, ROC-AUC)",
        "Customer Churn Propensity & Hazard Rate Modeling",
        "Customer Lifetime Value (CLV) Cohort Progression",
      ],
    },
    {
      unit: 4,
      title: "A/B Testing, Experimentation & MLOps",
      quantitative: true,
      topics: [
        "Randomized Controlled Trials & A/B Sample Sizing",
        "Type I (Alpha) vs Type II (Beta) Decision Errors",
        "Model Drift, Data Drift & Automated Retraining Governance",
      ],
    },
  ],
  frameworks: [
    "CRISP-DM (Cross-Industry Standard Process for Data Mining)",
    "Confusion Matrix (Precision, Recall, Specificity, F1-Score, ROC-AUC)",
    "A/B Testing Statistical Hypothesis Testing Framework",
    "Customer Lifetime Value (CLV) & Churn Hazard Model",
    "Marketing Attribution Multi-Touch Modeling",
    "Pareto 80/20 Customer Value Segmentation",
  ],
  case_requirements: [
    "Data-driven enterprise dilemma set in Indian fintech, quick-commerce, digital banking, or healthtech.",
    "At least one comprehensive statistical/analytical exhibit: confusion matrix metrics, p-values, churn rates, CLV tables.",
    "Trade-off between algorithmic automation vs human review, model false-positives vs false-negatives.",
  ],
  question_patterns: [
    "Interpret the confusion matrix in Exhibit 2 and calculate the business cost of False Positives vs False Negatives.",
    "Formulate an A/B testing experiment to validate a new recommendation algorithm without cannibalizing gross margins.",
    "Using CRISP-DM methodology, evaluate why the initial predictive model failed to maintain out-of-sample accuracy.",
  ],
  answer_patterns: [
    "Executive Analytical Diagnosis distinguishing statistical correlation from causation.",
    "Step-by-Step Mathematical Calculations (Precision, Recall, p-value interpretation).",
    "Decision Threshold Trade-Off Analysis evaluating dollar impact of classification errors.",
    "Data Governance & Model Monitoring Protocol.",
    "Executive Conclusion with data platform implementation milestones.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "no_placeholders",
  ],
  exam_metadata_defaults: {
    course_code: "ANA-501",
    ce_no: "CE-2",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (topic: string): boolean => {
    const lower = topic.toLowerCase();
    return lower.includes("predictive") || lower.includes("regression") || lower.includes("testing") || lower.includes("clv") || lower.includes("churn") || lower.includes("matrix") || lower.includes("statistic");
  },
};

export const OPERATIONS_DEPARTMENT_PROFILE: DepartmentProfile = {
  id: "operations",
  name: "Operations",
  code: "OPS",
  quantitative: true,
  units: [
    {
      unit: 1,
      title: "Process Capacity & Theory of Constraints",
      quantitative: true,
      topics: [
        "Process Flow Mapping & Cycle Time vs Takt Time",
        "Bottleneck Identification & Theory of Constraints (Drum-Buffer-Rope)",
        "Little's Law (WIP = Throughput x Cycle Time) Application",
      ],
    },
    {
      unit: 2,
      title: "Lean Operations, Waste Elimination & SMED",
      quantitative: true,
      topics: [
        "The 7 Wastes of Lean (Muda) & Value Stream Mapping (VSM)",
        "Single-Minute Exchange of Die (SMED) Setup Time Reduction",
        "5S Workplace Organization & Visual Factory Governance",
      ],
    },
    {
      unit: 3,
      title: "Quality Management, Six Sigma & DMAIC",
      quantitative: true,
      topics: [
        "DMAIC Six Sigma Methodology (Define, Measure, Analyze, Improve, Control)",
        "Statistical Process Control (SPC) & Process Capability (Cp, Cpk)",
        "Ishikawa Fishbone Root Cause Diagram & Pareto Defect Analysis",
      ],
    },
    {
      unit: 4,
      title: "Asset Maintenance & Equipment Effectiveness (OEE)",
      quantitative: true,
      topics: [
        "Overall Equipment Effectiveness (OEE = Availability x Performance x Quality)",
        "Total Productive Maintenance (TPM) Autonomous Maintenance Pillars",
        "Cellular Manufacturing vs Functional Line Layout Optimization",
      ],
    },
  ],
  frameworks: [
    "Overall Equipment Effectiveness (OEE) Decomposition",
    "Theory of Constraints (TOC) & Drum-Buffer-Rope Bottleneck Scheduling",
    "Single-Minute Exchange of Die (SMED) Internal vs External Setup",
    "DMAIC Six Sigma Continuous Improvement Roadmap",
    "Little's Law & Work-in-Progress (WIP) Optimization",
    "Ishikawa Cause-and-Effect & Pareto Defect Prioritization",
    "Statistical Process Control (SPC) X-bar & R Charts",
  ],
  case_requirements: [
    "Shop-floor operations dilemma set in an Indian manufacturing plant, assembly unit, or high-volume service center.",
    "Detailed operational exhibit table: machine availability %, scrap defect rates, changeover minutes, OEE by line.",
    "Conflicting managerial priorities: high product variety (Sales) vs long uninterrupted runs (COO) vs scrap elimination (Quality).",
  ],
  question_patterns: [
    "Deconstruct plant OEE into Availability, Performance, and Quality, and identify the primary defect bottleneck.",
    "Apply SMED principles to separate internal vs external changeover activities and cut line downtime by 50%.",
    "Design a DMAIC roadmap with concrete statistical tollgates to eliminate critical assembly variances.",
  ],
  answer_patterns: [
    "Operations Diagnostic identifying throughput bottlenecks and cycle time variance.",
    "Quantitative OEE and Little's Law Step-by-Step Calculations.",
    "Lean / SMED Implementation Work Instructions Table.",
    "Quality Control Charter and SPC Monitoring Protocol.",
    "Executive Conclusion with 180-day operational turnaround milestones.",
  ],
  validators: [
    "schema_valid",
    "word_count_bounds",
    "concept_coverage",
    "bloom_verbs",
    "no_placeholders",
  ],
  exam_metadata_defaults: {
    course_code: "OPS-501",
    ce_no: "CE-2",
    set: "A",
    maximum_marks: 40,
    marks_per_question: 20,
    date: "Fall 2026",
  },
  isQuantitativeTopic: (topic: string): boolean => {
    const lower = topic.toLowerCase();
    return lower.includes("oee") || lower.includes("capacity") || lower.includes("takt") || lower.includes("cycle") || lower.includes("smed") || lower.includes("dmaic") || lower.includes("spc") || lower.includes("little");
  },
};

export const DEPARTMENT_PROFILES: Record<
  "finance" | "hr" | "marketing" | "it" | "supply-chain" | "strategy" | "analytics" | "operations",
  DepartmentProfile
> = {
  finance: FINANCE_DEPARTMENT_PROFILE,
  hr: HR_DEPARTMENT_PROFILE,
  marketing: MARKETING_DEPARTMENT_PROFILE,
  it: IT_DEPARTMENT_PROFILE,
  "supply-chain": SUPPLY_CHAIN_DEPARTMENT_PROFILE,
  strategy: STRATEGY_DEPARTMENT_PROFILE,
  analytics: ANALYTICS_DEPARTMENT_PROFILE,
  operations: OPERATIONS_DEPARTMENT_PROFILE,
};

/**
 * Creates a generic department profile for non-core domains (IT, Supply Chain, Strategy, Analytics, Operations)
 * using the domain name and its configured curricular topics.
 */
export function createGenericDomainProfile(domainNameOrId: string, customTopics?: string[]): DepartmentProfile {
  const dConfig = getDomainByName(domainNameOrId);
  const domainName = dConfig?.name || domainNameOrId;
  const isQuantitative = ["analytics", "operations", "supply chain", "supply-chain"].includes(
    domainNameOrId.toLowerCase().trim()
  );

  const units: TopicUnit[] = dConfig?.units.map((u) => ({
    unit: u.unit,
    title: u.title,
    topics: u.topics,
    quantitative: isQuantitative,
  })) || [
    {
      unit: 1,
      title: `${domainName} Curricular Foundation`,
      topics: customTopics && customTopics.length > 0 ? customTopics : ["Strategic Assessment", "Process Optimization"],
      quantitative: isQuantitative,
    },
  ];

  const code = (domainName.replace(/[^a-zA-Z]/g, "").slice(0, 3) || "GEN").toUpperCase();

  return {
    id: dConfig?.id || domainNameOrId.toLowerCase().replace(/\s+/g, "-"),
    name: domainName,
    code,
    quantitative: isQuantitative,
    units,
    frameworks: [
      `${domainName} Decision Framework & Operational Diagnosis`,
      "Root Cause Analysis & Stakeholder Impact Modeling",
      "Strategic Risk Management & Resource Allocation",
      "Implementation Roadmap & Governance Architecture",
    ],
    case_requirements: [
      `Real-world managerial dilemma set in Indian/global industry context focusing on ${domainName}.`,
      "Empirical operational data, operational timeline, and clear organizational friction.",
      "Clear decision crossroads requiring executive trade-off evaluation.",
    ],
    question_patterns: [
      `Diagnose the core strategic breakdown facing the enterprise in its ${domainName} domain.`,
      "Formulate two mutually exclusive action roadmaps and justify the recommended trajectory.",
    ],
    answer_patterns: [
      "Executive Problem Diagnosis & Root Cause Identification.",
      "Methodological Analysis using domain concepts.",
      "Strategic Recommendations with implementation timeline.",
    ],
    validators: [
      "schema_valid",
      "word_count_bounds",
      "concept_coverage",
      "bloom_verbs",
      "no_placeholders",
    ],
    exam_metadata_defaults: {
      course_code: `${code}-501`,
      ce_no: "CE-1",
      set: "A",
      maximum_marks: 40,
      marks_per_question: 20,
      date: "Fall 2026",
    },
    isQuantitativeTopic: (_topic: string): boolean => isQuantitative,
  };
}

export function getDepartmentProfile(departmentId: string, customTopics?: string[]): DepartmentProfile {
  const normalized = departmentId.toLowerCase().trim().replace(/\s+/g, "-");
  if (normalized === "finance") return FINANCE_DEPARTMENT_PROFILE;
  if (normalized === "hr" || normalized === "human-resources") return HR_DEPARTMENT_PROFILE;
  if (normalized === "marketing") return MARKETING_DEPARTMENT_PROFILE;
  if (normalized === "it" || normalized === "information-technology") return IT_DEPARTMENT_PROFILE;
  if (normalized === "supply-chain" || normalized === "supplychain" || normalized === "logistics") return SUPPLY_CHAIN_DEPARTMENT_PROFILE;
  if (normalized === "strategy") return STRATEGY_DEPARTMENT_PROFILE;
  if (normalized === "analytics" || normalized === "business-analytics") return ANALYTICS_DEPARTMENT_PROFILE;
  if (normalized === "operations" || normalized === "production") return OPERATIONS_DEPARTMENT_PROFILE;

  // Fallback to generic domain profile if custom or unknown
  return createGenericDomainProfile(departmentId, customTopics);
}

export function getAllDepartmentProfiles(): DepartmentProfile[] {
  return [
    FINANCE_DEPARTMENT_PROFILE,
    MARKETING_DEPARTMENT_PROFILE,
    HR_DEPARTMENT_PROFILE,
    IT_DEPARTMENT_PROFILE,
    SUPPLY_CHAIN_DEPARTMENT_PROFILE,
    STRATEGY_DEPARTMENT_PROFILE,
    ANALYTICS_DEPARTMENT_PROFILE,
    OPERATIONS_DEPARTMENT_PROFILE,
  ];
}
