/**
 * Shared types + option lists for the Lovable Cloud racket catalog.
 * All catalog data is stored in the `rackets` table — nothing is hard-coded.
 */

export interface RacketRow {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number | null;
  racket_type: string | null;
  head_size: number | null;
  length: number | null;
  weight: number | null;
  balance: number | null;
  swingweight: number | null;
  stiffness: number | null;
  beam_width: string | null;
  string_pattern: string | null;
  composition: string | null;
  power_level: string | null;
  swing_speed: string | null;
  stroke_style: string | null;
  price: number | null;
  image_url: string | null;
  description: string | null;
  product_url: string | null;
  is_current: boolean;
  created_at: string;
}

export const RACKET_TYPES = ["Players", "Tweener", "Game Improvement", "Junior", "Other"] as const;
export const POWER_LEVELS = ["Low", "Medium", "High"] as const;
export const SWING_SPEEDS = ["Slow", "Moderate", "Fast"] as const;
export const STRING_PATTERNS = ["16x19", "18x20", "16x20", "16x18"] as const;
export const STROKE_STYLES = [
  "aggressive-baseliner",
  "all-court",
  "counterpuncher",
  "serve-volley",
  "defensive",
] as const;

export const STROKE_LABELS: Record<string, string> = {
  "aggressive-baseliner": "Aggressive baseliner",
  "all-court": "All-court",
  counterpuncher: "Counterpuncher",
  "serve-volley": "Serve & volley",
  defensive: "Defensive",
};

export const WEIGHT_BANDS = [
  { label: "Under 285g", min: 0, max: 284.99 },
  { label: "285–299g", min: 285, max: 299.99 },
  { label: "300–309g", min: 300, max: 309.99 },
  { label: "310g+", min: 310, max: 9999 },
] as const;

export const HEAD_BANDS = [
  { label: "Under 98", min: 0, max: 97.99 },
  { label: "98–99", min: 98, max: 99.99 },
  { label: "100–101", min: 100, max: 101.99 },
  { label: "102+", min: 102, max: 9999 },
] as const;

export const SORTS = [
  { value: "brand", label: "Brand A–Z" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "weight-asc", label: "Weight: light to heavy" },
  { value: "weight-desc", label: "Weight: heavy to light" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

export function sortRackets(rows: RacketRow[], sort: SortValue): RacketRow[] {
  const out = [...rows];
  const num = (v: number | null) => (v == null ? Number.MAX_SAFE_INTEGER : v);
  switch (sort) {
    case "newest":
      return out.sort((a, b) => (b.year ?? 0) - (a.year ?? 0) || a.brand.localeCompare(b.brand));
    case "price-asc":
      return out.sort((a, b) => num(a.price) - num(b.price));
    case "price-desc":
      return out.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case "weight-asc":
      return out.sort((a, b) => num(a.weight) - num(b.weight));
    case "weight-desc":
      return out.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
    default:
      return out.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
  }
}

export function racketFullName(r: Pick<RacketRow, "brand" | "model">) {
  return `${r.brand} ${r.model}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CATALOG_DISCLAIMER =
  "Specifications are indicative reference values maintained in our own database. Product photography is only shown when we hold a documented licence.";
