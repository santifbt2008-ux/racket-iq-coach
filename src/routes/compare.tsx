import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Page, ScoreBar, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { useRackets } from "@/lib/use-rackets";
import { DERIVED_NOTE, racketName, type EngineRacket } from "@/lib/racket-engine";
import { compareForPlayer } from "@/lib/engine";
import { useStoredProfile } from "@/lib/profile";
import { STRING_CATEGORIES, STRINGS_DISCLAIMER } from "@/lib/strings-db";
import { CATALOG_DISCLAIMER } from "@/lib/racket-db";
import { formatMXN } from "@/lib/format";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Comparar raquetas y cuerdas — RacketIQ" },
      {
        name: "description",
        content:
          "Compara hasta tres raquetas especificación por especificación, o compara categorías de cuerda, con los datos reales del catálogo.",
      },
      { property: "og:title", content: "Comparar raquetas y cuerdas — RacketIQ" },
      {
        property: "og:description",
        content: "Comparación lado a lado de raquetas y cuerdas con datos verificados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

const SPECS: { label: string; get: (r: EngineRacket) => string }[] = [
  { label: "Marca", get: (r) => r.brand },
  { label: "Año", get: (r) => (r.year != null ? String(r.year) : "Sin dato") },
  { label: "Tipo", get: (r) => r.racket_type ?? "Sin dato" },
  { label: "Head size", get: (r) => (r.head_size != null ? `${r.head_size} in²` : "Sin dato") },
  { label: "Peso", get: (r) => (r.weight != null ? `${r.weight} g` : "Sin dato") },
  { label: "Balance", get: (r) => (r.balance != null ? `${r.balance} cm` : "Sin dato") },
  { label: "Swingweight", get: (r) => (r.swingweight != null ? String(r.swingweight) : "Sin dato") },
  { label: "Rigidez (RA)", get: (r) => (r.stiffness != null ? String(r.stiffness) : "Sin dato") },
  { label: "Perfil", get: (r) => r.beam ?? "Sin dato" },
  { label: "Patrón", get: (r) => r.string_pattern ?? "Sin dato" },
  { label: "Largo", get: (r) => (r.length != null ? `${r.length} in` : "Sin dato") },
  { label: "Composición", get: (r) => r.composition ?? "Sin dato" },
  { label: "Tipo de jugador", get: (r) => r.stroke_style_label ?? "Sin dato" },
  { label: "Potencia (estimada)", get: (r) => `${r.power_score}/10` },
  { label: "Control (estimado)", get: (r) => `${r.control_score}/10` },
  { label: "Efecto (estimado)", get: (r) => `${r.spin_score}/10` },
  { label: "Estabilidad (estimada)", get: (r) => `${r.stability_score}/10` },
  { label: "Maniobrabilidad (estimada)", get: (r) => `${r.maneuverability_score}/10` },
  { label: "Comodidad (estimada)", get: (r) => `${r.comfort_score}/10` },
  { label: "Precio", get: (r) => (r.price != null ? formatMXN(r.price) : "Sin dato") },
];

function ComparePage() {
  const [mode, setMode] = useState<"rackets" | "strings">("rackets");
  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Comparar</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold">Compara opciones</h1>
          <div className="mt-6 flex gap-2">
            {(
              [
                ["rackets", "Raqueta vs raqueta"],
                ["strings", "Cuerda vs cuerda"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setMode(v)}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold ${
                  mode === v
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          {mode === "rackets" ? <RacketCompare /> : <StringCompare />}
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}

function RacketCompare() {
  const { rackets, isLoading } = useRackets();
  const { profile } = useStoredProfile();
  const [ids, setIds] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const selected = ids
    .map((id) => rackets.find((r) => r.id === id))
    .filter((r): r is EngineRacket => !!r);

  const options = useMemo(() => {
    const s = q.trim().toLowerCase();
    const pool = s
      ? rackets.filter((r) => racketName(r).toLowerCase().includes(s))
      : rackets;
    return pool.filter((r) => !ids.includes(r.id)).slice(0, 8);
  }, [rackets, q, ids]);

  const verdict = useMemo(
    () => (profile && selected.length >= 2 ? compareForPlayer(profile, selected) : null),
    [profile, selected],
  );

  return (
    <>
      <div className="panel mt-8 p-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busca una raqueta por marca o modelo…"
          aria-label="Buscar raqueta"
          className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-primary"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {isLoading && <span className="text-sm text-muted-foreground">Cargando catálogo…</span>}
          {options.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={ids.length >= 3}
              onClick={() => setIds((v) => [...v, r.id])}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
            >
              + {racketName(r)}
            </button>
          ))}
        </div>
        {selected.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {selected.map((r) => (
              <span
                key={r.id}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                {racketName(r)}
                <button
                  type="button"
                  aria-label={`Quitar ${racketName(r)}`}
                  onClick={() => setIds((v) => v.filter((x) => x !== r.id))}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Puedes comparar hasta 3 raquetas.</p>
      </div>

      {selected.length >= 2 && (
        <div className="panel mt-8 overflow-x-auto p-6 md:p-8">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Especificación</th>
                {selected.map((r) => (
                  <th key={r.id} className="pb-3 font-bold">
                    {racketName(r)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SPECS.map((s) => (
                <tr key={s.label} className="border-b border-border/50 last:border-0">
                  <td className="py-3 text-muted-foreground">{s.label}</td>
                  {selected.map((r) => (
                    <td key={r.id} className="py-3">
                      {s.get(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-xs text-muted-foreground">{DERIVED_NOTE}</p>
        </div>
      )}

      {verdict && (
        <div className="panel elevated mt-8 p-6 md:p-8">
          <h2 className="text-display text-2xl font-extrabold">¿Cuál es mejor para TI?</h2>
          <p className="mt-3 text-lg font-semibold text-primary">
            {racketName(verdict.best.racket)} — {verdict.best.overall}% de coincidencia
          </p>
          <ul className="mt-3 space-y-1.5">
            {verdict.lines.map((l) => (
              <li key={l} className="text-sm text-muted-foreground">
                · {l}
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {verdict.best.dimensions.map((d) => (
              <ScoreBar key={d.key} label={d.label} value={d.score} />
            ))}
          </div>
        </div>
      )}

      {selected.length >= 2 && !profile && (
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/find-my-racket" className="font-semibold text-primary">
            Responde el cuestionario
          </Link>{" "}
          para ver cuál de estas raquetas encaja mejor con tu juego.
        </p>
      )}
      <p className="mt-8 text-xs text-muted-foreground">{CATALOG_DISCLAIMER}</p>
    </>
  );
}

function StringCompare() {
  const [ids, setIds] = useState<string[]>([STRING_CATEGORIES[0]!.id, STRING_CATEGORIES[2]!.id]);
  const selected = ids
    .map((id) => STRING_CATEGORIES.find((c) => c.id === id)!)
    .filter(Boolean);

  const rows: { label: string; get: (c: (typeof STRING_CATEGORIES)[number]) => string }[] = [
    { label: "Potencia", get: (c) => `${c.power}/10` },
    { label: "Control", get: (c) => `${c.control}/10` },
    { label: "Efecto", get: (c) => `${c.spin}/10` },
    { label: "Comodidad", get: (c) => `${c.comfort}/10` },
    { label: "Durabilidad", get: (c) => `${c.durability}/10` },
    { label: "Tensión típica", get: (c) => c.tension },
    { label: "Ideal para", get: (c) => c.bestFor },
  ];

  return (
    <>
      <div className="panel mt-8 flex flex-wrap gap-2 p-6">
        {STRING_CATEGORIES.map((c) => {
          const active = ids.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                setIds((v) =>
                  active ? v.filter((x) => x !== c.id) : v.length >= 3 ? v : [...v, c.id],
                )
              }
              className={`rounded-full border px-4 py-2 text-sm ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {selected.length >= 2 && (
        <div className="panel mt-8 overflow-x-auto p-6 md:p-8">
          <table className="w-full min-w-[540px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 font-medium text-muted-foreground">Característica</th>
                {selected.map((c) => (
                  <th key={c.id} className="pb-3 font-bold">
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-border/50 last:border-0">
                  <td className="py-3 text-muted-foreground">{r.label}</td>
                  {selected.map((c) => (
                    <td key={c.id} className="py-3">
                      {r.get(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-8 text-xs text-muted-foreground">{STRINGS_DISCLAIMER}</p>
    </>
  );
}
