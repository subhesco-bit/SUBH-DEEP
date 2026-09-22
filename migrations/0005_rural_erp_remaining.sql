-- Honest remaining mass, declared freight, pooled FPO offtake.
-- Never edit 0004; remaining is a tissue of the same lot body.

alter table erp_lots add column if not exists remaining_grams integer;
update erp_lots set remaining_grams = grams where remaining_grams is null;

alter table erp_receipts add column if not exists remaining_grams integer;
update erp_receipts set remaining_grams = qty_grams where remaining_grams is null;

alter table erp_orders add column if not exists pool_id text;
alter table erp_orders add column if not exists freight_paise_per_kg integer;
update erp_orders set freight_paise_per_kg = 400 where freight_paise_per_kg is null;

create index if not exists erp_orders_pool_idx on erp_orders (pool_id);
