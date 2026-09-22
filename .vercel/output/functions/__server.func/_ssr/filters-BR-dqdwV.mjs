import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { i as cn, n as Button } from "./button-VjP3sqsL.mjs";
import { t as Input } from "./input-D2b3kEhG.mjs";
import { t as useLattice } from "./store-phAHycXe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/filters-BR-dqdwV.js
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"all",
	"living",
	"partial",
	"missing"
];
var KINDS = [
	"all",
	"technical",
	"thoughtful"
];
var ROLES = [
	"all",
	"organ",
	"bridge"
];
function Filters() {
	const statusFilter = useLattice((s) => s.statusFilter);
	const kindFilter = useLattice((s) => s.kindFilter);
	const roleFilter = useLattice((s) => s.roleFilter);
	const query = useLattice((s) => s.query);
	const showMesh = useLattice((s) => s.showMesh);
	const setStatusFilter = useLattice((s) => s.setStatusFilter);
	const setKindFilter = useLattice((s) => s.setKindFilter);
	const setRoleFilter = useLattice((s) => s.setRoleFilter);
	const setQuery = useLattice((s) => s.setQuery);
	const setShowMesh = useLattice((s) => s.setShowMesh);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 lg:flex-row lg:items-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search organs and ligaments",
					"aria-label": "Search organs and ligaments",
					className: "lg:max-w-xs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
					label: "Status",
					value: statusFilter,
					options: STATUSES,
					onChange: setStatusFilter
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
					label: "Kind",
					value: kindFilter,
					options: KINDS,
					onChange: setKindFilter
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChipRow, {
				label: "Nodes",
				value: roleFilter,
				options: ROLES,
				onChange: setRoleFilter
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				size: "sm",
				variant: showMesh ? "default" : "outline",
				className: "rounded-full",
				onClick: () => setShowMesh(!showMesh),
				children: showMesh ? "Missing mesh on" : "Missing mesh off"
			})]
		})]
	});
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
			className: cn("rounded-full capitalize"),
			onClick: () => onChange(opt),
			children: opt
		}, opt))]
	});
}
//#endregion
export { Filters as t };
