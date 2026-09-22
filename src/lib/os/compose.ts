/** Score the catalog. Stage 0 is classification. Dual-truth with GitHub. */

import { OS_ITEMS, OS_STAGES } from "./catalog.ts";
import { chainFor } from "./matrix.ts";
import type { OsSnapshot, OsStage, TodoStatus } from "./types.ts";

export { chainFor } from "./matrix.ts";

export function composeOs(): OsSnapshot {
  const items = OS_ITEMS;
  const classified = items.filter((x) => x.kernel && x.github).length;
  const stageDone = {} as OsSnapshot["stageDone"];
  for (const s of OS_STAGES) {
    const rows = items.filter((x) => x.stage === s.stage);
    const done = rows.filter((x) => x.todo === "done").length;
    const total = rows.length || 1;
    stageDone[s.stage] = { total: rows.length, done, pct: Math.round((done / total) * 100) };
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
    thesis:
      "AFRERA is a rural economic operating system, not an agriculture website. Stage 0 classified every concept. Stage 1 bone lives (clerk, remaining grams, journal, workflows). Four-level enhance is on: component, industry, rural, future. GitHub platform remains 7%. Do not generate a thousand pages. Plug a ligament.",
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
