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
  language: CaseLanguage; // 'en' | 'hi' | 'gu'
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
  language: CaseLanguage;
  format: CaseFormat;
  type: CaseType;
  tone?: CaseTone;
  bloomsLevel?: string;
  includeTeachingNote?: boolean;
  includeExhibits?: ("financials" | "org_chart" | "market_data")[];
}): string {
  const languageNames: Record<CaseLanguage, string> = {
    en: "English",
    hi: "Hindi (हिंदी)",
    gu: "Gujarati (ગુજરાતી)",
  };

  const selectedLang = languageNames[params.language] || "English";

  return `You are a distinguished Professor of Business Administration and Master Case Writer at ${COLLEGE_NAME_WITH_SHORT}.
Your mission is to write an original, rigorous, academically authoritative pedagogical teaching case study.

CRITICAL INSTRUCTIONS:
1. OUTPUT LANGUAGE: The ENTIRE case content, including headings, questions, and teaching notes MUST be in ${selectedLang}.
2. FORMAT: You MUST return a single valid JSON object strictly conforming to the requested schema. Do NOT enclose in markdown code fences (\`\`\`json) if possible, or provide raw JSON only.
3. TONE & PEDAGOGY:
   - Case Tone: ${params.tone || "Academic"} (${
     params.tone === "Journalistic"
       ? "Narrative storytelling, investigative reporting realism, stakeholder quotes"
       : params.tone === "Executive Briefing"
       ? "Concise C-suite strategy memo style, bullet-forward, direct operational trade-offs"
       : "Scholarly, authoritative, theoretical rigor appropriate for top-tier management education"
   }).
   - Bloom's Taxonomy Alignment: ${params.bloomsLevel || "Apply & Analyze"}.
4. TEACHING INTEGRITY:
   - Mark all invented financial or quantitative figures as "illustrative".
   - NEVER fabricate quotes from real living or historical figures. Attribute statements to organizational titles (e.g. "The Chief Financial Officer noted...") or clearly state hypothetical personas.
   ${
     params.format === "real_signal"
       ? '- REAL SIGNAL MODE: Add a prominent "verify_facts_flag: true" in the JSON. Include real observable macro or industry signals, and remind educators to verify current real-time filings.'
       : '- HYPOTHETICAL MODE: Set "verify_facts_flag: false". Create plausible fictionalized enterprise scenarios.'
   }
   ${
     params.type === "short" || params.type === "flash"
       ? "- SHORT CASE FORMAT (~2 pages, 1,200 - 1,800 words): High-intensity, tightly framed operational tension. Crisp context, immediate managerial decision under time pressure, 3 analytical questions, compact 45-minute classroom flow."
       : params.type === "research"
       ? "- CASE RESEARCH FORMAT (Multi-Company Comparison, 4,000 - 6,000 words): In-depth cross-firm strategic benchmark comparing 2 to 3 competing companies in the sector. Evaluates contrasting strategic models (e.g. incumbent vs disruptor, asset-heavy vs asset-light). Includes comparative exhibit tables, industry benchmark matrix, and cross-enterprise synthesis questions."
       : "- FULL CASE FORMAT (8-10 pages, 3,500 - 5,000 words): Comprehensive Harvard/Ivey-standard case study with deep institutional context, industry backdrop, detailed financial metrics, and multi-phased teaching note."
   }

SCHEMA:
{
  "title": "Clear, compelling case study title",
  "summary": "Executive abstract (100-150 words)",
  "background": "Historical, market, and enterprise context",
  "challenge": "Core business dilemma and operational tension",
  "key_data": [
    { "metric": "Metric name", "value": "Metric value", "period": "Timeframe", "notes": "illustrative or source" }
  ],
  "decision_point": "The exact crossroads question the protagonist/board must answer",
  "discussion_questions": [
    "Question 1 (Diagnosis)",
    "Question 2 (Quantitative/Analytical)",
    "Question 3 (Strategic Trade-off)",
    "Question 4 (Implementation & Governance)",
    "Question 5 (Synthesis/Executive Action)"
  ],
  "exhibits": [
    {
      "id": "exhibit-1",
      "title": "Exhibit 1: Key Financials & Unit Economics",
      "type": "financials",
      "description": "Historical 3-year performance breakdown",
      "data": [
        { "label": "Metric A", "value": "Value A" }
      ]
    }
  ],
  ${
    params.includeTeachingNote !== false
      ? `"teaching_note": {
    "objectives": ["Objective 1", "Objective 2"],
    "class_flow": [
      { "phase": "Phase title", "duration_minutes": 20, "activity": "Classroom activity" }
    ],
    "frameworks": [
      { "name": "Framework 1", "application": "How to apply in class", "key_takeaway": "Core insight" },
      { "name": "Framework 2", "application": "How to apply in class", "key_takeaway": "Core insight" },
      { "name": "Framework 3", "application": "How to apply in class", "key_takeaway": "Core insight" }
    ]
  },`
      : ""
  }
  "verify_facts_flag": ${params.format === "real_signal" ? "true" : "false"},
  "figures_disclaimer": "All specific metrics and financial models are illustrative pedagogical tools."
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
- Language: ${params.language}
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
 * High-fidelity fallback generating authentic teaching cases across English, Hindi, and Gujarati
 */
function generateHighFidelityMockCase(params: GenerateCaseParams): GenerationResult {
  const isShort = params.type === "short" || params.type === "flash";
  const isResearch = params.type === "research";
  const isReal = params.format === "real_signal";
  const lang = params.language;
  const ind = params.industry || "Fintech & Banking";
  const func = params.functionalFocus || "Strategic Finance & Capital Allocation";
  const domain = params.domain || "Strategy";
  const company = params.primaryCompany?.trim() || (isReal ? "Gujarat Co-operative Milk Marketing Federation (Amul)" : "Apex Strategic Enterprises Ltd");
  const region = params.locationMarket?.trim() || params.contextRegion || "Gujarat, India";
  const dilemma = params.centralDilemma?.trim() || "Whether to allocate $15M toward an aggressive digital infrastructure overhaul or defend operating margins by entering a joint-venture partnership.";
  const decisionMaker = params.keyDecisionMaker?.trim() || "Chief Executive Officer & Board of Directors";
  const protagonists = params.protagonists?.trim() || "Managing Director, Chief Operating Officer, VP of Strategic Growth";
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

  if (isResearch) {
    // Multi-company comparison
    const competitor = isReal ? "Modern Trade Conglomerates & D2C Challengers" : "Vanguard Technologies & Nova Group";
    title = `Case Research: ${company} vs. ${competitor} — Strategic Paradigms in ${ind} (${region})`;
    summary = `A rigorous multi-company comparative research case contrasting the strategic positioning, unit economics, and governance structures of ${company} and its primary rivals. The study examines how divergent operating models impact market resilience across ${region}.`;
    background = `The ${ind} sector across ${region} has reached a pivotal juncture. While ${company} built its market dominance through asset-heavy supply integration and deep regional distribution networks, emerging competitors adopted asset-light, venture-backed digital models. Over the past 36 months, regulatory shifts and changing buyer behavior have heightened competitive parity.`;
    challenge = `Comparative analysis reveals contrasting operational trajectories: ${company} maintains a steady 11.4% operating margin but grapples with 4.2% YoY digital growth. In contrast, key competitors demonstrate 32% top-line expansion while incurring substantial operating burn (-18.6% EBITDA). The central conflict for ${decisionMaker} and leadership (${protagonists}) is whether to match rival digital customer acquisition spend or protect structural free cash flows.`;
    decisionPoint = `How should ${decisionMaker} synthesize competitor benchmarks to formulate a 3-year strategic posture: pivot to an asset-light subscription model, acquire a venture-backed competitor, or fortify proprietary moats?`;
    questions = [
      `Construct a strategic comparison matrix evaluating the business models of ${company} versus its key industry competitors.`,
      `Analyze the comparative unit economics presented in the exhibits. Which enterprise possesses a more sustainable path to long-term economic profit (EVA)?`,
      `How do differing governance structures (cooperative/family-owned vs. venture/publicly-backed) constrain strategic risk tolerance?`,
      `From the perspective of ${protagonists}, what organizational capabilities must be built or acquired to bridge the digital efficiency gap?`,
      `Synthesize an executive decision recommendation for the board meeting, detailing trade-offs under both high-growth and margin-contraction scenarios.`
    ];
    if (objectives.length === 0) {
      objectives = [
        `Conduct systematic multi-firm strategic benchmarking within the ${ind} sector.`,
        `Evaluate trade-offs between asset-heavy traditional models and asset-light digital disruption.`,
        `Formulate defensible competitive strategies aligned with ${bloomsLevel} cognitive objectives.`
      ];
    }
    frameworks = [
      { name: "Strategic Group Mapping", application: "Mapping market participants along pricing power and digital integration axes.", key_takeaway: "Direct confrontation in commoditized segments erodes industry profitability." },
      { name: "DuPont Financial Decomposition", application: "Deconstructing ROE differences between asset turnover and profit margin.", key_takeaway: "Capital intensity differences explain long-term structural returns." },
      { name: "Competitive Dynamics & Game Theoretic Signaling", application: "Anticipating competitor responses to price cuts and capacity additions.", key_takeaway: "Pre-emptive commitment deters speculative competitor expansion." }
    ];
  } else if (isShort) {
    // Short Case (~2 pages)
    title = `Short Case: Crossroad Dilemma at ${company} (${region})`;
    summary = `A high-intensity boardroom dilemma focusing on ${company} in ${region}. Faced with ${dilemma}, ${decisionMaker} must determine an immediate course of action within a 30-day window.`;
    background = `${company} operates as a prominent player in the ${ind} market across ${region}. Over the preceding two quarters, sudden external shifts disrupted baseline forecasts, accelerating the need for executive intervention.`;
    challenge = `With liquidity reserves tightening to 45 days of operating overhead, ${decisionMaker} faces an urgent trade-off: ${dilemma}`;
    decisionPoint = `What concrete directive should ${decisionMaker} issue to ${protagonists} at Monday morning's emergency executive committee meeting?`;
    questions = [
      `Diagnose the immediate root cause of the operational crisis facing ${company}.`,
      `Using the key figures provided, compute the break-even run rate under both defensive and expansionary paths.`,
      `What 30-day action steps should ${decisionMaker} implement to mitigate stakeholder panic and maintain operational continuity?`
    ];
    if (objectives.length === 0) {
      objectives = [
        `Identify acute operational bottlenecks under severe time constraints.`,
        `Perform rapid quantitative stress-testing on core enterprise metrics.`
      ];
    }
    frameworks = [
      { name: "Eisenhower Decision Matrix under Crisis", application: "Prioritizing immediate cash preservation vs. strategic positioning.", key_takeaway: "Survival precedes optimization in volatile inflection points." },
      { name: "Operational Break-Even Sensitivity", application: "Calculating downside cushion across volume and pricing scenarios.", key_takeaway: "Variable cost flexibilization provides critical runway." }
    ];
  } else {
    // Full Case Study (8-10 pages)
    title = `Strategic Leadership: ${company} and the Transformation of ${ind} in ${region}`;
    summary = `A comprehensive multi-phased pedagogical case study chronicling the evolution, operational complexity, and strategic dilemmas confronting ${company}. Tailored for ${targetAudience} level courses in ${domain}, the case explores ${dilemma}.`;
    background = `Established with foundational roots in ${region}, ${company} grew over decades into an institutional bellwether within ${ind}. This extensive case study traces the company's historical milestones, regulatory environment, regional competitive rivalries, and internal operational culture. As market conditions shifted, legacy processes came into direct friction with modern consumer expectations.`;
    challenge = `Executive leadership finds itself at an unprecedented crossroads: ${dilemma}. Internal debates between ${protagonists} mirror wider industry dilemmas regarding capital intensity, digital disruption, and regional supply chain sovereignty. Customer retention metrics indicate growing vulnerability, while capital expenditure requirements threaten historical return on invested capital (ROIC).`;
    decisionPoint = `In the forthcoming board meeting, what strategic program should ${decisionMaker} sponsor: an aggressive internal transformation, an equity carve-out, or a strategic merger?`;
    questions = [
      `Critically examine the institutional history and source of sustainable competitive advantage (moat) for ${company}.`,
      `Deconstruct the organizational tensions between legacy operating units and emerging digital divisions as voiced by ${protagonists}.`,
      `Conduct a comprehensive financial review using Exhibit 1 and Exhibit 3. How resilient is ${company}'s balance sheet against a 15% revenue contraction?`,
      `Evaluate the regulatory and macroeconomic constraints operating across ${region}. How do compliance mandates impact strategic optionality?`,
      `Formulate a detailed 3-year phased strategic roadmap for ${decisionMaker}, including governance checkpoints, capital milestones, and risk-mitigation measures.`
    ];
    if (objectives.length === 0) {
      objectives = [
        `Master holistic strategic diagnosis of a complex multi-division enterprise in ${ind}.`,
        `Evaluate long-term capital allocation, governance, and managerial incentives in ${domain}.`,
        `Synthesize qualitative stakeholder tensions with rigorous quantitative financial exhibits.`
      ];
    }
    frameworks = [
      { name: "Porter's 5 Forces & Industry Structure", application: "Assessing bargaining power of regional suppliers and threat of tech substitutes.", key_takeaway: "Industry attractiveness is structurally deteriorating without digital differentiation." },
      { name: "VRIO Strategic Capability Framework", application: "Auditing proprietary logistical assets, brand equity, and tacit organizational knowledge.", key_takeaway: "Physical assets are imitable; proprietary customer data and vendor goodwill are rare." },
      { name: "Kotter's 8-Step Change Leadership Model", application: "Guiding the executive transition and overcoming internal departmental resistance.", key_takeaway: "Urgency without clear coalition alignment results in bureaucratic stalemate." }
    ];
  }

  // Generate requested exhibits
  const exhibits: CaseExhibit[] = [];
  const requestedExhibits = params.includeExhibits || ["financials", "market_data"];

  if (requestedExhibits.includes("financials")) {
    exhibits.push({
      id: "exhibit-1",
      title: `Exhibit 1: ${company} — 3-Year Historical & Projected Financial Performance`,
      type: "financials",
      description: "Audited financial highlights, operating margins, and unit economics (in ₹ Crores / Millions)",
      data: [
        { metric: "Gross Revenue", y2024: "₹1,420 Cr", y2025: "₹1,580 Cr", y2026_est: "₹1,640 Cr", cagr: "+7.5%" },
        { metric: "Cost of Goods Sold (COGS)", y2024: "₹890 Cr", y2025: "₹1,020 Cr", y2026_est: "₹1,090 Cr", cagr: "+10.7%" },
        { metric: "Gross Margin %", y2024: "37.3%", y2025: "35.4%", y2026_est: "33.5%", cagr: "-190 bps" },
        { metric: "Operating EBITDA", y2024: "₹210 Cr", y2025: "₹195 Cr", y2026_est: "₹172 Cr", cagr: "-9.5%" },
        { metric: "EBITDA Margin %", y2024: "14.8%", y2025: "12.3%", y2026_est: "10.5%", cagr: "-430 bps" },
        { metric: "Free Cash Flow (FCF)", y2024: "₹115 Cr", y2025: "₹82 Cr", y2026_est: "₹38 Cr", cagr: "-42.5%" },
        { metric: "Customer Acquisition Cost (CAC)", y2024: "₹420", y2025: "₹590", y2026_est: "₹740", cagr: "+32.7%" },
        { metric: "Debt-to-Equity Ratio", y2024: "0.45x", y2025: "0.62x", y2026_est: "0.88x", cagr: "+43 bps" },
      ]
    });
  }

  if (requestedExhibits.includes("org_chart")) {
    exhibits.push({
      id: "exhibit-2",
      title: `Exhibit 2: Organizational Hierarchy & Governance Architecture`,
      type: "org_chart",
      description: "Leadership structure, reporting channels, and key decision-making bodies at the center of the dispute",
      data: [
        { role: "Board of Directors & Audit Committee", occupant: "Independent Chairman & 6 Non-Executive Directors", mandate: "Fiduciary oversight and long-term capital allocation approvals" },
        { role: "Chief Executive Officer & Managing Director", occupant: decisionMaker, mandate: "Overall enterprise performance, stakeholder alignment, strategic execution" },
        { role: "Chief Financial Officer (CFO)", occupant: "S. K. Venkatesh, Senior Partner", mandate: "Treasury, debt covenants, cost optimization, risk underwriting" },
        { role: "Head of Strategy & Digital Transformation", occupant: "Dr. Kavita Rao, VP Growth", mandate: "Digital ecosystem integration, D2C channel expansion, technology investments" },
        { role: "Chief Operating Officer & Supply Chain Head", occupant: "Maheshwar Rao, EVP Logistics", mandate: "Regional distribution, warehouse infrastructure, labor relations" }
      ]
    });
  }

  if (requestedExhibits.includes("market_data")) {
    exhibits.push({
      id: "exhibit-3",
      title: `Exhibit 3: Competitive Landscape & Regional Market Share in ${ind}`,
      type: "market_data",
      description: `Market concentration, growth vectors, and pricing power across ${region} (FY26)`,
      data: [
        { firm: company, market_share: "34.2%", yoy_growth: "+4.1%", pricing_index: "100 (Benchmark)", nps: "+48" },
        { firm: "Regional Challenger Alpha", market_share: "22.8%", yoy_growth: "+14.6%", pricing_index: "92 (-8%)", nps: "+36" },
        { firm: "National Digital Platform Beta", market_share: "18.5%", yoy_growth: "+31.2%", pricing_index: "85 (-15%)", nps: "+54" },
        { firm: "Unorganized & Local Micro-Producers", market_share: "24.5%", yoy_growth: "-6.8%", pricing_index: "78 (-22%)", nps: "+22" }
      ]
    });
  }

  const content: CaseContent = {
    title,
    summary,
    background,
    challenge,
    key_data: [
      { metric: "Operating Margin (EBITDA)", value: "14.8% -> 10.5%", period: "Trailing 24 Months", notes: "Illustrative pedagogical model" },
      { metric: "Customer Acquisition Cost", value: "₹740 (+32.7% YoY)", period: "FY26 Benchmark", notes: "Illustrative market estimate" },
      { metric: "Proposed Capital Deployment", value: "$15.0M / ₹125 Cr", period: "Phase 1 Execution", notes: "Target investment plan" },
      { metric: "Regulatory Capital Reserve", value: "₹24.5 Cr", period: "Statutory Escrow", notes: "Compliance mandatory reserve" }
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
    figures_disclaimer: "All specific operational figures, financial metrics, and organizational charts are pedagogical models designed for classroom instruction.",
  };

  if (params.includeTeachingNote !== false) {
    content.teaching_note = {
      objectives,
      class_flow: [
        {
          phase: "Opening Cold Call & Dilemma Staging",
          duration_minutes: isShort ? 10 : 20,
          activity: `Direct inquiry targeting ${decisionMaker}'s immediate decision options. Establish the stakes of the conflict.`
        },
        {
          phase: "Quantitative & Exhibit Dissection",
          duration_minutes: isShort ? 15 : 35,
          activity: "Break students into analytical teams to examine Exhibit 1 (Financials) and Exhibit 3 (Market Share)."
        },
        {
          phase: "Strategic Synthesis & Action Plan",
          duration_minutes: isShort ? 15 : 25,
          activity: "Consolidate student recommendations on the blackboard. Contrast short-term risk against long-term defensibility."
        }
      ],
      frameworks,
    };
  }

  const baseTokens = isResearch ? 4800 : isShort ? 1600 : 3800;
  const exhibitBonus = exhibits.length * 400;
  const tokensUsed = baseTokens + exhibitBonus;

  return {
    content,
    tokensUsed,
    promptTokens: 520,
    completionTokens: tokensUsed - 520,
    model: (isShort || params.type === "flash")
      ? (process.env.FAST_MODEL || "ai-case-engine-fast (simulated)")
      : (process.env.QUALITY_MODEL || "ai-case-engine-quality (simulated)"),
  };
}
