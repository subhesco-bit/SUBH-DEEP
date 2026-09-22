/** Village brain. Five tissues, one decision. AI cannot write rupees. */

export type TissueId = "frontier" | "agentic" | "physical" | "security" | "scientist";

export type TissueVerdictKind = "pass" | "block" | "defer" | "propose" | "refuse" | "hypothesis";

export type TissueVerdict = {
  id: TissueId;
  name: string;
  fired: boolean;
  verdict: TissueVerdictKind;
  reason: string;
};

export type BrainSignal =
  | "mill-heat"
  | "mill-clear"
  | "remaining"
  | "period"
  | "loan"
  | "tourism"
  | "rupee-write"
  | "hypothesis"
  | "physical-teleop"
  | "harvest-propose"
  | "vet-code";

export type DecisionKind = "pass" | "block" | "defer" | "propose";

export type DecisionPassport = {
  id: string;
  signal: BrainSignal;
  organ: string;
  decision: DecisionKind;
  tissues: TissueVerdict[];
  rupeeWrite: false;
  clerkRequired: boolean;
  remainingGrams: number | null;
  amountPaise: null;
  yield: null;
  humanoid: false;
  reason: string;
  algorithm: string;
};

export type TissueDef = {
  id: TissueId;
  name: string;
  short: string;
  thesis: string;
  living: string;
  refuse: string;
  href: string;
  organ: string;
};

export type BrainFacts = {
  signal: BrainSignal;
  remainingGrams: number;
  outage: boolean;
  alert: boolean;
  iotTempC: number | null;
  kwh?: number | null;
  balanced: boolean;
  clerk: string;
  rupeeWrite?: boolean;
  lossPctDeclared?: number;
};
