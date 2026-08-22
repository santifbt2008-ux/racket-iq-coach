import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Page, RacketVisual, ScoreBar, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useStoredProfile } from "@/lib/profile";
import { useRackets } from "@/lib/use-rackets";
import {
  recommend,
  recommendCustomization,
  recommendGrip,
  recommendString,
  type MatchResult,
} from "@/lib/engine";
import { DERIVED_NOTE, racketName } from "@/lib/racket-engine";
import { CATALOG_DISCLAIMER } from "@/lib/racket-db";
import { formatMXN } from "@/lib/format";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Tus raquetas recomendadas — RacketIQ" },
      {
        name: "description",
        content:
          "Tus tres mejores coincidencias de raqueta con puntuación, razones, cuerda, tensión y personalización sugerida.",
      },
      { property: "og:title", content: "Tus raquetas recomendadas — RacketIQ" },
      {
        property: "og:description",
        content: "Resultados personalizados de raqueta, cuerda y tensión según tu perfil de juego.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Results,
});

function Spec({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value === null || value === undefined || value === "" ? "Sin dato" : value}</div>
    </div>
  );
}

function Results() {
  const { profile, loading } = useStoredProfile();
  const { rackets, isLoading: loadingRackets } = useRackets();
  const [analyzing, setAnalyzing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAnalyzing(false), 900);
    return () => clearTimeout(t);
  }, []);

  const results: MatchResult[] = useMemo(
    () => (profile && rackets.length ? recommend(profile, rackets, 3) : []),
    [profile, rackets],
  );

  const busy = loading || loadingRackets || analyzing;

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          {busy && (
            <div className="panel grid min-h-[50vh] place-items-center p-10 text-center">
              <div>
                <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
                <p className="mt-5 text-lg font-semibold">Analizando tu perfil de juego…</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comparando tus respuestas con {rackets.length || "las"} raquetas del catálogo.
                </p>
              </div>
            </div>
          )}

          {!busy && !profile && (
            <div className="panel p-10 text-center">
              <h1 className="text-display text-3xl font-extrabold">Aún no tenemos tu perfil</h1>
              <p className="mt-3 text-muted-foreground">
                Responde el cuestionario para ver tus recomendaciones.
              </p>
              <Link
                to="/find-my-racket"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
              >
                Empezar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!busy && profile && !results.length && (
            <div className="panel p-10 text-center">
              <h1 className="text-display text-3xl font-extrabold">No hay raquetas disponibles</h1>
              <p className="mt-3 text-muted-foreground">
                No pudimos cargar el catálogo. Intenta de nuevo en unos segundos.
              </p>
            </div>
          )}

          {!busy && profile && results.length > 0 && (
            <ResultsBody results={results} profile={profile} />
          )}
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}

