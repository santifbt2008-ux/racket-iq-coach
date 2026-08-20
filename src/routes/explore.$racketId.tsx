import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Page, RacketVisual, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DATA_DISCLAIMER, RACKETS, getRacket, racketName, type Racket } from "@/data/rackets";
import { IMAGE_POLICY_NOTE } from "@/data/racket-media";
import { STYLE_LABELS } from "@/lib/profile";

export const Route = createFileRoute("/explore/$racketId")({
  loader: ({ params }) => {
    const racket = getRacket(params.racketId);
    if (!racket) throw notFound();
    return { racket };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Racket not found — RacketIQ" }, { name: "robots", content: "noindex" }] };
    }
    const name = racketName(loaderData.racket);
    return {
      meta: [
        { title: `${name} — specs, ratings and fit | RacketIQ` },
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
  if (r.power_score >= 8) out.push("Easy depth and free power");
  if (r.control_score >= 9) out.push("Excellent directional control");
  if (r.spin_score >= 9) out.push("Very high spin potential");
  if (r.stability_score >= 9) out.push("Very stable against heavy pace");
  if (r.comfort_score >= 9) out.push("Notably comfortable and arm-friendly");
  if (r.maneuverability_score >= 8) out.push("Quick and easy to swing");
  return out.length ? out : ["Well-balanced across most performance areas"];
}

function considerations(r: Racket) {
  const out: string[] = [];
  if (r.power_score <= 6) out.push("You supply the power — needs a full, committed swing");
  if (r.control_score <= 6) out.push("Can launch long if your swing is short or tentative");
  if (r.comfort_score <= 6) out.push("Stiffer response — pair with a softer string if arm sensitive");
  if (r.maneuverability_score <= 6) out.push("Slower through the air in fast exchanges");
  if (r.spin_score <= 6) out.push("Lower spin ceiling than open-pattern frames");
  return out.length ? out : ["No standout drawbacks in our sample ratings"];
}

function Detail() {
  const { racket: r } = Route.useLoaderData();
  const specs: [string, string][] = [
    ["Head size", `${r.head_size} sq in`],
    ["Weight (strung)", `${r.strung_weight} g`],
    ["Weight (unstrung)", `${r.unstrung_weight} g`],
    ["Balance", `${r.balance} cm`],
    ["Swingweight", `${r.swingweight}`],
    ["Length", `${r.length} in`],
    ["Beam", `${r.beam} mm`],
    ["String pattern", r.string_pattern],
    ["Stiffness", `${r.stiffness} RA`],
    ["Recommended tension", `${r.tension_min}–${r.tension_max} lbs`],
    ["Composition", r.composition],
    ["Model year", r.year],
    ["Indicative price", `$${r.price}`],
  ];

  const ratings: [string, number][] = [
    ["Power", r.power_score],
    ["Control", r.control_score],
    ["Spin", r.spin_score],
    ["Stability", r.stability_score],
    ["Maneuverability", r.maneuverability_score],
    ["Comfort", r.comfort_score],
  ];

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <Link to="/explore" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to all rackets
          </Link>
          <div className="mt-6 grid gap-10 md:grid-cols-[.8fr_1.2fr]">
            <RacketVisual label={racketName(r)} image={r.image} className="min-h-[340px]" />
            <div>
              <p className="eyebrow">{r.brand}</p>
              <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">{r.model}</h1>
              <p className="mt-4 text-muted-foreground">{r.description}</p>

              <h2 className="mt-10 text-lg font-bold">Specifications</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              <h2 className="mt-10 text-lg font-bold">Performance ratings</h2>
              <div className="mt-4 space-y-3">
                {ratings.map(([k, v]) => (
                  <div key={k}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}/10</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${v * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="mt-10 text-lg font-bold">Recommended player types</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.recommended_player_types.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-3 py-1.5 text-sm">
                    {STYLE_LABELS[t]}
                  </span>
                ))}
                {r.recommended_level.map((l) => (
                  <span key={l} className="rounded-full border border-border px-3 py-1.5 text-sm capitalize">
                    {l}
                  </span>
                ))}
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                <div className="panel p-5">
                  <h3 className="font-bold">Pros</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {pros(r).map((p) => (
                      <li key={p}>+ {p}</li>
                    ))}
                  </ul>
                </div>
                <div className="panel p-5">
                  <h3 className="font-bold">Considerations</h3>
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
                  See if this racket fits YOUR game <ArrowRight className="h-4 w-4" />
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
                  Specification source:{" "}
                  <a
                    href={r.spec_source_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="underline hover:text-foreground"
                  >
                    official {r.brand} racket catalogue
                  </a>
                  .
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{DATA_DISCLAIMER}</p>
              {!r.image && <p className="mt-2 text-xs text-muted-foreground">{IMAGE_POLICY_NOTE}</p>}

            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-display text-3xl font-extrabold">Similar rackets</h2>
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
                    {s.head_size} sq in · {s.weight}g · {s.string_pattern}
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
