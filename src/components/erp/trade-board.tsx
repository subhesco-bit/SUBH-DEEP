import { useState } from "react";
import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { formatKg, formatRupee, paiseFromKgPrice } from "@/lib/erp/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TradeBoard() {
  const books = useVillageBooks();
  const orders = books?.orders ?? [];
  const payouts = books?.payouts ?? [];
  const poolable = books?.poolable ?? [];
  const busy = useBooks((s) => s.busy);
  const error = useBooks((s) => s.error);
  const settle = useBooks((s) => s.settle);
  const settlePool = useBooks((s) => s.settlePool);
  const pool = useBooks((s) => s.pool);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [hours, setHours] = useState<Record<string, string>>({});
  const [commodity, setCommodity] = useState(poolable[0]?.commodity ?? "black rice");
  const [buyer, setBuyer] = useState("Guwahati GI desk");
  const [kg, setKg] = useState("");
  const [price, setPrice] = useState("185");
  const [freight, setFreight] = useState("4");

  const openPools = new Map<string, { qty: number; paise: number; buyer: string }>();
  for (const o of orders) {
    if (o.status !== "open" || !o.poolId) continue;
    const prev = openPools.get(o.poolId);
    const paise = paiseFromKgPrice(o.qtyGrams, o.pricePaisePerKg);
    if (prev) {
      prev.qty += o.qtyGrams;
      prev.paise += paise;
    } else {
      openPools.set(o.poolId, { qty: o.qtyGrams, paise, buyer: o.buyer });
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">Vein</p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Offtake and settlement</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Price is declared. paymentRef is required to mark paid. Hours-to-pay land on the cell with the rupee.
          A pooled offtake splits farmgate qty-weighted after freight.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No offtake yet. Sell a lot or post a collective pool.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {orders.map((o) => (
              <li key={o.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {o.variety} → {o.buyer}
                    </p>
                    <p className="text-sm text-muted">
                      {o.cellName} · {formatKg(o.qtyGrams)} @ {formatRupee(o.pricePaisePerKg)}/kg
                      {o.poolId ? " · pool" : ""}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-partial">
                      {formatRupee(paiseFromKgPrice(o.qtyGrams, o.pricePaisePerKg))}
                      {o.hoursToPay != null ? ` · ${o.hoursToPay}h to pay` : ""}
                      {o.paymentRef ? ` · ${o.paymentRef}` : ""}
                    </p>
                  </div>
                  <Badge variant={o.status === "settled" ? "live" : "gap"}>{o.status}</Badge>
                </div>
                {o.status === "open" && !o.poolId ? (
                  <form
                    className="mt-3 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void settle(o.id, refs[o.id] || "", hours[o.id] || "24");
                    }}
                  >
                    <Input
                      className="h-11 max-w-56"
                      value={refs[o.id] ?? ""}
                      onChange={(e) => setRefs((s) => ({ ...s, [o.id]: e.target.value }))}
                      placeholder="paymentRef"
                      aria-label="Payment reference"
                    />
                    <Input
                      className="h-11 w-20"
                      value={hours[o.id] ?? "24"}
                      onChange={(e) => setHours((s) => ({ ...s, [o.id]: e.target.value }))}
                      aria-label="Hours to pay"
                    />
                    <Button type="submit" disabled={busy}>
                      Mark paid
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {openPools.size > 0 ? (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Open pools</h3>
          <p className="mt-1 text-sm text-muted">One paymentRef settles every line. Split stays qty-weighted.</p>
          <ul className="mt-4 divide-y divide-border">
            {[...openPools.entries()].map(([poolId, row]) => (
              <li key={poolId} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm">{row.buyer}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {poolId} · {formatKg(row.qty)} · {formatRupee(row.paise)}
                    </p>
                  </div>
                </div>
                <form
                  className="mt-3 flex flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void settlePool(poolId, refs[poolId] || "", hours[poolId] || "24");
                  }}
                >
                  <Input
                    className="h-11 max-w-56"
                    value={refs[poolId] ?? ""}
                    onChange={(e) => setRefs((s) => ({ ...s, [poolId]: e.target.value }))}
                    placeholder="paymentRef"
                    aria-label="Pool payment reference"
                  />
                  <Input
                    className="h-11 w-20"
                    value={hours[poolId] ?? "24"}
                    onChange={(e) => setHours((s) => ({ ...s, [poolId]: e.target.value }))}
                    aria-label="Hours to pay"
                  />
                  <Button type="submit" disabled={busy}>
                    Settle pool
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">Collective offtake</h3>
        <p className="mt-1 text-sm text-muted">
          Draw remaining godown stock FIFO. Farmgate after freight splits by kilograms.
        </p>
        {poolable.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No remaining warehouse mass to pool.</p>
        ) : (
          <form
            className="mt-4 grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              void pool({ commodity, buyer, kg, pricePerKg: price, freightPerKg: freight });
            }}
          >
            <label className="block sm:col-span-2">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Commodity in godown</span>
              <select
                className="mt-1.5 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                aria-label="Commodity"
              >
                {poolable.map((p) => (
                  <option key={p.commodity} value={p.commodity}>
                    {p.commodity} · {formatKg(p.remainingGrams)} · {p.cellCount} cells
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Buyer</span>
              <Input className="mt-1.5" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Declared kg</span>
              <Input className="mt-1.5" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">₹ / kg</span>
              <Input className="mt-1.5" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Freight ₹ / kg</span>
              <Input
                className="mt-1.5"
                inputMode="decimal"
                value={freight}
                onChange={(e) => setFreight(e.target.value)}
              />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy}>
                Post pool
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-xl">FPO payouts</h3>
        <p className="mt-1 text-sm text-muted">Qty-weighted split of declared farmgate after freight.</p>
        {payouts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No farmgate posted yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {payouts.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="text-sm">{p.cellName}</p>
                  <p className="font-mono text-[11px] text-muted">
                    {p.orderId} · {formatKg(p.qtyGrams)}
                    {p.paymentRef ? ` · ${p.paymentRef}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm tabular-nums">{formatRupee(p.amountPaise)}</span>
                  <Badge variant={p.status === "paid" ? "live" : "gap"}>{p.status}</Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
