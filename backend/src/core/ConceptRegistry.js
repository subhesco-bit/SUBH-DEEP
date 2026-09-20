/**
 * CONCEPT REGISTRY — Master registry of all platform concepts
 * Connects: Concept → Files → Services → APIs → Database → Tests → Status
 * Token Optimized: Single registry drives all reconciliation
 */

export class ConceptRegistry {
  constructor(database) {
    this.db = database;
    this.registry = new Map();
    this.initializeCriticalConcepts();
  }

  initializeCriticalConcepts() {
    // Tier 0: Critical Gaps (Missing)
    this.registerConcept('FOLU', {
      name: 'Forest & Organic Land Use',
      status: 'MISSING',
      criticality: 'P0_CRITICAL',
      layer: 'environmental',
      blockedBy: [],
      blocks: ['organic-certification', 'carbon-accounting'],
      files: [],
      services: [],
      routes: [],
      tables: [],
      tests: [],
      description: 'Forest tract management + organic land certification + agroforestry planning'
    });

    this.registerConcept('organic-tracking', {
      name: 'Organic Certification & Tracking',
      status: 'MISSING',
      criticality: 'P0_CRITICAL',
      layer: 'agricultural',
      blockedBy: ['FOLU', 'lab-system'],
      blocks: ['premium-pricing', 'quality-assurance'],
      files: [],
      services: [],
      routes: [],
      tables: [],
      tests: [],
      description: '3-year transition plan + compliance verification + certification issuance'
    });

    this.registerConcept('unified-auth', {
      name: 'Unified Authentication',
      status: 'BROKEN',
      criticality: 'P0_CRITICAL',
      layer: 'security',
      blockedBy: [],
      blocks: ['all'],
      files: ['authRoutes.js', 'middleware/auth.js'],
      services: ['AuthService', 'IdentityService'],
      routes: ['/auth/login', '/auth/register', '/auth/logout'],
      tables: ['users', 'sessions', 'tokens'],
      tests: [],
      description: 'One identity authority with MFA, JWT, OAuth2 integration'
    });

    this.registerConcept('epp-posting', {
      name: 'ERP Financial Posting',
      status: 'SCAFFOLDED',
      criticality: 'P1_HIGH',
      layer: 'finance',
      blockedBy: ['unified-auth', 'data-ownership'],
      blocks: ['tax-compliance', 'reconciliation'],
      files: [],
      services: ['ERPService'],
      routes: [],
      tables: ['general_ledger', 'subledgers', 'tax_ledger'],
      tests: [],
      description: 'Double-entry posting, subledgers, tax determination, inventory valuation'
    });

    this.registerConcept('ai-governance', {
      name: 'AI Model Governance',
      status: 'FRAGMENTED',
      criticality: 'P1_HIGH',
      layer: 'ai',
      blockedBy: [],
      blocks: ['intelligent-recommendation', 'autonomous-agents'],
      files: [],
      services: ['AIGateway', 'ModelRegistry', 'PromptRegistry'],
      routes: ['/api/ai/infer', '/api/ai/models'],
      tables: ['models', 'prompts', 'agents', 'ai_events'],
      tests: [],
      description: 'Model registry, prompt versioning, confidence scoring, evidence tracking'
    });

    this.registerConcept('rural-access', {
      name: 'Rural-First Accessibility',
      status: 'MISSING',
      criticality: 'P1_HIGH',
      layer: 'accessibility',
      blockedBy: ['unified-auth'],
      blocks: [],
      files: [],
      services: ['OfflineQueue', 'IVRAdapter', 'SMSAdapter', 'VoiceService'],
      routes: [],
      tables: ['offline_queue', 'sms_messages', 'voice_calls'],
      tests: [],
      description: 'Offline-first PWA, IVR/SMS interaction, assisted mode, vernacular support'
    });

    this.registerConcept('trust-graph', {
      name: 'Trust & Reputation Graph',
      status: 'MISSING',
      criticality: 'P1_HIGH',
      layer: 'commerce',
      blockedBy: ['unified-auth'],
      blocks: ['marketplace', 'lending'],
      files: [],
      services: ['TrustGraphService', 'ReputationEngine'],
      routes: ['/api/trust/score', '/api/trust/verify'],
      tables: ['trust_scores', 'reputation_events', 'disputes'],
      tests: [],
      description: 'Verified identity, transaction-based scoring, dispute-adjusted, fraud signals'
    });

    this.registerConcept('workflow-engine', {
      name: 'Business Workflow Orchestration',
      status: 'PARTIAL',
      criticality: 'P1_HIGH',
      layer: 'orchestration',
      blockedBy: ['unified-auth', 'data-ownership'],
      blocks: ['marketplace', 'lending', 'insurance'],
      files: [],
      services: ['WorkflowEngine', 'StateManager', 'WorkflowRetry'],
      routes: ['/api/workflows/start', '/api/workflows/transition'],
      tables: ['workflows', 'workflow_states', 'workflow_history'],
      tests: [],
      description: 'State machines for 20+ workflows (booking, orders, claims, loans, etc.)'
    });

    this.registerConcept('engineering-calc', {
      name: 'Engineering Calculation Engine',
      status: 'MISSING',
      criticality: 'P2_MEDIUM',
      layer: 'engineering',
      blockedBy: [],
      blocks: ['cold-storage', 'renewable-energy'],
      files: [],
      services: ['EngineeringCalcEngine', 'StandardsLibrary'],
      routes: [],
      tables: ['engineering_calcs', 'standards', 'designs'],
      tests: [],
      description: 'Standards library, units, assumptions, BIM ingestion, BOQ, simulations'
    });

    this.registerConcept('data-ownership', {
      name: 'Data Ownership & Lineage',
      status: 'MISSING',
      criticality: 'P1_HIGH',
      layer: 'data',
      blockedBy: [],
      blocks: ['all-analytics', 'governance'],
      files: [],
      services: ['DataOwnershipRegistry', 'DataLineage'],
      routes: ['/api/data/lineage'],
      tables: ['data_ownership', 'data_lineage', 'data_quality'],
      tests: [],
      description: 'Every entity has owner, retention, quality rules + lineage tracking'
    });
  }

