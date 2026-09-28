import { useState } from "react";

const EXAMPLE = "I'm building a task app for remote teams";
const KEYWORDS = ["collaboration", "deadlines", "notifications", "time zones"];

type Stage = "idle" | "analyzed" | "answered" | "packaged";

export function ContextDemo() {
  const [text, setText] = useState("");
  const [stage, setStage] = useState<Stage>("idle");

  const reset = () => {
    setText("");
    setStage("idle");
  };

  return (
    <section className="bg-cream" aria-labelledby="demo-heading">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 max-w-[40ch]">
          <h2
            id="demo-heading"
            className="text-balance font-display text-3xl font-semibold tracking-tight text-ink"
          >
            Analyze first. Then ask the right questions.
          </h2>
          <p className="mt-3 text-base text-pretty text-ink/65">
            A walkthrough, not a live product: type a project, and watch MOMMA turn it into a working
            model — then surface the specifics a generic bot would never catch.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[min(1.5vw,18px)] bg-paper p-6 ring-1 ring-black/5">
            <div className="mb-5 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="grid size-5 place-items-center rounded-md bg-moss font-display text-[10px] text-cream"
              >
                A
              </span>
              <span className="text-xs font-medium tracking-[0.16em] text-ink/50 uppercase">
                Reading context
              </span>
            </div>

            <label htmlFor="demo-project" className="text-sm text-ink/70">
              Describe your project
            </label>
            <textarea
              id="demo-project"
              rows={3}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setStage("idle");
              }}
              placeholder={EXAMPLE}
              className="mt-2 w-full resize-none rounded-lg bg-cream px-3 py-2.5 text-sm text-ink ring-1 ring-black/5 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-brick/40"
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!text.trim()) setText(EXAMPLE);
                  setStage("analyzed");
                }}
                className="rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-ink/90"
              >
                Analyze
              </button>
              {stage !== "idle" ? (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs font-medium text-ink/55 transition-colors hover:text-ink"
                >
                  Reset demo
                </button>
              ) : null}
            </div>

            {stage !== "idle" ? (
              <div className="mt-5" aria-live="polite">
                <p className="text-xs tracking-[0.16em] text-ink/45 uppercase">Extracted</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {KEYWORDS.map((word, index) => (
                    <span
                      key={word}
                      className="tag-mat rounded-md bg-cream px-2.5 py-1 text-xs font-medium text-ink/75 ring-1 ring-black/5"
                      style={{ animationDelay: `${index * 0.12}s` }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="node-pulse size-2.5 shrink-0 rounded-full bg-moss" />
                    <span className="text-sm text-ink/75">Detected 12 user-facing flows</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="node-pulse-2 size-2.5 shrink-0 rounded-full bg-mustard" />
                    <span className="text-sm text-ink/75">Found: async teams, shifting deadlines</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="node-pulse size-2.5 shrink-0 rounded-full bg-brick" />
                    <span className="text-sm text-ink/75">Gap: notification rules unclear</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[min(1.5vw,18px)] bg-ink p-6">
            <div className="mb-5 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="grid size-5 place-items-center rounded-md bg-brick font-display text-[10px] text-cream"
              >
                Q
              </span>
              <span className="text-xs font-medium tracking-[0.16em] text-cream/50 uppercase">
                Interviewing you
              </span>
            </div>

            {stage === "idle" ? (
              <p className="text-sm text-cream/60">
                Analyze a project on the left, and MOMMA's first question appears here.
              </p>
            ) : (
              <div className="space-y-4" aria-live="polite">
                <div className="tag-mat">
                  <p className="text-xs text-mustard/80">Question 1 of 4</p>
                  <p className="mt-1 text-sm font-medium text-cream/90">
                    How do you envision notifications working across time zones?
                  </p>
                </div>

                {stage === "analyzed" ? (
                  <div className="tag-mat flex flex-wrap gap-2" style={{ animationDelay: ".2s" }}>
                    <button
                      type="button"
                      onClick={() => setStage("answered")}
                      className="rounded-lg bg-cream/10 px-3 py-2 text-xs font-medium text-cream/90 transition-colors hover:bg-cream/20"
                    >
                      Quiet hours per person
                    </button>
                    <button
                      type="button"
                      onClick={() => setStage("answered")}
                      className="rounded-lg bg-cream/10 px-3 py-2 text-xs font-medium text-cream/90 transition-colors hover:bg-cream/20"
                    >
                      Always send instantly
                    </button>
                  </div>
                ) : null}

                {stage === "answered" || stage === "packaged" ? (
                  <>
                    <div className="tag-mat rounded-lg bg-cream/10 px-3 py-2.5">
                      <p className="text-xs text-cream/50">Your answer</p>
                      <p className="mt-1 text-sm text-cream/90">
                        Quiet hours per person — nobody gets pinged at 3am.
                      </p>
                    </div>
                    <div
                      className="tag-mat rounded-lg bg-cream/10 px-3 py-2.5"
                      style={{ animationDelay: ".25s" }}
                    >
                      <p className="text-xs text-mustard/80">Bot update</p>
                      <p className="mt-1 text-sm text-cream/90">
                        Added per-member quiet hours to the model.
                      </p>
                    </div>
                  </>
                ) : null}

                {stage === "answered" ? (
                  <button
                    type="button"
                    onClick={() => setStage("packaged")}
                    className="rounded-lg bg-brick px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-brick/90"
                  >
                    Draft the bot package
                  </button>
                ) : null}

                {stage === "packaged" ? (
                  <div className="tag-mat rounded-lg bg-cream/10 px-3 py-3">
                    <p className="text-xs text-mustard/80">Bot package</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[".json", ".md", ".prompt"].map((file) => (
                        <span
                          key={file}
                          className="rounded-md bg-cream/10 px-2.5 py-1 font-display text-xs text-cream/85"
                        >
                          {file}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-cream/55">
                      Illustration only — nothing is generated or downloaded here.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
