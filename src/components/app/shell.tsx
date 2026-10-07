import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouterState, getRouteApi } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { formatRupee } from "@/lib/erp/money";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OrganismBoot } from "@/components/app/organism-boot";
import { ModulesBoot } from "@/components/app/modules-boot";
import { BooksBoot, useVillageBooks } from "@/components/erp/books-boot";
import { useBooks } from "@/lib/erp/store";
import { useOrganism } from "@/lib/organism/store";
import { CommandPalette, openCommandPalette } from "@/components/app/command-palette";
import { AtlasPanel, MobileDock, PrimaryNav } from "@/components/app/atlas-nav";
import { latticeStats } from "@/lib/lattice";
import { Button } from "@/components/ui/button";

const rootRoute = getRouteApi("__root__");

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const root = rootRoute.useLoaderData();
  const autoOp = useOrganism((s) => {
    if (s.snapshot?.autoOp) return s.snapshot.autoOp;
    if (s.booting) return "booting";
    if (root.organism?.ok) return root.organism.autoOp;
    return "missing";
  });
  const books = useVillageBooks();
  const error = useBooks((s) => s.error) ?? (root.books?.ok ? null : root.books?.error ?? null);
  const fpo = books?.fpo;
  const kpis = books?.kpis;
  const [atlasOpen, setAtlasOpen] = useState(false);
  const lattice = latticeStats();

  useEffect(() => {
    setAtlasOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAtlasOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <TooltipProvider delayDuration={180}>
      <OrganismBoot />
      <BooksBoot />
      <ModulesBoot />
      <CommandPalette />
      <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
        <a href="#main" className="skip-link">
          Skip to books
        </a>
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                AFRERA · Rural ERP · {fpo?.village ?? "Langthasa"}
              </p>
              <h1 className="font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {fpo?.name ?? "Hills Chakhao Collective"}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Village books for a rural organism. Lattice ~{lattice.integrity}%. GitHub 7%.
                Missing ligaments stay dashed.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Stat label="Cells" value={kpis?.cells ?? "—"} />
              <Stat label="Lots" value={kpis?.lots ?? "—"} />
              <Stat label="Open" value={kpis ? formatRupee(kpis.openPaise) : "—"} accent="gap" />
              <Stat
                label="Auto-op"
                value={autoOp}
                accent={
                  autoOp === "living" ? "live" : autoOp === "partial" || autoOp === "booting" ? "partial" : "gap"
                }
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={openCommandPalette}
              >
                Jump
              </Button>
            </div>
          </div>
          {error ? (
            <p className="mx-auto max-w-[1400px] px-4 pb-3 text-sm text-destructive sm:px-6">{error}</p>
          ) : null}
          <PrimaryNav pathname={pathname} atlasOpen={atlasOpen} onToggleAtlas={() => setAtlasOpen((v) => !v)} />
        </header>
        <AtlasPanel open={atlasOpen} pathname={pathname} onClose={() => setAtlasOpen(false)} />
        <div id="main" className="mx-auto max-w-[1400px] pb-24 md:pb-10">
          {children}
        </div>
        <footer className="mx-auto hidden max-w-[1400px] px-4 pb-10 pt-2 text-[11px] text-muted sm:px-6 md:block">
          Clerk writes remaining. AI cannot write rupees. Kernel bus living. GitHub disk 7%.
        </footer>
        <MobileDock pathname={pathname} onMore={() => setAtlasOpen((v) => !v)} />
      </div>
    </TooltipProvider>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "gap" | "live" | "partial";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div
        className={cn(
          "font-mono text-lg tabular-nums capitalize",
          accent === "gap"
            ? "text-gap"
            : accent === "live"
              ? "text-live"
              : accent === "partial"
                ? "text-partial"
                : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}
