import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  Cog,
  Ear,
  FlaskConical,
  Scan,
  Shield,
} from "lucide-react";
import {
  BRAIN_SIGNALS,
  TISSUES,
  brainDecide,
  type BrainSignal,
  type DecisionPassport,
  type TissueId,
} from "@/lib/brain";
import { travelPlan } from "@/lib/os";
import { useVillageBooks } from "@/components/erp/books-boot";
import { AiAtlas } from "@/components/app/ai-atlas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS: Record<TissueId, typeof Scan> = {
  frontier: Scan,
  agentic: Ear,
  physical: Cog,
  security: Shield,
  scientist: FlaskConical,
};

export function BrainBoard() {
  const books = useVillageBooks();
  const remaining = books?.lots.reduce((n, l) => n + l.remainingGrams, 0) ?? 180000;
  const outage = (books?.energyWindows ?? []).some((w) => w.active && w.status === "outage");
  const alert = (books?.weatherAlerts ?? []).some((a) => a.claimOpen);
  const iotTempC = books?.iotReadings.find((r) => r.unit === "C" || /temp/i.test(r.kind))?.valueNum ?? null;
  const kwh = books?.iotReadings.find((r) => r.unit === "kWh" || /kwh/i.test(r.kind))?.valueNum ?? null;
  const balanced = books?.kpis.journalBalanced ?? true;
  const [signal, setSignal] = useState<BrainSignal>("mill-heat");
  const [passport, setPassport] = useState<DecisionPassport | null>(null);

  const millBlocked = useMemo(() => {
    return outage || alert || (iotTempC != null && iotTempC >= 31);
  }, [outage, alert, iotTempC]);

  const journey = travelPlan({
    remainingGrams: remaining,
    weatherAlert: alert,
    millBlocked,
    kitchenAccess: true,
    tourism: false,
    budgetPaise: null,
  });

  function decide(next: BrainSignal) {
    setSignal(next);
    const p = brainDecide({
      signal: next,
      remainingGrams: next === "remaining" ? 0 : remaining,
      outage: next === "mill-heat" ? true : next === "mill-clear" ? false : outage,
      alert: next === "mill-heat" ? true : next === "mill-clear" ? false : alert,
      iotTempC: next === "mill-heat" ? 31.4 : next === "mill-clear" ? null : iotTempC,
      kwh: next === "mill-clear" ? 12 : next === "mill-heat" ? null : kwh,
      balanced: next === "period" ? false : balanced,
      clerk: "Biren",
      rupeeWrite: next === "rupee-write",
      lossPctDeclared: 10,
    });
    setPassport(p);
  }

  const fired = new Set((passport?.tissues ?? []).filter((t) => t.fired).map((t) => t.id));

  return (
    <div className="space-y-6">
      <AiAtlas />
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Village brain · one cortex, five tissues · no invented ₹
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-medium tracking-tight">Decide. Clerk writes.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Frontier, agentic, physical, security, and scientist sit on one nerve. GitHub still
              holds WIRED skeletons. This kernel fires a named signal, lights the tissues that
              own it, and writes a decision passport. Remaining grams move only when a clerk
              declares loss. Lattice ligaments stay ~39%. GitHub platform stays 7%.
            </p>
          </div>
          <Brain className="hidden size-10 text-live sm:block" strokeWidth={1.25} aria-hidden />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Stages closed" value="0–6" live />
          <Kpi label="Blocked catalog" value="0" />
          <Kpi label="Lattice" value="~39%" />
          <Kpi label="GitHub" value="7%" gap />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          Agriculture finance and procure stay missing · CFD refused · tourism refused · humanoid
          teleop refused · AI atlas classified 34 families · AI parity false
        </p>
        <p className="mt-3 text-sm text-muted">
          <Link to="/companion" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Agentic companion
          </Link>
          <span> proposes. </span>
          <Link to="/nerve" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Nerve
          </Link>
          <span> consults memory. </span>
          <Link to="/os" className="underline decoration-border underline-offset-4 hover:text-foreground">
            OS board
          </Link>
          <span> holds the remaining journey. </span>
          <Link to="/systems" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Systems
          </Link>
          <span> still names the GitHub cadavers.</span>
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Cortex</p>
        <h3 className="mt-2 font-display text-xl">Five tissues. One mouth.</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TISSUES.map((t) => {
            const Icon = ICONS[t.id];
            const verdict = passport?.tissues.find((v) => v.id === t.id);
            const on = fired.has(t.id);
            return (
              <article
                key={t.id}
                className={cn(
                  "rounded-xl border px-3 py-3 transition-colors duration-200",
                  on ? "border-live/50 bg-background" : "border-border bg-background",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <Icon className={cn("size-4", on ? "text-live" : "text-muted")} strokeWidth={1.5} />
                  <Badge variant={on ? klass(verdict?.verdict ?? "pass") : "default"}>
                    {on ? verdict?.verdict : "idle"}
                  </Badge>
                </div>
                <h4 className="mt-3 font-display text-lg tracking-tight">{t.short}</h4>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground/90">{t.living}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gap">{t.refuse}</p>
                <Link
                  to={t.href as never}
                  className="mt-3 inline-flex min-h-11 items-center text-sm underline decoration-border underline-offset-4 hover:text-foreground"
                >
                  Open {t.short}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Signal</p>
        <h3 className="mt-2 font-display text-xl">Name the pulse. The brain answers.</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Library-first. No model call on this page. Remaining on the books: {remaining} g.
          Mill {millBlocked ? "blocked" : "clear"}. Journal {balanced ? "balanced" : "unbalanced"}.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BRAIN_SIGNALS.map((s) => (
            <Button
              key={s.id}
              type="button"
              size="sm"
              variant={signal === s.id && passport ? "default" : "outline"}
              className="min-h-11"
              data-qa={`brain-${s.id}`}
              onClick={() => decide(s.id)}
            >
              {s.label}
            </Button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">{BRAIN_SIGNALS.find((s) => s.id === signal)?.body}</p>
      </section>

      {passport ? (
        <section className="rounded-2xl border border-live/30 bg-surface p-5" data-qa="brain-passport">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-live">Decision passport</p>
          <h3 className="mt-2 font-display text-xl">Result. {passport.decision}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed">{passport.reason}</p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Fact label="Organ" value={passport.organ} />
            <Fact label="Algorithm" value={passport.algorithm} />
            <Fact label="Remaining" value={passport.remainingGrams == null ? "—" : `${passport.remainingGrams} g`} />
            <Fact label="Rupee write" value="false" />
            <Fact label="Amount" value="undeclared" />
            <Fact label="Yield" value="null" />
            <Fact label="Humanoid" value="false" />
            <Fact label="Clerk" value={passport.clerkRequired ? "required" : "recorded"} />
          </dl>
          <ul className="mt-4 divide-y divide-border">
            {passport.tissues.map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{t.fired ? t.reason : "Idle on this signal."}</p>
                </div>
                <Badge variant={t.fired ? klass(t.verdict) : "default"}>{t.fired ? t.verdict : "idle"}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-5">
          <p className="text-sm text-muted">Fire a signal. The passport stays blank until a tissue answers.</p>
        </section>
      )}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          a-travel · remaining journey
        </p>
        <h3 className="mt-2 font-display text-xl">Contextual planner of remaining, not tourists</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{journey.reason}</p>
        {journey.itinerary ? (
          <ol className="mt-4 grid gap-2 sm:grid-cols-5">
            {journey.itinerary.map((step, i) => (
              <li key={step.id} className="rounded-xl border border-border bg-background px-3 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {String(i + 1).padStart(2, "0")} · {step.organ}
                </p>
                <p className="mt-1 text-sm font-medium">{step.name}</p>
                <p className="mt-1 text-[12px] text-muted">{step.constraint}</p>
                <Badge variant={step.status === "open" ? "live" : "partial"} className="mt-2">
                  {step.status}
                </Badge>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 font-mono text-[11px] text-gap">Result. {journey.status} · itinerary null</p>
        )}
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          Budget {journey.budgetPaise === null ? "undeclared" : journey.budgetPaise} · agriculture finance
          and procure stay missing
        </p>
      </section>
    </div>
  );
}

function klass(v: string) {
  if (v === "pass" || v === "hypothesis") return "live" as const;
  if (v === "propose" || v === "defer") return "partial" as const;
  return "gap" as const;
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
