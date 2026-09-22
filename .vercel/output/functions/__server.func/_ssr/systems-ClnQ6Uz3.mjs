import { o as __toESM } from "../_runtime.mjs";
import { t as AI_SYSTEMS } from "./catalog-BIfdppeO.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { b as ArrowRight } from "../_libs/lucide-react.mjs";
import { i as cn, n as Button, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
import { t as useLattice } from "./store-phAHycXe.mjs";
import { a as systemStatusVariant, i as systemStats, n as filterSystems, r as organsForSystem } from "./systems-CVrwklEg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/systems-ClnQ6Uz3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FAMILIES = [
	"all",
	"core",
	"agent",
	"domain",
	"mouth"
];
var ACTUALS = [
	"all",
	"skeleton",
	"stub",
	"duplicate",
	"partial",
	"unplugged"
];
function SystemsPanel() {
	const stats = systemStats();
	const [family, setFamily] = (0, import_react.useState)("all");
	const [actual, setActual] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const [selectedId, setSelectedId] = (0, import_react.useState)("agentic");
	const selectConcept = useLattice((s) => s.selectConcept);
	const list = (0, import_react.useMemo)(() => filterSystems({
		family,
		actual,
		query
	}), [
		family,
		actual,
		query
	]);
	const selected = AI_SYSTEMS.find((s) => s.id === selectedId) ?? list[0] ?? AI_SYSTEMS[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
						children: "AI systems · module contract"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: "Systems"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: "Agentic, copilot, backbone, fabric, gateway, brain — each was meant to be a module of one nervous system. On GitHub they are sibling files. module.json says WIRED. analysis.isComplete is false. Canonical paths are one-kilobyte re-exports of legacy/. None of them plugs into a harvest. This organism's library is the living hippocampus they were meant to consult."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "Named AI systems",
								value: stats.systems,
								body: "Files, folders, and mouths. Not a spinal cord."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "WIRED but unfinished",
								value: stats.wiredButSkeleton,
								body: "module.json says WIRED. analysis.isComplete is false.",
								warn: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "Stub re-exports",
								value: stats.stubs,
								body: "Canonical service under 2KB. Logic still in legacy/.",
								warn: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "GitHub plugs",
								value: `${stats.livingPlugs} of ${stats.systems}`,
								body: `${stats.moduleDirs} module directories. Phase 2 of the factory never ran.`,
								warn: true
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/library",
								className: "underline decoration-border underline-offset-4 hover:text-foreground",
								children: "Library auto-op"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " answers the agentic query without these files. " }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/nerve",
								className: "underline decoration-border underline-offset-4 hover:text-foreground",
								children: "Nerve"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " consults memory. " }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/modules",
								className: "underline decoration-border underline-offset-4 hover:text-foreground",
								children: "Module OS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " is the living bus these files were meant to be. " }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/charter",
								className: "underline decoration-border underline-offset-4 hover:text-foreground",
								children: "Charter"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " scores every module against eighteen criteria." })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search agentic, copilot, fabric, module id",
					"aria-label": "Search AI systems",
					className: "lg:max-w-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
						label: "Family",
						value: family,
						options: FAMILIES,
						onChange: setFamily
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
						label: "Actual",
						value: actual,
						options: ACTUALS,
						onChange: setActual
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3 sm:grid-cols-2",
					children: list.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedId(s.id),
						className: cn("h-full w-full rounded-2xl border p-5 text-left transition-colors duration-150", selected?.id === s.id ? "border-foreground bg-accent" : "border-border bg-surface hover:bg-accent"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: systemStatusVariant(s.actual),
									children: s.actual
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: s.declared === "WIRED" ? "partial" : "default",
									children: ["declared ", s.declared]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-xl tracking-tight",
								children: s.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-[11px] text-muted",
								children: s.moduleId
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-foreground/90",
								children: s.silo
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 text-[11px] uppercase tracking-[0.12em] text-muted",
								children: [
									s.liveCallers,
									" live callers · ",
									kb(s.bytesCanonical),
									" canonical",
									s.bytesLegacy ? ` · ${kb(s.bytesLegacy)} legacy` : ""
								]
							})
						]
					}) }, s.id))
				}), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemDetail, {
					system: selected,
					onSelectOrgan: selectConcept
				}) : null]
			})
		]
	});
}
function SystemDetail({ system, onSelectOrgan }) {
	const organs = organsForSystem(system);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: systemStatusVariant(system.actual),
						children: system.actual
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: system.family }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: system.isComplete ? "live" : "gap",
						children: system.isComplete ? "complete" : "not complete"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 font-display text-2xl font-medium tracking-tight",
				children: system.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-xs text-muted",
				children: system.path
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-5 grid grid-cols-2 gap-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "Declared",
						value: system.declared
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "Live callers",
						value: String(system.liveCallers)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "Frontend",
						value: system.frontend ? "yes" : "no"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "Routes",
						value: system.routes ? "yes" : "no"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "Tests",
						value: system.tests ? "yes" : "no"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fact, {
						label: "analysis.isComplete",
						value: system.isComplete ? "true" : "false"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-6 text-[11px] uppercase tracking-[0.14em] text-muted",
				children: "Intended contract"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed",
				children: system.contract
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-6 text-[11px] uppercase tracking-[0.14em] text-muted",
				children: "What it is today"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-foreground/90",
				children: system.silo
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-6 text-[11px] uppercase tracking-[0.14em] text-muted",
				children: "Missing plug"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-xs leading-relaxed text-gap",
				children: system.plug
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-6 text-[11px] uppercase tracking-[0.14em] text-muted",
				children: "Organs it should plug into"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Sockets exist on the organism. The module factory never seated this system. Every socket below is unplugged."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 flex flex-wrap gap-2",
				children: organs.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/organism",
					onClick: () => onSelectOrgan(o.id),
					className: "inline-flex h-11 items-center rounded-full border border-dashed border-gap/70 px-3 text-sm text-muted hover:border-foreground hover:text-foreground",
					children: [o.short, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-[10px] uppercase tracking-[0.12em]",
						children: "unplugged"
					})]
				}) }, o.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/library",
					className: "inline-flex items-center gap-2 underline decoration-border underline-offset-4 hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						className: "size-4",
						strokeWidth: 1.75
					}), "Consult library memory for this module"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/organism",
					onClick: () => onSelectOrgan("module"),
					className: "inline-flex items-center gap-2 underline decoration-border underline-offset-4 hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						className: "size-4",
						strokeWidth: 1.75
					}), "Open the module-contract bridge on the organism map"]
				})
			})
		]
	});
}
function Callout({ label, value, body, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-background p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.14em] text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("mt-1 font-display text-3xl tracking-tight", warn && "text-gap"),
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm leading-relaxed text-muted",
				children: body
			})
		]
	});
}
function Fact({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
		className: "text-[11px] uppercase tracking-[0.12em] text-muted",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
		className: "mt-0.5 font-mono text-sm",
		children: value
	})] });
}
function ChipRow({ label, value, options, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mr-1 text-[11px] uppercase tracking-[0.14em] text-muted",
			children: label
		}), options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			size: "sm",
			variant: value === opt ? "default" : "outline",
			className: "rounded-full capitalize",
			onClick: () => onChange(opt),
			children: opt
		}, opt))]
	});
}
function kb(bytes) {
	if (!bytes) return "folder only";
	if (bytes < 1e3) return `${bytes} B`;
	return `${(bytes / 1024).toFixed(1)} KB`;
}
function SystemsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemsPanel, {})
	}) });
}
//#endregion
export { SystemsPage as component };
