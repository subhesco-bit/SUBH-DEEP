-- Rural ERP platform: season, documents, declared process (harvest → saleable).
-- Losses are clerk-declared. Remaining mass stays on the same lot body.

create table if not exists erp_seasons (
  id text primary key,
  name text not null,
  village text not null,
  status text not null default 'open',
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

insert into erp_seasons (id, name, village, status)
values ('magh-2026', 'Magh 2026', 'Langthasa', 'open')
on conflict (id) do nothing;

create table if not exists erp_documents (
  id text primary key,
  kind text not null,
  ref_id text not null,
  cell_id text,
  lot_id text,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists erp_process (
  id text primary key,
  lot_id text not null references erp_lots(id),
  kind text not null,
  in_grams integer not null,
  loss_grams integer not null,
  out_grams integer not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  check (in_grams > 0),
  check (loss_grams >= 0),
  check (out_grams >= 0),
  check (in_grams = out_grams + loss_grams)
);

create index if not exists erp_documents_kind_idx on erp_documents (kind, created_at desc);
create index if not exists erp_process_lot_idx on erp_process (lot_id);

alter table erp_seasons drop constraint if exists erp_seasons_status_ck;
alter table erp_seasons add constraint erp_seasons_status_ck
  check (status in ('open', 'closed'));

alter table erp_documents drop constraint if exists erp_documents_kind_ck;
alter table erp_documents add constraint erp_documents_kind_ck
  check (kind in ('harvest', 'warehouse', 'offtake', 'settle', 'process', 'statement'));

alter table erp_process drop constraint if exists erp_process_kind_ck;
alter table erp_process add constraint erp_process_kind_ck
  check (kind in ('drying', 'milling', 'cleaning', 'grading'));
