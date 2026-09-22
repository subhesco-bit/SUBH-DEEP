import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { Filters } from "@/components/app/filters";
import { LigamentCatalog } from "@/components/app/ligament-catalog";
import { latticeStats } from "@/lib/lattice";
import { useLattice } from "@/lib/lattice/store";

export const Route = createFileRoute("/ligaments")({ component: LigamentsPage });

function LigamentsPage() {
  const stats = latticeStats();
  const proposed = useLattice((s) => s.proposed);
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <div className="mb-6 max-w-2xl">
          <h2 className="font-display text-2xl font-medium tracking-tight">Ligament ledger</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {stats.technical} technical contracts and {stats.thoughtful} thoughtful
            links drawn from consolidated/final. {stats.missing} are missing,{" "}
            {stats.partial} are only foreign keys or adjacent files. {stats.living}{" "}
            are living. Propose the ones that should be bound first.
            {proposed.length ? ` ${proposed.length} proposed on this device.` : ""}
          </p>
        </div>
        <Filters />
        <div className="mt-5">
          <LigamentCatalog />
        </div>
      </main>
    </Shell>
  );
}
