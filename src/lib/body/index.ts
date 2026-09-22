export type {
  BodyAct,
  BodyDecision,
  BodyFacts,
  BodyPart,
  BodyPartId,
  BodyStatus,
  IssueDef,
  IssueId,
  ReflexAct,
  ReflexPosture,
  ReflexReport,
  RelaxAction,
  RelaxKind,
  SensedIssue,
  WrongAttempt,
} from "./types.ts";
export { BODY_BY_ID, BODY_PARTS, BODY_VIEW, RELAX_ACTIONS } from "./anatomy.ts";
export { actBody, bodyTone, defaultFacts, fingerPrecision, heartPulse, millTone, relaxBody, veinFlow } from "./actions.ts";
export {
  ISSUE_BY_ID,
  ISSUE_DEFS,
  WRONG_ATTEMPTS,
  attemptWrong,
  correctRelax,
  factsForIssue,
  reactNow,
  reactToIssue,
  senseIssues,
} from "./reflex.ts";
