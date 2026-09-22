import type { ReactNode } from "react";
import { Link, useRouterState, getRouteApi } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Activity,
  BookOpen,
  Boxes,
  Coins,
  Cpu,
  Ear,
  GitBranch,
  Landmark,
  Scale,
  LayoutGrid,
  Network,
  Radio,
  Spline,
  Users,
  Warehouse,
  Wheat,
  Workflow,
  Orbit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupee } from "@/lib/erp/money";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OrganismBoot } from "@/components/app/organism-boot";
import { ModulesBoot } from "@/components/app/modules-boot";
import { BooksBoot, useVillageBooks } from "@/components/erp/books-boot";
import { useBooks } from "@/lib/erp/store";
import { useOrganism } from "@/lib/organism/store";

const rootRoute = getRouteApi("__root__");

const NAV = [
  { to: "/", label: "Books", icon: Landmark },
  { to: "/cells", label: "Cells", icon: Users },
  { to: "/lots", label: "Lots", icon: Wheat },
  { to: "/warehouse", label: "Warehouse", icon: Warehouse },
  { to: "/ledger", label: "Ledger", icon: Boxes },
  { to: "/trade", label: "Trade", icon: ArrowLeftRight },
  { to: "/platform", label: "Platform", icon: LayoutGrid },
  { to: "/organism", label: "Organism", icon: Spline },
  { to: "/mesh", label: "Mesh", icon: Network },
  { to: "/ligaments", label: "Ligaments", icon: GitBranch },
  { to: "/pulse", label: "Pulse", icon: Activity },
  { to: "/library", label: "Library", icon: BookOpen },
  { to: "/nerve", label: "Nerve", icon: Radio },
  { to: "/economy", label: "Economy", icon: Coins },
  { to: "/companion", label: "Companion", icon: Ear },
  { to: "/modules", label: "Modules", icon: Workflow },
  { to: "/charter", label: "Charter", icon: Scale },
  { to: "/os", label: "OS", icon: Orbit },
  { to: "/systems", label: "Systems", icon: Cpu },
] as const;

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

  return (
    <TooltipProvider delayDuration={180}>
      <OrganismBoot />
      <BooksBoot />
      <ModulesBoot />
      <div className="min-h-dvh overflow-x-hidden bg-background text-foreground">
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
                Village books: cells, living lots, warehouse receipts, declared
                farmgate. The organism map still shows every missing ligament.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Stat label="Cells" value={kpis?.cells ?? "—"} />
              <Stat label="Lots" value={kpis?.lots ?? "—"} />
              <Stat
                label="Open"
                value={kpis ? formatRupee(kpis.openPaise) : "—"}
                accent="gap"
              />
              <Stat
                label="Auto-op"
                value={autoOp}
                accent={
                  autoOp === "living"
                    ? "live"
                    : autoOp === "partial" || autoOp === "booting"
                      ? "partial"
                      : "gap"
                }
              />
            </div>
          </div>
          {error ? (
            <p className="mx-auto max-w-[1400px] px-4 pb-3 text-sm text-destructive sm:px-6">{error}</p>
          ) : null}
          <nav className="mx-auto flex max-w-[1400px] gap-1 overflow-x-auto px-2 sm:px-4">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 shrink-0 items-center gap-2 rounded-t-md px-3 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-surface text-foreground"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <div className="mx-auto max-w-[1400px]">{children}</div>
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
