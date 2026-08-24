# M022 - AI Model Routing Policy Registry

Part of the AI Operations Backbone cluster (M012, M013, M015, M017, M021-M027).

Domain: the explainable routing decision engine — given a task type and a
registered set of candidate models, decide which model to use, backed by
`services/ai/aiBrainService.js`.

## Strategy Card
```
Purpose:      Turn "which model should handle this task type" from a
              hardcoded choice into a weighted, explainable decision that
              can be re-tuned without a code change.
Actors:       aiBrainService (calls route() before dispatching work to
              aiGatewayService), admin (registers/updates candidate lists
              and default weights per task_type).
Decision:     Given task_type and optional weight overrides, pick the best
              candidate model and explain why.
Algorithm:    For each candidate {model_id, cost_per_1k, avg_latency_ms,
              accuracy}, min-max normalize cost and latency across the
              candidate set (lower is better -> normalized_good = 1 -
              (value-min)/(max-min), or 1 if all candidates tie).
              score = w_cost*normalized_cost_good + w_latency*normalized_latency_good
                      + w_accuracy*accuracy
              Default weights {cost:0.3, latency:0.3, accuracy:0.4},
              overridable per call. Highest score wins; ties broken by
              lowest cost_per_1k. Returns the full per-candidate score
              breakdown as `reasoning` so the decision is auditable.
Data:         data JSONB per row (one row per task_type, upserted):
              { task_type, candidates: [{model_id, cost_per_1k,
                avg_latency_ms, accuracy}], default_weights }
AI role:      none — this module IS the deterministic routing/scoring
              logic; it does not call any model itself.
Status:       real
```

Files: controller.js, service.js, routes.js, migrations/3000_M022_generated.sql
(table `farmer_m022_items` — table name inherited unchanged from the
generated scaffold).

## Endpoints
- `GET /` `GET /:id` `POST /` `PUT /:id` `DELETE /:id` — generic record
  access (admin-gated writes), unchanged from the scaffold.
- `POST /policies` — register/replace the candidate list for a task_type
  (admin only).
- `GET /policies` — list registered task_type policies.
- `POST /route` — given `{ task_type, weights? }`, return the selected
  model plus full score breakdown.
