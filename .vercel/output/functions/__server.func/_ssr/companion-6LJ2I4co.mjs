import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as useVillageBooks, r as Shell } from "./button-VjP3sqsL.mjs";
import { n as exceptions } from "./platform-D2p4dd1w.mjs";
import { n as proposeCompanion, t as CompanionPanel } from "./companion-BUs6VLPc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/companion-6LJ2I4co.js
var import_jsx_runtime = require_jsx_runtime();
function CompanionPage() {
	const books = useVillageBooks();
	const reading = books ? proposeCompanion(books, exceptions({
		journalBalanced: books.kpis.journalBalanced,
		lots: books.lots,
		receipts: books.receipts,
		orders: books.orders,
		payouts: books.payouts
	})) : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 py-6 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CompanionPanel, { reading })
	}) });
}
//#endregion
export { CompanionPage as component };
