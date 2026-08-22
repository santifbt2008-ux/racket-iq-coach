/**
 * Manifiesto de catálogo: modelos que DEBERÍAN existir en la base de datos.
 *
 * No contiene especificaciones — sólo identidad (marca / modelo / año).
 * Sirve únicamente para el reporte "MISSING RACKETS": comparar lo que hay en
 * Supabase contra la lista de modelos que queremos cubrir. Nunca se usa como
 * fuente de datos para búsqueda, recomendaciones, comparación ni chatbot.
 */
export interface ManifestEntry {
  brand: string;
  model: string;
  year?: number;
  note?: string;
}

export const RACKET_MANIFEST: ManifestEntry[] = [
  // Wilson — familia Defyer
  { brand: "Wilson", model: "Defyer 98 Pro", year: 2026, note: "v1" },
  { brand: "Wilson", model: "Defyer 100", year: 2026, note: "v1" },
  { brand: "Wilson", model: "Defyer 100L", year: 2026, note: "v1" },
  { brand: "Wilson", model: "Defyer 100UL", year: 2026, note: "v1" },
  // Wilson — otras familias
  { brand: "Wilson", model: "Blade 98 16x19", note: "v9" },
  { brand: "Wilson", model: "Blade 98 18x20", note: "v9" },
  { brand: "Wilson", model: "Blade 100", note: "v9" },
  { brand: "Wilson", model: "Blade 104", note: "v9" },
  { brand: "Wilson", model: "Clash 100", note: "v3" },
  { brand: "Wilson", model: "Clash 100 Pro", note: "v3" },
  { brand: "Wilson", model: "Clash 108", note: "v3" },
  { brand: "Wilson", model: "Pro Staff 97", note: "v14" },
  { brand: "Wilson", model: "Pro Staff 97L", note: "v14" },
  { brand: "Wilson", model: "Pro Staff X 100", note: "v14" },
  { brand: "Wilson", model: "Ultra 100", note: "v4/v5" },
  { brand: "Wilson", model: "Ultra 100L" },
  { brand: "Wilson", model: "Shift 99 Pro" },
  { brand: "Wilson", model: "Shift 99" },
  { brand: "Wilson", model: "Burn 100LS" },

  // HEAD — familia Boom 2026
  { brand: "HEAD", model: "Boom Pro", year: 2026 },
  { brand: "HEAD", model: "Boom MP", year: 2026 },
  { brand: "HEAD", model: "Boom MP Alternate", year: 2026 },
  { brand: "HEAD", model: "Boom Team", year: 2026 },
  { brand: "HEAD", model: "Boom Team L", year: 2026 },
  // HEAD — otras familias
  { brand: "HEAD", model: "Speed MP" },
  { brand: "HEAD", model: "Speed Pro" },
  { brand: "HEAD", model: "Speed Team" },
  { brand: "HEAD", model: "Radical MP" },
  { brand: "HEAD", model: "Radical Pro" },
  { brand: "HEAD", model: "Gravity MP" },
  { brand: "HEAD", model: "Gravity Pro" },
  { brand: "HEAD", model: "Prestige MP" },
  { brand: "HEAD", model: "Prestige Pro" },
  { brand: "HEAD", model: "Extreme MP" },
  { brand: "HEAD", model: "Extreme Tour" },
  { brand: "HEAD", model: "Instinct MP" },

  // Tecnifibre — familia Fire 2026
  { brand: "Tecnifibre", model: "Fire 305S", year: 2026 },
  { brand: "Tecnifibre", model: "Fire 305", year: 2026 },
  { brand: "Tecnifibre", model: "Fire 300", year: 2026 },
  { brand: "Tecnifibre", model: "Fire 285", year: 2026 },
  { brand: "Tecnifibre", model: "Fire 275", year: 2026 },
  { brand: "Tecnifibre", model: "TFight 300 ISOFLEX" },
  { brand: "Tecnifibre", model: "TFight 305 ISOFLEX" },
  { brand: "Tecnifibre", model: "TF40 305 18x20" },

  // Babolat
  { brand: "Babolat", model: "Pure Aero" },
  { brand: "Babolat", model: "Pure Aero 98" },
  { brand: "Babolat", model: "Pure Aero+" },
  { brand: "Babolat", model: "Pure Aero Rafa" },
  { brand: "Babolat", model: "Pure Drive" },
  { brand: "Babolat", model: "Pure Drive 98" },
  { brand: "Babolat", model: "Pure Strike 98 16x19" },
  { brand: "Babolat", model: "Pure Strike 98 18x20" },
  { brand: "Babolat", model: "Pure Strike 100" },

  // Yonex
  { brand: "Yonex", model: "EZONE 98" },
  { brand: "Yonex", model: "EZONE 100" },
  { brand: "Yonex", model: "EZONE 102" },
  { brand: "Yonex", model: "VCORE 95" },
  { brand: "Yonex", model: "VCORE 98" },
  { brand: "Yonex", model: "VCORE 100" },
  { brand: "Yonex", model: "PERCEPT 97" },
  { brand: "Yonex", model: "PERCEPT 100D" },

  // Dunlop
  { brand: "Dunlop", model: "CX 200" },
  { brand: "Dunlop", model: "CX 200 Tour 18x20" },
  { brand: "Dunlop", model: "FX 500" },
  { brand: "Dunlop", model: "SX 300" },

  // Prince
  { brand: "Prince", model: "Phantom 100X 18x20" },
  { brand: "Prince", model: "Phantom 100X 16x18" },
  { brand: "Prince", model: "Textreme ATS Tour 100" },

  // Marcas sin cobertura actual
  { brand: "Volkl", model: "V-Cell 8 300g" },
  { brand: "Volkl", model: "V-Feel 10 320g" },
  { brand: "Solinco", model: "Blackout 300" },
  { brand: "Solinco", model: "Whiteout 305" },
  { brand: "ProKennex", model: "Ki Q+ Tour Pro" },
  { brand: "ProKennex", model: "Black Ace 315" },
  { brand: "Mizuno", model: "Xyst TX-1" },
  { brand: "Lacoste", model: "L23" },
];

const key = (brand: string, model: string) =>
  `${brand} ${model}`.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function missingFromManifest(rows: { brand: string; model: string }[]): ManifestEntry[] {
  const have = new Set(rows.map((r) => key(r.brand, r.model)));
  const haveLoose = Array.from(have);
  return RACKET_MANIFEST.filter((m) => {
    const k = key(m.brand, m.model);
    return !have.has(k) && !haveLoose.some((h) => h.startsWith(k) || k.startsWith(h));
  });
}
