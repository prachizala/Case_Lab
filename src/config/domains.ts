/**
 * SBS CaseLab — Business Domains & Curricular Topics
 * SINGLE SOURCE OF TRUTH for all domain configurations across the platform.
 *
 * NOTE: The topic lists below are PLACEHOLDERS that will be replaced with
 * the official Shanti Business School syllabus specifications.
 */

export interface DomainUnit {
  unit: number;
  title: string;
  topics: string[];
}

export interface DomainConfig {
  id: string;
  name: DomainName;
  shortDescription: string;
  icon: string; // Lucide icon identifier
  units: DomainUnit[];
}

export const DOMAIN_NAMES = [
  "Finance",
  "Marketing",
  "HR",
  "IT",
  "Supply Chain",
  "Strategy",
  "Analytics",
  "Operations",
] as const;

export type DomainName = (typeof DOMAIN_NAMES)[number];

// Exact 8 Business Domains specification
export const DOMAINS: readonly DomainConfig[] = [
  {
    id: "finance",
    name: "Finance",
    shortDescription: "Capital allocation, working capital, valuation, banking & corporate finance",
    icon: "Landmark",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Corporate Finance & Capital Structure",
        topics: [
          "financial management",
          "capital budgeting",
          "working capital",
          "cost of capital",
          "leverage",
          "dividend decisions",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: Financial Services, Markets & Risk",
        topics: [
          "financial services (factoring, forfaiting, leasing, hire purchase, credit rating)",
          "banking and insurance",
          "mutual funds",
          "risk management",
        ],
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing",
    shortDescription: "Consumer behavior, brand positioning, pricing, channels & digital growth",
    icon: "TrendingUp",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Market Analysis & Customer Strategy",
        topics: [
          "marketing environment",
          "consumer behavior",
          "STP and positioning",
          "product and branding",
          "pricing",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: Channels, Promotion & Product Development",
        topics: [
          "distribution channels",
          "promotion and IMC",
          "digital marketing",
          "new product development",
          "services marketing",
        ],
      },
    ],
  },
  {
    id: "hr",
    name: "HR",
    shortDescription: "Talent acquisition, appraisals, compensation, employee relations & culture",
    icon: "Users",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Talent Planning, Acquisition & Performance",
        topics: [
          "HR planning",
          "recruitment and selection",
          "training and development",
          "performance appraisal",
          "talent management",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: Rewards, Relations & Inclusive Workplace",
        topics: [
          "compensation and benefits",
          "employee retention and engagement",
          "industrial relations",
          "diversity and inclusion",
          "HR analytics",
        ],
      },
    ],
  },
  {
    id: "it",
    name: "IT",
    shortDescription: "Digital transformation, enterprise software, cloud, cybersecurity & governance",
    icon: "Cpu",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Enterprise Architecture & Cloud Infrastructure",
        topics: [
          "digital transformation",
          "enterprise systems (ERP, CRM)",
          "cloud adoption",
          "cybersecurity and data privacy",
          "IT governance",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: SDLC, Emerging Technologies & Platforms",
        topics: [
          "IT project management",
          "software development lifecycle",
          "AI adoption",
          "e-commerce platforms",
          "IT outsourcing",
        ],
      },
    ],
  },
  {
    id: "supply-chain",
    name: "Supply Chain",
    shortDescription: "Procurement, logistics, inventory resilience, warehousing & distribution",
    icon: "Truck",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Sourcing, Warehousing & Inventory Planning",
        topics: [
          "procurement and sourcing",
          "logistics and transportation",
          "warehousing and inventory",
          "distribution networks",
          "demand forecasting",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: Supply Network Risk & Last-Mile Delivery",
        topics: [
          "supply chain risk",
          "supplier relationships",
          "reverse logistics",
          "last-mile delivery",
          "supply chain digitization",
        ],
      },
    ],
  },
  {
    id: "strategy",
    name: "Strategy",
    shortDescription: "Competitive advantage, M&A, diversification, alliances & sustainable scale",
    icon: "Target",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Strategic Foundations & Growth Engines",
        topics: [
          "competitive advantage",
          "corporate and business strategy",
          "diversification",
          "growth strategy",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: Inorganic Expansion, Alliances & Turnarounds",
        topics: [
          "mergers and acquisitions",
          "market entry",
          "strategic alliances",
          "innovation strategy",
          "turnaround",
          "sustainability strategy",
        ],
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics",
    shortDescription: "Data-driven decisions, BI dashboards, predictive forecasting & AI in business",
    icon: "BarChart3",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Business Intelligence & Decision Support",
        topics: [
          "data-driven decision making",
          "business intelligence and dashboards",
          "forecasting",
          "data quality and governance",
          "A/B testing",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: Functional Analytics & Enterprise AI",
        topics: [
          "customer analytics",
          "marketing analytics",
          "HR analytics",
          "financial analytics",
          "AI and machine learning in business",
        ],
      },
    ],
  },
  {
    id: "operations",
    name: "Operations",
    shortDescription: "Production planning, Six Sigma, lean systems, capacity & process engineering",
    icon: "Cog",
    // PLACEHOLDER TOPICS — to be replaced with official syllabus
    units: [
      {
        unit: 1,
        title: "Unit 1: Production Systems & Quality Excellence",
        topics: [
          "production planning",
          "quality management and Six Sigma",
          "lean operations",
          "capacity planning",
          "plant layout and location",
        ],
      },
      {
        unit: 2,
        title: "Unit 2: Process Improvement & Operational Execution",
        topics: [
          "maintenance management",
          "service operations",
          "process improvement",
          "project and scheduling",
          "productivity",
        ],
      },
    ],
  },
];

/**
 * Returns a domain by exact name (case-sensitive or insensitive).
 */
export function getDomainByName(name: string): DomainConfig | undefined {
  const normalized = name.trim().toLowerCase();
  return DOMAINS.find(
    (d) => d.name.toLowerCase() === normalized || d.id.toLowerCase() === normalized
  );
}

/**
 * Returns all topics for a given domain flattened across all units.
 */
export function getTopicsForDomain(domainName: DomainName | string): string[] {
  const d = getDomainByName(domainName);
  if (!d) return [];
  return d.units.flatMap((u) => u.topics);
}

/**
 * Validates whether a given string is one of the 8 canonical domain names.
 */
export function isValidDomain(name: string): name is DomainName {
  return DOMAIN_NAMES.includes(name as DomainName);
}
