import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/momma/SiteHeader";
import { Hero } from "@/components/momma/Hero";
import { ScenarioFlows } from "@/components/momma/ScenarioFlows";
import { ContextDemo } from "@/components/momma/ContextDemo";
import { KnowledgeMap } from "@/components/momma/KnowledgeMap";
import { UnderTheHood } from "@/components/momma/UnderTheHood";
import { Faq } from "@/components/momma/Faq";
import { CtaFooter } from "@/components/momma/CtaFooter";

const title = "M.O.M.M.A. — Stop Rebuilding AI Assistants";
const description =
  "MOMMA understands your project through context and intelligent interviews, then generates and evolves a customized AI bot — so you never start from scratch again.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-paper font-body text-ink">
      <SiteHeader />
      <main>
        <Hero />
        <ScenarioFlows />
        <ContextDemo />
        <KnowledgeMap />
        <UnderTheHood />
        <Faq />
      </main>
      <CtaFooter />
    </div>
  );
}
