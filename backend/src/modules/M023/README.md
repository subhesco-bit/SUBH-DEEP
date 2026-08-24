# M023 - Platform Anomaly Detection Ledger

Part of the AI Operations Backbone cluster (M012, M013, M015, M017, M021-M027).

Domain: statistical anomaly detection over arbitrary platform metric time
series (AI latency, order volume, error rates, queue depth, etc.), backed by
`services/ai/aiOperationIntelligenceService.js`.

## Strategy Card
```
Purpose:      Notice when a metric has drifted outside its normal range
              without hand-tuning a threshold per metric.
Actors:       aiOperationIntelligenceService (feeds metric samples from
              across the platform), admin (reviews anomalies).
Decision:     Is this new sample for metric_name anomalous relative to its
              own recent history?
Algorithm:    Rolling mean/variance per metric_name computed with Welford's
              online algorithm over up to the last 500 samples (recomputed
              from stored history rather than truly streaming, since state
              is not held in memory across requests). z = (value - mean) /
              stddev (guarded: if stddev is 0, z = 0 unless value != mean,
              in which case treated as maximal deviation). is_anomaly =
              |z| >= 2.5. severity = 'critical' if |z| >= 3.5, 'warning' if
              2.5 <= |z| < 3.5, else 'normal'. Needs >= 5 prior samples for
              the same metric_name before it will flag anything (cold start
              guard — insufficient history to say what's normal).
Data:         data JSONB per row: { metric_name, value, tags, rolling_mean,
              rolling_stddev, z_score, severity, is_anomaly, recorded_at }
AI role:      none — deterministic statistics over recorded numeric samples.
Status:       real
```

Files: controller.js, service.js, routes.js, migrations/3000_M023_generated.sql
(table `farmer_m023_items` — table name inherited unchanged from the
generated scaffold).

## Endpoints
- `GET /` `GET /:id` `POST /` `PUT /:id` `DELETE /:id` — generic record
  access (admin-gated writes), unchanged from the scaffold.
- `POST /samples` — record one metric sample; returns its anomaly
  assessment.
- `GET /anomalies?metric_name=` — flagged anomalies, most recent first.
- `GET /metrics/:metric_name/stats` — current rolling mean/stddev/sample
  count for one metric.
