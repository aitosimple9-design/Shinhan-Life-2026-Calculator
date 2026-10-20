const HEADER_BTN = 'flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm text-sm font-medium';

export default function AppHeader({ isDark, onToggleDark, onChangePassword, onSignOut }) {
  return (
    <header className="mb-8 flex items-center justify-between flex-wrap gap-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <i className="fa-solid fa-calculator text-teal-600 dark:text-teal-400"></i>
          Shinhan Life 2026 Calculator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Công cụ ước tính thu nhập &amp; phí dịch vụ Đại lý/Quản lý kinh doanh
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          id="dark-toggle"
          aria-label="Chuyển chế độ sáng/tối"
          onClick={onToggleDark}
          className={`${HEADER_BTN} text-slate-600 dark:text-yellow-400`}
        >
          <i id="dm-icon-sun" className="fa-solid fa-sun text-base transition-all duration-300" style={{ display: isDark ? 'none' : undefined }}></i>
          <i id="dm-icon-moon" className="fa-solid fa-moon text-base transition-all duration-300" style={{ display: isDark ? undefined : 'none' }}></i>
          <span id="dm-label" className="mode-label">{isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}</span>
        </button>
        <button
          id="change-password-btn"
          aria-label="Đổi mật khẩu"
          title="Đổi mật khẩu"
          onClick={onChangePassword}
          className={`${HEADER_BTN} text-slate-600 dark:text-slate-300`}
        >
          <i className="fa-solid fa-key text-base"></i>
        </button>
        <button
          id="logout-btn"
          aria-label="Đăng xuất"
          title="Đăng xuất"
          onClick={onSignOut}
          className={`${HEADER_BTN} text-slate-600 dark:text-red-400`}
        >
          <i className="fa-solid fa-right-from-bracket text-base"></i>
        </button>
      </div>
    </header>
  );
}
