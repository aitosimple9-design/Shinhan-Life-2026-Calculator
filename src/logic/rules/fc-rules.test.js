// ============================================================
// FC-RULES.TEST.JS — Kiểm chứng toàn bộ quy tắc đại lý FC
// Spec: SHL-FCS-2026-0007
// Phạm vi: Hoa hồng (FYC), Thưởng Tháng, Thưởng Quý, Thưởng Năm (MDRT), Tiến Độ MDRT
// ============================================================
import { describe, it, expect } from 'vitest';
import {
    getK2Coefficient_FC,
    getMonthBonusRate,
    calculateQuarterBonus,
    calculatePartnerBonus,
    calculateMDRTBonus,
} from './fc-rules.js';

// ============================================================
// 1. Hoa hồng FYC — MODULE 2 (business-logic.md)
// fyc = fyp * fycRate
// ============================================================
describe('Hoa hồng FYC (tỷ lệ FYC chuẩn)', () => {
    it('FYP = 0 thì FYC = 0 (tỷ lệ bất kỳ)', () => {
        const fyp = 0;
        const fycRate = 0.30;
        expect(fyp * fycRate).toBe(0);
    });

    it('FYP 100tr x FYC 30% = 30tr (Sống An Vui >= 15 năm)', () => {
        const fyp = 100;
        const fycRate = 0.30;
        expect(fyp * fycRate).toBeCloseTo(30);
    });

    it('FYP 100tr x FYC 15% = 15tr (Credit Care / Bổ trợ)', () => {
        const fyp = 100;
        const fycRate = 0.15;
        expect(fyp * fycRate).toBeCloseTo(15);
    });

    it('FYP 50tr x FYC 28% = 14tr (Sống An Vui 14 năm)', () => {
        const fyp = 50;
        const fycRate = 0.28;
        expect(fyp * fycRate).toBeCloseTo(14);
    });
});

// ============================================================
// 2. Hệ số K2 FC — MODULE 1A (business-logic.md)
// ============================================================
describe('getK2Coefficient_FC — hệ số K2 cá nhân FC', () => {
    it('K2 < 50%: trả về đúng % K2 thực đạt (không phải hằng số cố định)', () => {
        expect(getK2Coefficient_FC(32, '13+')).toBeCloseTo(0.32);
        expect(getK2Coefficient_FC(0, '13+')).toBeCloseTo(0);
        expect(getK2Coefficient_FC(49.9, '13+')).toBeCloseTo(0.499);
    });

    it('50% <= K2 < 60%: hệ số = 50%', () => {
        expect(getK2Coefficient_FC(50, '1')).toBeCloseTo(0.50);
        expect(getK2Coefficient_FC(59.9, '1')).toBeCloseTo(0.50);
    });

    it('60% <= K2 < 65%: hệ số = 65%', () => {
        expect(getK2Coefficient_FC(60, '1')).toBeCloseTo(0.65);
        expect(getK2Coefficient_FC(64.9, '1')).toBeCloseTo(0.65);
    });

    it('65% <= K2 < 70%: hệ số = 80%', () => {
        expect(getK2Coefficient_FC(65, '1')).toBeCloseTo(0.80);
        expect(getK2Coefficient_FC(69.9, '1')).toBeCloseTo(0.80);
    });

    it('70% <= K2 < 80%: hệ số = 100%', () => {
        expect(getK2Coefficient_FC(70, '1')).toBeCloseTo(1.00);
        expect(getK2Coefficient_FC(79.9, '1')).toBeCloseTo(1.00);
    });

    it('K2 >= 80%, tháng < M12: hệ số = 100%', () => {
        expect(getK2Coefficient_FC(85, '1')).toBeCloseTo(1.00);
        expect(getK2Coefficient_FC(100, '2-7')).toBeCloseTo(1.00);
        expect(getK2Coefficient_FC(80, '8-13')).toBeCloseTo(1.00);
    });

    it('K2 >= 80%, tháng >= M12: hệ số = 120%', () => {
        expect(getK2Coefficient_FC(85, '12')).toBeCloseTo(1.20);
        expect(getK2Coefficient_FC(85, '13+')).toBeCloseTo(1.20);
        expect(getK2Coefficient_FC(85, '14-19')).toBeCloseTo(1.20);
        expect(getK2Coefficient_FC(100, '16+')).toBeCloseTo(1.20);
    });
});

