"use client";

import { useEffect, useState } from "react";
import { PractitionerReflection, Profile } from "@/lib/types";
import { COLLEGE_SHORT } from "@/config/college";
import {
  Briefcase,
  ThumbsUp,
  Award,
  CheckCircle2,
  Building,
  Plus,
  Send,
  MessageSquare,
} from "lucide-react";

export function PractitionerReflectionsSection({
  caseId,
  currentUser,
}: {
  caseId: string;
  currentUser: Profile | null;
}) {
  const [reflections, setReflections] = useState<PractitionerReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [alumniTitle, setAlumniTitle] = useState("");
  const [company, setCompany] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [practicalTakeaway, setPracticalTakeaway] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadReflections = () => {
    fetch(`/api/cases/${caseId}/reflections`)
      .then((res) => res.json())
      .then((data) => {
        if (data.reflections) setReflections(data.reflections);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReflections();
  }, [caseId]);

  const handleUpvote = async (reflectionId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/reflections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upvote", reflectionId }),
      });
      const data = await res.json();
      if (data.success) {
        setReflections((prev) =>
          prev.map((r) => (r.id === reflectionId ? { ...r, upvotes: data.upvotes } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText || !practicalTakeaway) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/cases/${caseId}/reflections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          alumni_title: alumniTitle,
          company,
          reflection_text: reflectionText,
          practical_takeaway: practicalTakeaway,
        }),
      });
      const data = await res.json();
      if (data.success && data.reflection) {
        setReflections((prev) => [data.reflection, ...prev]);
        setShowAddForm(false);
        setReflectionText("");
        setPracticalTakeaway("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPost =
    currentUser?.role === "faculty" ||
    currentUser?.role === "admin";

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-3.5 h-3.5 text-accent" /> Executive in Residence Network
          </div>
          <h3 className="text-xl font-serif font-bold text-text">
            Alumni Practitioner Reflections ({reflections.length})
          </h3>
          <p className="text-xs text-muted">
            Real-world executive debriefs on how this strategic dilemma transpired in corporate practice.
          </p>
        </div>

        {canPost && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold text-xs transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Share Practitioner Perspective
          </button>
        )}
      </div>

      {submitSuccess && (
        <div className="p-3 rounded-xl bg-success/10 text-success text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Your practitioner perspective was published to the {COLLEGE_SHORT} network!
        </div>
      )}

      {/* Add Reflection Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateReflection}
          className="p-5 rounded-2xl bg-primary-soft/30 border border-border space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-serif font-bold text-text flex items-center gap-1.5">
              <Award className="w-4 h-4 text-accent" /> Executive Practitioner Commentary
            </h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-muted hover:text-text"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Alumni Job Title / Class
              </label>
              <input
                type="text"
                required
                value={alumniTitle}
                onChange={(e) => setAlumniTitle(e.target.value)}
                placeholder="e.g. Managing Director, Private Equity / MBA '18"
                className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Bain & Company / Google"
                className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Real-World Executive Reflection
            </label>
            <textarea
              required
              rows={4}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="How did you encounter this strategic dilemma in corporate practice? What trade-offs or hidden risks surprised the executive team?"
              className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted mb-1">
              Core Strategic Takeaway for Students
            </label>
            <input
              type="text"
              required
              value={practicalTakeaway}
              onChange={(e) => setPracticalTakeaway(e.target.value)}
              placeholder="e.g. Never rely solely on projected synergies; structure contracts with phased milestone gates."
              className="w-full text-xs px-3 py-2 rounded-lg bg-surface border border-border text-text focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-accent-text font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting ? "Publishing Reflection..." : "Publish to Case Dossier"}
          </button>
        </form>
      )}

      {/* Reflections Feed */}
      {loading ? (
        <div className="py-8 text-center text-xs text-muted">Loading reflections...</div>
      ) : reflections.length === 0 ? (
        <div className="py-8 text-center text-muted space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto stroke-1" />
          <p className="text-xs">No practitioner reflections submitted yet for this case study.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reflections.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-primary-soft/20 border border-border space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary text-on-primary font-serif font-black text-sm flex items-center justify-center">
                    {r.alumni_name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text">
                        {r.alumni_name}
                      </span>
                      {r.is_verified_alumni && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-info/10 text-info text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Verified GSB Alumni
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted">
                      {r.alumni_title} • <span className="font-semibold text-text">{r.company}</span>
                    </p>
                  </div>
                </div>

                {/* Upvote Button */}
                <button
                  onClick={() => handleUpvote(r.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-text hover:border-accent hover:text-accent transition-all self-start sm:self-auto"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{r.upvotes}</span>
                </button>
              </div>

              <p className="text-xs text-text leading-relaxed">
                "{r.reflection_text}"
              </p>

              <div className="p-3 rounded-xl bg-primary-soft/50 border border-border text-xs">
                <span className="font-bold text-primary">Executive Takeaway: </span>
                <span className="text-text italic">{r.practical_takeaway}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
