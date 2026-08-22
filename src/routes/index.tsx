import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { RacketChat } from "@/components/racket-chat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RacketIQ — Encuentra la raqueta para ti" },
      {
        name: "description",
        content:
          "Encuentra la raqueta de tenis para ti: pregúntale al chatbot sobre raquetas, cuerdas, tensiones y comparaciones con datos reales de nuestro catálogo.",
      },
      { property: "og:title", content: "RacketIQ — Encuentra la raqueta para ti" },
      {
        property: "og:description",
        content: "Chatbot de tenis y recomendaciones personalizadas de raqueta, cuerda y tensión.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="court-grid border-b border-border/60">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
            <h1 className="text-display text-5xl font-extrabold leading-[1.05] sm:text-6xl lg:text-7xl">
              Encuentra la raqueta para ti
            </h1>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/find-my-racket"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Empezar el cuestionario <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-12">
          <h2 className="text-display text-2xl font-extrabold">O pregúntale al chatbot de tenis</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Raquetas, cuerdas, tensiones, patrones de encordado, comparaciones y diferencias entre
            modelos.
          </p>
          <div className="mt-6">
            <RacketChat compact />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