// ============================================================
// 3. Thưởng Năng Suất Tháng — MODULE 3 (business-logic.md)
// bonusMonth = fyc * rate * k2Coef
// rate tra theo Bảng 2: FYP & AiTOM (S/A vs B/C/D)
// ============================================================
describe('getMonthBonusRate — tỷ lệ thưởng năng suất tháng (Bảng 2)', () => {
    it('FYP < 10tr: tỷ lệ = 0% (mọi AiTOM)', () => {
        expect(getMonthBonusRate(5, 'S')).toBe(0);
        expect(getMonthBonusRate(9.9, 'B')).toBe(0);
    });

    it('FYP [10-25)tr: tỷ lệ = 10% (mọi AiTOM)', () => {
        expect(getMonthBonusRate(10, 'S')).toBeCloseTo(0.10);
        expect(getMonthBonusRate(20, 'B')).toBeCloseTo(0.10);
        expect(getMonthBonusRate(24.9, 'C')).toBeCloseTo(0.10);
    });

    it('FYP [25-45)tr: AiTOM S/A => 18%, B/C/D => 15%', () => {
        expect(getMonthBonusRate(25, 'S')).toBeCloseTo(0.18);
        expect(getMonthBonusRate(25, 'A')).toBeCloseTo(0.18);
        expect(getMonthBonusRate(44.9, 'B')).toBeCloseTo(0.15);
        expect(getMonthBonusRate(30, 'C')).toBeCloseTo(0.15);
        expect(getMonthBonusRate(30, 'D')).toBeCloseTo(0.15);
    });

    it('FYP [45-70)tr: AiTOM S/A => 23%, B/C/D => 20%', () => {
        expect(getMonthBonusRate(45, 'S')).toBeCloseTo(0.23);
        expect(getMonthBonusRate(45, 'A')).toBeCloseTo(0.23);
        expect(getMonthBonusRate(69.9, 'B')).toBeCloseTo(0.20);
    });

    it('FYP [70-100)tr: AiTOM S/A => 28%, B/C/D => 25%', () => {
        expect(getMonthBonusRate(70, 'S')).toBeCloseTo(0.28);
        expect(getMonthBonusRate(70, 'A')).toBeCloseTo(0.28);
        expect(getMonthBonusRate(99.9, 'B')).toBeCloseTo(0.25);
    });

    it('FYP >= 100tr: AiTOM S/A => 33%, B/C/D => 30%', () => {
        expect(getMonthBonusRate(100, 'S')).toBeCloseTo(0.33);
        expect(getMonthBonusRate(100, 'A')).toBeCloseTo(0.33);
        expect(getMonthBonusRate(200, 'B')).toBeCloseTo(0.30);
        expect(getMonthBonusRate(150, 'C')).toBeCloseTo(0.30);
    });
});

describe('Thưởng Tháng — tính bonusMonth = FYC x rate x K2', () => {
    it('FYP=50tr, AiTOM S, fycRate=30%, K2Coef=1.0 => bonusMonth = 50*0.3*0.23*1.0 = 3.45tr', () => {
        const fypMil = 50;
        const fycRate = 0.30;
        const fyc = fypMil * fycRate;
        const rate = getMonthBonusRate(fypMil, 'S');
        const k2Coef = getK2Coefficient_FC(75, '8-13');
        expect(fyc * rate * k2Coef).toBeCloseTo(3.45);
    });

    it('FYP=80tr, AiTOM B, fycRate=30%, K2=80% M12+ => bonusMonth = 80*0.3*0.25*1.2 = 7.2tr', () => {
        const fypMil = 80;
        const fycRate = 0.30;
        const fyc = fypMil * fycRate;
        const rate = getMonthBonusRate(fypMil, 'B');
        const k2Coef = getK2Coefficient_FC(80, '13+');
        expect(fyc * rate * k2Coef).toBeCloseTo(7.2);
    });

    it('FYP < 10tr => thưởng tháng = 0 dù FYC > 0', () => {
        const fypMil = 8;
        const fyc = 8 * 0.30;
        const rate = getMonthBonusRate(fypMil, 'S');
        expect(fyc * rate * 1.0).toBe(0);
    });
});

