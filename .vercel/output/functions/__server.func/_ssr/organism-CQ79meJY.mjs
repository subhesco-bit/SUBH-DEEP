import { o as __toESM } from "../_runtime.mjs";
import { t as BRIDGES } from "./bridges-B9ONDsOo.mjs";
import { t as CONCEPTS } from "./concepts-b3GZTvML.mjs";
import { n as cardsForOrgan } from "./match-O6S8HVhu.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as ArrowRight } from "../_libs/lucide-react.mjs";
import { i as cn, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { a as bridgeStatusVariant, c as conceptStatusVariant, i as bindTargets, n as CONCEPT_BY_ID, o as bridgesFor, r as VIEWBOX, s as conceptRole, t as BRIDGE_BY_ID } from "./lattice-BG4wUAaL.mjs";
import { t as useLattice } from "./store-phAHycXe.mjs";
import { t as ScrollArea } from "./scroll-area-7lOc-SHL.mjs";
import { t as Filters } from "./filters-BR-dqdwV.mjs";
import { t as Root } from "../_libs/radix-ui__react-separator.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/organism-CQ79meJY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function curve(a, b) {
	const mx = (a.x + b.x) / 2;
	const my = (a.y + b.y) / 2;
	const dx = b.x - a.x;
	const nx = -(b.y - a.y) * .18;
	const ny = dx * .18;
	return `M ${a.x} ${a.y} Q ${mx + nx} ${my + ny} ${b.x} ${b.y}`;
}
function strokeFor(b) {
	if (b.status === "living") return "var(--color-live)";
	if (b.status === "partial") return "var(--color-partial)";
	return "var(--color-gap)";
}
function OrganismMap() {
	const selectedConceptId = useLattice((s) => s.selectedConceptId);
	const selectedBridgeId = useLattice((s) => s.selectedBridgeId);
	const statusFilter = useLattice((s) => s.statusFilter);
	const kindFilter = useLattice((s) => s.kindFilter);
	const roleFilter = useLattice((s) => s.roleFilter);
	const query = useLattice((s) => s.query);
	const proposed = useLattice((s) => s.proposed);
	const showMesh = useLattice((s) => s.showMesh);
	const selectConcept = useLattice((s) => s.selectConcept);
	const selectBridge = useLattice((s) => s.selectBridge);
	const visible = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return BRIDGES.filter((b) => {
			if (statusFilter !== "all" && b.status !== statusFilter) return false;
			if (kindFilter !== "all" && b.kind !== kindFilter) return false;
			if (!showMesh && b.status === "missing" && selectedBridgeId !== b.id) {
				if (selectedConceptId !== b.from && selectedConceptId !== b.to) return false;
			}
			if (!q) return true;
			const from = CONCEPT_BY_ID[b.from];
			const to = CONCEPT_BY_ID[b.to];
			return `${b.name} ${from?.name} ${to?.name}`.toLowerCase().includes(q);
		});
	}, [
		statusFilter,
		kindFilter,
		query,
		showMesh,
		selectedBridgeId,
		selectedConceptId
	]);
	const connected = (0, import_react.useMemo)(() => {
		if (!selectedConceptId) return /* @__PURE__ */ new Set();
		const ids = /* @__PURE__ */ new Set([selectedConceptId]);
		for (const b of BRIDGES) {
			if (b.from === selectedConceptId) ids.add(b.to);
			if (b.to === selectedConceptId) ids.add(b.from);
		}
		const self = CONCEPT_BY_ID[selectedConceptId];
		for (const id of self?.binds ?? []) ids.add(id);
		return ids;
	}, [selectedConceptId]);
	const nodes = CONCEPTS.filter((c) => {
		if (roleFilter !== "all" && conceptRole(c) !== roleFilter) return false;
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative overflow-hidden rounded-2xl border border-border bg-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-40",
				style: {
					backgroundImage: "linear-gradient(to right, color-mix(in oklab, var(--color-foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-foreground) 6%, transparent) 1px, transparent 1px)",
					backgroundSize: "48px 48px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative min-h-[420px] w-full overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto w-full",
					style: { aspectRatio: `${VIEWBOX.w} / ${VIEWBOX.h}` },
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						viewBox: `0 0 ${VIEWBOX.w} ${VIEWBOX.h}`,
						className: "absolute inset-0 h-full w-full",
						role: "img",
						"aria-label": "AFRERA organism with concept ligaments",
						children: [visible.map((b) => {
							const from = CONCEPT_BY_ID[b.from];
							const to = CONCEPT_BY_ID[b.to];
							if (!from || !to) return null;
							const active = selectedBridgeId === b.id || selectedConceptId === b.from || selectedConceptId === b.to;
							const dim = selectedConceptId && !active;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: curve(from, to),
								fill: "none",
								stroke: strokeFor(b),
								strokeWidth: active ? 2.4 : b.status === "missing" ? 1.05 : 1.35,
								strokeDasharray: b.status === "missing" ? "5 6" : b.status === "partial" ? "10 6" : void 0,
								strokeLinecap: "round",
								opacity: dim ? .1 : active ? .95 : b.status === "missing" ? .38 : .55,
								className: "cursor-pointer",
								onClick: (e) => {
									e.stopPropagation();
									selectBridge(b.id);
									selectConcept(b.from);
								}
							}, b.id);
						}), proposed.map((id) => {
							const b = visible.find((x) => x.id === id);
							if (!b) return null;
							const from = CONCEPT_BY_ID[b.from];
							const to = CONCEPT_BY_ID[b.to];
							if (!from || !to) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: curve(from, to),
								fill: "none",
								stroke: "var(--color-foreground)",
								strokeWidth: .6,
								opacity: .35
							}, `p-${id}`);
						})]
					}), nodes.map((c) => {
						const dim = selectedConceptId !== null && !connected.has(c.id) && query.length === 0;
						const selected = selectedConceptId === c.id;
						const bridge = conceptRole(c) === "bridge";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => selectConcept(c.id),
							className: cn("absolute -translate-x-1/2 -translate-y-1/2 text-left transition-[opacity,background-color,border-color,transform] duration-200 ease-[var(--ease-smooth-out)]", bridge ? "rounded-md border px-2.5 py-1" : "rounded-full border px-3 py-1.5", c.status === "missing" ? "border-dashed border-gap/70 bg-background text-muted" : "border-border bg-background text-foreground", selected && "border-foreground bg-accent text-foreground", dim && "opacity-25"),
							style: {
								left: `${c.x / VIEWBOX.w * 100}%`,
								top: `${c.y / VIEWBOX.h * 100}%`
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("block font-display leading-tight tracking-tight", bridge ? "text-xs" : "text-sm"),
								children: c.short
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[10px] uppercase tracking-[0.12em] text-muted",
								children: bridge ? "bridge" : c.dora.split("/")[0].trim()
							})]
						}, c.id);
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4 border-t border-border px-4 py-3 text-[11px] uppercase tracking-[0.12em] text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						swatch: "bg-live",
						label: "Living",
						solid: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						swatch: "bg-partial",
						label: "Partial"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {
						swatch: "bg-gap",
						label: "Missing",
						dashed: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto normal-case tracking-normal",
						children: "Squares are bridge concepts. Dashed threads are the missing mesh."
					})
				]
			})
		]
	});
}
function Legend({ swatch, label, solid, dashed }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("h-px w-6", swatch, dashed && "opacity-80"),
			style: {
				borderTopWidth: 2,
				borderStyle: dashed ? "dashed" : solid ? "solid" : "dotted",
				borderColor: "currentColor",
				background: "transparent",
				height: 0,
				width: 22
			}
		}), label]
	});
}
var LAYERS = [
	{
		id: "intelligence",
		label: "Nervous system"
	},
	{
		id: "habitat",
		label: "Habitat"
	},
	{
		id: "commerce",
		label: "Commerce"
	},
	{
		id: "circulation",
		label: "Circulation"
	},
	{
		id: "metabolism",
		label: "Metabolism"
	},
	{
		id: "protection",
		label: "Protection"
	},
	{
		id: "digestion",
		label: "Digestion"
	},
	{
		id: "sense",
		label: "Sense"
	},
	{
		id: "structure",
		label: "Structure"
	},
	{
		id: "bridge",
		label: "Bridge concepts"
	},
	{
		id: "missing-organ",
		label: "Unattached organs"
	}
];
function OrganList() {
	const selectedConceptId = useLattice((s) => s.selectedConceptId);
	const selectConcept = useLattice((s) => s.selectConcept);
	const query = useLattice((s) => s.query).trim().toLowerCase();
	const roleFilter = useLattice((s) => s.roleFilter);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-5 rounded-2xl border border-border bg-surface p-4",
		children: LAYERS.map((layer) => {
			const items = CONCEPTS.filter((c) => c.layer === layer.id && (roleFilter === "all" || conceptRole(c) === roleFilter) && (!query || `${c.name} ${c.short} ${c.dora} ${c.thesis}`.toLowerCase().includes(query)));
			if (items.length === 0) return null;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
				children: layer.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1.5",
				children: items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => selectConcept(c.id),
					className: cn("flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left", selectedConceptId === c.id ? "border-foreground bg-accent" : "border-border"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-sm font-medium",
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted",
						children: c.dora
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: conceptStatusVariant(c.status),
						children: conceptRole(c) === "bridge" ? "bridge" : c.status
					})]
				}) }, c.id))
			})] }, layer.id);
		})
	});
}
function Separator({ className, orientation = "horizontal", decorative = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
		decorative,
		orientation,
		className: cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className),
		...props
	});
}
function ConceptPanel() {
	const selectedConceptId = useLattice((s) => s.selectedConceptId);
	const selectedBridgeId = useLattice((s) => s.selectedBridgeId);
	const selectBridge = useLattice((s) => s.selectBridge);
	const selectConcept = useLattice((s) => s.selectConcept);
	const proposed = useLattice((s) => s.proposed);
	const toggleProposed = useLattice((s) => s.toggleProposed);
	const concept = selectedConceptId ? CONCEPT_BY_ID[selectedConceptId] : null;
	const related = selectedConceptId ? bridgesFor(selectedConceptId) : [];
	const activeBridge = selectedBridgeId ? BRIDGE_BY_ID[selectedBridgeId] : void 0;
	const binds = concept ? bindTargets(concept) : [];
	const role = concept ? conceptRole(concept) : "organ";
	const memory = concept ? cardsForOrgan(concept.id).slice(0, 4) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "flex h-full min-h-[420px] flex-col rounded-2xl border border-border bg-surface",
		children: concept ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5 pb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: conceptStatusVariant(concept.status),
								children: concept.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: concept.layer }),
							role === "bridge" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "solid",
								children: "bridge concept"
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-2xl font-medium tracking-tight",
						children: concept.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs uppercase tracking-[0.14em] text-muted",
						children: concept.dora
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Thesis",
							body: concept.thesis
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "How it sits in a silo",
							body: concept.silo
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
							title: "Path to farmer rupees",
							body: concept.prosperity
						}),
						concept.id === "ai" || concept.id === "module" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/systems",
							className: "block rounded-lg border border-dashed border-gap/70 px-3 py-2 text-sm hover:bg-accent",
							children: ["AI systems rack", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: "Agentic, copilot, fabric — WIRED skeletons, unplugged."
							})]
						}) : null,
						memory.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
							children: "Library memory"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-1.5",
							children: memory.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/library",
								className: "block rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: card.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 block text-xs text-muted",
									children: card.kind
								})]
							}) }, card.id))
						})] }) : null,
						binds.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
							children: "Exists to bind"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-wrap gap-1.5",
							children: binds.map((other) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => selectConcept(other.id),
								className: "rounded-full border border-border px-2.5 py-1 text-xs hover:bg-accent",
								children: other.short
							}) }, other.id))
						})] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
							children: "Ligaments"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 space-y-1.5",
							children: related.map((b) => {
								const otherId = b.from === concept.id ? b.to : b.from;
								const other = CONCEPT_BY_ID[otherId];
								const inbound = b.to === concept.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => selectBridge(b.id),
									className: cn("flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors duration-150", selectedBridgeId === b.id ? "border-foreground bg-accent" : "border-border hover:bg-accent"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-0.5 shrink-0 text-[10px] uppercase tracking-wider text-muted",
											children: inbound ? "in" : "out"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex flex-wrap items-center gap-1.5 font-medium",
												children: [
													inbound ? other?.short : concept.short,
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-3.5 shrink-0 text-muted" }),
													inbound ? concept.short : other?.short
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-xs text-muted",
												children: b.name
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: bridgeStatusVariant(b.status),
											children: b.status
										})
									]
								}) }, b.id);
							})
						})] }),
						activeBridge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BridgeDetail, {
							proposed: proposed.includes(activeBridge.id),
							onToggle: () => toggleProposed(activeBridge.id),
							from: CONCEPT_BY_ID[activeBridge.from]?.short ?? activeBridge.from,
							to: CONCEPT_BY_ID[activeBridge.to]?.short ?? activeBridge.to,
							status: activeBridge.status,
							kind: activeBridge.kind,
							name: activeBridge.name,
							signal: activeBridge.signal,
							today: activeBridge.today,
							contract: activeBridge.contract,
							thought: activeBridge.thought,
							living: activeBridge.status === "living"
						}) : null
					]
				})
			})
		] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 items-center justify-center p-8 text-center text-sm text-muted",
			children: "Select an organ or a bridge concept on the map."
		})
	});
}
function Block({ title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
		className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1.5 text-sm leading-relaxed text-foreground/90",
		children: body
	})] });
}
function BridgeDetail({ proposed, onToggle, from, to, status, kind, name, signal, today, contract, thought, living }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-border bg-background p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: bridgeStatusVariant(status),
					children: status
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: kind })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 font-display text-lg",
				children: name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted",
				children: [
					from,
					" → ",
					to
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-[11px] leading-relaxed text-partial",
				children: signal
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Today",
					body: today
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: "Intended contract",
					body: contract
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
				className: "mt-3 border-l-2 border-border pl-3 text-sm italic text-foreground/90",
				children: thought
			}),
			!living ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: proposed ? "default" : "outline",
				className: "mt-4 w-full",
				onClick: onToggle,
				children: proposed ? "Proposed ligament saved" : "Propose this ligament"
			}) : null
		]
	});
}
function OrganismPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 py-6 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filters, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "hidden md:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrganismMap, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "md:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrganList, {})
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConceptPanel, {})]
		})]
	}) });
}
//#endregion
export { OrganismPage as component };
