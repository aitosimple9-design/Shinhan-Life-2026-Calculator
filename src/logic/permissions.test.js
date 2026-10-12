import { describe, it, expect, vi } from 'vitest';
import {
  ROLE_PERMISSIONS, getCurrentUserTitle, getAllowedRoles, getAllowedTabs,
  getDefaultRole, isRoleAllowed,
} from './permissions.js';

describe('Phân quyền theo chức danh', () => {
  it('mỗi chức danh luôn được phép chính nó', () => {
    for (const title of Object.keys(ROLE_PERMISSIONS)) {
      expect(isRoleAllowed(title, title)).toBe(true);
    }
  });

  it('FC và StarFC cùng thấy tab agent, không thấy SL/SM', () => {
    expect(getAllowedTabs('FC')).toEqual(['agent']);
    expect(getAllowedTabs('StarFC')).toEqual(['agent']);
    expect(isRoleAllowed('FC', 'GSL')).toBe(false);
    expect(isRoleAllowed('FC', 'SM')).toBe(false);
  });

  it('SL chỉ thấy đúng cấp của mình, không leo thang sang SM', () => {
    expect(getAllowedRoles('SSL')).toEqual(['SSL']);
    expect(getAllowedTabs('SSL')).toEqual(['sl']);
    expect(isRoleAllowed('GSL', 'ESL')).toBe(false);
    expect(isRoleAllowed('ESL', 'SM')).toBe(false);
  });

  it('SM+ chỉ thấy tab sm và đúng cấp của mình', () => {
    for (const t of ['SM', 'EM', 'ERM', 'IRM']) {
      expect(getAllowedTabs(t)).toEqual(['sm']);
      expect(getAllowedRoles(t)).toEqual([t]);
    }
    expect(isRoleAllowed('SM', 'IRM')).toBe(false);
  });

  it('chức danh lạ / rỗng không có quyền gì (fail-closed)', () => {
    for (const bad of ['HACKER', '', undefined, null]) {
      expect(getAllowedRoles(bad)).toEqual([]);
      expect(getAllowedTabs(bad)).toEqual([]);
      expect(isRoleAllowed(bad, 'FC')).toBe(false);
    }
  });

  it('getDefaultRole fallback về FC khi không xác định', () => {
    expect(getDefaultRole('ERM')).toBe('ERM');
    expect(getDefaultRole('xyz')).toBe('FC');
  });

  it('getCurrentUserTitle ưu tiên role từ profile; không có thì null', () => {
    expect(getCurrentUserTitle('GSL')).toBe('GSL');
    vi.stubGlobal('window', { location: { search: '' } });
    expect(getCurrentUserTitle(null)).toBeNull();
    vi.unstubAllGlobals();
  });
});
