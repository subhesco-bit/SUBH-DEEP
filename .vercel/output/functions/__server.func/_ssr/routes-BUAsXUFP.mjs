import { i as paiseFromKgPrice, n as formatRupee, t as formatKg } from "./money-C1ax4Fwq.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as useBooks, c as useVillageBooks, n as Button, o as useModuleOs, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { n as exceptions } from "./platform-D2p4dd1w.mjs";
import { n as proposeCompanion, t as CompanionPanel } from "./companion-BUs6VLPc.mjs";
import { n as LotActions, t as HarvestForm } from "./lot-actions-J4qxJk7S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BUAsXUFP.js
var import_jsx_runtime = require_jsx_runtime();
var FLOW = [
	{
		n: "01",
		label: "Mint",
		hint: "Harvest names a cell"
	},
	{
		n: "02",
		label: "Godown",
		hint: "Same lot body inwards"
	},
	{
		n: "03",
		label: "Offtake",
		hint: "Declared ₹ / kg"
	},
	{
		n: "04",
		label: "Paid",
		hint: "paymentRef required"
	},
	{
		n: "05",
		label: "Farmgate",
		hint: "Hours-to-pay on the cell"
	}
];
function BooksHome() {
	const books = useVillageBooks();
	const error = useBooks((s) => s.error);
	const kpis = books?.kpis;
	const fpo = books?.fpo;
	const copilot = useModuleOs((s) => s.snapshot?.copilot);
	const companion = books ? proposeCompanion(books, exceptions({
		journalBalanced: books.kpis.journalBalanced,
		lots: books.lots,
		receipts: books.receipts,
		orders: books.orders,
		payouts: books.payouts
	})) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
						children: ["Rural ERP · ", fpo?.village ?? "Langthasa"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: "Books of the cell"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: "Farmer is a cell. A harvest mints one lot. Warehouse takes the same body. Settlement credits the cell with a declared price — never invented ₹. Remaining mass stays on the lot. ERP is bone; the nerve may read, not write."
					}),
					fpo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-[11px] text-partial",
						children: [
							fpo.name,
							" · ",
							fpo.district,
							" · split ",
							fpo.splitRule
						]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-destructive",
						children: error
					}) : null,
					companion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanionPanel, {
							reading: companion,
							compact: true
						})
					}) : copilot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 rounded-xl border border-live/30 bg-background px-4 py-3 text-sm text-live",
						children: ["Copilot · ", copilot]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5",
						children: FLOW.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-border bg-background px-3 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[10px] text-muted",
									children: step.n
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm font-medium",
									children: step.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-[11px] text-muted",
									children: step.hint
								})
							]
						}, step.n))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Cells",
						value: String(kpis?.cells ?? "—")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Lots on books",
						value: String(kpis?.lots ?? "—")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "In godown",
						value: kpis ? formatKg(kpis.kgInWarehouse) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Open offtake",
						value: kpis ? formatRupee(kpis.openPaise) : "—",
						hint: kpis?.avgHoursToPay != null ? `${kpis.avgHoursToPay}h to pay` : "no settlement yet"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Record harvest"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Publishes lot.mint and harvest.completed on the spine. Mass is declared."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HarvestForm, {})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Rupee path"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Settled farmgate vs open offtake. Remaining mass is still a body."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "mt-4 space-y-2 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Farmgate paid"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono tabular-nums text-live",
										children: kpis ? formatRupee(kpis.farmgatePaise) : "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Gross settled"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono tabular-nums text-live",
										children: kpis ? formatRupee(kpis.settledPaise) : "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Open"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono tabular-nums text-gap",
										children: kpis ? formatRupee(kpis.openPaise) : "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Remaining mass"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono tabular-nums",
										children: kpis ? formatKg(kpis.kgRemaining) : "—"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted",
										children: "Journal"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: kpis?.journalBalanced ? "text-live" : "text-gap",
										children: kpis ? kpis.journalBalanced ? "balanced" : "gap" : "—"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs leading-relaxed text-muted",
							children: kpis?.integrityNote
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/ledger",
										children: "Ledger"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/trade",
										children: "Trade"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									size: "sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/platform",
										children: "Platform"
									})
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-end justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: "Living lots"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/lots",
							children: "All lots"
						})
					})]
				}), (books?.lots ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: "No lots on the books. Mint a harvest from a farmer cell."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-border",
					children: (books?.lots ?? []).slice(0, 6).map((lot) => {
						const open = books?.orders.find((o) => o.lotId === lot.id && o.status === "open");
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [
										lot.variety,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-[11px] text-muted",
											children: [formatKg(lot.remainingGrams), lot.remainingGrams !== lot.grams ? ` of ${formatKg(lot.grams)}` : ""]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [
										lot.cellName,
										" · ",
										lot.commodity,
										lot.giMarker ? ` · ${lot.giMarker}` : ""
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: lotStatus(lot.status),
										children: lot.status.replace("_", " ")
									}),
									open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-[11px] text-partial",
										children: [formatRupee(paiseFromKgPrice(open.qtyGrams, open.pricePaisePerKg)), " open"]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LotActions, {
										lot,
										compact: true
									})
								]
							})]
						}, lot.id);
					})
				})]
			})
		]
	});
}
function Kpi({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[10px] uppercase tracking-[0.14em] text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 font-mono text-lg tabular-nums",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[11px] text-muted",
				children: hint
			}) : null
		]
	});
}
function lotStatus(status) {
	if (status === "settled") return "live";
	if (status === "minted") return "gap";
	if (status === "pledged") return "partial";
	return "partial";
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BooksHome, {})
	}) });
}
//#endregion
export { Home as component };
