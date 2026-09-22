import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { NervePanel } from "@/components/app/nerve-panel";

export const Route = createFileRoute("/nerve")({ component: NervePage });

function NervePage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <NervePanel />
      </main>
    </Shell>
  );
}