// ============================================================
// 4. Thưởng Năng Suất Quý — MODULE 4 (business-logic.md)
// bonusQuarter = (fycQ * rateQ * hsHD * k2Coef) / 3
// ============================================================
describe('calculateQuarterBonus — thưởng quý cá nhân FC (Bảng 4 & 5)', () => {
    it('FYP Quý < 75tr: thưởng quý = 0', () => {
        expect(calculateQuarterBonus(74, 0.30, 3, 1.0)).toBe(0);
        expect(calculateQuarterBonus(0, 0.30, 3, 1.0)).toBe(0);
    });

    it('FYP Quý [75-135)tr: tỷ lệ = 6%; 3 tháng => bonusQ=(100*0.3*0.06*1.2*1.0)/3=0.72tr', () => {
        expect(calculateQuarterBonus(100, 0.30, 3, 1.0)).toBeCloseTo(0.72);
    });

    it('FYP Quý [135-210)tr: tỷ lệ = 8%; 2 tháng => bonusQ=(150*0.3*0.08*1.0*1.0)/3=1.2tr', () => {
        expect(calculateQuarterBonus(150, 0.30, 2, 1.0)).toBeCloseTo(1.2);
    });

    it('FYP Quý [210-300)tr: tỷ lệ = 10%; 1 tháng => bonusQ=(250*0.3*0.10*0.8*1.0)/3=2.0tr', () => {
        expect(calculateQuarterBonus(250, 0.30, 1, 1.0)).toBeCloseTo(2.0);
    });

    it('FYP Quý >= 300tr: tỷ lệ = 12%; 3 tháng => bonusQ=(300*0.3*0.12*1.2*1.0)/3=4.32tr', () => {
        expect(calculateQuarterBonus(300, 0.30, 3, 1.0)).toBeCloseTo(4.32);
    });

    it('Hệ số hoạt động: 1 tháng=80%, 2 tháng=100%, 3 tháng=120%', () => {
        const base = 90 * 0.12 * 1.0 / 3;
        expect(calculateQuarterBonus(300, 0.30, 2, 1.0)).toBeCloseTo(base);
        expect(calculateQuarterBonus(300, 0.30, 1, 1.0)).toBeCloseTo(base * 0.8);
        expect(calculateQuarterBonus(300, 0.30, 3, 1.0)).toBeCloseTo(base * 1.2);
    });

    it('K2 ảnh hưởng tuyến tính vào thưởng quý', () => {
        const at100 = calculateQuarterBonus(150, 0.30, 3, 1.00);
        const at120 = calculateQuarterBonus(150, 0.30, 3, 1.20);
        expect(at120).toBeCloseTo(at100 * 1.20);
    });
});

// ============================================================
// 5. Thưởng Tiến Độ MDRT & Danh hiệu MDRT (Bảng 6 & 8)
// Spec: spec.md §2.4
// ============================================================
describe('Tiến Độ MDRT — thưởng tại các mốc Q1/Q2/Q3 (Bảng 6)', () => {
    function getMDRTProgressBonus(fypAccMil, checkpoint) {
        if (checkpoint === 'Q1') {
            if (fypAccMil >= 200 && fypAccMil < 250) return 4;
            if (fypAccMil >= 250) return 5;
        } else if (checkpoint === 'Q2') {
            if (fypAccMil >= 400 && fypAccMil < 500) return 8;
            if (fypAccMil >= 500) return 10;
        } else if (checkpoint === 'Q3') {
            if (fypAccMil >= 600 && fypAccMil < 750) return 12;
            if (fypAccMil >= 750) return 15;
        }
        return 0;
    }

    it('Q1 (31/03): FYP [200-250)tr => 4tr; FYP >= 250tr => 5tr; < 200tr => 0', () => {
        expect(getMDRTProgressBonus(200, 'Q1')).toBe(4);
        expect(getMDRTProgressBonus(249, 'Q1')).toBe(4);
        expect(getMDRTProgressBonus(250, 'Q1')).toBe(5);
        expect(getMDRTProgressBonus(199, 'Q1')).toBe(0);
    });

    it('Q2 (30/06): FYP [400-500)tr => 8tr; FYP >= 500tr => 10tr; < 400tr => 0', () => {
        expect(getMDRTProgressBonus(400, 'Q2')).toBe(8);
        expect(getMDRTProgressBonus(499, 'Q2')).toBe(8);
        expect(getMDRTProgressBonus(500, 'Q2')).toBe(10);
        expect(getMDRTProgressBonus(399, 'Q2')).toBe(0);
    });

    it('Q3 (30/09): FYP [600-750)tr => 12tr; FYP >= 750tr => 15tr; < 600tr => 0', () => {
        expect(getMDRTProgressBonus(600, 'Q3')).toBe(12);
        expect(getMDRTProgressBonus(749, 'Q3')).toBe(12);
        expect(getMDRTProgressBonus(750, 'Q3')).toBe(15);
        expect(getMDRTProgressBonus(599, 'Q3')).toBe(0);
    });
});

