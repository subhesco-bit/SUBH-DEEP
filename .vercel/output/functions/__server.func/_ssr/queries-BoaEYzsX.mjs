import { i as queryLibraryKnowledge } from "./match-O6S8HVhu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queries-BoaEYzsX.js
var CANONICAL_QUERIES = [
	{
		id: "q01",
		organId: "lot",
		title: "Harvest dies at the portal",
		query: "Why did the Chakhao harvest die at the portal instead of minting a lot?"
	},
	{
		id: "q02",
		organId: "ai",
		title: "DORA unit of design",
		query: "What is DORA organ ligament and blood if modules without ligaments are cadavers?"
	},
	{
		id: "q03",
		organId: "farmer",
		title: "Farmer is a cell",
		query: "How is the farmer a cell not a role in RBAC?"
	},
	{
		id: "q04",
		organId: "spine",
		title: "Spine never publishes",
		query: "Why does harvest.completed never leave eventBus and the spine never publish?"
	},
	{
		id: "q05",
		organId: "lot",
		title: "Lot is one body",
		query: "How does one lot bind crop warehouse trace and marketplace as one body?"
	},
	{
		id: "q06",
		organId: "rupee",
		title: "Rupee path",
		query: "What is the rupee path a recommendation must show on the farmer prosperity ledger?"
	},
	{
		id: "q07",
		organId: "reflex",
		title: "Reflex not chatbot",
		query: "Why must weather.alert fire a reflex instead of a chatbot page?"
	},
	{
		id: "q08",
		organId: "fpo",
		title: "FPO to household",
		query: "How does the FPO bind household and farmer cell as one living unit?"
	},
	{
		id: "q09",
		organId: "scheme",
		title: "Scheme into blood",
		query: "Where does a scheme subsidy enter rupee blood instead of sitting as a portal form?"
	},
	{
		id: "q10",
		organId: "cloud",
		title: "Energy cloud lungs",
		query: "How does the energy cloud bind RECIE lungs to logistics cost per kilogram?"
	},
	{
		id: "q11",
		organId: "foodgraph",
		title: "Time is a dimension",
		query: "How does Magh time enter demand contract and foodgraph so next season is not a surprise?"
	},
	{
		id: "q12",
		organId: "livestock",
		title: "Livestock to the cell",
		query: "What ligament binds livestock to the farmer cell instead of another orphan module?"
	},
	{
		id: "q13",
		organId: "foodgraph",
		title: "Kitchen to next season",
		query: "How does the foodgraph remember kitchen pithas and close a next-season contract?"
	},
	{
		id: "q14",
		organId: "ai",
		title: "Library is memory",
		query: "Why is the AI-integrated library a hippocampus of memory not a chatbot search box?"
	},
	{
		id: "q15",
		organId: "spine",
		title: "Boot without a key",
		query: "What must auto-operation do on boot: migrate seed bind diagnose without an API key?"
	},
	{
		id: "q16",
		organId: "module",
		title: "Agentic never plugs",
		query: "Why is the agentic companion a WIRED skeleton module that never plugs into harvest?"
	},
	{
		id: "q17",
		organId: "module",
		title: "Module OS plugs harvest",
		query: "How does the module OS plug agentic into harvest without inventing rupees?"
	},
	{
		id: "q18",
		organId: "module",
		title: "Living companion proposes",
		query: "What does the living agentic companion propose on Magh books without writing rupees?"
	},
	{
		id: "q19",
		organId: "ai",
		title: "Token economy",
		query: "How does the token economy pack library hits instead of dumping GitHub modules into an LLM?"
	}
];
var CANONICAL_QUERY_COUNT = CANONICAL_QUERIES.length;
function answerCanonicalQueries() {
	return CANONICAL_QUERIES.map((q) => {
		const hits = queryLibraryKnowledge(q.query, { limit: 6 });
		return {
			...q,
			hits,
			missing: hits.length === 0
		};
	});
}
//#endregion
export { CANONICAL_QUERY_COUNT as n, answerCanonicalQueries as r, CANONICAL_QUERIES as t };
