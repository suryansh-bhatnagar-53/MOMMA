import renata from "@/assets/testimonial-renata.jpg";
import marcus from "@/assets/testimonial-marcus.jpg";
import priya from "@/assets/testimonial-priya.jpg";

const items = [
  {
    quote:
      "Saved about six hours a week on bot setup — it knew our seasonal pricing before I finished explaining it.",
    name: "Renata Voss",
    role: "Guide, Harbor Kayaks",
    image: renata,
  },
  {
    quote:
      "I generated my first bot without writing a single prompt. It asked about refund edge cases I'd been dodging for months.",
    name: "Marcus Idris",
    role: "Founder, Fieldline Supply",
    image: marcus,
  },
  {
    quote:
      "When our scope changed, the bot updated — no re-explaining everything from the start.",
    name: "Priya Nandakumar",
    role: "Ops Lead, Lumen Café",
    image: priya,
  },
];

export function Testimonials() {
  return (
    <section className="bg-cream" aria-labelledby="proof-heading">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2
          id="proof-heading"
          className="mb-10 max-w-[30ch] text-balance font-display text-3xl font-semibold tracking-tight text-ink"
        >
          What people actually got out of it.
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <figure
              key={item.name}
              className="rounded-[min(1.5vw,18px)] bg-paper p-6 ring-1 ring-black/5"
            >
              <blockquote className="text-base text-pretty text-ink/80">“{item.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  width={816}
                  height={816}
                  className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
                />
                <span>
                  <span className="block text-sm font-semibold text-ink">{item.name}</span>
                  <span className="block text-xs text-ink/55">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
