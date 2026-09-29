import { Link } from "@tanstack/react-router";

export function CtaFooter() {
  return (
    <footer id="start" className="bg-brick">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <span aria-hidden="true" className="text-2xl leading-none text-cream/80">
          🛡
        </span>
        <h2 className="mx-auto max-w-[20ch] text-balance font-display text-4xl font-semibold tracking-tight text-cream sm:text-5xl">
          Stop rebuilding. Start building your project.
        </h2>
        <p className="mx-auto mt-4 max-w-[44ch] text-base text-pretty text-cream/75">
          Bring whatever you have. MOMMA will take it from there.
        </p>
        <Link
          to="/auth"
          search={{ tab: "signup" }}
          className="mt-8 inline-block rounded-xl bg-cream px-8 py-4 text-base font-semibold text-brick ring-1 ring-cream/40 transition-colors hover:bg-cream/90"
        >
          Get Started →
        </Link>
        <p className="mt-10 text-xs text-cream/50">
          M.O.M.M.A. — My Online Mentor &amp; Model Architect
        </p>
      </div>
    </footer>
  );
}
