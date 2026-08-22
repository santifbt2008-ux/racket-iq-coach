import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Gauge, Layers, Sparkles, Wrench } from "lucide-react";
import { Page, RacketVisual, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DATA_DISCLAIMER } from "@/data/rackets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RacketIQ — Encuentra la raqueta de tenis que se adapta a tu juego" },
      {
        name: "description",
        content:
          "Responde algunas preguntas sobre tu juego y obtén una recomendación personalizada de raqueta de tenis, cordaje, tensión y personalización.",
      },
      { property: "og:title", content: "RacketIQ — Encuentra la raqueta que realmente se adapta a tu juego" },
      {
        property: "og:description",
        content: "Recomendaciones personalizadas de raqueta, cordaje y tensión basadas en tu perfil de juego.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  { n: "01", title: "Cuéntanos sobre tu juego", body: "Nivel, estilo, prioridades y con qué juegas hoy." },
  { n: "02", title: "Analizamos tu perfil de juego", body: "Tus respuestas se comparan con las especificaciones de cada raqueta." },
  { n: "03", title: "Obtén tu configuración personalizada", body: "Guía de raqueta, cordaje, tensión y personalización." },
];

const why = [
  { icon: Sparkles, title: "Recomendaciones personalizadas", body: "Evaluadas según tus prioridades, no una lista de los más vendidos." },
  { icon: Layers, title: "Comparaciones raqueta a raqueta", body: "Compara hasta tres modelos especificación por especificación." },
  { icon: Gauge, title: "Recomendaciones de cordaje y tensión", body: "Un rango de tensión sensato, no un número perfecto ficticio." },
  { icon: Wrench, title: "Recomendaciones de personalización", body: "Solo cuando tu perfil realmente lo justifica." },
  { icon: BarChart3, title: "Puntuación de coincidencia transparente", body: "Mira exactamente qué factores impulsaron la coincidencia." },
  { icon: ArrowRight, title: "Explicaciones sobre las que puedes actuar", body: "Cada razón se remonta a una respuesta que diste." },
];

function Landing() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="court-grid border-b border-border/60">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1.15fr_.85fr]">
            <div>
              <p className="eyebrow">Inteligencia de equipamiento con IA</p>
              <h1 className="text-display mt-5 text-5xl font-extrabold sm:text-6xl lg:text-7xl">
                Encuentra la raqueta que realmente se adapta a tu juego.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Responde algunas preguntas sobre tu juego y obtén una recomendación personalizada de raqueta,
                cordaje, tensión y configuración.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  to="/find-my-racket"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  Encuentra tu raqueta <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/explore"
                  className="inline-flex items-center rounded-full border border-border px-7 py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Explorar raquetas
                </Link>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">{DATA_DISCLAIMER}</p>
            </div>
            <RacketVisual label="RacketIQ" className="min-h-[380px]" />
          </div>
        </section>

        <Page>
          <p className="eyebrow">Cómo funciona</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="panel p-7">
                <span className="text-display text-3xl font-extrabold text-primary">{s.n}</span>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>

          <h2 className="text-display mt-24 text-4xl font-extrabold">¿Por que RacketIQ?</h2>
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
              <p className="eyebrow">Ejemplo de recomendación</p>
              <div className="mt-4 flex items-baseline gap-4">
                <span className="text-display text-6xl font-extrabold text-primary">94%</span>
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Coincidencia</span>
              </div>
              <h3 className="text-display mt-4 text-3xl font-extrabold">Yonex VCORE 98</h3>
              <p className="mt-4 text-muted-foreground">
                "Diseñada para jugadores que buscan efecto y velocidad agresivos manteniendo control y estabilidad."
              </p>
              <Link
                to="/find-my-racket"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Obtén tu coincidencia <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
