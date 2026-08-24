# M071 - Product Catalog Audit Log

An immutable, append-only trail of what changed on a marketplace product
listing, who changed it, and how big the change was — the record ops reaches
for when a buyer disputes "the price I saw wasn't the price I paid" or a
seller asks "who delisted my product."

## Strategy Card
Purpose:      Give ops/support a real, queryable answer to "what happened to
              this product listing and when" without grepping application logs.
Actors:       system (writes an entry on every catalog-affecting action),
              admin/agronomist (reads the trail, cannot edit/delete entries).
Decision:     What severity (`low`/`medium`/`high`) a given catalog change is,
              so a support queue can triage price-shock or delisting events
              ahead of routine metadata edits.
Algorithm:    `diffProductFields(oldObj, newObj)` produces a field-level diff
              (`{field, old_value, new_value}[]`). `classifySeverity()` then
              applies fixed rules: a `price_changed` entry is `high` if the
              percentage change exceeds 20%, `medium` if 5-20%, else `low`;
              `delisted`/`certification_removed` are always `high`; any other
              action touching 3+ fields is `medium`, otherwise `low`. See
              service.js.
Data:         `core_m0nn_items.data` (table `agronomist_m071_items`) shape:
              `{ product_id, seller_id, actor_id, actor_role, action,
              field_changes: [{field, old_value, new_value}], severity, note,
              occurred_at }`.
AI role:      none — severity is a fixed rule against numbers already in hand.
Status:       real

## Immutability
`deleteItem()` deliberately always rejects: an audit log a caller can delete
is not an audit log. If an entry was logged in error, log a correcting entry
rather than removing the original.

## Endpoints
Base CRUD (`GET /`, `GET /:id`, `POST /`) — `PUT`/`DELETE` are wired but will
always fail because updates/deletes are refused by design — plus:
- `GET /trail/:productId` — full change trail for a product with a computed
  summary (`total_changes`, `high_impact_count`, most recent action/time).
- `GET /?product_id=&seller_id=&action=` — list supports filtering by these
  three fields via query string.

Files: controller.js, service.js, routes.js, migrations/3000_M071_generated.sql
