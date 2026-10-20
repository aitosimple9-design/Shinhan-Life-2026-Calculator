export const TABS = [
  { id: 'agent', label: 'Đại lý', icon: 'fa-user', roles: ['FC', 'StarFC'] },
  { id: 'sl', label: 'Quản lý (SL+)', icon: 'fa-users', roles: ['GSL', 'SSL', 'ESL'] },
  { id: 'sm', label: 'Cấp cao (SM+)', icon: 'fa-crown', roles: ['SM', 'EM', 'ERM', 'IRM'] },
];

export const ROLE_META = {
  FC: { label: 'FC', icon: 'fa-user', sub: null },
  StarFC: { label: 'Star FC', icon: 'fa-star', sub: null, iconClass: 'text-yellow-400' },
  GSL: { label: 'GSL', letter: 'G', sub: 'Trưởng nhóm Kinh doanh' },
  SSL: { label: 'SSL', letter: 'S', sub: 'Trưởng ban Kinh doanh' },
  ESL: { label: 'ESL', letter: 'E', sub: 'Trưởng ban Kinh doanh Cấp cao' },
  SM: { label: 'SM', sub: 'Giám đốc Kinh doanh Vùng' },
  EM: { label: 'EM', sub: 'Giám đốc Kinh doanh Vùng Cấp cao' },
  ERM: { label: 'ERM', sub: 'Giám đốc Kinh doanh Vùng Cấp cao hơn' },
  IRM: { label: 'IRM', sub: 'Giám đốc Kinh doanh Miền' },
};

export const BREAKDOWN_LABELS = {
  fyc: 'Hoa hồng cơ bản (FYC)',
  bonusMonth: 'Thưởng năng suất tháng',
  bonusQuarter: 'Thưởng quý (BQ/tháng)',
  starSupport: 'Hỗ trợ tài chính Ngôi sao',
  mgmtTraining: 'Phí đào tạo đội ngũ',
  mgmtDirect: 'Phí khai thác trực tiếp tháng',
  mgmtQuarter: 'Phí khai thác Quý (BQ/tháng)',
  mgmtIndirect: 'Phí khai thác gián tiếp L1/L2',
  mgmtIndirectSm: 'Phí quản lý nhóm gián tiếp',
  partner: 'Thưởng Shinhan Partner',
  mdrt: 'Thưởng tiến độ MDRT (BQ)',
};
