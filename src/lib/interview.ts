import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type InterviewQuestion = Database["public"]["Tables"]["interview_questions"]["Row"];
export type InterviewSession = Database["public"]["Tables"]["interview_sessions"]["Row"];

// Rule-based interview engine. Gap order: missing_info → contradictions → assumptions → todo_items.
const SOURCES = ["missing_info", "contradictions", "assumptions", "todo_items"] as const;
type Analysis = Partial<Record<(typeof SOURCES)[number], unknown>>;

const VAGUE = ["maybe", "perhaps", "i think", "sort of", "kind of", "something like", "stuff", "things", "not sure", "idk", "dunno"];

function phrase(source: (typeof SOURCES)[number], item: string) {
  const t = item.replace(/[.?!]+$/, "");
  switch (source) {
    case "missing_info":
      return `MOMMA couldn't find this in your context: "${t}". Can you fill it in?`;
    case "contradictions":
      return `These seem to conflict: "${t}". Which is right, and why?`;
    case "assumptions":
      return `MOMMA assumed: "${t}". Is that correct? If not, what's true instead?`;
    default:
      return /\?$/.test(item.trim()) ? item.trim() : `${t} — what should MOMMA know about this?`;
  }
}

export function needsFollowup(answer: string) {
  const a = answer.trim().toLowerCase().replace(/\s+/g, " ");
  if (a.length < 15) return true;
  if (VAGUE.some((v) => a.includes(v))) return true;
  return !/\b[a-z]{3,}\b/.test(a);
}

export const interviewApi = {
  async load(projectId: string) {
    const [s, q] = await Promise.all([
      supabase.from("interview_sessions").select("*").eq("project_id", projectId).maybeSingle(),
      supabase.from("interview_questions").select("*").eq("project_id", projectId).order("ord"),
    ]);
    if (s.error) throw s.error;
    if (q.error) throw q.error;
    return { session: s.data, questions: q.data };
  },

  async start(projectId: string, analysis: Analysis) {
    const rows: { project_id: string; ord: number; text: string; kind: string; source: string }[] = [];
    for (const src of SOURCES) {
      const list = Array.isArray(analysis[src]) ? (analysis[src] as unknown[]) : [];
      for (const item of list) {
        if (typeof item === "string" && item.trim())
          rows.push({ project_id: projectId, ord: rows.length, text: phrase(src, item), kind: "gap", source: src });
      }
    }
    if (rows.length === 0)
      rows.push({ project_id: projectId, ord: 0, text: "Is there anything else MOMMA should know before building your bot?", kind: "gap", source: "general" });
    const { error: se } = await supabase.from("interview_sessions").insert({ project_id: projectId });
    if (se) throw se;
    const { error } = await supabase.from("interview_questions").insert(rows);
    if (error) throw error;
    await supabase.from("project_timeline").insert({ project_id: projectId, type: "interview_started", details: { questions: rows.length } });
  },

  async answer(q: InterviewQuestion, text: string, nextOrd: number | null) {
    const vague = q.kind === "gap" && needsFollowup(text);
    const { error } = await supabase
      .from("interview_questions")
      .update({ answer_text: text.trim(), is_clarification_needed: vague, answered_at: new Date().toISOString() })
      .eq("id", q.id);
    if (error) throw error;
    if (vague) {
      const ord = nextOrd === null ? q.ord + 1 : (q.ord + nextOrd) / 2;
      const short = text.trim().length > 80 ? `${text.trim().slice(0, 80)}…` : text.trim();
      const { error: fe } = await supabase.from("interview_questions").insert({
        project_id: q.project_id,
        ord,
        text: `I'd like to understand this better. Can you give a concrete example or more detail about "${short}"?`,
        kind: "followup",
        source: q.source,
      });
      if (fe) throw fe;
    }
    return vague;
  },

  async setPaused(projectId: string, is_paused: boolean) {
    const { error } = await supabase.from("interview_sessions").update({ is_paused }).eq("project_id", projectId);
    if (error) throw error;
  },

  async confirm(projectId: string, answered: number) {
    const { error } = await supabase
      .from("interview_sessions")
      .update({ ended_at: new Date().toISOString(), is_paused: false })
      .eq("project_id", projectId);
    if (error) throw error;
    const { error: pe } = await supabase.from("projects").update({ status: "Ready" }).eq("id", projectId);
    if (pe) throw pe;
    await supabase.from("project_timeline").insert({ project_id: projectId, type: "interview_confirmed", details: { answered } });
  },
};
