import { useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useOrganism } from "@/lib/organism/store";

const rootRoute = getRouteApi("__root__");

/** Hydrates from the server auto-boot. Falls back to a client pulse if needed. */
export function OrganismBoot() {
  const loaded = rootRoute.useLoaderData();
  const hydrate = useOrganism((s) => s.hydrate);
  const boot = useOrganism((s) => s.boot);
  const organism = loaded.organism;

  useEffect(() => {
    if (organism) hydrate(organism);
    if (organism?.ok && organism.autoOp === "living") return;
    void boot();
  }, [organism, hydrate, boot]);

  return null;
}
