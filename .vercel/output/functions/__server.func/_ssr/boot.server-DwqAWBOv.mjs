import { t as getSql } from "./db-C3Cj9Z-X.mjs";
import { t as nid } from "./ids-BUY7TE2s.mjs";
import { i as paiseFromKgPrice } from "./money-C1ax4Fwq.mjs";
import { c as settlementJournal, i as journalBalances, n as assertCanSell, r as inputJournal, s as settlementAmounts, t as allocateFifo } from "./kernel-D9aVc8UY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/boot.server-DwqAWBOv.js
var seedChain = null;
function asTime(value) {
	if (typeof value === "string") return value;
	if (value instanceof Date) return value.toISOString();
	return String(value ?? "");
}
var FPO = {
	id: "fpo-hills-chakhao",
	name: "Hills Chakhao Collective",
	village: "Langthasa",
	district: "Karbi Anglong",
	split_rule: "qty_weighted"
};
var CELLS = [
	{
		id: "c-ronghang",
		name: "Biren Ronghang",
		household: "Ronghang house · 5",
		acres_centi: 240,
		notes: "GI Chakhao, south slope"
	},
	{
		id: "c-teron",
		name: "Jirsong Teron",
		household: "Teron house · 4",
		acres_centi: 180,
		notes: "Ginger + paddy"
	},
	{
		id: "c-enghi",
		name: "Kajir Enghi",
		household: "Enghi house · 6",
		acres_centi: 310,
		notes: "GI Chakhao, Magh pithas"
	},
	{
		id: "c-kramsapi",
		name: "Serdihun Kramsapi",
		household: "Kramsapi house · 3",
		acres_centi: 120,
		notes: "Seed keeper"
	}
];
async function seedBooks(sql) {
	if (((await sql.query("select count(*)::int as n from erp_fpo"))[0]?.n ?? 0) > 0) return;
	await sql.query(`insert into erp_fpo (id, name, village, district, split_rule)
     values ($1,$2,$3,$4,$5)`, [
		FPO.id,
		FPO.name,
		FPO.village,
		FPO.district,
		FPO.split_rule
	]);
	for (const c of CELLS) await sql.query(`insert into erp_cells (id, name, household, fpo_id, village, acres_centi, notes)
       values ($1,$2,$3,$4,$5,$6,$7)`, [
		c.id,
		c.name,
		c.household,
		FPO.id,
		FPO.village,
		c.acres_centi,
		c.notes
	]);
	await mintLot(sql, {
		cellId: "c-enghi",
		variety: "Chakhao Poireiton",
		commodity: "black rice",
		grams: 51e4,
		grade: "GI",
		giMarker: "GI-AS-CHAKHAO",
		moistureBp: 1250,
		lotId: "lot-chakhao-enghi"
	});
	await inwardReceipt(sql, {
		lotId: "lot-chakhao-enghi",
		facility: "Langthasa godown",
		receiptId: "wr-enghi-01"
	});
	await createOrder(sql, {
		lotId: "lot-chakhao-enghi",
		buyer: "Guwahati GI desk",
		qtyGrams: 51e4,
		pricePaisePerKg: 18500,
		orderId: "ord-enghi-01"
	});
	await settleOrder(sql, {
		orderId: "ord-enghi-01",
		paymentRef: "UPI-KA-8841",
		hoursToPay: 18
	});
	await mintLot(sql, {
		cellId: "c-ronghang",
		variety: "Chakhao Poireiton",
		commodity: "black rice",
		grams: 84e4,
		grade: "GI",
		giMarker: "GI-AS-CHAKHAO",
		moistureBp: 1310,
		lotId: "lot-chakhao-ronghang"
	});
	await inwardReceipt(sql, {
		lotId: "lot-chakhao-ronghang",
		facility: "Langthasa godown",
		receiptId: "wr-ronghang-01"
	});
	await createOrder(sql, {
		lotId: "lot-chakhao-ronghang",
		buyer: "Diphu mill offtake",
		qtyGrams: 4e5,
		pricePaisePerKg: 19200,
		orderId: "ord-ronghang-01"
	});
	await mintLot(sql, {
		cellId: "c-teron",
		variety: "Nadia ginger",
		commodity: "ginger",
		grams: 22e4,
		grade: "A",
		giMarker: null,
		moistureBp: null,
		lotId: "lot-ginger-teron"
	});
	await postInput(sql, {
		cellId: "c-ronghang",
		kind: "seed",
		qty: 12,
		unit: "kg",
		amountPaise: 48e4,
		memo: "GI seed, declared"
	});
	await postInput(sql, {
		cellId: "c-ronghang",
		kind: "energy",
		qty: 86,
		unit: "kWh",
		amountPaise: 68800,
		memo: "Drying hours, declared"
	});
	await postInput(sql, {
		cellId: "c-enghi",
		kind: "cover",
		qty: 1,
		unit: "policy",
		amountPaise: 61200,
		memo: "Storage cover on 510 kg"
	});
	await postInput(sql, {
		cellId: "c-teron",
		kind: "fodder",
		qty: 40,
		unit: "kg",
		amountPaise: 24e3,
		memo: "Not livestock — mulch straw"
	});
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'erp',null,$2::jsonb)`, ["erp.books.seeded", JSON.stringify({
		village: FPO.village,
		fpo: FPO.id
	})]);
}
async function runSeed() {
	await seedBooks(await getSql());
}
async function ensureBooks() {
	if (!seedChain) seedChain = runSeed().catch((err) => {
		seedChain = null;
		throw err;
	});
	await seedChain;
	return readBooks();
}
async function enrollCell(sql, input) {
	const fpo = await sql.query("select id, village from erp_fpo limit 1");
	if (!fpo[0]) throw new Error("FPO books are not open.");
	if (!input.name.trim()) throw new Error("Cell name is required.");
	if (!input.household.trim()) throw new Error("Household is required.");
	if (input.acresCenti <= 0) throw new Error("Declared acres are required.");
	const id = nid("c");
	await sql.query(`insert into erp_cells (id, name, household, fpo_id, village, acres_centi, notes)
     values ($1,$2,$3,$4,$5,$6,$7)`, [
		id,
		input.name.trim().slice(0, 80),
		input.household.trim().slice(0, 80),
		fpo[0].id,
		fpo[0].village,
		input.acresCenti,
		input.notes.trim().slice(0, 160)
	]);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'farmer','b-fpo-member',$2::jsonb)`, ["cell.enrolled", JSON.stringify({
		cellId: id,
		name: input.name.trim()
	})]);
	return id;
}
async function mintLot(sql, input) {
	const cell = await sql.query("select fpo_id from erp_cells where id = $1", [input.cellId]);
	if (!cell[0]) throw new Error("Unknown cell — a lot must name a farmer cell.");
	if (input.grams <= 0) throw new Error("Declared mass is required.");
	const id = input.lotId ?? nid("lot");
	await sql.query(`insert into erp_lots (id, cell_id, fpo_id, variety, commodity, grams, remaining_grams, grade, gi_marker, moisture_bp, status)
     values ($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,'minted')`, [
		id,
		input.cellId,
		cell[0].fpo_id,
		input.variety,
		input.commodity,
		input.grams,
		input.grade ?? null,
		input.giMarker ?? null,
		input.moistureBp ?? null
	]);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'lot','b-lot-birth',$2::jsonb)`, ["lot.mint", JSON.stringify({
		lotId: id,
		cellId: input.cellId,
		grams: input.grams,
		variety: input.variety
	})]);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'spine','b-spine-harvest',$2::jsonb)`, ["harvest.completed", JSON.stringify({
		lotId: id,
		cellId: input.cellId
	})]);
	return id;
}
async function inwardReceipt(sql, input) {
	const lot = await sql.query("select grams, remaining_grams, status from erp_lots where id = $1", [input.lotId]);
	if (!lot[0]) throw new Error("Unknown lot.");
	if (lot[0].status === "settled") throw new Error("A settled lot cannot re-enter the godown.");
	if (((await sql.query("select count(*)::int as n from erp_receipts where lot_id = $1 and status <> 'released'", [input.lotId]))[0]?.n ?? 0) > 0) throw new Error("Lot already has an open warehouse receipt.");
	const remaining = lot[0].remaining_grams ?? lot[0].grams;
	if (remaining <= 0) throw new Error("No remaining mass to inward.");
	const id = input.receiptId ?? nid("wr");
	await sql.query(`insert into erp_receipts (id, lot_id, facility, qty_grams, remaining_grams, status)
     values ($1,$2,$3,$4,$4,'inward')`, [
		id,
		input.lotId,
		input.facility,
		remaining
	]);
	await sql.query(`insert into erp_receipt_events (receipt_id, event, note) values ($1,'inward',$2)`, [id, input.facility]);
	await sql.query("update erp_lots set status = 'in_warehouse' where id = $1 and status = 'minted'", [input.lotId]);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'warehouse','b-harvest-fanout',$2::jsonb)`, ["warehouse.intake", JSON.stringify({
		lotId: input.lotId,
		receiptId: id
	})]);
	return id;
}
async function pledgeReceipt(sql, input) {
	const rec = await sql.query("select status, lot_id from erp_receipts where id = $1", [input.receiptId]);
	if (!rec[0]) throw new Error("Unknown receipt.");
	if (rec[0].status === "released") throw new Error("Released stock cannot be pledged.");
	if (!input.lender.trim()) throw new Error("Lender is required to pledge.");
	if (((await sql.query("select count(*)::int as n from erp_orders where lot_id = $1 and status = 'open'", [rec[0].lot_id]))[0]?.n ?? 0) > 0) throw new Error("Open offtake must settle or the stock is already claimed.");
	await sql.query("update erp_receipts set status = 'pledged', lender = $2, pledged_at = now() where id = $1", [input.receiptId, input.lender.trim()]);
	await sql.query("update erp_lots set status = 'pledged' where id = $1", [rec[0].lot_id]);
	await sql.query(`insert into erp_receipt_events (receipt_id, event, note) values ($1,'pledged',$2)`, [input.receiptId, input.lender.trim()]);
}
async function releaseLien(sql, receiptId) {
	const rec = await sql.query("select status, lot_id from erp_receipts where id = $1", [receiptId]);
	if (!rec[0]) throw new Error("Unknown receipt.");
	if (rec[0].status !== "pledged") throw new Error("No lien to release.");
	await sql.query("update erp_receipts set status = 'inward', lender = null where id = $1", [receiptId]);
	await sql.query("update erp_lots set status = 'in_warehouse' where id = $1", [rec[0].lot_id]);
	await sql.query(`insert into erp_receipt_events (receipt_id, event, note) values ($1,'lien_released', null)`, [receiptId]);
}
async function createOrder(sql, input) {
	const freight = input.freightPaisePerKg ?? 400;
	settlementAmounts(input.qtyGrams, input.pricePaisePerKg, freight);
	const lot = await sql.query("select grams, remaining_grams, status, cell_id from erp_lots where id = $1", [input.lotId]);
	if (!lot[0]) throw new Error("Unknown lot.");
	const pledged = await sql.query("select count(*)::int as n from erp_receipts where lot_id = $1 and status = 'pledged'", [input.lotId]);
	assertCanSell(lot[0].status, pledged[0]?.n ?? 0);
	const remaining = lot[0].remaining_grams ?? lot[0].grams;
	if (input.qtyGrams > remaining) throw new Error("Cannot sell more than the remaining lot body.");
	if (!input.buyer.trim()) throw new Error("Buyer required.");
	const id = input.orderId ?? nid("ord");
	if (!(await sql.query(`update erp_lots
     set remaining_grams = remaining_grams - $2, status = 'listed'
     where id = $1 and remaining_grams >= $2
     returning remaining_grams`, [input.lotId, input.qtyGrams]))[0]) throw new Error("Cannot sell more than the remaining lot body.");
	await sql.query(`insert into erp_orders (id, lot_id, buyer, qty_grams, price_paise_per_kg, freight_paise_per_kg, pool_id, status)
     values ($1,$2,$3,$4,$5,$6,$7,'open')`, [
		id,
		input.lotId,
		input.buyer.trim(),
		input.qtyGrams,
		input.pricePaisePerKg,
		freight,
		input.poolId ?? null
	]);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'marketplace','b-harvest-market',$2::jsonb)`, ["lot.ready", JSON.stringify({
		lotId: input.lotId,
		orderId: id,
		pricePaisePerKg: input.pricePaisePerKg
	})]);
	return id;
}
async function poolOfftake(sql, input) {
	const freight = input.freightPaisePerKg ?? 400;
	settlementAmounts(input.qtyGrams, input.pricePaisePerKg, freight);
	const lots = await sql.query(`select l.id, l.remaining_grams
     from erp_lots l
     where l.commodity = $1
       and l.remaining_grams > 0
       and l.status in ('in_warehouse','listed')
       and not exists (select 1 from erp_receipts r where r.lot_id = l.id and r.status = 'pledged')
     order by l.minted_at asc`, [input.commodity]);
	const alloc = allocateFifo(lots.map((l) => ({
		id: l.id,
		remainingGrams: l.remaining_grams
	})), input.qtyGrams);
	const poolId = nid("pool");
	for (const row of alloc) await createOrder(sql, {
		lotId: row.lotId,
		buyer: input.buyer,
		qtyGrams: row.qtyGrams,
		pricePaisePerKg: input.pricePaisePerKg,
		freightPaisePerKg: freight,
		poolId
	});
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'fpo','b-fpo-offtake',$2::jsonb)`, ["fpo.pool.offtake", JSON.stringify({
		poolId,
		commodity: input.commodity,
		qtyGrams: input.qtyGrams,
		lines: alloc.length
	})]);
	return poolId;
}
async function restoreLotStatus(sql, lotId) {
	const lot = await sql.query("select remaining_grams from erp_lots where id = $1", [lotId]);
	const open = await sql.query("select count(*)::int as n from erp_orders where lot_id = $1 and status = 'open'", [lotId]);
	const rec = await sql.query("select status from erp_receipts where lot_id = $1 and status <> 'released' order by created_at desc limit 1", [lotId]);
	if ((lot[0]?.remaining_grams ?? 0) <= 0 && (open[0]?.n ?? 0) === 0) {
		await sql.query("update erp_lots set status = 'settled' where id = $1", [lotId]);
		return;
	}
	if ((open[0]?.n ?? 0) > 0) {
		await sql.query("update erp_lots set status = 'listed' where id = $1", [lotId]);
		return;
	}
	if (rec[0]?.status === "pledged") {
		await sql.query("update erp_lots set status = 'pledged' where id = $1", [lotId]);
		return;
	}
	if (rec[0]) {
		await sql.query("update erp_lots set status = 'in_warehouse' where id = $1", [lotId]);
		return;
	}
	await sql.query("update erp_lots set status = 'minted' where id = $1", [lotId]);
}
async function settleOrder(sql, input) {
	if (!input.paymentRef.trim()) throw new Error("paymentRef is required to mark paid.");
	const order = await sql.query("select lot_id, qty_grams, price_paise_per_kg, freight_paise_per_kg, status from erp_orders where id = $1", [input.orderId]);
	if (!order[0]) throw new Error("Unknown order.");
	if (order[0].status === "settled") return;
	const lot = await sql.query("select cell_id, fpo_id, variety from erp_lots where id = $1", [order[0].lot_id]);
	if (!lot[0]) throw new Error("Lot missing for order.");
	const freightRate = order[0].freight_paise_per_kg ?? 400;
	const { gross, freight, farmgate } = settlementAmounts(order[0].qty_grams, order[0].price_paise_per_kg, freightRate);
	const lines = settlementJournal({
		variety: lot[0].variety,
		hoursToPay: input.hoursToPay,
		gross,
		freight,
		farmgate
	});
	if (!journalBalances(lines)) throw new Error("Settlement journal does not balance.");
	const entryId = nid("je");
	await sql.query(`update erp_orders
     set status = 'settled', hours_to_pay = $2, settled_at = now(), payment_ref = $3
     where id = $1`, [
		input.orderId,
		input.hoursToPay,
		input.paymentRef.trim()
	]);
	const rec = await sql.query("select id, remaining_grams from erp_receipts where lot_id = $1 and status <> 'released' order by created_at desc limit 1", [order[0].lot_id]);
	if (rec[0]) {
		const next = Math.max(0, (rec[0].remaining_grams ?? 0) - order[0].qty_grams);
		if (next === 0) {
			await sql.query("update erp_receipts set remaining_grams = 0, status = 'released' where id = $1", [rec[0].id]);
			await sql.query(`insert into erp_receipt_events (receipt_id, event, note) values ($1,'released',$2)`, [rec[0].id, input.paymentRef.trim()]);
		} else {
			await sql.query("update erp_receipts set remaining_grams = $2 where id = $1", [rec[0].id, next]);
			await sql.query(`insert into erp_receipt_events (receipt_id, event, note) values ($1,'partial_out',$2)`, [rec[0].id, `${order[0].qty_grams} g settled`]);
		}
	}
	await restoreLotStatus(sql, order[0].lot_id);
	await sql.query(`insert into erp_payouts (fpo_id, cell_id, order_id, qty_grams, amount_paise, status, payment_ref)
     values ($1,$2,$3,$4,$5,'paid',$6)`, [
		lot[0].fpo_id,
		lot[0].cell_id,
		input.orderId,
		order[0].qty_grams,
		farmgate,
		input.paymentRef.trim()
	]);
	for (const line of lines) await sql.query(`insert into erp_journal (entry_id, cell_id, lot_id, organ_id, account, side, amount_paise, memo)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`, [
		entryId,
		lot[0].cell_id,
		order[0].lot_id,
		line.organId,
		line.account,
		line.side,
		line.amountPaise,
		line.memo
	]);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'orders','b-order-payout',$2::jsonb)`, ["order.settled", JSON.stringify({
		orderId: input.orderId,
		lotId: order[0].lot_id,
		cellId: lot[0].cell_id,
		farmgate,
		hoursToPay: input.hoursToPay
	})]);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'rupee','b-rupee-cell',$2::jsonb)`, ["prosperity.post", JSON.stringify({
		organ: "orders",
		paise: farmgate,
		hoursToPay: input.hoursToPay,
		cellId: lot[0].cell_id
	})]);
}
async function settlePool(sql, input) {
	const rows = await sql.query("select id from erp_orders where pool_id = $1 and status = 'open' order by created_at", [input.poolId]);
	if (rows.length === 0) throw new Error("No open lines in this pool.");
	for (const row of rows) await settleOrder(sql, {
		orderId: row.id,
		paymentRef: input.paymentRef,
		hoursToPay: input.hoursToPay
	});
}
async function postInput(sql, input) {
	if (input.amountPaise <= 0) throw new Error("Declared amount is required.");
	if (!(await sql.query("select id from erp_cells where id = $1", [input.cellId]))[0]) throw new Error("Unknown cell.");
	await sql.query(`insert into erp_inputs (cell_id, kind, qty, unit, amount_paise, memo)
     values ($1,$2,$3,$4,$5,$6)`, [
		input.cellId,
		input.kind,
		input.qty,
		input.unit,
		input.amountPaise,
		input.memo
	]);
	const organ = input.kind === "energy" ? "recie" : input.kind === "cover" ? "insurance" : "crop";
	const lines = inputJournal(input.kind, input.amountPaise, input.memo, organ);
	if (!journalBalances(lines)) throw new Error("Input journal does not balance.");
	const entryId = nid("je");
	for (const line of lines) await sql.query(`insert into erp_journal (entry_id, cell_id, lot_id, organ_id, account, side, amount_paise, memo)
       values ($1,$2,null,$3,$4,$5,$6,$7)`, [
		entryId,
		input.cellId,
		line.organId,
		line.account,
		line.side,
		line.amountPaise,
		line.memo
	]);
}
async function readBooks() {
	const sql = await getSql();
	const fpoRows = await sql.query("select id, name, village, district, split_rule from erp_fpo limit 1");
	const fpo = fpoRows[0] ? {
		id: fpoRows[0].id,
		name: fpoRows[0].name,
		village: fpoRows[0].village,
		district: fpoRows[0].district,
		splitRule: fpoRows[0].split_rule
	} : null;
	const cells = (await sql.query(`select c.id, c.name, c.household, c.fpo_id, c.village, c.acres_centi, c.notes,
            count(l.id)::int as lot_count,
            coalesce(sum(l.grams),0)::int as grams,
            coalesce(sum(l.remaining_grams),0)::int as remaining_grams,
            coalesce((
              select sum(j.amount_paise)::int from erp_journal j
              where j.cell_id = c.id and j.side = 'credit' and j.account = 'farmgate'
            ),0) as credit_paise,
            coalesce((
              select sum(i.amount_paise)::int from erp_inputs i
              where i.cell_id = c.id
            ),0) as debit_paise
     from erp_cells c
     left join erp_lots l on l.cell_id = c.id
     group by c.id
     order by c.name`)).map((c) => ({
		id: c.id,
		name: c.name,
		household: c.household,
		fpoId: c.fpo_id,
		village: c.village,
		acresCenti: c.acres_centi,
		notes: c.notes,
		lotCount: c.lot_count,
		kgOnBooks: c.grams,
		remainingGrams: c.remaining_grams,
		rupeeCreditPaise: c.credit_paise,
		rupeeDebitPaise: c.debit_paise
	}));
	const lots = (await sql.query(`select l.id, l.cell_id, c.name as cell_name, l.fpo_id, l.variety, l.commodity, l.grams,
            l.remaining_grams, l.grade, l.gi_marker, l.moisture_bp, l.status, l.minted_at
     from erp_lots l join erp_cells c on c.id = l.cell_id
     order by l.minted_at desc`)).map((l) => ({
		id: l.id,
		cellId: l.cell_id,
		cellName: l.cell_name,
		fpoId: l.fpo_id,
		variety: l.variety,
		commodity: l.commodity,
		grams: l.grams,
		remainingGrams: l.remaining_grams ?? l.grams,
		grade: l.grade,
		giMarker: l.gi_marker,
		moistureBp: l.moisture_bp,
		status: l.status,
		mintedAt: asTime(l.minted_at)
	}));
	const receipts = (await sql.query(`select r.id, r.lot_id, l.variety, c.name as cell_name, r.facility, r.qty_grams,
            r.remaining_grams, r.status, r.lender, r.created_at
     from erp_receipts r
     join erp_lots l on l.id = r.lot_id
     join erp_cells c on c.id = l.cell_id
     order by r.created_at desc`)).map((r) => ({
		id: r.id,
		lotId: r.lot_id,
		variety: r.variety,
		cellName: r.cell_name,
		facility: r.facility,
		qtyGrams: r.qty_grams,
		remainingGrams: r.remaining_grams ?? r.qty_grams,
		status: r.status,
		lender: r.lender,
		createdAt: asTime(r.created_at)
	}));
	const orders = (await sql.query(`select o.id, o.lot_id, o.pool_id, l.variety, c.name as cell_name, o.buyer, o.qty_grams,
            o.price_paise_per_kg, o.freight_paise_per_kg, o.status, o.hours_to_pay, o.payment_ref,
            o.created_at, o.settled_at
     from erp_orders o
     join erp_lots l on l.id = o.lot_id
     join erp_cells c on c.id = l.cell_id
     order by o.created_at desc`)).map((o) => ({
		id: o.id,
		lotId: o.lot_id,
		poolId: o.pool_id,
		variety: o.variety,
		cellName: o.cell_name,
		buyer: o.buyer,
		qtyGrams: o.qty_grams,
		pricePaisePerKg: o.price_paise_per_kg,
		freightPaisePerKg: o.freight_paise_per_kg ?? 400,
		status: o.status,
		hoursToPay: o.hours_to_pay,
		paymentRef: o.payment_ref,
		createdAt: asTime(o.created_at),
		settledAt: o.settled_at ? asTime(o.settled_at) : null
	}));
	const journal = (await sql.query(`select id, entry_id, cell_id, lot_id, organ_id, account, side, amount_paise, memo, created_at
     from erp_journal order by created_at desc, id desc limit 80`)).map((j) => ({
		id: j.id,
		entryId: j.entry_id,
		cellId: j.cell_id,
		lotId: j.lot_id,
		organId: j.organ_id,
		account: j.account,
		side: j.side,
		amountPaise: j.amount_paise,
		memo: j.memo,
		createdAt: asTime(j.created_at)
	}));
	const inputs = (await sql.query(`select i.id, i.cell_id, c.name as cell_name, i.kind, i.qty, i.unit, i.amount_paise, i.memo, i.created_at
     from erp_inputs i join erp_cells c on c.id = i.cell_id
     order by i.created_at desc`)).map((i) => ({
		id: i.id,
		cellId: i.cell_id,
		cellName: i.cell_name,
		kind: i.kind,
		qty: i.qty,
		unit: i.unit,
		amountPaise: i.amount_paise,
		memo: i.memo,
		createdAt: asTime(i.created_at)
	}));
	const payouts = (await sql.query(`select p.id, p.fpo_id, p.cell_id, c.name as cell_name, p.order_id, p.qty_grams, p.amount_paise,
            p.status, p.payment_ref, p.created_at
     from erp_payouts p join erp_cells c on c.id = p.cell_id
     order by p.created_at desc`)).map((p) => ({
		id: p.id,
		fpoId: p.fpo_id,
		cellId: p.cell_id,
		cellName: p.cell_name,
		orderId: p.order_id,
		qtyGrams: p.qty_grams,
		amountPaise: p.amount_paise,
		status: p.status,
		paymentRef: p.payment_ref,
		createdAt: asTime(p.created_at)
	}));
	const poolMap = /* @__PURE__ */ new Map();
	for (const lot of lots) {
		if (lot.remainingGrams <= 0) continue;
		if (lot.status !== "in_warehouse" && lot.status !== "listed") continue;
		if (receipts.some((r) => r.lotId === lot.id && r.status === "pledged")) continue;
		const prev = poolMap.get(lot.commodity);
		if (prev) {
			prev.remainingGrams += lot.remainingGrams;
			prev.lotCount += 1;
		} else poolMap.set(lot.commodity, {
			commodity: lot.commodity,
			remainingGrams: lot.remainingGrams,
			lotCount: 1,
			cellCount: 0
		});
	}
	for (const row of poolMap.values()) row.cellCount = new Set(lots.filter((l) => l.commodity === row.commodity && l.remainingGrams > 0).map((l) => l.cellId)).size;
	const poolable = [...poolMap.values()];
	const openPaise = orders.filter((o) => o.status === "open").reduce((n, o) => n + paiseFromKgPrice(o.qtyGrams, o.pricePaisePerKg), 0);
	const settledPaise = orders.filter((o) => o.status === "settled").reduce((n, o) => n + paiseFromKgPrice(o.qtyGrams, o.pricePaisePerKg), 0);
	const farmgatePaise = payouts.reduce((n, p) => n + p.amountPaise, 0);
	const hours = orders.filter((o) => o.status === "settled" && o.hoursToPay != null).map((o) => o.hoursToPay);
	const kgInWarehouse = receipts.filter((r) => r.status === "inward" || r.status === "pledged").reduce((n, r) => n + r.remainingGrams, 0);
	const kgMinted = lots.reduce((n, l) => n + l.grams, 0);
	const kgRemaining = lots.reduce((n, l) => n + l.remainingGrams, 0);
	const totals = await sql.query(`select
       coalesce(sum(case when side = 'debit' then amount_paise else 0 end), 0)::int as debit,
       coalesce(sum(case when side = 'credit' then amount_paise else 0 end), 0)::int as credit
     from erp_journal`);
	const debit = totals[0]?.debit ?? 0;
	const credit = totals[0]?.credit ?? 0;
	return {
		fpo,
		kpis: {
			cells: cells.length,
			lots: lots.length,
			kgInWarehouse,
			kgMinted,
			kgRemaining,
			openPaise,
			settledPaise,
			farmgatePaise,
			pendingPayouts: payouts.filter((p) => p.status === "pending").length,
			avgHoursToPay: hours.length ? Math.round(hours.reduce((a, b) => a + b, 0) / hours.length) : null,
			journalBalanced: debit === credit,
			integrityNote: "ERP is bone. It records declared farmgate, freight, and settlement. Remaining mass stays on the same lot. It does not invent ₹ or MT. The nerve may read these books; it may not write them."
		},
		cells,
		lots,
		receipts,
		orders,
		journal,
		inputs,
		payouts,
		poolable
	};
}
//#endregion
export { createOrder, enrollCell, ensureBooks, inwardReceipt, mintLot, pledgeReceipt, poolOfftake, postInput, readBooks, releaseLien, settleOrder, settlePool };
