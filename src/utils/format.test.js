import { describe, it, expect } from 'vitest';
import { formatVND, parseVND, formatMillionsToVND, formatCurrencyPhone, roundMil } from './format.js';

describe('Định dạng tiền VNĐ', () => {
  it('0 / rỗng / NaN → "0"', () => {
    expect(formatVND(0)).toBe('0');
    expect(formatVND(undefined)).toBe('0');
    expect(formatVND(NaN)).toBe('0');
  });
  it('số rất lớn (10 tỷ) format rồi parse lại không lệch', () => {
    expect(parseVND(formatVND(10_000_000_000))).toBe(10_000_000_000);
  });
  it('parseVND ký tự không hợp lệ → 0 (không throw)', () => {
    expect(parseVND('abc')).toBe(0);
    expect(parseVND('')).toBe(0);
    expect(parseVND('1.000.000')).toBe(1_000_000);
    expect(parseVND(5)).toBe(5);
  });
  it('triệu → VNĐ', () => {
    expect(formatMillionsToVND(1.5)).toContain('₫');
    expect(parseVND(formatCurrencyPhone(2))).toBe(2_000_000);
    expect(formatCurrencyPhone(0)).toBe('0');
  });
  it('roundMil làm tròn 6 chữ số', () => {
    expect(roundMil(0.1 + 0.2)).toBe(0.3);
  });
});
