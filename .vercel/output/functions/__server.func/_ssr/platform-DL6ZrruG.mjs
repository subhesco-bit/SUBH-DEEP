import { o as __toESM } from "../_runtime.mjs";
import { n as formatRupee, t as formatKg } from "./money-C1ax4Fwq.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
import { n as proposeCompanion, r as usePlatform, t as CompanionPanel } from "./companion-BUs6VLPc.mjs";
import { n as Route$4 } from "./router-HRG5tEOq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform-DL6ZrruG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	"drying",
	"milling",
	"cleaning",
	"grading"
];
function PlatformBoard() {
	const snapshot = usePlatform((s) => s.snapshot);
	const busy = usePlatform((s) => s.busy);
	const error = usePlatform((s) => s.error);
	const process = usePlatform((s) => s.process);
	const lots = (snapshot?.lots ?? []).filter((l) => l.remainingGrams > 0);
	const [lotId, setLotId] = (0, import_react.useState)(lots[0]?.id ?? "");
	const [kind, setKind] = (0, import_react.useState)("drying");
	const [lossKg, setLossKg] = (0, import_react.useState)("14");
	const [note, setNote] = (0, import_react.useState)("Moisture leave, declared");
	const pnl = snapshot?.pnl;
	const selected = lots.find((l) => l.id === lotId) ?? lots[0];
	const companion = snapshot ? proposeCompanion(snapshot, snapshot.exceptions) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
						children: [
							"Rural ERP platform · ",
							snapshot?.season?.name ?? "Magh",
							" · ",
							snapshot?.fpo?.village ?? "Langthasa"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: "Platform"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: "Trial balance, cell statements, documents, and harvest-to-saleable process. Specialist books stay authoritative. The platform orchestrates. AI does not write rupees."
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-destructive",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Gross offtake",
								value: pnl ? formatRupee(pnl.grossPaise) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Farmgate",
								value: pnl ? formatRupee(pnl.farmgatePaise) : "—",
								live: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Inputs",
								value: pnl ? formatRupee(pnl.inputPaise) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Net to cells",
								value: pnl ? formatRupee(pnl.netToCellsPaise) : "—",
								live: true
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [
							"Season ",
							snapshot?.season?.status ?? "open",
							" · ",
							snapshot?.blocking ?? 0,
							" blocking · ",
							snapshot?.deferred ?? 0,
							" deferred"
						]
					})
				]
			}),
			companion ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanionPanel, {
				reading: companion,
				compact: true
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Gates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: (snapshot?.exceptions ?? []).map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border bg-background p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[11px] text-muted",
									children: g.code
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: g.severity === "block" ? "gap" : g.severity === "defer" ? "partial" : "live",
									children: g.severity
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm font-medium",
								children: g.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] leading-relaxed text-muted",
								children: g.body
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: g.href,
								className: "mt-3 inline-block text-sm text-partial hover:text-foreground",
								children: "Open"
							})
						]
					}, g.code))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Trial balance"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Every account from the journal. Debit cash in, credit farmgate out."
						}),
						(snapshot?.trialBalance ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted",
							children: "No journal yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "mt-4 w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "text-left text-[11px] uppercase tracking-[0.12em] text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 font-medium",
										children: "Account"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-right font-medium",
										children: "Debit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-right font-medium",
										children: "Credit"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: snapshot?.trialBalance.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "py-2",
										children: [row.account, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-2 font-mono text-[11px] text-muted",
											children: row.organId
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 text-right font-mono tabular-nums",
										children: formatRupee(row.debitPaise)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 text-right font-mono tabular-nums",
										children: formatRupee(row.creditPaise)
									})
								]
							}, `${row.account}-${row.organId}`)) })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-2xl border border-border bg-surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Process · declared loss"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Harvest to saleable. Loss is declared. Remaining shrinks on the same lot body."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 space-y-3",
							onSubmit: (e) => {
								e.preventDefault();
								const id = lotId || selected?.id;
								if (!id) return;
								process({
									lotId: id,
									kind,
									lossKg,
									note
								});
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
									value: lotId || selected?.id || "",
									onChange: (e) => setLotId(e.target.value),
									"aria-label": "Lot to process",
									children: lots.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
										value: l.id,
										children: [
											l.cellName,
											" · ",
											l.variety,
											" · ",
											formatKg(l.remainingGrams),
											" left"
										]
									}, l.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									className: "flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
									value: kind,
									onChange: (e) => setKind(e.target.value),
									"aria-label": "Process kind",
									children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: k,
										children: k
									}, k))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: lossKg,
									onChange: (e) => setLossKg(e.target.value),
									"aria-label": "Declared loss kg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: note,
									onChange: (e) => setNote(e.target.value),
									"aria-label": "Process note"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: busy || lots.length === 0,
									className: "w-full",
									children: "Post declared process"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Cell statements"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3 sm:grid-cols-2",
					children: (snapshot?.statements ?? []).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border bg-background p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: s.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[11px] text-muted",
								children: s.household
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-3 space-y-1 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Harvest",
										value: formatKg(s.harvestGrams)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Remaining",
										value: formatKg(s.remainingGrams)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Farmgate",
										value: formatRupee(s.farmgatePaise),
										live: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Inputs",
										value: formatRupee(s.inputPaise)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										label: "Net",
										value: formatRupee(s.netPaise),
										live: s.netPaise >= 0
									})
								]
							})
						]
					}, s.cellId))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Documents"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: (snapshot?.documents ?? []).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border bg-background p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: d.kind }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm font-medium",
								children: d.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[13px] leading-relaxed text-muted",
								children: d.body
							})
						]
					}, d.id))
				})]
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
			className: cn("mt-1 font-display text-2xl", live && "text-live"),
			children: value
		})]
	});
}
function Row({ label, value, live }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("font-mono tabular-nums", live && "text-live"),
			children: value
		})]
	});
}
function PlatformPage() {
	const data = Route$4.useLoaderData();
	const hydrate = usePlatform((s) => s.hydrate);
	const refresh = usePlatform((s) => s.refresh);
	(0, import_react.useEffect)(() => {
		if (data && data.ok) hydrate(data);
		else refresh();
	}, [
		data,
		hydrate,
		refresh
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlatformBoard, {})
	}) });
}
//#endregion
export { PlatformPage as component };
