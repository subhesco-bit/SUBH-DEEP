import { CORE_BRIDGES } from "./bridges-core.ts";
import { MESH_BRIDGES } from "./bridges-mesh.ts";

export { CORE_BRIDGES } from "./bridges-core.ts";
export { MESH_BRIDGES } from "./bridges-mesh.ts";

/** One catalog. Core + missing mesh. Status is this organism, not GitHub WIRED. */
export const BRIDGES = [...CORE_BRIDGES, ...MESH_BRIDGES];
