export type { Diagnosis, LibraryCard, LibraryHit, LibraryKind } from "./types.ts";
export { libraryCatalog, libraryCardById } from "./catalog.ts";
export { queryLibraryKnowledge, cardsForOrgan, bindingCount } from "./match.ts";
export { diagnose, composeLibraryReading } from "./diagnose.ts";
export {
  CANONICAL_QUERIES,
  CANONICAL_QUERY_COUNT,
  answerCanonicalQueries,
  missingCanonicalQueries,
  type CanonicalQuery,
  type QueryAnswer,
} from "./queries.ts";
