export type LibraryKind =
  | "doctrine"
  | "organ"
  | "bridge"
  | "contract"
  | "principle"
  | "repair";

export type LibraryCard = {
  id: string;
  kind: LibraryKind;
  title: string;
  body: string;
  source: string;
  signal?: string;
  organs: string[];
};

export type LibraryHit = LibraryCard & {
  relevance: number;
};

export type Diagnosis = {
  integrity: number;
  missingLigaments: number;
  partialLigaments: number;
  livingLigaments: number;
  isolatedOrgans: string[];
  weakOrgans: string[];
  unboundCards: number;
  cards: number;
  bindings: number;
  reflexesAnswered: number;
  reflexesMissing: number;
  priority: Array<{
    id: string;
    title: string;
    organId: string;
    signal: string;
    should: string;
  }>;
  verdict: string;
};
