import { o as __toESM } from "../_runtime.mjs";
import { i as queryLibraryKnowledge, r as libraryCatalog, t as bindingCount } from "./match-O6S8HVhu.mjs";
import { n as CANONICAL_QUERY_COUNT, r as answerCanonicalQueries } from "./queries-BoaEYzsX.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn, n as Button, r as Shell, s as useOrganism, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
import { n as CONCEPT_BY_ID } from "./lattice-BG4wUAaL.mjs";
import { t as useLattice } from "./store-phAHycXe.mjs";
import { t as ScrollArea } from "./scroll-area-7lOc-SHL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-BuQi0ja0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	"all",
	"doctrine",
	"organ",
	"bridge",
	"principle",
	"contract",
	"repair"
];
function LibraryPanel() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("all");
	const [selectedId, setSelectedId] = (0, import_react.useState)("lib-memory");
	const selectConcept = useLattice((s) => s.selectConcept);
	const snapshot = useOrganism((s) => s.snapshot);
	const ready = useOrganism((s) => s.ready);
	const booting = useOrganism((s) => s.booting);
	const catalog = libraryCatalog();
	const reflexes = (0, import_react.useMemo)(() => answerCanonicalQueries(), []);
	const catalogHits = reflexes.filter((r) => !r.missing).length;
	const persisted = snapshot?.reflexesAnswered ?? 0;
	const hits = (0, import_react.useMemo)(() => queryLibraryKnowledge(query, {
		kind,
		limit: 80
	}), [query, kind]);
	const selected = hits.find((c) => c.id === selectedId) ?? libraryCatalog().find((c) => c.id === selectedId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
					children: "AI-integrated library"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: "Memory"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: "The library is the hippocampus — doctrine, organ theses, contracts, and named repairs. It is not a chatbot. On boot it indexes itself, binds cards to organs, fires every reflex query, and hands the nerve something to fire. GitHub systems stay unplugged; this catalog is the living plug."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: ready ? "live" : booting ? "partial" : "gap",
							children: ready ? "auto-op living" : booting ? "indexing" : "awaiting boot"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [catalog.length, " cards"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [snapshot?.bindings || bindingCount(), " bindings"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: catalogHits === CANONICAL_QUERY_COUNT ? "live" : "gap",
							className: "whitespace-nowrap",
							children: [
								catalogHits,
								"/",
								CANONICAL_QUERY_COUNT
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: persisted >= CANONICAL_QUERY_COUNT ? "live" : "partial",
							className: "whitespace-nowrap",
							children: [
								persisted,
								"/",
								CANONICAL_QUERY_COUNT,
								" pulsed"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/nerve",
							className: "underline decoration-border underline-offset-4 hover:text-foreground",
							children: "Nerve consults this memory"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: " · "
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/systems",
							className: "underline decoration-border underline-offset-4 hover:text-foreground",
							children: "Systems rack remains unplugged"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "Search memory — harvest, lot, Magh, rupee, agentic",
						"aria-label": "Search library memory"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-1.5",
						children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: kind === k ? "default" : "outline",
							className: "rounded-full capitalize",
							onClick: () => setKind(k),
							children: k
						}, k))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 grid gap-1 sm:grid-cols-2",
					children: reflexes.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => {
							setQuery(r.query);
							setSelectedId(r.hits[0]?.id ?? selectedId);
						},
						className: "flex w-full items-baseline gap-2 truncate text-left text-[11px] text-muted hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-mono", r.missing ? "text-gap" : "text-live"),
							children: r.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: r.title
						})]
					}) }, r.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 divide-y divide-border",
					children: hits.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedId(card.id),
						className: cn("flex w-full flex-col gap-1 px-1 py-3 text-left transition-colors duration-150", selectedId === card.id ? "text-foreground" : "text-muted hover:text-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: card.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: card.kind })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "line-clamp-2 text-sm",
							children: card.body
						})]
					}) }, card.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
			className: "flex min-h-[360px] flex-col rounded-2xl border border-border bg-surface",
			children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: selected.kind }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-3 font-display text-2xl font-medium tracking-tight",
						children: selected.title
					}),
					selected.signal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-[11px] leading-relaxed text-partial",
						children: selected.signal
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 p-5 pt-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-foreground/90",
							children: selected.body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-[11px] uppercase tracking-[0.14em] text-muted",
							children: ["Source · ", selected.source]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
							children: "Bound organs"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: selected.organs.map((id) => {
								const organ = CONCEPT_BY_ID[id];
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/organism",
									onClick: () => selectConcept(id),
									className: "inline-flex rounded-full border border-border px-2.5 py-1 text-xs hover:bg-accent",
									children: organ?.short ?? id
								}) }, id);
							})
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/nerve",
								children: "Ask the nerve to consult this"
							})
						}),
						selected.organs.includes("module") || selected.organs.includes("ai") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/systems",
								children: "Open the systems rack"
							})
						}) : null
					]
				})
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-1 items-center justify-center p-8 text-center text-sm text-muted",
				children: "Select a card. Memory only fires if it is bound."
			})
		})]
	});
}
function LibraryPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryPanel, {})
	}) });
}
//#endregion
export { LibraryPage as component };
