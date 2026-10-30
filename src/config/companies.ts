export interface CaseCompanyPreset {
  id: string;
  name: string;
  category: string;
  badge?: string;
  industry: string;
  functionalFocus: string;
  domain: "Strategy" | "Finance" | "Marketing" | "Operations" | "HR" | "Analytics";
  location: string;
  dilemma: string;
  decisionMaker: string;
  protagonists: string;
  learningObjectives?: string[];
}

export const TOP_CASE_COMPANIES: CaseCompanyPreset[] = [
  // 1. QUICK COMMERCE & E-COMMERCE
  {
    id: "zomato-blinkit",
    name: "Zomato & Blinkit",
    category: "Quick Commerce & Tech Platforms",
    badge: "Trending Case",
    industry: "E-Commerce & Quick Commerce",
    functionalFocus: "Operations & Supply Chain Resilience",
    domain: "Operations",
    location: "Gurugram & Top 25 Indian Metros",
    dilemma: "Whether to allocate ₹2,000 Cr expanding 10-minute quick-commerce dark stores to tier-2 cities or protect food delivery operating EBITDA margins.",
    decisionMaker: "Deepinder Goyal, Founder & Group CEO",
    protagonists: "Albinder Dhindsa (CEO Blinkit), Akshant Goyal (CFO), Head of Dark Store Logistics",
    learningObjectives: [
      "Evaluate dark store throughput density and micro-fulfillment unit economics.",
      "Analyze cross-subsidization between mature food delivery and high-growth quick commerce.",
      "Diagnose platform take-rate leverage against FMCG brand advertising revenues."
    ]
  },
  {
    id: "zepto",
    name: "Zepto (KiranaKart)",
    category: "Quick Commerce & Tech Platforms",
    badge: "Hyper-Growth",
    industry: "E-Commerce & Quick Commerce",
    functionalFocus: "Strategic Finance & Capital Allocation",
    domain: "Strategy",
    location: "Mumbai, Bengaluru & Metro Markets",
    dilemma: "Balancing high cash burn from aggressive customer acquisition with the operational necessity of reaching EBITDA break-even ahead of an IPO.",
    decisionMaker: "Aadit Palicha, Co-Founder & CEO",
    protagonists: "Kaivalya Vohra (Co-Founder & CTO), Chief Financial Officer, VP of Supply Chain",
    learningObjectives: [
      "Model customer cohort retention curves under predatory discounting.",
      "Assess capital expenditure payback periods across high-density urban dark stores.",
      "Evaluate private-label product mix impact on gross profit expansion."
    ]
  },
  {
    id: "nykaa",
    name: "Nykaa (FSN E-Commerce)",
    category: "Quick Commerce & Tech Platforms",
    badge: "Omnichannel",
    industry: "E-Commerce & Quick Commerce",
    functionalFocus: "Disruptive Marketing & Brand Positioning",
    domain: "Marketing",
    location: "Mumbai & Pan-India",
    dilemma: "Whether to accelerate physical retail store footprint in tier-2 cities or defend digital e-commerce customer acquisition costs against Reliance Tira and Tata CliQ Palette.",
    decisionMaker: "Falguni Nayar, Executive Chairperson & CEO",
    protagonists: "Anchit Nayar (CEO E-Commerce), Adwaita Nayar (CEO Fashion), Chief Financial Officer",
    learningObjectives: [
      "Deconstruct omnichannel customer lifetime value (LTV) versus pure-play online retail.",
      "Analyze luxury brand exclusivity agreements and margin defense.",
      "Formulate defensive marketing strategies against deep-pocketed conglomerate rivals."
    ]
  },

  // 2. AUTOMOTIVE & ELECTRIC MOBILITY
  {
    id: "tata-motors-ev",
    name: "Tata Motors Passenger Vehicles & EV",
    category: "Automotive & Clean Energy",
    badge: "EV Leadership",
    industry: "Automotive & Electric Vehicles",
    functionalFocus: "Strategic Finance & Capital Allocation",
    domain: "Strategy",
    location: "Sanand (Gujarat) & Pune, India",
    dilemma: "Whether to invest ₹2,500 Cr into in-house battery cell gigafactories or partner with foreign global cell manufacturers amidst declining EV government subsidies.",
    decisionMaker: "Shailesh Chandra, Managing Director",
    protagonists: "P. B. Balaji (Group CFO), Head of EV Supply Chain, VP Battery R&D",
    learningObjectives: [
      "Assess vertical integration economics in battery manufacturing versus supplier reliance.",
      "Evaluate strategic asset utilization of acquired manufacturing plants (e.g. Sanand Ford plant).",
      "Formulate pricing strategies under changing government FAME/EMPS subsidy structures."
    ]
  },
  {
    id: "maruti-suzuki",
    name: "Maruti Suzuki India",
    category: "Automotive & Clean Energy",
    badge: "Strategic Transition",
    industry: "Automotive & Electric Vehicles",
    functionalFocus: "Enterprise Leadership & Governance",
    domain: "Strategy",
    location: "Hansalpur (Gujarat) & Gurugram, India",
    dilemma: "Championing strong-hybrid powertrains to defend 40%+ market share versus ceding early pure-electric lead to domestic competitors.",
    decisionMaker: "Hisashi Takeuchi, Managing Director & CEO",
    protagonists: "Shashank Srivastava (Senior Executive Officer), Chief Technical Officer, Head of Dealer Relations",
    learningObjectives: [
      "Analyze consumer total cost of ownership (TCO) across ICE, Hybrid, and EV alternatives.",
      "Evaluate policy lobbying trade-offs regarding GST concessions on hybrid vehicles.",
      "Synthesize dealer network modernization strategies for premium Nexa channels."
    ]
  },
  {
    id: "ola-electric",
    name: "Ola Electric Mobility",
    category: "Automotive & Clean Energy",
    badge: "Disruption Crisis",
    industry: "Automotive & Electric Vehicles",
    functionalFocus: "Operations & Supply Chain Resilience",
    domain: "Operations",
    location: "FutureFactory (Tamil Nadu) & Bengaluru",
    dilemma: "Resolving acute after-sales service bottlenecks and regulatory scrutiny while ramping up 4680 cell manufacturing at the Gigafactory.",
    decisionMaker: "Bhavish Aggarwal, Founder & Chairman",
    protagonists: "Chief Operating Officer, Head of Service Operations, Director of Regulatory Affairs",
    learningObjectives: [
      "Diagnose brand equity erosion resulting from rapid capacity expansion without service infrastructure.",
      "Evaluate vertical integration risks when proprietary tech faces reliability defects.",
      "Formulate crisis turnaround communications and service SLAs."
    ]
  },

  // 3. FMCG, RETAIL & REGIONAL CHAMPIONS (GUJARAT / INDIA)
  {
    id: "amul-gcmmf",
    name: "Amul (GCMMF)",
    category: "FMCG, Food & Agriculture",
    badge: "Cooperative Gold Standard",
    industry: "Agri-Tech & Supply Chains",
    functionalFocus: "Operations & Supply Chain Resilience",
    domain: "Operations",
    location: "Anand & Gujarat, India / Global Markets",
    dilemma: "Balancing cooperative farmer milk procurement prices against rising competition from private D2C dairy brands and foreign multinational food conglomerates.",
    decisionMaker: "Jayen Mehta, Managing Director, GCMMF",
    protagonists: "Chief Financial Officer, Head of Cold Chain Logistics, District Milk Union Chairpersons",
    learningObjectives: [
      "Master cooperative supply chain governance and farmer surplus distribution models.",
      "Analyze cold-chain logistics moats and margin decomposition in dairy processing.",
      "Evaluate international product rollout strategies (e.g. Amul fresh milk in the US market)."
    ]
  },
  {
    id: "reliance-retail",
    name: "Reliance Retail Ventures Ltd",
    category: "FMCG, Food & Agriculture",
    badge: "Retail Hegemony",
    industry: "E-Commerce & Quick Commerce",
    functionalFocus: "Enterprise Leadership & Governance",
    domain: "Strategy",
    location: "Mumbai & Pan-India (18,000+ Stores)",
    dilemma: "Integrating 18,000+ physical brick-and-mortar stores with the JioMart digital ecosystem while defending market share against rapid quick-commerce encroachment.",
    decisionMaker: "Isha Ambani, Executive Director, Reliance Retail",
    protagonists: "V. Subramaniam (Managing Director), Head of Grocery Supply Chain, VP Consumer Brands",
    learningObjectives: [
      "Evaluate omnichannel synergy: physical store click-and-collect vs automated dark stores.",
      "Analyze private-label FMCG portfolio acquisition strategy (e.g. Campa Cola, Lotus Chocolates).",
      "Formulate B2B Kirana merchant merchant integration strategies."
    ]
  },
  {
    id: "hul",
    name: "Hindustan Unilever Limited (HUL)",
    category: "FMCG, Food & Agriculture",
    badge: "FMCG Classic",
    industry: "E-Commerce & Quick Commerce",
    functionalFocus: "Disruptive Marketing & Brand Positioning",
    domain: "Marketing",
    location: "Mumbai & Deep Rural Bharat",
    dilemma: "Navigating rural volume growth deceleration and defending market share against regional micro-brands in soaps, detergents, and packaged tea.",
    decisionMaker: "Rohit Jawa, CEO & Managing Director",
    protagonists: "Ritesh Tiwari (Executive Director, Finance & CFO), Executive Director (Customer Development)",
    learningObjectives: [
      "Deconstruct rural vs urban FMCG demand elasticity and pricing power.",
      "Analyze 'Project Shakti' micro-entrepreneur distribution network moats.",
      "Formulate premiumization strategies to combat low-cost regional competitors."
    ]
  },
  {
    id: "surat-lab-grown-diamonds",
    name: "Surat Lab-Grown Diamond Consortium",
    category: "Luxury, Gems & Regional Gujarat",
    badge: "Gujarat Industrial Crisis",
    industry: "Textiles & Manufacturing",
    functionalFocus: "Strategic Finance & Capital Allocation",
    domain: "Strategy",
    location: "Surat, Gujarat & International Gem Markets",
    dilemma: "Managing a 70% price collapse in polished CVD lab-grown diamonds, retaliatory export tariffs, and transitioning from loose commodity wholesale to branded retail jewelry.",
    decisionMaker: "Consortium President & Managing Director",
    protagonists: "Head of CVD Reactor Operations, Chief Export Officer, US Market Distributor Representative",
    learningObjectives: [
      "Diagnose commodity price collapse resulting from rapid reactor capacity overbuilding.",
      "Analyze value migration from diamond cutting & polishing to consumer jewelry brand equity.",
      "Formulate export hedging and downstream retail brand positioning."
    ]
  },
  {
    id: "titan-tanishq",
    name: "Titan Company (Tanishq)",
    category: "Luxury, Gems & Regional Gujarat",
    badge: "Brand Trust Moat",
    industry: "Textiles & Manufacturing",
    functionalFocus: "Disruptive Marketing & Brand Positioning",
    domain: "Marketing",
    location: "Bengaluru & Pan-India",
    dilemma: "Managing consumer sensitivity to record gold price highs, gold import duty revisions, and expanding fine jewelry stores in tier-3 cities without brand dilution.",
    decisionMaker: "C. K. Venkataraman, Managing Director",
    protagonists: "Ajoy Chawla (CEO Jewellery Division), Ashok Sonthalia (CFO), Head of Retail Operations",
    learningObjectives: [
      "Analyze trust as a sustainable competitive advantage in high-ticket unorganized markets.",
      "Evaluate commodity price hedging mechanisms and working capital inventory turns.",
      "Formulate international diaspora expansion plans (Middle East, North America)."
    ]
  },

  // 4. FINTECH, BANKING & FINANCIAL SERVICES
  {
    id: "hdfc-bank",
    name: "HDFC Bank",
    category: "Fintech, Banking & Finance",
    badge: "Mega-Merger Integration",
    industry: "Fintech & Banking",
    functionalFocus: "Strategic Finance & Capital Allocation",
    domain: "Finance",
    location: "Mumbai & Pan-India",
    dilemma: "Managing liquidity and deposit growth to fund the massive mortgage book inherited from the HDFC Ltd mega-merger without compressing Net Interest Margins (NIM).",
    decisionMaker: "Sashidhar Jagdishan, Managing Director & CEO",
    protagonists: "Srinivasan Vaidyanathan (CFO), Group Head Retail Branch Banking, Chief Risk Officer",
    learningObjectives: [
      "Assess post-merger integration challenges in banking balance sheet harmonization.",
      "Evaluate aggressive branch expansion capital expenditure versus digital acquisition.",
      "Analyze Loan-to-Deposit Ratio (LDR) constraints and regulatory compliance."
    ]
  },
  {
    id: "paytm-one97",
    name: "Paytm (One97 Communications)",
    category: "Fintech, Banking & Finance",
    badge: "Regulatory Reckoning",
    industry: "Fintech & Banking",
    functionalFocus: "Strategic Finance & Capital Allocation",
    domain: "Finance",
    location: "Noida & Pan-India",
    dilemma: "Rebuilding merchant and consumer trust after RBI regulatory sanctions on Paytm Payments Bank, and pivoting core revenue toward loan distribution and soundbox subscriptions.",
    decisionMaker: "Vijay Shekhar Sharma, Founder & CEO",
    protagonists: "Madhur Deora (President & Group CFO), Chief Risk Officer, Head of Merchant Lending",
    learningObjectives: [
      "Diagnose regulatory compliance failures in fintech platform architecture.",
      "Evaluate hardware subscription unit economics (Soundbox device fees vs transaction MDR).",
      "Formulate corporate turnaround strategy under active regulatory scrutiny."
    ]
  },
  {
    id: "zerodha",
    name: "Zerodha Broking Limited",
    category: "Fintech, Banking & Finance",
    badge: "Bootstrapped Pioneer",
    industry: "Fintech & Banking",
    functionalFocus: "Strategic Finance & Capital Allocation",
    domain: "Finance",
    location: "Bengaluru, India",
    dilemma: "Defending profitability and market share as SEBI tightens index options derivative trading rules, while maintaining a 100% bootstrapped zero-external-capital discipline.",
    decisionMaker: "Nithin Kamath, Founder & CEO",
    protagonists: "Nikhil Kamath (Co-Founder), Kailash Nadh (CTO), Venu Madhav (COO)",
    learningObjectives: [
      "Analyze the discount broking unit economics and revenue dependency on high-frequency F&O trading.",
      "Evaluate the strategic trade-offs of remaining 100% bootstrapped versus taking external venture funding.",
      "Formulate product diversification into asset management (Zerodha Fund House) and wealth advisory."
    ]
  },

  // 5. ENTERPRISE TECH, SAAS & IT SERVICES
  {
    id: "zoho-corporation",
    name: "Zoho Corporation",
    category: "Enterprise Tech, SaaS & IT",
    badge: "Bootstrapped SaaS",
    industry: "EdTech & Enterprise SaaS",
    functionalFocus: "Enterprise Leadership & Governance",
    domain: "HR",
    location: "Tenkasi & Chennai, Tamil Nadu / Global Markets",
    dilemma: "Scaling enterprise SaaS sales against Microsoft and Salesforce while strictly adhering to rural office decentralization and refusing venture capital or public listing.",
    decisionMaker: "Sridhar Vembu, Co-Founder & CEO",
    protagonists: "Shailesh Davey (Co-Founder & VP Engineering), Chief Financial Officer, Head of Global Marketing",
    learningObjectives: [
      "Evaluate rural talent development and retention as a strategic competitive advantage.",
      "Analyze suite bundling pricing strategies versus point-solution SaaS pricing.",
      "Assess long-term R&D reinvestment in core computing infrastructure (data centers, chip design)."
    ]
  },
  {
    id: "tcs",
    name: "Tata Consultancy Services (TCS)",
    category: "Enterprise Tech, SaaS & IT",
    badge: "IT Services Titan",
    industry: "EdTech & Enterprise SaaS",
    functionalFocus: "AI Integration & Product Strategy",
    domain: "HR",
    location: "Mumbai & Global Enterprise Client Sites",
    dilemma: "Transitioning 600,000+ employees into generative AI engineering while client enterprises demand productivity-linked fee discounts on traditional fixed-price contracts.",
    decisionMaker: "K. Krithivasan, CEO & Managing Director",
    protagonists: "Samir Seksaria (CFO), Chief Operating Officer, Chief Technology Officer, Head of Global HR",
    learningObjectives: [
      "Analyze the deflationary revenue threat of generative AI on billable headcount-based IT billing.",
      "Model massive enterprise retraining programs across half a million technical professionals.",
      "Formulate outcome-based pricing models for complex enterprise transformation contracts."
    ]
  },

  // 6. INFRASTRUCTURE, ENERGY & LOGISTICS
  {
    id: "adani-ports",
    name: "Adani Ports and Special Economic Zone (APSEZ)",
    category: "Infrastructure & Logistics",
    badge: "Infrastructure Scale",
    industry: "Infrastructure & Maritime Ports",
    functionalFocus: "Strategic Finance & Capital Allocation",
    domain: "Finance",
    location: "Mundra, Gujarat & Pan-India Ports",
    dilemma: "Accelerating international port acquisitions (Haifa, Colombo) while maintaining strict credit rating debt service coverage ratios and expanding green logistics corridors.",
    decisionMaker: "Karan Adani, Managing Director, APSEZ",
    protagonists: "D. Muthukumaran (CFO), Chief Commercial Officer, Head of Container Terminal Operations",
    learningObjectives: [
      "Evaluate private port concession economics, land monetization, and SEZ industrial clustering.",
      "Analyze debt refinancing strategies and international credit rating agency interactions.",
      "Formulate end-to-end multimodal logistics integration strategies."
    ]
  },
  {
    id: "delhivery",
    name: "Delhivery",
    category: "Infrastructure & Logistics",
    badge: "Logistics Optimization",
    industry: "E-Commerce & Quick Commerce",
    functionalFocus: "Operations & Supply Chain Resilience",
    domain: "Operations",
    location: "Gurugram, Tauru Hub (Haryana) & Pan-India",
    dilemma: "Achieving sustained quarterly net profitability while expanding heavy B2B partial-truckload (PTL) freight against legacy transport giants and quick-commerce in-sourcing.",
    decisionMaker: "Sahil Barua, Managing Director & CEO",
    protagonists: "Amit Agarwal (CFO), Sandeep Barasia (Chief Business Officer), Head of Automated Sortation",
    learningObjectives: [
      "Master network density economics, automated gateway sortation, and tractor-trailer line-haul optimization.",
      "Analyze customer concentration risk when major e-commerce platforms build captive delivery fleets.",
      "Formulate pricing strategy in commoditized B2B express surface cargo."
    ]
  }
];
