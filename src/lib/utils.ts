/**
 * Utility functions for SBS CaseLab
 */

/**
 * Generates clean 2-letter (or 1-letter) avatar initials from a full name,
 * intelligently ignoring honorifics and titles such as:
 * - Ms. / Ms, Mr. / Mr, Mrs. / Mrs, Miss
 * - Dr. / Dr, Prof. / Prof, Professor
 * - Shri, Shree, Smt. / Smt
 * - Er. / Er, CA, Adv. / Adv, Hon. / Hon
 *
 * Examples:
 * - "Ms. Reena Paswan" -> "RP"
 * - "Neha Sharma" -> "NS"
 * - "Zala Prachi" / "zala parchi" -> "ZP"
 * - "Dr. Vikram Mehta" -> "VM"
 * - "Prof. Anita Desai" -> "AD"
 * - "Prachi" -> "P"
 */
export function getUserInitials(name?: string | null): string {
  if (!name || typeof name !== "string") return "U";

  // Normalize: handle cases like 'Ms.Reena' -> 'Ms. Reena'
  const normalized = name.replace(/\.(?=[a-zA-Z])/g, ". ").trim();
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";

  // Match honorifics/prefixes with optional trailing punctuation
  const titleRegex = /^(mr|ms|mrs|miss|dr|prof|professor|shri|shree|smt|er|ca|adv|hon)\.?$/i;
  const filtered = parts.filter((p) => !titleRegex.test(p.trim()));
  const activeParts = filtered.length > 0 ? filtered : parts;

  if (activeParts.length === 1) {
    return activeParts[0].slice(0, 1).toUpperCase();
  }

  const first = activeParts[0][0] || "";
  const last = activeParts[activeParts.length - 1][0] || "";
  return (first + last).toUpperCase();
}

/**
 * Retrieves the expected faculty model response/solution for a classroom flow phase.
 * If expected_response is provided on the phase, returns it directly.
 * Otherwise, generates a structured pedagogical model solution based on the phase and activity.
 */
export function getFlowExpectedResponse(flow: {
  phase: string;
  activity: string;
  expected_response?: string;
}): string {
  if (flow.expected_response && flow.expected_response.trim()) {
    return flow.expected_response;
  }
  const p = flow.phase.toLowerCase();
  const a = flow.activity.toLowerCase();

  if (p.includes("cold call") || p.includes("phase 1") || a.includes("cold call") || a.includes("root cause")) {
    return "Model Diagnostic Answer:\nThe fundamental driver is structural digital disruption combined with historical asset-heavy rigidity, rather than temporary balance sheet stress. Students must distinguish between symptoms (margin compression of ~370-380 bps, rising debt leverage) and root causes (lack of proprietary direct-to-consumer relationships, demographic shift, and digital platform substitution). Push students on why 30 years of wholesale distributor loyalty failed to prevent competitor inroads.";
  }
  if (p.includes("quantitative") || p.includes("phase 2") || a.includes("squad") || a.includes("covenant") || a.includes("stress")) {
    return "Model Quantitative Solutions & Analytical Headroom:\n• Squad A (Asset-Heavy Transformation): Debt/Equity escalates toward 1.12x in 2026, leaving virtually zero cushion before breaching the 1.20x bank loan covenant.\n• Squad B (Inorganic M&A / Alliance): Acquiring 51% equity requires ₹65–85 Cr with 18% post-merger integration drag and severe cultural alignment friction.\n• Squad C (Defensive Consolidation): Preserves near-term EBITDA margin (~14%) and positive free cash flow (₹38 Cr), but caps long-term terminal valuation growth at 2%, exposing the brand to long-term obsolescence.";
  }
  if (p.includes("roleplay") || p.includes("phase 3") || p.includes("boardroom") || a.includes("roleplay") || a.includes("cfo") || a.includes("vp")) {
    return "Model Boardroom Defense & Consensus Key:\n• CFO Position: Prioritizes balance sheet solvency, rating covenants, and dividend preservation.\n• VP Strategic Growth: Highlights that delaying D2C transformation permanently forfeits customer relationships and market share to venture-backed challengers.\n• COO Position: Warns that frontline plants are at 94% capacity and cannot absorb arbitrary overhead cuts without supply chain disruption.\n• Optimal Faculty Synthesis: Endorse a phased hybrid model that uses cash from defensive SKU consolidation to fund an initial asset-light joint venture before committing to large-scale in-house CAPEX.";
  }
  if (p.includes("plenary") || p.includes("phase 4") || p.includes("synthesis") || p.includes("3-board") || a.includes("3-board")) {
    return "3-Board Blackboard Plan Takeaways:\n• Board 1 (Diagnosis): Surface symptoms vs underlying structural industry shifts.\n• Board 2 (Framework Rigor): DuPont ROE deconstruction and Porter's five forces evaluation.\n• Board 3 (Action Roadmap): 90-day governance milestones, revised banking covenants, and executive compensation metrics.";
  }
  return "Facilitator Analysis Guide: Guide students to evaluate audited balance sheet metrics against strategic growth optionality, ensuring both qualitative leadership tensions and quantitative hurdle rates are rigorously addressed.";
}
