import { useState } from "react";

type Node = {
  id: string;
  title: string;
  blurb: string;
  example: string;
  dot: string;
  pulse: string;
};

const left: Node[] = [
  {
    id: "goal",
    title: "Project Goal",
    blurb: "Fill weekend slots without a front-desk person.",
    example: "Example: \"Take bookings after hours without hiring anyone.\"",
    dot: "bg-brick",
    pulse: "node-pulse",
  },
  {
    id: "requirements",
    title: "Core Requirements",
    blurb: "Real-time availability, deposit capture, weather hold.",
    example: "Example: \"Never double-book a guide; hold the slot for 20 minutes.\"",
    dot: "bg-moss",
    pulse: "node-pulse-2",
  },
];

const right: Node[] = [
  {
    id: "constraints",
    title: "User Constraints",
    blurb: "Phones over laptops. Cash still common. No app install.",
    example: "Example: \"Most customers reply by text and pay on arrival.\"",
    dot: "bg-mustard",
    pulse: "node-pulse",
  },
  {
    id: "responsibilities",
    title: "Bot Responsibilities",
    blurb: "Answer, book, chase deposits, flag no-shows.",
    example: "Answer framework questions, suggest next steps, flag inconsistencies.",
    dot: "bg-brick",
    pulse: "node-pulse-2",
  },
];

function NodeItem({
  node,
  active,
  onActivate,
  onClear,
}: {
  node: Node;
  active: boolean;
  onActivate: () => void;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={active}
      onMouseEnter={onActivate}
      onMouseLeave={onClear}
      onFocus={onActivate}
      onBlur={onClear}
      onClick={onActivate}
      className="flex w-full items-start gap-3 rounded-lg px-1 py-1 text-left focus:outline-none focus:ring-2 focus:ring-brick/30"
    >
      <span className={`${node.pulse} mt-1 size-3 shrink-0 rounded-full ${node.dot}`} />
      <span>
        <span className="block font-display text-sm font-semibold text-ink">{node.title}</span>
        <span className="mt-0.5 block text-xs text-ink/60">{node.blurb}</span>
        {active ? (
          <span className="tag-mat mt-2 block rounded-md bg-paper px-2.5 py-1.5 text-xs text-ink/70">
            {node.example}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function KnowledgeMap() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="bg-paper" aria-labelledby="map-heading">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-[44ch]">
          <h2
            id="map-heading"
            className="text-balance font-display text-3xl font-semibold tracking-tight text-ink"
          >
            A project, mapped — not a grid of feature cards.
          </h2>
          <p className="mt-3 text-base text-pretty text-ink/65">
            Project knowledge is the center. MOMMA holds the whole picture: what you're aiming for,
            what must be true, and exactly what the bot owns.
          </p>
        </div>
        <div className="rounded-[min(1.5vw,20px)] bg-cream p-6 ring-1 ring-black/5 sm:p-10">
          <div className="grid items-center gap-8 md:grid-cols-3">
            <div className="space-y-5">
              {left.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  active={active === node.id}
                  onActivate={() => setActive(node.id)}
                  onClear={() => setActive(null)}
                />
              ))}
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="node-pulse grid size-20 place-items-center rounded-2xl bg-ink ring-1 ring-black/5">
                <span className="font-display text-xs font-semibold text-cream">
                  Your
                  <br />
                  Project
                </span>
              </div>
              <span className="mt-3 text-[11px] tracking-[0.16em] text-ink/45 uppercase">
                live model
              </span>
            </div>
            <div className="space-y-5">
              {right.map((node) => (
                <NodeItem
                  key={node.id}
                  node={node}
                  active={active === node.id}
                  onActivate={() => setActive(node.id)}
                  onClear={() => setActive(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
