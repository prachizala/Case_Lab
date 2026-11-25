import Anthropic from "@anthropic-ai/sdk";
import {
  CaseBloomsLevel,
  CaseContent,
  CaseDifficulty,
  CaseDomain,
  CaseExhibit,
  CaseFormat,
  CaseLanguage,
  CaseTargetAudience,
  CaseTone,
  CaseType,
} from "./types";
import { COLLEGE_NAME_WITH_SHORT } from "@/config/college";

export interface GenerateCaseParams {
  type: CaseType; // 'short' | 'full' | 'research' | 'flash'
  format: CaseFormat; // 'hypothetical' | 'real_signal'
  industry: string;
  functionalFocus: string;
  domain?: CaseDomain;
  difficulty?: CaseDifficulty;
  targetAudience?: CaseTargetAudience;
  primaryCompany?: string;
  locationMarket?: string;
  centralDilemma?: string;
  keyDecisionMaker?: string;
  protagonists?: string;
  learningObjectives?: string[];
  tone?: CaseTone;
  includeExhibits?: ("financials" | "org_chart" | "market_data")[];
  includeTeachingNote?: boolean;
  bloomsLevel?: string;
  courseName?: string;
  semester?: string;
  level?: string;
  learningOutcomes?: string;
  contextRegion: string;
  language?: string; // Optional for backward compatibility; generation is always English
  complexity: number; // 1 - 10
  targetLength?: "short" | "medium" | "comprehensive";
  sourceNotes?: string;
  regenerateSection?: "exhibits" | "dilemma" | "teaching_note" | "questions";
}

export interface GenerationResult {
  content: CaseContent;
  tokensUsed: number;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
}

