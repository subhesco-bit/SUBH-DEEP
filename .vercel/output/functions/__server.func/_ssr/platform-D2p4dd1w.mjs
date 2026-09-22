import { o as remainingAfterCommit } from "./kernel-D9aVc8UY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform-D2p4dd1w.js
/** ERP platform composed from village books. No invented ₹. */
function processMass(remainingGrams, lossGrams) {
	if (lossGrams < 0) throw new Error("Declared loss cannot be negative.");
	return { saleableGrams: remainingAfterCommit(remainingGrams, lossGrams) };
}
function trialBalance(journal) {
	const map = /* @__PURE__ */ new Map();
	for (const line of journal) {
		const key = `${line.account}::${line.organId}`;
		const row = map.get(key) ?? {
			account: line.account,
			organId: line.organId,
			debitPaise: 0,
			creditPaise: 0,
			netPaise: 0
		};
		if (line.side === "debit") row.debitPaise += line.amountPaise;
		else row.creditPaise += line.amountPaise;
		row.netPaise = row.debitPaise - row.creditPaise;
		map.set(key, row);
	}
	return [...map.values()].sort((a, b) => a.account.localeCompare(b.account));
}
function cellStatements(cells, journal, inputs, payouts) {
	return cells.map((c) => {
		const farmgatePaise = journal.filter((j) => j.cellId === c.id && j.account === "farmgate" && j.side === "credit").reduce((n, j) => n + j.amountPaise, 0);
		const inputPaise = inputs.filter((i) => i.cellId === c.id).reduce((n, i) => n + i.amountPaise, 0);
		const payoutPaise = payouts.filter((p) => p.cellId === c.id).reduce((n, p) => n + p.amountPaise, 0);
		return {
			cellId: c.id,
			name: c.name,
			household: c.household,
			harvestGrams: c.kgOnBooks,
			remainingGrams: c.remainingGrams,
			farmgatePaise,
			inputPaise,
			payoutPaise,
			netPaise: farmgatePaise - inputPaise
		};
	});
}
function fpoPnl(journal, inputs) {
	const grossPaise = journal.filter((j) => j.account === "cash" && j.side === "debit").reduce((n, j) => n + j.amountPaise, 0);
	const freightPaise = journal.filter((j) => j.account === "freight" && j.side === "credit").reduce((n, j) => n + j.amountPaise, 0);
	const farmgatePaise = journal.filter((j) => j.account === "farmgate" && j.side === "credit").reduce((n, j) => n + j.amountPaise, 0);
	const inputPaise = inputs.reduce((n, i) => n + i.amountPaise, 0);
	return {
		grossPaise,
		freightPaise,
		farmgatePaise,
		inputPaise,
		netToCellsPaise: farmgatePaise - inputPaise
	};
}
function exceptions(input) {
	const out = [];
	if (!input.journalBalanced) out.push({
		code: "G1",
		severity: "block",
		title: "Journal does not balance",
		body: "Cash in must equal farmgate + freight. Do not close the season.",
		href: "/ledger"
	});
	const open = input.orders.filter((o) => o.status === "open");
	if (open.length) out.push({
		code: "G2",
		severity: "defer",
		title: `${open.length} offtake${open.length === 1 ? "" : "s"} wait on paymentRef`,
		body: "An offtake stays open until a clerk names the payment.",
		href: "/trade"
	});
	const pending = input.payouts.filter((p) => p.status === "pending");
	if (pending.length) out.push({
		code: "G3",
		severity: "defer",
		title: `${pending.length} FPO payout${pending.length === 1 ? "" : "s"} pending`,
		body: "Qty-weighted split is posted. The cell has not been marked paid.",
		href: "/trade"
	});
	const pledged = input.receipts.filter((r) => r.status === "pledged");
	if (pledged.length) out.push({
		code: "G4",
		severity: "block",
		title: `${pledged.length} pledged receipt${pledged.length === 1 ? "" : "s"}`,
		body: "Clear the lien before the sack may sell.",
		href: "/warehouse"
	});
	const waitingGodown = input.lots.filter((l) => l.status === "minted" && l.remainingGrams > 0);
	if (waitingGodown.length) out.push({
		code: "G5",
		severity: "note",
		title: `${waitingGodown.length} minted lot${waitingGodown.length === 1 ? "" : "s"} not in the godown`,
		body: "The harvest named a cell. The same body has not inwards.",
		href: "/lots"
	});
	out.push({
		code: "G9",
		severity: "note",
		title: "AI cannot write rupees",
		body: "Module OS may propose. A clerk declares price, freight, and loss.",
		href: "/modules"
	});
	return out;
}
function composePlatform(books, extra) {
	const tb = trialBalance(books.journal);
	const statements = cellStatements(books.cells, books.journal, books.inputs, books.payouts);
	const pnl = fpoPnl(books.journal, books.inputs);
	const gates = exceptions({
		journalBalanced: books.kpis.journalBalanced,
		lots: books.lots,
		receipts: books.receipts,
		orders: books.orders,
		payouts: books.payouts
	});
	return {
		season: extra.season,
		trialBalance: tb,
		statements,
		pnl,
		exceptions: gates,
		documents: extra.documents,
		processes: extra.processes,
		blocking: gates.filter((g) => g.severity === "block").length,
		deferred: gates.filter((g) => g.severity === "defer").length
	};
}
//#endregion
export { exceptions as n, processMass as r, composePlatform as t };
