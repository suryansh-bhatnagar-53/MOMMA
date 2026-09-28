type Step = { icon: string; label: string; text: string; tip: string };
type Scenario = { name: string; steps: [Step, Step, Step, Step, Step]; decision: string };

const s = (icon: string, label: string, text: string, tip: string): Step => ({ icon, label, text, tip });

const scenarios: Scenario[] = [
  {
    name: "E‑Commerce Store",
    decision: "Payment & shipping rules clear?",
    steps: [
      s("📄", "Context", "Handmade jewelry store + product photos, competitor links", "You describe the project and drop in whatever you already have."),
      s("🔍", "Analysis", "Product categories, payment needs, inventory tracking", "MOMMA extracts the entities and flows your store depends on."),
      s("❓", "Interview", "Cart abandonment, shipping rules, tax jurisdictions", "Only the gaps MOMMA couldn't infer get asked about."),
      s("🤖", "Bot Generation", "Shopping assistant: recommends, answers FAQs, updates inventory", "Your answers become a bot package tuned to this store."),
      s("🔄", "Versioning", "Adds subscription boxes → re‑interviews recurring payments → Bot V2", "Changes trigger a focused re‑interview, not a restart."),
    ],
  },
  {
    name: "Personal Blog / Portfolio",
    decision: "Tone & audience clear?",
    steps: [
      s("📄", "Context", "Tech blog about AI tutorials + draft posts", "Your drafts show MOMMA how you actually write."),
      s("🔍", "Analysis", "Topics, educational tone, developer audience", "MOMMA reads tone and audience from your own content."),
      s("❓", "Interview", "Code‑snippet format, comment moderation, newsletter", "Questions cover preferences the drafts can't reveal."),
      s("🤖", "Bot Generation", "Moderation + content bot: drafts outlines, flags off‑topic remarks", "The bot inherits your tone and your moderation rules."),
      s("🔄", "Versioning", "Adds a podcast → asks only about audio hosting → Bot V2", "Only the new podcast area is re‑examined."),
    ],
  },
  {
    name: "Task‑Management App",
    decision: "Workflow triggers defined?",
    steps: [
      s("📄", "Context", "Kanban board for remote dev teams + Figma wireframe", "A wireframe gives MOMMA your screens and states."),
      s("🔍", "Analysis", "Task states, assignees, due dates, notifications", "MOMMA maps how work moves through the board."),
      s("❓", "Interview", "“Auto‑archive on Done?” Slack & GitHub integrations", "Triggers and integrations are confirmed with you directly."),
      s("🤖", "Bot Generation", "Project assistant: sprint summaries, next tasks, stand‑up reminders", "The bot follows the exact workflow you confirmed."),
      s("🔄", "Versioning", "Adds time‑tracking → re‑interviews that module → Bot V2", "Existing sprint logic stays untouched."),
    ],
  },
  {
    name: "Customer‑Service Chatbot (SaaS)",
    decision: "Escalation path clear?",
    steps: [
      s("📄", "Context", "Pricing‑query chatbot + FAQ doc, pricing table", "Your FAQ and pricing become the bot's source of truth."),
      s("🔍", "Analysis", "Intents: plan comparison, trial extension, refund policy", "MOMMA groups questions customers will actually ask."),
      s("❓", "Interview", "Human escalation, ambiguous queries, fallback replies", "MOMMA asks what should happen when the bot isn't sure."),
      s("🤖", "Bot Generation", "Support bot: quotes prices, checks trials, creates tickets", "A support bot that knows when to hand off."),
      s("🔄", "Versioning", "Adds feature‑request flow → interviews that intent → Bot V2", "New intents are added without retraining the rest."),
    ],
  },
  {
    name: "IoT Monitoring Dashboard",
    decision: "Alert thresholds defined?",
    steps: [
      s("📄", "Context", "Smart‑farm sensor dashboard + CSV sample, spec sheet", "Real sample data grounds MOMMA's understanding."),
      s("🔍", "Analysis", "Soil moisture, temperature, thresholds, update frequency", "MOMMA reads metric types and ranges from the data."),
      s("❓", "Interview", "Anomaly logic, SMS vs email alerts, data retention", "You decide what counts as a problem and who hears about it."),
      s("🤖", "Bot Generation", "Ops assistant: trend summaries, irrigation predictions, breach alerts", "The bot watches the metrics you care about."),
      s("🔄", "Versioning", "Adds drone imagery → re‑interviews image path → Bot V2", "Only the imaging pipeline is re‑interviewed."),
    ],
  },
];

function Node({ step, accent }: { step: Step; accent?: boolean }) {
  return (
    <div className="group/node relative">
      <div
        tabIndex={0}
        className={`flex items-start gap-2 rounded-xl border bg-paper px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brick ${
          accent ? "border-brick" : "border-line"
        }`}
      >
        <span aria-hidden className="text-base leading-5">{step.icon}</span>
        <span>
          <span className={`block font-display text-xs font-semibold uppercase tracking-wide ${accent ? "text-brick" : "text-ink/60"}`}>
            {step.label}
          </span>
          <span className="text-ink/85">{step.text}</span>
        </span>
      </div>
      <div
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-60 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-xs text-paper opacity-0 shadow-lg transition group-hover/node:opacity-100 group-focus-within/node:opacity-100"
      >
        {step.tip}
      </div>
    </div>
  );
}

function Arrow({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-1 pl-6" aria-hidden>
      <svg width="12" height="22" viewBox="0 0 12 22" className="text-ink/40">
        <path d="M6 0v18M1 14l5 6 5-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {label && <span className="text-[11px] text-ink/50">{label}</span>}
    </div>
  );
}

function Flow({ sc }: { sc: Scenario }) {
  const [ctx, ana, int, gen, ver] = sc.steps;
  return (
    <article className="min-h-[260px] rounded-2xl border border-line bg-cream p-5 transition hover:-translate-y-1 hover:shadow-lg">
      <h4 className="mb-4 font-display text-lg font-semibold">{sc.name}</h4>
      <Node step={ctx} />
      <Arrow label="uploads" />
      <Node step={ana} />
      <Arrow label="finds gaps" />
      <div className="flex items-center gap-3 pl-1">
          <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0" aria-hidden>
            <path
              d="M32 3 L61 32 L32 61 L3 32 Z"
              className="fill-paper stroke-mustard"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <text x="32" y="39" textAnchor="middle" className="fill-ink font-display" fontSize="22" fontWeight="600">
              ?
            </text>
          </svg>
        <div className="text-xs text-ink/70">
          <p className="font-medium text-ink">{sc.decision}</p>
          <p>
            <span className="text-moss">yes →</span> skip ahead · <span className="text-brick">no ↓</span> interview
          </p>
        </div>
      </div>
      <Arrow label="no" />
      <Node step={int} />
      <Arrow label="answers" />
      <Node step={gen} accent />
      <Arrow label="project changes" />
      <Node step={ver} />
    </article>
  );
}

export function ScenarioFlows() {
  return (
    <section id="in-action" className="border-t border-line bg-paper py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="font-display text-3xl font-semibold md:text-4xl">See MOMMA in Action</h2>
        <h3 className="mt-2 text-base text-ink/60">See how MOMMA adapts to real‑world projects</h3>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {scenarios.map((sc) => (
            <Flow key={sc.name} sc={sc} />
          ))}
        </div>
      </div>
    </section>
  );
}
