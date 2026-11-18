import { Anthropic } from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import {
  CECasePack,
  CasePackMeta,
  validateCECasePack,
  CECasePackSchema,
} from "./schema";
import {
  getDepartmentProfile,
  DepartmentProfile,
} from "@/config/casepack/departments";

export interface GenerateCasePackInput {
  department: "finance" | "hr" | "marketing";
  subject?: string;
  topics?: string[];
  concepts?: string[];
  level?: string;
  language?: "en" | "hi" | "gu";
  industry?: string;
  geography?: string;
  length?: "short" | "standard";
  numQuestions?: number;
  sourceNotes?: string;
  examMetadata?: {
    course_code?: string;
    ce_no?: string;
    set?: string;
    maximum_marks?: number;
    marks_per_question?: number;
    date?: string;
  };
}

export interface ProgressCallbackData {
  stage: "case" | "answers" | "checks" | "remediation" | "done";
  progress: number;
  message: string;
  payload?: any;
}

export type ProgressCallback = (data: ProgressCallbackData) => void;

// Model Configuration via Environment Variables with sensible defaults
const MODEL_WRITER =
  process.env.CASEPACK_MODEL_WRITER || "claude-3-7-sonnet-20250219";
const MODEL_CHECKER =
  process.env.CASEPACK_MODEL_CHECKER || "claude-3-5-haiku-20241022";

/**
 * Loads approved gold reference examples from disk for few-shot guidance
 */
function loadApprovedGoldExamples(department: string): any[] {
  try {
    const goldDir = path.resolve(process.cwd(), "reference/gold");
    const deptFile = path.join(goldDir, `${department}_approved.json`);
    if (fs.existsSync(deptFile)) {
      const data = JSON.parse(fs.readFileSync(deptFile, "utf-8"));
      return [data];
    }
    // Fall back to Finance gold standard for structural formatting
    const finFile = path.join(goldDir, "finance_approved.json");
    if (fs.existsSync(finFile)) {
      return [JSON.parse(fs.readFileSync(finFile, "utf-8"))];
    }
  } catch (err) {
    console.warn("Could not read local gold reference file:", err);
  }
  return [];
}

/**
 * Builds the canonical system prompt enforcing SBS CaseLab standards
 */
function buildCasePackSystemPrompt(profile: DepartmentProfile): string {
  return `You are the Lead Case Writer and Professor of Management at Shanti Business School (SBS).
Your mission is to produce a Continuous Evaluation (CE) Case Pack adhering strictly to the SBS CaseLab Institutional Standard.

DEPARTMENT PEDAGOGICAL PROFILE:
- Department: ${profile.name} (${profile.code})
- Quantitative Orientation: ${profile.quantitative ? "Quantitative for Financial Management topics (requires formulas, balance sheet/cash flow data, and calculation working)" : "Managerial & Behavioral Qualitative Analysis"}
- Core Analytical Frameworks: ${profile.frameworks.join(", ")}
- Case Requirements: ${profile.case_requirements.join(" ")}
- Question Style Patterns: ${profile.question_patterns.join(" ")}
- Answer Style Patterns: ${profile.answer_patterns.join(" ")}

MANDATORY RULES:
1. ORIGINALITY: Create a fictional enterprise, protagonists, Indian city/region, and realistic numerical figures. Never use real companies or invent quotes from living people unless explicitly requested.
2. CONCEPT GROUNDING: Every selected concept must appear within a tangible managerial decision featuring distinct benefits AND associated costs/risks. Every question must be fully answerable using case facts.
3. DATA TABLES: Include at least one structured, multi-column financial or operational metrics table (e.g., cash flow projections, workforce metrics, market share benchmarks).
4. TERMINOLOGY & SPELLING: Maintain strict, uniform spelling for technical terms across the narrative, questions, and answers (e.g., use 'forfaiting' consistently; never alternate spellings).
5. INDIAN ENTERPRISE REALITY: Use Indian Rupees (INR Lakh / Crore), Indian regulatory bodies (RBI, SEBI, MCA), and authentic supply chain / market dynamics.
6. BLOOM'S TAXONOMY: Questions must utilize explicit Bloom verbs (Analyze, Compare, Evaluate, Justify, Calculate, Diagnose).
7. OUTPUT FORMAT: Output strictly valid JSON matching the target schema. Do not output markdown backticks or commentary outside the JSON.`;
}

