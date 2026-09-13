// js/permissions.js
export const ROLE_PERMISSIONS = {
  'FC': ['FC', 'StarFC'],
  'StarFC': ['FC', 'StarFC'],
  'GSL': ['GSL'],
  'SSL': ['SSL'],
  'ESL': ['ESL'],
  'SM': ['SM'],
  'EM': ['EM'],
  'ERM': ['ERM'],
  'IRM': ['IRM']
};

export const ROLE_TO_TAB = {
  'FC': 'agent',
  'StarFC': 'agent',
  'GSL': 'sl',
  'SSL': 'sl',
  'ESL': 'sl',
  'SM': 'sm',
  'EM': 'sm',
  'ERM': 'sm',
  'IRM': 'sm'
};

export const PLACEHOLDER_USER_TITLE = 'FC';

/**
 * Xác định chức danh (role) hiện tại của người dùng.
 * Nguồn chính: role lấy từ dòng `profiles` của user đang đăng nhập
 * (Supabase session) — truyền vào qua tham số `profileRole`.
 * Phương án dự phòng ?debugTitle= trên URL CHỈ hoạt động ở môi trường dev
 * cục bộ (import.meta.env.DEV === true) — tự động tắt hẳn khi build
 * production để người dùng thật không thể tự đổi role qua URL.
 * @param {string|null} [profileRole]
 * @returns {string|null} - null nghĩa là chưa xác định được role (chưa đăng
 *   nhập hoặc tài khoản chưa được gán chức danh).
 */
export function getCurrentUserTitle(profileRole = null) {
  if (profileRole) return profileRole;
  if (import.meta.env.DEV) {
    const urlParams = new URLSearchParams(window.location.search);
    const debugTitle = urlParams.get('debugTitle');
    if (debugTitle) return debugTitle;
  }
  return null;
}

export function getAllowedRoles(userTitle) {
  return ROLE_PERMISSIONS[userTitle] || [];
}

export function getAllowedTabs(userTitle) {
  const allowedRoles = getAllowedRoles(userTitle);
  const tabs = new Set(allowedRoles.map(role => ROLE_TO_TAB[role]));
  return Array.from(tabs);
}

export function getDefaultRole(userTitle) {
  const allowedRoles = getAllowedRoles(userTitle);
  return allowedRoles.length > 0 ? allowedRoles[0] : PLACEHOLDER_USER_TITLE;
}

export function isRoleAllowed(userTitle, role) {
  const allowedRoles = getAllowedRoles(userTitle);
  return allowedRoles.includes(role);
}
