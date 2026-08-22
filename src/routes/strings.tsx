import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { STRINGS_DISCLAIMER, STRING_CATEGORIES, GAUGE_OPTIONS } from "@/lib/strings-db";
import { useRackets } from "@/lib/use-rackets";
import { racketName } from "@/lib/racket-engine";

export const Route = createFileRoute("/strings")({
  head: () => ({
    meta: [
      { title: "Encuentra tus cuerdas y tensión — RacketIQ" },
      {
        name: "description",
        content:
          "Elige tipo de cuerda, calibre y rango de tensión según tu swing, tus prioridades y la raqueta que usas.",
      },
      { property: "og:title", content: "Encuentra tus cuerdas y tensión — RacketIQ" },
      {
        property: "og:description",
        content: "Guía de cuerdas y tensión personalizada para tu raqueta y tu estilo de juego.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StringsPage,
});

type Swing = "slow" | "moderate" | "fast";
type Goal = "control" | "power" | "spin" | "comfort" | "durability";

const SWINGS: [Swing, string][] = [
  ["slow", "Swing corto / lento"],
  ["moderate", "Swing medio"],
  ["fast", "Swing largo y rápido"],
];

const GOALS: [Goal, string][] = [
  ["control", "Más control"],
  ["power", "Más potencia"],
  ["spin", "Más efecto"],
  ["comfort", "Más comodidad / cuidar el brazo"],
  ["durability", "Que dure más (rompo cuerdas)"],
];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function StringsPage() {
  const { rackets } = useRackets();
  const [swing, setSwing] = useState<Swing>("moderate");
  const [goals, setGoals] = useState<Goal[]>(["control"]);
  const [breaks, setBreaks] = useState(false);
  const [armSensitive, setArmSensitive] = useState(false);
  const [racketId, setRacketId] = useState("");

  const racket = rackets.find((r) => r.id === racketId) ?? null;

  const ranked = useMemo(() => {
    const w = {
      control: goals.includes("control") ? 2 : 0.6,
      power: goals.includes("power") ? 2 : 0.6,
      spin: goals.includes("spin") ? 2 : 0.6,
      comfort: (goals.includes("comfort") ? 2 : 0.6) + (armSensitive ? 1.5 : 0),
      durability: (goals.includes("durability") ? 2 : 0.4) + (breaks ? 1.5 : 0),
    };
    const swingBonus = (c: (typeof STRING_CATEGORIES)[number]) => {
      if (swing === "fast") return c.control * 0.5;
      if (swing === "slow") return c.power * 0.5 + c.comfort * 0.3;
      return 0;
    };
    return [...STRING_CATEGORIES]
      .map((c) => ({
        c,
        score:
          c.control * w.control +
          c.power * w.power +
          c.spin * w.spin +
          c.comfort * w.comfort +
          c.durability * w.durability +
          swingBonus(c),
      }))
      .sort((a, b) => b.score - a.score);
  }, [goals, swing, breaks, armSensitive]);

  const best = ranked[0]!.c;

  // Tension guidance: start from the category window and shift with goals + frame data.
  const tensionAdvice = (() => {
    const notes: string[] = [`Rango típico para ${best.name.toLowerCase()}: ${best.tension}.`];
    if (goals.includes("control")) notes.push("Sube 2 lbs si las bolas se te van largas.");
    if (goals.includes("power")) notes.push("Baja 2 lbs para ganar profundidad sin pegar más fuerte.");
    if (armSensitive) notes.push("Con brazo sensible, quédate en la parte baja del rango.");
    if (racket?.string_pattern) {
      const open = racket.string_pattern.startsWith("16");
      notes.push(
        open
          ? `La ${racketName(racket)} tiene patrón ${racket.string_pattern} (abierto): más efecto y algo menos de control, así que tensiones medias-altas suelen funcionar mejor.`
          : `La ${racketName(racket)} tiene patrón ${racket.string_pattern} (cerrado): más control y menos efecto, así que tensiones medias-bajas ayudan a recuperar potencia.`,
      );
    }
    if (racket && racket.stiffness == null)
      notes.push("No tenemos el dato de rigidez (RA) de esta raqueta en la base de datos.");
    return notes;
  })();

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Cuerdas y tensión</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold">
            Encuentra tus cuerdas y tensión
          </h1>

          <div className="panel mt-8 space-y-7 p-6 md:p-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tu swing
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {SWINGS.map(([v, l]) => (
                  <Chip key={v} active={swing === v} onClick={() => setSwing(v)}>
                    {l}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Qué buscas (puedes elegir varias)
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {GOALS.map(([v, l]) => (
                  <Chip
                    key={v}
                    active={goals.includes(v)}
                    onClick={() =>
                      setGoals((g) => (g.includes(v) ? g.filter((x) => x !== v) : [...g, v]))
                    }
                  >
                    {l}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Chip active={breaks} onClick={() => setBreaks((b) => !b)}>
                Rompo cuerdas seguido
              </Chip>
              <Chip active={armSensitive} onClick={() => setArmSensitive((a) => !a)}>
                Tengo molestias en el brazo
              </Chip>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Tu raqueta (opcional)
              </h2>
              <select
                value={racketId}
                onChange={(e) => setRacketId(e.target.value)}
                className="mt-3 h-12 w-full max-w-md rounded-xl border border-border bg-surface px-4 text-sm"
              >
                <option value="">Selecciona una raqueta del catálogo</option>
                {rackets.map((r) => (
                  <option key={r.id} value={r.id}>
                    {racketName(r)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-display mt-14 text-3xl font-extrabold">Recomendación</h2>
          <div className="panel elevated mt-5 space-y-4 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-primary">{best.name}</h3>
            <p className="text-muted-foreground">{best.summary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Tensión</p>
                <p className="mt-1 font-semibold">{best.tension}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Calibre</p>
                <p className="mt-1 font-semibold">
                  {breaks ? GAUGE_OPTIONS[2]!.label : goals.includes("spin") ? GAUGE_OPTIONS[0]!.label : GAUGE_OPTIONS[1]!.label}
                </p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {tensionAdvice.map((n) => (
                <li key={n} className="text-sm text-muted-foreground">
                  · {n}
                </li>
              ))}
            </ul>
          </div>

          <h2 className="text-display mt-14 text-3xl font-extrabold">Otras categorías</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ranked.slice(1).map(({ c }) => (
              <article key={c.id} className="panel p-6">
                <h3 className="text-lg font-bold">{c.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.summary}</p>
                <p className="mt-3 text-sm">
                  <span className="text-muted-foreground">Tensión: </span>
                  {c.tension}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{c.bestFor}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-xs text-muted-foreground">{STRINGS_DISCLAIMER}</p>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
