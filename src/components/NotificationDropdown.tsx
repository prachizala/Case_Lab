"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  GraduationCap,
  CreditCard,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import { Profile } from "@/lib/types";
import { COLLEGE_SHORT } from "@/config/college";

interface NotificationItem {
  id: string;
  category: "action_required" | "academic" | "billing" | "security";
  title: string;
  message: string;
  href: string;
  timestamp: string;
  unread: boolean;
  priority: "high" | "medium" | "low";
}

interface NotificationDropdownProps {
  currentUser: Profile | null;
}

let cachedNotifications: { userId: string; data: NotificationItem[]; timestamp: number } | null = null;

export function NotificationDropdown({ currentUser }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (currentUser && cachedNotifications && cachedNotifications.userId === currentUser.id) {
      return cachedNotifications.data;
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "action_required" | "academic" | "billing">("all");
  const [mounted, setMounted] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number }>({ top: 60, right: 16 });

  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCoords = useCallback(() => {
    if (!triggerButtonRef.current) return;
    const rect = triggerButtonRef.current.getBoundingClientRect();
    // Dropdown positioned 8px below the trigger button, clamped inside the viewport
    const rightMargin = Math.max(16, window.innerWidth - rect.right);
    setDropdownCoords({
      top: rect.bottom + 8,
      right: rightMargin,
    });
  }, []);

  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!currentUser) return;
    try {
      if (!isBackground) setLoading(true);
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        setNotifications(list);
        cachedNotifications = { userId: currentUser.id, data: list, timestamp: Date.now() };
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const now = Date.now();
    if (!cachedNotifications || cachedNotifications.userId !== currentUser.id || now - cachedNotifications.timestamp >= 30000) {
      fetchNotifications();
    }

    // Polling every 30 seconds, strictly paused when tab is hidden
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser, fetchNotifications]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("alerts") === "open" || params.get("alerts") === "true") {
        setIsOpen(true);
      }
    }
  }, []);

  // Recalculate coordinates on open, window resize, and scroll
  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleWindowEvents = () => updateCoords();
    window.addEventListener("resize", handleWindowEvents);
    window.addEventListener("scroll", handleWindowEvents, true);

    return () => {
      window.removeEventListener("resize", handleWindowEvents);
      window.removeEventListener("scroll", handleWindowEvents, true);
    };
  }, [isOpen, updateCoords]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    return n.category === activeTab;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "action_required":
        return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
      case "billing":
        return <CreditCard className="w-3.5 h-3.5 text-info" />;
      case "security":
        return <ShieldCheck className="w-3.5 h-3.5 text-danger" />;
      case "academic":
      default:
        return <GraduationCap className="w-3.5 h-3.5 text-accent" />;
    }
  };

  const handleToggle = () => {
    const nextState = !isOpen;
    if (nextState) {
      updateCoords();
      fetchNotifications();
    }
    setIsOpen(nextState);
  };

  return (
    <div className="relative inline-block">
      {/* Bell Button */}
      <button
        ref={triggerButtonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Institutional Notifications"
        aria-expanded={isOpen}
        className="relative h-10 w-10 rounded-xl border border-border bg-surface text-text hover:text-accent hover:border-accent transition-all focus:outline-none focus:ring-2 focus:ring-accent/20 flex items-center justify-center shrink-0"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[18px] max-w-[34px] px-1 items-center justify-center rounded-full bg-accent text-[9px] font-mono font-bold text-accent-text shadow-sm animate-pulse truncate"
            title={`${unreadCount} unread notifications`}
          >
            {unreadCount > 999 ? "999+" : unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown rendered in document.body via Portal to prevent stacking/clipping issues */}
      {isOpen && mounted && createPortal(
        <>
          {/* Full-screen click-catcher behind dropdown (z-overlay: 40) */}
          <div
            className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Solid floating dropdown container (z-dropdown: 50) */}
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${dropdownCoords.top}px`,
              right: `${dropdownCoords.right}px`,
              width: "min(24rem, calc(100vw - 2rem))",
              maxHeight: "70vh",
              backgroundColor: "var(--surface-raised)",
            }}
            className="z-50 rounded-2xl border border-border bg-surface-raised text-text shadow-2xl overflow-hidden flex flex-col animate-fade-in"
          >
            {/* Header */}
            <div className="p-3.5 bg-primary text-white flex items-center justify-between border-b border-border/20 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-white/15 border border-white/20 text-on-primary flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5 text-on-primary" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-xs text-white truncate">
                    Institutional Alerts
                  </h3>
                  <p className="text-[10px] text-on-primary-muted truncate">
                    {COLLEGE_SHORT} Pedagogical Telemetry
                  </p>
                </div>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-primary-muted hover:text-on-primary transition-colors shrink-0 ml-2"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  <span>Mark Read</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-border bg-primary-soft/30 p-1.5 text-[11px] font-semibold shrink-0 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-1 px-1 rounded-lg transition-all text-center truncate ${
                  activeTab === "all"
                    ? "bg-surface text-accent shadow-sm font-bold border border-border/40"
                    : "text-text-muted hover:text-text"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("action_required")}
                className={`flex-1 py-1 px-1 rounded-lg transition-all text-center truncate ${
                  activeTab === "action_required"
                    ? "bg-surface text-accent shadow-sm font-bold border border-border/40"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Action
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("academic")}
                className={`flex-1 py-1 px-1 rounded-lg transition-all text-center truncate ${
                  activeTab === "academic"
                    ? "bg-surface text-accent shadow-sm font-bold border border-border/40"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Academic
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("billing")}
                className={`flex-1 py-1 px-1 rounded-lg transition-all text-center truncate ${
                  activeTab === "billing"
                    ? "bg-surface text-accent shadow-sm font-bold border border-border/40"
                    : "text-text-muted hover:text-text"
                }`}
              >
                Billing
              </button>
            </div>

            {/* Notifications List Container with Solid Surface Raised Background */}
            <div
              className="overflow-y-auto divide-y divide-border flex-1 bg-surface-raised"
              style={{ backgroundColor: "var(--surface-raised)" }}
            >
              {loading && notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted bg-surface-raised">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span>Checking campus communications...</span>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted bg-surface-raised">
                  <Sparkles className="w-5 h-5 text-accent mx-auto mb-1 opacity-70" />
                  <p className="font-semibold text-text">All caught up!</p>
                  <p className="text-[10px] text-text-muted mt-0.5">No unread alerts in this category.</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{ backgroundColor: "var(--surface-raised)" }}
                    className={`p-3 text-xs transition-colors hover:bg-primary-soft/10 flex items-start gap-2.5 bg-surface-raised ${
                      notif.unread
                        ? "bg-primary-soft/20 border-l-4 border-accent"
                        : ""
                    }`}
                  >
                    <div className="mt-0.5 p-1 rounded-lg bg-primary-soft/40 shrink-0">
                      {getCategoryIcon(notif.category)}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1.5 mb-0.5">
                        <span className="font-serif font-bold text-text truncate text-[11px]">
                          {notif.title}
                        </span>
                        {notif.priority === "high" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-danger/15 text-danger shrink-0">
                            Priority
                          </span>
                        )}
                      </div>

                      <p className="text-text-muted text-[10px] leading-relaxed break-words line-clamp-3">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/30">
                        <Link
                          href={notif.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:text-accent-hover hover:underline"
                        >
                          <span>Take Action</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => dismissNotification(notif.id, e)}
                          className="text-text-muted hover:text-danger p-0.5 rounded transition-colors"
                          title="Dismiss notification"
                          aria-label="Dismiss notification"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2 bg-primary-soft/20 border-t border-border text-center shrink-0">
              <span className="text-[10px] text-text-muted font-medium">
                Synchronized with {COLLEGE_SHORT} Academic Telemetry
              </span>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
