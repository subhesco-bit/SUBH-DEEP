import { Link } from "@tanstack/react-router";
import { completionScore } from "@/lib/os/completion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CompletionBoard({ compact = false }: { compact?: boolean }) {
  const score = completionScore();

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
      data-qa="completion"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
        Honest completion · dual-truth · no invented ₹
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-medium tracking-tight">
            Classified. Not 100% GitHub.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {score.completeMeaning} Stages 0–6 closed on this kernel.{" "}
            {score.classified} concepts. {score.aiLiving} living AI passports of {score.aiUnits}.{" "}
            {score.erpModules} SAP analog families. sapParity false. aiParity false.
          </p>
        </div>
        <Badge variant="live">complete · classified</Badge>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Stages" value="0–6" live />
        <Kpi label="GitHub disk" value={`${score.githubPct}%`} gap />
        <Kpi label="Lattice" value={`~${score.latticePct}%`} />
        <Kpi label="Kernel plugs" value={`${score.kernelLivingPlugs}`} live />
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-live">Living walk</p>
        <ol className="mt-3 flex flex-wrap gap-2">
          {score.livingWalk.map((step, i) => (
            <li
              key={step}
              className="rounded-xl border border-live/30 bg-background px-3 py-2 font-mono text-[11px] text-live"
            >
              {String(i + 1).padStart(2, "0")} · {step}
            </li>
          ))}
        </ol>
      </div>

      {compact ? null : (
        <>
          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gap">Named missing</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {score.namedMissing.map((g) => (
                <li key={g.id}>
                  <Link
                    to={g.href as never}
                    className="block min-h-11 rounded-xl border border-border bg-background px-3 py-3 transition-colors hover:border-gap/40"
                    data-qa={`missing-${g.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{g.name}</p>
                      <Badge variant="gap">missing</Badge>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{g.reason}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-partial">Refused as gates</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {score.refused.map((g) => (
                <li key={g.id}>
                  <Link
                    to={g.href as never}
                    className="block min-h-11 rounded-xl border border-border bg-background px-3 py-3 transition-colors hover:border-partial/40"
                    data-qa={`refused-${g.id}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{g.name}</p>
                      <Badge variant="partial">refused</Badge>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{g.reason}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

function Kpi({
  label,
  value,
  live,
  gap,
}: {
  label: string;
  value: string;
  live?: boolean;
  gap?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div
        className={cn(
          "mt-1 font-mono text-lg tabular-nums",
          live ? "text-live" : gap ? "text-gap" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}
