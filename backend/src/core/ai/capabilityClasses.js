/**
 * AI capability classes — the six kinds of AI this platform uses, and where
 * each one actually plugs in.
 *
 * The platform already had AI parts: an engine registry, provider adapters,
 * guardrails, a cost controller, a confidence engine, an audit logger, an MCDA
 * scorer, a decision engine, a reflex engine and eleven ERP agents. What it did
 * not have was any statement of WHICH KIND of AI serves which application, or
 * any single place where a capability is dispatched under governance.
 *
 * Without that, each part is an island: the fraud model cannot be told apart
 * from a document generator, they are held to the same (or no) authority
 * standard, and nothing can answer "what can this platform actually do, and
 * how far is it trusted to act alone?"
 *
 * This file is that spine. Each class declares:
 *
 *   applications  the business layers it serves
 *   backing       the real modules behind it — a path, or null when absent
 *   consumes      signals it reacts to
 *   emits         signals it produces
 *   autonomy      how far it may act without a person
 *   state         LIVE (running), BUILT (exists, unwired), ABSENT (no code)
 *
 * `state` is measured, not aspirational. A class with no implementation says
 * ABSENT and dispatch() refuses it, rather than pretending and failing later.
 * The contract still exists for absent classes so that adding one is wiring,
 * not redesign.
 *
 * AUTONOMY is the governance axis and matters more than capability here:
 *
 *   observe   may read and report; may not emit signals that trigger action
 *   advise    may emit proposals; a person decides
 *   act       may drive effectors within the authority gate
 *   reflex    may act synchronously inside a timing budget, pre-authorised
 *
 * No class may exceed its declared autonomy. dispatch() enforces this against
 * outcomeResolver's calibration gate, so an agent's track record — not its
 * self-reported confidence — decides how far it is believed.
 */

'use strict';

const { logger } = require('../../utils/logger');

// ---------------------------------------------------------------- classes

const AUTONOMY = Object.freeze({
  OBSERVE: 'observe',
  ADVISE: 'advise',
  ACT: 'act',
  REFLEX: 'reflex',
});

const STATE = Object.freeze({
  LIVE: 'LIVE',
  BUILT: 'BUILT',
  ABSENT: 'ABSENT',
});

/**
 * Resolve a backing module lazily. Several of these pull in database
 * connections and timers; requiring them all at load time would make importing
 * this registry a side effect.
 */
function lazy(path) {
  return () => require(path);
}

