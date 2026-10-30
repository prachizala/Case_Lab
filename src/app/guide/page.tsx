"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  APP_NAME,
  COLLEGE_NAME,
  COLLEGE_NAME_WITH_SHORT,
  COLLEGE_SHORT,
} from "@/config/college";
import {
  GraduationCap,
  Compass,
  Clock,
  CheckCircle2,
  Lightbulb,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  Sliders,
  Award,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  refused?: boolean;
}

export default function FacilitatorGuidePage() {
  const [activeTab, setActiveTab] = useState<"class" | "rubric" | "grading">("class");

  // Guide Assistant Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "assistant",
      content:
        `Welcome, Professor. I am your ${APP_NAME} Pedagogical Assistant. I am specifically calibrated to advise you on case method facilitation, cold calling, rubric design, and platform workflows. How can I assist your classroom preparation today?`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/guide/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `asst-${Date.now()}`,
            role: "assistant",
            content: data.reply,
            refused: data.refused,
          },
        ]);
      }
    } catch (err) {
      console.error("Guide chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          role: "assistant",
          content:
            "I apologize, but I encountered an error connecting to the pedagogical assistant service. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* HEADER */}
        <div className="border-b border-border pb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-text border border-border text-xs font-bold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-accent" />
            <span>{COLLEGE_NAME_WITH_SHORT} Executive Pedagogy</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-text tracking-tight">
            Facilitator Guide & Classroom Playbook
          </h1>
          <p className="text-xs md:text-sm text-muted mt-1">
            Standard operating protocols for running high-tension business case discussions, cold calls, rubric calibration, and AI-assisted evaluation.
          </p>
        </div>

        {/* MAIN LAYOUT: GUIDE CONTENT (2 COLS) + ASSISTANT (1 COL) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: GUIDE CONTENT TABS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            {/* TABS SELECTOR */}
            <div className="flex items-center gap-2 border-b border-border pb-2">
              <button
                onClick={() => setActiveTab("class")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
                  activeTab === "class"
                    ? "bg-accent text-accent-text shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>1. Running a Case in Class</span>
              </button>

              <button
                onClick={() => setActiveTab("rubric")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
                  activeTab === "rubric"
                    ? "bg-accent text-accent-text shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>2. Rubric Tips & NBA/NAAC</span>
              </button>

              <button
                onClick={() => setActiveTab("grading")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all ${
                  activeTab === "grading"
                    ? "bg-accent text-accent-text shadow-sm"
                    : "text-muted hover:text-text"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>3. Grading Workflow</span>
              </button>
            </div>

            {/* TAB 1: RUNNING A CASE */}
            {activeTab === "class" && (
              <div className="space-y-6 animate-fadeIn">
                {/* 1.1 Cold Call */}
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-accent">
                    <Compass className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold text-text">
                      The Executive Cold-Call Opening
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-text leading-relaxed">
                    Begin each session by opening directly with the Decision Point rather than a factual summary. Interrogate a selected participant immediately:
                  </p>
                  <div className="p-4 rounded-xl bg-primary-soft/40 border border-border text-xs italic font-serif text-text">
                    &ldquo;If you were the Managing Director in Surat today, do you approve this $12.5M capital allocation? Yes or No, and why?&rdquo;
                  </div>
                  <p className="text-xs text-muted">
                    Give the initial respondent 60 seconds of uninterrupted runway before inviting counter-arguments from the cohort.
                  </p>
                </div>

                {/* 1.2 Time Budgeting */}
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Clock className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold text-text">
                      Classroom Time Budgeting
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl border border-border bg-primary-soft/30 space-y-2">
                      <span className="font-bold uppercase text-text">
                        FlashCase (25 Minutes)
                      </span>
                      <ul className="space-y-1.5 text-muted list-disc list-inside">
                        <li>5 min: Crisis briefing & rapid triage</li>
                        <li>10 min: Small-group quantitative crunch</li>
                        <li>10 min: Boardroom cross-examination</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border border-border bg-primary-soft/30 space-y-2">
                      <span className="font-bold uppercase text-text">
                        Full Teaching Case (80 Minutes)
                      </span>
                      <ul className="space-y-1.5 text-muted list-disc list-inside">
                        <li>15 min: Macro context & strategic framing</li>
                        <li>35 min: Exhibit sensitivity & financial modeling</li>
                        <li>30 min: Governance debate, synthesis & frameworks</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 1.3 Blackboard Partitioning */}
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-accent">
                    <Lightbulb className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold text-text">
                      Chalkboard Quad-Partitioning Architecture
                    </h2>
                  </div>
                  <p className="text-xs text-text leading-relaxed">
                    Organize physical or virtual whiteboards into four distinct functional quadrants to maintain cognitive rigor:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-lg bg-primary-soft/30 border border-border">
                      <span className="font-bold text-text">Board 1: Factual Diagnosis</span>
                      <p className="text-[11px] text-muted mt-1">Undisputed financial metrics, market share, and constraints.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-soft/30 border border-border">
                      <span className="font-bold text-text">Board 2: Strategic Dilemma</span>
                      <p className="text-[11px] text-muted mt-1">Trade-offs between short-term margin and long-term moat.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-soft/30 border border-border">
                      <span className="font-bold text-text">Board 3: Quantitative Scenarios</span>
                      <p className="text-[11px] text-muted mt-1">DCF valuation, sensitivity grids, and downside limits.</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary-soft/30 border border-border">
                      <span className="font-bold text-text">Board 4: Action Roadmap</span>
                      <p className="text-[11px] text-muted mt-1">Implementation milestones, capital calls, and KPI tracking.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RUBRIC TIPS & NBA/NAAC */}
            {activeTab === "rubric" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Sliders className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold text-text">
                      Calibrating 100-Point Rubrics
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-text leading-relaxed">
                    {APP_NAME} encourages standardizing on 100-point rubrics divided into 4 core criteria to maintain consistency across faculty cohorts:
                  </p>

                  <div className="space-y-3 pt-1">
                    {[
                      { name: "Strategic Framing & Risk Analysis", weight: 30, desc: "Evaluates root-cause diagnosis, competitive positioning, and downside risk." },
                      { name: "Financial Modeling & Quantitative Synthesis", weight: 30, desc: "Rigor of exhibit data application, valuation mechanics, and unit economics." },
                      { name: "Implementation Feasibility & Leadership", weight: 25, desc: "Actionability of milestones, governance hurdles, and stakeholder management." },
                      { name: "Executive Communication & Clarity", weight: 15, desc: "Board-level presentation, conciseness, and structured argumentation." },
                    ].map((crit) => (
                      <div key={crit.name} className="p-3.5 rounded-xl border border-border bg-primary-soft/20 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-text">{crit.name}</span>
                          <p className="text-[11px] text-muted">{crit.desc}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-accent text-accent-text font-mono text-xs font-bold shrink-0">
                          {crit.weight} Pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-accent">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <h2 className="font-serif text-lg font-bold text-text">
                      Mapping to NBA & NAAC Accreditation Outcomes
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-text leading-relaxed">
                    In {APP_NAME}, each rubric criterion can link directly to Course Outcomes (CO) and Program Outcomes (PO). When student submissions are graded, attainment is automatically calculated against your target threshold (default 60%). You can export this directly to CSV for accreditation audits.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: GRADING WORKFLOW */}
            {activeTab === "grading" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-6 rounded-2xl border border-border bg-surface shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Award className="w-5 h-5" />
                    <h2 className="font-serif text-lg font-bold text-text">
                      The Two-Tier Grading Protocol
                    </h2>
                  </div>
                  <p className="text-xs md:text-sm text-text leading-relaxed">
                    {APP_NAME} enforces strict privacy and academic integrity safeguards throughout the evaluation lifecycle:
                  </p>

                  <div className="space-y-3 pt-1">
                    <div className="p-4 rounded-xl border border-border bg-primary-soft/30 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-text">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</span>
                        <span>AI Synthesis & Bounds Clamping</span>
                      </div>
                      <p className="text-xs text-muted pl-7">
                        When you click &ldquo;Evaluate with Claude AI&rdquo;, marks are awarded per criterion and strictly clamped within rubric bounds. Marks are saved as provisional with <code>is_published: false</code>.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-warning/30 bg-warning/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-warning">
                        <span className="w-5 h-5 rounded-full bg-warning text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Provisional Withholding (Student Privacy)</span>
                      </div>
                      <p className="text-xs text-muted pl-7">
                        Students cannot view marks or AI feedback while in provisional status. This prevents confusion from preliminary scores prior to instructor review.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-success/30 bg-success/10 space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-success">
                        <span className="w-5 h-5 rounded-full bg-success text-white flex items-center justify-center text-[10px]">3</span>
                        <span>Instructor Publication & Certificate Generation</span>
                      </div>
                      <p className="text-xs text-muted pl-7">
                        The faculty member reviews the evaluation, adjusts criteria points if necessary, writes custom commendation comments, and publishes. An official PDF certificate of completion is automatically generated.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: GUIDE ASSISTANT CHAT BOX (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col h-[650px] rounded-3xl border border-border bg-surface shadow-lg overflow-hidden">
            {/* CHAT HEADER */}
            <div className="p-4 bg-primary text-white flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 text-on-primary flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Guide Assistant</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-white/15 text-on-primary border border-white/20">
                      Claude AI
                    </span>
                  </h3>
                  <p className="text-[10px] text-white/60">Case Method & Platform Consultant</p>
                </div>
              </div>
            </div>

            {/* CHAT THREAD */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-primary-soft/10">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "bg-accent text-accent-text rounded-tr-none font-medium"
                        : m.refused
                        ? "bg-warning/10 border border-warning/30 text-text rounded-tl-none"
                        : "bg-surface border border-border text-text rounded-tl-none"
                    }`}
                  >
                    {m.refused && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-warning uppercase tracking-wider mb-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Pedagogical Boundary Guardrail</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>

                  {m.role === "user" && (
                    <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-center gap-2 text-xs text-muted p-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
                  <span>Consulting pedagogical knowledge base...</span>
                </div>
              )}
            </div>

            {/* SUGGESTED PROMPT CHIPS */}
            <div className="px-4 py-2 border-t border-border bg-primary-soft/20 overflow-x-auto flex gap-1.5 no-scrollbar">
              {[
                "How do I facilitate cold calls?",
                "Tips for 100-mark rubrics",
                "Explain NBA/NAAC attainment",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap bg-surface border border-border text-muted hover:border-accent hover:text-text transition-colors shrink-0"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* INPUT BAR */}
            <div className="p-3 border-t border-border bg-surface flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask about case facilitation, rubrics, or platform..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface border border-border text-text placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={chatLoading || !inputMessage.trim()}
                className="p-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
