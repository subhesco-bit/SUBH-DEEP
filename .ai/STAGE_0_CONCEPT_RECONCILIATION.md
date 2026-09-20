# STAGE 0: CONCEPT RECONCILIATION
**Objective:** Understand and preserve everything. Every concept has source, meaning and classification.

## 🎯 CRITICAL GAPS IDENTIFIED (14 Total)

### 1. No Single Source of Truth (CSR)
**Current State:** Names scattered across code, docs, services
**Required:** Canonical registry connecting concept → implementation
**Status:** ❌ MISSING
**Action:**
```javascript
// Create: backend/src/core/ConceptRegistry.js
class ConceptRegistry {
  registry = {
    FOLU: { status: 'missing', components: [], apis: [], requires: 'forest_tracking' },
    OrganicTracking: { status: 'missing', components: [], apis: [], requires: 'certification' },
    // ... 50+ concepts mapped
  };
  
  getStatus(concept) { return this.registry[concept]; }
  addComponent(concept, file, type) { /* update mapping */ }
  validate() { /* verify coherence */ }
}
```

### 2. Authentication Below Baseline
**Current State:** In-memory + plaintext passwords + fabricated tokens
**Required:** One coherent production identity system
**Status:** ❌ BROKEN
**Action:**
- Unify `authRoutes.js` + `middleware/auth.js`
- Real JWT with short-lived access + refresh tokens
- MFA mandatory
- Create `backend/src/services/AuthenticationUnified.js`

### 3. Industry-Specific Journeys Incomplete
**Current State:** Generic CRUD endpoints, no workflow state machines
**Required:** 10 complete journey engines (agriculture, insurance, marketplace, travel, finance, logistics, government, engineering, enterprise, health)
**Status:** ❌ FRAGMENTED
**Action:** Create journey template → instantiate per industry

### 4. No Governed Adaptive Webpage Engine
**Current State:** Basic role/session rules
**Required:** Consent-aware preference engine adapting by location, language, device, season, intent, accessibility
**Status:** ❌ MISSING
**Action:** Build `PersonalizationEngine` + `ConsentLedger`

### 5. AI Largely Fragmented
**Current State:** Many AI-named services, no model registry, no governance
**Required:** Model router, knowledge graph, agent permissions, evidence records, confidence scores
**Status:** ❌ MISSING
**Action:** Create `AIGovernanceLayer.js`

### 6. Business Workflows Not State-Driven
**Current State:** Isolated CRUD calls
**Required:** Formal state machines for booking, ordering, payment, refund, procurement, claims, loans, subsidies, contracts, reconciliation
**Status:** ❌ BROKEN
**Action:** Create `WorkflowEngine.js` + 20+ state machines

### 7. ERP Not Unified
**Current State:** Many functional services, no accounting backbone
**Required:** General ledger, subledgers, double-entry posting, tax, inventory valuation, reconciliation
**Status:** ❌ MISSING
**Action:** Create `ERPControlLayer.js` with chart of accounts

### 8. India-First Intelligence Incomplete
**Current State:** Generic geography, no scheme versioning, incomplete logistics
**Required:** Agro-climatic context, multilingual vocabulary, mandi intelligence, government rules as executable versioned objects
**Status:** ⚠️ PARTIAL
**Action:** Create `IndiaRuralIntelligence.js`

### 9. Digital Super-Organism Conceptual Only
**Current State:** Names in docs, not executable
**Required:** Sensory system, nervous system, memory, brain, reflex, immune, circulation, conscious control
**Status:** ❌ MISSING
**Action:** Map each biological concept to services, events, workflows

### 10. Real Data & Analytics Insufficient
**Current State:** Simulated/random values
**Required:** Canonical business events, metric definitions, source lineage, quality checks
**Status:** ❌ MISSING
**Action:** Create `EventStore.js` + `MetricsDefinition.js`

### 11. Trust & Reputation Incomplete
**Current State:** No reputation system
**Required:** Verified identity levels, credential provenance, transaction-based scoring, dispute-adjusted
**Status:** ❌ MISSING
**Action:** Create `TrustGraphService.js`

### 12. Rural-First Access Not Complete
**Current State:** Concepts only
**Required:** Offline transaction queue, conflict resolution, SMS/IVR state, shared-device privacy
**Status:** ❌ MISSING
**Action:** Create `RuralAccessLayer.js`

### 13. Engineering Infrastructure Incomplete
**Current State:** Names only, no calculation chain
**Required:** Standards library, units, BIM/CAD ingestion, BOQ, simulations, professional approval
**Status:** ❌ MISSING
**Action:** Create `EngineeringCalculationEngine.js`

### 14. Production Verification Missing
**Current State:** Syntax tests, no runtime proof
**Required:** Database migrations executed, real API calls, authentication working, E2E tests passing, monitoring
**Status:** ❌ MISSING
**Action:** Create `ProductionVerificationMatrix.js`

---

## 📊 CLASSIFICATION MATRIX

