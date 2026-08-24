# M072 - Product Price-Change History

Records every price change on a marketplace product as its own entry (not an
overwritten field) and computes real volatility/trend statistics from that
history — the data a pricing admin or a support agent needs when a buyer asks
"why did this price move".

## Strategy Card
Purpose:      Keep an accountable record of price movement per product and
              flag changes large enough to need review, instead of silently
              overwriting `base_price`.
Actors:       system/admin (records a change whenever a price update happens
              elsewhere in the platform), admin (reviews flagged/volatile
              products).
Decision:     Whether a recorded price change is `minor`/`moderate`/`major`,
              whether it's anomalous enough to need manual review, and what a
              product's short-term price trend/volatility looks like.
Algorithm:    `change_pct = ((new_price - old_price) / old_price) * 100`.
              Magnitude: `minor` <5%, `moderate` 5-15%, `major` >15%.
              `requires_review` is set when a single change exceeds 50% in
              either direction — a jump that size is far more likely to be a
              data-entry error than a real repricing decision. Trend/volatility
              over a product's last N changes: `average_change_pct` (simple
              mean) and `volatility` (population standard deviation of
              `change_pct` across those entries) — see `computeStats()` in
              service.js.
Data:         `core_m0nn_items.data` (table `agronomist_m072_items`) shape:
              `{ product_id, old_price, new_price, change_pct, magnitude,
              requires_review, changed_by, reason, effective_at }`.
AI role:      none — magnitude/review thresholds are fixed numeric rules.
Status:       real

## Endpoints
Base CRUD (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`) plus:
- `GET /history/:productId` — full price history for a product plus computed
  `average_change_pct`, `volatility`, `trend` (`rising`/`falling`/`stable`
  from the sign of the most recent changes), and `current_price`.
- `GET /flagged` — every recorded change with `requires_review = true`,
  across all products, most recent first.

Files: controller.js, service.js, routes.js, migrations/3000_M072_generated.sql
