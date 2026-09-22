import { o as __toESM } from "../_runtime.mjs";
import { a as workflowsForModule, n as WORKFLOWS, t as MODULE_RUNTIME } from "./registry-CRCHqiWy.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn, n as Button, o as useModuleOs, r as Shell, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
import { t as SYSTEM_BY_ID } from "./systems-CVrwklEg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/modules-ZxnYoC4b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WORKFLOW_IDS = ["all", ...WORKFLOWS.map((w) => w.id)];
function decisionVariant(d) {
	if (d === "pass") return "live";
	if (d === "propose") return "partial";
	if (d === "defer") return "partial";
	return "gap";
}
function ModulesPanel() {
	const snapshot = useModuleOs((s) => s.snapshot);
	const busy = useModuleOs((s) => s.busy);
	const error = useModuleOs((s) => s.error);
	const run = useModuleOs((s) => s.run);
	const consult = useModuleOs((s) => s.consult);
	const [workflowFilter, setWorkflowFilter] = (0, import_react.useState)("harvest-mint");
	const [selectedId, setSelectedId] = (0, import_react.useState)("agentic");
	const [query, setQuery] = (0, import_react.useState)("Why does harvest.completed mint a lot?");
	const selected = MODULE_RUNTIME.find((m) => m.id === selectedId) ?? MODULE_RUNTIME[0];
	const selectedSystem = SYSTEM_BY_ID[selected.id];
	const runs = snapshot?.runs ?? [];
	const activeRun = runs.find((r) => r.workflowId === workflowFilter) ?? runs[0];
	const workflow = WORKFLOWS.find((w) => w.id === (activeRun?.workflowId ?? workflowFilter));
	const list = (0, import_react.useMemo)(() => {
		if (workflowFilter === "all") return MODULE_RUNTIME;
		return MODULE_RUNTIME.filter((m) => m.workflowIds.includes(workflowFilter));
	}, [workflowFilter]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5 sm:p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
						children: "Module OS · middleware · workflows · decisions"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-3xl font-medium tracking-tight",
						children: "Modules"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
						children: "Each named AI is now a module of one bus: domain, algorithm, workflow, decision, middleware, API, service, UI. GitHub files stay skeletons. This organism runs the process. AI may propose. It may not write ₹."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "Living plugs",
								value: snapshot?.livingPlugs ?? 0,
								live: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "Workflows",
								value: snapshot?.workflows ?? WORKFLOWS.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "Runs on the bus",
								value: runs.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Callout, {
								label: "Last status",
								value: activeRun?.status ?? "—",
								live: activeRun?.status === "passed"
							})
						]
					}),
					snapshot?.copilot ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 rounded-xl border border-live/30 bg-background px-4 py-3 text-sm text-live",
						children: ["Copilot · ", snapshot.copilot]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-destructive",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								disabled: busy,
								onClick: () => void run("harvest-mint"),
								children: "Run harvest walk"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								disabled: busy,
								onClick: () => void run("offtake-settle"),
								children: "Run offtake gate"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								disabled: busy,
								onClick: () => void run("platform-bus"),
								children: "Run platform bus"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/charter",
									children: "Charter"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "sm",
								variant: "outline",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/systems",
									children: "GitHub rack"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex flex-col gap-2 sm:flex-row",
						onSubmit: (e) => {
							e.preventDefault();
							consult(query);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							"aria-label": "Consult the module bus",
							placeholder: "Consult: harvest, remaining, EMI"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "outline",
							disabled: busy,
							className: "sm:w-auto",
							children: "Consult"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] uppercase tracking-[0.14em] text-muted",
					children: "Workflow"
				}), WORKFLOW_IDS.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setWorkflowFilter(id),
					className: cn("h-10 whitespace-nowrap rounded-full border px-3 text-sm", workflowFilter === id ? "border-foreground bg-accent text-foreground" : "border-border text-muted hover:text-foreground"),
					children: id === "all" ? "all modules" : id
				}, id))]
			}),
			workflow && activeRun ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl border border-border bg-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl",
						children: workflow.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted",
						children: workflow.thesis
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: activeRun.status === "passed" ? "live" : activeRun.status === "blocked" ? "gap" : "partial",
						children: activeRun.status
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
					children: activeRun.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelectedId(step.moduleId),
						className: "h-full w-full rounded-xl border border-border bg-background px-3 py-3 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-[10px] text-muted",
									children: step.code
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: decisionVariant(step.decision),
									children: step.decision
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-medium",
								children: step.name || step.moduleId
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-[11px] text-partial",
								children: step.moduleId
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[12px] leading-relaxed text-muted",
								children: step.reason
							})
						]
					}) }, `${step.code}-${i}`))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3 sm:grid-cols-2",
					children: list.map((m) => {
						const sys = SYSTEM_BY_ID[m.id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedId(m.id),
							className: cn("h-full w-full rounded-2xl border p-5 text-left transition-colors duration-150", selected.id === m.id ? "border-foreground bg-accent" : "border-border bg-surface hover:bg-accent"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "live",
										children: m.plug
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: m.layers[0] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-3 font-display text-xl tracking-tight",
									children: sys?.name ?? m.id
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-mono text-[11px] text-muted",
									children: sys?.moduleId
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm leading-relaxed",
									children: m.enterprise
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-[11px] uppercase tracking-[0.12em] text-muted",
									children: m.workflowIds.join(" · ")
								})
							]
						}) }, m.id);
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border border-border bg-surface p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "live",
								children: selected.plug
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-2xl",
								children: selectedSystem?.name ?? selected.id
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-muted",
								children: selectedSystem?.path
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "mt-5 text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Layers"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 flex flex-wrap gap-2",
								children: selected.layers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: l }, l))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "mt-5 text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Enterprise"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed",
								children: selected.enterprise
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "mt-5 text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "GitHub still says"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted",
								children: selectedSystem?.silo
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
								className: "mt-5 text-[11px] uppercase tracking-[0.14em] text-muted",
								children: "Workflows"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-1 text-sm",
								children: workflowsForModule(selected.id).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-partial hover:text-foreground",
									onClick: () => setWorkflowFilter(w.id),
									children: w.name
								}) }, w.id))
							})
						]
					}), activeRun ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-2xl border border-border bg-surface p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-[11px] uppercase tracking-[0.14em] text-muted",
							children: "Bus"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-3 space-y-2",
							children: activeRun.messages.slice(0, 10).map((msg, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "font-mono text-[11px] text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground",
										children: msg.from
									}),
									" → ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-foreground",
										children: msg.to
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-partial",
										children: msg.signal
									})
								]
							}, `${msg.signal}-${i}`))
						})]
					}) : null]
				})]
			})
		]
	});
}
function Callout({ label, value, live }) {
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
function ModulesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModulesPanel, {})
	}) });
}
//#endregion
export { ModulesPage as component };
