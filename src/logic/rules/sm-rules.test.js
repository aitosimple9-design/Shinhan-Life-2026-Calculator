// ============================================================
// SM-RULES.TEST.JS — Kiểm chứng toàn bộ quy tắc SM+ (SM/EM/ERM/IRM)
// Spec: SHL-FCS-2026-0009
// Phạm vi: Phí đào tạo trực tiếp, Phí hàng tháng, Phí quý, Phí năm
// ============================================================
import { describe, it, expect } from 'vitest';
import {
    getK2Coefficient_SM,
    calculateSMTrainingFee,
    getSMDirectRate,
    calculateSMDirectFee,
    getSMIndirectRate,
    calculateSMIndirectFee,
    calculateSMQuarterBonus,
    calcSMCompletionRate,
} from './sm-rules.js';

// ============================================================
// 1. Hệ số K2 SM+ — MODULE 1C (business-logic.md)
// K2 Toàn Nhóm: <35%, 35-45%, 45-50%, 50-60%, 60-70%, >=70%
// ============================================================
describe('getK2Coefficient_SM — hệ số K2 Toàn Nhóm SM (Bảng 6)', () => {
    it('K2 < 35%: trả về đúng % K2 thực đạt (không phải hằng số cố định)', () => {
        expect(getK2Coefficient_SM(20, '13+')).toBeCloseTo(0.20);
        expect(getK2Coefficient_SM(0, '13+')).toBeCloseTo(0);
        expect(getK2Coefficient_SM(34.9, '13+')).toBeCloseTo(0.349);
    });

    it('35% <= K2 < 45%: hệ số = 50%', () => {
        expect(getK2Coefficient_SM(35, '1')).toBeCloseTo(0.50);
        expect(getK2Coefficient_SM(44.9, '1')).toBeCloseTo(0.50);
    });

    it('45% <= K2 < 50%: hệ số = 60%', () => {
        expect(getK2Coefficient_SM(45, '1')).toBeCloseTo(0.60);
        expect(getK2Coefficient_SM(49.9, '1')).toBeCloseTo(0.60);
    });

    it('50% <= K2 < 60%: hệ số = 80%', () => {
        expect(getK2Coefficient_SM(50, '1')).toBeCloseTo(0.80);
        expect(getK2Coefficient_SM(59.9, '1')).toBeCloseTo(0.80);
    });

    it('60% <= K2 < 70%: hệ số = 100%', () => {
        expect(getK2Coefficient_SM(60, '1')).toBeCloseTo(1.00);
        expect(getK2Coefficient_SM(69.9, '1')).toBeCloseTo(1.00);
    });

    it('K2 >= 70%, tháng < M12: hệ số = 100%', () => {
        expect(getK2Coefficient_SM(75, '1')).toBeCloseTo(1.00);
        expect(getK2Coefficient_SM(100, '1')).toBeCloseTo(1.00);
    });

    it('K2 >= 70%, tháng >= M12 (13+): hệ số = 120%', () => {
        expect(getK2Coefficient_SM(75, '13+')).toBeCloseTo(1.20);
        expect(getK2Coefficient_SM(100, '13+')).toBeCloseTo(1.20);
    });
});

