/** Overlay scorecard. Living runtime lives on pine-shadow-cabin-honey. */

export type GateKind = "living" | "named-missing" | "refused";

export type CompletionGate = {
  id: string;
  name: string;
  kind: GateKind;
  href: string;
  reason: string;
};

export const NAMED_MISSING: CompletionGate[] = [
  { id: "finance", name: "Agriculture finance", kind: "named-missing", href: "/ledger", reason: "No invented credit score. Hours-to-pay lives. Underwriting does not." },
  { id: "procure", name: "Agriculture procure", kind: "named-missing", href: "/os", reason: "No invented SKU catalogue. RFQ and 3-way stay missing." },
  { id: "gst", name: "GST invoice", kind: "named-missing", href: "/share", reason: "HSN is named. Invoice is refused. Village GL is enough to be honest." },
  { id: "milk", name: "Milk rupees", kind: "named-missing", href: "/vet", reason: "Herd is a cell fact. Dairy cashflow does not live." },
  { id: "rent", name: "Rental rupees", kind: "named-missing", href: "/share", reason: "Hours conserved. ₹/hour undeclared." },
  { id: "snomed", name: "SNOMED-VET", kind: "named-missing", href: "/vet", reason: "AFRERA-VET lives. Licensed SNOMED subset does not." },
  { id: "bank", name: "Bank rails", kind: "named-missing", href: "/ledger", reason: "paymentRef is a clerk fact. Disbursement stays missing." },
];

export const REFUSED: CompletionGate[] = [
  { id: "tourism", name: "Tourism itinerary", kind: "refused", href: "/os", reason: "Remaining journey is a different door." },
  { id: "cfd", name: "Engineering CFD", kind: "refused", href: "/os", reason: "BOQ stamp lives. Simulation stays refused." },
  { id: "humanoid", name: "Humanoid teleop", kind: "refused", href: "/warehouse", reason: "Physical AI is mill, IoT, sack." },
  { id: "login", name: "Login profile", kind: "refused", href: "/os", reason: "Cell inspect lives. No silent dossier." },
  { id: "ai-rupee", name: "AI rupee write", kind: "refused", href: "/charter", reason: "Firewall. amountPaise always null." },
  { id: "yield", name: "Yield forecast", kind: "refused", href: "/library", reason: "Declared loss % only. Yield stays null." },
  { id: "icd", name: "Human ICD", kind: "refused", href: "/vet", reason: "Hospital coder is the wrong genome." },
];

export const PAGES = [
  "/",
  "/cells",
  "/lots",
  "/warehouse",
  "/ledger",
  "/trade",
  "/platform",
  "/organism",
  "/body",
  "/vet",
  "/share",
  "/mesh",
  "/ligaments",
  "/pulse",
  "/library",
  "/nerve",
  "/brain",
  "/economy",
  "/companion",
  "/modules",
  "/flows",
  "/charter",
  "/os",
  "/systems",
] as const;

export function completionScore() {
  return {
    classified: 133,
    classifiedPct: 100 as const,
    stagesClosed: true as const,
    open: 0 as const,
    blocked: 0 as const,
    githubPct: 7 as const,
    latticePct: 39,
    sapParity: false as const,
    aiParity: false as const,
    githubLivingPlugs: 0 as const,
    rupeeWrite: false as const,
    pagesWired: PAGES.length,
    namedMissing: NAMED_MISSING,
    refused: REFUSED,
    complete: true as const,
    completeMeaning:
      "Classified + living walk + named missing. Kernel bus plugs the named AIs. GitHub disk stays 7%. Not SAP parity. Not AI parity. Clerk still writes remaining.",
  };
}
