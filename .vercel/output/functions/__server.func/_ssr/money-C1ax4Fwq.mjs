//#region node_modules/.nitro/vite/services/ssr/assets/money-C1ax4Fwq.js
/** Mass is grams. Money is paise. Never float rupees through the ledger. */
function paiseFromKgPrice(grams, paisePerKg) {
	return Math.round(grams * paisePerKg / 1e3);
}
function gramsFromKg(kg) {
	return Math.round(kg * 1e3);
}
function kgFromGrams(grams) {
	return grams / 1e3;
}
function formatKg(grams) {
	return `${(grams / 1e3).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kg`;
}
function formatRupee(paise) {
	const rupees = paise / 100;
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: rupees % 1 === 0 ? 0 : 2
	}).format(rupees);
}
function parseKg(raw) {
	const n = Number(String(raw).replace(/,/g, "").trim());
	if (!Number.isFinite(n) || n <= 0) return null;
	return gramsFromKg(n);
}
function parseRupeePerKg(raw) {
	const n = Number(String(raw).replace(/,/g, "").replace(/^₹/, "").trim());
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.round(n * 100);
}
//#endregion
export { parseKg as a, paiseFromKgPrice as i, formatRupee as n, parseRupeePerKg as o, kgFromGrams as r, formatKg as t };
