import { describe, it, expect } from 'vitest';
import { GROUP_ROLES, isFC, isSL, isSM, getGroup, getGroupClass } from './role-groups.js';

describe('Nhóm chức danh', () => {
  it('mỗi role thuộc đúng một nhóm', () => {
    for (const [group, roles] of Object.entries(GROUP_ROLES)) {
      for (const r of roles) {
        expect([isFC(r), isSL(r), isSM(r)].filter(Boolean)).toHaveLength(1);
        expect(getGroup(r)).toBe(group);
        expect(getGroupClass(r)).toBe(`theme-${group.toLowerCase()}`);
      }
    }
  });
  it('role lạ fallback về FC', () => {
    expect(getGroup('???')).toBe('FC');
    expect(getGroupClass(undefined)).toBe('theme-fc');
  });
});
