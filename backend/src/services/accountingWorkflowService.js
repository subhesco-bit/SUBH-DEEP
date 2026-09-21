'use strict';

const crypto = require('node:crypto');
const pool = require('../database/pool');

const WORKFLOW = Object.freeze({
  DRAFT: 'draft',
  MAKER_PENDING: 'maker_pending',
  CHECKER_PENDING: 'checker_pending',
  APPROVED: 'approved',
  POSTED: 'posted',
  REVERSED: 'reversed',
});

function fail(message, code = 'ACCOUNTING_VALIDATION_ERROR') {
  throw Object.assign(new Error(message), { code });
}

function validateLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2) fail('At least two journal lines are required');
  let debit = 0;
  let credit = 0;
  for (const line of lines) {
    if (!Number.isInteger(Number(line.accountId)) || Number(line.accountId) <= 0) {
      fail('Each journal line requires a valid accountId');
    }
    const d = Number(line.debit || 0);
    const c = Number(line.credit || 0);
    if (!Number.isFinite(d) || !Number.isFinite(c) || (d > 0 && c > 0) || (d <= 0 && c <= 0)) {
      fail('Each journal line must contain exactly one positive debit or credit');
    }
    debit += d;
    credit += c;
  }
  if (Math.abs(debit - credit) > 0.0001) fail('Journal entry is not balanced', 'ACCOUNTING_UNBALANCED');
}

function actor(req) {
  return req.actorId || req.userId || 'system';
}

function uuidOrNull(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''))
    ? value : null;
}