function ResultsBody({
  results,
  profile,
}: {
  results: MatchResult[];
  profile: NonNullable<ReturnType<typeof useStoredProfile>["profile"]>;
}) {
  const best = results[0]!;
  const strings = recommendString(profile, best.racket);
  const grip = recommendGrip(profile);
  const custom = recommendCustomization(profile, best.racket);

  return (
    <>
      <p className="eyebrow">Tu mejor coincidencia</p>
      <section className="panel elevated mt-4 grid gap-8 p-6 md:grid-cols-[.85fr_1.15fr] md:p-10">
        <RacketVisual label={racketName(best.racket)} image={best.racket.image_url} />
        <div>
          <div className="flex items-baseline gap-4">
            <span className="text-display text-6xl font-extrabold text-primary">
              {best.overall}%
            </span>
            <span className="text-sm uppercase tracking-widest text-muted-foreground">
              Coincidencia
            </span>
          </div>
          <h1 className="text-display mt-3 text-4xl font-extrabold">{racketName(best.racket)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[best.racket.year, best.racket.racket_type].filter(Boolean).join(" · ")}
            {best.racket.price != null ? ` · ${formatMXN(best.racket.price)}` : ""}
          </p>

          <h2 className="mt-7 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Por qué coincide contigo
          </h2>
          <ul className="mt-3 space-y-2">
            {best.reasons.map((r) => (
              <li key={r} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {r}
              </li>
            ))}
          </ul>

          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Spec label="Head" value={best.racket.head_size ? `${best.racket.head_size} in²` : null} />
            <Spec label="Peso" value={best.racket.weight ? `${best.racket.weight} g` : null} />
            <Spec label="Balance" value={best.racket.balance ? `${best.racket.balance} cm` : null} />
            <Spec label="Patrón" value={best.racket.string_pattern} />
            <Spec label="Swingweight" value={best.racket.swingweight} />
            <Spec label="Rigidez (RA)" value={best.racket.stiffness} />
            <Spec label="Perfil" value={best.racket.beam} />
            <Spec label="Largo" value={best.racket.length ? `${best.racket.length} in` : null} />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/catalog/$slug"
              params={{ slug: best.racket.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            >
              Ver ficha completa <ArrowRight className="h-4 w-4" />
            </Link>
            {best.racket.product_url && (
              <a
                href={best.racket.product_url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold"
              >
                Sitio del fabricante <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      <h2 className="text-display mt-16 text-3xl font-extrabold">Cómo se calculó tu coincidencia</h2>
      <div className="panel mt-5 grid gap-5 p-6 sm:grid-cols-2 md:p-8">
        {best.dimensions.map((d) => (
          <ScoreBar key={d.key} label={d.label} value={d.score} />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{DERIVED_NOTE}</p>

      <h2 className="text-display mt-16 text-3xl font-extrabold">Otras opciones para ti</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {results.slice(1).map((m) => (
          <article key={m.racket.id} className="panel p-6">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold">{racketName(m.racket)}</h3>
              <span className="text-display text-2xl font-extrabold text-primary">{m.overall}%</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{m.reasons[0]}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Spec label="Head" value={m.racket.head_size ? `${m.racket.head_size} in²` : null} />
              <Spec label="Peso" value={m.racket.weight ? `${m.racket.weight} g` : null} />
              <Spec label="Patrón" value={m.racket.string_pattern} />
              <Spec label="Precio" value={m.racket.price != null ? formatMXN(m.racket.price) : null} />
            </div>
            <Link
              to="/catalog/$slug"
              params={{ slug: m.racket.slug }}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              Ver ficha <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </div>

      <h2 className="text-display mt-16 text-3xl font-extrabold">Cuerda y tensión sugeridas</h2>
      <div className="panel mt-5 space-y-4 p-6 md:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <Spec label="Cuerda" value={strings.string} />
          <Spec label="Calibre" value={strings.gauge} />
          <Spec label="Tensión" value={strings.tension} />
        </div>
        <p className="text-sm text-muted-foreground">{strings.rationale}</p>
        <ul className="space-y-1.5">
          {strings.notes.map((n) => (
            <li key={n} className="text-sm text-muted-foreground">
              · {n}
            </li>
          ))}
        </ul>
        <Link to="/strings" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Afinar cuerdas y tensión <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <h2 className="text-display mt-16 text-3xl font-extrabold">Grip y personalización</h2>
      <div className="panel mt-5 space-y-4 p-6 md:p-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <Spec label="Tamaño de grip" value={grip.size} />
          <Spec label="Overgrip" value={grip.overgrip} />
          <Spec label="Amortiguador" value={grip.dampener} />
        </div>
        <p className="text-sm text-muted-foreground">{grip.rationale}</p>
        <p className="text-sm text-muted-foreground">{custom.summary}</p>
        {custom.suggestions.map((s) => (
          <div key={s.item} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold">{s.item}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.goal}</p>
          </div>
        ))}
        <Link to="/modify" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Probar modificaciones <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-16 flex flex-wrap gap-3">
        <Link to="/compare" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
          Comparar raquetas
        </Link>
        <Link to="/catalog" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
          Ver todo el catálogo
        </Link>
        <Link to="/find-my-racket" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
          Volver a responder
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">{CATALOG_DISCLAIMER}</p>
    </>
  );
}
