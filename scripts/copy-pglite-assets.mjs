#!/usr/bin/env node
/**
 * Nitro bundles @electric-sql/pglite into _libs/electric-sql__pglite.mjs but
 * leaves pglite.data / .wasm behind. Production preview (no DATABASE_URL)
 * then crashes on PGLite bootstrap. Copy the assets next to the bundle.
 */
import { copyFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "node_modules", "@electric-sql", "pglite", "dist");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

async function walk(dir, depth = 0, found = []) {
  if (depth > 6) return found;
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isFile() && entry.name.includes("electric-sql__pglite")) found.push(path);
    else if (entry.isDirectory() && entry.name !== "node_modules") await walk(path, depth + 1, found);
  }
  return found;
}

async function main() {
  const bundles = [
    ...(await walk(join(root, ".vercel"))),
    ...(await walk(join(root, ".output"))),
  ];
  if (!bundles.length) {
    console.log("[pglite-assets] no bundled pglite — nothing to copy");
    return;
  }
  for (const bundle of bundles) {
    const destDir = dirname(bundle);
    for (const file of files) {
      await copyFile(join(srcDir, file), join(destDir, file));
    }
    console.log(`[pglite-assets] copied wasm/data next to ${bundle}`);
  }
}

main().catch((err) => {
  console.error("[pglite-assets] failed:", err?.message || err);
  process.exit(1);
});
