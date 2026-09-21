# Concept-2 Module Workflow Audit (2026-09-10)

Scope: the 14 modules explicitly enumerated in `DOCUMENTATION/Volume_2_Module_Analysis.md`.
This is a code-read audit, not a production certification. “Partial” means the
repository contains related code, but the complete documented chain is not
verified end-to-end.

| Module | Inputs -> validation -> persistence | State/events/audit | AI -> human approval | External adapter | Frontend API |
|---|---|---|---|---|---|
| IAM | Auth routes/middleware validate tokens; user persistence exists | Audit support exists; full registration state machine not verified | MFA exists; risk-based approval not verified | OAuth-related code exists; credentials/runtime not verified | `api.js` auth methods exist |
| Marketplace | Product/order services validate some fields; PostgreSQL persistence exists | Order state persistence exists; event bridge now emits `order.created` | Recommendation services exist; seller/listing approval chain partial | Adapter boundary exists; no provider claim | Product/order methods exist |
| Farmer | Farmer services/routes and PostgreSQL persistence exist | Profile/verification states are split across services; unified audit not verified | Scoring/recommendation code exists; human review partial | Aadhaar/registry calls not credential-verified | Farmer methods exist |
| Financial | Finance services persist loans/payments; validation differs by service | Payment signal exists; settlement event/audit chain partial | Financial AI exists; approval workflow not end-to-end | External adapter is fail-closed; providers not configured | Finance/payment methods exist |
| Logistics | Shipment service persists shipments/tracking; input validation is incomplete | DB/WebSocket status updates; event bridge added for order→shipment booking | Route recommendation is approval-gated; default is `not_configured` | Booking only occurs when a configured adapter is registered | Logistics methods/routes exist |
| Insurance | Claims code validates through AI helpers but persistence path is not verified | Claim status is in-memory in legacy flow; durable audit incomplete | AI validation/assessment exists; human approval contract incomplete | Provider calls are not credential-verified | Insurance methods exist |
| Greenhouse | Greenhouse services/routes exist; schema/persistence chain not verified | Sensor/status events partial | Advisory AI exists; approval not verified | IoT adapters exist but provider runtime unverified | Greenhouse methods exist |
| Subsidy | Subsidy services/routes exist; input and durable persistence vary | Scheme/application states partial; audit not verified | Eligibility recommendations exist; human decision partial | Government portal credentials not verified | Subsidy methods exist |
| Dynamic Pricing | Pricing services calculate values; persistence of decisions partial | Price updates/events vary by caller | Pricing AI exists; merchant approval not unified | Market-data providers not credential-verified | Pricing methods exist |
| Training | Training service/routes exist; completion persistence not fully traced | Enrollment/completion events not verified | Recommendation capability partial; approval not applicable/defined | No supported external adapter verified | Training methods exist |
| Soil Testing | Soil/lab services exist; sample/result persistence varies | Result lifecycle/audit partial | Advisory recommendations exist; agronomist approval not unified | Lab adapter credentials not verified | Soil methods exist |
| Contract Farming | Contract routes/services exist; escrow persistence is split | Contract milestones/events partial; audit incomplete | Risk/terms AI exists; counterparty approval not unified | ERP/bank adapters not credential-verified | Contract methods exist |
| Shared Infrastructure | Equipment/rental services exist; reservation persistence partial | Booking/return states partial | Utilization recommendations exist; approval partial | Logistics/ERP adapters not verified | Infrastructure methods exist |
| Government Scheme | Scheme services/routes exist; application persistence partial | Application/benefit states partial; audit incomplete | Eligibility AI exists; official approval remains external/manual | Government APIs not credential-verified | Scheme methods exist |

## Implemented slice

Order creation now emits an idempotent `order.created` event. A logistics
integration subscriber validates the destination, keeps the default path
`pending_human_approval` when route AI is unavailable, and—only after an
approved route recommendation—creates a shipment and emits
`shipment.booking.requested`. A registered and configured external logistics
adapter is required before any provider call; no real provider integration is
claimed.

## Highest-confidence remaining gaps

1. Insurance claim persistence, durable state transitions, and explicit human
   approval need a single service contract.
2. Logistics status changes should publish durable domain events and audit
   records in addition to WebSocket notifications.
3. Frontend API ownership is concentrated in `frontend/src/services/api.js`;
   this audit did not modify that file, and route-to-method parity still needs
   automated verification.
4. Provider adapters (banks, insurers, labs, GPS, government portals, ERP)
   remain configuration-dependent and were not tested against live credentials.
