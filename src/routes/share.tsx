import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { ShareBoard } from "@/components/app/share-board";

export const Route = createFileRoute("/share")({
  component: SharePage,
});

function SharePage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <ShareBoard />
      </main>
    </Shell>
  );
}
