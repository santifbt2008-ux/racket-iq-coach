/**
 * Where specification and product information comes from.
 *
 * Specs should be sourced from the official manufacturer product page for each
 * frame (publicly published specification tables). This module keeps the source
 * layer modular: swap `BRAND_SOURCES` or register a product-URL provider when a
 * manufacturer feed / affiliate program is connected — nothing else changes.
 */

export interface BrandSource {
  /** Official manufacturer site. */
  site: string;
  /** Official catalogue / racket landing page used as the specification source. */
  catalog: string;
}

export const BRAND_SOURCES: Record<string, BrandSource> = {
  Babolat: { site: "https://www.babolat.com", catalog: "https://www.babolat.com/us/tennis/rackets" },
  Head: { site: "https://www.head.com", catalog: "https://www.head.com/en_US/tennis/rackets" },
  Wilson: { site: "https://www.wilson.com", catalog: "https://www.wilson.com/en-us/tennis/rackets" },
  Yonex: { site: "https://www.yonex.com", catalog: "https://www.yonex.com/tennis/racquets" },
  Tecnifibre: { site: "https://www.tecnifibre.com", catalog: "https://www.tecnifibre.com/en_us/tennis/racket" },
  Prince: { site: "https://www.princetennis.com", catalog: "https://www.princetennis.com/collections/racquets" },
  Dunlop: { site: "https://www.dunlopsports.com", catalog: "https://www.dunlopsports.com/collections/tennis-racquets" },
  Solinco: { site: "https://solinco.com", catalog: "https://solinco.com/collections/racquets" },
  Volkl: { site: "https://volkl-tennis.com", catalog: "https://volkl-tennis.com/collections/racquets" },
  Lacoste: { site: "https://www.lacoste.com", catalog: "https://www.lacoste.com" },
};

export interface ProductLinkProvider {
  name: string;
  /** Return an authorized product/retailer URL, or null. */
  getUrl(racketId: string): string | null;
}

/** Curated product URLs (official manufacturer product pages or affiliate links). */
export const PRODUCT_URLS: Record<string, string> = {};

const providers: ProductLinkProvider[] = [
  { name: "curated", getUrl: (id) => PRODUCT_URLS[id] ?? null },
];

/** Plug in an affiliate network or manufacturer product API later. */
export function registerProductLinkProvider(provider: ProductLinkProvider) {
  if (!providers.some((p) => p.name === provider.name)) providers.push(provider);
}

export interface ProductLink {
  url: string;
  label: string;
  /** true when it points at the specific product, false for the brand catalogue. */
  exact: boolean;
}

/**
 * Best available link for a racket: an exact product/affiliate URL when we have
 * one, otherwise the manufacturer's official racket catalogue.
 */
export function resolveProductLink(racketId: string, brand: string): ProductLink | null {
  for (const p of providers) {
    const url = p.getUrl(racketId);
    if (url) return { url, label: "Ver producto", exact: true };
  }
  const brandSource = BRAND_SOURCES[brand];
  if (brandSource) return { url: brandSource.catalog, label: `Ver en ${brand}.com`, exact: false };
  return null;
}
