---
agent: db-auditor
status: fail
findings: 11
---

# DB Audit — AFRERA Platform

## Summary

The platform runs PostgreSQL (primary, `pg` v8.11) and MongoDB (secondary, used only by `aiService.js` for fraud patterns), wired up in `backend/src/database/connection.js`. The core relational schema (`backend/src/database/schema.sql`, 49 tables) is well-normalized with proper `REFERENCES` clauses, but index coverage is inconsistent: high-traffic tables (`users`, `products`, `orders`, `order_items`, `farmers`) are indexed correctly, while ~20 other tables with foreign keys — including financial tables (`loans`, `emi_schedule`, `financial_transactions`, `payments`), logistics (`shipments`, `contracts`), and insurance (`policies`, `claims`) — have no index at all on their FK columns. Postgres does not auto-index foreign keys (unlike primary keys), so this is a real gap, not a false positive.

Transaction discipline is good where it matters most: `orderService.js` (checkout) and `financialService.js` (EMI generation/payment) wrap multi-statement writes in explicit `BEGIN`/`COMMIT`/`ROLLBACK` or a `withTransaction` helper, with clear comments explaining why. That discipline is not applied everywhere — `valueCommerceService.js` writes a batch of recommendation rows one at a time outside any transaction.

One correctness bug was found directly via query-shape analysis: `offlineSyncService.js`'s sync-queue fetch has an unparenthesized `AND ... OR ...` that lets the query return other users' failed sync items (see Finding 2) — flagging here since it's a query-construction defect, but it's also a data-isolation/security issue worth the security-auditor's attention.

`backend/_removed_2026-08-04/models/` (Order.js, Product.js, User.js, index.js) has no references from any file under `backend/src`, so the removal looks complete from a live-code standpoint; the uncommitted working-tree modifications to those already-removed files are unusual but out of scope for this audit (not live production code).

Raw SQL injection risk was not the focus of this pass; spot-checks of ~10 services showed consistent use of parameterized (`$1, $2…`) queries. Full injection-surface coverage is the security-auditor's job — cross-reference their report rather than duplicating it here.

## Findings

### Finding 1 — HIGH — Missing indexes on foreign-key columns across ~20 tables
**Location:** `backend/src/database/schema.sql`

Postgres does not automatically index FK columns. The following FK columns have no supporting index, so every join, cascade delete, and `WHERE <fk> = ?` lookup on them forces a sequential scan as the tables grow:

