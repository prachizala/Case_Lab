/**
 * SBS CaseLab - CE Case Pack Feedback In-Memory & Audit Store
 */

export interface CasePackFeedback {
  id: string;
  case_id: string;
  case_title?: string;
  user_id: string;
  user_name: string;
  user_email: string;
  department: "finance" | "hr" | "marketing";
  rating: number; // 1-5
  flagged_issues: string[];
  comments?: string;
  promote_to_gold: boolean;
  status: "submitted" | "under_review" | "promoted" | "rejected";
  created_at: string;
}

// Initial seed feedbacks to demonstrate dashboard metrics
const initialFeedbacks: CasePackFeedback[] = [
  {
    id: "fb-001",
    case_id: "gold-fin-shakti-001",
    case_title: "Financing Growth at Shakti Engineering Ltd.",
    user_id: "usr-faculty-1",
    user_name: "Ms. Reena Paswan",
    user_email: "reena.paswan@shantibschool.edu.in",
    department: "finance",
    rating: 5,
    flagged_issues: [],
    comments: "Outstanding case design. Meets all SBS continuous evaluation requirements with realistic working capital numbers.",
    promote_to_gold: true,
    status: "promoted",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "fb-002",
    case_id: "case-hr-sample-01",
    case_title: "Talent Retention Dilemma at TechNova",
    user_id: "usr-faculty-2",
    user_name: "Dr. K. V. Sharma",
    user_email: "kv.sharma@shantibschool.edu.in",
    department: "hr",
    rating: 4,
    flagged_issues: ["minor_formatting"],
    comments: "The attrition metrics table is great. Model answer has clear theoretical backing with Herzberg's theory.",
    promote_to_gold: true,
    status: "under_review",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "fb-003",
    case_id: "case-mkt-sample-01",
    case_title: "PureDrop Organic Beverages D2C Entry",
    user_id: "usr-faculty-1",
    user_name: "Ms. Reena Paswan",
    user_email: "reena.paswan@shantibschool.edu.in",
    department: "marketing",
    rating: 4,
    flagged_issues: ["rubric_weightage"],
    comments: "Very practical pricing matrix. Need higher marks allocated for the positioning statement template.",
    promote_to_gold: false,
    status: "submitted",
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

class CasePackFeedbackStore {
  private feedbacks: CasePackFeedback[] = [...initialFeedbacks];

  addFeedback(item: Omit<CasePackFeedback, "id" | "status" | "created_at">): CasePackFeedback {
    const newFeedback: CasePackFeedback = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      status: item.promote_to_gold ? "under_review" : "submitted",
      created_at: new Date().toISOString(),
      ...item,
    };
    this.feedbacks.unshift(newFeedback);
    return newFeedback;
  }

  getFeedbacks(): CasePackFeedback[] {
    return [...this.feedbacks];
  }

  updateStatus(id: string, status: CasePackFeedback["status"]): CasePackFeedback | undefined {
    const target = this.feedbacks.find((f) => f.id === id);
    if (target) {
      target.status = status;
      return { ...target };
    }
    return undefined;
  }

  getMetrics() {
    const total = this.feedbacks.length;
    const depts: ("finance" | "hr" | "marketing")[] = ["finance", "hr", "marketing"];
    
    const avgByDept: Record<string, number> = {};
    for (const d of depts) {
      const items = this.feedbacks.filter((f) => f.department === d);
      avgByDept[d] = items.length
        ? Number((items.reduce((acc, curr) => acc + curr.rating, 0) / items.length).toFixed(1))
        : 0;
    }

    const overallAvg = total
      ? Number((this.feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1))
      : 0;

    const issueCounts: Record<string, number> = {};
    for (const fb of this.feedbacks) {
      for (const issue of fb.flagged_issues) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      }
    }

    const goldCandidates = this.feedbacks.filter((f) => f.promote_to_gold);

    return {
      total,
      overallAvg,
      avgByDept,
      issueCounts,
      goldCandidatesCount: goldCandidates.length,
      goldCandidates,
      goldExamplesStatus: {
        finance: {
          title: "Financing Growth at Shakti Engineering Ltd.",
          status: "approved",
          file: "reference/gold/finance_approved.json",
        },
        hr: {
          title: "Resolving Attrition and Engagement Crisis at NexaCorp BPO",
          status: "pending_approval",
          file: "reference/gold/hr_pending.json",
        },
        marketing: {
          title: "D2C Market Entry and Positioning for Vedika Herbals",
          status: "pending_approval",
          file: "reference/gold/marketing_pending.json",
        },
      },
    };
  }
}

export const feedbackStore = new CasePackFeedbackStore();
