import { KEY_SPECS, type RacketRow } from "./racket-db";
import { toEngineRacket } from "./racket-engine";
import { missingFromManifest, type ManifestEntry } from "./racket-manifest";

export interface AuditReport {
  total: number;
  byBrand: { key: string; count: number }[];
  byYear: { key: string; count: number }[];
  byPattern: { key: string; count: number }[];
  current: number;
  discontinued: number;
  incomplete: RacketRow[];
  duplicates: { key: string; rows: RacketRow[] }[];
  noImage: RacketRow[];
  noVerifiedSource: RacketRow[];
  notRecommendable: RacketRow[];
  notSearchable: RacketRow[];
  notChatable: RacketRow[];
  missingSpecCounts: { key: string; count: number }[];
  missing: ManifestEntry[];
}

function tally(values: (string | number | null)[]) {
  const map = new Map<string, number>();
  for (const v of values) {
    const k = v == null || v === "" ? "Sin dato" : String(v);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map, ([key, count]) => ({ key, count })).sort(
    (a, b) => b.count - a.count || a.key.localeCompare(b.key),
  );
}

const idKey = (r: RacketRow) =>
  [r.brand, r.model, r.generation ?? "", r.year ?? ""].join("|").toLowerCase();

export function auditRackets(rows: RacketRow[]): AuditReport {
  const dupMap = new Map<string, RacketRow[]>();
  for (const r of rows) {
    const k = idKey(r);
    dupMap.set(k, [...(dupMap.get(k) ?? []), r]);
  }

  const missingSpec = new Map<string, number>();
  for (const r of rows) {
    for (const spec of KEY_SPECS) {
      const v = r[spec];
      if (v == null || v === "") missingSpec.set(spec, (missingSpec.get(spec) ?? 0) + 1);
    }
  }

  // Una raqueta es "recomendable" si el motor la puede puntuar y colocarla en
  // algún nivel/estilo; es "buscable" si tiene marca+modelo+slug; el chatbot
  // recibe exactamente el mismo listado, así que sólo falla si no tiene nombre.
  const notRecommendable = rows.filter((r) => {
    const e = toEngineRacket(r);
    return e.recommended_level.length === 0 || e.recommended_player_types.length === 0;
  });
  const notSearchable = rows.filter((r) => !r.slug || !r.brand?.trim() || !r.model?.trim());
  const notChatable = notSearchable;

  return {
    total: rows.length,
    byBrand: tally(rows.map((r) => r.brand)),
    byYear: tally(rows.map((r) => r.year)),
    byPattern: tally(rows.map((r) => r.string_pattern)),
    current: rows.filter((r) => r.status === "current" || r.is_current).length,
    discontinued: rows.filter((r) => !(r.status === "current" || r.is_current)).length,
    incomplete: rows.filter((r) => r.incomplete_data),
    duplicates: Array.from(dupMap, ([key, rs]) => ({ key, rows: rs })).filter((d) => d.rows.length > 1),
    noImage: rows.filter((r) => !r.image_url),
    noVerifiedSource: rows.filter((r) => !r.source_verified),
    notRecommendable,
    notSearchable,
    notChatable,
    missingSpecCounts: Array.from(missingSpec, ([key, count]) => ({ key, count })).sort(
      (a, b) => b.count - a.count,
    ),
    missing: missingFromManifest(rows),
  };
}
