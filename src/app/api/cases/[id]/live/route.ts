import { NextRequest, NextResponse } from "next/server";
import { mockStore } from "@/lib/mock-db";
import { authenticateUser } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(request);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;

    // Get case
    const caseStudy = mockStore.getCase(caseId);
    if (!caseStudy) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Get or create session
    const facultyId = user?.role === "faculty" || user?.role === "admin" ? user.id : caseStudy.author_id;
    const session = mockStore.createOrGetClassroomSession(caseId, facultyId);

    // Get students for cold call wheel
    const allProfiles = mockStore.getProfiles();
    const departments = mockStore.getDepartments();
    const students = allProfiles
      .filter((p) => p.role === "student")
      .map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        department: departments.find((d) => d.id === p.department_id)?.name || "General MBA",
      }));

    return NextResponse.json({
      session,
      case: {
        id: caseStudy.id,
        title: caseStudy.title,
        industry: caseStudy.industry,
        function: caseStudy.function,
        decision_point: caseStudy.content.decision_point,
      },
      students,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, errorResponse } = await authenticateUser(request);
    if (errorResponse || !user) {
      return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;
    const body = await request.json().catch(() => ({}));
    const { action } = body;

    const session = mockStore.getClassroomSession(caseId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 1. VOTE IN POLL (Available to all students & authenticated users)
    if (action === "vote") {
      const { optionId } = body;
      if (!optionId) {
        return NextResponse.json({ error: "optionId is required" }, { status: 400 });
      }

      const res = mockStore.submitPollVote(caseId, optionId);
      if (!res.success) {
        return NextResponse.json({ error: res.error || "Failed to submit vote" }, { status: 400 });
      }
      return NextResponse.json({ success: true, session: res.session });
    }

    // 2. FACULTY & ADMIN ACTIONS (Cold calls, poll control, board plan)
    const isAuthorized = user?.role === "faculty" || user?.role === "admin";
    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized: Faculty or Admin only" }, { status: 403 });
    }

    if (action === "cold-call") {
      const { student_id, student_name, score, notes } = body;
      if (!student_id || !student_name) {
        return NextResponse.json({ error: "student_id and student_name are required" }, { status: 400 });
      }

      const updated = mockStore.submitColdCallScore(caseId, {
        student_id,
        student_name,
        score: typeof score === "number" ? Math.max(1, Math.min(5, score)) : undefined,
        notes: notes || "",
        timestamp: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "toggle-poll") {
      const { isOpen, phase } = body;
      const updated = mockStore.togglePollStatus(caseId, !!isOpen, phase);
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "reset-poll") {
      const { question, optionA, optionB, phase } = body;
      if (!question || !optionA || !optionB) {
        return NextResponse.json({ error: "question, optionA and optionB are required" }, { status: 400 });
      }
      const updated = mockStore.resetClassroomPoll(caseId, question, optionA, optionB, phase || "before_debate");
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "update-board") {
      const { board_1_dilemma, board_2_alternatives, board_3_action_plan } = body;
      const updated = mockStore.updateBoardPlan(caseId, {
        board_1_dilemma,
        board_2_alternatives,
        board_3_action_plan,
      });
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "ai-suggest-board") {
      const caseStudy = mockStore.getCase(caseId);
      if (!caseStudy) {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
      }

      // Synthesize Harvard 3-Board Layout
      const frameworks = caseStudy.content.teaching_note?.frameworks || ["Porter's 5 Forces", "SWOT", "DCF"];
      const keyData = caseStudy.content.key_data || [];
      const questions = caseStudy.content.discussion_questions || [];

      const boardPlan = {
        board_1_dilemma: `# 1. PROTAGONIST DILEMMA & STAKES
- Entity: ${caseStudy.title}
- Industry: ${caseStudy.industry} | Function: ${caseStudy.function}
- Core Dilemma: ${caseStudy.content.decision_point}
- Key Stakes:
  * Short-term: Preserving operating margin and stakeholder trust
  * Long-term: Defending market position against agile disruptors
- Classroom Cold-Call Prompt:
  > "You are the protagonist. The board demands a decision in 3 minutes. What is your call?"`,
        board_2_alternatives: `# 2. STRATEGIC SCENARIOS & VALUATION
### Scenario Alpha: Aggressive Direct Investment
- Strategic Framework: ${frameworks[0] || "Core Competency Theory"}
- Capital Exposure: High CapEx, first-mover advantage
- Critical Metric: ${keyData[0] ? `${keyData[0].metric}: ${keyData[0].value}` : "IRR > 20%"}

### Scenario Beta: Phased Strategic Alliance
- Strategic Framework: ${frameworks[1] || "Real Options Valuation"}
- Downside Protection: Contractual risk-sharing
- Critical Metric: ${keyData[1] ? `${keyData[1].metric}: ${keyData[1].value}` : "Payback Period < 3 Years"}`,
        board_3_action_plan: `# 3. ACTION PLAN & IMPLEMENTATION
### 100-Day Milestones
1. Day 1 - 30: Executive alignment, customer council briefings
2. Day 31 - 60: Pilot milestone sign-off, capital disbursement
3. Day 61 - 100: KPI dashboard review against benchmark:
   ${questions[0] || "Validate strategic assumptions against real market feedback"}

### Risk Contingencies
- Trigger: If milestone variance > 15%, pivot to secondary joint-venture hedging.`,
      };

      const updated = mockStore.updateBoardPlan(caseId, boardPlan);
      return NextResponse.json({ success: true, session: updated });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
