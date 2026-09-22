#!/usr/bin/env node
/** Dump docs/os/catalog.json and todos.json from the kernel. Dual-truth: do not invent. */
import { writeFileSync } from "node:fs";
import { emitOsCatalog, emitOsTodos } from "../src/lib/os/compose.ts";

writeFileSync("docs/os/catalog.json", `${JSON.stringify(emitOsCatalog(), null, 2)}\n`);
writeFileSync("docs/os/todos.json", `${JSON.stringify(emitOsTodos(), null, 2)}\n`);
console.log("wrote docs/os/catalog.json and docs/os/todos.json");
