# M013 - AI Prompt/Response Audit Log

Part of the AI Operations Backbone cluster (M012, M013, M015, M017, M021-M027).

Domain: an immutable audit record of AI prompt/response pairs used anywhere
on the platform, with automatic heuristic flagging of entries that look like
they contain personal data (PII) so a human can review them before they sit
unreviewed in logs.

## Strategy Card
```
Purpose:      Give compliance/admin a reviewable trail of what was sent to
              and returned from AI models, and surface likely PII leaks
              automatically instead of relying on someone reading every log.
Actors:       system (every AI-touching feature logs its calls), compliance
              admin (reviews flagged entries).
Decision:     Is this prompt/response pair safe to leave unreviewed, or does
              it need a human look (flagged=true)?
Algorithm:    Regex pattern match against prompt+response text for: email
              addresses (weight 2), phone-like 10-digit numbers (weight 2),
              Aadhaar-like 12-digit numbers (weight 5), card-like 16-digit
              numbers (weight 5). risk_score = sum of weights for match
              types found, capped at 10. flagged = risk_score >= 5 OR a
              banned term ("password", "otp", "cvv") appears in the text.
Data:         data JSONB per row: { feature, model_id, prompt, response,
              prompt_chars, response_chars, pii_matches: [{type,count}],
              risk_score, flagged, reviewed, reviewer_notes, logged_at }
AI role:      none — pure regex/heuristic classification of already-produced
              text, no model call made by this module.
Status:       real
```

Files: controller.js, service.js, routes.js, migrations/3000_M013_generated.sql
(table `core_m013_items`).

## Endpoints
- `GET /` `GET /:id` `POST /` `PUT /:id` `DELETE /:id` — generic record
  access (admin-gated writes), unchanged from the scaffold.
- `POST /log` — log one prompt/response pair (auth required); returns the
  computed risk assessment.
- `GET /flagged` — list entries needing review, most recent first.
- `POST /:id/review` — admin marks an entry reviewed with optional notes.
