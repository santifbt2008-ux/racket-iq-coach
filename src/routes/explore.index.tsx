import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Page, RacketVisual, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { BRANDS, DATA_DISCLAIMER, RACKETS, racketName } from "@/data/rackets";
import { formatMXN, mxnToUsd, usdToMxn } from "@/lib/format";

export const Route = createFileRoute("/explore/")({
  head: () => ({
    meta: [
      { title: "Explorar Raquetas — base de datos buscable de raquetas de tenis | RacketIQ" },
      {
        name: "description",
        content:
          "Busca y filtra raquetas de tenis por marca, tamaño de cabeza, peso, patrón de encordado, potencia, control y efecto.",
      },
      { property: "og:title", content: "Explorar Raquetas — RacketIQ" },
      {
        property: "og:description",
        content: "Una base de datos de especificaciones de raquetas de tenis, buscable y filtrable.",
      },
    ],
  }),
  component: Explore,
});

const HEAD_SIZES = ["95–97", "98–99", "100", "102+"] as const;
const WEIGHTS = ["Under 300g", "300–305g", "305–310g", "310g+"] as const;
const PATTERNS = ["16x19", "18x20", "16x20", "16x18"] as const;

const WEIGHT_LABELS: Record<(typeof WEIGHTS)[number], string> = {
  "Under 300g": "Menos de 300g",
  "300–305g": "300–305g",
  "305–310g": "305–310g",
  "310g+": "310g+",
};

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
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

const MAX_PRICE_MIN_MXN = Math.round(usdToMxn(150));
const MAX_PRICE_MAX_MXN = Math.round(usdToMxn(300));

function Explore() {
  const [q, setQ] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [heads, setHeads] = useState<string[]>([]);
  const [weights, setWeights] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [minPower, setMinPower] = useState(1);
  const [minControl, setMinControl] = useState(1);
  const [minSpin, setMinSpin] = useState(1);
  const [maxPriceMxn, setMaxPriceMxn] = useState(MAX_PRICE_MAX_MXN);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const maxPriceUsd = mxnToUsd(maxPriceMxn);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return RACKETS.filter((r) => {
      if (term && !racketName(r).toLowerCase().includes(term)) return false;
      if (brands.length && !brands.includes(r.brand)) return false;
      if (heads.length) {
        const band =
          r.head_size <= 97
            ? "95–97"
            : r.head_size <= 99
              ? "98–99"
              : r.head_size <= 101
                ? "100"
                : "102+";
        if (!heads.includes(band)) return false;
      }
      if (weights.length) {
        const band =
          r.weight < 300
            ? "Under 300g"
            : r.weight <= 305
              ? "300–305g"
              : r.weight <= 310
                ? "305–310g"
                : "310g+";
        if (!weights.includes(band)) return false;
      }
      if (patterns.length && !patterns.includes(r.string_pattern)) return false;
      if (r.power_score < minPower || r.control_score < minControl || r.spin_score < minSpin)
        return false;
      if (r.price > maxPriceUsd) return false;
      return true;
    });
  }, [q, brands, heads, weights, patterns, minPower, minControl, minSpin, maxPriceUsd]);

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Base de datos de raquetas</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold sm:text-5xl">Explorar Raquetas</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{DATA_DISCLAIMER}</p>

          <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="panel h-fit space-y-6 p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar raquetas…"
                  className="h-11 pl-9"
                />
              </div>
              <FilterGroup label="Marca">
                {BRANDS.map((b) => (
                  <Chip
                    key={b}
                    active={brands.includes(b)}
                    onClick={() => toggle(brands, setBrands, b)}
                  >
                    {b}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup label="Tamaño de cabeza">
                {HEAD_SIZES.map((h) => (
                  <Chip
                    key={h}
                    active={heads.includes(h)}
                    onClick={() => toggle(heads, setHeads, h)}
                  >
                    {h}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup label="Peso">
                {WEIGHTS.map((w) => (
                  <Chip
                    key={w}
                    active={weights.includes(w)}
                    onClick={() => toggle(weights, setWeights, w)}
                  >
                    {WEIGHT_LABELS[w]}
                  </Chip>
                ))}
              </FilterGroup>
              <FilterGroup label="Patrón de encordado">
                {PATTERNS.map((p) => (
                  <Chip
                    key={p}
                    active={patterns.includes(p)}
                    onClick={() => toggle(patterns, setPatterns, p)}
                  >
                    {p}
                  </Chip>
                ))}
              </FilterGroup>
              <RangeFilter label="Potencia mínima" value={minPower} onChange={setMinPower} />
              <RangeFilter label="Control mínimo" value={minControl} onChange={setMinControl} />
              <RangeFilter label="Efecto mínimo" value={minSpin} onChange={setMinSpin} />
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Precio máximo</span>
                  <span className="font-semibold">{formatMXN(maxPriceUsd)}</span>
                </div>
                <Slider
                  min={MAX_PRICE_MIN_MXN}
                  max={MAX_PRICE_MAX_MXN}
                  step={250}
                  value={[maxPriceMxn]}
                  onValueChange={(v) => setMaxPriceMxn(v[0] ?? MAX_PRICE_MAX_MXN)}
                />
              </div>
            </aside>

            <div>
              <p className="text-sm text-muted-foreground">{results.length} raquetas</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((r) => (
                  <Link
                    key={r.id}
                    to="/explore/$racketId"
                    params={{ racketId: r.id }}
                    className="panel flex flex-col overflow-hidden transition-colors hover:bg-surface-strong"
                  >
                    <RacketVisual
                      label={racketName(r)}
                      image={r.image}
                      className="aspect-[4/3] w-full rounded-none border-0 border-b"
                    />
                    <div className="flex flex-1 flex-col p-5">
                      <span className="eyebrow">{r.brand}</span>
                      <h2 className="text-display mt-2 text-xl font-extrabold">{r.model}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {r.head_size} pulg² · {r.weight}g · {r.string_pattern} · {r.swingweight} SW
                      </p>
                      <p className="mt-3 flex-1 text-sm text-muted-foreground">{r.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                        <span className="rounded-full bg-secondary px-2.5 py-1">
                          Potencia {r.power_score}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-1">
                          Control {r.control_score}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-1">
                          Efecto {r.spin_score}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                {!results.length && (
                  <p className="text-muted-foreground">Ninguna raqueta coincide con esos filtros.</p>
                )}
              </div>
            </div>
          </div>
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function RangeFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}/10</span>
      </div>
      <Slider
        min={1}
        max={10}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? 1)}
      />
    </div>
  );
}
