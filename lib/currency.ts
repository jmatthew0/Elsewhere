// Approximate PHP per 1 unit. Only used when the live rate can't be fetched.
const FALLBACK: Record<string, number> = { PHP: 1, USD: 58, EUR: 66, GBP: 77, JPY: 0.38, KRW: 0.042, SGD: 43, AUD: 38, CAD: 42, AED: 15.8 };

export async function getRateToPhp(cur: string): Promise<{ rate: number; live: boolean }> {
  if (cur === "PHP") return { rate: 1, live: true };
  try {
    const r = await fetch(`https://api.frankfurter.dev/v1/latest?base=${cur}&symbols=PHP`, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error("bad response");
    const rate = (await r.json()).rates?.PHP;
    if (typeof rate !== "number") throw new Error("no rate");
    return { rate, live: true };
  } catch {
    return { rate: FALLBACK[cur] ?? 1, live: false };
  }
}

/** Amounts are stored as cents (x100) in the trip's currency. */
export const money = (cents: number, cur: string) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: cur }).format(cents / 100);