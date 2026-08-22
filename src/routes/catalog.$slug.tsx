import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { getRacketBySlug } from "@/lib/rackets.functions";
import { CATALOG_DISCLAIMER, STROKE_LABELS, racketFullName } from "@/lib/racket-db";

export const Route = createFileRoute("/catalog/$slug")({
  loader: async ({ params }) => {
    const racket = await getRacketBySlug({ data: { slug: params.slug } });
    if (!racket) throw notFound();
    return { racket };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Racket not found — RacketIQ" }, { name: "robots", content: "noindex" }] };
    }
    const name = racketFullName(loaderData.racket);
    const description = loaderData.racket.description ?? `Full specifications for the ${name}.`;
    return {
      meta: [
        { title: `${name} — full specifications | RacketIQ` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `${name} — RacketIQ` },
        { property: "og:description", content: description.slice(0, 155) },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <Page>
      <p role="alert" className="text-muted-foreground">
        Could not load this racket: {error.message}
      </p>
    </Page>
  ),
  notFoundComponent: () => (
    <Page>
      <h1 className="text-display text-3xl font-extrabold">Racket not found</h1>
      <Link to="/catalog" className="mt-4 inline-block text-primary underline">
        Back to the catalog
      </Link>
    </Page>
  ),
  component: RacketDetail,
});

function RacketDetail() {
  const { racket: r } = Route.useLoaderData();

  const specs: [string, string][] = [
    ["Racket type", r.racket_type ?? "—"],
    ["Model year", r.year ? String(r.year) : "—"],
    ["Head size", r.head_size ? `${r.head_size} sq in` : "—"],
    ["Length", r.length ? `${r.length} in` : "—"],
    ["Weight (strung)", r.weight ? `${r.weight} g` : "—"],
    ["Balance", r.balance ? `${r.balance} cm` : "—"],
    ["Swingweight", r.swingweight ? String(r.swingweight) : "—"],
    ["Stiffness", r.stiffness ? `${r.stiffness} RA` : "—"],
    ["Beam width", r.beam_width ?? "—"],
    ["String pattern", r.string_pattern ?? "—"],
    ["Composition", r.composition ?? "—"],
    ["Power level", r.power_level ?? "—"],
    ["Swing speed", r.swing_speed ?? "—"],
    ["Price", r.price != null ? `$${r.price}` : "—"],
    ["Availability", r.is_current ? "Current model" : "Discontinued / older model"],
  ];

  const strokes = (r.stroke_style ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <Link to="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to the catalog
          </Link>

          <div className="mt-6 grid gap-10 md:grid-cols-[.85fr_1.15fr]">
            <div className="panel grid min-h-[320px] place-items-center overflow-hidden p-6">
              {r.image_url ? (
                <img src={r.image_url} alt={`${racketFullName(r)} tennis racket`} className="max-h-[360px] object-contain" />
              ) : (
                <div className="text-center">
                  <span className="text-display text-5xl font-extrabold text-muted-foreground/30">{r.brand}</span>
                  <p className="mt-4 max-w-[220px] text-xs text-muted-foreground">
                    No licensed photo available for this frame yet.
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="eyebrow">{r.brand}</p>
              <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">{r.model}</h1>
              {r.description && <p className="mt-4 text-muted-foreground">{r.description}</p>}

              <h2 className="mt-10 text-lg font-bold">Full specifications</h2>
              <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-border pb-2 text-sm">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              {strokes.length > 0 && (
                <>
                  <h2 className="mt-10 text-lg font-bold">Suited stroke styles</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {strokes.map((s) => (
                      <span key={s} className="rounded-full bg-secondary px-3 py-1.5 text-sm">
                        {STROKE_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/find-my-racket"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
                >
                  See if this fits your game <ArrowRight className="h-4 w-4" />
                </Link>
                {r.product_url && (
                  <a
                    href={r.product_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-semibold hover:bg-secondary"
                  >
                    View product <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>

              <p className="mt-6 text-xs text-muted-foreground">{CATALOG_DISCLAIMER}</p>
            </div>
          </div>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
