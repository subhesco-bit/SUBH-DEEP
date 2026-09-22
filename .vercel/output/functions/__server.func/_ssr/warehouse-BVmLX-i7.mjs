import { o as __toESM } from "../_runtime.mjs";
import { t as formatKg } from "./money-C1ax4Fwq.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useBooks, c as useVillageBooks, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/warehouse-BVmLX-i7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WarehouseBoard() {
	const books = useVillageBooks();
	const receipts = books?.receipts ?? [];
	const lots = books?.lots ?? [];
	const busy = useBooks((s) => s.busy);
	const error = useBooks((s) => s.error);
	const pledge = useBooks((s) => s.pledge);
	const unpledge = useBooks((s) => s.unpledge);
	const intake = useBooks((s) => s.intake);
	const [lender, setLender] = (0, import_react.useState)("Karbi Anglong PACS");
	const waiting = lots.filter((l) => l.status === "minted" && l.remainingGrams > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
					children: "Reserve organ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: "Warehouse receipts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: "Inward, pledge, release. A pledged receipt cannot sell. Partial offtake leaves remaining stock on the same receipt."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: error
				}) : null,
				receipts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-muted",
					children: "No receipts. Intake a minted lot."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 divide-y divide-border",
					children: receipts.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								r.variety,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[11px] text-muted",
									children: [formatKg(r.remainingGrams), r.remainingGrams !== r.qtyGrams ? ` of ${formatKg(r.qtyGrams)}` : ""]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								r.cellName,
								" · ",
								r.facility,
								" · ",
								r.id,
								r.lender ? ` · lien ${r.lender}` : ""
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: r.status === "released" ? "live" : r.status === "pledged" ? "gap" : "partial",
									children: r.status
								}),
								r.status === "inward" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "flex flex-wrap gap-2",
									onSubmit: (e) => {
										e.preventDefault();
										pledge(r.id, lender);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-9 w-44",
										value: lender,
										onChange: (e) => setLender(e.target.value),
										"aria-label": "Lender"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										type: "submit",
										variant: "outline",
										disabled: busy,
										children: "Pledge"
									})]
								}) : null,
								r.status === "pledged" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "outline",
									disabled: busy,
									onClick: () => void unpledge(r.id),
									children: "Release lien"
								}) : null
							]
						})]
					}, r.id))
				})
			]
		}), waiting.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-border bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Waiting at the gate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Minted lots with remaining mass, not yet inward."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 divide-y divide-border",
					children: waiting.map((lot) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-wrap items-center justify-between gap-2 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								lot.variety,
								" · ",
								lot.cellName
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[11px] text-muted",
							children: formatKg(lot.remainingGrams)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							disabled: busy,
							onClick: () => void intake(lot.id),
							children: "Intake"
						})]
					}, lot.id))
				})
			]
		}) : null]
	});
}
function WarehousePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WarehouseBoard, {})
	}) });
}
//#endregion
export { WarehousePage as component };
