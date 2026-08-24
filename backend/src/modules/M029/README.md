# M029 - Harvest Yield Log & Yield Prediction

Part of the crop-planning & farm-operations module cluster. Farmers log
actual harvest yields per plot/season; the module predicts the next
season's likely yield from that history.

## Strategy Card
```
Purpose:      Give a farmer a data-backed yield estimate for the next
              season on a given plot/crop, instead of guessing.
Actors:       Farmer (logs harvests via standard create, requests prediction).
Decision:     predicted_yield_per_hectare for the next season, with a
              confidence score.
Algorithm:    Recency-weighted moving average over up to the last 3 logged
              seasons (weights 0.5 / 0.3 / 0.2, redistributed if fewer than
              3 seasons exist). Confidence = 1 - coefficient_of_variation
              of historical yields, clamped to [0.3, 0.95] — consistent
              history -> high confidence, volatile history -> low
              confidence. See predictNextYield() in service.js.
Data:         farmer_m029_items.data JSONB shape for a harvest log row:
              { plot_id, crop, season, year, area_hectares,
                yield_quantity_kg, yield_per_hectare, record_type:
                "harvest_log" }
AI role:      none — pure statistical calculation over stored history.
Status:       real
```

## Endpoints
- `GET /api/v1/modules/m029/analytics/prediction?plot_id=&crop=` — predicted next-season yield/hectare for that plot+crop, computed from stored harvest_log items.
- Standard CRUD: `GET/POST /`, `GET/PUT/DELETE /:id` — used to log harvests (`record_type: "harvest_log"`).

Files: controller.js, service.js, routes.js, migrations/3000_M029_generated.sql
