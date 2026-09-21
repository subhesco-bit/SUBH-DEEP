'use strict';

const crypto = require('node:crypto');

class ExternalIntegrationAdapter {
  constructor() {
    this.adapters = new Map();
  }

  register(name, { baseUrl, tokenEnv, allowedOperations = [] }) {
    if (!name || !baseUrl || !tokenEnv || !Array.isArray(allowedOperations)) {
      throw Object.assign(new Error('name, baseUrl, tokenEnv, and allowedOperations are required'), {
        code: 'INTEGRATION_INVALID_DEFINITION',
      });
    }
    let parsedUrl;
    try {
      parsedUrl = new URL(baseUrl);
    } catch {
      throw Object.assign(new Error('baseUrl must be a valid HTTP(S) URL'), {
        code: 'INTEGRATION_INVALID_DEFINITION',
      });
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)
      || allowedOperations.some((operation) => typeof operation !== 'string' || !operation.trim())) {
      throw Object.assign(new Error('baseUrl must use HTTP(S) and operations must be non-empty strings'), {
        code: 'INTEGRATION_INVALID_DEFINITION',
      });
    }
    this.adapters.set(name, {
      baseUrl: parsedUrl.toString().replace(/\/$/, ''),
      tokenEnv,
      allowedOperations: new Set(allowedOperations),
    });
    return this;
  }

  status(name) {
    const adapter = this.adapters.get(name);
    if (!adapter) return { name, status: 'not_registered' };
    return {
      name,
      status: process.env[adapter.tokenEnv] ? 'configured' : 'not_configured',
      operations: [...adapter.allowedOperations],
    };
  }

  async call(name, operation, {
    method = 'POST', body = {}, headers = {}, timeoutMs = 10000,
  } = {}) {
    const adapter = this.adapters.get(name);
    if (!adapter) {
      throw Object.assign(new Error('Integration not registered: ' + name), {
        code: 'INTEGRATION_NOT_REGISTERED',
      });
    }
    if (!adapter.allowedOperations.has(operation)) {
      throw Object.assign(new Error('Operation is not allowed: ' + operation), {
        code: 'INTEGRATION_OPERATION_NOT_ALLOWED',
      });
    }
    const token = process.env[adapter.tokenEnv];
    if (!token) {
      throw Object.assign(new Error('Integration credentials are not configured: ' + name), {
        code: 'INTEGRATION_NOT_CONFIGURED',
      });
    }
    const normalizedMethod = String(method).toUpperCase();
    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(normalizedMethod)
      || !headers || typeof headers !== 'object'
      || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw Object.assign(new Error('Invalid integration request options'), {
        code: 'INTEGRATION_INVALID_REQUEST',
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(adapter.baseUrl + '/' + encodeURIComponent(operation), {
        method: normalizedMethod,
        headers: {
          ...headers,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Request-Signature': crypto.createHash('sha256')
            .update(JSON.stringify(body))
            .digest('hex'),
        },
        body: normalizedMethod === 'GET' ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }
      if (!response.ok) {
        throw Object.assign(new Error('External integration failed with HTTP ' + response.status), {
          code: 'INTEGRATION_HTTP_ERROR',
          status: response.status,
          data,
        });
      }
      return { status: response.status, data };
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw Object.assign(new Error('External integration timed out: ' + name), {
          code: 'INTEGRATION_TIMEOUT',
        });
      }
      if (error?.code?.startsWith('INTEGRATION_')) throw error;
      throw Object.assign(new Error('External integration request failed: ' + name), {
        code: 'INTEGRATION_REQUEST_FAILED',
        cause: error,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = new ExternalIntegrationAdapter();
