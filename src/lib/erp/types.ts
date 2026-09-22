export type LotStatus = "minted" | "in_warehouse" | "pledged" | "listed" | "settled";
export type ReceiptStatus = "inward" | "pledged" | "released";
export type OrderStatus = "open" | "settled";
export type PayoutStatus = "pending" | "paid";
export type JournalSide = "debit" | "credit";
export type InputKind = "seed" | "fodder" | "energy" | "labour" | "cover";

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
  mintedAt: string;
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

export type PoolableRow = {
  commodity: string;
  remainingGrams: number;
  lotCount: number;
  cellCount: number;
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
};

export type BooksResult = BooksSnapshot & {
  ok: boolean;
  error?: string;
};
