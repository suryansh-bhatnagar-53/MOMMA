export function SiteHeader() {
  return (
    <header className="bg-paper">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center justify-between py-5">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              M.O.M.M.A.
            </span>
            <span className="hidden text-xs text-ink/50 sm:inline">
              My Online Mentor &amp; Model Architect
            </span>
          </div>
          <nav aria-label="Main" className="flex items-center gap-6 text-sm font-medium text-ink/70">
            <a href="#how" className="transition-colors hover:text-ink">
              How it works
            </a>
            <a href="#inside" className="hidden transition-colors hover:text-ink sm:inline">
              Under the hood
            </a>
            <a href="#faq" className="hidden transition-colors hover:text-ink sm:inline">
              FAQ
            </a>
            <a href="#start" className="font-semibold text-ink transition-colors hover:text-brick">
              Get Started →
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
