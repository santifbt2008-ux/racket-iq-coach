import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Gauge, Layers, Sparkles, Wrench } from "lucide-react";
import { Page, RacketVisual, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DATA_DISCLAIMER } from "@/data/rackets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RacketIQ — Find the tennis racket that fits your game" },
      {
        name: "description",
        content:
          "Answer a few questions about your game and get a personalized tennis racket, string, tension and customization recommendation.",
      },
      { property: "og:title", content: "RacketIQ — Find the racket that actually fits your game" },
      {
        property: "og:description",
        content: "Personalized racket, string and tension recommendations built from your playing profile.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  { n: "01", title: "Tell us about your game", body: "Level, style, priorities and what you play with today." },
  { n: "02", title: "Analyze your playing profile", body: "Your answers are weighted against every racket's specs." },
  { n: "03", title: "Get your personalized setup", body: "Racket, string, tension and customization guidance." },
];

const why = [
  { icon: Sparkles, title: "Personalized recommendations", body: "Scored against your priorities, not a bestseller list." },
  { icon: Layers, title: "Racket-to-racket comparisons", body: "Compare up to three frames spec by spec." },
  { icon: Gauge, title: "String & tension recommendations", body: "A sensible tension range, not a fake perfect number." },
  { icon: Wrench, title: "Customization recommendations", body: "Only when your profile actually justifies it." },
  { icon: BarChart3, title: "Transparent match scoring", body: "See exactly which dimensions drove the match." },
  { icon: ArrowRight, title: "Explanations you can act on", body: "Every reason traces back to an answer you gave." },
];

function Landing() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="court-grid border-b border-border/60">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="eyebrow">AI-powered equipment intelligence</p>
              <h1 className="text-display mt-5 text-5xl font-extrabold sm:text-6xl lg:text-7xl">
                Find the racket that actually fits your game.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Answer a few questions about your game and get a personalized racket, string, tension, and setup
                recommendation.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/find-my-racket"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Find My Racket <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center rounded-full border border-border px-7 py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Explore Rackets
                </Link>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">{DATA_DISCLAIMER}</p>
            </div>
            <RacketVisual label="RacketIQ" className="min-h-[380px]" />
          </div>
        </section>

        <Page>
          <p className="eyebrow">How it works</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="panel p-7">
                <span className="text-display text-3xl font-extrabold text-primary">{s.n}</span>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-display mt-24 text-4xl font-extrabold">Why RacketIQ?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {why.map((w) => (
              <div key={w.title} className="panel p-6 transition-colors hover:bg-surface-strong">
                <w.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 text-lg font-bold">{w.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{w.body}</p>
              </div>
            ))}
          </div>

          <section className="panel elevated mt-24 grid gap-8 p-8 md:grid-cols-[.9fr_1.1fr] md:p-12">
            <RacketVisual label="Yonex VCORE 98" className="min-h-[300px]" />
            <div className="flex flex-col justify-center">
              <p className="eyebrow">Example recommendation</p>
              <div className="mt-4 flex items-baseline gap-4">
                <span className="text-display text-6xl font-extrabold text-primary">94%</span>
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Match</span>
              </div>
              <h3 className="text-display mt-4 text-3xl font-extrabold">Yonex VCORE 98</h3>
              <p className="mt-4 text-muted-foreground">
                “Built for players who want aggressive spin and speed while maintaining control and stability.”
              </p>
              <Link
                to="/find-my-racket"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Get your match <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
