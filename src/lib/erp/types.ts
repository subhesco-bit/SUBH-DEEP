export type LotStatus = "minted" | "in_warehouse" | "pledged" | "listed" | "settled";
export type CoverStatus = "gap" | "bound";
export type ContractStatus = "offered" | "accepted" | "blocked";
export type ReceiptStatus = "inward" | "pledged" | "released";
export type OrderStatus = "open" | "settled";
export type PayoutStatus = "pending" | "paid";
export type JournalSide = "debit" | "credit";
export type InputKind = "seed" | "fodder" | "energy" | "labour" | "cover" | "water";


export type FpoRow = {
  id: string;
  name: string;
  village: string;
  district: string;
  splitRule: string;
};

export type CellRow = {
  id: string;
  name: string;
  household: string;
  fpoId: string;
  village: string;
  acresCenti: number;
  notes: string;
  lotCount: number;
  kgOnBooks: number;
  remainingGrams: number;
  rupeeCreditPaise: number;
  rupeeDebitPaise: number;
};

export type LotRow = {
  id: string;
  cellId: string;
  cellName: string;
  fpoId: string;
  variety: string;
  commodity: string;
  grams: number;
  remainingGrams: number;
  grade: string | null;
  giMarker: string | null;
  moistureBp: number | null;
  status: LotStatus;
  coverStatus: CoverStatus;
  policyId: string | null;
  plantingId: string | null;
  giMinted: boolean;
  mintedAt: string;
  fusScore: number | null;
  fusComplete: boolean;
};

export type ReceiptRow = {
  id: string;
  lotId: string;
  variety: string;
  cellName: string;
  facility: string;
  qtyGrams: number;
  remainingGrams: number;
  status: ReceiptStatus;
  lender: string | null;
  createdAt: string;
};

export type OrderRow = {
  id: string;
  lotId: string;
  poolId: string | null;
  variety: string;
  cellName: string;
  buyer: string;
  qtyGrams: number;
  pricePaisePerKg: number;
  freightPaisePerKg: number;
  status: OrderStatus;
  hoursToPay: number | null;
  paymentRef: string | null;
  createdAt: string;
  settledAt: string | null;
};

export type JournalRow = {
  id: number;
  entryId: string;
  cellId: string | null;
  lotId: string | null;
  organId: string;
  account: string;
  side: JournalSide;
  amountPaise: number;
  memo: string;
  createdAt: string;
};

export type InputRow = {
  id: number;
  cellId: string;
  cellName: string;
  kind: InputKind;
  qty: number;
  unit: string;
  amountPaise: number;
  memo: string;
  createdAt: string;
};

export type PayoutRow = {
  id: number;
  fpoId: string;
  cellId: string;
  cellName: string;
  orderId: string;
  qtyGrams: number;
  amountPaise: number;
  status: PayoutStatus;
  paymentRef: string | null;
  createdAt: string;
};

export type KitchenRow = {
  id: string;
  dish: string;
  variety: string;
  festival: string;
  village: string;
};

export type ContractRow = {
  id: string;
  cellId: string;
  cellName: string;
  fpoId: string;
  variety: string;
  season: string;
  qtyGrams: number;
  pricePaisePerKg: number | null;
  status: ContractStatus;
  sourceOrderId: string | null;
  createdAt: string;
};

export type PlantingStatus = "planted" | "harvested";
export type GiEvent = "mint" | "intake" | "settle";

export type PlantingRow = {
  id: string;
  cellId: string;
  cellName: string;
  plotId: string;
  plotName: string;
  variety: string;
  season: string;
  acresCenti: number;
  status: PlantingStatus;
  lotId: string | null;
};

export type GiLinkRow = {
  id: string;
  lotId: string;
  seq: number;
  event: GiEvent;
  handler: string;
  geo: string;
  season: string;
  createdAt: string;
};

export type VillageLedgerRow = {
  id: string;
  village: string;
  organId: string;
  account: string;
  side: "debit" | "credit";
  amountPaise: number;
  qtyGrams: number;
  cause: string;
  lotId: string | null;
  cellId: string | null;
  memo: string;
  createdAt: string;
};

export type PoolableRow = {
  commodity: string;
  remainingGrams: number;
  lotCount: number;
  cellCount: number;
};

export type HerdRow = {
  id: string;
  cellId: string;
  cellName: string;
  kind: string;
  head: number;
  policyId: string | null;
  coverStatus: CoverStatus;
};

export type WeatherAlertRow = {
  id: string;
  village: string;
  hazard: string;
  windowNote: string;
  claimOpen: boolean;
  moratorium: "propose" | "none";
  createdAt: string;
};

export type EnergyWindowRow = {
  id: string;
  village: string;
  status: "surplus" | "ok" | "outage";
  kwh: number | null;
  note: string;
  active: boolean;
  createdAt: string;
};

export type IotReadingRow = {
  id: string;
  entityId: string;
  cellId: string | null;
  kind: string;
  valueNum: number;
  unit: string;
  note: string;
  createdAt: string;
};

export type SchemeOfferRow = {
  id: string;
  cellId: string;
  cellName: string;
  scheme: string;
  eligible: boolean;
  amountPaise: number | null;
  reason: string;
};

export type FusRow = {
  variety: string;
  nutrition: number;
  satiety: number;
  taste: number;
  culture: number;
  convenience: number;
  version: string;
  score: number;
};

export type BooksKpis = {
  cells: number;
  lots: number;
  kgInWarehouse: number;
  kgMinted: number;
  kgRemaining: number;
  openPaise: number;
  settledPaise: number;
  farmgatePaise: number;
  pendingPayouts: number;
  avgHoursToPay: number | null;
  journalBalanced: boolean;
  villageTcoPaise: number;
  spoilageGrams: number;
  giMinted: number;
  integrityNote: string;
};

export type BooksSnapshot = {
  fpo: FpoRow | null;
  kpis: BooksKpis;
  cells: CellRow[];
  lots: LotRow[];
  receipts: ReceiptRow[];
  orders: OrderRow[];
  journal: JournalRow[];
  inputs: InputRow[];
  payouts: PayoutRow[];
  poolable: PoolableRow[];
  kitchen: KitchenRow[];
  contracts: ContractRow[];
  plantings: PlantingRow[];
  giChain: GiLinkRow[];
  villageLedger: VillageLedgerRow[];
  herd: HerdRow[];
  weatherAlerts: WeatherAlertRow[];
  energyWindows: EnergyWindowRow[];
  iotReadings: IotReadingRow[];
  schemes: SchemeOfferRow[];
  fus: FusRow[];
};

export type BooksResult = BooksSnapshot & {
  ok: boolean;
  error?: string;
};
