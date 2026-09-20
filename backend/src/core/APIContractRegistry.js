/**
 * API CONTRACT REGISTRY
 * One versioned standard for all 500+ endpoints
 * Ensures consistent request/response format
 */

export class APIContractRegistry {
  constructor() {
    this.version = 'v1.0.0';
    this.contracts = new Map();
    this.initializeStandardContract();
  }

  // Standard response contract (all endpoints follow this)
  initializeStandardContract() {
    this.standardResponse = {
      success: 'boolean', // true on success, false on error
      data: 'object or array', // Actual payload
      error: 'string', // Error message if failed
      metadata: {
        version: 'string', // API version
        timestamp: 'ISO8601', // When response was generated
        requestId: 'string', // For tracing
        pagination: {
          page: 'number',
          pageSize: 'number',
          total: 'number',
          hasMore: 'boolean'
        }
      },
      debug: 'object' // Only in dev mode
    };

    this.standardError = {
      success: false,
      error: 'string',
      errorCode: 'string', // Standardized error code
      errorDetails: 'object',
      metadata: {
        version: this.version,
        timestamp: 'ISO8601',
        requestId: 'string'
      }
    };
  }

  // Register endpoint contract
  registerContract(endpoint, contract) {
    if (!contract.method || !contract.path) {
      throw new Error('Contract must include method and path');
    }

    const id = `${contract.method} ${contract.path}`;

    this.contracts.set(id, {
      method: contract.method,
      path: contract.path,
      version: contract.version || 'v1',
      description: contract.description,
      authentication: contract.authentication || 'required',
      requestBody: contract.requestBody || {},
      responseBody: contract.responseBody || {},
      errorCodes: contract.errorCodes || [],
      rateLimit: contract.rateLimit || '100/hour',
      timeout: contract.timeout || 30000, // milliseconds
      tags: contract.tags || [],
      deprecated: contract.deprecated || false,
      registeredAt: new Date()
    });
  }

  // Get contract for endpoint
  getContract(method, path) {
    const id = `${method} ${path}`;
    return this.contracts.get(id);
  }

  // Validate request against contract
  validateRequest(method, path, body) {
    const contract = this.getContract(method, path);
    if (!contract) {
      return { valid: false, error: 'Contract not found for endpoint' };
    }

    // Validate request body
    const validation = this.validateObject(body, contract.requestBody);
    return validation;
  }

  // Validate response against contract
  validateResponse(method, path, response) {
    const contract = this.getContract(method, path);
    if (!contract) {
      return { valid: false, error: 'Contract not found for endpoint' };
    }

    // Validate response body
    const validation = this.validateObject(response, contract.responseBody);
    return validation;
  }

  validateObject(obj, schema) {
    const errors = [];

    for (const [key, type] of Object.entries(schema)) {
      if (obj[key] === undefined && schema[key].required !== false) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      if (obj[key] !== undefined && !this.typeMatches(obj[key], type)) {
        errors.push(`Field ${key} has wrong type. Expected ${type}, got ${typeof obj[key]}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  typeMatches(value, type) {
    if (type === 'string') return typeof value === 'string';
    if (type === 'number') return typeof value === 'number';
    if (type === 'boolean') return typeof value === 'boolean';
    if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
    if (type === 'array') return Array.isArray(value);
    return true;
  }

  // Format standard response
  formatResponse(data, metadata = {}) {
    return {
      success: true,
      data,
      metadata: {
        version: this.version,
        timestamp: new Date().toISOString(),
        requestId: metadata.requestId || this.generateRequestId(),
        ...metadata
      }
    };
  }

  // Format standard error
  formatError(errorCode, message, details = {}) {
    const errorMap = {
      VALIDATION_ERROR: 400,
      AUTHENTICATION_FAILED: 401,
      AUTHORIZATION_FAILED: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      RATE_LIMIT: 429,
      INTERNAL_SERVER_ERROR: 500
    };

    return {
      success: false,
      error: message,
      errorCode,
      errorDetails: details,
      metadata: {
        version: this.version,
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      },
      httpStatus: errorMap[errorCode] || 400
    };
  }

  generateRequestId() {
    return `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get API documentation
  getDocumentation(method, path) {
    const contract = this.getContract(method, path);
    if (!contract) return null;

    return {
      summary: contract.description,
      method: contract.method,
      path: contract.path,
      authentication: contract.authentication,
      requestBody: contract.requestBody,
      responseBody: contract.responseBody,
      errorCodes: contract.errorCodes,
      rateLimit: contract.rateLimit,
      timeout: contract.timeout,
      tags: contract.tags,
      deprecated: contract.deprecated,
      example: {
        request: this.generateExample(contract.requestBody),
        response: this.generateExample(contract.responseBody)
      }
    };
  }

  generateExample(schema) {
    const example = {};
    for (const [key, type] of Object.entries(schema)) {
      if (type === 'string') example[key] = 'example_string';
      else if (type === 'number') example[key] = 0;
      else if (type === 'boolean') example[key] = true;
      else if (type === 'object') example[key] = {};
      else if (type === 'array') example[key] = [];
    }
    return example;
  }

  // Get all contracts
  getAllContracts() {
    return Array.from(this.contracts.values());
  }

  // Generate OpenAPI/Swagger spec
  generateOpenAPISpec() {
    const paths = {};

    for (const contract of this.contracts.values()) {
      if (!paths[contract.path]) {
        paths[contract.path] = {};
      }

      paths[contract.path][contract.method.toLowerCase()] = {
        summary: contract.description,
        tags: contract.tags,
        parameters: [],
        requestBody: {
          content: {
            'application/json': {
              schema: contract.requestBody
            }
          }
        },
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: contract.responseBody
              }
            }
          },
          ...contract.errorCodes.reduce((acc, code) => {
            acc[code] = { description: `Error: ${code}` };
            return acc;
          }, {})
        }
      };
    }

    return {
      openapi: '3.0.0',
      info: {
        title: 'EBDESIGN Agricultural Platform API',
        version: this.version,
        description: 'Unified API for agricultural digital operating system'
      },
      paths
    };
  }
}

export default APIContractRegistry;
