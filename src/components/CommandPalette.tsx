"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  Sparkles,
  BookOpen,
  TrendingUp,
  BarChart3,
  GraduationCap,
  ShieldCheck,
  FileQuestion,
  Briefcase,
  ClipboardCheck,
  Languages,
  X,
  ArrowRight,
  Command,
} from "lucide-react";
import { Profile, UserRole } from "@/lib/types";

interface CommandItem {
  id: string;
  title: string;
  category: "Navigation" | "Quick Action" | "Languages";
  description?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roleRequirement?: UserRole[];
  action?: () => void;
}

interface CommandPaletteProps {
  currentUser?: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ currentUser, isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const role = currentUser?.role || "faculty";

  const allItems: CommandItem[] = [
    {
      id: "nav-dashboard",
      title: "Dashboard",
      category: "Navigation",
      description: "Institutional overview, stat cards and recent activity",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "nav-create",
      title: "Generate Case Studio",
      category: "Navigation",
      description: "Author and generate high-impact business cases",
      href: "/create",
      icon: Sparkles,
      roleRequirement: ["admin", "faculty"],
    },
    {
      id: "nav-review-queue",
      title: "Review Queue",
      category: "Navigation",
      description: "Inspect cases awaiting curriculum certification",
      href: "/review-queue",
      icon: ClipboardCheck,
      roleRequirement: ["admin", "faculty"],
    },
    {
      id: "nav-library",
      title: "Case Library",
      category: "Navigation",
      description: "Search and filter all curriculum case dossiers",
      href: "/library",
      icon: BookOpen,
    },
    {
      id: "nav-trending",
      title: "Trending Cases",
      category: "Navigation",
      description: "Accredited cases grounded in real market signals",
      href: "/trending",
      icon: TrendingUp,
    },
    {
      id: "nav-analytics",
      title: "Curriculum Analytics & OBE",
      category: "Navigation",
      description: "NAAC/NBA CO/PO attainment matrix & student telemetry",
      href: "/analytics",
      icon: BarChart3,
      roleRequirement: ["admin", "faculty"],
    },
    {
      id: "nav-guide",
      title: "Facilitator Guide",
      category: "Navigation",
      description: "Pedagogical playbooks and Socratic assistant",
      href: "/guide",
      icon: GraduationCap,
      roleRequirement: ["admin", "faculty"],
    },
    {
      id: "nav-admin",
      title: "Admin Center",
      category: "Navigation",
      description: "User governance, quota allocations & audit ledger",
      href: "/admin",
      icon: ShieldCheck,
      roleRequirement: ["admin"],
    },
    {
      id: "nav-answers",
      title: "My Strategic Answers",
      category: "Navigation",
      description: "Review submitted case analyses and certifications",
      href: "/my-answers",
      icon: FileQuestion,
      roleRequirement: ["student"],
    },
    {
      id: "nav-portfolio",
      title: "Academic Portfolio",
      category: "Navigation",
      description: "Verified case credentials and honors certificates",
      href: "/portfolio",
      icon: Briefcase,
      roleRequirement: ["student"],
    },
    // Quick Actions
    {
      id: "act-new-case",
      title: "Generate a New Case Study",
      category: "Quick Action",
      description: "Launch the AI Case Studio with custom pedagogical parameters (जनरेट केस / જનરેટ કેસ)",
      href: "/create",
      icon: Sparkles,
      roleRequirement: ["admin", "faculty"],
    },
    {
      id: "act-hindi-cases",
      title: "Browse Cases in Hindi (हिन्दी)",
      category: "Languages",
      description: "Filter case library to Devanagari regional dossiers",
      href: "/library?language=hi",
      icon: Languages,
    },
    {
      id: "act-gujarati-cases",
      title: "Browse Cases in Gujarati (ગુજરાતી)",
      category: "Languages",
      description: "Filter case library to native Gujarati dossiers",
      href: "/library?language=gu",
      icon: Languages,
    },
  ];

  // Filter items based on current role and search query
  const filteredItems = allItems.filter((item) => {
    if (item.roleRequirement && !item.roleRequirement.includes(role)) {
      return false;
    }
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, filteredItems.length - 1) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const executeItem = (item: CommandItem) => {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      startTransition(() => {
        router.push(item.href!);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col text-text animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface-raised">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, case dossiers, or quick actions (e.g., 'Generate', 'Hindi', 'Analytics')..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-hidden"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted hover:text-text hover:bg-muted/10 transition-colors"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded border border-border bg-muted/10 text-[10px] font-mono text-muted">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/20">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-muted space-y-1">
              <Command className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-muted/70">Try searching for a page name, domain, or language.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary text-white dark:bg-accent dark:text-white shadow-xs"
                      : "hover:bg-muted/10 text-text"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 dark:bg-accent/15 text-primary dark:text-accent"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {item.title}
                      </p>
                      {item.description && (
                        <p
                          className={`text-[11px] truncate leading-tight mt-0.5 ${
                            isSelected ? "text-white/80" : "text-muted"
                          }`}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-muted/15 text-muted"
                      }`}
                    >
                      {item.category}
                    </span>
                    <ArrowRight
                      className={`w-3.5 h-3.5 opacity-60 ${
                        isSelected ? "text-white opacity-100" : ""
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border bg-surface-raised flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/10 text-[9px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/10 text-[9px] font-mono">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/10 text-[9px] font-mono">↵</kbd>
              <span>to select</span>
            </span>
          </div>
          <span className="font-mono text-[10px]">SBS CaseLab Quick Navigator</span>
        </div>
      </div>
    </div>
  );
}
