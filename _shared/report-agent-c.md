# Sub-Agent C Report: Frontend Banner Component

## Files Owned & Implemented
- `src/components/TokenBudgetBanner.tsx`: Full-width banner adhering exactly to the BANNER SPEC.
- `src/app/dashboard/page.tsx`: Integrated `TokenBudgetBanner` replacing legacy inline markup.
- `src/app/create/page.tsx`: Integrated `TokenBudgetBanner` on the case generation page.

## Key Changes
1. **Design Conformance**:
   - Soft beige background card (`#FDF9F3` / dark `#25201B`), rounded corners, subtle amber/orange borders.
   - Left side: Circular SVG progress ring showing percentage (e.g. 84%) with smooth stroke calculations.
   - Title: "Institutional Token Budget Warning" in serif font with orange badge "84% USED".
   - Subtext (monospace): `Used 420,000 / 500,000 tokens • 80,000 remaining`.
   - Right side: Outlined "Breakdown" dropdown with chevron, red "Quota Upgrade →" button, and dismiss (X) button.
2. **Dynamic Color States**:
   - `< 80%`: Hidden (neutral).
   - `80% - 94%`: Amber/orange warning.
   - `95% - 99%`: Red critical alert.
   - `≥ 100%`: Blocked / "Institutional Token Budget Exhausted".
3. **Interactive & Lifecycle Features**:
   - 60-second polling interval and automatic refetch support on AI actions.
   - Session dismiss via `sessionStorage` with automatic un-dismissing when crossing into critical (≥95%).
   - Breakdown drawer fetching `/api/usage/breakdown` showing model and feature usage cards.
   - Fully responsive on mobile with accessible ARIA tags (`role="region"`, `aria-label`).
