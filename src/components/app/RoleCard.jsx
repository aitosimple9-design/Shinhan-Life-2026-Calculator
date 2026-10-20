import K2Selector from '../common/K2Selector.jsx';
import AgentPanel from './AgentPanel.jsx';
import ManagerPanel from './ManagerPanel.jsx';
import { TABS } from '../../constants/app-meta.js';

// Card 1: tab bar chức danh + panel của tab đang chọn + K2.
export default function RoleCard({ state, dispatch, perms, activeTab, onTabChange }) {
  const role = state.role;
  const allowAll = perms.allowedRoles.length === 0;
  const isRoleVisible = r => allowAll || perms.allowedRoles.includes(r);
  const visibleTabs = TABS.filter(t => allowAll || perms.allowedTabs.includes(t.id));

  const setField = (key, value) => dispatch({ type: 'UPDATE_STATE', payload: { key, value } });

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    const tab = TABS.find(t => t.id === tabId);
    if (!tab) return;
    const allowedInTab = tab.roles.filter(isRoleVisible);
    if (allowedInTab.length > 0) {
      dispatch({ type: 'UPDATE_STATE_BATCH', payload: { role: allowedInTab[0], hasPersonalSales: false } });
    }
  };

  const managerPanel = (tabId) => (
    <ManagerPanel
      tabId={tabId}
      roles={TABS.find(t => t.id === tabId).roles.filter(isRoleVisible)}
      activeRole={role}
      rbacActive={!allowAll}
      hasPersonalSales={state.hasPersonalSales}
      onRoleClick={r => setField('role', r)}
      onTogglePersonalSales={v => setField('hasPersonalSales', v)}
    />
  );

  return (
    <div className="card-base">
      {/* Tab Bar — chỉ hiện khi tài khoản có từ 2 nhóm chức danh trở lên */}
      {visibleTabs.length > 1 && (
        <>
          <h2 className="card-title">
            <i className="fa-solid fa-user-tie text-teal-600 dark:text-teal-400"></i> Chọn Chức Danh
          </h2>
          <div className="flex bg-slate-100 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-white/[0.05] p-1 rounded-2xl gap-1 mb-6" id="role-tabs">
            {visibleTabs.map(tab => (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`role-tab flex-1 py-2 px-3 rounded-xl text-sm transition-all ${activeTab === tab.id ? 'active' : ''}`}
              >
                <i className={`fa-solid ${tab.icon} mr-1`}></i> {tab.label}
              </button>
            ))}
          </div>
        </>
      )}

      {activeTab === 'agent' && (
        <AgentPanel
          isStarFC={role === 'StarFC'}
          rbacActive={!allowAll}
          onToggleStar={() => setField('role', role === 'StarFC' ? 'FC' : 'StarFC')}
        />
      )}
      {activeTab === 'sl' && managerPanel('sl')}
      {activeTab === 'sm' && managerPanel('sm')}

      {/* K2 Selector — shared across all roles */}
      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.05]">
        <K2Selector />
      </div>
    </div>
  );
}
