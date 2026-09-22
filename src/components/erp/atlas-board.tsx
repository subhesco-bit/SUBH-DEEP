import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Ban,
  Brain,
  Layers,
  LayoutGrid,
  Network,
  Users,
} from "lucide-react";
import {
  ERP_MODULES,
  STAKEHOLDERS,
  atlasScore,
  manageErpModule,
  modulesByStatus,
  nestedRemaining,
  type AtlasFilter,
  type ErpModule,
} from "@/lib/erp/atlas";
import { formatKg } from "@/lib/erp/money";
import { usePlatform } from "@/lib/erp/platform-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const FILTERS: { id: AtlasFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "living", label: "Living" },
  { id: "partial", label: "Partial" },
  { id: "missing", label: "Named missing" },
  { id: "refused", label: "Refused" },
];

function tone(status: string): "live" | "partial" | "gap" {
  if (status === "living" || status === "pass") return "live";
  if (status === "partial" || status === "defer" || status === "propose" || status === "named" || status === "hypothesis") return "partial";
  return "gap";
}

export function AtlasBoard() {
  const snapshot = usePlatform((s) => s.snapshot);
  const atlas = snapshot?.atlas ?? atlasScore();
  const nested = snapshot?.nested ?? (snapshot ? nestedRemaining(snapshot.cells, snapshot.lots, snapshot.kitchen) : null);
  const [filter, setFilter] = useState<AtlasFilter>("all");
  const [picked, setPicked] = useState<string>("co-cca");
  const modules = modulesByStatus(filter);

  const remainingGrams = useMemo(() => {
    if (nested) return nested.village.remainingGrams;
    return snapshot?.cells.reduce((n, c) => n + c.remainingGrams, 0) ?? 0;
  }, [nested, snapshot]);

  const facts = useMemo(() => {
    const outage = (snapshot?.energyWindows ?? []).some((w) => w.active && w.status === "outage");
    const alert = (snapshot?.weatherAlerts ?? []).some((a) => a.claimOpen);
    const iotTempC = snapshot?.iotReadings.find((r) => r.unit === "C" || /temp/i.test(r.kind))?.valueNum ?? null;
    return {
      remainingGrams,
      outage,
      alert,
      iotTempC,
      balanced: snapshot?.kpis.journalBalanced ?? true,
      clerk: "Biren" as const,
    };
  }, [snapshot, remainingGrams]);

  const managed = useMemo(() => manageErpModule(picked, facts), [picked, facts]);
  const selected = ERP_MODULES.find((m) => m.id === picked) ?? ERP_MODULES[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Rural ERP atlas · SAP / Baan / Oracle analogs · not parity
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-medium tracking-tight">Classified. Not complete.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Every analog family is named: living, partial, missing, or refused.
              Nested remaining conserves person, home, and village on the same grams.
              Eighteen stakeholders sit on the write matrix. AI may manage a module
              as a decision passport. It cannot write rupees. This is not SAP, Baan,
              or Oracle. Finance and procure stay missing.
            </p>
          </div>
          <LayoutGrid className="hidden size-10 text-live sm:block" strokeWidth={1.25} aria-hidden />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Families classified" value={`${atlas.classifiedPct}%`} live />
          <Kpi label="SAP parity" value="false" gap />
          <Kpi label="Lattice" value={`~${atlas.latticePct}%`} />
          <Kpi label="GitHub" value={`${atlas.githubPct}%`} gap />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          {atlas.living} living · {atlas.partial} partial · {atlas.missing} missing · {atlas.refused} refused · finance missing · procure missing
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-live" strokeWidth={1.5} aria-hidden />
          <h3 className="font-display text-xl">Nested remaining</h3>
        </div>
        <p className="mt-1 text-sm text-muted">
          Person remaining sums to home sums to village. Kitchen binds variety, not rupees.
        </p>
        {nested ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <NestedCol
                label="Person"
                value={formatKg(nested.person.reduce((n, p) => n + p.remainingGrams, 0))}
                rows={nested.person.map((p) => ({ k: p.name, v: formatKg(p.remainingGrams), sub: p.household }))}
              />
              <NestedCol
                label="Home"
                value={formatKg(nested.home.reduce((n, h) => n + h.remainingGrams, 0))}
                rows={nested.home.map((h) => ({
                  k: h.household,
                  v: formatKg(h.remainingGrams),
                  sub: `${h.cells.length} cell${h.cells.length === 1 ? "" : "s"}`,
                }))}
              />
              <NestedCol
                label="Village"
                value={formatKg(nested.village.remainingGrams)}
                rows={[
                  { k: "Cells", v: String(nested.village.cellCount), sub: "person books" },
                  { k: "Homes", v: String(nested.village.homeCount), sub: "household books" },
                  { k: "Kitchen-bound", v: formatKg(nested.kitchenBoundGrams), sub: "Magh implies variety" },
                ]}
              />
            </div>
            <p className={cn("mt-3 font-mono text-[11px] uppercase tracking-[0.14em]", nested.conserved ? "text-live" : "text-gap")}>
              {nested.conserved ? "Conserved · person = home = village" : "Not conserved · do not close"}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">Books still hydrating. Nested remaining waits on cells.</p>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-display text-xl">Analog families</h3>
            <p className="mt-1 text-sm text-muted">Click a family. AI manages it. Missing stay named. Refused stay refused.</p>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{modules.length} shown</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "h-11 rounded-full border px-4 text-sm",
                filter === f.id ? "border-live/40 bg-live/10 text-live" : "border-border text-muted hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <li key={mod.id}>
              <ModuleCard
                mod={mod}
                active={picked === mod.id}
                onManage={() => setPicked(mod.id)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Brain className="size-4 text-partial" strokeWidth={1.5} aria-hidden />
          <h3 className="font-display text-xl">AI manage</h3>
        </div>
        <p className="mt-1 text-sm text-muted">
          {selected.sap} · {selected.analog}. Passport or named-missing. Rupee write stays false.
        </p>
        <div className="mt-4 rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[11px] text-muted">{managed.moduleId}</p>
            <Badge variant={tone(managed.decision)}>{managed.decision}</Badge>
          </div>
          <p className="mt-2 text-sm font-medium">{managed.analog}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{managed.reason}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Fact label="Rupee write" value="false" />
            <Fact label="Clerk required" value={managed.clerkRequired ? "yes" : "no"} />
            <Fact label="Remaining" value={managed.remainingGrams == null ? "—" : formatKg(managed.remainingGrams)} />
            <Fact label="Amount" value="null" />
          </dl>
          {managed.passport ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {managed.passport.tissues.filter((t) => t.fired).map((t) => (
                <li key={t.id}>
                  <Badge variant={tone(t.verdict)}>{t.name} · {t.verdict}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-partial">
              No passport · {managed.status}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-partial" strokeWidth={1.5} aria-hidden />
          <h3 className="font-display text-xl">Stakeholders</h3>
        </div>
        <p className="mt-1 text-sm text-muted">
          Person, home, village. Banker and dealer cannot write. Companion and brain may propose only.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STAKEHOLDERS.map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{s.name}</p>
                <Badge variant={s.writes === "none" ? "gap" : s.writes === "rupee" ? "live" : "partial"}>
                  {s.writes === "none" ? "no write" : s.writes}
                </Badge>
              </div>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{s.scale}</p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.present}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-gap">{s.missing}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ModuleCard({
  mod,
  active,
  onManage,
}: {
  mod: ErpModule;
  active: boolean;
  onManage: () => void;
}) {
  const Icon = mod.status === "refused" ? Ban : mod.status === "missing" ? Network : LayoutGrid;
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col rounded-xl border bg-background p-4 text-left",
        active ? "border-live/50" : "border-border",
      )}
    >
      <button type="button" onClick={onManage} className="flex flex-col text-left">
        <span className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-muted">{mod.sap}</span>
          <Badge variant={tone(mod.status)}>{mod.status}</Badge>
        </span>
        <span className="mt-2 flex items-center gap-2 text-sm font-medium">
          <Icon className="size-3.5 shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
          {mod.analog}
        </span>
        <span className="mt-1 text-[13px] leading-relaxed text-muted">{mod.present}</span>
        <span className="mt-1 text-[13px] leading-relaxed text-gap">{mod.missing}</span>
      </button>
      <Link
        to={mod.href}
        className="mt-3 inline-block min-h-11 text-sm leading-[44px] text-partial hover:text-foreground"
      >
        Open {mod.kernel}
      </Link>
    </div>
  );
}

function NestedCol({
  label,
  value,
  rows,
}: {
  label: string;
  value: string;
  rows: { k: string; v: string; sub: string }[];
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl text-live">{value}</p>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => (
          <li key={r.k} className="flex items-baseline justify-between gap-3">
            <span>
              <span className="text-sm">{r.k}</span>
              <span className="ml-2 font-mono text-[11px] text-muted">{r.sub}</span>
            </span>
            <span className="font-mono text-sm tabular-nums">{r.v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Kpi({ label, value, live, gap }: { label: string; value: string; live?: boolean; gap?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-2xl", live && "text-live", gap && "text-gap")}>{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 font-mono text-sm tabular-nums">{value}</p>
    </div>
  );
}
