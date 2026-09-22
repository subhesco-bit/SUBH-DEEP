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
        <h3 className="font-display text-xl">GitHub health paste is not this body</h3>
        <p className="mt-1 text-sm text-muted">
          Do not scaffold those 46 ERP stubs here. The journal is the GL. Token economy packs the consult. OpenAI is not the nerve.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.12em] text-muted">
                <th className="pb-2 pr-3 font-medium">Aspect</th>
                <th className="pb-2 pr-3 font-medium">GitHub claim</th>
                <th className="pb-2 font-medium">This organism</th>
              </tr>
            </thead>
            <tbody>
              <Row aspect="Vulnerabilities" github={GITHUB_CLAIM.vulns} here={ORGANISM_HEALTH.vulns} />
              <Row aspect="Critical" github={String(GITHUB_CLAIM.critical)} here="None claimed by that paste" />
              <Row aspect="Routes" github={`${GITHUB_CLAIM.routes} · ${GITHUB_CLAIM.routesClaim}`} here={`${ORGANISM_HEALTH.fileRoutes} living file routes`} />
              <Row aspect="Migrations" github={`${GITHUB_CLAIM.migrationsPassing} · ${GITHUB_CLAIM.collisions} collisions`} here={ORGANISM_HEALTH.migrations} />
              <Row aspect="Services" github={`~${GITHUB_CLAIM.services} · ${GITHUB_CLAIM.productionPct} · ${GITHUB_CLAIM.duplicates} dupes`} here={ORGANISM_HEALTH.duplicates} />
              <Row aspect="Tests" github={`${GITHUB_CLAIM.coverage} · ${GITHUB_CLAIM.testsFailing} failing`} here={ORGANISM_HEALTH.tests} />
              <Row aspect="ERP / GL" github={`${GITHUB_CLAIM.erpStubbed} stubbed`} here={ORGANISM_HEALTH.erp} />
              <Row aspect="Missing" github={`${GITHUB_CLAIM.missingCritical} critical services`} here={ORGANISM_HEALTH.missing} />
              <Row aspect="Tokens" github="Dump the cadaver into OpenAI" here={ORGANISM_HEALTH.llm} />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Row({ aspect, github, here }: { aspect: string; github: string; here: string }) {
  return (
    <tr className="border-t border-border align-top">
      <td className="py-2 pr-3 font-medium">{aspect}</td>
      <td className="py-2 pr-3 text-gap">{github}</td>
      <td className="py-2 text-live">{here}</td>
    </tr>
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
