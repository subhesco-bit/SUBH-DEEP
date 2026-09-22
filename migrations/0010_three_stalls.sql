-- Cover, kitchen graph, next-season contract. No invented premiums or prices.

alter table erp_lots add column if not exists cover_status text;
update erp_lots set cover_status = 'gap' where cover_status is null;
alter table erp_lots alter column cover_status set default 'gap';
alter table erp_lots alter column cover_status set not null;
alter table erp_lots drop constraint if exists erp_lots_cover_ck;
alter table erp_lots add constraint erp_lots_cover_ck
  check (cover_status in ('gap', 'bound'));

alter table erp_lots add column if not exists policy_id text;

create table if not exists erp_kitchen (
  id text primary key,
  dish text not null,
  variety text not null,
  festival text not null,
  village text not null
);

create table if not exists erp_contracts (
  id text primary key,
  cell_id text not null references erp_cells(id),
  fpo_id text not null references erp_fpo(id),
  variety text not null,
  season text not null,
  qty_grams integer not null,
  price_paise_per_kg integer,
  status text not null,
  source_order_id text,
  created_at timestamptz not null default now()
);

alter table erp_contracts drop constraint if exists erp_contracts_status_ck;
alter table erp_contracts add constraint erp_contracts_status_ck
  check (status in ('offered', 'accepted', 'blocked'));

alter table erp_contracts drop constraint if exists erp_contracts_qty_ck;
alter table erp_contracts add constraint erp_contracts_qty_ck
  check (qty_grams > 0);

alter table erp_contracts drop constraint if exists erp_contracts_price_ck;
alter table erp_contracts add constraint erp_contracts_price_ck
  check (price_paise_per_kg is null or price_paise_per_kg > 0);

create unique index if not exists erp_contracts_cell_season_idx
  on erp_contracts (cell_id, variety, season);

create index if not exists erp_kitchen_variety_idx on erp_kitchen (variety);
create index if not exists erp_lots_cover_idx on erp_lots (cover_status);
