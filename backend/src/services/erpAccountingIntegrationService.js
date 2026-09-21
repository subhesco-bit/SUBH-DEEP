'use strict';

const crypto = require('node:crypto');

const PERMISSION = 'erp.accounting.post';
const EVENT_TYPE = 'erp.accounting.journal.post_requested';

function canonicalId(entityType, value) {
  if (typeof entityType !== 'string' || !entityType.trim()
    || typeof value !== 'string' || !value.trim()) {
    throw Object.assign(new Error('A canonical entity type and id are required'), {
      code: 'ERP_CANONICAL_ID_REQUIRED',
    });
  }
  return `erp:${entityType.trim().toLowerCase()}:${value.trim()}`;
}

function validateLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2) {
    throw Object.assign(new Error('At least two journal lines are required'), {
      code: 'ERP_JOURNAL_INVALID',
    });
  }

  const totals = lines.reduce((total, line) => {
    if (!line || !line.accountId || !Number.isFinite(line.amount) || line.amount <= 0
      || !['debit', 'credit'].includes(line.direction)) {
      throw Object.assign(new Error('Journal lines must have accountId, positive amount and direction'), {
        code: 'ERP_JOURNAL_INVALID',
      });
    }
    return total + (line.direction === 'debit' ? line.amount : -line.amount);
  }, 0);
  if (Math.round(Math.abs(totals) * 100) !== 0) {
    throw Object.assign(new Error('Journal debits and credits must balance'), {
      code: 'ERP_JOURNAL_UNBALANCED',
    });
  }
}

function normalizeLines(lines) {
  return lines.map((line) => ({
    accountId: String(line.accountId || line.account_id),
    amount: Number(line.amount ?? (Number(line.debit) > 0 ? line.debit : line.credit)),
    direction: line.direction || (Number(line.debit) > 0 ? 'debit' : 'credit'),
  }));
}

