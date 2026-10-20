import RolePanelShell from './RolePanelShell.jsx';
import RbacBadge from './RbacBadge.jsx';
import { ROLE_META } from '../../constants/app-meta.js';

// Panel chọn cấp bậc + toggle doanh số cá nhân, dùng chung cho tab SL+ và SM+.
// `tabId` ('sl' | 'sm') quyết định id DOM: tab-panel-{tabId}, has-personal-sales-{tabId}.
export default function ManagerPanel({ tabId, roles, activeRole, rbacActive, hasPersonalSales, onRoleClick, onTogglePersonalSales }) {
  return (
    <div id={`tab-panel-${tabId}`}>
      <RolePanelShell rbacActive={rbacActive} className="mb-4">
        <div className="flex flex-col gap-3">
          {roles.map(r => {
            const m = ROLE_META[r];
            const active = activeRole === r;
            return (
              <button
                key={r} data-role={r}
                onClick={() => onRoleClick(r)}
                className="flex items-center justify-between gap-3 flex-wrap w-full text-left transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${active ? 'bg-teal-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {m.letter || m.label[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{m.label}</span>
                      {m.sub && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                          {m.sub}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Phân quyền tự động theo tài khoản đăng nhập</p>
                  </div>
                </div>
                {active && <RbacBadge active={rbacActive} />}
              </button>
            );
          })}
        </div>
      </RolePanelShell>

      <label className="personal-sales-toggle-base flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl cursor-pointer">
        <div>
          <div className="font-medium text-sm text-teal-900 dark:text-teal-200">Có phát sinh doanh số cá nhân trong tháng?</div>
          <div className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">Nếu có, sẽ tính dồn thêm FYC + Thưởng cá nhân</div>
        </div>
        <div className="relative flex items-center ml-4 shrink-0">
          <input
            type="checkbox" id={`has-personal-sales-${tabId}`} className="peer sr-only"
            checked={hasPersonalSales}
            onChange={e => onTogglePersonalSales(e.target.checked)}
          />
          <div className="toggle-track peer-checked:bg-teal-600 w-11 h-6 bg-slate-200 rounded-full relative"></div>
        </div>
      </label>
    </div>
  );
}
