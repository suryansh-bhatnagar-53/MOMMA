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
Answer only questions about: how the interview works, what happens when a project changes, data privacy, what the generated bot / sample output looks like, whether prompt-engineering expertise is needed, uploadable file types, and how MOMMA differs from regular bot generators. If a visitor describes their project, briefly say what you'd look at and one question you'd ask them.
If a question is outside this scope, politely say you're focused on helping people build project-specific bots and point them to the FAQ.
Keep replies to 1-3 short sentences, plain language, no markdown. Ground answers in these facts:
${FAQ_BANK.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`;

export const askMomma = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { reply: null as string | null };
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: SYSTEM }, ...data.messages],
        }),
      });
      if (!res.ok) {
        console.error("askMomma gateway", res.status, await res.text());
        return { reply: null };
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return { reply: json.choices?.[0]?.message?.content?.trim() || null };
    } catch (e) {
      console.error("askMomma", e);
      return { reply: null };
    }
  });