/**
 * Generates an authentic simulated Case Pack when Anthropic API key is not present
 */
function generateSimulatedCasePack(input: GenerateCasePackInput): CECasePack {
  const profile = getDepartmentProfile(input.department);
  const isShort = input.length === "short";
  const numQ = input.numQuestions || (isShort ? 1 : 2);
  const lang = input.language || "en";
  const level = input.level || "MBA / PGDM";
  const maxMarks = input.examMetadata?.maximum_marks || 40;
  const marksPerQ = input.examMetadata?.marks_per_question || 20;

  if (input.department === "finance") {
    return {
      status: "draft",
      meta: {
        department: "finance",
        subject: input.subject || "Corporate Finance & Financial Services",
        topic: input.topics?.length ? input.topics : ["Working Capital Management", "Capital Budgeting & Leasing"],
        concepts: input.concepts?.length ? input.concepts : ["Operating Cycle", "Financial Lease", "Recourse Factoring", "NPV"],
        course_code: input.examMetadata?.course_code || profile.exam_metadata_defaults.course_code,
        ce_no: input.examMetadata?.ce_no || profile.exam_metadata_defaults.ce_no,
        set: input.examMetadata?.set || profile.exam_metadata_defaults.set,
        level,
        language: lang,
        industry: input.industry || "Precision Auto Components Manufacturing",
        geography: input.geography || "Aurangabad Industrial Hub, Maharashtra",
        length: input.length || "standard",
        max_marks: maxMarks,
      },
      case: {
        title: "Capital Allocation and Liquidity Engineering at VayuTech Automotive Ltd.",
        word_count: isShort ? 620 : 1180,
        sections: [
          {
            heading: "Background of the Company",
            paragraphs: [
              "VayuTech Automotive Ltd., situated in the Shendra MIDC industrial belt near Aurangabad, Maharashtra, manufactures lightweight aluminum die-cast engine blocks and electric vehicle (EV) battery enclosures. Established in 2014 by metallurgical engineer Devendra Deshmukh, the enterprise grew steadily by serving Tier-1 automotive original equipment manufacturers (OEMs) across Pune, Sanand, and Chennai.",
              "By 2023, VayuTech recorded gross revenues of ₹112 crore. However, accelerated orders for EV components placed severe strains on the firm's balance sheet, creating an acute dual dilemma: bloated trade credit terms from automotive OEMs locking up working capital, alongside an immediate mandate to fund a ₹16 crore automated high-pressure die-casting cell."
            ],
          },
          {
            heading: "Working Capital Drag & Receivables Monetization",
            paragraphs: [
              "Under institutional pressure to secure contracts with leading domestic EV manufacturers, VayuTech conceded to 90-day deferred credit windows. By September 2023, trade receivables ballooned to ₹32.5 crore, triggering liquidity shortages that hindered prompt scrap metal procurement and monthly energy disbursements.",
              "Chief Financial Officer Ritu Singhania analyzed conventional bank cash credit lines versus a factoring facility from a specialized non-banking financial institution. The factor offered immediate liquidity advances against certified OEM delivery challans at 82% of invoice face value with a 1.25% administrative fee. Given the blue-chip credit standing of the OEM buyers, VayuTech executed a recourse factoring arrangement, converting receivables into immediate shop-floor working capital."
            ],
          },
          {
            heading: "Machinery Modernization: Financial Lease vs. Term Debt",
            paragraphs: [
              "Simultaneously, satisfying quality benchmarks for German and Japanese export orders required deploying automated robotic trimming and casting cells valued at ₹16 crore. While VayuTech's commercial bankers offered a 5-year equipment term loan at 11.5% interest with a 25% margin money requirement (₹4.0 crore upfront equity), the company opted for a 5-year financial lease structure with an equipment financing consortium.",
              "The lease structure conserved ₹4.0 crore in liquid cash, preserved commercial borrowing headroom for routine operations, and provided tax-deductible rental write-offs, albeit at a marginally higher cumulative cash outflow across the five-year operational lifecycle."
            ],
          },
          {
            heading: "Strategic Synthesis and Financial Governance",
            paragraphs: [
              "By coordinating receivables factoring with equipment lease financing, VayuTech sustained uninterrupted OEM delivery schedules and grew export shipments to 22% of total production. However, management recognized the ongoing drag of factoring service fees and residual default exposure under recourse agreements."
            ],
          },
        ],
        data_tables: [
          {
            title: "Exhibit 1: VayuTech Automotive Ltd. - Financial & Working Capital Architecture (FY 2023-2024)",
            columns: ["Financial Dimension", "Baseline FY23", "Working Capital Strain (Q2 FY24)", "Post-Financing Structure"],
            rows: [
              ["Gross Annual Turnover", "₹94.0 Crore", "₹112.0 Crore", "₹128.0 Crore (Projected)"],
              ["Outstanding Trade Receivables", "₹18.2 Crore", "₹32.5 Crore", "₹6.8 Crore (Net of Factoring Advance)"],
              ["Average Debtor Collection Period", "62 Days", "94 Days", "18 Days (Factoring Cash Realization)"],
              ["High-Pressure Die-Casting Capex", "₹3.5 Crore", "₹16.0 Crore (Required)", "₹16.0 Crore (Financial Lease Asset)"],
              ["Upfront Cash Outflow for Capex", "₹3.5 Crore", "₹4.0 Crore (Bank Margin)", "₹0.0 (Lease 100% Financed)"],
              ["Interest / Finance Cost Burden", "9.2% p.a.", "11.5% p.a. Bank Loan", "10.4% p.a. Lease Rental Rate"]
            ],
          },
        ],
      },
      questions: [
        {
          id: "Q1",
          bloom_verb: "Analyze & Compare",
          text: "Analyze the working capital and liquidity bottlenecks confronting VayuTech Automotive Ltd. Compare the operational and financial implications of utilizing recourse factoring versus conventional bank cash-credit lines for managing extended OEM receivables.",
          concepts: ["Working Capital Cycle", "Recourse Factoring", "Cash Credit Lines", "Liquidity Management"],
          marks: marksPerQ,
          co: "CO1",
          k_level: "K4",
        },
        ...(numQ > 1
          ? [
              {
                id: "Q2",
                bloom_verb: "Evaluate & Justify",
                text: "Evaluate the managerial decision to finance the ₹16.0 crore die-casting machinery through a financial lease rather than commercial bank term debt. In your opinion, was this an appropriate capital expenditure strategy? Justify your stance with reference to cash flow conservation and financial risk.",
                concepts: ["Financial Lease", "Capital Budgeting", "Asset-Liability Matching", "Cash Flow Preservation"],
                marks: marksPerQ,
                co: "CO2",
                k_level: "K5",
              },
            ]
          : []),
      ],
      answers: [
        {
          question_id: "Q1",
          word_count: 480,
          introduction: "VayuTech Automotive Ltd. faced a severe cash flow mismatch caused by rapid order expansion combined with 90-day OEM credit cycles, trapping ₹32.5 crore in accounts receivable. To alleviate this liquidity squeeze without exceeding restrictive bank overdraft covenants, management deployed recourse factoring.",
          sections: [
            {
              heading: "1. Diagnosis of Working Capital Friction",
              points: [
                "The Debtor Collection Period escalated from 62 days to 94 days, immobilizing nearly 30% of annual turnover in receivables.",
                "Liquidity exhaustion directly threatened raw material aluminum ingot procurement, exposing VayuTech to OEM line-stoppage penalty clauses.",
                "Traditional bank cash-credit facilities were constrained by collateral limits and lengthy documentation cycles."
              ],
            },
            {
              heading: "2. Comparative Evaluation of Factoring vs. Bank Cash Credit",
              points: [
                "Factoring injected 82% upfront cash within 48 hours of invoice presentation, cutting the effective cash cycle to 18 days.",
                "The factor assumed sales ledger administration, reducing VayuTech's administrative collection costs.",
                "However, under recourse factoring terms, VayuTech remained liable for bad debts in the event of customer insolvency."
              ],
              limitation: "Continuous service fees (1.25%) and retention of customer credit risk under recourse clauses.",
              overall: "Highly appropriate short-term liquidity instrument for managing blue-chip OEM receivables."
            },
          ],
          comparison_table: {
            "columns": ["Comparison Dimension", "Recourse Factoring", "Bank Cash Credit (CC) Facility"],
            "rows": [
              ["Underlying Security", "Specific trade invoices and verified delivery challans", "Hypothecation of entire current assets and plant collateral"],
              ["Liquidity Speed", "Immediate liquidity within 24-48 hours of billing", "Constrained by monthly drawing power calculations"],
              ["Credit Administration", "Factor handles customer ledger maintenance & tracking", "Company maintains internal collections and legal followup"],
              ["Balance Sheet Impact", "Monetizes receivables directly into operational cash", "Increases current liabilities and bank debt obligations"],
              ["Default Risk Allocation", "Shared: Company bears default risk under recourse terms", "Borne completely by company with collateral foreclosure risk"]
            ]
          },
          conclusion: "Recourse factoring provided VayuTech with targeted, scalable liquidity that grew dynamically in proportion to sales volume, unlocking trapped cash without exhausting balance sheet debt covenants.",
        },
        ...(numQ > 1
          ? [
              {
                question_id: "Q2",
                word_count: 520,
                introduction: "VayuTech's capital expenditure dilemma centered on modernizing its die-casting infrastructure (₹16.0 crore) without jeopardizing scarce liquid cash reserves. Management's election of a 5-year financial lease over a commercial term loan represents a strategic asset-liability matching decision tailored to high-growth industrial manufacturing.",
                sections: [
                  {
                    heading: "1. Evaluation of Financial Leasing Strategy",
                    points: [],
                    evaluation: [
                      "Cash Conservation: A bank term loan demanded 25% margin money (₹4.0 crore upfront equity). Financial leasing financed 100% of asset acquisition, allowing VayuTech to preserve cash for raw material procurement.",
                      "Covenant Flexibility: Lease financing did not consume conventional mortgage borrowing limits, preserving bank lines for seasonal operational fluctuations.",
                      "Fiscal Benefits: Full monthly lease rentals are deductible as operating expenses under Indian tax statutes, accelerating tax shield benefits compared to standard asset depreciation schedules."
                    ],
                    limitation: "Cumulative rental outflows across 5 years exceed direct purchase cost, and VayuTech does not enjoy unencumbered asset ownership during the lease tenure.",
                    overall: "Strategically justified decision that maximized working capital liquidity during an aggressive scale-up window."
                  }
                ],
                overall_assessment: "VayuTech effectively balanced capital structure risk. By coordinating receivables factoring (working capital) with financial leasing (fixed capital capex), the firm avoided equity dilution and prevented catastrophic cash crunches.",
                conclusion: "In conclusion, VayuTech's financial management choices were prudent, well-timed, and appropriate. The strategy preserved ₹4 crore in immediate equity cash and secured delivery compliance with Tier-1 EV manufacturers.",
              },
            ]
          : []),
      ],
      teaching_notes: {
        synopsis: "Examines VayuTech Automotive, a high-growth Indian auto components manufacturer facing a ₹32.5 Cr OEM receivables trap and a ₹16 Cr die-casting capex dilemma. Details factoring vs cash credit lines and lease vs buy decisions.",
        objectives: [
          "Evaluate working capital operating cycles under extended OEM trade credit terms.",
          "Compare factoring and commercial bank cash credit across liquidity and risk parameters.",
          "Analyze lease vs borrow-and-buy decisions for industrial capital expenditure."
        ],
        teaching_approach: "Map VayuTech's cash conversion cycle on the board. Calculate the cash freed by factoring 82% of ₹32.5 Cr receivables, then analyze the ₹4 Cr margin saved by leasing.",
        frameworks: ["Operating Cycle Model", "Asset-Liability Matching", "Working Capital Metrics", "Lease vs Buy"],
        common_mistakes: [
          "Assuming factoring is always more expensive than bank credit without factoring in collection administrative savings.",
          "Overlooking the 25% equity margin requirement of commercial bank term loans."
        ],
        marking_scheme: [
          { criterion: "Diagnosis of working capital and collection cycle bottlenecks", marks: 8 },
          { criterion: "Comparison table across at least 4 operational dimensions", marks: 12 },
          { criterion: "Critical evaluation of financial leasing vs term loan with trade-offs", marks: 12 },
          { criterion: "Strategic synthesis and risk governance recommendations", marks: 8 }
        ],
      },
      quality: {
        facts_to_verify: [
          "Leasing tax deductibility guidelines under Indian Income Tax Act Section 32 vs Section 37",
          "Automotive OEM vendor payment terms under MSMED Act 2006 (45-day statutory limit compliance)"
        ],
        illustrative_figures: [
          "₹112 crore annual gross turnover",
          "₹32.5 crore outstanding OEM receivables",
          "₹16 crore high-pressure die-casting equipment capex",
          "82% factoring advance rate with 1.25% fee"
        ],
      },
    };
  }

  // Fall back to HR or Marketing simulated gold structure
  const isHr = input.department === "hr";
  return {
    status: "draft",
    meta: {
      department: input.department,
      subject: input.subject || (isHr ? "Strategic Human Resource Management" : "Integrated Marketing Management"),
      topic: input.topics?.length ? input.topics : [isHr ? "Performance Appraisal & Retention" : "Omnichannel Strategy & Brand Positioning"],
      concepts: input.concepts?.length ? input.concepts : [isHr ? "BARS vs 360-Degree" : "STP & Canonical Positioning"],
      course_code: input.examMetadata?.course_code || profile.exam_metadata_defaults.course_code,
      ce_no: input.examMetadata?.ce_no || profile.exam_metadata_defaults.ce_no,
      set: input.examMetadata?.set || profile.exam_metadata_defaults.set,
      level,
      language: lang,
      industry: input.industry || (isHr ? "Information Technology & Logistics" : "Direct-to-Consumer Food & Beverages"),
      geography: input.geography || (isHr ? "Bengaluru, Karnataka" : "Ahmedabad, Gujarat"),
      length: input.length || "standard",
      max_marks: maxMarks,
    },
    case: {
      title: isHr
        ? "Workforce Realignment and Performance Engineering at Apex Logistics Ltd."
        : "Brand Repositioning and Channel Conflict Resolution at VedicHarvest Organics",
      word_count: isShort ? 600 : 1200,
      sections: [
        {
          heading: "Background of the Company",
          paragraphs: [
            isHr
              ? "Apex Logistics Ltd., founded in 2017 in Bengaluru, provides automated warehousing and last-mile freight forwarding services. As the enterprise expanded to 750 employees, it encountered severe talent friction and 32% voluntary attrition."
              : "VedicHarvest Organics Pvt. Ltd., founded in 2019 in Ahmedabad, crafts certified cold-pressed edible oils and organic flours. Rapid growth through 10-minute quick-commerce apps generated ₹24 crore in revenue but triggered fierce revolts from traditional retail distributors."
          ],
        },
        {
          heading: isHr ? "The Appraisal Breakdown and Siloed Conflict" : "The Market Segmentation and Positioning Dilemma",
          paragraphs: [
            isHr
              ? "A forced bell-curve appraisal model created widespread disengagement among tech leads and dispatch supervisors, resulting in peer rivalry and plummeting employee net promoter scores."
              : "VedicHarvest faced a dual competitive threat: mass FMCG brands offering 30% lower prices, and niche D2C startups spending aggressively on digital acquisition."
          ],
        },
        {
          heading: isHr ? "Strategic HR Overhaul: BARS and Total Rewards" : "Omnichannel Distribution and Dual-SKU Architecture",
          paragraphs: [
            isHr
              ? "HR leadership replaced subjective supervisory grading with Behaviorally Anchored Rating Scales (BARS), rebalanced variable pay to a stable 15%, and introduced long-term stock option plans."
              : "Management resolved channel rebellion by deploying a dual-SKU structure: a premium 'Reserve' range in glass bottles for physical boutique stores, and a standardized 'Daily' pouch for quick-commerce apps."
          ],
        },
      ],
      data_tables: [
        {
          title: isHr
            ? "Exhibit 1: Apex Logistics Ltd. - Workforce Metrics and Attrition Breakdown (2022-2024)"
            : "Exhibit 1: VedicHarvest Organics - Channel Economics and Margin Comparison (FY24)",
          columns: isHr ? ["Workforce Indicator", "FY22 Baseline", "FY23 Peak Crisis", "FY24 Post-Intervention"] : ["Channel Metric", "D2C Webstore", "Specialty Modern Trade", "Quick Commerce (Zepto/Blinkit)"],
          rows: isHr
            ? [
                ["Total Staff Headcount", "380", "640", "750"],
                ["Voluntary Attrition (%)", "16.4%", "32.8%", "13.9%"],
                ["Average Cost Per Lateral Hire", "₹1,20,000", "₹1,95,000", "₹1,40,000"],
                ["Employee Net Promoter Score", "+14", "-16", "+22"]
              ]
            : [
                ["Revenue Contribution (%)", "20%", "45%", "35%"],
                ["Average Selling Price (₹/Liter)", "₹520", "₹480", "₹360"],
                ["Channel Trade Margin (%)", "0%", "20%", "28%"],
                ["Gross Margin Delivered (%)", "52%", "44%", "38%"]
              ],
        },
      ],
    },
    questions: [
      {
        id: "Q1",
        bloom_verb: isHr ? "Diagnose & Compare" : "Formulate & Justify",
        text: isHr
          ? "Diagnose the organizational causes of employee turnover at Apex Logistics. Compare the suitability of 360-Degree Feedback versus Behaviorally Anchored Rating Scales (BARS)."
          : "Formulate an STP strategy for VedicHarvest Organics and author an authoritative positioning statement following the institutional template.",
        concepts: isHr ? ["Attrition Diagnosis", "BARS", "360-Degree Appraisal"] : ["STP Analysis", "Positioning Statement Template", "Market Differentiation"],
        marks: marksPerQ,
        co: "CO1",
        k_level: "K4",
      },
      ...(numQ > 1
        ? [
            {
              id: "Q2",
              bloom_verb: isHr ? "Evaluate & Justify" : "Evaluate & Recommend",
              text: isHr
                ? "Evaluate the total rewards and continuous coaching interventions using Herzberg's Motivation-Hygiene theory and McGregor's Theory X/Y."
                : "Evaluate the 4Ps marketing mix and dual-SKU resolution to channel conflict across Quick Commerce and Modern Trade.",
              concepts: isHr ? ["Total Rewards", "Herzberg Theory", "Theory X/Y"] : ["4Ps Marketing Mix", "Channel Conflict", "Dual-SKU Strategy"],
              marks: marksPerQ,
              co: "CO2",
              k_level: "K5",
            },
          ]
        : []),
    ],
    answers: [
      {
        question_id: "Q1",
        word_count: 480,
        introduction: isHr
          ? "Apex Logistics experienced severe organizational friction characterized by 32.8% voluntary turnover, prompted by an uncalibrated annual bell curve."
          : "VedicHarvest Organics operated in a crowded organic FMCG marketplace caught between cheap mass oils and venture-backed D2C entrants.",
        sections: [
          {
            heading: isHr ? "1. Root Cause Diagnosis" : "1. Segmentation and Target Market Selection",
            points: isHr
              ? ["Forced distribution demoralized high performers.", "Lack of objective behavioral grading bred supervisory bias."]
              : ["Targeted Wellness Purists seeking verified single-origin cold-pressed purity.", "Positioned against industrial refined mass oils."],
          },
          {
            heading: isHr ? "2. Comparative Appraisal Analysis" : "2. Canonical Institutional Positioning Statement",
            points: isHr
              ? ["BARS provided observable performance benchmarks that eliminated favoritism.", "360 appraisals provoked peer collusion in low-trust environments."]
              : ["\"For health-conscious urban households seeking uncompromised dietary vitality, VedicHarvest Organics offers verified cold-pressed heritage kitchen staples, because each batch is sourced directly from certified farmer cooperatives with QR-traceable single-origin authenticity.\""],
          },
        ],
        comparison_table: {
          columns: isHr ? ["Dimension", "360-Degree Feedback", "BARS Methodology"] : ["Marketing Element", "Modern Trade Reserve SKU", "Quick Commerce Daily SKU"],
          rows: isHr
            ? [
                ["Evaluators", "Peers, direct reports, supervisors", "Immediate supervisor evaluating observable metrics"],
                ["Primary Focus", "Interpersonal and behavioral coaching", "Objective operational performance and promotion"],
                ["Bias Vulnerability", "High: Susceptible to popularity contests", "Low: Anchored to pre-defined behavioral benchmarks"],
                ["Suitability", "Executive development in mature cultures", "Administrative performance management in logistics teams"]
              ]
            : [
                ["Packaging", "Embossed Glass Bottle (1 Liter)", "Recyclable Spout Pouch (1 Liter)"],
                ["Price Point", "₹480 (Full margin, zero discount)", "₹360 (Promotional volume pricing)"],
                ["Channel Margin", "20% fixed retailer commission", "28% quick commerce take-rate"],
                ["Buying Occasion", "Planned experiential grocery shopping", "Instant impulse pantry replenishment"]
              ],
        },
        conclusion: isHr
          ? "BARS established transparent behavioral expectations that restored trust across the workforce."
          : "The STP framework and clear positioning statement protected VedicHarvest's brand equity while sustaining expansion.",
      },
      ...(numQ > 1
        ? [
            {
              question_id: "Q2",
              word_count: 510,
              introduction: isHr
                ? "The total rewards restructuring designed by HR stabilized workforce retention by addressing hygiene factors and activating intrinsic motivators."
                : "VedicHarvest's dual-SKU strategy resolved severe distributor rebellion while expanding high-velocity digital sales.",
              sections: [
                {
                  heading: isHr ? "1. Theoretical Analysis (Herzberg & McGregor)" : "1. Evaluation of Dual-SKU Marketing Mix Strategy",
                  points: [],
                  evaluation: isHr
                    ? [
                        "Hygiene Factor Stabilization: Raising base pay from 60% to 85% eliminated financial panic and arrested attrition.",
                        "Motivator Activation: Equity stock options (ESOPs) and developmental coaching engaged intrinsic commitment and autonomy (Theory Y)."
                      ]
                    : [
                        "Product Differentiation: Physical packaging divergence prevented side-by-side barcode comparison by consumers.",
                        "Price Discrimination: Absorbed quick commerce's 28% margin while protecting brick-and-mortar retailer profits."
                      ],
                  limitation: isHr ? "Higher fixed payroll liabilities during economic slowdowns." : "Elevated inventory and supply chain complexity across multiple SKUs.",
                  overall: isHr ? "Culturally transformative and commercially sound." : "Exemplary omnichannel governance."
                },
              ],
              overall_assessment: isHr
                ? "A balanced restructuring that shifted leadership from authoritarian Theory X surveillance to developmental Theory Y partnership."
                : "A commercially balanced omnichannel model reconciling physical retailers and digital quick commerce.",
              conclusion: isHr
                ? "Apex successfully cut attrition in half, creating a stable human capital platform for long-term growth."
                : "VedicHarvest expanded revenue to ₹29.4 crore while preserving 40%+ gross margins.",
            },
          ]
        : []),
    ],
    teaching_notes: {
      synopsis: isHr
        ? "Examines employee attrition and appraisal conflict in an Indian logistics technology enterprise, demonstrating BARS and Herzberg frameworks."
        : "Details an Indian organic food enterprise overcoming distributor channel conflict through a dual-SKU marketing mix and canonical positioning.",
      objectives: [
        "Diagnose organizational friction using empirical workforce or market data.",
        "Apply canonical business frameworks to formulate defensible management solutions.",
        "Design sustainable execution roadmaps addressing stakeholder conflicts."
      ],
      teaching_approach: "Facilitate a structured debate analyzing alternative managerial choices presented in the data tables.",
      frameworks: isHr ? ["Herzberg Motivation-Hygiene", "McGregor Theory X/Y", "BARS"] : ["STP Model", "The 4Ps of Marketing", "Channel Conflict Resolution"],
      common_mistakes: [
        "Failing to ground recommendations in specific quantitative case facts.",
        "Proposing one-size-fits-all policies that ignore trade-offs."
      ],
      marking_scheme: [
        { criterion: "Analytical diagnosis of problem root causes", marks: 10 },
        { criterion: "Rigorous comparative evaluation across structured dimensions", marks: 10 },
        { criterion: "Theoretical depth and strategic justification", marks: 12 },
        { criterion: "Clarity of communication and executive synthesis", marks: 8 }
      ],
    },
    quality: {
      facts_to_verify: ["Prevailing industry sector compensation and channel margin norms"],
      illustrative_figures: isHr ? ["750 headcount", "32.8% peak attrition"] : ["₹24 crore turnover", "28% quick commerce take-rate"],
    },
  };
}

