import { o as __toESM } from "../_runtime.mjs";
import { n as formatRupee } from "./money-C1ax4Fwq.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { d as useRouterState, v as getRouteApi, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as Slot } from "../_libs/@radix-ui/react-popper+[...].mjs";
import { _ as runModuleWorkflow, a as enrollFarmer, b as settleSale, c as getOrganism, d as pledgeLot, f as poolSell, g as recordInput, h as recordHarvest, i as consultModule, m as publishSpineEvent, n as clearLien, o as getBooks, r as consultLibrary, s as getModuleOs, t as bootOrganism, u as intakeLot, v as sellLot, y as settlePoolSale } from "./fns-BuGhDXB0.mjs";
import { S as Activity, c as Radio, d as Landmark, f as GitBranch, h as Coins, i as Users, l as Network, m as Cpu, n as Wheat, o as Spline, p as Ear, r as Warehouse, s as Scale, t as Workflow, u as LayoutGrid, v as Boxes, x as ArrowLeftRight, y as BookOpen } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as Provider } from "../_libs/radix-ui__react-tooltip.mjs";
import { n as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-VjP3sqsL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var TooltipProvider = Provider;
var useOrganism = create((set, get) => ({
	ready: false,
	booting: false,
	consulting: false,
	snapshot: null,
	error: null,
	lastConsult: null,
	hydrate: (snapshot) => {
		set({
			snapshot,
			ready: snapshot.autoOp === "living",
			error: snapshot.lastError,
			booting: false
		});
	},
	boot: async () => {
		if (get().booting) return;
		if (get().ready && get().snapshot) return;
		set({
			booting: true,
			error: null
		});
		try {
			const result = await bootOrganism();
			if (!result.ok) {
				set({
					booting: false,
					error: result.error ?? result.lastError,
					snapshot: result,
					ready: false
				});
				return;
			}
			set({
				booting: false,
				ready: result.autoOp === "living",
				snapshot: result,
				error: null
			});
		} catch (err) {
			set({
				booting: false,
				error: err instanceof Error ? err.message : "boot failed"
			});
		}
	},
	refresh: async () => {
		try {
			const result = await getOrganism();
			if (result.ok) set({
				snapshot: result,
				ready: result.autoOp === "living",
				error: result.lastError
			});
		} catch {}
	},
	consult: async (query, organId) => {
		set({
			consulting: true,
			error: null
		});
		try {
			const result = await consultLibrary({ data: {
				query,
				organId: organId ?? null
			} });
			if (!result.ok) {
				set({
					consulting: false,
					error: result.error
				});
				return;
			}
			const snap = get().snapshot;
			set({
				consulting: false,
				lastConsult: {
					reading: result.reading,
					source: result.source
				},
				snapshot: snap ? {
					...snap,
					pulses: result.pulses,
					events: result.events,
					lastPulseAt: (/* @__PURE__ */ new Date()).toISOString()
				} : snap
			});
		} catch (err) {
			set({
				consulting: false,
				error: err instanceof Error ? err.message : "consult failed"
			});
		}
	},
	publish: async (signal, organId, ligamentId) => {
		try {
			const result = await publishSpineEvent({ data: {
				signal,
				organId: organId ?? null,
				ligamentId: ligamentId ?? null
			} });
			if (result.ok) {
				const snap = get().snapshot;
				if (snap) set({ snapshot: {
					...snap,
					events: result.events
				} });
			}
		} catch {}
	}
}));
var rootRoute$3 = getRouteApi("__root__");
/** Hydrates from the server auto-boot. Falls back to a client pulse if needed. */
function OrganismBoot() {
	const loaded = rootRoute$3.useLoaderData();
	const hydrate = useOrganism((s) => s.hydrate);
	const boot = useOrganism((s) => s.boot);
	const organism = loaded.organism;
	(0, import_react.useEffect)(() => {
		if (organism) hydrate(organism);
		if (organism?.ok && organism.autoOp === "living") return;
		boot();
	}, [
		organism,
		hydrate,
		boot
	]);
	return null;
}
var useModuleOs = create((set) => ({
	ready: false,
	busy: false,
	error: null,
	snapshot: null,
	hydrate: (snapshot) => set({
		snapshot,
		ready: true,
		error: snapshot.lastError
	}),
	refresh: async () => {
		const res = await getModuleOs();
		if (!res.ok) {
			set({
				error: res.error ?? "module OS unread",
				snapshot: res,
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
	run: async (workflowId, lotId) => {
		set({
			busy: true,
			error: null
		});
		const res = await runModuleWorkflow({ data: {
			workflowId,
			lotId
		} });
		if (!res.ok) {
			set({
				busy: false,
				error: res.error ?? "workflow failed",
				snapshot: res
			});
			return false;
		}
		set({
			busy: false,
			snapshot: res,
			ready: true,
			error: null
		});
		return true;
	},
	consult: async (query) => {
		set({
			busy: true,
			error: null
		});
		const res = await consultModule({ data: { query } });
		if (!res.ok) {
			set({
				busy: false,
				error: res.error ?? "consult failed",
				snapshot: res
			});
			return false;
		}
		set({
			busy: false,
			snapshot: res,
			ready: true,
			error: null
		});
		return true;
	}
}));
var rootRoute$2 = getRouteApi("__root__");
function ModulesBoot() {
	const loaded = rootRoute$2.useLoaderData();
	const hydrate = useModuleOs((s) => s.hydrate);
	const refresh = useModuleOs((s) => s.refresh);
	const modules = "modules" in loaded ? loaded.modules : null;
	(0, import_react.useEffect)(() => {
		if (modules && modules.ok) hydrate(modules);
		else refresh();
	}, [
		modules,
		hydrate,
		refresh
	]);
	return null;
}
function apply(set, result) {
	if (!result.ok) {
		set({
			busy: false,
			error: result.error ?? "books failed"
		});
		return false;
	}
	set({
		busy: false,
		error: null,
		ready: true,
		books: result
	});
	return true;
}
var useBooks = create((set) => ({
	ready: false,
	busy: false,
	error: null,
	books: null,
	hydrate: (snapshot) => set({
		books: snapshot,
		ready: true,
		error: null
	}),
	refresh: async () => {
		try {
			apply(set, await getBooks());
		} catch {}
	},
	harvest: async (input) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await recordHarvest({ data: input }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "harvest failed"
			});
			return false;
		}
	},
	intake: async (lotId) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await intakeLot({ data: { lotId } }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "intake failed"
			});
			return false;
		}
	},
	pledge: async (receiptId, lender) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await pledgeLot({ data: {
				receiptId,
				lender
			} }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "pledge failed"
			});
			return false;
		}
	},
	unpledge: async (receiptId) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await clearLien({ data: { receiptId } }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "lien failed"
			});
			return false;
		}
	},
	sell: async (input) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await sellLot({ data: input }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "sale failed"
			});
			return false;
		}
	},
	settle: async (orderId, paymentRef, hoursToPay) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await settleSale({ data: {
				orderId,
				paymentRef,
				hoursToPay
			} }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "settle failed"
			});
			return false;
		}
	},
	inputCost: async (input) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await recordInput({ data: input }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "input failed"
			});
			return false;
		}
	},
	enroll: async (input) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await enrollFarmer({ data: input }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "enroll failed"
			});
			return false;
		}
	},
	pool: async (input) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await poolSell({ data: input }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "pool failed"
			});
			return false;
		}
	},
	settlePool: async (poolId, paymentRef, hoursToPay) => {
		set({
			busy: true,
			error: null
		});
		try {
			return apply(set, await settlePoolSale({ data: {
				poolId,
				paymentRef,
				hoursToPay
			} }));
		} catch (err) {
			set({
				busy: false,
				error: err instanceof Error ? err.message : "pool settle failed"
			});
			return false;
		}
	}
}));
var rootRoute$1 = getRouteApi("__root__");
/** Hydrates village books from the root loader. Seed is server-side and idempotent. */
function BooksBoot() {
	const loaded = rootRoute$1.useLoaderData();
	const hydrate = useBooks((s) => s.hydrate);
	const ready = useBooks((s) => s.ready);
	(0, import_react.useEffect)(() => {
		if (loaded.books?.ok) hydrate(loaded.books);
	}, [loaded.books, hydrate]);
	(0, import_react.useEffect)(() => {
		if (ready) return;
		if (loaded.books?.ok) return;
		useBooks.getState().refresh();
	}, [ready, loaded.books]);
	return null;
}
function useVillageBooks() {
	const loaded = rootRoute$1.useLoaderData();
	return useBooks((s) => s.books) ?? (loaded.books?.ok ? loaded.books : null);
}
var rootRoute = getRouteApi("__root__");
var NAV = [
	{
		to: "/",
		label: "Books",
		icon: Landmark
	},
	{
		to: "/cells",
		label: "Cells",
		icon: Users
	},
	{
		to: "/lots",
		label: "Lots",
		icon: Wheat
	},
	{
		to: "/warehouse",
		label: "Warehouse",
		icon: Warehouse
	},
	{
		to: "/ledger",
		label: "Ledger",
		icon: Boxes
	},
	{
		to: "/trade",
		label: "Trade",
		icon: ArrowLeftRight
	},
	{
		to: "/platform",
		label: "Platform",
		icon: LayoutGrid
	},
	{
		to: "/organism",
		label: "Organism",
		icon: Spline
	},
	{
		to: "/mesh",
		label: "Mesh",
		icon: Network
	},
	{
		to: "/ligaments",
		label: "Ligaments",
		icon: GitBranch
	},
	{
		to: "/pulse",
		label: "Pulse",
		icon: Activity
	},
	{
		to: "/library",
		label: "Library",
		icon: BookOpen
	},
	{
		to: "/nerve",
		label: "Nerve",
		icon: Radio
	},
	{
		to: "/economy",
		label: "Economy",
		icon: Coins
	},
	{
		to: "/companion",
		label: "Companion",
		icon: Ear
	},
	{
		to: "/modules",
		label: "Modules",
		icon: Workflow
	},
	{
		to: "/charter",
		label: "Charter",
		icon: Scale
	},
	{
		to: "/systems",
		label: "Systems",
		icon: Cpu
	}
];
function Shell({ children }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const root = rootRoute.useLoaderData();
	const autoOp = useOrganism((s) => {
		if (s.snapshot?.autoOp) return s.snapshot.autoOp;
		if (s.booting) return "booting";
		if (root.organism?.ok) return root.organism.autoOp;
		return "missing";
	});
	const books = useVillageBooks();
	const error = useBooks((s) => s.error) ?? (root.books?.ok ? null : root.books?.error ?? null);
	const fpo = books?.fpo;
	const kpis = books?.kpis;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, {
		delayDuration: 180,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrganismBoot, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BooksBoot, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModulesBoot, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-dvh overflow-x-hidden bg-background text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "border-b border-border",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] font-medium uppercase tracking-[0.18em] text-muted",
										children: ["AFRERA · Rural ERP · ", fpo?.village ?? "Langthasa"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl",
										children: fpo?.name ?? "Hills Chakhao Collective"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 max-w-xl text-sm text-muted",
										children: "Village books: cells, living lots, warehouse receipts, declared farmgate. The organism map still shows every missing ligament."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Cells",
										value: kpis?.cells ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Lots",
										value: kpis?.lots ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Open",
										value: kpis ? formatRupee(kpis.openPaise) : "—",
										accent: "gap"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Auto-op",
										value: autoOp,
										accent: autoOp === "living" ? "live" : autoOp === "partial" || autoOp === "booting" ? "partial" : "gap"
									})
								]
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto max-w-[1400px] px-4 pb-3 text-sm text-destructive sm:px-6",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-2 sm:px-4",
							children: NAV.map((item) => {
								const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("flex h-11 shrink-0 items-center gap-2 rounded-t-md px-3 text-sm font-medium transition-colors duration-150", active ? "bg-surface text-foreground" : "text-muted hover:text-foreground"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										className: "size-4",
										strokeWidth: 1.75
									}), item.label]
								}, item.to);
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-[1400px]",
					children
				})]
			})
		]
	});
}
function Stat({ label, value, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-[0.14em] text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("font-mono text-lg tabular-nums capitalize", accent === "gap" ? "text-gap" : accent === "live" ? "text-live" : accent === "partial" ? "text-partial" : "text-foreground"),
			children: value
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase", {
	variants: { variant: {
		default: "border-border text-muted",
		live: "border-live/40 text-live",
		partial: "border-partial/40 text-partial",
		gap: "border-gap/40 text-gap",
		solid: "border-border bg-accent text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[opacity,transform,background-color,color,border-color] duration-150 ease-[var(--ease-smooth-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			outline: "border border-border bg-transparent text-foreground hover:bg-accent",
			ghost: "text-foreground hover:bg-accent",
			secondary: "bg-surface text-foreground border border-border hover:bg-accent"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { useBooks as a, useVillageBooks as c, cn as i, Button as n, useModuleOs as o, Shell as r, useOrganism as s, Badge as t };
