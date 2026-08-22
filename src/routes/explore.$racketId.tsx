import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Page, RacketVisual, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DATA_DISCLAIMER, RACKETS, getRacket, racketName, type Racket } from "@/data/rackets";
import { IMAGE_POLICY_NOTE } from "@/data/racket-media";
import { formatMXN } from "@/lib/format";
import { STYLE_LABELS } from "@/lib/profile";

export const Route = createFileRoute("/explore/$racketId")({
  loader: ({ params }) => {
    const racket = getRacket(params.racketId);
    if (!racket) throw notFound();
    return { racket };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Raqueta no encontrada — RacketIQ" }, { name: "robots", content: "noindex" }],
      };
    }
    const name = racketName(loaderData.racket);
    return {
      meta: [
        { title: `${name} — especificaciones, calificaciones y ajuste | RacketIQ` },
        { name: "description", content: `${name}: ${loaderData.racket.description}` },
        { property: "og:title", content: `${name} — RacketIQ` },
        { property: "og:description", content: loaderData.racket.description },
      ],
    };
  },
  component: Detail,
});

function similar(r: Racket) {
  return RACKETS.filter((x) => x.id !== r.id)
    .map((x) => ({
      racket: x,
      distance:
        Math.abs(x.head_size - r.head_size) * 1.5 +
        Math.abs(x.weight - r.weight) * 0.15 +
        Math.abs(x.power_score - r.power_score) +
        Math.abs(x.control_score - r.control_score) +
        Math.abs(x.spin_score - r.spin_score),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((x) => x.racket);
}

function pros(r: Racket) {
  const out: string[] = [];
  if (r.power_score >= 8) out.push("Profundidad fácil y potencia libre");
  if (r.control_score >= 9) out.push("Excelente control direccional");
  if (r.spin_score >= 9) out.push("Potencial de efecto muy alto");
  if (r.stability_score >= 9) out.push("Muy estable ante golpes de alta potencia");
  if (r.comfort_score >= 9) out.push("Notablemente cómoda y suave para el brazo");
  if (r.maneuverability_score >= 8) out.push("Rápida y fácil de manejar en el swing");
  return out.length ? out : ["Bien equilibrada en la mayoría de las áreas de desempeño"];
}

function considerations(r: Racket) {
  const out: string[] = [];
  if (r.power_score <= 6) out.push("Tú aportas la potencia: requiere un swing completo y decidido");
  if (r.control_score <= 6) out.push("Puede irse larga si tu swing es corto o dudoso");
  if (r.comfort_score <= 6)
    out.push("Respuesta más rígida: combínala con una cuerda más suave si eres sensible del brazo");
  if (r.maneuverability_score <= 6) out.push("Más lenta en el aire durante intercambios rápidos");
  if (r.spin_score <= 6) out.push("Techo de efecto más bajo que los marcos de patrón abierto");
  return out.length ? out : ["Sin desventajas destacadas en nuestras calificaciones de muestra"];
}

function Detail() {
  const { racket: r } = Route.useLoaderData();
  const specs: [string, string][] = [
    ["Tamaño de cabeza", `${r.head_size} pulg²`],
    ["Peso (encordada)", `${r.strung_weight} g`],
    ["Peso (sin encordar)", `${r.unstrung_weight} g`],
    ["Balance", `${r.balance} cm`],
    ["Swingweight", `${r.swingweight}`],
    ["Longitud", `${r.length} in`],
    ["Aro (grosor)", `${r.beam} mm`],
    ["Patrón de encordado", r.string_pattern],
    ["Rigidez", `${r.stiffness} RA`],
    ["Tensión recomendada", `${r.tension_min}–${r.tension_max} lbs`],
    ["Composición", r.composition],
    ["Año del modelo", r.year],
    ["Precio indicativo", formatMXN(r.price)],
  ];

  const ratings: [string, number][] = [
    ["Potencia", r.power_score],
    ["Control", r.control_score],
    ["Efecto", r.spin_score],
    ["Estabilidad", r.stability_score],
    ["Maniobrabilidad", r.maneuverability_score],
    ["Comodidad", r.comfort_score],
    ["Tolerancia (est.)", r.forgiveness_score],
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground">
            ← Volver a todas las raquetas
          </Link>
          <div className="mt-6 grid gap-10 md:grid-cols-[.8fr_1.2fr]">
            <RacketVisual label={racketName(r)} image={r.image} className="min-h-[340px]" />
            <div>
              <p className="eyebrow">{r.brand}</p>
              <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">{r.model}</h1>
              <p className="mt-4 text-muted-foreground">{r.description}</p>

              <h2 className="mt-10 text-lg font-bold">Especificaciones</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              <h2 className="mt-10 text-lg font-bold">Calificaciones de desempeño</h2>
              <div className="mt-4 space-y-3">
                {ratings.map(([k, v]) => (
                  <div key={k}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}/10</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${v * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="mt-10 text-lg font-bold">Tipos de jugador recomendados</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.recommended_player_types.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-3 py-1.5 text-sm">
                    {STYLE_LABELS[t]}
                  </span>
                ))}
                {r.recommended_level.map((l) => (
                  <span
                    key={l}
                    className="rounded-full border border-border px-3 py-1.5 text-sm capitalize"
                  >
                    {l}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                <div className="panel p-5">
                  <h3 className="font-bold">Ventajas</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {pros(r).map((p) => (
                      <li key={p}>+ {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="panel p-5">
                  <h3 className="font-bold">Consideraciones</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {considerations(r).map((p) => (
                      <li key={p}>– {p}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  to="/find-my-racket"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
                >
                  Descubre si esta raqueta se ajusta a TU juego <ArrowRight className="h-4 w-4" />
                </Link>
                {r.product_link && (
                  <a
                    href={r.product_link.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary"
                  >
                    {r.product_link.label} <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
              {r.spec_source_url && (
                <p className="mt-6 text-xs text-muted-foreground">
                  Fuente de especificaciones:{" "}
                  <a
                    href={r.spec_source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:text-foreground"
                  >
                    catálogo oficial de raquetas {r.brand}
                  </a>
                  .
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{DATA_DISCLAIMER}</p>
              {!r.image && (
                <p className="mt-2 text-xs text-muted-foreground">{IMAGE_POLICY_NOTE}</p>
              )}
            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-display text-3xl font-extrabold">Raquetas similares</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {similar(r).map((s) => (
                <Link
                  key={s.id}
                  to="/explore/$racketId"
                  params={{ racketId: s.id }}
                  className="panel p-5 transition-colors hover:bg-surface-strong"
                >
                  <span className="eyebrow">{s.brand}</span>
                  <h3 className="text-display mt-2 text-xl font-extrabold">{s.model}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.head_size} pulg² · {s.weight}g · {s.string_pattern}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
