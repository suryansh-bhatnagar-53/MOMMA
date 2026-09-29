import { useEffect, useRef, useState, type FormEvent } from "react";

type Msg = { id: number; from: "momma" | "user"; text: string };

const BANK: { q: string; a: string; keys: string[] }[] = [
  {
    q: "How does the interview work?",
    a: "I start by reading what you share—your description and any uploaded files. Then I spot what's missing or unclear and ask you targeted questions, one at a time, until I have enough context to generate a bot that truly fits your project.",
    keys: ["interview", "question", "ask", "how does", "work"],
  },
  {
    q: "What happens if my project changes?",
    a: "When you add new context, I compare it to what I already know. Only the affected areas get re-interviewed; the rest of your knowledge stays intact, and I generate a new bot version from the updated understanding.",
    keys: ["change", "update", "version", "evolve", "new"],
  },
  {
    q: "Is my data private?",
    a: "Absolutely. Your project, files, and chat history are stored only in your account. Nothing is shared between users or used for model training unless you explicitly opt-in later.",
    keys: ["privacy", "private", "data", "secure", "security", "training"],
  },
  {
    q: "Can I see a sample bot output?",
    a: "Sure! After you finish the interview, MOMMA prepares a downloadable package that includes the bot's prompt/instructions, a short README, and any starter code—ready to drop into your repo or chat platform.",
    keys: ["sample", "output", "example", "package", "download", "see"],
  },
  {
    q: "Do I need to be a prompt-engineering expert?",
    a: "No. I ask the questions so you don't have to guess what an AI needs. You just describe your project in your own words, and I handle the rest.",
    keys: ["expert", "prompt", "engineer", "skill", "technical", "need to"],
  },
];

const CHIPS = BANK.slice(0, 4).map((b) => b.q);
const GREETING =
  "Hi! I'm MOMMA. Tell me about your project, and I'll show you how I'd help you build a bot.";
const FALLBACK =
  "Good question. In the full product I'd dig into that with you during the interview. For this preview, try asking about the interview, project changes, privacy, sample output, or whether you need prompt-engineering skills.";

function answerFor(input: string) {
  const t = input.toLowerCase();
  const exact = BANK.find((b) => b.q.toLowerCase() === t);
  if (exact) return exact.a;
  let best: { a: string; score: number } = { a: FALLBACK, score: 0 };
  for (const b of BANK) {
    const score = b.keys.filter((k) => t.includes(k)).length;
    if (score > best.score) best = { a: b.a, score };
  }
  if (best.score === 0 && t.split(/\s+/).length > 5)
    return "That sounds like a great project. My next step would be reading it closely, then asking you about the parts only you know—like who uses it and what the bot should own. Want to know how the interview works?";
  return best.a;
}

function Avatar({ thinking }: { thinking: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative grid size-8 shrink-0 place-items-center rounded-full bg-brick"
    >
      <svg viewBox="0 0 24 12" className="w-5 stroke-cream" fill="none" strokeWidth="1.8">
        {[3, 8, 12, 16, 21].map((x, i) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1={3}
            y2={9}
            strokeLinecap="round"
            className={thinking ? "wave-bar" : ""}
            style={{ animationDelay: `${i * 0.12}s`, transformOrigin: "center" }}
          />
        ))}
      </svg>
    </span>
  );
}

function StaticFaq({ note }: { note?: string }) {
  return (
    <div>
      {note ? <p className="mb-4 text-sm text-ink/60">{note}</p> : null}
      <div className="space-y-3">
        {BANK.map((b) => (
          <details key={b.q} className="rounded-xl bg-paper px-5 py-4 ring-1 ring-black/5">
            <summary className="cursor-pointer text-sm font-semibold text-ink">{b.q}</summary>
            <p className="mt-2 text-sm text-ink/65">{b.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function ChatPreview() {
  const [reduced, setReduced] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "momma", text: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMsgs((m) => [...m, { id: idRef.current++, from: "user", text: q }]);
    setInput("");
    setTyping(true);
    window.setTimeout(
      () => {
        setMsgs((m) => [...m, { id: idRef.current++, from: "momma", text: answerFor(q) }]);
        setTyping(false);
      },
      800 + Math.random() * 400,
    );
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <section id="talk" className="bg-cream" aria-labelledby="talk-heading">
      <noscript>
        <style>{`.chat-live{display:none!important}`}</style>
      </noscript>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_360px] md:items-stretch">
        <div className="max-w-[44ch]">
          <h2
            id="talk-heading"
            className="text-balance font-display text-3xl font-semibold tracking-tight text-ink"
          >
            Talk to MOMMA About Your Project
          </h2>
          <p className="mt-3 text-base text-pretty text-ink/65">
            Ask anything—features, interview flow, versioning, privacy—and get instant, contextual
            answers just like the real product would give.
          </p>
          <p className="mt-6 text-sm text-ink/50">
            This is a preview with pre-written answers — a feel for how MOMMA listens and responds,
            not the full product.
          </p>
          <noscript>
            <div className="mt-8">
              <StaticFaq note="JavaScript is required for the live preview. Below are the most common questions." />
            </div>
          </noscript>
          {reduced ? (
            <div className="mt-8">
              <StaticFaq />
            </div>
          ) : null}
        </div>

        {!reduced ? (
          <div className="chat-live flex h-[520px] w-full flex-col overflow-hidden rounded-2xl bg-paper shadow-[0_12px_30px_-14px_oklch(0.232_0.014_78.5/35%)] ring-1 ring-black/5 md:w-[360px]">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Avatar thinking={typing} />
              <div>
                <p className="font-display text-sm font-semibold text-ink">MOMMA</p>
                <p className="text-[11px] text-ink/50">{typing ? "thinking…" : "preview"}</p>
              </div>
            </div>

            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              aria-label="Conversation with MOMMA"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {msgs.map((m) => (
                <div
                  key={m.id}
                  className={`tag-mat flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                      m.from === "momma"
                        ? "rounded-bl-md bg-brick text-cream"
                        : "rounded-br-md bg-cream text-ink ring-1 ring-black/5"
                    }`}
                  >
                    <span className="sr-only">{m.from === "momma" ? "MOMMA: " : "You: "}</span>
                    {m.text}
                  </p>
                </div>
              ))}
              {msgs.length === 1 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => send(c)}
                      className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink/80 ring-1 ring-black/10 transition-colors hover:bg-mustard/30 focus:outline-none focus:ring-2 focus:ring-brick/40"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : null}
              {typing ? (
                <div className="flex" aria-label="MOMMA is typing">
                  <span className="flex gap-1 rounded-2xl rounded-bl-md bg-brick/15 px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="typing-dot size-1.5 rounded-full bg-brick"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </span>
                </div>
              ) : null}
            </div>

            {msgs.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto px-4 pb-2">
                {CHIPS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => send(c)}
                    disabled={typing}
                    className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[11px] text-ink/70 ring-1 ring-black/10 hover:bg-mustard/30 focus:outline-none focus:ring-2 focus:ring-brick/40 disabled:opacity-50"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="flex gap-2 border-t px-3 py-3">
              <label htmlFor="chat-input" className="sr-only">
                Ask MOMMA a question
              </label>
              <input
                id="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your project…"
                className="min-w-0 flex-1 rounded-lg bg-cream px-3 py-2 text-sm text-ink ring-1 ring-black/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-brick/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="rounded-lg bg-ink px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-ink/90 disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </section>
  );
}
