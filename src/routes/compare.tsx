import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Page, RacketVisual, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { DATA_DISCLAIMER, RACKETS, getRacket, racketName } from "@/data/rackets";
import { compareForPlayer } from "@/lib/engine";
import { formatMXN } from "@/lib/format";
import { STYLE_LABELS, useStoredProfile } from "@/lib/profile";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Comparar Raquetas — especificaciones lado a lado | RacketIQ" },
      {
        name: "description",
        content:
          "Compara hasta tres raquetas de tenis especificación por especificación y descubre cuál se ajusta mejor a tu perfil de juego.",
      },
      { property: "og:title", content: "Comparar Raquetas — RacketIQ" },
      {
        property: "og:description",
        content: "Especificaciones de raquetas lado a lado y un veredicto personalizado.",
      },
    ],
  }),
  component: Compare,
});

const ROWS = [
  ["Tamaño de cabeza", (r: (typeof RACKETS)[number]) => `${r.head_size} pulg²`],
  ["Peso", (r: (typeof RACKETS)[number]) => `${r.weight} g`],
  ["Balance", (r: (typeof RACKETS)[number]) => `${r.balance} cm`],
  ["Swingweight", (r: (typeof RACKETS)[number]) => `${r.swingweight}`],
  ["Patrón de encordado", (r: (typeof RACKETS)[number]) => r.string_pattern],
  ["Aro (grosor)", (r: (typeof RACKETS)[number]) => `${r.beam} mm`],
  ["Rigidez", (r: (typeof RACKETS)[number]) => `${r.stiffness} RA`],
  ["Potencia", (r: (typeof RACKETS)[number]) => `${r.power_score}/10`],
  ["Control", (r: (typeof RACKETS)[number]) => `${r.control_score}/10`],
  ["Efecto", (r: (typeof RACKETS)[number]) => `${r.spin_score}/10`],
  ["Estabilidad", (r: (typeof RACKETS)[number]) => `${r.stability_score}/10`],
  ["Maniobrabilidad", (r: (typeof RACKETS)[number]) => `${r.maneuverability_score}/10`],
  ["Tolerancia (est.)", (r: (typeof RACKETS)[number]) => `${r.forgiveness_score}/10`],
  ["Precio indicativo", (r: (typeof RACKETS)[number]) => formatMXN(r.price)],
  [
    "Tipo de jugador recomendado",
    (r: (typeof RACKETS)[number]) =>
      r.recommended_player_types.map((t) => STYLE_LABELS[t]).join(", "),
  ],
] as const;

function Compare() {
  const { profile } = useStoredProfile();
  const [ids, setIds] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const selected = ids.map((id) => getRacket(id)!).filter(Boolean);
  const options = useMemo(() => {
    const term = q.trim().toLowerCase();
    return RACKETS.filter(
      (r) => !ids.includes(r.id) && (!term || racketName(r).toLowerCase().includes(term)),
    ).slice(0, 8);
  }, [q, ids]);

  const verdict = useMemo(
    () =>
      profile && profile.level && selected.length >= 2 ? compareForPlayer(profile, selected) : null,
    [profile, selected],
  );

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Cara a cara</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">
            Compara hasta 3 raquetas
          </h1>

          <div className="mt-8 flex flex-wrap gap-2">
            {selected.map((r) => (
              <span
                key={r.id}
                className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm"
              >
                {racketName(r)}
                <button
                  type="button"
                  onClick={() => setIds(ids.filter((x) => x !== r.id))}
                  aria-label="Eliminar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          {ids.length < 3 && (
            <div className="panel mt-6 p-6">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Busca una raqueta para agregar…"
                className="h-11"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {options.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setIds([...ids, r.id])}
                    className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    + {racketName(r)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selected.length > 0 && (
            <div
              className="mt-10 grid gap-4"
              style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0, 1fr))` }}
            >
              {selected.map((r) => (
                <RacketVisual
                  key={r.id}
                  label={racketName(r)}
                  image={r.image}
                  className="aspect-square"
                />
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <div className="panel mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-left text-muted-foreground">Especificación</th>
                    {selected.map((r) => (
                      <th
                        key={r.id}
                        className="text-display p-4 text-left text-base font-extrabold"
                      >
                        {racketName(r)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(([label, fn]) => (
                    <tr key={label} className="border-b border-border/60">
                      <td className="p-4 text-muted-foreground">{label}</td>
                      {selected.map((r) => (
                        <td key={r.id} className="p-4 font-medium">
                          {fn(r)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <section className="mt-12">
            <h2 className="text-display text-3xl font-extrabold">¿Cuál es mejor para TI?</h2>
            <div className="panel mt-5 p-6">
              {!profile?.level ? (
                <p className="text-muted-foreground">
                  Completa primero el cuestionario y RacketIQ evaluará estos marcos contra tu
                  propio perfil.
                </p>
              ) : selected.length < 2 ? (
                <p className="text-muted-foreground">
                  Agrega al menos dos raquetas para ver un veredicto personalizado.
                </p>
              ) : (
                verdict && (
                  <div className="space-y-4">
                    <p className="text-lg">
                      Mejor opción para tu perfil:{" "}
                      <span className="text-display font-extrabold text-primary">
                        {racketName(verdict.best.racket)} ({verdict.best.overall}%)
                      </span>
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {verdict.lines.map((l) => (
                        <li key={l} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {l}
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {verdict.best.reasons.slice(0, 3).map((r) => (
                        <li key={r} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          </section>

          <p className="mt-10 text-xs text-muted-foreground">{DATA_DISCLAIMER}</p>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
