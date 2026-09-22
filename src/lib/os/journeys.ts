/** Sector journeys. Agriculture is living. Others are named, not cloned. */

import type { JourneyStep, SectorJourney } from "./types.ts";

const agri: JourneyStep[] = [
  { id: "plot", name: "Plot", status: "living", href: "/cells", organ: "crop" },
  { id: "plan", name: "Plan", status: "partial", href: "/cells", organ: "crop" },
  { id: "finance", name: "Finance", status: "missing", href: "/ledger", organ: "finance" },
  { id: "procure", name: "Procure", status: "missing", href: "/os", organ: "orders" },
  { id: "operate", name: "Operate", status: "partial", href: "/lots", organ: "farmer" },
  { id: "monitor", name: "Monitor", status: "partial", href: "/pulse", organ: "spine" },
  { id: "harvest", name: "Harvest", status: "living", href: "/lots", organ: "lot" },
  { id: "grade", name: "Grade", status: "partial", href: "/platform", organ: "lot" },
  { id: "store", name: "Store", status: "living", href: "/warehouse", organ: "warehouse" },
  { id: "sell", name: "Sell", status: "living", href: "/trade", organ: "orders" },
  { id: "settle", name: "Settle", status: "living", href: "/trade", organ: "rupee" },
];

function named(id: string, sector: string, thesis: string): SectorJourney {
  return {
    id,
    sector,
    status: "named",
    thesis,
    steps: [
      { id: `${id}-door`, name: "Do not clone agriculture", status: "missing", href: "/os", organ: "os" },
    ],
  };
}

export const SECTOR_JOURNEYS: SectorJourney[] = [
  {
    id: "agriculture",
    sector: "Agriculture lifecycle",
    status: "living",
    thesis: "Plot → harvest → godown → offtake → settle. Finance and procure stay missing. No invented ₹.",
    steps: agri,
  },
  named("marketplace", "Marketplace", "Listing is born from harvest. Returns and trust graph still named."),
  named("insurance", "Insurance", "Cover binds. Claims, survey, appeal still named."),
  named("banking", "Banking", "No invented credit score. Underwriting stays missing."),
  named("logistics", "Logistics", "Freight is a declared deduction, not a control tower."),
  named("government", "Government schemes", "Static PDF is not eligibility. Effective-dated rules missing."),
  named("engineering", "Engineering", "Do not fake CFD. Professional approval required."),
  named("travel", "Travel", "Not this village kernel. Do not clone the agriculture UX."),
  named("health", "Health", "Clinical safety boundary. Do not infer health."),
  named("enterprise", "Enterprise ERP", "Village journal is the GL here. CoA still missing."),
];

const LIVING_EDGES: Record<string, string[]> = {
  plot: ["plan", "harvest"],
  plan: ["harvest"],
  harvest: ["grade", "store"],
  grade: ["store"],
  store: ["sell"],
  sell: ["settle"],
};

export function canAdvance(from: string, to: string): boolean {
  return (LIVING_EDGES[from] ?? []).includes(to);
}

export function livingAgriculture(): JourneyStep[] {
  return agri.filter((s) => s.status === "living");
}
