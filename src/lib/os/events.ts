/** Life-and-business event engine. Unknown events fail. They do not forget. */

import type { LifeEvent } from "./types.ts";

export const LIFE_EVENTS: LifeEvent[] = [
  { id: "harvest.completed", name: "Harvest minted", status: "living", signal: "harvest.completed", muscle: "lot.mint remaining = grams" },
  { id: "warehouse.intake", name: "Same body inwards", status: "living", signal: "warehouse.intake", muscle: "receipt on lotId" },
  { id: "offtake.settle", name: "Declared price settled", status: "living", signal: "offtake.settle", muscle: "journal + paymentRef" },
  { id: "spoilage.event", name: "Spoilage cuts remaining", status: "living", signal: "spoilage.event", muscle: "remainingAfterCommit" },
  { id: "cover.bound", name: "Godown cover bound", status: "living", signal: "cover.bound", muscle: "policyId on the lot" },
  { id: "weather.alert", name: "Weather claim window", status: "living", signal: "weather.alert", muscle: "claim window + moratorium propose, no EMI freeze" },
  { id: "herd.covered", name: "Herd cover bound", status: "living", signal: "herd.covered", muscle: "POL-LANGTHASA-HERD on declared headcount" },
  { id: "scheme.eligible", name: "Scheme eligibility", status: "living", signal: "scheme.eligible", muscle: "computed, amount blank" },
  { id: "food.utility", name: "FUS rank", status: "living", signal: "food.utility", muscle: "FUS-v1 on declared food axes" },
  { id: "marriage", name: "Household marriage", status: "named", signal: "life.marriage", muscle: "none — do not fan out" },
  { id: "illness", name: "Illness", status: "named", signal: "life.illness", muscle: "none — do not infer health" },
  { id: "price-crash", name: "Price crash", status: "named", signal: "market.crash", muscle: "none — price stays declared" },
  { id: "flood", name: "Flood", status: "living", signal: "weather.flood", muscle: "weather.alert claim window, EMI not frozen" },
  { id: "heat", name: "Heatwave", status: "named", signal: "weather.heat", muscle: "none" },
  { id: "transport-failure", name: "Transport failure", status: "named", signal: "logistics.fail", muscle: "none" },
];

export function livingEvents(): LifeEvent[] {
  return LIFE_EVENTS.filter((e) => e.status === "living");
}

export function eventById(id: string): LifeEvent | undefined {
  return LIFE_EVENTS.find((e) => e.id === id);
}

export function unknownEventFails(id: string): boolean {
  return !LIFE_EVENTS.some((e) => e.id === id);
}
