# M030 - Pest & Disease Incident Tracker

Part of the crop-planning & farm-operations module cluster. Logs pest and
disease sightings and computes a regional outbreak-risk score so nearby
farmers can be warned before an infestation spreads.

Note: `farmer_advisories` / `iot_devices` / `farmer_alerts` (migration
`3030_m030_farmer_advisory.sql`) are an unrelated, already-wired-up feature
elsewhere in the codebase that happens to share this module's number in its
filename — this module does not use those tables; it uses its own
`farmer_m030_items` scaffold table below.

## Strategy Card
```
Purpose:      Flag when pest/disease incidents in a region are clustering
              into an outbreak, so it can be surfaced as an early warning.
Actors:       Farmer (reports a sighting), admin/agronomist (queries risk).
Decision:     risk_level (low/medium/high) for a given region + pest/disease
              pairing.
Algorithm:    Each incident within the last 14 days contributes
              severity(1-5) * recency_decay to a weighted score, where
              recency_decay fades linearly from 1.0 (today) to 0 at the
              14-day window edge. weighted_score >= 8 => high,
              >= 4 => medium, else low. See computeOutbreakRisk() in
              service.js.
Data:         farmer_m030_items.data JSONB shape for an incident row:
              { plot_id, crop, pest_or_disease, severity (1-5), date,
                region, record_type: "pest_incident" }
AI role:      none — deterministic weighted scoring over stored incidents.
Status:       real
```

## Endpoints
- `GET /api/v1/modules/m030/analytics/outbreak-risk?region=&pest=` — current outbreak risk score for that region+pest.
- Standard CRUD: `GET/POST /`, `GET/PUT/DELETE /:id` — used to log incidents.

Files: controller.js, service.js, routes.js, migrations/3000_M030_generated.sql
