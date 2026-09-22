import { getSql, type Sql } from "@/lib/db";
import { lastCopilot, runWorkflow } from "./engine";
import { runtimeStats } from "./registry";
import { WORKFLOWS } from "./workflows";
import type { BusMessage, ModuleOsSnapshot, RunContext, StepPayload, StepResult, WorkflowRun } from "./types";

let seedChain: Promise<void> | null = null;

function asTime(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

type RunRow = {
  id: string;
  workflow_id: string;
  organ_id: string;
  lot_id: string | null;
  status: WorkflowRun["status"];
  started_at: string | Date;
  finished_at: string | Date | null;
};

type StepRow = {
  run_id: string;
  seq: number;
  module_id: string;
  step_code: string;
  kind: StepResult["kind"];
  organ_id: string;
  decision: StepResult["decision"];
  reason: string;
  algorithm: string | null;
  rupee_write: boolean;
  payload: unknown;
};

type MsgRow = {
  run_id: string;
  from_module: string;
  to_module: string;
  signal: string;
  envelope: unknown;
};

function asPayload(value: unknown): StepPayload {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as StepPayload;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as StepPayload;
    } catch {
      return {};
    }
  }
  return {};
}

function asEnvelope(value: unknown): BusMessage["envelope"] {
  const o = asPayload(value) as { decision?: string; organ?: string; lotId?: string | null };
  return { decision: o.decision ?? "", organ: o.organ ?? "", lotId: o.lotId ?? null };
}

async function persistRun(sql: Sql, run: WorkflowRun): Promise<void> {
  await sql.query(
    `insert into module_runs (id, workflow_id, organ_id, lot_id, status, started_at, finished_at)
     values ($1,$2,$3,$4,$5,$6,$7)`,
    [run.id, run.workflowId, run.organId, run.lotId, run.status, run.startedAt, run.finishedAt],
  );
  for (const [i, step] of run.steps.entries()) {
    await sql.query(
      `insert into module_steps (run_id, seq, module_id, step_code, kind, organ_id, decision, reason, algorithm, rupee_write, payload)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb)`,
      [
        run.id,
        i + 1,
        step.moduleId,
        step.code,
        step.kind,
        step.organ,
        step.decision,
        step.reason,
        step.algorithm,
        step.rupeeWrite,
        JSON.stringify(step.payload),
      ],
    );
  }
  for (const msg of run.messages) {
    await sql.query(
      `insert into module_messages (run_id, from_module, to_module, signal, envelope)
       values ($1,$2,$3,$4,$5::jsonb)`,
      [run.id, msg.from, msg.to, msg.signal, JSON.stringify(msg.envelope)],
    );
  }
  await sql.query(
    `update module_state set booted_at = coalesce(booted_at, now()), living_plugs = $1, last_run_id = $2, last_error = null where id = 1`,
    [runtimeStats().livingPlugs, run.id],
  );
}

function assemble(
  runRows: RunRow[],
  stepRows: StepRow[],
  msgRows: MsgRow[],
): WorkflowRun[] {
  const stepsBy = new Map<string, StepResult[]>();
  for (const s of stepRows) {
    const list = stepsBy.get(s.run_id) ?? [];
    list.push({
      code: s.step_code,
      moduleId: s.module_id,
      name: s.step_code,
      kind: s.kind,
      organ: s.organ_id,
      decision: s.decision,
      reason: s.reason,
      algorithm: s.algorithm ?? "",
      rupeeWrite: Boolean(s.rupee_write),
      emits: s.step_code,
      payload: asPayload(s.payload),
    });
    stepsBy.set(s.run_id, list);
  }
  const msgBy = new Map<string, BusMessage[]>();
  for (const m of msgRows) {
    const list = msgBy.get(m.run_id) ?? [];
    list.push({
      from: m.from_module,
      to: m.to_module,
      signal: m.signal,
      envelope: asEnvelope(m.envelope),
    });
    msgBy.set(m.run_id, list);
  }
  return runRows.map((r) => ({
    id: r.id,
    workflowId: r.workflow_id,
    organId: r.organ_id,
    lotId: r.lot_id,
    status: r.status,
    startedAt: asTime(r.started_at),
    finishedAt: r.finished_at ? asTime(r.finished_at) : null,
    steps: stepsBy.get(r.id) ?? [],
    messages: msgBy.get(r.id) ?? [],
  }));
}

