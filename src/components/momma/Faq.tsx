import { useState } from "react";

const faqs = [
  {
    q: "How is this different from a regular AI bot generator?",
    a: "Generators start from a blank prompt every time. MOMMA starts from your project — it keeps the context, so the bot is shaped by what you're building rather than by a template.",
  },
  {
    q: "What does the interview process actually feel like?",
    a: "A short, plain-language conversation about the parts only you know. Questions are specific, you can skip or pause at any point, and you're never locked inside it.",
  },
  {
    q: "Do I need to be a prompt engineering expert?",
    a: "No. You describe your project and answer a handful of pointed questions; MOMMA writes the instructions on its own.",
  },
  {
    q: "What happens when my project changes?",
    a: "Tell MOMMA what shifted and it updates the model, then re-drafts the bot. That's the point — evolving understanding, not rebuilding from scratch.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-cream" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-6 py-20">
        <h2
          id="faq-heading"
          className="mb-10 text-center text-balance font-display text-3xl font-semibold tracking-tight text-ink"
        >
          Questions, answered plainly.
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div
                key={faq.q}
                className="rounded-[min(1.5vw,14px)] bg-paper px-5 py-4 ring-1 ring-black/5"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-sm font-semibold text-ink">{faq.q}</span>
                  <span aria-hidden="true" className="text-sm text-ink/40">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <p className="tag-mat mt-2 text-sm text-pretty text-ink/65">{faq.a}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
