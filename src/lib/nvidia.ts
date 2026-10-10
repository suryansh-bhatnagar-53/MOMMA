// Minimal NVIDIA API catalog client (OpenAI-compatible /chat/completions). Server-side only:
// NVIDIA_API_KEY and NVIDIA_MODEL come from .env.local (never from VITE_* vars).
// Same contract as geminiGenerate: returns null when unconfigured or when the call fails,
// so callers (and the llm.ts router) can fall back.
// Note: build.nvidia.com access is a trial meant for development and evaluation, not production.

import type { ChatTurn } from "./gemini";

const BASE_URL = process.env["NVIDIA_BASE_URL"] || "https://integrate.api.nvidia.com/v1";

export async function nvidiaGenerate(opts: {
  system: string;
  messages: ChatTurn[];
  json?: boolean;
  schema?: object; // no reliable responseSchema equivalent here, so it is sent as text in the prompt
  temperature?: number; // passed through from the caller, like gemini.ts
  label: string; // for logs
}): Promise<string | null> {
  const key = process.env["NVIDIA_API_KEY"];
  const model = process.env["NVIDIA_MODEL"]; // copy the exact id from the model's page on build.nvidia.com
  if (!key || !model) return null;

  // Gemini enforces JSON via responseMimeType/responseSchema. Here we ask for it in the prompt
  // and the caller must validate the result.
  const system = opts.json
    ? `${opts.system}\n\nRespond with a single valid JSON object only: no prose, no Markdown code fences.` +
      (opts.schema ? `\nThe JSON must match this schema:\n${JSON.stringify(opts.schema)}` : "")
    : opts.system;

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      // Reasoning models think before answering: a full bot generation took ~40-50 s in testing.
      signal: AbortSignal.timeout(Number(process.env["NVIDIA_TIMEOUT_MS"] || 150_000)),
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          ...opts.messages.map((m) => ({ role: m.role, content: m.content })), // already "user" | "assistant"
        ],
        temperature: opts.temperature ?? (opts.json ? 0.2 : 0.6), // caller's value wins; this is only a default
        // Reasoning tokens count against this; at 4096 Nemotron used it all on reasoning and returned no answer.
        max_tokens: Number(process.env["NVIDIA_MAX_TOKENS"] || 16384),
      }),
    });
    if (!res.ok) {
      // 429 = trial rate limit / model busy; 401 = bad key; 404 = wrong model id.
      console.error(`${opts.label}: NVIDIA ${res.status}`, (await res.text()).slice(0, 500));
      return null;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string | null } }[] };
    const text = cleanOutput(data.choices?.[0]?.message?.content ?? "", !!opts.json);
    return text || null;
  } catch (e) {
    console.error(`${opts.label}: NVIDIA call failed`, e);
    return null;
  }
}

// Reasoning models may prepend <think>...</think>; models also like to wrap JSON in ``` fences.
function cleanOutput(raw: string, json: boolean): string {
  let t = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  if (json) t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return t;
}
