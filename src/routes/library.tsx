import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { LibraryPanel } from "@/components/app/library-panel";

export const Route = createFileRoute("/library")({ component: LibraryPage });

function LibraryPage() {
  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <LibraryPanel />
      </main>
    </Shell>
  );
}
