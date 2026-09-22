import { useState } from "react";
import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { formatKg, kgFromGrams } from "@/lib/erp/money";
import type { LotRow } from "@/lib/erp/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LotActions({ lot, compact }: { lot: LotRow; compact?: boolean }) {
  const busy = useBooks((s) => s.busy);
  const intake = useBooks((s) => s.intake);
  const sell = useBooks((s) => s.sell);
  const settle = useBooks((s) => s.settle);
  const books = useVillageBooks();
  const open = books?.orders.find((o) => o.lotId === lot.id && o.status === "open");
  const remainingKg = kgFromGrams(lot.remainingGrams);
  const [selling, setSelling] = useState(false);
  const [buyer, setBuyer] = useState("Diphu mill offtake");
  const [kg, setKg] = useState(String(remainingKg || ""));
  const [price, setPrice] = useState("185");
  const [freight, setFreight] = useState("4");
  const [ref, setRef] = useState("UPI-KA-");
  const [hours, setHours] = useState("24");

  if (lot.status === "settled") return null;

  const sellForm = (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        void sell({ lotId: lot.id, buyer, kg, pricePerKg: price, freightPerKg: freight }).then((ok) => {
          if (ok) setSelling(false);
        });
      }}
    >
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted">Buyer</span>
        <Input className="mt-1 h-9 w-40" value={buyer} onChange={(e) => setBuyer(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted">kg of {formatKg(lot.remainingGrams)}</span>
        <Input className="mt-1 h-9 w-24" value={kg} onChange={(e) => setKg(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted">₹ / kg declared</span>
        <Input className="mt-1 h-9 w-24" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      {compact ? null : (
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted">Freight ₹ / kg</span>
          <Input className="mt-1 h-9 w-20" value={freight} onChange={(e) => setFreight(e.target.value)} />
        </label>
      )}
      <Button size="sm" type="submit" disabled={busy}>
        Post offtake
      </Button>
    </form>
  );

  if (open) {
    return (
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void settle(open.id, ref, hours);
        }}
      >
        <Input
          className="h-9 w-36"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          aria-label="Payment reference"
          placeholder="paymentRef"
        />
        <Input
          className="h-9 w-16"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          aria-label="Hours to pay"
        />
        <Button size="sm" type="submit" disabled={busy || !ref.trim()}>
          Settle
        </Button>
      </form>
    );
  }

  if (lot.status === "pledged") {
    return <span className="text-[11px] text-partial">Lien holds sale</span>;
  }

  if (lot.status === "minted") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={busy} onClick={() => void intake(lot.id)}>
          Intake
        </Button>
        {compact && !selling ? (
          <Button size="sm" variant="ghost" onClick={() => setSelling(true)}>
            Farmgate
          </Button>
        ) : (
          sellForm
        )}
      </div>
    );
  }

  if (!selling && compact) {
    return (
      <Button size="sm" variant="outline" onClick={() => setSelling(true)}>
        Sell
      </Button>
    );
  }

  return sellForm;
}
