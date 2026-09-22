import { useState } from "react";
import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { formatKg } from "@/lib/erp/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WarehouseBoard() {
  const books = useVillageBooks();
  const receipts = books?.receipts ?? [];
  const lots = books?.lots ?? [];
  const busy = useBooks((s) => s.busy);
  const error = useBooks((s) => s.error);
  const pledge = useBooks((s) => s.pledge);
  const unpledge = useBooks((s) => s.unpledge);
  const intake = useBooks((s) => s.intake);
  const spoil = useBooks((s) => s.spoil);
  const [lender, setLender] = useState("Karbi Anglong PACS");
  const [spoilLot, setSpoilLot] = useState("");
  const [spoilKg, setSpoilKg] = useState("40");
  const [spoilCause, setSpoilCause] = useState("power cut");
  const waiting = lots.filter((l) => l.status === "minted" && l.remainingGrams > 0);
  const lotById = Object.fromEntries(lots.map((l) => [l.id, l]));

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Reserve organ</p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Warehouse receipts</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Inward, pledge, release. A pledged receipt cannot sell. Partial offtake leaves remaining stock on the
          same receipt. Langthasa godown binds the declared master policy — or the lot stays a cover gap.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {receipts.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No receipts. Intake a minted lot.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {receipts.map((r) => (
              <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {r.variety}{" "}
                    <span className="font-mono text-[11px] text-muted">
                      {formatKg(r.remainingGrams)}
                      {r.remainingGrams !== r.qtyGrams ? ` of ${formatKg(r.qtyGrams)}` : ""}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    {r.cellName} · {r.facility} · {r.id}
                    {r.lender ? ` · lien ${r.lender}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {lotById[r.lotId]?.coverStatus === "bound" ? (
                    <Badge variant="live">{lotById[r.lotId]?.policyId ?? "covered"}</Badge>
                  ) : (
                    <Badge variant="gap">cover gap</Badge>
                  )}
                  <Badge variant={r.status === "released" ? "live" : r.status === "pledged" ? "gap" : "partial"}>
                    {r.status}
                  </Badge>
                  {r.status === "inward" ? (
                    <form
                      className="flex flex-wrap gap-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void pledge(r.id, lender);
                      }}
                    >
                      <Input
                        className="h-9 w-44"
                        value={lender}
                        onChange={(e) => setLender(e.target.value)}
                        aria-label="Lender"
                      />
                      <Button size="sm" type="submit" variant="outline" disabled={busy}>
                        Pledge
                      </Button>
                    </form>
                  ) : null}
                  {r.status === "pledged" ? (
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void unpledge(r.id)}>
                      Release lien
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {waiting.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Waiting at the gate</h3>
          <p className="mt-1 text-sm text-muted">Minted lots with remaining mass, not yet inward.</p>
          <ul className="mt-4 divide-y divide-border">
            {waiting.map((lot) => (
              <li key={lot.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm">
                    {lot.variety} · {lot.cellName}
                  </p>
                  <p className="font-mono text-[11px] text-muted">{formatKg(lot.remainingGrams)}</p>
                </div>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void intake(lot.id)}>
                  Intake
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Declare spoilage</h3>
        <p className="mt-1 text-sm text-muted">
          Cuts remaining grams. Posts the village ledger. Does not invent a rupee or a kWh.
        </p>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            if (!spoilLot) return;
            void spoil(spoilLot, spoilKg, spoilCause);
          }}
        >
          <label className="block min-w-40 flex-1">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted">Lot</span>
            <select
              className="mt-1 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={spoilLot}
              onChange={(e) => setSpoilLot(e.target.value)}
              aria-label="Lot to spoil"
            >
              <option value="">Select remaining mass</option>
              {lots
                .filter((l) => l.remainingGrams > 0 && l.status !== "settled")
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.variety} · {l.cellName} · {formatKg(l.remainingGrams)}
                  </option>
                ))}
            </select>
          </label>
          <label className="block w-24">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted">kg lost</span>
            <Input className="mt-1 h-11" value={spoilKg} onChange={(e) => setSpoilKg(e.target.value)} />
          </label>
          <label className="block min-w-40 flex-1">
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted">Cause</span>
            <Input className="mt-1 h-11" value={spoilCause} onChange={(e) => setSpoilCause(e.target.value)} />
          </label>
          <Button type="submit" disabled={busy || !spoilLot}>
            Post fever
          </Button>
        </form>
      </section>
    </div>
  );
}
