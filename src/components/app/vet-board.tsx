import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Ban, PawPrint, Spline } from "lucide-react";
import {
  CODE_SYSTEMS,
  SPECIES,
  codesForSpecies,
  confirmVet,
  proposeVet,
  repairLineages,
  signsForSpecies,
  type SpeciesId,
  type VetConfirm,
  type VetProposal,
} from "@/lib/vet";
import { useVillageBooks } from "@/components/erp/books-boot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function tone(status: string): "live" | "partial" | "gap" {
  if (status === "living" || status === "pass" || status === "propose") return "live";
  if (status === "partial" || status === "defer" || status === "named") return "partial";
  return "gap";
}

export function VetBoard() {
  const books = useVillageBooks();
  const [species, setSpecies] = useState<SpeciesId>("cattle");
  const [picked, setPicked] = useState<string[]>(["hot-udder"]);
  const [heads, setHeads] = useState("2");
  const [remainingHeads, setRemainingHeads] = useState("2");
  const [proposal, setProposal] = useState<VetProposal | null>(null);
  const [confirm, setConfirm] = useState<VetConfirm | null>(null);

  const codes = codesForSpecies(species);
  const signs = signsForSpecies(species);
  const herd = (books?.herd ?? []).filter((h) => h.kind === species || (species === "cattle" && h.kind === "cattle"));
  const wiring = useMemo(
    () =>
      repairLineages({
        lots: books?.lots ?? [],
        giChain: books?.giChain ?? [],
        herd: books?.herd ?? [],
        cells: books?.cells ?? [],
      }),
    [books],
  );

  function toggle(sign: string) {
    setPicked((cur) => (cur.includes(sign) ? cur.filter((s) => s !== sign) : [...cur, sign]));
    setProposal(null);
    setConfirm(null);
  }

  function firePropose(extra?: { note?: string; signs?: string[]; species?: SpeciesId }) {
    const next = proposeVet({
      species: extra?.species ?? species,
      signs: extra?.signs ?? picked,
      note: extra?.note,
    });
    setProposal(next);
    setConfirm(null);
  }

  function fireConfirm() {
    if (!proposal?.code) return;
    const next = confirmVet({
      species,
      codeId: proposal.code.id,
      heads: Number(heads) || 0,
      remainingHeads: Number(remainingHeads) || 0,
    });
    setConfirm(next);
  }

  const shown = confirm ?? proposal;
  const shownTone = shown ? tone(confirm ? confirm.decision : (proposal?.decision ?? "named")) : "partial";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          August AI · Veterinary coding · second genome
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-medium tracking-tight">Animals, not a hospital coder.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              AFRERA-VET names cattle, buffalo, goat, pig, poultry, duck, fish, dog, and cat. August AI
              proposes. A vet or clerk confirms heads. GitHub human ICD / CPT / HCPCS stays a cadaver.
              Milk rupees stay missing. EMI is not frozen.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="live">AFRERA-VET living</Badge>
            <Badge variant="partial">ICD-11 analog</Badge>
            <Badge variant="gap">GitHub ICD refused</Badge>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Species" value={SPECIES.length} />
          <Kpi label="Named codes" value={codes.length} live />
          <Kpi label="Lineage" value={wiring.conserved ? "conserved" : "named break"} live={wiring.conserved} />
          <Kpi label="Milk rupees" value="missing" gap />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Species</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SPECIES.map((s) => (
              <button
                key={s.id}
                type="button"
                data-qa={`vet-species-${s.id}`}
                onClick={() => {
                  setSpecies(s.id);
                  setPicked(signsForSpecies(s.id).slice(0, 1));
                  setProposal(null);
                  setConfirm(null);
                  const live = (books?.herd ?? []).find((h) => h.kind === s.id);
                  if (live) {
                    setHeads(String(live.head));
                    setRemainingHeads(String(live.head));
                  }
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm",
                  species === s.id ? "border-live/50 text-live" : "border-border text-muted hover:text-foreground",
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{SPECIES.find((s) => s.id === species)?.present}</p>
          <p className="mt-1 text-xs text-gap">Missing: {SPECIES.find((s) => s.id === species)?.missing}</p>

          <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Signs</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {signs.map((sign) => (
              <button
                key={sign}
                type="button"
                data-qa={`vet-sign-${sign}`}
                onClick={() => toggle(sign)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs",
                  picked.includes(sign) ? "border-live/50 text-live" : "border-border text-muted hover:text-foreground",
                )}
              >
                {sign}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button data-qa="vet-propose" type="button" onClick={() => firePropose()}>
              Propose code
            </Button>
            <Button
              data-qa="vet-wrong-icd"
              type="button"
              variant="outline"
              onClick={() => firePropose({ note: "ICD-10 E11.9 diabetes", signs: ["thin"] })}
            >
              Try human ICD
            </Button>
            <Button
              data-qa="vet-asf"
              type="button"
              variant="outline"
              onClick={() => {
                setSpecies("pig");
                setPicked(["fever", "blotching"]);
                firePropose({ species: "pig", signs: ["fever", "blotching"] });
              }}
            >
              Name ASF
            </Button>
          </div>

          <ul className="mt-6 divide-y divide-border">
            {codes.map((row) => (
              <li key={row.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs text-muted">{row.id}</p>
                  <Badge variant={tone(row.status)}>{row.status}</Badge>
                  <p className="font-medium">{row.label}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{row.present}</p>
                <p className="mt-1 font-mono text-[11px] text-partial">{row.analog}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <PawPrint className="size-4 text-live" strokeWidth={1.75} />
              <h3 className="font-display text-xl">Passport</h3>
            </div>
            {shown ? (
              <div className="mt-3 space-y-2">
                <Badge variant={shownTone} data-qa="vet-decision">
                  {"decision" in shown ? shown.decision : "named"}
                </Badge>
                <p className="text-sm leading-relaxed" data-qa="vet-reason">
                  {shown.reason}
                </p>
                {proposal?.code ? (
                  <p className="font-mono text-[11px] text-muted">
                    {proposal.code.id} · {proposal.code.label}
                  </p>
                ) : null}
                <p className="font-mono text-[11px] text-gap">rupeeWrite false · freezeEmi false · yield null</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">Pick signs. Propose. Clerk still confirms heads.</p>
            )}
            {proposal?.code && proposal.decision !== "refuse" ? (
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  fireConfirm();
                }}
              >
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Declared heads</span>
                  <Input
                    className="mt-1.5"
                    inputMode="numeric"
                    value={heads}
                    onChange={(e) => setHeads(e.target.value)}
                    data-qa="vet-heads"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Remaining heads</span>
                  <Input
                    className="mt-1.5"
                    inputMode="numeric"
                    value={remainingHeads}
                    onChange={(e) => setRemainingHeads(e.target.value)}
                    data-qa="vet-remaining"
                  />
                </label>
                <Button data-qa="vet-confirm" type="submit" className="w-full">
                  Confirm as clerk
                </Button>
              </form>
            ) : null}
            {herd.length ? (
              <ul className="mt-4 space-y-1">
                {herd.map((h) => (
                  <li key={h.id} className="font-mono text-[11px] text-live">
                    {h.kind} · {h.head} head · {h.policyId ?? "cover gap"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-muted">No {species} on the Ronghang cell. Headcount is a clerk fact.</p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Spline className="size-4 text-partial" strokeWidth={1.75} />
              <h3 className="font-display text-xl">Lineage</h3>
            </div>
            <p className="mt-2 text-sm text-muted">
              GI token path mint → intake → settle. Herd heads on the cell. Person remaining sums to
              home sums to village. Repair names the break.
            </p>
            <ul className="mt-4 space-y-3" data-qa="vet-lineage">
              {summaries(wiring.reports).map((row) => (
                <li key={row.kind}>
                  <div className="flex items-center gap-2">
                    <Badge variant={row.conserved ? "live" : "gap"}>{row.conserved ? "conserved" : "broken"}</Badge>
                    <span className="text-sm">{row.kind}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{row.reason}</p>
                </li>
              ))}
            </ul>
            {wiring.repaired.length ? (
              <p className="mt-3 font-mono text-[11px] text-partial">{wiring.repaired[0]}</p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Ban className="size-4 text-gap" strokeWidth={1.75} />
              <h3 className="font-display text-xl">Code systems</h3>
            </div>
            <ul className="mt-3 space-y-3">
              {CODE_SYSTEMS.map((sys) => (
                <li key={sys.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant={tone(sys.status)}>{sys.status}</Badge>
                    <span className="text-sm font-medium">{sys.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{sys.present}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              <Link to="/brain" className="underline decoration-border underline-offset-4 hover:text-foreground">
                Ack the AI atlas
              </Link>
              <span> · </span>
              <Link to="/cells" className="underline decoration-border underline-offset-4 hover:text-foreground">
                Ronghang herd
              </Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function summaries(reports: ReturnType<typeof repairLineages>["reports"]) {
  const kinds = ["gi-lot", "herd-cell", "person-home-village"] as const;
  return kinds.map((kind) => {
    const rows = reports.filter((r) => r.kind === kind);
    const conserved = rows.every((r) => r.conserved);
    const sample = rows.find((r) => !r.conserved) ?? rows[0];
    return {
      kind,
      conserved,
      reason: sample?.reason ?? "No row.",
    };
  });
}

function Kpi({
  label,
  value,
  live,
  gap,
}: {
  label: string;
  value: string | number;
  live?: boolean;
  gap?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className={cn("font-mono text-lg tabular-nums capitalize", live && "text-live", gap && "text-gap")}>
        {value}
      </div>
    </div>
  );
}
