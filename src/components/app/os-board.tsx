import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  assessSuitability,
  blockLog,
  canAdvance,
  chainFor,
  climateAutopilot,
  closePeriod,
  composeOs,
  CONSTITUTION,
  coopLicense,
  engCalc,
  enqueueOffline,
  enhanceFor,
  federatedAsk,
  fileClaim,
  filterOs,
  grievancesFrom,
  infraTwin,
  inspectCell,
  LIFE_EVENTS,
  MATRIX_LINKS,
  OS_STAGES,
  policyLab,
  remainingWork,
  scenario,
  schemeRule,
  SECTOR_JOURNEYS,
  syncOffline,
  travelPlan,
  type ConsentRow,
  type OfflineOp,
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

const SEED_CONSENT: ConsentRow = {
  constraint: "no-onion",
  purpose: "kitchen-filter",
  granted: true,
  at: "2026-09-22",
};

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
  const [queue, setQueue] = useState<OfflineOp[]>([]);
  const [lossPct, setLossPct] = useState("10");
  const [periodMsg, setPeriodMsg] = useState<string | null>(null);
  const [climateMsg, setClimateMsg] = useState<string | null>(null);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [consents, setConsents] = useState<ConsentRow[]>([SEED_CONSENT]);
  const [rectify, setRectify] = useState<Record<string, string>>({});
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
  const log = blockLog({
    balanced: books?.kpis.journalBalanced ?? false,
    clerk: "Biren",
    outage: (books?.energyWindows ?? []).some((w) => w.active && w.status === "outage"),
    alert: (books?.weatherAlerts ?? []).some((a) => a.claimOpen),
    iotTempC: books?.iotReadings.find((r) => r.unit === "C" || /temp/i.test(r.kind))?.valueNum ?? null,
    remainingGrams: lot?.remainingGrams ?? null,
    rupeeWrite: false,
  });
  const liveBlocks = log.filter((l) => l.decision === "block");
  const cells = books?.cells ?? [];
  const cell = cells[0];
  const remainingOnCell = cell?.remainingGrams ?? lot?.remainingGrams ?? 0;
  const setRectifyLine = (id: string, line: string) => setRectify((m) => ({ ...m, [id]: line }));
  const licensedCells = cells.length
    ? cells.map((c) => ({ cellId: c.id, remainingGrams: c.remainingGrams }))
    : [{ cellId: cell?.id ?? "c-enghi", remainingGrams: remainingOnCell }];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Digital super-organism · India-first economic OS · no invented ₹
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Concept to runtime</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{os.thesis}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Stages closed" value={os.stagesComplete ? "0–6" : "open"} live={os.stagesComplete} />
          <Kpi label="Kernel verified" value={os.kernelVerified} live />
          <Kpi label="Still open" value={os.open} />
          <Kpi label="Blocked" value={os.blocked} gap />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          {os.classified} concepts · Stage 0 {s0.closed}/{s0.total} · Stage 1 {s1.closed}/{s1.total} · GitHub
          scaffolded {os.githubScaffolded} · kernel partial {os.kernelPartial} · dual-truth 7% platform · lattice ~39%
        </p>
        <div className="mt-5">
          <NeedNav books={books} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">TODO · catalog closed</p>
        <h3 className="mt-2 font-display text-xl">Stages 0–6 closed. Named missing stay missing.</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Catalog TODOs are empty. Village remaining journey lives; tourism itinerary is refused.
          Agriculture finance and procure stay missing. CFD, gazette twins, a national pool, and a
          login profile stay refused as gates. GitHub platform is still 7%. Lattice ligaments stay
          ~39%.
        </p>
        {work.length ? (
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
        ) : (
          <ul className="mt-4 divide-y divide-border" data-qa="named-missing">
            {[
              { id: "finance", title: "Agriculture finance", why: "No invented credit score." },
              { id: "procure", title: "Agriculture procure", why: "No invented SKU catalogue." },
              { id: "cfd", title: "Engineering CFD", why: "Do not fake CFD." },
              { id: "gst", title: "GST", why: "Village GL is enough to be honest." },
            ].map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted">{t.why}</p>
                </div>
                <Badge variant="gap">missing</Badge>
              </li>
            ))}
          </ul>
        )}
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
                    {s.stage} · {d.closed}/{d.total} closed · {d.pct}%
                    {d.blocked ? ` · ${d.blocked} blocked` : ""}
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
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Stage runtime · clerk declares</p>
        <h3 className="mt-2 font-display text-xl">Period, offline, climate, scenario</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Remaining grams move only when the clerk names the loss. Premium, payout, ETA, and emissions stay
          absent. Low-risk auto-ops may run. Rupee writes stay human.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">s1 · period close</p>
            <p className="mt-1 text-sm">Magh 2026. SoD: unbalanced journal cannot close.</p>
            <Button
              type="button"
              size="sm"
              className="mt-3 min-h-11"
              data-qa="close-magh"
              onClick={() => {
                const r = closePeriod({
                  season: "Magh 2026",
                  balanced: books?.kpis.journalBalanced ?? false,
                  clerk: "Biren",
                });
                setPeriodMsg(`Result. ${r.status} · ${r.reason}`);
              }}
            >
              Close Magh
            </Button>
            {periodMsg ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="period-result">
                {periodMsg}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">s1 · offline queue</p>
            <p className="mt-1 text-sm">Store a harvest. Sync needs a receipt.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                data-qa="enqueue-offline"
                onClick={() => setQueue((q) => [...q, enqueueOffline("harvest", lot ? `${lot.id} ${lot.remainingGrams}g` : "cell harvest")])}
              >
                Enqueue
              </Button>
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                data-qa="sync-offline"
                onClick={() =>
                  setQueue((q) => q.map((item, i) => (i === 0 && !item.receipt ? syncOffline(item, `rcpt-${item.kind}`) : item)))
                }
              >
                Sync first
              </Button>
            </div>
            <p className="mt-2 font-mono text-[11px] text-muted" data-qa="offline-result">
              Result. {queue.length} queued · {queue.filter((x) => x.receipt).length} receipted
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">s5 · climate reflex</p>
            <p className="mt-1 text-sm">Alert + outage + 31.4 C. Mill blocks. Remaining waits on the clerk.</p>
            <Button
              type="button"
              size="sm"
              className="mt-3 min-h-11"
              data-qa="fire-reflex"
              onClick={() => {
                const r = climateAutopilot({
                  alert: true,
                  outage: true,
                  iotTempC: 31.4,
                  remainingGrams: lot?.remainingGrams ?? 100000,
                  clerkLossGrams: null,
                });
                setClimateMsg(
                  `Result. ${r.process} mill · ${r.why.length ? `why ${r.why.join("+")} · ` : ""}claim ${r.claimOpen ? "open" : "shut"} · EMI ${r.freezeEmi ? "frozen" : "not frozen"} · remaining ${r.remainingGrams} g · moved ${r.moved}`,
                );
              }}
            >
              Fire reflex
            </Button>
            {climateMsg ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="climate-result">
                {climateMsg}
              </p>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2 min-h-11"
              data-qa="file-claim"
              onClick={() => {
                const r = fileClaim({
                  lotId: lot?.id ?? "lot-x",
                  policyId: "POL-LANGTHASA-WEATHER",
                  hazard: "flood",
                  payoutPaise: null,
                });
                setClaimMsg(`Result. ${r.status} · payout ${r.payoutPaise === null ? "undeclared" : r.payoutPaise} · ${r.reason}`);
              }}
            >
              File claim
            </Button>
            {claimMsg ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="claim-result">
                {claimMsg}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">s6 · scenario what-if</p>
            <p className="mt-1 text-sm">Declared loss % on remaining. Rupee stays null. Not live.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Input
                value={lossPct}
                onChange={(e) => setLossPct(e.target.value)}
                aria-label="Declared loss percent"
                className="w-24"
              />
              <span className="text-sm text-muted">%</span>
            </div>
            <WhatIf grams={lot?.remainingGrams ?? 100000} pct={Number(lossPct)} />
            <SchemeLine />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Rectify · honest tissue</p>
        <h3 className="mt-2 font-display text-xl">Eight unblocked. Tourism still refuses.</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Each card is a real gate. CFD, a thermal twin, a gazette, a national pool, and a login dossier still
          fail on purpose. Remaining journey plans the sack, not a tourist. Amount, capacity, and rupees stay
          undeclared unless the clerk named them.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">g-eng · c-eng · BOQ stamp</p>
            <p className="mt-1 text-sm">12 m of IS 456. Stamp needs an engineer. CFD is refused.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                data-qa="stamp-boq"
                onClick={() => {
                  const r = engCalc({
                    qty: 12,
                    unit: "m",
                    standard: "IS 456",
                    engineer: "Biren",
                    ratePaise: null,
                    simulateCfd: false,
                  });
                  setRectifyLine("eng", `Result. ${r.status} · amount ${r.amountPaise === null ? "undeclared" : r.amountPaise} · ${r.reason}`);
                }}
              >
                Stamp BOQ
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                data-qa="fake-cfd"
                onClick={() => {
                  const r = engCalc({
                    qty: 12,
                    unit: "m",
                    standard: "IS 456",
                    engineer: "Biren",
                    ratePaise: null,
                    simulateCfd: true,
                  });
                  setRectifyLine("eng", `Result. ${r.status} · ${r.reason}`);
                }}
              >
                Simulate CFD
              </Button>
            </div>
            {rectify.eng ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="eng-result">
                {rectify.eng}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">n-profile · cell inspect</p>
            <p className="mt-1 text-sm">
              {cell ? `${cell.name} · ${remainingOnCell} g remaining. Auth off.` : "Cell is the nucleus. No login dossier."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                data-qa="inspect-cell"
                onClick={() => {
                  const r = inspectCell({
                    cellId: cell?.id ?? "c-enghi",
                    remainingGrams: remainingOnCell,
                    consents,
                  });
                  setRectifyLine("profile", `Result. login ${String(r.login)} · ${r.reason}`);
                }}
              >
                Inspect cell
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                data-qa="revoke-consent"
                onClick={() => {
                  const r = inspectCell({
                    cellId: cell?.id ?? "c-enghi",
                    remainingGrams: remainingOnCell,
                    consents,
                    revokePurpose: "kitchen-filter",
                  });
                  setConsents(r.consents);
                  setRectifyLine("profile", `Result. login ${String(r.login)} · ${r.reason}`);
                }}
              >
                Revoke consent
              </Button>
            </div>
            {rectify.profile ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="profile-result">
                {rectify.profile}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">f-fed · federated ask</p>
            <p className="mt-1 text-sm">Per-cell remaining. National pool stays null. No training.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                data-qa="fed-local"
                onClick={() => {
                  const r = federatedAsk({
                    cells: licensedCells,
                    national: false,
                  });
                  setRectifyLine(
                    "fed",
                    `Result. ${r.local.length} cells · national ${r.national === null ? "null" : "yes"} · trained ${String(r.trained)} · ${r.reason}`,
                  );
                }}
              >
                Local ask
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                data-qa="fed-national"
                onClick={() => {
                  const r = federatedAsk({
                    cells: licensedCells,
                    national: true,
                  });
                  setRectifyLine("fed", `Result. national ${r.national === null ? "null" : "yes"} · ${r.reason}`);
                }}
              >
                National ask
              </Button>
            </div>
            {rectify.fed ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="fed-result">
                {rectify.fed}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">f-policy · scheme what-if</p>
            <p className="mt-1 text-sm">PM-KISAN on declared acres. Amount blank. Gazette refused.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                data-qa="policy-whatif"
                onClick={() => {
                  const r = policyLab({
                    code: "PM-KISAN",
                    acresCenti: cell?.acresCenti ?? 240,
                    plantingCount: books?.plantings.length ?? 1,
                    horticulture: false,
                    gazette: false,
                    amountPaise: null,
                  });
                  setRectifyLine(
                    "policy",
                    `Result. ${r.eligible ? "eligible" : "ineligible"} · amount ${r.amountPaise === null ? "blank" : r.amountPaise} · gazette ${String(r.gazette)} · ${r.reason}`,
                  );
                }}
              >
                What-if PM-KISAN
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                data-qa="policy-gazette"
                onClick={() => {
                  const r = policyLab({
                    code: "PM-KISAN",
                    acresCenti: cell?.acresCenti ?? 240,
                    plantingCount: books?.plantings.length ?? 1,
                    horticulture: false,
                    gazette: true,
                    amountPaise: null,
                  });
                  setRectifyLine("policy", `Result. ${r.reason}`);
                }}
              >
                Gazette twin
              </Button>
            </div>
            {rectify.policy ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="policy-result">
                {rectify.policy}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">f-infra · sensor twin</p>
            <p className="mt-1 text-sm">Declared temp, kWh, water. Capacity never invented. Thermal twin refused.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                data-qa="infra-observe"
                onClick={() => {
                  const r = infraTwin({
                    tempC: books?.iotReadings.find((x) => x.unit === "C" || /temp/i.test(x.kind))?.valueNum ?? 31.4,
                    kwh: books?.energyWindows.find((w) => w.kwh != null)?.kwh ?? null,
                    waterLitres: null,
                    capacityKw: null,
                    thermalTwin: false,
                  });
                  setRectifyLine("infra", `Result. ${r.status} · ${r.reason}`);
                }}
              >
                Observe sensors
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                data-qa="infra-thermal"
                onClick={() => {
                  const r = infraTwin({
                    tempC: 31.4,
                    kwh: null,
                    waterLitres: null,
                    capacityKw: null,
                    thermalTwin: true,
                  });
                  setRectifyLine("infra", `Result. ${r.status} · ${r.reason}`);
                }}
              >
                Thermal twin
              </Button>
            </div>
            {rectify.infra ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="infra-result">
                {rectify.infra}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">f-coop · data cooperative</p>
            <p className="mt-1 text-sm">License remaining by cell. Qty-weighted. Cannot set eligibility.</p>
            <Button
              type="button"
              size="sm"
              className="mt-3 min-h-11"
              data-qa="coop-license"
              onClick={() => {
                const r = coopLicense({
                  cells: licensedCells,
                  spoilageGrams: books?.kpis.spoilageGrams ?? 0,
                  farmgatePaise: books?.kpis.farmgatePaise && books.kpis.farmgatePaise > 0 ? books.kpis.farmgatePaise : null,
                });
                setRectifyLine(
                  "coop",
                  `Result. ${r.license.length} cells · value ${r.valuePaise === null ? "undeclared" : r.valuePaise} · eligibility ${String(r.eligibility)} · ${r.reason}`,
                );
              }}
            >
              License remaining
            </Button>
            {rectify.coop ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="coop-result">
                {rectify.coop}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-border bg-background px-3 py-3 sm:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">a-travel · remaining journey</p>
            <p className="mt-1 text-sm">
              Plot → harvest → godown → kitchen → next Magh. Budget undeclared. Tourism refused.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                data-qa="plan-remaining"
                onClick={() => {
                  const r = travelPlan({
                    remainingGrams: remainingOnCell || lot?.remainingGrams || 180000,
                    weatherAlert: (books?.weatherAlerts ?? []).some((a) => a.claimOpen),
                    millBlocked: log.some((l) => l.domain === "mill" && l.decision === "block"),
                    kitchenAccess: true,
                    tourism: false,
                    budgetPaise: null,
                  });
                  setRectifyLine(
                    "travel",
                    `Result. ${r.status} · steps ${r.itinerary?.length ?? 0} · budget ${r.budgetPaise === null ? "undeclared" : r.budgetPaise} · ${r.reason}`,
                  );
                }}
              >
                Plan remaining
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="min-h-11"
                data-qa="plan-tourism"
                onClick={() => {
                  const r = travelPlan({ remainingGrams: remainingOnCell || 180000, tourism: true });
                  setRectifyLine("travel", `Result. ${r.status} · itinerary ${r.itinerary === null ? "null" : "yes"} · ${r.reason}`);
                }}
              >
                Tourism itinerary
              </Button>
            </div>
            {rectify.travel ? (
              <p className="mt-2 font-mono text-[11px] text-partial" data-qa="travel-result">
                {rectify.travel}
              </p>
            ) : (
              <p className="mt-2 font-mono text-[11px] text-muted" data-qa="travel-result">
                Result. idle · itinerary waits on plan
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Block log · named signals</p>
        <h3 className="mt-2 font-display text-xl">Why a gate stops</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Block is a decision, not an unfinished TODO. Mill names outage, alert, heat. Period names SoD.
          Catalog has no blocked rows. Tourism itinerary is a suitability refuse, not a catalog block.
        </p>
        <p className="mt-3 font-mono text-[11px] text-partial" data-qa="block-log-count">
          {liveBlocks.length} blocking now · {log.filter((l) => l.decision === "pass").length} passing ·{" "}
          {log.filter((l) => l.decision === "defer").length} deferred
        </p>
        <ul className="mt-4 divide-y divide-border">
          {log.map((line, i) => (
            <li key={`${line.domain}-${i}`} className="flex flex-wrap items-start justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium">{line.domain}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">{line.reason}</p>
              </div>
              <Badge variant={line.decision === "pass" ? "live" : line.decision === "defer" ? "partial" : "gap"}>
                {line.decision}
              </Badge>
            </li>
          ))}
        </ul>
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

function WhatIf({ grams, pct }: { grams: number; pct: number }) {
  const n = Number.isFinite(pct) ? pct : 0;
  if (n < 0 || n > 100) {
    return <p className="mt-2 text-[12px] text-gap">Loss % is declared 0–100.</p>;
  }
  const r = scenario({ remainingGrams: grams, lossPctDeclared: n });
  return (
    <p className="mt-2 font-mono text-[11px] text-partial">
      remaining after {r.remainingAfter} g · rupee {r.rupee === null ? "null" : r.rupee} · live {String(r.live)}
    </p>
  );
}

function SchemeLine() {
  const r = schemeRule({
    code: "PM-KISAN",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    acresCenti: 240,
    plantingCount: 1,
    horticulture: false,
    amountPaise: null,
  });
  return (
    <p className="mt-2 font-mono text-[11px] text-muted">
      PM-KISAN {r.eligible ? "eligible" : "ineligible"} · amount {r.amountPaise === null ? "blank" : r.amountPaise} ·{" "}
      {r.reason}
    </p>
  );
}
