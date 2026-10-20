// Khung "Chức danh của bạn" dùng chung cho 3 tab (Agent / SL+ / SM+).
export default function RolePanelShell({ rbacActive, className = '', children }) {
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-slate-950/40 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chức danh của bạn</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${rbacActive ? 'bg-teal-500' : 'bg-amber-500'}`}></span>
          Tài khoản đăng nhập
        </span>
      </div>
      {children}
    </div>
  );
}
