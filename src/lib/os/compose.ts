/** Score the catalog. Stage 0 is classification. Dual-truth with GitHub. */

import { OS_ITEMS, OS_STAGES } from "./catalog.ts";
import { allStagesComplete, stageClosed } from "./runtime.ts";
import { osTodos, remainingWork, todoCounts } from "./todos.ts";
import type { OsSnapshot, OsStage, TodoStatus } from "./types.ts";

export { chainFor } from "./matrix.ts";

export function composeOs(): OsSnapshot {
  const items = OS_ITEMS;
  const classified = items.filter((x) => x.kernel && x.github).length;
  const closed = stageClosed(items);
  const stageDone = {} as OsSnapshot["stageDone"];
  for (const s of OS_STAGES) {
    const row = closed[s.stage];
    stageDone[s.stage] = {
      total: row.total,
      done: row.done,
      blocked: row.blocked,
      closed: row.closed,
      pct: row.pct,
    };
  }
  const stage0Pct = classified === items.length ? 100 : Math.round((classified / items.length) * 100);
  return {
    items,
    classified,
    stage0Pct,
    stageDone,
    kernelVerified: items.filter((x) => x.kernel === "verified").length,
    kernelPartial: items.filter((x) => x.kernel === "partial").length,
    githubScaffolded: items.filter((x) => x.github === "scaffolded" || x.github === "duplicated").length,
    open: items.filter((x) => x.todo === "open").length,
    blocked: items.filter((x) => x.todo === "blocked").length,
    stagesComplete: allStagesComplete(items),
    thesis:
      "AFRERA is a rural economic operating system, not an agriculture website. Stages 0–6 are closed on this kernel. GitHub platform remains 7%. Lattice ligaments stay ~39%. Human-equivalent body lives. Relax is the withdraw reflex: heat/alert/outage rest the mill, remaining holds, EMI is not frozen, wrong unclench is refused. Eleven flow charts live: strategy, work, process, payment, material, vision, decision, command, coordination, algorithms, supply chain. Rural ERP atlas classifies 32 SAP/Baan/Oracle analog families; sapParity is false; nested remaining conserves person=home=village. AI atlas classifies 35 families; aiParity is false; five tissues decide; GitHub living plugs stay 0. August AI veterinary coding lives on AFRERA-VET; GitHub human ICD stays a cadaver; livestock cash stays missing. Shared village muscle lives as conserved hours on cold, mill, process, pack, labs, dryer, polyhouse, equipment; organic tracing lives; GST invoice stays missing; Operation Green and NE logistics eligibility compute with amount blank; rental rupees stay missing. Village remaining journey lives; tourism itinerary refused. Engineering BOQ stamp lives; CFD stays refused. Cell inspect lives; no login profile. Federated ask is local remaining. Policy lab what-if, amount blank. Infra twin on declared sensors. Coop license is qty-weighted remaining. One brain, five tissues. AI still cannot write rupees. Agriculture finance and procure stay missing.",
  };
}

export function emitOsCatalog() {
  const os = composeOs();
  return {
    generatedAt: "2026-09-22",
    thesis: os.thesis,
    stages: OS_STAGES,
    snapshot: {
      items: os.items.length,
      classified: os.classified,
      stage0Pct: os.stage0Pct,
      stageDone: os.stageDone,
      kernelVerified: os.kernelVerified,
      kernelPartial: os.kernelPartial,
      githubScaffolded: os.githubScaffolded,
      open: os.open,
      blocked: os.blocked,
      stagesComplete: os.stagesComplete,
      todo: todoCounts(),
    },
    items: OS_ITEMS,
  };
}

export function emitOsTodos() {
  return {
    generatedAt: "2026-09-22",
    counts: todoCounts(),
    remaining: remainingWork(110),
    all: osTodos(),
  };
}

export function filterOs(opts: {
  stage?: OsStage | "all";
  table?: string;
  kernel?: string;
  todo?: TodoStatus | "all";
  query?: string;
}) {
  const q = (opts.query ?? "").trim().toLowerCase();
  return OS_ITEMS.filter((x) => {
    if (opts.stage !== undefined && opts.stage !== "all" && x.stage !== opts.stage) return false;
    if (opts.table && opts.table !== "all" && x.table !== opts.table) return false;
    if (opts.kernel && opts.kernel !== "all" && x.kernel !== opts.kernel) return false;
    if (opts.todo && opts.todo !== "all" && x.todo !== opts.todo) return false;
    if (!q) return true;
    return `${x.id} ${x.name} ${x.area} ${x.present} ${x.missing} ${x.next} ${x.organs.join(" ")}`.toLowerCase().includes(q);
  });
}