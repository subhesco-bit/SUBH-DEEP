# M017 - AI Fallback / Circuit-Breaker Registry

Part of the AI Operations Backbone cluster (M012, M013, M015, M017, M021-M027).

Domain: a standard circuit-breaker state machine per AI provider/model
("circuit key"), so repeated failures against one model stop hammering it
and instead surface a fallback suggestion.

## Strategy Card
```
Purpose:      Stop the platform from repeatedly calling an AI
              provider/model that is currently failing, and hand back a
              usable fallback instead of a wall of errors.
Actors:       system (any AI-calling code reports call outcomes and checks
              state before calling), admin (monitors open circuits).
Decision:     For a circuit_key (e.g. "anthropic:claude-sonnet"), is it safe
              to call right now, and if not, what should be tried instead?
Algorithm:    Standard 3-state breaker (closed -> open -> half_open ->
              closed): 5 consecutive failures trips the circuit to OPEN;
              while OPEN, calls are blocked until a 60s cooldown elapses,
              then the breaker moves to HALF_OPEN and allows exactly one
              trial call; success in HALF_OPEN resets to CLOSED (failure
              count zeroed), failure in HALF_OPEN reopens it and restarts
              the cooldown. State is computed lazily from stored timestamps
              on every read, not by a background timer. When OPEN/HALF_OPEN,
              the first entry of the circuit's configured fallback_chain
              that is itself not OPEN is returned as the suggestion.
Data:         data JSONB per row (one row per circuit_key, upserted):
              { circuit_key, state, consecutive_failures, last_failure_at,
                last_success_at, opened_at, fallback_chain: [circuit_key...],
                last_transition_reason }
AI role:      none — this is the reliability/routing-safety layer itself.
Status:       real
```

Files: controller.js, service.js, routes.js, migrations/3000_M017_generated.sql
(table `core_m017_items`).

## Endpoints
- `GET /` `GET /:id` `POST /` `PUT /:id` `DELETE /:id` — generic record
  access (admin-gated writes), unchanged from the scaffold.
- `POST /report` — report a call outcome for a circuit_key (auth required);
  returns the resulting state.
- `GET /state/:circuit_key` — current (lazily-evaluated) state + fallback
  suggestion for one circuit.
- `GET /open` — every circuit currently OPEN or HALF_OPEN.
