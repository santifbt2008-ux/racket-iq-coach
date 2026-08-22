import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Page, RacketVisual, ScoreBar, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DATA_DISCLAIMER, getRacket, racketName } from "@/data/rackets";
import { IMAGE_POLICY_NOTE } from "@/data/racket-media";
import { recommend, recommendCustomization, recommendGrip, recommendString } from "@/lib/engine";
import { useStoredProfile } from "@/lib/profile";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Tu Match de RacketIQ — resultados personalizados de raqueta" },
      {
        name: "description",
        content:
          "Tus 3 mejores raquetas, puntajes de coincidencia transparentes y un plan personalizado de encordado y configuración.",
      },
      { property: "og:title", content: "Tu Match de RacketIQ" },
      {
        property: "og:description",
        content: "Las mejores raquetas para ti, desglose del puntaje de coincidencia y una configuración personalizada.",
      },
    ],
  }),
  component: Results,
});

const PHASES = [
  "Analizando tu juego...",
  "Comparando tu perfil con nuestra base de datos de raquetas...",
  "Construyendo tu configuración personalizada...",
];

function Results() {
  const { profile, loading } = useStoredProfile();
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading || !profile) return;
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setDone(true), 2600);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [loading, profile]);

  const matches = useMemo(() => (profile ? recommend(profile, 3) : []), [profile]);

  if (loading) return null;

  if (!profile || !profile.level) {
    return (
      <>
        <SiteHeader />
        <Page>
          <div className="panel mx-auto max-w-lg p-10 text-center">
            <h1 className="text-display text-3xl font-extrabold">Aún no tienes un perfil</h1>
            <p className="mt-3 text-muted-foreground">
              Completa el cuestionario y RacketIQ construirá tu match personalizado.
            </p>
            <Link
              to="/find-my-racket"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Encuentra Mi Raqueta <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Page>
        <SiteFooter />
      </>
    );
  }

  if (!done) {
    return (
      <>
        <SiteHeader />
        <Page>
          <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center text-center">
            <div className="h-14 w-14 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-display mt-8 text-2xl font-extrabold">{PHASES[phase]}</p>
            <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${((phase + 1) / PHASES.length) * 100}%` }}
              />
            </div>
          </div>
        </Page>
      </>
    );
  }

  const [top, second, third] = matches;
  if (!top) return null;

  const stringSetup = recommendString(profile, top.racket);
  const grip = recommendGrip(profile);
  const custom = recommendCustomization(profile, top.racket);
  const current = profile.currentRacketId ? getRacket(profile.currentRacketId) : undefined;

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Tu Match de RacketIQ</p>
              <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">
                Construido a partir de tus respuestas de nivel {profile.level.toLowerCase()}, no de promedios.
              </h1>
              {current && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Actualmente juegas con: {racketName(current)}
                </p>
              )}
            </div>
            <Link
              to="/find-my-racket"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" /> Repetir cuestionario
            </Link>
          </div>

          {/* Primary match */}
          <section className="panel elevated mt-10 grid gap-8 p-6 md:grid-cols-[.8fr_1.2fr] md:p-10">
            <RacketVisual
              label={racketName(top.racket)}
              image={top.racket.image}
              className="min-h-[320px]"
            />
            <div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                Match #1
              </span>
              <h2 className="text-display mt-5 text-4xl font-extrabold">
                {racketName(top.racket)}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {top.racket.brand} · {top.racket.year} · {top.racket.head_size} sq in ·{" "}
                {top.racket.weight}g · {top.racket.string_pattern}
              </p>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-display text-6xl font-extrabold text-primary">
                  {top.overall}%
                </span>
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  Coincidencia
                </span>
              </div>

              <h3 className="mt-8 text-lg font-bold">Especificaciones clave</h3>
              <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {(
                  [
                    ["Tamaño de cabeza", `${top.racket.head_size} sq in`],
                    ["Peso (encordada)", `${top.racket.strung_weight} g`],
                    ["Peso (sin encordar)", `${top.racket.unstrung_weight} g`],
                    ["Balance", `${top.racket.balance} cm`],
                    ["Swingweight", `${top.racket.swingweight}`],
                    ["Aro (beam)", `${top.racket.beam} mm`],
                    ["Patrón de encordado", top.racket.string_pattern],
                    ["Rigidez", `${top.racket.stiffness} RA`],
                    ["Tensión rec.", `${top.racket.tension_min}–${top.racket.tension_max} lbs`],
                    ["Composición", top.racket.composition],
                    ["Tolerancia (est.)", `${top.racket.forgiveness_score}/10`],
                  ] as [string, string][]
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between border-b border-border pb-1.5 text-sm"
                  >
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mt-8 text-lg font-bold">Por qué encaja con tu juego</h3>
              <ul className="mt-3 space-y-3">
                {top.reasons.map((r) => (
                  <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <Link
                  to="/explore/$racketId"
                  params={{ racketId: top.racket.id }}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Ver especificaciones completas <ArrowRight className="h-4 w-4" />
                </Link>
                {top.racket.product_link && (
                  <a
                    href={top.racket.product_link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    {top.racket.product_link.label} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
              {!top.racket.image && (
                <p className="mt-4 text-xs text-muted-foreground">{IMAGE_POLICY_NOTE}</p>
              )}
            </div>
          </section>

          {/* Match score breakdown */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">Desglose del puntaje de coincidencia</h2>
            <div className="panel mt-6 p-6 md:p-8">
              <div className="mb-6 flex items-baseline gap-3 border-b border-border pb-6">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">
                  Coincidencia General
                </span>
                <span className="text-display text-3xl font-extrabold text-primary">
                  {top.overall}%
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {top.dimensions.map((d) => (
                  <ScoreBar key={d.key} label={d.label} value={d.score} />
                ))}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Los puntajes se calculan comparando tus respuestas con los atributos de cada raqueta en
                nuestra base de datos, ponderados según las prioridades que definiste. {DATA_DISCLAIMER}
              </p>
            </div>
          </section>

          {/* Runners up */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">También son buenas opciones para ti</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[second, third].filter(Boolean).map((m, i) => (
                <div key={m!.racket.id} className="panel flex flex-col p-6">
                  <span className="eyebrow">Match #{i + 2}</span>
                  <h3 className="text-display mt-3 text-2xl font-extrabold">
                    {racketName(m!.racket)}
                  </h3>
                  <p className="text-sm text-muted-foreground">{m!.racket.brand}</p>
                  <span className="text-display mt-4 text-4xl font-extrabold text-primary">
                    {m!.overall}%
                  </span>
                  <p className="mt-4 flex-1 text-sm text-muted-foreground">{m!.reasons[0]}</p>
                  <Link
                    to="/explore/$racketId"
                    params={{ racketId: m!.racket.id }}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    Ver Detalles <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* String setup */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">Tu Configuración Recomendada</h2>
            <div className="panel mt-6 grid gap-6 p-6 md:grid-cols-3 md:p-8">
              <Stat label="Encordado" value={stringSetup.string} sub={stringSetup.type} />
              <Stat
                label="Calibre"
                value={stringSetup.gauge}
                sub="Más delgado = más efecto, menor duración"
              />
              <Stat label="Tensión" value={stringSetup.tension} sub="Un rango, no un número único" />
              <div className="md:col-span-3">
                <p className="text-sm text-muted-foreground">{stringSetup.rationale}</p>
                <ul className="mt-4 space-y-2">
                  {stringSetup.notes.map((n) => (
                    <li key={n} className="flex gap-3 text-sm text-muted-foreground">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Grip, overgrip & dampener */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">Grip y Accesorios</h2>
            <div className="panel mt-6 grid gap-6 p-6 md:grid-cols-3 md:p-8">
              <Stat label="Tamaño de grip" value={grip.size} sub={grip.rationale} />
              <Stat
                label="Overgrip"
                value={grip.overgrip.split(" — ")[0] ?? grip.overgrip}
                sub={grip.overgrip.split(" — ")[1] ?? ""}
              />
              <Stat
                label="Amortiguador"
                value={grip.dampener.split(" — ")[0] ?? grip.dampener}
                sub={grip.dampener.split(" — ")[1] ?? ""}
              />
            </div>
          </section>

          {/* Customization */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">¿Deberías Personalizarla?</h2>
            <div className="panel mt-6 p-6 md:p-8">
              <p className="text-muted-foreground">{custom.summary}</p>
              {custom.needed && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {custom.suggestions.map((s) => (
                    <div
                      key={s.item}
                      className="rounded-xl border border-border bg-surface-strong p-5"
                    >
                      <p className="font-semibold">{s.item}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Objetivo: {s.goal}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Comparar estas raquetas <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary"
            >
              Explorar Raquetas
            </Link>
          </div>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-strong p-5">
      <p className="eyebrow">{label}</p>
      <p className="text-display mt-3 text-xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
