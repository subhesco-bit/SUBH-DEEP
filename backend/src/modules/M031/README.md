# M031 - Irrigation Scheduling

Part of the crop-planning & farm-operations module cluster. Computes crop
water requirement and the next irrigation date using the FAO-56 single
crop coefficient method.

## Strategy Card
```
Purpose:      Tell a farmer/agronomist how much water a crop needs today
              and when it will next need irrigating, from real
              agronomic formulas rather than a fixed calendar interval.
Actors:       Agronomist/farmer (requests a schedule for a plot).
Decision:     etc_mm_day (daily crop water use) and next_irrigation_date.
Algorithm:    FAO-56 single crop coefficient method: ETc = Kc x ET0, where
              Kc comes from a per-crop, per-growth-stage table (KC_TABLE)
              and ET0 defaults per season when no live weather feed is
              available. Soil total-available-water (TAW, mm/m root depth)
              by texture x management-allowed-depletion (50%) gives the
              readily-available-water buffer; days until it's exhausted by
              ETc = days until next irrigation. See
              computeIrrigationSchedule() in service.js.
Data:         agronomist_m031_items.data JSONB shape:
              { plot_id, crop, growth_stage, soil_type, season,
                root_depth_m, last_irrigation_date, area_hectares,
                record_type: "irrigation_schedule", etc_mm_day,
                next_irrigation_date, water_required_liters_per_irrigation }
AI role:      none-yet — a live ET0 weather feed would sharpen this, but
              that's external infrastructure this sandbox doesn't have;
              the formula falls back to seasonal ET0 defaults until one
              is wired up.
Status:       real
```

## Endpoints
- `POST /api/v1/modules/m031/schedule` — compute a schedule (not persisted).
- `POST /api/v1/modules/m031/schedule/save` — compute and persist.
- Standard CRUD: `GET/POST /`, `GET/PUT/DELETE /:id`.

Files: controller.js, service.js, routes.js, migrations/3000_M031_generated.sql
