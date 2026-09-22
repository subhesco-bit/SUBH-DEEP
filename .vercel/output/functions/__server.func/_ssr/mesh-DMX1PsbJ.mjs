import { t as BRIDGES } from "./bridges-B9ONDsOo.mjs";
import { t as CONCEPTS } from "./concepts-b3GZTvML.mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as ArrowRight } from "../_libs/lucide-react.mjs";
import { i as cn, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { c as conceptStatusVariant, d as latticeStats, f as livingDegreeMap, i as bindTargets, n as CONCEPT_BY_ID, p as weakConcepts, s as conceptRole, u as isolatedConcepts } from "./lattice-BG4wUAaL.mjs";
import { t as useLattice } from "./store-phAHycXe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mesh-DMX1PsbJ.js
var import_jsx_runtime = require_jsx_runtime();
function MeshPanel() {
	const stats = latticeStats();
	const isolated = isolatedConcepts();
	const weak = weakConcepts();
	const liveDeg = livingDegreeMap();
	const selectConcept = useLattice((s) => s.selectConcept);
	const selectBridge = useLattice((s) => s.selectBridge);
	const toggleProposed = useLattice((s) => s.toggleProposed);
	const proposed = useLattice((s) => s.proposed);
	const bridges = CONCEPTS.filter((c) => conceptRole(c) === "bridge");
	const missingTech = BRIDGES.filter((b) => b.kind === "technical" && b.status === "missing");
	const missingThought = BRIDGES.filter((b) => b.kind === "thoughtful" && b.status === "missing");
	const firstBinders = missingTech.filter((b) => {
		const fromLive = liveDeg[b.from] ?? 0;
		const toLive = liveDeg[b.to] ?? 0;
		return fromLive <= 2 || toLive <= 2;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
						label: "Living ligaments",
						value: `${stats.living} of ${stats.bridges}`,
						body: "Foreign keys and checkout. Necessary, not an organism."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
						label: "Isolated in runtime",
						value: stats.isolated,
						body: "No living or partial ligament. The node exists only as a file, a spec, or a fringe organ.",
						warn: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
						label: "Weakly attached",
						value: stats.weak,
						body: "At most two real ligaments. Still a silo with a handshake.",
						warn: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl font-medium tracking-tight",
					children: "Bridge concepts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: "These are not more modules. They exist only to join organs that currently pretend to be complete alone. On GitHub they are missing platforms, a stub event bus, or a sentence in DORA. AI systems that were meant to be modules of the nerve are catalogued separately — they are still sibling files with a WIRED badge."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/systems",
						className: "underline decoration-border underline-offset-4 hover:text-foreground",
						children: "See the AI module rack"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-5 grid gap-3 md:grid-cols-2",
					children: bridges.map((c) => {
						const binds = bindTargets(c);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => selectConcept(c.id),
							className: "h-full w-full rounded-2xl border border-border bg-surface p-5 text-left hover:bg-accent",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: conceptStatusVariant(c.status),
										children: c.status
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "solid",
										children: "bridge"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-display text-xl tracking-tight",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs uppercase tracking-[0.14em] text-muted",
									children: c.dora
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm leading-relaxed text-foreground/90",
									children: c.thesis
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 flex flex-wrap items-center gap-1 text-xs text-muted",
									children: ["Binds", binds.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-border px-2 py-0.5",
										children: o.short
									}, o.id))]
								})
							]
						}) }, c.id);
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium tracking-tight",
						children: "Runtime isolation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Living + partial ligaments only. Missing contracts do not count — that is the honest map of consolidated/final."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrganColumn, {
						title: "No runtime ligament",
						items: isolated,
						deg: liveDeg,
						onSelect: selectConcept
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrganColumn, {
						title: "At most two runtime ligaments",
						items: weak,
						deg: liveDeg,
						onSelect: selectConcept
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-medium tracking-tight",
						children: "Bind first"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Missing technical contracts that would lift a weakly attached organ. Propose the ones to build on the spine next."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2",
						children: firstBinders.slice(0, 14).map((b) => {
							const from = CONCEPT_BY_ID[b.from];
							const to = CONCEPT_BY_ID[b.to];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl border border-border bg-surface p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "w-full text-left",
									onClick: () => {
										selectBridge(b.id);
										selectConcept(b.from);
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-lg leading-snug",
											children: b.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 flex flex-wrap items-center gap-1 text-xs text-muted",
											children: [
												from?.name,
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3" }),
												to?.name
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-mono text-[11px] text-partial",
											children: b.signal
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									className: "mt-3 w-full",
									size: "sm",
									variant: proposed.includes(b.id) ? "default" : "outline",
									onClick: () => toggleProposed(b.id),
									children: proposed.includes(b.id) ? "Proposed" : "Propose this ligament"
								})]
							}) }, b.id);
						})
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-medium tracking-tight",
				children: "Two kinds of missing link"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindCard, {
					title: "Technical",
					count: missingTech.length,
					body: "Events, schemas, and UX contracts that do not exist: harvest.completed never leaves the portal, eventBus.js is an in-memory stub, crop_plantings still collides with farm_plots, FDI does not reprice cover."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindCard, {
					title: "Thoughtful",
					count: missingThought.length,
					body: "The consolidated branch still thinks in roles, SKUs, megawatts, and PDFs. Farmer is a cell. Village is an economy. Lot is one body. Scheme is blood. A chatbot is not a reflex. Time is a dimension."
				})]
			})] })
		]
	});
}
function Callout({ label, value, body, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.14em] text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-2 font-mono text-3xl tabular-nums", warn ? "text-gap" : "text-foreground"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: body
			})
		]
	});
}
function OrganColumn({ title, items, deg, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1.5",
			children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "text-sm text-muted",
				children: "None."
			}) : items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSelect(c.id),
				className: "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-left hover:bg-surface",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: c.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs text-muted",
					children: conceptRole(c) === "bridge" ? "bridge concept" : c.dora
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs tabular-nums text-muted",
					children: deg[c.id] ?? 0
				})]
			}) }, c.id))
		})]
	});
}
function KindCard({ title, count, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-2xl border border-border bg-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-xl",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xl tabular-nums text-gap",
				children: count
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm leading-relaxed text-muted",
			children: body
		})]
	});
}
function MeshPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeshPanel, {})
	}) });
}
//#endregion
export { MeshPage as component };
