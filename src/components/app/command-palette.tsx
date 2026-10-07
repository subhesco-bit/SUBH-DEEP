import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import { NAV_GROUPS, NAV_ITEMS, groupItems } from "@/lib/nav";
import { NEED_INTENTS } from "@/lib/os/intents";

const OPEN = "afrera:palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener(OPEN, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  function go(to: string) {
    setOpen(false);
    void navigate({ to: to as never });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 px-3 pt-[10vh] backdrop-blur-[2px]"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <Command
        label="Jump to a page or a need"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface"
        onClick={(e) => e.stopPropagation()}
        data-qa="command-palette"
      >
        <Command.Input
          placeholder="Jump — harvest, ligaments, OS…"
          className="h-12 w-full border-b border-border bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted"
          autoFocus
        />
        <Command.List className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-sm text-muted">Nothing matches. Named missing stay named.</Command.Empty>
          {NAV_GROUPS.map((group) => (
            <Command.Group key={group.id} heading={group.label} className="mb-2">
              {groupItems(group.id).map((item) => (
                <Command.Item
                  key={item.to}
                  value={`${item.label} ${item.hint} ${item.to}`}
                  onSelect={() => go(item.to)}
                  className="flex cursor-pointer flex-col rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-accent"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[11px] text-muted">{item.hint}</span>
                </Command.Item>
              ))}
            </Command.Group>
          ))}
          <Command.Group heading="Need" className="mb-1">
            {NEED_INTENTS.slice(0, 12).map((intent) => (
              <Command.Item
                key={intent.id}
                value={`${intent.label} ${intent.problem}`}
                onSelect={() => go(intent.href)}
                className="flex cursor-pointer flex-col rounded-lg px-3 py-2 text-sm data-[selected=true]:bg-accent"
              >
                <span className="font-medium">{intent.label}</span>
                <span className="text-[11px] text-muted">{intent.problem}</span>
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
        <p className="border-t border-border px-4 py-2 font-mono text-[10px] text-muted">
          {NAV_ITEMS.length} doors · GitHub 7% · clerk writes remaining
        </p>
      </Command>
    </div>
  );
}
