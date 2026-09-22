/** Village flow charts. Every node is a kernel gate or a named missing. */

export type FlowId =
  | "strategy"
  | "work"
  | "process"
  | "payment"
  | "material"
  | "vision"
  | "decision"
  | "command"
  | "coordination"
  | "algorithms"
  | "supply";

export type FlowDecision = "pass" | "block" | "defer" | "refuse" | "named" | "propose";

export type NodeStatus = "living" | "partial" | "missing";

export type FlowLayout = "pipeline" | "branch" | "fan" | "lanes" | "plate";

export type FlowShape = "process" | "decision" | "start" | "end" | "missing";

export type FlowGroup = {
  label: string;
  ids: string[];
  kind: "stack" | "row" | "refuse";
};

export type FlowNode = {
  id: string;
  name: string;
  algorithm: string;
  organ: string;
  status: NodeStatus;
  lane?: "material" | "payment" | "command" | "sense";
  shape?: FlowShape;
};

export type FlowDef = {
  id: FlowId;
  name: string;
  human: string;
  thesis: string;
  missing: string;
  href: string;
  layout: FlowLayout;
  nodes: FlowNode[];
  groups?: FlowGroup[];
};

export type FlowFacts = {
  remainingGrams: number;
  qtyGrams: number;
  mintedGrams: number;
  offtakeGrams: number;
  spoilageGrams: number;
  pricePaisePerKg: number | null;
  freightPaisePerKg: number;
  paymentRef: string | null;
  clerk: string;
  cellId: string;
  lotId: string;
  variety: string;
  giMarker: string | null;
  giChainLength: number;
  journalBalanced: boolean;
  rupeeWrite: boolean;
  outage: boolean;
  alert: boolean;
  iotTempC: number | null;
  kwh: number | null;
  pledged: number;
  tourism: boolean;
  costPaise: number | null;
  lossPctDeclared: number;
  hoursToPay: number | null;
};

export type NodeAct = {
  nodeId: string;
  name: string;
  algorithm: string;
  decision: FlowDecision;
  reason: string;
  rupee: null;
  status: NodeStatus;
};

export type FlowWalk = {
  flowId: FlowId;
  name: string;
  passed: number;
  blocked: number;
  deferred: number;
  named: number;
  refused: number;
  rupee: null;
  steps: NodeAct[];
  reason: string;
};
