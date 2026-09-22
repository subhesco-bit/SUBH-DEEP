import { createServerFn } from "@tanstack/react-start";
import { diagnose } from "@/lib/library";
import { WORKFLOW_BY_ID, WORKFLOWS } from "./workflows";
import { MODULE_RUNTIME, runtimeStats } from "./registry";
import type { ModuleOsResult, ModuleOsSnapshot } from "./types";

function empty(message: string): ModuleOsSnapshot {
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
    copilot: null,
  };
}

function fail(message: string): ModuleOsResult {
  return { ok: false, error: message, ...empty(message) };
}

export const getModuleOs = createServerFn({ method: "GET" }).handler(async (): Promise<ModuleOsResult> => {
  const { ensureModuleOs } = await import("./boot.server");
  try {
    const snapshot = await ensureModuleOs();
    return { ok: true, ...snapshot };
  } catch (err) {
    return fail(err instanceof Error ? err.message : "module OS unread");
  }
});

export const runModuleWorkflow = createServerFn({ method: "POST" })
  .validator((input: { workflowId: string; lotId?: string; query?: string }) => ({
    workflowId: String(input?.workflowId ?? "").trim(),
    lotId: String(input?.lotId ?? "").trim(),
    query: String(input?.query ?? "").trim().slice(0, 240),
  }))
  .handler(async ({ data }): Promise<ModuleOsResult> => {
    if (!WORKFLOW_BY_ID[data.workflowId]) return fail("Unknown workflow.");
    const { executeWorkflow } = await import("./boot.server");
    try {
      const snapshot = await executeWorkflow(data.workflowId, {
        lotId: data.lotId || null,
        query: data.query || data.workflowId,
      });
      return { ok: true, ...snapshot };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "workflow failed");
    }
  });

export const consultModule = createServerFn({ method: "POST" })
  .validator((input: { query: string }) => ({
    query: String(input?.query ?? "").trim().slice(0, 240),
  }))
  .handler(async ({ data }): Promise<ModuleOsResult> => {
    if (!data.query) return fail("Name the pulse.");
    const { executeWorkflow } = await import("./boot.server");
    try {
      const snapshot = await executeWorkflow("nerve-consult", { query: data.query });
      return { ok: true, ...snapshot };
    } catch (err) {
      return fail(err instanceof Error ? err.message : "consult failed");
    }
  });

export function moduleCatalog() {
  return {
    modules: MODULE_RUNTIME,
    workflows: WORKFLOWS,
    diagnosis: diagnose(),
    stats: runtimeStats(),
  };
}

export type { ModuleOsResult, ModuleOsSnapshot };
