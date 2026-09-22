import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
import { n as composeCharter } from "./charter-CJpIsqVj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/charter-zCieNt6y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var VIEWS = [
	"laws",
	"concepts",
	"modules",
	"matrix",
	"coordination"
];
function variant(status) {
	if (status === "living") return "live";
	if (status === "partial") return "partial";
	return "gap";
}
function CharterBoard() {
	const charter = (0, import_react.useMemo)(() => composeCharter(), []);
	const [view, setView] = (0, import_react.useState)("modules");
	const [query, setQuery] = (0, import_react.useState)("");
	const [family, setFamily] = (0, import_react.useState)("all");
	const [openId, setOpenId] = (0, import_react.useState)("agentic");
	const q = query.trim().toLowerCase();
	const modules = charter.modules.filter((m) => {
		if (family !== "all" && m.family !== family) return false;
		if (!q) return true;
		return `${m.id} ${m.name} ${m.enterprise} ${m.organs.join(" ")} ${m.workflows.join(" ")}`.toLowerCase().includes(q);
	});
	const concepts = charter.concepts.filter((c) => {
		if (!q) return true;
		return `${c.id} ${c.name} ${c.thesis} ${c.silo} ${c.modules.join(" ")}`.toLowerCase().includes(q);
	});
	const families = ["all", ...new Set(charter.modules.map((m) => m.family))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
						children: "Charter · 18 criteria · 12 laws · no invented ₹"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: "Nothing missed — named"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: "Every lattice concept and every named AI module is scored against AI, ERP algorithm, communication, workflow, operational flow, process, tracking, decision criteria and boundary, how a decision is made, spoken, coordinated, and implemented. GitHub remains WIRED skeletons. This organism runs the bus. Completeness is a count of living checks, not a badge."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Living checks",
								value: charter.moduleLivingChecks,
								live: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Partial checks",
								value: charter.modulePartialChecks
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Missing checks",
								value: charter.moduleMissingChecks,
								gap: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
								label: "Lattice integrity",
								value: `${charter.lattice.integrity}%`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [
							charter.modules.length,
							" modules · ",
							charter.concepts.length,
							" concepts · ",
							charter.isolated,
							" isolated ·",
							" ",
							charter.bridgesMissing,
							" missing bridges · ",
							charter.unpluggedOrgans.length,
							" organs with no module"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: [
							VIEWS.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: view === v ? "default" : "outline",
								className: "whitespace-nowrap capitalize",
								onClick: () => setView(v),
								children: v
							}, v)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/modules",
									children: "Modules OS"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/companion",
									children: "Companion"
								})
							})
						]
					}),
					view === "modules" || view === "concepts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-col gap-3 sm:flex-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: view === "modules" ? "Filter modules" : "Filter concepts",
							"aria-label": "Filter charter"
						}), view === "modules" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "flex h-11 rounded-md border border-border bg-background px-3 text-sm",
							value: family,
							onChange: (e) => setFamily(e.target.value),
							"aria-label": "Family",
							children: families.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: f,
								children: f
							}, f))
						}) : null]
					}) : null
				]
			}),
			view === "laws" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Laws, { charter }) : null,
			view === "concepts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Concepts, { list: concepts }) : null,
			view === "modules" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modules, {
				list: modules,
				openId,
				onOpen: setOpenId
			}) : null,
			view === "matrix" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Matrix, {
				charter,
				modules
			}) : null,
			view === "coordination" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coordination, { charter }) : null
		]
	});
}
function Kpi({ label, value, live, gap }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-background px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] uppercase tracking-[0.14em] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-1 font-display text-2xl", live && "text-live", gap && "text-gap"),
			children: value
		})]
	});
}
function Laws({ charter }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: "Decision laws"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Criteria of decision. Boundaries of decision. A module that cannot name a law is decoration."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: charter.laws.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-background p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[11px] text-muted",
							children: l.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: l.organ })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: l.law
					})]
				}, l.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
					className: "text-[11px] font-medium uppercase tracking-[0.14em] text-muted",
					children: "Criteria across 25 modules"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2 sm:grid-cols-2",
					children: charter.criteria.map((c) => {
						const t = charter.criterionTotals[c.id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-xl border border-border bg-background px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: c.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[11px] text-muted",
									children: [
										t.living,
										"L · ",
										t.partial,
										"P · ",
										t.missing,
										"M"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: c.asks
							})]
						}, c.id);
					})
				})]
			})
		]
	});
}
function Concepts({ list }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: "Concepts"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Organs and bridge-concepts. Isolated means no living ligament. Unplugged means no module names it."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 grid gap-3 sm:grid-cols-2",
				children: list.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-background p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: variant(c.status === "living" ? "living" : c.status === "partial" ? "partial" : "missing"),
									children: c.status
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: c.role }),
								c.isolated ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "gap",
									children: "isolated"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-auto font-mono text-[11px] text-muted",
									children: ["deg ", c.degree]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm font-medium",
							children: c.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[11px] text-muted",
							children: c.id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-muted",
							children: c.thesis
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-gap",
							children: c.silo
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 font-mono text-[11px] text-muted",
							children: [
								"modules ",
								c.modules.length ? c.modules.join(" · ") : "none",
								" · walks",
								" ",
								c.workflows.length ? c.workflows.join(" · ") : "none",
								" · lib ",
								c.library,
								c.laws.length ? ` · laws ${c.laws.join(" ")}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/organism",
							className: "mt-3 inline-block text-sm text-partial hover:text-foreground",
							children: "Open map"
						})
					]
				}, c.id))
			})
		]
	});
}
function Modules({ list, openId, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: "Modules"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Implementation is partial when the organism is living and GitHub is a skeleton. That is not a lie."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-3",
				children: list.map((m) => {
					const open = openId === m.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border bg-background",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full flex-col gap-2 px-4 py-4 text-left sm:flex-row sm:items-center sm:justify-between",
							onClick: () => onOpen(open ? null : m.id),
							"aria-expanded": open,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium",
								children: m.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 font-mono text-[11px] text-muted",
								children: m.id
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "live",
										children: [m.living, " living"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "partial",
										children: [m.partial, " partial"]
									}),
									m.missing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "gap",
										children: [m.missing, " missing"]
									}) : null,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: m.github })
								]
							})]
						}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-border px-4 py-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted",
									children: m.enterprise
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 font-mono text-[11px] text-muted",
									children: [
										"walks ",
										m.workflows.join(" · ") || "none",
										" · peers ",
										m.peers.slice(0, 6).join(" · ") || "none"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-4 grid gap-2 sm:grid-cols-2",
									children: m.checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-lg border border-border px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm",
												children: c.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: variant(c.status),
												children: c.status
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted",
											children: c.evidence
										})]
									}, c.id))
								})
							]
						}) : null]
					}, m.id);
				})
			})
		]
	});
}
function Matrix({ charter, modules }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: "Criteria matrix"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Living · partial · missing. Scroll sideways on a phone."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "min-w-[720px] w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-[11px] uppercase tracking-[0.12em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "sticky left-0 bg-surface pb-2 pr-3 font-medium",
							children: "Module"
						}), charter.criteria.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-1 pb-2 font-medium",
							title: c.asks,
							children: c.label.split(" ")[0]
						}, c.id))]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: modules.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "sticky left-0 bg-background py-2 pr-3 font-mono text-[11px]",
							children: m.short
						}), m.checks.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-1 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("inline-block size-2.5 rounded-full", c.status === "living" && "bg-live", c.status === "partial" && "bg-partial", c.status === "missing" && "bg-gap"),
								title: `${c.label}: ${c.status} — ${c.evidence}`
							})
						}, c.id))]
					}, m.id)) })]
				})
			})
		]
	});
}
function Coordination({ charter }) {
	const byWalk = /* @__PURE__ */ new Map();
	for (const h of charter.hops) {
		const list = byWalk.get(h.workflowId) ?? [];
		list.push(h);
		byWalk.set(h.workflowId, list);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: "How modules decide together"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Adjacent steps on a walk. Orchestrator routes. Coordinator consults the library. Fabric caps spend. Agentic proposes. A clerk implements. The bus carries the envelope."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-4",
				children: [...byWalk.entries()].map(([wf, hops]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-background p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: wf
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 space-y-2",
						children: hops.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: h.from
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [
										" ",
										h.fromKind,
										" → "
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: h.to
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted",
									children: [" ", h.toKind]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-2 font-mono text-[11px] text-partial",
									children: [
										h.emits,
										" · ",
										h.organ
									]
								})
							]
						}, `${h.from}-${h.to}-${i}`))
					})]
				}, wf))
			})
		]
	});
}
function CharterPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CharterBoard, {})
	}) });
}
//#endregion
export { CharterPage as component };
