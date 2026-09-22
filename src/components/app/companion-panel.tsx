import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBooks } from "@/lib/erp/store";
import { usePlatform } from "@/lib/erp/platform-store";
import type { CompanionProposal, CompanionReading } from "@/lib/modules/companion";

export function CompanionPanel({
  reading,
  compact = false,
}: {
  reading: CompanionReading | null;
  compact?: boolean;
}) {
  if (!reading) return null;

  return (
    <section className="rounded-2xl border border-live/30 bg-surface p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-live">Agentic companion</p>
      {!compact ? (
        <>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Propose. Clerk approves.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Agentic, copilot, ERP agents, and advisory were meant to sit on the farmer cell
            as one companion — not sixteen portals. GitHub still holds a WIRED skeleton.
            This organism proposes the next gate. A clerk names paymentRef, kilograms, and loss.
            The companion never writes a rupee.
          </p>
        </>
      ) : null}
      <p className="mt-3 text-sm text-live">{reading.next}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{reading.memory}</p>
      <p className="mt-1 font-mono text-[11px] text-partial">{reading.firewall}</p>
      {reading.libraryHit ? (
        <p className="mt-1 font-mono text-[11px] text-muted">Library · {reading.libraryHit}</p>
      ) : null}
      <ul className={compact ? "mt-4 space-y-3" : "mt-5 grid gap-3 sm:grid-cols-2"}>
        {reading.proposals.map((p) => (
          <ProposalCard key={p.id} proposal={p} />
        ))}
      </ul>
    </section>
  );
}

function ProposalCard({ proposal }: { proposal: CompanionProposal }) {
  const busy = useBooks((s) => s.busy);
  const error = useBooks((s) => s.error);
  const intake = useBooks((s) => s.intake);
  const settle = useBooks((s) => s.settle);
  const harvest = useBooks((s) => s.harvest);
  const process = usePlatform((s) => s.process);
  const [paymentRef, setPaymentRef] = useState("");
  const [hours, setHours] = useState("18");
  const [kg, setKg] = useState("");
  const [variety, setVariety] = useState("Chakhao Poireiton");
  const [commodity, setCommodity] = useState("black rice");
  const [lossKg, setLossKg] = useState("");
  const [kind, setKind] = useState("drying");
  const [local, setLocal] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function approve() {
    setLocal(null);
    let ok = false;
    if (proposal.action === "intake" && proposal.lotId) {
      ok = await intake(proposal.lotId);
    } else if (proposal.action === "settle" && proposal.orderId) {
      if (!paymentRef.trim()) {
        setLocal("paymentRef is required — never invented.");
        return;
      }
      ok = await settle(proposal.orderId, paymentRef.trim(), hours);
    } else if (proposal.action === "harvest" && proposal.cellId) {
      if (!kg.trim()) {
        setLocal("Declared kilograms required.");
        return;
      }
      ok = await harvest({ cellId: proposal.cellId, variety, commodity, kg });
    } else if (proposal.action === "process" && proposal.lotId) {
      if (lossKg.trim() === "") {
        setLocal("Declared loss is required, including zero.");
        return;
      }
      ok = await process({ lotId: proposal.lotId, kind, lossKg, note: "Companion-approved declared loss" });
    }
    if (ok) setDone(true);
  }

  return (
    <li className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[11px] text-muted">{proposal.moduleId}</p>
        <Badge variant={proposal.severity === "defer" ? "partial" : "live"}>{proposal.action}</Badge>
      </div>
      <p className="mt-2 text-sm font-medium">{proposal.title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{proposal.body}</p>
      {proposal.envelope ? (
        <p className="mt-2 font-mono text-[11px] text-partial">
          {proposal.envelope.actionBoundary} · {proposal.envelope.humanApproval} · {proposal.envelope.confidence}
        </p>
      ) : null}
      {done ? (
        <p className="mt-3 text-sm text-live">Clerk approved. Books moved.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {proposal.action === "settle" ? (
            <>
              <Input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="paymentRef"
                aria-label="paymentRef"
              />
              <Input value={hours} onChange={(e) => setHours(e.target.value)} aria-label="Hours to pay" />
            </>
          ) : null}
          {proposal.action === "harvest" ? (
            <>
              <Input value={kg} onChange={(e) => setKg(e.target.value)} placeholder="kg" aria-label="Declared kilograms" />
              <Input value={variety} onChange={(e) => setVariety(e.target.value)} aria-label="Variety" />
              <Input value={commodity} onChange={(e) => setCommodity(e.target.value)} aria-label="Commodity" />
            </>
          ) : null}
          {proposal.action === "process" ? (
            <>
              <Input
                value={lossKg}
                onChange={(e) => setLossKg(e.target.value)}
                placeholder="loss kg"
                aria-label="Declared loss kg"
              />
              <select
                className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
                aria-label="Process kind"
              >
                <option value="drying">drying</option>
                <option value="milling">milling</option>
                <option value="cleaning">cleaning</option>
                <option value="grading">grading</option>
              </select>
            </>
          ) : null}
          {local || (error && proposal.action !== "consult") ? (
            <p className="text-sm text-destructive">{local ?? error}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {proposal.action === "consult" ? (
              <Button asChild size="sm" variant="outline">
                <Link to={proposal.href}>Open library</Link>
              </Button>
            ) : (
              <Button size="sm" disabled={busy} onClick={() => void approve()}>
                Approve {proposal.action}
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link to={proposal.href}>Open {proposal.organ}</Link>
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
