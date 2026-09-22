-- AFRERA organism schema: lattice + AI-integrated library + event spine.
-- Auth is off. Rows are unowned world state (doctrine, not personal data).

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
