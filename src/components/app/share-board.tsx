import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Ban, Share2, Spline } from "lucide-react";
import {
  ASSETS,
  confirmSlot,
  gstInvoice,
  organicTrace,
  proposeSlot,
  shareWiring,
  subsidyFor,
  type AssetId,
  type GstVerdict,
  type OrganicClaim,
  type SlotConfirm,
  type SlotProposal,
  type SubsidyVerdict,
  type TraceReport,
} from "@/lib/share";
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

export function ShareBoard() {
  const books = useVillageBooks();
  const [assetId, setAssetId] = useState<AssetId>("cold-static");
  const [hours, setHours] = useState("4");
  const [remainingHours, setRemainingHours] = useState("24");
  const [proposal, setProposal] = useState<SlotProposal | null>(null);
  const [confirm, setConfirm] = useState<SlotConfirm | null>(null);
  const [claim, setClaim] = useState<OrganicClaim>("pgs");
  const [trace, setTrace] = useState<TraceReport | null>(null);
  const [gst, setGst] = useState<GstVerdict | null>(null);
  const [subsidy, setSubsidy] = useState<SubsidyVerdict | null>(null);

  const asset = ASSETS.find((a) => a.id === assetId) ?? ASSETS[0];
  const lot = books?.lots[0];
  const wiring = useMemo(
    () =>
      shareWiring({
        remainingHours: Number(remainingHours) || 0,
        capacityHours: asset.hours,
        organic: trace,
      }),
    [remainingHours, asset.hours, trace],
  );

  function firePropose(extra?: { rentPaise?: number | null; invoice?: boolean; heat?: boolean; assetId?: AssetId }) {
    const next = proposeSlot({
      assetId: extra?.assetId ?? assetId,
      hours: Number(hours) || 0,
      remainingHours: Number(remainingHours) || 0,
      rentPaise: extra?.rentPaise,
      invoice: extra?.invoice,
      heat: extra?.heat,
    });
    setProposal(next);
    setConfirm(null);
  }

  function fireConfirm() {
    if (!proposal?.assetId) return;
    const next = confirmSlot({
      assetId: proposal.assetId,
      hours: Number(hours) || 0,
      remainingHours: Number(remainingHours) || 0,
    });
    setConfirm(next);
    if (next.decision === "pass") setRemainingHours(String(next.remainingHours));
  }

  function fireTrace() {
    if (!lot) {
      setTrace(null);
      return;
    }
    setTrace(
      organicTrace({
        lot,
        giChain: books?.giChain ?? [],
        claim,
        packed: asset.kind === "pack",
      }),
    );
  }

  const shown = confirm ?? proposal;
  const shownTone = shown ? tone(confirm ? confirm.decision : (proposal?.decision ?? "named")) : "partial";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          Shared muscle · FPO hours · organic trace
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-3xl font-medium tracking-tight">Hours, not a rental shop.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Cold bay, mill, mobile and static process, pack, food/soil/animal labs, dryer, polyhouse, and the
              equipment pool are village muscle. Hours remaining conserve like grams. Organic tracing lives.
              GST invoice stays missing. Operation Green and NE logistics compute with amount blank.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="live">Hours living</Badge>
            <Badge variant="partial">HSN named</Badge>
            <Badge variant="gap">GST invoice missing</Badge>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Assets" value={ASSETS.length} />
          <Kpi label="Remaining h" value={remainingHours} live />
          <Kpi label="Organic" value={trace?.conserved ? "conserved" : "named"} live={Boolean(trace?.conserved)} />
          <Kpi label="Rent / GST" value="missing" gap />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">FPO muscle</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {ASSETS.map((row) => (
              <button
                key={row.id}
                type="button"
                data-qa={`share-asset-${row.id}`}
                onClick={() => {
                  setAssetId(row.id);
                  setRemainingHours(String(row.hours));
                  setHours(row.hours >= 4 ? "4" : "1");
                  setProposal(null);
                  setConfirm(null);
                }}
                className={cn(
                  "min-h-11 rounded-full border px-3 py-1.5 text-sm",
                  assetId === row.id ? "border-live/50 text-live" : "border-border text-muted hover:text-foreground",
                )}
              >
                {row.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">{asset.present}</p>
          <p className="mt-1 text-xs text-gap">Missing: {asset.missing}</p>
          <p className="mt-1 font-mono text-[11px] text-partial">
            {asset.mode} · {asset.kind} · {asset.hours} h capacity
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button data-qa="share-propose" type="button" onClick={() => firePropose()}>
              Propose slot
            </Button>
            <Button
              data-qa="share-rent"
              type="button"
              variant="outline"
              onClick={() => firePropose({ rentPaise: 400 })}
            >
              Try rental rupee
            </Button>
            <Button
              data-qa="share-gst"
              type="button"
              variant="outline"
              onClick={() => {
                setGst(gstInvoice({ commodity: lot?.commodity ?? "rice", post: true }));
                firePropose({ invoice: true });
              }}
            >
              Try GST invoice
            </Button>
            <Button
              data-qa="share-heat"
              type="button"
              variant="outline"
              onClick={() => {
                setAssetId("mill-static");
                setRemainingHours("12");
                firePropose({ assetId: "mill-static", heat: true });
              }}
            >
              Rest mill
            </Button>
          </div>

          <ul className="mt-6 divide-y divide-border">
            {ASSETS.filter((row) => row.kind === asset.kind || row.id === asset.id).slice(0, 4).map((row) => (
              <li key={row.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs text-muted">{row.id}</p>
                  <Badge variant={tone(row.status)}>{row.status}</Badge>
                  <p className="font-medium">{row.name}</p>
                </div>
                <p className="mt-1 text-sm text-muted">{row.present}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Share2 className="size-4 text-live" strokeWidth={1.75} />
              <h3 className="font-display text-xl">Passport</h3>
            </div>
            {shown ? (
              <div className="mt-3 space-y-2">
                <Badge variant={shownTone} data-qa="share-decision">
                  {"decision" in shown ? shown.decision : "named"}
                </Badge>
                <p className="text-sm leading-relaxed" data-qa="share-reason">
                  {shown.reason}
                </p>
                <p className="font-mono text-[11px] text-gap">rupeeWrite false · freezeEmi false · yield null</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">Pick muscle. Propose a slot. Clerk still confirms hours.</p>
            )}
            {proposal?.assetId && proposal.decision !== "refuse" ? (
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  fireConfirm();
                }}
              >
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Declared hours</span>
                  <Input
                    className="mt-1.5"
                    inputMode="numeric"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    data-qa="share-hours"
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Remaining hours</span>
                  <Input
                    className="mt-1.5"
                    inputMode="numeric"
                    value={remainingHours}
                    onChange={(e) => setRemainingHours(e.target.value)}
                    data-qa="share-remaining"
                  />
                </label>
                <Button data-qa="share-confirm" type="submit" className="w-full">
                  Confirm as clerk
                </Button>
              </form>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Spline className="size-4 text-partial" strokeWidth={1.75} />
              <h3 className="font-display text-xl">Organic + GST</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["pgs", "npop", "none"] as const).map((row) => (
                <button
                  key={row}
                  type="button"
                  data-qa={`share-claim-${row}`}
                  onClick={() => setClaim(row)}
                  className={cn(
                    "min-h-11 rounded-full border px-3 py-1.5 text-sm uppercase",
                    claim === row ? "border-live/50 text-live" : "border-border text-muted",
                  )}
                >
                  {row}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button data-qa="share-trace" type="button" variant="outline" onClick={fireTrace}>
                Trace organic
              </Button>
              <Button
                data-qa="share-hsn"
                type="button"
                variant="outline"
                onClick={() => setGst(gstInvoice({ commodity: lot?.commodity ?? "rice", post: false }))}
              >
                Name HSN
              </Button>
            </div>
            {trace ? (
              <p className="mt-3 text-sm leading-relaxed" data-qa="share-trace-reason">
                {trace.reason}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted">Declare PGS or NPOP. Do not invent a certificate rupee.</p>
            )}
            {gst ? (
              <p className="mt-2 font-mono text-[11px] text-gap" data-qa="share-gst-reason">
                {gst.reason}
              </p>
            ) : null}
            <p className="mt-3 font-mono text-[11px] text-partial">{wiring.reason}</p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2">
              <Ban className="size-4 text-gap" strokeWidth={1.75} />
              <h3 className="font-display text-xl">Subsidy analog</h3>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                data-qa="share-opgreen"
                type="button"
                variant="outline"
                onClick={() =>
                  setSubsidy(
                    subsidyFor({
                      code: "OP-GREEN",
                      horticulture: true,
                      fpo: true,
                      perishable: true,
                      northEast: true,
                      freightDeclared: false,
                    }),
                  )
                }
              >
                Name Operation Green
              </Button>
              <Button
                data-qa="share-nelog"
                type="button"
                variant="outline"
                onClick={() =>
                  setSubsidy(
                    subsidyFor({
                      code: "NE-LOGISTICS",
                      horticulture: false,
                      fpo: true,
                      perishable: false,
                      northEast: true,
                      freightDeclared: true,
                    }),
                  )
                }
              >
                Name NE logistics
              </Button>
            </div>
            {subsidy ? (
              <p className="mt-3 text-sm leading-relaxed" data-qa="share-subsidy-reason">
                {subsidy.reason}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted">Eligibility may compute. Amount stays blank. Disbursement missing.</p>
            )}
            <p className="mt-4 text-xs text-muted">
              <Link to="/vet" className="underline decoration-border underline-offset-4 hover:text-foreground">
                August AI
              </Link>
              <span> · </span>
              <Link to="/warehouse" className="underline decoration-border underline-offset-4 hover:text-foreground">
                Godown
              </Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
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