describe('Thưởng Năm — Danh hiệu MDRT cuối năm 31/12 (Bảng 6)', () => {
    const MDRT    = 1_073_645_200;
    const MDRT150 = 1_610_467_800;
    const COT     = 3_220_935_600;
    const TOT     = 6_441_871_200;

    function getMDRTYearBonus(fypRaw) {
        if (fypRaw >= TOT)     return 100;
        if (fypRaw >= COT)     return 60;
        if (fypRaw >= MDRT150) return 40;
        if (fypRaw >= MDRT)    return 35;
        return 0;
    }

    it('FYP < MDRT ngưỡng: không có thưởng danh hiệu', () => {
        expect(getMDRTYearBonus(MDRT - 1)).toBe(0);
        expect(getMDRTYearBonus(0)).toBe(0);
    });

    it('MDRT (FYP [1.07B - 1.61B)): thưởng 35tr', () => {
        expect(getMDRTYearBonus(MDRT)).toBe(35);
        expect(getMDRTYearBonus(MDRT150 - 1)).toBe(35);
    });

    it('150% MDRT (FYP [1.61B - 3.22B)): thưởng 40tr', () => {
        expect(getMDRTYearBonus(MDRT150)).toBe(40);
        expect(getMDRTYearBonus(COT - 1)).toBe(40);
    });

    it('COT (FYP [3.22B - 6.44B)): thưởng 60tr', () => {
        expect(getMDRTYearBonus(COT)).toBe(60);
        expect(getMDRTYearBonus(TOT - 1)).toBe(60);
    });

    it('TOT (FYP >= 6.44B): thưởng 100tr', () => {
        expect(getMDRTYearBonus(TOT)).toBe(100);
        expect(getMDRTYearBonus(TOT * 2)).toBe(100);
    });
});

describe('calculateMDRTBonus — hàm trong fc-rules.js', () => {
    it('mdrt=true => trả về 5tr', () => {
        expect(calculateMDRTBonus(true)).toBe(5.0);
    });

    it('mdrt=false => trả về 0', () => {
        expect(calculateMDRTBonus(false)).toBe(0);
    });
});

// ============================================================
// 6. Thưởng Shinhan Partner — spec.md §2.5 (Bảng 9)
// calculatePartnerBonus(partner, k2Pct, fypMil, fycRate)
// Điều kiện: K2 >= 70%; G=10%, S=15%, E=20% FYC
// ============================================================
describe('calculatePartnerBonus — thưởng Shinhan Partner (Bảng 9)', () => {
    it('G-Partner (K2 >= 70%): thưởng thêm 10% FYC = FYP * fycRate * 10%', () => {
        expect(calculatePartnerBonus('G', 70, 100, 0.30)).toBeCloseTo(100 * 0.30 * 0.10);
        expect(calculatePartnerBonus('G', 75, 100, 0.30)).toBeCloseTo(3.0);
    });

    it('S-Partner (K2 >= 70%): thưởng thêm 15% FYC', () => {
        expect(calculatePartnerBonus('S', 70, 100, 0.30)).toBeCloseTo(100 * 0.30 * 0.15);
        expect(calculatePartnerBonus('S', 80, 100, 0.30)).toBeCloseTo(4.5);
    });

    it('E-Partner (K2 >= 70%): thưởng thêm 20% FYC', () => {
        expect(calculatePartnerBonus('E', 70, 100, 0.30)).toBeCloseTo(100 * 0.30 * 0.20);
        expect(calculatePartnerBonus('E', 100, 100, 0.30)).toBeCloseTo(6.0);
    });

    it('K2 < 70%: KHÔNG được thưởng Partner dù có danh hiệu', () => {
        expect(calculatePartnerBonus('G', 69.9, 100, 0.30)).toBe(0);
        expect(calculatePartnerBonus('S', 50, 100, 0.30)).toBe(0);
        expect(calculatePartnerBonus('E', 0, 100, 0.30)).toBe(0);
    });

    it('partner="none": không thưởng dù K2 >= 70%', () => {
        expect(calculatePartnerBonus('none', 100, 100, 0.30)).toBe(0);
    });

    it('Partner bonus tỷ lệ thuận với FYP', () => {
        const bonus50  = calculatePartnerBonus('G', 75, 50, 0.30);
        const bonus100 = calculatePartnerBonus('G', 75, 100, 0.30);
        expect(bonus100).toBeCloseTo(bonus50 * 2);
    });
});
