/** Human-equivalent body of the rural economic organism. Map, do not metaphor. */

export type BodyPartId =
  | "skin"
  | "hand"
  | "muscle"
  | "ligament"
  | "relax"
  | "vein"
  | "heart"
  | "ear"
  | "eye"
  | "finger"
  | "feet";

export type BodyStatus = "living" | "partial" | "blocked";

export type BodyDecision = "pass" | "block" | "defer" | "refuse";

export type BodyPart = {
  id: BodyPartId;
  name: string;
  human: string;
  dora: string;
  organ: string;
  status: BodyStatus;
  present: string;
  missing: string;
  next: string;
  href: string;
  cx: number;
  cy: number;
};

export type BodyFacts = {
  remainingGrams: number;
  clerk: string;
  cellId: string;
  outage: boolean;
  alert: boolean;
  iotTempC: number | null;
  kwh: number | null;
  balanced: boolean;
  rupeeWrite: boolean;
  mintedGrams: number;
  offtakeGrams: number;
  spoilageGrams: number;
  tourism: boolean;
};

export type BodyAct = {
  part: BodyPartId;
  decision: BodyDecision;
  moved: boolean;
  remainingGrams: number;
  rupee: null;
  freezeEmi: false;
  reason: string;
  signals: string[];
};

export type RelaxKind = "rest-mill" | "hold-remaining" | "period-rest" | "unclench" | "seal-skin";

export type RelaxAction = {
  id: RelaxKind;
  label: string;
  human: string;
  present: string;
};

/** Arising issue that demands an immediate, named reaction. */
export type IssueId =
  | "rupee-write"
  | "mass-leak"
  | "heat"
  | "alert"
  | "outage"
  | "tourism"
  | "no-clerk"
  | "empty-lot"
  | "unbalanced"
  | "undeclared-spoilage"
  | "undeclared-kwh"
  | "clear";

export type ReflexPosture = "relax" | "react" | "refuse" | "wait" | "recover";

export type WrongAttempt =
  | "unclench"
  | "freeze-emi"
  | "write-rupee"
  | "move-remaining"
  | "invent-tourism"
  | "invent-kwh"
  | "close-unbalanced";

export type IssueDef = {
  id: IssueId;
  severity: number;
  label: string;
  human: string;
  sense: BodyPartId;
  posture: ReflexPosture;
  relax: RelaxKind | null;
  part: BodyPartId;
  present: string;
  wrong: WrongAttempt[];
  path: string[];
};

export type SensedIssue = IssueDef & { live: true };

export type ReflexAct = {
  issue: IssueId;
  posture: ReflexPosture;
  sense: BodyPartId;
  part: BodyPartId;
  relax: RelaxKind | null;
  act: BodyAct;
  hold: BodyAct;
  remainingHeld: true;
  freezeEmi: false;
  rupee: null;
  wrong: WrongAttempt[];
  path: string[];
  human: string;
  reason: string;
};

export type ReflexReport = {
  issues: SensedIssue[];
  primary: SensedIssue;
  reflex: ReflexAct;
  remainingHeld: true;
  freezeEmi: false;
  rupee: null;
};