export function buildSystemPrompt(params: {
  language?: string;
  format: CaseFormat;
  type: CaseType;
  tone?: CaseTone;
  bloomsLevel?: string;
  includeTeachingNote?: boolean;
  includeExhibits?: ("financials" | "org_chart" | "market_data")[];
}): string {
  return `You are a distinguished Professor of Business Administration and Master Case Writer at ${COLLEGE_NAME_WITH_SHORT}.
Your mission is to write an original, authentic, publication-grade pedagogical teaching case study conforming to the gold standard of Harvard Business School (HBS), Stanford GSB, and Ivey Publishing.

CRITICAL PEDAGOGICAL & NARRATIVE ARCHITECTURE:
1. OUTPUT LANGUAGE: Write in clear, professional English only. Use Indian business context, INR figures and Indian examples where relevant. Names of Indian people, places and companies stay as they are.
2. HARVARD / IVEY CASE STRUCTURE:
   - "background": MUST NOT be a brief generic summary. It must be a multi-paragraph, immersive academic narrative divided into structured sections:
     * ### The Opening Hook: Ground the scene in an exact date, time, and location (e.g. corporate headquarters in Ahmedabad, Mumbai, or Bengaluru). Introduce the key protagonist sitting at their desk or heading into an emergency executive committee meeting with a ticking clock (e.g. 72 hours until the Board of Directors convenes).
     * ### Enterprise Genesis & Core Capabilities: Chronicling the company's historical origins, early entrepreneurial vision, foundational competitive moats (VRIO framework), and operating model.
     * ### Macro-Environment & Industry Upheaval: The structural market shifts, regulatory developments, technological disruption (e.g. D2C platforms, automation, inflation), and shifting consumer behaviors straining historical margins.
   - "challenge": MUST provide deep operational drama and rigorous managerial trade-offs:
     * ### Conflicting Boardroom Perspectives: Include direct, realistic stakeholder dialogue quoting the Chief Financial Officer (advocating risk-averse cash preservation), the Head of Strategy/Growth (urging aggressive disruption), and the Chief Operating Officer (concerned about operational execution and frontline capacity).
     * ### Strategic Crossroads (The Three Mutually Exclusive Alternatives):
       - Alternative 1 (Aggressive In-House Expansion / Heavy CAPEX): Specific capital requirement, upside growth potential, balance sheet risk, and ROCE dilution.
       - Alternative 2 (Strategic Alliance / Joint Venture / M&A): Capital requirement, speed-to-market advantage, cultural friction, and governance integration risks.
       - Alternative 3 (Defensive Consolidation & Margin Protection): Focus on core profitability, SKU rationalization, free cash flow preservation, and the long-term risk of market obsolescence.
   - "key_data": Provide 8 to 12 comprehensive financial and operating metrics (e.g., Revenue, COGS, Gross Margin %, EBITDA, EBITDA Margin %, Net Profit, Free Cash Flow, Debt-to-Equity, Working Capital Cycle, CAC, LTV) with realistic units (₹ Crores, percentage points, ratios).
   - "decision_point": A high-stakes, urgent decision dilemma framing the Monday morning executive choice.
   - "discussion_questions": Exactly 5 Bloom's taxonomy calibrated questions (1: Root Cause Diagnosis, 2: Quantitative Exhibit Dissection, 3: Strategic Trade-off Analysis, 4: Organizational Implementation, 5: Boardroom Action Plan).
   - "exhibits": Comprehensive multi-year audited financial tables with CAGR, percentage margins, and realistic explanatory footnotes citing corporate filings.
   - "teaching_note":
     * Explicit pedagogical objectives aligned with ${params.bloomsLevel || "Apply & Analyze"}.
     * 90-minute 4-phase classroom flow (Cold call, small-group quantitative stress test, boardroom debate, plenary synthesis).
     * Recommended 3-Board Classroom Blackboard Plan (Board 1: Issues & Diagnosis, Board 2: Strategic Trade-offs & Frameworks, Board 3: Action Plan & Governance Milestones).
     * 3 academic management frameworks (e.g. Porter's Five Forces, VRIO, DuPont Decomposition) with concrete case application.
3. TEACHING INTEGRITY:
   - Mark all quantitative figures as illustrative pedagogical models.
   - Never fabricate real living person quotes; attribute statements to organizational titles or realistic personas.
   ${
     params.format === "real_signal"
       ? '- REAL SIGNAL MODE: Set "verify_facts_flag: true". Ground the case in observable Indian/global corporate realities.'
       : '- HYPOTHETICAL MODE: Set "verify_facts_flag: false". Create plausible fictionalized enterprise scenarios.'
   }

SCHEMA (Return pure valid JSON):
{
  "title": "Compelling, formal case study title in English",
  "summary": "Executive abstract (120-180 words) summarizing the protagonist, company, industry dilemma, and pedagogical focus",
  "background": "Deep multi-section narrative with ### The Opening Hook, ### Enterprise Genesis & Core Capabilities, and ### Macro-Environment & Industry Upheaval",
  "challenge": "Deep operational challenge with ### Conflicting Boardroom Perspectives (stakeholder quotes) and ### Strategic Crossroads (The Three Mutually Exclusive Alternatives)",
  "key_data": [
    { "metric": "Gross Revenue", "value": "₹1,850 Cr", "period": "FY25 (Audited)", "notes": "+11.2% YoY" },
    { "metric": "Cost of Goods Sold (COGS)", "value": "₹1,185 Cr", "period": "FY25", "notes": "64.1% of revenue" },
    { "metric": "Operating EBITDA", "value": "₹218 Cr", "period": "FY25", "notes": "11.8% EBITDA margin" },
    { "metric": "Free Cash Flow (FCF)", "value": "₹64 Cr", "period": "FY25", "notes": "-28.4% YoY contraction" },
    { "metric": "Debt-to-Equity Ratio", "value": "0.78x", "period": "Trailing 12M", "notes": "Covenant ceiling at 1.0x" },
    { "metric": "Customer Acquisition Cost", "value": "₹680", "period": "FY25", "notes": "+24.5% inflation" },
    { "metric": "Working Capital Cycle", "value": "58 Days", "period": "FY25", "notes": "Up from 42 days in FY23" },
    { "metric": "Proposed CAPEX Outlay", "value": "₹140 Cr", "period": "FY26-FY28 Plan", "notes": "Central investment dilemma" }
  ],
  "decision_point": "The exact high-stakes crossroads question the protagonist must present to the Board of Directors",
  "discussion_questions": [
    "Question 1 (Diagnosis)",
    "Question 2 (Quantitative Analysis)",
    "Question 3 (Strategic Trade-offs)",
    "Question 4 (Implementation & Risk)",
    "Question 5 (Board Action Plan)"
  ],
  "exhibits": [
    {
      "id": "exhibit-1",
      "title": "Exhibit 1: 3-Year Audited Financial Performance & Unit Economics",
      "type": "financials",
      "description": "Multi-year audited income statement, operating margins, and unit economics (all figures in ₹ Crores)",
      "data": [
        { "metric": "Gross Revenue", "y2023": "₹1,480 Cr", "y2024": "₹1,660 Cr", "y2025": "₹1,850 Cr", "y2026_proj": "₹1,940 Cr", "cagr": "+7.7%" }
      ]
    }
  ],
  ${
    params.includeTeachingNote !== false
      ? `"teaching_note": {
    "objectives": ["Objective 1", "Objective 2", "Objective 3"],
    "class_flow": [
      { "phase": "Opening Cold Call & Dilemma Framing", "duration_minutes": 15, "activity": "Challenge protagonist assumptions", "expected_response": "Model diagnostic takeaway distinguishing symptoms from root causes" },
      { "phase": "Quantitative Stress-Testing", "duration_minutes": 30, "activity": "Dissect exhibits and balance sheet covenants", "expected_response": "Specific numerical calculations of debt headroom and sensitivity" },
      { "phase": "Boardroom Alternative Debate", "duration_minutes": 30, "activity": "Weigh Alternative 1 vs 2 vs 3", "expected_response": "Consensus trade-off analysis balancing solvency against digital growth" },
      { "phase": "Plenary Synthesis & Takeaways", "duration_minutes": 15, "activity": "Consolidate 3-Board layout", "expected_response": "Final 3-Board takeaway summarizing diagnosis, frameworks, and milestones" }
    ],
    "frameworks": [
      { "name": "Porter's Five Forces", "application": "Assess supplier concentration and competitive rivalry", "key_takeaway": "Price competition erodes industry profitability without digital moats" },
      { "name": "DuPont ROE Decomposition", "application": "Deconstruct net profit margin, asset turnover, and leverage", "key_takeaway": "Asset-heavy expansion dilutes return on equity unless turnover accelerates" },
      { "name": "VRIO Framework", "application": "Audit proprietary distribution and supply relationships", "key_takeaway": "Physical logistics network is valuable and rare, but vulnerable to digital substitution" }
    ]
  },`
      : ""
  }
  "verify_facts_flag": ${params.format === "real_signal" ? "true" : "false"},
  "figures_disclaimer": "All specific metrics, financial line items, and organizational names are pedagogical models designed for classroom case analysis."
}`;
}

