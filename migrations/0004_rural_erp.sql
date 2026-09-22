-- AFRERA rural ERP: bone of the organism.
-- Unowned village books. Amounts are integer paise; mass is integer grams.
-- Prices are always declared by a clerk — never invented by AI.

create table if not exists erp_fpo (
  id text primary key,
  name text not null,
  village text not null,
  district text not null,
  split_rule text not null default 'qty_weighted'
);

create table if not exists erp_cells (
  id text primary key,
  name text not null,
  household text not null,
  fpo_id text not null references erp_fpo(id),
  village text not null,
  acres_centi integer not null default 0,
  notes text not null default ''
);

create table if not exists erp_lots (
  id text primary key,
  cell_id text not null references erp_cells(id),
  fpo_id text not null references erp_fpo(id),
  variety text not null,
  commodity text not null,
  grams integer not null,
  grade text,
  gi_marker text,
  moisture_bp integer,
  status text not null,
  minted_at timestamptz not null default now()
);

create table if not exists erp_receipts (
  id text primary key,
  lot_id text not null references erp_lots(id),
  facility text not null,
  qty_grams integer not null,
  status text not null,
  lender text,
  pledged_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists erp_receipt_events (
  id serial primary key,
  receipt_id text not null references erp_receipts(id) on delete cascade,
  event text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists erp_orders (
  id text primary key,
  lot_id text not null references erp_lots(id),
  buyer text not null,
  qty_grams integer not null,
  price_paise_per_kg integer not null,
  status text not null,
  hours_to_pay integer,
  settled_at timestamptz,
  payment_ref text,
  created_at timestamptz not null default now()
);

create table if not exists erp_journal (
  id serial primary key,
  entry_id text not null,
  cell_id text,
  lot_id text,
  organ_id text not null,
  account text not null,
  side text not null,
  amount_paise integer not null,
  memo text not null,
  created_at timestamptz not null default now()
);

create table if not exists erp_inputs (
  id serial primary key,
  cell_id text not null references erp_cells(id),
  kind text not null,
  qty integer not null,
  unit text not null,
  amount_paise integer not null,
  memo text not null,
  created_at timestamptz not null default now()
);

create table if not exists erp_payouts (
  id serial primary key,
  fpo_id text not null references erp_fpo(id),
  cell_id text not null references erp_cells(id),
  order_id text not null references erp_orders(id),
  qty_grams integer not null,
  amount_paise integer not null,
  status text not null,
  payment_ref text,
  created_at timestamptz not null default now()
);

create index if not exists erp_lots_cell_idx on erp_lots (cell_id);
create index if not exists erp_lots_status_idx on erp_lots (status);
create index if not exists erp_receipts_lot_idx on erp_receipts (lot_id);
create index if not exists erp_orders_lot_idx on erp_orders (lot_id);
create index if not exists erp_journal_cell_idx on erp_journal (cell_id);
create index if not exists erp_journal_lot_idx on erp_journal (lot_id);
create index if not exists erp_payouts_cell_idx on erp_payouts (cell_id);
