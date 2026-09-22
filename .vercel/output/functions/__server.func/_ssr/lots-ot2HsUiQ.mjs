import { t as formatKg } from "./money-C1ax4Fwq.mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useBooks, c as useVillageBooks, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { n as LotActions, t as HarvestForm } from "./lot-actions-J4qxJk7S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lots-ot2HsUiQ.js
var import_jsx_runtime = require_jsx_runtime();
function LotsBoard() {
	const lots = useVillageBooks()?.lots ?? [];
	const error = useBooks((s) => s.error);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
					children: "Genome of produce"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: "Living lots"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: "One body from field to plate. Moisture, GI, warehouse remaining, and offtake are tissues of the same id. Selling part of a sack does not kill the rest."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: error
				}) : null,
				lots.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-muted",
					children: "No lots yet. Mint from the form."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 divide-y divide-border",
					children: lots.map((lot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: lot.variety
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[11px] text-muted",
									children: lot.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted",
									children: [
										lot.cellName,
										" · ",
										formatKg(lot.remainingGrams),
										lot.remainingGrams !== lot.grams ? ` of ${formatKg(lot.grams)}` : "",
										" · ",
										lot.commodity,
										lot.moistureBp != null ? ` · ${(lot.moistureBp / 100).toFixed(1)}% moisture` : ""
									]
								})
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: lot.status === "settled" ? "live" : lot.status === "minted" ? "gap" : "partial",
								children: lot.status.replace("_", " ")
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LotActions, { lot })
						})]
					}, lot.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "rounded-2xl border border-border bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Mint"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Declared mass. The spine hears harvest.completed."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HarvestForm, {})
				})
			]
		})]
	});
}
function LotsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LotsBoard, {})
	}) });
}
//#endregion
export { LotsPage as component };
