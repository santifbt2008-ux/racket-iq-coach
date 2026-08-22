/**
 * RacketIQ image system — modular and licence-safe.
 *
 * POLICY: We never scrape, copy or re-host retailer or manufacturer product
 * photography. A racket only gets an image when it comes from one of the
 * approved sources below AND we can document the permission.
 *
 * When no authorized image exists, `resolveRacketImage()` returns `null` and
 * the UI falls back to the generated vector illustration.
 *
 * To plug in a real feed later (manufacturer media kit, affiliate network,
 * product-data API), implement a `RacketImageProvider` and register it with
 * `registerImageProvider()` — no changes to the recommendation engine, the
 * database, or the pages are required.
 */

export type ImageLicense =
  | "manufacturer-authorized" // direct written permission / media kit
  | "affiliate-feed" // image delivered by an authorized affiliate/product API
  | "commercial-reuse" // e.g. CC0 / CC-BY with commercial rights
  | "owned"; // photography we shot or commissioned

export interface RacketImage {
  url: string;
  license: ImageLicense;
  /** Who owns the image / where the right comes from. Shown as a credit. */
  credit: string;
  /** Link to the licence, media kit terms, or permission record. */
  permission_url?: string;
  /** Free-form note documenting how permission was obtained. */
  permission_note?: string;
}

export interface RacketImageProvider {
  name: string;
  /** Return an authorized image, or null when none is available. */
  getImage(racketId: string): RacketImage | null;
}

/**
 * Manually curated, documented images. Keys are racket ids.
 * EMPTY BY DESIGN — add an entry only when permission is documented.
 *
 * Example:
 * "yonex-vcore-98": {
 *   url: "https://cdn.example-affiliate.com/yonex-vcore-98.png",
 *   license: "affiliate-feed",
 *   credit: "Yonex via <affiliate program>",
 *   permission_url: "https://affiliate.example.com/terms",
 *   permission_note: "Product feed licence, retrieved 2026-08-20",
 * },
 */
export const AUTHORIZED_IMAGES: Record<string, RacketImage> = {};

const staticProvider: RacketImageProvider = {
  name: "curated-authorized",
  getImage: (id) => AUTHORIZED_IMAGES[id] ?? null,
};

const providers: RacketImageProvider[] = [staticProvider];

/** Register an extra source (manufacturer feed, affiliate API, CMS…). */
export function registerImageProvider(provider: RacketImageProvider) {
  if (!providers.some((p) => p.name === provider.name)) providers.push(provider);
}

/** First authorized image found across registered providers, else null. */
export function resolveRacketImage(racketId: string): RacketImage | null {
  for (const p of providers) {
    const img = p.getImage(racketId);
    if (img?.url) return img;
  }
  return null;
}

export const IMAGE_POLICY_NOTE =
  "Las fotografías de raquetas solo se muestran cuando contamos con una licencia documentada (kit de prensa del fabricante, feed de afiliados/productos autorizado o imagen de reutilización comercial). De lo contrario, mostramos nuestra propia ilustración.";
