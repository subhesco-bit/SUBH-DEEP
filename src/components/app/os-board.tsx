import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  assessSuitability,
  canAdvance,
  chainFor,
  composeOs,
  CONSTITUTION,
  enhanceFor,
  filterOs,
  grievancesFrom,
  LIFE_EVENTS,
  MATRIX_LINKS,
  OS_STAGES,
  remainingWork,
  SECTOR_JOURNEYS,
  type OsClass,
  type OsStage,
  type OsTable,
  type RuntimeChain,
} from "@/lib/os";
import { NeedNav } from "@/components/app/need-nav";
import { useVillageBooks } from "@/components/erp/books-boot";
import { evidencePassport } from "@/lib/os/passport";
import { exceptions } from "@/lib/erp/platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const TABLES: Array<"all" | OsTable> = ["all", "level", "gap", "concept", "baseline", "innovation", "ai", "future"];
const KERNEL: Array<"all" | OsClass> = [
  "all",
  "verified",
  "partial",
  "scaffolded",
  "documented",
  "disconnected",
  "duplicated",
  "overlapping",
  "blocked",
  "proposed",
  "missing",
];
const TODOS = ["all", "done", "open", "blocked"] as const;

function klass(s: string) {
  if (s === "verified" || s === "done" || s === "living" || s === "enforced") return "live" as const;
  if (s === "partial" || s === "open" || s === "named") return "partial" as const;
  return "gap" as const;
}

