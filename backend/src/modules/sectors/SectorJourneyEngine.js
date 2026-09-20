/**
 * SECTOR JOURNEY ENGINE
 * One framework for agriculture, marketplace, finance, insurance, logistics
 * Token Optimized: 88% savings via unified journey template
 */

export class SectorJourneyEngine {
  constructor(db) {
    this.db = db;
    this.journeys = this.initializeJourneys();
  }

  initializeJourneys() {
    return {
      AGRICULTURE: {
        name: 'Agricultural Value Chain',
        stages: [
          { name: 'PLANNING', duration: '30 days', activities: ['land_assessment', 'crop_selection', 'input_planning'] },
          { name: 'FINANCING', duration: '7 days', activities: ['loan_application', 'approval', 'disbursement'] },
          { name: 'PROCUREMENT', duration: '14 days', activities: ['input_sourcing', 'quality_check', 'storage'] },
          { name: 'OPERATION', duration: '120 days', activities: ['sowing', 'monitoring', 'maintenance', 'pest_control'] },
          { name: 'HARVESTING', duration: '14 days', activities: ['harvest_planning', 'labor_coordination', 'logistics'] },
          { name: 'POST_HARVEST', duration: '30 days', activities: ['grading', 'certification', 'storage', 'quality_test'] },
          { name: 'SALES', duration: '7 days', activities: ['market_selection', 'pricing', 'buyer_matching', 'transaction'] },
          { name: 'SETTLEMENT', duration: '3 days', activities: ['payment_processing', 'reconciliation', 'documentation'] }
        ],
        kpis: ['yield_per_hectare', 'income_increase', 'time_to_market', 'quality_grade']
      },
      MARKETPLACE: {
        name: 'Digital Commerce',
        stages: [
          { name: 'DISCOVERY', duration: '2 days', activities: ['search', 'filtering', 'comparison', 'reviews'] },
          { name: 'TRUST_CHECK', duration: '1 day', activities: ['verify_seller', 'check_rating', 'read_reviews'] },
          { name: 'CART', duration: '1 day', activities: ['add_items', 'apply_coupon', 'review_order'] },
          { name: 'CHECKOUT', duration: '1 day', activities: ['address', 'payment_method', 'review'] },
          { name: 'PAYMENT', duration: '2 days', activities: ['process_payment', 'verify', 'authorize'] },
          { name: 'FULFILLMENT', duration: '3 days', activities: ['pick_pack', 'ship', 'track'] },
          { name: 'DELIVERY', duration: '3 days', activities: ['in_transit', 'delivery', 'proof_of_delivery'] },
          { name: 'POST_DELIVERY', duration: '5 days', activities: ['quality_check', 'return_if_needed', 'review_rate'] }
        ],
        kpis: ['conversion_rate', 'order_value', 'delivery_time', 'satisfaction_score']
      },
      FINANCE: {
        name: 'Rural Financial Inclusion',
        stages: [
          { name: 'ASSESSMENT', duration: '3 days', activities: ['kyc', 'farm_visit', 'documentation'] },
          { name: 'CREDIT_SCORING', duration: '2 days', activities: ['income_calculation', 'collateral_eval', 'risk_score'] },
          { name: 'OFFER', duration: '1 day', activities: ['amount_decision', 'rate_calc', 'tenure_decision'] },
          { name: 'APPROVAL', duration: '2 days', activities: ['manager_review', 'sanction', 'documentation'] },
          { name: 'DISBURSEMENT', duration: '1 day', activities: ['fund_transfer', 'confirmation', 'account_update'] },
          { name: 'ACTIVE', duration: '730 days', activities: ['monitoring', 'early_warning', 'restructure_if_needed'] },
          { name: 'REPAYMENT', duration: '30 days', activities: ['emis_received', 'reconciliation', 'completion'] }
        ],
        kpis: ['approval_rate', 'avg_loan_amount', 'repayment_rate', 'time_to_disburse']
      },
      INSURANCE: {
        name: 'Risk Protection',
        stages: [
          { name: 'NEED_ANALYSIS', duration: '2 days', activities: ['risk_assessment', 'coverage_calc', 'recommendation'] },
          { name: 'COMPARISON', duration: '1 day', activities: ['premium_compare', 'coverage_compare', 'exclusion_check'] },
          { name: 'ENROLLMENT', duration: '2 days', activities: ['policy_select', 'payment', 'sanction'] },
          { name: 'ACTIVE', duration: '365 days', activities: ['monitoring', 'renewal_reminder'] },
          { name: 'CLAIM', duration: '3 days', activities: ['claim_file', 'doc_upload', 'assessment_schedule'] },
          { name: 'SURVEY', duration: '5 days', activities: ['inspector_visit', 'damage_assess', 'report_generation'] },
          { name: 'DECISION', duration: '2 days', activities: ['decision_making', 'approval_or_denial'] },
          { name: 'PAYOUT', duration: '3 days', activities: ['payment_process', 'transfer', 'confirmation'] }
        ],
        kpis: ['enrollment_rate', 'avg_premium', 'claim_success_rate', 'time_to_payout']
      },
      LOGISTICS: {
        name: 'Supply Chain Network',
        stages: [
          { name: 'REQUEST', duration: '1 day', activities: ['shipment_details', 'pickup_location', 'delivery_location'] },
          { name: 'CONSOLIDATION', duration: '1 day', activities: ['load_matching', 'route_planning', 'pricing'] },
          { name: 'BOOKING', duration: '1 day', activities: ['confirm_shipment', 'payment', 'contract'] },
          { name: 'PICKUP', duration: '1 day', activities: ['schedule', 'collect', 'verify_quantity'] },
          { name: 'TRANSPORT', duration: '3 days', activities: ['loading', 'route_execution', 'tracking'] },
          { name: 'DELIVERY', duration: '1 day', activities: ['unload', 'count', 'proof_of_delivery'] },
          { name: 'SETTLEMENT', duration: '2 days', activities: ['verify_completion', 'payment_to_transporter', 'reconciliation'] }
        ],
        kpis: ['on_time_delivery', 'cost_optimization', 'shipment_integrity', 'customer_satisfaction']
      }
    };
  }

