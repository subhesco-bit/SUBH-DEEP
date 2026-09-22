/** Digital grievance spine. Village cases from exceptions. No fake government close. */

import type { PlatformException } from "../erp/platform.ts";
import type { GrievanceCase, GrievanceStage } from "./types.ts";

function stageOf(g: PlatformException): GrievanceStage {
  if (g.severity === "block") return "evidence";
  if (g.severity === "defer") return "ack";
  return "complaint";
}

export function grievancesFrom(gates: PlatformException[]): GrievanceCase[] {
  return gates
    .filter((g) => g.code !== "G9")
    .map((g) => ({
      id: `gv-${g.code}`,
      subject: g.title,
      stage: stageOf(g),
      source: g.code,
      href: g.href,
      inventsRupee: false as const,
    }));
}

export const GRIEVANCE_FLOW: GrievanceStage[] = [
  "complaint",
  "ack",
  "evidence",
  "decision",
  "escalation",
  "appeal",
  "closure",
];

export function canClose(c: GrievanceCase): boolean {
  return c.stage === "decision" || c.stage === "closure";
}
