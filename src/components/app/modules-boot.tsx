import { useEffect } from "react";
import { getRouteApi } from "@tanstack/react-router";
import { useModuleOs } from "@/lib/modules/store";

const rootRoute = getRouteApi("__root__");

export function ModulesBoot() {
  const loaded = rootRoute.useLoaderData();
  const hydrate = useModuleOs((s) => s.hydrate);
  const refresh = useModuleOs((s) => s.refresh);
  const modules = "modules" in loaded ? loaded.modules : null;

  useEffect(() => {
    if (modules && modules.ok) hydrate(modules);
    else void refresh();
  }, [modules, hydrate, refresh]);

  return null;
}
