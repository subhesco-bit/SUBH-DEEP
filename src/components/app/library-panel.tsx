import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  libraryCatalog,
  queryLibraryKnowledge,
  bindingCount,
  type LibraryKind,
  answerCanonicalQueries,
  CANONICAL_QUERY_COUNT,
} from "@/lib/library";
import { CONCEPT_BY_ID } from "@/lib/lattice";
import { useLattice } from "@/lib/lattice/store";
import { useOrganism } from "@/lib/organism/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const KINDS: Array<"all" | LibraryKind> = [
  "all",
  "doctrine",
  "organ",
  "bridge",
  "principle",
  "contract",
  "repair",
];

export function LibraryPanel() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | LibraryKind>("all");
  const [selectedId, setSelectedId] = useState<string | null>("lib-memory");
  const selectConcept = useLattice((s) => s.selectConcept);
  const snapshot = useOrganism((s) => s.snapshot);
  const ready = useOrganism((s) => s.ready);
  const booting = useOrganism((s) => s.booting);
  const catalog = libraryCatalog();
  const reflexes = useMemo(() => answerCanonicalQueries(), []);
  const catalogHits = reflexes.filter((r) => !r.missing).length;
  const persisted = snapshot?.reflexesAnswered ?? 0;

  const hits = useMemo(
    () => queryLibraryKnowledge(query, { kind, limit: 80 }),
    [query, kind],
  );
  const selected = hits.find((c) => c.id === selectedId) ?? libraryCatalog().find((c) => c.id === selectedId);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)]">
      <section className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          AI-integrated library
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Memory</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The library is the hippocampus — doctrine, organ theses, contracts, and
          named repairs. It is not a chatbot. On boot it indexes itself, binds
          cards to organs, fires every reflex query, and hands the nerve something
          to fire. GitHub systems stay unplugged; this catalog is the living plug.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={ready ? "live" : booting ? "partial" : "gap"}>
            {ready ? "auto-op living" : booting ? "indexing" : "awaiting boot"}
          </Badge>
          <Badge>{catalog.length} cards</Badge>
          <Badge>{snapshot?.bindings || bindingCount()} bindings</Badge>
          <Badge variant={catalogHits === CANONICAL_QUERY_COUNT ? "live" : "gap"} className="whitespace-nowrap">
            {catalogHits}/{CANONICAL_QUERY_COUNT}
          </Badge>
          <Badge variant={persisted >= CANONICAL_QUERY_COUNT ? "live" : "partial"} className="whitespace-nowrap">
            {persisted}/{CANONICAL_QUERY_COUNT} pulsed
          </Badge>
        </div>
        <p className="mt-3 text-sm text-muted">
          <Link to="/nerve" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Nerve consults this memory
          </Link>
          <span className="text-muted"> · </span>
          <Link to="/systems" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Systems rack remains unplugged
          </Link>
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memory — harvest, lot, Magh, rupee, agentic"
            aria-label="Search library memory"
          />
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <Button
                key={k}
                type="button"
                size="sm"
                variant={kind === k ? "default" : "outline"}
                className="rounded-full capitalize"
                onClick={() => setKind(k)}
              >
                {k}
              </Button>
            ))}
          </div>
        </div>
        <ol className="mt-4 grid gap-1 sm:grid-cols-2">
          {reflexes.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  setQuery(r.query);
                  setSelectedId(r.hits[0]?.id ?? selectedId);
                }}
                className="flex w-full items-baseline gap-2 truncate text-left text-[11px] text-muted hover:text-foreground"
              >
                <span className={cn("font-mono", r.missing ? "text-gap" : "text-live")}>{r.id}</span>
                <span className="truncate">{r.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <ul className="mt-5 divide-y divide-border">
          {hits.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => setSelectedId(card.id)}
                className={cn(
                  "flex w-full flex-col gap-1 px-1 py-3 text-left transition-colors duration-150",
                  selectedId === card.id ? "text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{card.title}</span>
                  <Badge>{card.kind}</Badge>
                </span>
                <span className="line-clamp-2 text-sm">{card.body}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <aside className="flex min-h-[360px] flex-col rounded-2xl border border-border bg-surface">
        {selected ? (
          <>
            <div className="p-5 pb-4">
              <Badge>{selected.kind}</Badge>
              <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">
                {selected.title}
              </h3>
              {selected.signal ? (
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-partial">
                  {selected.signal}
                </p>
              ) : null}
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-5 pt-0">
                <p className="text-sm leading-relaxed text-foreground/90">{selected.body}</p>
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                  Source · {selected.source}
                </p>
                <div>
                  <h4 className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
                    Bound organs
                  </h4>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {selected.organs.map((id) => {
                      const organ = CONCEPT_BY_ID[id];
                      return (
                        <li key={id}>
                          <Link
                            to="/organism"
                            onClick={() => selectConcept(id)}
                            className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs hover:bg-accent"
                          >
                            {organ?.short ?? id}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/nerve">Ask the nerve to consult this</Link>
                </Button>
                {selected.organs.includes("module") || selected.organs.includes("ai") ? (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/systems">Open the systems rack</Link>
                  </Button>
                ) : null}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted">
            Select a card. Memory only fires if it is bound.
          </div>
        )}
      </aside>
    </div>
  );
}
