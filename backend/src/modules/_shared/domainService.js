const { getPostgreSQL } = require('../../database/connection');

const MAX_PAGE = 1000;
const MAX_LIMIT = 100;
const TRANSITIONS = {
  draft: ['active', 'archived'],
  active: ['completed', 'paused', 'archived'],
  paused: ['active', 'archived'],
  completed: ['archived'],
  archived: [],
};

function normalisePage(page, limit) {
  const p = Number.isInteger(Number(page)) ? Number(page) : 1;
  const l = Number.isInteger(Number(limit)) ? Number(limit) : 20;
  if (p < 1 || p > MAX_PAGE || l < 1 || l > MAX_LIMIT) {
    const error = new Error(`page must be 1-${MAX_PAGE} and limit must be 1-${MAX_LIMIT}`);
    error.statusCode = 400;
    throw error;
  }
  return { page: p, limit: l };
}

function validatePayload(payload, spec, partial = false) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    const error = new Error('A JSON object payload is required');
    error.statusCode = 400;
    throw error;
  }
  const data = { ...payload };
  for (const field of spec.required || []) {
    if (!partial && (data[field] === undefined || data[field] === null || data[field] === '')) {
      const error = new Error(`${field} is required`);
      error.statusCode = 400;
      throw error;
    }
  }
  for (const [field, rule] of Object.entries(spec.fields || {})) {
    if (data[field] === undefined) continue;
    if (rule.type === 'number' && (!Number.isFinite(Number(data[field])) || Number(data[field]) < (rule.min ?? -Infinity))) {
      const error = new Error(`${field} must be a number${rule.min !== undefined ? ` >= ${rule.min}` : ''}`);
      error.statusCode = 400;
      throw error;
    }
    if (rule.type === 'string' && (typeof data[field] !== 'string' || data[field].length > (rule.max || 255))) {
      const error = new Error(`${field} must be a string of at most ${rule.max || 255} characters`);
      error.statusCode = 400;
      throw error;
    }
  }
  if (!data.status) data.status = 'draft';
  if (!TRANSITIONS[data.status]) {
    const error = new Error('status must be draft, active, paused, completed, or archived');
    error.statusCode = 400;
    throw error;
  }
  return data;
}

function authorise(actor, allowedRoles) {
  if (!actor || !allowedRoles.some((role) => actor.role === role || actor.permissions?.includes(role))) {
    const error = new Error('Insufficient permissions for this module');
    error.statusCode = 403;
    throw error;
  }
}

function buildService({ tableName, moduleId, spec }) {
  const db = () => {
    const pg = getPostgreSQL();
    if (!pg) throw new Error('Database not initialized');
    return pg;
  };
  async function audit(pg, action, id, actor, details) {
    try {
      await pg.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, changes, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [actor?.id || null, action, moduleId, id, details || {}, { module: moduleId }],
      );
    } catch (error) {
      // Audit must not make a valid business mutation fail on older installations.
      if (process.env.NODE_ENV !== 'test') console.warn(`Audit unavailable for ${moduleId}: ${error.message}`);
    }
  }
  return {
    async listItems({ page = 1, limit = 20 } = {}) {
      const bounds = normalisePage(page, limit);
      const pg = db();
      const count = await pg.query(`SELECT COUNT(*)::int AS total FROM ${tableName} WHERE COALESCE(data->>'status','draft') <> 'archived'`);
      const total = count.rows[0]?.total || 0;
      const rows = await pg.query(`SELECT * FROM ${tableName} WHERE COALESCE(data->>'status','draft') <> 'archived' ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [bounds.limit, (bounds.page - 1) * bounds.limit]);
      return { items: rows.rows, pagination: { ...bounds, total, totalPages: Math.ceil(total / bounds.limit) } };
    },
    async getItem(id) {
      const pg = db();
      const result = await pg.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      return result.rows[0] || null;
    },
    async createItem(payload, actor) {
      authorise(actor, spec.writeRoles);
      const data = validatePayload(payload, spec);
      const pg = db();
      const result = await pg.query(`INSERT INTO ${tableName} (data, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING *`, [data]);
      await audit(pg, 'create', result.rows[0].id, actor, { data });
      return result.rows[0];
    },
    async updateItem(id, payload, actor) {
      authorise(actor, spec.writeRoles);
      const current = await this.getItem(id);
      if (!current) return null;
      const data = validatePayload({ ...(current.data || {}), ...payload }, spec, true);
      const pg = db();
      const result = await pg.query(`UPDATE ${tableName} SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [data, id]);
      await audit(pg, 'update', id, actor, { data });
      return result.rows[0] || null;
    },
    async deleteItem(id, actor) {
      authorise(actor, spec.writeRoles);
      const pg = db();
      const result = await pg.query(`UPDATE ${tableName} SET data = data || '{"status":"archived"}'::jsonb, updated_at = NOW() WHERE id = $1 RETURNING id`, [id]);
      if (result.rows[0]) await audit(pg, 'archive', id, actor, { status: 'archived' });
      return Boolean(result.rows[0]);
    },
    async transitionItem(id, status, actor) {
      authorise(actor, spec.writeRoles);
      if (!TRANSITIONS[status]) throw Object.assign(new Error('Invalid status'), { statusCode: 400 });
      const current = await this.getItem(id);
      if (!current) return null;
      const from = current.data?.status || 'draft';
      if (!TRANSITIONS[from].includes(status)) throw Object.assign(new Error(`Cannot transition ${from} to ${status}`), { statusCode: 409 });
      const pg = db();
      const result = await pg.query(`UPDATE ${tableName} SET data = jsonb_set(COALESCE(data,'{}'::jsonb), '{status}', to_jsonb($1::text)), updated_at = NOW() WHERE id = $2 RETURNING *`, [status, id]);
      await audit(pg, 'transition', id, actor, { from, to: status });
      return result.rows[0];
    },
    async summary() {
      const pg = db();
      const result = await pg.query(`SELECT COALESCE(data->>'status','draft') AS status, COUNT(*)::int AS count FROM ${tableName} GROUP BY 1 ORDER BY 1`);
      return { module: moduleId, counts: result.rows, algorithm: spec.algorithm };
    },
  };
}

module.exports = { buildService, validatePayload, normalisePage, TRANSITIONS };
