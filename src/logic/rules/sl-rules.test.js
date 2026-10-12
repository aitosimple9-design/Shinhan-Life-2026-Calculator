// ============================================================
// SL-RULES.TEST.JS — Kiểm chứng toàn bộ quy tắc SL+ (GSL/SSL/ESL)
// Spec: SHL-FCS-2026-0008
// Phạm vi: Phí đào tạo trực thuộc, Phí hàng tháng, Phí quý, Phí năm
// ============================================================
import { describe, it, expect } from 'vitest';
import {
    getK2Coefficient_SL,
    calculateStandardManagementFee,
    getSLDirectRate,
    calculateGroupOverrideFee,
    calculateSLQuarterBonus,
} from './sl-rules.js';

// ============================================================
// 1. Hệ số K2 SL — MODULE 1B (business-logic.md)
// K2 Toàn Nhóm: <40%, 40-50%, 50-60%, 60-65%, 65-75%, >=75%
// ============================================================
describe('getK2Coefficient_SL — hệ số K2 Toàn Nhóm SL (Bảng 5)', () => {
    it('K2 < 40%: trả về đúng % K2 thực đạt Toàn nhóm (không phải hằng số cố định)', () => {
        expect(getK2Coefficient_SL(20, '13+')).toBeCloseTo(0.20);
        expect(getK2Coefficient_SL(0, '13+')).toBeCloseTo(0);
        expect(getK2Coefficient_SL(39.9, '13+')).toBeCloseTo(0.399);
    });

    it('40% <= K2 < 50%: hệ số = 50%', () => {
        expect(getK2Coefficient_SL(40, '1')).toBeCloseTo(0.50);
        expect(getK2Coefficient_SL(49.9, '1')).toBeCloseTo(0.50);
    });

    it('50% <= K2 < 60%: hệ số = 65%', () => {
        expect(getK2Coefficient_SL(50, '1')).toBeCloseTo(0.65);
        expect(getK2Coefficient_SL(59.9, '1')).toBeCloseTo(0.65);
    });

    it('60% <= K2 < 65%: hệ số = 80%', () => {
        expect(getK2Coefficient_SL(60, '1')).toBeCloseTo(0.80);
        expect(getK2Coefficient_SL(64.9, '1')).toBeCloseTo(0.80);
    });

    it('65% <= K2 < 75%: hệ số = 100%', () => {
        expect(getK2Coefficient_SL(65, '1')).toBeCloseTo(1.00);
        expect(getK2Coefficient_SL(74.9, '1')).toBeCloseTo(1.00);
    });

    it('K2 >= 75%, tháng < M12: hệ số = 100%', () => {
        expect(getK2Coefficient_SL(80, '1')).toBeCloseTo(1.00);
        expect(getK2Coefficient_SL(100, '1-9')).toBeCloseTo(1.00);
    });

    it('K2 >= 75%, tháng >= M12: hệ số = 120%', () => {
        expect(getK2Coefficient_SL(80, '13+')).toBeCloseTo(1.20);
        expect(getK2Coefficient_SL(75, '12')).toBeCloseTo(1.20);
        expect(getK2Coefficient_SL(100, '16+')).toBeCloseTo(1.20);
    });
});

