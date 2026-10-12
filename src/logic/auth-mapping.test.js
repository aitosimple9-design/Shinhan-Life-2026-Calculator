import { describe, it, expect } from 'vitest';
import { employeeCodeToInternalEmail } from './auth-mapping.js';

describe('Ánh xạ mã nhân viên → email nội bộ', () => {
  it('chuỗi và số cho cùng kết quả', () => {
    expect(employeeCodeToInternalEmail('60004226')).toBe('emp60004226@shinhanlife.internal');
    expect(employeeCodeToInternalEmail(60004226)).toBe(employeeCodeToInternalEmail('60004226'));
  });
  it('mã khác nhau → email khác nhau (không đụng tài khoản)', () => {
    expect(employeeCodeToInternalEmail('1')).not.toBe(employeeCodeToInternalEmail('2'));
  });
});
