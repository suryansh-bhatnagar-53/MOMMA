// Provider router. Server-side only.
// - llmGenerate: drop-in replacement for geminiGenerate (same options, returns string | null).
// - llmGenerateWithMeta: same, but also says which provider/model answered, so bot versions
//   can record it (e.g. generated_by in the knowledge pack).
// Providers are tried in order (e.g. LLM_PROVIDERS=groq,nvidia,gemini). For evaluation runs, set a single
// provider (LLM_PROVIDERS=gemini) so every arm uses the same model.

import { geminiGenerate, type ChatTurn } from "./gemini";
import { groqGenerate } from "./groq";
import { nvidiaGenerate } from "./nvidia";

export type GenerateOpts = {
  system: string;
  messages: ChatTurn[];
  json?: boolean;
  schema?: object;
  temperature?: number;
  label: string;
};

export type GenerateResult = { text: string; provider: string; model: string };

const PROVIDERS: Record<string, (o: GenerateOpts) => Promise<string | null>> = {
  gemini: geminiGenerate,
  groq: groqGenerate,
  nvidia: nvidiaGenerate,
};

// Model name for provenance only. Keep the fallback in sync with DEFAULT_MODEL in gemini.ts.
function modelName(provider: string): string {
  if (provider === "gemini") return process.env["GEMINI_MODEL"] || "gemini-3-flash-preview";
  return process.env[`${provider.toUpperCase()}_MODEL`] || "unknown";
}

const DEFAULT_ORDER = ["gemini", "groq"];

// Unknown names (e.g. a provider removed from the code but still in .env.local) are ignored;
// if nothing valid is left, fall back to the default order instead of disabling AI entirely.
function providerOrder(): string[] {
  const order = (process.env["LLM_PROVIDERS"] || "")
    .split(",")
    .map((s) => s.trim())
    .filter((name) => name in PROVIDERS);
  return order.length ? order : DEFAULT_ORDER;
}

// After a failure, skip that provider for a while. In-memory, so per server instance.
const COOLDOWN_MS = 60_000;
const coolingUntil = new Map<string, number>();

export async function llmGenerateWithMeta(opts: GenerateOpts): Promise<GenerateResult | null> {
  for (const provider of providerOrder()) {
    const generate = PROVIDERS[provider];
    if (!generate || (coolingUntil.get(provider) ?? 0) > Date.now()) continue;

    const text = await generate(opts);
    if (text && (!opts.json || isJson(text))) {
      const model = modelName(provider);
      console.info(`${opts.label}: answered by ${provider} (${model})`);
      return { text, provider, model };
    }

    console.warn(`${opts.label}: ${provider} ${text ? "returned invalid JSON" : "failed"}; trying next provider`);
    if (!text) coolingUntil.set(provider, Date.now() + COOLDOWN_MS);
  }
  return null; // every provider failed: callers keep their existing fallback behaviour
}

export async function llmGenerate(opts: GenerateOpts): Promise<string | null> {
  return (await llmGenerateWithMeta(opts))?.text ?? null;
}

function isJson(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}
