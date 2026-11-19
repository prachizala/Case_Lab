import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { COLLEGE_NAME, COLLEGE_NAME_WITH_SHORT, COLLEGE_SHORT, APP_NAME } from "@/config/college";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, Lock } from "lucide-react";

export const metadata = {
  title: `Terms & Conditions • ${APP_NAME} (${COLLEGE_SHORT})`,
  description: `Statutory terms, conditions, and DPDP Act 2023 compliance governance for ${COLLEGE_NAME}.`,
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 px-2 py-1 rounded-xl bg-white border border-border shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/sbs-logo.png"
                alt="Shanti Business School Logo"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-lg text-text tracking-tight group-hover:text-accent transition-colors">
                {APP_NAME}
              </span>
              <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">
                {COLLEGE_NAME_WITH_SHORT}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-accent hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Registration</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1">
        <div className="p-8 sm:p-12 rounded-3xl border border-border bg-surface shadow-xl space-y-8">
          <div className="space-y-3 border-b border-border pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Statutory Compliance & Governance Policy</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
              Terms &amp; Conditions of Use
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Effective Date: Academic Session 2026-27 • Governing Entity: {COLLEGE_NAME} (SBS Case Centre)
            </p>
          </div>

          <div className="space-y-6 text-sm text-text/90 leading-relaxed font-sans">
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" />
                <span>1. Academic Repository Purpose &amp; Scope</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {APP_NAME} is an institutional pedagogical platform hosted by {COLLEGE_NAME} combining generative business case research, structured decision frameworks, peer-reviewed blind evaluations, and Outcome-Based Education (OBE) tracking. Access is provisioned strictly for verified students, faculty members, and authorized academic administrators.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>2. Statutory Consent under Digital Personal Data Protection (DPDP) Act 2023</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                In compliance with Sections 6 and 11 of the Digital Personal Data Protection (DPDP) Act 2023 of India, creating an account requires your affirmative, informed consent. Shanti Business School collects:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm text-muted space-y-1">
                <li><strong>Official Institutional Email:</strong> For role-based authentication and course enrollment verification.</li>
                <li><strong>Personal Email Address:</strong> Exclusively for password self-recovery and permanent alumni credentials.</li>
                <li><strong>Indian Mobile Number:</strong> For multi-factor SMS authentication and critical accreditation audits.</li>
              </ul>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                This personal information is processed strictly for academic administration, peer evaluation ledgering, and NAAC/NBA accreditation reporting. It is never sold, shared, or repurposed for commercial marketing.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                <span>3. Confidentiality, Answer Keys &amp; Role Isolation</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                To preserve pedagogical rigor, faculty teaching notes, grading rubrics, model financial models, and solution keys are protected through strict database-level Row Level Security (RLS). Students are legally and academically prohibited from scraping, reverse-engineering, sharing, or publishing faculty evaluation notes or peer answers outside of designated course sessions.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span>4. Intellectual Property &amp; Case Copyright</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Business cases, boardroom simulations, and course packs authored using {APP_NAME} remain the academic property of {COLLEGE_NAME} and the contributing faculty members. Case studies published to the institutional repository are indexed with persistent accession identifiers and may be cited according to academic citation conventions.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-bold text-text flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>5. Right to Withdraw Consent &amp; Data Erasure</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                Pursuant to Section 11 and Section 12 of the DPDP Act 2023, you retain the statutory right at any time to inspect your collected personal data, export your academic portfolio, or withdraw consent and request total erasure of your personal submissions by visiting the <Link href="/privacy" className="text-accent underline font-semibold">Privacy Compliance Center</Link>.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted">
              Questions regarding data processing? Contact <a href="mailto:admin@shantibschool.edu.in" className="text-accent underline">admin@shantibschool.edu.in</a>
            </span>
            <Link
              href="/signup"
              className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-md transition-all"
            >
              Return to Registration
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-muted">
        {APP_NAME} • {COLLEGE_NAME_WITH_SHORT} Pedagogical Platform
      </footer>
    </div>
  );
}
