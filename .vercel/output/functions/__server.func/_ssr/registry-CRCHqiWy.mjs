import { t as AI_SYSTEMS } from "./catalog-BIfdppeO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/registry-CRCHqiWy.js
function step(code, moduleId, name, kind, organ, algorithm, emits, rupeeWrite = false) {
	return {
		code,
		moduleId,
		name,
		kind,
		organ,
		algorithm,
		emits,
		rupeeWrite
	};
}
var WORKFLOWS = [
	{
		id: "platform-bus",
		name: "Platform bus",
		thesis: "Attach every named AI as a module of one nerve. Count plugs. Do not say complete.",
		organ: "module",
		enterprise: "platform",
		steps: [
			step("P1", "backbone", "Attach backbone", "platform", "spine", "human-command", "backbone.attach"),
			step("P2", "core", "Core is fabric", "platform", "ai", "ai-firewall", "core.fold"),
			step("P3", "factory", "Plug directories", "platform", "module", "count-plugs", "factory.plug"),
			step("P4", "contract", "Bind organs", "platform", "module", "human-command", "contract.bind"),
			step("P5", "nervous", "Register events", "platform", "spine", "human-command", "nervous.register"),
			step("P6", "complete", "Count living plugs", "platform", "ai", "count-plugs", "complete.count"),
			step("P7", "selfheal", "Heal missing harvest pulse", "platform", "spine", "library-consult", "selfheal.repair")
		]
	},
	{
		id: "harvest-mint",
		name: "Harvest mint",
		thesis: "A harvest names a cell and mints one lot. AI proposes. The clerk declares mass. Remaining = grams.",
		organ: "lot",
		enterprise: "rural-erp",
		steps: [
			step("H1", "contract", "Human command", "gate", "farmer", "human-command", "contract.command"),
			step("H2", "gateway", "One door", "middleware", "spine", "ai-firewall", "gateway.ingress"),
			step("H3", "orchestrator", "Route harvest", "middleware", "spine", "orchestrator-route", "orchestrator.route"),
			step("H4", "fabric", "Cost cap 0 paise", "decision", "rupee", "ai-firewall", "fabric.allow"),
			step("H5", "coordinator", "Consult library", "ai", "ai", "library-consult", "coordinator.consult"),
			step("H6", "nervous", "Subscribe harvest.completed", "middleware", "spine", "human-command", "nervous.subscribe"),
			step("H7", "decision", "Mass is declared", "algorithm", "lot", "remaining-gate", "decision.act"),
			step("H8", "erp-agents", "Propose lot.mint", "ai", "lot", "human-command", "erpAgent.propose"),
			step("H9", "agentic", "Companion proposes", "ai", "farmer", "copilot-next", "agentic.propose"),
			step("H10", "opsintel", "Read village books", "algorithm", "erp", "remaining-gate", "opsintel.read"),
			step("H11", "copilot", "Next keystroke", "ai", "erp", "copilot-next", "copilot.suggest")
		]
	},
	{
		id: "warehouse-intake",
		name: "Warehouse intake",
		thesis: "The same lot body inwards. Media frames the GI marker. Channels share the sack.",
		organ: "warehouse",
		enterprise: "rural-erp",
		steps: [
			step("W1", "decision", "Remaining mass", "gate", "lot", "remaining-gate", "decision.remaining"),
			step("W2", "erp-agents", "Inward receipt", "erp", "warehouse", "remaining-gate", "warehouse.intake"),
			step("W3", "media", "GI in the frame", "ai", "trace", "gi-frame", "media.attach"),
			step("W4", "omnichannel", "Same sack, many doors", "comms", "marketplace", "gi-frame", "omnichannel.list"),
			step("W5", "decision", "Lien gate", "gate", "warehouse", "pledge-gate", "decision.lien"),
			step("W6", "copilot", "Next keystroke", "ai", "erp", "copilot-next", "copilot.suggest")
		]
	},
	{
		id: "offtake-settle",
		name: "Offtake settle",
		thesis: "Declared ₹/kg. Freight declared (zero allowed). Journal balances. paymentRef required.",
		organ: "orders",
		enterprise: "rural-erp",
		steps: [
			step("T1", "decision", "Remaining holds", "gate", "lot", "remaining-gate", "decision.hold"),
			step("T2", "fabric", "AI cannot write price", "decision", "rupee", "ai-firewall", "fabric.allow"),
			step("T3", "erp-agents", "Price declared", "erp", "marketplace", "price-declared", "orders.price"),
			step("T4", "decision", "Price waterfall", "algorithm", "rupee", "price-waterfall", "decision.waterfall"),
			step("T5", "ecommerce", "Rank by farmer rupee", "ai", "marketplace", "fvie-rank", "ecom.rank"),
			step("T6", "brain", "Name the organ moved", "ai", "rupee", "fvie-rank", "brain.decide"),
			step("T7", "backbone", "Journal balance", "algorithm", "rupee", "journal-balance", "backbone.journal"),
			step("T8", "erp-agents", "paymentRef", "gate", "orders", "payment-ref", "orders.settle"),
			step("T9", "decision", "Qty-weighted payout", "algorithm", "fpo", "qty-weighted", "fpo.payout"),
			step("T10", "advisory", "Hours-to-pay", "ai", "farmer", "hours-to-pay", "advisory.explain"),
			step("T11", "copilot", "Next keystroke", "ai", "erp", "copilot-next", "copilot.suggest")
		]
	},
	{
		id: "nerve-consult",
		name: "Nerve consult",
		thesis: "Gateway, coordinator, library. Mouths are tissues of the companion. No rupee write.",
		organ: "ai",
		enterprise: "intelligence",
		steps: [
			step("N1", "gateway", "Ingress consult", "middleware", "spine", "ai-firewall", "gateway.ingress"),
			step("N2", "coordinator", "Library first", "ai", "ai", "library-consult", "coordinator.consult"),
			step("N3", "conversational", "Mouth of companion", "comms", "farmer", "library-consult", "conversational.say"),
			step("N4", "voice", "Door in the cell language", "comms", "household", "copilot-next", "voice.dictate"),
			step("N5", "agentic", "Propose next gate", "ai", "farmer", "copilot-next", "agentic.propose"),
			step("N6", "complete", "Count plugs", "platform", "ai", "count-plugs", "complete.count"),
			step("N7", "copilot", "Next keystroke", "ai", "erp", "copilot-next", "copilot.suggest")
		]
	},
	{
		id: "domain-advise",
		name: "Domain advise",
		thesis: "Variety, weather, forecast as positioning. EMI pause is a rupee path. Prices stay declared.",
		organ: "crop",
		enterprise: "intelligence",
		steps: [
			step("D1", "agricultural", "Genome organ", "domain", "crop", "library-consult", "agri.advise"),
			step("D2", "advisory", "Weather reflex", "ai", "soil", "library-consult", "advisory.weather"),
			step("D3", "advanced", "Forecast as positioning", "ai", "ai", "ai-firewall", "advanced.score"),
			step("D4", "fabric", "No invented ₹", "decision", "rupee", "ai-firewall", "fabric.allow"),
			step("D5", "decision", "Act or hide", "decision", "reflex", "copilot-next", "decision.act")
		]
	}
];
var WORKFLOW_BY_ID = Object.fromEntries(WORKFLOWS.map((w) => [w.id, w]));
function workflowsForModule(moduleId) {
	return WORKFLOWS.filter((w) => w.steps.some((s) => s.moduleId === moduleId));
}
var LAYERS = {
	orchestrator: [
		"middleware",
		"workflow",
		"api",
		"platform"
	],
	coordinator: [
		"decision",
		"comms",
		"service"
	],
	fabric: [
		"middleware",
		"decision",
		"platform",
		"api"
	],
	backbone: [
		"platform",
		"service",
		"middleware"
	],
	core: ["platform", "service"],
	gateway: [
		"middleware",
		"comms",
		"api"
	],
	nervous: [
		"platform",
		"middleware",
		"workflow"
	],
	decision: [
		"decision",
		"algorithm",
		"workflow"
	],
	"erp-agents": [
		"domain",
		"workflow",
		"algorithm",
		"service"
	],
	factory: ["platform", "api"],
	contract: [
		"platform",
		"api",
		"domain"
	],
	agentic: [
		"workflow",
		"decision",
		"ui"
	],
	copilot: [
		"ui",
		"workflow",
		"comms"
	],
	brain: ["decision", "algorithm"],
	conversational: ["comms", "ui"],
	voice: ["comms", "ui"],
	advisory: ["domain", "decision"],
	agricultural: ["domain", "algorithm"],
	omnichannel: ["comms", "domain"],
	selfheal: ["platform", "workflow"],
	opsintel: [
		"domain",
		"algorithm",
		"ui"
	],
	complete: ["platform"],
	ecommerce: ["domain", "algorithm"],
	media: ["domain", "ui"],
	advanced: ["algorithm", "decision"]
};
var ENTERPRISE = {
	orchestrator: "Route one signal to one module. Sixteen mouths is a tumour.",
	coordinator: "Consult the library, name an organ, then a model may speak.",
	fabric: "Cost cap and guardrail under every organ. Spend on assertions is 0 paise.",
	backbone: "Domain AIs attach once. Duplicate IDs are a fracture.",
	core: "Core is fabric. Two modules sharing M400 is neither a module.",
	gateway: "One door, one audit, one cost cap.",
	nervous: "Unknown events fail. They do not forget.",
	decision: "Sense, decide, act. A decision that cannot name a rupee path is decoration.",
	"erp-agents": "Subscribe to harvest.completed. Human approves. ERP records.",
	factory: "Plug moduleId to organs and events. A list of folders is not a nervous system.",
	contract: "Operations, organs, emits, human command. Prefixes are doors.",
	agentic: "Propose lot.mint on harvest. Cell approves. Companion never executes alone.",
	copilot: "Next keystroke inside Books, not beside them.",
	brain: "One brain. Scoring that names the organ it moved.",
	conversational: "Voice of the companion. Not a product.",
	voice: "Dictate harvest in the cell's language, into agentic.",
	advisory: "weather.alert that does not freeze EMI is gossip.",
	agricultural: "Variety and season write the genome organ.",
	omnichannel: "Same sack, many doors. Never a second catalog.",
	selfheal: "Repair missing harvest.completed or do not use the word heal.",
	opsintel: "Read village books. One ledger, one fever.",
	complete: "Count living plugs. Do not claim complete.",
	ecommerce: "Rank by declared farmer rupee, not SKU affinity.",
	media: "GI marker in the frame of the same lot body.",
	advanced: "Forecast as positioning. Fold into fabric. Never invent ₹."
};
function layersFor(id) {
	return LAYERS[id] ?? ["service"];
}
var MODULE_RUNTIME = AI_SYSTEMS.map((s) => {
	const workflowIds = WORKFLOWS.filter((w) => w.steps.some((st) => st.moduleId === s.id)).map((w) => w.id);
	const rupeeWrite = false;
	const plug = workflowIds.length ? "living" : "missing";
	return {
		id: s.id,
		layers: layersFor(s.id),
		subscribes: s.organs.map((o) => `${o}.*`),
		emits: workflowIds.map((id) => `${s.id}.${id}`),
		rupeeWrite,
		workflowIds,
		plug,
		enterprise: ENTERPRISE[s.id] ?? s.contract
	};
});
Object.fromEntries(MODULE_RUNTIME.map((m) => [m.id, m]));
function runtimeStats() {
	const living = MODULE_RUNTIME.filter((m) => m.plug === "living").length;
	const partial = MODULE_RUNTIME.filter((m) => m.plug === "partial").length;
	return {
		modules: MODULE_RUNTIME.length,
		livingPlugs: living,
		partialPlugs: partial,
		missingPlugs: MODULE_RUNTIME.length - living - partial,
		workflows: WORKFLOWS.length
	};
}
//#endregion
export { workflowsForModule as a, runtimeStats as i, WORKFLOWS as n, WORKFLOW_BY_ID as r, MODULE_RUNTIME as t };
