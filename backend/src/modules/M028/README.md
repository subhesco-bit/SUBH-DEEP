# M028 - Sowing / Planting Schedule Planner

Part of the crop-planning & farm-operations module cluster (M028, M029, M030,
M031, M032, M033, M036, M040). This module computes when a crop should be
sown given its target harvest date, and checks that date against the crop's
regional agro-climatic sowing window.

## Strategy Card
```
Purpose:      Tell a farmer the recommended sowing date for a crop and flag
              whether that date falls inside the crop's known agro-climatic
              window, so off-season sowing risk is caught before planting.
Actors:       Farmer (submits crop + target harvest date), admin (reviews).
Decision:     recommended_sowing_date = target_harvest_date - duration_days;
              within_recommended_window = does that date fall inside the
              crop's season window (e.g. kharif rice: 06-01 to 07-15)?
Algorithm:    Backwards date calculation from a per-crop agronomic reference
              table (duration-to-maturity, germination days, season sowing
              windows for rice/wheat/maize/cotton/sugarcane/mustard/soybean/
              groundnut/moong/potato — see CROP_CALENDAR in service.js).
              germination_expected_date = sowing_date + germination_days.
Data:         farmer_m028_items.data JSONB shape:
              { plot_id, crop, variety, season, target_harvest_date,
                sowing_date?, area_hectares, region, record_type:
                "sowing_plan", recommended_sowing_date, germination_expected_date,
                expected_harvest_date, within_recommended_window, reasoning }
AI role:      none — this is deterministic agronomic date math.
Status:       real
```

## Endpoints
- `GET /api/v1/modules/m028/reference/calendar` — the crop calendar reference table.
- `POST /api/v1/modules/m028/plan` — compute a sowing plan (not persisted). Body: `{ crop, target_harvest_date, season }`.
- `POST /api/v1/modules/m028/plan/save` — compute and persist as an item.
- Standard CRUD: `GET/POST /`, `GET/PUT/DELETE /:id`.

Files: controller.js, service.js, routes.js, migrations/3000_M028_generated.sql