export async function generateCaseWithClaude(
  params: GenerateCaseParams
): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey && apiKey.trim() !== "" && !apiKey.includes("placeholder")) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const systemPrompt = buildSystemPrompt({
        language: params.language,
        format: params.format,
        type: params.type,
      });

      const userPrompt = `Generate a ${params.type.toUpperCase()} case study with the following specifications:
- Industry: ${params.industry}
- Functional Focus: ${params.functionalFocus}
- Academic Level: ${params.level}
- Target Course: ${params.courseName || "General Management & Strategy"} (Semester: ${params.semester || "Current"})
- Regional Context: ${params.contextRegion}
- Language: English (en)
- Complexity Index (1-10): ${params.complexity}
- Target Scope: ${params.targetLength}
${params.learningOutcomes ? `- Course Outcomes / Program Outcomes (CO/PO): ${params.learningOutcomes}` : ""}
${params.sourceNotes ? `\nSOURCE NOTES & RAW SIGNALS:\n${params.sourceNotes}` : ""}

Please generate the complete, production-grade JSON case study now.`;

      const selectedModel = (params.type === "short" || params.type === "flash")
        ? (process.env.FAST_MODEL || "claude-3-5-haiku-20241022")
        : (process.env.QUALITY_MODEL || "claude-3-5-sonnet-20241022");

      const response = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const contentBlock = response.content[0];
      if (contentBlock.type !== "text") {
        throw new Error("Claude returned non-text response.");
      }

      let rawText = contentBlock.text.trim();
      // Remove any markdown wrapper if Claude added it
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed: CaseContent = JSON.parse(rawText);

      return {
        content: parsed,
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        model: selectedModel,
      };
    } catch (err: unknown) {
      console.error("Claude API call or parsing error:", err);
      // If error is JSON parse failure, rethrow so caller shows retry button
      if (err instanceof SyntaxError) {
        throw new Error("CLAUDE_JSON_PARSE_ERROR: Failed to parse structured JSON from Claude response.");
      }
      throw err;
    }
  }

  // Graceful high-fidelity pedagogical generation fallback when API key is not present
  return generateHighFidelityMockCase(params);
}

/**
 * High-fidelity fallback generating authentic teaching cases in professional English
 */
