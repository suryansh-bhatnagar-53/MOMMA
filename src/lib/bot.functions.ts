import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { llmGenerate, llmGenerateWithMeta } from "./llm";
import { allow } from "./rate-limit";
import { BOT_TEMPERATURE, botInstructions, composeInstructions, readExamples, readKnowledge, ruleBasedBot, type FewShot, type KnowledgePack } from "./bot";

const SYSTEM = `You are MOMMA's bot architect. From the project material, write the configuration for a project-specific AI assistant.
Return ONLY JSON with:
- system_prompt: markdown addressed to the bot ("You are ..."): its role, audience, tone and boundaries. Do not copy the facts into it. Never tell the bot to "always" emphasise a topic; say "when relevant".
- audience: who talks to the bot. Take it from the interview answer about who the bot is for; if none, infer from context and add an open question asking to confirm it.
- responsibilities: what the bot should do for that audience.
- facts: short self-contained statements the bot may rely on.
  - source: "interview" when it comes from an interview answer, otherwise "context". Interview answers override conflicting context.
  - status: "implemented" only if the material says it already exists or works; "planned" for designs, requirements, intentions and anything the project "will" or "must" do; "unknown" if unclear. A requirement (e.g. "must comply with X") is planned, never implemented.
  - Every interview answer must appear as one or more facts, or as an open question if the answer was "don't know".
- out_of_scope: requests the bot should decline or redirect.
- open_questions: things still unknown that the bot must not guess.
- escalation: what the bot should tell people it can't help (who or where to contact). Empty string if never stated.
- examples: 4-6 short user/assistant exchanges. Each assistant reply may ONLY state what the cited facts say: no extra details, numbers, mechanisms, standards or names, and planned facts described as planned. "facts" lists the 1-based fact numbers the reply relies on. Include at least one example where the bot says an open question is unknown and one where it declines an out-of-scope request (these may cite no facts).
Never add facts that are not in, or clearly implied by, the material.`;

const TEXT = { type: "STRING" };
const LIST = { type: "ARRAY", items: TEXT };
const SCHEMA = {
  type: "OBJECT",
  properties: {
    system_prompt: TEXT,
    audience: TEXT,
    responsibilities: LIST,
    facts: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          statement: TEXT,
          source: { type: "STRING", enum: ["context", "interview"] },
          status: { type: "STRING", enum: ["implemented", "planned", "unknown"] },
        },
        required: ["statement", "source", "status"],
      },
    },
    out_of_scope: LIST,
    open_questions: LIST,
    escalation: TEXT,
    examples: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { user: TEXT, assistant: TEXT, facts: { type: "ARRAY", items: { type: "INTEGER" } } },
        required: ["user", "assistant", "facts"],
      },
    },
  },
  required: ["system_prompt", "audience", "responsibilities", "facts", "out_of_scope", "open_questions", "escalation", "examples"],
};

// Second pass: models copy details from examples into real answers, so an example that states
// anything beyond the knowledge pack is dropped rather than shipped.
const VERIFY = `You check example conversations for a bot against its knowledge pack.
For each example, list every factual claim in the assistant reply that is NOT supported by the numbered facts. Paraphrase is fine. A claim is unsupported if it adds details, numbers, mechanisms, standards, names or scope beyond the facts; if it broadens a fact with words like "all", "every", "always", "fully" or "any" that the fact does not use; if it combines two facts into a relationship neither states; or if it presents a "planned" or "unknown" fact as already available, compliant or certified. Saying something is unknown, declining an out-of-scope request, or pointing to the escalation contact is supported.
Return JSON: results, one entry per example in order, with index (0-based), supported (true only if there are no unsupported claims) and unsupported_claims.`;
const VERIFY_SCHEMA = {
  type: "OBJECT",
  properties: {
    results: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { index: { type: "INTEGER" }, supported: { type: "BOOLEAN" }, unsupported_claims: LIST },
        required: ["index", "supported", "unsupported_claims"],
      },
    },
  },
  required: ["results"],
};

async function groundedExamples(knowledge: KnowledgePack, examples: FewShot[]): Promise<{ kept: FewShot[]; by: string | null }> {
  if (!examples.length) return { kept: [], by: null };
  const res = await llmGenerateWithMeta({
    label: "verifyExamples",
    system: VERIFY,
    messages: [{ role: "user", content: JSON.stringify({ knowledge: composeInstructions("", knowledge, []), examples }) }],
    json: true,
    schema: VERIFY_SCHEMA,
    temperature: 0,
  });
  if (!res) return { kept: [], by: null }; // unverified examples are riskier than none
  const by = `${res.provider}/${res.model}`;
  try {
    const { results } = JSON.parse(res.text) as { results?: { index: number; supported: boolean; unsupported_claims?: string[] }[] };
    const ok = new Set((results ?? []).filter((r) => r.supported && !r.unsupported_claims?.length).map((r) => r.index));
    return { kept: examples.filter((_, i) => ok.has(i)), by };
  } catch {
    return { kept: [], by };
  }
}

