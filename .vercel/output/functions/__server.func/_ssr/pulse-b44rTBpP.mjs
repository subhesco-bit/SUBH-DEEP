import { o as __toESM } from "../_runtime.mjs";
import { n as WALK_LEDE, r as WALK_TITLE, t as WALK } from "./walk-BOhLs9kz.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { _ as ChevronLeft, g as ChevronRight } from "../_libs/lucide-react.mjs";
import { i as cn, n as Button, r as Shell, s as useOrganism, t as Badge } from "./button-VjP3sqsL.mjs";
import { a as bridgeStatusVariant, c as conceptStatusVariant, n as CONCEPT_BY_ID, t as BRIDGE_BY_ID } from "./lattice-BG4wUAaL.mjs";
import { t as useLattice } from "./store-phAHycXe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pulse-b44rTBpP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PulseWalk() {
	const [step, setStep] = (0, import_react.useState)(0);
	const hop = WALK[step];
	const organ = CONCEPT_BY_ID[hop.organId];
	const bridge = hop.bridgeId ? BRIDGE_BY_ID[hop.bridgeId] : void 0;
	const selectConcept = useLattice((s) => s.selectConcept);
	const selectBridge = useLattice((s) => s.selectBridge);
	const toggleProposed = useLattice((s) => s.toggleProposed);
	const proposed = useLattice((s) => s.proposed);
	const publish = useOrganism((s) => s.publish);
	const ready = useOrganism((s) => s.ready);
	const go = (n) => {
		const next = Math.max(0, Math.min(WALK.length - 1, n));
		setStep(next);
		const h = WALK[next];
		selectConcept(h.organId);
		selectBridge(h.bridgeId);
	};
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		publish(hop.signal, hop.organId, hop.bridgeId);
	}, [
		hop.id,
		hop.signal,
		hop.organId,
		hop.bridgeId,
		ready,
		publish
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "hidden lg:block",
			children: WALK.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => go(i),
				className: cn("flex w-full items-start gap-3 border-l py-2 pl-3 text-left text-sm transition-colors duration-150", i === step ? "border-foreground text-foreground" : "border-border text-muted hover:text-foreground"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[11px] tabular-nums",
					children: String(i + 1).padStart(2, "0")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: h.title })]
			}) }, h.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			className: "rounded-2xl border border-border bg-surface p-5 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.16em] text-muted",
					children: "Pulse walk"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-2 font-display text-3xl font-medium tracking-tight",
					children: WALK_TITLE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
					children: WALK_LEDE
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex items-center justify-between gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							"aria-label": "Previous hop",
							disabled: step === 0,
							onClick: () => go(step - 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-xs tabular-nums text-muted",
							children: [
								step + 1,
								" / ",
								WALK.length
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							"aria-label": "Next hop",
							disabled: step === WALK.length - 1,
							onClick: () => go(step + 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-1.5 overflow-hidden rounded-full bg-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bg-primary transition-[width] duration-300 ease-[var(--ease-smooth-out)]",
							style: { width: `${(step + 1) / WALK.length * 100}%` }
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-8 font-display text-2xl tracking-tight",
					children: hop.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [organ ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: conceptStatusVariant(organ.status),
						children: organ.short
					}) : null, bridge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: bridgeStatusVariant(bridge.status),
						children: bridge.name
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 font-mono text-xs leading-relaxed text-partial",
					children: hop.signal
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6 grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-background p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-[11px] font-medium uppercase tracking-[0.16em] text-gap",
							children: "Today — the signal dies"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed",
							children: hop.today
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-background p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
							className: "text-[11px] font-medium uppercase tracking-[0.16em] text-live",
							children: "Should — the ligament"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed",
							children: hop.should
						})]
					})]
				}),
				bridge ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("blockquote", {
					className: "mt-6 border-l-2 border-border pl-4 text-sm italic leading-relaxed",
					children: bridge.thought
				}) : null,
				bridge && bridge.status !== "living" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-6",
					variant: proposed.includes(bridge.id) ? "default" : "outline",
					onClick: () => toggleProposed(bridge.id),
					children: proposed.includes(bridge.id) ? "Proposed ligament saved" : "Propose this ligament"
				}) : null
			]
		})]
	});
}
function PulsePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseWalk, {})
	}) });
}
//#endregion
export { PulsePage as component };
