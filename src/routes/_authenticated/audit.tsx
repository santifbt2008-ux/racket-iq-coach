import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Page, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { listRackets } from "@/lib/rackets.functions";
import { auditRackets } from "@/lib/racket-audit";
import type { RacketRow } from "@/lib/racket-db";

export const Route = createFileRoute("/_authenticated/audit")({
  head: () => ({
    meta: [
      { title: "Racket Database Audit — RacketIQ" },
      {
        name: "description",
        content:
          "Reporte de auditoría del catálogo de raquetas: totales, duplicados, datos incompletos y modelos faltantes.",
      },
      { property: "og:title", content: "Racket Database Audit — RacketIQ" },
      { property: "og:description", content: "Estado de la base de datos de raquetas de RacketIQ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuditPage,
});

function Stat({ label, value, tone }: { label: string; value: number; tone?: "warn" }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone === "warn" && value > 0 ? "text-destructive" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Tally({ title, rows }: { title: string; rows: { key: string; count: number }[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-3 space-y-1 text-sm">
        {rows.map((r) => (
          <li key={r.key} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{r.key}</span>
            <span className="font-medium tabular-nums">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RacketList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: RacketRow[];
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="font-semibold">
        {title} <span className="text-muted-foreground">({rows.length})</span>
      </h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 max-h-72 space-y-1 overflow-auto text-sm">
          {rows.map((r) => (
            <li key={r.id}>
              <Link to="/catalog/$slug" params={{ slug: r.slug }} className="hover:underline">
                {r.brand} {r.model}
                {r.year ? ` (${r.year})` : ""}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AuditPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["rackets"],
    queryFn: () => listRackets(),
  });
  const report = useMemo(() => (data ? auditRackets(data) : null), [data]);

  return (
    <>
      <SiteHeader />
      <main>
        <Page>
          <p className="eyebrow">Admin</p>
          <h1 className="text-display mt-3 text-4xl font-extrabold">Racket Database Audit</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Reporte en vivo sobre la tabla <code>rackets</code> de la base de datos. Es la única
            fuente de verdad del buscador, los filtros, las recomendaciones, el comparador, el
            chatbot y las fichas individuales.
          </p>

          {isLoading && <p className="mt-8 text-muted-foreground">Cargando catálogo…</p>}
          {error && <p className="mt-8 text-destructive">No se pudo cargar el catálogo.</p>}

          {report && (
            <div className="mt-8 space-y-8">
              <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Total de raquetas" value={report.total} />
                <Stat label="Actuales" value={report.current} />
                <Stat label="Descontinuadas" value={report.discontinued} />
                <Stat label="Marcas" value={report.byBrand.length} />
                <Stat label="Datos incompletos" value={report.incomplete.length} tone="warn" />
                <Stat label="Duplicadas" value={report.duplicates.length} tone="warn" />
                <Stat label="Sin imagen" value={report.noImage.length} tone="warn" />
                <Stat label="Sin fuente verificada" value={report.noVerifiedSource.length} tone="warn" />
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <Tally title="Por marca" rows={report.byBrand} />
                <Tally title="Por año" rows={report.byYear} />
                <Tally title="Por patrón de cuerdas" rows={report.byPattern} />
              </section>

              <section>
                <h2 className="text-xl font-bold">Cobertura del sistema</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <RacketList
                    title="No aparecen en recomendaciones"
                    rows={report.notRecommendable}
                    empty="Todas las raquetas pueden ser consideradas por el algoritmo."
                  />
                  <RacketList
                    title="No aparecen en búsqueda"
                    rows={report.notSearchable}
                    empty="Todas las raquetas son buscables y filtrables."
                  />
                  <RacketList
                    title="El chatbot no las encuentra"
                    rows={report.notChatable}
                    empty="El chatbot recibe el catálogo completo desde la base de datos."
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold">Calidad de datos</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <Tally title="Especificaciones faltantes" rows={report.missingSpecCounts} />
                  <RacketList
                    title="Marcadas como incompletas"
                    rows={report.incomplete}
                    empty="Ninguna raqueta tiene datos clave faltantes."
                  />
                  <RacketList
                    title="Sin fuente verificada"
                    rows={report.noVerifiedSource}
                    empty="Todas las raquetas tienen fuente verificada."
                  />
                </div>
                {report.duplicates.length > 0 && (
                  <div className="mt-4 rounded-xl border border-destructive/40 bg-surface p-4">
                    <h3 className="font-semibold">Posibles duplicados (marca + modelo + generación + año)</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {report.duplicates.map((d) => (
                        <li key={d.key}>
                          {d.rows.map((r) => `${r.brand} ${r.model} (${r.slug})`).join(" · ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-bold">MISSING RACKETS</h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Modelos que deberían estar en el catálogo y hoy no existen en la base de datos. No
                  se inventan especificaciones: hay que capturarlas desde fuentes oficiales en el
                  panel de administración.
                </p>
                <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                  {report.missing.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No falta ningún modelo del manifiesto.</p>
                  ) : (
                    <ul className="grid gap-1 text-sm md:grid-cols-2">
                      {report.missing.map((m) => (
                        <li key={`${m.brand}-${m.model}-${m.year ?? ""}`}>
                          <span className="font-medium">
                            {m.brand} {m.model}
                          </span>
                          {m.year ? ` — ${m.year}` : ""}
                          {m.note ? ` · ${m.note}` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Link to="/admin" className="mt-4 inline-block text-sm font-medium underline">
                  Ir al panel de administración
                </Link>
              </section>
            </div>
          )}
        </Page>
      </main>
      <SiteFooter />
    </>
  );
}