const listText = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").map((x) => `- ${x}`).join("\n") : "");

export const generateBot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ projectId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const id = data.projectId;
    const [proj, analysis, questions, ctx, files, latest] = await Promise.all([
      sb.from("projects").select("name, description, status").eq("id", id).eq("is_deleted", false).maybeSingle(),
      sb.from("project_analyses").select("*").eq("project_id", id).maybeSingle(),
      sb.from("interview_questions").select("text, answer_text, round, ord").eq("project_id", id).not("answer_text", "is", null).order("round").order("ord"),
      sb.from("project_contexts").select("text").eq("project_id", id).maybeSingle(),
      sb.from("project_resources").select("filename, extracted_text").eq("project_id", id),
      sb.from("bot_versions").select("version").eq("project_id", id).order("version", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (!proj.data) throw new Error("Project not found");
    if (proj.data.status !== "Ready" && proj.data.status !== "Generated") throw new Error("Finish the interview first");
    const a = analysis.data;
    if (!a?.confirmed_at) throw new Error("Analysis not confirmed");
    const answered = questions.data ?? [];

    // Validated knowledge first (analysis + interview), raw material last so truncation drops it first.
    const material = [
      `Project name: ${proj.data.name}`,
      proj.data.description && `Description: ${proj.data.description}`,
      `Goal: ${a.goal}`,
      `Understood facts:\n${listText(a.understood_facts)}`,
      `Assumptions (may have been corrected in the interview):\n${listText(a.assumptions)}`,
      answered.length && `Interview answers (authoritative):\n${answered.map((q) => `Q: ${q.text}\nA: ${q.answer_text}`).join("\n\n")}`,
      ctx.data?.text && `User notes:\n${ctx.data.text}`,
      ...(files.data ?? []).filter((f) => f.extracted_text).map((f) => `File "${f.filename}":\n${f.extracted_text}`),
    ]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 60000);

    let source: "ai" | "rules" = "rules";
    let bot = ruleBasedBot(proj.data.name, a, answered);
    let dropped = 0;
    const res = await llmGenerateWithMeta({
      label: "generateBot",
      system: SYSTEM,
      messages: [{ role: "user", content: material }],
      json: true,
      schema: SCHEMA,
      temperature: 0.3,
    });
    if (res) {
      try {
        const o = JSON.parse(res.text.replace(/^```(json)?|```$/g, "").trim()) as Partial<Record<"system_prompt" | "examples", unknown>>;
        const prompt = typeof o.system_prompt === "string" ? o.system_prompt.trim().slice(0, 12000) : "";
        if (prompt) {
          const drafted = readExamples(o.examples);
          const checked = await groundedExamples({ ...readKnowledge(o), goal: a.goal }, drafted);
          dropped = drafted.length - checked.kept.length;
          // Provenance: which provider/model wrote the bot and which checked its examples (can differ
          // when the router falls back mid-generation).
          const knowledge = {
            ...readKnowledge(o),
            goal: a.goal,
            generated_by: { bot: `${res.provider}/${res.model}`, examples_checked_by: checked.by },
          };
          bot = { system_prompt: prompt, knowledge, examples: checked.kept };
          source = "ai";
        }
      } catch (e) {
        console.error("generateBot: unparseable AI output", e);
      }
    }

    const version = (latest.data?.version ?? 0) + 1;
    const { error } = await sb.from("bot_versions").insert({
      project_id: id,
      user_id: context.userId,
      version,
      analysis_version: a.version,
      system_prompt: bot.system_prompt,
      knowledge_pack: bot.knowledge,
      few_shot_examples: bot.examples,
      source,
    });
    if (error) throw new Error(error.message);
    await sb.from("projects").update({ status: "Generated" }).eq("id", id);
    await sb.from("project_timeline").insert({ project_id: id, user_id: context.userId, type: "bot_generated", details: { version, source, dropped_examples: dropped } });
    return { version, source, dropped };
  });

// Per-user limit for the test chat, which runs on the project's own API keys.
const CHAT_LIMIT = 30;
const CHAT_WINDOW_MS = 10 * 60 * 1000;

export const chatWithBot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z
      .object({
        projectId: z.string().uuid(),
        version: z.number().int().positive(),
        messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) })).min(1).max(20),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    if (!allow(`bot-chat:${context.userId}`, CHAT_LIMIT, CHAT_WINDOW_MS)) return { reply: null, limited: true };

    const { data: bot, error } = await context.supabase
      .from("bot_versions")
      .select("*")
      .eq("project_id", data.projectId)
      .eq("version", data.version)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!bot) throw new Error("Bot not found");
    const reply = await llmGenerate({ label: "chatWithBot", system: botInstructions(bot), messages: data.messages, temperature: BOT_TEMPERATURE });
    return { reply, limited: false };
  });
