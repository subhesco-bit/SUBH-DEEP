# M060 - Seller Onboarding Checklist Tracking

Tracks a marketplace seller's progress through the fixed onboarding checklist
(registration, verification, first listing, etc.) and derives a real
completion state from it instead of storing a status flag by hand.

## Strategy Card
Purpose:      Give ops and the seller themselves one place to see exactly what
              onboarding steps remain before a seller account can transact.
Actors:       system (creates checklist on seller signup), seller (marks steps
              done from their dashboard), admin/fpo (reviews and can amend).
Decision:     What onboarding status (`not_started` / `in_progress` /
              `ready_for_review` / `complete`) a seller is in right now.
Algorithm:    Each of the 10 standard steps carries a fixed weight (2-3) and a
              `required` flag. `completion_pct` = sum(weight of completed
              steps) / sum(weight of all steps) * 100. `required_completion_pct`
              is the same ratio restricted to required steps. Status is
              `complete` once completion_pct=100, `ready_for_review` once every
              required step is done but optional ones remain, `in_progress`
              once anything is done, else `not_started`. See
              `computeChecklistStatus()` in service.js.
Data:         `core_m0nn_items.data` (table `fpo_m060_items`) shape:
              `{ seller_id, steps: [{ key, label, required, weight, completed,
              completed_at, notes }], completion_pct, required_completion_pct,
              status, started_at }`.
AI role:      none — this is a fixed rule/checklist domain with no ambiguity
              an LLM would help resolve.
Status:       real

## Standard checklist (`getStandardChecklist()`)
1. business_registration (required, weight 3)
2. identity_verification (required, weight 3)
3. bank_account_verification (required, weight 3)
4. gst_or_tax_id (required, weight 2)
5. address_verification (required, weight 2)
6. seller_terms_agreement (required, weight 2)
7. product_catalog_min3 — at least 3 products listed (required, weight 3)
8. first_listing_approved (required, weight 3)
9. quality_certification_upload (optional, weight 1)
10. store_profile_photo (optional, weight 1)

## Endpoints
Base CRUD (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`) plus:
- `GET /template` — the standard checklist definition, for a client to render
  before any checklist row exists.
- `GET /seller/:sellerId` — this seller's checklist row (404 if none started).
- `PUT /:id/steps/:stepKey` — mark one step complete/incomplete; recomputes
  `completion_pct`/`status` server-side so a client can never desync them.

Files: controller.js, service.js, routes.js, migrations/3000_M060_generated.sql
