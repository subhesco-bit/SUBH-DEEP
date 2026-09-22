import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { CONCEPTS, CONCEPT_BY_ID } from "@/lib/lattice";
import { CANONICAL_QUERIES, CANONICAL_QUERY_COUNT } from "@/lib/library";
import { useOrganism } from "@/lib/organism/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NervePanel() {
  const snapshot = useOrganism((s) => s.snapshot);
  const ready = useOrganism((s) => s.ready);
  const booting = useOrganism((s) => s.booting);
  const consulting = useOrganism((s) => s.consulting);
  const error = useOrganism((s) => s.error);
  const lastConsult = useOrganism((s) => s.lastConsult);
  const consult = useOrganism((s) => s.consult);
  const boot = useOrganism((s) => s.boot);
  const [query, setQuery] = useState(
    "Why did the Chakhao harvest die at the portal instead of minting a lot?",
  );
  const [organId, setOrganId] = useState<string>("lot");

  const diagnosis = snapshot?.diagnosis;
  const autoOp = snapshot?.autoOp ?? (booting ? "partial" : "missing");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          AI nervous system
        </p>
        <h2 className="mt-2 font-display text-3xl font-medium tracking-tight">Nerve</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Auto-operation indexes the catalog, binds every organ, and fires{" "}
          {CANONICAL_QUERY_COUNT} reflex queries on boot — without a prompt and
          without an API key. Grok may enrich a later consult. Agentic and the
          other GitHub AI systems remain unplugged modules of this nerve. The token economy packs library hits instead of a GitHub dump.
        </p>
        <p className="mt-3 text-sm">
          <Link to="/library" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Library auto-op
          </Link>
          <span className="text-muted"> fires the reflexes. </span>
          <Link to="/systems" className="underline decoration-border underline-offset-4 hover:text-foreground">
            Systems rack
          </Link>
          <span className="text-muted"> — agentic, copilot, fabric remain WIRED skeletons.</span>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={autoOp === "living" ? "live" : autoOp === "partial" ? "partial" : "gap"}>
            auto-op {autoOp}
          </Badge>
          <Badge>{snapshot?.libraryCards ?? 0} cards in db</Badge>
          <Badge>{snapshot?.bindings ?? 0} bindings</Badge>
          <Badge variant={(snapshot?.reflexesAnswered ?? 0) >= CANONICAL_QUERY_COUNT ? "live" : "gap"}>
            {snapshot?.reflexesAnswered ?? 0}/{CANONICAL_QUERY_COUNT} reflexes
          </Badge>
          {booting ? <Badge variant="partial">booting</Badge> : null}
        </div>
        {diagnosis ? (
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">{diagnosis.verdict}</p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            {booting ? "Migrating, seeding, binding…" : "Organism has not booted."}
          </p>
        )}
        {!ready ? (
          <Button className="mt-4" onClick={() => void boot()} disabled={booting}>
            {booting ? "Booting" : "Boot the organism"}
          </Button>
        ) : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        <form
          className="mt-8 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void consult(query, organId);
          }}
        >
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Organ in context</span>
            <select
              className="mt-1.5 flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={organId}
              onChange={(e) => setOrganId(e.target.value)}
              aria-label="Organ in context"
            >
              {CONCEPTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11px] uppercase tracking-[0.14em] text-muted">Pulse</span>
            <textarea
              className="mt-1.5 min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={500}
              aria-label="Ask the library"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={consulting || !query.trim()}>
              {consulting ? "Consulting memory" : "Consult the library"}
            </Button>
            <Button asChild variant="outline">
              <Link to="/economy">Token economy</Link>
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
            {CANONICAL_QUERY_COUNT} auto queries
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {CANONICAL_QUERIES.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  className="rounded-full border border-border px-2.5 py-1 text-left text-xs hover:bg-accent"
                  onClick={() => {
                    setQuery(q.query);
                    setOrganId(q.organId);
                    void consult(q.query, q.organId);
                  }}
                >
                  {q.id} {q.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {lastConsult ? (
          <article className="mt-6 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <Badge variant={lastConsult.source === "grok" ? "partial" : "live"}>
                {lastConsult.source === "grok" ? "nerve + grok" : "library reflex"}
              </Badge>
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {lastConsult.reading}
            </pre>
          </article>
        ) : snapshot?.pulses[0] ? (
          <article className="mt-6 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <Badge variant="live">last auto pulse</Badge>
              <span className="font-mono text-[11px] text-muted">{snapshot.pulses[0].kind}</span>
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {snapshot.pulses[0].reading}
            </pre>
          </article>
        ) : null}

        <p className="mt-4 text-xs text-muted">
          First answer is always the catalog. Grok enriches only when asked,
          and only with that memory in context.
        </p>
      </section>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Named repairs</h3>
          <ol className="mt-3 space-y-2">
            {(diagnosis?.priority ?? []).slice(0, 8).map((p, i) => (
              <li key={p.id} className="border-l border-border pl-3">
                <p className="text-sm font-medium">
                  <span className="mr-2 font-mono text-[11px] text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {p.title}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-partial">{p.signal}</p>
                <p className="mt-1 text-xs text-muted">{CONCEPT_BY_ID[p.organId]?.short}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-display text-xl">Spine</h3>
          <ol className="mt-3 space-y-2">
            {(snapshot?.events ?? []).length === 0 ? (
              <li className="text-sm text-muted">No blood yet. Boot writes the first pulses.</li>
            ) : (
              snapshot?.events.map((ev) => (
                <li key={ev.id} className="flex flex-col gap-0.5">
                  <span className={cn("font-mono text-[11px] text-live")}>{ev.signal}</span>
                  <span className="text-xs text-muted">
                    {ev.organId ?? "organism"} · {formatTime(ev.createdAt)}
                  </span>
                </li>
              ))
            )}
          </ol>
        </section>
      </aside>
    </div>
  );
}

function formatTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
