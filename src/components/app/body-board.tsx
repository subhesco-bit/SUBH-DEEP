import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  Ban,
  Ear,
  Eye,
  Fingerprint,
  Footprints,
  GitBranch,
  Hand,
  Heart,
  Pause,
  Shield,
  Spline,
} from "lucide-react";
import {
  actBody,
  attemptWrong,
  BODY_BY_ID,
  BODY_PARTS,
  bodyTone,
  correctRelax,
  defaultFacts,
  factsForIssue,
  ISSUE_DEFS,
  ISSUE_BY_ID,
  reactNow,
  reactToIssue,
  RELAX_ACTIONS,
  relaxBody,
  WRONG_ATTEMPTS,
  type BodyAct,
  type BodyFacts,
  type BodyPartId,
  type IssueId,
  type ReflexAct,
  type RelaxKind,
  type WrongAttempt,
} from "@/lib/body";
import { BodyFigure, BodyHotspots } from "@/components/app/body-figure";
import { useVillageBooks } from "@/components/erp/books-boot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ICONS = {
  skin: Shield,
  hand: Hand,
  muscle: Activity,
  ligament: GitBranch,
  relax: Pause,
  vein: Spline,
  heart: Heart,
  ear: Ear,
  eye: Eye,
  finger: Fingerprint,
  feet: Footprints,
} as const;

function klass(s: string) {
  if (s === "living" || s === "pass" || s === "done" || s === "recover" || s === "relax") return "live" as const;
  if (s === "partial" || s === "defer" || s === "wait") return "partial" as const;
  return "gap" as const;
}

