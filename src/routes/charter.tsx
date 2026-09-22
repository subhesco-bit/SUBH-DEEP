import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { CharterBoard } from "@/components/app/charter-board";

export const Route = createFileRoute("/charter")({
  component: CharterPage,
});

function CharterPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <CharterBoard />
      </main>
    </Shell>
  );
}