| Table | Unindexed FK column(s) | Line |
|---|---|---|
| `payments` | `order_id`, `user_id` | schema.sql:262-277 |
| `cart` | `product_id` (see Finding 7 for `user_id`) | schema.sql:251-260 |
| `farmer_certifications` | `farmer_id` | schema.sql:354-366 |
| `training_records` | `farmer_id` | schema.sql:368-377 |
| `credit_scores` | `farmer_id` | schema.sql:383-392 |
| `loans` | `farmer_id` | schema.sql:394-414 |
| `emi_schedule` | `loan_id` | schema.sql:416-428 |
| `advances` | `farmer_id`, `contract_id` | schema.sql:430-446 |
| `financial_transactions` | `user_id` | schema.sql:448-463 |
| `policies` | `user_id`, `farmer_id`, `product_id` | schema.sql:484-501 |
| `claims` | `policy_id`, `user_id` | schema.sql:503-522 |
| `shipments` | `order_id`, `mode_id` | schema.sql:556-578 |
| `vehicles` | `driver_id` | schema.sql:594-610 |
| `drivers` | `assigned_vehicle_id` | schema.sql:612-623 |
| `contracts` | `farmer_id`, `buyer_id`, `crop_id` | schema.sql:629-650 |
| `contract_milestones` | `contract_id` | schema.sql:652-664 |
| `escrow_accounts` | `contract_id` | schema.sql:666-676 |
| `assets` | `type_id`, `location_id`, `responsible_user_id` | schema.sql:690-714 |
| `asset_bookings` | `asset_id`, `user_id` | schema.sql:716-729 |
| `maintenance_records` | `asset_id` | schema.sql:731-742 |
| `subsidy_claims` | `farmer_id`, `scheme_id` | schema.sql:765-781 |
| `compliance_records` | `entity_type`, `entity_id` (compound, frequently filtered per audit_logs' pattern) | schema.sql:799-812 |
| `recommendations` | `user_id` | schema.sql:852-862 |
| `product_variants` | `product_id` | schema.sql:176-185 |
| `certifications` | `product_id` | schema.sql:187-199 |

The most impactful of these are `loans.farmer_id`, `emi_schedule.loan_id`, `financial_transactions.user_id`, `contracts.farmer_id`/`buyer_id`, and `asset_bookings.asset_id` — all are looked up directly by services (`financialService.js:258` `WHERE farmer_id = $1`, `financialService.js:280`/`298` `WHERE loan_id = $1`/`WHERE id = $1` joins on emi_schedule, etc.) and grow without bound over the platform's lifetime.

**Remediation:** Add `CREATE INDEX` statements for each column above, e.g.:
```sql
CREATE INDEX idx_loans_farmer_id ON loans(farmer_id);
CREATE INDEX idx_emi_schedule_loan_id ON emi_schedule(loan_id);
CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_contracts_farmer_id ON contracts(farmer_id);
CREATE INDEX idx_contracts_buyer_id ON contracts(buyer_id);
CREATE INDEX idx_asset_bookings_asset_id ON asset_bookings(asset_id);
-- etc. for the remaining columns listed above
```
Note this is scoped to `schema.sql` (the core platform schema). The 30 feature-specific schema files under `backend/src/database/*_schema.sql` were spot-checked via index/table/FK ratios (e.g. `food_intelligence_schema.sql`: 13 tables / 4 indexes; `nutrition_intelligence_schema.sql`: 12 tables / 4 indexes; `laboratory_erp_schema.sql`: 12 tables / 5 indexes; `organic_traceability_schema.sql`: 19 tables / 6 indexes; `value_commerce_schema.sql`: 9 tables / 6 indexes) and show the same pattern of light index coverage relative to table/FK count — worth a follow-up pass if those modules see production write volume.

---

### Finding 2 — HIGH — Cross-user data leak from operator-precedence bug in sync-queue query
**Location:** `backend/src/services/offlineSyncService.js:100-109`

```js
const query = `
  SELECT * FROM sync_queue
  WHERE user_id = $1
    AND status = 'pending'
    OR (status = 'failed' AND retry_count < $2)
  ORDER BY priority ASC, created_at ASC
  LIMIT 50
`;
const result = await pool.query(query, [userId, OFFLINE_SYNC_CONFIG.max_retry_attempts]);
```
SQL's `AND` binds tighter than `OR`, so this parses as `(user_id = $1 AND status = 'pending') OR (status = 'failed' AND retry_count < $2)`. The second branch has no `user_id` filter at all — any caller of this function receives **every other user's failed sync items** (up to 50, oldest-priority first), not just their own pending and failed items. This is a data-isolation bug caused directly by query construction, not just a logic bug — flagging it here for the DB layer; recommend the security-auditor also record it as a cross-tenant data exposure.

**Remediation:** Parenthesize the whole predicate:
```sql
WHERE user_id = $1
  AND (status = 'pending' OR (status = 'failed' AND retry_count < $2))
```

---

### Finding 3 — MEDIUM — `isHealthy()` calls a MongoDB driver method that no longer exists
**Location:** `backend/src/database/connection.js:178-187`

```js
function isHealthy() {
  const pgHealthy = pgPool !== null;
  const mongoHealthy = mongoClient !== null && mongoClient.isConnected();
  ...
}
```
`package.json` pins `mongodb: ^6.3.0`. `MongoClient.isConnected()` was removed in the MongoDB Node.js driver in v4.0 (2021) — calling it on a v6 client throws `TypeError: mongoClient.isConnected is not a function`. Any code path that calls `isHealthy()` after Mongo has connected (e.g. a `/health` route) will throw instead of reporting status.

**Remediation:** Track connection state via the `connect`/`close`/`error`/`topologyClosed` events on the client instead, e.g. maintain a local `mongoConnected` boolean set in `initMongoDB()`'s success path and cleared in `close()`, or ping with a cheap `db.admin().ping()` guarded by a timeout.

---

### Finding 4 — MEDIUM — N+1 write loop with no transaction for recommendation persistence
**Location:** `backend/src/services/valueCommerceService.js:407-427`

```js
for (const rec of recommendations) {
  await pool.query(
    `INSERT INTO value_recommendations (...) VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, product_id) DO UPDATE SET ...`,
    [userId, rec.product_id, rec.recommendation_score, ...]
  );
}
```
Each recommendation is written with its own round trip against the shared `pool` (not a dedicated client), and the loop is not wrapped in a transaction. If the loop fails partway (e.g. connection drop on item 8 of 20), the user ends up with a partially-updated recommendation set and no rollback. Contrast with `orderService.js:241-289` and `financialService.js:151-181`, which wrap equivalent multi-row writes in explicit `BEGIN`/`COMMIT`/`ROLLBACK`.