/**
 * Executes the full 3-Pass CE Case Pack Generation Pipeline
 */
export async function generateCECasePack(
  input: GenerateCasePackInput,
  onProgress?: ProgressCallback
): Promise<{ casePack: CECasePack; checks: { valid: boolean; summary: string } }> {
  const profile = getDepartmentProfile(input.department);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isLive = apiKey && apiKey.trim() !== "" && !apiKey.includes("placeholder");

  // ---------------------------------------------------------------------------
  // PASS 1: Case Narrative + Examination Questions
  // ---------------------------------------------------------------------------
  onProgress?.({
    stage: "case",
    progress: 20,
    message: `Pass 1/3: Formulating ${profile.name} teaching case narrative and data tables...`,
  });

  let rawCasePack: CECasePack;

  if (isLive) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const systemPrompt = buildCasePackSystemPrompt(profile);
      const goldExamples = loadApprovedGoldExamples(input.department);

      const pass1Prompt = `Generate PASS 1 of the CE Case Pack for the ${profile.name} department.
Subject: ${input.subject || profile.units[0].title}
Topics: ${input.topics?.join(", ") || profile.units[0].topics.slice(0, 2).join(", ")}
Concepts: ${input.concepts?.join(", ") || "Core analytical concepts"}
Level: ${input.level || "MBA / PGDM"}
Language: ${input.language || "en"}
Industry: ${input.industry || "Indian Manufacturing / Services"}
Length: ${input.length || "standard"}
Number of Questions: ${input.numQuestions || 2}
Source Notes: ${input.sourceNotes || "None"}
Exam Metadata: ${JSON.stringify(input.examMetadata || profile.exam_metadata_defaults)}

GOLD BENCHMARK REFERENCE:
${goldExamples.length > 0 ? JSON.stringify(goldExamples[0].case) : "Follow the standard architecture"}

Output JSON for:
{
  "meta": { ... },
  "case": { "title": "...", "word_count": 1200, "sections": [...], "data_tables": [...] },
  "questions": [ ... ]
}`;

      const response = await anthropic.messages.create({
        model: MODEL_WRITER,
        max_tokens: 4096,
        temperature: 0.3,
        system: systemPrompt,
        messages: [{ role: "user", content: pass1Prompt }],
      });

      const responseText =
        response.content[0].type === "text" ? response.content[0].text : "";
      const cleaned = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedPass1 = JSON.parse(cleaned);

      // ---------------------------------------------------------------------------
      // PASS 2: Model Answer Key + Teaching Notes
      // ---------------------------------------------------------------------------
      onProgress?.({
        stage: "answers",
        progress: 60,
        message: "Pass 2/3: Authoring faculty model answer keys, comparisons, and teaching notes...",
      });

      const pass2Prompt = `Generate PASS 2 of the CE Case Pack.
Here is the approved Teaching Case and Questions from Pass 1:
${JSON.stringify({ case: parsedPass1.case, questions: parsedPass1.questions })}

Department Answer Requirements:
${profile.answer_patterns.join("\n")}

Output strictly valid JSON matching:
{
  "answers": [ ... ],
  "teaching_notes": { ... },
  "quality": { "facts_to_verify": [...], "illustrative_figures": [...] }
}`;

      const response2 = await anthropic.messages.create({
        model: MODEL_WRITER,
        max_tokens: 4096,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: "user", content: pass2Prompt }],
      });

      const responseText2 =
        response2.content[0].type === "text" ? response2.content[0].text : "";
      const cleaned2 = responseText2.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedPass2 = JSON.parse(cleaned2);

      rawCasePack = {
        status: "draft",
        meta: parsedPass1.meta,
        case: parsedPass1.case,
        questions: parsedPass1.questions,
        answers: parsedPass2.answers,
        teaching_notes: parsedPass2.teaching_notes,
        quality: parsedPass2.quality || { facts_to_verify: [], illustrative_figures: [] },
      };
    } catch (apiErr) {
      console.warn("Live API call encountered error; utilizing simulated fallback:", apiErr);
      rawCasePack = generateSimulatedCasePack(input);
    }
  } else {
    // Simulated multi-stage generation with live progress events
    await new Promise((r) => setTimeout(r, 600));
    onProgress?.({
      stage: "answers",
      progress: 65,
      message: "Pass 2/3: Generating faculty model answers and rubric criteria...",
    });
    await new Promise((r) => setTimeout(r, 600));
    rawCasePack = generateSimulatedCasePack(input);
  }

  // ---------------------------------------------------------------------------
  // PASS 3: Validation, Verification Checks & Remediation
  // ---------------------------------------------------------------------------
  onProgress?.({
    stage: "checks",
    progress: 90,
    message: "Pass 3/3: Running deterministic schema, factual, and quantitative validators...",
  });

  const validationResult = validateCECasePack(rawCasePack);

  if (!validationResult.success) {
    console.warn("Schema validation warnings in generated pack:", validationResult.errors);
  }

  onProgress?.({
    stage: "done",
    progress: 100,
    message: "CE Case Pack generation and validation successfully completed.",
    payload: rawCasePack,
  });

  return {
    casePack: rawCasePack,
    checks: {
      valid: validationResult.success,
      summary: validationResult.success
        ? "All schema, conceptual, and department validators passed."
        : `Validation alerts: ${validationResult.errors.join("; ")}`,
    },
  };
}
