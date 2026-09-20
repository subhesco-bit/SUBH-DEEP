-- Migration: Create Workflow Engine Tables
-- Author: Claude Haiku
-- Date: 2026-09-20

-- Workflow Instances table
CREATE TABLE IF NOT EXISTS workflow_instances (
  id VARCHAR(100) PRIMARY KEY,
  workflowType VARCHAR(100) NOT NULL,
  entityId VARCHAR(100) NOT NULL,
  data JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_instances_workflowType ON workflow_instances(workflowType);
CREATE INDEX idx_workflow_instances_entityId ON workflow_instances(entityId);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);

-- Workflow Transitions table (audit trail)
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id SERIAL PRIMARY KEY,
  workflowId VARCHAR(100) NOT NULL,
  fromState VARCHAR(100),
  toState VARCHAR(100) NOT NULL,
  action VARCHAR(100),
  metadata JSONB,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflowId) REFERENCES workflow_instances(id)
);

CREATE INDEX idx_workflow_transitions_workflowId ON workflow_transitions(workflowId);
CREATE INDEX idx_workflow_transitions_action ON workflow_transitions(action);
CREATE INDEX idx_workflow_transitions_createdAt ON workflow_transitions(createdAt);
