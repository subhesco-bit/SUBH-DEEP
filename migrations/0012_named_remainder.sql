-- Named remainder: FUS, weather/herd cover, energy windows, IoT, schemes.
-- Premiums, kWh, and scheme rupees stay nullable. Never invented.

create table if not exists erp_fus (
  variety text primary key,
  nutrition integer not null,
  satiety integer not null,
  taste integer not null,
  culture integer not null,
  convenience integer not null,
  version text not null,
  constraint erp_fus_axes_ck check (
    nutrition between 0 and 100
    and satiety between 0 and 100
    and taste between 0 and 100
    and culture between 0 and 100
    and convenience between 0 and 100
  )
);

create table if not exists erp_policies (
  id text primary key,
  kind text not null,
  village text not null,
  premium_paise integer,
  constraint erp_policies_kind_ck check (kind in ('godown', 'weather', 'herd')),
  constraint erp_policies_premium_ck check (premium_paise is null or premium_paise >= 0)
);

create table if not exists erp_cover_bindings (
  id text primary key,
  subject_kind text not null,
  subject_id text not null,
  policy_id text not null references erp_policies(id),
  status text not null,
  constraint erp_cover_subject_ck check (subject_kind in ('lot', 'planting', 'herd')),
  constraint erp_cover_status_ck check (status in ('bound', 'gap'))
);

create unique index if not exists erp_cover_bindings_subject_idx
  on erp_cover_bindings (subject_kind, subject_id, policy_id);

create table if not exists erp_weather_alerts (
  id text primary key,
  village text not null,
  hazard text not null,
  window_note text not null,
  claim_open boolean not null default true,
  moratorium text not null,
  created_at timestamptz not null default now(),
  constraint erp_weather_moratorium_ck check (moratorium in ('propose', 'none'))
);

create table if not exists erp_herd (
  id text primary key,
  cell_id text not null references erp_cells(id),
  kind text not null,
  head integer not null,
  policy_id text,
  cover_status text not null,
  constraint erp_herd_head_ck check (head > 0),
  constraint erp_herd_kind_ck check (kind in ('cattle', 'goat', 'pig', 'poultry')),
  constraint erp_herd_cover_ck check (cover_status in ('bound', 'gap'))
);

create unique index if not exists erp_herd_cell_kind_idx on erp_herd (cell_id, kind);

create table if not exists erp_energy_windows (
  id text primary key,
  village text not null,
  status text not null,
  kwh integer,
  note text not null,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  constraint erp_energy_status_ck check (status in ('surplus', 'ok', 'outage')),
  constraint erp_energy_kwh_ck check (kwh is null or kwh >= 0)
);

create table if not exists erp_iot_readings (
  id text primary key,
  entity_id text not null,
  cell_id text,
  kind text not null,
  value_num numeric not null,
  unit text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index if not exists erp_iot_entity_idx on erp_iot_readings (entity_id);

create table if not exists erp_scheme_offers (
  id text primary key,
  cell_id text not null references erp_cells(id),
  scheme text not null,
  eligible boolean not null,
  amount_paise integer,
  reason text not null,
  constraint erp_scheme_amount_ck check (amount_paise is null or amount_paise >= 0)
);

create unique index if not exists erp_scheme_cell_idx on erp_scheme_offers (cell_id, scheme);
