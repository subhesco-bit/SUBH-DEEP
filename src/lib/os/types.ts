/** Digital super-organism registry. Classification is the work. */

export type OsClass =
  | "verified"
  | "partial"
  | "scaffolded"
  | "documented"
  | "disconnected"
  | "duplicated"
  | "overlapping"
  | "blocked"
  | "proposed"
  | "missing";

export type OsTable = "level" | "gap" | "concept" | "baseline" | "innovation" | "ai" | "future";
export type OsStage = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type OsLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TodoStatus = "done" | "open" | "blocked";

export type OsItem = {
  id: string;
  name: string;
  table: OsTable;
  stage: OsStage;
  level: OsLevel;
  area: string;
  kernel: OsClass;
  github: OsClass;
  present: string;
  missing: string;
  next: string;
  organs: string[];
  href: string;
  todo: TodoStatus;
};

export type NeedIntent = {
  id: string;
  label: string;
  problem: string;
  href: string;
  workflow: string | null;
  organ: string;
};

export type EvidenceAtom = {
  kind: string;
  value: string;
  source: string;
  confidence: "declared" | "calculated" | "absent";
};

export type EvidencePassport = {
  lotId: string;
  variety: string;
  remainingGrams: number;
  atoms: EvidenceAtom[];
  complete: boolean;
};

export type OsStageMeta = {
  stage: OsStage;
  name: string;
  target: string;
  exit: string;
};

export type OsSnapshot = {
  items: OsItem[];
  classified: number;
  stage0Pct: number;
  stageDone: Record<OsStage, { total: number; done: number; pct: number }>;
  kernelVerified: number;
  kernelPartial: number;
  githubScaffolded: number;
  open: number;
  blocked: number;
  thesis: string;
};

/** Concept → module → feature → user → workflow → rules → database → service → API → authorization → AI → ERP → page → component → test → telemetry */
export type RuntimeChain = {
  concept: string;
  module: string;
  feature: string;
  user: string;
  workflow: string;
  rules: string;
  database: string;
  service: string;
  api: string;
  authorization: string;
  ai: string;
  erp: string;
  page: string;
  component: string;
  test: string;
  telemetry: string;
};

export type EnhanceLevelId = "component" | "industry" | "rural" | "future";

export type EnhancementLevel = {
  level: EnhanceLevelId;
  title: string;
  living: string;
  missing: string;
  next: string;
};

export type OsTodo = {
  id: string;
  itemId: string;
  stage: OsStage;
  title: string;
  status: TodoStatus;
  why: string;
  exit: string;
};

export type ConstitutionRule = {
  id: string;
  law: string;
  binds: string;
  status: "enforced" | "named";
};

export type ConstitutionVerdict = {
  allowed: boolean;
  violated: string[];
};

export type AiEnvelope = {
  inputProvenance: string;
  citations: string[];
  model: string;
  policy: string;
  confidence: "declared" | "calculated" | "absent";
  assumptions: string;
  explanation: string;
  actionBoundary: string;
  humanApproval: "required" | "recorded" | "blocked";
  outcome: string;
  feedback: string;
};

export type JourneyStep = {
  id: string;
  name: string;
  status: "living" | "partial" | "missing";
  href: string;
  organ: string;
};

export type SectorJourney = {
  id: string;
  sector: string;
  status: "living" | "named";
  thesis: string;
  steps: JourneyStep[];
};

export type LifeEvent = {
  id: string;
  name: string;
  status: "living" | "named";
  signal: string;
  muscle: string;
};

export type GrievanceStage = "complaint" | "ack" | "evidence" | "decision" | "escalation" | "appeal" | "closure";

export type GrievanceCase = {
  id: string;
  subject: string;
  stage: GrievanceStage;
  source: string;
  href: string;
  inventsRupee: false;
};

export type SuitabilityOffer = "loan" | "cover" | "price" | "travel" | "scheme" | "insurance-quote";

export type SuitabilityVerdict = {
  offer: SuitabilityOffer;
  suitable: boolean;
  refuse: boolean;
  reason: string;
};
