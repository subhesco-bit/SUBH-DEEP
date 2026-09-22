import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  composeLibraryReading,
  diagnose,
  queryLibraryKnowledge,
} from "@/lib/library";
import { compactEnvelope, shouldCallLlm } from "@/lib/tokens/economy";
import type { EventRow, OrganismResult, PulseRow } from "./types";

export type { AutoOp, EventRow, OrganismResult, OrganismSnapshot, PulseRow } from "./types";

async function grokEnrich(query: string, memory: string): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 420,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "You are the AFRERA nerve. The library is memory. Speak as an organism doctor: name the organ, the missing ligament, the signal that should fire, and the farmer rupee at stake. Do not invent living runtime that the catalog marks missing. Keep it under 220 words. No emoji.",
          },
          {
            role: "user",
            content: `Consult this library memory and answer the pulse.\n\n${memory}\n\nPulse: ${query}`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return body.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export const bootOrganism = createServerFn({ method: "POST" }).handler(async (): Promise<OrganismResult> => {
  const { ensureOrganismSnapshot, markBootError } = await import("./boot.server");
  try {
    const snapshot = await ensureOrganismSnapshot();
    return { ok: true, ...snapshot };
  } catch (err) {
    const message = err instanceof Error ? err.message : "boot failed";
    const snapshot = await markBootError(message);
    return { ok: false, error: message, ...snapshot };
  }
});

export const getOrganism = createServerFn({ method: "GET" }).handler(async (): Promise<OrganismResult> => {
  const { ensureOrganismSnapshot, readOrganismSnapshot } = await import("./boot.server");
  try {
    const snapshot = await ensureOrganismSnapshot();
    return { ok: true, ...snapshot };
  } catch (err) {
    const message = err instanceof Error ? err.message : "organism unread";
    try {
      const snapshot = await readOrganismSnapshot();
      return { ok: false, error: message, ...snapshot };
    } catch {
      return {
        ok: false,
        error: message,
        autoOp: "missing",
        bootedAt: null,
        libraryCards: 0,
        bindings: 0,
        lastPulseAt: null,
        lastError: message,
        diagnosis: diagnose(),
        pulses: [] as PulseRow[],
        events: [] as EventRow[],
        reflexesAnswered: 0,
      };
    }
  }
});

export const publishSpineEvent = createServerFn({ method: "POST" })
  .validator((input: { signal: string; organId?: string | null; ligamentId?: string | null }) => ({
    signal: String(input?.signal ?? "").slice(0, 240),
    organId: input?.organId ?? null,
    ligamentId: input?.ligamentId ?? null,
  }))
  .handler(async ({ data }) => {
    if (!data.signal) return { ok: false as const, error: "missing signal" };
    const { publishEvent } = await import("./boot.server");
    const events = await publishEvent(data.signal, data.organId, data.ligamentId, { via: "pulse-walk" });
    return { ok: true as const, events };
  });

export const consultLibrary = createServerFn({ method: "POST" })
  .validator((input: { query: string; organId?: string | null }) => ({
    query: String(input?.query ?? "").trim().slice(0, 500),
    organId: input?.organId ?? null,
  }))
  .handler(async ({ data }) => {
    if (!data.query) return { ok: false as const, error: "Ask the library something." };
    const { ensureOrganismSnapshot, publishEvent, readOrganismSnapshot } = await import("./boot.server");
    await ensureOrganismSnapshot();
    const sql = await getSql();
    const diagnosis = diagnose();
    const hits = queryLibraryKnowledge(data.query, { organId: data.organId, limit: 8 });
    const memory = composeLibraryReading(data.query, hits, diagnosis);
    let reading = memory;
    let source: "library" | "grok" = "library";
    if (shouldCallLlm(data.query)) {
      const packed = compactEnvelope(data.query).text;
      const enriched = await grokEnrich(data.query, packed);
      if (enriched) {
        reading = enriched;
        source = "grok";
      }
    }
    await publishEvent("nerve.consult", data.organId ?? "ai", null, {
      source,
      q: data.query.slice(0, 80),
    });
    const inserted = await sql.query<{ id: number }>(
      `insert into ai_pulses (kind, query, reading, card_ids, organ_id, source)
       values ($1,$2,$3,$4::jsonb,$5,$6)
       returning id`,
      ["consult", data.query, reading, JSON.stringify(hits.map((h) => h.id)), data.organId, source],
    );
    await sql.query("update organism_state set last_pulse_at = now() where id = 1", []);
    const snapshot = await readOrganismSnapshot();
    return {
      ok: true as const,
      source,
      reading,
      cardIds: hits.map((h) => h.id),
      pulseId: inserted[0]?.id ?? 0,
      pulses: snapshot.pulses,
      events: snapshot.events,
    };
  });
