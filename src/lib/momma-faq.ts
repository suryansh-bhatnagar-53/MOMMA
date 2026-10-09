export const FAQ_BANK: { q: string; a: string; keys: string[] }[] = [
  {
    q: "How does the interview work?",
    a: "I start by reading what you share—your description and any uploaded files. Then I spot what's missing or unclear and ask you targeted questions, one at a time, until I have enough context to generate a bot that truly fits your project.",
    keys: ["interview", "question", "ask", "how does", "work", "process"],
  },
  {
    q: "What happens if my project changes?",
    a: "Before your interview starts, you can add context and re-run the analysis. Comparing versions and re-interviewing only the parts that changed is planned, but not built yet.",
    keys: ["change", "update", "version", "evolve", "new feature", "grow"],
  },
  {
    q: "Is my data private?",
    a: "Your projects and files are stored in your account, and database rules make sure only you can read them. To analyse a project, its text is sent to an AI provider, so avoid uploading anything confidential.",
    keys: ["privacy", "private", "data", "secure", "security", "training"],
  },
  {
    q: "Can I see a sample bot output?",
    a: "The bot stage is still being built. The plan is a test chat inside MOMMA plus a downloadable package with the bot's instructions, its knowledge, example conversations and starter code.",
    keys: ["sample", "output", "example", "package", "download", "look like"],
  },
  {
    q: "Do I need to be a prompt-engineering expert?",
    a: "No. I ask the questions so you don't have to guess what an AI needs. You just describe your project in your own words, and I handle the rest.",
    keys: ["expert", "prompt", "engineer", "skill", "technical", "beginner"],
  },
  {
    q: "What file types can I upload?",
    a: "PDF, Word (.docx, .doc), plain text, PNG and JPG, up to 10 MB each. Text is read from PDF, DOCX and TXT files; images and old .doc files are saved but not read yet. Files stay in your private storage until you remove them.",
    keys: ["file", "upload", "pdf", "doc", "image", "screenshot", "readme"],
  },
  {
    q: "How is MOMMA different from a regular bot generator?",
    a: "Regular generators take a prompt → bot → done. MOMMA first maps what it understood, what it assumed, what's missing and what conflicts in your material, then interviews you on those gaps before building the bot.",
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
