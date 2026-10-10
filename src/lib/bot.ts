// Generated bot package: shared by the generator (server), the test chat (server) and the
// download (browser). composeInstructions() is mirrored line-for-line by compose() in the Python
// runner below, so the downloaded bot behaves exactly like the one in the test chat.
import type { Database } from "@/integrations/supabase/types";

export type BotVersion = Database["public"]["Tables"]["bot_versions"]["Row"];
export type FactStatus = "implemented" | "planned" | "unknown";
export type KnowledgeFact = { statement: string; source: "context" | "interview"; status?: FactStatus };
export type KnowledgePack = {
  goal: string;
  audience: string;
  responsibilities: string[];
  facts: KnowledgeFact[];
  out_of_scope: string[];
  open_questions: string[];
  escalation: string;
};
// `facts` holds the 1-based fact numbers the example relies on (used for grounding checks).
export type FewShot = { user: string; assistant: string; facts?: number[] };
const STATUSES: FactStatus[] = ["implemented", "planned", "unknown"];

export const RUNNER_MODEL = "gemini-3-flash-preview";
export const BOT_TEMPERATURE = 0.2; // same in the test chat and the runner

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strList = (v: unknown, max = 20) =>
  (Array.isArray(v) ? v : []).map((x) => str(x, 500)).filter(Boolean).slice(0, max);

export function readKnowledge(v: unknown): KnowledgePack {
  const o = (v ?? {}) as Partial<Record<keyof KnowledgePack, unknown>>;
  const facts = (Array.isArray(o.facts) ? o.facts : [])
    .map((f) => {
      const x = (f ?? {}) as Partial<Record<keyof KnowledgeFact, unknown>>;
      const fact: KnowledgeFact = { statement: str(x.statement, 500), source: x.source === "interview" ? "interview" : "context" };
      if (STATUSES.includes(x.status as FactStatus)) fact.status = x.status as FactStatus;
      return fact;
    })
    .filter((f) => f.statement)
    .slice(0, 60);
  return {
    goal: str(o.goal, 1000),
    audience: str(o.audience, 500),
    responsibilities: strList(o.responsibilities),
    facts,
    out_of_scope: strList(o.out_of_scope),
    open_questions: strList(o.open_questions),
    escalation: str(o.escalation, 500),
  };
}

export function readExamples(v: unknown): FewShot[] {
  return (Array.isArray(v) ? v : [])
    .map((e) => {
      const x = (e ?? {}) as Partial<Record<keyof FewShot, unknown>>;
      const facts = (Array.isArray(x.facts) ? x.facts : []).filter((n): n is number => Number.isInteger(n) && n > 0);
      return { user: str(x.user, 1000), assistant: str(x.assistant, 2000), ...(facts.length && { facts }) };
    })
    .filter((e) => e.user && e.assistant)
    .slice(0, 8);
}

export function composeInstructions(prompt: string, kp: KnowledgePack, examples: FewShot[]) {
  const parts = [prompt.trim()];
  const k = ["## Project knowledge"];
  if (kp.goal) k.push(`Goal: ${kp.goal}`);
  if (kp.audience) k.push(`Audience: ${kp.audience}`);
  if (kp.responsibilities.length) k.push("Your job:", ...kp.responsibilities.map((x) => `- ${x}`));
  if (kp.facts.length)
    k.push(
      "Facts you can rely on (a 'planned' fact is not built yet: describe it as planned, never as available or certified):",
      ...kp.facts.map((f, i) => `${i + 1}. ${f.statement} [${f.source}${f.status ? `; ${f.status}` : ""}]`),
    );
  if (kp.out_of_scope.length) k.push("Out of scope (politely decline or redirect):", ...kp.out_of_scope.map((x) => `- ${x}`));
  if (kp.open_questions.length)
    k.push("Still unknown (say you don't know; never guess):", ...kp.open_questions.map((x) => `- ${x}`));
  k.push(`If you can't help: ${kp.escalation || "say so plainly and suggest contacting the project team."}`);
  parts.push(k.join("\n"));
  if (examples.length)
    parts.push(
      ["## Example conversations (style reference only)", ...examples.map((e) => `User: ${e.user}\nAssistant: ${e.assistant}`)].join("\n\n"),
    );
  return parts.join("\n\n");
}

