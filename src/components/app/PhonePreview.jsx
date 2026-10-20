import FypSummaryCard from '../common/FypSummaryCard.jsx';
import BreakdownRow from '../common/BreakdownRow.jsx';
import { ExtraBonusPhoneRows } from '../common/ExtraBonusList.jsx';
import HiddenBreakdown from './HiddenBreakdown.jsx';
import { formatCurrencyPhone } from '../../utils/format.js';
import { isFC, isSL, isSM } from '../../logic/role-groups.js';
import { ROLE_META, BREAKDOWN_LABELS } from '../../constants/app-meta.js';

const PILL = 'text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border';

// Cột phải: khung iPhone hiển thị tổng hợp FYP + kết quả + breakdown.
export default function PhonePreview({ state, dispatch, breakdown, animatedTotal, k2Coef }) {
  const role = state.role;
  const isStarFC = role === 'StarFC';
  const roleLabel = ROLE_META[role]?.label || role;
  const groupLabel = isFC(role) ? 'ĐẠI LÝ' : isSL(role) ? 'QUẢN LÝ' : 'CẤP CAO';
  const resultTitle = isFC(role)
    ? `Tổng thu nhập ước tính (${role})`
    : `Tổng phí dịch vụ ước tính (${role})`;
  const showAitom = isFC(role) || ((isSL(role) || isSM(role)) && state.hasPersonalSales);

  return (
    <div className="w-full lg:col-span-5 lg:sticky lg:top-8">
      <div
        id="phone-mockup"
        className="relative mx-auto max-w-[440px] w-full border-0 md:border-[10px] border-slate-950 dark:border-slate-700 rounded-none md:rounded-[50px] bg-slate-950 dark:bg-slate-800 shadow-none md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] ring-0 md:ring-1 ring-white/10 overflow-hidden transition-colors duration-300"
      >
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 pt-4 px-6 pb-2 h-12 justify-between items-center z-20 text-white text-xs hidden md:flex">
          <div className="font-sans tracking-tight font-medium text-white/90">9:41</div>
          <div className="space-x-1.5 flex items-center text-white/90">
            <i className="fa-solid fa-signal"></i>
            <i className="fa-solid fa-wifi"></i>
            <i className="fa-solid fa-battery-three-quarters text-sm"></i>
          </div>
        </div>
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 hidden md:flex items-center justify-between px-3">
          <div className="w-1.5 h-1.5 bg-transparent"></div>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        </div>
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/25 rounded-full z-30 hidden md:block"></div>

        <div
          id="phone-screen"
          className="phone-screen w-full h-[760px] md:h-[800px] overflow-y-auto scroll-smooth flex flex-col p-5 pt-14 pb-8 space-y-4 rounded-none md:rounded-[40px] bg-gradient-to-tr from-slate-950 via-teal-950 to-emerald-950 dark:from-slate-800 dark:via-teal-900 dark:to-emerald-900 relative transition-colors duration-300"
        >
          {/* Status Pills: role + tháng + AiTOM */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`${PILL} bg-teal-500/15 text-teal-300 border-teal-500/20`}>
              {groupLabel}{isStarFC ? ' + STAR FC' : ` - ${roleLabel}`}
            </span>
            <span className={`${PILL} bg-white/[0.06] text-slate-300 border-white/[0.08]`}>
              M{state.monthMode}
            </span>
            {showAitom && (
              <span className={`${PILL} bg-yellow-500/15 text-yellow-300 border-yellow-500/20 ml-auto`}>
                <i className="fa-solid fa-star mr-1"></i>AiTOM Hạng {state.aitom}
              </span>
            )}
          </div>

          <div id="fyp-summary-card" className="glass-card p-4">
            <h3 className="text-teal-300/80 font-[family-name:var(--font-display)] text-xs font-semibold mb-3">
              <i className="fa-solid fa-chart-column mr-1"></i> Tổng hợp doanh số FYP
            </h3>
            <div className="space-y-1.5 text-xs">
              <FypSummaryCard />
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 id="result-title" className="text-teal-300/80 font-[family-name:var(--font-display)] text-xs font-semibold">
                {resultTitle}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/20 shrink-0">
                K2 ×{k2Coef.toFixed(2)}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span id="total-income" className="text-yellow-400 font-extrabold text-3xl tracking-tight transition-all duration-300">
                {formatCurrencyPhone(animatedTotal)}
              </span>
              <span className="text-xl text-teal-200">VNĐ</span>
            </div>
            <div className="text-sm text-teal-400/80 mb-4">/ tháng, tính theo mức chỉ số hiện tại</div>

            <div id="breakdown-rows" className="pt-2 text-sm space-y-0">
              {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => (
                <BreakdownRow key={key} rowKey={key} label={label} val={breakdown[key] || 0} />
              ))}
              <ExtraBonusPhoneRows />
              <HiddenBreakdown state={state} dispatch={dispatch} breakdown={breakdown} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
