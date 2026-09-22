import { t as getSql } from "./db-C3Cj9Z-X.mjs";
import { a as parseKg, o as parseRupeePerKg } from "./money-C1ax4Fwq.mjs";
import { a as parseAcresCenti } from "./kernel-D9aVc8UY.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-D-SOvwh1.js
async function pulse(signal, ctx) {
	try {
		const { trackErpSignal } = await import("./boot.server-CPfb5TKM.mjs");
		await trackErpSignal(signal, ctx);
	} catch {}
}
function parseFreightPaise(raw) {
	const t = String(raw).replace(/,/g, "").replace(/^₹/, "").trim();
	if (t === "") return 400;
	const n = Number(t);
	if (!Number.isFinite(n) || n < 0) return null;
	return Math.round(n * 100);
}
function emptyKpis(message) {
	return {
		cells: 0,
		lots: 0,
		kgInWarehouse: 0,
		kgMinted: 0,
		kgRemaining: 0,
		openPaise: 0,
		settledPaise: 0,
		farmgatePaise: 0,
		pendingPayouts: 0,
		avgHoursToPay: null,
		journalBalanced: true,
		integrityNote: message
	};
}
function fail(message) {
	return {
		ok: false,
		error: message,
		fpo: null,
		kpis: emptyKpis(message),
		cells: [],
		lots: [],
		receipts: [],
		orders: [],
		journal: [],
		inputs: [],
		payouts: [],
		poolable: []
	};
}
var getBooks_createServerFn_handler = createServerRpc({
	id: "2688d08b6e7aa35db610cf2e9141498c01e0a1c5f35ededbbc55a48f6a5419fb",
	name: "getBooks",
	filename: "src/lib/erp/fns.ts"
}, (opts) => getBooks.__executeServer(opts));
var getBooks = createServerFn({ method: "GET" }).handler(getBooks_createServerFn_handler, async () => {
	const { ensureBooks } = await import("./boot.server-DwqAWBOv.mjs");
	try {
		return {
			ok: true,
			...await ensureBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "books unread");
	}
});
var recordHarvest_createServerFn_handler = createServerRpc({
	id: "568f827d8c911d3703e13791351001e25e734bc03c251484e16acf9d2d27ee9a",
	name: "recordHarvest",
	filename: "src/lib/erp/fns.ts"
}, (opts) => recordHarvest.__executeServer(opts));
var recordHarvest = createServerFn({ method: "POST" }).validator((input) => ({
	cellId: String(input?.cellId ?? ""),
	variety: String(input?.variety ?? "").trim().slice(0, 80),
	commodity: String(input?.commodity ?? "paddy").trim().slice(0, 40),
	kg: String(input?.kg ?? ""),
	moisture: String(input?.moisture ?? ""),
	gi: Boolean(input?.gi)
})).handler(recordHarvest_createServerFn_handler, async ({ data }) => {
	const grams = parseKg(data.kg);
	if (!data.cellId) return fail("Name the farmer cell.");
	if (!data.variety) return fail("Variety is required.");
	if (!grams) return fail("Declared kilograms are required.");
	const moistureBp = data.moisture ? Math.round(Number(data.moisture) * 100) : null;
	if (data.moisture && (moistureBp == null || Number.isNaN(moistureBp))) return fail("Moisture must be a number.");
	const { ensureBooks, mintLot, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await pulse("harvest.completed", {
			lotId: await mintLot(sql, {
				cellId: data.cellId,
				variety: data.variety,
				commodity: data.commodity || "paddy",
				grams,
				grade: data.gi ? "GI" : "A",
				giMarker: data.gi ? "GI-AS-CHAKHAO" : null,
				moistureBp
			}),
			cellId: data.cellId,
			variety: data.variety,
			grams,
			remainingGrams: grams,
			giMarker: data.gi ? "GI-AS-CHAKHAO" : null,
			query: "harvest.completed"
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "harvest failed");
	}
});
var intakeLot_createServerFn_handler = createServerRpc({
	id: "ee96b15a4fb0bfa0eaeccd047c9532f0a30854d271f687addfc8128616e65621",
	name: "intakeLot",
	filename: "src/lib/erp/fns.ts"
}, (opts) => intakeLot.__executeServer(opts));
var intakeLot = createServerFn({ method: "POST" }).validator((input) => ({
	lotId: String(input?.lotId ?? ""),
	facility: String(input?.facility ?? "Langthasa godown").trim().slice(0, 80)
})).handler(intakeLot_createServerFn_handler, async ({ data }) => {
	if (!data.lotId) return fail("Lot id required.");
	const { ensureBooks, inwardReceipt, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await inwardReceipt(sql, {
			lotId: data.lotId,
			facility: data.facility || "Langthasa godown"
		});
		await pulse("warehouse.intake", {
			lotId: data.lotId,
			query: "warehouse.intake"
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "intake failed");
	}
});
var pledgeLot_createServerFn_handler = createServerRpc({
	id: "352e47ad70f0a1ddbb880cbac92806969ca1a4b3e401bdedff1e7921a016798a",
	name: "pledgeLot",
	filename: "src/lib/erp/fns.ts"
}, (opts) => pledgeLot.__executeServer(opts));
var pledgeLot = createServerFn({ method: "POST" }).validator((input) => ({
	receiptId: String(input?.receiptId ?? ""),
	lender: String(input?.lender ?? "").trim().slice(0, 80)
})).handler(pledgeLot_createServerFn_handler, async ({ data }) => {
	if (!data.receiptId) return fail("Receipt required.");
	const { ensureBooks, pledgeReceipt, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await pledgeReceipt(sql, data);
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "pledge failed");
	}
});
var clearLien_createServerFn_handler = createServerRpc({
	id: "37af67cc9fb62a6106357ca94cde413b7beeaf6952d87964c28e829da42eaa59",
	name: "clearLien",
	filename: "src/lib/erp/fns.ts"
}, (opts) => clearLien.__executeServer(opts));
var clearLien = createServerFn({ method: "POST" }).validator((input) => ({ receiptId: String(input?.receiptId ?? "") })).handler(clearLien_createServerFn_handler, async ({ data }) => {
	const { ensureBooks, releaseLien, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await releaseLien(sql, data.receiptId);
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "lien failed");
	}
});
var sellLot_createServerFn_handler = createServerRpc({
	id: "41ce23f4c07d6d2ff8a6518bc31c7d99f0d4afc2b2d35584d24c609e057609d4",
	name: "sellLot",
	filename: "src/lib/erp/fns.ts"
}, (opts) => sellLot.__executeServer(opts));
var sellLot = createServerFn({ method: "POST" }).validator((input) => ({
	lotId: String(input?.lotId ?? ""),
	buyer: String(input?.buyer ?? "").trim().slice(0, 80),
	kg: String(input?.kg ?? ""),
	pricePerKg: String(input?.pricePerKg ?? ""),
	freightPerKg: String(input?.freightPerKg ?? "4")
})).handler(sellLot_createServerFn_handler, async ({ data }) => {
	const grams = parseKg(data.kg);
	const price = parseRupeePerKg(data.pricePerKg);
	const freight = parseFreightPaise(data.freightPerKg);
	if (!data.lotId) return fail("Lot required.");
	if (!data.buyer) return fail("Buyer required.");
	if (!grams) return fail("Declared kilograms required.");
	if (!price) return fail("salePricePerUnit is required — never invented.");
	if (freight == null) return fail("Freight must be declared as zero or more.");
	const { ensureBooks, createOrder, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await createOrder(sql, {
			lotId: data.lotId,
			buyer: data.buyer,
			qtyGrams: grams,
			pricePaisePerKg: price,
			freightPaisePerKg: freight ?? 400
		});
		await pulse("lot.ready", {
			lotId: data.lotId,
			qtyGrams: grams,
			pricePaisePerKg: price,
			freightPaisePerKg: freight ?? 0,
			query: "lot.ready"
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "sale failed");
	}
});
var settleSale_createServerFn_handler = createServerRpc({
	id: "a42ff5854486e8e8166773b62d59a281dd2917947c3b0855f1c01fb26cafc950",
	name: "settleSale",
	filename: "src/lib/erp/fns.ts"
}, (opts) => settleSale.__executeServer(opts));
var settleSale = createServerFn({ method: "POST" }).validator((input) => ({
	orderId: String(input?.orderId ?? ""),
	paymentRef: String(input?.paymentRef ?? "").trim().slice(0, 80),
	hoursToPay: String(input?.hoursToPay ?? "24")
})).handler(settleSale_createServerFn_handler, async ({ data }) => {
	const hours = Number(data.hoursToPay);
	if (!data.orderId) return fail("Order required.");
	if (!data.paymentRef) return fail("paymentRef is required to mark paid.");
	if (!Number.isFinite(hours) || hours < 0) return fail("Hours-to-pay must be a number.");
	const { ensureBooks, settleOrder, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await settleOrder(sql, {
			orderId: data.orderId,
			paymentRef: data.paymentRef,
			hoursToPay: Math.round(hours)
		});
		await pulse("order.settled", {
			paymentRef: data.paymentRef,
			hoursToPay: Math.round(hours),
			query: "order.settled"
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "settle failed");
	}
});
var recordInput_createServerFn_handler = createServerRpc({
	id: "e21747a4d61426cab3ed02ffd2732561067a0eb981a2788672f5c812c4f23ebd",
	name: "recordInput",
	filename: "src/lib/erp/fns.ts"
}, (opts) => recordInput.__executeServer(opts));
var recordInput = createServerFn({ method: "POST" }).validator((input) => ({
	cellId: String(input?.cellId ?? ""),
	kind: String(input?.kind ?? "seed"),
	qty: String(input?.qty ?? "1"),
	unit: String(input?.unit ?? "unit").slice(0, 20),
	amount: String(input?.amount ?? ""),
	memo: String(input?.memo ?? "").slice(0, 160)
})).handler(recordInput_createServerFn_handler, async ({ data }) => {
	const amountPaise = parseRupeePerKg(data.amount);
	const qty = Number(data.qty);
	if (!data.cellId) return fail("Cell required.");
	if (!amountPaise) return fail("Declared rupees required.");
	if (!Number.isFinite(qty) || qty <= 0) return fail("Quantity required.");
	const kind = [
		"seed",
		"fodder",
		"energy",
		"labour",
		"cover"
	].includes(data.kind) ? data.kind : "seed";
	const { ensureBooks, postInput, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await postInput(sql, {
			cellId: data.cellId,
			kind,
			qty: Math.round(qty),
			unit: data.unit,
			amountPaise,
			memo: data.memo || `${kind} (declared)`
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "input failed");
	}
});
var enrollFarmer_createServerFn_handler = createServerRpc({
	id: "a85b8899c73c46c9a950433013a58e8bed0b1d01b3c8233f71a615e62fcae027",
	name: "enrollFarmer",
	filename: "src/lib/erp/fns.ts"
}, (opts) => enrollFarmer.__executeServer(opts));
var enrollFarmer = createServerFn({ method: "POST" }).validator((input) => ({
	name: String(input?.name ?? "").trim().slice(0, 80),
	household: String(input?.household ?? "").trim().slice(0, 80),
	acres: String(input?.acres ?? ""),
	notes: String(input?.notes ?? "").trim().slice(0, 160)
})).handler(enrollFarmer_createServerFn_handler, async ({ data }) => {
	const acresCenti = parseAcresCenti(data.acres);
	if (!data.name) return fail("Cell name is required.");
	if (!data.household) return fail("Household is required.");
	if (!acresCenti) return fail("Declared acres are required.");
	const { ensureBooks, enrollCell, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await enrollCell(sql, {
			name: data.name,
			household: data.household,
			acresCenti,
			notes: data.notes
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "enroll failed");
	}
});
var poolSell_createServerFn_handler = createServerRpc({
	id: "0db3d7d5e94e3e6be873546cb3053c2e8c7eb045c78d9150fe59d715c531a4b5",
	name: "poolSell",
	filename: "src/lib/erp/fns.ts"
}, (opts) => poolSell.__executeServer(opts));
var poolSell = createServerFn({ method: "POST" }).validator((input) => ({
	commodity: String(input?.commodity ?? "").trim().slice(0, 40),
	buyer: String(input?.buyer ?? "").trim().slice(0, 80),
	kg: String(input?.kg ?? ""),
	pricePerKg: String(input?.pricePerKg ?? ""),
	freightPerKg: String(input?.freightPerKg ?? "4")
})).handler(poolSell_createServerFn_handler, async ({ data }) => {
	const grams = parseKg(data.kg);
	const price = parseRupeePerKg(data.pricePerKg);
	const freight = parseFreightPaise(data.freightPerKg);
	if (!data.commodity) return fail("Commodity required.");
	if (!data.buyer) return fail("Buyer required.");
	if (!grams) return fail("Declared kilograms required.");
	if (!price) return fail("salePricePerUnit is required — never invented.");
	if (freight == null) return fail("Freight must be declared as zero or more.");
	const { ensureBooks, poolOfftake, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await poolOfftake(sql, {
			commodity: data.commodity,
			buyer: data.buyer,
			qtyGrams: grams,
			pricePaisePerKg: price,
			freightPaisePerKg: freight ?? 400
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "pool offtake failed");
	}
});
var settlePoolSale_createServerFn_handler = createServerRpc({
	id: "aacbac26add35e7da9a5a5d7ada9a3dda9190c809f2df491f83646a118e4aa83",
	name: "settlePoolSale",
	filename: "src/lib/erp/fns.ts"
}, (opts) => settlePoolSale.__executeServer(opts));
var settlePoolSale = createServerFn({ method: "POST" }).validator((input) => ({
	poolId: String(input?.poolId ?? ""),
	paymentRef: String(input?.paymentRef ?? "").trim().slice(0, 80),
	hoursToPay: String(input?.hoursToPay ?? "24")
})).handler(settlePoolSale_createServerFn_handler, async ({ data }) => {
	const hours = Number(data.hoursToPay);
	if (!data.poolId) return fail("Pool required.");
	if (!data.paymentRef) return fail("paymentRef is required to mark paid.");
	if (!Number.isFinite(hours) || hours < 0) return fail("Hours-to-pay must be a number.");
	const { ensureBooks, settlePool, readBooks } = await import("./boot.server-DwqAWBOv.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await settlePool(sql, {
			poolId: data.poolId,
			paymentRef: data.paymentRef,
			hoursToPay: Math.round(hours)
		});
		return {
			ok: true,
			...await readBooks()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "pool settle failed");
	}
});
var getPlatform_createServerFn_handler = createServerRpc({
	id: "dc6571dfadb17ec4ff586f6f65db68b84a380a9fcb605f17cbf1747bb836fca6",
	name: "getPlatform",
	filename: "src/lib/erp/fns.ts"
}, (opts) => getPlatform.__executeServer(opts));
var getPlatform = createServerFn({ method: "GET" }).handler(getPlatform_createServerFn_handler, async () => {
	const { ensurePlatform } = await import("./platform.server-jS0uI4pf.mjs");
	try {
		return {
			ok: true,
			...await ensurePlatform()
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "platform unread"
		};
	}
});
var processDeclared_createServerFn_handler = createServerRpc({
	id: "c8792138af86d97a726c912754d2d84cb15c581155c03d9916a350324f6cb58b",
	name: "processDeclared",
	filename: "src/lib/erp/fns.ts"
}, (opts) => processDeclared.__executeServer(opts));
var processDeclared = createServerFn({ method: "POST" }).validator((input) => ({
	lotId: String(input?.lotId ?? ""),
	kind: String(input?.kind ?? "drying"),
	lossKg: String(input?.lossKg ?? "0"),
	note: String(input?.note ?? "").trim().slice(0, 160)
})).handler(processDeclared_createServerFn_handler, async ({ data }) => {
	const kind = [
		"drying",
		"milling",
		"cleaning",
		"grading"
	].find((k) => k === data.kind);
	if (!data.lotId) return {
		ok: false,
		error: "Lot required."
	};
	if (!kind) return {
		ok: false,
		error: "Process kind required."
	};
	const raw = data.lossKg.replace(/,/g, "").trim();
	const n = raw === "" ? 0 : Number(raw);
	if (!Number.isFinite(n) || n < 0) return {
		ok: false,
		error: "Declared loss must be zero or more."
	};
	const lossGrams = Math.round(n * 1e3);
	const { ensureBooks } = await import("./boot.server-DwqAWBOv.mjs");
	const { processLot, ensurePlatform } = await import("./platform.server-jS0uI4pf.mjs");
	await ensureBooks();
	const sql = await getSql();
	try {
		await processLot(sql, {
			lotId: data.lotId,
			kind,
			lossGrams,
			note: data.note
		});
		try {
			const { trackErpSignal } = await import("./boot.server-CPfb5TKM.mjs");
			await trackErpSignal("warehouse.intake", {
				lotId: data.lotId,
				query: "lot.process"
			});
		} catch {}
		return {
			ok: true,
			...await ensurePlatform()
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "process failed"
		};
	}
});
//#endregion
export { clearLien_createServerFn_handler, enrollFarmer_createServerFn_handler, getBooks_createServerFn_handler, getPlatform_createServerFn_handler, intakeLot_createServerFn_handler, pledgeLot_createServerFn_handler, poolSell_createServerFn_handler, processDeclared_createServerFn_handler, recordHarvest_createServerFn_handler, recordInput_createServerFn_handler, sellLot_createServerFn_handler, settlePoolSale_createServerFn_handler, settleSale_createServerFn_handler };
