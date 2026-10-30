import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Compass,
  Zap,
} from "lucide-react";
import {
  ALLOWED_EMAIL_DOMAIN,
  APP_NAME,
  COLLEGE_NAME,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
} from "@/config/college";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between">
      {/* Top Bar */}
      <header className="px-6 py-5 border-b border-border bg-surface shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 px-2.5 py-1 rounded-xl bg-white border border-border shadow-xs flex items-center justify-center shrink-0">
              <Image
                src="/sbs-logo.png"
                alt="Shanti Business School Logo"
                width={80}
                height={32}
                priority
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-text tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-[10px] uppercase font-bold text-accent block tracking-widest">
                {COLLEGE_NAME_WITH_SHORT}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-text transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-xs shadow-sm hover:shadow transition-all"
            >
              Register (@{ALLOWED_EMAIL_DOMAIN})
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-soft border border-border text-xs font-bold text-text uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Curricular AI Intelligence for Business Education</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold text-text leading-tight tracking-tight max-w-4xl mx-auto">
          Authoritative Business Case Studies, Generated in Real Time.
        </h1>

        <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed font-sans">
          {APP_NAME} equips {COLLEGE_NAME_WITH_SHORT} faculty and students with Claude-powered case generation, interactive quantitative exhibits, fact-verified signals, and multi-lingual pedagogy across English, Hindi, and Gujarati.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-accent-text font-serif font-bold text-sm shadow-xl hover:shadow-2xl transition-all"
          >
            <span>Enter Institutional Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/cases"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-surface text-text font-serif font-semibold text-sm hover:border-accent transition-all shadow-sm"
          >
            <BookOpen className="w-4 h-4 text-accent" />
            <span>Browse Case Library</span>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 text-left">
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text">
              Full Cases & FlashSimulations
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Generate 80-minute comprehensive executive business cases or high-velocity 25-minute boardroom FlashCases with verified quantitative tables.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-accent-text flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text">
              Multilingual Pedagogy
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Native translation and formulation in English, Hindi (हिंदी), and Gujarati (ગુજરાતી) customized for regional Indian market contexts.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-soft text-text flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-text">
              Role-Governed RLS
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Strict domain enforcement (@{ALLOWED_EMAIL_DOMAIN}), role-based route middleware, Dean approvals, and automated token rate limiting (10 calls/hr).
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        {APP_NAME} • {COLLEGE_NAME_WITH_SHORT} Pedagogical AI Platform
      </footer>
    </div>
  );
}