// ============================================================
// 2. Phí Đào Tạo Trực Thuộc — MODULE 6 (business-logic.md)
// calculateStandardManagementFee(role, appointmentType, monthMode, activeHC, k2Coef)
// Điều kiện: chỉ áp dụng 'lateral' (tuyển ngang), trong giai đoạn hỗ trợ
// GSL: M1-9, >= 1 HC => 8tr x K2
// SSL: M1-12, >= 2 HC => 10tr x K2
// ESL: M1-15, >= 1 HC => 12tr x K2
// ============================================================
describe('calculateStandardManagementFee — phí đào tạo trực thuộc SL', () => {
    it('GSL, lateral, M1-9, activeHC >= 1: phí = 8tr x K2', () => {
        const k2 = getK2Coefficient_SL(70, '1-9'); // 1.00
        expect(calculateStandardManagementFee('GSL', 'lateral', '1-9', 1, k2))
            .toBeCloseTo(8 * 1.00);
    });

    it('GSL, lateral, ngoài M1-9 (promotion type): phí = 0', () => {
        expect(calculateStandardManagementFee('GSL', 'promotion', '1-9', 1, 1.0)).toBe(0);
        expect(calculateStandardManagementFee('GSL', 'lateral', '12', 1, 1.0)).toBe(0);
    });

    it('GSL, lateral, activeHC < 1: phí = 0', () => {
        expect(calculateStandardManagementFee('GSL', 'lateral', '1-9', 0, 1.0)).toBe(0);
    });

    it('SSL, lateral, M1-11 hoặc M12, activeHC >= 2: phí = 10tr x K2', () => {
        const k2 = getK2Coefficient_SL(65, '12'); // 1.00
        expect(calculateStandardManagementFee('SSL', 'lateral', '1-11', 2, k2))
            .toBeCloseTo(10 * 1.00);
        expect(calculateStandardManagementFee('SSL', 'lateral', '12', 3, k2))
            .toBeCloseTo(10 * 1.00);
    });

    it('SSL, lateral, activeHC < 2 (chỉ 1): phí = 0', () => {
        expect(calculateStandardManagementFee('SSL', 'lateral', '1-11', 1, 1.0)).toBe(0);
    });

    it('ESL, lateral, M1-11 hoặc M12-15, activeHC >= 1: phí = 12tr x K2', () => {
        const k2 = getK2Coefficient_SL(80, '12-15'); // 1.20
        expect(calculateStandardManagementFee('ESL', 'lateral', '1-11', 1, k2))
            .toBeCloseTo(12 * k2);
        expect(calculateStandardManagementFee('ESL', 'lateral', '12-15', 1, k2))
            .toBeCloseTo(12 * k2);
    });

    it('K2 nhân tuyến tính vào phí đào tạo SL', () => {
        const fee100 = calculateStandardManagementFee('GSL', 'lateral', '1-9', 2, 1.00);
        const fee120 = calculateStandardManagementFee('GSL', 'lateral', '1-9', 2, 1.20);
        expect(fee120).toBeCloseTo(fee100 * 1.20);
    });
});

// ============================================================
// 3. Phí Khai Thác Nhóm Hàng Tháng — MODULE 6 (business-logic.md)
// getSLDirectRate(role, teamFypTT) + calculateGroupOverrideFee(l1, l2, fycRate, k2)
// Spec: spec.md §4.2, Bảng 8
// ============================================================
describe('getSLDirectRate — tỷ lệ phí khai thác trực tiếp tháng (Bảng 8)', () => {
    it('FYP Nhóm TT < 30tr: GSL=3%, SSL=4%, ESL=5%', () => {
        expect(getSLDirectRate('GSL', 20)).toBeCloseTo(0.03);
        expect(getSLDirectRate('SSL', 20)).toBeCloseTo(0.04);
        expect(getSLDirectRate('ESL', 20)).toBeCloseTo(0.05);
    });

    it('FYP Nhóm TT [30-60)tr: GSL=10%, SSL=15%, ESL=20%', () => {
        expect(getSLDirectRate('GSL', 30)).toBeCloseTo(0.10);
        expect(getSLDirectRate('SSL', 45)).toBeCloseTo(0.15);
        expect(getSLDirectRate('ESL', 59.9)).toBeCloseTo(0.20);
    });

    it('FYP Nhóm TT [60-90)tr: GSL=15%, SSL=20%, ESL=25%', () => {
        expect(getSLDirectRate('GSL', 60)).toBeCloseTo(0.15);
        expect(getSLDirectRate('SSL', 75)).toBeCloseTo(0.20);
        expect(getSLDirectRate('ESL', 89.9)).toBeCloseTo(0.25);
    });

    it('FYP Nhóm TT >= 90tr: GSL=20%, SSL=25%, ESL=30%', () => {
        expect(getSLDirectRate('GSL', 90)).toBeCloseTo(0.20);
        expect(getSLDirectRate('SSL', 100)).toBeCloseTo(0.25);
        expect(getSLDirectRate('ESL', 200)).toBeCloseTo(0.30);
    });
});

