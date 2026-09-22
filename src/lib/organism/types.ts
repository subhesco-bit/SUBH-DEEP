import type { Diagnosis } from "@/lib/library";

export type AutoOp = "missing" | "partial" | "living";

export type PulseRow = {
  id: number;
  kind: string;
  query: string;
  reading: string;
  cardIds: string[];
  organId: string | null;
  source: string;
  createdAt: string;
};

export type EventRow = {
  id: number;
  signal: string;
  organId: string | null;
  ligamentId: string | null;
  createdAt: string;
};

export type OrganismSnapshot = {
  autoOp: AutoOp;
  bootedAt: string | null;
  libraryCards: number;
  bindings: number;
  lastPulseAt: string | null;
  lastError: string | null;
  diagnosis: Diagnosis;
  pulses: PulseRow[];
  events: EventRow[];
  reflexesAnswered: number;
};

export type OrganismResult = OrganismSnapshot & {
  ok: boolean;
  error?: string;
};
