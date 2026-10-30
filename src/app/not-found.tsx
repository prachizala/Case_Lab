import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { APP_NAME, COLLEGE_NAME_WITH_SHORT } from "@/config/college";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col justify-between">
      {/* Header */}
      <header className="px-6 py-5 border-b border-border bg-surface shadow-xs">
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
        </div>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase font-bold tracking-widest text-accent">404 Error</p>
            <h1 className="text-3xl font-serif font-bold text-text">Dossier or Page Not Found</h1>
            <p className="text-sm text-muted leading-relaxed">
              The case study, analysis module, or administrative route you requested could not be located in the institutional repository.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all"
            >
              <Home className="w-4 h-4" />
              Return to Dashboard
            </Link>
            <Link
              href="/library"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface text-text hover:bg-muted/10 font-semibold text-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Case Library
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-6 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {COLLEGE_NAME_WITH_SHORT} CaseLab. All rights reserved.
      </footer>
    </div>
  );
}
