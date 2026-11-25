"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  TrendingUp,
  BarChart3,
  CreditCard,
  GraduationCap,
  FileQuestion,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Menu,
  X,
  UserCheck,
  ClipboardCheck,
  Layers,
  Search,
  Command as CommandIcon,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationDropdown } from "./NotificationDropdown";
import { CommandPalette } from "./CommandPalette";
import { PageContainer } from "./PageContainer";
import { Profile, UserRole } from "@/lib/types";
import {
  APP_NAME,
  COLLEGE_NAME,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
  ENABLE_DEMO_PERSONA_SWITCHER,
} from "@/config/college";
import { getCachedUser, invalidateAuthCache } from "@/lib/auth-client";
import { getUserInitials } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSecondary?: boolean;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const moreDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current user with client-side deduplication & caching
  useEffect(() => {
    getCachedUser()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
        } else if (ENABLE_DEMO_PERSONA_SWITCHER) {
          // In demo mode, if session cookie hasn't been initialized yet, auto-provision Admin
          fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "switch-role", userId: "usr-admin-1" }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.user) {
                setCurrentUser(data.user);
                invalidateAuthCache();
              }
            })
            .catch(() => null);
        }
      })
      .catch((err) => console.error("Failed to load user:", err));

    const handleAuthChanged = () => {
      getCachedUser(true)
        .then((user) => {
          if (user) setCurrentUser(user);
        })
        .catch((err) => console.error("Failed to sync user:", err));
    };

    window.addEventListener("sbs-auth-changed", handleAuthChanged);
    return () => window.removeEventListener("sbs-auth-changed", handleAuthChanged);
  }, []);

  // Global Ctrl+K / Cmd+K and Escape shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setMoreDropdownOpen(false);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreDropdownRef.current &&
        !moreDropdownRef.current.contains(event.target as Node)
      ) {
        setMoreDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      invalidateAuthCache();
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const role: UserRole = currentUser?.role || "faculty";
  const roleLabel = role === "admin" ? "Administrator" : role === "student" ? "Student" : "Faculty";

  // Navigation configurations per persona
  // Faculty
  const facultyNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Curate Case", href: "/create", icon: Sparkles },
    { label: "Review Queue", href: "/review-queue", icon: ClipboardCheck },
    { label: "Trending Cases", href: "/trending", icon: TrendingUp },
    { label: "Case Library", href: "/library", icon: Layers },
    { label: "Analytics", href: "/analytics", icon: BarChart3, isSecondary: true },
    { label: "Go Prime", href: "/pricing", icon: CreditCard, isSecondary: true },
    { label: "Facilitator Guide", href: "/guide", icon: GraduationCap, isSecondary: true },
  ];

  // Admin
  const adminNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Admin Center", href: "/admin", icon: ShieldCheck },
    { label: "Curate Case", href: "/create", icon: Sparkles },
    { label: "Review Queue", href: "/review-queue", icon: ClipboardCheck },
    { label: "Trending Cases", href: "/trending", icon: TrendingUp },
    { label: "Case Library", href: "/library", icon: Layers, isSecondary: true },
    { label: "Analytics", href: "/analytics", icon: BarChart3, isSecondary: true },
    { label: "Go Prime", href: "/pricing", icon: CreditCard, isSecondary: true },
    { label: "Facilitator Guide", href: "/guide", icon: GraduationCap, isSecondary: true },
  ];

  // Student
  const studentNav: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Curate Case", href: "/create", icon: Sparkles },
    { label: "Trending Cases", href: "/trending", icon: TrendingUp },
    { label: "Case Library", href: "/library", icon: Layers },
    { label: "Analytics", href: "/analytics", icon: BarChart3, isSecondary: true },
    { label: "Go Prime", href: "/pricing", icon: CreditCard, isSecondary: true },
    { label: "Facilitator Guide", href: "/guide", icon: GraduationCap, isSecondary: true },
    { label: "Portfolio", href: "/portfolio", icon: Briefcase, isSecondary: true },
  ];

  const currentNav =
    role === "admin"
      ? adminNav
      : role === "student"
      ? studentNav
      : facultyNav;

  // Split items: primary items shown directly, secondary collapsed into "More" dropdown on desktop
  const primaryNavItems = currentNav.filter((item) => !item.isSecondary);
  const secondaryNavItems = currentNav.filter((item) => item.isSecondary);

  // Check if current route matches any secondary item
  const isSecondaryActive = secondaryNavItems.some((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  // Determine current active page label for subtle breadcrumb
  const activeNavItem = currentNav.find(
    (item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const activeBreadcrumbTitle = activeNavItem?.label || "Workspace";

  return (
    <div className="min-h-screen bg-background text-text flex flex-col transition-colors selection:bg-accent selection:text-white">
      {/* 1. SIGNATURE TOP ACCENT GRADIENT LINE (Navy to Gold to Red) */}
      <div className="signature-gold-line sticky top-0 z-50 shrink-0" />

      {/* 2. STICKY TOP NAVIGATION BAR (HEIGHT: 64-68PX, 3 ZONES) */}
      <header className="sticky top-[2px] z-40 w-full bg-primary/95 dark:bg-[#07131F]/95 backdrop-blur-md border-b border-border/20 text-white shadow-xs">
        <div className="w-full max-w-[1440px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-4 lg:px-6 2xl:px-8 flex items-center justify-between h-16 md:h-[68px] gap-2 sm:gap-3 xl:gap-4">
          
          {/* ZONE 1 (LEFT): SBS EMBLEM & FULL INSTITUTIONAL IDENTITY */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <Link
              href="/dashboard"
              prefetch={true}
              className="flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-xl p-1"
              title={COLLEGE_NAME}
            >
              <div className="h-10 px-2.5 py-1 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-white/20 transition-transform group-hover:scale-105">
                <Image
                  src="/sbs-logo.png"
                  alt="Shanti Business School Logo"
                  width={28}
                  height={28}
                  className="h-7 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-white leading-none whitespace-nowrap">
                  {APP_NAME}
                </span>
                <span
                  className="text-[10px] sm:text-[11px] font-medium text-on-primary-muted leading-tight mt-0.5 truncate hidden sm:block max-w-[120px] 2xl:max-w-none"
                  title={COLLEGE_NAME}
                >
                  <span className="hidden 2xl:inline">{COLLEGE_NAME}</span>
                  <span className="inline 2xl:hidden">{COLLEGE_SHORT}</span>
                </span>
              </div>
            </Link>
          </div>

          {/* ZONE 2 (CENTRE): PRIMARY NAVIGATION (MIN-W-0 FLEX-1 JUSTIFY-CENTER) */}
          <nav
            className="hidden lg:flex items-center justify-center flex-1 min-w-0 px-1 xl:px-2 2xl:px-4 gap-0.5 xl:gap-1 2xl:gap-1.5"
            aria-label="Primary Navigation"
          >
            {primaryNavItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent shrink-0 ${
                    isActive
                      ? "bg-white/15 text-white font-semibold shadow-2xs"
                      : "text-on-primary-muted hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-accent" : "text-on-primary-muted group-hover:text-white"
                    }`}
                  />
                  {/* Full label on 2xl (>=1536px); on 1024-1535px, show clean condensed label */}
                  <span className="whitespace-nowrap hidden 2xl:inline">{item.label}</span>
                  <span className="whitespace-nowrap inline 2xl:hidden">
                    {item.label === "Curate Case"
                      ? "Curate"
                      : item.label === "Review Queue"
                      ? "Reviews"
                      : item.label === "Case Library"
                      ? "Library"
                      : item.label === "Admin Center"
                      ? "Admin"
                      : item.label === "Trending Cases"
                      ? "Trending"
                      : item.label === "Go Prime"
                      ? "Go Prime"
                      : item.label}
                  </span>

                  {/* Active Accent Indicator Underline - strictly bounded within active link */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-accent rounded-full animate-fadeIn"
                    />
                  )}
                </Link>
              );
            })}

            {/* "MORE" DROPDOWN FOR SECONDARY ITEMS */}
            {secondaryNavItems.length > 0 && (
              <div className="relative shrink-0" ref={moreDropdownRef}>
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  aria-expanded={moreDropdownOpen}
                  aria-haspopup="true"
                  className={`relative flex items-center gap-1 px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs font-medium transition-all duration-150 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent ${
                    isSecondaryActive
                      ? "bg-white/15 text-white font-semibold shadow-2xs"
                      : "text-on-primary-muted hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>More</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      moreDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                  {isSecondaryActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-accent rounded-full animate-fadeIn"
                    />
                  )}
                </button>

                {/* Dropdown Menu */}
                {moreDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-surface border border-border shadow-xl p-1.5 z-50 text-text space-y-0.5 animate-fadeIn">
                    <p className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
                      Institutional Tools
                    </p>
                    {secondaryNavItems.map((item) => {
                      const isActive =
                        pathname === item.href || pathname.startsWith(`${item.href}/`);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          prefetch={true}
                          onClick={() => setMoreDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-primary text-white dark:bg-accent dark:text-white font-semibold"
                              : "hover:bg-muted/10 text-text"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* ZONE 3 (RIGHT): QUICK JUMP, NOTIFICATIONS, THEME, ROLE BADGE, AVATAR (ALL 40PX HEIGHT) */}
          <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0">
            
            {/* Quick Jump Command Palette Trigger Button (Ctrl/Cmd+K) - icon only < 1280px, icon+kbd 1280-1535px, full label >= 1536px */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:inline-flex items-center justify-center h-10 px-2.5 2xl:px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-on-primary-muted hover:text-white transition-all shadow-2xs focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent shrink-0 gap-1.5"
              title="Search pages and quick actions (Ctrl/Cmd+K)"
            >
              <Search className="w-4 h-4 text-on-primary-muted" />
              <span className="hidden 2xl:inline text-[11px]">Quick Jump</span>
              <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/15 text-[10px] font-mono text-white/90">
                <CommandIcon className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Notification Bell (40px) */}
            <NotificationDropdown currentUser={currentUser} />

            {/* Theme Toggle (40px) */}
            <ThemeToggle />

            {/* USER PROFILE AVATAR & DROPDOWN MENU (40px) */}
            <div className="relative shrink-0" ref={userDropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 h-10 p-1 rounded-xl hover:bg-white/10 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent"
              >
                <div className="w-8 h-8 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-white/20">
                  {getUserInitials(currentUser?.name)}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-on-primary-muted transition-transform duration-200 hidden sm:block ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Profile Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-surface border border-border shadow-2xl p-2 z-50 text-text animate-fadeIn">
                  {/* User Profile Card */}
                  <div className="p-3 rounded-xl bg-primary-soft/30 dark:bg-primary-soft/10 border border-border/40 space-y-1">
                    <p className="text-xs font-bold text-text truncate">
                      {currentUser?.name || "Admin"}
                    </p>
                    <p className="text-[11px] text-muted truncate">
                      {currentUser?.email || "admin@shantibschool.edu.in"}
                    </p>
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-primary text-white">
                        {roleLabel}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        currentUser?.user_type === "sbs_member"
                          ? "bg-accent/15 text-accent border border-accent/20"
                          : "bg-surface-raised text-muted border border-border"
                      }`}>
                        {currentUser?.user_type === "sbs_member" ? "SBS Member" : "External Guest"}
                      </span>
                      {currentUser && !currentUser.email_verified_at && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-danger/15 text-danger border border-danger/20">
                          Unverified
                        </span>
                      )}
                    </div>
                    {/* Monthly Case Quota Status */}
                    <div className="pt-1.5 text-[10px] text-muted flex items-center justify-between border-t border-border/40 mt-1.5">
                      <span>Monthly Curations:</span>
                      <span className="font-mono font-semibold text-text">
                        {currentUser?.free_cases_used_this_month ?? 0} / {currentUser?.monthly_generation_limit ?? (currentUser?.role === "admin" ? 100 : currentUser?.role === "faculty" ? 15 : 10)}
                      </span>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <div className="mt-2 pt-2 border-t border-border/60">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle (40px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl text-on-primary-muted hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent shrink-0"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* MOBILE SLIDE-DOWN DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/20 bg-primary dark:bg-[#07131F] py-4 space-y-3 animate-fadeIn">
            <PageContainer className="space-y-3">
              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCommandPaletteOpen(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/10 text-xs text-on-primary-muted"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span>Search or jump to page...</span>
                </span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">⌘K</kbd>
              </button>

              {/* Mobile Nav Links Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                {currentNav.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-accent text-white font-semibold"
                          : "text-on-primary-muted hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </PageContainer>
          </div>
        )}
      </header>

      {/* 3. SUBTLE BREADCRUMB STRIP UNDER TOP BAR (Hidden on /create to maximize above-the-fold space) */}
      {pathname !== "/create" && (
        <section className="w-full bg-[var(--breadcrumb-bg)] border-b border-border py-2.5 text-xs backdrop-blur-xs transition-colors">
          <PageContainer className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted min-w-0">
              <span className="font-serif font-bold text-primary dark:text-text truncate hidden sm:inline">
                {COLLEGE_NAME} Pedagogical Engine
              </span>
              <span className="hidden sm:inline text-muted/60">•</span>
              <span className="font-semibold text-text truncate">
                {activeBreadcrumbTitle}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted shrink-0 font-mono">
              <span className="hidden md:inline">
                Campus Session: <strong className="text-text font-bold">AY 2026-27</strong>
              </span>
            </div>
          </PageContainer>
        </section>
      )}

      {/* 4. MAIN CANVAS WORKSPACE (FULL PAGE WIDTH, CENTERED WITH PAGECONTAINER) */}
      <main className="flex-1 w-full py-6 md:py-8 overflow-x-hidden">
        <PageContainer>
          {children}
        </PageContainer>
      </main>

      {/* 5. ACCESSIBLE COMMAND PALETTE MODAL */}
      <CommandPalette
        currentUser={currentUser}
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
