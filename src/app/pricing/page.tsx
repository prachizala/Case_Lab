"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import {
  CreditCard,
  Check,
  Sparkles,
  Building,
  ShieldCheck,
  GraduationCap,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  ALLOWED_EMAIL_DOMAIN,
  APP_NAME,
  COLLEGE_NAME,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
} from "@/config/college";

interface SubscriptionInfo {
  id?: string;
  plan?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  amount_paise?: number;
}

export default function PricingPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load user profile & active subscription
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sbs_caselab_user");
      let userObj = stored ? JSON.parse(stored) : null;
      if (!userObj) {
        // Fallback demo user
        userObj = {
          id: "usr-student-1",
          email: `prachi.z24bca@${ALLOWED_EMAIL_DOMAIN}`,
          name: "Zala Prachi",
          role: "student",
          subscription_status: "active",
        };
      }
      setCurrentUser(userObj);

      // Fetch active subscription if applicable
      if (userObj.id) {
        fetch(`/api/payments/verify?userId=${userObj.id}`)
          .then((res) => res.json())
          .catch(() => null)
          .then((data) => {
            if (data?.subscription) {
              setSubscription(data.subscription);
            }
          });
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  // Razorpay Checkout Handler
  const handleRazorpayCheckout = async (plan: "monthly" | "yearly" | "lifetime", simulateFailure: boolean = false) => {
    setCheckoutLoading(plan);
    setCheckoutMessage(null);

    try {
      // 1. Server-side Order Creation (session-authenticated; server resolves userId)
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to initialize payment order.");
      }

      // 2. Client initiates payment verification without client secrets
      const fakePaymentId = `pay_test_${Date.now()}`;

      // 3. Server-side Signature Verification & Subscription Activation
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          paymentId: fakePaymentId,
          plan,
          simulateFailure,
          isDemo: !simulateFailure,
        }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.error || "Payment verification failed.");
      }

      // Success! Update local state
      setSubscription(verifyData.subscription);
      setCheckoutMessage({
        type: "success",
        text: `Success! Your ${plan.toUpperCase()} subscription is now ACTIVE. All curriculum libraries and live portfolio links are unlocked.`,
      });

      // Update stored user
      if (currentUser) {
        const updatedUser = { ...currentUser, subscription_status: "active" };
        setCurrentUser(updatedUser);
        localStorage.setItem("sbs_caselab_user", JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      setCheckoutMessage({
        type: "error",
        text: err.message || "Payment transaction could not be completed.",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const alumniPlans = [
    {
      id: "monthly" as const,
      name: "Continuing Education Monthly",
      price: "₹99",
      period: "per month (Razorpay Test Mode)",
      description: "Monthly access to updated curriculum cases, peer discussions, and active portfolio sharing.",
      features: [
        "Unlocks full /library and /trending cases",
        "Live shareable public portfolio link",
        "Participate in Alumni practitioner reflections",
        "Always keep free download of your past work",
      ],
      amountPaise: 9900,
      popular: false,
    },
    {
      id: "yearly" as const,
      name: "Continuing Education Annual",
      price: "₹600",
      period: "per year (Save 50%)",
      description: `Our flagship continuing education plan for working ${COLLEGE_NAME_WITH_SHORT} alumni and executives.`,
      features: [
        "All Monthly tier benefits included",
        "Priority access to Harvard 3-Board digital notes",
        "Executive 'CasePod' AI audio debriefs",
        "15-day renewal reminder notification",
        "Dean's Alumni Fellowship Badge",
      ],
      amountPaise: 60000,
      popular: true,
    },
    {
      id: "lifetime" as const,
      name: "Alumni Lifetime Fellowship",
      price: "₹2,500",
      period: "one-time payment (Perpetual)",
      description: `Never expire. Permanent full access to the ${COLLEGE_NAME_WITH_SHORT} case library for life.`,
      features: [
        "Permanent, unrestricted curriculum library access",
        "Perpetual live portfolio hosting & credential verification",
        "Alumni Advisory Council voting privileges",
        "Zero recurring renewal reminders",
      ],
      amountPaise: 250000,
      popular: false,
    },
  ];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-10 pb-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-text text-xs font-bold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 text-accent" />
            <span>{COLLEGE_NAME_WITH_SHORT} Licensing & Subscriptions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-text">
            Institutional Licensing & Alumni Plans
          </h1>
          <p className="text-sm text-muted">
            Transparent academic access for matriculated students, continuing education for alumni, and institutional accreditation tiers.
          </p>
        </div>

        {/* Current Plan & Status Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-soft rounded-xl text-accent">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Your Current Account Status
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary-soft text-text">
                    Role: {currentUser?.role?.toUpperCase() || "FACULTY"}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-text mt-0.5">
                  {currentUser?.role === "student" && "Enrolled Student — Complimentary Academic License"}
                  {currentUser?.role === "faculty" && `${COLLEGE_SHORT} Faculty License — Full Author & Generation Access`}
                  {currentUser?.role === "admin" && "Institutional Administrator — Campus Root Access"}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:items-end">
              {currentUser?.role === "student" && (
                <div className="flex items-center gap-1.5 text-xs text-success font-bold bg-success/15 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Free While Enrolled</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Notification Banner */}
        {checkoutMessage && (
          <div
            className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
              checkoutMessage.type === "success"
                ? "bg-success/10 text-success border border-success/30"
                : "bg-danger/10 text-danger border border-danger/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {checkoutMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-danger shrink-0" />
              )}
              <span>{checkoutMessage.text}</span>
            </div>
            <button
              onClick={() => setCheckoutMessage(null)}
              className="text-muted hover:text-text text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SECTION 1: ENROLLED STUDENTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="font-serif text-xl font-bold text-text">
              Students (Free While Enrolled)
            </h2>
          </div>

          <div className="bg-primary text-white border border-border rounded-3xl p-8 shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="px-3 py-1 rounded-full bg-white/15 text-on-primary text-[11px] font-bold uppercase tracking-wider border border-white/20">
                  {COLLEGE_NAME} Academic Grant
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {COLLEGE_NAME_WITH_SHORT} Student License — ₹0 Free Forever While Enrolled
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Every matriculated student with an active @{ALLOWED_EMAIL_DOMAIN} account receives full, unrestricted access to their departmental curriculum case studies, interactive Socratic classroom voting, auto-saving answer composer, Dean-signed graduation certificates, and lifetime permanent archive downloads.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <Check className="w-3.5 h-3.5 text-on-primary" />
                    <span>Free access to all enrolled course cases</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <Check className="w-3.5 h-3.5 text-on-primary" />
                    <span>Always download your answers & certificates free</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <Check className="w-3.5 h-3.5 text-on-primary" />
                    <span>Dean-signed landscape credential PDFs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <Check className="w-3.5 h-3.5 text-on-primary" />
                    <span>DPDP Act 2023 complete data portability</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                <span className="text-4xl font-serif font-extrabold text-on-primary">₹0</span>
                <p className="text-[11px] text-white/80 mt-1">Included in {COLLEGE_SHORT} Tuition</p>
                <div className="mt-4 px-4 py-2 bg-accent text-accent-text font-bold text-xs rounded-xl shadow">
                  Active for Matriculated Students
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ALUMNI CONTINUING EDUCATION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-accent text-accent-text flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h2 className="font-serif text-xl font-bold text-text">
                Alumni Continuing Education (Razorpay TEST Mode)
              </h2>
            </div>
            <span className="text-xs text-muted hidden sm:inline">
              Alumni always keep lifetime free access to past work & certificates
            </span>
          </div>

          <p className="text-xs text-muted">
            Graduated students retain permanent, lifetime free access to download all their past submissions, Dean certificates, and DPDP records. A continuing education subscription unlocks the live curriculum library, newly published business cases, trending signals, and a shareable public portfolio link.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
            {alumniPlans.map((p) => (
              <div
                key={p.id}
                className={`p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                  p.popular
                    ? "border-accent bg-surface shadow-xl ring-2 ring-accent/20"
                    : "border-border bg-surface shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-text">
                      {p.name}
                    </h3>
                    {p.popular && (
                      <span className="px-2.5 py-1 rounded-full bg-accent text-accent-text text-[10px] font-bold uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-3xl font-extrabold text-text">
                        {p.price}
                      </span>
                      <span className="text-xs text-muted">{p.period}</span>
                    </div>
                    <p className="text-xs text-muted mt-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <span className="text-[10px] font-bold uppercase text-muted">
                      Privileges Included:
                    </span>
                    {p.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text">
                        <Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 space-y-2">
                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    onClick={() => handleRazorpayCheckout(p.id, false)}
                    className={`w-full py-3 rounded-xl font-serif font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      p.popular
                        ? "bg-accent hover:bg-accent-hover text-accent-text shadow-md"
                        : "border border-border text-text hover:bg-primary-soft"
                    }`}
                  >
                    {checkoutLoading === p.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing Test Payment...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay {p.price} via Razorpay</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={checkoutLoading !== null}
                    onClick={() => handleRazorpayCheckout(p.id, true)}
                    className="w-full text-center text-[10px] text-muted hover:text-text py-1"
                  >
                    (Simulate Failed Payment / Bad Signature)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: COLLEGE LICENSE INFO CARD */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <span className="w-7 h-7 rounded-full bg-primary-soft text-text flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h2 className="font-serif text-xl font-bold text-text">
              Institutional Enterprise & Accreditation License
            </h2>
          </div>

          <div className="bg-surface border border-border rounded-3xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 text-accent font-bold text-sm">
                  <Building className="w-5 h-5" />
                  <span>{COLLEGE_NAME_WITH_SHORT} Campus Accreditation Tier</span>
                </div>
                <h3 className="font-serif text-2xl font-bold text-text">
                  Campus-Wide Outcomes-Based Education & Claude AI Cluster
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Tailored for universities and graduate business schools requiring full NAAC/NBA Course Outcome (CO) and Program Outcome (PO) mapping, automated attainment calculation, Socratic 3-board classroom synchronization, tamper-evident audit logs, and per-college monthly Claude AI token allocation governance.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-start gap-2 text-xs text-text">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Automated NAAC/NBA OBE Attainment Matrix with CSV export</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-text">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Monthly AI token budget telemetry & warning alerts</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-text">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Peer review workflows with immutable version history</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-text">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>DPDP Act 2023 certified Data Protection Officer controls</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between p-6 bg-primary-soft/30 rounded-2xl border border-border text-center">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-muted">Institutional Plan</span>
                  <div className="font-serif text-3xl font-extrabold text-text">
                    Campus Grant
                  </div>
                  <p className="text-xs text-muted">
                    Enterprise SLA with 99.9% uptime & dedicated Postgres cluster
                  </p>
                </div>

                <div className="pt-6">
                  <a
                    href={`mailto:dean@${ALLOWED_EMAIL_DOMAIN}?subject=${encodeURIComponent(APP_NAME)}%20Institutional%20Enterprise%20Inquiry`}
                    className="w-full inline-block py-3 px-4 bg-accent hover:bg-accent-hover text-accent-text rounded-xl font-serif font-bold text-xs shadow transition-all"
                  >
                    Contact Dean's Office
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
