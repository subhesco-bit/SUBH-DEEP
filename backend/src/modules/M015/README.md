# M015 - AI Cost Tracking Per Feature

Part of the AI Operations Backbone cluster (M012, M013, M015, M017, M021-M027).

Domain: estimates and aggregates the USD cost of AI model usage, broken down
by platform feature, and flags features whose daily spend crosses a
configurable budget.

## Strategy Card
```
Purpose:      Answer "what is AI actually costing us, per feature, per day"
              and catch runaway spend before it shows up in a monthly bill.
Actors:       system (every AI-touching feature records its token usage),
              finance/admin (views spend reports and over-budget alerts).
Decision:     Estimate cost of a single call from token counts, then decide
              whether a feature's spend today is over its configured budget.
Algorithm:    cost_usd = (prompt_tokens/1000 * input_rate) +
              (completion_tokens/1000 * output_rate), using a per-model rate
              table (falls back to a generic $0.01/$0.03 per 1K tokens rate
              for unrecognized model ids — clearly labeled as an estimate,
              not a billed figure). Daily feature spend = sum of cost_usd for
              that feature where recorded_at falls on the given UTC date.
              over_budget = daily_spend > budget_usd (default $10/day/feature
              unless a call supplies its own budget_usd).
Data:         data JSONB per row: { feature, model_id, prompt_tokens,
              completion_tokens, cost_usd, budget_usd, recorded_at }
AI role:      none — deterministic rate-table arithmetic over token counts
              the caller already has.
Status:       real
```

Files: controller.js, service.js, routes.js, migrations/3000_M015_generated.sql
(table `core_m015_items`).

## Endpoints
- `GET /` `GET /:id` `POST /` `PUT /:id` `DELETE /:id` — generic record
  access (admin-gated writes), unchanged from the scaffold.
- `POST /usage` — record one call's token usage; returns computed cost_usd.
- `GET /features/:feature/summary?date=` — total cost, call count, average
  cost/call, and over_budget flag for one feature on one UTC date (defaults
  to today).
- `GET /over-budget?date=` — every feature over budget on that date.
