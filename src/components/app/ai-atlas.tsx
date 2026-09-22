import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import {
  AI_UNITS,
  ackAi,
  aiScore,
  unitsByStatus,
  type AiAtlasFilter,
  type AiUnit,
} from "@/lib/brain";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useVillageBooks } from "@/components/erp/books-boot";

const FILTERS: { id: AiAtlasFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "living", label: "Living" },
  { id: "partial", label: "Partial" },
  { id: "missing", label: "Named missing" },
  { id: "refused", label: "Refused" },
];

function tone(status: string): "live" | "partial" | "gap" {
  if (status === "living" || status === "pass") return "live";
  if (
    status === "partial" ||
    status === "defer" ||
    status === "propose" ||
    status === "named" ||
    status === "hypothesis"
  ) {
    return "partial";
  }
  return "gap";
}

export function AiAtlas() {
  const books = useVillageBooks();
  const score = aiScore();
  const [filter, setFilter] = useState<AiAtlasFilter>("all");
  const [picked, setPicked] = useState("cortex");
  const units = unitsByStatus(filter);

  const facts = useMemo(() => {
    const remainingGrams = books?.lots.reduce((n, l) => n + l.remainingGrams, 0) ?? 180000;
    const outage = (books?.energyWindows ?? []).some((w) => w.active && w.status === "outage");
    const alert = (books?.weatherAlerts ?? []).some((a) => a.claimOpen);
    const iotTempC = books?.iotReadings.find((r) => r.unit === "C" || /temp/i.test(r.kind))?.valueNum ?? null;
    const kwh = books?.iotReadings.find((r) => r.unit === "kWh" || /kwh/i.test(r.kind))?.valueNum ?? null;
    return {
      remainingGrams,
      outage,
      alert,
      iotTempC,
      kwh,
      balanced: books?.kpis.journalBalanced ?? true,
      clerk: "Biren" as const,
    };
  }, [books]);

  const acked = useMemo(() => ackAi(picked, facts), [picked, facts]);
  const selected = AI_UNITS.find((u) => u.id === picked) ?? AI_UNITS[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          AI atlas · classified, not complete · decision on this kernel
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-medium tracking-tight">Acked. Not parity.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Every named AI is classified: living, partial, missing, or refused.
              Five tissues fire a decision passport. GitHub still holds{" "}
              {score.githubCadavers} cadavers with zero living plugs. This is not
              a complete AI product. Finance AI and procure AI stay missing. AI
              cannot write rupees.
            </p>
          </div>
          <Shield className="hidden size-10 text-live sm:block" strokeWidth={1.25} aria-hidden />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Families classified" value={`${score.classifiedPct}%`} live />
          <Kpi label="AI parity" value="false" gap />
          <Kpi label="Decision" value="living" live />
          <Kpi label="GitHub plugs" value={`${score.githubLivingPlugs}`} gap />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          {score.living} living · {score.partial} partial · {score.missing} missing · {score.refused} refused
          · {score.latticeTissues} tissues · {score.signals} signals · lattice ~{score.latticePct}% · GitHub {score.githubPct}%
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Families</p>
            <h3 className="mt-1 font-display text-xl">Ack one. Passport or named-missing.</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={cn(
                  "min-h-11 rounded-full border px-3 text-sm",
                  filter === f.id ? "border-live/50 bg-background text-foreground" : "border-border text-muted",
                )}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {units.map((u) => (
            <UnitCard key={u.id} unit={u} active={u.id === picked} onAck={() => setPicked(u.id)} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-live/30 bg-surface p-5" data-qa="ai-ack">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-live">
          Passport or named-missing
        </p>
        <h3 className="mt-2 font-display text-xl">
          {selected.name}. {acked.decision}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed">{acked.reason}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Analog" value={acked.analog} />
          <Fact label="Status" value={acked.status} />
          <Fact label="Rupee write" value="false" />
          <Fact label="Amount" value="undeclared" />
          <Fact label="Yield" value="null" />
          <Fact label="Humanoid" value="false" />
          <Fact label="Clerk" value={acked.clerkRequired ? "required" : "recorded"} />
          <Fact
            label="Remaining"
            value={acked.remainingGrams == null ? "—" : `${acked.remainingGrams} g`}
          />
        </dl>
        {acked.passport ? (
          <ul className="mt-4 divide-y divide-border">
            {acked.passport.tissues.map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{t.fired ? t.reason : "Idle on this signal."}</p>
                </div>
                <Badge variant={t.fired ? tone(t.verdict) : "default"}>{t.fired ? t.verdict : "idle"}</Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 font-mono text-[11px] text-gap">No passport. Named, not living.</p>
        )}
        <p className="mt-4 text-sm text-muted">
          <Link to="/systems" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Systems
          </Link>
          <span> still names the GitHub cadavers. </span>
          <Link to="/companion" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Companion
          </Link>
          <span> proposes. Clerk writes remaining.</span>
        </p>
      </section>
    </div>
  );
}

function UnitCard({
  unit,
  active,
  onAck,
}: {
  unit: AiUnit;
  active: boolean;
  onAck: () => void;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-background px-3 py-3",
        active ? "border-live/50" : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{unit.tissue}</p>
        <Badge variant={tone(unit.status)}>{unit.status}</Badge>
      </div>
      <h4 className="mt-2 font-display text-lg tracking-tight">{unit.name}</h4>
      <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">{unit.present}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gap">{unit.missing}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="min-h-11 text-sm underline decoration-border underline-offset-4 hover:text-foreground"
          data-qa={`ai-ack-${unit.id}`}
          onClick={onAck}
        >
          Ack {unit.analog}
        </button>
        <Link
          to={unit.href as never}
          className="inline-flex min-h-11 items-center text-sm underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Open
        </Link>
      </div>
    </article>
  );
}

function Kpi({ label, value, live, gap }: { label: string; value: string; live?: boolean; gap?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("mt-1 font-display text-2xl tracking-tight", live && "text-live", gap && "text-gap")}>
        {value}
      </p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-3">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-[12px]">{value}</dd>
    </div>
  );
}
