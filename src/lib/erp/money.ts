/** Mass is grams. Money is paise. Never float rupees through the ledger. */

export function paiseFromKgPrice(grams: number, paisePerKg: number): number {
  return Math.round((grams * paisePerKg) / 1000);
}

export function gramsFromKg(kg: number): number {
  return Math.round(kg * 1000);
}

export function kgFromGrams(grams: number): number {
  return grams / 1000;
}

export function formatKg(grams: number): string {
  const kg = grams / 1000;
  return `${kg.toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg`;
}

export function formatRupee(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees);
}

export function parseKg(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return gramsFromKg(n);
}

export function parseRupeePerKg(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, "").replace(/^₹/, "").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}