  registerConcept(id, config) {
    this.registry.set(id, {
      id,
      createdAt: new Date(),
      ...config
    });
  }

  // Get concept status
  getStatus(conceptId) {
    return this.registry.get(conceptId)?.status || 'UNKNOWN';
  }

  // Get all concepts by status
  getByStatus(status) {
    return Array.from(this.registry.values()).filter(c => c.status === status);
  }

  // Get critical path (what must be done first)
  getCriticalPath() {
    const critical = Array.from(this.registry.values())
      .filter(c => c.criticality.startsWith('P0'));

    // Topological sort by dependencies
    return this.topologicalSort(critical);
  }

  // Detect conflicts/duplicates
  detectConflicts() {
    const conflicts = [];
    const serviceMap = new Map();

    for (const concept of this.registry.values()) {
      for (const service of concept.services) {
        if (serviceMap.has(service)) {
          conflicts.push({
            type: 'DUPLICATE_SERVICE',
            service,
            concepts: [serviceMap.get(service), concept.id]
          });
        } else {
          serviceMap.set(service, concept.id);
        }
      }
    }

    return conflicts;
  }

  // Map all blockers
  getBlockers(conceptId) {
    const concept = this.registry.get(conceptId);
    if (!concept) return [];

    return concept.blockedBy.map(blockerId => {
      const blocker = this.registry.get(blockerId);
      return {
        id: blockerId,
        status: blocker?.status,
        criticality: blocker?.criticality
      };
    });
  }

  topologicalSort(concepts) {
    // Simple topological sort by blockedBy
    const sorted = [];
    const visited = new Set();

    const visit = (concept) => {
      if (visited.has(concept.id)) return;
      visited.add(concept.id);

      for (const blockerId of concept.blockedBy) {
        const blocker = this.registry.get(blockerId);
        if (blocker) visit(blocker);
      }

      sorted.push(concept);
    };

    for (const concept of concepts) {
      visit(concept);
    }

    return sorted;
  }

  // Export registry as JSON
  async exportInventory() {
    return {
      timestamp: new Date(),
      totalConcepts: this.registry.size,
      byStatus: this.groupByStatus(),
      byCriticality: this.groupByCriticality(),
      concepts: Array.from(this.registry.values())
    };
  }

  groupByStatus() {
    const groups = {};
    for (const concept of this.registry.values()) {
      groups[concept.status] = (groups[concept.status] || 0) + 1;
    }
    return groups;
  }

  groupByCriticality() {
    const groups = {};
    for (const concept of this.registry.values()) {
      groups[concept.criticality] = (groups[concept.criticality] || 0) + 1;
    }
    return groups;
  }
}

export default ConceptRegistry;
