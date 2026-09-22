import { i as runtimeStats, n as WORKFLOWS, r as WORKFLOW_BY_ID } from "./registry-CRCHqiWy.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-qW1NheIP.js
function empty(message) {
	const stats = runtimeStats();
	return {
		livingPlugs: stats.livingPlugs,
		partialPlugs: stats.partialPlugs,
		modules: stats.modules,
		workflows: WORKFLOWS.length,
		lastRunId: null,
		lastError: message,
		bootedAt: null,
		runs: [],
		copilot: null
	};
}
function fail(message) {
	return {
		ok: false,
		error: message,
		...empty(message)
	};
}
var getModuleOs_createServerFn_handler = createServerRpc({
	id: "c2f2e699d6953cfd03c0b581c4d28c2362f9bb8903e321c840f390ed3e747a2c",
	name: "getModuleOs",
	filename: "src/lib/modules/fns.ts"
}, (opts) => getModuleOs.__executeServer(opts));
var getModuleOs = createServerFn({ method: "GET" }).handler(getModuleOs_createServerFn_handler, async () => {
	const { ensureModuleOs } = await import("./boot.server-CPfb5TKM.mjs");
	try {
		return {
			ok: true,
			...await ensureModuleOs()
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "module OS unread");
	}
});
var runModuleWorkflow_createServerFn_handler = createServerRpc({
	id: "fe434f95e71880a3a6a0efa77d4049d4af169c574c9a63a2260a377705c09d87",
	name: "runModuleWorkflow",
	filename: "src/lib/modules/fns.ts"
}, (opts) => runModuleWorkflow.__executeServer(opts));
var runModuleWorkflow = createServerFn({ method: "POST" }).validator((input) => ({
	workflowId: String(input?.workflowId ?? "").trim(),
	lotId: String(input?.lotId ?? "").trim(),
	query: String(input?.query ?? "").trim().slice(0, 240)
})).handler(runModuleWorkflow_createServerFn_handler, async ({ data }) => {
	if (!WORKFLOW_BY_ID[data.workflowId]) return fail("Unknown workflow.");
	const { executeWorkflow } = await import("./boot.server-CPfb5TKM.mjs");
	try {
		return {
			ok: true,
			...await executeWorkflow(data.workflowId, {
				lotId: data.lotId || null,
				query: data.query || data.workflowId
			})
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "workflow failed");
	}
});
var consultModule_createServerFn_handler = createServerRpc({
	id: "7c8c0d0cadb856953f4e4826833471e9121bbc23ad297edbda4650a0a96e4fbd",
	name: "consultModule",
	filename: "src/lib/modules/fns.ts"
}, (opts) => consultModule.__executeServer(opts));
var consultModule = createServerFn({ method: "POST" }).validator((input) => ({ query: String(input?.query ?? "").trim().slice(0, 240) })).handler(consultModule_createServerFn_handler, async ({ data }) => {
	if (!data.query) return fail("Name the pulse.");
	const { executeWorkflow } = await import("./boot.server-CPfb5TKM.mjs");
	try {
		return {
			ok: true,
			...await executeWorkflow("nerve-consult", { query: data.query })
		};
	} catch (err) {
		return fail(err instanceof Error ? err.message : "consult failed");
	}
});
//#endregion
export { consultModule_createServerFn_handler, getModuleOs_createServerFn_handler, runModuleWorkflow_createServerFn_handler };