// ============================================================
// 2. Phí Đào Tạo Trực Tiếp SM+ — MODULE 7 (business-logic.md)
// HAI khoản CỘNG riêng (Mục 2.1 SHL-FCS-2026-0009):
//   Phí KD (75%) = 75% x phiChuan x heSoFyp x k2Coef
//   Phí HĐ (25%) = 25% x phiChuan x heSoHC  (KHÔNG nhân K2)
// ============================================================
describe('calculateSMTrainingFee — phí đào tạo trực tiếp SM (2 khoản riêng)', () => {
    const phiChuanSM = 40; // SM = 40tr

    it('Hệ số FYP: completionRate < 35% => heSoFyp = 0 (cả phần KD = 0)', () => {
        // k2Coef=1.0, activeHC=7 (heSoHC=1.0)
        // KD = 75% * 0 * 40 * 1.0 = 0; HĐ = 25% * 1.0 * 40 = 10tr
        const fee = calculateSMTrainingFee('SM', 0.34, 7, 1.0);
        expect(fee).toBeCloseTo(0 + 0.25 * 1.00 * phiChuanSM);
    });

    it('Hệ số FYP: 35% <= rate < 50% => heSoFyp = rate thực tế', () => {
        // rate=0.40, activeHC=7 (heSoHC=1.0), k2=1.0
        // KD = 75% * 0.40 * 40 * 1.0 = 12; HĐ = 25% * 1.0 * 40 = 10 => total=22
        const fee = calculateSMTrainingFee('SM', 0.40, 7, 1.0);
        const expected = 0.75 * 0.40 * phiChuanSM * 1.0 + 0.25 * 1.00 * phiChuanSM;
        expect(fee).toBeCloseTo(expected);
    });

    it('Hệ số FYP: 50% <= rate < 80% => heSoFyp = 50%', () => {
        // rate=0.65, activeHC=7, k2=1.0
        // KD = 75% * 0.50 * 40 * 1.0 = 15; HĐ = 25% * 1.0 * 40 = 10 => total=25
        const fee = calculateSMTrainingFee('SM', 0.65, 7, 1.0);
        expect(fee).toBeCloseTo(0.75 * 0.50 * phiChuanSM * 1.0 + 0.25 * 1.00 * phiChuanSM);
    });

    it('Hệ số FYP: 80% <= rate < 115% => heSoFyp = 100%', () => {
        // rate=1.0, activeHC=7, k2=1.0
        // KD = 75% * 1.0 * 40 * 1.0 = 30; HĐ = 25% * 1.0 * 40 = 10 => total=40
        const fee = calculateSMTrainingFee('SM', 1.0, 7, 1.0);
        expect(fee).toBeCloseTo(0.75 * 1.00 * phiChuanSM * 1.0 + 0.25 * 1.00 * phiChuanSM);
        expect(fee).toBeCloseTo(40);
    });

    it('Hệ số FYP: rate >= 115% => heSoFyp = 120%', () => {
        // rate=1.2, activeHC=7, k2=1.0
        // KD = 75% * 1.2 * 40 * 1.0 = 36; HĐ = 25% * 1.0 * 40 = 10 => total=46
        const fee = calculateSMTrainingFee('SM', 1.20, 7, 1.0);
        expect(fee).toBeCloseTo(0.75 * 1.20 * phiChuanSM * 1.0 + 0.25 * 1.00 * phiChuanSM);
        expect(fee).toBeCloseTo(46);
    });

    it('Bảng 7 - Hệ số hoạt động: activeHC < 3 => heSoHC = 0', () => {
        // Khi heSoHC=0: chỉ còn phần KD
        const fee = calculateSMTrainingFee('SM', 1.0, 2, 0.5);
        const expected = 0.75 * 1.0 * phiChuanSM * 0.5 + 0.25 * 0 * phiChuanSM;
        expect(fee).toBeCloseTo(expected);
    });

    it('Bảng 7: 3 <= activeHC < 5 => heSoHC = 25%', () => {
        const fee = calculateSMTrainingFee('SM', 1.0, 3, 0.5);
        const expected = 0.75 * 1.0 * phiChuanSM * 0.5 + 0.25 * 0.25 * phiChuanSM;
        expect(fee).toBeCloseTo(expected);
    });

    it('Bảng 7: 5 <= activeHC < 7 => heSoHC = 50%', () => {
        const fee = calculateSMTrainingFee('SM', 1.0, 5, 0.5);
        const expected = 0.75 * 1.0 * phiChuanSM * 0.5 + 0.25 * 0.50 * phiChuanSM;
        expect(fee).toBeCloseTo(expected);
    });

    it('Bảng 7: activeHC >= 7 => heSoHC = 100%', () => {
        const fee = calculateSMTrainingFee('SM', 1.0, 7, 0.5);
        const expected = 0.75 * 1.0 * phiChuanSM * 0.5 + 0.25 * 1.00 * phiChuanSM;
        expect(fee).toBeCloseTo(expected);
    });

    it('QUAN TRỌNG: phần HĐ (25%) KHÔNG nhân K2 — khi k2Coef=0, phần HĐ vẫn > 0', () => {
        // k2Coef=0 => KD = 0; HĐ = 25% * 1.0 * 40 = 10tr
        const fee = calculateSMTrainingFee('SM', 1.0, 7, 0);
        expect(fee).toBeCloseTo(0 + 0.25 * 1.00 * phiChuanSM);
        expect(fee).toBeGreaterThan(0);
    });

    it('Phí chuẩn theo chức danh: SM=40tr, EM=60tr, ERM=80tr, IRM=110tr', () => {
        // Kiểm tra tất cả role với cùng điều kiện (rate=1.0, activeHC=7, k2=1.0)
        expect(calculateSMTrainingFee('SM',  1.0, 7, 1.0)).toBeCloseTo(40 * (0.75 + 0.25));
        expect(calculateSMTrainingFee('EM',  1.0, 7, 1.0)).toBeCloseTo(60 * (0.75 + 0.25));
        expect(calculateSMTrainingFee('ERM', 1.0, 7, 1.0)).toBeCloseTo(80 * (0.75 + 0.25));
        expect(calculateSMTrainingFee('IRM', 1.0, 7, 1.0)).toBeCloseTo(110 * (0.75 + 0.25));
    });
});

