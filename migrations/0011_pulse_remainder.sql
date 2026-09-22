-- Planted-crop fact, GI mint chain, village ledger. No invented rupees.

create table if not exists erp_farms (
  id text primary key,
  cell_id text not null references erp_cells(id),
  name text not null,
  village text not null
);

create table if not exists erp_plots (
  id text primary key,
  farm_id text not null references erp_farms(id),
  cell_id text not null references erp_cells(id),
  name text not null,
  acres_centi integer not null,
  constraint erp_plots_acres_ck check (acres_centi > 0)
);

create table if not exists erp_plantings (
  id text primary key,
  cell_id text not null references erp_cells(id),
  plot_id text not null references erp_plots(id),
  variety text not null,
  season text not null,
  acres_centi integer not null,
  status text not null,
  lot_id text references erp_lots(id),
  constraint erp_plantings_status_ck check (status in ('planted', 'harvested')),
  constraint erp_plantings_acres_ck check (acres_centi > 0)
);

create unique index if not exists erp_plantings_cell_variety_season_idx
  on erp_plantings (cell_id, variety, season);

create table if not exists erp_gi_chain (
  id text primary key,
  lot_id text not null references erp_lots(id),
  seq integer not null,
  event text not null,
  handler text not null,
  geo text not null,
  season text not null,
  created_at timestamptz not null default now(),
  constraint erp_gi_chain_event_ck check (event in ('mint', 'intake', 'settle')),
  constraint erp_gi_chain_seq_ck check (seq > 0)
);

create unique index if not exists erp_gi_chain_lot_seq_idx on erp_gi_chain (lot_id, seq);
create index if not exists erp_gi_chain_lot_idx on erp_gi_chain (lot_id);

create table if not exists erp_village_ledger (
  id text primary key,
  village text not null,
  organ_id text not null,
  account text not null,
  side text not null,
  amount_paise integer not null,
  qty_grams integer not null default 0,
  cause text not null,
  lot_id text,
  cell_id text,
  memo text not null,
  created_at timestamptz not null default now(),
  constraint erp_village_side_ck check (side in ('debit', 'credit')),
  constraint erp_village_paise_ck check (amount_paise >= 0),
  constraint erp_village_grams_ck check (qty_grams >= 0)
);

create index if not exists erp_village_ledger_village_idx on erp_village_ledger (village);

alter table erp_lots add column if not exists planting_id text;

create index if not exists erp_plantings_plot_idx on erp_plantings (plot_id);
create index if not exists erp_plantings_lot_idx on erp_plantings (lot_id);
