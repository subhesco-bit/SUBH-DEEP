export type {
  BrainFacts,
  BrainSignal,
  DecisionKind,
  DecisionPassport,
  TissueDef,
  TissueId,
  TissueVerdict,
  TissueVerdictKind,
} from "./types.ts";
export { TISSUES, TISSUE_BY_ID } from "./tissues.ts";
export { BRAIN_SIGNALS, brainDecide } from "./decide.ts";
export {
  AI_UNITS,
  AI_BY_ID,
  ackAi,
  ackAllAi,
  aiScore,
  unitsByStatus,
} from "./atlas.ts";
export type { AiAckResult, AiAtlasFilter, AiScore, AiSource, AiStatus, AiUnit } from "./atlas.ts";