const CLASSES = Object.freeze({
  // -----------------------------------------------------------------
  frontier_models: {
    id: 'frontier_models',
    label: 'Frontier AI Models',
    horizon: 'short-term',
    applications: [
      'weather forecasting',
      'education and tutorials',
      'DPR and engineering design',
      'loans and credit assessment',
      'subsidy research and notification',
    ],
    // The real mount paths, taken from the server's route table rather than
    // guessed. Guessed URLs produced a run of false 404s during this work.
    endpoints: [
      '/api/v1/weather', '/api/v1/weather-advisory', '/api/v1/climate-advisory',
      '/api/v1/farmer-training',
      '/api/v1/dpr-generation', '/api/v1/engineering-project',
      '/api/v1/loan-management',
      '/api/v1/government-subsidy', '/api/v1/notifications',
    ],
    rationale:
      'These are the applications where an EXTERNAL engine is not optional. ' +
      'Weather forecasting needs live meteorological data; subsidy and loan ' +
      'work needs current scheme rules and rates; DPR and engineering design ' +
      'needs referenced research. None can be answered from the platform\'s own ' +
      'tables, which is precisely why this class routes through the external ' +
      'provider backbone rather than the internal one. The corpus to ground it ' +
      'already exists: the library service indexes 1,532 items including 830 raw files.',
    // Stated as a requirement, not an aspiration: several of these
    // applications are wrong rather than merely incomplete without it.
    requires: {
      externalResearch:
        'Weather, subsidy rules and engineering references must come from ' +
        'outside the platform. A confidently generated answer from stale ' +
        'internal data is worse than no answer.',
      gpsTracking:
        'Location is not decoration here. A weather advisory, a subsidy ' +
        'entitlement and a field-level DPR are all specific to a place, so ' +
        'output without a verified position is unattributable. Mounted at ' +
        '/api/v1/geofencing and /api/v1/supply-chain-tracking.',
    },
    backing: {
      // The EXTERNAL backbone: the multi-provider call router that reaches
      // Claude, OpenAI, Gemini and Azure. Mounted at /api/aibackbone.
      // This is deliberately a separate service from the internal M400
      // backbone used by the agentic class — see that class's note.
      externalBackbone: lazy('../../services/legacy/aiBackboneService'),
      orchestrator: lazy('../aiOrchestrator'),
      registry: lazy('./aiEngineRegistry'),
      providers: lazy('./aiProviderAdapters'),
      guardrails: lazy('./aiGuardrails'),
      cost: lazy('./aiCostController'),
      dpr: lazy('../../services/commerce/dprGenerationService'),
      subsidy: lazy('../../services/subsidyService'),
      library: lazy('../../modules/M645100_LIBRARYKNOWLEDGE/backend/service'),
    },
    consumes: [],
    emits: [],
    autonomy: AUTONOMY.ADVISE,
    state: STATE.BUILT,
    stateNote:
      'The external provider backbone is live at /api/aibackbone and answers ' +
      'its status endpoint. Claude reports configured: true (model ' +
      'claude-opus-5) but enabled: false; OpenAI and Gemini are neither. So ' +
      'the routing, guardrails, cost control and library corpus are all in ' +
      'place, and no frontier model is actually reachable until a provider is ' +
      'enabled. Generation must also be grounded in the library index before ' +
      'it is trusted: an ungrounded DPR clause is a liability, not a feature.',
    risks: ['bias', 'energy use', 'ungrounded generation'],
  },

  // -----------------------------------------------------------------
  agentic: {
    id: 'agentic',
    label: 'Agentic AI',
    horizon: 'short–medium',
    applications: ['commerce', 'ERP workflows', 'logistics coordination'],
    rationale:
      'The only class currently closing the loop from sensation to action. ' +
      'Signals correlate into decisions, decisions produce actions, effectors ' +
      'execute them, and the outcome is recorded for calibration.',
    backing: {
      signalBus: lazy('../signalBus'),
      decisionEngine: lazy('../decisionEngine'),
      effectors: lazy('../effectors'),
      erpAgents: lazy('../erpAgents'),
      mcda: lazy('../mcda'),
      humanReview: lazy('../humanReviewBridge'),
      outcomes: lazy('../outcomeResolver'),
      // The INTERNAL backbone: cross-module decision, strategy, learning,
      // prediction and coordination engines. Mounted at
      // /api/v1/m400-ai-backbone. Distinct from the external provider router
      // backing frontier_models, by design — the two are interdependent
      // through the shared ai_decisions and ai_strategies tables rather than
      // by calling each other.
      internalBackbone: lazy('../../modules/M400_AI_BACKBONE/backend/service'),
    },
    consumes: ['*'],
    emits: ['platform.decision.made'],
    autonomy: AUTONOMY.ACT,
    state: STATE.LIVE,
    stateNote:
      'Attached to the bus: 6 decision rules, 9 effectors, 11 ERP agents. ' +
      'Decisions marked requiresHuman are filed to ai_proposals. All 55 signal ' +
      'types reach the engine, but only 11 currently produce a concrete action ' +
      '— the remaining gap is rule authorship, which needs domain input.',
    risks: ['governance', 'reliability', 'unranked action lists'],
  },

  // -----------------------------------------------------------------
  security_trust: {
    id: 'security_trust',
    label: 'AI Security & Trust',
    horizon: 'short-term',
    applications: ['finance', 'compliance', 'farmer health data'],
    rationale:
      'The one class that must act faster than a person can be consulted. ' +
      'A fraud freeze is worthless if it waits for approval, so it is the only ' +
      'capability granted reflex autonomy — inside a hard timing budget, on a ' +
      'pre-authorised action, with an attributed release path.',
    backing: {
      reflexEngine: lazy('../reflexEngine'),
      fraud: lazy('../../services/advancedAIService/fraudDetection'),
      guardrails: lazy('./aiGuardrails'),
      audit: lazy('./aiAuditLogger'),
    },
    consumes: ['risk.fraud.suspected', 'risk.credit.assessed', 'quality.test.failed'],
    emits: ['risk.fraud.suspected'],
    autonomy: AUTONOMY.REFLEX,
    state: STATE.LIVE,
    stateNote:
      'Verified end to end: probability 0.97 freezes the actor, 0.42 does not, ' +
      'and releasing a freeze without naming an authoriser is refused. ' +
      'Outstanding: PII boundaries on prompts, and a tamper-evident audit chain ' +
      'over outcomeSink.',
    risks: ['deepfakes', 'misuse', 'false positives freezing real users'],
  },

  // -----------------------------------------------------------------
  artificial_scientists: {
    id: 'artificial_scientists',
    label: 'Artificial Scientists',
    horizon: 'medium-term',
    applications: ['subsidy evidence', 'DPR validation', 'agronomy trials', 'cold-chain MRV'],
    rationale:
      'The cold storage module already specifies the right scientific frame — ' +
      'baseline, impact versus counterfactual, bankability. What is missing is ' +
      'anything that executes it: a hypothesis register, trial design, and an ' +
      'independent validation gate before a finding enters the library.',
    backing: {
      library: lazy('../../modules/M645100_LIBRARYKNOWLEDGE/backend/service'),
      outcomes: lazy('../outcomeResolver'),
      hypothesisRegister: null,
      trialDesign: null,
      validationGate: null,
    },
    consumes: [],
    emits: [],
    autonomy: AUTONOMY.OBSERVE,
    state: STATE.ABSENT,
    stateNote:
      'No implementation. The data exists (NE variety directory, agronomy ' +
      'records) and outcomeResolver already does calibration, which is the ' +
      'same discipline applied to agents rather than to findings. Deliberately ' +
      'held at observe: a finding that enters the library unvalidated is worse ' +
      'than no finding.',
    risks: ['validation', 'ethics', 'unreplicated claims entering the corpus'],
  },

  // -----------------------------------------------------------------
  embodied: {
    id: 'embodied',
    label: 'Humanoid Robots / Embodied AI',
    horizon: 'medium-term',
    applications: ['warehouse handling', 'cold-chain logistics', 'manufacturing'],
    rationale:
      'Nothing robotic exists and nothing should be built yet. What is useful ' +
      'now is that the platform can accept a physical actor later without ' +
      'redesign: a robot is an effector with a safety budget, and the effector ' +
      'contract and iot.* telemetry channel already exist.',
    backing: {
      effectors: lazy('../effectors'),
      telemetry: lazy('../signalBus'),
      actuatorAdapter: null,
      safetyInterlock: null,
    },
    consumes: ['iot.temperature.breach', 'iot.sensor.offline'],
    emits: [],
    autonomy: AUTONOMY.OBSERVE,
    state: STATE.ABSENT,
    stateNote:
      'Deferred deliberately, and it is the least appropriate item to build ' +
      'while the test suite is 93% stubs. Any capability that moves physical ' +
      'mass needs a two-key confirmation and a safety interlock that do not ' +
      'exist. The iot.* channel it would ride is already wired.',
    risks: ['physical safety', 'scaling', 'acting on unvalidated sensor data'],
  },

  // -----------------------------------------------------------------
  quantum_optimisation: {
    id: 'quantum_optimisation',
    label: 'Quantum + AI Optimisation',
    horizon: 'long-term',
    applications: ['cost optimisation', 'order allocation', 'corridor routing', 'finance workflow'],
    rationale:
      'Treat quantum as a solver swap, not an architecture. The value available ' +
      'now is formulating these as explicit objectives and constraints behind a ' +
      'solver interface; a classical solver delivers the saving today and the ' +
      'quantum backend becomes configuration rather than a rewrite.',
    backing: {
      mcda: lazy('../mcda'),
      classicalSolver: null,
      objectiveRegistry: null,
      quantumBackend: null,
    },
    consumes: ['commerce.demand.forecast_updated', 'logistics.shipment.delayed'],
    emits: [],
    autonomy: AUTONOMY.ADVISE,
    state: STATE.ABSENT,
    stateNote:
      'MCDA exists and does multi-criteria scoring, which is ranking, not ' +
      'optimisation — it cannot allocate orders across the 8x50T / 2x100T / ' +
      '2x80T corridor. No objective function, no constraint model, no solver. ' +
      'Quantum itself is explicitly not scheduled.',
    risks: ['hardware limits', 'optimising a mis-stated objective'],
  },
});

