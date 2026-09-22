import { useState } from "react";
import { useBooks } from "@/lib/erp/store";
import { useVillageBooks } from "@/components/erp/books-boot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HarvestForm() {
  const cells = useVillageBooks()?.cells ?? [];
  const busy = useBooks((s) => s.busy);
  const harvest = useBooks((s) => s.harvest);
  const [cellId, setCellId] = useState(cells[0]?.id ?? "c-ronghang");
  const [variety, setVariety] = useState("Chakhao Poireiton");
  const [commodity, setCommodity] = useState("black rice");
  const [kg, setKg] = useState("840");
  const [moisture, setMoisture] = useState("13.1");
  const [gi, setGi] = useState(true);
  const selected = cells.some((c) => c.id === cellId) ? cellId : (cells[0]?.id ?? "");

  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void harvest({ cellId: selected, variety, commodity, kg, moisture, gi });
      }}
    >
      <label className="block sm:col-span-2">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Farmer cell</span>
        <select
          className="mt-1.5 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={selected}
          onChange={(e) => setCellId(e.target.value)}
          aria-label="Farmer cell"
        >
          {cells.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Variety</span>
        <Input className="mt-1.5" value={variety} onChange={(e) => setVariety(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Commodity</span>
        <Input className="mt-1.5" value={commodity} onChange={(e) => setCommodity(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Declared kg</span>
        <Input className="mt-1.5" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Moisture %</span>
        <Input className="mt-1.5" inputMode="decimal" value={moisture} onChange={(e) => setMoisture(e.target.value)} />
      </label>
      <label className="flex h-11 items-center gap-2 self-end text-sm">
        <input type="checkbox" checked={gi} onChange={(e) => setGi(e.target.checked)} className="size-4 accent-live" />
        GI marker on mint
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy || !selected} className="w-full sm:w-auto">
          {busy ? "Minting lot" : "Mint living lot"}
        </Button>
      </div>
    </form>
  );
}
