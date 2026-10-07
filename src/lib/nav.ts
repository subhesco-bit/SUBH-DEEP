/** Operator IA. Four groups, six primary doors, one atlas. */

export type NavGroupId = "village" | "organism" | "nerve" | "os";

export type NavItem = {
  to: string;
  label: string;
  hint: string;
  group: NavGroupId;
  primary?: boolean;
};

export const NAV_GROUPS: Array<{ id: NavGroupId; label: string; lede: string }> = [
  { id: "village", label: "Village", lede: "Cells, lots, godown, rupees" },
  { id: "organism", label: "Organism", lede: "Map, body, missing ligaments" },
  { id: "nerve", label: "Nerve", lede: "Companion, library, GitHub cadavers" },
  { id: "os", label: "OS", lede: "Registry, charter, honest completion" },
];

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Books", hint: "Mint a harvest. Remaining stays on the lot.", group: "village", primary: true },
  { to: "/cells", label: "Cells", hint: "Farmer is a cell, not a role.", group: "village" },
  { to: "/lots", label: "Lots", hint: "One body of produce. FIFO offtake.", group: "village", primary: true },
  { to: "/warehouse", label: "Warehouse", hint: "Same lot inwards. Cover, spoilage, weather.", group: "village" },
  { to: "/ledger", label: "Ledger", hint: "Paise journal. Scheme blood. Amount blank.", group: "village" },
  { to: "/trade", label: "Trade", hint: "Declared ₹/kg. paymentRef required.", group: "village", primary: true },
  { to: "/platform", label: "Platform", hint: "Rural ERP atlas. sapParity false.", group: "village" },
  { to: "/organism", label: "Map", hint: "Organs and dashed missing ligaments.", group: "organism", primary: true },
  { to: "/body", label: "Body", hint: "Eleven gates. Relax is the withdraw reflex.", group: "organism" },
  { to: "/ligaments", label: "Ligaments", hint: "Living, missing, then partial.", group: "organism" },
  { to: "/mesh", label: "Mesh", hint: "Thoughtful joints that bind organs.", group: "organism" },
  { to: "/pulse", label: "Pulse", hint: "Harvest → store → sell → settle.", group: "organism" },
  { to: "/vet", label: "Vet", hint: "AFRERA-VET. Human ICD refused.", group: "organism" },
  { to: "/share", label: "Share", hint: "Hours conserved. GST invoice missing.", group: "organism" },
  { to: "/companion", label: "Companion", hint: "Proposes. Clerk approves. Never writes ₹.", group: "nerve", primary: true },
  { to: "/library", label: "Library", hint: "Library first. LLM only on miss.", group: "nerve" },
  { to: "/nerve", label: "Nerve", hint: "Consult memory. No rupee write.", group: "nerve" },
  { to: "/brain", label: "Brain", hint: "Five tissues. One passport.", group: "nerve" },
  { to: "/systems", label: "Systems", hint: "GitHub disk 0. Kernel bus living.", group: "nerve" },
  { to: "/modules", label: "Modules", hint: "One bus. Every named AI plugged here.", group: "nerve" },
  { to: "/os", label: "OS", hint: "Classified complete. GitHub 7%.", group: "os", primary: true },
  { to: "/charter", label: "Charter", hint: "L1–L12. Human command.", group: "os" },
  { to: "/flows", label: "Flows", hint: "Eleven living charts.", group: "os" },
  { to: "/economy", label: "Economy", hint: "Tokens of remaining, not invented yield.", group: "os" },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((item) => item.primary);

export const ATLAS_NAV = NAV_ITEMS.filter((item) => !item.primary);

export function navItemFor(pathname: string): NavItem | undefined {
  const exact = NAV_ITEMS.find((item) => item.to === pathname);
  if (exact) return exact;
  return NAV_ITEMS.filter((item) => item.to !== "/")
    .filter((item) => pathname.startsWith(item.to))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

export function isNavActive(to: string, pathname: string): boolean {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function groupItems(id: NavGroupId): NavItem[] {
  return NAV_ITEMS.filter((item) => item.group === id);
}
