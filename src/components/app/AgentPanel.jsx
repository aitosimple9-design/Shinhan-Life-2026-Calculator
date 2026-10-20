import RolePanelShell from './RolePanelShell.jsx';
import RbacBadge from './RbacBadge.jsx';

export default function AgentPanel({ isStarFC, rbacActive, onToggleStar }) {
  return (
    <div id="tab-panel-agent">
      <RolePanelShell rbacActive={rbacActive}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
              <i className="fa-solid fa-user"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white">Đại lý - {isStarFC ? 'Star FC' : 'FC'}</span>
                <button
                  type="button"
                  onClick={onToggleStar}
                  title="Bấm để kích hoạt/tắt Star FC"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all active:scale-95 ${isStarFC
                    ? 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/40 text-yellow-700 dark:text-yellow-400'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-yellow-300 hover:text-yellow-600'}`}
                >
                  <i className="fa-solid fa-star mr-1"></i>Star FC
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Phân quyền tự động theo tài khoản đăng nhập</p>
            </div>
          </div>
          <RbacBadge active={rbacActive} />
        </div>
      </RolePanelShell>
    </div>
  );
}