describe('Phí khai thác tháng — tổng TT + gián tiếp x K2', () => {
    it('Phí TT = FYC_TT x rate x K2', () => {
        // SSL, FYP_TT=60tr, fycRate=30%, K2=1.0
        // FYC_TT = 60 * 0.30 = 18tr
        // rate = 0.20 (SSL, FYP>=60)
        // Phí_TT = 18 * 0.20 * 1.0 = 3.6tr
        const teamFypTT = 60;
        const fycRate   = 0.30;
        const k2Coef    = 1.0;
        const rate      = getSLDirectRate('SSL', teamFypTT);
        const fycTT     = teamFypTT * fycRate;
        expect(fycTT * rate * k2Coef).toBeCloseTo(3.6);
    });

    it('calculateGroupOverrideFee: L1=5%, L2=2.5% trên FYC (nhân K2)', () => {
        // L1=100tr, L2=50tr, fycRate=30%, K2=1.0
        // l1Fyc=30tr, l2Fyc=15tr
        // phíGT = (30*0.05 + 15*0.025) * 1.0 = (1.5 + 0.375) = 1.875tr
        expect(calculateGroupOverrideFee(100, 50, 0.30, 1.0)).toBeCloseTo(1.875);
    });

    it('calculateGroupOverrideFee: L1=0, L2=0 (GSL không có gián tiếp) => 0', () => {
        expect(calculateGroupOverrideFee(0, 0, 0.30, 1.0)).toBe(0);
    });

    it('calculateGroupOverrideFee: K2 nhân tuyến tính vào phí gián tiếp', () => {
        const fee100 = calculateGroupOverrideFee(100, 0, 0.30, 1.00);
        const fee120 = calculateGroupOverrideFee(100, 0, 0.30, 1.20);
        expect(fee120).toBeCloseTo(fee100 * 1.20);
    });
});

// ============================================================
// 4. Phí Khai Thác Nhóm Hàng Quý — MODULE 6 (business-logic.md)
// calculateSLQuarterBonus(role, fypQMil, l1FypQMil, l2FypQMil, slFycRate, k2Coef)
// Spec: spec.md §4.3, Bảng 10
// ============================================================
describe('calculateSLQuarterBonus — phí khai thác quý SL (Bảng 10)', () => {
    it('FYP Quý < 100tr: phí quý = 0', () => {
        expect(calculateSLQuarterBonus('GSL', 99, 0, 0, 0.30, 1.0)).toBe(0);
        expect(calculateSLQuarterBonus('SSL', 0, 0, 0, 0.30, 1.0)).toBe(0);
    });

    it('FYP Quý [100-300)tr — GSL=5%, SSL=8%, ESL=10%', () => {
        // GSL: fypQ=150tr, fycRate=30%, L1=0, L2=0, K2=1.0
        // FYC_Q_TT = 150*0.3 = 45tr; phí = (45*0.05 + 0 + 0)*1.0 / 3 = 0.75tr
        expect(calculateSLQuarterBonus('GSL', 150, 0, 0, 0.30, 1.0)).toBeCloseTo(0.75);

        // SSL: fypQ=200tr, K2=1.0
        // FYC_Q_TT = 200*0.3 = 60tr; phí = (60*0.08 + 0 + 0)*1.0 / 3 = 1.6tr
        expect(calculateSLQuarterBonus('SSL', 200, 0, 0, 0.30, 1.0)).toBeCloseTo(1.6);

        // ESL: fypQ=200tr, K2=1.0
        // FYC_Q_TT = 60tr; phí = (60*0.10 + 0 + 0)*1.0 / 3 = 2.0tr
        expect(calculateSLQuarterBonus('ESL', 200, 0, 0, 0.30, 1.0)).toBeCloseTo(2.0);
    });

    it('FYP Quý >= 300tr — GSL=8%, SSL=10%, ESL=12%', () => {
        // GSL: fypQ=300tr, L1=0, K2=1.0
        // FYC_Q_TT = 300*0.3 = 90tr; phí = (90*0.08)*1.0 / 3 = 2.4tr
        expect(calculateSLQuarterBonus('GSL', 300, 0, 0, 0.30, 1.0)).toBeCloseTo(2.4);

        // SSL: fypQ=300tr
        // phí = (90*0.10)*1.0 / 3 = 3.0tr
        expect(calculateSLQuarterBonus('SSL', 300, 0, 0, 0.30, 1.0)).toBeCloseTo(3.0);

        // ESL: fypQ=300tr
        // phí = (90*0.12)*1.0 / 3 = 3.6tr
        expect(calculateSLQuarterBonus('ESL', 300, 0, 0, 0.30, 1.0)).toBeCloseTo(3.6);
    });

    it('ESL quý: có thêm L1 (5%) và L2 (2.5%) gián tiếp', () => {
        // ESL: fypQ_TT=200tr, L1=100tr, L2=50tr, fycRate=30%, K2=1.0
        // FYC_TT=60, FYC_L1=30, FYC_L2=15
        // phí = ((60*0.10) + (30*0.05) + (15*0.025)) * 1.0 / 3
        //     = (6 + 1.5 + 0.375) / 3 = 7.875 / 3 = 2.625tr
        expect(calculateSLQuarterBonus('ESL', 200, 100, 50, 0.30, 1.0)).toBeCloseTo(2.625);
    });

    it('K2 nhân tuyến tính vào phí quý SL', () => {
        const q100 = calculateSLQuarterBonus('SSL', 300, 0, 0, 0.30, 1.00);
        const q120 = calculateSLQuarterBonus('SSL', 300, 0, 0, 0.30, 1.20);
        expect(q120).toBeCloseTo(q100 * 1.20);
    });
});

