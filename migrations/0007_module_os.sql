-- Module OS: one bus, named workflows, decision tracks.
-- AI may propose. It may not write rupees. Commands require a human.

create table if not exists module_state (
  id integer primary key default 1 check (id = 1),
  booted_at timestamptz,
  living_plugs integer not null default 0,
  last_run_id text,
  last_error text
);

insert into module_state (id) values (1) on conflict (id) do nothing;

create table if not exists module_runs (
  id text primary key,
  workflow_id text not null,
  organ_id text not null,
  lot_id text,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists module_steps (
  id serial primary key,
  run_id text not null references module_runs(id) on delete cascade,
  seq integer not null,
  module_id text not null,
  step_code text not null,
  kind text not null,
  organ_id text not null,
  decision text not null,
  reason text not null,
  algorithm text,
  rupee_write boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists module_messages (
  id serial primary key,
  run_id text not null references module_runs(id) on delete cascade,
  from_module text not null,
  to_module text not null,
  signal text not null,
  envelope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table module_runs drop constraint if exists module_runs_status_ck;
alter table module_runs add constraint module_runs_status_ck
  check (status in ('running', 'passed', 'blocked', 'deferred'));

alter table module_steps drop constraint if exists module_steps_decision_ck;
alter table module_steps add constraint module_steps_decision_ck
  check (decision in ('pass', 'block', 'defer', 'propose'));

create index if not exists module_runs_workflow_idx on module_runs (workflow_id, started_at desc);
create index if not exists module_steps_run_idx on module_steps (run_id, seq);
create index if not exists module_messages_run_idx on module_messages (run_id);
