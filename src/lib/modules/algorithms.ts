/** ERP + AI firewall algorithms. Numbers are declared. AI does not invent them. */

import {
  allocateFifo,
  journalBalances,
  remainingAfterCommit,
  settlementAmounts,
  splitQtyWeighted,
  weightedAverageCostPaisePerKg,
  fusForVariety,
  weatherReflex,
  energyProcessGate,
  schemeEligible,
  evaluateHerdCover,
  evaluateWeatherCover,
} from "../erp/kernel.ts";
import { queryLibraryKnowledge } from "../library/match.ts";
import { composeLibraryReading, diagnose } from "../library/diagnose.ts";
import type { DecisionCode, RunContext, StepPayload, WorkflowStepDef } from "./types.ts";

export type AlgorithmResult = {
  decision: DecisionCode;
  reason: string;
  payload: StepPayload;
};

export function aiFirewall(step: WorkflowStepDef): AlgorithmResult {
  if (step.kind === "ai" && step.rupeeWrite) {
    return {
      decision: "block",
      reason: "AI numeric writes are forbidden on assertions. A clerk declares ₹.",
      payload: { firewall: "rupee-write" },
    };
  }
  return {
    decision: "pass",
    reason: "Firewall open: this step does not write rupees.",
    payload: { spendPaise: 0 },
  };
}

export function remainingGate(ctx: RunContext): AlgorithmResult {
  const remaining = ctx.remainingGrams ?? ctx.grams ?? 0;
  const qty = ctx.qtyGrams ?? 0;
  if (remaining < 0) {
    return { decision: "block", reason: "Remaining mass cannot be negative.", payload: { remaining } };
  }
  if (qty > remaining) {
    return {
      decision: "block",
      reason: "Cannot sell more than the remaining lot body.",
      payload: { remaining, qty },
    };
  }
  if ((ctx.grams ?? 0) > 0) {
    remainingAfterCommit(ctx.grams ?? 0, (ctx.grams ?? 0) - remaining);
  }
  return {
    decision: remaining > 0 || qty === 0 ? "pass" : "block",
    reason: remaining > 0 ? `Remaining ${remaining} g still on the same body.` : "No remaining mass.",
    payload: { remaining, qty },
  };
}

export function priceDeclared(ctx: RunContext): AlgorithmResult {
  if (ctx.pricePaisePerKg == null || ctx.pricePaisePerKg <= 0) {
    return {
      decision: "block",
      reason: "salePricePerUnit is required — never invented.",
      payload: {},
    };
  }
  return {
    decision: "pass",
    reason: `Declared ${ctx.pricePaisePerKg} paise/kg.`,
    payload: { pricePaisePerKg: ctx.pricePaisePerKg },
  };
}

export function priceWaterfall(ctx: RunContext): AlgorithmResult {
  const qty = ctx.qtyGrams ?? 0;
  const price = ctx.pricePaisePerKg ?? 0;
  const freight = ctx.freightPaisePerKg ?? 0;
  if (qty <= 0 || price <= 0) {
    return { decision: "block", reason: "Waterfall needs declared quantity and price.", payload: {} };
  }
  const amounts = settlementAmounts(qty, price, freight);
  return {
    decision: "pass",
    reason: `Gross ${amounts.gross} − freight ${amounts.freight} = farmgate ${amounts.farmgate}.`,
    payload: amounts,
  };
}

export function journalGate(ctx: RunContext): AlgorithmResult {
  const qty = ctx.qtyGrams ?? 0;
  const price = ctx.pricePaisePerKg ?? 0;
  const freight = ctx.freightPaisePerKg ?? 0;
  if (qty <= 0 || price <= 0) {
    return { decision: "defer", reason: "No settlement lines yet.", payload: {} };
  }
  const { gross, freight: fr, farmgate } = settlementAmounts(qty, price, freight);
  const lines = [
    { side: "debit" as const, amountPaise: gross },
    { side: "credit" as const, amountPaise: farmgate },
    { side: "credit" as const, amountPaise: fr },
  ];
  const ok = journalBalances(lines);
  return {
    decision: ok ? "pass" : "block",
    reason: ok ? "Journal balances: cash in, farmgate + freight out." : "Journal does not balance.",
    payload: { gross, freight: fr, farmgate },
  };
}

export function paymentRefGate(ctx: RunContext): AlgorithmResult {
  const ref = ctx.paymentRef?.trim() ?? "";
  if (!ref) {
    return {
      decision: "defer",
      reason: "paymentRef is required to mark paid. The offtake stays open.",
      payload: {},
    };
  }
  return { decision: "pass", reason: `Settled against ${ref}.`, payload: { paymentRef: ref } };
}

