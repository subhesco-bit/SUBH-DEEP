import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fns-BuGhDXB0.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var bootOrganism = createServerFn({ method: "POST" }).handler(createSsrRpc("2d3d3046d306433b92abf45f6004bc128f2f8eaaf6ca06ef83eac29c9cda2b5e"));
var getOrganism = createServerFn({ method: "GET" }).handler(createSsrRpc("6b746126b9907148680b3a3c34bcec4d143d4401d4e7436f0f9da274f1c3b55a"));
var publishSpineEvent = createServerFn({ method: "POST" }).validator((input) => ({
	signal: String(input?.signal ?? "").slice(0, 240),
	organId: input?.organId ?? null,
	ligamentId: input?.ligamentId ?? null
})).handler(createSsrRpc("38fd788e9e3009183ef39ea1bf4b748cc86a5032cdfae83d06f1147ec718a2ec"));
var consultLibrary = createServerFn({ method: "POST" }).validator((input) => ({
	query: String(input?.query ?? "").trim().slice(0, 500),
	organId: input?.organId ?? null
})).handler(createSsrRpc("a33a11123d727690641395698b53da2d1d0220679ba258f125368f40911e01df"));
var getBooks = createServerFn({ method: "GET" }).handler(createSsrRpc("2688d08b6e7aa35db610cf2e9141498c01e0a1c5f35ededbbc55a48f6a5419fb"));
var recordHarvest = createServerFn({ method: "POST" }).validator((input) => ({
	cellId: String(input?.cellId ?? ""),
	variety: String(input?.variety ?? "").trim().slice(0, 80),
	commodity: String(input?.commodity ?? "paddy").trim().slice(0, 40),
	kg: String(input?.kg ?? ""),
	moisture: String(input?.moisture ?? ""),
	gi: Boolean(input?.gi)
})).handler(createSsrRpc("568f827d8c911d3703e13791351001e25e734bc03c251484e16acf9d2d27ee9a"));
var intakeLot = createServerFn({ method: "POST" }).validator((input) => ({
	lotId: String(input?.lotId ?? ""),
	facility: String(input?.facility ?? "Langthasa godown").trim().slice(0, 80)
})).handler(createSsrRpc("ee96b15a4fb0bfa0eaeccd047c9532f0a30854d271f687addfc8128616e65621"));
var pledgeLot = createServerFn({ method: "POST" }).validator((input) => ({
	receiptId: String(input?.receiptId ?? ""),
	lender: String(input?.lender ?? "").trim().slice(0, 80)
})).handler(createSsrRpc("352e47ad70f0a1ddbb880cbac92806969ca1a4b3e401bdedff1e7921a016798a"));
var clearLien = createServerFn({ method: "POST" }).validator((input) => ({ receiptId: String(input?.receiptId ?? "") })).handler(createSsrRpc("37af67cc9fb62a6106357ca94cde413b7beeaf6952d87964c28e829da42eaa59"));
var sellLot = createServerFn({ method: "POST" }).validator((input) => ({
	lotId: String(input?.lotId ?? ""),
	buyer: String(input?.buyer ?? "").trim().slice(0, 80),
	kg: String(input?.kg ?? ""),
	pricePerKg: String(input?.pricePerKg ?? ""),
	freightPerKg: String(input?.freightPerKg ?? "4")
})).handler(createSsrRpc("41ce23f4c07d6d2ff8a6518bc31c7d99f0d4afc2b2d35584d24c609e057609d4"));
var settleSale = createServerFn({ method: "POST" }).validator((input) => ({
	orderId: String(input?.orderId ?? ""),
	paymentRef: String(input?.paymentRef ?? "").trim().slice(0, 80),
	hoursToPay: String(input?.hoursToPay ?? "24")
})).handler(createSsrRpc("a42ff5854486e8e8166773b62d59a281dd2917947c3b0855f1c01fb26cafc950"));
var recordInput = createServerFn({ method: "POST" }).validator((input) => ({
	cellId: String(input?.cellId ?? ""),
	kind: String(input?.kind ?? "seed"),
	qty: String(input?.qty ?? "1"),
	unit: String(input?.unit ?? "unit").slice(0, 20),
	amount: String(input?.amount ?? ""),
	memo: String(input?.memo ?? "").slice(0, 160)
})).handler(createSsrRpc("e21747a4d61426cab3ed02ffd2732561067a0eb981a2788672f5c812c4f23ebd"));
var enrollFarmer = createServerFn({ method: "POST" }).validator((input) => ({
	name: String(input?.name ?? "").trim().slice(0, 80),
	household: String(input?.household ?? "").trim().slice(0, 80),
	acres: String(input?.acres ?? ""),
	notes: String(input?.notes ?? "").trim().slice(0, 160)
})).handler(createSsrRpc("a85b8899c73c46c9a950433013a58e8bed0b1d01b3c8233f71a615e62fcae027"));
var poolSell = createServerFn({ method: "POST" }).validator((input) => ({
	commodity: String(input?.commodity ?? "").trim().slice(0, 40),
	buyer: String(input?.buyer ?? "").trim().slice(0, 80),
	kg: String(input?.kg ?? ""),
	pricePerKg: String(input?.pricePerKg ?? ""),
	freightPerKg: String(input?.freightPerKg ?? "4")
})).handler(createSsrRpc("0db3d7d5e94e3e6be873546cb3053c2e8c7eb045c78d9150fe59d715c531a4b5"));
var settlePoolSale = createServerFn({ method: "POST" }).validator((input) => ({
	poolId: String(input?.poolId ?? ""),
	paymentRef: String(input?.paymentRef ?? "").trim().slice(0, 80),
	hoursToPay: String(input?.hoursToPay ?? "24")
})).handler(createSsrRpc("aacbac26add35e7da9a5a5d7ada9a3dda9190c809f2df491f83646a118e4aa83"));
var getPlatform = createServerFn({ method: "GET" }).handler(createSsrRpc("dc6571dfadb17ec4ff586f6f65db68b84a380a9fcb605f17cbf1747bb836fca6"));
var processDeclared = createServerFn({ method: "POST" }).validator((input) => ({
	lotId: String(input?.lotId ?? ""),
	kind: String(input?.kind ?? "drying"),
	lossKg: String(input?.lossKg ?? "0"),
	note: String(input?.note ?? "").trim().slice(0, 160)
})).handler(createSsrRpc("c8792138af86d97a726c912754d2d84cb15c581155c03d9916a350324f6cb58b"));
var getModuleOs = createServerFn({ method: "GET" }).handler(createSsrRpc("c2f2e699d6953cfd03c0b581c4d28c2362f9bb8903e321c840f390ed3e747a2c"));
var runModuleWorkflow = createServerFn({ method: "POST" }).validator((input) => ({
	workflowId: String(input?.workflowId ?? "").trim(),
	lotId: String(input?.lotId ?? "").trim(),
	query: String(input?.query ?? "").trim().slice(0, 240)
})).handler(createSsrRpc("fe434f95e71880a3a6a0efa77d4049d4af169c574c9a63a2260a377705c09d87"));
var consultModule = createServerFn({ method: "POST" }).validator((input) => ({ query: String(input?.query ?? "").trim().slice(0, 240) })).handler(createSsrRpc("7c8c0d0cadb856953f4e4826833471e9121bbc23ad297edbda4650a0a96e4fbd"));
//#endregion
export { runModuleWorkflow as _, enrollFarmer as a, settleSale as b, getOrganism as c, pledgeLot as d, poolSell as f, recordInput as g, recordHarvest as h, consultModule as i, getPlatform as l, publishSpineEvent as m, clearLien as n, getBooks as o, processDeclared as p, consultLibrary as r, getModuleOs as s, bootOrganism as t, intakeLot as u, sellLot as v, settlePoolSale as y };
