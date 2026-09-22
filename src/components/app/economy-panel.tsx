import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { composeEconomy, GITHUB_CLAIM, ORGANISM_HEALTH } from "@/lib/tokens/economy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EconomyPanel() {
  const snap = useMemo(() => composeEconomy(), []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Token economy · library first · llmCalls 0
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Spend 0 paise on a dump</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{snap.thesis}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Naive dump" value={snap.naiveTokens.toLocaleString()} />
          <Kpi label="Compact envelope" value={snap.compactTokens.toLocaleString()} live />
          <Kpi label="Batch saved" value={`${snap.batchSavedPct}%`} live />
          <Kpi label="LLM calls" value={snap.llmCalls} live />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          Batch naive {snap.batchNaiveTokens.toLocaleString()} · compact {snap.batchCompactTokens.toLocaleString()} · cache{" "}
          {snap.cacheHits}/{snap.receipts.length}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/nerve">Nerve reflexes</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/library">Library</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/charter">Charter laws</Link>
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Plugins</h3>
        <p className="mt-1 text-sm text-muted">
          Not OpenAI tools. Compactors. Python batch uses the same 4-character token rule. PowerShell is not the nerve.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {snap.plugins.map((p) => (
            <li key={p.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{p.label}</p>
                <Badge variant="live">{p.tokens} tok</Badge>
              </div>
              <p className="mt-2 font-mono text-[11px] text-muted">{p.id}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Batch receipts</h3>
        <p className="mt-1 text-sm text-muted">Every reflex packed. None sent to a model.</p>
        <ul className="mt-4 space-y-2">
          {snap.receipts.map((r) => (
            <li key={r.query} className="rounded-xl border border-border bg-background px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">{r.query}</p>
                <Badge variant="live">{r.savedPct}%</Badge>
              </div>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {r.naiveTokens} → {r.compactTokens} · {r.hits[0] ?? "no hit"} · llm {r.llmCalls}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">GitHub paste is not this body</h3>
        <p className="mt-1 text-sm text-muted">
          968 routes, 46 stubbed ERP endpoints, 80% coverage — those are cadaver counts. This organism does not inherit them.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gap">GitHub claim</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>Routes {GITHUB_CLAIM.routes}</li>
              <li>Migrations {GITHUB_CLAIM.migrationsPassing}</li>
              <li>Services ~{GITHUB_CLAIM.services}</li>
              <li>ERP stubbed {GITHUB_CLAIM.erpStubbed}</li>
              <li>Tests {GITHUB_CLAIM.coverage}</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-live">This organism</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              <li>{ORGANISM_HEALTH.fileRoutes}</li>
              <li>{ORGANISM_HEALTH.migrations}</li>
              <li>{ORGANISM_HEALTH.erp}</li>
              <li>{ORGANISM_HEALTH.llm}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, live }: { label: string; value: string | number; live?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl ${live ? "text-live" : ""}`}>{value}</p>
    </div>
  );
}
