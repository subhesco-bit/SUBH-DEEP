# M021 - Agent Task Queue

Part of the AI Operations Backbone cluster (M012, M013, M015, M017, M021-M027).

Domain: a priority task queue for agentic AI work (multi-step tool chains,
background jobs enqueued by `services/ai/aiAgentService.js`), with
priority-ordered dequeue and exponential-backoff retry.

## Strategy Card
```
Purpose:      Give agentic AI work (tasks that may take multiple steps,
              may fail transiently, and compete for execution order) a real
              queue instead of firing everything synchronously and hoping.
Actors:       aiAgentService (enqueues/dequeues/completes/fails tasks),
              admin (monitors queue depth and stuck tasks).
Decision:     Which pending task should run next? What happens when a task
              fails?
Algorithm:    priority_rank(urgent=3, normal=2, low=1). Eligible tasks are
              status='pending' AND (next_attempt_at is null OR <= now).
              Among eligible tasks, sort by priority_rank DESC, then by
              enqueued_at ASC (oldest first within the same priority) —
              this is a strict priority queue with FIFO tie-break, not a
              decaying score, so urgent work always preempts normal/low
              regardless of age. On failure: attempts += 1; if attempts <
              max_attempts, task stays pending with
              next_attempt_at = now + min(2^attempts * 1000ms, 5 min)
              (exponential backoff, capped); otherwise status becomes
              'failed' permanently.
Data:         data JSONB per row: { task_type, payload, priority, status,
              attempts, max_attempts, enqueued_at, next_attempt_at,
              started_at, completed_at, result, error }
AI role:      none — the queue is a scheduling/reliability primitive; the
              tasks it schedules may themselves be AI calls made elsewhere.
Status:       real
```

Files: controller.js, service.js, routes.js, migrations/3000_M021_generated.sql
(table `farmer_m021_items` — table name inherited unchanged from the
generated scaffold).

## Endpoints
- `GET /` `GET /:id` `POST /` `PUT /:id` `DELETE /:id` — generic record
  access (admin-gated writes), unchanged from the scaffold.
- `POST /enqueue` — enqueue a task (auth required).
- `POST /dequeue` — atomically claim and return the next eligible task
  (auth required), or `null` if none are eligible.
- `POST /:id/complete` — mark a running task done with its result.
- `POST /:id/fail` — mark a running task failed; applies retry/backoff.
- `GET /stats` — queue depth by status/priority.
