import { o as __toESM } from "../_runtime.mjs";
import { n as formatRupee, t as formatKg } from "./money-C1ax4Fwq.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useBooks, c as useVillageBooks, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cells-CzXR2gpl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CellsBoard() {
	const books = useVillageBooks();
	const cells = books?.cells ?? [];
	const fpo = books?.fpo;
	const busy = useBooks((s) => s.busy);
	const error = useBooks((s) => s.error);
	const enroll = useBooks((s) => s.enroll);
	const [name, setName] = (0, import_react.useState)("");
	const [household, setHousehold] = (0, import_react.useState)("");
	const [acres, setAcres] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
					children: "Habitat"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: "Farmer cells"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: [
						"Not a role list. Each row is a life in ",
						fpo?.village ?? "the village",
						" — household, acres, remaining mass, farmgate."
					]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: error
				}) : null,
				cells.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-muted",
					children: "No cells on the books yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-6 divide-y divide-border",
					children: cells.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "grid gap-2 py-4 sm:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.55fr))] sm:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										c.household,
										" · ",
										(c.acresCenti / 100).toFixed(1),
										" acres"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted",
									children: c.notes
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [c.lotCount, " lots"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 font-mono text-[11px] text-muted",
								children: [formatKg(c.remainingGrams), " left"]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums",
								children: formatKg(c.kgOnBooks)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm tabular-nums text-live",
								children: formatRupee(c.rupeeCreditPaise)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[11px] text-gap",
								children: [formatRupee(c.rupeeDebitPaise), " cost"]
							})] })
						]
					}, c.id))
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "rounded-2xl border border-border bg-surface p-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Enroll a cell"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "A household enters the FPO as a life, not a login."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						enroll({
							name,
							household,
							acres,
							notes
						}).then((ok) => {
							if (ok) {
								setName("");
								setHousehold("");
								setAcres("");
								setNotes("");
							}
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1.5",
								value: name,
								onChange: (e) => setName(e.target.value),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Household"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1.5",
								value: household,
								onChange: (e) => setHousehold(e.target.value),
								placeholder: "House · persons",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Acres"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1.5",
								inputMode: "decimal",
								value: acres,
								onChange: (e) => setAcres(e.target.value),
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Notes"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-1.5",
								value: notes,
								onChange: (e) => setNotes(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							className: "w-full",
							children: "Enroll cell"
						})
					]
				})
			]
		})]
	});
}
function CellsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CellsBoard, {})
	}) });
}
//#endregion
export { CellsPage as component };