// ---------------------------------------------------------------- dispatch

/** Autonomy ordering, so a comparison is meaningful. */
const AUTONOMY_RANK = { observe: 0, advise: 1, act: 2, reflex: 3 };

/**
 * Run a capability under governance.
 *
 * Refuses three things, in this order, because each makes the next meaningless:
 *   1. a class with no implementation
 *   2. a request for more autonomy than the class is granted
 *   3. an actor whose calibration gate does not support the autonomy asked for
 *
 * The gate is read from outcomeResolver, which scores an agent on resolved
 * predictions rather than on what it claims about itself. If the gate cannot be
 * read, this fails CLOSED — an unverifiable record is not a good one.
 */
async function dispatch(classId, task, { actorId, requestedAutonomy = AUTONOMY.ADVISE, payload = {} } = {}) {
  const cls = CLASSES[classId];
  if (!cls) throw new Error(`Unknown AI capability class: ${classId}`);

  if (cls.state === STATE.ABSENT) {
    return {
      ok: false,
      refused: 'not_implemented',
      classId,
      message: `${cls.label} has no implementation. ${cls.stateNote}`,
    };
  }

  if (AUTONOMY_RANK[requestedAutonomy] > AUTONOMY_RANK[cls.autonomy]) {
    return {
      ok: false,
      refused: 'autonomy_exceeded',
      classId,
      granted: cls.autonomy,
      requested: requestedAutonomy,
      message:
        `${cls.label} is granted '${cls.autonomy}' autonomy and cannot be asked to ` +
        `'${requestedAutonomy}'. Raising this is a governance decision, not a parameter.`,
    };
  }

  // Reflex is pre-authorised by design — consulting a gate would defeat the
  // timing budget that makes it a reflex. Everything else is gated.
  let gate = null;
  if (cls.autonomy !== AUTONOMY.REFLEX && actorId) {
    try {
      const { gateFor } = require('../outcomeResolver');
      gate = await gateFor(actorId);
    } catch (err) {
      logger.warn('capabilityClasses: calibration gate unreadable, failing closed', {
        classId, actorId, error: err.message,
      });
      return {
        ok: false,
        refused: 'gate_unreadable',
        classId,
        message:
          `Could not read the calibration gate for ${actorId} (${err.message}). ` +
          'Refusing rather than granting authority the record cannot support.',
      };
    }

    // Which gates may drive an action. 'unproven' must NOT: an agent with
    // fewer than 10 resolved predictions has no record, and outcomeResolver
    // already halves its authority for exactly that reason. Letting it act
    // anyway would make the gate decorative — a new agent would get full
    // effect precisely while nothing is known about it.
    const MAY_ACT = new Set(['trusted', 'discounted', 'underconfident']);

    if (AUTONOMY_RANK[requestedAutonomy] >= AUTONOMY_RANK[AUTONOMY.ACT] && !MAY_ACT.has(gate.gate)) {
      return {
        ok: false,
        refused: `gate_${gate.gate}`,
        classId,
        gate,
        message:
          `${actorId} is gated '${gate.gate}' (${gate.resolved} resolved predictions). ` +
          `${gate.note} It may advise, but must not drive an action until it has a record.`,
      };
    }
  }

  return {
    ok: true,
    classId,
    label: cls.label,
    autonomy: cls.autonomy,
    gate,
    // The caller resolves the backing it needs; this layer governs, it does not
    // reimplement execution.
    backing: cls.backing,
    task,
    payload,
  };
}