export function pledgeGate(ctx: RunContext): AlgorithmResult {
  if ((ctx.pledged ?? 0) > 0) {
    return {
      decision: "block",
      reason: "Pledged receipts cannot sell until the lien is cleared.",
      payload: { pledged: ctx.pledged },
    };
  }
  if ((ctx.openOfftake ?? 0) > 0 && ctx.status === "inward") {
    return {
      decision: "block",
      reason: "Open offtake already claims this body.",
      payload: { openOfftake: ctx.openOfftake },
    };
  }
  return { decision: "pass", reason: "No lien. Stock may move.", payload: {} };
}

export function fifoGate(ctx: RunContext): AlgorithmResult {
  const remaining = ctx.remainingGrams ?? 0;
  const qty = ctx.qtyGrams ?? 0;
  if (qty <= 0) return { decision: "defer", reason: "No pool quantity declared.", payload: {} };
  try {
    const take = allocateFifo([{ id: ctx.lotId ?? "lot", remainingGrams: remaining }], qty);
    return { decision: "pass", reason: "FIFO holds remaining mass.", payload: { take } };
  } catch (err) {
    return {
      decision: "block",
      reason: err instanceof Error ? err.message : "FIFO refused.",
      payload: {},
    };
  }
}

export function wacCost(ctx: RunContext): AlgorithmResult {
  const remaining = ctx.remainingGrams ?? 0;
  const cost = ctx.costPaise;
  if (remaining <= 0) return { decision: "defer", reason: "No remaining mass to average.", payload: {} };
  if (cost == null) {
    return {
      decision: "defer",
      reason: "No declared remaining cost. WAC stays silent — never invent ₹.",
      payload: { remaining },
    };
  }
  if (cost < 0) {
    return {
      decision: "block",
      reason: "Declared cost cannot be negative.",
      payload: { remaining, costPaise: cost },
    };
  }
  try {
    const wac = weightedAverageCostPaisePerKg([
      { id: ctx.lotId ?? "lot", remainingGrams: remaining, costPaise: cost },
    ]);
    return {
      decision: "pass",
      reason: `WAC ${wac} paise/kg on declared remaining cost.`,
      payload: { remaining, costPaise: cost, wacPaisePerKg: wac },
    };
  } catch (err) {
    return {
      decision: "block",
      reason: err instanceof Error ? err.message : "WAC refused.",
      payload: {},
    };
  }
}

export function qtyWeightedGate(ctx: RunContext): AlgorithmResult {
  const qty = ctx.qtyGrams ?? 0;
  const price = ctx.pricePaisePerKg ?? 0;
  const freight = ctx.freightPaisePerKg ?? 0;
  if (qty <= 0 || price <= 0) return { decision: "defer", reason: "No farmgate to split.", payload: {} };
  const { farmgate } = settlementAmounts(qty, price, freight);
  const split = splitQtyWeighted([{ cellId: ctx.cellId ?? "cell", qtyGrams: qty }], farmgate);
  return {
    decision: "pass",
    reason: "FPO split is qty-weighted. Last cell absorbs remainder.",
    payload: { split, farmgate },
  };
}

export function libraryConsult(ctx: RunContext): AlgorithmResult {
  const query = ctx.query || ctx.variety || "harvest lot spine hippocampus module";
  const diagnosis = diagnose();
  const hits = queryLibraryKnowledge(query, { limit: 6 });
  const reading = composeLibraryReading(query, hits, diagnosis);
  return {
    decision: hits.length ? "pass" : "defer",
    reason: reading.slice(0, 280),
    payload: { hits: hits.map((h) => h.id), missing: diagnosis.missingLigaments },
  };
}

export function giFrame(ctx: RunContext): AlgorithmResult {
  if (!ctx.giMarker) {
    return {
      decision: "propose",
      reason: "No GI marker on this lot. Media may not invent one.",
      payload: { giMarker: null },
    };
  }
  return {
    decision: "pass",
    reason: `Frame the sack with ${ctx.giMarker}. Same lot body.`,
    payload: { giMarker: ctx.giMarker },
  };
}

export function fvieRank(ctx: RunContext): AlgorithmResult {
  const fus = fusForVariety(ctx.variety ?? "");
  if (!fus) {
    return {
      decision: "defer",
      reason: "No declared FUS axes for this variety. Affordability stays blank.",
      payload: { foodValue: null },
    };
  }
  return {
    decision: "pass",
    reason: `FUS-v1 ${fus.score} on declared food axes. Affordability blank.`,
    payload: { foodValue: fus.score, fusVersion: fus.version, complete: fus.complete },
  };
}

export function hoursToPay(ctx: RunContext): AlgorithmResult {
  if (ctx.hoursToPay == null) {
    return { decision: "propose", reason: "Hours-to-pay is a cell promise. Ask the clerk.", payload: {} };
  }
  return {
    decision: "pass",
    reason: `${ctx.hoursToPay}h to pay sits on the cell, not on a dashboard.`,
    payload: { hoursToPay: ctx.hoursToPay },
  };
}

