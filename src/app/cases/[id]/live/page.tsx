"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { StateLoading } from "@/components/StateLoading";
import { StateError } from "@/components/StateError";
import { ClassroomSession, ColdCallRecord, BoardPlan, Profile } from "@/lib/types";
import {
  ArrowLeft,
  Users,
  Vote,
  Layout,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  ChevronRight,
  Save,
  RefreshCw,
  Send,
  Sliders,
  Check,
  Building,
  GraduationCap,
} from "lucide-react";

export default function LiveClassroomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const caseId = unwrappedParams.id;

  const [session, setSession] = useState<ClassroomSession | null>(null);
  const [caseMeta, setCaseMeta] = useState<{ id: string; title: string; industry: string; decision_point: string } | null>(null);
  const [students, setStudents] = useState<{ id: string; name: string; email: string; department: string }[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"cold_call" | "live_poll" | "board_plan">("cold_call");

  // Cold Call state
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; department: string } | null>(null);
  const [coldCallTimer, setColdCallTimer] = useState(180); // 3 minutes default
  const [timerRunning, setTimerRunning] = useState(false);
  const [coldCallScore, setColdCallScore] = useState<number>(4);
  const [coldCallNotes, setColdCallNotes] = useState("");
  const [isRecordingScore, setIsRecordingScore] = useState(false);
  const [scoreSuccess, setScoreSuccess] = useState(false);

  // Live Poll state
  const [selectedVoteOption, setSelectedVoteOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // Board Plan state
  const [board1, setBoard1] = useState("");
  const [board2, setBoard2] = useState("");
  const [board3, setBoard3] = useState("");
  const [isSavingBoard, setIsSavingBoard] = useState(false);
  const [isSuggestingBoard, setIsSuggestingBoard] = useState(false);
  const [boardSaveSuccess, setBoardSaveSuccess] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && coldCallTimer > 0) {
      interval = setInterval(() => {
        setColdCallTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, coldCallTimer]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Current user
      const authRes = await fetch("/api/auth");
      const authData = await authRes.json();
      setCurrentUser(authData.user || null);

      // Session data
      const res = await fetch(`/api/cases/${caseId}/live`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to load classroom session");
      }
      const data = await res.json();
      setSession(data.session);
      setCaseMeta(data.case);
      setStudents(data.students || []);

      if (data.session?.board_plan) {
        setBoard1(data.session.board_plan.board_1_dilemma || "");
        setBoard2(data.session.board_plan.board_2_alternatives || "");
        setBoard3(data.session.board_plan.board_3_action_plan || "");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading session";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  // Cold call picker
  const triggerColdCall = () => {
    if (students.length === 0) return;
    setIsSpinning(true);
    setTimerRunning(false);
    setColdCallTimer(180);
    setScoreSuccess(false);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * students.length);
      setSelectedStudent(students[randomIdx]);
      counter++;
      if (counter > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        setTimerRunning(true);
      }
    }, 100);
  };

  const handleRecordColdCall = async () => {
    if (!selectedStudent) return;
    try {
      setIsRecordingScore(true);
      const res = await fetch(`/api/cases/${caseId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cold-call",
          student_id: selectedStudent.id,
          student_name: selectedStudent.name,
          score: coldCallScore,
          notes: coldCallNotes,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setScoreSuccess(true);
        setTimeout(() => setScoreSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecordingScore(false);
    }
  };

  // Poll Vote
  const handleVote = async (optionId: string) => {
    try {
      setIsVoting(true);
      setSelectedVoteOption(optionId);
      const res = await fetch(`/api/cases/${caseId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "vote",
          optionId,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setVoteSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVoting(false);
    }
  };

  const handleTogglePoll = async (isOpen: boolean, phase?: "before_debate" | "after_debate") => {
    try {
      const res = await fetch(`/api/cases/${caseId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-poll",
          isOpen,
          phase,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Board Plan
  const handleSaveBoardPlan = async () => {
    try {
      setIsSavingBoard(true);
      const res = await fetch(`/api/cases/${caseId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-board",
          board_1_dilemma: board1,
          board_2_alternatives: board2,
          board_3_action_plan: board3,
        }),
      });
      const data = await res.json();
      if (data.success && data.session) {
        setSession(data.session);
        setBoardSaveSuccess(true);
        setTimeout(() => setBoardSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingBoard(false);
    }
  };

  const handleAiSuggestBoard = async () => {
    try {
      setIsSuggestingBoard(true);
      const res = await fetch(`/api/cases/${caseId}/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ai-suggest-board" }),
      });
      const data = await res.json();
      if (data.success && data.session?.board_plan) {
        setSession(data.session);
        setBoard1(data.session.board_plan.board_1_dilemma);
        setBoard2(data.session.board_plan.board_2_alternatives);
        setBoard3(data.session.board_plan.board_3_action_plan);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSuggestingBoard(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <StateLoading
          title="Initializing Socratic Live Classroom & Roster..."
          subtitle="Preparing enrolled cohort, live decision polls, and digital 3-board plan."
        />
      </AppShell>
    );
  }

  if (error || !session) {
    return (
      <AppShell>
        <StateError
          title="Classroom Session Unavailable"
          message={error || "Could not initialize live session."}
          onRetry={loadData}
        />
      </AppShell>
    );
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isFacultyOrAdmin = currentUser?.role === "faculty" || currentUser?.role === "admin";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* TOP COMMAND HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-primary border border-border text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/cases/${caseId}`}
                className="inline-flex items-center gap-1.5 text-xs text-on-primary-muted hover:text-white font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Case Study
              </Link>
              <span className="text-white/40">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live Socratic Room
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">
              {caseMeta?.title || session.case_title}
            </h1>
            <p className="text-xs text-white/80">
              Sector: <span className="text-on-primary-muted font-medium">{caseMeta?.industry}</span> • Enrolled Cohort: <span className="font-semibold text-white">{students.length} Students</span>
            </p>
          </div>

          {/* VIEW SWITCHER TABS */}
          <div className="flex items-center gap-1.5 p-1 bg-surface/10 rounded-xl border border-border/40">
            <button
              onClick={() => setActiveTab("cold_call")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "cold_call"
                  ? "bg-accent text-accent-text shadow-md font-bold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" /> Cold-Call Wheel
            </button>
            <button
              onClick={() => setActiveTab("live_poll")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "live_poll"
                  ? "bg-accent text-accent-text shadow-md font-bold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Vote className="w-4 h-4" /> Live Dilemma Poll
            </button>
            <button
              onClick={() => setActiveTab("board_plan")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "board_plan"
                  ? "bg-accent text-accent-text shadow-md font-bold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Layout className="w-4 h-4" /> 3-Board Plan
            </button>
          </div>
        </div>

        {/* TAB 1: SOCRATIC COLD-CALL WHEEL */}
        {activeTab === "cold_call" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Cold Call Podium */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-8 rounded-2xl bg-surface border border-border shadow-sm text-center space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-text text-xs font-bold uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" /> Socratic Discussion Protocol
                  </div>
                  <h2 className="text-xl font-serif font-bold text-text">
                    Protagonist Cold-Call Selector
                  </h2>
                  <p className="text-sm text-muted max-w-md mx-auto">
                    Randomly selects an enrolled student to deliver the 3-minute opening strategic defense.
                  </p>
                </div>

                {/* Selected Student Card */}
                <div className="p-6 rounded-2xl bg-primary-soft/30 border border-border min-h-[160px] flex flex-col items-center justify-center space-y-3">
                  {selectedStudent ? (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="w-16 h-16 rounded-full bg-primary text-on-primary font-serif font-black text-2xl flex items-center justify-center mx-auto border-2 border-white/40 shadow-md">
                        {selectedStudent.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-text">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-xs text-muted">
                        Department: <span className="font-semibold text-accent">{selectedStudent.department}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-muted space-y-2">
                      <Users className="w-12 h-12 mx-auto stroke-1" />
                      <p className="text-sm font-medium">Ready to call on cohort. Click below to spin.</p>
                    </div>
                  )}
                </div>

                {/* Actions & 3-Min Timer */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {isFacultyOrAdmin && (
                    <button
                      onClick={triggerColdCall}
                      disabled={isSpinning}
                      className="px-6 py-3 rounded-xl bg-accent text-accent-text hover:bg-accent-hover font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
                      {isSpinning ? "Selecting Student..." : "Cold Call Next Student"}
                    </button>
                  )}

                  {/* Timer */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-soft/40 border border-border">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="font-mono text-lg font-bold text-text">
                      {formatTimer(coldCallTimer)}
                    </span>
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="p-1 rounded text-muted hover:text-text"
                      title={timerRunning ? "Pause" : "Start"}
                    >
                      {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setTimerRunning(false);
                        setColdCallTimer(180);
                      }}
                      className="p-1 rounded text-muted hover:text-text"
                      title="Reset 3:00"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Opening Prompt Box */}
                <div className="p-4 rounded-xl bg-primary-soft/40 border border-border text-left text-xs text-text space-y-1">
                  <div className="font-bold text-primary flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-accent" /> Cold-Call Opening Prompt:
                  </div>
                  <p className="italic">
                    "{caseMeta?.decision_point || 'The board gives you 3 minutes. Outline your immediate recommendation, capital allocation risk, and trade-offs.'}"
                  </p>
                </div>
              </div>

              {/* Faculty Evaluation Drawer */}
              {isFacultyOrAdmin && selectedStudent && (
                <div className="p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
                  <h3 className="text-base font-serif font-bold text-text flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-accent" /> Grade Cold-Call Participation: {selectedStudent.name}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">
                        Socratic Rigor Rating (1 - 5 Stars)
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setColdCallScore(star)}
                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
                              coldCallScore === star
                                ? "bg-accent text-accent-text shadow-md scale-105"
                                : "bg-primary-soft/50 text-text hover:bg-primary-soft"
                            }`}
                          >
                            {star}★
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted mb-1">
                        Professor's Analytical Observations
                      </label>
                      <input
                        type="text"
                        value={coldCallNotes}
                        onChange={(e) => setColdCallNotes(e.target.value)}
                        placeholder="e.g. Strong grasp of unit economics; pushed on debt covenants"
                        className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={handleRecordColdCall}
                      disabled={isRecordingScore}
                      className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-accent-text text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {isRecordingScore ? "Saving Record..." : "Log Participation Score"}
                    </button>
                    {scoreSuccess && (
                      <span className="text-xs text-success font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Participation score logged successfully!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Cold Call Ledger */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-text flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-accent" /> Socratic Ledger ({session.cold_call_history.length})
                  </h3>
                </div>

                {session.cold_call_history.length === 0 ? (
                  <p className="text-xs text-muted italic py-4 text-center">
                    No cold calls logged yet in this session.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {session.cold_call_history.map((record, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-primary-soft/30 border border-border space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-text">
                            {record.student_name}
                          </span>
                          <span className="font-semibold text-accent">
                            {record.score ? `${record.score}★` : "Evaluated"}
                          </span>
                        </div>
                        {record.notes && (
                          <p className="text-muted italic">
                            "{record.notes}"
                          </p>
                        )}
                        <span className="text-[10px] text-muted block">
                          {new Date(record.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE DILEMMA POLL */}
        {activeTab === "live_poll" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-8 rounded-2xl bg-surface border border-border shadow-sm space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-text text-xs font-bold uppercase tracking-wider">
                  <Vote className="w-4 h-4 text-accent" /> Live Cohort Decision Room
                </div>
                <h2 className="text-xl font-serif font-bold text-text">
                  {session.current_poll.question}
                </h2>
                <div className="flex items-center justify-center gap-3 text-xs text-muted">
                  <span>Phase: <strong className="text-text">{session.current_poll.phase === "before_debate" ? "Pre-Discussion Pulse" : "Post-Debate Consensus"}</strong></span>
                  <span>•</span>
                  <span>Total Cohort Votes: <strong className="text-text">{session.current_poll.total_votes}</strong></span>
                  <span>•</span>
                  <span className={`font-semibold ${session.current_poll.is_open ? "text-success" : "text-warning"}`}>
                    {session.current_poll.is_open ? "Poll Open" : "Poll Closed"}
                  </span>
                </div>
              </div>

              {/* Voting Option Cards with Real-time Distribution */}
              <div className="space-y-4">
                {session.current_poll.options.map((option) => {
                  const percentage =
                    session.current_poll.total_votes > 0
                      ? Math.round((option.votes / session.current_poll.total_votes) * 100)
                      : 0;

                  return (
                    <div
                      key={option.id}
                      className={`relative p-5 rounded-2xl border transition-all overflow-hidden ${
                        selectedVoteOption === option.id
                          ? "border-accent bg-accent/10"
                          : "border-border bg-surface hover:border-border/80"
                      }`}
                    >
                      {/* Animated Background Fill */}
                      <div
                        className="absolute inset-y-0 left-0 bg-accent/15 transition-all duration-700 ease-out"
                        style={{ width: `${percentage}%` }}
                      />

                      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1 max-w-xl">
                          <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                            Option {option.id.replace("opt-", "")}
                          </span>
                          <p className="text-sm font-semibold text-text">
                            {option.text}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-2xl font-black font-mono text-text">
                              {percentage}%
                            </span>
                            <span className="text-xs text-muted block">
                              {option.votes} votes
                            </span>
                          </div>

                          <button
                            onClick={() => handleVote(option.id)}
                            disabled={isVoting || !session.current_poll.is_open}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              selectedVoteOption === option.id
                                ? "bg-accent text-accent-text font-bold"
                                : "bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
                            }`}
                          >
                            {selectedVoteOption === option.id ? "Voted" : "Cast Vote"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Faculty Poll Management Controls */}
              {isFacultyOrAdmin && (
                <div className="p-4 rounded-xl bg-primary-soft/40 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-text">
                    Faculty Poll Controls:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePoll(!session.current_poll.is_open)}
                      className="px-3 py-1.5 rounded-lg bg-primary-soft text-text font-semibold hover:bg-primary-soft/80"
                    >
                      {session.current_poll.is_open ? "Close Poll" : "Open Poll"}
                    </button>
                    <button
                      onClick={() =>
                        handleTogglePoll(
                          true,
                          session.current_poll.phase === "before_debate" ? "after_debate" : "before_debate"
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-accent text-accent-text font-bold hover:bg-accent-hover"
                    >
                      Switch to {session.current_poll.phase === "before_debate" ? "Post-Debate Poll" : "Pre-Discussion Poll"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DIGITAL 3-BOARD PLAN */}
        {activeTab === "board_plan" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-text flex items-center gap-2">
                  <Layout className="w-5 h-5 text-accent" /> Harvard Business School 3-Board Plan
                </h2>
                <p className="text-xs text-muted">
                  Real-time chalkboard plan structured into Protagonist Dilemma, Scenarios, and Implementation Milestones.
                </p>
              </div>

              {isFacultyOrAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAiSuggestBoard}
                    disabled={isSuggestingBoard}
                    className="px-3.5 py-2 rounded-xl bg-primary-soft text-text border border-border font-bold text-xs hover:bg-primary-soft/80 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSuggestingBoard ? "animate-spin" : ""}`} />
                    {isSuggestingBoard ? "Synthesizing..." : "AI Suggest 3-Board Plan"}
                  </button>
                  <button
                    onClick={handleSaveBoardPlan}
                    disabled={isSavingBoard}
                    className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSavingBoard ? "Saving..." : "Save Blackboard"}
                  </button>
                </div>
              )}
            </div>

            {boardSaveSuccess && (
              <div className="p-3 rounded-xl bg-success/10 text-success border border-success/30 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Board plan saved and synchronized with class.
              </div>
            )}

            {/* 3-Board Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* BOARD 1 */}
              <div className="p-5 rounded-2xl bg-primary border-2 border-border text-white space-y-3 shadow-lg flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-xs font-mono font-bold text-on-primary uppercase tracking-widest">
                    BOARD 1: DILEMMA & STAKES
                  </span>
                  <span className="text-[10px] text-white/60">Context</span>
                </div>
                {isFacultyOrAdmin ? (
                  <textarea
                    rows={16}
                    value={board1}
                    onChange={(e) => setBoard1(e.target.value)}
                    className="w-full flex-1 bg-transparent text-xs font-mono text-white/90 focus:outline-none resize-none leading-relaxed"
                    placeholder="Enter board notes for Dilemma, Context, and Stakes..."
                  />
                ) : (
                  <pre className="text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed flex-1">
                    {board1 || "No notes entered for Board 1."}
                  </pre>
                )}
              </div>

              {/* BOARD 2 */}
              <div className="p-5 rounded-2xl bg-primary border-2 border-border text-white space-y-3 shadow-lg flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-xs font-mono font-bold text-on-primary uppercase tracking-widest">
                    BOARD 2: ALTERNATIVES & VALUATION
                  </span>
                  <span className="text-[10px] text-white/60">Analysis</span>
                </div>
                {isFacultyOrAdmin ? (
                  <textarea
                    rows={16}
                    value={board2}
                    onChange={(e) => setBoard2(e.target.value)}
                    className="w-full flex-1 bg-transparent text-xs font-mono text-white/90 focus:outline-none resize-none leading-relaxed"
                    placeholder="Enter board notes for Frameworks, Scenarios, and Financial Models..."
                  />
                ) : (
                  <pre className="text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed flex-1">
                    {board2 || "No notes entered for Board 2."}
                  </pre>
                )}
              </div>

              {/* BOARD 3 */}
              <div className="p-5 rounded-2xl bg-primary border-2 border-border text-white space-y-3 shadow-lg flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-xs font-mono font-bold text-on-primary uppercase tracking-widest">
                    BOARD 3: ACTION PLAN & CONTINGENCY
                  </span>
                  <span className="text-[10px] text-white/60">Execution</span>
                </div>
                {isFacultyOrAdmin ? (
                  <textarea
                    rows={16}
                    value={board3}
                    onChange={(e) => setBoard3(e.target.value)}
                    className="w-full flex-1 bg-transparent text-xs font-mono text-white/90 focus:outline-none resize-none leading-relaxed"
                    placeholder="Enter board notes for 100-Day Milestones, Risks, and Takeaways..."
                  />
                ) : (
                  <pre className="text-xs font-mono text-white/80 whitespace-pre-wrap leading-relaxed flex-1">
                    {board3 || "No notes entered for Board 3."}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