// ---------------------------------------------------------------- reporting

/** What the platform can actually do, by class. */
function inventory() {
  return Object.values(CLASSES).map((c) => ({
    id: c.id,
    label: c.label,
    state: c.state,
    autonomy: c.autonomy,
    horizon: c.horizon,
    applications: c.applications,
    backingPresent: Object.entries(c.backing)
      .filter(([, v]) => v !== null).map(([k]) => k),
    backingMissing: Object.entries(c.backing)
      .filter(([, v]) => v === null).map(([k]) => k),
    consumes: c.consumes,
    emits: c.emits,
    stateNote: c.stateNote,
    risks: c.risks,
  }));
}

/**
 * Which declared signals have no listener.
 *
 * A class that declares it consumes a signal, while nothing subscribes it, is
 * an island with a label on it. This is the check that keeps the declarations
 * above honest as the platform changes.
 */
function integrationGaps() {
  const { signalBus } = require('../signalBus');
  const channels = signalBus.eventNames().map(String);
  const hasAll = channels.includes('*');
  const heard = (s) =>
    s === '*' || hasAll || channels.includes(s) || channels.includes(`${s.split('.')[0]}.*`);

  // Subscriptions are installed at startup by decisionEngine.start(),
  // reflexEngine.start() and registerEffectors(). Called before those run, an
  // empty bus makes every declared consumer look like a gap — which is a
  // property of the caller, not of the platform. Say so rather than returning
  // a list that reads as a defect report.
  if (channels.length === 0) {
    return {
      busStarted: false,
      gaps: [],
      note:
        'The signal bus has no listeners yet, so nothing can be judged. Start the ' +
        'decision layer (decisionEngine.start(), reflexEngine.start(), ' +
        'registerEffectors()) before calling this.',
    };
  }

  const gaps = [];
  for (const c of Object.values(CLASSES)) {
    // An absent class cannot be integrated; that is already reported by state.
    if (c.state === STATE.ABSENT) continue;
    for (const s of c.consumes) {
      if (!heard(s)) {
        gaps.push({ classId: c.id, signal: s, issue: 'declared consumer, no listener on the bus' });
      }
    }
  }
  return { busStarted: true, gaps, note: gaps.length ? null : 'Every declared consumer has a listener.' };
}

function summary() {
  const all = Object.values(CLASSES);
  const by = (s) => all.filter((c) => c.state === s).map((c) => c.label);
  return {
    total: all.length,
    live: by(STATE.LIVE),
    built: by(STATE.BUILT),
    absent: by(STATE.ABSENT),
  };
}

module.exports = {
  CLASSES,
  AUTONOMY,
  STATE,
  dispatch,
  inventory,
  integrationGaps,
  summary,
};