export function humanCommand(): AlgorithmResult {
  return {
    decision: "pass",
    reason: "Command already has a human: the clerk named the cell and the mass.",
    payload: { human: true },
  };
}

export function countPlugs(living: number, total: number): AlgorithmResult {
  return {
    decision: living > 0 ? "pass" : "block",
    reason: `${living} of ${total} modules have a living plug on this bus.`,
    payload: { living, total },
  };
}

export function copilotNext(workflowId: string): AlgorithmResult {
  const next: Record<string, string> = {
    "harvest-mint": "Next keystroke: inward the same lot body at the godown.",
    "warehouse-intake": "Next keystroke: offtake at a declared ₹/kg, or pledge if a lender is named.",
    "offtake-settle": "Next keystroke: paymentRef, then farmgate credits the cell.",
    "nerve-consult": "Next keystroke: name an organ, then a clerk acts.",
    "domain-advise": "Next keystroke: weather may pause EMI; it may not invent a price.",
    "platform-bus": "Next keystroke: run harvest-mint against a living lot.",
  };
  return {
    decision: "propose",
    reason: next[workflowId] ?? "Next keystroke lives on the books, not a second portal.",
    payload: { next: next[workflowId] ?? "books" },
  };
}

export function giClaimGate(ctx: RunContext): AlgorithmResult {
  if (!ctx.giMarker) {
    return { decision: "pass", reason: "Not a GI lot. No mint required.", payload: { giMarker: null } };
  }
  const n = ctx.giChainLength ?? 0;
  if (n <= 0) {
    return {
      decision: "block",
      reason: "No GI claim without a mint.",
      payload: { giMarker: ctx.giMarker, mintCount: n },
    };
  }
  return {
    decision: "pass",
    reason: `GI mint on the chain (${n}). Listing may claim GI.`,
    payload: { giMarker: ctx.giMarker, mintCount: n },
  };
}

export function spoilageMass(ctx: RunContext): AlgorithmResult {
  const remaining = ctx.remainingGrams ?? 0;
  const qty = ctx.qtyGrams ?? 0;
  if (qty <= 0) {
    return { decision: "defer", reason: "Declared spoilage kilograms are required.", payload: { remaining } };
  }
  try {
    remainingAfterCommit(remaining, qty);
    return {
      decision: "pass",
      reason: `Spoilage ${qty} g leaves ${remaining - qty} g on the same body.`,
      payload: { remaining: remaining - qty, qty },
    };
  } catch (err) {
    return {
      decision: "block",
      reason: err instanceof Error ? err.message : "Spoilage refused.",
      payload: { remaining, qty },
    };
  }
}

export function weatherAlert(ctx: RunContext): AlgorithmResult {
  const hazard = (ctx.query ?? "").trim() || "unseasonal Magh rain";
  try {
    const reflex = weatherReflex(hazard);
    const cover = evaluateWeatherCover("Langthasa");
    return {
      decision: "pass",
      reason: `weather.alert opens a claim window on ${cover.policyId ?? "gap"}. EMI freeze is refused.`,
      payload: { hazard: reflex.hazard, claimWindow: true, freezeEmi: false, policyId: cover.policyId },
    };
  } catch (err) {
    return {
      decision: "block",
      reason: err instanceof Error ? err.message : "Weather refused.",
      payload: {},
    };
  }
}

export function herdCoverGate(ctx: RunContext): AlgorithmResult {
  const head = ctx.qtyGrams && ctx.qtyGrams > 0 ? Math.round(ctx.qtyGrams) : 0;
  if (head <= 0) {
    return { decision: "defer", reason: "No declared headcount. Herd cover stays a gap.", payload: {} };
  }
  const cover = evaluateHerdCover(head);
  return {
    decision: cover.status === "bound" ? "pass" : "defer",
    reason: cover.policyId ? `Herd binds ${cover.policyId}. Premium undeclared.` : "Herd cover gap.",
    payload: { policyId: cover.policyId, head },
  };
}

export function energyCloudGate(ctx: RunContext): AlgorithmResult {
  const gate = energyProcessGate({
    status: ctx.status === "outage" ? "outage" : "ok",
    kwh: ctx.costPaise == null ? null : ctx.costPaise,
    active: ctx.status === "outage",
  });
  return {
    decision: gate.decision,
    reason: gate.reason,
    payload: { kwh: ctx.costPaise ?? null },
  };
}

export function schemeGate(ctx: RunContext): AlgorithmResult {
  const acres = ctx.grams ?? 0;
  const plantings = ctx.giChainLength ?? 0;
  const hort = /ginger|horticulture/i.test(ctx.variety ?? ctx.commodity ?? "");
  const kisan = schemeEligible("PM-KISAN", { acresCenti: acres, plantingCount: plantings, horticulture: hort });
  return {
    decision: "pass",
    reason: `${kisan.reason} Amount stays undeclared.`,
    payload: { eligible: kisan.eligible, amountPaise: null },
  };
}