export function BodyBoard() {
  const books = useVillageBooks();
  const lot = books?.lots[0];
  const cell = books?.cells[0];
  const remaining = lot?.remainingGrams ?? cell?.remainingGrams ?? 180000;
  const minted = lot?.grams ?? remaining;
  const liveFacts = useMemo<BodyFacts>(
    () =>
      defaultFacts({
        remainingGrams: remaining,
        cellId: cell?.id ?? "c-enghi",
        clerk: "Biren",
        outage: (books?.energyWindows ?? []).some((w) => w.active && w.status === "outage"),
        alert: (books?.weatherAlerts ?? []).some((a) => a.claimOpen),
        iotTempC: books?.iotReadings.find((r) => r.unit === "C" || /temp/i.test(r.kind))?.valueNum ?? null,
        kwh: (books?.energyWindows ?? []).find((w) => w.kwh != null)?.kwh ?? null,
        balanced: books?.kpis.journalBalanced ?? true,
        mintedGrams: minted,
        offtakeGrams: 0,
        spoilageGrams: 0,
        rupeeWrite: false,
        tourism: false,
      }),
    [books, remaining, minted, cell?.id],
  );
  const [drill, setDrill] = useState<IssueId | "live">("live");
  const facts = drill === "live" ? liveFacts : factsForIssue(liveFacts, drill);
  const report = useMemo(() => {
    if (drill === "live") return reactNow(facts);
    const reflex = reactToIssue(drill, facts);
    const primary = { ...ISSUE_BY_ID[drill], live: true as const };
    return {
      issues: [primary],
      primary,
      reflex,
      remainingHeld: true as const,
      freezeEmi: false as const,
      rupee: null,
    };
  }, [facts, drill]);
  const allowedRelax = useMemo(() => correctRelax(facts), [facts]);
  const [selected, setSelected] = useState<BodyPartId>("relax");
  const [result, setResult] = useState<BodyAct | ReflexAct | null>(null);
  const tone = bodyTone(facts);
  const part = BODY_BY_ID[selected];
  const Icon = ICONS[selected];
  const shown = result ?? report.reflex;
  const shownReason = "act" in shown && shown.act ? shown.reason : (shown as BodyAct).reason;
  const shownDecision = "act" in shown && shown.act ? shown.act.decision : (shown as BodyAct).decision;
  const shownSignals =
    "act" in shown && shown.act ? shown.act.signals : (shown as BodyAct).signals;

  function fire(id: BodyPartId) {
    setSelected(id);
    setResult(actBody(id, facts));
  }

  function rest(kind: RelaxKind) {
    setSelected("relax");
    setResult(relaxBody(kind, facts));
  }

  function arise(id: IssueId | "live") {
    setDrill(id);
    setSelected("relax");
    setResult(null);
  }

  function wrong(kind: WrongAttempt) {
    setSelected("relax");
    setResult(attemptWrong(kind, facts));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Human-equivalent body · immediate reaction · no invented ₹
        </p>
        <h2 className="mt-2 text-balance font-display text-3xl font-medium tracking-tight">
          Relax is the withdraw reflex
        </h2>
        <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted">
          When an issue arises, the ear hears named signals, the skin seals undeclared
          writes, and the muscle inhibits. That rest is the correct immediate action —
          reciprocal inhibition, not freeze, not panic. Remaining holds. EMI is not a
          muscle. Unclench while hot is refused. Clerk still writes any loss.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Parts living" value={`${tone.living}/11`} live />
          <Kpi label="Issue" value={report.primary.label} live={report.primary.posture === "recover"} />
          <Kpi
            label="Reaction"
            value={report.reflex.posture}
            live={report.reflex.posture === "relax" || report.reflex.posture === "recover"}
          />
          <Kpi label="Remaining" value={`${facts.remainingGrams} g`} live={facts.remainingGrams > 0} />
        </div>
        <p className="mt-4 text-[11px] uppercase tracking-[0.14em] text-muted">
          Skin {tone.skinSealed ? "sealed" : "open"} · remaining held · EMI not frozen · lattice ~39% · GitHub 7%
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Issue arises · sense · correct action · hold
        </p>
        <h3 className="mt-2 font-display text-xl">Immediate reaction, the correct way</h3>
        <ol className="mt-5 grid gap-3 sm:grid-cols-4">
          {report.reflex.path.map((step, i) => (
            <li key={step} className="rounded-xl border border-border bg-background px-3 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
                {i === 0 ? "Sense" : i === report.reflex.path.length - 1 ? "Hold" : "Act"}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">{step}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm leading-relaxed text-muted">{report.reflex.human}</p>
        <p
          data-qa="body-reflex"
          className={cn(
            "mt-3 rounded-xl border px-3 py-3 text-sm leading-relaxed",
            report.reflex.act.decision === "pass"
              ? "border-live/40 text-live"
              : report.reflex.act.decision === "defer"
                ? "border-partial/40 text-partial"
                : "border-gap/40 text-gap",
          )}
        >
          Live. {report.primary.label}. {report.reflex.reason}
        </p>
        <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Arise an issue. The body picks the correct rest.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <button
              type="button"
              data-qa="body-issue-live"
              onClick={() => arise("live")}
              className={cn(
                "h-11 rounded-md border px-3 text-sm transition-[color,background-color,border-color] duration-150",
                drill === "live" ? "border-foreground bg-accent text-foreground" : "border-border text-muted hover:text-foreground",
              )}
            >
              Live books
            </button>
          </li>
          {ISSUE_DEFS.filter((d) => d.id !== "clear").map((d) => (
            <li key={d.id}>
              <button
                type="button"
                data-qa={`body-issue-${d.id}`}
                onClick={() => arise(d.id)}
                className={cn(
                  "h-11 rounded-md border px-3 text-sm transition-[color,background-color,border-color] duration-150",
                  drill === d.id ? "border-foreground bg-accent text-foreground" : "border-border text-muted hover:text-foreground",
                )}
              >
                {d.label}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              data-qa="body-issue-clear"
              onClick={() => arise("clear")}
              className={cn(
                "h-11 rounded-md border px-3 text-sm transition-[color,background-color,border-color] duration-150",
                drill === "clear" ? "border-foreground bg-accent text-foreground" : "border-border text-muted hover:text-foreground",
              )}
            >
              Signals clear
            </button>
          </li>
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Anatomical plate</p>
          <h3 className="mt-2 font-display text-xl">Touch a part. Fire its gate.</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The outline is skin. Dashed joints are ligaments. Thin paths are veins of remaining.
            The live node is the heart. Arms thicken only when the mill may contract. The plexus
            is relax — it fires first when heat, alert, or outage arrives.
          </p>
          <div className="mt-4">
            <BodyFigure selected={selected} facts={facts} onSelect={fire} />
          </div>
          <div className="mt-4">
            <BodyHotspots selected={selected} onSelect={fire} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            {part.human} · {part.organ}
          </p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <h3 className="font-display text-xl">{part.name}</h3>
            <Badge variant={klass(part.status)}>{part.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-foreground">{part.dora}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{part.present}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">Missing: {part.missing}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">Next: {part.next}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button data-qa="body-fire" onClick={() => fire(selected)}>
              <Icon className="size-4" strokeWidth={1.75} />
              Fire {part.name.toLowerCase()}
            </Button>
            <Button asChild variant="outline">
              <Link to={part.href as never}>Open {part.organ}</Link>
            </Button>
          </div>
          {shownReason ? (
            <p
              data-qa="body-result"
              className={cn(
                "mt-4 rounded-xl border px-3 py-3 text-sm leading-relaxed",
                shownDecision === "pass"
                  ? "border-live/40 text-live"
                  : shownDecision === "defer"
                    ? "border-partial/40 text-partial"
                    : "border-gap/40 text-gap",
              )}
            >
              Result. {shownReason}
              {shownSignals.length ? ` · ${shownSignals.join(" + ")}` : ""}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">Result. Waiting on a part or a relax action.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Relax actions · correct rest given this issue
        </p>
        <h3 className="mt-2 font-display text-xl">Five ways the body rests without inventing a rupee</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Rest is a gate. Climate can stop the mill. Remaining does not leave the body until a clerk
          names a loss. Period close needs a balanced journal. Skin seals AI rupee writes. The
          highlighted rest is the correct immediate reaction for the issue now live.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RELAX_ACTIONS.map((a) => {
            const correct = allowedRelax.includes(a.id);
            const isPrimary = report.reflex.relax === a.id;
            return (
              <button
                key={a.id}
                type="button"
                data-qa={`body-relax-${a.id}`}
                onClick={() => rest(a.id)}
                className={cn(
                  "min-h-11 rounded-xl border bg-background p-4 text-left transition-[border-color,background-color] duration-150 hover:border-foreground",
                  isPrimary ? "border-foreground" : "border-border",
                )}
              >
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted">
                  {isPrimary ? "correct now" : correct ? a.human : "wrong now"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.present}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Wrong reaction · panic paths refused
        </p>
        <h3 className="mt-2 font-display text-xl">Try the incorrect action. The body refuses it.</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          A human does not keep pressing into a burn, freeze a loan, or invent a rupee.
          Forced unclench, EMI freeze, AI ₹, undeclared remaining cuts, tourism, guessed
          kWh, and Magh close on a tilted journal are named and refused.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {WRONG_ATTEMPTS.map((w) => (
            <button
              key={w.id}
              type="button"
              data-qa={`body-wrong-${w.id}`}
              onClick={() => wrong(w.id)}
              className="min-h-11 rounded-xl border border-border bg-background p-4 text-left transition-[border-color] duration-150 hover:border-foreground"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Ban className="size-4 shrink-0 text-gap" strokeWidth={1.75} />
                {w.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{w.human}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Catalog of parts</p>
        <h3 className="mt-2 font-display text-xl">Equivalent, not costume</h3>
        <ul className="mt-4 divide-y divide-border">
          {BODY_PARTS.map((p) => {
            const PartIcon = ICONS[p.id];
            return (
              <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                  onClick={() => fire(p.id)}
                >
                  <PartIcon className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {p.name}{" "}
                      <span className="font-sans font-normal text-muted">· {p.human}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted">{p.dora}</p>
                  </div>
                </button>
                <Badge variant={klass(p.status)}>{p.status}</Badge>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  live,
}: {
  label: string;
  value: string | number;
  live?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className={cn("font-mono text-lg capitalize tabular-nums", live ? "text-live" : "text-foreground")}>
        {value}
      </div>
    </div>
  );
}
