import { useEffect } from 'react';

const TABS_ROLE_MAP = [
  { id: 'agent', roles: ['FC', 'StarFC'] },
  { id: 'sl', roles: ['GSL', 'SSL', 'ESL'] },
  { id: 'sm', roles: ['SM', 'EM', 'ERM', 'IRM'] },
];

/**
 * Đọc tham số URL (?dark=, ?role=, ?personal=) lúc mount và khởi tạo
 * dark mode / role / tab / hasPersonalSales tương ứng — logic được chuyển
 * nguyên vẹn từ App.jsx (không đổi hành vi).
 */
export function useUrlInit(perms, dispatch, toggleDark, isDark, setActiveTab) {
  const dispatch1 = (key, value) => dispatch({ type: 'UPDATE_STATE', payload: { key, value } });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Dark mode
    if (params.get('dark') === '1') {
      if (!isDark) toggleDark();
    }

    // Determine starting role (respects permissions)
    let targetRole = params.get('role');
    if (perms.allowedRoles.length > 0) {
      if (targetRole && !perms.allowedRoles.includes(targetRole)) {
        console.warn(`[Permissions] Role "${targetRole}" không được phép cho "${perms.userTitle}". Fallback.`);
        targetRole = perms.defaultRole;
      } else if (!targetRole) {
        targetRole = perms.defaultRole;
      }
    }

    // Find which tab that role belongs to
    const targetTab = TABS_ROLE_MAP.find(t => t.roles.includes(targetRole));
    if (targetTab && perms.allowedTabs.includes(targetTab.id)) {
      setActiveTab(targetTab.id);
      dispatch1('role', targetRole);
    } else if (perms.allowedTabs.length > 0) {
      const firstTab = TABS_ROLE_MAP.find(t => perms.allowedTabs.includes(t.id));
      if (firstTab) {
        setActiveTab(firstTab.id);
        dispatch1('role', perms.allowedRoles[0]);
      }
    } else {
      // No permissions → show all
      setActiveTab('agent');
      dispatch1('role', 'FC');
    }

    // Personal sales
    if (params.get('personal') === '1') {
      dispatch1('hasPersonalSales', true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