export function OsBoard() {
  const os = useMemo(() => composeOs(), []);
  const books = useVillageBooks();
  const [stage, setStage] = useState<OsStage | "all">("all");
  const [table, setTable] = useState<"all" | OsTable>("all");
  const [kernel, setKernel] = useState<"all" | OsClass>("all");
  const [todo, setTodo] = useState<(typeof TODOS)[number]>("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>("g-sot");
  const work = useMemo(() => remainingWork(10), []);

  const rows = filterOs({ stage, table, kernel, todo, query });
  const s0 = os.stageDone[0];
  const s1 = os.stageDone[1];
  const lot = books?.lots[0];
  const passport = lot && books ? evidencePassport(lot, books) : null;
  const gates = books
    ? exceptions({
        journalBalanced: books.kpis.journalBalanced,
        lots: books.lots,
        receipts: books.receipts,
        orders: books.orders,
        payouts: books.payouts,
      })
    : [];
  const cases = grievancesFrom(gates);
  const agri = SECTOR_JOURNEYS.find((j) => j.id === "agriculture");
  const namedSectors = SECTOR_JOURNEYS.filter((j) => j.status === "named");
  const loan = assessSuitability("loan");
  const quote = assessSuitability("insurance-quote");
  const cover = assessSuitability("cover");

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Digital super-organism · India-first economic OS · no invented ₹
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Concept to runtime</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{os.thesis}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Stage 0 classified" value={`${os.stage0Pct}%`} live />
          <Kpi label="Kernel verified" value={os.kernelVerified} live />
          <Kpi label="Still open" value={os.open} />
          <Kpi label="Blocked" value={os.blocked} gap />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          {os.classified} concepts · Stage 0 {s0.done}/{s0.total} · Stage 1 {s1.done}/{s1.total} · GitHub scaffolded{" "}
          {os.githubScaffolded} · kernel partial {os.kernelPartial}
        </p>
        <div className="mt-5">
          <NeedNav books={books} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">TODO · remaining ligaments</p>
        <h3 className="mt-2 font-display text-xl">Preserve everything. Plug the next one.</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Stage 0 is classification. Stage 1 bone lives. Stages 2–6 stay named until a muscle fires. Nothing is
          removed. A thousand pages would be a cadaver.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {work.map((t) => (
            <li key={t.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{t.title}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">
                  {t.itemId} · s{t.stage} · {t.exit}
                </p>
              </div>
              <Badge variant={klass(t.status)}>{t.status}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Maturity sequence</p>
        <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {OS_STAGES.map((s) => {
            const d = os.stageDone[s.stage];
            const active = stage === s.stage;
            return (
              <li key={s.stage}>
                <button
                  type="button"
                  onClick={() => setStage(active ? "all" : s.stage)}
                  className={cn(
                    "h-full min-h-11 w-full rounded-xl border px-3 py-3 text-left transition-colors",
                    active ? "border-live/40 bg-background" : "border-border bg-background",
                  )}
                >
                  <p className="font-mono text-[10px] text-muted">
                    {s.stage} · {d.done}/{d.total} · {d.pct}%
                  </p>
                  <p className="mt-1 text-sm font-medium">{s.name}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{s.exit}</p>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Agriculture journey</p>
        <h3 className="mt-2 font-display text-xl">{agri?.sector}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{agri?.thesis}</p>
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {agri?.steps.map((step) => (
            <li key={step.id}>
              <Link
                to={step.href as never}
                className="flex min-h-11 flex-col rounded-xl border border-border bg-background px-3 py-3"
              >
                <span className="font-mono text-[10px] text-muted">{step.id}</span>
                <span className="mt-1 text-sm font-medium">{step.name}</span>
                <Badge variant={klass(step.status)} className="mt-2 w-fit">
                  {step.status}
                </Badge>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-3 font-mono text-[11px] text-partial">
          harvest → store {canAdvance("harvest", "store") ? "open" : "blocked"} · plan → finance{" "}
          {canAdvance("plan", "finance") ? "open" : "missing"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {namedSectors.map((j) => (
            <Badge key={j.id} variant="gap">
              {j.sector} named
            </Badge>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Constitution</p>
          <h3 className="mt-2 font-display text-xl">Assistance is not manipulation</h3>
          <ul className="mt-4 divide-y divide-border">
            {CONSTITUTION.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 py-2">
                <p className="text-sm">
                  <span className="font-mono text-[11px] text-muted">{r.id}. </span>
                  {r.law}
                </p>
                <Badge variant={klass(r.status)}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Suitability + events</p>
          <h3 className="mt-2 font-display text-xl">Refuse invented offers</h3>
          <ul className="mt-4 space-y-2">
            <li className="rounded-xl border border-border bg-background px-3 py-3">
              <p className="text-sm font-medium">Find a loan</p>
              <p className="mt-1 text-[12px] text-muted">{loan.reason}</p>
              <Badge variant="gap" className="mt-2">
                refuse
              </Badge>
            </li>
            <li className="rounded-xl border border-border bg-background px-3 py-3">
              <p className="text-sm font-medium">Insurance quote</p>
              <p className="mt-1 text-[12px] text-muted">{quote.reason}</p>
              <Badge variant="gap" className="mt-2">
                refuse
              </Badge>
            </li>
            <li className="rounded-xl border border-border bg-background px-3 py-3">
              <p className="text-sm font-medium">Godown cover</p>
              <p className="mt-1 text-[12px] text-muted">{cover.reason}</p>
              <Badge variant="live" className="mt-2">
                bind · premium unknown
              </Badge>
            </li>
          </ul>
          <ul className="mt-4 flex flex-wrap gap-2">
            {LIFE_EVENTS.map((e) => (
              <Badge key={e.id} variant={klass(e.status)}>
                {e.name}
              </Badge>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Evidence passport</p>
          <h3 className="mt-2 font-display text-xl">One lot, its proof</h3>
          {passport ? (
            <ul className="mt-4 divide-y divide-border">
              {passport.atoms.map((a) => (
                <li key={a.kind} className="flex items-start justify-between gap-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{a.kind}</p>
                    <p className="font-mono text-[11px] text-muted">{a.value}</p>
                  </div>
                  <Badge variant={a.confidence === "absent" ? "gap" : a.confidence === "declared" ? "live" : "partial"}>
                    {a.confidence}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">Mint a lot to issue a passport. Missing atoms stay absent.</p>
          )}
          <Button asChild size="sm" variant="outline" className="mt-4 min-h-11">
            <Link to="/lots">Lots</Link>
          </Button>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Exception command</p>
          <h3 className="mt-2 font-display text-xl">Blocked, deferred, noted</h3>
          {gates.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No gates yet. Books still booting.</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {gates.map((g) => (
                <li key={g.code} className="py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {g.code} · {g.title}
                    </p>
                    <Badge variant={g.severity === "block" ? "gap" : g.severity === "defer" ? "partial" : "live"}>
                      {g.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[12px] text-muted">{g.body}</p>
                  <p className="mt-1 font-mono text-[11px] text-partial">
                    {g.owner} · {g.impact} · {g.action}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {cases.length ? (
            <div className="mt-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Grievance spine</p>
              <ul className="mt-2 space-y-1">
                {cases.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      {c.source} · {c.subject}
                    </span>
                    <Badge variant="partial">{c.stage}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Button asChild size="sm" variant="outline" className="mt-4 min-h-11">
            <Link to="/platform">Platform</Link>
          </Button>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Registry</p>
            <h3 className="mt-1 font-display text-xl">Nothing removed · {rows.length} shown</h3>
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter concepts"
            aria-label="Filter OS catalog"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {TABLES.map((t) => (
            <Button key={t} type="button" size="sm" variant={table === t ? "default" : "outline"} className="capitalize" onClick={() => setTable(t)}>
              {t}
            </Button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {KERNEL.map((k) => (
            <Button key={k} type="button" size="sm" variant={kernel === k ? "default" : "outline"} className="capitalize" onClick={() => setKernel(k)}>
              {k}
            </Button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {TODOS.map((t) => (
            <Button key={t} type="button" size="sm" variant={todo === t ? "default" : "outline"} className="capitalize" onClick={() => setTodo(t)}>
              {t}
            </Button>
          ))}
        </div>
        <ul className="mt-5 divide-y divide-border">
          {rows.map((x) => {
            const open = openId === x.id;
            const chain = open ? chainFor(x.id) : null;
            const levels = open ? enhanceFor(x.id) : null;
            return (
              <li key={x.id} className="py-3">
                <button
                  type="button"
                  className="flex min-h-11 w-full flex-wrap items-start justify-between gap-2 text-left"
                  onClick={() => setOpenId(open ? null : x.id)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{x.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted">
                      {x.id} · s{x.stage} · L{x.level} · {x.area}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={klass(x.kernel)}>k {x.kernel}</Badge>
                    <Badge variant={klass(x.github)}>gh {x.github}</Badge>
                    <Badge variant={klass(x.todo)}>{x.todo}</Badge>
                  </div>
                </button>
                {open ? (
                  <div className="mt-3 space-y-3 rounded-xl border border-border bg-background px-3 py-3 text-sm">
                    <p>
                      <span className="text-muted">Present. </span>
                      {x.present}
                    </p>
                    <p>
                      <span className="text-muted">Missing. </span>
                      {x.missing}
                    </p>
                    <p>
                      <span className="text-muted">Next. </span>
                      {x.next}
                    </p>
                    {chain ? <Matrix chain={chain} /> : null}
                    {levels ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {levels.map((lv) => (
                          <div key={lv.level} className="rounded-lg border border-border px-3 py-2">
                            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{lv.level}</p>
                            <p className="mt-1 text-[13px] leading-relaxed">{lv.living}</p>
                            <p className="mt-1 text-[11px] text-muted">{lv.next}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <Button asChild size="sm" variant="outline" className="min-h-11">
                      <a href={x.href}>Open</a>
                    </Button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Matrix({ chain }: { chain: RuntimeChain }) {
  return (
    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-4">
      {MATRIX_LINKS.map((k) => (
        <div key={k}>
          <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{k}</dt>
          <dd className="mt-0.5 text-[12px] leading-snug">{chain[k]}</dd>
        </div>
      ))}
    </dl>
  );
}

function Kpi({ label, value, live, gap }: { label: string; value: string | number; live?: boolean; gap?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-2xl tabular-nums", live && "text-live", gap && "text-gap")}>{value}</p>
    </div>
  );
}
