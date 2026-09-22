import { t as getSql } from "./db-C3Cj9Z-X.mjs";
import { i as queryLibraryKnowledge } from "./match-O6S8HVhu.mjs";
import { n as diagnose, t as composeLibraryReading } from "./diagnose-yTPU51_9.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-Y0x8uf-R.js
async function grokEnrich(query, memory) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return null;
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			signal: AbortSignal.timeout(5e3),
			body: JSON.stringify({
				model: "grok-4.5",
				max_tokens: 420,
				temperature: .2,
				messages: [{
					role: "system",
					content: "You are the AFRERA nerve. The library is memory. Speak as an organism doctor: name the organ, the missing ligament, the signal that should fire, and the farmer rupee at stake. Do not invent living runtime that the catalog marks missing. Keep it under 220 words. No emoji."
				}, {
					role: "user",
					content: `Consult this library memory and answer the pulse.\n\n${memory}\n\nPulse: ${query}`
				}]
			})
		});
		if (!res.ok) return null;
		return (await res.json()).choices?.[0]?.message?.content?.trim() || null;
	} catch {
		return null;
	}
}
var bootOrganism_createServerFn_handler = createServerRpc({
	id: "2d3d3046d306433b92abf45f6004bc128f2f8eaaf6ca06ef83eac29c9cda2b5e",
	name: "bootOrganism",
	filename: "src/lib/organism/fns.ts"
}, (opts) => bootOrganism.__executeServer(opts));
var bootOrganism = createServerFn({ method: "POST" }).handler(bootOrganism_createServerFn_handler, async () => {
	const { ensureOrganismSnapshot, markBootError } = await import("./boot.server-BuSWrfm8.mjs");
	try {
		return {
			ok: true,
			...await ensureOrganismSnapshot()
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : "boot failed";
		return {
			ok: false,
			error: message,
			...await markBootError(message)
		};
	}
});
var getOrganism_createServerFn_handler = createServerRpc({
	id: "6b746126b9907148680b3a3c34bcec4d143d4401d4e7436f0f9da274f1c3b55a",
	name: "getOrganism",
	filename: "src/lib/organism/fns.ts"
}, (opts) => getOrganism.__executeServer(opts));
var getOrganism = createServerFn({ method: "GET" }).handler(getOrganism_createServerFn_handler, async () => {
	const { ensureOrganismSnapshot, readOrganismSnapshot } = await import("./boot.server-BuSWrfm8.mjs");
	try {
		return {
			ok: true,
			...await ensureOrganismSnapshot()
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : "organism unread";
		try {
			return {
				ok: false,
				error: message,
				...await readOrganismSnapshot()
			};
		} catch {
			return {
				ok: false,
				error: message,
				autoOp: "missing",
				bootedAt: null,
				libraryCards: 0,
				bindings: 0,
				lastPulseAt: null,
				lastError: message,
				diagnosis: diagnose(),
				pulses: [],
				events: [],
				reflexesAnswered: 0
			};
		}
	}
});
var publishSpineEvent_createServerFn_handler = createServerRpc({
	id: "38fd788e9e3009183ef39ea1bf4b748cc86a5032cdfae83d06f1147ec718a2ec",
	name: "publishSpineEvent",
	filename: "src/lib/organism/fns.ts"
}, (opts) => publishSpineEvent.__executeServer(opts));
var publishSpineEvent = createServerFn({ method: "POST" }).validator((input) => ({
	signal: String(input?.signal ?? "").slice(0, 240),
	organId: input?.organId ?? null,
	ligamentId: input?.ligamentId ?? null
})).handler(publishSpineEvent_createServerFn_handler, async ({ data }) => {
	if (!data.signal) return {
		ok: false,
		error: "missing signal"
	};
	const { publishEvent } = await import("./boot.server-BuSWrfm8.mjs");
	return {
		ok: true,
		events: await publishEvent(data.signal, data.organId, data.ligamentId, { via: "pulse-walk" })
	};
});
var consultLibrary_createServerFn_handler = createServerRpc({
	id: "a33a11123d727690641395698b53da2d1d0220679ba258f125368f40911e01df",
	name: "consultLibrary",
	filename: "src/lib/organism/fns.ts"
}, (opts) => consultLibrary.__executeServer(opts));
var consultLibrary = createServerFn({ method: "POST" }).validator((input) => ({
	query: String(input?.query ?? "").trim().slice(0, 500),
	organId: input?.organId ?? null
})).handler(consultLibrary_createServerFn_handler, async ({ data }) => {
	if (!data.query) return {
		ok: false,
		error: "Ask the library something."
	};
	const { ensureOrganismSnapshot, publishEvent, readOrganismSnapshot } = await import("./boot.server-BuSWrfm8.mjs");
	await ensureOrganismSnapshot();
	const sql = await getSql();
	const diagnosis = diagnose();
	const hits = queryLibraryKnowledge(data.query, {
		organId: data.organId,
		limit: 8
	});
	const memory = composeLibraryReading(data.query, hits, diagnosis);
	let reading = memory;
	let source = "library";
	const enriched = await grokEnrich(data.query, memory);
	if (enriched) {
		reading = enriched;
		source = "grok";
	}
	await publishEvent("nerve.consult", data.organId ?? "ai", null, {
		source,
		q: data.query.slice(0, 80)
	});
	const inserted = await sql.query(`insert into ai_pulses (kind, query, reading, card_ids, organ_id, source)
       values ($1,$2,$3,$4::jsonb,$5,$6)
       returning id`, [
		"consult",
		data.query,
		reading,
		JSON.stringify(hits.map((h) => h.id)),
		data.organId,
		source
	]);
	await sql.query("update organism_state set last_pulse_at = now() where id = 1", []);
	const snapshot = await readOrganismSnapshot();
	return {
		ok: true,
		source,
		reading,
		cardIds: hits.map((h) => h.id),
		pulseId: inserted[0]?.id ?? 0,
		pulses: snapshot.pulses,
		events: snapshot.events
	};
});
//#endregion
export { bootOrganism_createServerFn_handler, consultLibrary_createServerFn_handler, getOrganism_createServerFn_handler, publishSpineEvent_createServerFn_handler };