Every item must be classified as ONE of:

| Classification | Meaning | Action |
|---|---|---|
| **Verified Working** | Runs in production, tested, integrated | Document & preserve |
| **Partially Working** | Implemented but incomplete | Complete incrementally |
| **Scaffolded** | Structure exists, empty bodies | Implement logic |
| **Documented Only** | Design written, no code | Code from design |
| **Disconnected** | Exists but not integrated | Wire into workflows |
| **Duplicated Distinct** | Two versions, different logic | Merge or explain |
| **Overlapping** | Two versions, similar logic | Consolidate |
| **Conflicting** | Two versions, contradictory | Reconcile |
| **Blocked by Dependency** | Needs external work | Unblock dependency |
| **Proposed Future** | Conceptual, intentionally unimplemented | Plan Phase/Stage |

---

## 🗺️ CLASSIFICATION SCANNER (Token-Optimized)

**Create: backend/src/core/ClassificationScanner.js**

```javascript
export class ClassificationScanner {
  async scanProject() {
    const classifications = {};
    
    // Pattern 1: Service exists → check for database schema
    for (const service of await this.getAllServices()) {
      const hasDatabase = await this.checkSchema(service);
      const hasRoutes = await this.checkRoutes(service);
      const hasTests = await this.checkTests(service);
      const isIntegrated = await this.checkIntegration(service);
      
      classifications[service] = this.classify({
        hasDatabase, hasRoutes, hasTests, isIntegrated
      });
    }
    
    // Pattern 2: Frontend page exists → check for backend connection
    for (const page of await this.getAllPages()) {
      const backendService = await this.findBackend(page);
      classifications[page] = backendService 
        ? 'Connected' 
        : 'Disconnected';
    }
    
    // Pattern 3: API route exists → check if called by frontend
    for (const route of await this.getAllRoutes()) {
      const callers = await this.findCallers(route);
      classifications[route] = callers.length > 0 
        ? 'Verified' 
        : 'Potentially Orphaned';
    }
    
    return classifications;
  }
  
  classify(evidence) {
    const { hasDatabase, hasRoutes, hasTests, isIntegrated } = evidence;
    if (hasDatabase && hasRoutes && hasTests && isIntegrated) return 'Verified Working';
    if (hasDatabase && hasRoutes && isIntegrated) return 'Partially Working';
    if (hasRoutes && !hasDatabase) return 'Scaffolded';
    if (!hasRoutes) return 'Documented Only';
    if (!isIntegrated) return 'Disconnected';
    return 'Unknown';
  }
}
```

---

## 🔗 CONCEPT MAPPING (First Pass - Critical Concepts Only)

| Concept | Files | Services | Routes | Database | Tests | Status |
|---------|-------|----------|--------|----------|-------|--------|
| **FOLU** (Forest, Organic Land) | ❌ | ❌ | ❌ | ❌ | ❌ | MISSING |
| **Organic Tracking** | ❌ | ❌ | ❌ | ❌ | ❌ | MISSING |
| **Unified Auth** | ⚠️ | ⚠️ | ⚠️ | ❌ | ❌ | BROKEN |
| **State Machines** | ❌ | ⚠️ | ✅ | ❌ | ❌ | DISCONNECTED |
| **ERP Posting** | ❌ | ⚠️ | ✅ | ❌ | ❌ | SCAFFOLDED |
| **AI Governance** | ❌ | ✅ | ⚠️ | ❌ | ❌ | FRAGMENTED |
| **Rural Access** | ❌ | ⚠️ | ❌ | ❌ | ❌ | MISSING |
| **Trust Graph** | ❌ | ❌ | ❌ | ❌ | ❌ | MISSING |

---

## 🚀 STAGE 0 TODO (Concept Reconciliation)

- [ ] **T0.1** Create ConceptRegistry.js (map 50+ concepts)
- [ ] **T0.2** Run ClassificationScanner (classify all code)
- [ ] **T0.3** Create CONCEPT_LINEAGE.md (every concept → files)
- [ ] **T0.4** Identify 10+ conflicts to reconcile
- [ ] **T0.5** Map all 760+ services to concepts
- [ ] **T0.6** Generate MASTER_CONCEPT_INVENTORY.md
- [ ] **T0.7** Commit Stage 0 complete

**Timeline:** 4 hours (parallel scanning, batch classification)
**Tokens:** 95% optimized (template-based scanning)

---

## 📋 REMAINING STAGES (Preview)

- **Stage 1:** Industry Baseline (auth, data, APIs, workflows, security, testing)
- **Stage 2:** Sector Excellence (agriculture, marketplace, finance, insurance, logistics, government)
- **Stage 3:** Intelligent Assistance (AI to each component)
- **Stage 4:** System Intelligence (AI coordination across workflows)
- **Stage 5:** Autonomous Ecosystem (bounded automation)
- **Stage 6:** Futuristic Platform (digital twins, adaptation, learning)