// ============================================================
// 5. Phí Năm — Tổng Hợp: Tác động K2 dài hạn
// Kiểm tra K2 hàng tháng cao >= M12 ảnh hưởng cộng dồn vào thu nhập năm
// (Dùng phí đào tạo làm proxy vì không có hàm "phí năm" riêng)
// ============================================================
describe('Phí Năm — Mô Phỏng Tổng Thu Nhập SL Qua 12 Tháng', () => {
    it('12 tháng phí đào tạo GSL (K2=80%, M1-9 => 100%, tháng 10+ hết hỗ trợ)', () => {
        // Tháng 1-9: lateral, GSL, k2=1.0 (M1-9 < M12)
        const k2Early = getK2Coefficient_SL(80, '1-9'); // 1.00
        const feePerMonth = calculateStandardManagementFee('GSL', 'lateral', '1-9', 1, k2Early);
        const total9months = feePerMonth * 9;

        // Tháng 10-12: GSL không còn trong giai đoạn hỗ trợ (monthMode không phải '1-9')
        // => phí đào tạo = 0
        expect(calculateStandardManagementFee('GSL', 'lateral', '12', 1, 1.0)).toBe(0);
        expect(total9months).toBeCloseTo(8 * 1.00 * 9); // = 72tr
    });

    it('12 tháng phí đào tạo SSL (K2=80%, M12 vẫn còn hỗ trợ, 120% nếu M12+)', () => {
        // Tháng 1-11: K2=80%, trước M12 => hệ số 1.00
        const k2Before = getK2Coefficient_SL(80, '1-11'); // 1.00
        const feeBefore = calculateStandardManagementFee('SSL', 'lateral', '1-11', 2, k2Before);

        // Tháng 12: K2=80%, M12 => hệ số 1.20
        const k2At12 = getK2Coefficient_SL(80, '12'); // 1.20
        const feeAt12 = calculateStandardManagementFee('SSL', 'lateral', '12', 2, k2At12);

        const totalYear = feeBefore * 11 + feeAt12;
        // 10*1.0*11 + 10*1.2*1 = 110 + 12 = 122tr
        expect(feeBefore).toBeCloseTo(10 * 1.00);
        expect(feeAt12).toBeCloseTo(10 * 1.20);
        expect(totalYear).toBeCloseTo(110 + 12);
    });
});
