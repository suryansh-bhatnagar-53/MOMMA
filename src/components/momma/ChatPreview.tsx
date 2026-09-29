import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SendHorizontal } from "lucide-react";

import { askMomma } from "@/lib/chat.functions";
import { FAQ_BANK, getIntentReply } from "@/lib/momma-faq";

type Msg = { id: number; from: "momma" | "user"; text: string };

const CHIPS = FAQ_BANK.slice(0, 4).map((b) => b.q);
const GREETING =
  "Hi! I'm MOMMA. Tell me about your project, and I'll show you how I'd help you build a bot.";


function Avatar({ thinking }: { thinking?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-7 shrink-0 place-items-center rounded-full bg-brick/15 text-sm ring-1 ring-brick/20 ${thinking ? "node-pulse" : ""}`}
    >
      🛡️
    </span>
  );
}

function StaticFaq({ note }: { note?: string }) {
  return (
    <div>
      {note ? <p className="mb-4 text-sm text-ink/60">{note}</p> : null}
      <div className="space-y-3">
        {FAQ_BANK.map((b) => (
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
  const ask = useServerFn(askMomma);
  const [reduced, setReduced] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "momma", text: GREETING }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 72)}px`;
  }, [input]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    const userMsg: Msg = { id: idRef.current++, from: "user", text: q };
    const history = [...msgs.slice(1), userMsg].slice(-10).map((m) => ({
      role: m.from === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    const started = Date.now();
    let reply: string | null = null;
    try {
      const res = await ask({ data: { messages: history } });
      reply = res?.reply ?? null;
    } catch {
      reply = null;
    }
    if (!reply) reply = getIntentReply(q);
    const wait = Math.max(0, 800 - (Date.now() - started));
    setTimeout(() => {
      setMsgs((m) => [...m, { id: idRef.current++, from: "momma", text: reply! }]);
      setTyping(false);
    }, wait);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <section id="talk" className="bg-cream" aria-labelledby="talk-heading">
      <noscript>
        <style>{`.chat-live{display:none!important}`}</style>
      </noscript>
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1fr_360px] md:items-start">
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
            A live AI preview focused on how MOMMA works — try describing your own project.
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
          <div className="chat-live flex w-full flex-col overflow-hidden rounded-2xl bg-paper shadow-[0_12px_30px_-14px_oklch(0.232_0.014_78.5/35%)] ring-1 ring-black/5 md:w-[360px]">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <Avatar thinking={typing} />
              <div>
                <p className="font-display text-sm font-semibold text-ink">MOMMA</p>
                <p className="text-[11px] text-ink/50">{typing ? "thinking…" : "online"}</p>
              </div>
            </div>

            <div
              ref={listRef}
              role="log"
              aria-live="polite"
              aria-label="Conversation with MOMMA"
              className="max-h-[300px] min-h-[220px] space-y-3 overflow-y-auto px-4 py-4"
            >
              {msgs.map((m) =>
                m.from === "momma" ? (
                  <div key={m.id} className="tag-mat flex items-end gap-2">
                    <Avatar />
                    <p className="max-w-[80%] rounded-[18px] rounded-bl-md bg-brick px-3.5 py-2.5 text-sm text-cream shadow-sm">
                      <span className="sr-only">MOMMA: </span>
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="tag-mat flex justify-end">
                    <p className="max-w-[80%] rounded-[18px] rounded-br-md bg-cream px-3.5 py-2.5 text-sm text-ink shadow-sm ring-1 ring-black/5">
                      <span className="sr-only">You: </span>
                      {m.text}
                    </p>
                  </div>
                ),
              )}
              {msgs.length === 1 ? (
                <div className="flex flex-wrap gap-2 pt-1 pl-9">
                  {CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => void send(c)}
                      className="rounded-full bg-cream px-3 py-1.5 text-xs font-medium text-ink/80 ring-1 ring-black/10 transition-colors hover:bg-mustard/30 focus:outline-none focus:ring-2 focus:ring-brick/40"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : null}
              {typing ? (
                <div className="flex items-end gap-2" aria-label="MOMMA is typing">
                  <Avatar thinking />
                  <span className="flex gap-1 rounded-[18px] rounded-bl-md bg-brick px-3.5 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="typing-dot size-1.5 rounded-full bg-cream"
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
                    onClick={() => void send(c)}
                    disabled={typing}
                    className="shrink-0 rounded-full bg-cream px-2.5 py-1 text-[11px] text-ink/70 ring-1 ring-black/10 hover:bg-mustard/30 focus:outline-none focus:ring-2 focus:ring-brick/40 disabled:opacity-50"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="flex items-end gap-2 border-t px-3 py-3">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                aria-label="Ask MOMMA a question"
                placeholder="Ask MOMMA…"
                maxLength={1000}
                className="min-w-0 flex-1 resize-none rounded-lg bg-cream px-3 py-2 text-sm text-ink ring-1 ring-black/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-brick/40"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                aria-label="Send message"
                className="grid size-9 place-items-center rounded-lg bg-ink text-cream transition-colors hover:bg-ink/90 disabled:opacity-40"
              >
                <SendHorizontal className="size-4" />
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </section>
  );
}
