import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { listRackets } from "@/lib/rackets.functions";
import {
  CATALOG_DISCLAIMER,
  HEAD_BANDS,
  POWER_LEVELS,
  RACKET_TYPES,
  SORTS,
  STRING_PATTERNS,
  STROKE_LABELS,
  STROKE_STYLES,
  SWING_SPEEDS,
  WEIGHT_BANDS,
  racketFullName,
  sortRackets,
  type RacketRow,
  type SortValue,
} from "@/lib/racket-db";

export const Route = createFileRoute("/catalog/")({
  loader: () => listRackets(),
  head: () => ({
    meta: [
      { title: "Racket Catalog — search every spec | RacketIQ" },
      {
        name: "description",
        content:
          "Browse the RacketIQ tennis racket catalog. Filter by brand, type, weight, head size, string pattern, price, power level, swing speed and stroke style.",
      },
      { property: "og:title", content: "Racket Catalog — RacketIQ" },
      { property: "og:description", content: "Search and filter tennis rackets by every specification that matters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  errorComponent: ({ error }) => (
    <Page>
      <p role="alert" className="text-muted-foreground">
        Could not load the catalog: {error.message}
      </p>
    </Page>
  ),
  notFoundComponent: () => <Page>No rackets found.</Page>,
  component: Catalog,
});

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Catalog() {
  const rackets = Route.useLoaderData();

  const [q, setQ] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  const [heads, setHeads] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [powers, setPowers] = useState<string[]>([]);
  const [swings, setSwings] = useState<string[]>([]);
  const [strokes, setStrokes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(400);
  const [sort, setSort] = useState<SortValue>("brand");
  const [openFilters, setOpenFilters] = useState(false);

  const brandOptions = useMemo(
    () => Array.from(new Set(rackets.map((r) => r.brand))).sort((a, b) => a.localeCompare(b)),
    [rackets],
  );

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const inBand = (value: number | null, labels: string[], bands: readonly { label: string; min: number; max: number }[]) => {
    if (!labels.length) return true;
    if (value == null) return false;
    return labels.some((l) => {
      const band = bands.find((b) => b.label === l);
      return band ? value >= band.min && value <= band.max : false;
    });
  };

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = rackets.filter((r: RacketRow) => {
      if (term && !racketFullName(r).toLowerCase().includes(term)) return false;
      if (brands.length && !brands.includes(r.brand)) return false;
      if (types.length && !(r.racket_type && types.includes(r.racket_type))) return false;
      if (!inBand(r.weight, weights, WEIGHT_BANDS)) return false;
      if (!inBand(r.head_size, heads, HEAD_BANDS)) return false;
      if (patterns.length && !(r.string_pattern && patterns.includes(r.string_pattern))) return false;
      if (powers.length && !(r.power_level && powers.includes(r.power_level))) return false;
      if (swings.length && !(r.swing_speed && swings.includes(r.swing_speed))) return false;
      if (strokes.length && !strokes.some((s) => (r.stroke_style ?? "").includes(s))) return false;
      if ((r.price ?? 0) > maxPrice) return false;
      return true;
    });
    return sortRackets(filtered, sort);
  }, [rackets, q, brands, types, weights, heads, patterns, powers, swings, strokes, maxPrice, sort]);

  const clearAll = () => {
    setQ("");
    setBrands([]);
    setTypes([]);
    setWeights([]);
    setHeads([]);
    setPatterns([]);
    setPowers([]);
    setSwings([]);
    setStrokes([]);
    setMaxPrice(400);
  };

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Racket catalog</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">Every frame, every spec</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{CATALOG_DISCLAIMER}</p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr]">
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <button
                type="button"
                onClick={() => setOpenFilters((v) => !v)}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> {openFilters ? "Hide filters" : "Show filters"}
              </button>
              <div className={`panel space-y-6 p-6 ${openFilters ? "" : "hidden lg:block"}`}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search brand or model…"
                    className="h-11 pl-9"
                    aria-label="Search rackets by brand or model"
                  />
                </div>
                <Group label="Brand">
                  {brandOptions.map((b) => (
                    <Chip key={b} active={brands.includes(b)} onClick={() => toggle(brands, setBrands, b)}>
                      {b}
                    </Chip>
                  ))}
                </Group>
                <Group label="Racket type">
                  {RACKET_TYPES.map((t) => (
                    <Chip key={t} active={types.includes(t)} onClick={() => toggle(types, setTypes, t)}>
                      {t}
                    </Chip>
                  ))}
                </Group>
                <Group label="Weight (strung)">
                  {WEIGHT_BANDS.map((w) => (
                    <Chip key={w.label} active={weights.includes(w.label)} onClick={() => toggle(weights, setWeights, w.label)}>
                      {w.label}
                    </Chip>
                  ))}
                </Group>
                <Group label="Head size">
                  {HEAD_BANDS.map((h) => (
                    <Chip key={h.label} active={heads.includes(h.label)} onClick={() => toggle(heads, setHeads, h.label)}>
                      {h.label}
                    </Chip>
                  ))}
                </Group>
                <Group label="String pattern">
                  {STRING_PATTERNS.map((p) => (
                    <Chip key={p} active={patterns.includes(p)} onClick={() => toggle(patterns, setPatterns, p)}>
                      {p}
                    </Chip>
                  ))}
                </Group>
                <Group label="Power level">
                  {POWER_LEVELS.map((p) => (
                    <Chip key={p} active={powers.includes(p)} onClick={() => toggle(powers, setPowers, p)}>
                      {p}
                    </Chip>
                  ))}
                </Group>
                <Group label="Swing speed">
                  {SWING_SPEEDS.map((s) => (
                    <Chip key={s} active={swings.includes(s)} onClick={() => toggle(swings, setSwings, s)}>
                      {s}
                    </Chip>
                  ))}
                </Group>
                <Group label="Stroke style">
                  {STROKE_STYLES.map((s) => (
                    <Chip key={s} active={strokes.includes(s)} onClick={() => toggle(strokes, setStrokes, s)}>
                      {STROKE_LABELS[s]}
                    </Chip>
                  ))}
                </Group>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Max price</span>
                    <span className="font-semibold">${maxPrice}</span>
                  </div>
                  <Slider min={100} max={400} step={10} value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0] ?? 400)} />
                </div>
                <button type="button" onClick={clearAll} className="text-sm text-muted-foreground underline hover:text-foreground">
                  Clear all filters
                </button>
              </div>
            </aside>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{results.length} rackets</p>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  Sort by
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortValue)}
                    className="rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground"
                  >
                    {SORTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((r) => (
                  <Link
                    key={r.id}
                    to="/catalog/$slug"
                    params={{ slug: r.slug }}
                    className="panel flex flex-col p-5 transition-colors hover:bg-surface-strong"
                  >
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={`${racketFullName(r)} tennis racket`}
                        loading="lazy"
                        className="mb-4 h-40 w-full rounded-xl object-contain"
                      />
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span className="eyebrow">{r.brand}</span>
                      {!r.is_current && (
                        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          Discontinued
                        </span>
                      )}
                    </div>
                    <h2 className="text-display mt-2 text-xl font-extrabold">{r.model}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {r.head_size} sq in · {r.weight}g · {r.string_pattern} · {r.swingweight} SW
                    </p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{r.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      {r.racket_type && <span className="rounded-full bg-secondary px-2.5 py-1">{r.racket_type}</span>}
                      {r.power_level && <span className="rounded-full bg-secondary px-2.5 py-1">{r.power_level} power</span>}
                      {r.price != null && <span className="ml-auto text-sm font-bold text-foreground">${r.price}</span>}
                    </div>
                  </Link>
                ))}
                {!results.length && <p className="text-muted-foreground">No rackets match those filters.</p>}
              </div>
            </div>
          </div>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