// Which provider/model wrote the bot and checked its examples (absent on bots made before the router).
export function generatedBy(bot: BotVersion): { bot?: string; examples_checked_by?: string | null } | null {
  const g = (bot.knowledge_pack as { generated_by?: unknown } | null)?.generated_by;
  return g && typeof g === "object" ? (g as { bot?: string; examples_checked_by?: string | null }) : null;
}

export function botInstructions(bot: BotVersion) {
  return composeInstructions(bot.system_prompt, readKnowledge(bot.knowledge_pack), readExamples(bot.few_shot_examples));
}

// Used when the AI is unreachable: a plain prompt over the validated facts, no examples.
export function ruleBasedBot(
  name: string,
  analysis: { goal: string; understood_facts: unknown },
  answered: { text: string; answer_text: string | null }[],
) {
  const knowledge: KnowledgePack = {
    goal: analysis.goal,
    audience: "",
    responsibilities: [],
    facts: [
      ...strList(analysis.understood_facts, 40).map((statement) => ({ statement, source: "context" as const })),
      ...answered.map((q) => ({ statement: `Q: ${q.text} A: ${q.answer_text ?? ""}`.slice(0, 500), source: "interview" as const })),
    ],
    out_of_scope: [],
    open_questions: [],
    escalation: "",
  };
  const system_prompt = `You are the assistant for "${name}". ${analysis.goal}

Answer using only the project knowledge below. If something isn't covered, say you don't know and suggest asking the project team. Never invent policies, prices, dates or names.`;
  return { system_prompt, knowledge, examples: [] as FewShot[] };
}

// ---------- package files ----------

export function packageFiles(projectName: string, bot: BotVersion): Record<string, string> {
  const kp = readKnowledge(bot.knowledge_pack);
  return {
    "README.md": readme(projectName, bot),
    "system_prompt.md": bot.system_prompt.trim() + "\n",
    "knowledge_pack.json":
      JSON.stringify(
        {
          ...kp,
          built_from: {
            bot_version: bot.version,
            analysis_version: bot.analysis_version,
            generated_at: bot.created_at,
            generated_by: generatedBy(bot) ?? (bot.source === "rules" ? "rules (no AI)" : "unknown"),
          },
        },
        null,
        2,
      ) + "\n",
    "few_shot_examples.json":
      JSON.stringify(
        {
          _note:
            bot.source === "ai"
              ? "Illustrative conversations written by the AI from your interview answers. They are not real transcripts; edit or delete freely."
              : "No examples: this version was built without the AI.",
          examples: readExamples(bot.few_shot_examples),
        },
        null,
        2,
      ) + "\n",
    "run_bot.py": RUNNER,
  };
}

function readme(projectName: string, bot: BotVersion) {
  return `# ${projectName} bot (version ${bot.version})

Generated by MOMMA on ${new Date(bot.created_at).toLocaleString()}${bot.source === "rules" ? " without the AI (basic version)" : ""}.

## Files
- \`system_prompt.md\`: the bot's role, tone and rules.
- \`knowledge_pack.json\`: facts the bot may rely on. Each fact says whether it came from your documents
  (\`context\`) or your interview answers (\`interview\`), and whether it's \`implemented\`, \`planned\` or \`unknown\`.
  Also lists the bot's job, what's out of scope, what's still unknown and where to send people it can't help.
- \`few_shot_examples.json\`: example conversations (AI-written illustrations, not real transcripts). Each was
  checked against the knowledge pack; \`facts\` lists the fact numbers it relies on.
- \`run_bot.py\`: chat with the bot in your terminal.

## Run it
Needs Python 3.8+ and your own Gemini API key (https://aistudio.google.com). Nothing to install.

    export GEMINI_API_KEY=your-key        # Windows PowerShell: $env:GEMINI_API_KEY="your-key"
    python run_bot.py

Optional: \`GEMINI_MODEL\` picks another model (default \`${RUNNER_MODEL}\`).

## Use it elsewhere
The full instructions are system_prompt.md + the knowledge and examples, combined by \`compose()\` in run_bot.py.
Send that text as the system instruction to any chat model API (Gemini, OpenAI, Anthropic, ...).
Keep your API key on a server; never put it in a website or app that users download.
`;
}

