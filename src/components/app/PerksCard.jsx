// Card 5: Danh Hiệu & Thưởng Thêm
export default function PerksCard({ state, dispatch }) {
  const setField = (key, value) => dispatch({ type: 'UPDATE_STATE', payload: { key, value } });
  return (
    <div className="card-base" id="perks-section">
      <h2 className="card-title">
        <i className="fa-solid fa-gift text-teal-600 dark:text-teal-400"></i> Danh Hiệu &amp; Thưởng Thêm
      </h2>
      <div className="space-y-3">
        <div className="perk-row-base flex items-center justify-between gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50 min-h-[64px]">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-slate-800 dark:text-slate-200">Shinhan Partner</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Thưởng thêm % trên FYC tháng</div>
          </div>
          <select
            id="partner-level"
            className="input-base shrink-0"
            style={{ width: 'auto' }}
            value={state.partner}
            onChange={e => setField('partner', e.target.value)}
          >
            <option value="none">Không</option>
            <option value="G">G-Partner (+10%)</option>
            <option value="S">S-Partner (+15%)</option>
            <option value="E">E-Partner (+20%)</option>
          </select>
        </div>
        <label className="perk-row-base cursor-pointer flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-700/50 min-h-[64px]">
          <div>
            <div className="font-medium text-sm text-slate-800 dark:text-slate-200">Đạt mốc MDRT Quý</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Ước tính thưởng TB 5tr/tháng</div>
          </div>
          <div className="relative flex items-center">
            <input
              type="checkbox" id="mdrt-check" className="peer sr-only"
              checked={state.mdrt}
              onChange={e => setField('mdrt', e.target.checked)}
            />
            <div className="toggle-track peer-checked:bg-teal-600 w-11 h-6 bg-slate-200 rounded-full relative"></div>
          </div>
        </label>
      </div>
    </div>
  );
}
