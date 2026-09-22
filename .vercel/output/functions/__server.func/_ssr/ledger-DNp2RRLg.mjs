import { o as __toESM } from "../_runtime.mjs";
import { n as formatRupee } from "./money-C1ax4Fwq.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useBooks, c as useVillageBooks, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
import { n as CONCEPT_BY_ID } from "./lattice-BG4wUAaL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ledger-DNp2RRLg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	"seed",
	"fodder",
	"energy",
	"labour",
	"cover"
];
function LedgerBoard() {
	const books = useVillageBooks();
	const journal = books?.journal ?? [];
	const inputs = books?.inputs ?? [];
	const cells = books?.cells ?? [];
	const kpis = books?.kpis;
	const busy = useBooks((s) => s.busy);
	const error = useBooks((s) => s.error);
	const inputCost = useBooks((s) => s.inputCost);
	const [cellId, setCellId] = (0, import_react.useState)(cells[0]?.id ?? "c-ronghang");
	const [kind, setKind] = (0, import_react.useState)("energy");
	const [qty, setQty] = (0, import_react.useState)("40");
	const [unit, setUnit] = (0, import_react.useState)("kWh");
	const [amount, setAmount] = (0, import_react.useState)("320");
	const [memo, setMemo] = (0, import_react.useState)("Drying hours, declared");
	const credit = journal.filter((j) => j.side === "credit").reduce((n, j) => n + j.amountPaise, 0);
	const debit = journal.filter((j) => j.side === "debit").reduce((n, j) => n + j.amountPaise, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
					children: "Prosperity bile"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: "Rupee ledger"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: "Every line names an organ. Cash in is debit. Farmgate is credit to the cell. Freight and energy are the other side of the same entry."
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-3 font-mono text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-live",
							children: ["Credit ", formatRupee(credit)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-gap",
							children: ["Debit ", formatRupee(debit)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: kpis?.journalBalanced ? "live" : "gap",
							children: kpis?.journalBalanced ? "balanced" : "gap"
						})
					]
				}),
				journal.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-sm text-muted",
					children: "No journal yet. Settle an offtake or post a cost."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 divide-y divide-border",
					children: journal.map((j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: j.memo
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[11px] text-muted",
								children: [
									CONCEPT_BY_ID[j.organId]?.short ?? j.organId,
									" · ",
									j.account,
									" · ",
									j.lotId ?? "cell"
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: j.side === "credit" ? "live" : "gap",
								children: j.side
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums",
								children: formatRupee(j.amountPaise)
							})
						]
					}, j.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Post input cost"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Declared only. Energy hits RECIE; cover hits insurance."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 space-y-3",
						onSubmit: (e) => {
							e.preventDefault();
							inputCost({
								cellId,
								kind,
								qty,
								unit,
								amount,
								memo
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
								value: cellId,
								onChange: (e) => setCellId(e.target.value),
								"aria-label": "Cell",
								children: cells.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
								value: kind,
								onChange: (e) => setKind(e.target.value),
								"aria-label": "Kind",
								children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k,
									children: k
								}, k))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: qty,
									onChange: (e) => setQty(e.target.value),
									"aria-label": "Qty"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: unit,
									onChange: (e) => setUnit(e.target.value),
									"aria-label": "Unit"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: amount,
								onChange: (e) => setAmount(e.target.value),
								"aria-label": "Rupees",
								placeholder: "₹ declared"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: memo,
								onChange: (e) => setMemo(e.target.value),
								"aria-label": "Memo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								className: "w-full",
								children: "Post cost"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Inputs"
				}), inputs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "No declared costs yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: inputs.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								i.cellName,
								" · ",
								i.kind
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 font-mono tabular-nums",
							children: formatRupee(i.amountPaise)
						})]
					}, i.id))
				})]
			})]
		})]
	});
}
function LedgerPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LedgerBoard, {})
	}) });
}
//#endregion
export { LedgerPage as component };
