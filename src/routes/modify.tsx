import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useRackets } from "@/lib/use-rackets";
import { racketName } from "@/lib/racket-engine";
import { STRING_CATEGORIES } from "@/lib/strings-db";
import { CATALOG_DISCLAIMER } from "@/lib/racket-db";

export const Route = createFileRoute("/modify")({
  head: () => ({
    meta: [
      { title: "Modifica tu raqueta — RacketIQ" },
      {
        name: "description",
        content:
          "Simula plomo, silicón, overgrip, cuerda y tensión y mira cómo cambian el peso, el balance y el swingweight de tu raqueta.",
      },
      { property: "og:title", content: "Modifica tu raqueta — RacketIQ" },
      {
        property: "og:description",
        content: "Laboratorio de personalización: peso, balance, swingweight, grip y encordado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModifyPage,
});

const OVERGRIP_G = 5;
const DAMPENER_G = 3;

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[hsl(var(--primary))]"
        aria-label={label}
      />
    </div>
  );
}

function Row({ label, before, after }: { label: string; before: string; after: string }) {
  const changed = before !== after;
  return (
    <div className="grid grid-cols-3 items-baseline gap-2 border-b border-border/60 py-3 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{before}</span>
      <span className={changed ? "font-semibold text-primary" : ""}>{after}</span>
    </div>
  );
}

function ModifyPage() {
  const { rackets, isLoading } = useRackets();
  const [id, setId] = useState("");
  const [tip, setTip] = useState(0); // grams at 12
  const [sides, setSides] = useState(0); // grams total at 3 & 9
  const [handle, setHandle] = useState(0); // grams in handle
  const [overgrip, setOvergrip] = useState(false);
  const [dampener, setDampener] = useState(false);
  const [stringId, setStringId] = useState(STRING_CATEGORIES[0]!.id);
  const [tension, setTension] = useState(52);

  const racket = rackets.find((r) => r.id === id) ?? null;

  const result = useMemo(() => {
    if (!racket || racket.weight == null || racket.balance == null) return null;
    const L = (racket.length ?? 27) * 2.54; // cm
    const w0 = racket.weight;
    const b0 = racket.balance; // cm from butt
    let mass = w0;
    let moment = w0 * b0;

    const add = (grams: number, posCm: number) => {
      mass += grams;
      moment += grams * posCm;
    };
    add(tip, L - 2);
    add(sides, L * 0.63); // ~3 & 9 o'clock
    add(handle + (overgrip ? OVERGRIP_G : 0), 12);
    add(dampener ? DAMPENER_G : 0, L * 0.45);

    const balance = moment / mass;
    const added = mass - w0;
    // Swingweight estimate: mass added at distance d changes SW by m*(d - balancePoint)^2 (kg·cm²).
    const sw0 = racket.swingweight;
    const swDelta =
      (tip * Math.pow(L - 2 - 10, 2) +
        sides * Math.pow(L * 0.63 - 10, 2) +
        (handle + (overgrip ? OVERGRIP_G : 0)) * Math.pow(12 - 10, 2) +
        (dampener ? DAMPENER_G : 0) * Math.pow(L * 0.45 - 10, 2)) /
      1000;

    return {
      mass,
      balance,
      added,
      sw: sw0 != null ? sw0 + swDelta : null,
      swDelta,
    };
  }, [racket, tip, sides, handle, overgrip, dampener]);

  const str = STRING_CATEGORIES.find((s) => s.id === stringId)!;

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Personalización</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold">Modifica tu raqueta</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Elige una raqueta del catálogo y prueba configuraciones. Solo calculamos con los datos
            que existen en la base de datos; lo que falta se marca como “sin dato”.
          </p>

          <div className="panel mt-8 space-y-7 p-6 md:p-8">
            <div>
              <label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Raqueta base
              </label>
              <select
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="mt-3 h-12 w-full max-w-md rounded-xl border border-border bg-surface px-4 text-sm"
              >
                <option value="">{isLoading ? "Cargando catálogo…" : "Selecciona una raqueta"}</option>
                {rackets.map((r) => (
                  <option key={r.id} value={r.id}>
                    {racketName(r)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Slider label="Plomo en las 12" value={tip} onChange={setTip} min={0} max={10} unit="g" />
              <Slider label="Plomo en 3 y 9" value={sides} onChange={setSides} min={0} max={12} unit="g" />
              <Slider label="Peso en el mango" value={handle} onChange={setHandle} min={0} max={20} unit="g" />
              <Slider label="Tensión" value={tension} onChange={setTension} min={38} max={64} unit="lbs" />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setOvergrip((v) => !v)}
                className={`rounded-full border px-4 py-2 text-sm ${overgrip ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
              >
                Overgrip (+{OVERGRIP_G} g)
              </button>
              <button
                type="button"
                onClick={() => setDampener((v) => !v)}
                className={`rounded-full border px-4 py-2 text-sm ${dampener ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
              >
                Amortiguador (+{DAMPENER_G} g)
              </button>
            </div>

            <div>
              <label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Cuerda
              </label>
              <select
                value={stringId}
                onChange={(e) => setStringId(e.target.value)}
                className="mt-3 h-12 w-full max-w-md rounded-xl border border-border bg-surface px-4 text-sm"
              >
                {STRING_CATEGORIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h2 className="text-display mt-14 text-3xl font-extrabold">Configuración final</h2>
          {!racket && (
            <p className="mt-4 text-muted-foreground">Selecciona una raqueta para ver el resultado.</p>
          )}
          {racket && !result && (
            <p className="mt-4 text-muted-foreground">
              La {racketName(racket)} no tiene peso o balance en la base de datos, así que no podemos
              calcular la configuración final sin inventar datos.
            </p>
          )}
          {racket && result && (
            <div className="panel elevated mt-5 p-6 md:p-8">
              <div className="grid grid-cols-3 gap-2 border-b border-border pb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                <span>Especificación</span>
                <span>De fábrica</span>
                <span>Modificada</span>
              </div>
              <Row
                label="Peso"
                before={`${racket.weight} g`}
                after={`${result.mass.toFixed(1)} g (+${result.added.toFixed(1)})`}
              />
              <Row
                label="Balance"
                before={`${racket.balance} cm`}
                after={`${result.balance.toFixed(1)} cm`}
              />
              <Row
                label="Swingweight"
                before={racket.swingweight != null ? `${racket.swingweight}` : "Sin dato"}
                after={
                  result.sw != null
                    ? `${result.sw.toFixed(0)} (+${result.swDelta.toFixed(0)})`
                    : `Sin dato (cambio estimado +${result.swDelta.toFixed(0)})`
                }
              />
              <Row label="Cuerda" before="Sin encordar" after={str.name} />
              <Row label="Tensión" before="—" after={`${tension} lbs`} />
              <Row
                label="Patrón"
                before={racket.string_pattern ?? "Sin dato"}
                after={racket.string_pattern ?? "Sin dato"}
              />
              <p className="mt-5 text-sm text-muted-foreground">
                Cambios grandes de swingweight (más de ~10 puntos) cambian mucho el manejo. Haz una
                modificación a la vez y juega un par de sesiones antes de la siguiente.
              </p>
            </div>
          )}

          <p className="mt-8 text-xs text-muted-foreground">
            Los valores modificados son estimaciones físicas a partir de las especificaciones de la
            base de datos. {CATALOG_DISCLAIMER}
          </p>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
