import { CaseContent, CaseDomain, CaseExhibit, KeyDataRow } from "@/lib/types";
import { DomainName } from "@/config/domains";

export type DomainAgentId =
  | "finance"
  | "marketing"
  | "hr"
  | "it"
  | "supply-chain"
  | "strategy"
  | "analytics"
  | "operations";

export interface DomainAgentConfig {
  id: DomainAgentId;
  domain: DomainName;
  agentName: string;
  title: string;
  badge: string;
  specialization: string;
  icon: string; // Lucide icon identifier
  accentColor: string;
  tagline: string;
  keyFrameworks: string[];
  keyMetrics: string[];
  decisionMaker: string;
  cSuiteStakeholders: string[];
  systemPromptAddendum: string;
  generateDomainContent: (params: {
    company: string;
    region: string;
    dilemma: string;
    isReal: boolean;
    isShort: boolean;
    bloomsLevel: string;
  }) => {
    summary: string;
    background: string;
    challenge: string;
    keyData: KeyDataRow[];
    decisionPoint: string;
    questions: string[];
    objectives: string[];
    frameworks: { name: string; application: string; key_takeaway: string }[];
    exhibits: CaseExhibit[];
    classFlow: {
      phase: string;
      duration_minutes: number;
      activity: string;
      expected_response: string;
    }[];
  };
}

