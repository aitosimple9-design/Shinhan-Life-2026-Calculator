/**
 * Chuyển mã số nhân viên/đại lý (vd: 60004226) thành email nội bộ giả để
 * Supabase Auth nhận diện tài khoản. Người dùng không bao giờ thấy email
 * này — chỉ dùng nội bộ khi gọi supabase.auth.*.
 * @param {string|number} employeeCode
 * @returns {string}
 */
export function employeeCodeToInternalEmail(employeeCode) {
  return `emp${employeeCode}@shinhanlife.internal`;
}
