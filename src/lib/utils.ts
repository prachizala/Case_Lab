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