// ============================================================
// 3. Phí Khai Thác Nhóm Hàng Tháng — MODULE 7 (business-logic.md)
// getSMDirectRate(completionRate) — Bảng 8
// getSMIndirectRate(role, completionRate) — Bảng 9
// calculateSMDirectFee & calculateSMIndirectFee
// ============================================================
describe('getSMDirectRate — tỷ lệ phí khai thác trực tiếp tháng SM (Bảng 8)', () => {
    it('completionRate < 80%: tỷ lệ = 6%', () => {
        expect(getSMDirectRate(0)).toBeCloseTo(0.06);
        expect(getSMDirectRate(0.50)).toBeCloseTo(0.06);
        expect(getSMDirectRate(0.79)).toBeCloseTo(0.06);
    });

    it('80% <= completionRate < 100%: tỷ lệ = 10%', () => {
        expect(getSMDirectRate(0.80)).toBeCloseTo(0.10);
        expect(getSMDirectRate(0.99)).toBeCloseTo(0.10);
    });

    it('completionRate >= 100%: tỷ lệ = 12%', () => {
        expect(getSMDirectRate(1.00)).toBeCloseTo(0.12);
        expect(getSMDirectRate(1.20)).toBeCloseTo(0.12);
    });
});

describe('getSMIndirectRate — tỷ lệ phí gián tiếp SM theo cấp & HT (Bảng 9)', () => {
    it('EM: <80%=2.4%, 80-<100%=4.0%, >=100%=4.8%', () => {
        expect(getSMIndirectRate('EM', 0.5)).toBeCloseTo(0.024);
        expect(getSMIndirectRate('EM', 0.9)).toBeCloseTo(0.040);
        expect(getSMIndirectRate('EM', 1.0)).toBeCloseTo(0.048);
    });

    it('ERM: <80%=1.8%, 80-<100%=3.0%, >=100%=3.6%', () => {
        expect(getSMIndirectRate('ERM', 0.5)).toBeCloseTo(0.018);
        expect(getSMIndirectRate('ERM', 0.9)).toBeCloseTo(0.030);
        expect(getSMIndirectRate('ERM', 1.0)).toBeCloseTo(0.036);
    });

    it('IRM: <80%=1.2%, 80-<100%=2.0%, >=100%=2.4%', () => {
        expect(getSMIndirectRate('IRM', 0.5)).toBeCloseTo(0.012);
        expect(getSMIndirectRate('IRM', 0.9)).toBeCloseTo(0.020);
        expect(getSMIndirectRate('IRM', 1.0)).toBeCloseTo(0.024);
    });

    it('SM: không có phí gián tiếp => 0%', () => {
        expect(getSMIndirectRate('SM', 1.0)).toBe(0);
    });
});

