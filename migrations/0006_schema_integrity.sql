-- Repair remaining mass, declared freight, journal rules, and the indexes the books query.
-- 0005 added remaining_grams as nullable. NULL minus grams poisons the lot body.
-- Never edit 0002–0005; they are already recorded in _migrations.

-- Remaining mass is a tissue of the same lot / receipt body.
update erp_lots set remaining_grams = grams where remaining_grams is null;
update erp_receipts set remaining_grams = qty_grams where remaining_grams is null;
alter table erp_lots alter column remaining_grams set default 0;
alter table erp_lots alter column remaining_grams set not null;
alter table erp_receipts alter column remaining_grams set default 0;
alter table erp_receipts alter column remaining_grams set not null;

alter table erp_lots drop constraint if exists erp_lots_remaining_ck;
alter table erp_lots add constraint erp_lots_remaining_ck
  check (remaining_grams >= 0 and remaining_grams <= grams);

alter table erp_receipts drop constraint if exists erp_receipts_remaining_ck;
alter table erp_receipts add constraint erp_receipts_remaining_ck
  check (remaining_grams >= 0 and remaining_grams <= qty_grams);

-- Freight is declared. Null means zero, never an invented ₹4/kg.
update erp_orders set freight_paise_per_kg = 0 where freight_paise_per_kg is null;
alter table erp_orders alter column freight_paise_per_kg set default 0;
alter table erp_orders alter column freight_paise_per_kg set not null;

alter table erp_lots drop constraint if exists erp_lots_status_ck;
alter table erp_lots add constraint erp_lots_status_ck
  check (status in ('minted', 'in_warehouse', 'listed', 'pledged', 'settled'));

alter table erp_receipts drop constraint if exists erp_receipts_status_ck;
alter table erp_receipts add constraint erp_receipts_status_ck
  check (status in ('inward', 'pledged', 'released'));

alter table erp_orders drop constraint if exists erp_orders_status_ck;
alter table erp_orders add constraint erp_orders_status_ck
  check (status in ('open', 'settled'));

alter table erp_payouts drop constraint if exists erp_payouts_status_ck;
alter table erp_payouts add constraint erp_payouts_status_ck
  check (status in ('pending', 'paid'));

alter table erp_journal drop constraint if exists erp_journal_side_ck;
alter table erp_journal add constraint erp_journal_side_ck
  check (side in ('debit', 'credit'));

alter table erp_journal drop constraint if exists erp_journal_amount_ck;
alter table erp_journal add constraint erp_journal_amount_ck
  check (amount_paise >= 0);

alter table organism_state add column if not exists reflexes_answered integer not null default 0;

create index if not exists erp_journal_entry_idx on erp_journal (entry_id);
create index if not exists erp_orders_status_idx on erp_orders (status);
create index if not exists erp_receipts_status_idx on erp_receipts (status);
create index if not exists ai_pulses_kind_idx on ai_pulses (kind);
create index if not exists spine_events_signal_idx on spine_events (signal);

alter table library_bindings drop constraint if exists library_bindings_organ_fk;
alter table library_bindings add constraint library_bindings_organ_fk
  foreign key (organ_id) references organs(id) on delete cascade;
