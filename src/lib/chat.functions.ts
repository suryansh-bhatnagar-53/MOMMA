import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";
import { FAQ_BANK } from "./momma-faq";
import { llmGenerate } from "./llm";
import { allow } from "./rate-limit";

const schema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(20),
});

const SYSTEM = `You are MOMMA, a warm, helpful AI mentor-architect on MOMMA's landing page. MOMMA reads a user's project context, interviews them to fill gaps, then generates and evolves a customized AI bot.
Answer any reasonable question about MOMMA: features, how the interview works, versioning when a project changes, data privacy, file handling and uploadable file types, what the generated bot / sample output looks like, whether prompt-engineering expertise is needed, how MOMMA differs from regular bot generators, the tech stack (React with TanStack Start and server functions, Supabase PostgreSQL with row-level security, private Supabase file storage, a rule-based interview engine), and the roadmap. For roadmap questions, say specific dates and features beyond these facts haven't been announced yet — never invent them. If a visitor describes their project, briefly say what you'd look at and one question you'd ask them.
If a question is outside this scope, politely say you're focused on helping people build project-specific bots and point them to the FAQ.
Keep replies to 1-3 short sentences, plain language, no markdown. Ground answers in these facts:
${FAQ_BANK.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}`;

// The landing chat needs no login, so cap AI use per visitor and in total to protect the API quotas.
// When limited, reply is null and ChatPreview answers from the built-in FAQ instead.
const PER_IP = Number(process.env["LANDING_CHAT_PER_IP"] || 15); // per 10 minutes
const PER_DAY = Number(process.env["LANDING_CHAT_PER_DAY"] || 300); // all visitors together
const TEN_MIN = 10 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;

export const askMomma = createServerFn({ method: "POST" })
  .validator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    // Render (and most hosts) sit behind a proxy that sets X-Forwarded-For.
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!allow(`landing-ip:${ip}`, PER_IP, TEN_MIN) || !allow("landing-all", PER_DAY, DAY)) {
      console.warn(`askMomma: rate limited (${ip})`);
      return { reply: null };
    }
    return { reply: await llmGenerate({ label: "askMomma", system: SYSTEM, messages: data.messages }) };
  });
