import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as ArrowRight } from "../_libs/lucide-react.mjs";
import { i as cn, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { a as bridgeStatusVariant, d as latticeStats, l as filterBridges, n as CONCEPT_BY_ID } from "./lattice-BG4wUAaL.mjs";
import { t as useLattice } from "./store-phAHycXe.mjs";
import { t as Filters } from "./filters-BR-dqdwV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ligaments-BkGJUg7k.js
var import_jsx_runtime = require_jsx_runtime();
function LigamentCatalog() {
	const statusFilter = useLattice((s) => s.statusFilter);
	const kindFilter = useLattice((s) => s.kindFilter);
	const query = useLattice((s) => s.query);
	const selectedBridgeId = useLattice((s) => s.selectedBridgeId);
	const selectBridge = useLattice((s) => s.selectBridge);
	const selectConcept = useLattice((s) => s.selectConcept);
	const proposed = useLattice((s) => s.proposed);
	const toggleProposed = useLattice((s) => s.toggleProposed);
	const rows = filterBridges({
		status: statusFilter,
		kind: kindFilter,
		query
	});
	const selected = rows.find((b) => b.id === selectedBridgeId) ?? rows[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "space-y-2",
			children: [rows.map((b) => {
				const from = CONCEPT_BY_ID[b.from];
				const to = CONCEPT_BY_ID[b.to];
				const active = selected?.id === b.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						selectBridge(b.id);
						selectConcept(b.from);
					},
					className: cn("flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-150", active ? "border-foreground bg-surface" : "border-border hover:bg-surface"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: bridgeStatusVariant(b.status),
										children: b.status
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: b.kind }),
									proposed.includes(b.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "solid",
										children: "proposed"
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 font-display text-lg leading-snug",
								children: b.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 flex flex-wrap items-center gap-1 text-xs text-muted",
								children: [
									from?.name,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" }),
									to?.name
								]
							})
						]
					})
				}) }, b.id);
			}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-xl border border-border px-4 py-8 text-center text-sm text-muted",
				children: "No ligaments match those filters."
			}) : null]
		}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "h-fit rounded-2xl border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: bridgeStatusVariant(selected.status),
						children: selected.status
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: selected.kind })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-2xl font-medium tracking-tight",
					children: selected.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						CONCEPT_BY_ID[selected.from]?.name,
						" → ",
						CONCEPT_BY_ID[selected.to]?.name
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-mono text-xs leading-relaxed text-partial",
					children: selected.signal
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Today",
					body: selected.today
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Intended contract",
					body: selected.contract
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
					className: "mt-4 border-l-2 border-border pl-4 text-sm italic leading-relaxed",
					children: selected.thought
				}),
				selected.status !== "living" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6 w-full",
					variant: proposed.includes(selected.id) ? "default" : "outline",
					onClick: () => toggleProposed(selected.id),
					children: proposed.includes(selected.id) ? "Proposed ligament saved" : "Propose this ligament"
				}) : null
			]
		}) : null]
	});
}
function Section({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-sm leading-relaxed",
			children: body
		})]
	});
}
function LigamentsPage() {
	const stats = latticeStats();
	const proposed = useLattice((s) => s.proposed);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 py-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 max-w-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium tracking-tight",
					children: "Ligament ledger"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: [
						stats.technical,
						" technical contracts and ",
						stats.thoughtful,
						" thoughtful links drawn from consolidated/final. ",
						stats.missing,
						" are missing,",
						" ",
						stats.partial,
						" are only foreign keys or adjacent files. ",
						stats.living,
						" ",
						"are living. Propose the ones that should be bound first.",
						proposed.length ? ` ${proposed.length} proposed on this device.` : ""
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filters, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LigamentCatalog, {})
			})
		]
	}) });
}
//#endregion
export { LigamentsPage as component };
