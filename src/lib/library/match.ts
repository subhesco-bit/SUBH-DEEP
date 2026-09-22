import type { LibraryCard, LibraryHit } from "./types.ts";
import { libraryCatalog } from "./catalog.ts";

const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "of",
  "to",
  "in",
  "on",
  "for",
  "and",
  "or",
  "is",
  "are",
  "was",
  "were",
  "be",
  "as",
  "at",
  "by",
  "from",
  "with",
  "that",
  "this",
  "it",
  "its",
  "why",
  "how",
  "what",
  "when",
  "where",
  "did",
  "does",
  "do",
  "not",
  "no",
  "into",
  "than",
  "then",
  "should",
  "must",
  "can",
  "instead",
  "without",
  "vs",
  "via",
  "per",
  "if",
  "any",
  "all",
  "our",
  "we",
  "you",
  "they",
  "another",
  "sitting",
]);

function haystack(card: LibraryCard): string {
  return `${card.id} ${card.kind} ${card.title} ${card.body} ${card.source} ${card.signal ?? ""} ${card.organs.join(" ")}`.toLowerCase();
}

function termsOf(query: string): string[] {
  const raw = query
    .trim()
    .toLowerCase()
    .split(/[^a-z0-9.₹]+/)
    .filter((t) => t.length > 1);
  const kept = raw.filter((t) => !STOPWORDS.has(t));
  return kept.length ? kept : raw;
}

/**
 * The function claudeAICoordinator expected: queryLibraryKnowledge.
 * Scores catalog cards for a query and optional organ, without an LLM.
 */
export function queryLibraryKnowledge(
  query: string,
  opts: { organId?: string | null; kind?: string | null; limit?: number } = {},
  cards: LibraryCard[] = libraryCatalog(),
): LibraryHit[] {
  const terms = termsOf(query);
  const limit = opts.limit ?? 12;
  const hits: LibraryHit[] = [];

  for (const card of cards) {
    if (opts.kind && opts.kind !== "all" && card.kind !== opts.kind) continue;
    if (opts.organId && !card.organs.includes(opts.organId)) continue;
    const hay = haystack(card);
    const title = card.title.toLowerCase();
    const signal = (card.signal ?? "").toLowerCase();
    let score = 0;
    if (terms.length === 0) {
      score = opts.organId && card.organs.includes(opts.organId) ? 1 : 0.4;
    } else {
      for (const term of terms) {
        if (card.id.toLowerCase() === term) score += 3;
        else if (title.includes(term)) score += 2;
        else if (signal.includes(term)) score += 2.5;
        else if (hay.includes(term)) score += 1;
      }
      if (opts.organId && card.organs.includes(opts.organId)) score += 0.5;
    }
    if (terms.length === 0 || score > 0) {
      hits.push({
        ...card,
        relevance: terms.length ? score / (terms.length * 2 + 0.5) : score,
      });
    }
  }

  return hits
    .sort((a, b) => b.relevance - a.relevance || a.title.localeCompare(b.title))
    .slice(0, limit);
}

export function cardsForOrgan(
  organId: string,
  cards: LibraryCard[] = libraryCatalog(),
): LibraryCard[] {
  return cards.filter((c) => c.organs.includes(organId));
}

export function bindingCount(cards: LibraryCard[] = libraryCatalog()): number {
  return cards.reduce((n, c) => n + c.organs.length, 0);
}
