import React, { useEffect } from 'react';
import { useCalculatorState, useCalculatorDispatch } from '../../context/CalculatorContext.jsx';
import VndInput from '../common/VndInput.jsx';
import Toggle from '../common/Toggle.jsx';
import { formatVND } from '../../utils/format.js';

const SM_MONTHS = [
  { label:'M1', value:'1' },{ label:'M2', value:'2' },{ label:'M3', value:'3' },
  { label:'M4-M12', value:'4-12' },{ label:'M13+', value:'13+' }
];

const AITOM_GRADES = ['S', 'A', 'B', 'C', 'D'];

const SM_BASE_TARGETS = { SM: 3200000000, EM: 8000000000, ERM: 16000000000, IRM: 28000000000 };
const SM_MONTH_COEFS  = { '1': 0.04, '2': 0.05, '3': 0.06, '4-12': 0.0945 };

function calcSmTarget(role, monthMode) {
  const base  = SM_BASE_TARGETS[role] || 3200000000;
  const coef  = SM_MONTH_COEFS[monthMode] ?? 0.0833;
  return base * coef;
}

export default function SmLayout() {
  const state    = useCalculatorState();
  const dispatch = useCalculatorDispatch();
  const role     = state.role;

  const dispatch1 = (key, value) => dispatch({ type: 'UPDATE_STATE', payload: { key, value } });
  const dispatchBatch = patch => dispatch({ type: 'UPDATE_STATE_BATCH', payload: patch });

  // Auto-calc smTargetRevenue when role or monthMode changes (mirrors syncSmTarget() vanilla)
  useEffect(() => {
    const newTarget = calcSmTarget(role, state.monthMode);
    if (!state.smTargetModeUnlocked) {
      dispatchBatch({
        smTargetRevenue: newTarget,
        smActualRevenue: newTarget * (state.smTargetRatio / 100),
      });
    } else {
      dispatch1('smTargetRevenue', newTarget);
    }
  }, [role, state.monthMode]);

  // Sync monthMode on role change to SM+
  useEffect(() => {
    const validMonths = SM_MONTHS.map(m => m.value);
    if (!validMonths.includes(state.monthMode)) {
      dispatch1('monthMode', '1');
    }
  }, [role]);

  const showL1 = role !== 'SM';
  const showL2 = !['SM', 'EM'].includes(role);
  const showL3 = role === 'IRM';
  const showQIndirect = role !== 'SM';

  const targetFmt = formatVND(Math.round(state.smTargetRevenue));
  const actualFmt = formatVND(Math.round(state.smActualRevenue));

  return (
    <>
      {/* Card 2: Tháng Hoạt Động */}
      <div className="card-base">
        <h2 className="card-title">
          <i className="fa-regular fa-calendar-check text-teal-600 dark:text-teal-400"></i> Tháng Hoạt Động
        </h2>
        <div id="sm-month-btn-group" className="flex flex-wrap bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
          {SM_MONTHS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => dispatch1('monthMode', value)}
              className={`month-btn flex-1 py-3 px-3 min-h-[44px] rounded-md text-sm font-medium dark:text-slate-300 ${state.monthMode === value ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Card 4: Chỉ Số Nhóm SM+ */}
      <div className="card-base fade-in" id="team-section">
        <h2 className="card-title">
          <i className="fa-solid fa-crown text-teal-600 dark:text-teal-400"></i> Chỉ Số Nhóm ({role})
        </h2>

        {/* Chỉ Tiêu Doanh Số */}
        <div className="mb-3 p-3 bg-gradient-to-r from-teal-500/10 to-teal-600/5 rounded-xl border border-teal-300/40 dark:border-teal-600/30">
          <label className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2 mb-1.5">
            <i className="fa-solid fa-bullseye"></i>
            Chỉ tiêu doanh số tháng
            <span className="text-[10px] uppercase tracking-wide bg-teal-500 text-white px-2 py-0.5 rounded-full font-bold">Tự động</span>
          </label>
          <div className="relative">
            <input
              type="text" id="sm-target-number" readOnly
              value={targetFmt}
              className="tabular-num w-full pl-4 pr-12 py-2.5 text-lg font-extrabold tracking-wide rounded-xl
                text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800
                border-2 border-teal-400/50 dark:border-teal-500/40 focus:outline-none cursor-default"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 font-bold">₫</span>
          </div>
        </div>

        {/* 3-col: Tỷ lệ | DS thực tế | Số lượt — nổi bật giống style FC/SL */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Tỷ lệ HT */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Tỷ lệ HT (%)</label>
            <div className="relative">
              <input
                type="number" id="sm-target-ratio"
                value={state.smTargetRatio}
                readOnly={state.smTargetModeUnlocked}
                className={`w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 pl-3 pr-6 py-2 text-sm font-extrabold rounded-lg outline-none focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out
                  ${state.smTargetModeUnlocked ? '!bg-slate-200 dark:!bg-slate-900/40 !border-slate-300 dark:!border-slate-700 !text-slate-500 cursor-not-allowed' : ''}`}
                onChange={e => {
                  if (state.smTargetModeUnlocked) return;
                  const ratio     = Number(e.target.value) || 0;
                  const newActual = state.smTargetRevenue * (ratio / 100);
                  dispatchBatch({ smTargetRatio: ratio, smActualRevenue: newActual });
                }}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 text-xs font-medium">%</span>
            </div>
          </div>

          {/* DS Thực tế */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              DS Thực tế
              <button
                id="sm-unlock-btn"
                className="text-slate-400 hover:text-teal-500 transition-colors"
                title="Mở/Khóa sửa tay"
                onClick={() => dispatch1('smTargetModeUnlocked', !state.smTargetModeUnlocked)}
              >
                <i id="sm-lock-icon" className={`fa-solid fa-${state.smTargetModeUnlocked ? 'unlock text-xs text-teal-500' : 'lock text-xs'}`}></i>
              </button>
            </label>
            <div className="relative">
              {state.smTargetModeUnlocked ? (
                <VndInput
                  id="sm-actual-number"
                  value={state.smActualRevenue}
                  onChange={num => {
                    const ratio = state.smTargetRevenue > 0
                      ? Math.round((num / state.smTargetRevenue) * 10000) / 100
                      : 0;
                    dispatchBatch({ smActualRevenue: num, smTargetRatio: ratio });
                  }}
                  className="tabular-num w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 pl-2 pr-6 py-2 text-xs font-extrabold rounded-lg focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
                />
              ) : (
                <input
                  type="text" id="sm-actual-number" readOnly
                  value={actualFmt}
                  className="tabular-num w-full !bg-slate-200 dark:!bg-slate-900/40 border-2 border-slate-300 dark:border-slate-700 cursor-not-allowed text-slate-500 pl-2 pr-6 py-2 text-xs font-extrabold rounded-lg"
                />
              )}
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 text-xs font-medium">₫</span>
            </div>
          </div>

          {/* Số lượt HĐ */}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">Số lượt HĐ</label>
            <div className="relative">
              <input
                type="number" id="active-headcount-sm" value={state.activeHeadcountSm} min="1" max="999"
                onChange={e => dispatch1('activeHeadcountSm', parseInt(e.target.value) || 1)}
                className="w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 pl-3 pr-10 py-2 text-sm font-extrabold rounded-lg outline-none focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 text-xs font-medium">lượt</span>
            </div>
          </div>
        </div>

        {/* FYP Nhóm TT — nổi bật giống FYP Cá Nhân (FC) */}
        <div className="mb-6">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">FYP Nhóm Trực Tiếp</label>
          <div className="relative">
            <VndInput
              id="fyp-team-direct-sm"
              value={state.fypTeamDirectSm}
              onChange={v => dispatch1('fypTeamDirectSm', v)}
              placeholder="Ví dụ: 5.000.000.000"
              className="w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 pl-4 pr-16 py-4 text-lg font-extrabold rounded-xl focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 font-medium">₫</span>
          </div>
        </div>

        {/* FYP GT layers (EM, ERM, IRM) */}
        {showL1 && (
          <div id="sm-indirect-fields" className="space-y-3 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/30 mt-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">Nhóm Gián Tiếp</p>
            <div className={`grid grid-cols-1 gap-3 ${showL2 ? 'sm:grid-cols-2' : ''}`}>
              {/* L1 */}
              <div id="sm-indirect-l1-col" className={!showL2 ? 'sm:col-span-2' : ''}>
                <label className="input-label">FYP GT Lớp 1 (VNĐ)</label>
                <div className="relative">
                  <VndInput
                    id="fyp-indirect-sm-l1"
                    value={state.fypIndirectSmL1}
                    onChange={v => dispatch1('fypIndirectSmL1', v)}
                    placeholder="Ví dụ: 2.000.000.000"
                    className="vnd-input-base w-full pl-3 pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                </div>
              </div>
              {/* L2 */}
              {showL2 && (
                <div id="sm-indirect-l2-col">
                  <label className="input-label">FYP GT Lớp 2 (VNĐ)</label>
                  <div className="relative">
                    <VndInput
                      id="fyp-indirect-sm-l2"
                      value={state.fypIndirectSmL2}
                      onChange={v => dispatch1('fypIndirectSmL2', v)}
                      placeholder="Ví dụ: 1.000.000.000"
                      className="vnd-input-base w-full pl-3 pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                  </div>
                </div>
              )}
              {/* L3 */}
              {showL3 && (
                <div id="sm-indirect-l3-col" className="sm:col-span-2">
                  <label className="input-label">FYP GT Lớp 3 (VNĐ)</label>
                  <div className="relative">
                    <VndInput
                      id="fyp-indirect-sm-l3"
                      value={state.fypIndirectSmL3}
                      onChange={v => dispatch1('fypIndirectSmL3', v)}
                      placeholder="Ví dụ: 500.000.000"
                      className="vnd-input-base w-full pl-3 pr-10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SM+ Quarterly Bonus — nổi bật giống panel Thưởng Quý của FC */}
        <div id="sm-quarter-section" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium text-sm text-slate-800 dark:text-slate-200">Tính Phí Khai Thác Quý (SM+)</div>
              <div className="text-xs text-slate-500 mt-0.5">Thưởng quý dựa trên FYP nhóm (Nhập để ước tính)</div>
            </div>
            <Toggle
              id="has-sm-quarter-bonus"
              checked={state.hasSmQuarterBonus}
              onChange={v => dispatch1('hasSmQuarterBonus', v)}
            />
          </div>

          {state.hasSmQuarterBonus && (
            <div id="sm-quarter-fields" className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-xl border-2 border-teal-200 dark:border-teal-800/40 space-y-3 slide-in">
              {/* FYP TT Quý */}
              <div>
                <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP Nhóm TT Quý (VNĐ)</label>
                <div className="relative">
                  <VndInput
                    id="fyp-team-quarter-sm-number"
                    value={state.fypTeamQuarterSm}
                    onChange={v => dispatch1('fypTeamQuarterSm', v)}
                    placeholder="Ví dụ: 1.000.000.000"
                    className="vnd-input-base w-full pl-3 pr-10"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                </div>
              </div>

              {/* GT Quý (EM, ERM, IRM) */}
              {showQIndirect && (
                <div id="sm-quarter-indirect-fields" className="slide-in">
                  <div className={`grid grid-cols-1 gap-3 ${showL2 ? 'sm:grid-cols-2' : ''}`}>
                    {/* QL1 */}
                    <div id="sm-quarter-l1-col" className={!showL2 ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP Nhóm GT L1 Quý (VNĐ)</label>
                      <div className="relative">
                        <VndInput
                          id="fyp-quarter-indirect-sm-l1"
                          value={state.fypQuarterIndirectSmL1}
                          onChange={v => dispatch1('fypQuarterIndirectSmL1', v)}
                          placeholder="Ví dụ: 500.000.000"
                          className="vnd-input-base w-full pl-3 pr-10"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                      </div>
                    </div>
                    {/* QL2 */}
                    {showL2 && (
                      <div id="sm-quarter-l2-col">
                        <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP Nhóm GT L2 Quý (VNĐ)</label>
                        <div className="relative">
                          <VndInput
                            id="fyp-quarter-indirect-sm-l2"
                            value={state.fypQuarterIndirectSmL2}
                            onChange={v => dispatch1('fypQuarterIndirectSmL2', v)}
                            placeholder="Ví dụ: 300.000.000"
                            className="vnd-input-base w-full pl-3 pr-10"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                        </div>
                      </div>
                    )}
                    {/* QL3 */}
                    {showL3 && (
                      <div id="sm-quarter-l3-col" className="sm:col-span-2">
                        <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP Nhóm GT L3 Quý (VNĐ)</label>
                        <div className="relative">
                          <VndInput
                            id="fyp-quarter-indirect-sm-l3"
                            value={state.fypQuarterIndirectSmL3}
                            onChange={v => dispatch1('fypQuarterIndirectSmL3', v)}
                            placeholder="Ví dụ: 200.000.000"
                            className="vnd-input-base w-full pl-3 pr-10"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tỷ lệ Hoa hồng FYC (%) — nổi bật giống FC, đặt cuối cùng theo đúng vị trí của FC */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Tỷ lệ Hoa hồng FYC (%)</label>
          <input
            type="number" id="fyc-rate-sm"
            className="w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 text-base font-extrabold rounded-lg px-3 py-2.5 outline-none focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
            value={state.fycRateSm}
            onChange={e => dispatch1('fycRateSm', Number(e.target.value) || 30)}
          />
        </div>
      </div>

      {/* SM has personal sales → personal section */}
      {state.hasPersonalSales && (
        <SmPersonalSection state={state} dispatch1={dispatch1} />
      )}
    </>
  );
}

function SmPersonalSection({ state, dispatch1 }) {
  return (
    <div className="card-base" id="personal-section">
      <h2 className="card-title">
        <i className="fa-solid fa-chart-line text-teal-600 dark:text-teal-400"></i> Chỉ Số Cá Nhân
      </h2>

      {/* FYP — giống hệt style FC */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">FYP Cá Nhân</label>
          <span className="text-teal-700 dark:text-teal-400 font-bold text-sm">
            {(state.fyp / 1_000_000).toFixed(1)} tr
          </span>
        </div>
        <div className="relative">
          <VndInput
            id="fyp-number-input-sm"
            value={state.fyp}
            onChange={v => dispatch1('fyp', v)}
            placeholder="Ví dụ: 30.000.000"
            className="w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 pl-4 pr-16 py-4 text-lg font-extrabold rounded-xl focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 font-medium">₫</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Nhập số nguyên, hệ thống tự định dạng.</p>
      </div>

      {/* Thưởng Quý cá nhân — giống hệt panel Thưởng Quý của FC */}
      <div id="sm-personal-quarter-section" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium text-sm text-slate-800 dark:text-slate-200">Tính Thưởng Quý cá nhân</div>
          <Toggle
            id="has-quarter-bonus-sm"
            checked={state.hasQuarterBonus}
            onChange={v => dispatch1('hasQuarterBonus', v)}
          />
        </div>

        {state.hasQuarterBonus && (
          <div className="grid grid-cols-2 gap-4 bg-teal-50 dark:bg-teal-950/20 p-4 rounded-xl border-2 border-teal-200 dark:border-teal-800/40 slide-in">
            <div>
              <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP Quý Cá nhân (VNĐ)</label>
              <div className="relative">
                <VndInput
                  id="fyp-quarter-number-sm"
                  value={state.fypQuarter}
                  onChange={v => dispatch1('fypQuarter', v)}
                  placeholder="0"
                  className="vnd-input-base text-sm py-2 w-full pl-3 pr-6"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">Số tháng HĐ</label>
              <div className="relative">
                <select
                  id="quarter-active-months-sm"
                  value={state.quarterActiveMonths}
                  onChange={e => dispatch1('quarterActiveMonths', parseInt(e.target.value))}
                  className="w-full appearance-none bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg border-2 border-teal-700 dark:border-teal-500 pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/40 transition-all duration-150"
                >
                  <option value="1">1 tháng (80%)</option>
                  <option value="2">2 tháng (100%)</option>
                  <option value="3">3 tháng (120%)</option>
                </select>
                <i className="fa-solid fa-chevron-down text-white text-xs absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"></i>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AiTOM Grade — ảnh hưởng trực tiếp đến Thưởng năng suất tháng (giống hệt FC) */}
      <div id="aitom-container" className="mt-6">
        <label className="input-label">AiTOM Grade</label>
        <div className="bg-slate-950/40 p-1.5 rounded-xl border border-white/[0.04] grid grid-cols-5 gap-1.5" id="aitom-btn-group-sm">
          {AITOM_GRADES.map(g => (
            <button
              key={g}
              data-grade={g}
              onClick={() => dispatch1('aitom', g)}
              className={`aitom-btn py-2.5 min-h-[44px] rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 ${state.aitom === g ? 'active' : ''}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
