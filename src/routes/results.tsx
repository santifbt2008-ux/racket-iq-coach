import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Page, RacketVisual, ScoreBar, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DATA_DISCLAIMER, getRacket, racketName } from "@/data/rackets";
import { recommend, recommendCustomization, recommendString } from "@/lib/engine";
import { useStoredProfile } from "@/lib/profile";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your RacketIQ Match — personalized racket results" },
      {
        name: "description",
        content: "Your top 3 racket matches, transparent match scores, and a personalized string and setup plan.",
      },
      { property: "og:title", content: "Your RacketIQ Match" },
      { property: "og:description", content: "Top racket matches, match-score breakdown and a personalized setup." },
    ],
  }),
  component: Results,
});

const PHASES = [
  "Analyzing your game...",
  "Comparing your profile against our racket database...",
  "Building your personalized setup...",
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
            <h1 className="text-display text-3xl font-extrabold">No profile yet</h1>
            <p className="mt-3 text-muted-foreground">
              Complete the questionnaire and RacketIQ will build your personalized match.
            </p>
            <Link
              to="/find-my-racket"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Find My Racket <ArrowRight className="h-4 w-4" />
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
  const custom = recommendCustomization(profile, top.racket);
  const current = profile.currentRacketId ? getRacket(profile.currentRacketId) : undefined;

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Your RacketIQ Match</p>
              <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">
                Built from {profile.level.toLowerCase()} answers, not averages.
              </h1>
              {current && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Currently playing: {racketName(current)}
                </p>
              )}
            </div>
            <Link
              to="/find-my-racket"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
            >
              <RotateCcw className="h-4 w-4" /> Retake questionnaire
            </Link>
          </div>

          {/* Primary match */}
          <section className="panel elevated mt-10 grid gap-8 p-6 md:grid-cols-[.8fr_1.2fr] md:p-10">
            <RacketVisual label={racketName(top.racket)} className="min-h-[320px]" />
            <div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                #1 Match
              </span>
              <h2 className="text-display mt-5 text-4xl font-extrabold">{racketName(top.racket)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {top.racket.brand} · {top.racket.generation} · {top.racket.head_size} sq in · {top.racket.weight}g ·{" "}
                {top.racket.string_pattern}
              </p>
              <div className="mt-6 flex items-baseline gap-3">
                <span className="text-display text-6xl font-extrabold text-primary">{top.overall}%</span>
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Match</span>
              </div>
              <h3 className="mt-8 text-lg font-bold">Why it fits your game</h3>
              <ul className="mt-3 space-y-3">
                {top.reasons.map((r) => (
                  <li key={r} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/explore/$racketId"
                params={{ racketId: top.racket.id }}
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                View full specifications <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Match score breakdown */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">Match score breakdown</h2>
            <div className="panel mt-6 p-6 md:p-8">
              <div className="mb-6 flex items-baseline gap-3 border-b border-border pb-6">
                <span className="text-sm uppercase tracking-widest text-muted-foreground">Overall Match</span>
                <span className="text-display text-3xl font-extrabold text-primary">{top.overall}%</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {top.dimensions.map((d) => (
                  <ScoreBar key={d.key} label={d.label} value={d.score} />
                ))}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Scores are computed by comparing your answers against each racket's attributes in our database, weighted
                by the priorities you set. {DATA_DISCLAIMER}
              </p>
            </div>
          </section>

          {/* Runners up */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">Also strong for you</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[second, third].filter(Boolean).map((m, i) => (
                <div key={m!.racket.id} className="panel flex flex-col p-6">
                  <span className="eyebrow">#{i + 2} Match</span>
                  <h3 className="text-display mt-3 text-2xl font-extrabold">{racketName(m!.racket)}</h3>
                  <p className="text-sm text-muted-foreground">{m!.racket.brand}</p>
                  <span className="text-display mt-4 text-4xl font-extrabold text-primary">{m!.overall}%</span>
                  <p className="mt-4 flex-1 text-sm text-muted-foreground">{m!.reasons[0]}</p>
                  <Link
                    to="/explore/$racketId"
                    params={{ racketId: m!.racket.id }}
                    className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
                  >
                    View Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* String setup */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">Your Recommended Setup</h2>
            <div className="panel mt-6 grid gap-6 p-6 md:grid-cols-3 md:p-8">
              <Stat label="String" value={stringSetup.string} sub={stringSetup.type} />
              <Stat label="Gauge" value={stringSetup.gauge} sub="Thinner = more spin, shorter life" />
              <Stat label="Tension" value={stringSetup.tension} sub="Range, not a single number" />
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

          {/* Customization */}
          <section className="mt-14">
            <h2 className="text-display text-3xl font-extrabold">Should You Customize It?</h2>
            <div className="panel mt-6 p-6 md:p-8">
              <p className="text-muted-foreground">{custom.summary}</p>
              {custom.needed && (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {custom.suggestions.map((s) => (
                    <div key={s.item} className="rounded-xl border border-border bg-surface-strong p-5">
                      <p className="font-semibold">{s.item}</p>
                      <p className="mt-2 text-sm text-muted-foreground">Goal: {s.goal}</p>
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
              Compare these rackets <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary"
            >
              Explore Rackets
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
