import { useState } from "react";

const stack = [
  { label: "React", note: "Chosen for maintainability and skill growth — not just speed." },
  { label: "TanStack Start", note: "Server functions keep AI keys off the browser." },
  { label: "PostgreSQL", note: "Supabase Postgres with row-level security: you only ever see your own projects." },
  { label: "Supabase Storage", note: "Private file storage. Text is extracted in your browser." },
];

const flow = [
  { title: "User Input", note: "docs, links, notes" },
  { title: "Analysis Engine", note: "extracts the model" },
  { title: "Knowledge Gap Detector", note: "finds what's missing" },
  { title: "Adaptive Interviewer", note: "asks only the gaps" },
  { title: "Bot Generator", note: "drafts to fit" },
];

export function UnderTheHood() {
  const [open, setOpen] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="inside" className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="overflow-hidden rounded-[min(1.5vw,20px)] ring-1 ring-black/5">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-center justify-between bg-ink px-6 py-5 text-left"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-mustard">
                🛡
              </span>
              <span className="font-display text-lg font-semibold text-cream">
                Peek Under the Hood
              </span>
            </span>
            <span aria-hidden="true" className="text-sm text-cream/60">
              {open ? "−" : "+"}
            </span>
          </button>

          {open ? (
            <div className="bg-cream px-6 py-8">
              <div className="mb-8 flex flex-wrap gap-2">
                {stack.map((item) => (
                  <span
                    key={item.label}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative rounded-md bg-paper px-3 py-1.5 text-xs font-medium text-ink/70 ring-1 ring-black/5"
                  >
                    {item.label}
                    {hovered === item.label ? (
                      <span className="tag-mat absolute top-full left-0 z-10 mt-2 w-56 rounded-lg bg-ink px-3 py-2 text-xs text-cream/85">
                        {item.note}
                      </span>
                    ) : null}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-5">
                {flow.map((node, index) => (
                  <div
                    key={node.title}
                    className={`rounded-lg px-4 py-4 text-center ring-1 ring-black/5 ${
                      index === flow.length - 1 ? "bg-moss text-cream" : "bg-paper"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold ${index === flow.length - 1 ? "" : "text-ink"}`}
                    >
                      {node.title}
                    </p>
                    <p
                      className={`mt-1 text-[11px] ${
                        index === flow.length - 1 ? "text-cream/60" : "text-ink/50"
                      }`}
                    >
                      {node.note}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 max-w-[52ch] text-sm text-pretty text-ink/60">
                Every answer you give rewrites the model, which re-drafts the bot. Nothing is a static
                template — the architecture is a living document, not a one-time generation.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
