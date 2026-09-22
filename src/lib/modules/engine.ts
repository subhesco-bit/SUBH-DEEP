import { nid } from "../erp/ids.ts";
import { AI_SYSTEMS } from "../systems/catalog.ts";
import {
  aiFirewall,
  copilotNext,
  countPlugs,
  fifoGate,
  fvieRank,
  giFrame,
  hoursToPay,
  humanCommand,
  journalGate,
  libraryConsult,
  paymentRefGate,
  pledgeGate,
  priceDeclared,
  priceWaterfall,
  qtyWeightedGate,
  remainingGate,
  giClaimGate,
  spoilageMass,
  wacCost,
  weatherAlert,
  herdCoverGate,
  energyCloudGate,
  schemeGate,
  type AlgorithmResult,
} from "./algorithms.ts";
import { MODULE_RUNTIME } from "./registry.ts";
import { WORKFLOW_BY_ID } from "./workflows.ts";
import type { BusMessage, RunContext, StepResult, WorkflowRun, WorkflowStepDef } from "./types.ts";

function orchestratorRoute(step: WorkflowStepDef): AlgorithmResult {
  return {
    decision: "pass",
    reason: `Routed ${step.emits} to ${step.moduleId}. One engine, not sixteen mouths.`,
    payload: { route: step.moduleId },
  };
}

function execute(step: WorkflowStepDef, ctx: RunContext): AlgorithmResult {
  try {
    const wall = aiFirewall(step);
    if (wall.decision === "block") return wall;

    switch (step.algorithm) {
      case "ai-firewall":
        return wall;
      case "remaining-gate":
        return remainingGate(ctx);
      case "price-declared":
        return priceDeclared(ctx);
      case "price-waterfall":
        return priceWaterfall(ctx);
      case "journal-balance":
        return journalGate(ctx);
      case "payment-ref":
        return paymentRefGate(ctx);
      case "pledge-gate":
        return pledgeGate(ctx);
      case "fifo-alloc":
        return fifoGate(ctx);
      case "wac-cost":
        return wacCost(ctx);
      case "qty-weighted":
        return qtyWeightedGate(ctx);
      case "library-consult":
        return libraryConsult(ctx);
      case "gi-frame":
        return giFrame(ctx);
      case "gi-claim":
        return giClaimGate(ctx);
      case "spoilage-mass":
        return spoilageMass(ctx);
      case "weather-reflex":
        return weatherAlert(ctx);
      case "herd-cover":
        return herdCoverGate(ctx);
      case "energy-cloud":
        return energyCloudGate(ctx);
      case "scheme-eligible":
        return schemeGate(ctx);
      case "fvie-rank":
        return fvieRank(ctx);
      case "hours-to-pay":
        return hoursToPay(ctx);
      case "human-command":
        return humanCommand();
      case "count-plugs":
        return countPlugs(
          MODULE_RUNTIME.filter((m) => m.plug === "living").length,
          AI_SYSTEMS.length,
        );
      case "copilot-next":
        return copilotNext(ctx.workflowId);
      case "orchestrator-route":
        return orchestratorRoute(step);
      default:
        return { decision: "defer", reason: `No algorithm named ${step.algorithm}.`, payload: {} };
    }
  } catch (err) {
    return {
      decision: "block",
      reason: err instanceof Error ? err.message : "Gate threw.",
      payload: {},
    };
  }
}

export function runWorkflow(workflowId: string, ctx: Omit<RunContext, "workflowId"> = {}): WorkflowRun {
  const def = WORKFLOW_BY_ID[workflowId];
  if (!def) throw new Error(`Unknown workflow ${workflowId}.`);
  const full: RunContext = { ...ctx, workflowId };
  const id = nid("run");
  const startedAt = new Date().toISOString();
  const steps: StepResult[] = [];
  const messages: BusMessage[] = [];
  let status: WorkflowRun["status"] = "passed";
  let prev = "contract";

  for (const step of def.steps) {
    const result = execute(step, full);
    steps.push({
      code: step.code,
      moduleId: step.moduleId,
      name: step.name,
      kind: step.kind,
      organ: step.organ,
      decision: result.decision,
      reason: result.reason,
      algorithm: step.algorithm,
      rupeeWrite: step.rupeeWrite,
      emits: step.emits,
      payload: result.payload,
    });
    messages.push({
      from: prev,
      to: step.moduleId,
      signal: step.emits,
      envelope: { decision: result.decision, organ: step.organ, lotId: full.lotId ?? null },
    });
    prev = step.moduleId;
    if (result.decision === "block") {
      status = "blocked";
      break;
    }
    if (result.decision === "defer" && status === "passed") status = "deferred";
  }

  return {
    id,
    workflowId,
    organId: def.organ,
    lotId: full.lotId ?? null,
    status,
    startedAt,
    finishedAt: new Date().toISOString(),
    steps,
    messages,
  };
}

export function lastCopilot(run: WorkflowRun | null | undefined): string | null {
  if (!run) return null;
  const step = [...run.steps].reverse().find((s) => s.moduleId === "copilot" || s.algorithm === "copilot-next");
  return step?.reason ?? null;
}

export function modulesCovered(): string[] {
  const ids = new Set<string>();
  for (const m of MODULE_RUNTIME) {
    if (m.workflowIds.length) ids.add(m.id);
  }
  return [...ids];
}