function generateHighFidelityMockCase(params: GenerateCaseParams): GenerationResult {
  const isShort = params.type === "short" || params.type === "flash";
  const isResearch = params.type === "research";
  const isReal = params.format === "real_signal";
  const ind = params.industry || "Fintech & Banking";
  const func = params.functionalFocus || "Strategic Finance & Capital Allocation";
  const domain = params.domain || "Strategy";
  const company = params.primaryCompany?.trim() || (isReal ? "Gujarat Co-operative Milk Marketing Federation (Amul)" : "Apex Strategic Enterprises Ltd");
  const region = params.locationMarket?.trim() || params.contextRegion || "Gujarat, India";
  const dilemma = params.centralDilemma?.trim() || "Whether to allocate ₹140 Cr toward an aggressive in-house digital supply chain overhaul, acquire a venture-backed tech challenger, or defend operating margins through premium consolidation.";
  const decisionMaker = params.keyDecisionMaker?.trim() || "Managing Director & Chief Executive Officer";
  const protagonists = params.protagonists?.trim() || "Chief Financial Officer, VP of Strategic Growth, Chief Operating Officer";
  const targetAudience = params.targetAudience || "MBA";
  const tone = params.tone || "Academic";
  const bloomsLevel = params.bloomsLevel || "Apply & Analyze";

  let title = "";
  let summary = "";
  let background = "";
  let challenge = "";
  let decisionPoint = "";
  let questions: string[] = [];
  let objectives: string[] = params.learningObjectives && params.learningObjectives.length > 0
    ? [...params.learningObjectives]
    : [];
  let frameworks: { name: string; application: string; key_takeaway: string }[] = [];

  // =========================================================================
  // ENGLISH STANDARD (HBS / IVEY BENCHMARK) - ENGLISH ONLY
  // =========================================================================
    title = isResearch
      ? `Case Research: ${company} vs. Emerging Challengers — Strategic Paradigms in ${ind} (${region})`
      : isShort
      ? `Short Case: Crossroad Dilemma at ${company} (${region})`
      : `Strategic Leadership: ${company} and the Transformation of ${ind} in ${region}`;

    summary = `A publication-grade pedagogical case study examining capital allocation, digital disruption, and organizational leadership at ${company}. Anchored in ${region}, the case chronicles how ${decisionMaker} must confront an acute inflection point in the ${ind} sector and deliver a definitive strategic blueprint to the Board of Directors within 72 hours.`;

    background = `### 1. The Opening Hook & Impending Board Deadline
On an unseasonably humid Thursday afternoon in late September 2024, ${decisionMaker} paced across the panoramic 8th-floor corner executive suite of ${company}'s corporate headquarters in ${region}. Outside, the commercial corridor buzzed with delivery fleets and commuters. Inside, spread across the 14-person teakwood boardroom table, were three confidential black binders embossed with gold foil: *"STRICTLY CONFIDENTIAL — FOR BOARD OF DIRECTORS ONLY."*

In exactly 72 hours, on Monday at 9:00 AM, the emergency executive committee and institutional audit board would convene. At stake was not a routine budgetary debate, but the fundamental architectural trajectory of the enterprise for the next decade. For thirty years, the company had reigned as an untouchable regional institution. Today, as ${decisionMaker} reviewed the audited Q2 financials, the numbers told an unvarnished truth: the historical business model was running out of runway.

### 2. Enterprise Genesis & The Historical Moat
Established three decades ago with pioneering entrepreneurial capital in ${region}, ${company} had methodically grown from a regional operation into an admired market bellwether in the ${ind} space. Its historic market dominance was underpinned by three mutually reinforcing competitive moats:
- **Proprietary Grassroots Distribution & Logistics**: An asset-heavy logistics and supply network spanning tier-1 metropolitan centers to remote tier-3 trading clusters. Competitors attempting to replicate this physical infrastructure faced prohibitive capital entry barriers.
- **Trusted Brand Equity & Institutional Relationships**: Decades of unblemished delivery, community trust, and multi-generational relationships with retail distributors and enterprise buyers.
- **Frugal Working Capital Discipline**: A conservative balance sheet culture that historically generated consistent double-digit Return on Invested Capital (ROIC) while maintaining a safe debt-to-equity ratio below 0.50x.

### 3. Macro-Environment & Industry Upheaval
However, the preceding 24 months had delivered an unprecedented structural shock across ${region}. Rapid broadband penetration and the ubiquity of smartphone-based commerce enabled venture-backed challenger platforms to bypass physical wholesale intermediaries. These agile competitors deployed asset-light, direct-to-consumer (D2C) architectures, subsidizing customer acquisition through venture equity.

Simultaneously, raw material inflation, rising energy tariffs, and stringent statutory compliance mandates compressed gross margins. Between FY23 and FY25, ${company}'s gross margin contracted by 380 basis points, while customer retention among demographics under the age of 35 dropped by 18%. The core conundrum facing leadership was inescapable: the very asset-heavy infrastructure that had created the company's 30-year moat now imposed severe operational rigidity.`;

    challenge = `### 1. Conflicting Boardroom Perspectives
Behind closed doors, the executive leadership team was sharply fractured into three distinct philosophical camps:

> *"We cannot allow Silicon Valley speculative euphoria to destroy thirty years of audited compounding,"* insisted the Chief Financial Officer, tapping an index finger firmly against the audited cash-flow statement. *"Our debt-to-equity ratio has already climbed from 0.45x to 0.88x. If we greenlight an aggressive ₹140 Crore in-house capital expenditure program today, a single quarter of macroeconomic softness or interest rate spikes could breach our bank loan covenants. Our duty to shareholders is balance sheet solvency."*

> *"Standing still in an industry transition is not conservatism; it is institutional suicide,"* countered the Vice President of Strategic Growth. *"Our traditional wholesale distributor moats are dissolving in real time. If we do not invest heavily into direct-to-consumer digital infrastructure, automated micro-fulfillment hubs, and algorithmic inventory replenishment, our competitors will relegate us to a low-margin contract manufacturer within 36 months."*

> *"The factory floor and logistics network are already operating at 94% capacity,"* cautioned the Chief Operating Officer. *"Morale among our plant managers and frontline logistics partners is fragile. If corporate leadership cuts operational overhead to fund external tech consultants and digital marketing burn, we will trigger severe operational bottlenecks and labor friction."*

### 2. The Strategic Crossroads: Three Mutually Exclusive Alternatives
Faced with ${dilemma}, ${decisionMaker} must present a definitive, cohesive recommendation chosen from three distinct paths:

- **Alternative 1: Aggressive In-House Transformation (Asset-Heavy Expansion)**
  - *Capital Required*: ₹140 Cr – ₹175 Cr (Funded via syndicated bank term loans & internal accruals).
  - *Strategic Mandate*: Construct proprietary automated regional fulfillment hubs, build a native D2C mobile commerce platform, and re-skill 1,200 frontline employees.
  - *Upside*: 100% margin capture, proprietary customer data, sovereign technological IP, and long-term cost leadership.
  - *Downside*: Strains balance sheet leverage (Debt/Equity > 1.1x), depresses near-term ROCE, high IT implementation risk.

- **Alternative 2: Strategic Joint Venture / Inorganic Digital M&A (Asset-Light Alliance)**
  - *Capital Required*: ₹65 Cr – ₹85 Cr (Funded via equity dilution & strategic warrants).
  - *Strategic Mandate*: Acquire a 51% controlling stake in a fast-growing digital startup challenger, or form a 50:50 joint venture with an established logistics-tech platform.
  - *Upside*: Rapid time-to-market (< 6 months), instant acquisition of young digital engineering talent, immediate access to millennial/Gen-Z demographics.
  - *Downside*: Post-merger cultural friction, loss of operational autonomy, governance deadlocks, and brand dilution.

- **Alternative 3: Defensive Consolidation & Margin-Focused Retrenchment**
  - *Capital Required*: ₹25 Cr – ₹35 Cr (Self-funded entirely from operational cash flows).
  - *Strategic Mandate*: Refuse margin-dilutive price wars, exit unprofitable commodity SKU lines, double down on premium institutional accounts, and defend free cash flow.
  - *Upside*: Preserves healthy EBITDA margin (14%+), zero external balance sheet risk, guarantees steady dividend distributions.
  - *Downside*: Cedes market volume share to rivals, caps enterprise scale, leaves the brand vulnerable to generational obsolescence.`;

    decisionPoint = `As the clock counts down to Monday's 9:00 AM board meeting, which strategic alternative should ${decisionMaker} formally endorse, and how should the transition roadmap be financed and governed to protect long-term enterprise value?`;

    questions = [
      `Using Exhibits 1 and 3, diagnose the root structural causes of ${company}'s margin compression and unit economic degradation.`,
      `Conduct a rigorous quantitative stress test comparing Alternative 1, Alternative 2, and Alternative 3 across ROIC, free cash flow runway, and debt covenant vulnerability.`,
      `In light of the boardroom conflict between the CFO, VP Growth, and COO, how should ${decisionMaker} structure the organizational change management process to prevent executive attrition?`,
      `How do regional regulatory mandates and macroeconomic interest rate trends constrain ${company}'s capital structure optionality?`,
      `Synthesize an executive board memorandum for Monday morning detailing your recommended strategic alternative, key implementation milestones, and concrete risk mitigation protocols.`
    ];

    if (objectives.length === 0) {
      objectives = [
        `Master holistic strategic diagnosis of a multi-division enterprise facing structural industry disruption in ${ind}.`,
        `Evaluate complex capital allocation trade-offs between asset-heavy expansion and asset-light inorganic alliances.`,
        `Synthesize qualitative C-suite boardroom conflict with rigorous audited financial statement analysis (${bloomsLevel}).`
      ];
    }

    frameworks = [
      { name: "Porter's Five Forces & Industry Structure", application: "Assessing supplier concentration, threat of tech substitutes, and competitive rivalry.", key_takeaway: "Industry attractiveness is structurally deteriorating without proprietary digital differentiation." },
      { name: "DuPont ROE Decomposition Model", application: "Deconstructing return on equity into net profit margin, asset turnover, and financial leverage.", key_takeaway: "Asset-heavy expansion dilutes ROE unless working capital turnover accelerates proportionally." },
      { name: "VRIO Strategic Capability Audit", application: "Auditing physical distribution infrastructure vs proprietary customer data.", key_takeaway: "Physical assets are valuable but imitable; direct customer relationships and algorithmic data are the true rare moats." }
    ];

  // =========================================================================
  // 4. EXHIBITS GENERATION (FINANCIALS, ORG CHART, MARKET DATA)
  // =========================================================================
  const exhibits: CaseExhibit[] = [];
  const requestedExhibits = params.includeExhibits || ["financials", "market_data", "org_chart"];

  if (requestedExhibits.includes("financials")) {
    exhibits.push({
      id: "exhibit-1",
      title: `Exhibit 1: ${company} — 3-Year Audited Financial Statement & Unit Economics`,
      type: "financials",
      description: "Audited financial highlights, operating margins, capital structure, and unit economics (all figures in ₹ Crores unless noted)",
      data: [
        { metric: "Gross Revenue (Topline)", y2023: "₹1,480 Cr", y2024: "₹1,660 Cr", y2025: "₹1,850 Cr", y2026_proj: "₹1,940 Cr", cagr: "+7.7%" },
        { metric: "Cost of Goods Sold (COGS)", y2023: "₹925 Cr", y2024: "₹1,062 Cr", y2025: "₹1,225 Cr", y2026_proj: "₹1,310 Cr", cagr: "+11.8%" },
        { metric: "Gross Margin %", y2023: "37.5%", y2024: "36.0%", y2025: "33.8%", y2026_proj: "32.5%", cagr: "-370 bps" },
        { metric: "SG&A & Marketing Expenses", y2023: "₹310 Cr", y2024: "₹365 Cr", y2025: "₹428 Cr", y2026_proj: "₹455 Cr", cagr: "+13.6%" },
        { metric: "Operating EBITDA", y2023: "₹245 Cr", y2024: "₹233 Cr", y2025: "₹197 Cr", y2026_proj: "₹175 Cr", cagr: "-10.6%" },
        { metric: "EBITDA Margin %", y2023: "16.6%", y2024: "14.0%", y2025: "10.6%", y2026_proj: "9.0%", cagr: "-600 bps" },
        { metric: "Depreciation & Amortization", y2023: "₹48 Cr", y2024: "₹54 Cr", y2025: "₹62 Cr", y2026_proj: "₹68 Cr", cagr: "+9.2%" },
        { metric: "Operating Profit (EBIT)", y2023: "₹197 Cr", y2024: "₹179 Cr", y2025: "₹135 Cr", y2026_proj: "₹107 Cr", cagr: "-15.7%" },
        { metric: "Finance & Interest Costs", y2023: "₹24 Cr", y2024: "₹36 Cr", y2025: "₹52 Cr", y2026_proj: "₹65 Cr", cagr: "+39.4%" },
        { metric: "Profit After Tax (Net Income)", y2023: "₹130 Cr", y2024: "₹107 Cr", y2025: "₹62 Cr", y2026_proj: "₹32 Cr", cagr: "-37.6%" },
        { metric: "Free Cash Flow (FCF)", y2023: "₹118 Cr", y2024: "₹84 Cr", y2025: "₹38 Cr", y2026_proj: "₹12 Cr", cagr: "-53.2%" },
        { metric: "Debt-to-Equity Ratio", y2023: "0.45x", y2024: "0.62x", y2025: "0.88x", y2026_proj: "1.12x", cagr: "+43 bps" },
        { metric: "Working Capital Cycle (Days)", y2023: "42 Days", y2024: "49 Days", y2025: "58 Days", y2026_proj: "64 Days", cagr: "+22 Days" },
        { metric: "Customer Acquisition Cost (CAC)", y2023: "₹480", y2024: "₹590", y2025: "₹760", y2026_proj: "₹920", cagr: "+24.2%" },
      ]
    });
  }

  if (requestedExhibits.includes("org_chart")) {
    exhibits.push({
      id: "exhibit-2",
      title: "Exhibit 2: Organizational Governance & C-Suite Decision Matrix",
      type: "org_chart",
      description: "Board of Directors, Executive Committee hierarchy, and strategic mandates at the heart of the dispute",
      data: [
        { role: "Board of Directors (Chairmanship)", occupant: "Independent Chairperson & 6 Non-Executive Directors", mandate: "Fiduciary oversight, audit compliance, capital allocation approvals above ₹50 Cr" },
        { role: "Managing Director & CEO", occupant: decisionMaker, mandate: "Overall enterprise strategy, P&L accountability, board-executive consensus building" },
        { role: "Chief Financial Officer (CFO)", occupant: "S. K. Venkatesh, Senior Partner", mandate: "Treasury management, banking covenants, risk underwriting, debt management" },
        { role: "VP of Strategic Growth & Digital", occupant: "Dr. Kavita Rao, Head of Strategy", mandate: "D2C omnichannel initiatives, startup acquisitions, customer acquisition architecture" },
        { role: "Chief Operating Officer (COO)", occupant: "Maheshwar Rao, EVP Logistics", mandate: "Plant management, warehouse automation, regional supply chain logistics, labor relations" }
      ]
    });
  }

  if (requestedExhibits.includes("market_data")) {
    exhibits.push({
      id: "exhibit-3",
      title: `Exhibit 3: Competitive Market Share & Industry Benchmark Matrix in ${region} (FY25)`,
      type: "market_data",
      description: `Market concentration, pricing power index, and digital penetration across ${region}`,
      data: [
        { firm: company, market_share: "34.2%", yoy_growth: "+4.1%", pricing_power: "100 (Index Base)", digital_mix: "14.2%", nps: "+48" },
        { firm: "Venture-Backed Digital Challenger A", market_share: "22.8%", yoy_growth: "+32.4%", pricing_power: "88 (-12%)", digital_mix: "86.5%", nps: "+58" },
        { firm: "National Conglomerate Division B", market_share: "19.5%", yoy_growth: "+14.8%", pricing_power: "94 (-6%)", digital_mix: "42.0%", nps: "+44" },
        { firm: "Unorganized & Regional Micro-Producers", market_share: "23.5%", yoy_growth: "-8.5%", pricing_power: "78 (-22%)", digital_mix: "4.0%", nps: "+24" }
      ]
    });
  }

  const content: CaseContent = {
    title,
    summary,
    background,
    challenge,
    key_data: [
      { metric: "Operating Margin (EBITDA)", value: "16.6% -> 10.6%", period: "Trailing 36M", notes: "-600 bps structural contraction" },
      { metric: "Debt-to-Equity Ratio", value: "0.88x (Covenant: 1.0x)", period: "FY25 Audited", notes: "Approaching debt covenant ceiling" },
      { metric: "Customer Acquisition Cost (CAC)", value: "₹760 (+24.2% YoY)", period: "FY25 Benchmark", notes: "Digital marketing bid inflation" },
      { metric: "Free Cash Flow (FCF)", value: "₹38 Cr (-53.2%)", period: "FY25 Trailing", notes: "Severe cash generation squeeze" },
      { metric: "Working Capital Cycle", value: "58 Days (vs 42 Days)", period: "FY25 Audited", notes: "Inventory buildup in regional warehouses" },
      { metric: "Proposed CAPEX Outlay", value: "₹140 Cr – ₹175 Cr", period: "Phase 1 Dilemma", notes: "Central capital allocation choice" },
      { metric: "Millennial Retention Drop", value: "-18% YoY", period: "Under-35 Cohort", notes: "Customer migration to digital rivals" },
      { metric: "Plant Capacity Utilization", value: "94.2%", period: "Current Trailing", notes: "High physical asset utilization" }
    ],
    decision_point: decisionPoint,
    discussion_questions: questions,
    exhibits,
    primary_company: company,
    location_market: region,
    central_dilemma: dilemma,
    key_decision_maker: decisionMaker,
    protagonists,
    learning_objectives: objectives,
    domain,
    difficulty: params.difficulty || "Intermediate",
    target_audience: targetAudience,
    tone,
    blooms_level: bloomsLevel,
    verify_facts_flag: isReal,
    figures_disclaimer: "All specific operational metrics, balance sheet figures, and organizational details are pedagogical models designed for rigorous classroom case analysis at Shanti Business School.",
  };

  if (params.includeTeachingNote !== false) {
    content.teaching_note = {
      objectives,
      class_flow: [
        {
          phase: "Phase 1: Opening Cold Call & Dilemma Framing",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call to students asking: "${decisionMaker} has 72 hours before the board meeting. What is the fundamental root cause of the crisis—is it balance sheet stress, technological obsolescence, or cultural complacency?"`,
          expected_response: "Model Diagnostic Answer: The fundamental driver is structural digital disruption combined with debt-financed operational rigidity, rather than temporary balance sheet stress. Students must diagnose that 30 years of traditional distributor moats failed to prevent the 380 bps gross margin contraction as direct-to-consumer challenger platforms bypassed wholesale networks."
        },
        {
          phase: "Phase 2: Quantitative Exhibit & Financial Stress-Testing",
          duration_minutes: isShort ? 15 : 30,
          activity: "Divide the class into 3 analytical squads. Task Squad A with calculating debt covenant headroom under Alternative 1; Squad B with evaluating post-merger integration risks under Alternative 2; and Squad C with computing the terminal valuation impact of Alternative 3.",
          expected_response: "Quantitative Solutions & Headroom Stress-Test:\n• Squad A (Alternative 1): Debt-to-Equity reaches 1.12x in 2026, leaving minimal headroom before breaching the 1.20x bank loan covenant.\n• Squad B (Alternative 2): Acquiring a 51% stake costs ₹65–85 Cr with high post-merger integration friction between startup agility and legacy logistics.\n• Squad C (Alternative 3): Preserves healthy near-term EBITDA (14%) and FCF (₹38 Cr), but caps terminal growth at 2%, risking long-term obsolescence."
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Alternative Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay where students represent the CFO, VP Growth, and COO. Force students to defend their specific capital allocation choice under intense peer cross-examination.",
          expected_response: "Boardroom Debate Defense Key:\n• CFO Defense: Prioritizes solvency; leverage >1.0x in an inflationary environment threatens bankruptcy.\n• VP Growth Defense: Failure to invest guarantees permanent degradation into a contract manufacturer within 36 months.\n• COO Defense: Frontline plants at 94% capacity cannot absorb arbitrary overhead cuts without severe supply chain disruptions.\n• Consensus Synthesis: Adopt a phased hybrid route—defend core cash flows (Alternative 3) to self-fund an initial asset-light joint venture (Alternative 2) before committing ₹140 Cr to in-house automation."
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Layout Consolidation",
          duration_minutes: isShort ? 5 : 15,
          activity: "Consolidate the classroom consensus onto the 3-Board plan: Board 1 (Symptoms vs Root Causes), Board 2 (DuPont & Porter Framework Evaluation), and Board 3 (Recommended Action Plan & Governance Milestones).",
          expected_response: "3-Board Classroom Blackboard Solution:\n• Board 1 (Diagnosis): Margin erosion (-370 bps), customer acquisition cost inflation (+24.2%), under-35 customer flight (-18%).\n• Board 2 (Framework Rigor): DuPont ROE deconstruction (asset turnover dilution) + Porter's Five Forces (threat of tech substitutes).\n• Board 3 (Action Milestones): 90-day governance roadmap with phased debt covenants and executive alignment."
        }
      ],
      frameworks,
    };
  }

  const baseTokens = isResearch ? 5400 : isShort ? 2200 : 4600;
  const exhibitBonus = exhibits.length * 400;
  const tokensUsed = baseTokens + exhibitBonus;

  return {
    content,
    tokensUsed,
    promptTokens: 640,
    completionTokens: tokensUsed - 640,
    model: (isShort || params.type === "flash")
      ? (process.env.FAST_MODEL || "ai-case-engine-fast (simulated)")
      : (process.env.QUALITY_MODEL || "ai-case-engine-quality (simulated)"),
  };
}
