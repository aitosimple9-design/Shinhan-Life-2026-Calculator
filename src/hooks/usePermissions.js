import { useMemo } from 'react';
import { getCurrentUserTitle, getAllowedRoles, getAllowedTabs, getDefaultRole, isRoleAllowed } from '../logic/permissions.js';
import { useAuth } from '../context/AuthContext.jsx';

export function usePermissions() {
  const { profile } = useAuth();
  const userTitle = getCurrentUserTitle(profile?.role);
  const allowedRoles = useMemo(() => getAllowedRoles(userTitle), [userTitle]);
  const allowedTabs = useMemo(() => getAllowedTabs(userTitle), [userTitle]);
  const defaultRole = useMemo(() => getDefaultRole(userTitle), [userTitle]);

  return {
    userTitle,
    allowedRoles,
    allowedTabs,
    defaultRole,
    isRoleAllowed: (role) => isRoleAllowed(userTitle, role)
  };
}
