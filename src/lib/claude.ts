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
Your mission is to write an original, authentic, publication-grade pedagogical teaching case study conforming to the gold standard of Harvard Business School (HBS), Stanford GSB, and Ivey Publishing.

CRITICAL PEDAGOGICAL & NARRATIVE ARCHITECTURE:
1. OUTPUT LANGUAGE: The ENTIRE case content, including section narrative, exhibits, headings, quotes, and teaching notes MUST be written in ${selectedLang}.
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
  "title": "Compelling, formal case study title in ${selectedLang}",
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
      { "phase": "Opening Cold Call & Dilemma Framing", "duration_minutes": 15, "activity": "Challenge protagonist assumptions" },
      { "phase": "Quantitative Stress-Testing", "duration_minutes": 30, "activity": "Dissect exhibits and balance sheet covenants" },
      { "phase": "Boardroom Alternative Debate", "duration_minutes": 30, "activity": "Weigh Alternative 1 vs 2 vs 3" },
      { "phase": "Plenary Synthesis & Takeaways", "duration_minutes": 15, "activity": "Consolidate 3-Board layout" }
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
  // 1. HINDI LOCALIZATION (हिंदी)
  // =========================================================================
  if (lang === "hi") {
    title = `रणनीतिक नेतृत्व और व्यावसायिक परिवर्तन: ${company} के समक्ष ${ind} क्षेत्र में रणनीतिक संकट (${region})`;
    summary = `शांति बिजनेस स्कूल (SBS) का यह प्रामाणिक शिक्षण केस स्टडी ${company} के शीर्ष नेतृत्व के समक्ष उत्पन्न पूंजी आवंटन, प्रतिस्पर्धी दबाव और संगठनात्मक परिवर्तन की गंभीर दुविधा का विश्लेषण करता है। ${region} के आर्थिक परिवेश में, ${decisionMaker} को अगले 72 घंटों में निदेशक मंडल के समक्ष एक सर्वसम्मत रणनीतिक योजना प्रस्तुत करनी है।`;
    
    background = `### 1. परिचयात्मक पृष्ठभूमि और तात्कालिक संकट
सितंबर 2024 की एक महत्वपूर्ण शाम को, ${region} स्थित ${company} के कॉरपोरेट मुख्यालय के 8वें तल पर, ${decisionMaker} अपनी कार्यमेज़ पर फैली गोपनीय वित्तीय रिपोर्टों का गहन अध्ययन कर रहे थे। मेज़ पर सोमवार सुबह 9:00 बजे आयोजित होने वाली आपातकालीन निदेशक मंडल बैठक (Board of Directors Meeting) के तीन विस्तृत खंड रखे थे। प्रश्न केवल कुछ बजट मदों का नहीं था, बल्कि यह निर्णय कंपनी के आगामी 10 वर्षों के भविष्य और बाजार में उसके अस्तित्व को पुनर्परिभाषित करने वाला था।

### 2. उद्यम की ऐतिहासिक यात्रा और मुख्य प्रतिस्पर्धात्मक लाभ
विगत तीन दशकों में, ${company} ने ${region} के ${ind} क्षेत्र में एक विश्वसनीय और अग्रणी संस्थान के रूप में अपनी विशिष्ट पहचान बनाई थी। कंपनी का ऐतिहासिक प्रतिस्पर्धी लाभ (Competitive Moat) मुख्य रूप से तीन स्तंभों पर आधारित था:
- **जमीनी आपूर्ति श्रृंखला और प्रत्यक्ष नेटवर्क**: टियर-1 से लेकर टियर-3 शहरों तक फैला व्यापक और सुदृढ़ वितरण तंत्र, जिसकी नकल करना किसी भी नए प्रतिस्पर्धी के लिए अत्यंत कठिन था।
- **ब्रांड निष्ठा और संस्थागत साख**: दशकों की विश्वसनीय ग्राहक सेवा और गुणवत्ता के दम पर अर्जित असाधारण ग्राहक सद्भावना (Goodwill)।
- **मितव्ययी परिचालन और कार्यशील पूंजी अनुशासन**: ऋण-इक्विटी अनुपात को हमेशा नियंत्रित रखते हुए स्वस्थ दोहरे अंकों में नियोजित पूंजी पर प्रतिफल (ROIC) अर्जित करना।

### 3. व्यापक बाजार परिवर्तन और तकनीकी उथल-पुथल
किंतु पिछले 24 महीनों में उद्योग की परिस्थितियों में अभूतपूर्व संरचनात्मक उथल-पुथल आई। वेंचर-कैपिटल समर्थित नए डिजिटल स्टार्टअप्स ने भारी छूट और प्रत्यक्ष उपभोक्ता (D2C) मॉडल के बल पर आक्रामक विपणन शुरू कर दिया। इसके अतिरिक्त, कच्चे माल की मुद्रास्फीति और नई नियामक अनुपालन नीतियों ने परिचालन लागत में भारी वृद्धि कर दी। FY23 से FY25 के मध्य, कंपनी के सकल लाभ मार्जिन (Gross Margin) में 380 आधार अंकों की गिरावट दर्ज की गई, जबकि युवा ग्राहकों (35 वर्ष से कम) के वर्ग में कंपनी का बाजार हिस्सा 18% कम हो गया।`;

    challenge = `### 1. बोर्डरूम में परस्पर विरोधी दृष्टिकोण (हितधारकों के उद्धरण)
शीर्ष प्रबंधन के मध्य तीन प्रमुख अधिकारियों के विचार स्पष्ट रूप से विभाजित हो चुके थे:

> *"हम तीन दशकों से निर्मित वित्तीय अनुशासन को किसी अनिश्चित तकनीकी जुए की भेंट नहीं चढ़ा सकते,"* मुख्य वित्तीय अधिकारी (CFO) ने ऑडिट की गई वित्तीय रिपोर्ट पर उंगली रखते हुए जोर दिया। *"हमारा ऋण-इक्विटी अनुपात 0.45x से बढ़कर 0.88x तक पहुंच चुका है। यदि हम इस समय ₹140 करोड़ का भारी पूंजीगत व्यय (CAPEX) करते हैं, तो मांग में थोड़ी सी भी कमी हमारी बैंक शर्तों (Debt Covenants) का उल्लंघन कर सकती है।"*

> *"यदि हमने स्वयं अपने पारंपरिक मॉडल को नहीं बदला, तो बाजार हमें बाहर कर देगा,"* रणनीतिक विकास उपाध्यक्ष (VP of Growth) ने दृढ़ता से प्रतिवाद किया। *"हमारे पारंपरिक वितरक संबंध कमजोर पड़ रहे हैं। यदि हम आधुनिक डिजिटल तकनीक और सीधे उपभोक्ता तक पहुंचने वाले मंच में निवेश नहीं करेंगे, तो 36 महीनों में हम केवल एक कम मार्जिन वाले सप्लायर बनकर रह जाएंगे।"*

> *"हमारे संयंत्र और क्षेत्रीय वितरण साझेदार पहले से ही अपनी 94% क्षमता पर कार्य कर रहे हैं,"* मुख्य परिचालन अधिकारी (COO) ने आगाह किया। *"यदि हमने डिजिटल निवेश के लिए मौजूदा परिचालन बजट में कटौती की, तो कर्मचारियों का मनोबल गिरेगा और आपूर्ति व्यवस्था बाधित हो सकती है।"*

### 2. रणनीतिक चौराहा: तीन परस्पर अनन्य विकल्प
${dilemma} के संदर्भ में, ${decisionMaker} के समक्ष तीन स्पष्ट विकल्प प्रस्तुत हैं:

- **विकल्प 1: आक्रामक आंतरिक डिजिटल परिवर्तन (भारी पूंजीगत व्यय)**
  - *आवश्यक पूंजी*: ₹140 Cr – ₹175 Cr (बैंक ऋण और आंतरिक संचय द्वारा)।
  - *रणनीति*: अत्याधुनिक स्वचालित आपूर्ति तंत्र, एकीकृत मोबाइल प्लेटफॉर्म और 1,200 कर्मचारियों का तकनीकी पुनर्कौशल।
  - *सकारात्मक पक्ष*: दीर्घकालिक लागत नेतृत्व, 100% मार्जिन नियंत्रण और तकनीकी संप्रभुता।
  - *जोखिम*: अल्पकालिक लाभ में तीव्र संकुचन, उच्च ऋण भार और क्रियान्वयन की विफलता की आशंका।

- **विकल्प 2: रणनीतिक संयुक्त उद्यम / तकनीकी अधिग्रहण (परिसंपत्ति-हल्का मॉडल)**
  - *आवश्यक पूंजी*: ₹65 Cr – ₹85 Cr (इक्विटी कमजोर पड़ने और रणनीतिक वारंट्स द्वारा)।
  - *रणनीति*: किसी तेजी से उभरते हुए डिजिटल प्लेटफॉर्म का अधिग्रहण या किसी प्रमुख लॉजिस्टिक्स कंपनी के साथ 50:50 का संयुक्त उद्यम।
  - *सकारात्मक पक्ष*: त्वरित बाजार पहुंच (6 माह से कम), युवा ग्राहक वर्ग की तत्काल प्राप्ति।
  - *जोखिम*: संगठनात्मक संस्कृति का टकराव, परिचालन स्वायत्तता का ह्रास और शासन संबंधी जटिलताएं।

- **विकल्प 3: रक्षात्मक समेकन और प्रीमियम मार्जिन संरक्षण**
  - *आवश्यक पूंजी*: ₹25 Cr – ₹35 Cr (परिचालन नकदी प्रवाह द्वारा स्व-वित्तपोषित)।
  - *रणनीति*: कम लाभ वाले उत्पादों और अकुशल ग्राहक वर्गों से बाहर निकलना, उच्च मार्जिन वाले कॉर्पोरेट अनुबंधों पर ध्यान केंद्रित करना।
  - *सकारात्मक पक्ष*: स्वस्थ EBITDA मार्जिन (14%+) की तत्काल सुरक्षा, शून्य ऋण जोखिम और निरंतर लाभांश।
  - *जोखिम*: कुल बाजार हिस्सेदारी में स्थायी गिरावट और दीर्घकाल में ब्रांड का अप्रासंगिक हो जाना।`;

    decisionPoint = `सोमवार प्रातः 9:00 बजे की निदेशक मंडल बैठक में, ${decisionMaker} को किस रणनीतिक विकल्प का समर्थन करना चाहिए, और सभी हितधारकों के विश्वास को बनाए रखते हुए इस संक्रमण का वित्तपोषण कैसे किया जाना चाहिए?`;
    
    questions = [
      `प्रदर्श 1 और 3 के आधार पर, ${company} के परिचालन मार्जिन में आई गिरावट के प्राथमिक मूल कारणों का निदान कीजिए।`,
      `तीनों रणनीतिक विकल्पों (विकल्प 1, 2 और 3) के वित्तीय जोखिम और नियोजित पूंजी पर प्रतिफल (ROIC) का तुलनात्मक मूल्यांकन कीजिए।`,
      `हितधारकों के परस्पर विरोधी दृष्टिकोणों को देखते हुए, आंतरिक प्रतिरोध को कम करने हेतु कौन सा संगठनात्मक ढांचा उपयुक्त होगा?`,
      `नियामक और व्यापक आर्थिक अनिश्चितताओं के बीच ऋण-इक्विटी अनुपात की सुरक्षा सुनिश्चित करने के लिए क्या सुरक्षा उपाय किए जाने चाहिए?`,
      `${decisionMaker} के लिए एक व्यापक 3-वर्षीय चरणबद्ध कार्ययोजना तैयार कीजिए जिसमें स्पष्ट शासन मील के पत्थर शामिल हों।`
    ];

    if (objectives.length === 0) {
      objectives = [
        `अत्यधिक प्रतिस्पर्धी बाजार में बहु-विभागीय उद्यम के रणनीतिक संकट का समग्र निदान करना।`,
        `पूंजी आवंटन, ऋण जोखिम और परिचालन दक्षता के बीच के व्यापार-बंद (Trade-offs) का मात्रात्मक विश्लेषण करना।`,
        `ब्लूम के वर्गीकरण (${bloomsLevel}) के अनुरूप कार्यकारी निर्णय निर्माण कौशल का विकास करना।`
      ];
    }

    frameworks = [
      { name: "पोर्टर का फाइव फोर्सेज मॉडल (Porter's 5 Forces)", application: "प्रतिस्पर्धी तीव्रता और आपूर्तिकर्ताओं की मोलभाव क्षमता का आकलन।", key_takeaway: "पारंपरिक बाधाएं डिजिटल प्रतिस्पर्धियों के सामने कमजोर पड़ रही हैं।" },
      { name: "ड्यूपॉन्ट विश्लेषण (DuPont ROE Decomposition)", application: "इक्विटी पर प्रतिफल, परिसंपत्ति कारोबार और शुद्ध लाभ मार्जिन का विखंडन।", key_takeaway: "पूंजी की गहनता बढ़ने से जब तक टर्नओवर नहीं बढ़ता, तब तक आरओई पर दबाव बना रहेगा।" },
      { name: "कोट्टर का 8-चरणीय परिवर्तन मॉडल (Kotter's Change Model)", application: "संगठनात्मक प्रतिरोध पर विजय पाने और रणनीतिक गठबंधन बनाने की रूपरेखा।", key_takeaway: "नेतृत्व में स्पष्ट आम सहमति के बिना जटिल रणनीतिक परिवर्तन विफल हो जाते हैं।" }
    ];
  }

  // =========================================================================
  // 2. GUJARATI LOCALIZATION (ગુજરાતી)
  // =========================================================================
  else if (lang === "gu") {
    title = `વ્યૂહાત્મક નેતૃત્વ અને વ્યાપારિક રૂપાંતરણ: ${company} સામે ${ind} ક્ષેત્રમાં અસ્તિત્વનો પડકાર (${region})`;
    summary = `શાંતિ બિઝનેસ સ્કૂલ (SBS) નો આ અધિકૃત શૈક્ષણિક કેસ સ્ટડી ${company} ના વરિષ્ઠ નેતૃત્વ સમક્ષ ઉપસ્થિત મૂડી ફાળવણી, ડિજિટલ સ્પર્ધા અને વ્યાપારિક પુનઃરચનાની ગંભીર કટોકટીનું પૃથક્કરણ કરે છે. ${region} ના ગતિશીલ વાતાવરણમાં, ${decisionMaker} એ આગામી 72 કલાકમાં બોર્ડ ઓફ ડિરેક્ટર્સ સમક્ષ સર્વગ્રાહી વ્યૂહરચના રજૂ કરવાની છે.`;

    background = `### 1. પરિચય અને તાત્કાલિક કટોકટી
સપ્ટેમ્બર 2024 ના એક નિર્ણાયક સાંજે, ${region} ખાતે આવેલી ${company} ની મુખ્ય વહીવટી કચેરીના આઠમા માળે, ${decisionMaker} આગામી બોર્ડ મીટિંગના ગોપનીય નાણાકીય દસ્તાવેજોનું નિરીક્ષણ કરી રહ્યા હતા. સોમવારે સવારે 9:00 વાગ્યે મળનારી બોર્ડ ઓફ ડિરેક્ટર્સની ઇમરજન્સી બેઠક માટે ત્રણ અલગ-અલગ યોજનાઓ તૈયાર હતી. આ નિર્ણય માત્ર આગામી ત્રિમાસિક ગાળા પૂરતો સીમિત નહોતો, પરંતુ પેઢીના આગામી દાયકાના ભવિષ્યની દિશા નક્કી કરવાનો હતો.

### 2. પેઢીનો ઐતિહાસિક પાયો અને સ્પર્ધાત્મક તાકાત
છેલ્લા ત્રણ દાયકામાં, ${company} એ ${region} ના ${ind} ઉદ્યોગમાં અગ્રેસર સ્થાન પ્રાપ્ત કર્યું હતું. પેઢીની પરંપરાગત વ્યાપારી શક્તિ નીચે મુજબના મુખ્ય આધારસ્તંભો પર નિર્ભર હતી:
- **મજબૂત સ્થાનિક વિતરણ નેટવર્ક**: તાલુકા અને ગ્રામીણ સ્તર સુધી વિસ્તરેલું વિતરણ તંત્ર, જેને સરળતાથી પડકારી શકાય તેમ નહોતું.
- **વિશ્વસનીય બ્રાન્ડ અને ગ્રાહક વફાદારી**: પેઢીની ગુણવત્તા અને પારદર્શક વ્યાપારી નીતિઓને કારણે બજારમાં ઊભી થયેલી અભૂતપૂર્વ શાખ (Goodwill).
- **શિસ્તબદ્ધ કાર્યકારી મૂડી વ્યવસ્થાપન**: રૂઢિચુસ્ત દેવું-ઇક્વિટી રેશિયો જાળવી રાખીને નિયોજિત મૂડી પર સ્થિર વળતર (ROIC) મેળવવાની નીતિ.

### 3. ઉદ્યોગમાં મોટા ફેરફારો અને ડિજિટલ પડકારો
પરંતુ છેલ્લા 24 મહિનામાં ઉદ્યોગનું પરિદ્રશ્ય ઝડપથી બદલાઈ ગયું છે. સાહસિક મૂડી (Venture Capital) આધારિત નવા ડીજીટલ સ્ટાર્ટઅપ્સે આક્રમક કિંમતો અને સીધા ગ્રાહક (D2C) મોડેલ સાથે બજારમાં પ્રવેશ કર્યો છે. આ ઉપરાંત, કાચા માલના ભાવવધારા અને નિયમનકારી નીતિઓને લીધે ઓપરેટિંગ ખર્ચમાં મોટો ઉછાળો આવ્યો છે. FY23 થી FY25 વચ્ચે, કંપનીના કુલ નફાના માર્જિનમાં 380 બેસિસ પોઇન્ટ્સનો ઘટાડો થયો છે અને યુવા પેઢીના ગ્રાહકોમાં બજાર હિસ્સો 18% ઘટ્યો છે.`;

    challenge = `### 1. બોર્ડરૂમમાં વિરોધાભાસી દ્રષ્ટિકોણ અને વાર્તાલાપ
મેનેજમેન્ટ કમિટીમાં ત્રણ વરિષ્ઠ અધિકારીઓ વચ્ચે ગંભીર મતભેદો સપાટી પર આવ્યા હતા:

> *"આપણે 30 વર્ષથી ઊભી કરેલી નાણાકીય શિસ્તને કોઈ અજમાવેલી ન હોય તેવી ટેકનોલોજી પાછળ જોખમમાં ન મૂકી શકીએ,"* ચીફ ફાઇનાન્સિયલ ઓફિસર (CFO) એ ઓડિટ કરેલા બેલેન્સ શીટ તરફ આંગળી ચીંધતા જણાવ્યું. *"આપણો ડેટ-ટુ-ઇક્વિટી રેશિયો 0.45x થી વધીને 0.88x થયો છે. જો આપણે હવે ₹140 કરોડનું નવું મૂડીરોકાણ (CAPEX) કરીશું, તો વેચાણમાં સહેજ પણ ઘટાડો બેંકની લોન શરતોનું ઉલ્લંઘન કરી શકે છે."*

> *"પરિવર્તનનો સામનો કરવાને બદલે હાથ જોડીને બેસી રહેવું એ સૌથી મોટું વ્યાપારી જોખમ છે,"* વાઇસ પ્રેસિડેન્ટ (Strategic Growth) એ દલીલ કરી. *"જો આપણે ડાયરેક્ટ-ટુ-કન્ઝ્યુમર ડિજિટલ પ્લેટફોર્મ અને સપ્લાય ચેઇન ઓટોમેશનમાં રોકાણ નહીં કરીએ, તો આગામી 36 મહિનામાં આપણી પેઢી બજારમાંથી ફેંકાઈ જશે."*

> *"આપણા ફેક્ટરી કર્મચારીઓ અને લોજિસ્ટિક્સ પાર્ટનર્સ હાલમાં જ 94% ક્ષમતા પર કામ કરી રહ્યા છે,"* ચીફ ઓપરેટિંગ ઓફિસર (COO) એ ચેતવણી આપી. *"જો આપણે ટેકનોલોજી પાછળ નાણાં ફાળવવા માટે ઓપરેશનલ બજેટ કાપીશું, તો કામગીરી ખોરવાઈ જશે."*

### 2. વ્યૂહાત્મક ચોકડી: ત્રણ પરસ્પર વિશિષ્ટ વિકલ્પો
${dilemma} ના સંદર્ભમાં, ${decisionMaker} સમક્ષ ત્રણ સ્પષ્ટ વિકલ્પો છે:

- **વિકલ્પ 1: આક્રમક આંતરિક ડિજિટલ રૂપાંતરણ (મોટું મૂડીરોકાણ)**
  - *જરૂરી મૂડી*: ₹140 Cr – ₹175 Cr (બેંક ધિરાણ અને આંતરિક ભંડોળ દ્વારા).
  - *વ્યૂહરચના*: અત્યાધુનિક ઓટોમેટેડ વેરહાઉસિંગ, માલિકીનું મોબાઇલ પ્લેટફોર્મ અને કર્મચારીઓની ટેકનોલોજી તાલીમ.
  - *લાભ*: સંપૂર્ણ માર્જિન પર અંકુશ અને સ્વતંત્ર ટેકનોલોજી.
  - *જોખમ*: ભારે દેવાનો બોજ અને નજીકના ભવિષ્યમાં નફાકારકતામાં તીવ્ર ઘટાડો.

- **વિકલ્પ 2: વ્યૂહાત્મક સંયુક્ત સાહસ / ડિજિટલ એક્વિઝિશન (લાઇટ મોડેલ)**
  - *જરૂરી મૂડી*: ₹65 Cr – ₹85 Cr (ઇક્વિટી મંદી અને વ્યૂહાત્મક ભાગીદારી દ્વારા).
  - *વ્યૂહરચના*: ઝડપથી વિકસતા ટેક પ્લેટફોર્મમાં મોટો હિસ્સો ખરીદવો અથવા પ્રતિષ્ઠિત લોજિસ્ટિક્સ ફર્મ સાથે 50:50 નું સંયુક્ત સાહસ.
  - *લાભ*: ઝડપી બજાર પ્રવેશ (6 મહિનામાં) અને યુવા ગ્રાહકોની તાત્કાલિક પ્રાપ્તિ.
  - *જોખમ*: બંને પેઢીઓની કાર્યસંસ્કૃતિનો વિવાદ અને નિર્ણય લેવાની સ્વતંત્રતામાં ઘટાડો.

- **વિકલ્પ 3: રક્ષણાત્મક એકત્રીકરણ અને પ્રીમિયમ માર્જિન રક્ષણ**
  - *જરૂરી મૂડી*: ₹25 Cr – ₹35 Cr (ઓપરેટિંગ રોકડ પ્રવાહમાંથી).
  - *વ્યૂહરચના*: બિનનફાકારક ઉત્પાદનો બંધ કરવા, માત્ર ઉચ્ચ માર્જિન ધરાવતા કોર્પોરેટ ગ્રાહકો પર ધ્યાન કેન્દ્રિત કરવું.
  - *લાભ*: સ્થિર EBITDA માર્જિન (14%+), દેવાનું કોઈ જોખમ નહીં અને નિયમિત ડિવિડન્ડ.
  - *જોખમ*: બજાર હિસ્સામાં મોટો ઘટાડો અને લાંબાગાળે બ્રાન્ડ જૂની થઈ જવાનું જોખમ.`;

    decisionPoint = `સોમવારે સવારે 9:00 વાગ્યે યોજાનારી બોર્ડ ઓફ ડિરેક્ટર્સની બેઠકમાં, ${decisionMaker} એ કયો વ્યૂહાત્મક વિકલ્પ પસંદ કરવો જોઈએ અને હિતધારકોના હિતોનું રક્ષણ કેવી રીતે કરવું જોઈએ?`;

    questions = [
      `પ્રદર્શ 1 અને 3 ના આધારે, ${company} ની નફાકારકતા ઘટવાના મૂળભૂત આર્થિક અને બજાર પરિબળોનું વિશ્લેષણ કરો.`,
      `ત્રણેય વ્યૂહાત્મક વિકલ્પો વચ્ચેના નાણાકીય જોખમો અને મૂડી પરના વળતર (ROIC) ની સરખામણી કરો.`,
      `સંચાલકીય મતભેદોને ધ્યાને લેતાં, સંસ્થાકીય વિરોધ ઘટાડવા માટે કયું નેતૃત્વ માળખું યોગ્ય ગણાશે?`,
      `નિયમનકારી ફેરફારો અને વ્યાજદરના જોખમો સામે બેલેન્સ શીટનું રક્ષણ કરવા કયા પગલાં લેવા જોઈએ?`,
      `${decisionMaker} માટે 3-વર્ષનો અમલીકરણ રોડમેપ તૈયાર કરો જેમાં શાસન અને જોખમ વ્યવસ્થાપનના માપદંડો સામેલ હોય.`
    ];

    if (objectives.length === 0) {
      objectives = [
        `ગતિશીલ ભારતીય બજારમાં જટિલ સંસ્થાકીય કટોકટીનું વ્યવસ્થિત નિદાન કરવું.`,
        `મૂડી ફાળવણી, દેવાના જોખમો અને કાર્યકારી નફાકારકતા વચ્ચેના સંબંધોનું મૂલ્યાંકન કરવું.`,
        `બ્લૂમ્સ ટેક્સોનોમી (${bloomsLevel}) આધારિત નિર્ણાયક સંચાલકીય વિચારસરણી કેળવવી.`
      ];
    }

    frameworks = [
      { name: "પોર્ટર્સ ફાઇવ ફોર્સિસ (Porter's 5 Forces)", application: "ઉદ્યોગમાં સ્પર્ધાત્મક તીવ્રતા અને સપ્લાયર્સની સોદાબાજી શક્તિનું મૂલ્યાંકન.", key_takeaway: "ડિજિટલ પ્લેટફોર્મના આગમનથી પરંપરાગત વ્યાપારી મોડ્સ નબળા પડી રહ્યા છે." },
      { name: "ડ્યુપોન્ટ વિશ્લેષણ (DuPont ROE Analysis)", application: "ઇક્વિટી પરના વળતર, એસેટ ટર્નઓવર અને નેટ પ્રોફિટ માર્જિનનું વિભાજન.", key_takeaway: "ભારે મૂડીરોકાણ પછી જ્યાં સુધી ટર્નઓવર ઝડપી ન બને ત્યાં સુધી રોકાણકારોના વળતર પર દબાણ રહેશે." },
      { name: "વ્રીઓ ફ્રેમવર્ક (VRIO Framework)", application: "પેઢીની લોજિસ્ટિક્સ ક્ષમતાઓ અને બ્રાન્ડની ટકાઉ ક્ષમતાનું ઓડિટ.", key_takeaway: "ભૌતિક વિતરણ નેટવર્ક કિંમતી છે, પરંતુ ડિજિટલ સ્પર્ધકો સામે રક્ષણ આપવા સક્ષમ નથી." }
    ];
  }

  // =========================================================================
  // 3. ENGLISH STANDARD (HBS / IVEY BENCHMARK)
  // =========================================================================
  else {
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
  }

  // =========================================================================
  // 4. EXHIBITS GENERATION (FINANCIALS, ORG CHART, MARKET DATA)
  // =========================================================================
  const exhibits: CaseExhibit[] = [];
  const requestedExhibits = params.includeExhibits || ["financials", "market_data", "org_chart"];

  if (requestedExhibits.includes("financials")) {
    exhibits.push({
      id: "exhibit-1",
      title: lang === "hi"
        ? `प्रदर्श 1: ${company} — 3-वर्षीय ऑडिट किया गया वित्तीय विवरण और मुख्य परिचालन संकेतक`
        : lang === "gu"
        ? `પ્રદર્શ 1: ${company} — 3-વાર્ષિક ઓડિટેડ નાણાકીય પરિણામો અને કામગીરીના આંકડા`
        : `Exhibit 1: ${company} — 3-Year Audited Financial Statement & Unit Economics`,
      type: "financials",
      description: lang === "hi"
        ? "कंपनी के वार्षिक वित्तीय परिणाम, सकल मार्जिन, परिचालन एबिट्डा और नकदी प्रवाह (सभी आंकड़े ₹ करोड़ में)"
        : lang === "gu"
        ? "કંપનીના ઓડિટેડ નાણાકીય પરિણામો, ગ્રોસ માર્જિન, એબિટ્ડા અને રોકડ પ્રવાહ (બધા આંકડા ₹ કરોડમાં)"
        : "Audited financial highlights, operating margins, capital structure, and unit economics (all figures in ₹ Crores unless noted)",
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
      title: lang === "hi"
        ? "प्रदर्श 2: संगठनात्मक शासन संरचना और प्रमुख निर्णयकर्ता"
        : lang === "gu"
        ? "પ્રદર્શ 2: સંસ્થાકીય ગવર્નન્સ અને મુખ્ય નિર્ણાયક અધિકારીઓ"
        : "Exhibit 2: Organizational Governance & C-Suite Decision Matrix",
      type: "org_chart",
      description: lang === "hi"
        ? "निदेशक मंडल, वरिष्ठ कार्यकारी समिति और विभिन्न विभागों के बीच निर्णय लेने के अधिकार"
        : lang === "gu"
        ? "બોર્ડ ઓફ ડિરેક્ટર્સ, એક્ઝિક્યુટિવ કમિટી અને વહીવટી સત્તાઓનું માળખું"
        : "Board of Directors, Executive Committee hierarchy, and strategic mandates at the heart of the dispute",
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
      title: lang === "hi"
        ? `प्रदर्श 3: ${region} में प्रतिस्पर्धी परिदृश्य और बाजार हिस्सेदारी (FY25)`
        : lang === "gu"
        ? `પ્રદર્શ 3: ${region} માં બજાર હિસ્સો અને સ્પર્ધાત્મક પરિસ્થિતિ (FY25)`
        : `Exhibit 3: Competitive Market Share & Industry Benchmark Matrix in ${region} (FY25)`,
      type: "market_data",
      description: lang === "hi"
        ? "उद्योग में प्रमुख प्रतिस्पर्धियों की बाजार हिस्सेदारी, वार्षिक वृद्धि दर और मूल्य निर्धारण शक्ति"
        : lang === "gu"
        ? "ઉદ્યોગમાં મુખ્ય સ્પર્ધકોનો બજાર હિસ્સો, વાર્ષિક વૃદ્ધિ દર અને કિંમત શક્તિ"
        : `Market concentration, pricing power index, and digital penetration across ${region}`,
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
          activity: `Direct cold call to students asking: "${decisionMaker} has 72 hours before the board meeting. What is the fundamental root cause of the crisis—is it balance sheet stress, technological obsolescence, or cultural complacency?"`
        },
        {
          phase: "Phase 2: Quantitative Exhibit & Financial Stress-Testing",
          duration_minutes: isShort ? 15 : 30,
          activity: "Divide the class into 3 analytical squads. Task Squad A with calculating debt covenant headroom under Alternative 1; Squad B with evaluating post-merger integration risks under Alternative 2; and Squad C with computing the terminal valuation impact of Alternative 3."
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Alternative Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay where students represent the CFO, VP Growth, and COO. Force students to defend their specific capital allocation choice under intense peer cross-examination."
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Layout Consolidation",
          duration_minutes: isShort ? 5 : 15,
          activity: "Consolidate the classroom consensus onto the 3-Board plan: Board 1 (Symptoms vs Root Causes), Board 2 (DuPont & Porter Framework Evaluation), and Board 3 (Recommended Action Plan & Governance Milestones)."
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
