import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/shell";
import { PlatformBoard } from "@/components/erp/platform-board";
import { getPlatform } from "@/lib/erp/fns";
import { usePlatform } from "@/lib/erp/platform-store";
import { useEffect } from "react";

export const Route = createFileRoute("/platform")({
  loader: () => getPlatform(),
  component: PlatformPage,
});

function PlatformPage() {
  const data = Route.useLoaderData();
  const hydrate = usePlatform((s) => s.hydrate);
  const refresh = usePlatform((s) => s.refresh);

  useEffect(() => {
    if (data && data.ok) hydrate(data);
    else void refresh();
  }, [data, hydrate, refresh]);

  return (
    <Shell>
      <main className="px-4 py-6 sm:px-6">
        <PlatformBoard />
      </main>
    </Shell>
  );
}
