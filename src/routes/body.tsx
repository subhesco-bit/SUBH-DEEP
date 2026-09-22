import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { BodyBoard } from "@/components/app/body-board";

export const Route = createFileRoute("/body")({
  component: BodyPage,
});

function BodyPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <BodyBoard />
      </main>
    </Shell>
  );
}