**Remediation:** Either wrap the loop in a transaction using a single checked-out client, or — better for this shape of write — batch it into one multi-row `INSERT ... VALUES (...), (...), ... ON CONFLICT ...` statement.

---

### Finding 5 — MEDIUM — Per-item UPDATE loop for failed sync items (inconsistent with the completed-items path)
**Location:** `backend/src/services/offlineSyncService.js:164-172`

The same function batches the "completed" case into a single `UPDATE ... WHERE id = ANY($1)` (line 154-160), but the "failed" case loops and issues one `UPDATE` per item:
```js
if (failedIds.length > 0) {
  for (const failed of failedIds) {
    await pool.query(
      `UPDATE sync_queue SET status = 'failed', retry_count = $1, ...`,
      ...
    );
  }
}
```
Each failed item needs a different `retry_count`/backoff value, which is why it wasn't batched the same way — but this is still classic N+1 writes for a hot sync-processing path.

**Remediation:** Use a single statement with `UPDATE ... FROM (VALUES ...) AS v(id, retry_count, backoff) WHERE sync_queue.id = v.id`, or a `CASE`-based bulk update keyed by `id = ANY($1)`.

---

### Finding 6 — MEDIUM — Unbounded query for shipment temperature history
**Location:** `backend/src/services/logisticsEnhancementService.js:273-298`

`getTemperatureData(shipmentId, filters)` builds `SELECT * FROM temperature_readings WHERE shipment_id = $1 [AND timestamp >= / <=] ORDER BY timestamp DESC` with no `LIMIT`. `startDate`/`endDate` are optional filters (`filters.startDate`/`filters.endDate`), so a call with no date range returns the entire reading history for a shipment. This is a time-series table (`temperature_readings`, indexed on `shipment_id`/`timestamp`/`sensor_id` per `logistics_enhancement_schema.sql:120-122`) fed by periodic IoT sensor writes — for a long cold-chain shipment this can be a large, unbounded result set with no pagination.

**Remediation:** Add a default `LIMIT` (and ideally cursor/offset pagination) when no date range is supplied.

---

### Finding 7 — LOW — `cart` table's only index doesn't serve product-keyed lookups
**Location:** `backend/src/database/schema.sql:251-260`

```sql
CREATE TABLE IF NOT EXISTS cart (
    ...
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    ...
    UNIQUE(user_id, product_id)
);
```
The `UNIQUE(user_id, product_id)` constraint creates a composite index that can serve `user_id`-led lookups (cart-by-user is fine), but not an efficient `WHERE product_id = ?` lookup on its own (e.g. "how many active carts contain this product" for merchandising/abandoned-cart features).

