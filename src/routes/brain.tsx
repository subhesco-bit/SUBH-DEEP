import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { BrainBoard } from "@/components/app/brain-board";

export const Route = createFileRoute("/brain")({ component: BrainPage });

function BrainPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <BrainBoard />
      </main>
    </Shell>
  );
}
