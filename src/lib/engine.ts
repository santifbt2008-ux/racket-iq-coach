/**
 * RacketIQ recommendation engine.
 *
 * Transparent, deterministic weighted scoring. The racket database is the only
 * source of truth for specifications — nothing here invents specs.
 */
import { RACKETS, racketName, type Racket } from "@/data/rackets";
import {
  DISLIKE_LABELS,
  IMPROVEMENT_LABELS,
  STYLE_LABELS,
  type Improvement,
  type PlayerProfile,
} from "@/lib/profile";

export interface DimensionScore {
  key: string;
  label: string;
  score: number; // 0-100
  weight: number;
}

export interface MatchResult {
  racket: Racket;
  overall: number;
  dimensions: DimensionScore[];
  reasons: string[];
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

/** 1-10 importance slider -> desired racket attribute score (1-10). */
function target(importance: number) {
  return clamp(importance, 1, 10);
}

/**
 * Compares a racket attribute against a desired attribute value.
 * Falling short of what the player asked for is penalised harder than exceeding it.
 */
function attrScore(racketValue: number, desired: number, excessMatters = true) {
  const diff = racketValue - desired;
  const penalty = diff < 0 ? Math.abs(diff) * 9 : excessMatters ? diff * 4 : 0;
  return clamp(100 - penalty);
}

function headSizeScore(profile: PlayerProfile, r: Racket) {
  if (!profile.headSize || profile.headSize === "any") {
    // No stated preference: judge against the control/power balance requested.
    const wantsControl = profile.control - profile.power;
    const ideal = wantsControl >= 3 ? 97 : wantsControl <= -3 ? 101 : 99;
    return clamp(100 - Math.abs(r.head_size - ideal) * 7);
  }
  const pref = profile.headSize === "102+" ? 102 : Number(profile.headSize);
  const diff = Math.abs(r.head_size - pref);
  return clamp(100 - diff * 12);
}

function weightBand(w: number): [number, number] {
  if (w < 300) return [285, 299];
  if (w <= 305) return [300, 305];
  if (w <= 310) return [305, 310];
  return [310, 340];
}

function weightScore(profile: PlayerProfile, r: Racket) {
  if (!profile.weight || profile.weight === "any") {
    const ideal = 295 + (profile.stability - 5) * 2.5 - (profile.maneuverability - 5) * 1.5;
    return clamp(100 - Math.abs(r.weight - ideal) * 2.5);
  }
  const bands: Record<string, [number, number]> = {
    u300: [285, 299],
    "300-305": [300, 305],
    "305-310": [305, 310],
    "310+": [310, 340],
  };
  const [lo, hi] = bands[profile.weight] ?? weightBand(r.weight);
  if (r.weight >= lo && r.weight <= hi) return 100;
  const distance = r.weight < lo ? lo - r.weight : r.weight - hi;
  return clamp(100 - distance * 6);
}

function patternScore(profile: PlayerProfile, r: Racket) {
  if (!profile.pattern || profile.pattern === "any") return 88;
  if (r.string_pattern === profile.pattern) return 100;
  // 16x20 / 16x18 sit between the two classic patterns.
  if (r.string_pattern === "16x20" || r.string_pattern === "16x18") return 78;
  return 55;
}

function styleScore(profile: PlayerProfile, r: Racket) {
  if (!profile.styles.length) return 80;
  const hits = profile.styles.filter((s) => r.recommended_player_types.includes(s)).length;
  if (!hits) return 68;
  return hits === profile.styles.length ? 100 : 88;
}

function levelBucket(level: string): "beginner" | "intermediate" | "advanced" | "tournament" {
  if (/Beginner/i.test(level) || /UTR 4/.test(level)) return "beginner";
  if (/Intermediate/i.test(level) || /UTR 6/.test(level)) return "intermediate";
  if (/Tournament/i.test(level) || /UTR 10/.test(level)) return "tournament";
  return "advanced";
}

function levelScore(profile: PlayerProfile, r: Racket) {
  const bucket = levelBucket(profile.level);
  return r.recommended_level.includes(bucket) ? 100 : 70;
}

function balanceScore(profile: PlayerProfile, r: Racket) {
  if (!profile.balance || profile.balance === "any") return 82;
  // Balance point in cm from the butt cap; roughly <32 head-light, 32-32.5 even, >32.5 head-heavy for a 27" frame.
  const bucket = r.balance < 32 ? "head-light" : r.balance <= 32.5 ? "even" : "head-heavy";
  return bucket === profile.balance ? 100 : 65;
}

function budgetScore(profile: PlayerProfile, r: Racket) {
  if (!profile.budget || profile.budget === "any") return 85;
  const caps: Record<string, [number, number]> = {
    u150: [0, 150],
    "150-250": [150, 250],
    "250-350": [250, 350],
    "350+": [350, Infinity],
  };
  const [lo, hi] = caps[profile.budget] ?? [0, Infinity];
  if (r.price >= lo && r.price <= hi) return 100;
  if (profile.payMoreForFit)
    return r.price > hi ? clamp(100 - (r.price - hi) * 0.3) : clamp(100 - (lo - r.price) * 0.5);
  // Not willing to pay more: over-budget rackets are penalised hard, under-budget lightly.
  return r.price > hi ? clamp(60 - (r.price - hi) * 0.6) : clamp(90 - (lo - r.price) * 0.2);
}

/** Comfort sensitivity nudges the desired comfort target and how hard it's weighted. */
function comfortTarget(profile: PlayerProfile) {
  if (profile.comfortSensitivity === "significant") return 9;
  if (profile.comfortSensitivity === "mild") return 7.5;
  return profile.improvements.includes("comfort") ? 8.5 : 6;
}

function comfortWeight(profile: PlayerProfile) {
  if (profile.comfortSensitivity === "significant") return 1.8;
  if (profile.comfortSensitivity === "mild") return 1.1;
  return profile.improvements.includes("comfort") ? 1.4 : 0.6;
}

/** Priority ranking gives the player's explicitly ordered items an extra weight boost, front-loaded. */
function rankingBoost(profile: PlayerProfile, key: string) {
  const idx = profile.priorityRanking.indexOf(key as Improvement);
  if (idx === -1) return 0;
  return Math.max(0, 0.8 - idx * 0.2); // 1st: +0.8, 2nd: +0.6, 3rd: +0.4, 4th: +0.2
}

/** Improvement selections, swing mechanics and topspin level nudge the desired attribute values upward. */
function desiredAttributes(profile: PlayerProfile) {
  const bump = (key: string, base: number) =>
    clamp(
      base +
        (profile.improvements.includes(key as never) ? 1.5 : 0) +
        (profile.dislikes.includes(key as never) ? 1 : 0),
      1,
      10,
    );

  // Faster/longer swings and a heavy topspin ball generate their own racket-head
  // speed, so the player needs less "free" power/spin from the frame itself.
  const swingSpeedAdj = profile.swingSpeed === "fast" ? -1 : profile.swingSpeed === "slow" ? 1 : 0;
  const swingLengthAdj =
    profile.swingLength === "long" ? -0.5 : profile.swingLength === "compact" ? 0.5 : 0;
  const topspinAdj = (profile.topspinLevel - 5) * 0.3;
  const contactAdj =
    profile.contactPoint === "late" ? 0.5 : profile.contactPoint === "early" ? -0.3 : 0;

  return {
    spin: clamp(bump("spin", target(profile.spin)) + topspinAdj, 1, 10),
    control: clamp(bump("control", target(profile.control)) + contactAdj, 1, 10),
    power: clamp(bump("power", target(profile.power)) + swingSpeedAdj + swingLengthAdj, 1, 10),
    stability: bump("stability", target(profile.stability)),
    maneuverability: bump("maneuverability", target(profile.maneuverability)),
    comfort: comfortTarget(profile),
  };
}

function weights(profile: PlayerProfile) {
  const w = {
    spin: 1 + profile.spin / 10 + rankingBoost(profile, "spin"),
    control: 1 + profile.control / 10 + rankingBoost(profile, "control"),
    power: 1 + profile.power / 10 + rankingBoost(profile, "power"),
    stability: 1 + profile.stability / 10 + rankingBoost(profile, "stability"),
    maneuverability: 1 + profile.maneuverability / 10 + rankingBoost(profile, "maneuverability"),
    comfort: comfortWeight(profile) + rankingBoost(profile, "comfort"),
    headSize: profile.headSize && profile.headSize !== "any" ? 1.4 : 0.7,
    weight: profile.weight && profile.weight !== "any" ? 1.3 : 0.7,
    balance: profile.balance && profile.balance !== "any" ? 1.1 : 0.5,
    pattern: profile.pattern && profile.pattern !== "any" ? 1.0 : 0.5,
    budget: profile.budget && profile.budget !== "any" ? 1.2 : 0.4,
    style: 1.1,
    level: 1.0,
  };
  for (const imp of profile.improvements) {
    const rec = w as unknown as Record<string, number>;
    if (typeof rec[imp] === "number") rec[imp] = (rec[imp] ?? 0) + 0.6;

    if (imp === "serve") w.power += 0.3;
    if (imp === "sweetspot") w.stability += 0.3;
    if (imp === "feel") w.control += 0.3;
  }
  return w;
}

export function scoreRacket(profile: PlayerProfile, r: Racket): MatchResult {
  const d = desiredAttributes(profile);
  const w = weights(profile);

  const dims: DimensionScore[] = [
    { key: "spin", label: "Spin", score: attrScore(r.spin_score, d.spin, false), weight: w.spin },
    {
      key: "control",
      label: "Control",
      score: attrScore(r.control_score, d.control, false),
      weight: w.control,
    },
    { key: "power", label: "Power", score: attrScore(r.power_score, d.power), weight: w.power },
    {
      key: "stability",
      label: "Stability",
      score: attrScore(r.stability_score, d.stability, false),
      weight: w.stability,
    },
    {
      key: "maneuverability",
      label: "Maneuverability",
      score: attrScore(r.maneuverability_score, d.maneuverability, false),
      weight: w.maneuverability,
    },
    {
      key: "comfort",
      label: "Comfort",
      score: attrScore(r.comfort_score, d.comfort, false),
      weight: w.comfort,
    },
    { key: "headSize", label: "Head Size", score: headSizeScore(profile, r), weight: w.headSize },
    { key: "weight", label: "Weight", score: weightScore(profile, r), weight: w.weight },
    { key: "balance", label: "Balance", score: balanceScore(profile, r), weight: w.balance },
    { key: "pattern", label: "String Pattern", score: patternScore(profile, r), weight: w.pattern },
    { key: "budget", label: "Budget Fit", score: budgetScore(profile, r), weight: w.budget },
    { key: "style", label: "Playing Style", score: styleScore(profile, r), weight: w.style },
    { key: "level", label: "Level Fit", score: levelScore(profile, r), weight: w.level },
  ];

  const totalWeight = dims.reduce((s, x) => s + x.weight, 0);
  let overall = dims.reduce((s, x) => s + x.score * x.weight, 0) / totalWeight;

  // Small penalty for recommending the racket the player already uses.
  if (profile.currentRacketId === r.id) overall -= 4;

  overall = Math.round(clamp(overall));

  return {
    racket: r,
    overall,
    dimensions: dims.map((x) => ({ ...x, score: Math.round(x.score) })),
    reasons: [],
  };
}

export function recommend(profile: PlayerProfile, limit = 3): MatchResult[] {
  const scored = RACKETS.map((r) => scoreRacket(profile, r)).sort((a, b) => b.overall - a.overall);
  return scored.slice(0, limit).map((m) => ({ ...m, reasons: buildReasons(profile, m) }));
}

/* ------------------------------------------------------------------ */
/* Explanations — derived from the player's own answers + verified specs */
/* ------------------------------------------------------------------ */

function buildReasons(profile: PlayerProfile, m: MatchResult): string[] {
  const r = m.racket;
  const reasons: string[] = [];
  const dim = (k: string) => m.dimensions.find((d) => d.key === k)?.score ?? 0;

  if (profile.spin >= 7 && r.spin_score >= 8) {
    reasons.push(
      `Calificaste el efecto en ${profile.spin}/10${profile.forehand === "heavy" ? " y golpeas una derecha con mucho topspin" : ""}, y el patrón ${r.string_pattern} y la calificación de efecto de ${r.spin_score}/10 de esta raqueta están hechos para ese swing.`,
    );
  }
  if (profile.control >= 7 && r.control_score >= 8) {
    reasons.push(
      `Tu prioridad de control de ${profile.control}/10 hace que la cabeza de ${r.head_size} sq. in. y la calificación de control de ${r.control_score}/10 sean una mejor opción que un marco más grande y orientado a la potencia.`,
    );
  }
  if (profile.power >= 7 && r.power_score >= 8) {
    reasons.push(
      `Pediste potencia (${profile.power}/10); con ${r.stiffness} RA y un aro de ${r.beam} este marco te da profundidad gratuita sin que tengas que forzar el swing.`,
    );
  }
  if (profile.stability >= 7 && r.stability_score >= 8) {
    reasons.push(
      `Su peso encordado de ${r.weight}g y su swingweight de ${r.swingweight} ofrecen la estabilidad que pediste (${profile.stability}/10) mientras mantienen la maniobrabilidad en ${r.maneuverability_score}/10.`,
    );
  }
  if (profile.maneuverability >= 7 && r.maneuverability_score >= 7) {
    reasons.push(
      `Con una maniobrabilidad que calificaste en ${profile.maneuverability}/10, el swingweight de ${r.swingweight} se mantiene lo bastante ágil para intercambios rápidos y recuperaciones defensivas.`,
    );
  }
  const matchedStyle = profile.styles.find((s) => r.recommended_player_types.includes(s));
  if (matchedStyle) {
    reasons.push(
      `Encaja naturalmente con tu juego de ${STYLE_LABELS[matchedStyle].toLowerCase()} — el marco está diseñado justo para ese patrón de juego.`,
    );
  }
  if (profile.improvements.includes("comfort") && r.comfort_score >= 8) {
    reasons.push(
      `Quieres más comodidad: con ${r.stiffness} RA este es uno de los marcos más suaves de la base de datos (${r.comfort_score}/10 en comodidad).`,
    );
  }
  if (profile.improvements.includes("serve") && r.power_score >= 7) {
    reasons.push(
      `Para el mejor saque que pediste, su potencia de ${r.power_score}/10 y su swingweight de ${r.swingweight} ayudan a generar velocidad de cabeza y ritmo gratuito.`,
    );
  }
  if (profile.currentRacketId) {
    const cur = RACKETS.find((x) => x.id === profile.currentRacketId);
    if (cur && cur.id !== r.id) {
      const deltas: string[] = [];
      if (r.spin_score > cur.spin_score) deltas.push("más efecto");
      if (r.control_score > cur.control_score) deltas.push("más control");
      if (r.power_score > cur.power_score) deltas.push("más potencia");
      if (r.stability_score > cur.stability_score) deltas.push("más estabilidad");
      if (r.comfort_score > cur.comfort_score) deltas.push("más comodidad");
      if (deltas.length) {
        reasons.push(
          `Comparado con tu ${racketName(cur)}, nuestros datos de muestra califican este marco mejor en ${deltas.slice(0, 3).join(", ")}.`,
        );
      }
    }
  }
  if (profile.dislikes.length) {
    const issues = profile.dislikes
      .map((d) => DISLIKE_LABELS[d].toLowerCase())
      .slice(0, 2)
      .join(" y ");
    reasons.push(
      `Marcaste ${issues} en tu raqueta actual — este marco obtiene ${Math.round(m.overall)}% en general contra tu perfil, con su mejor ajuste en ${strongestDims(m).join(" y ")}.`,
    );
  }
  if (reasons.length < 3) {
    reasons.push(
      `Según tus prioridades ponderadas, obtiene ${dim("spin")}% en efecto, ${dim("control")}% en control y ${dim("stability")}% en estabilidad frente a los objetivos que definiste.`,
    );
  }
  return reasons.slice(0, 5);
}

function strongestDims(m: MatchResult) {
  return [...m.dimensions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((d) => d.label.toLowerCase());
}

/* ---------------------------- String setup ---------------------------- */

export interface StringSetup {
  string: string;
  type: string;
  gauge: string;
  tension: string;
  rationale: string;
  notes: string[];
}

export function recommendString(profile: PlayerProfile, r: Racket): StringSetup {
  const control = profile.control;
  const spin = profile.spin;
  const power = profile.power;
  const wantsComfort =
    profile.improvements.includes("comfort") || profile.improvements.includes("feel");
  const advanced = ["advanced", "tournament"].includes(levelBucket(profile.level));

  let string: string;
  let type: string;
  let gauge: string;

  if (advanced && control >= 7 && spin >= 7 && !wantsComfort) {
    string = "Luxilon ALU Power";
    type = "Shaped/round polyester (full bed)";
    gauge = "1.25 mm (16L)";
  } else if (advanced && wantsComfort) {
    string = "Polyester mains / multifilament crosses (hybrid)";
    type = "Hybrid";
    gauge = "1.25 mm mains / 1.30 mm crosses";
  } else if (spin >= 7 && control >= 6) {
    string = "Solinco Hyper-G (shaped poly)";
    type = "Shaped polyester";
    gauge = "1.25 mm (16L)";
  } else if (power >= 7 || !advanced) {
    string = "Multifilament (e.g. Tecnifibre NRG2 class)";
    type = "Multifilament";
    gauge = "1.30 mm (16)";
  } else {
    string = "Synthetic gut";
    type = "Synthetic gut";
    gauge = "1.30 mm (16)";
  }

  // Tension range from the player's control/power balance and the frame's power level.
  const base = 50 + (control - power) * 1.2 - (r.power_score - 7) * 1.0;
  const poly = type.toLowerCase().includes("poly");
  const centre = poly ? base - 2 : base + 2;
  const lo = Math.round(clamp(centre - 2, 38, 62));
  const hi = Math.round(clamp(centre + 2, 40, 64));

  const notes = [
    "Comienza a la mitad del rango y ajusta ±2 lbs según cómo esté saliendo la pelota.",
    "El poliéster pierde tensión rápido — planea reencordar aproximadamente tantas veces al año como sesiones juegues por semana.",
  ];
  if (wantsComfort)
    notes.push(
      "Si tienes sensibilidad en el brazo, encorda en el extremo inferior del rango o cambia a una configuración más suave.",
    );

  return {
    string,
    type,
    gauge,
    tension: `${lo}–${hi} lbs`,
    rationale: `Recomendado porque calificaste el control en ${control}/10, el efecto en ${spin}/10 y la potencia en ${power}/10, y la ${racketName(r)} es un marco ${r.power_score >= 8 ? "de mayor potencia" : r.power_score <= 6 ? "de menor potencia" : "de potencia media"} (${r.power_score}/10 en potencia en nuestros datos de muestra). ${poly ? "Un encordado de poliéster mantiene la pelota dentro cuando le pegas fuerte" : "Un encordado más suave añade respuesta y comodidad"} mientras que el rango de tensión mantiene la salida de bola predecible.`,
    notes,
  };
}

/* ------------------------ Grip, overgrip & dampener ------------------------ */

export interface GripSetup {
  size: string;
  rationale: string;
  overgrip: string;
  dampener: string;
}

const GRIP_LABELS: Record<string, string> = {
  "4": '4 (4")',
  "4_1_8": '4⅛" (L1)',
  "4_1_4": '4¼" (L2)',
  "4_3_8": '4⅜" (L3)',
  "4_1_2": '4½" (L4)',
};

/** Grip size is never guessed from scratch — we use the player's stated size,
 * or their current racket's grip if known, and only fall back to a level-based
 * default (clearly marked as a starting point, not a fitted measurement). */
export function recommendGrip(profile: PlayerProfile): GripSetup {
  const advanced = ["advanced", "tournament"].includes(levelBucket(profile.level));
  let size = profile.gripSize && profile.gripSize !== "unsure" ? profile.gripSize : "";
  let rationale: string;

  if (size) {
    rationale = `Basado en el tamaño de grip que nos dijiste que usas (${GRIP_LABELS[size] ?? size}).`;
  } else {
    // Fallback default — most adult players land on 4⅜"; this is a starting point only.
    size = "4_3_8";
    rationale =
      "No tenemos tu tamaño de grip medido, así que por defecto usamos el tamaño más común para adultos (4⅜\"). Un grip muy pequeño aumenta la tensión en muñeca/brazo; uno muy grande limita el efecto — pide en una tienda que lo agranden con una funda termoencogible si se siente incómodo, en lugar de seguir adivinando.";
  }

  const wantsSpin = profile.spin >= 7 || profile.improvements.includes("spin");
  const overgrip = wantsSpin
    ? "Overgrip delgado y adherente (p. ej. Tourna Grip o Yonex Super Grap) — cámbialo cada 1–2 semanas"
    : "Overgrip acolchado y absorbente — cámbialo cada 2–4 semanas";
  const dampener = profile.improvements.includes("feel")
    ? "Amortiguador de silicón opcional para un sonido/sensación más suave — no afecta la potencia, el efecto ni el control"
    : "Opcional — es cuestión de preferencia, no de rendimiento";

  return {
    size: GRIP_LABELS[size] ?? size,
    rationale,
    overgrip,
    dampener,
  };
}

/* --------------------------- Customization --------------------------- */

export interface CustomizationSuggestion {
  item: string;
  goal: string;
}

export function recommendCustomization(
  profile: PlayerProfile,
  r: Racket,
): { needed: boolean; summary: string; suggestions: CustomizationSuggestion[] } {
  const suggestions: CustomizationSuggestion[] = [];

  if (profile.stability >= 8 && r.stability_score <= 7) {
    suggestions.push({
      item: "Cinta de plomo en las 3 y las 9 (2–4 g en total)",
      goal: "Aumentar la estabilidad y el twistweight sin reducir mucho la maniobrabilidad.",
    });
  }
  if (profile.improvements.includes("power") && r.power_score <= 6) {
    suggestions.push({
      item: "Cinta de plomo en las 12 (2 g)",
      goal: "Añadir penetración de golpe y profundidad — espera que el marco se sienta notablemente más cargado hacia la cabeza.",
    });
  }
  if (profile.maneuverability >= 8 && r.maneuverability_score <= 6) {
    suggestions.push({
      item: "Añadir 3–5 g en el mango (silicón o plomo debajo del grip)",
      goal: "Mantener la masa total para estabilidad mientras se desplaza el balance hacia atrás para un manejo más rápido.",
    });
  }
  if (profile.improvements.includes("comfort") && r.stiffness >= 66) {
    suggestions.push({
      item: "Configuración más suave + un grip de repuesto acolchado",
      goal: "Reducir el impacto en un marco más rígido antes de considerar cambios de peso.",
    });
  }
  if (profile.improvements.includes("feel")) {
    suggestions.push({
      item: "Amortiguador de vibración (opcional)",
      goal: "Cambia el sonido y la sensación percibida en el contacto — no cambia cómo juega el marco.",
    });
  }

  if (!suggestions.length) {
    return {
      needed: false,
      summary: `No necesita personalización. La ${racketName(r)} ya se alinea con las prioridades que definiste tal como sale de fábrica — juégala de fábrica unas cuantas sesiones antes de cambiar algo.`,
      suggestions: [],
    };
  }

  return {
    needed: true,
    summary: `Una pequeña personalización cerraría las brechas restantes entre tus prioridades y las especificaciones de fábrica de este marco. Haz un cambio a la vez.`,
    suggestions,
  };
}

/* ---------------------------- Comparison ---------------------------- */

export function compareForPlayer(profile: PlayerProfile, rackets: Racket[]) {
  const scored = rackets.map((r) => scoreRacket(profile, r)).sort((a, b) => b.overall - a.overall);
  if (!scored.length) return null;
  const best = scored[0]!;
  const dimLabelsEs: Record<string, string> = {
    spin: "efecto",
    control: "control",
    power: "potencia",
    stability: "estabilidad",
    maneuverability: "maniobrabilidad",
  };
  const lines = scored.slice(1).map((m) => {
    const diffs: string[] = [];
    for (const key of ["spin", "control", "power", "stability", "maneuverability"] as const) {
      const a = best.dimensions.find((d) => d.key === key)!.score;
      const b = m.dimensions.find((d) => d.key === key)!.score;
      if (a - b >= 8) diffs.push(`${dimLabelsEs[key]} (+${a - b} pts)`);
    }
    return `${racketName(best.racket)} supera a ${racketName(m.racket)} por ${best.overall - m.overall} puntos en general${
      diffs.length ? `, principalmente en ${diffs.join(", ")}` : ""
    }.`;
  });
  return { best, scored, lines };
}

export { levelBucket, racketName, IMPROVEMENT_LABELS };
