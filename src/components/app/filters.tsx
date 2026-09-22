import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLattice } from "@/lib/lattice/store";
import { LIGAMENT_STATUS_ORDER, latticeStats } from "@/lib/lattice";
import type { BridgeKind, ConceptRole } from "@/lib/lattice";
import { cn } from "@/lib/utils";

const KINDS: Array<"all" | BridgeKind> = ["all", "technical", "thoughtful"];
const ROLES: Array<"all" | ConceptRole> = ["all", "organ", "bridge"];

export function Filters() {
  const statusFilter = useLattice((s) => s.statusFilter);
  const kindFilter = useLattice((s) => s.kindFilter);
  const roleFilter = useLattice((s) => s.roleFilter);
  const query = useLattice((s) => s.query);
  const showMesh = useLattice((s) => s.showMesh);
  const setStatusFilter = useLattice((s) => s.setStatusFilter);
  const setKindFilter = useLattice((s) => s.setKindFilter);
  const setRoleFilter = useLattice((s) => s.setRoleFilter);
  const setQuery = useLattice((s) => s.setQuery);
  const setShowMesh = useLattice((s) => s.setShowMesh);
  const stats = latticeStats();
  const counts: Record<string, number | undefined> = {
    living: stats.living,
    missing: stats.missing,
    partial: stats.partial,
    all: stats.bridges,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organs and ligaments"
          aria-label="Search organs and ligaments"
          className="lg:max-w-xs"
        />
        <ChipRow
          label="Status"
          value={statusFilter}
          options={LIGAMENT_STATUS_ORDER}
          onChange={setStatusFilter}
          counts={counts}
        />
        <ChipRow label="Kind" value={kindFilter} options={KINDS} onChange={setKindFilter} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <ChipRow label="Nodes" value={roleFilter} options={ROLES} onChange={setRoleFilter} />
        <Button
          type="button"
          size="sm"
          variant={showMesh ? "default" : "outline"}
          className="rounded-full"
          onClick={() => setShowMesh(!showMesh)}
        >
          {showMesh ? "Missing mesh on" : "Missing mesh off"}
        </Button>
      </div>
    </div>
  );
}

function ChipRow<T extends string>({
  label,
  value,
  options,
  onChange,
  counts,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
  counts?: Record<string, number | undefined>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[11px] uppercase tracking-[0.14em] text-muted">{label}</span>
      {options.map((opt) => (
        <Button
          key={opt}
          type="button"
          size="sm"
          variant={value === opt ? "default" : "outline"}
          className={cn("rounded-full capitalize")}
          onClick={() => onChange(opt)}
        >
          {opt}
          {counts?.[opt] != null ? (
            <span className="ml-1 font-mono text-[10px] tabular-nums opacity-70">{counts[opt]}</span>
          ) : null}
        </Button>
      ))}
    </div>
  );
}