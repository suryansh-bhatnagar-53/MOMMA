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

// Word set of a gap, ignoring case, punctuation and an "Ask:" prefix.
function words(item: string) {
  return new Set(item.toLowerCase().replace(/^\s*ask\s*:/, "").match(/[a-z0-9']+/g) ?? []);
}

// The same gap often appears in several lists (e.g. missing_info and todo_items), so skip an item
// that shares at least 80% of its words with one already asked.
function isRepeat(seen: Set<string>[], w: Set<string>) {
  return seen.some((s) => {
    const shared = [...w].filter((x) => s.has(x)).length;
    return shared / (s.size + w.size - shared || 1) >= 0.8;
  });
}

// Round 1 asks about every gap. Later rounds pass the previous confirmed analysis, whose gaps were
// already covered, so only gaps that are new in this version become questions (delta interviewing).
function buildQuestions(projectId: string, round: number, analysis: Analysis, previous?: Analysis) {
  const rows: { project_id: string; round: number; ord: number; text: string; kind: string; source: string }[] = [];
  const seen: Set<string>[] = [];
  const items = (a: Analysis, src: (typeof SOURCES)[number]) =>
    (Array.isArray(a[src]) ? (a[src] as unknown[]) : []).filter((x): x is string => typeof x === "string" && !!x.trim());
  if (previous) for (const src of SOURCES) for (const item of items(previous, src)) seen.push(words(item));
  for (const src of SOURCES) {
    for (const item of items(analysis, src)) {
      const w = words(item);
      if (isRepeat(seen, w)) continue;
      seen.push(w);
      rows.push({ project_id: projectId, round, ord: rows.length, text: phrase(src, item), kind: "gap", source: src });
    }
  }
  if (rows.length === 0)
    rows.push({
      project_id: projectId,
      round,
      ord: 0,
      text: previous
        ? "MOMMA found no new gaps since your last confirmed version. Is there anything about your changes it should know?"
        : "Is there anything else MOMMA should know before building your bot?",
      kind: "gap",
      source: "general",
    });
  return rows;
}

export const interviewApi = {
  // `session` is the latest round; `questions` covers every round, so earlier answers stay visible.
  async load(projectId: string) {
    const [s, q] = await Promise.all([
      supabase.from("interview_sessions").select("*").eq("project_id", projectId).order("round"),
      supabase.from("interview_questions").select("*").eq("project_id", projectId).order("round").order("ord"),
    ]);
    if (s.error) throw s.error;
    if (q.error) throw q.error;
    return { session: s.data.at(-1) ?? null, questions: q.data };
  },

  // Starts the next round (or finishes a half-started one). Safe to call again after a partial
  // failure: questions are only created if the round has none, and the session insert ignores an existing row.
  async start(projectId: string, analysis: Analysis, version: number) {
    const { data: sessions, error: le } = await supabase
      .from("interview_sessions")
      .select("round, ended_at, analysis_version")
      .eq("project_id", projectId)
      .order("round");
    if (le) throw le;
    const latest = sessions.at(-1);
    const round = latest && !latest.ended_at ? latest.round : (latest?.round ?? 0) + 1;
    const prior = sessions.find((x) => x.round === round - 1);

    const { count, error: ce } = await supabase
      .from("interview_questions")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("round", round);
    if (ce) throw ce;
    if (!count) {
      let previous: Analysis | undefined;
      if (prior?.analysis_version != null) {
        const { data, error } = await supabase
          .from("project_analysis_versions")
          .select("*")
          .eq("project_id", projectId)
          .eq("version", prior.analysis_version)
          .maybeSingle();
        if (error) throw error;
        previous = data ?? undefined;
      }
      const rows = buildQuestions(projectId, round, analysis, previous);
      const { error } = await supabase.from("interview_questions").insert(rows);
      if (error) throw error;
      await supabase.from("project_timeline").insert({ project_id: projectId, type: "interview_started", details: { round, questions: rows.length } });
    }
    const { error: se } = await supabase
      .from("interview_sessions")
      .upsert({ project_id: projectId, round, analysis_version: version }, { onConflict: "project_id,round", ignoreDuplicates: true });
    if (se) throw se;
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
        round: q.round,
        ord,
        text: `I'd like to understand this better. Can you give a concrete example or more detail about "${short}"?`,
        kind: "followup",
        source: q.source,
      });
      if (fe) throw fe;
    }
    return vague;
  },

  async setPaused(projectId: string, round: number, is_paused: boolean) {
    const { error } = await supabase.from("interview_sessions").update({ is_paused }).eq("project_id", projectId).eq("round", round);
    if (error) throw error;
  },

  async confirm(projectId: string, round: number, answered: number) {
    const { error } = await supabase
      .from("interview_sessions")
      .update({ ended_at: new Date().toISOString(), is_paused: false })
      .eq("project_id", projectId)
      .eq("round", round);
    if (error) throw error;
    const { error: pe } = await supabase.from("projects").update({ status: "Ready" }).eq("id", projectId);
    if (pe) throw pe;
    await supabase.from("project_timeline").insert({ project_id: projectId, type: "interview_confirmed", details: { round, answered } });
  },
};
