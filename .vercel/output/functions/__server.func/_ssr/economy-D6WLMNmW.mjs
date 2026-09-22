import { o as __toESM } from "../_runtime.mjs";
import { t as BRIDGES } from "./bridges-B9ONDsOo.mjs";
import { t as CONCEPTS } from "./concepts-b3GZTvML.mjs";
import { i as queryLibraryKnowledge, r as libraryCatalog } from "./match-O6S8HVhu.mjs";
import { t as CANONICAL_QUERIES } from "./queries-BoaEYzsX.mjs";
import { t as AI_SYSTEMS } from "./catalog-BIfdppeO.mjs";
import { n as WORKFLOWS, t as MODULE_RUNTIME } from "./registry-CRCHqiWy.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as DECISION_LAWS } from "./charter-CJpIsqVj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/economy-D6WLMNmW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Token economy. Library answers. LLM spend is 0. Savings are measured. */
var cache = /* @__PURE__ */ new Map();
function estimateTokens(text) {
	if (!text) return 0;
	return Math.ceil(text.length / 4);
}
function naiveDump() {
	return JSON.stringify({
		systems: AI_SYSTEMS,
		concepts: CONCEPTS,
		bridges: BRIDGES,
		workflows: WORKFLOWS,
		runtime: MODULE_RUNTIME,
		catalog: libraryCatalog().map((c) => ({
			id: c.id,
			title: c.title,
			body: c.body,
			organs: c.organs,
			source: c.source
		}))
	});
}
function packLibrary(query) {
	const body = queryLibraryKnowledge(query, { limit: 3 }).map((h) => `${h.title} · ${(h.body ?? "").slice(0, 160)}`).join("\n");
	return {
		id: "library",
		label: "Library hippocampus",
		tokens: estimateTokens(body),
		body
	};
}
function packBooks(books) {
	if (!books) {
		const body = "No books in envelope. Remaining mass stays on the lot row.";
		return {
			id: "books",
			label: "Books remaining",
			tokens: estimateTokens(body),
			body
		};
	}
	const remaining = books.lots.reduce((n, l) => n + l.remainingGrams, 0);
	const open = books.orders.filter((o) => o.status === "open").length;
	const body = `cells ${books.cells.length} · remaining ${remaining}g · open offtake ${open} · journal ${books.journal.length}`;
	return {
		id: "books",
		label: "Books remaining",
		tokens: estimateTokens(body),
		body
	};
}
function packCharter() {
	const body = DECISION_LAWS.map((l) => `${l.id} ${l.organ}: ${l.law}`).join("\n");
	return {
		id: "charter",
		label: "Decision laws",
		tokens: estimateTokens(body),
		body
	};
}
function packSystems() {
	const body = `${MODULE_RUNTIME.filter((m) => m.plug === "living").length}/${MODULE_RUNTIME.length} living plugs. GitHub WIRED skeletons omitted.`;
	return {
		id: "systems",
		label: "Systems rack",
		tokens: estimateTokens(body),
		body
	};
}
function compactEnvelope(query, books) {
	const plugins = [
		packLibrary(query),
		packBooks(books),
		packCharter(),
		packSystems()
	];
	return {
		text: `QUERY ${query}\n${plugins.map((p) => `# ${p.id}\n${p.body}`).join("\n")}\nLLM-GATE library first. Spend 0 paise.`,
		plugins
	};
}
function consultEconomy(query, books) {
	const key = query.trim().toLowerCase();
	const hit = cache.get(key);
	const naive = estimateTokens(naiveDump());
	if (hit) return {
		...hit,
		cacheHit: true,
		naiveTokens: naive
	};
	const compactTokens = estimateTokens(compactEnvelope(query, books).text);
	const receipt = {
		query,
		naiveTokens: naive,
		compactTokens,
		savedPct: naive === 0 ? 0 : Math.round((naive - compactTokens) / naive * 1e3) / 10,
		cacheHit: false,
		llmCalls: 0,
		hits: queryLibraryKnowledge(query, { limit: 3 }).map((h) => h.title)
	};
	cache.set(key, receipt);
	return receipt;
}
function resetEconomyCache() {
	cache.clear();
}
function composeEconomy(books) {
	resetEconomyCache();
	const naive = estimateTokens(naiveDump());
	const plugins = [
		...compactEnvelope("lot remaining harvest", books).plugins,
		{
			id: "batch",
			label: "Canonical batch",
			tokens: 0,
			body: `${CANONICAL_QUERIES.length} reflex queries as one batch. No OpenAI. No PowerShell.`
		},
		{
			id: "llm-gate",
			label: "LLM gate",
			tokens: 0,
			body: "Library hit ⇒ llmCalls = 0. A model is not consulted to name remaining grams."
		},
		{
			id: "cache",
			label: "Consult cache",
			tokens: 0,
			body: "Identical query returns the packed envelope. Second pass is a cache hit."
		}
	];
	const receipts = CANONICAL_QUERIES.map((q) => consultEconomy(q.query, books));
	const cacheHits = CANONICAL_QUERIES.map((q) => consultEconomy(q.query, books)).filter((r) => r.cacheHit).length;
	const batchCompact = receipts.reduce((n, r) => n + r.compactTokens, 0);
	const batchNaive = naive * receipts.length;
	const savedPct = naive === 0 ? 0 : Math.round((naive - receipts[0].compactTokens) / naive * 1e3) / 10;
	const batchSavedPct = batchNaive === 0 ? 0 : Math.round((batchNaive - batchCompact) / batchNaive * 1e3) / 10;
	plugins[4].tokens = batchCompact;
	return {
		naiveTokens: naive,
		compactTokens: receipts[0]?.compactTokens ?? 0,
		batchNaiveTokens: batchNaive,
		batchCompactTokens: batchCompact,
		savedPct,
		batchSavedPct,
		llmCalls: 0,
		cacheHits,
		plugins,
		receipts,
		thesis: "Naive send is the whole GitHub cadaver: systems, concepts, bridges, workflows, catalog. Compact send is library hits + remaining mass + twelve laws. Batch is every reflex in one fire. OpenAI is not the nerve."
	};
}
/** GitHub health paste vs this organism. Do not treat the paste as living. */
var GITHUB_CLAIM = {
	routes: 968,
	migrationsPassing: "762/799",
	services: 210,
	erpStubbed: 46,
	coverage: "80%"
};
var ORGANISM_HEALTH = {
	fileRoutes: "books · cells · lots · warehouse · ledger · trade · platform · organism · mesh · ligaments · pulse · library · nerve · companion · modules · charter · systems · economy",
	migrations: "0002–0009 living PGLite",
	erp: "mint · intake · offtake · settle · process · statements — remaining grams, not 46 stubs",
	llm: "0 calls on reflex. Token economy measured."
};
function EconomyPanel() {
	const snap = (0, import_react.useMemo)(() => composeEconomy(), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
						children: "Token economy · library first · llmCalls 0"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: "Spend 0 paise on a dump"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: snap.thesis
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Naive dump",
								value: snap.naiveTokens.toLocaleString()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Compact envelope",
								value: snap.compactTokens.toLocaleString(),
								live: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Batch saved",
								value: `${snap.batchSavedPct}%`,
								live: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "LLM calls",
								value: snap.llmCalls,
								live: true
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [
							"Batch naive ",
							snap.batchNaiveTokens.toLocaleString(),
							" · compact ",
							snap.batchCompactTokens.toLocaleString(),
							" · cache",
							" ",
							snap.cacheHits,
							"/",
							snap.receipts.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/nerve",
									children: "Nerve reflexes"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/library",
									children: "Library"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/charter",
									children: "Charter laws"
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Plugins"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Not OpenAI tools. Compactors. Python batch uses the same 4-character token rule. PowerShell is not the nerve."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: snap.plugins.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-border bg-background p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: p.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "live",
										children: [p.tokens, " tok"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 font-mono text-[11px] text-muted",
									children: p.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-relaxed text-muted",
									children: p.body
								})
							]
						}, p.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Batch receipts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Every reflex packed. None sent to a model."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2",
						children: snap.receipts.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-border bg-background px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: r.query
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "live",
									children: [r.savedPct, "%"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-[11px] text-muted",
								children: [
									r.naiveTokens,
									" → ",
									r.compactTokens,
									" · ",
									r.hits[0] ?? "no hit",
									" · llm ",
									r.llmCalls
								]
							})]
						}, r.query))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "GitHub paste is not this body"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "968 routes, 46 stubbed ERP endpoints, 80% coverage — those are cadaver counts. This organism does not inherit them."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-background p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.14em] text-gap",
								children: "GitHub claim"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-2 space-y-1 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Routes ", GITHUB_CLAIM.routes] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Migrations ", GITHUB_CLAIM.migrationsPassing] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Services ~", GITHUB_CLAIM.services] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["ERP stubbed ", GITHUB_CLAIM.erpStubbed] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Tests ", GITHUB_CLAIM.coverage] })
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-background p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] uppercase tracking-[0.14em] text-live",
								children: "This organism"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "mt-2 space-y-1 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: ORGANISM_HEALTH.fileRoutes }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: ORGANISM_HEALTH.migrations }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: ORGANISM_HEALTH.erp }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: ORGANISM_HEALTH.llm })
								]
							})]
						})]
					})
				]
			})
		]
	});
}
function Kpi({ label, value, live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-background px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.14em] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `mt-1 font-display text-2xl ${live ? "text-live" : ""}`,
			children: value
		})]
	});
}
function EconomyPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EconomyPanel, {})
	}) });
}
//#endregion
export { EconomyPage as component };
