export type OrganStatus = "living" | "partial" | "missing";
export type BridgeKind = "technical" | "thoughtful";
export type BridgeStatus = "living" | "partial" | "missing";
export type ConceptRole = "organ" | "bridge";

export type Concept = {
  id: string;
  name: string;
  short: string;
  dora: string;
  layer: string;
  status: OrganStatus;
  thesis: string;
  silo: string;
  prosperity: string;
  x: number;
  y: number;
  /** Default organ. Bridge concepts exist only to join other organs. */
  role?: ConceptRole;
  /** Organs a bridge-concept is meant to bind. */
  binds?: string[];
};

export type Bridge = {
  id: string;
  from: string;
  to: string;
  name: string;
  kind: BridgeKind;
  status: BridgeStatus;
  signal: string;
  today: string;
  contract: string;
  thought: string;
};

export type WalkHop = {
  id: string;
  title: string;
  organId: string;
  bridgeId: string | null;
  signal: string;
  today: string;
  should: string;
};
