import { Link } from "@tanstack/react-router";
import {
  Landmark,
  Wheat,
  ArrowLeftRight,
  Spline,
  Ear,
  Orbit,
  LayoutGrid,
} from "lucide-react";
import { ATLAS_NAV, NAV_GROUPS, PRIMARY_NAV, groupItems, isNavActive, type NavGroupId } from "@/lib/nav";
import { openCommandPalette } from "@/components/app/command-palette";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRIMARY_ICON = {
  "/": Landmark,
  "/lots": Wheat,
  "/trade": ArrowLeftRight,
  "/organism": Spline,
  "/companion": Ear,
  "/os": Orbit,
} as const;

export function PrimaryNav({
  pathname,
  atlasOpen,
  onToggleAtlas,
}: {
  pathname: string;
  atlasOpen: boolean;
  onToggleAtlas: () => void;
}) {
  const atlasActive = ATLAS_NAV.some((item) => isNavActive(item.to, pathname));

  return (
    <nav className="mx-auto hidden max-w-[1400px] items-end gap-1 overflow-x-auto px-2 sm:px-4 md:flex" aria-label="Primary">
      {PRIMARY_NAV.map((item) => {
        const active = isNavActive(item.to, pathname);
        const Icon = PRIMARY_ICON[item.to as keyof typeof PRIMARY_ICON] ?? LayoutGrid;
        return (
          <Link
            key={item.to}
            to={item.to as never}
            className={cn(
              "flex h-11 shrink-0 items-center gap-2 rounded-t-md px-3 text-sm font-medium transition-colors duration-150",
              active ? "bg-surface text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onToggleAtlas}
        aria-expanded={atlasOpen}
        aria-controls="atlas-panel"
        className={cn(
          "flex h-11 shrink-0 items-center gap-2 rounded-t-md px-3 text-sm font-medium transition-colors duration-150",
          atlasOpen || atlasActive ? "bg-surface text-foreground" : "text-muted hover:text-foreground",
        )}
        data-qa="atlas-toggle"
      >
        <LayoutGrid className="size-4" strokeWidth={1.75} />
        Atlas
      </button>
      <button
        type="button"
        onClick={openCommandPalette}
        className="ml-auto flex h-11 shrink-0 items-center gap-2 rounded-t-md px-3 text-sm text-muted hover:text-foreground"
        data-qa="jump"
      >
        Jump
        <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>
    </nav>
  );
}

export function AtlasPanel({
  open,
  pathname,
  onClose,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      id="atlas-panel"
      className="border-b border-border bg-surface"
      data-qa="atlas-panel"
    >
      <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-5 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {NAV_GROUPS.map((group) => (
          <section key={group.id}>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{group.label}</p>
            <p className="mt-1 text-[12px] text-muted">{group.lede}</p>
            <ul className="mt-3 space-y-1">
              {groupItems(group.id as NavGroupId).map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to as never}
                    onClick={onClose}
                    className={cn(
                      "block min-h-11 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                      isNavActive(item.to, pathname) ? "bg-accent text-foreground" : "text-foreground",
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] text-muted">{item.hint}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export function MobileDock({
  pathname,
  onMore,
}: {
  pathname: string;
  onMore: () => void;
}) {
  const dock = PRIMARY_NAV.filter((item) => item.to !== "/organism" && item.to !== "/os");
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Village dock"
      data-qa="mobile-dock"
    >
      <ul className="grid grid-cols-5">
        {dock.map((item) => {
          const Icon = PRIMARY_ICON[item.to as keyof typeof PRIMARY_ICON] ?? LayoutGrid;
          const active = isNavActive(item.to, pathname);
          return (
            <li key={item.to}>
              <Link
                to={item.to as never}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  active ? "text-foreground" : "text-muted",
                )}
              >
                <Icon className="size-4" strokeWidth={1.75} />
                {item.label}
              </Link>
            </li>
          );
        })}
        <li>
          <Button
            type="button"
            variant="ghost"
            onClick={onMore}
            className="flex h-14 w-full flex-col items-center justify-center gap-0.5 rounded-none text-[10px] font-medium text-muted"
          >
            <LayoutGrid className="size-4" strokeWidth={1.75} />
            Atlas
          </Button>
        </li>
      </ul>
    </nav>
  );
}