export async function readModuleOs(): Promise<ModuleOsSnapshot> {
  const sql = await getSql();
  const state = await sql.query<{
    living_plugs: number;
    last_run_id: string | null;
    last_error: string | null;
    booted_at: string | Date | null;
  }>("select living_plugs, last_run_id, last_error, booted_at from module_state where id = 1");
  const runRows = await sql.query<RunRow>(
    "select id, workflow_id, organ_id, lot_id, status, started_at, finished_at from module_runs order by started_at desc, id desc limit 12",
  );
  const ids = runRows.map((r) => r.id);
  let stepRows: StepRow[] = [];
  let msgRows: MsgRow[] = [];
  if (ids.length) {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
    stepRows = await sql.query<StepRow>(
      `select run_id, seq, module_id, step_code, kind, organ_id, decision, reason, algorithm, rupee_write, payload
       from module_steps where run_id in (${placeholders}) order by seq`,
      ids,
    );
    msgRows = await sql.query<MsgRow>(
      `select run_id, from_module, to_module, signal, envelope from module_messages where run_id in (${placeholders}) order by id`,
      ids,
    );
  }
  const runs = assemble(runRows, stepRows, msgRows);
  const stats = runtimeStats();
  return {
    livingPlugs: stats.livingPlugs,
    partialPlugs: stats.partialPlugs,
    modules: stats.modules,
    workflows: WORKFLOWS.length,
    lastRunId: state[0]?.last_run_id ?? runs[0]?.id ?? null,
    lastError: state[0]?.last_error ?? null,
    bootedAt: state[0]?.booted_at ? asTime(state[0].booted_at) : null,
    runs,
    copilot: lastCopilot(runs[0]),
  };
}

const MAGH: Array<{ workflowId: string; ctx: Omit<RunContext, "workflowId"> }> = [
  {
    workflowId: "harvest-mint",
    ctx: {
      lotId: "lot-chakhao-enghi",
      cellId: "c-enghi",
      variety: "Chakhao Poireiton",
      commodity: "black rice",
      grams: 510_000,
      remainingGrams: 510_000,
      qtyGrams: 0,
      giMarker: "GI-AS-CHAKHAO",
      status: "minted",
      query: "harvest mint lot Chakhao hippocampus",
    },
  },
  {
    workflowId: "warehouse-intake",
    ctx: {
      lotId: "lot-chakhao-enghi",
      grams: 510_000,
      remainingGrams: 510_000,
      giMarker: "GI-AS-CHAKHAO",
      status: "inward",
      pledged: 0,
    },
  },
  {
    workflowId: "offtake-settle",
    ctx: {
      lotId: "lot-chakhao-enghi",
      cellId: "c-enghi",
      grams: 510_000,
      remainingGrams: 510_000,
      qtyGrams: 510_000,
      pricePaisePerKg: 18500,
      freightPaisePerKg: 400,
      paymentRef: "UPI-KA-8841",
      hoursToPay: 18,
      pledged: 0,
      status: "settled",
    },
  },
  {
    workflowId: "harvest-mint",
    ctx: {
      lotId: "lot-chakhao-ronghang",
      cellId: "c-ronghang",
      variety: "Chakhao Poireiton",
      commodity: "black rice",
      grams: 840_000,
      remainingGrams: 440_000,
      qtyGrams: 400_000,
      giMarker: "GI-AS-CHAKHAO",
      status: "listed",
      query: "harvest mint remaining mass",
    },
  },
  {
    workflowId: "offtake-settle",
    ctx: {
      lotId: "lot-chakhao-ronghang",
      cellId: "c-ronghang",
      grams: 840_000,
      remainingGrams: 440_000,
      qtyGrams: 400_000,
      pricePaisePerKg: 19200,
      freightPaisePerKg: 400,
      paymentRef: null,
      hoursToPay: null,
      pledged: 0,
      status: "listed",
    },
  },
  {
    workflowId: "period-close",
    ctx: {
      journalBalanced: true,
      clerk: "Biren",
      query: "period close Magh",
    },
  },
  {
    workflowId: "climate-reflex",
    ctx: {
      lotId: "lot-ginger-teron",
      remainingGrams: 180_000,
      status: "outage",
      alert: true,
      iotTempC: 31.4,
      query: "climate reflex mill",
    },
  },
  {
    workflowId: "claim-file",
    ctx: {
      lotId: "lot-ginger-teron",
      query: "flood claim",
    },
  },
];

