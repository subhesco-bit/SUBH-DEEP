# ERP domain evidence audit

**Audit date:** 2026-09-10  
**Scope:** `DOCUMENTATION/Volume_2_Module_Analysis.md`, `backend/src/services`,
`backend/src/routes`, and `backend/src/database/migrations`.

## Finding

Volume 2 describes marketplace, finance, logistics, insurance, subsidy and
supporting services, but it does not define an ERP domain inventory or the
transactional boundaries between those services. Existing ERP files are
mostly broad/legacy facades and do not prove an end-to-end, permissioned,
retryable accounting integration. The highest-risk gap is therefore posting
financially material order/procurement documents to an external accounting
system without a durable, idempotent boundary.

## Domain coverage beyond current code

| ERP domain | Evidence in repository | Assessment |
|---|---|---|
| Accounting / GL | `services/unifiedLedgerService.js`, `services/legacy/erpService.js` | Partial: internal ledger exists; no durable external posting contract |
| Procurement | `services/vendorProcurementService.js`, `services/commerce/procurementSubscriptionService.js` | Partial: procurement workflows, no accounting handoff |
| Inventory / warehouse | `services/warehouseManagementService.js`, fertilizer inventory migration | Partial: operational stock flows; no ERP inventory reconciliation |
| Order-to-cash | `services/orderService.js`, `services/commerce/orderService.js`, payment services | Partial: order/payment paths; no canonical accounting document lifecycle |
| Procure-to-pay | procurement services and payment services | Missing as a cohesive flow: no PO → receipt → invoice → settlement boundary |
| HR / time | `services/hrService.js`, `3200_hr_module_schema.sql` | Partial: HR exists; time/payroll accounting integration is absent |
| Assets / maintenance / calibration | asset accounting, preventive maintenance migrations/services | Partial: lifecycle data exists; no work-order cost posting/calibration evidence |
| Manufacturing / processing | production/BOM/routing migration and processing modules | Partial: schema/module fragments; no production-cost or yield posting |
| Quality | `services/qualityAssuranceService.js`, laboratory ERP | Partial: quality records exist; no release-to-inventory/accounting event |
| Projects / DPR | `services/projectSystemsService.js`, `erpDprSearchContracts.test.js` | Partial: project/DPR search contracts; no project-cost commitment/actuals |
| CRM | no cohesive CRM service/route identified in the inspected ERP surface | Missing |
| Tax / GST | GST services and migrations exist (not changed by this audit) | Existing specialist service, but not proven as an accounting posting boundary |
| Treasury / reporting | payment and ledger services exist | Partial: balances/reporting primitives; no bank reconciliation/cash forecast close |

“Partial” means a file or schema exists, not that the domain is production
complete. The audit intentionally distinguishes presence from verified
integration.

## Implemented highest-risk slice

`backend/src/services/erpAccountingIntegrationService.js` adds a narrow,
provider-neutral accounting handoff:

* canonical IDs (`erp:<entity-type>:<source-id>`) for organization and source
  documents;
* looks up `journal_entries`/`journal_lines` and accepts only a persisted
  `posted` canonical journal, rejecting caller lines that differ;
* preserves journal company, entry number, currency, and correlation metadata,
  validates the immutable balanced mapping, and checks `erp.accounting.post`;
* one transaction writing both `erp_accounting_outbox` and the existing
  `platform_event_outbox` event boundary;
* deterministic idempotency keys;
* adapter calls limited to `journal-post` and `journal-status`;
* exponential retry with a terminal `failed` state after a bounded attempt
  count;
* reconciliation that leaves uncertain results pending rather than claiming
  success.

## Confirmed boundary: ERP handoff queue only (no journal lifecycle ownership)

The rpAccountingIntegrationService consumes **posted canonical journal entries**
exclusively. It does not create, approve, or transition journal lifecycle records—accounting-workflow
owns the full journal state machine (draft→maker_pending→checker_pending→approved→posted→reversed).

The ERP service's sole responsibility is:
1. Verify journal exists with status='posted' (precondition enforcement)
2. Transform to canonical format (deterministic, idempotent)
3. Enqueue to rp_accounting_outbox (external handoff queue)
4. Manage retries and reconciliation with external GL

The rp_accounting_outbox table is the external handoff boundary only; it does not
hold journal lifecycle records (e.g., no status transitions like approval, posting, or reversal).
All journal state ownership remains with journal_entries in accounting-workflow.

**No schema overlap with workflow:** Migration 9999_erp_accounting_integration.sql creates
only ERP-specific tables (rp_accounting_outbox, index idx_erp_accounting_outbox_due).
It does not modify or extend journal_entries, journal_lines, or accounting-workflow audit tables.

The external adapter is fail-closed when credentials are absent or an
operation is not explicitly registered. The schema is in
`9999_erp_accounting_integration.sql`; the migration runner was not modified.

## Evidence

Targeted tests:

* `services/erpAccountingIntegrationService.test.js` — canonical IDs,
  atomic outbox writes, permission denial, terminal retries, reconciliation.
* `services/externalIntegrationAdapter.test.js` — missing credentials,
  operation allow-list, bearer auth, timeout normalization.

Command:

```text
cd backend
npm test -- --runInBand src/services/erpAccountingIntegrationService.test.js src/services/externalIntegrationAdapter.test.js
```

Result: **8 tests passed**.

No frontend API client, GST/subsidy service, or migration runner was modified.

