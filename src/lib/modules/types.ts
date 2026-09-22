export type ModuleLayer =
  | "domain"
  | "algorithm"
  | "workflow"
  | "decision"
  | "middleware"
  | "comms"
  | "api"
  | "service"
  | "ui"
  | "platform";

export type StepKind =
  | "gate"
  | "algorithm"
  | "ai"
  | "erp"
  | "message"
  | "platform"
  | "middleware"
  | "comms"
  | "domain"
  | "decision";
export type DecisionCode = "pass" | "block" | "defer" | "propose";
export type RunStatus = "running" | "passed" | "blocked" | "deferred";
export type PlugStatus = "living" | "partial" | "missing";

export type ModuleRuntime = {
  id: string;
  layers: ModuleLayer[];
  subscribes: string[];
  emits: string[];
  rupeeWrite: boolean;
  workflowIds: string[];
  plug: PlugStatus;
  enterprise: string;
};

export type WorkflowStepDef = {
  code: string;
  moduleId: string;
  name: string;
  kind: StepKind;
  organ: string;
  algorithm: string;
  emits: string;
  rupeeWrite: boolean;
};

export type WorkflowDef = {
  id: string;
  name: string;
  thesis: string;
  organ: string;
  enterprise: string;
  steps: WorkflowStepDef[];
};

export type RunContext = {
  workflowId: string;
  lotId?: string | null;
  cellId?: string | null;
  variety?: string | null;
  commodity?: string | null;
  grams?: number;
  remainingGrams?: number;
  qtyGrams?: number;
  pricePaisePerKg?: number | null;
  freightPaisePerKg?: number;
  paymentRef?: string | null;
  pledged?: number;
  status?: string | null;
  giMarker?: string | null;
  giChainLength?: number;
  query?: string | null;
  hoursToPay?: number | null;
  openOfftake?: number;
  /** Declared remaining cost of the lot body. Required for WAC; never invented. */
  costPaise?: number | null;
};

export type StepPayload = {
  remaining?: number;
  qty?: number;
  pricePaisePerKg?: number;
  gross?: number;
  freight?: number;
  farmgate?: number;
  paymentRef?: string | null;
  hits?: string[];
  missing?: number;
  living?: number;
  total?: number;
  next?: string;
  giMarker?: string | null;
  farmerPaisePerKg?: number | null;
  energyPerKg?: number | null;
  foodValue?: number | null;
  hoursToPay?: number | null;
  spendPaise?: number;
  firewall?: string;
  human?: boolean;
  route?: string;
  pledged?: number;
  openOfftake?: number;
  take?: Array<{ lotId: string; qtyGrams: number; costPaise?: number }>;
  split?: Array<{ cellId: string; qtyGrams: number; amountPaise: number }>;
  mintCount?: number;
  costPaise?: number;
  wacPaisePerKg?: number;
  fusVersion?: string;
  complete?: boolean;
  hazard?: string;
  claimWindow?: boolean;
  freezeEmi?: boolean;
  policyId?: string | null;
  kwh?: number | null;
  eligible?: boolean;
  amountPaise?: number | null;
  head?: number;
};

export type StepResult = {
  code: string;
  moduleId: string;
  name: string;
  kind: StepKind;
  organ: string;
  decision: DecisionCode;
  reason: string;
  algorithm: string;
  rupeeWrite: boolean;
  emits: string;
  payload: StepPayload;
};

export type BusMessage = {
  from: string;
  to: string;
  signal: string;
  envelope: { decision: string; organ: string; lotId: string | null };
};

export type WorkflowRun = {
  id: string;
  workflowId: string;
  organId: string;
  lotId: string | null;
  status: RunStatus;
  startedAt: string;
  finishedAt: string | null;
  steps: StepResult[];
  messages: BusMessage[];
};

export type ModuleOsSnapshot = {
  livingPlugs: number;
  partialPlugs: number;
  modules: number;
  workflows: number;
  lastRunId: string | null;
  lastError: string | null;
  bootedAt: string | null;
  runs: WorkflowRun[];
  copilot: string | null;
};

export type ModuleOsResult = ModuleOsSnapshot & {
  ok: boolean;
  error?: string;
};
