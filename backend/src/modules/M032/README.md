# M032 - Crop Rotation Planner

Part of the crop-planning & farm-operations module cluster. Recommends the
next crop for a plot from its recent cropping history, applying real
rotation rules rather than a random suggestion.

## Strategy Card
```
Purpose:      Recommend which crop family to plant next on a plot to
              avoid pest/disease carryover and replenish soil nitrogen.
Actors:       Agronomist/farmer (queries a recommendation for a plot).
Decision:     recommended_crops — a shortlist of crops safe to plant next.
Algorithm:    Two rotation rules applied to the last 1-2 seasons' history:
              (1) if the last crop was a heavy nitrogen-feeding cereal
              (poaceae family), recommend a nitrogen-fixing legume
              (fabaceae) next; (2) otherwise, exclude crops sharing a
              botanical family with the last 1-2 seasons to break
              family-specific pest/disease cycles. See
              recommendNextCrop() / CROP_FAMILY in service.js.
Data:         agronomist_m032_items.data JSONB shape for a rotation-history
              row: { plot_id, crop, season, year, record_type:
                "rotation_history" }
AI role:      none — deterministic rule-based rotation logic.
Status:       real
```

## Endpoints
- `GET /api/v1/modules/m032/analytics/recommendation?plot_id=` — next-crop recommendation from stored rotation_history items.
- Standard CRUD: `GET/POST /`, `GET/PUT/DELETE /:id` — used to log rotation history.

Files: controller.js, service.js, routes.js, migrations/3000_M032_generated.sql