async function seedModuleOs(sql: Sql): Promise<void> {
  await sql.query("insert into module_state (id) values (1) on conflict (id) do nothing", []);
  const existing = await sql.query<{ n: number }>("select count(*)::int as n from module_runs");
  if ((existing[0]?.n ?? 0) > 0) return;

  const platform = runWorkflow("platform-bus", { query: "module OS plug harvest lot spine" });
  await persistRun(sql, platform);
  const consult = runWorkflow("nerve-consult", { query: "agentic companion harvest lot remaining" });
  await persistRun(sql, consult);
  const advise = runWorkflow("domain-advise", { query: "weather alert EMI pause Chakhao" });
  await persistRun(sql, advise);
  for (const row of MAGH) {
    await persistRun(sql, runWorkflow(row.workflowId, row.ctx));
  }
}

async function runSeed(): Promise<void> {
  const sql = await getSql();
  await seedModuleOs(sql);
}

export async function ensureModuleOs(): Promise<ModuleOsSnapshot> {
  if (!seedChain) {
    seedChain = runSeed().catch((err) => {
      seedChain = null;
      throw err;
    });
  }
  await seedChain;
  return readModuleOs();
}

async function hydrateCtx(
  workflowId: string,
  ctx: Omit<RunContext, "workflowId">,
): Promise<Omit<RunContext, "workflowId">> {
  if (workflowId !== "period-close" && workflowId !== "climate-reflex") return ctx;
  try {
    const { ensureBooks } = await import("../erp/boot.server");
    const books = await ensureBooks();
    if (workflowId === "period-close") {
      return {
        ...ctx,
        journalBalanced: ctx.journalBalanced ?? books.kpis.journalBalanced,
        clerk: ctx.clerk ?? "Biren",
      };
    }
    const outage = books.energyWindows.some((w) => w.active && w.status === "outage");
    const alert = books.weatherAlerts.some((a) => a.claimOpen);
    const temp = books.iotReadings.find((r) => r.unit === "C" || /temp/i.test(r.kind));
    const lot = books.lots.find((l) => l.id === ctx.lotId) ?? books.lots[0];
    const window = books.energyWindows.find((w) => w.active);
    return {
      ...ctx,
      status: outage ? "outage" : ctx.status,
      alert: ctx.alert ?? alert,
      iotTempC: ctx.iotTempC ?? temp?.valueNum ?? null,
      remainingGrams: ctx.remainingGrams ?? lot?.remainingGrams,
      kwh: ctx.kwh ?? window?.kwh ?? null,
    };
  } catch {
    return ctx;
  }
}

export async function executeWorkflow(
  workflowId: string,
  ctx: Omit<RunContext, "workflowId"> = {},
): Promise<ModuleOsSnapshot> {
  await ensureModuleOs();
  const sql = await getSql();
  const run = runWorkflow(workflowId, await hydrateCtx(workflowId, ctx));
  await persistRun(sql, run);
  await sql.query(
    `insert into spine_events (signal, organ_id, ligament_id, payload)
     values ($1,'module','b-module-spine',$2::jsonb)`,
    [`module.${workflowId}`, JSON.stringify({ runId: run.id, status: run.status, lotId: run.lotId })],
  );
  return readModuleOs();
}

export async function trackErpSignal(
  signal: string,
  ctx: Omit<RunContext, "workflowId">,
): Promise<void> {
  const map: Record<string, string> = {
    "harvest.completed": "harvest-mint",
    "lot.mint": "harvest-mint",
    "warehouse.intake": "warehouse-intake",
    "lot.ready": "offtake-settle",
    "order.settled": "offtake-settle",
  };
  const workflowId = map[signal];
  if (!workflowId) return;
  try {
    await executeWorkflow(workflowId, { ...ctx, query: signal });
  } catch {
    // Tracking must not roll back village books.
  }
}

