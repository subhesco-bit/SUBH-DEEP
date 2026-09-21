const {
  calculateDscr,
  calculateNpv,
  calculateDebtService,
} = require('./financialModelService');

describe('financial model service', () => {
  it('calculates explainable DSCR verdicts', () => {
    expect(calculateDscr({
      operatingCashFlow: 180000,
      annualDebtService: 100000,
    })).toMatchObject({ dscr: 1.8, verdict: 'strong' });
  });

  it('calculates debt service and NPV from supplied inputs', () => {
    const debt = calculateDebtService({
      principal: 100000,
      annualInterestRate: 0,
      termYears: 2,
    });
    expect(debt.annualDebtService).toBe(50000);
    expect(calculateNpv({ discountRate: 0.1, cashFlows: [-100, 60, 60] }).npv).toBe(4.13);
  });

  it('rejects invalid financial inputs', () => {
    expect(() => calculateDscr({ operatingCashFlow: 1, annualDebtService: 0 }))
      .toThrow(/annualDebtService/);
  });
});
