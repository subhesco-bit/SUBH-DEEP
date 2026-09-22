import { o as __toESM } from "../_runtime.mjs";
import { r as kgFromGrams, t as formatKg } from "./money-C1ax4Fwq.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useBooks, c as useVillageBooks, n as Button } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lot-actions-J4qxJk7S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HarvestForm() {
	const cells = useVillageBooks()?.cells ?? [];
	const busy = useBooks((s) => s.busy);
	const harvest = useBooks((s) => s.harvest);
	const [cellId, setCellId] = (0, import_react.useState)(cells[0]?.id ?? "c-ronghang");
	const [variety, setVariety] = (0, import_react.useState)("Chakhao Poireiton");
	const [commodity, setCommodity] = (0, import_react.useState)("black rice");
	const [kg, setKg] = (0, import_react.useState)("840");
	const [moisture, setMoisture] = (0, import_react.useState)("13.1");
	const [gi, setGi] = (0, import_react.useState)(true);
	const selected = cells.some((c) => c.id === cellId) ? cellId : cells[0]?.id ?? "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-3 sm:grid-cols-2",
		onSubmit: (e) => {
			e.preventDefault();
			harvest({
				cellId: selected,
				variety,
				commodity,
				kg,
				moisture,
				gi
			});
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] uppercase tracking-[0.14em] text-muted",
					children: "Farmer cell"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					className: "mt-1.5 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
					value: selected,
					onChange: (e) => setCellId(e.target.value),
					"aria-label": "Farmer cell",
					children: cells.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: c.id,
						children: c.name
					}, c.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] uppercase tracking-[0.14em] text-muted",
					children: "Variety"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1.5",
					value: variety,
					onChange: (e) => setVariety(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] uppercase tracking-[0.14em] text-muted",
					children: "Commodity"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1.5",
					value: commodity,
					onChange: (e) => setCommodity(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] uppercase tracking-[0.14em] text-muted",
					children: "Declared kg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1.5",
					inputMode: "decimal",
					value: kg,
					onChange: (e) => setKg(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] uppercase tracking-[0.14em] text-muted",
					children: "Moisture %"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1.5",
					inputMode: "decimal",
					value: moisture,
					onChange: (e) => setMoisture(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex h-11 items-center gap-2 self-end text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: gi,
					onChange: (e) => setGi(e.target.checked),
					className: "size-4 accent-live"
				}), "GI marker on mint"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy || !selected,
					className: "w-full sm:w-auto",
					children: busy ? "Minting lot" : "Mint living lot"
				})
			})
		]
	});
}
function LotActions({ lot, compact }) {
	const busy = useBooks((s) => s.busy);
	const intake = useBooks((s) => s.intake);
	const sell = useBooks((s) => s.sell);
	const settle = useBooks((s) => s.settle);
	const open = useVillageBooks()?.orders.find((o) => o.lotId === lot.id && o.status === "open");
	const remainingKg = kgFromGrams(lot.remainingGrams);
	const [selling, setSelling] = (0, import_react.useState)(false);
	const [buyer, setBuyer] = (0, import_react.useState)("Diphu mill offtake");
	const [kg, setKg] = (0, import_react.useState)(String(remainingKg || ""));
	const [price, setPrice] = (0, import_react.useState)("185");
	const [freight, setFreight] = (0, import_react.useState)("4");
	const [ref, setRef] = (0, import_react.useState)("UPI-KA-");
	const [hours, setHours] = (0, import_react.useState)("24");
	if (lot.status === "settled") return null;
	const sellForm = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-wrap items-end gap-2",
		onSubmit: (e) => {
			e.preventDefault();
			sell({
				lotId: lot.id,
				buyer,
				kg,
				pricePerKg: price,
				freightPerKg: freight
			}).then((ok) => {
				if (ok) setSelling(false);
			});
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] uppercase tracking-[0.12em] text-muted",
					children: "Buyer"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1 h-9 w-40",
					value: buyer,
					onChange: (e) => setBuyer(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[10px] uppercase tracking-[0.12em] text-muted",
					children: ["kg of ", formatKg(lot.remainingGrams)]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1 h-9 w-24",
					value: kg,
					onChange: (e) => setKg(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] uppercase tracking-[0.12em] text-muted",
					children: "₹ / kg declared"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1 h-9 w-24",
					value: price,
					onChange: (e) => setPrice(e.target.value)
				})]
			}),
			compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] uppercase tracking-[0.12em] text-muted",
					children: "Freight ₹ / kg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1 h-9 w-20",
					value: freight,
					onChange: (e) => setFreight(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				type: "submit",
				disabled: busy,
				children: "Post offtake"
			})
		]
	});
	if (open) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex flex-wrap items-center gap-2",
		onSubmit: (e) => {
			e.preventDefault();
			settle(open.id, ref, hours);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "h-9 w-36",
				value: ref,
				onChange: (e) => setRef(e.target.value),
				"aria-label": "Payment reference",
				placeholder: "paymentRef"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				className: "h-9 w-16",
				value: hours,
				onChange: (e) => setHours(e.target.value),
				"aria-label": "Hours to pay"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				type: "submit",
				disabled: busy || !ref.trim(),
				children: "Settle"
			})
		]
	});
	if (lot.status === "pledged") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-[11px] text-partial",
		children: "Lien holds sale"
	});
	if (lot.status === "minted") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "outline",
			disabled: busy,
			onClick: () => void intake(lot.id),
			children: "Intake"
		}), compact && !selling ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "ghost",
			onClick: () => setSelling(true),
			children: "Farmgate"
		}) : sellForm]
	});
	if (!selling && compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		size: "sm",
		variant: "outline",
		onClick: () => setSelling(true),
		children: "Sell"
	});
	return sellForm;
}
//#endregion
export { LotActions as n, HarvestForm as t };
