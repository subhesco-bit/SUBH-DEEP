import { o as __toESM } from "../_runtime.mjs";
import { i as paiseFromKgPrice, n as formatRupee, t as formatKg } from "./money-C1ax4Fwq.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useBooks, c as useVillageBooks, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trade-C6OEjhrq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TradeBoard() {
	const books = useVillageBooks();
	const orders = books?.orders ?? [];
	const payouts = books?.payouts ?? [];
	const poolable = books?.poolable ?? [];
	const busy = useBooks((s) => s.busy);
	const error = useBooks((s) => s.error);
	const settle = useBooks((s) => s.settle);
	const settlePool = useBooks((s) => s.settlePool);
	const pool = useBooks((s) => s.pool);
	const [refs, setRefs] = (0, import_react.useState)({});
	const [hours, setHours] = (0, import_react.useState)({});
	const [commodity, setCommodity] = (0, import_react.useState)(poolable[0]?.commodity ?? "black rice");
	const [buyer, setBuyer] = (0, import_react.useState)("Guwahati GI desk");
	const [kg, setKg] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("185");
	const [freight, setFreight] = (0, import_react.useState)("4");
	const openPools = /* @__PURE__ */ new Map();
	for (const o of orders) {
		if (o.status !== "open" || !o.poolId) continue;
		const prev = openPools.get(o.poolId);
		const paise = paiseFromKgPrice(o.qtyGrams, o.pricePaisePerKg);
		if (prev) {
			prev.qty += o.qtyGrams;
			prev.paise += paise;
		} else openPools.set(o.poolId, {
			qty: o.qtyGrams,
			paise,
			buyer: o.buyer
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
						children: "Vein"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: "Offtake and settlement"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: "Price is declared. paymentRef is required to mark paid. Hours-to-pay land on the cell with the rupee. A pooled offtake splits farmgate qty-weighted after freight."
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-destructive",
						children: error
					}) : null,
					orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-sm text-muted",
						children: "No offtake yet. Sell a lot or post a collective pool."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-6 divide-y divide-border",
						children: orders.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-medium",
										children: [
											o.variety,
											" → ",
											o.buyer
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm text-muted",
										children: [
											o.cellName,
											" · ",
											formatKg(o.qtyGrams),
											" @ ",
											formatRupee(o.pricePaisePerKg),
											"/kg",
											o.poolId ? " · pool" : ""
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 font-mono text-[11px] text-partial",
										children: [
											formatRupee(paiseFromKgPrice(o.qtyGrams, o.pricePaisePerKg)),
											o.hoursToPay != null ? ` · ${o.hoursToPay}h to pay` : "",
											o.paymentRef ? ` · ${o.paymentRef}` : ""
										]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: o.status === "settled" ? "live" : "gap",
									children: o.status
								})]
							}), o.status === "open" && !o.poolId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 flex flex-wrap gap-2",
								onSubmit: (e) => {
									e.preventDefault();
									settle(o.id, refs[o.id] || "", hours[o.id] || "24");
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-11 max-w-56",
										value: refs[o.id] ?? "",
										onChange: (e) => setRefs((s) => ({
											...s,
											[o.id]: e.target.value
										})),
										placeholder: "paymentRef",
										"aria-label": "Payment reference"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-11 w-20",
										value: hours[o.id] ?? "24",
										onChange: (e) => setHours((s) => ({
											...s,
											[o.id]: e.target.value
										})),
										"aria-label": "Hours to pay"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										disabled: busy,
										children: "Mark paid"
									})
								]
							}) : null]
						}, o.id))
					})
				]
			}),
			openPools.size > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Open pools"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "One paymentRef settles every line. Split stays qty-weighted."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 divide-y divide-border",
						children: [...openPools.entries()].map(([poolId, row]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap items-center justify-between gap-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: row.buyer
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-mono text-[11px] text-muted",
									children: [
										poolId,
										" · ",
										formatKg(row.qty),
										" · ",
										formatRupee(row.paise)
									]
								})] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-3 flex flex-wrap gap-2",
								onSubmit: (e) => {
									e.preventDefault();
									settlePool(poolId, refs[poolId] || "", hours[poolId] || "24");
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-11 max-w-56",
										value: refs[poolId] ?? "",
										onChange: (e) => setRefs((s) => ({
											...s,
											[poolId]: e.target.value
										})),
										placeholder: "paymentRef",
										"aria-label": "Pool payment reference"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-11 w-20",
										value: hours[poolId] ?? "24",
										onChange: (e) => setHours((s) => ({
											...s,
											[poolId]: e.target.value
										})),
										"aria-label": "Hours to pay"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										disabled: busy,
										children: "Settle pool"
									})
								]
							})]
						}, poolId))
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Collective offtake"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Draw remaining godown stock FIFO. Farmgate after freight splits by kilograms."
					}),
					poolable.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted",
						children: "No remaining warehouse mass to pool."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 grid gap-3 sm:grid-cols-2",
						onSubmit: (e) => {
							e.preventDefault();
							pool({
								commodity,
								buyer,
								kg,
								pricePerKg: price,
								freightPerKg: freight
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] uppercase tracking-[0.14em] text-muted",
									children: "Commodity in godown"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "mt-1.5 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
									value: commodity,
									onChange: (e) => setCommodity(e.target.value),
									"aria-label": "Commodity",
									children: poolable.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: p.commodity,
										children: [
											p.commodity,
											" · ",
											formatKg(p.remainingGrams),
											" · ",
											p.cellCount,
											" cells"
										]
									}, p.commodity))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] uppercase tracking-[0.14em] text-muted",
									children: "Buyer"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-1.5",
									value: buyer,
									onChange: (e) => setBuyer(e.target.value)
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
									children: "₹ / kg"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-1.5",
									inputMode: "decimal",
									value: price,
									onChange: (e) => setPrice(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] uppercase tracking-[0.14em] text-muted",
									children: "Freight ₹ / kg"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									className: "mt-1.5",
									inputMode: "decimal",
									value: freight,
									onChange: (e) => setFreight(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: busy,
									children: "Post pool"
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
						children: "FPO payouts"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: "Qty-weighted split of declared farmgate after freight."
					}),
					payouts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "No farmgate posted yet."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border",
						children: payouts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-center justify-between gap-2 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: p.cellName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-[11px] text-muted",
								children: [
									p.orderId,
									" · ",
									formatKg(p.qtyGrams),
									p.paymentRef ? ` · ${p.paymentRef}` : ""
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-sm tabular-nums",
									children: formatRupee(p.amountPaise)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: p.status === "paid" ? "live" : "gap",
									children: p.status
								})]
							})]
						}, p.id))
					})
				]
			})
		]
	});
}
function TradePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeBoard, {})
	}) });
}
//#endregion
export { TradePage as component };
