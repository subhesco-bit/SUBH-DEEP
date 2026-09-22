import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { usePlatform } from "@/lib/erp/platform-store";
import { formatKg, formatRupee } from "@/lib/erp/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AtlasBoard } from "@/components/erp/atlas-board";
import { CompanionPanel } from "@/components/app/companion-panel";
import { proposeCompanion } from "@/lib/modules/companion";

const KINDS = ["drying", "milling", "cleaning", "grading"] as const;

export function PlatformBoard() {
  const snapshot = usePlatform((s) => s.snapshot);
  const busy = usePlatform((s) => s.busy);
  const error = usePlatform((s) => s.error);
  const process = usePlatform((s) => s.process);
  const lots = (snapshot?.lots ?? []).filter((l) => l.remainingGrams > 0);
  const [lotId, setLotId] = useState(lots[0]?.id ?? "");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("drying");
  const [lossKg, setLossKg] = useState("14");
  const [note, setNote] = useState("Moisture leave, declared");
  const pnl = snapshot?.pnl;
  const selected = lots.find((l) => l.id === lotId) ?? lots[0];
  const companion = snapshot
    ? proposeCompanion(snapshot, snapshot.exceptions)
    : null;

  return (
    <div className="space-y-6">
      <AtlasBoard />
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Rural ERP platform · {snapshot?.season?.name ?? "Magh"} · {snapshot?.fpo?.village ?? "Langthasa"}
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Platform</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Trial balance, cell statements, documents, and harvest-to-saleable
          process. Specialist books stay authoritative. The platform orchestrates.
          AI does not write rupees.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Gross offtake" value={pnl ? formatRupee(pnl.grossPaise) : "—"} />
          <Kpi label="Farmgate" value={pnl ? formatRupee(pnl.farmgatePaise) : "—"} live />
          <Kpi label="Inputs" value={pnl ? formatRupee(pnl.inputPaise) : "—"} />
          <Kpi label="Net to cells" value={pnl ? formatRupee(pnl.netToCellsPaise) : "—"} live />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          Season {snapshot?.season?.status ?? "open"} · {snapshot?.blocking ?? 0} blocking · {snapshot?.deferred ?? 0} deferred
        </p>
      </section>

      {companion ? <CompanionPanel reading={companion} compact /> : null}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Gates</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {(snapshot?.exceptions ?? []).map((g) => (
            <li key={g.code} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[11px] text-muted">{g.code}</p>
                <Badge variant={g.severity === "block" ? "gap" : g.severity === "defer" ? "partial" : "live"}>
                  {g.severity}
                </Badge>
              </div>
              <p className="mt-2 text-sm font-medium">{g.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{g.body}</p>
              {"action" in g && g.action ? (
                <p className="mt-1 font-mono text-[11px] text-partial">
                  {g.owner} · {g.impact} · {g.action}
                </p>
              ) : null}
              <Link to={g.href} className="mt-3 inline-block text-sm text-partial hover:text-foreground">
                Open
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Trial balance</h3>
          <p className="mt-1 text-sm text-muted">Every account from the journal. Debit cash in, credit farmgate out.</p>
          {(snapshot?.trialBalance ?? []).length === 0 ? (
            <p className="mt-4 text-sm text-muted">No journal yet.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-muted">
                  <th className="pb-2 font-medium">Account</th>
                  <th className="pb-2 text-right font-medium">Debit</th>
                  <th className="pb-2 text-right font-medium">Credit</th>
                </tr>
              </thead>
              <tbody>
                {snapshot?.trialBalance.map((row) => (
                  <tr key={`${row.account}-${row.organId}`} className="border-t border-border">
                    <td className="py-2">
                      {row.account}
                      <span className="ml-2 font-mono text-[11px] text-muted">{row.organId}</span>
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">{formatRupee(row.debitPaise)}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{formatRupee(row.creditPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Process · declared loss</h3>
          <p className="mt-1 text-sm text-muted">
            Harvest to saleable. Loss is declared. Remaining shrinks on the same lot body.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const id = lotId || selected?.id;
              if (!id) return;
              void process({ lotId: id, kind, lossKg, note });
            }}
          >
            <select
              className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={lotId || selected?.id || ""}
              onChange={(e) => setLotId(e.target.value)}
              aria-label="Lot to process"
            >
              {lots.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.cellName} · {l.variety} · {formatKg(l.remainingGrams)} left
                </option>
              ))}
            </select>
            <select
              className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={kind}
              onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
              aria-label="Process kind"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <Input value={lossKg} onChange={(e) => setLossKg(e.target.value)} aria-label="Declared loss kg" />
            <Input value={note} onChange={(e) => setNote(e.target.value)} aria-label="Process note" />
            <Button type="submit" disabled={busy || lots.length === 0} className="w-full">
              Post declared process
            </Button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Cell statements</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {(snapshot?.statements ?? []).map((s) => (
            <li key={s.cellId} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">{s.name}</p>
              <p className="font-mono text-[11px] text-muted">{s.household}</p>
              <dl className="mt-3 space-y-1 text-sm">
                <Row label="Harvest" value={formatKg(s.harvestGrams)} />
                <Row label="Remaining" value={formatKg(s.remainingGrams)} />
                <Row label="Farmgate" value={formatRupee(s.farmgatePaise)} live />
                <Row label="Inputs" value={formatRupee(s.inputPaise)} />
                <Row label="Net" value={formatRupee(s.netPaise)} live={s.netPaise >= 0} />
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Documents</h3>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(snapshot?.documents ?? []).map((d) => (
            <li key={d.id} className="rounded-xl border border-border bg-background p-4">
              <Badge>{d.kind}</Badge>
              <p className="mt-2 text-sm font-medium">{d.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{d.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-2xl", live && "text-live")}>{value}</p>
    </div>
  );
}

function Row({ label, value, live }: { label: string; value: string; live?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className={cn("font-mono tabular-nums", live && "text-live")}>{value}</span>
    </div>
  );
}