export const DOMAIN_AGENTS: Record<DomainAgentId, DomainAgentConfig> = {
  // =========================================================================
  // 1. FINANCE SPECIALIST AGENT
  // =========================================================================
  finance: {
    id: "finance",
    domain: "Finance",
    agentName: "Finance Specialist Agent",
    title: "Chair of Corporate Finance, Treasury & Capital Allocation",
    badge: "FINANCE AGENT",
    specialization: "Capital Budgeting, WACC, Leverage, Valuation Models & Banking Covenants",
    icon: "Landmark",
    accentColor: "emerald",
    tagline: "Calibrated for rigorous audited balance sheet mechanics, discounted cash flows, and covenant solvency.",
    keyFrameworks: [
      "DuPont ROE Decomposition (Margin, Turnover, Leverage)",
      "Weighted Average Cost of Capital (WACC) & CAPM",
      "Discounted Cash Flow (DCF) & Enterprise Value Sensitivity",
      "EBIT-EPS Indifference & Capital Structure Optimization",
      "Debt Service Coverage Ratio (DSCR) & Loan Covenant Stress-Testing",
      "Working Capital Operating Cycle & Cash Conversion Optimization",
    ],
    keyMetrics: [
      "Gross Margin %",
      "Operating EBITDA & EBITDA Margin %",
      "Free Cash Flow (FCF)",
      "Debt-to-Equity Ratio",
      "Interest Coverage Ratio (ICR)",
      "Return on Capital Employed (ROCE)",
      "Working Capital Cycle Days",
      "Proposed CapEx Outlay",
    ],
    decisionMaker: "Chief Financial Officer & Executive Vice President of Treasury",
    cSuiteStakeholders: [
      "Chief Financial Officer (Advocates balance sheet solvency and loan covenant preservation)",
      "VP of Capital Investments (Pushes aggressive syndicated debt-financed expansion)",
      "Managing Director & CEO (Balances near-term earnings per share against sovereign scale)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — CORPORATE FINANCE & CAPITAL STRUCTURE:
- Ground all narrative stakes in audited balance sheet and cash flow statement tensions.
- Financial exhibits MUST include multi-year trends, percentage margins, working capital cycles, and debt covenant headroom (Debt/Equity, DSCR).
- All questions must probe financial trade-offs (e.g. WACC impact, leverage, liquidity preservation, dividend dilution).
- Frameworks must explicitly include DuPont ROE decomposition, DCF stress-testing, and capital structure indifference.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Corporate Finance case study examining capital allocation, leverage constraints, and banking loan covenants at ${company}. Anchored in ${region}, the case chronicles how executive leadership must address a critical inflection point in debt servicing and liquidity management within 72 hours before the Board convenes.`,
      background: `### 1. The Opening Hook & Banking Syndicate Review
On a tense Thursday afternoon at corporate headquarters in ${region}, the Chief Financial Officer reviewed the audited trailing 12-month financials. In exactly 72 hours, on Monday at 9:00 AM, the institutional audit board and banking syndicate committee would convene. At issue was not a minor budgetary variance, but an impending breach of syndicated bank loan covenants. Over the past three decades, ${company} had maintained an unblemished credit record; today, rising interest rate benchmarks and raw material working capital inflation threatened its solvency headroom.

### 2. Capital Structure Genesis & Historical Cash Compounding
For twenty-five years, ${company} operated with conservative capital discipline:
- **Prudent Balance Sheet Management**: Historic Debt-to-Equity remained below 0.50x, self-funding capital expenditure out of internal cash accruals.
- **Predictable Working Capital Discipline**: Receivables were factored with full recourse, keeping the cash conversion cycle under 42 days.
- **Superior Return on Invested Capital (ROIC)**: Consistent double-digit ROIC generated strong institutional investor confidence across regional capital markets.

### 3. Macroeconomic Pressures & Financial Headwinds
Over the trailing 24 months, input price shocks and benchmark lending rate hikes added 220 basis points to borrowing costs. Gross margin contracted by 380 bps, while working capital requirements surged by ₹72 Crore, compressing free cash flow to its lowest level in a decade.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
Behind closed doors, the executive leadership team was sharply divided:
> *"Our primary fiduciary obligation is balance sheet solvency,"* warned the Chief Financial Officer. *"Our Debt-to-Equity ratio has risen to 0.88x. If we take on an additional ₹140 Cr in bank term loans, a single quarterly downturn will trigger default clauses on our debt covenants. We must protect liquidity."*

> *"Conservatism in an expanding market is a recipe for stagnation,"* argued the VP of Capital Investments. *"Our competitors are heavily leveraging debt to lock in regional capacity. If we refuse to borrow and expand now, our market share will erode irreversibly within three years."*

> *"The plant floor is already constrained,"* added the Chief Operating Officer. *"Cutting maintenance CapEx to service debt payments will induce factory downtime and elevate operational risk."*

### 2. The Strategic Crossroads: Three Capital Allocation Alternatives
- **Alternative 1: Aggressive Syndicated Debt Expansion (₹140 Cr – ₹175 Cr)**: Fund high-capacity automated regional hubs; offers highest terminal scale but pushes Debt/Equity to 1.12x against a 1.20x covenant ceiling.
- **Alternative 2: Equity Dilution & Strategic Investor Consortium (₹75 Cr – ₹95 Cr)**: Issue convertible preference shares; preserves cash but dilutes promoters by 18% and introduces restrictive board seats.
- **Alternative 3: Defensive Cash Preservation & SKU Rationalization (₹25 Cr – ₹35 Cr)**: Defend gross margin, retire high-cost short-term debt, and protect free cash flow; limits scale but safeguards solvency.`,
      keyData: [
        { metric: "Gross Revenue", value: "₹1,850 Cr", period: "FY25 (Audited)", notes: "+11.2% YoY growth" },
        { metric: "Operating EBITDA", value: "₹218 Cr", period: "FY25", notes: "11.8% EBITDA margin" },
        { metric: "Cost of Goods Sold (COGS)", value: "₹1,225 Cr", period: "FY25", notes: "66.2% of topline" },
        { metric: "Free Cash Flow (FCF)", value: "₹38 Cr", period: "FY25", notes: "-53.2% YoY compression" },
        { metric: "Debt-to-Equity Ratio", value: "0.88x", period: "Trailing 12M", notes: "Syndicated bank ceiling at 1.20x" },
        { metric: "Interest Coverage Ratio (ICR)", value: "2.6x", period: "FY25", notes: "Down from 5.4x in FY23" },
        { metric: "Working Capital Cycle", value: "58 Days", period: "FY25", notes: "Stretched by +16 days" },
        { metric: "Proposed CapEx Outlay", value: "₹140 Cr – ₹175 Cr", period: "Project Horizon", notes: "Central capital budgeting choice" },
      ],
      decisionPoint: `As the clock counts down to Monday's board meeting, which capital financing structure should the CFO endorse, and how should covenant risk be hedged?`,
      questions: [
        `Using Exhibits 1 and 2, calculate the debt covenant headroom (Debt/Equity and ICR) under Alternative 1 versus Alternative 3.`,
        `Conduct a DuPont ROE decomposition comparing FY23 to FY25 to diagnose whether profitability, asset turnover, or financial leverage drove return changes.`,
        `Evaluate the weighted average cost of capital (WACC) impact of raising ₹140 Cr via syndicated debt versus convertible preference shares.`,
        `How do macroeconomic interest rate shifts constrain the company's dividend payout sustainability?`,
        `Synthesize a definitive Board Memorandum detailing your capital structure recommendation and debt service contingency plan.`,
      ],
      objectives: [
        `Master quantitative capital budgeting and debt covenant risk assessment in legacy enterprises.`,
        `Deconstruct enterprise returns using the DuPont ROE Decomposition model (${bloomsLevel}).`,
        `Evaluate strategic trade-offs between financial leverage risk and equity dilution.`,
      ],
      frameworks: [
        { name: "DuPont ROE Decomposition Model", application: "Deconstructing return on equity into net profit margin, asset turnover, and financial leverage.", key_takeaway: "Asset-heavy debt expansion dilutes ROE unless working capital turnover accelerates proportionally." },
        { name: "EBIT-EPS Indifference Analysis", application: "Calculating the EBIT threshold where debt financing and equity dilution yield identical EPS.", key_takeaway: "Debt financing is accretive only above ₹195 Cr EBIT, below which interest expense destroys shareholder returns." },
        { name: "Credit Risk & Covenant Sensitivity Matrix", application: "Stress-testing Debt-to-Equity and Interest Coverage under downside revenue scenarios.", key_takeaway: "Alternative 1 leaves less than 8% revenue variance cushion before breaching banking covenants." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — 3-Year Audited Financial Statement & Capital Structure`,
          type: "financials",
          description: "Audited financial highlights, operating margins, capital structure, and leverage ratios (in ₹ Crores)",
          data: [
            { metric: "Gross Revenue", y2023: "₹1,480 Cr", y2024: "₹1,660 Cr", y2025: "₹1,850 Cr", y2026_proj: "₹1,940 Cr", cagr: "+7.7%" },
            { metric: "Cost of Goods Sold (COGS)", y2023: "₹925 Cr", y2024: "₹1,062 Cr", y2025: "₹1,225 Cr", y2026_proj: "₹1,310 Cr", cagr: "+11.8%" },
            { metric: "Gross Margin %", y2023: "37.5%", y2024: "36.0%", y2025: "33.8%", y2026_proj: "32.5%", cagr: "-370 bps" },
            { metric: "Operating EBITDA", y2023: "₹245 Cr", y2024: "₹233 Cr", y2025: "₹197 Cr", y2026_proj: "₹175 Cr", cagr: "-10.6%" },
            { metric: "Interest Expense", y2023: "₹24 Cr", y2024: "₹36 Cr", y2025: "₹52 Cr", y2026_proj: "₹65 Cr", cagr: "+39.4%" },
            { metric: "Net Profit After Tax", y2023: "₹130 Cr", y2024: "₹107 Cr", y2025: "₹62 Cr", y2026_proj: "₹32 Cr", cagr: "-37.6%" },
            { metric: "Free Cash Flow (FCF)", y2023: "₹118 Cr", y2024: "₹84 Cr", y2025: "₹38 Cr", y2026_proj: "₹12 Cr", cagr: "-53.2%" },
            { metric: "Debt-to-Equity Ratio", y2023: "0.45x", y2024: "0.62x", y2025: "0.88x", y2026_proj: "1.12x", cagr: "+43 bps" },
            { metric: "Interest Coverage Ratio (ICR)", y2023: "8.2x", y2024: "5.0x", y2025: "2.6x", y2026_proj: "1.6x", cagr: "-60.5%" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & Debt Solvency Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "${company}'s Debt-to-Equity has reached 0.88x. Is the primary driver operating inefficiency or structural debt misallocation?"`,
          expected_response: "Model Diagnostic Answer: The core problem is structural debt acceleration in a rising benchmark interest rate environment compounded by gross margin compression (-370 bps). Students must distinguish between operating cash flow deterioration and the debt servicing burden (ICR declining from 8.2x to 2.6x).",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & Headroom Stress-Testing",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with computing Debt/Equity headroom under Alternative 1; Squad B with evaluating EPS dilution under Alternative 2; Squad C with DCF debt retirement under Alternative 3.",
          expected_response: "Quantitative Solutions:\n• Squad A (Debt Expansion): Debt/Equity reaches 1.12x in 2026, leaving only 0.08x headroom before breaching the 1.20x banking covenant.\n• Squad B (Equity Dilution): ₹85 Cr equity issue avoids debt covenant breach but dilutes promoter earnings per share by 18.2%.\n• Squad C (Defensive Consolidation): Generates ₹38 Cr cumulative FCF to retire short-term high-cost bank lines, stabilizing ICR at 3.4x.",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Financing Strategy Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay: CFO defends debt covenant solvency, VP Investments argues for aggressive borrowing, and CEO mediates shareholder value.",
          expected_response: "Executive Defense Key:\n• CFO wins on insolvency risk—borrowing ₹140 Cr in high-rate regimes is reckless.\n• VP Investments wins on market share erosion if competitors capture capacity.\n• Consensus recommendation: A phased hybrid structure (Alternative 3 cash flows co-funding an initial convertible note).",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Consolidate the consensus onto the 3-Board plan: Board 1 (Diagnosis), Board 2 (DuPont & WACC Analysis), Board 3 (Board Resolution & Debt Covenants).",
          expected_response: "Blackboard Synthesis Takeaways:\n• Board 1: Debt/Equity trajectory, ICR deterioration, working capital drag.\n• Board 2: DuPont breakdown proving asset turnover compression; EBIT-EPS hurdle rate.\n• Board 3: Formal board resolution: Approve phased debt tranche tied to milestone covenants.",
        },
      ],
    }),
  },

  // =========================================================================
  // 2. MARKETING SPECIALIST AGENT
  // =========================================================================
  marketing: {
    id: "marketing",
    domain: "Marketing",
    agentName: "Marketing Specialist Agent",
    title: "Chief Marketing Officer & Global Brand Strategy Chair",
    badge: "MARKETING AGENT",
    specialization: "Consumer Behavior, STP, 7Ps Marketing Mix, CAC/LTV, Brand Equity & Omnichannel Channels",
    icon: "TrendingUp",
    accentColor: "blue",
    tagline: "Calibrated for customer acquisition unit economics, brand positioning, and channel conflict resolution.",
    keyFrameworks: [
      "Segmentation, Targeting, and Positioning (STP)",
      "The Extended 7Ps Services Marketing Mix",
      "Keller's Customer-Based Brand Equity (CBBE) Pyramid",
      "Customer Acquisition Cost (CAC) to Lifetime Value (LTV) Ratio",
      "Ansoff Growth Matrix (Penetration vs Diversification)",
      "AIDA & Full-Funnel Conversion Mechanics",
    ],
    keyMetrics: [
      "Customer Acquisition Cost (CAC)",
      "Customer Lifetime Value (LTV)",
      "LTV-to-CAC Ratio",
      "Customer Churn Rate %",
      "Net Promoter Score (NPS)",
      "Brand Recall & Aided Awareness %",
      "Digital Marketing ROI (MROI)",
      "Channel Margin Split %",
    ],
    decisionMaker: "Chief Marketing Officer & VP of Omnichannel Growth",
    cSuiteStakeholders: [
      "Chief Marketing Officer (Champions direct-to-consumer brand pivot and ad spend)",
      "Head of Traditional Wholesale (Defends legacy retail relationships and trade margins)",
      "Chief Financial Officer (Demands immediate CAC payback under 6 months)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — MARKETING & BRAND STRATEGY:
- Focus on customer demographics, brand positioning statements, and go-to-market channels.
- Market data tables MUST detail customer segment behavior, CAC vs LTV, competitor pricing, and trade channel margins.
- Questions must require STP formulation, evaluation of promotion/pricing tactics, and channel conflict management.
- Frameworks must explicitly include STP, Keller's CBBE brand equity, and the 7Ps marketing mix.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Marketing case study analyzing brand repositioning, customer acquisition economics, and omnichannel channel conflict at ${company} in ${region}. The case examines how the CMO must resolve acute millennial customer churn and rising acquisition costs within 72 hours before product rollout.`,
      background: `### 1. The Opening Hook & Channel Disruption
On a humid Thursday morning in ${region}, the Chief Marketing Officer scrutinized the Q2 marketing performance dashboard. Across the boardroom table lay the brand tracking audit: for the fourth consecutive quarter, customer retention among demographics under 35 had fallen by 18%, while Customer Acquisition Cost (CAC) on digital channels had surged by 24.5%. With competitors launching aggressive direct-to-consumer (D2C) campaigns, ${company} had only 72 hours to finalize its national go-to-market and promotional blueprint.

### 2. Brand Genesis & Historical Wholesale Dominance
For nearly three decades, ${company} enjoyed formidable brand equity across ${region}:
- **Deep Wholesale Distribution Network**: 45,000 retail storefronts and regional stockists delivering high physical availability.
- **Trusted Household Heritage**: Generations of brand trust built through national television campaigns and consistent product quality.
- **Healthy Trade Margins**: Retailers prioritized the brand due to steady turnover and reliable trade promotion allowances.

### 3. The Digital Upheaval & Direct-to-Consumer Shift
However, internet penetration and smartphone adoption in tier-1 and tier-2 markets transformed consumer purchase journeys. Agile digital native brands bypassed physical wholesale distributors, offering personalized subscription bundles and viral social media endorsements. ${company}'s traditional wholesale channels suddenly suffered from channel cannibalization and declining retail share of voice.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
> *"We must aggressively pivot to a Direct-to-Consumer (D2C) omnichannel model,"* urged the Chief Marketing Officer. *"Younger consumers demand personalized mobile ordering and transparent digital brand narratives. If we continue relying on traditional brick-and-mortar distributors, our brand will age out within five years."*

> *"Bypassing our 45,000 retail partners will provoke a devastating dealer boycott,"* warned the Head of Wholesale Distribution. *"Wholesale delivers 82% of our cash flow today. If retailers perceive we are undercutting them online, they will de-list our products and give shelf space to rivals."*

> *"Our digital advertising burn has doubled while conversion rates dropped from 3.2% to 1.8%,"* observed the Chief Financial Officer. *"We will not fund open-ended brand campaigns without an LTV/CAC ratio above 3.5x and a 6-month payback period."*

### 2. The Strategic Crossroads: Three Marketing Alternatives
- **Alternative 1: Rapid Direct-to-Consumer (D2C) Digital Pivot**: Allocate ₹35 Cr toward proprietary mobile app, influencer marketing, and dark-store delivery; captures direct customer data but risks trade boycott.
- **Alternative 2: Omnichannel Retail Co-op & Partner Integration**: Partner with existing retailers for click-and-collect fulfillment, offering shared margins; preserves dealer goodwill but slows digital customer acquisition.
- **Alternative 3: Premium Brand Segmentation & Heritage Focus**: Retain traditional wholesale for mass products while creating a premium sub-brand exclusively for modern trade; protects core cash cows but fragments brand equity.`,
      keyData: [
        { metric: "Gross Revenue", value: "₹1,850 Cr", period: "FY25 (Audited)", notes: "82% generated via wholesale" },
        { metric: "Customer Acquisition Cost (CAC)", value: "₹760", period: "FY25", notes: "+24.2% inflation YoY" },
        { metric: "Customer Lifetime Value (LTV)", value: "₹1,820", period: "FY25", notes: "LTV/CAC ratio at 2.4x" },
        { metric: "Under-35 Customer Retention", value: "48.2%", period: "Trailing 12M", notes: "Down from 66.2% in FY23" },
        { metric: "Wholesale Channel Margin", value: "18.5%", period: "Current Trailing", notes: "Dealer trade discount" },
        { metric: "D2C Digital Conversion Rate", value: "1.8%", period: "FY25", notes: "Down from 3.2% benchmark" },
        { metric: "Net Promoter Score (NPS)", value: "+38", period: "FY25 Audit", notes: "Industry benchmark is +52" },
        { metric: "Digital Media Spend", value: "₹42 Cr", period: "FY25 Budget", notes: "Marketing budget allocation" },
      ],
      decisionPoint: `Which go-to-market positioning and channel strategy should the CMO recommend to reverse youth customer churn without alienating physical retail partners?`,
      questions: [
        `Construct an STP framework identifying the high-value target customer persona and craft a canonical positioning statement for ${company}.`,
        `Evaluate the unit economics of the customer acquisition funnel: is an LTV/CAC ratio of 2.4x sustainable, and how should marketing spend be reallocated?`,
        `How should leadership resolve the acute channel conflict between physical wholesale stockists and the proposed D2C platform?`,
        `Apply Keller's Brand Equity (CBBE) pyramid to assess whether ${company} possesses sufficient consumer resonance to launch a premium sub-brand.`,
        `Formulate an Integrated Marketing Communications (IMC) campaign and promotional budget for the recommended alternative.`,
      ],
      objectives: [
        `Formulate robust Segmentation, Targeting, and Positioning (STP) strategies for multi-generational consumer brands.`,
        `Diagnose digital marketing unit economics using Customer Acquisition Cost (CAC) and Lifetime Value (LTV) metrics (${bloomsLevel}).`,
        `Design actionable channel governance mechanisms to mitigate trade distributor conflict during omnichannel transitions.`,
      ],
      frameworks: [
        { name: "Segmentation, Targeting, and Positioning (STP)", application: "Partitioning the consumer base into legacy traditionalists vs digital-first millennials.", key_takeaway: "One-size-fits-all positioning alienates younger consumers while confusing loyal older buyers." },
        { name: "Keller's Customer-Based Brand Equity (CBBE)", application: "Auditing brand salience, performance, imagery, judgments, feelings, and resonance.", key_takeaway: "Brand salience remains high, but emotional resonance and brand feelings have weakened among younger buyers." },
        { name: "Omnichannel Channel Conflict Resolution Matrix", application: "Balancing direct ecommerce pricing against brick-and-mortar dealer margins.", key_takeaway: "A click-and-collect revenue-sharing model neutralizes dealer boycotts by monetizing retail foot traffic." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — Marketing Performance, Channel Metrics & Segment Economics`,
          type: "market_data",
          description: "Customer segment demographics, channel margin distribution, and acquisition funnel conversion rates",
          data: [
            { metric: "Customer Acquisition Cost (CAC)", y2023: "₹480", y2024: "₹590", y2025: "₹760", y2026_proj: "₹920", cagr: "+24.2%" },
            { metric: "Customer Lifetime Value (LTV)", y2023: "₹2,100", y2024: "₹1,980", y2025: "₹1,820", y2026_proj: "₹1,710", cagr: "-6.6%" },
            { metric: "LTV/CAC Ratio", y2023: "4.4x", y2024: "3.4x", y2025: "2.4x", y2026_proj: "1.9x", cagr: "-24.8%" },
            { metric: "Digital Ad Click-Through Rate", y2023: "3.4%", y2024: "2.8%", y2025: "2.1%", y2026_proj: "1.7%", cagr: "-14.8%" },
            { metric: "E-Commerce Cart Abandonment", y2023: "62%", y2024: "68%", y2025: "74%", y2026_proj: "78%", cagr: "+6.1%" },
            { metric: "Retail Dealer Satisfaction", y2023: "88%", y2024: "81%", y2025: "69%", y2026_proj: "61%", cagr: "-11.4%" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & Customer Churn Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "Why did a 30-year-old beloved brand's LTV/CAC ratio collapse from 4.4x to 2.4x in just 24 months?"`,
          expected_response: "Model Diagnostic Answer: The collapse is caused by customer demographic shifts. As millennial and Gen-Z consumers migrated to digital search and direct brand interactions, the company continued allocating heavy spend to generic broad-reach ads with rising digital bid rates, while poor e-commerce checkout experience drove cart abandonment to 74%.",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & Channel Margin Analysis",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with modeling LTV/CAC unit economics; Squad B with computing trade dealer margin loss under Alternative 1; Squad C with evaluating sub-brand cannibalization under Alternative 3.",
          expected_response: "Quantitative Solutions:\n• Squad A: At ₹760 CAC and ₹1,820 LTV (2.4x), the payback period is 14 months, straining working capital.\n• Squad B: An unmitigated D2C launch could cause up to 25% of traditional dealers to drop inventory, costing ₹370 Cr in baseline sales.\n• Squad C: Premium sub-brand strategy preserves 82% wholesale revenue while isolating higher margins (34% vs 18%).",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Channel Conflict Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee debate: CMO defends digital transformation, Head of Wholesale defends dealer livelihoods, and CFO demands unit economics rigor.",
          expected_response: "Executive Defense Key:\n• CMO proves that digital absence guarantees irrelevance in 5 years.\n• Wholesale head proves that alienating 45,000 dealers will destroy current quarterly cash flow.\n• Consensus: Endorse Alternative 2 (Omnichannel partnership) with exclusive dealer SKUs and local fulfillment kickbacks.",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Marketing Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Synthesize the 3-Board plan: Board 1 (Customer & Channel Diagnosis), Board 2 (STP & 7Ps Formulation), Board 3 (Execution Roadmap & KPIs).",
          expected_response: "3-Board Marketing Plan Takeaways:\n• Board 1: Target demographic migration, deteriorating LTV/CAC, channel friction points.\n• Board 2: Standardized positioning statement and differentiated 7Ps marketing mix.\n• Board 3: 12-month commercial milestones, dealer profit-sharing framework, and digital ad budget reallocation.",
        },
      ],
    }),
  },

  // =========================================================================
  // 3. HR SPECIALIST AGENT
  // =========================================================================
  hr: {
    id: "hr",
    domain: "HR",
    agentName: "HR Specialist Agent",
    title: "Chief Human Resources Officer & Organizational Behavior Chair",
    badge: "HR AGENT",
    specialization: "Talent Acquisition, Performance Engineering, Compensation, Industrial Relations & Culture",
    icon: "Users",
    accentColor: "purple",
    tagline: "Calibrated for workforce turnover root causes, motivation theory, compensation parity, and labor relations.",
    keyFrameworks: [
      "Herzberg's Two-Factor (Hygiene vs Motivator) Theory",
      "Ulrich's HR Business Partner (HRBP) Operating Model",
      "Performance Appraisal Architectures (BARS, 360-Degree, MBO)",
      "McGregor's Theory X and Theory Y Leadership Assumptions",
      "Hackman & Oldham's Job Characteristics Model",
      "Kirkpatrick's Four-Level Training Evaluation Model",
    ],
    keyMetrics: [
      "Voluntary Attrition Rate %",
      "Cost per Hire",
      "Time to Fill (Days)",
      "Employee Engagement Score (eNPS)",
      "Performance Rating Compa-Ratio",
      "Absenteeism Rate %",
      "Training ROI (Kirkpatrick L4)",
      "Workforce Headcount & Gender Diversity %",
    ],
    decisionMaker: "Chief Human Resources Officer & VP of People & Culture",
    cSuiteStakeholders: [
      "Chief Human Resources Officer (Champions employee well-being, culture, and fair compensation)",
      "Chief Operating Officer (Demands high plant uptime and strict shift attendance)",
      "Chief Financial Officer (Mandates payroll budget caps and restructuring headcount)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — HUMAN RESOURCE MANAGEMENT & ORGANIZATIONAL BEHAVIOR:
- Focus on employee morale, appraisal systems, compensation equity, and workplace conflict.
- Data tables MUST detail workforce headcount, attrition % by department, engagement scores, and compa-ratios.
- Questions must probe organizational behavior root causes and evaluate policy changes using named HR theories.
- Frameworks must explicitly include Herzberg's Hygiene vs Motivator theory, Ulrich's HRBP model, and BARS appraisal.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Human Resources Management case study examining organizational restructuring, performance appraisal friction, and talent retention at ${company} in ${region}. The case examines how the CHRO must address critical engineering and plant attrition within 72 hours before factory union negotiations.`,
      background: `### 1. The Opening Hook & The Impending Town Hall
On a tense Thursday morning in ${region}, the Chief Human Resources Officer reviewed the annual workforce attrition report. In exactly 72 hours, on Monday at 9:00 AM, the emergency executive committee and union leadership council would meet. Over the past 18 months, voluntary attrition among critical mid-level engineering and plant supervisory talent had escalated to an alarming 24.2%, with employee engagement scores plummeting to negative territory (-18 eNPS). 

### 2. Organizational Genesis & The Paternalistic Heritage
For nearly thirty years, ${company} had enjoyed a celebrated reputation as an employer of choice in ${region}:
- **Paternalistic Welfare & Lifetime Employment Culture**: Strong multi-generational loyalty with comprehensive employee housing, healthcare, and subsidized family education.
- **Stable Industrial Relations**: Decades without a single strike or labor slowdown, governed by collaborative union relationships.
- **Hierarchical Job Security**: Predictable seniority-based promotion ladders ensuring high organizational continuity.

### 3. The Performance Shock & Cultural Breakdown
However, modern expansion required recruiting younger software engineers and automation specialists. Leadership introduced aggressive forced-ranking performance appraisal curves (the bottom 10% faced probation) and variable compensation structures. The sudden shift clashed violently with the legacy collaborative culture, creating widespread cynicism, burnout, and an exodus of high-performing talent.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
> *"We cannot manage modern automation with a 1980s civil service mindset,"* argued the Chief Operating Officer. *"Our younger tech talent expects meritocratic fast-track promotions and equity incentives. Forced ranking weeds out complacency and ensures accountability on the factory floor."*

> *"The forced ranking system has destroyed psychological safety and cross-departmental cooperation,"* countered the Chief Human Resources Officer. *"Plant managers are manipulating evaluation scores to protect favorites, while our best collaborative engineers are resigning to join competitors. We are experiencing institutional brain drain."*

> *"Personnel overhead accounts for 28% of operating costs,"* noted the Chief Financial Officer. *"We will not replace variable performance pay with across-the-board wage hikes unless labor productivity increases by at least 15%."*

### 2. The Strategic Crossroads: Three HR Interventions
- **Alternative 1: Overhaul to Continuous Developmental Feedback & BARS**: Abolish forced rankings in favor of Behaviorally Anchored Rating Scales (BARS) and quarterly coaching; rebuilds morale but requires extensive managerial retraining.
- **Alternative 2: Tiered Compensation Dual-Track (Tech vs Legacy)**: Maintain traditional seniority scales for plant floor operations while establishing an agile, high-incentive track for digital talent; resolves pay competitiveness but risks union grievances over perceived inequality.
- **Alternative 3: Hybrid Total Rewards & Employee Stock/Retention Pools**: Retain performance accountability but introduce 3-year cliff retention bonuses and employee welfare wellness stipends; contains wage inflation but demands immediate cash funding.`,
      keyData: [
        { metric: "Total Workforce Headcount", value: "3,850", period: "FY25 (Full-time)", notes: "Plant + Tech operations" },
        { metric: "Voluntary Attrition Rate", value: "24.2%", period: "Trailing 12M", notes: "Historical norm was 8.5%" },
        { metric: "Employee Engagement (eNPS)", value: "-18", period: "FY25 Survey", notes: "Down from +34 in FY22" },
        { metric: "Average Time to Fill Key Roles", value: "68 Days", period: "FY25", notes: "Up from 35 days" },
        { metric: "Cost per Hire", value: "₹1,45,000", period: "FY25", notes: "High external agency fees" },
        { metric: "Payroll % of Operating Cost", value: "28.4%", period: "Audited Trailing", notes: "Total compensation burden" },
        { metric: "Forced Ranking Bottom 10% Attrition", value: "72%", period: "FY25", notes: "High regret turnover" },
        { metric: "Union Grievances Filed", value: "48", period: "Past 12 Months", notes: "Historical baseline was <5" },
      ],
      decisionPoint: `Which performance appraisal and talent retention architecture should the CHRO recommend to rebuild workforce trust without sacrificing operational accountability?`,
      questions: [
        `Using Herzberg's Motivation-Hygiene Theory, diagnose why variable performance bonuses failed to arrest voluntary attrition at ${company}.`,
        `Critically analyze the systemic failure of the forced-ranking appraisal architecture using the data in Exhibit 1.`,
        `Formulate a comprehensive Behaviorally Anchored Rating Scale (BARS) and continuous feedback system to replace forced ranking.`,
        `How should leadership manage industrial relations and union grievances during the restructuring of compensation packages?`,
        `Synthesize a 12-month Talent Retention Roadmap detailing milestone metrics for eNPS improvement and time-to-fill reduction.`,
      ],
      objectives: [
        `Apply core organizational behavior and motivational frameworks to diagnose acute workforce attrition.`,
        `Evaluate the structural limitations of forced-ranking appraisal systems versus developmental evaluation architectures (${bloomsLevel}).`,
        `Design actionable total rewards and employee engagement policies in legacy industrial enterprises.`,
      ],
      frameworks: [
        { name: "Herzberg's Two-Factor (Motivation-Hygiene) Theory", application: "Distinguishing between salary/working conditions (Hygiene) and recognition/growth (Motivators).", key_takeaway: "Variable performance bonuses addressed financial hygiene but violated psychological trust and fair recognition." },
        { name: "Ulrich's HR Business Partner (HRBP) Model", application: "Realigning HR from administrative compliance into strategic business partnering and employee advocacy.", key_takeaway: "HR must act as an Employee Champion to repair cultural fracture rather than merely executing corporate mandates." },
        { name: "Hackman & Oldham's Job Characteristics Model", application: "Evaluating skill variety, task identity, task significance, autonomy, and feedback.", key_takeaway: "Forced ranking stripped autonomy and task significance from mid-level engineers, triggering voluntary exit." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — Workforce Metrics, Attrition by Department & Engagement Scores`,
          type: "org_chart",
          description: "Departmental headcount distribution, voluntary attrition trends, and employee engagement survey results",
          data: [
            { department: "Digital & Automation Engineering", headcount: "420", attrition_rate: "34.5%", enps: "-32", time_to_fill: "84 Days" },
            { department: "Plant Floor & Production Ops", headcount: "2,150", attrition_rate: "18.2%", enps: "-12", time_to_fill: "42 Days" },
            { department: "Quality Assurance & R&D", headcount: "380", attrition_rate: "26.8%", enps: "-24", time_to_fill: "76 Days" },
            { department: "Supply Chain & Logistics", headcount: "620", attrition_rate: "22.0%", enps: "-16", time_to_fill: "48 Days" },
            { department: "Corporate & Finance Administration", headcount: "280", attrition_rate: "12.5%", enps: "+8", time_to_fill: "38 Days" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & Morale Crisis Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "Why did introducing performance-linked bonuses cause voluntary engineering attrition to spike to 34.5%?"`,
          expected_response: "Model Diagnostic Answer: Students should apply Herzberg's Two-Factor Theory to diagnose that forced ranking compromised psychological safety, fair recognition, and peer collaboration (Motivators), while variable compensation was viewed as a punitive threat rather than a reward.",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & Turnover Cost Analysis",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with calculating the annual cost of turnover across the 420-engineer division; Squad B with evaluating BARS implementation CapEx; Squad C with modeling union grievance strike probabilities.",
          expected_response: "Quantitative Solutions:\n• Squad A: At 34.5% attrition (145 engineers) and ₹1,45,000 cost-per-hire plus 84 days lost productivity, annual turnover drain exceeds ₹4.8 Cr.\n• Squad B: Transitioning to BARS and manager training costs ₹45 Lakh, delivering an immediate 10x ROI if turnover drops by 8%.\n• Squad C: Unaddressed union grievances risk a 3-day tool-down strike with an estimated ₹12 Cr revenue loss.",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Appraisal Architecture Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay: CHRO defends developmental appraisals, COO demands high-velocity plant targets, and CFO restricts payroll expansion.",
          expected_response: "Executive Defense Key:\n• CHRO proves that forced ranking produces institutional cynicism and high regret turnover.\n• COO proves that undisciplined seniority promotions create operational bottlenecks.\n• Consensus: Endorse Alternative 1 (BARS + Continuous Feedback) paired with transparent competency rubrics.",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board HR Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Synthesize the 3-Board plan: Board 1 (Behavioral Root Causes), Board 2 (Herzberg & Ulrich Framework Analysis), Board 3 (Total Rewards & Change Roadmap).",
          expected_response: "3-Board HR Plan Takeaways:\n• Board 1: Turnover drivers, attrition costs, trust deficit.\n• Board 2: Herzberg hygiene/motivator separation; Ulrich strategic HRBP alignment.\n• Board 3: Phased transition to BARS, manager coaching certification, and union conciliation protocol.",
        },
      ],
    }),
  },

  // =========================================================================
  // 4. IT / DIGITAL TECHNOLOGY SPECIALIST AGENT
  // =========================================================================
  it: {
    id: "it",
    domain: "IT",
    agentName: "IT & Digital Architecture Agent",
    title: "Chief Information Officer & Enterprise Digital Systems Chair",
    badge: "IT AGENT",
    specialization: "Enterprise Cloud Migration, Legacy Modernization, Cybersecurity, Technical Debt & DevSecOps",
    icon: "Cpu",
    accentColor: "indigo",
    tagline: "Calibrated for system uptime SLAs, cloud infrastructure spend, legacy monolith migration, and cybersecurity risk.",
    keyFrameworks: [
      "TOGAF Enterprise Architecture Framework",
      "Cloud Migration 6Rs (Rehost, Replatform, Refactor, Repurchase, Retain, Retire)",
      "DevSecOps CI/CD Maturity Model",
      "NIST Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover)",
      "Technical Debt Ratio & Architectural Health Index",
      "ITIL 4 Service Management & Incident Resolution",
    ],
    keyMetrics: [
      "System Uptime Availability SLA (99.9x%)",
      "Mean Time to Recovery (MTTR)",
      "Technical Debt Ratio %",
      "Monthly Cloud Infrastructure Spend (AWS/Azure)",
      "Sprint Velocity & Release Frequency",
      "Cybersecurity Vulnerability Count",
      "Legacy Code Maintenance Cost",
      "API Latency & Error Rate",
    ],
    decisionMaker: "Chief Information Officer & Chief Technology Officer",
    cSuiteStakeholders: [
      "Chief Information Officer (Advocates microservices refactoring and cloud modernization)",
      "Chief Information Security Officer (Enforces zero-trust architecture and compliance)",
      "Chief Financial Officer (Demands immediate containment of spiraling cloud hosting costs)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — IT & DIGITAL ENTERPRISE SYSTEMS:
- Ground narratives in IT infrastructure dilemmas: legacy on-premises ERP vs cloud SaaS, technical debt, and cybersecurity.
- Data tables MUST detail server uptime, cloud compute costs, ticket resolution times, and vulnerability matrices.
- Questions must evaluate software architecture trade-offs, cloud migration strategies, and enterprise data security.
- Frameworks must explicitly include Cloud Migration 6Rs, NIST Cybersecurity, and Technical Debt modeling.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Information Technology case study examining core ERP modernization, cloud infrastructure cost overruns, and cybersecurity resilience at ${company} in ${region}. The case examines how the CIO must resolve an emergency legacy database outage and technical debt crisis within 72 hours before commercial launch.`,
      background: `### 1. The Opening Hook & The Critical Core Outage
On a tense Thursday evening in ${region}, the Chief Information Officer stared at the red alert dashboard across the Network Operations Center. At 14:12 IST, the enterprise's 15-year-old on-premises relational database had suffered an unhandled transaction deadlock, halting supply chain billing for over 18,000 orders. In exactly 72 hours, on Monday at 9:00 AM, the board of directors would review the enterprise's ₹60 Cr digital modernization program.

### 2. Digital Genesis & The Accumulation of Technical Debt
For two decades, ${company} relied on a heavily customized on-premises ERP monolith:
- **Heavily Patched Custom Architecture**: Thousands of proprietary stored procedures and custom point-to-point API scripts built over 15 years.
- **Fragile Data Pipelines**: Nightly batch jobs taking over 7 hours to synchronize inventory and financial ledgers across divisions.
- **Spiraling Maintenance Costs**: Over 74% of the annual IT budget was consumed merely maintaining legacy hardware, leaving negligible funding for innovation.

### 3. Cloud Migration Challenges & Multi-Cloud Chaos
Attempting to accelerate digital commerce, leadership initiated a rapid "lift-and-shift" (rehosting) migration of frontend modules to public cloud providers. However, without re-architecting the backend database, API latency spiked to 2.4 seconds, while unoptimized cloud compute instances generated an unexpected 180% surge in monthly cloud hosting bills.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
> *"A simple lift-and-shift has failed; we must fully refactor into a cloud-native microservices architecture,"* argued the Chief Technology Officer. *"Unless we decouple our monolithic billing database and adopt serverless event-driven pipelines, catastrophic outages will become weekly occurrences."*

> *"Refactoring a 15-year-old codebase will take 18 months and freeze all business feature releases,"* countered the VP of Commercial Operations. *"Our retail business cannot wait a year and a half without new promotional modules while IT rewires internal plumbing."*

> *"Our monthly cloud bills have jumped from ₹18 Lakh to ₹54 Lakh with zero improvement in system uptime,"* noted the Chief Financial Officer. *"I will not approve additional cloud consulting budgets without guaranteed FinOps cost controls and 99.95% uptime guarantees."*

### 2. The Strategic Crossroads: Three IT Modernization Paths
- **Alternative 1: Full Cloud-Native Microservices Refactoring (₹45 Cr – ₹60 Cr)**: Decommission on-premises hardware; build containerized microservices and event streams; maximum agility but high transition execution risk.
- **Alternative 2: Standardized Enterprise Cloud SaaS Migration (₹30 Cr – ₹40 Cr)**: Adopt commercial cloud ERP SaaS (e.g. SAP S/4HANA or Oracle Cloud); eliminates bespoke tech debt but forces company to adopt standard off-the-shelf business processes.
- **Alternative 3: Hybrid Strangler-Fig Encapsulation (₹18 Cr – ₹25 Cr)**: Wrap the legacy monolith with modern API gateways and gradually replace high-traffic endpoints; lower upfront cost and risk, but prolongs legacy technical debt.`,
      keyData: [
        { metric: "Core System Uptime SLA", value: "98.4%", period: "Trailing 12M", notes: "Target SLA is 99.95%" },
        { metric: "Monthly Cloud Hosting Spend", value: "₹54 Lakh", period: "Current Trailing", notes: "+180% budget overrun" },
        { metric: "Mean Time to Recovery (MTTR)", value: "4.8 Hours", period: "FY25 Outages", notes: "Benchmark is <30 mins" },
        { metric: "Technical Debt Ratio", value: "42.5%", period: "SonarQube Audit", notes: "Critical codebase vulnerability" },
        { metric: "Legacy Maintenance % of IT Budget", value: "74.0%", period: "Audited Trailing", notes: "Crowds out innovation CapEx" },
        { metric: "Critical Security Patches Pending", value: "38", period: "Past 90 Days", notes: "Compliance vulnerability" },
        { metric: "Checkout API Latency", value: "2,400 ms", period: "Peak Hours", notes: "Degrades user conversion" },
        { metric: "Modernization CapEx Budget", value: "₹45 Cr – ₹60 Cr", period: "3-Year Horizon", notes: "Board capital allocation choice" },
      ],
      decisionPoint: `Which IT modernization architecture and cloud migration roadmap should the CIO present to the board to eliminate outage vulnerabilities while controlling cloud run-rate costs?`,
      questions: [
        `Using the Cloud Migration 6Rs framework, evaluate why the initial 'Rehost' (lift-and-shift) approach led to cloud budget overruns and latency spikes.`,
        `Calculate the total financial impact of 98.4% system uptime versus 99.95% SLA using the transaction outage data in Exhibit 1.`,
        `Compare the operational trade-offs between complete microservices refactoring and commercial SaaS adoption.`,
        `How should the CIO implement FinOps practices to optimize cloud compute instance sizing and eliminate idle cloud waste?`,
        `Synthesize a 180-day IT Modernization Roadmap detailing API gateway encapsulation, security remediation, and disaster recovery testing.`,
      ],
      objectives: [
        `Analyze architectural trade-offs between monolithic legacy software, cloud-native microservices, and enterprise SaaS packages.`,
        `Quantify the business impact of technical debt and system downtime using availability SLAs (${bloomsLevel}).`,
        `Design actionable cloud governance and FinOps cost-control mechanisms for large-scale enterprise IT migrations.`,
      ],
      frameworks: [
        { name: "Cloud Migration 6Rs Framework", application: "Evaluating Rehost, Replatform, Refactor, Repurchase, Retain, and Retire strategies.", key_takeaway: "Lifting and shifting legacy monoliths onto cloud VMs increases costs without unlocking cloud scalability." },
        { name: "Strangler-Fig Modernization Pattern", application: "Incrementally replacing monolithic capabilities with microservices via an API gateway.", key_takeaway: "Mitigates high-risk 'big-bang' replatforming by modernizing critical business capabilities in stages." },
        { name: "NIST Cybersecurity Framework (CSF)", application: "Assessing enterprise vulnerabilities across Identify, Protect, Detect, Respond, and Recover.", key_takeaway: "Legacy unpatched database servers represent the primary threat vector for enterprise ransomware exposure." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — IT Infrastructure Performance, Outage Logs & Cloud Cost Breakdown`,
          type: "table",
          description: "System availability SLA trends, cloud compute cost escalation, and application latency metrics",
          data: [
            { system: "Core ERP & Inventory Database", uptime: "98.2%", monthly_cost: "₹18 Lakh (On-prem)", mttr: "5.4 Hours", tech_debt_rating: "Critical" },
            { system: "E-Commerce Frontend & App API", uptime: "99.1%", monthly_cost: "₹24 Lakh (AWS Cloud)", mttr: "1.8 Hours", tech_debt_rating: "Moderate" },
            { system: "Payment & Billing Gateway", uptime: "99.8%", monthly_cost: "₹8 Lakh (SaaS Hosted)", mttr: "0.4 Hours", tech_debt_rating: "Low" },
            { system: "Data Warehousing & BI Reports", uptime: "96.5%", monthly_cost: "₹14 Lakh (Cloud Lake)", mttr: "8.2 Hours", tech_debt_rating: "High" },
            { system: "Total Enterprise IT Footprint", uptime: "98.4%", monthly_cost: "₹64 Lakh (Combined)", mttr: "4.8 Hours", tech_debt_rating: "Severe" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & Outage Root Cause Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "Why did lifting and shifting a legacy ERP database to the cloud triple monthly costs while degrading system uptime to 98.4%?"`,
          expected_response: "Model Diagnostic Answer: The root cause is architectural mismatch. An on-premises monolith designed for local disk access was moved to cloud virtual machines without refactoring database queries or connection pools, causing cloud auto-scaling compute over-provisioning and inter-service network latency.",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & Downtime Impact Modeling",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with calculating lost order revenue from 98.4% uptime; Squad B with modeling FinOps compute rightsizing savings; Squad C with comparing SaaS TCO over 5 years.",
          expected_response: "Quantitative Solutions:\n• Squad A: 1.6% downtime equals 140 hours of outage annually, resulting in ₹18.5 Cr in delayed or abandoned orders.\n• Squad B: Rightsizing over-provisioned cloud instances and purchasing reserved capacity can reduce monthly cloud bills from ₹54 Lakh to ₹26 Lakh (52% savings).\n• Squad C: Commercial SaaS ERP incurs higher annual subscriptions but saves ₹22 Cr in internal software engineering overhead over 5 years.",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Architecture Strategy Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay: CIO defends microservices refactoring, VP Operations demands instant feature delivery, and CFO enforces budget caps.",
          expected_response: "Executive Defense Key:\n• CIO demonstrates that continuing to patch legacy monoliths will cause complete system failure.\n• VP Operations proves that an 18-month code freeze will forfeit market share.\n• Consensus: Endorse Alternative 3 (Strangler-Fig pattern with API gateway) to balance modernization with continuous feature releases.",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board IT Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Synthesize the 3-Board plan: Board 1 (Architecture Bottlenecks), Board 2 (6Rs & FinOps Frameworks), Board 3 (180-Day Execution Roadmap).",
          expected_response: "3-Board IT Plan Takeaways:\n• Board 1: Technical debt heat map, latency bottlenecks, cloud billing overruns.\n• Board 2: 6Rs migration evaluation, FinOps governance policies, NIST security controls.\n• Board 3: Milestone execution: API gateway deployment, database connection pooling, and multi-zone failover testing.",
        },
      ],
    }),
  },

  // =========================================================================
  // 5. SUPPLY CHAIN SPECIALIST AGENT
  // =========================================================================
  "supply-chain": {
    id: "supply-chain",
    domain: "Supply Chain",
    agentName: "Supply Chain & Logistics Agent",
    title: "Chief Supply Chain Officer & Global Logistics Engineering Chair",
    badge: "SUPPLY CHAIN AGENT",
    specialization: "Procurement Resilience, Warehouse Automation, Inventory Optimization, Last-Mile & OTIF",
    icon: "Truck",
    accentColor: "amber",
    tagline: "Calibrated for inventory holding costs, supplier concentration risks, freight logistics, and fill rates.",
    keyFrameworks: [
      "SCOR (Supply Chain Operations Reference) Model",
      "Kraljic Portfolio Purchasing Matrix (Strategic vs Bottleneck)",
      "Economic Order Quantity (EOQ) & Safety Stock Calculations",
      "Bullwhip Effect Mitigation & Collaborative Planning (CPFR)",
      "Total Cost of Ownership (TCO) in Sourcing",
      "Reverse Logistics & Closed-Loop Circular Networks",
    ],
    keyMetrics: [
      "On-Time In-Full (OTIF) Delivery %",
      "Days of Inventory Supply (DOS)",
      "Cash-to-Cash Cycle Time (Days)",
      "Freight & Logistics Cost as % of Revenue",
      "Supplier Defect Rate (PPM)",
      "Warehouse Capacity Utilization %",
      "Stock-out Rate & Lost Sales Value",
      "Average Order Lead Time",
    ],
    decisionMaker: "Chief Supply Chain Officer & EVP of Global Logistics",
    cSuiteStakeholders: [
      "Chief Supply Chain Officer (Advocates safety stock resilience and multi-vendor sourcing)",
      "Chief Financial Officer (Demands lean working capital and inventory reduction)",
      "Head of Sales & Commercial (Demands 100% order fill rate with zero stockouts)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — SUPPLY CHAIN & LOGISTICS MANAGEMENT:
- Ground narratives in supplier bottlenecks, logistics costs, freight transit times, and inventory holding trade-offs.
- Data tables MUST detail warehouse utilization, inventory turnover, freight costs per tonne-km, and supplier lead times.
- Questions must evaluate lean vs resilient inventory models, dual-sourcing, and distribution network design.
- Frameworks must explicitly include SCOR model, Kraljic matrix, and EOQ safety stock modeling.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Supply Chain Management case study analyzing raw material procurement bottlenecks, warehouse inventory bloat, and last-mile logistics volatility at ${company} in ${region}. The case examines how the CSCO must address a severe inventory holding crisis and supply chain vulnerability within 72 hours before seasonal distributor ordering.`,
      background: `### 1. The Opening Hook & The Logistics Bottleneck
On a Thursday morning at the central distribution hub in ${region}, the Chief Supply Chain Officer walked through the regional logistics terminal. Outside, 40 container trucks idle in gridlock; inside, warehouse racking stood at an untenable 96.5% capacity. In exactly 72 hours, on Monday at 9:00 AM, the board would review the company's annual distribution contracts. Despite carrying ₹180 Cr in inventory, the company's On-Time In-Full (OTIF) fulfillment rate had dropped to 78.4%, causing retail stockouts across key metropolitan clusters.

### 2. Supply Chain Genesis & The Single-Source Model
Over twenty years, ${company} had optimized its logistics network around low-cost lean principles:
- **Sole-Source Sourcing Efficiency**: 65% of critical raw materials were procured from a single low-cost cluster, maximizing volume discounts.
- **Centralized Mega-Hub Distribution**: A single central warehouse supplied regional cross-dock terminals, minimizing facility overhead.
- **Just-In-Time (JIT) Sourcing Cadence**: Keeping buffer stock at historical minimums to maximize free cash flow.

### 3. Supply Shocks & The Bullwhip Amplification
However, global maritime freight disruptions, regional fuel price inflation, and sudden raw material export curbs broke the lean supply chain. Lead times stretched from 14 days to 48 days. In response, regional sales managers panicked and placed inflated duplicate orders, triggering severe bullwhip amplification that trapped ₹74 Cr in excess slow-moving inventory while high-demand items ran out of stock.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
> *"We must abandon single-sourcing and transition to a resilient multi-tier supplier network with regional fulfillment micro-hubs,"* insisted the Chief Supply Chain Officer. *"Carrying buffer inventory and qualifying secondary domestic suppliers will cost 4% more on unit purchase price, but it eliminates the risk of complete factory shutdown."*

> *"Inventory holding costs have ballooned to ₹34 Cr annually,"* objected the Chief Financial Officer. *"Our Days of Inventory Supply (DOS) has climbed from 38 days to 68 days, choking our operating cash flow. We must liquidate inventory and return to lean JIT discipline, not build expensive regional warehouses."*

> *"Our retail fulfillment rate is at an embarrassing 78%,"* protested the Commercial Sales Director. *"Distributors are canceling orders because trucks arrive two weeks late. I do not care how much inventory we carry as long as shelves are 100% full."*

### 2. The Strategic Crossroads: Three Supply Chain Pathways
- **Alternative 1: Regional Micro-Hub Network & Multi-Sourcing (₹40 Cr – ₹55 Cr)**: Establish 4 regional automated distribution hubs and qualify dual domestic vendors; achieves 95%+ OTIF but increases fixed facility overhead.
- **Alternative 2: Third-Party Logistics (3PL) & Cloud Visibility Integration (₹20 Cr – ₹28 Cr)**: Outsource regional warehousing and last-mile logistics to a tech-enabled 3PL platform; converts fixed CapEx into variable OpEx but reduces operational control.
- **Alternative 3: Lean Centralization & SKU Rationalization (₹10 Cr – ₹15 Cr)**: Discontinue 30% of slow-moving custom SKUs, optimize EOQ batch sizes, and enforce strict minimum order quantities; minimizes working capital but limits product variety.`,
      keyData: [
        { metric: "On-Time In-Full (OTIF) Rate", value: "78.4%", period: "Trailing 12M", notes: "Target benchmark is 95.0%" },
        { metric: "Days of Inventory Supply (DOS)", value: "68 Days", period: "FY25 (Audited)", notes: "Historical norm was 38 days" },
        { metric: "Total Inventory Holding Value", value: "₹180 Cr", period: "FY25", notes: "₹74 Cr in slow-moving stock" },
        { metric: "Freight & Logistics % of Sales", value: "9.2%", period: "FY25", notes: "Up from 6.4% in FY23" },
        { metric: "Central Warehouse Utilization", value: "96.5%", period: "Current Trailing", notes: "Exceeds safe 85% ceiling" },
        { metric: "Single-Source Supplier Reliance", value: "65.0%", period: "Raw Materials", notes: "Extreme supply vulnerability" },
        { metric: "Stockout Lost Sales Value", value: "₹42 Cr", period: "FY25", notes: "Unmet customer demand" },
        { metric: "Average Supplier Lead Time", value: "48 Days", period: "FY25", notes: "Up from 14 days" },
      ],
      decisionPoint: `Which supply chain architecture and inventory optimization strategy should the CSCO implement to achieve 95% OTIF without bankrupting working capital?`,
      questions: [
        `Using the Kraljic Portfolio Purchasing Matrix, classify ${company}'s raw materials and propose risk mitigation strategies for bottleneck inputs.`,
        `Calculate the financial carrying cost of 68 Days of Inventory Supply (DOS) versus the 38-day historical benchmark using data in Exhibit 1.`,
        `Analyze the operational trade-offs between building internal regional fulfillment hubs (Alternative 1) versus partnering with a 3PL network (Alternative 2).`,
        `How should leadership mitigate the Bullwhip Effect across retail distributors using Collaborative Planning, Forecasting, and Replenishment (CPFR)?`,
        `Formulate a 90-day Logistics Remediation Plan to restore OTIF to 92%+ before peak seasonal demand.`,
      ],
      objectives: [
        `Evaluate supplier vulnerability and procurement risk using the Kraljic Matrix.`,
        `Calculate inventory holding costs, safety stock levels, and Economic Order Quantities (${bloomsLevel}).`,
        `Design resilient omnichannel distribution networks balancing customer fill rates against logistics cost efficiency.`,
      ],
      frameworks: [
        { name: "Kraljic Purchasing Portfolio Matrix", application: "Categorizing inputs into Strategic, Bottleneck, Leverage, and Non-Critical quadrants.", key_takeaway: "Single-sourced critical raw materials represent a dangerous bottleneck requiring dual-sourcing contracts." },
        { name: "SCOR (Supply Chain Operations Reference) Model", application: "Benchmarking Plan, Source, Make, Deliver, and Return performance metrics.", key_takeaway: "Delivery failures are rooted in Source lead-time volatility rather than manufacturing Make bottlenecks." },
        { name: "Economic Order Quantity (EOQ) & Safety Stock", application: "Rebalancing order batch sizes and safety stock buffers against holding costs.", key_takeaway: "Carrying uncalibrated safety stock across 100% of SKUs locks ₹74 Cr in dead capital; safety stock must be dynamically tiered by ABC velocity." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — Logistics Performance, Inventory Aging & Sourcing Lead Times`,
          type: "table",
          description: "Inventory aging breakdown, transportation freight costs, and supplier lead time escalation",
          data: [
            { category: "Fast-Moving Consumer SKUs (A)", inventory_value: "₹62 Cr", days_supply: "28 Days", otif_rate: "88.5%", lead_time: "21 Days" },
            { category: "Medium-Velocity Seasonal Lines (B)", inventory_value: "₹44 Cr", days_supply: "48 Days", otif_rate: "76.0%", lead_time: "38 Days" },
            { category: "Slow-Moving Custom Variants (C)", inventory_value: "₹74 Cr", days_supply: "112 Days", otif_rate: "62.4%", lead_time: "65 Days" },
            { category: "Total Enterprise Inventory", inventory_value: "₹180 Cr", days_supply: "68 Days", otif_rate: "78.4%", lead_time: "48 Days" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & Bullwhip Breakdown Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "Why did holding ₹180 Cr in record inventory result in a miserable 78.4% customer order fulfillment rate?"`,
          expected_response: "Model Diagnostic Answer: The paradox is explained by the Bullwhip Effect and inventory misallocation. While warehouse capacity is 96.5% full, ₹74 Cr is trapped in slow-moving Category C items (112 days supply), while fast-moving Category A items experienced frequent stockouts due to extended 48-day supplier lead times.",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & Inventory Carrying Cost Analysis",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with calculating annual holding cost savings from reducing DOS from 68 to 42 days; Squad B with evaluating 3PL OpEx versus owned warehouse CapEx; Squad C with computing ABC SKU rationalization margins.",
          expected_response: "Quantitative Solutions:\n• Squad A: At 18% cost of capital and storage drag, reducing DOS by 26 days releases ₹68 Cr in cash and saves ₹12.2 Cr in annual carrying cost.\n• Squad B: 3PL partnership requires ₹14 Cr annual variable OpEx with zero CapEx, preserving capital compared to a ₹45 Cr internal warehouse build.\n• Squad C: Discontinuing the bottom 30% of slow-moving SKUs eliminates ₹48 Cr of obsolete inventory with only a 4.2% hit to total sales.",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Logistics Strategy Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay: CSCO defends supply chain resilience, CFO demands working capital reduction, and Sales Head demands 100% order fill rate.",
          expected_response: "Executive Defense Key:\n• CSCO proves single-sourcing will cause catastrophic factory halts during disruption.\n• CFO proves current inventory bloat will trigger a liquidity crisis.\n• Consensus: Endorse Alternative 2 (3PL flexibility) combined with immediate ABC inventory rationalization.",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Supply Chain Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Consolidate the consensus: Board 1 (Inventory Pathology & Bullwhip), Board 2 (Kraljic & SCOR Frameworks), Board 3 (90-Day Execution Roadmap).",
          expected_response: "3-Board Supply Chain Plan Takeaways:\n• Board 1: Inventory aging curve, stockout penalties, lead-time variance.\n• Board 2: Kraljic matrix reclassification, ABC inventory stratification, EOQ parameters.\n• Board 3: Milestone execution: Dual-supplier contracts, 3PL master service agreement, CPFR data sharing with distributors.",
        },
      ],
    }),
  },

  // =========================================================================
  // 6. STRATEGY SPECIALIST AGENT
  // =========================================================================
  strategy: {
    id: "strategy",
    domain: "Strategy",
    agentName: "Corporate Strategy & M&A Agent",
    title: "Senior Partner & Corporate Strategy / Competitive Advantage Chair",
    badge: "STRATEGY AGENT",
    specialization: "Competitive Dynamics, Barney's VRIO, M&A Synergy Realization, Diversification & Moat Defensibility",
    icon: "Target",
    accentColor: "rose",
    tagline: "Calibrated for competitive advantage durability, corporate M&A valuation, and structural industry transitions.",
    keyFrameworks: [
      "Porter's Five Forces & Industry Attractiveness",
      "Barney's VRIO Framework (Value, Rarity, Inimitability, Organization)",
      "Blue Ocean Strategy Canvas & Value Innovation",
      "BCG Growth-Share Matrix & Capital Reallocation",
      "Ansoff Product-Market Growth Matrix",
      "Post-Merger Integration (PMI) Synergy Realization",
    ],
    keyMetrics: [
      "Return on Invested Capital (ROIC) vs WACC Spread",
      "Economic Value Added (EVA)",
      "Relative Market Share (RMS)",
      "Gross Margin Premium vs Industry Median",
      "Post-Merger Synergy Realization %",
      "Core vs Non-Core Revenue Contribution %",
      "Customer Switching Cost Index",
      "Free Cash Flow Conversion Ratio",
    ],
    decisionMaker: "Managing Director & Chief Strategy Officer",
    cSuiteStakeholders: [
      "Chief Strategy Officer (Urges inorganic M&A growth and digital business model pivot)",
      "Chief Financial Officer (Focuses on ROIC preservation and balance sheet solvency)",
      "Board Chairperson (Demands protection of long-term promoter legacy and dividend payout)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — CORPORATE STRATEGY & COMPETITIVE DYNAMICS:
- Ground all narratives in structural industry disruption, competitive moats, and corporate boundaries.
- Data tables MUST detail competitor benchmarking, ROIC vs WACC, market share concentration, and M&A valuation multiples.
- Questions must evaluate strategic positioning, Barney's VRIO resource audits, and merger integration risks.
- Frameworks must explicitly include Porter's Five Forces, VRIO, and BCG/Ansoff growth models.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Corporate Strategy case study examining competitive moat erosion, inorganic M&A expansion, and corporate diversification at ${company} in ${region}. The case examines how leadership must choose between an aggressive ₹85 Cr acquisition or core consolidation within 72 hours before the annual shareholder assembly.`,
      background: `### 1. The Opening Hook & The Boardroom Crossroads
On a Thursday afternoon in ${region}, the Managing Director and Chief Strategy Officer reviewed the 5-year strategic corporate plan. In exactly 72 hours, on Monday at 9:00 AM, the Board of Directors would convene for the decennial strategy review. For thirty years, ${company} had stood as the uncontested industry titan in ${region}; today, competitive benchmarking revealed that its historical Return on Invested Capital (ROIC) had fallen from 18.5% to 9.2%, falling below its cost of capital (WACC) for the first time in corporate history.

### 2. Strategic Genesis & The Traditional Moat
The enterprise's historical success was anchored in three self-reinforcing strategic pillars:
- **High Sunk-Cost Physical Infrastructure**: Prohibitive capital entry barriers that historically discouraged new entrants.
- **Entrenched Institutional Customer Relationships**: Multi-year sticky commercial contracts with high perceived switching costs.
- **Scale-Driven Cost Leadership**: Substantial economies of scale delivering a 400 bps gross margin cost advantage over local challengers.

### 3. Industry Structural Shifts & Moat Dissolution
Over the past 36 months, regulatory deregulation, digital platforms, and private equity-funded startups fundamentally restructured the industry. Agile rivals unbundled the value chain, deploying asset-light operating models and capturing high-margin premium customer niches. ${company}'s scale, once its greatest defensive moat, transformed into an operational anchor of high fixed overhead.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
> *"Our core market is entering secular decline; we must execute an aggressive inorganic M&A acquisition of our fastest-growing tech challenger,"* argued the Chief Strategy Officer. *"Acquiring a controlling 51% stake in the challenger platform gives us an immediate digital presence and proprietary customer data. Standing still is corporate suicide."*

> *"Paying a 45% acquisition premium for an unproven, cash-burning startup will destroy shareholder value,"* cautioned the Chief Financial Officer. *"Post-merger cultural integration failures in our sector exceed 60%. If the acquired engineers walk out after payout, we will be left with ₹85 Cr of impaired goodwill on our balance sheet."*

> *"We should double down on our core enterprise strengths,"* insisted the Board Chairperson. *"Let the startups burn venture equity on low-margin customer acquisition. We should protect our fortress balance sheet, rationalize unprofitable product lines, and pay dividends."*

### 2. The Strategic Crossroads: Three Mutually Exclusive Alternatives
- **Alternative 1: Aggressive Inorganic M&A Acquisition (₹75 Cr – ₹95 Cr)**: Acquire a 51% controlling stake in a venture-backed tech challenger; instant market transformation but high valuation multiple and cultural clash.
- **Alternative 2: Strategic Joint Venture & Co-Development Alliance (₹35 Cr – ₹45 Cr)**: Form an equal-partnership joint venture with a global technology firm; shares capital risk but introduces governance deadlocks.
- **Alternative 3: Core Consolidation & Premium Niche Retrenchment (₹15 Cr – ₹20 Cr)**: Exit commoditized product lines, defend operating margins, and optimize free cash flow; preserves capital but caps future enterprise valuation.`,
      keyData: [
        { metric: "Gross Revenue", value: "₹1,850 Cr", period: "FY25 (Audited)", notes: "+7.7% CAGR" },
        { metric: "Return on Invested Capital (ROIC)", value: "9.2%", period: "FY25", notes: "Down from 18.5% in FY21" },
        { metric: "Cost of Capital (WACC)", value: "10.4%", period: "FY25 Estimate", notes: "ROIC spread is negative (-1.2%)" },
        { metric: "Relative Market Share", value: "28.5%", period: "Trailing 12M", notes: "Down from 44.0% in FY20" },
        { metric: "Gross Margin Premium vs Peers", value: "-120 bps", period: "FY25 Benchmark", notes: "Lost historical cost advantage" },
        { metric: "Proposed Acquisition Price", value: "₹85 Cr", period: "M&A Target", notes: "4.5x trailing revenue multiple" },
        { metric: "Free Cash Flow Conversion", value: "28.0%", period: "FY25", notes: "Down from 62.0% in FY21" },
        { metric: "Market Capitalization Multiple", value: "1.2x P/S", period: "Current Market", notes: "Discount to tech peers (4.8x)" },
      ],
      decisionPoint: `Which strategic growth trajectory and corporate boundary decision should the MD endorse to rebuild durable competitive advantage?`,
      questions: [
        `Apply Porter's Five Forces framework to explain why industry profitability for legacy operators has structurally deteriorated.`,
        `Conduct a rigorous Barney's VRIO audit of ${company}'s core capabilities: which assets remain sustainable moats versus competitive parity?`,
        `Evaluate the strategic synergy and post-merger integration risks of acquiring a 51% stake in the challenger platform (Alternative 1).`,
        `Contrast the corporate governance risks of a 50:50 Joint Venture (Alternative 2) versus unilateral internal development.`,
        `Formulate a 3-Year Strategic Transformation Blueprint outlining resource reallocation, corporate restructuring, and exit criteria.`,
      ],
      objectives: [
        `Master strategic diagnosis of industry structural changes using Porter's Five Forces.`,
        `Conduct resource-based capability audits using Barney's VRIO Framework (${bloomsLevel}).`,
        `Evaluate corporate growth options: organic internal development vs inorganic M&A vs strategic alliances.`,
      ],
      frameworks: [
        { name: "Barney's VRIO Resource-Based Framework", application: "Evaluating Value, Rarity, Inimitability, and Organizational capture of physical vs digital assets.", key_takeaway: "Physical assets are valuable but imitable; direct customer relationships and digital algorithms represent the only rare and inimitable moats." },
        { name: "Porter's Five Forces of Industry Structure", application: "Assessing buyer power, supplier concentration, threat of substitutes, and barriers to entry.", key_takeaway: "Industry boundaries have blurred as venture-funded platforms lowered buyer switching costs, destroying legacy pricing power." },
        { name: "Blue Ocean Strategy & Value Innovation", application: "Evaluating uncontested market spaces by simultaneously pursuing differentiation and low cost.", key_takeaway: "Competing in existing red ocean product lines guarantees margin erosion; the enterprise must create value innovation." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — Competitive Benchmarking, ROIC vs WACC & Valuation Multiples`,
          type: "table",
          description: "Comparative market share, ROIC spreads, operating margins, and valuation multiples across competitors",
          data: [
            { competitor: `${company} (Incumbent)`, market_share: "28.5%", roic: "9.2%", ebitda_margin: "10.6%", valuation_multiple: "1.2x Sales" },
            { competitor: "Apex Digital Disruptor (M&A Target)", market_share: "14.2%", roic: "16.4%", ebitda_margin: "18.2%", valuation_multiple: "4.5x Sales" },
            { competitor: "Global Multinational Entrant", market_share: "22.0%", roic: "14.8%", ebitda_margin: "15.0%", valuation_multiple: "2.8x Sales" },
            { competitor: "Regional Tier-2 Consolidators", market_share: "35.3%", roic: "7.8%", ebitda_margin: "8.4%", valuation_multiple: "0.9x Sales" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & Moat Erosion Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "Why did a 30-year industry leader's ROIC fall from 18.5% to 9.2%, destroying economic value below WACC?"`,
          expected_response: "Model Diagnostic Answer: The economic value destruction is driven by moat erosion. Sunk-cost physical infrastructure that once protected high gross margins now burdens the company with high fixed costs, while asset-light competitors capture profitable customer segments without carrying manufacturing assets.",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & M&A Valuation Stress-Testing",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with evaluating the financial return and payback of the ₹85 Cr acquisition; Squad B with modeling JV governance risk; Squad C with computing ROIC under core retrenchment.",
          expected_response: "Quantitative Solutions:\n• Squad A: At ₹85 Cr (4.5x sales), the acquisition requires ₹28 Cr in annual post-merger synergy realization to justify the 45% premium over book value.\n• Squad B: The 50:50 Joint Venture saves ₹40 Cr in upfront CapEx but introduces severe deadlocks over dividend extraction and IP ownership.\n• Squad C: Alternative 3 restores ROIC to 12.8% within two years by eliminating loss-making product lines, but caps terminal enterprise value.",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & M&A Dilemma Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay: CSO champions M&A expansion, CFO warns of goodwill write-offs, and Board Chair defends independence.",
          expected_response: "Executive Defense Key:\n• CSO proves organic internal innovation is too slow to counter digital competitors.\n• CFO proves acquiring unproven tech startups creates catastrophic goodwill impairment.\n• Consensus: Pursue a staged milestone acquisition (Alternative 1) with 30% upfront equity and performance-contingent earnouts.",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Strategy Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Synthesize the 3-Board plan: Board 1 (Competitive Diagnosis), Board 2 (VRIO & Five Forces), Board 3 (Corporate Strategy Recommendation).",
          expected_response: "3-Board Strategy Plan Takeaways:\n• Board 1: Competitive benchmarking, negative economic value added (EVA), moat erosion.\n• Board 2: Barney's VRIO capability audit and Porter's five forces structural shift.\n• Board 3: Milestone execution roadmap: Staged M&A deal structure, key leadership retention covenants, and synergy accountability.",
        },
      ],
    }),
  },

  // =========================================================================
  // 7. ANALYTICS SPECIALIST AGENT
  // =========================================================================
  analytics: {
    id: "analytics",
    domain: "Analytics",
    agentName: "Business Analytics & AI Agent",
    title: "Chief Data Officer & Applied Enterprise Analytics Chair",
    badge: "ANALYTICS AGENT",
    specialization: "Predictive Modeling, A/B Testing, Data Governance, MLOps & Decision Intelligence",
    icon: "BarChart3",
    accentColor: "cyan",
    tagline: "Calibrated for predictive precision, A/B testing statistical rigor, data pipelines, and algorithm ROI.",
    keyFrameworks: [
      "CRISP-DM (Cross-Industry Standard Process for Data Mining)",
      "A/B Testing & Null Hypothesis Statistical Significance (p-values)",
      "Predictive Confusion Matrix (Precision, Recall, F1, ROC-AUC)",
      "Data Mesh & Modern Enterprise Data Stack Architecture",
      "Feature Store & MLOps Pipeline Lifecycle",
      "Return on Data Capital (RODC) & Analytics Value Realization",
    ],
    keyMetrics: [
      "Model Accuracy & F1-Score",
      "Prediction Latency (ms)",
      "Data Pipeline SLA Reliability %",
      "A/B Test Statistical Power & p-value",
      "Customer Churn Predictive Lift Ratio",
      "Return on Data Investment (RODI)",
      "Data Cleansing & Drift Error Rate",
      "Algorithm-Assisted Revenue Uplift %",
    ],
    decisionMaker: "Chief Data Officer & Head of Enterprise AI",
    cSuiteStakeholders: [
      "Chief Data Officer (Champions algorithmic automation and enterprise data governance)",
      "Chief Commercial Officer (Skeptical of machine learning black-box recommendations)",
      "Chief Financial Officer (Demands measurable revenue lift from multi-crore data investments)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — BUSINESS ANALYTICS & ENTERPRISE AI:
- Ground narratives in data quality, predictive modeling trade-offs, A/B testing, and algorithmic bias.
- Data tables MUST detail model evaluation metrics (Precision, Recall, ROC-AUC), pipeline latency, and test statistical significance.
- Questions must require hypothesis testing, confusion matrix interpretation, and MLOps governance evaluation.
- Frameworks must explicitly include CRISP-DM, A/B testing statistical significance, and Confusion Matrix analytics.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Business Analytics case study examining predictive customer churn modeling, A/B testing statistical rigor, and enterprise data governance at ${company} in ${region}. The case examines how the CDO must resolve an algorithmic model drift crisis and data governance breakdown within 72 hours before nationwide marketing rollout.`,
      background: `### 1. The Opening Hook & The Predictive Model Breakdown
On a Thursday morning at corporate headquarters in ${region}, the Chief Data Officer reviewed the quarterly predictive machine learning performance report. In exactly 72 hours, on Monday at 9:00 AM, the executive committee would review the company's ₹25 Cr enterprise data science investment. Over the preceding two quarters, an automated customer retention algorithm had generated false-positive churn alerts that caused sales teams to distribute ₹14 Cr in unnecessary discounting, while high-value customers continued leaving undetected.

### 2. Analytics Genesis & The Transition from Intuition to AI
For two decades, ${company} operated through experiential commercial heuristics:
- **Heuristic Excel-Based Forecasting**: Regional branch managers relied on subjective historical sales intuition to forecast inventory and demand.
- **Siloed Departmental Data Repositories**: Marketing, ERP billing, and customer service maintained disconnected relational databases.
- **High Friction in Commercial Reporting**: Generating quarterly business intelligence reports required weeks of manual data cleansing.

### 3. The Data Science Overhaul & The Model Drift Trap
Seeking to modernize, leadership built a centralized enterprise data lake and deployed automated gradient-boosted decision tree models to predict customer lifetime value and churn risk. However, data engineering pipelines failed to account for seasonal purchasing shifts and regional consumer behavior drift. The algorithm experienced severe concept drift, dropping model precision from 84% to 58%.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
> *"The problem is not machine learning; it is data pipeline infrastructure and feature drift,"* explained the Chief Data Officer. *"We deployed models without automated MLOps monitoring and real-time feature stores. If we invest ₹12 Cr in automated feature engineering and continuous retraining pipelines, model precision will rebound to 88%."*

> *"Our sales managers have lost complete trust in your black-box algorithms,"* countered the Chief Commercial Officer. *"Your algorithm gave 25% discounts to customers who were already loyal, while our top three corporate accounts left because no human account manager contacted them. We should return to human relationship management."*

> *"We have poured ₹25 Cr into cloud data infrastructure and AI data scientists with zero measurable bottom-line yield,"* noted the Chief Financial Officer. *"I will not approve additional data platform CapEx until the team proves statistical causality through randomized controlled A/B testing."*

### 2. The Strategic Crossroads: Three Analytics Strategies
- **Alternative 1: Full Enterprise MLOps & Real-Time Feature Store (₹12 Cr – ₹16 Cr)**: Implement automated model drift detection, real-time feature streaming, and automated retraining; highest predictive accuracy but high cloud infrastructure cost.
- **Alternative 2: Hybrid Human-in-the-Loop Decision Support (₹6 Cr – ₹9 Cr)**: Algorithmic alerts serve as recommendations reviewed by human account managers before discounts are approved; prevents costly discount leakage but slows operational velocity.
- **Alternative 3: Commercial Off-The-Shelf (COTS) Customer Analytics SaaS (₹4 Cr – ₹6 Cr/yr)**: Replace custom proprietary models with proven commercial customer data platform SaaS; low implementation risk but surrenders proprietary data IP.`,
      keyData: [
        { metric: "Predictive Churn Model Precision", value: "58.2%", period: "Current Trailing", notes: "Down from 84.0% at launch" },
        { metric: "Model Recall Rate", value: "62.4%", period: "FY25 Audit", notes: "Misses 37.6% of actual churners" },
        { metric: "Discount Leakage Cost", value: "₹14.2 Cr", period: "Past 6 Months", notes: "Wasted promotion incentives" },
        { metric: "A/B Test p-value", value: "0.082", period: "Q2 Churn Campaign", notes: "Fails 0.05 statistical threshold" },
        { metric: "Data Pipeline Processing SLA", value: "91.2%", period: "Trailing 12M", notes: "Target is 99.5% pipeline reliability" },
        { metric: "Feature Latency Drift", value: "36 Hours", period: "Current Pipeline", notes: "Stale customer behavioral data" },
        { metric: "Enterprise Analytics Investment", value: "₹25.0 Cr", period: "Cumulative to Date", notes: "Board scrutinized capital spend" },
        { metric: "Target Conversion Lift", value: "+4.5%", period: "Algorithmic Pilot", notes: "Expected incremental sales gain" },
      ],
      decisionPoint: `Which data science architecture and governance mechanism should the CDO implement to restore predictive accuracy and prove statistical ROI?`,
      questions: [
        `Using the confusion matrix in Exhibit 1, calculate the exact financial cost of False Positives (unnecessary discounts) versus False Negatives (lost customers).`,
        `Evaluate why the Q2 A/B test with a p-value of 0.082 failed to achieve academic statistical significance, and recommend sample size adjustments.`,
        `Analyze the operational trade-offs between automated MLOps continuous retraining (Alternative 1) versus Human-in-the-Loop decision gates (Alternative 2).`,
        `How should the organization structure data governance to eliminate data pipeline latency and feature drift?`,
        `Synthesize a 12-month Analytics Value Realization Blueprint detailing verifiable ROI milestones and executive KPIs.`,
      ],
      objectives: [
        `Diagnose predictive model performance degradation using confusion matrices, precision, recall, and ROC-AUC curves.`,
        `Apply statistical hypothesis testing and A/B test methodologies to evaluate business intervention causality (${bloomsLevel}).`,
        `Design actionable enterprise data governance and MLOps architectures balancing automated velocity against human oversight.`,
      ],
      frameworks: [
        { name: "CRISP-DM (Cross-Industry Standard Process for Data Mining)", application: "Auditing Business Understanding, Data Understanding, Preparation, Modeling, Evaluation, and Deployment.", key_takeaway: "The team rushed into Modeling without establishing rigorous Data Understanding and continuous Data Preparation monitoring." },
        { name: "A/B Testing & Null Hypothesis Significance Testing", application: "Evaluating algorithmic treatment lift versus randomized control groups under α = 0.05.", key_takeaway: "A p-value of 0.082 indicates an 8.2% probability that observed lift was random chance, failing statistical governance thresholds." },
        { name: "Confusion Matrix & Cost-Sensitive Classification", application: "Quantifying asymmetric business costs of Type I (False Positive) vs Type II (False Negative) errors.", key_takeaway: "In B2B accounts, Type II errors (losing a corporate client) cost 10x more than Type I errors (unnecessary discount)." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — Predictive Model Confusion Matrix, A/B Test Metrics & Pipeline Latency`,
          type: "table",
          description: "Confusion matrix metrics, precision/recall degradation, and A/B testing statistical test statistics",
          data: [
            { cohort: "Q1 Launch Benchmark", precision: "84.0%", recall: "81.5%", false_positives: "240", false_negatives: "185", p_value: "0.012" },
            { cohort: "Q2 Concept Drift Period", precision: "69.5%", recall: "71.0%", false_positives: "580", false_negatives: "340", p_value: "0.048" },
            { cohort: "Q3 Peak Season Outage", precision: "58.2%", recall: "62.4%", false_positives: "890", false_negatives: "510", p_value: "0.082" },
            { cohort: "Target SLA Standard", precision: "85.0%", recall: "85.0%", false_positives: "<200", false_negatives: "<150", p_value: "<0.010" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & Algorithmic Failure Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "Why did a ₹25 Cr data science program result in ₹14.2 Cr of wasted promotional discounts while high-value customers churned?"`,
          expected_response: "Model Diagnostic Answer: The failure is rooted in concept drift and unmonitored feature pipelines. Changing seasonal consumer behavior invalidated training assumptions, dropping model precision to 58.2%. The high rate of False Positives (890 accounts) triggered massive discount leakage to non-churners.",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & Cost Matrix Optimization",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with calculating the asymmetric cost of Type I vs Type II errors; Squad B with computing required A/B test sample size for 95% confidence; Squad C with comparing MLOps ROI.",
          expected_response: "Quantitative Solutions:\n• Squad A: 890 False Positives cost ₹14.2 Cr in unnecessary discounts, while 510 False Negatives cost ₹24.5 Cr in lost gross margin.\n• Squad B: To achieve p < 0.01 with 80% statistical power on a 4.5% lift, the sample size must be expanded from 12,000 to 28,500 active customer accounts.\n• Squad C: Investing ₹12 Cr in automated MLOps retraining recovers ₹18 Cr annually in prevented churn and eliminated discount leakage.",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Data Governance Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay: CDO defends MLOps investment, Commercial Head demands human-in-the-loop overrides, and CFO demands statistical proof.",
          expected_response: "Executive Defense Key:\n• CDO demonstrates that human spreadsheet intuition cannot scale across 2 million customer transactions.\n• Commercial Head proves that unmonitored automated discounts destroy brand equity.\n• Consensus: Endorse Alternative 2 (Human-in-the-Loop decision support) for corporate accounts while deploying MLOps for mass consumer channels.",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Analytics Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Synthesize the 3-Board plan: Board 1 (Model Breakdown & Error Costs), Board 2 (Statistical Rigor & MLOps), Board 3 (Data Governance Roadmap).",
          expected_response: "3-Board Analytics Plan Takeaways:\n• Board 1: Confusion matrix financial translation, precision degradation curve.\n• Board 2: CRISP-DM lifecycle, A/B testing statistical significance rules, automated feature drift alerts.\n• Board 3: 12-month implementation milestones: Automated drift monitoring, human override thresholds, and monthly RODI auditing.",
        },
      ],
    }),
  },

  // =========================================================================
  // 8. OPERATIONS SPECIALIST AGENT
  // =========================================================================
  operations: {
    id: "operations",
    domain: "Operations",
    agentName: "Operations & Six Sigma Agent",
    title: "Chief Operating Officer & Lean Manufacturing Systems Chair",
    badge: "OPERATIONS AGENT",
    specialization: "Plant Capacity Optimization, Lean 5S, Six Sigma DMAIC, Bottleneck Engineering & OEE",
    icon: "Cog",
    accentColor: "orange",
    tagline: "Calibrated for factory Overall Equipment Effectiveness (OEE), defect PPM, Takt time, and bottleneck elimination.",
    keyFrameworks: [
      "Overall Equipment Effectiveness (OEE = Availability × Performance × Quality)",
      "Six Sigma DMAIC (Define, Measure, Analyze, Improve, Control)",
      "Goldratt's Theory of Constraints (Drum-Buffer-Rope)",
      "Single-Minute Exchange of Die (SMED) & Setup Time Reduction",
      "Total Productive Maintenance (TPM) & Autonomous Maintenance",
      "Value Stream Mapping (VSM) & Waste Elimination (7 Mudas)",
    ],
    keyMetrics: [
      "Overall Equipment Effectiveness (OEE %)",
      "Defect & Scrap Rate (PPM)",
      "Plant Capacity Utilization %",
      "Takt Time vs Actual Cycle Time (seconds)",
      "First Pass Yield (FPY %)",
      "Setup / Changeover Time (minutes)",
      "Unplanned Machine Downtime Hours",
      "Manufacturing Cost per Unit (₹)",
    ],
    decisionMaker: "Chief Operating Officer & VP of Manufacturing Excellence",
    cSuiteStakeholders: [
      "Chief Operating Officer (Advocates plant retooling, TPM maintenance, and bottleneck expansion)",
      "Sales & Marketing Director (Demands short custom production runs and rapid deliveries)",
      "Chief Financial Officer (Refuses factory CapEx expansion while existing capacity is idle)",
    ],
    systemPromptAddendum: `DOMAIN AGENT DIRECTIVE — OPERATIONS MANAGEMENT & MANUFACTURING EXCELLENCE:
- Ground narratives on the factory floor: plant bottlenecks, machine breakdown maintenance, scrap rates, and lean waste.
- Data tables MUST detail OEE components (Availability, Performance, Quality), defect PPM, changeover times, and line utilization.
- Questions must require OEE calculation, Theory of Constraints bottleneck identification, and Six Sigma DMAIC root-cause analysis.
- Frameworks must explicitly include OEE, Six Sigma DMAIC, and Goldratt's Theory of Constraints.`,
    generateDomainContent: ({ company, region, dilemma, isReal, isShort, bloomsLevel }) => ({
      summary: `A publication-grade Operations Management case study examining factory capacity constraints, Overall Equipment Effectiveness (OEE) degradation, and Six Sigma quality defects at ${company} in ${region}. The case examines how the COO must eliminate plant bottlenecks and scrap rates within 72 hours before seasonal contract production.`,
      background: `### 1. The Opening Hook & The Assembly Bottleneck
On a Thursday morning at the flagship manufacturing facility in ${region}, the Chief Operating Officer stood by the central automated assembly line. Over the past four hours, the high-speed packaging station had halted three times due to mechanical sensor jams. In exactly 72 hours, on Monday at 9:00 AM, the board of directors would review factory operational performance. Over the trailing 12 months, the plant's Overall Equipment Effectiveness (OEE) had declined to 62.4%, well below the world-class benchmark of 85%, while defect scrap rates had spiked to 4,800 Parts Per Million (PPM).

### 2. Operational Genesis & Historical Craft Scale
For nearly three decades, ${company}'s manufacturing operations were anchored in reliable craftsmanship:
- **Dedicated Single-Line Production**: High-volume, standardized production runs that maximized machine availability.
- **Skilled Master Operators**: Highly experienced plant machinists who performed manual fine-tuning and sensory maintenance.
- **Predictable Batch Schedules**: Long production cycles allowing operators to achieve consistent throughput without frequent changeovers.

### 3. High Variety Proliferation & Process Breakdowns
However, market demand shifted toward customized, low-volume product variants. Marketing introduced 42 new SKUs, requiring the factory to perform four machine changeovers daily. Setup times averaged 85 minutes per changeover, destroying machine availability. Unplanned maintenance breakdowns surged, and tired operators bypassed standard quality control checks to meet daily quota targets, sending defect rates soaring.`,
      challenge: `### 1. Conflicting Boardroom Perspectives
> *"We cannot continue running 42 custom variants on equipment designed for continuous single-stream mass production,"* argued the Chief Operating Officer. *"Our bottleneck is the packaging and changeover station. We must invest ₹28 Cr in automated quick-changeover tooling (SMED) and Total Productive Maintenance (TPM) to bring OEE back to 82%."*

> *"Customer orders require high product variety; refusing custom orders will hand business to nimble boutique competitors,"* protested the Commercial Sales Director. *"The factory must learn to be flexible without demanding weeks of maintenance downtime."*

> *"The plant is nominally running at 94% capacity utilization while output has dropped by 18%,"* observed the Chief Financial Officer. *"You are burning overtime pay and generating ₹16 Cr in scrap. I will not approve factory CapEx until the operations team eliminates internal operational waste (Muda) and proves Six Sigma quality control."*

### 2. The Strategic Crossroads: Three Operations Interventions
- **Alternative 1: Automated SMED Quick-Changeover & Line Retooling (₹24 Cr – ₹32 Cr)**: Retrofit assembly lines with automated tooling and robotic packaging; reduces changeover from 85 mins to 8 mins; high CapEx.
- **Alternative 2: Six Sigma DMAIC & Cellular Manufacturing Restructuring (₹12 Cr – ₹16 Cr)**: Reorganize factory into dedicated cellular manufacturing pods for high-variety SKUs while keeping main line for mass production; minimizes CapEx but requires factory floor re-layout.
- **Alternative 3: Outsourcing Custom SKUs & TPM Consolidation (₹6 Cr – ₹10 Cr)**: Outsource complex short-run variants to specialized contract manufacturers; focus internal plant exclusively on high-speed core lines; contains CapEx but surrenders unit manufacturing margin.`,
      keyData: [
        { metric: "Overall Equipment Effectiveness (OEE)", value: "62.4%", period: "Trailing 12M", notes: "World-class benchmark is 85.0%" },
        { metric: "Availability Rate", value: "72.5%", period: "Current Trailing", notes: "Severe changeover downtime" },
        { metric: "Performance Efficiency", value: "88.2%", period: "FY25", notes: "Speed reduction during runs" },
        { metric: "Quality First-Pass Yield", value: "97.4%", period: "FY25", notes: "Equivalent to 4,800 PPM scrap" },
        { metric: "Average Changeover Time", value: "85 Minutes", period: "Daily Operations", notes: "4 changeovers per day" },
        { metric: "Scrap & Rework Cost", value: "₹16.4 Cr", period: "Past 12 Months", notes: "Material and labor waste" },
        { metric: "Nominal Plant Capacity Utilization", value: "94.2%", period: "Current Operating", notes: "Bottleneck creates artificial lockup" },
        { metric: "Takt Time Demand", value: "42 Seconds", period: "Customer Demand", notes: "Actual cycle time is 56 seconds" },
      ],
      decisionPoint: `Which manufacturing engineering and process improvement strategy should the COO execute to lift OEE to 82%+ and eliminate factory bottlenecks?`,
      questions: [
        `Using the OEE formula (Availability × Performance × Quality), deconstruct the data in Exhibit 1 to identify which component is the primary driver of operational loss.`,
        `Apply Goldratt's Theory of Constraints to determine the plant bottleneck and design a Drum-Buffer-Rope mechanism to synchronize production.`,
        `Evaluate how applying Single-Minute Exchange of Die (SMED) could reduce changeover time from 85 minutes to under 10 minutes.`,
        `Analyze the operational trade-offs between internal cellular manufacturing restructuring (Alternative 2) versus outsourcing short-run SKUs (Alternative 3).`,
        `Formulate a Six Sigma DMAIC Project Charter to reduce defect scrap rates from 4,800 PPM to under 500 PPM within 180 days.`,
      ],
      objectives: [
        `Deconstruct factory productivity using the Overall Equipment Effectiveness (OEE) metrics framework.`,
        `Identify manufacturing bottlenecks and balance line capacity using Goldratt's Theory of Constraints (${bloomsLevel}).`,
        `Design actionable Lean 5S, SMED, and Six Sigma quality improvement roadmaps in discrete manufacturing environments.`,
      ],
      frameworks: [
        { name: "Overall Equipment Effectiveness (OEE)", application: "Multiplying Availability (72.5%) × Performance (88.2%) × Quality (97.4%) = 62.4%.", key_takeaway: "Availability loss from 85-minute changeovers represents 65% of all factory productive capacity loss." },
        { name: "Goldratt's Theory of Constraints (TOC)", application: "Identifying the packaging bottleneck that dictates the throughput of the entire plant.", key_takeaway: "An hour lost on the bottleneck packaging station is an hour lost for the entire factory; non-bottlenecks must not overproduce." },
        { name: "Single-Minute Exchange of Die (SMED)", application: "Converting internal setup operations (done while machine is stopped) into external operations (done while running).", key_takeaway: "Pre-staging tooling and standardizing fasteners reduces changeover duration by 80%, recovering 4 hours of daily production." },
      ],
      exhibits: [
        {
          id: "exhibit-1",
          title: `Exhibit 1: ${company} — Plant OEE Decomposition, Downtime Log & Scrap Pareto Analysis`,
          type: "table",
          description: "OEE component breakdown, machine downtime causes, and scrap defect distribution across assembly lines",
          data: [
            { station: "Raw Material Ingestion & Milling", availability: "88.5%", performance: "92.0%", quality: "99.1%", oee: "80.7%", scrap_cost: "₹1.8 Cr" },
            { station: "Precision CNC Machining & Fabrication", availability: "82.0%", performance: "89.5%", quality: "98.2%", oee: "72.1%", scrap_cost: "₹3.4 Cr" },
            { station: "Automated Packaging & Labelling (Bottleneck)", availability: "58.2%", performance: "84.0%", quality: "95.5%", oee: "46.7%", scrap_cost: "₹8.6 Cr" },
            { station: "Quality Inspection & Final Dispatch", availability: "92.0%", performance: "94.0%", quality: "99.4%", oee: "85.9%", scrap_cost: "₹2.6 Cr" },
            { station: "Total Factory Operational Composite", availability: "72.5%", performance: "88.2%", quality: "97.4%", oee: "62.4%", scrap_cost: "₹16.4 Cr" },
          ],
        },
      ],
      classFlow: [
        {
          phase: "Phase 1: Opening Cold Call & OEE Loss Diagnosis",
          duration_minutes: isShort ? 10 : 15,
          activity: `Direct cold call: "Why is a factory operating at 94.2% nominal capacity utilization delivering an OEE of only 62.4% with ₹16.4 Cr in scrap?"`,
          expected_response: "Model Diagnostic Answer: Students should apply the OEE formula to diagnose that nominal capacity measures running time, not effective output. The packaging bottleneck has an OEE of only 46.7% due to frequent 85-minute changeovers, creating a systemic bottleneck that starves upstream machining lines while generating 4,800 PPM scrap.",
        },
        {
          phase: "Phase 2: Quantitative Exhibit Recalculation & Bottleneck Throughput Modeling",
          duration_minutes: isShort ? 15 : 30,
          activity: "Task Squad A with calculating recovered production hours if SMED reduces changeover from 85 to 10 mins; Squad B with modeling scrap reduction cost savings to 500 PPM; Squad C with computing outsourcing TCO under Alternative 3.",
          expected_response: "Quantitative Solutions:\n• Squad A: Reducing 4 daily changeovers from 85 mins to 10 mins recovers 300 minutes (5 hours) of daily bottleneck production, lifting factory OEE from 62.4% to 78.5% and generating ₹22 Cr in output.\n• Squad B: Reducing scrap from 4,800 PPM to 500 PPM saves ₹13.2 Cr annually in wasted materials and rework labor.\n• Squad C: Outsourcing custom SKUs eliminates ₹14 Cr in internal CapEx, freeing the packaging line to run continuous mass production runs.",
        },
        {
          phase: "Phase 3: The Boardroom Roleplay & Manufacturing Strategy Debate",
          duration_minutes: isShort ? 15 : 30,
          activity: "Stage an executive committee roleplay: COO defends SMED and bottleneck retooling, Sales Director demands high product variety, and CFO refuses CapEx until scrap is eliminated.",
          expected_response: "Executive Defense Key:\n• COO proves the packaging station is throttling entire factory revenue.\n• Sales Director proves customers will leave if short-run variety is discontinued.\n• Consensus: Endorse Alternative 2 (Cellular manufacturing for custom lines) while implementing SMED on the primary high-volume line.",
        },
        {
          phase: "Phase 4: Plenary Synthesis & 3-Board Operations Blackboard Plan",
          duration_minutes: isShort ? 5 : 15,
          activity: "Synthesize the 3-Board plan: Board 1 (OEE Pathology & Bottleneck), Board 2 (TOC & SMED Methodology), Board 3 (DMAIC Six Sigma Charter).",
          expected_response: "3-Board Operations Plan Takeaways:\n• Board 1: OEE breakdown (Availability vs Performance vs Quality), scrap Pareto analysis.\n• Board 2: Drum-Buffer-Rope bottleneck scheduling and SMED internal vs external setup checklist.\n• Board 3: 180-day DMAIC milestones: Standardized work procedures, TPM autonomous maintenance, and defect containment gates.",
        },
      ],
    }),
  },
};

/**
 * Normalizes input domain string to canonical DomainAgentId
 */
export function normalizeDomainToAgentId(domainStr?: string): DomainAgentId {
  if (!domainStr) return "strategy";
  const normalized = domainStr.toLowerCase().trim().replace(/\s+/g, "-");
  if (normalized === "finance") return "finance";
  if (normalized === "marketing") return "marketing";
  if (normalized === "hr" || normalized === "human-resources") return "hr";
  if (normalized === "it" || normalized === "information-technology") return "it";
  if (normalized === "supply-chain" || normalized === "supplychain" || normalized === "logistics") return "supply-chain";
  if (normalized === "strategy") return "strategy";
  if (normalized === "analytics" || normalized === "business-analytics" || normalized === "data") return "analytics";
  if (normalized === "operations" || normalized === "production") return "operations";
  return "strategy";
}

/**
 * Retrieves the specialized DomainAgentConfig for any domain name or ID
 */
export function getDomainAgent(domainNameOrId?: string): DomainAgentConfig {
  const agentId = normalizeDomainToAgentId(domainNameOrId);
  return DOMAIN_AGENTS[agentId] || DOMAIN_AGENTS.strategy;
}

/**
 * Returns all 8 specialized domain agents
 */
export function getAllDomainAgents(): DomainAgentConfig[] {
  return Object.values(DOMAIN_AGENTS);
}

/**
 * Enhances the base institutional system prompt with the specialized domain agent persona and guidelines
 */
export function enhancePromptWithDomainAgent(basePrompt: string, domainName?: CaseDomain): string {
  const agent = getDomainAgent(domainName);
  return `${basePrompt}

================================================================================
ACTIVE DOMAIN AGENT: ${agent.agentName.toUpperCase()} (${agent.title})
================================================================================
${agent.systemPromptAddendum}

CORE DOMAIN FRAMEWORKS TO WEAVE INTO NARRATIVE & TEACHING NOTES:
${agent.keyFrameworks.map((f, i) => `${i + 1}. ${f}`).join("\n")}

CRITICAL DOMAIN OPERATIONAL METRICS TO INCLUDE IN EXHIBIT TABLES:
${agent.keyMetrics.map((m, i) => `- ${m}`).join("\n")}

EXECUTIVE STAKEHOLDERS & CONFLICTING PERSPECTIVES:
${agent.cSuiteStakeholders.map((s) => `• ${s}`).join("\n")}
================================================================================`;
}