async function audit(client, entryId, action, actorId, correlationId, details = {}) {
  await client.query(
    `INSERT INTO accounting_workflow_audit
       (journal_entry_id, action, actor_id, correlation_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [entryId, action, actorId, correlationId || null, details],
  );
}

async function createDraft(input, context = {}) {
  validateLines(input.lines);
  if (!input.companyId || !input.entryDate) fail('companyId and entryDate are required');
  const client = await pool.connect();
  const key = input.idempotencyKey || crypto.randomUUID();
  try {
    await client.query('BEGIN');
    const existing = await client.query(
      'SELECT * FROM journal_entries WHERE company_id = $1 AND idempotency_key = $2',
      [input.companyId, key],
    );
    if (existing.rows[0]) {
      await client.query('ROLLBACK');
      return existing.rows[0];
    }
    const entry = await client.query(
      `INSERT INTO journal_entries
       (company_id, entry_number, entry_date, fiscal_period_id, journal_type,
        description, reference_type, reference_id, currency, exchange_rate,
        status, maker_id, idempotency_key, correlation_id, metadata)
       VALUES ($1, COALESCE($2, 'JE-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISSMS')),
        $3, $4, $5, $6, $7, $8, $9, $10, 'draft', $11, $12, $13, $14)
       RETURNING *`,
      [input.companyId, input.entryNumber || null, input.entryDate, input.fiscalPeriodId || null,
        input.journalType || 'general', input.description || null, input.referenceType || null,
        input.referenceId || null, input.currency || 'INR', input.exchangeRate || 1,
        actor(context), key, context.correlationId || null, input.metadata || {}],
    );
    const id = entry.rows[0].id;
    for (let i = 0; i < input.lines.length; i += 1) {
      const line = input.lines[i];
      await client.query(
        `INSERT INTO journal_lines
          (journal_entry_id, line_number, account_id, debit, credit, base_debit, base_credit,
           cost_center_id, profit_center_id, business_unit_id, branch_id, department_id,
           partner_type, partner_id, description)
         VALUES ($1,$2,$3,$4,$5,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [id, i + 1, line.accountId, Number(line.debit || 0), Number(line.credit || 0),
          line.costCenterId || null, line.profitCenterId || null, line.businessUnitId || null,
          line.branchId || null, line.departmentId || null, line.partnerType || null,
          line.partnerId || null, line.description || null],
      );
    }
    await audit(client, id, 'draft_created', actor(context), context.correlationId, { idempotencyKey: key });
    await client.query('COMMIT');
    return entry.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function transition(id, action, from, to, context = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM journal_entries WHERE id = $1 FOR UPDATE', [id]);
    const entry = result.rows[0];
    if (!entry) fail('Journal entry not found', 'ACCOUNTING_NOT_FOUND');
    if (entry.status !== from) fail(`Entry must be ${from}`, 'ACCOUNTING_INVALID_TRANSITION');
    const user = actor(context);
    if (action === 'maker_approved' && entry.maker_id && String(entry.maker_id) !== String(user)) {
      fail('Only the journal maker can approve the draft', 'ACCOUNTING_MAKER_REQUIRED');
    }
    if (action === 'checker_approved' && entry.maker_id && String(entry.maker_id) === String(user)) {
      fail('Maker and checker must be different users', 'ACCOUNTING_MAKER_CHECKER_SEPARATION');
    }
    const fields = to === WORKFLOW.MAKER_PENDING ? ', submitted_at = CURRENT_TIMESTAMP' :
      to === WORKFLOW.APPROVED ? ', checker_id = $3, approved_at = CURRENT_TIMESTAMP' : '';
    const updated = await client.query(
      `UPDATE journal_entries SET status = $1${fields} WHERE id = $2 RETURNING *`,
      to === WORKFLOW.APPROVED ? [to, id, user] : [to, id],
    );
    await audit(client, id, action, user, context.correlationId, {});
    await client.query('COMMIT');
    return updated.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function post(id, context = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT je.*, COALESCE(SUM(jl.debit),0) debit, COALESCE(SUM(jl.credit),0) credit
       FROM journal_entries je LEFT JOIN journal_lines jl ON jl.journal_entry_id = je.id
       WHERE je.id = $1 GROUP BY je.id FOR UPDATE`, [id],
    );
    const entry = result.rows[0];
    if (!entry) fail('Journal entry not found', 'ACCOUNTING_NOT_FOUND');
    if (entry.status !== WORKFLOW.APPROVED) fail('Entry must be approved before posting', 'ACCOUNTING_INVALID_TRANSITION');
    if (Math.abs(Number(entry.debit) - Number(entry.credit)) > 0.0001) fail('Journal entry is not balanced', 'ACCOUNTING_UNBALANCED');
    // Resolve the period at posting time so a closed/locked period cannot be
    // bypassed by leaving fiscal_period_id blank on the draft.
    await client.query(
      `UPDATE journal_entries je SET fiscal_period_id = fp.id
       FROM fiscal_periods fp JOIN fiscal_years fy ON fy.id = fp.fiscal_year_id
       WHERE je.id = $1 AND je.fiscal_period_id IS NULL
         AND fy.company_id = je.company_id AND je.entry_date BETWEEN fp.start_date AND fp.end_date`,
      [id],
    );
    const updated = await client.query(
      `UPDATE journal_entries SET status = 'posted', posted_at = CURRENT_TIMESTAMP, posted_by = $2
       WHERE id = $1 RETURNING *`, [id, uuidOrNull(actor(context))],
    );
    await audit(client, id, 'posted', actor(context), context.correlationId, {});
    await client.query('COMMIT');
    return updated.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function reverse(id, input = {}, context = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM journal_entries WHERE id = $1 FOR UPDATE', [id]);
    const entry = result.rows[0];
    if (!entry) fail('Journal entry not found', 'ACCOUNTING_NOT_FOUND');
    if (entry.status !== WORKFLOW.POSTED) fail('Only posted entries can be reversed', 'ACCOUNTING_INVALID_TRANSITION');
    const reversal = await client.query(
      `INSERT INTO journal_entries
       (company_id, entry_number, entry_date, fiscal_period_id, journal_type, description,
        currency, exchange_rate, status, maker_id, checker_id, reverses_entry_id, correlation_id)
       VALUES ($1, $2, $3, $4, 'reversal', $5, $6, $7, 'approved', $8, $9, $10, $11)
       RETURNING *`,
      [entry.company_id, input.entryNumber || `REV-${entry.entry_number}`, input.entryDate || entry.entry_date,
        entry.fiscal_period_id, input.description || `Reversal of ${entry.entry_number}`, entry.currency,
        entry.exchange_rate, actor(context), actor(context), entry.id, context.correlationId || null],
    );
    const rev = reversal.rows[0];
    const lines = await client.query('SELECT * FROM journal_lines WHERE journal_entry_id = $1 ORDER BY line_number', [id]);
    for (const line of lines.rows) {
      await client.query(
        `INSERT INTO journal_lines (journal_entry_id,line_number,account_id,debit,credit,base_debit,base_credit,description)
         VALUES ($1,$2,$3,$4,$5,$4,$5,$6)`,
        [rev.id, line.line_number, line.account_id, line.credit, line.debit, `Reversal: ${line.description || ''}`],
      );
    }
    await client.query('UPDATE journal_entries SET status = $1, reversed_by_entry_id = $2 WHERE id = $3', [WORKFLOW.REVERSED, rev.id, id]);
    await audit(client, id, 'reversed', actor(context), context.correlationId, { reversalEntryId: rev.id });
    await client.query('COMMIT');
    return rev;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function trialBalance(filters = {}) {
  const result = await pool.query(
    `SELECT jl.account_id, COALESCE(SUM(jl.debit),0) debit, COALESCE(SUM(jl.credit),0) credit
     FROM journal_lines jl JOIN journal_entries je ON je.id = jl.journal_entry_id
     WHERE je.status IN ('posted','reversed') AND ($1::int IS NULL OR je.company_id = $1)
       AND ($2::date IS NULL OR je.entry_date >= $2) AND ($3::date IS NULL OR je.entry_date <= $3)
     GROUP BY jl.account_id ORDER BY jl.account_id`,
    [filters.companyId || null, filters.startDate || null, filters.endDate || null],
  );
  const totals = result.rows.reduce((a, r) => ({ debit: a.debit + Number(r.debit), credit: a.credit + Number(r.credit) }), { debit: 0, credit: 0 });
  return { accounts: result.rows, totals, balanced: Math.abs(totals.debit - totals.credit) <= 0.0001 };
}

const CLASSIFICATION_RULES = [
  { terms: ['sale', 'revenue', 'invoice'], type: 'revenue', confidence: 0.8 },
  { terms: ['rent', 'utility', 'fuel', 'expense'], type: 'expense', confidence: 0.75 },
  { terms: ['asset', 'equipment', 'machinery'], type: 'asset', confidence: 0.7 },
];

async function suggestClassification(input = {}, context = {}) {
  const text = `${input.description || ''} ${input.reference || ''}`.toLowerCase();
  const rule = CLASSIFICATION_RULES.find((candidate) => candidate.terms.some((term) => text.includes(term)));
  const payload = { accountType: rule?.type || 'review_required', rationale: rule ? 'bounded keyword rule' : 'no safe rule matched' };
  const confidence = rule?.confidence || 0;
  const result = await pool.query(
    `INSERT INTO accounting_ai_suggestions
      (journal_entry_id, suggestion_type, payload, confidence)
     VALUES ($1, 'classification', $2, $3) RETURNING *`,
    [input.journalEntryId || null, payload, confidence],
  );
  return result.rows[0];
}

async function suggestReconciliation(input = {}) {
  if (!input.journalEntryId) fail('journalEntryId is required for reconciliation suggestions');
  const result = await pool.query(
    `SELECT COALESCE(SUM(debit),0) debit, COALESCE(SUM(credit),0) credit
     FROM journal_lines WHERE journal_entry_id = $1`,
    [input.journalEntryId],
  );
  const debit = Number(result.rows[0]?.debit || 0);
  const credit = Number(result.rows[0]?.credit || 0);
  const balanced = Math.abs(debit - credit) <= 0.0001;
  const suggestion = await pool.query(
    `INSERT INTO accounting_ai_suggestions
      (journal_entry_id, suggestion_type, payload, confidence)
     VALUES ($1, 'reconciliation', $2, $3) RETURNING *`,
    [input.journalEntryId, { balanced, debit, credit, action: balanced ? 'no_action' : 'human_review' }, balanced ? 0.85 : 0.8],
  );
  return suggestion.rows[0];
}

async function approveSuggestion(id, context = {}) {
  const result = await pool.query(
    `UPDATE accounting_ai_suggestions
     SET status = 'approved', approved_by = $2, approved_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status = 'pending' RETURNING *`,
    [id, actor(context)],
  );
  if (!result.rows[0]) fail('AI suggestion not found or already decided', 'ACCOUNTING_SUGGESTION_NOT_FOUND');
  return result.rows[0];
}

module.exports = {
  WORKFLOW, createDraft,
  submitForApproval: (id, context) => transition(id, 'submitted', WORKFLOW.DRAFT, WORKFLOW.MAKER_PENDING, context),
  approveMaker: (id, context) => transition(id, 'maker_approved', WORKFLOW.MAKER_PENDING, WORKFLOW.CHECKER_PENDING, context),
  approveChecker: (id, context) => transition(id, 'checker_approved', WORKFLOW.CHECKER_PENDING, WORKFLOW.APPROVED, context),
  post, reverse, trialBalance, suggestClassification, suggestReconciliation, approveSuggestion, validateLines,
};