describe('calculateSMDirectFee — phí khai thác trực tiếp tháng SM', () => {
    it('FYP_TT=100tr, fycRate=30%, rate>=100% => FYC_TT=30tr; phí=30*0.12*K2', () => {
        const fee = calculateSMDirectFee(100, 0.30, 1.0, 1.0);
        expect(fee).toBeCloseTo(100 * 0.30 * 0.12 * 1.0); // = 3.6tr
    });

    it('completionRate < 80%: phí TT dùng 6%', () => {
        const fee = calculateSMDirectFee(100, 0.30, 0.50, 1.0);
        expect(fee).toBeCloseTo(100 * 0.30 * 0.06 * 1.0); // = 1.8tr
    });

    it('K2 nhân tuyến tính vào phí TT', () => {
        const fee100 = calculateSMDirectFee(100, 0.30, 1.0, 1.00);
        const fee120 = calculateSMDirectFee(100, 0.30, 1.0, 1.20);
        expect(fee120).toBeCloseTo(fee100 * 1.20);
    });
});

describe('calculateSMIndirectFee — phí khai thác gián tiếp tháng SM (Bảng 9)', () => {
    it('SM không có phí gián tiếp => 0', () => {
        expect(calculateSMIndirectFee('SM', 100, 50, 0, 0.30, 1.0, 1.0)).toBe(0);
    });

    it('EM: L1+L2+L3 FYP => phí = totalFyc x 4.8% x K2 (rate>=100%)', () => {
        // L1=100tr, L2=50tr, L3=0tr (EM không có L3), fycRate=30%, rate=1.0, K2=1.0
        // totalFYC = (100+50+0)*0.30 = 45tr; phí = 45 * 0.048 * 1.0 = 2.16tr
        expect(calculateSMIndirectFee('EM', 100, 50, 0, 0.30, 1.0, 1.0)).toBeCloseTo(2.16);
    });

    it('ERM rate>=100%: phí gián tiếp = totalFyc x 3.6% x K2', () => {
        // L1=100tr, L2=50tr, L3=30tr, fycRate=30%, rate=1.0, K2=1.0
        // totalFYC = (100+50+30)*0.30 = 54tr; phí = 54 * 0.036 * 1.0 = 1.944tr
        expect(calculateSMIndirectFee('ERM', 100, 50, 30, 0.30, 1.0, 1.0)).toBeCloseTo(1.944);
    });

    it('K2 nhân tuyến tính vào phí gián tiếp', () => {
        const fee100 = calculateSMIndirectFee('EM', 100, 0, 0, 0.30, 1.0, 1.00);
        const fee120 = calculateSMIndirectFee('EM', 100, 0, 0, 0.30, 1.0, 1.20);
        expect(fee120).toBeCloseTo(fee100 * 1.20);
    });
});

// ============================================================
// 4. Phí Khai Thác Nhóm Hàng Quý — MODULE 7 (business-logic.md)
// calculateSMQuarterBonus(...)
// ============================================================
describe('calculateSMQuarterBonus — phí khai thác quý SM', () => {
    it('SM: chỉ có phần TT (12%), không có gián tiếp', () => {
        // fypQTT=300tr, smFycRate=30%, k2=1.0, qTarget=100tr*3=300tr => rate=1.0
        // FYC_TT = 300*0.30 = 90tr; pctTT=12%
        // phí = (90*0.12 + 0) * 1.0 / 3 = 10.8/3 = 3.6tr
        expect(calculateSMQuarterBonus('SM', 300, 0, 0, 0, 0.30, 1.0, 1.0, 100))
            .toBeCloseTo(3.6);
    });

    it('EM: có thêm gián tiếp theo Bảng 9', () => {
        // fypQTT=300tr, L1=100tr, rate quý >= 100%
        // FYC_TT=90tr, FYC_L1=30tr; pctTT=12%, pctIndirect(EM, >=100%)=4.8%
        // phí = (90*0.12 + 30*0.048) * 1.0 / 3 = (10.8 + 1.44) / 3 = 12.24/3 = 4.08tr
        expect(calculateSMQuarterBonus('EM', 300, 100, 0, 0, 0.30, 1.0, 1.0, 100))
            .toBeCloseTo(4.08);
    });

    it('completionRate quý < 80%: pctTT = 6%', () => {
        // fypQTT=50tr, target=100tr*3=300tr => rate = 50/300 = 0.167 < 0.8
        // FYC_TT=50*0.30=15tr; pctTT=6%
        // phí = (15*0.06) * 1.0 / 3 = 0.9/3 = 0.3tr
        expect(calculateSMQuarterBonus('SM', 50, 0, 0, 0, 0.30, 1.0, 0.167, 100))
            .toBeCloseTo(0.3);
    });

    it('K2 nhân tuyến tính vào phí quý SM', () => {
        const q100 = calculateSMQuarterBonus('SM', 300, 0, 0, 0, 0.30, 1.00, 1.0, 100);
        const q120 = calculateSMQuarterBonus('SM', 300, 0, 0, 0, 0.30, 1.20, 1.0, 100);
        expect(q120).toBeCloseTo(q100 * 1.20);
    });
});

