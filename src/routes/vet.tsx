import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { VetBoard } from "@/components/app/vet-board";

export const Route = createFileRoute("/vet")({
  component: VetPage,
});

function VetPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <VetBoard />
      </main>
    </Shell>
  );
}
