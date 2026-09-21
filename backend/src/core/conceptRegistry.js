/**
 * Canonical module -> submodule -> feature registry.
 *
 * This registry describes ownership and completion boundaries. Domain
 * services remain responsible for behavior; the registry prevents features
 * from being treated as complete without a named workflow and owner.
 */
'use strict';

const concepts = new Map();

function registerModule(moduleDefinition) {
  if (!moduleDefinition?.id || !moduleDefinition.name ||
      !Array.isArray(moduleDefinition.submodules)) {
    throw Object.assign(new Error('Module id, name, and submodules are required'), {
      code: 'CONCEPT_INVALID_MODULE',
    });
  }

  for (const submodule of moduleDefinition.submodules) {
    if (!submodule.id || !submodule.name || !Array.isArray(submodule.features)) {
      throw Object.assign(new Error(`Invalid submodule in ${moduleDefinition.id}`), {
        code: 'CONCEPT_INVALID_SUBMODULE',
      });
    }
    for (const feature of submodule.features) {
      if (!feature.id || !feature.name || !feature.workflow) {
        throw Object.assign(new Error(`Feature ${feature.id || 'unknown'} requires a workflow`), {
          code: 'CONCEPT_INVALID_FEATURE',
        });
      }
    }
  }

  concepts.set(moduleDefinition.id, JSON.parse(JSON.stringify(moduleDefinition)));
  return getModule(moduleDefinition.id);
}

function getModule(moduleId) {
  const moduleDefinition = concepts.get(moduleId);
  return moduleDefinition ? JSON.parse(JSON.stringify(moduleDefinition)) : null;
}

function listModules() {
  return [...concepts.values()].map((moduleDefinition) => JSON.parse(JSON.stringify(moduleDefinition)));
}

function findFeature(featureId) {
  for (const moduleDefinition of concepts.values()) {
    for (const submodule of moduleDefinition.submodules) {
      const feature = submodule.features.find((candidate) => candidate.id === featureId);
      if (feature) {
        return {
          module: moduleDefinition,
          submodule,
          feature,
        };
      }
    }
  }
  return null;
}

[
  {
    id: 'commerce',
    name: 'Marketplace and Commerce',
    submodules: [{
      id: 'order-to-cash',
      name: 'Order to Cash',
      features: [
        { id: 'commerce.order-placement', name: 'Order placement', workflow: 'order-to-cash' },
        { id: 'commerce.settlement', name: 'Escrow settlement', workflow: 'order-to-cash' },
      ],
    }],
  },
  {
    id: 'rural-economy',
    name: 'Rural Economic Operating System',
    submodules: [{
      id: 'collective-units',
      name: 'Collective Units',
      features: [
        { id: 'rural.fpo-ledger', name: 'FPO ledger', workflow: 'develop-to-fund' },
        { id: 'rural.shared-infrastructure', name: 'Shared infrastructure', workflow: 'procure-to-pay' },
      ],
    }],
  },
  {
    id: 'logistics',
    name: 'Logistics and Cold Chain',
    submodules: [{
      id: 'perishable-flow',
      name: 'Perishable Flow',
      features: [
        { id: 'logistics.dispatch', name: 'Cold-chain dispatch', workflow: 'order-to-cash' },
        { id: 'logistics.temperature-exception', name: 'Temperature exception', workflow: 'insurance-claim' },
      ],
    }],
  },
  {
    id: 'engineering',
    name: 'Engineering and Digital Twin',
    submodules: [{
      id: 'asset-lifecycle',
      name: 'Asset Lifecycle',
      features: [
        { id: 'engineering.asset-maintenance', name: 'Predictive maintenance', workflow: 'asset-lifecycle' },
        { id: 'engineering.digital-twin', name: 'Digital twin telemetry', workflow: 'asset-lifecycle' },
      ],
    }],
  },
  {
    id: 'governance',
    name: 'Governance, Compliance and Audit',
    submodules: [{
      id: 'controls',
      name: 'Controls',
      features: [
        { id: 'governance.scheme-expiry', name: 'Scheme expiry control', workflow: 'compliance-review' },
        { id: 'governance.human-approval', name: 'Human approval gate', workflow: 'compliance-review' },
      ],
    }],
  },
].forEach(registerModule);

module.exports = {
  registerModule,
  getModule,
  listModules,
  findFeature,
};
