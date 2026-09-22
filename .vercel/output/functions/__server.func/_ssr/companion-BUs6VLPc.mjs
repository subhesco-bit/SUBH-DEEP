import { o as __toESM } from "../_runtime.mjs";
import { i as queryLibraryKnowledge } from "./match-O6S8HVhu.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { l as getPlatform, p as processDeclared } from "./fns-BuGhDXB0.mjs";
import { n as create } from "../_libs/zustand.mjs";
import { a as useBooks, n as Button, t as Badge } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companion-BUs6VLPc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var usePlatform = create((set) => ({
	ready: false,
	busy: false,
	error: null,
	snapshot: null,
	hydrate: (snapshot) => set({
		snapshot,
		ready: true,
		error: null
	}),
	refresh: async () => {
		const res = await getPlatform();
		if (!res.ok) {
			set({
				error: res.error ?? "platform unread",
				ready: true
			});
			return;
		}
		set({
			snapshot: res,
			ready: true,
			error: null
		});
	},
	process: async (input) => {
		set({
			busy: true,
			error: null
		});
		const res = await processDeclared({ data: input });
		if (!res.ok) {
			set({
				busy: false,
				error: res.error ?? "process failed"
			});
			return false;
		}
		set({
			busy: false,
			snapshot: res,
			ready: true,
			error: null
		});
		useBooks.getState().hydrate(res);
		return true;
	}
}));
function CompanionPanel({ reading, compact = false }) {
	if (!reading) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-live/30 bg-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-[0.16em] text-live",
				children: "Agentic companion"
			}),
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-2 font-display text-3xl font-medium tracking-tight",
				children: "Propose. Clerk approves."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-2xl text-sm leading-relaxed text-muted",
				children: "Agentic, copilot, ERP agents, and advisory were meant to sit on the farmer cell as one companion — not sixteen portals. GitHub still holds a WIRED skeleton. This organism proposes the next gate. A clerk names paymentRef, kilograms, and loss. The companion never writes a rupee."
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-live",
				children: reading.next
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-[13px] leading-relaxed text-muted",
				children: reading.memory
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-[11px] text-partial",
				children: reading.firewall
			}),
			reading.libraryHit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-[11px] text-muted",
				children: ["Library · ", reading.libraryHit]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: compact ? "mt-4 space-y-3" : "mt-5 grid gap-3 sm:grid-cols-2",
				children: reading.proposals.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalCard, { proposal: p }, p.id))
			})
		]
	});
}
function ProposalCard({ proposal }) {
	const busy = useBooks((s) => s.busy);
	const error = useBooks((s) => s.error);
	const intake = useBooks((s) => s.intake);
	const settle = useBooks((s) => s.settle);
	const harvest = useBooks((s) => s.harvest);
	const process = usePlatform((s) => s.process);
	const [paymentRef, setPaymentRef] = (0, import_react.useState)("");
	const [hours, setHours] = (0, import_react.useState)("18");
	const [kg, setKg] = (0, import_react.useState)("");
	const [variety, setVariety] = (0, import_react.useState)("Chakhao Poireiton");
	const [commodity, setCommodity] = (0, import_react.useState)("black rice");
	const [lossKg, setLossKg] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("drying");
	const [local, setLocal] = (0, import_react.useState)(null);
	const [done, setDone] = (0, import_react.useState)(false);
	async function approve() {
		setLocal(null);
		let ok = false;
		if (proposal.action === "intake" && proposal.lotId) ok = await intake(proposal.lotId);
		else if (proposal.action === "settle" && proposal.orderId) {
			if (!paymentRef.trim()) {
				setLocal("paymentRef is required — never invented.");
				return;
			}
			ok = await settle(proposal.orderId, paymentRef.trim(), hours);
		} else if (proposal.action === "harvest" && proposal.cellId) {
			if (!kg.trim()) {
				setLocal("Declared kilograms required.");
				return;
			}
			ok = await harvest({
				cellId: proposal.cellId,
				variety,
				commodity,
				kg
			});
		} else if (proposal.action === "process" && proposal.lotId) {
			if (lossKg.trim() === "") {
				setLocal("Declared loss is required, including zero.");
				return;
			}
			ok = await process({
				lotId: proposal.lotId,
				kind,
				lossKg,
				note: "Companion-approved declared loss"
			});
		}
		if (ok) setDone(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-xl border border-border bg-background p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] text-muted",
					children: proposal.moduleId
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: proposal.severity === "defer" ? "partial" : "live",
					children: proposal.action
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm font-medium",
				children: proposal.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[13px] leading-relaxed text-muted",
				children: proposal.body
			}),
			done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-live",
				children: "Clerk approved. Books moved."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2",
				children: [
					proposal.action === "settle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: paymentRef,
						onChange: (e) => setPaymentRef(e.target.value),
						placeholder: "paymentRef",
						"aria-label": "paymentRef"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: hours,
						onChange: (e) => setHours(e.target.value),
						"aria-label": "Hours to pay"
					})] }) : null,
					proposal.action === "harvest" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: kg,
							onChange: (e) => setKg(e.target.value),
							placeholder: "kg",
							"aria-label": "Declared kilograms"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: variety,
							onChange: (e) => setVariety(e.target.value),
							"aria-label": "Variety"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: commodity,
							onChange: (e) => setCommodity(e.target.value),
							"aria-label": "Commodity"
						})
					] }) : null,
					proposal.action === "process" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: lossKg,
						onChange: (e) => setLossKg(e.target.value),
						placeholder: "loss kg",
						"aria-label": "Declared loss kg"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm",
						value: kind,
						onChange: (e) => setKind(e.target.value),
						"aria-label": "Process kind",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "drying",
								children: "drying"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "milling",
								children: "milling"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "cleaning",
								children: "cleaning"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "grading",
								children: "grading"
							})
						]
					})] }) : null,
					local || error && proposal.action !== "consult" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-destructive",
						children: local ?? error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [proposal.action === "consult" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: proposal.href,
								children: "Open library"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: busy,
							onClick: () => void approve(),
							children: ["Approve ", proposal.action]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							variant: "outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: proposal.href,
								children: ["Open ", proposal.organ]
							})
						})]
					})
				]
			})
		]
	});
}
function lastSettled(orders) {
	return orders.filter((o) => o.status === "settled").sort((a, b) => (b.settledAt ?? "").localeCompare(a.settledAt ?? ""))[0];
}
function mintedWaiting(lots) {
	return lots.filter((l) => l.status === "minted" && l.remainingGrams > 0);
}
function openOfftake(orders) {
	return orders.filter((o) => o.status === "open");
}
function proposeCompanion(books, gates = []) {
	const proposals = [];
	const settled = lastSettled(books.orders);
	const memory = settled ? `Last harvest on books: ${settled.cellName} · ${settled.variety} · paymentRef ${settled.paymentRef ?? "named"}${settled.hoursToPay != null ? ` · ${settled.hoursToPay}h to pay` : ""}.` : "No settled harvest yet. Magh is waiting on a clerk.";
	for (const order of openOfftake(books.orders)) proposals.push({
		id: `settle-${order.id}`,
		moduleId: "agentic",
		action: "settle",
		title: `Settle ${order.cellName}'s offtake`,
		body: `${order.qtyGrams} g of ${order.variety} to ${order.buyer} waits on a paymentRef. The companion will not invent one.`,
		href: "/trade",
		organ: "orders",
		lotId: order.lotId,
		orderId: order.id,
		cellId: null,
		severity: "defer"
	});
	for (const lot of mintedWaiting(books.lots)) proposals.push({
		id: `intake-${lot.id}`,
		moduleId: "erp-agents",
		action: "intake",
		title: `Inward ${lot.variety} for ${lot.cellName}`,
		body: `${lot.remainingGrams} g still minted, not in the godown. Same lot body. Clerk approves intake.`,
		href: "/warehouse",
		organ: "warehouse",
		lotId: lot.id,
		orderId: null,
		cellId: lot.cellId,
		severity: "note"
	});
	const idle = books.cells.filter((c) => c.lotCount === 0);
	for (const cell of idle.slice(0, 1)) proposals.push({
		id: `harvest-${cell.id}`,
		moduleId: "agentic",
		action: "harvest",
		title: `Mint a harvest for ${cell.name}`,
		body: `${cell.household} is on the books with no lot. The companion proposes. The clerk declares kilograms.`,
		href: "/",
		organ: "lot",
		lotId: null,
		orderId: null,
		cellId: cell.id,
		severity: "note"
	});
	const processable = books.lots.filter((l) => l.remainingGrams > 0 && l.status !== "pledged" && l.status !== "settled");
	if (processable[0] && !proposals.some((p) => p.action === "process")) {
		const lot = processable[0];
		proposals.push({
			id: `process-${lot.id}`,
			moduleId: "copilot",
			action: "process",
			title: `Declare process loss on ${lot.variety}`,
			body: `${lot.remainingGrams} g remains on the same body. Drying or milling loss is declared — never guessed.`,
			href: "/platform",
			organ: "lot",
			lotId: lot.id,
			orderId: null,
			cellId: lot.cellId,
			severity: "note"
		});
	}
	const weather = gates.find((g) => g.code === "G9");
	proposals.push({
		id: "consult-firewall",
		moduleId: "advisory",
		action: "consult",
		title: "Consult the library, not a second brain",
		body: weather?.body ?? "AI may propose the next gate. A clerk declares price, freight, and loss.",
		href: "/library",
		organ: "ai",
		lotId: null,
		orderId: null,
		cellId: null,
		severity: "note"
	});
	const ranked = proposals.slice(0, 5);
	const next = ranked[0]?.title ?? "Next keystroke lives on the books.";
	const hits = queryLibraryKnowledge("agentic companion harvest lot remaining rupees", { limit: 1 });
	return {
		memory,
		next: `Companion · ${next}`,
		proposals: ranked,
		libraryHit: hits[0]?.title ?? null,
		firewall: "AI cannot write rupees"
	};
}
//#endregion
export { proposeCompanion as n, usePlatform as r, CompanionPanel as t };