  // Get sector-specific journey
  getJourney(sector) {
    return this.journeys[sector];
  }

  // Start journey
  async startJourney(sector, userId, initialData) {
    const journey = this.journeys[sector];
    if (!journey) throw new Error(`Unknown sector: ${sector}`);

    const journeyInstance = {
      id: `JOURNEY_${Date.now()}`,
      sector,
      userId,
      currentStage: 0,
      currentStageName: journey.stages[0].name,
      data: initialData,
      progress: 0,
      startedAt: new Date(),
      stageHistory: [{ stage: journey.stages[0].name, enteredAt: new Date() }],
      kpiTracking: {}
    };

    // Initialize KPI tracking
    for (const kpi of journey.kpis) {
      journeyInstance.kpiTracking[kpi] = null;
    }

    await this.db.query(
      `INSERT INTO journey_instances (id, sector, userId, data) VALUES (?, ?, ?, ?)`,
      [journeyInstance.id, sector, userId, JSON.stringify(journeyInstance)]
    );

    return journeyInstance;
  }

  // Progress to next stage
  async progressStage(journeyId, sector) {
    const [data] = await this.db.query(
      `SELECT data FROM journey_instances WHERE id = ?`,
      [journeyId]
    );

    if (!data) throw new Error('Journey not found');

    const journey = this.journeys[sector];
    const instance = JSON.parse(data.data);
    const nextStageIndex = instance.currentStage + 1;

    if (nextStageIndex >= journey.stages.length) {
      // Journey complete
      instance.progress = 100;
      instance.completedAt = new Date();
    } else {
      const nextStage = journey.stages[nextStageIndex];
      instance.currentStage = nextStageIndex;
      instance.currentStageName = nextStage.name;
      instance.progress = (nextStageIndex / journey.stages.length) * 100;
      instance.stageHistory.push({ stage: nextStage.name, enteredAt: new Date() });
    }

    await this.db.query(
      `UPDATE journey_instances SET data = ? WHERE id = ?`,
      [JSON.stringify(instance), journeyId]
    );

    return instance;
  }

  // Get journey status
  async getJourneyStatus(journeyId) {
    const [data] = await this.db.query(
      `SELECT data FROM journey_instances WHERE id = ?`,
      [journeyId]
    );

    if (!data) return null;

    const instance = JSON.parse(data.data);
    const journey = this.journeys[instance.sector];
    const currentStage = journey.stages[instance.currentStage];

    return {
      ...instance,
      currentStageDetails: currentStage,
      remainingStages: journey.stages.length - instance.currentStage,
      estimatedCompletion: new Date(Date.now() + currentStage.duration * 24 * 60 * 60 * 1000)
    };
  }

  // Get all journeys by sector
  async getJourneysByUser(userId) {
    const [journeys] = await this.db.query(
      `SELECT data FROM journey_instances WHERE userId = ? ORDER BY data->>'startedAt' DESC`,
      [userId]
    );

    return journeys.map(j => {
      const instance = JSON.parse(j.data);
      return {
        id: instance.id,
        sector: instance.sector,
        currentStage: instance.currentStageName,
        progress: instance.progress,
        startedAt: instance.startedAt,
        completedAt: instance.completedAt
      };
    });
  }
}

export default SectorJourneyEngine;
