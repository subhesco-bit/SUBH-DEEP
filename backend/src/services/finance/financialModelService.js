'use strict';

function finiteNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw Object.assign(new Error(`${field} must be a finite number`), {
      code: 'FINANCE_INVALID_INPUT',
    });
  }
  return number;
}

function calculateDscr({ operatingCashFlow, annualDebtService }) {
  const cashFlow = finiteNumber(operatingCashFlow, 'operatingCashFlow');
  const debtService = finiteNumber(annualDebtService, 'annualDebtService');
  if (debtService <= 0) {
    throw Object.assign(new Error('annualDebtService must be greater than zero'), {
      code: 'FINANCE_INVALID_DEBT_SERVICE',
    });
  }
  const dscr = cashFlow / debtService;
  return {
    dscr: Number(dscr.toFixed(4)),
    verdict: dscr >= 1.5 ? 'strong' : dscr >= 1.2 ? 'acceptable' : 'weak',
    sourceTags: ['src-input'],
    explanation: 'DSCR equals operating cash flow divided by annual debt service.',
  };
}

function calculateNpv({ discountRate, cashFlows }) {
  const rate = finiteNumber(discountRate, 'discountRate');
  if (rate <= -1) throw new Error('discountRate must be greater than -1');
  if (!Array.isArray(cashFlows) || cashFlows.length === 0) {
    throw Object.assign(new Error('cashFlows must be a non-empty array'), {
      code: 'FINANCE_CASH_FLOWS_REQUIRED',
    });
  }
  const npv = cashFlows.reduce((total, cashFlow, period) => (
    total + finiteNumber(cashFlow, `cashFlows[${period}]`) / ((1 + rate) ** period)
  ), 0);
  return {
    npv: Number(npv.toFixed(2)),
    sourceTags: ['src-input', 'src-rule'],
    explanation: 'NPV discounts each supplied cash flow at the supplied rate.',
  };
}

function calculateDebtService({ principal, annualInterestRate, termYears }) {
  const amount = finiteNumber(principal, 'principal');
  const annualRate = finiteNumber(annualInterestRate, 'annualInterestRate');
  const years = finiteNumber(termYears, 'termYears');
  if (amount <= 0 || annualRate < 0 || years <= 0) {
    throw Object.assign(new Error('principal, rate, and term must be valid positive values'), {
      code: 'FINANCE_INVALID_LOAN_TERMS',
    });
  }
  const monthlyRate = annualRate / 12;
  const months = Math.round(years * 12);
  const payment = monthlyRate === 0
    ? amount / months
    : amount * monthlyRate * ((1 + monthlyRate) ** months) / (((1 + monthlyRate) ** months) - 1);
  return {
    monthlyPayment: Number(payment.toFixed(2)),
    annualDebtService: Number((payment * 12).toFixed(2)),
    months,
    sourceTags: ['src-input', 'src-rule'],
  };
}

module.exports = {
  calculateDscr,
  calculateNpv,
  calculateDebtService,
};