**Remediation:** Add `CREATE INDEX idx_cart_product_id ON cart(product_id);` if such lookups exist or are planned.

---

### Finding 8 — LOW — Sequential per-row INSERT loops inside otherwise-correct transactions
**Location:** `backend/src/services/orderService.js:267-277` (order_items), `backend/src/services/financialService.js:160-173` (emi_schedule)

Both loops insert N rows with N separate round trips to the DB. This is **not a correctness issue** — both are correctly wrapped in `BEGIN`/`COMMIT`/`ROLLBACK` on a single checked-out client, so atomicity is preserved — but it is N round trips where a single multi-row `INSERT ... VALUES (...), (...), ...` would do one. Worth a look if checkout latency or EMI-schedule generation (up to `loan.term_months` rows, e.g. 24-60) becomes a bottleneck.

**Remediation (optional/perf):** Build a multi-row `INSERT` with a single parameter array, or use `pg-format`/`unnest($1::type[], $2::type[], ...)` for bulk inserts.

---

### Finding 9 — LOW — Unbounded MongoDB query on fraud pattern collection
**Location:** `backend/src/services/aiService.js:276-279`

```js
const fraudCollection = mongo.collection('fraud_patterns');
const patterns = await fraudCollection.find({ active: true }).toArray();
```
No `.limit()`. Low risk today since `fraud_patterns` is presumably a small, curated rule set, but there's no ceiling enforced if it grows.

**Remediation:** Add a sane `.limit()` as a defensive cap, or confirm this collection is bounded by design.

---

### Finding 10 — INFO — SQL injection surface (cross-reference only)
Every query sampled across ~10 services (`orderService.js`, `financialService.js`, `offlineSyncService.js`, `valueCommerceService.js`, `logisticsEnhancementService.js`) uses parameterized placeholders (`$1, $2, ...`); no string-concatenated user input into SQL was observed in the sampled files. A full sweep of all 109 services for injection risk is the security-auditor's territory — this is a one-line pointer, not a duplicate finding.

---

### Finding 11 — INFO — `_removed_2026-08-04/models/` removal looks complete
**Location:** `backend/_removed_2026-08-04/models/{Order,Product,User,index}.js`

`grep -rl "_removed_2026-08-04" backend/src` returns no matches — nothing under live `backend/src` imports these files, so the removal is not leaving dangling references. The working tree shows uncommitted modifications to these already-removed files (per `git status`), which is unusual (why edit dead code?) but is a process/hygiene question, not a live DB risk, and out of scope for this audit to resolve.

## Metrics

- Schema files reviewed: 31 `.sql` files under `backend/src/database/` (11,393 total lines); `schema.sql` (core, 1,052 lines) read in full.
- Core schema tables: 49; tables with at least one unindexed FK: ~25.
- Services directory: 109 files; grep-scanned for loop+query (N+1) patterns, `SELECT *` usage, and transaction boundaries.
- Files with an explicit query call inside a loop body: 4 (`orderService.js`, `financialService.js`, `valueCommerceService.js`, `offlineSyncService.js`) — 1 benign (atomic multi-insert), 1 partially benign/partially N+1, 2 flagged.
- Transactions found: 3 explicit (`orderService.js` checkout, `financialService.js` EMI generation, `financialService.js` EMI payment via `withTransaction`) — all correctly scoped with `BEGIN`/`COMMIT`/`ROLLBACK` and connection release in `finally`.
- Connection pool config (`connection.js:80-85`): PostgreSQL `max: 20`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 2000` — reasonable defaults, no misconfiguration found. MongoDB `maxPoolSize: 20`, `serverSelectionTimeoutMS: 5000`, `socketTimeoutMS: 45000` — reasonable.
- High severity findings: 2. Medium: 4. Low: 3. Info: 2.
