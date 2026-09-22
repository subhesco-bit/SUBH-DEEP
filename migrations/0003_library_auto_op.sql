-- Repair pass for the AI-integrated library.
-- 0002 was the organism schema, but it was edited after some previews had
-- already recorded it in _migrations, so library tables never appeared.
-- GitHub M645100 initialize() also defaulted syncDatabase to false — the
-- catalog lived in memory, the spine never published, auto-op stayed missing.
-- Every statement here is idempotent.

create table if not exists organs (
  id text primary key,
  name text not null,
  short text not null,
  dora text not null,
  layer text not null,
  status text not null,
  role text not null default 'organ',
  thesis text not null,
  silo text not null,
  prosperity text not null,
  x integer not null,
  y integer not null,
  binds jsonb not null default '[]'::jsonb
);

alter table organs add column if not exists role text not null default 'organ';
alter table organs add column if not exists binds jsonb not null default '[]'::jsonb;
alter table organs add column if not exists thesis text not null default '';
alter table organs add column if not exists silo text not null default '';
alter table organs add column if not exists prosperity text not null default '';

create table if not exists ligaments (
  id text primary key,
  from_id text not null,
  to_id text not null,
  name text not null,
  kind text not null,
  status text not null,
  signal text not null,
  today text not null,
  contract text not null,
  thought text not null
);

create table if not exists library_cards (
  id text primary key,
  kind text not null,
  title text not null,
  body text not null,
  source text not null,
  signal text,
  organ_ids jsonb not null default '[]'::jsonb,
  indexed_at timestamptz not null default now()
);

alter table library_cards add column if not exists signal text;
alter table library_cards add column if not exists organ_ids jsonb not null default '[]'::jsonb;
alter table library_cards add column if not exists indexed_at timestamptz not null default now();

create table if not exists library_bindings (
  card_id text not null references library_cards(id) on delete cascade,
  organ_id text not null,
  relevance real not null default 1,
  primary key (card_id, organ_id)
);

create table if not exists spine_events (
  id serial primary key,
  signal text not null,
  organ_id text,
  ligament_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists ai_pulses (
  id serial primary key,
  kind text not null,
  query text not null,
  reading text not null,
  card_ids jsonb not null default '[]'::jsonb,
  organ_id text,
  source text not null default 'library',
  created_at timestamptz not null default now()
);

create table if not exists organism_state (
  id integer primary key default 1 check (id = 1),
  booted_at timestamptz,
  library_cards integer not null default 0,
  bindings integer not null default 0,
  auto_op text not null default 'missing',
  last_pulse_at timestamptz,
  last_error text
);

alter table organism_state add column if not exists booted_at timestamptz;
alter table organism_state add column if not exists library_cards integer not null default 0;
alter table organism_state add column if not exists bindings integer not null default 0;
alter table organism_state add column if not exists auto_op text not null default 'missing';
alter table organism_state add column if not exists last_pulse_at timestamptz;
alter table organism_state add column if not exists last_error text;

create index if not exists ligaments_from_idx on ligaments (from_id);
create index if not exists ligaments_to_idx on ligaments (to_id);
create index if not exists ligaments_status_idx on ligaments (status);
create index if not exists library_cards_kind_idx on library_cards (kind);
create index if not exists library_bindings_organ_idx on library_bindings (organ_id);
create index if not exists spine_events_created_idx on spine_events (created_at desc);
create index if not exists ai_pulses_created_idx on ai_pulses (created_at desc);

insert into organism_state (id, auto_op)
values (1, 'missing')
on conflict (id) do nothing;
