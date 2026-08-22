/**
 * Adapter: Supabase `rackets` rows -> the shape the recommendation engine,
 * comparison and chatbot use.
 *
 * IMPORTANT: no specification is ever invented here. Every value below is
 * either read straight from the database row, or is a *derived estimate*
 * computed transparently from real specs (head size, weight, swingweight,
 * stiffness, pattern). Derived values are clearly labelled as estimates in
 * the UI, and `missing` lists the specs the database does not have yet.
 */
import type { RacketRow } from "./racket-db";

export type PlayerType =
  | "aggressive-baseliner"
  | "all-court"
  | "counterpuncher"
  | "serve-volley"
  | "defensive";

export type Level = "beginner" | "intermediate" | "advanced" | "tournament";

export interface EngineRacket {
  id: string;
  slug: string;
  brand: string;
  model: string;
  name: string;
  year: number | null;
  racket_type: string | null;
  head_size: number | null;
  weight: number | null;
  balance: number | null;
  swingweight: number | null;
  stiffness: number | null;
  length: number | null;
  beam: string | null;
  string_pattern: string | null;
  composition: string | null;
  price: number | null;
  image_url: string | null;
  product_url: string | null;
  description: string | null;
  is_current: boolean;
  power_level: string | null;
  swing_speed: string | null;

  // Derived estimates (1-10) — computed from the real specs above.
  power_score: number;
  control_score: number;
  spin_score: number;
  stability_score: number;
  maneuverability_score: number;
  comfort_score: number;
  forgiveness_score: number;

  recommended_player_types: PlayerType[];
  recommended_level: Level[];
  /** Specs that are NULL in the database — surfaced so they can be fixed, never invented. */
  missing: string[];
}

const VALID_TYPES: PlayerType[] = [
  "aggressive-baseliner",
  "all-court",
  "counterpuncher",
  "serve-volley",
  "defensive",
];

const norm = (v: number, lo: number, hi: number) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
const to10 = (x: number) => Math.max(1, Math.min(10, Math.round(x * 9 + 1)));

/** Open patterns (fewer crosses per main) give more spin, denser ones more control. */
export function patternOpenness(pattern: string | null): number {
  if (!pattern) return 0.5;
  const m = /^(\d+)\s*[xX×]\s*(\d+)$/.exec(pattern.trim());
  if (!m) return 0.5;
  const mains = Number(m[1]);
  const crosses = Number(m[2]);
  // density ~ mains*crosses; 16x19 = 304 (open) ... 18x20 = 360 (dense)
  return Math.max(0, Math.min(1, (360 - mains * crosses) / 70));
}

export function toEngineRacket(row: RacketRow): EngineRacket {
  const missing: string[] = [];
  const req = <T,>(v: T | null, key: string): T | null => {
    if (v === null || v === undefined || v === "") missing.push(key);
    return (v ?? null) as T | null;
  };

  const head = req(row.head_size, "head_size");
  const weight = req(row.weight, "weight");
  const sw = req(row.swingweight, "swingweight");
  const ra = req(row.stiffness, "stiffness");
  const pattern = req(row.string_pattern, "string_pattern");
  req(row.balance, "balance");
  req(row.beam_width, "beam_width");
  req(row.composition, "composition");
  req(row.price, "price");
  req(row.image_url, "image_url");
  req(row.description, "description");

  const nHead = head != null ? norm(head, 95, 105) : 0.5;
  const nWeight = weight != null ? norm(weight, 285, 320) : 0.5;
  const nSw = sw != null ? norm(sw, 290, 335) : 0.5;
  const nRa = ra != null ? norm(ra, 58, 72) : 0.5;
  const open = patternOpenness(pattern);

  const declaredPower =
    row.power_level === "High" ? 0.85 : row.power_level === "Low" ? 0.2 : row.power_level === "Medium" ? 0.5 : null;

  const powerRaw = 0.35 * nRa + 0.35 * nHead + 0.3 * (1 - nWeight);
  const power = declaredPower == null ? powerRaw : powerRaw * 0.45 + declaredPower * 0.55;

  const control = 0.4 * (1 - nHead) + 0.3 * nWeight + 0.3 * (1 - open);
  const spin = 0.55 * open + 0.25 * nHead + 0.2 * nSw;
  const stability = 0.5 * nWeight + 0.5 * nSw;
  const maneuver = 1 - (0.6 * nSw + 0.4 * nWeight);
  const comfort = 0.7 * (1 - nRa) + 0.2 * nWeight + 0.1 * (1 - nHead);
  const forgiveness = 0.6 * nHead + 0.4 * stability;

  const styles = (row.stroke_style ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is PlayerType => (VALID_TYPES as string[]).includes(s));
  if (!row.stroke_style) missing.push("stroke_style");

  const levels: Level[] = [];
  const type = row.racket_type ?? "";
  if (type === "Game Improvement" || (weight != null && weight < 295)) levels.push("beginner");
  if (type !== "Players" || (weight != null && weight <= 310)) levels.push("intermediate");
  levels.push("advanced");
  if (type === "Players" || (weight != null && weight >= 305)) levels.push("tournament");

  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    name: `${row.brand} ${row.model}`,
    year: row.year,
    racket_type: row.racket_type,
    head_size: row.head_size,
    weight: row.weight,
    balance: row.balance,
    swingweight: row.swingweight,
    stiffness: row.stiffness,
    length: row.length,
    beam: row.beam_width,
    string_pattern: row.string_pattern,
    composition: row.composition,
    price: row.price,
    image_url: row.image_url,
    product_url: row.product_url,
    description: row.description,
    is_current: row.is_current,
    power_level: row.power_level,
    swing_speed: row.swing_speed,

    power_score: to10(power),
    control_score: to10(control),
    spin_score: to10(spin),
    stability_score: to10(stability),
    maneuverability_score: to10(maneuver),
    comfort_score: to10(comfort),
    forgiveness_score: to10(forgiveness),

    recommended_player_types: styles.length ? styles : ["all-court"],
    recommended_level: Array.from(new Set(levels)),
    missing,
  };
}

export function toEngineRackets(rows: RacketRow[]): EngineRacket[] {
  return rows.map(toEngineRacket);
}

export function racketName(r: { brand: string; model: string }) {
  return `${r.brand} ${r.model}`;
}

/** Every string pattern actually present in the catalog, sorted. */
export function patternsFromRows(rows: Pick<RacketRow, "string_pattern">[]): string[] {
  return Array.from(
    new Set(rows.map((r) => (r.string_pattern ?? "").trim()).filter(Boolean)),
  ).sort();
}

export const DERIVED_NOTE =
  "Potencia, control, efecto, estabilidad, maniobrabilidad y comodidad son estimaciones calculadas a partir de las especificaciones reales de la base de datos (cabeza, peso, swingweight, rigidez y patrón). No son mediciones del fabricante.";
