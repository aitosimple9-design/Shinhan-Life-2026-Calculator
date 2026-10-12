// Integration: bộ điều phối calculateIncome trên các luồng FC → SL+ → SM+ (workflow.md §2)
import { describe, it, expect } from 'vitest';
import { calculateIncome, calculateVisibleTotal, getK2Coefficient } from './calculator.js';

const base = {
  role: 'FC', monthMode: '13+', fyp: 25_000_000, fycRate: 25, k2Bracket: 80, aitom: 'A',
  hasQuarterBonus: false, fypQuarter: 0, quarterActiveMonths: 3,
  starFcContracts: 3, starFcReferralFyp: 0,
  slAppointmentType: 'lateral', activeHeadcount: 5, fycTeamDirect: 100, fycRateSl: 25,
  fycTeamIndirectL1: 0, fycTeamIndirectL2: 0,
  hasSlQuarterBonus: false, fypTeamQuarter: 0, fycTeamIndirectL1Quarter: 0, fycTeamIndirectL2Quarter: 0,
  smTargetRevenue: 3_200_000_000, smActualRevenue: 3_200_000_000, smTargetRatio: 100,
  activeHeadcountSm: 5, fycRateSm: 25, fypTeamDirectSm: 0,
  fypIndirectSmL1: 0, fypIndirectSmL2: 0, fypIndirectSmL3: 0,
  hasSmQuarterBonus: false, fypTeamQuarterSm: 0,
  fypQuarterIndirectSmL1: 0, fypQuarterIndirectSmL2: 0, fypQuarterIndirectSmL3: 0,
  hasPersonalSales: false, partner: 'none', mdrt: false, hiddenKeys: [], extraBonuses: [],
};

const noNaN = (r) => {
  expect(Number.isFinite(r.total)).toBe(true);
  for (const v of Object.values(r.breakdown)) expect(Number.isFinite(v)).toBe(true);
};

describe('calculateIncome — FC', () => {
  it('FYC = FYP × tỷ lệ; tổng ≥ FYC', () => {
    const r = calculateIncome(base);
    expect(r.breakdown.fyc).toBeCloseTo(6.25, 6);
    expect(r.total).toBeGreaterThanOrEqual(r.breakdown.fyc);
    noNaN(r);
  });
  it('FYP = 0 → tổng 0', () => {
    expect(calculateIncome({ ...base, fyp: 0 }).total).toBe(0);
  });
  it('K2 50% → 80% → 120% không giảm thưởng và không NaN', () => {
    const t = [50, 80, 120].map(k => calculateIncome({ ...base, k2Bracket: k }).total);
    expect(t[0]).toBeLessThanOrEqual(t[1]);
    expect(t[1]).toBeLessThanOrEqual(t[2]);
    t.forEach(x => expect(Number.isFinite(x)).toBe(true));
  });
  it('FYP 10 tỷ không NaN', () => {
    noNaN(calculateIncome({ ...base, fyp: 10_000_000_000 }));
  });
  it('input rác (chuỗi, undefined) không crash', () => {
    noNaN(calculateIncome({ ...base, fyp: 'abc', fycRate: undefined, k2Bracket: NaN }));
  });
  it('overrideFypMillions ghi đè FYP (chart projection)', () => {
    const r = calculateIncome({ ...base, fyp: 0 }, 25);
    expect(r.breakdown.fyc).toBeCloseTo(6.25, 6);
  });
  it('thưởng khác được cộng vào tổng', () => {
    const r = calculateIncome({ ...base, extraBonuses: [{ id: 1, amountVND: 2_000_000 }] });
    expect(r.breakdown.extraTotal).toBe(2);
    expect(r.total).toBeCloseTo(calculateIncome(base).total + 2, 6);
  });
});

describe('calculateIncome — SL+ / SM+', () => {
  it.each(['GSL', 'SSL', 'ESL'])('%s: có phí quản lý, FYC cá nhân = 0 khi tắt DS cá nhân', (role) => {
    const r = calculateIncome({ ...base, role, monthMode: '1-9', k2Bracket: 75 });
    expect(r.breakdown.fyc).toBe(0);
    expect(r.total).toBeGreaterThan(0);
    noNaN(r);
  });
  it('bật "Có phát sinh cá nhân" làm tăng tổng cho SL', () => {
    const off = calculateIncome({ ...base, role: 'GSL', monthMode: '1-9' });
    const on = calculateIncome({ ...base, role: 'GSL', monthMode: '1-9', hasPersonalSales: true });
    expect(on.breakdown.fyc).toBeGreaterThan(0);
    expect(on.total).toBeGreaterThan(off.total);
  });
  it.each(['SM', 'EM', 'ERM', 'IRM'])('%s: tính được, có smDerived, không NaN', (role) => {
    const r = calculateIncome({ ...base, role, k2Bracket: 70, fypTeamDirectSm: 500_000_000 });
    expect(r.smDerived).not.toBeNull();
    noNaN(r);
  });
  it('chuyển tab FC → SL → SM → FC cho kết quả FC ổn định (không rò state)', () => {
    const a = calculateIncome(base).total;
    calculateIncome({ ...base, role: 'GSL' });
    calculateIncome({ ...base, role: 'SM' });
    expect(calculateIncome(base).total).toBe(a);
  });
});

describe('getK2Coefficient & calculateVisibleTotal', () => {
  it('route theo role (nhánh K2 thấp = % thực đạt)', () => {
    expect(getK2Coefficient({ ...base, k2Bracket: 30 })).toBeCloseTo(0.3, 6);
    expect(getK2Coefficient({ ...base, role: 'GSL', k2Bracket: 30 })).toBeCloseTo(0.3, 6);
    expect(getK2Coefficient({ ...base, role: 'SM', k2Bracket: 30 })).toBeCloseTo(0.3, 6);
  });
  it('ẩn một khoản thì visible giảm đúng bằng khoản đó', () => {
    const all = calculateVisibleTotal(base);
    const hidden = calculateVisibleTotal({ ...base, hiddenKeys: ['fyc'] });
    expect(hidden.visible).toBeCloseTo(all.visible - all.full.breakdown.fyc, 6);
  });
  it('hỗ trợ hiddenKeys dạng Set', () => {
    expect(() => calculateVisibleTotal({ ...base, hiddenKeys: new Set(['fyc']) })).not.toThrow();
  });
});
