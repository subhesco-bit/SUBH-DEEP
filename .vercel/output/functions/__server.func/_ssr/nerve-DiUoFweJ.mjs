import { o as __toESM } from "../_runtime.mjs";
import { t as CONCEPTS } from "./concepts-b3GZTvML.mjs";
import { n as CANONICAL_QUERY_COUNT, t as CANONICAL_QUERIES } from "./queries-BoaEYzsX.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn, n as Button, r as Shell, s as useOrganism, t as Badge } from "./button-VjP3sqsL.mjs";
import { n as CONCEPT_BY_ID } from "./lattice-BG4wUAaL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/nerve-DiUoFweJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NervePanel() {
	const snapshot = useOrganism((s) => s.snapshot);
	const ready = useOrganism((s) => s.ready);
	const booting = useOrganism((s) => s.booting);
	const consulting = useOrganism((s) => s.consulting);
	const error = useOrganism((s) => s.error);
	const lastConsult = useOrganism((s) => s.lastConsult);
	const consult = useOrganism((s) => s.consult);
	const boot = useOrganism((s) => s.boot);
	const [query, setQuery] = (0, import_react.useState)("Why did the Chakhao harvest die at the portal instead of minting a lot?");
	const [organId, setOrganId] = (0, import_react.useState)("lot");
	const diagnosis = snapshot?.diagnosis;
	const autoOp = snapshot?.autoOp ?? (booting ? "partial" : "missing");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
					children: "AI nervous system"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: "Nerve"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: [
						"Auto-operation indexes the catalog, binds every organ, and fires",
						" ",
						CANONICAL_QUERY_COUNT,
						" reflex queries on boot — without a prompt and without an API key. Grok may enrich a later consult. Agentic and the other GitHub AI systems remain unplugged modules of this nerve. The token economy packs library hits instead of a GitHub dump."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/library",
							className: "underline decoration-border underline-offset-4 hover:text-foreground",
							children: "Library auto-op"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: " fires the reflexes. "
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/systems",
							className: "underline decoration-border underline-offset-4 hover:text-foreground",
							children: "Systems rack"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted",
							children: " — agentic, copilot, fabric remain WIRED skeletons."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: autoOp === "living" ? "live" : autoOp === "partial" ? "partial" : "gap",
							children: ["auto-op ", autoOp]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [snapshot?.libraryCards ?? 0, " cards in db"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, { children: [snapshot?.bindings ?? 0, " bindings"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: (snapshot?.reflexesAnswered ?? 0) >= CANONICAL_QUERY_COUNT ? "live" : "gap",
							children: [
								snapshot?.reflexesAnswered ?? 0,
								"/",
								CANONICAL_QUERY_COUNT,
								" reflexes"
							]
						}),
						booting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "partial",
							children: "booting"
						}) : null
					]
				}),
				diagnosis ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-foreground/90",
					children: diagnosis.verdict
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: booting ? "Migrating, seeding, binding…" : "Organism has not booted."
				}),
				!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					onClick: () => void boot(),
					disabled: booting,
					children: booting ? "Booting" : "Boot the organism"
				}) : null,
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-destructive",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-8 space-y-3",
					onSubmit: (e) => {
						e.preventDefault();
						consult(query, organId);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Organ in context"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "mt-1.5 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
								value: organId,
								onChange: (e) => setOrganId(e.target.value),
								"aria-label": "Organ in context",
								children: CONCEPTS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Pulse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "mt-1.5 min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed",
								value: query,
								onChange: (e) => setQuery(e.target.value),
								maxLength: 500,
								"aria-label": "Ask the library"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: consulting || !query.trim(),
								children: consulting ? "Consulting memory" : "Consult the library"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/economy",
									children: "Token economy"
								})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [CANONICAL_QUERY_COUNT, " auto queries"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 flex flex-wrap gap-1.5",
						children: CANONICAL_QUERIES.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "rounded-full border border-border px-2.5 py-1 text-left text-xs hover:bg-accent",
							onClick: () => {
								setQuery(q.query);
								setOrganId(q.organId);
								consult(q.query, q.organId);
							},
							children: [
								q.id,
								" ",
								q.title
							]
						}) }, q.id))
					})]
				}),
				lastConsult ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "mt-6 rounded-xl border border-border bg-background p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: lastConsult.source === "grok" ? "partial" : "live",
							children: lastConsult.source === "grok" ? "nerve + grok" : "library reflex"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed",
						children: lastConsult.reading
					})]
				}) : snapshot?.pulses[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "mt-6 rounded-xl border border-border bg-background p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "live",
							children: "last auto pulse"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-[11px] text-muted",
							children: snapshot.pulses[0].kind
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed",
						children: snapshot.pulses[0].reading
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-muted",
					children: "First answer is always the catalog. Grok enriches only when asked, and only with that memory in context."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Named repairs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 space-y-2",
					children: (diagnosis?.priority ?? []).slice(0, 8).map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-l border-border pl-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mr-2 font-mono text-[11px] text-muted",
									children: String(i + 1).padStart(2, "0")
								}), p.title]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 font-mono text-[11px] text-partial",
								children: p.signal
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: CONCEPT_BY_ID[p.organId]?.short
							})
						]
					}, p.id))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Spine"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 space-y-2",
					children: (snapshot?.events ?? []).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted",
						children: "No blood yet. Boot writes the first pulses."
					}) : snapshot?.events.map((ev) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex flex-col gap-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("font-mono text-[11px] text-live"),
							children: ev.signal
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-muted",
							children: [
								ev.organId ?? "organism",
								" · ",
								formatTime(ev.createdAt)
							]
						})]
					}, ev.id))
				})]
			})]
		})]
	});
}
function formatTime(value) {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return value;
	return d.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit"
	});
}
function NervePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NervePanel, {})
	}) });
}
//#endregion
export { NervePage as component };
