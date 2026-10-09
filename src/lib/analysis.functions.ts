import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { geminiGenerate } from "./gemini";

export type AnalysisFields = {
  goal: string;
  understood_facts: string[];
  assumptions: string[];
  missing_info: string[];
  contradictions: string[];
  todo_items: string[];
};

const LIST_KEYS = ["understood_facts", "assumptions", "missing_info", "contradictions", "todo_items"] as const;

const SYSTEM = `You are MOMMA, an analyst who reads a user's project context before interviewing them to build a project-specific AI bot.
Return ONLY a JSON object with keys: goal (one or two sentences: what they're building and for whom), understood_facts (clearly stated facts), assumptions (things you inferred that are not explicit), missing_info (open questions the interview must answer), contradictions (conflicting statements; empty if none), todo_items (other concrete interview prompts, phrased as questions to the user; never repeat a missing_info item here).
Each list: 0-8 short plain-language strings. Never invent facts that aren't in or reasonably implied by the context.`;

// Placeholder used when the AI is unreachable.
export function ruleBasedAnalysis(raw: string): AnalysisFields {
  const sentences = raw.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length > 3);
  const lower = raw.toLowerCase();
  const goal = sentences.find((s) => /\b(build|create|make|develop|design)\b/i.test(s)) ?? "Build an AI assistant for this project.";
  const missing: string[] = [];
  if (!/\b(user|customer|audience|client)s?\b/.test(lower)) missing.push("Who will use the bot?");
  if (!/\b(tone|voice|style)\b/.test(lower)) missing.push("What tone should the bot use?");
  if (!/\b(goal|success|metric)\b/.test(lower)) missing.push("How will you know the bot is working well?");
  return {
    goal,
    understood_facts: sentences.slice(0, 8),
    assumptions: /chatbot|assistant/.test(lower) ? [] : ["You want a conversational assistant."],
    missing_info: missing,
    contradictions: [],
    todo_items: [], // the missing_info gaps already become interview questions
  };
}

function clean(v: unknown): AnalysisFields {
  const o = (v ?? {}) as Partial<Record<keyof AnalysisFields, unknown>>;
  const list = (x: unknown) => (Array.isArray(x) ? x.filter((s) => typeof s === "string").map((s) => s.slice(0, 500)).slice(0, 12) : []);
  return {
    goal: typeof o.goal === "string" ? o.goal.slice(0, 1000) : "",
    understood_facts: list(o.understood_facts),
    assumptions: list(o.assumptions),
    missing_info: list(o.missing_info),
    contradictions: list(o.contradictions),
    todo_items: list(o.todo_items),
  };
}

const LIST = { type: "ARRAY", items: { type: "STRING" } };
const SCHEMA = {
  type: "OBJECT",
  properties: { goal: { type: "STRING" }, ...Object.fromEntries(LIST_KEYS.map((k) => [k, LIST])) },
  required: ["goal", ...LIST_KEYS],
};

async function callAI(raw: string): Promise<AnalysisFields | null> {
  const content = await geminiGenerate({
    label: "analysis",
    system: SYSTEM,
    messages: [{ role: "user", content: raw.slice(0, 60000) }],
    json: true,
    schema: SCHEMA,
  });
  if (!content) return null;
  try {
    const out = clean(JSON.parse(content.replace(/^```(json)?|```$/g, "").trim()));
    return out.goal ? out : null;
  } catch (e) {
    console.error("analysis: unparseable AI output", e);
    return null;
  }
}

export const generateAnalysis = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const [proj, ctx, files, prev] = await Promise.all([
      sb.from("projects").select("name, description").eq("id", data.projectId).eq("is_deleted", false).maybeSingle(),
      sb.from("project_contexts").select("text").eq("project_id", data.projectId).maybeSingle(),
      sb.from("project_resources").select("filename, extracted_text").eq("project_id", data.projectId),
      sb.from("project_analyses").select("version").eq("project_id", data.projectId).maybeSingle(),
    ]);
    if (!proj.data) throw new Error("Project not found");
    const raw = [
      `Project name: ${proj.data.name}`,
      proj.data.description && `Description: ${proj.data.description}`,
      ctx.data?.text && `User notes:\n${ctx.data.text}`,
      ...(files.data ?? []).filter((f) => f.extracted_text).map((f) => `File "${f.filename}":\n${f.extracted_text}`),
    ].filter(Boolean).join("\n\n");

    const ai = await callAI(raw);
    const fields = ai ?? ruleBasedAnalysis(raw);
    const version = (prev.data?.version ?? 0) + 1;
    const { error } = await sb.from("project_analyses").upsert(
      { project_id: data.projectId, user_id: context.userId, ...fields, version, confirmed_at: null },
      { onConflict: "project_id" },
    );
    if (error) throw new Error(error.message);
    await sb.from("project_timeline").insert({
      project_id: data.projectId,
      user_id: context.userId,
      type: "analysis_completed",
      details: { version, source: ai ? "ai" : "rules" },
    });
    return { version, source: ai ? "ai" : "rules" };
  });

export { LIST_KEYS };
