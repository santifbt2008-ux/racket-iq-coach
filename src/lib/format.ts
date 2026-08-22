/** Indicative USD → MXN conversion rate used for display only. */
export const USD_TO_MXN = 18.5;

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

/** Formats a USD reference price as Mexican pesos (rounded to the nearest 10). */
export function formatMXN(usd: number | null | undefined): string {
  if (usd == null || Number.isNaN(usd)) return "—";
  return mxn.format(Math.round((usd * USD_TO_MXN) / 10) * 10);
}

/** Converts a peso amount back to the USD values stored in the database. */
export function mxnToUsd(pesos: number): number {
  return pesos / USD_TO_MXN;
}

/** Converts a USD value to pesos (unformatted). */
export function usdToMxn(usd: number): number {
  return usd * USD_TO_MXN;
}
