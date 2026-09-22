import { i as paiseFromKgPrice } from "./money-C1ax4Fwq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kernel-D9aVc8UY.js
/** Pure rural-ERP bone. No SQL. Mass is grams; money is paise. */
function remainingAfterCommit(mintedGrams, committedGrams) {
	if (mintedGrams < 0 || committedGrams < 0) throw new Error("Mass cannot be negative.");
	const left = mintedGrams - committedGrams;
	if (left < 0) throw new Error("Committed mass exceeds the lot body.");
	return left;
}
function assertCanSell(status, pledgedCount) {
	if (status === "pledged" || pledgedCount > 0) throw new Error("Pledged receipts cannot sell until the lien is cleared.");
	if (status === "settled") throw new Error("Settled lot has already left the books as stock.");
}
function settlementAmounts(qtyGrams, pricePaisePerKg, freightPaisePerKg) {
	if (qtyGrams <= 0) throw new Error("Declared quantity is required.");
	if (pricePaisePerKg <= 0) throw new Error("salePricePerUnit is required — never invented.");
	if (freightPaisePerKg < 0) throw new Error("Freight must be declared as zero or more.");
	const gross = paiseFromKgPrice(qtyGrams, pricePaisePerKg);
	const freight = paiseFromKgPrice(qtyGrams, freightPaisePerKg);
	if (freight > gross) throw new Error("Declared freight exceeds declared sale.");
	return {
		gross,
		freight,
		farmgate: gross - freight
	};
}
function settlementJournal(input) {
	return [
		{
			organId: "rupee",
			account: "cash",
			side: "debit",
			amountPaise: input.gross,
			memo: `Settled ${input.variety} @ declared price`
		},
		{
			organId: "rupee",
			account: "farmgate",
			side: "credit",
			amountPaise: input.farmgate,
			memo: `Farmgate to cell · ${input.hoursToPay}h to pay`
		},
		{
			organId: "logistics",
			account: "freight",
			side: "credit",
			amountPaise: input.freight,
			memo: "Freight deduction, declared"
		}
	];
}
function inputJournal(kind, amountPaise, memo, organId) {
	return [{
		organId,
		account: kind,
		side: "debit",
		amountPaise,
		memo
	}, {
		organId: "rupee",
		account: "cash",
		side: "credit",
		amountPaise,
		memo
	}];
}
function journalBalances(lines) {
	return lines.filter((l) => l.side === "debit").reduce((n, l) => n + l.amountPaise, 0) === lines.filter((l) => l.side === "credit").reduce((n, l) => n + l.amountPaise, 0);
}
function allocateFifo(lots, wantGrams) {
	if (wantGrams <= 0) throw new Error("Declared quantity is required.");
	const out = [];
	let left = wantGrams;
	for (const lot of lots) {
		if (left <= 0) break;
		if (lot.remainingGrams <= 0) continue;
		const take = Math.min(lot.remainingGrams, left);
		out.push({
			lotId: lot.id,
			qtyGrams: take
		});
		left -= take;
	}
	if (left > 0) throw new Error("Not enough remaining mass in the godown.");
	return out;
}
/** Last cell absorbs the paise remainder so the FPO split sums to farmgate. */
function splitQtyWeighted(parts, farmgatePaise) {
	const total = parts.reduce((n, p) => n + p.qtyGrams, 0);
	if (total <= 0) throw new Error("Pool has no mass.");
	if (parts.length === 0) return [];
	let allocated = 0;
	return parts.map((p, i) => {
		const amount = i === parts.length - 1 ? farmgatePaise - allocated : Math.round(farmgatePaise * p.qtyGrams / total);
		allocated += amount;
		return {
			cellId: p.cellId,
			qtyGrams: p.qtyGrams,
			amountPaise: amount
		};
	});
}
function parseAcresCenti(raw) {
	const n = Number(String(raw).replace(/,/g, "").trim());
	if (!Number.isFinite(n) || n <= 0) return null;
	return Math.round(n * 100);
}
//#endregion
export { parseAcresCenti as a, settlementJournal as c, journalBalances as i, splitQtyWeighted as l, assertCanSell as n, remainingAfterCommit as o, inputJournal as r, settlementAmounts as s, allocateFifo as t };
