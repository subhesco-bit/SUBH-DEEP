# M012 - AI Model Performance Ledger

Part of the AI Operations Backbone cluster (M012, M013, M015, M017, M021-M027):
model routing/gateway support, self-healing/health monitoring, an agentic
companion that chains AI capabilities, and cross-platform operational
intelligence.

Domain: records the outcome (latency, success/failure, accuracy where known)
of every AI model call the platform makes, and turns that history into a
ranked leaderboard used to inform routing decisions (see M022, the AI Model
Routing Policy Registry, and `services/ai/aiBrainService.js`).

## Strategy Card
```
Purpose:      Give the platform an evidence-based answer to "which AI model
              is actually performing best for this task type right now?"
              instead of a static config guess.
Actors:       system (aiGatewayService/aiBrainService-style callers record
              every call outcome), admin (reviews the leaderboard).
Decision:     Rank candidate models for a task_type by a composite
              performance score; flag a model as degraded once its recent
              success rate drops below a threshold.
Algorithm:    score = 0.5*success_rate + 0.3*normalized_speed + 0.2*accuracy
              normalized_speed = clamp(1 - avg_latency_ms/1500, 0, 1)
              success_rate/avg_latency_ms/accuracy computed over the most
              recent 200 recorded calls for that (model_id, task_type) pair.
              degraded = success_rate < 0.8 (min 5 samples).
Data:         data JSONB per row = one recorded call:
              { model_id, task_type, latency_ms, success, accuracy_score,
                error_message, recorded_at }
AI role:      none — this module scores real recorded outcomes; it does not
              itself call any model.
Status:       real
```

Files: controller.js, service.js, routes.js, migrations/3000_M012_generated.sql
(table `core_m012_items`, unchanged from the generated scaffold — the JSONB
`data` shape above is this module's schema, no relational columns needed).

## Endpoints
- `GET /` `GET /:id` `POST /` `PUT /:id` `DELETE /:id` — generic record
  access (admin-gated writes), unchanged from the scaffold.
- `POST /record` — record one AI call outcome (auth required).
- `GET /leaderboard?task_type=` — ranked models with score breakdown.
- `GET /models/:model_id/stats?task_type=` — stats for one model.