const RUNNER = `#!/usr/bin/env python3
"""Chat with your MOMMA bot in the terminal.

Needs Python 3.8+ and your own Gemini API key in the GEMINI_API_KEY environment variable.
Uses only the Python standard library. Type 'quit' to exit.
"""
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODEL = os.environ.get("GEMINI_MODEL", "${RUNNER_MODEL}")
TEMPERATURE = ${BOT_TEMPERATURE}  # low: a factual bot should not get creative


def compose(prompt, kp, examples):
    # Mirrors composeInstructions() in MOMMA, so this bot matches the in-app test chat.
    parts = [prompt.strip()]
    k = ["## Project knowledge"]
    if kp.get("goal"):
        k.append("Goal: " + kp["goal"])
    if kp.get("audience"):
        k.append("Audience: " + kp["audience"])
    if kp.get("responsibilities"):
        k.append("Your job:")
        k += ["- " + x for x in kp["responsibilities"]]
    if kp.get("facts"):
        k.append("Facts you can rely on (a 'planned' fact is not built yet: describe it as planned, never as available or certified):")
        k += ["%d. %s [%s%s]" % (i + 1, f["statement"], f["source"], "; " + f["status"] if f.get("status") else "")
              for i, f in enumerate(kp["facts"])]
    if kp.get("out_of_scope"):
        k.append("Out of scope (politely decline or redirect):")
        k += ["- " + x for x in kp["out_of_scope"]]
    if kp.get("open_questions"):
        k.append("Still unknown (say you don't know; never guess):")
        k += ["- " + x for x in kp["open_questions"]]
    k.append("If you can't help: " + (kp.get("escalation") or "say so plainly and suggest contacting the project team."))
    parts.append("\\n".join(k))
    if examples:
        parts.append("\\n\\n".join(
            ["## Example conversations (style reference only)"]
            + ["User: %s\\nAssistant: %s" % (e["user"], e["assistant"]) for e in examples]
        ))
    return "\\n\\n".join(parts)


def load_instructions():
    prompt = (HERE / "system_prompt.md").read_text(encoding="utf-8")
    kp = json.loads((HERE / "knowledge_pack.json").read_text(encoding="utf-8"))
    examples = json.loads((HERE / "few_shot_examples.json").read_text(encoding="utf-8")).get("examples", [])
    return compose(prompt, kp, examples)


def ask(key, system, history):
    body = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": r, "parts": [{"text": t}]} for r, t in history],
        "generationConfig": {"temperature": TEMPERATURE},
    }
    req = urllib.request.Request(
        "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent" % MODEL,
        data=json.dumps(body).encode("utf-8"),
        headers={"x-goog-api-key": key, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=60) as res:
        data = json.loads(res.read().decode("utf-8"))
    # A blocked or empty response has no candidates/parts; return None instead of crashing.
    parts = ((data.get("candidates") or [{}])[0].get("content") or {}).get("parts") or []
    text = "".join(p.get("text", "") for p in parts).strip()
    return text or None


def main():
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("Set GEMINI_API_KEY first (see README.md).")
    system = load_instructions()
    history = []
    print("Bot ready. Type 'quit' to exit.")
    while True:
        try:
            text = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if text.lower() in ("quit", "exit"):
            break
        if not text:
            continue
        history.append(("user", text))
        try:
            reply = ask(key, system, history)
            error = "No answer (the response may have been blocked). Try rephrasing."
        except urllib.error.HTTPError as e:
            reply, error = None, "Error %s: %s" % (e.code, e.read().decode("utf-8")[:300])
        except (urllib.error.URLError, OSError) as e:  # includes timeouts
            reply, error = None, "Network error: %s" % e
        except (ValueError, KeyError, IndexError) as e:
            reply, error = None, "Unexpected response: %s" % e
        if reply is None:
            history.pop()
            print(error)
            continue
        history.append(("model", reply))
        print("Bot:", reply)


if __name__ == "__main__":
    main()
`;
