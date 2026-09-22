import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { OsBoard } from "@/components/app/os-board";

export const Route = createFileRoute("/os")({
  component: OsPage,
});

function OsPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <OsBoard />
      </main>
    </Shell>
  );
}
