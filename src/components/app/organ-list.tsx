import { CONCEPTS, conceptRole, conceptStatusVariant } from "@/lib/lattice";
import { useLattice } from "@/lib/lattice/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const LAYERS: { id: string; label: string }[] = [
  { id: "intelligence", label: "Nervous system" },
  { id: "habitat", label: "Habitat" },
  { id: "commerce", label: "Commerce" },
  { id: "circulation", label: "Circulation" },
  { id: "metabolism", label: "Metabolism" },
  { id: "protection", label: "Protection" },
  { id: "digestion", label: "Digestion" },
  { id: "sense", label: "Sense" },
  { id: "structure", label: "Structure" },
  { id: "bridge", label: "Bridge concepts" },
  { id: "missing-organ", label: "Unattached organs" },
];

export function OrganList() {
  const selectedConceptId = useLattice((s) => s.selectedConceptId);
  const selectConcept = useLattice((s) => s.selectConcept);
  const query = useLattice((s) => s.query).trim().toLowerCase();
  const roleFilter = useLattice((s) => s.roleFilter);

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-surface p-4">
      {LAYERS.map((layer) => {
        const items = CONCEPTS.filter(
          (c) =>
            c.layer === layer.id &&
            (roleFilter === "all" || conceptRole(c) === roleFilter) &&
            (!query ||
              `${c.name} ${c.short} ${c.dora} ${c.thesis}`.toLowerCase().includes(query)),
        );
        if (items.length === 0) return null;
        return (
          <section key={layer.id}>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
              {layer.label}
            </h3>
            <ul className="space-y-1.5">
              {items.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => selectConcept(c.id)}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left",
                      selectedConceptId === c.id
                        ? "border-foreground bg-accent"
                        : "border-border",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium">{c.name}</span>
                      <span className="block text-xs text-muted">{c.dora}</span>
                    </span>
                    <Badge variant={conceptStatusVariant(c.status)}>
                      {conceptRole(c) === "bridge" ? "bridge" : c.status}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
