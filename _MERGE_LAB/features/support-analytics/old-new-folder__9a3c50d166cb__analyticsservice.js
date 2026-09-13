'use strict';

/**
 * Pure analytics projection used by the form operations dashboard.
 * Database-backed reports remain in legacy/analyticsService.js.
 */
function buildPipelineInsights(payload = {}) {
  const forms = Array.isArray(payload.forms) ? payload.forms : [];
  const submissions = Array.isArray(payload.submissions) ? payload.submissions : [];
  const activeForms = forms.filter((form) => form && form.status !== 'draft').length;
  const workflowsWithStages = forms.filter(
    (form) => form && form.workflow && Array.isArray(form.workflow.stages) && form.workflow.stages.length > 0
  ).length;

  return {
    totals: {
      forms: forms.length,
      submissions: submissions.length,
      activeForms
    },
    workflow: {
      formsWithStages: workflowsWithStages
    },
    recommendations: activeForms < forms.length
      ? ['Review draft forms before publishing them.']
      : ['Continue monitoring active form submissions.']
  };
}

module.exports = { buildPipelineInsights };
