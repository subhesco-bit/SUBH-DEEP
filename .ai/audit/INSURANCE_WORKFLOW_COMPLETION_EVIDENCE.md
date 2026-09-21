# Insurance workflow completion evidence

Date: 2026-09-10

## Scope

`backend/src/services/insuranceWorkflowService.js` is the canonical claim
workflow contract. It inventories the policy classes found in the agricultural
insurance surface and prevents the legacy AI helpers from being treated as a
settlement authority.

Registered classes:

* medical/health
* crop yield and weather/parametric
* livestock, dairy, and fishery
* transit and warehouse/cold-chain
* product loss/quality/recall
* asset/equipment and property/infrastructure
* liability
* credit/loan protection
* personal accident/life

## Enforced contract

* Policy-specific evidence is required before a claim enters human review.
* Claim transitions are explicit: `submitted -> human_review -> approved |
  rejected`, with dispute and settlement transitions guarded.
* AI output is stored as an explainable recommendation with source tags and
  `requiresHumanApproval: true`; it cannot approve a claim or release money.
* Adjudication requires an authenticated claims role (`adjuster`,
  `claims_officer`, `insurer`, or `admin`).
* Payout requires a configured provider and a positive provider confirmation.
  An absent or unconfirmed provider fails closed and does not invoke the ledger.
* Audit, ledger, and dispute hooks are explicit dependency boundaries.
* Claim submission is idempotent by caller-supplied idempotency key.

## Honest implementation status

The executable workflow subset is currently marked for crop, weather/parametric,
livestock, transit, and warehouse/cold-chain policies. Other registry entries
are `contract_only`: their evidence and governance contract is defined, but
their product-specific underwriting, provider, and operational integrations are
not claimed complete. Existing premium, issuance, fraud, and legacy claim
services remain compatibility surfaces; this change does not rewrite them.

## Evidence

Targeted tests are in
`backend/src/services/insuranceWorkflowService.test.js`. They cover class
inventory, policy-specific evidence, idempotency, invalid AI settlement,
human adjudication, audit events, and fail-closed payout behavior.

The mounted service uses the Postgres repository and migration
`014_insurance_workflow_contract.sql`; tests inject the in-memory repository.
Real insurer/payment adapters still must be configured and verified before
production certification; no external provider call is fabricated by this
workflow.
