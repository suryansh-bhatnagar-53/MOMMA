import { useState } from "react";
import { Link } from "@tanstack/react-router";

type Step = {
  num: string;
  title: string;
  blurb: string;
  detail: string;
  badge: string;
  arrow: string;
};

const steps: Step[] = [
  {
    num: "01",
    title: "Your Project",
    blurb: "The thing you're actually building.",
    detail: "Drop in docs, notes, a repo link, or a two-line description. Whatever you already have.",
    badge: "bg-ink text-cream",
    arrow: "→",
  },
  {
    num: "02",
    title: "Project Context",
    blurb: "MOMMA maps the domain, users, and constraints.",
    detail: "Goals, audiences, and limits are pulled out and held together as one picture — not scattered prompts.",
    badge: "bg-ink text-cream",
    arrow: "→",
  },
  {
    num: "03",
    title: "MOMMA Understands",
    blurb: "A working model of your intent forms.",
    detail: "Knowledge extraction in progress: \"seasonal pricing\", \"deposit rules\", \"no in-house engineer\".",
    badge: "bg-moss text-cream",
    arrow: "→",
  },
  {
    num: "04",
    title: "MOMMA Interviews You",
    blurb: "Sharp questions fill the gaps only you know.",
    detail: "Only the gaps get asked about, in plain language — and you can stop or come back at any point.",
    badge: "bg-mustard text-ink",
    arrow: "→",
  },
  {
    num: "05",
    title: "Customized Bot",
    blurb: "A bot drafted to fit — ready to evolve with you.",
    detail: "You get a bot package — instructions, knowledge, responsibilities — that updates when your project does.",
    badge: "bg-brick text-cream",
    arrow: "✓",
  },
];

export function Hero() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 pt-6 pb-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="mb-6 flex items-center gap-2">
              <span aria-hidden="true" className="text-lg leading-none text-mustard">
                🛡
              </span>
              <span className="text-xs font-medium tracking-[0.18em] text-ink/50 uppercase">
                An evolving understanding
              </span>
            </div>
            <h1 className="max-w-[24ch] text-balance font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Stop Rebuilding AI Assistants. Start Building Your Project.
            </h1>
            <p className="mt-5 max-w-[46ch] text-base text-pretty text-ink/70">
              MOMMA understands your project through context and intelligent interviews, then
              generates and evolves a customized AI bot — so you never start from scratch again.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                to="/auth"
                search={{ tab: "signup", next: undefined }}
                className="rounded-xl bg-brick px-6 py-3.5 text-sm font-semibold text-cream ring-1 ring-brick/40 transition-colors hover:bg-brick/90"
              >
                Get Started →
              </Link>
              <a
                href="#how"
                className="text-sm font-medium text-ink/70 transition-colors hover:text-ink"
              >
                See the flow
              </a>
            </div>
          </div>

          <div id="how" className="lg:col-span-7">
            <div className="rounded-[min(1.5vw,20px)] bg-cream p-6 ring-1 ring-black/5 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-xs font-medium tracking-[0.18em] text-ink/45 uppercase">
                  The flow
                </span>
                <span className="text-xs text-ink/40">Hover or tap a step to see inside</span>
              </div>
              <ol className="space-y-1">
                {steps.map((step) => {
                  const isOpen = open === step.num;
                  return (
                    <li key={step.num}>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(isOpen ? null : step.num)}
                        onMouseEnter={() => setOpen(step.num)}
                        onMouseLeave={() => setOpen(null)}
                        onFocus={() => setOpen(step.num)}
                        className="group flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-paper focus:bg-paper focus:outline-none"
                      >
                        <span
                          className={`grid size-8 shrink-0 place-items-center rounded-lg font-display text-xs font-semibold ${step.badge}`}
                        >
                          {step.num}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-sm font-semibold text-ink">
                            {step.title}
                          </span>
                          <span className="block truncate text-xs text-ink/55">{step.blurb}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="ml-auto text-ink/30 transition-colors group-hover:text-brick"
                        >
                          {step.arrow}
                        </span>
                      </button>
                      {isOpen ? (
                        <p className="tag-mat mx-3 mb-1 rounded-lg bg-paper px-3 py-2 text-xs text-ink/70">
                          {step.detail}
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
