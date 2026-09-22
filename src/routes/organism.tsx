import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { OrganismMap } from "@/components/app/organism-map";
import { OrganList } from "@/components/app/organ-list";
import { ConceptPanel } from "@/components/app/concept-panel";
import { Filters } from "@/components/app/filters";

export const Route = createFileRoute("/organism")({ component: OrganismPage });

function OrganismPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <Filters />
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <div className="min-w-0">
            <div className="hidden md:block">
              <OrganismMap />
            </div>
            <div className="md:hidden">
              <OrganList />
            </div>
          </div>
          <ConceptPanel />
        </div>
      </main>
    </Shell>
  );
}