function createErpAccountingIntegration({
  db,
  adapter,
  authorization,
  maxAttempts = 5,
  now = () => new Date(),
} = {}) {
  if (!db || typeof db.query !== 'function' || !adapter || typeof adapter.call !== 'function') {
    throw new Error('db and adapter dependencies are required');
  }

  async function assertPermission(actorId) {
    if (!actorId || !authorization || typeof authorization.hasPermission !== 'function') {
      throw Object.assign(new Error('ERP accounting permission could not be established'), {
        code: 'ERP_PERMISSION_DENIED',
      });
    }
    if (!(await authorization.hasPermission(actorId, 'erp.accounting', 'post'))) {
      throw Object.assign(new Error('ERP accounting permission denied'), {
        code: 'ERP_PERMISSION_DENIED',
      });
    }
  }

  async function enqueuePostedJournal({
    actorId, organizationId, sourceDocumentId, journalEntryId, correlationId,
    currency = 'INR', lines, idempotencyKey,
  }) {
    await assertPermission(actorId);
    if (!journalEntryId) {
      throw Object.assign(new Error('journalEntryId is required for canonical lookup'), {
        code: 'ERP_CANONICAL_ID_REQUIRED',
      });
    }
    const postedResult = await db.query(
      `SELECT id, company_id, entry_number, currency, exchange_rate, correlation_id
         FROM journal_entries
        WHERE id = $1 AND status = 'posted'`,
      [journalEntryId],
    );
    if (!postedResult.rows?.length) {
      throw Object.assign(new Error('Only posted canonical journals may cross the ERP boundary'), {
        code: 'ERP_WORKFLOW_NOT_POSTED',
      });
    }
    const journal = postedResult.rows[0];
    const lineResult = await db.query(
      `SELECT account_id, debit, credit
         FROM journal_lines
        WHERE journal_entry_id = $1
        ORDER BY id`,
      [journal.id],
    );
    const persistedLines = (lineResult.rows || []).map((line) => ({
      accountId: String(line.account_id),
      amount: Number(line.debit) > 0 ? Number(line.debit) : Number(line.credit),
      direction: Number(line.debit) > 0 ? 'debit' : 'credit',
    }));
    validateLines(persistedLines);
    if (lines && JSON.stringify(normalizeLines(lines)) !== JSON.stringify(persistedLines)) {
      throw Object.assign(new Error('Caller lines do not match the posted canonical journal'), {
        code: 'ERP_JOURNAL_LINES_MISMATCH',
      });
    }
    const sourceId = canonicalId('document', sourceDocumentId || `journal:${journal.id}`);
    const canonicalJournal = canonicalId('journal', String(journal.id));
    const organization = canonicalId('organization', String(organizationId || journal.company_id));
    const key = idempotencyKey || `${canonicalJournal}:post`;
    const eventId = crypto.randomUUID();
    const payload = {
      canonicalDocumentId: sourceId,
      canonicalJournalId: canonicalJournal,
      journalStatus: 'posted',
      canonicalOrganizationId: organization,
      entryNumber: journal.entry_number,
      companyId: journal.company_id,
      correlationId: correlationId || journal.correlation_id,
      exchangeRate: journal.exchange_rate,
      currency: journal.currency || currency,
      lines: persistedLines,
      actorId,
    };
    const client = typeof db.connect === 'function' ? await db.connect() : db;
    const release = client !== db && client.release ? () => client.release() : () => {};
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO erp_accounting_outbox
          (event_id, idempotency_key, canonical_document_id, payload, status, attempts)
         VALUES ($1::uuid, $2, $3, $4::jsonb, 'pending', 0)
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [eventId, key, sourceId, JSON.stringify(payload)],
      );
      await client.query(
        `INSERT INTO platform_event_outbox
          (event_id, event_type, event_data, context, correlation_id, idempotency_key)
         VALUES ($1::uuid, $2, $3::jsonb, $4::jsonb, $1::uuid, $5)
         ON CONFLICT (idempotency_key) DO NOTHING`,
        [eventId, EVENT_TYPE, JSON.stringify(payload), JSON.stringify({ actorId }), key],
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      release();
    }
    return { eventId, idempotencyKey: key, canonicalDocumentId: sourceId, status: 'pending' };
  }

  async function dispatchPending(limit = 20) {
    const pending = await db.query(
      `SELECT event_id, idempotency_key, canonical_document_id, payload, attempts
         FROM erp_accounting_outbox
        WHERE status = 'pending' AND next_attempt_at <= NOW()
        ORDER BY created_at
        LIMIT $1`,
      [limit],
    );
    const results = [];
    for (const row of pending.rows || []) {
      try {
        const result = await adapter.call('accounting', 'journal-post', {
          body: { eventId: row.event_id, idempotencyKey: row.idempotency_key, ...row.payload },
        });
        await db.query(
          `UPDATE erp_accounting_outbox
              SET status = 'sent', attempts = attempts + 1, external_reference = $2,
                  last_error = NULL, updated_at = NOW()
            WHERE event_id = $1::uuid`,
          [row.event_id, result.data?.reference || null],
        );
        results.push({ eventId: row.event_id, status: 'sent' });
      } catch (error) {
        const attempts = Number(row.attempts || 0) + 1;
        const terminal = attempts >= maxAttempts;
        await db.query(
          `UPDATE erp_accounting_outbox
              SET status = $2, attempts = $3, next_attempt_at = NOW() + ($4 * INTERVAL '1 second'),
                  last_error = $5, updated_at = NOW()
            WHERE event_id = $1::uuid`,
          [row.event_id, terminal ? 'failed' : 'pending', attempts, 2 ** Math.min(attempts, 10),
            error.code || 'INTEGRATION_FAILED'],
        );
        results.push({ eventId: row.event_id, status: terminal ? 'failed' : 'pending' });
      }
    }
    return results;
  }

  async function reconcile(eventId) {
    const result = await db.query(
      'SELECT event_id, idempotency_key, canonical_document_id FROM erp_accounting_outbox WHERE event_id = $1::uuid',
      [eventId],
    );
    if (!result.rows?.length) return { status: 'not_found', eventId };
    try {
      const external = await adapter.call('accounting', 'journal-status', {
        body: { eventId, idempotencyKey: result.rows[0].idempotency_key },
      });
      await db.query(
        `UPDATE erp_accounting_outbox
            SET status = $2, external_reference = $3, updated_at = NOW()
          WHERE event_id = $1::uuid`,
        [eventId, external.data?.status === 'posted' ? 'sent' : 'pending',
          external.data?.reference || null],
      );
      return { eventId, status: external.data?.status || 'unknown' };
    } catch (error) {
      return { eventId, status: 'reconciliation_deferred', code: error.code || 'INTEGRATION_FAILED' };
    }
  }

  return {
    enqueuePostedJournal,
    // Compatibility alias; both paths enforce persisted posted-journal lookup.
    enqueueJournal: enqueuePostedJournal,
    dispatchPending,
    reconcile,
    canonicalId,
  };
}

module.exports = { createErpAccountingIntegration, canonicalId, validateLines, EVENT_TYPE };
