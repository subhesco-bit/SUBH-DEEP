/** Every AI output carries evidence. A wrapper is not production AI. */

import type { AiEnvelope } from "./types.ts";

export function envelopeFor(input: {
  organ: string;
  body: string;
  action: string;
  citations?: string[];
}): AiEnvelope {
  return {
    inputProvenance: `books.${input.organ}`,
    citations: input.citations ?? ["L8 AI rupeeWrite forbidden", "L9 human command"],
    model: "library-first",
    policy: "firewall",
    confidence: "calculated",
    assumptions: "Declared kg/₹ only. Absent stays absent.",
    explanation: input.body,
    actionBoundary: "propose only — clerk writes",
    humanApproval: "required",
    outcome: "pending clerk",
    feedback: "none until a write",
  };
}

export function envelopeInventedRupee(env: AiEnvelope): boolean {
  return /invent/i.test(env.explanation) || env.actionBoundary.includes("write rupee");
}
