import { t as getSql } from "./db-C3Cj9Z-X.mjs";
import { i as queryLibraryKnowledge } from "./match-O6S8HVhu.mjs";
import { n as diagnose, t as composeLibraryReading } from "./diagnose-yTPU51_9.mjs";
import { t as nid } from "./ids-BUY7TE2s.mjs";
import { i as journalBalances, l as splitQtyWeighted, o as remainingAfterCommit, s as settlementAmounts, t as allocateFifo } from "./kernel-D9aVc8UY.mjs";
import { t as AI_SYSTEMS } from "./catalog-BIfdppeO.mjs";
import { i as runtimeStats, n as WORKFLOWS, r as WORKFLOW_BY_ID, t as MODULE_RUNTIME } from "./registry-CRCHqiWy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/boot.server-CPfb5TKM.js
/** ERP + AI firewall algorithms. Numbers are declared. AI does not invent them. */
function aiFirewall(step) {
	if (step.kind === "ai" && step.rupeeWrite) return {
		decision: "block",
		reason: "AI numeric writes are forbidden on assertions. A clerk declares ₹.",
		payload: { firewall: "rupee-write" }
	};
	return {
		decision: "pass",
		reason: "Firewall open: this step does not write rupees.",
		payload: { spendPaise: 0 }
	};
}
function remainingGate(ctx) {
	const remaining = ctx.remainingGrams ?? ctx.grams ?? 0;
	const qty = ctx.qtyGrams ?? 0;
	if (remaining < 0) return {
		decision: "block",
		reason: "Remaining mass cannot be negative.",
		payload: { remaining }
	};
	if (qty > remaining) return {
		decision: "block",
		reason: "Cannot sell more than the remaining lot body.",
		payload: {
			remaining,
			qty
		}
	};
	if ((ctx.grams ?? 0) > 0) remainingAfterCommit(ctx.grams ?? 0, (ctx.grams ?? 0) - remaining);
	return {
		decision: remaining > 0 || qty === 0 ? "pass" : "block",
		reason: remaining > 0 ? `Remaining ${remaining} g still on the same body.` : "No remaining mass.",
		payload: {
			remaining,
			qty
		}
	};
}
function priceDeclared(ctx) {
	if (ctx.pricePaisePerKg == null || ctx.pricePaisePerKg <= 0) return {
		decision: "block",
		reason: "salePricePerUnit is required — never invented.",
		payload: {}
	};
	return {
		decision: "pass",
		reason: `Declared ${ctx.pricePaisePerKg} paise/kg.`,
		payload: { pricePaisePerKg: ctx.pricePaisePerKg }
	};
}
function priceWaterfall(ctx) {
	const qty = ctx.qtyGrams ?? 0;
	const price = ctx.pricePaisePerKg ?? 0;
	const freight = ctx.freightPaisePerKg ?? 0;
	if (qty <= 0 || price <= 0) return {
		decision: "block",
		reason: "Waterfall needs declared quantity and price.",
		payload: {}
	};
	const amounts = settlementAmounts(qty, price, freight);
	return {
		decision: "pass",
		reason: `Gross ${amounts.gross} − freight ${amounts.freight} = farmgate ${amounts.farmgate}.`,
		payload: amounts
	};
}
function journalGate(ctx) {
	const qty = ctx.qtyGrams ?? 0;
	const price = ctx.pricePaisePerKg ?? 0;
	const freight = ctx.freightPaisePerKg ?? 0;
	if (qty <= 0 || price <= 0) return {
		decision: "defer",
		reason: "No settlement lines yet.",
		payload: {}
	};
	const { gross, freight: fr, farmgate } = settlementAmounts(qty, price, freight);
	const ok = journalBalances([
		{
			side: "debit",
			amountPaise: gross
		},
		{
			side: "credit",
			amountPaise: farmgate
		},
		{
			side: "credit",
			amountPaise: fr
		}
	]);
	return {
		decision: ok ? "pass" : "block",
		reason: ok ? "Journal balances: cash in, farmgate + freight out." : "Journal does not balance.",
		payload: {
			gross,
			freight: fr,
			farmgate
		}
	};
}
function paymentRefGate(ctx) {
	const ref = ctx.paymentRef?.trim() ?? "";
	if (!ref) return {
		decision: "defer",
		reason: "paymentRef is required to mark paid. The offtake stays open.",
		payload: {}
	};
	return {
		decision: "pass",
		reason: `Settled against ${ref}.`,
		payload: { paymentRef: ref }
	};
}
function pledgeGate(ctx) {
	if ((ctx.pledged ?? 0) > 0) return {
		decision: "block",
		reason: "Pledged receipts cannot sell until the lien is cleared.",
		payload: { pledged: ctx.pledged }
	};
	if ((ctx.openOfftake ?? 0) > 0 && ctx.status === "inward") return {
		decision: "block",
		reason: "Open offtake already claims this body.",
		payload: { openOfftake: ctx.openOfftake }
	};
	return {
		decision: "pass",
		reason: "No lien. Stock may move.",
		payload: {}
	};
}
function fifoGate(ctx) {
	const remaining = ctx.remainingGrams ?? 0;
	const qty = ctx.qtyGrams ?? 0;
	if (qty <= 0) return {
		decision: "defer",
		reason: "No pool quantity declared.",
		payload: {}
	};
	try {
		return {
			decision: "pass",
			reason: "FIFO holds remaining mass.",
			payload: { take: allocateFifo([{
				id: ctx.lotId ?? "lot",
				remainingGrams: remaining
			}], qty) }
		};
	} catch (err) {
		return {
			decision: "block",
			reason: err instanceof Error ? err.message : "FIFO refused.",
			payload: {}
		};
	}
}
function qtyWeightedGate(ctx) {
	const qty = ctx.qtyGrams ?? 0;
	const price = ctx.pricePaisePerKg ?? 0;
	const freight = ctx.freightPaisePerKg ?? 0;
	if (qty <= 0 || price <= 0) return {
		decision: "defer",
		reason: "No farmgate to split.",
		payload: {}
	};
	const { farmgate } = settlementAmounts(qty, price, freight);
	return {
		decision: "pass",
		reason: "FPO split is qty-weighted. Last cell absorbs remainder.",
		payload: {
			split: splitQtyWeighted([{
				cellId: ctx.cellId ?? "cell",
				qtyGrams: qty
			}], farmgate),
			farmgate
		}
	};
}
function libraryConsult(ctx) {
	const query = ctx.query || ctx.variety || "harvest lot spine hippocampus module";
	const diagnosis = diagnose();
	const hits = queryLibraryKnowledge(query, { limit: 6 });
	const reading = composeLibraryReading(query, hits, diagnosis);
	return {
		decision: hits.length ? "pass" : "defer",
		reason: reading.slice(0, 280),
		payload: {
			hits: hits.map((h) => h.id),
			missing: diagnosis.missingLigaments
		}
	};
}
function giFrame(ctx) {
	if (!ctx.giMarker) return {
		decision: "propose",
		reason: "No GI marker on this lot. Media may not invent one.",
		payload: { giMarker: null }
	};
	return {
		decision: "pass",
		reason: `Frame the sack with ${ctx.giMarker}. Same lot body.`,
		payload: { giMarker: ctx.giMarker }
	};
}
function fvieRank(ctx) {
	const price = ctx.pricePaisePerKg ?? 0;
	if (price <= 0) return {
		decision: "defer",
		reason: "Nothing honest to rank until a clerk declares farmgate.",
		payload: {}
	};
	return {
		decision: "propose",
		reason: "Rank by declared farmer rupee, not SKU affinity.",
		payload: {
			farmerPaisePerKg: price,
			energyPerKg: null,
			foodValue: null
		}
	};
}
function hoursToPay(ctx) {
	if (ctx.hoursToPay == null) return {
		decision: "propose",
		reason: "Hours-to-pay is a cell promise. Ask the clerk.",
		payload: {}
	};
	return {
		decision: "pass",
		reason: `${ctx.hoursToPay}h to pay sits on the cell, not on a dashboard.`,
		payload: { hoursToPay: ctx.hoursToPay }
	};
}
function humanCommand() {
	return {
		decision: "pass",
		reason: "Command already has a human: the clerk named the cell and the mass.",
		payload: { human: true }
	};
}
function countPlugs(living, total) {
	return {
		decision: living > 0 ? "pass" : "block",
		reason: `${living} of ${total} modules have a living plug on this bus.`,
		payload: {
			living,
			total
		}
	};
}
function copilotNext(workflowId) {
	const next = {
		"harvest-mint": "Next keystroke: inward the same lot body at the godown.",
		"warehouse-intake": "Next keystroke: offtake at a declared ₹/kg, or pledge if a lender is named.",
		"offtake-settle": "Next keystroke: paymentRef, then farmgate credits the cell.",
		"nerve-consult": "Next keystroke: name an organ, then a clerk acts.",
		"domain-advise": "Next keystroke: weather may pause EMI; it may not invent a price.",
		"platform-bus": "Next keystroke: run harvest-mint against a living lot."
	};
	return {
		decision: "propose",
		reason: next[workflowId] ?? "Next keystroke lives on the books, not a second portal.",
		payload: { next: next[workflowId] ?? "books" }
	};
}
function orchestratorRoute(step) {
	return {
		decision: "pass",
		reason: `Routed ${step.emits} to ${step.moduleId}. One engine, not sixteen mouths.`,
		payload: { route: step.moduleId }
	};
}
function execute(step, ctx) {
	const wall = aiFirewall(step);
	if (wall.decision === "block") return wall;
	switch (step.algorithm) {
		case "ai-firewall": return wall;
		case "remaining-gate": return remainingGate(ctx);
		case "price-declared": return priceDeclared(ctx);
		case "price-waterfall": return priceWaterfall(ctx);
		case "journal-balance": return journalGate(ctx);
		case "payment-ref": return paymentRefGate(ctx);
		case "pledge-gate": return pledgeGate(ctx);
		case "fifo-alloc": return fifoGate(ctx);
		case "qty-weighted": return qtyWeightedGate(ctx);
		case "library-consult": return libraryConsult(ctx);
		case "gi-frame": return giFrame(ctx);
		case "fvie-rank": return fvieRank(ctx);
		case "hours-to-pay": return hoursToPay(ctx);
		case "human-command": return humanCommand();
		case "count-plugs": return countPlugs(MODULE_RUNTIME.filter((m) => m.plug === "living").length, AI_SYSTEMS.length);
		case "copilot-next": return copilotNext(ctx.workflowId);
		case "orchestrator-route": return orchestratorRoute(step);
		default: return {
			decision: "defer",
			reason: `No algorithm named ${step.algorithm}.`,
			payload: {}
		};
	}
}
function runWorkflow(workflowId, ctx = {}) {
	const def = WORKFLOW_BY_ID[workflowId];
	if (!def) throw new Error(`Unknown workflow ${workflowId}.`);
	const full = {
		...ctx,
		workflowId
	};
	const id = nid("run");
	const startedAt = (/* @__PURE__ */ new Date()).toISOString();
	const steps = [];
	const messages = [];
	let status = "passed";
	let prev = "contract";
	for (const step of def.steps) {
		const result = execute(step, full);
		steps.push({
			code: step.code,
			moduleId: step.moduleId,
			name: step.name,
			kind: step.kind,
			organ: step.organ,
			decision: result.decision,
			reason: result.reason,
			algorithm: step.algorithm,
			rupeeWrite: step.rupeeWrite,
			emits: step.emits,
			payload: result.payload
		});
		messages.push({
			from: prev,
			to: step.moduleId,
			signal: step.emits,
			envelope: {
				decision: result.decision,
				organ: step.organ,
				lotId: full.lotId ?? null
			}
		});
		prev = step.moduleId;
		if (result.decision === "block") {
			status = "blocked";
			break;
		}
		if (result.decision === "defer" && status === "passed") status = "deferred";
	}
	return {
		id,
		workflowId,
		organId: def.organ,
		lotId: full.lotId ?? null,
		status,
		startedAt,
		finishedAt: (/* @__PURE__ */ new Date()).toISOString(),
		steps,
		messages
	};
}
function lastCopilot(run) {
	if (!run) return null;
	return [...run.steps].reverse().find((s) => s.moduleId === "copilot" || s.algorithm === "copilot-next")?.reason ?? null;
}
var seedChain = null;
function asTime(value) {
	if (typeof value === "string") return value;
	if (value instanceof Date) return value.toISOString();
	return String(value ?? "");
}
function asPayload(value) {
	if (value && typeof value === "object" && !Array.isArray(value)) return value;
	if (typeof value === "string") try {
		const parsed = JSON.parse(value);
		if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
	} catch {
		return {};
	}
	return {};
}
function asEnvelope(value) {
	const o = asPayload(value);
	return {
		decision: o.decision ?? "",
		organ: o.organ ?? "",
		lotId: o.lotId ?? null
	};
}
async function persistRun(sql, run) {
	await sql.query(`insert into module_runs (id, workflow_id, organ_id, lot_id, status, started_at, finished_at)
     values ($1,$2,$3,$4,$5,$6,$7)`, [
		run.id,
		run.workflowId,
		run.organId,
		run.lotId,
		run.status,
		run.startedAt,
		run.finishedAt
	]);
	for (const [i, step] of run.steps.entries()) await sql.query(`insert into module_steps (run_id, seq, module_id, step_code, kind, organ_id, decision, reason, algorithm, rupee_write, payload)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)`, [
		run.id,
		i + 1,
		step.moduleId,
		step.code,
		step.kind,
		step.organ,
		step.decision,
		step.reason,
		step.algorithm,
		step.rupeeWrite,
		JSON.stringify(step.payload)
	]);
	for (const msg of run.messages) await sql.query(`insert into module_messages (run_id, from_module, to_module, signal, envelope)
       values ($1,$2,$3,$4,$5::jsonb)`, [
		run.id,
		msg.from,
		msg.to,
		msg.signal,
		JSON.stringify(msg.envelope)
	]);
	await sql.query(`update module_state set booted_at = coalesce(booted_at, now()), living_plugs = $1, last_run_id = $2, last_error = null where id = 1`, [runtimeStats().livingPlugs, run.id]);
}
function assemble(runRows, stepRows, msgRows) {
	const stepsBy = /* @__PURE__ */ new Map();
	for (const s of stepRows) {
		const list = stepsBy.get(s.run_id) ?? [];
		list.push({
			code: s.step_code,
			moduleId: s.module_id,
			name: s.step_code,
			kind: s.kind,
			organ: s.organ_id,
			decision: s.decision,
			reason: s.reason,
			algorithm: s.algorithm ?? "",
			rupeeWrite: Boolean(s.rupee_write),
			emits: s.step_code,
			payload: asPayload(s.payload)
		});
		stepsBy.set(s.run_id, list);
	}
	const msgBy = /* @__PURE__ */ new Map();
	for (const m of msgRows) {
		const list = msgBy.get(m.run_id) ?? [];
		list.push({
			from: m.from_module,
			to: m.to_module,
			signal: m.signal,
			envelope: asEnvelope(m.envelope)
		});
		msgBy.set(m.run_id, list);
	}
	return runRows.map((r) => ({
		id: r.id,
		workflowId: r.workflow_id,
		organId: r.organ_id,
		lotId: r.lot_id,
		status: r.status,
		startedAt: asTime(r.started_at),
		finishedAt: r.finished_at ? asTime(r.finished_at) : null,
		steps: stepsBy.get(r.id) ?? [],
		messages: msgBy.get(r.id) ?? []
	}));
}
async function readModuleOs() {
	const sql = await getSql();
	const state = await sql.query("select living_plugs, last_run_id, last_error, booted_at from module_state where id = 1");
	const runRows = await sql.query("select id, workflow_id, organ_id, lot_id, status, started_at, finished_at from module_runs order by started_at desc, id desc limit 12");
	const ids = runRows.map((r) => r.id);
	let stepRows = [];
	let msgRows = [];
	if (ids.length) {
		const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
		stepRows = await sql.query(`select run_id, seq, module_id, step_code, kind, organ_id, decision, reason, algorithm, rupee_write, payload
       from module_steps where run_id in (${placeholders}) order by seq`, ids);
		msgRows = await sql.query(`select run_id, from_module, to_module, signal, envelope from module_messages where run_id in (${placeholders}) order by id`, ids);
	}
	const runs = assemble(runRows, stepRows, msgRows);
	const stats = runtimeStats();
	return {
		livingPlugs: stats.livingPlugs,
		partialPlugs: stats.partialPlugs,
		modules: stats.modules,
		workflows: WORKFLOWS.length,
		lastRunId: state[0]?.last_run_id ?? runs[0]?.id ?? null,
		lastError: state[0]?.last_error ?? null,
		bootedAt: state[0]?.booted_at ? asTime(state[0].booted_at) : null,
		runs,
		copilot: lastCopilot(runs[0])
	};
}
var MAGH = [
	{
		workflowId: "harvest-mint",
		ctx: {
			lotId: "lot-chakhao-enghi",
			cellId: "c-enghi",
			variety: "Chakhao Poireiton",
			commodity: "black rice",
			grams: 51e4,
			remainingGrams: 51e4,
			qtyGrams: 0,
			giMarker: "GI-AS-CHAKHAO",
			status: "minted",
			query: "harvest mint lot Chakhao hippocampus"
		}
	},
	{
		workflowId: "warehouse-intake",
		ctx: {
			lotId: "lot-chakhao-enghi",
			grams: 51e4,
			remainingGrams: 51e4,
			giMarker: "GI-AS-CHAKHAO",
			status: "inward",
			pledged: 0
		}
	},
	{
		workflowId: "offtake-settle",
		ctx: {
			lotId: "lot-chakhao-enghi",
			cellId: "c-enghi",
			grams: 51e4,
			remainingGrams: 51e4,
			qtyGrams: 51e4,
			pricePaisePerKg: 18500,
			freightPaisePerKg: 400,
			paymentRef: "UPI-KA-8841",
			hoursToPay: 18,
			pledged: 0,
			status: "settled"
		}
	},
	{
		workflowId: "harvest-mint",
		ctx: {
			lotId: "lot-chakhao-ronghang",
			cellId: "c-ronghang",
			variety: "Chakhao Poireiton",
			commodity: "black rice",
			grams: 84e4,
			remainingGrams: 44e4,
			qtyGrams: 4e5,
			giMarker: "GI-AS-CHAKHAO",
			status: "listed",
			query: "harvest mint remaining mass"
		}
	},
	{
		workflowId: "offtake-settle",
		ctx: {
			lotId: "lot-chakhao-ronghang",
			cellId: "c-ronghang",
			grams: 84e4,
			remainingGrams: 44e4,
			qtyGrams: 4e5,
			pricePaisePerKg: 19200,
			freightPaisePerKg: 400,
			paymentRef: null,
			hoursToPay: null,
			pledged: 0,
			status: "listed"
		}
	}
];
async function seedModuleOs(sql) {
	await sql.query("insert into module_state (id) values (1) on conflict (id) do nothing", []);
	if (((await sql.query("select count(*)::int as n from module_runs"))[0]?.n ?? 0) > 0) return;
	await persistRun(sql, runWorkflow("platform-bus", { query: "module OS plug harvest lot spine" }));
	await persistRun(sql, runWorkflow("nerve-consult", { query: "agentic companion harvest lot remaining" }));
	await persistRun(sql, runWorkflow("domain-advise", { query: "weather alert EMI pause Chakhao" }));
	for (const row of MAGH) await persistRun(sql, runWorkflow(row.workflowId, row.ctx));
}
async function runSeed() {
	await seedModuleOs(await getSql());
}
async function ensureModuleOs() {
	if (!seedChain) seedChain = runSeed().catch((err) => {
		seedChain = null;
		throw err;
	});
	await seedChain;
	return readModuleOs();
}
async function executeWorkflow(workflowId, ctx = {}) {
	await ensureModuleOs();
	const sql = await getSql();
	const run = runWorkflow(workflowId, ctx);
	await persistRun(sql, run);
	await sql.query(`insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'module','b-module-spine',$2::jsonb)`, [`module.${workflowId}`, JSON.stringify({
		runId: run.id,
		status: run.status,
		lotId: run.lotId
	})]);
	return readModuleOs();
}
async function trackErpSignal(signal, ctx) {
	const workflowId = {
		"harvest.completed": "harvest-mint",
		"lot.mint": "harvest-mint",
		"warehouse.intake": "warehouse-intake",
		"lot.ready": "offtake-settle",
		"order.settled": "offtake-settle"
	}[signal];
	if (!workflowId) return;
	try {
		await executeWorkflow(workflowId, {
			...ctx,
			query: signal
		});
	} catch {}
}
//#endregion
export { ensureModuleOs, executeWorkflow, trackErpSignal };