// ============================================================
// 5. Phí Năm — calcSMCompletionRate & Tổng Hợp SM Năm
// Bảng 1 & 2: Chỉ tiêu chuẩn năm, phân bổ tháng
// ============================================================
describe('calcSMCompletionRate — tỷ lệ hoàn thành chỉ tiêu SM (Bảng 1 & 5)', () => {
    it('Tính từ FYP và target: rate = totalFYP / targetMonth', () => {
        expect(calcSMCompletionRate(80, 100, 80)).toBeCloseTo(0.80); // dùng targetMil
        expect(calcSMCompletionRate(120, 100, 0)).toBeCloseTo(1.20);
    });

    it('Khi targetMil = 0: fallback về smTargetRatio / 100', () => {
        expect(calcSMCompletionRate(0, 0, 100)).toBeCloseTo(1.00);
        expect(calcSMCompletionRate(0, 0, 85)).toBeCloseTo(0.85);
    });
});

describe('Phí Năm — Mô Phỏng Chỉ Tiêu Phân Bổ Tháng SM (Bảng 2 spec.md §5.1)', () => {
    it('Chỉ tiêu chuẩn SM: 3200tr/năm; M1=4% => 128tr', () => {
        const targetYear = 3200;
        expect(targetYear * 0.04).toBeCloseTo(128);
    });

    it('Chỉ tiêu chuẩn EM: 8000tr/năm; M4-12=9.45% => 756tr', () => {
        const targetYear = 8000;
        expect(targetYear * 0.0945).toBeCloseTo(756);
    });

    it('Phí đào tạo năm SM (rate=100%, activeHC=7, K2=100%, 12 tháng): phí năm = 40tr x 12', () => {
        // Mô phỏng 12 tháng: rate=1.0, heSoFyp=1.0, heSoHC=1.0, k2=1.0
        // Mỗi tháng = 75%*1.0*40*1.0 + 25%*1.0*40 = 30 + 10 = 40tr
        const monthlyFee = calculateSMTrainingFee('SM', 1.0, 7, 1.0);
        expect(monthlyFee).toBeCloseTo(40);
        expect(monthlyFee * 12).toBeCloseTo(480);
    });

    it('Phí đào tạo năm SM với M12+ (K2=80% => 120%): phần KD được nhân 1.2 từ M12+', () => {
        // Tháng < 12: k2=1.00
        const feeEarly = calculateSMTrainingFee('SM', 1.0, 7, getK2Coefficient_SM(75, '1'));
        // Tháng >= 12: k2=1.20
        const feeLate = calculateSMTrainingFee('SM', 1.0, 7, getK2Coefficient_SM(75, '13+'));

        expect(feeEarly).toBeCloseTo(40); // 30 + 10
        // KD_late = 75%*1.0*40*1.2 = 36; HĐ_late = 25%*1.0*40 = 10 => 46tr
        expect(feeLate).toBeCloseTo(46);
        expect(feeLate).toBeGreaterThan(feeEarly);
    });
});
