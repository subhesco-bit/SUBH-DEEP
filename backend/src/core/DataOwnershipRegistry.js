/**
 * DATA OWNERSHIP REGISTRY
 * Every entity has owner, retention policy, quality rules
 * Enables complete data lineage and governance
 */

export class DataOwnershipRegistry {
  constructor(db) {
    this.db = db;
    this.ownership = new Map();
    this.initializeOwnership();
  }

  initializeOwnership() {
    // Define ownership for critical entities
    const entities = [
      {
        entity: 'users',
        owner: 'AuthService',
        retention: '7_years', // Legal requirement
        quality: { completeness: 95, accuracy: 100 },
        pii: true,
        columns: ['email', 'phone', 'hashedPassword']
      },
      {
        entity: 'farms',
        owner: 'FarmService',
        retention: 'permanent',
        quality: { completeness: 90, accuracy: 95 },
        pii: false,
        columns: ['location', 'area_hectares', 'crop_types']
      },
      {
        entity: 'transactions',
        owner: 'PaymentService',
        retention: '7_years', // Tax requirement
        quality: { completeness: 100, accuracy: 100 },
        pii: false,
        columns: ['amount', 'date', 'status']
      },
      {
        entity: 'forest_tracts',
        owner: 'FOLUService',
        retention: 'permanent',
        quality: { completeness: 95, accuracy: 90 },
        pii: false,
        columns: ['area_hectares', 'tree_types', 'carbon_stock']
      },
      {
        entity: 'organic_transitions',
        owner: 'OrganicService',
        retention: 'permanent',
        quality: { completeness: 100, accuracy: 98 },
        pii: false,
        columns: ['status', 'compliance_checks', 'certification']
      }
    ];

    for (const entity of entities) {
      this.ownership.set(entity.entity, entity);
    }
  }

  // Register data ownership
  registerEntity(entity, ownerService, config) {
    this.ownership.set(entity, {
      entity,
      owner: ownerService,
      retention: config.retention || 'permanent',
      quality: config.quality || {},
      pii: config.pii || false,
      columns: config.columns || [],
      registeredAt: new Date()
    });
  }

  // Get owner of entity
  getOwner(entity) {
    return this.ownership.get(entity)?.owner || 'UNASSIGNED';
  }

  // Get retention policy
  getRetentionPolicy(entity) {
    const retention = this.ownership.get(entity)?.retention;
    return this.retentionToDate(retention);
  }

  retentionToDate(retention) {
    const now = new Date();
    const map = {
      '30_days': new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      '90_days': new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      '1_year': new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
      '7_years': new Date(now.getTime() + 7 * 365 * 24 * 60 * 60 * 1000),
      'permanent': new Date('2099-12-31')
    };
    return map[retention] || new Date('2099-12-31');
  }

  // Check data quality
  async validateQuality(entity, data) {
    const ownership = this.ownership.get(entity);
    if (!ownership) return { valid: false, error: 'Entity not found' };

    const completeness = this.checkCompleteness(data, ownership);
    const accuracy = await this.checkAccuracy(entity, data);

    const meetsStandard =
      completeness >= ownership.quality.completeness &&
      accuracy >= (ownership.quality.accuracy || 100);

    return {
      valid: meetsStandard,
      completeness,
      accuracy,
      threshold: ownership.quality
    };
  }

  checkCompleteness(data, ownership) {
    if (ownership.columns.length === 0) return 100;
    const filled = ownership.columns.filter(col => data[col] !== undefined && data[col] !== null).length;
    return (filled / ownership.columns.length) * 100;
  }

  async checkAccuracy(entity, data) {
    // Placeholder for accuracy checking logic
    // In production, verify against authoritative sources
    return 95;
  }

  // Check if PII
  isPII(entity) {
    return this.ownership.get(entity)?.pii || false;
  }

  // Get all entities by owner
  getEntitiesByOwner(owner) {
    const entities = [];
    for (const [entity, metadata] of this.ownership) {
      if (metadata.owner === owner) {
        entities.push(entity);
      }
    }
    return entities;
  }

  // Generate data lineage report
  getLineageReport(entity, recordId) {
    return {
      entity,
      recordId,
      owner: this.getOwner(entity),
      retentionUntil: this.getRetentionPolicy(entity),
      isPII: this.isPII(entity),
      qualityThreshold: this.ownership.get(entity)?.quality,
      lineage: [] // To be populated with ETL/audit logs
    };
  }
}

export default DataOwnershipRegistry;
