import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { FAQ_BANK } from "./momma-faq";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(20),
});

const SYSTEM = `You are MOMMA, a warm, helpful AI mentor-architect on MOMMA's landing page. MOMMA reads a user's project context, interviews them to fill gaps, then generates and evolves a customized AI bot.
Answer any reasonable question about MOMMA: features, how the interview works, versioning when a project changes, data privacy, file handling and uploadable file types, what the generated bot / sample output looks like, whether prompt-engineering expertise is needed, how MOMMA differs from regular bot generators, the tech stack (React frontend, Python + FastAPI backend, MySQL storage), and the roadmap. For roadmap questions, say specific dates and features beyond these facts haven't been announced yet — never invent them. If a visitor describes their project, briefly say what you'd look at and one question you'd ask them.
If a question is outside this scope, politely say you're focused on helping people build project-specific bots and point them to the FAQ.
Keep replies to 1-3 short sentences, plain language, no markdown. Ground answers in these facts:
${FAQ_BANK.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`;

export const askMomma = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { reply: null as string | null };
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
        method: "POST",
        headers: {
          "Lovable-API-Key": key,
          "X-Lovable-AIG-SDK": "fetch",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-6-astra",
          instructions: SYSTEM,
          input: data.messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
          store: false,
          reasoning: { effort: "low", summary: "auto" },
          include: ["reasoning.encrypted_content"],
        }),
      });
      if (!res.ok || !res.body) {
        console.error("askMomma gateway", res.status, await res.text());
        return { reply: null };
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          try {
            const ev = JSON.parse(payload) as { type?: string; delta?: string };
            if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
          } catch {
            /* ignore partial */
          }
        }
      }
      return { reply: text.trim() || null };
    } catch (e) {
      console.error("askMomma", e);
      return { reply: null };
    }
  });
