import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { MeshPanel } from "@/components/app/mesh-panel";

export const Route = createFileRoute("/mesh")({ component: MeshPage });

function MeshPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <MeshPanel />
      </main>
    </Shell>
  );
}
