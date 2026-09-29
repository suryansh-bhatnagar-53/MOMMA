export const FAQ_BANK: { q: string; a: string; keys: string[] }[] = [
  {
    q: "How does the interview work?",
    a: "I start by reading what you share—your description and any uploaded files. Then I spot what's missing or unclear and ask you targeted questions, one at a time, until I have enough context to generate a bot that truly fits your project.",
    keys: ["interview", "question", "ask", "how does", "work", "process"],
  },
  {
    q: "What happens if my project changes?",
    a: "When you add new context, I compare it to what I already know. Only the affected areas get re-interviewed; the rest of your knowledge stays intact, and I generate a new bot version from the updated understanding.",
    keys: ["change", "update", "version", "evolve", "new feature", "grow"],
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your project, files, and chat history are stored only in your account. Nothing is shared between users or used for model training unless you explicitly opt-in later.",
    keys: ["privacy", "private", "data", "secure", "security", "training"],
  },
  {
    q: "Can I see a sample bot output?",
    a: "Sure! After you finish the interview, MOMMA prepares a downloadable package that includes the bot's prompt/instructions, a short README, and any starter code—ready to drop into your repo or chat platform.",
    keys: ["sample", "output", "example", "package", "download", "look like"],
  },
  {
    q: "Do I need to be a prompt-engineering expert?",
    a: "No. I ask the questions so you don't have to guess what an AI needs. You just describe your project in your own words, and I handle the rest.",
    keys: ["expert", "prompt", "engineer", "skill", "technical", "beginner"],
  },
  {
    q: "What file types can I upload?",
    a: "You can upload PDF, DOC/DOCX, images, screenshots, READMEs, or any other project resource. MOMMA extracts the relevant context without needing to keep the original file forever.",
    keys: ["file", "upload", "pdf", "doc", "image", "screenshot", "readme"],
  },
  {
    q: "How is MOMMA different from a regular bot generator?",
    a: "Regular generators take a prompt → bot → done. MOMMA builds a living project knowledge base, interviews you to fill gaps, and evolves the bot as your project grows—so you never start from scratch.",
    keys: ["different", "difference", "generator", "compare", "why momma", "unique"],
  },
];

export const INTENT_FALLBACK =
  "I'm here to help you understand how MOMMA builds project-specific bots. Could you re-phrase your question about the interview, privacy, versioning, or bot output?";

export function getIntentReply(input: string) {
  const t = input.toLowerCase();
  const exact = FAQ_BANK.find((b) => b.q.toLowerCase() === t.trim());
  if (exact) return exact.a;
  let best = { a: INTENT_FALLBACK, score: 0 };
  for (const b of FAQ_BANK) {
    const hits = b.keys.filter((k) => t.includes(k)).length;
    const score = hits / 2; // two keyword hits = full confidence
    if (score > best.score) best = { a: b.a, score };
  }
  return best.score >= 0.4 ? best.a : INTENT_FALLBACK;
}
