import React, { useEffect } from 'react';
import { useCalculatorState, useCalculatorDispatch } from '../../context/CalculatorContext.jsx';
import VndInput from '../common/VndInput.jsx';
import Toggle from '../common/Toggle.jsx';

const GSL_MONTHS = [{ label:'M1 - M9', value:'1-9' },{ label:'M10 - M11', value:'10-11' },{ label:'M12+', value:'12+' }];
const SSL_MONTHS = [{ label:'M1 - M11', value:'1-11' },{ label:'M12', value:'12' },{ label:'M13+', value:'13+' }];
const ESL_MONTHS = [{ label:'M1 - M11', value:'1-11' },{ label:'M12 - M15', value:'12-15' },{ label:'M16+', value:'16+' }];

const AITOM_GRADES = ['S', 'A', 'B', 'C', 'D'];

const ROLE_MONTHS = { GSL: GSL_MONTHS, SSL: SSL_MONTHS, ESL: ESL_MONTHS };
const ROLE_MONTH_DEFAULTS = { GSL: '1-9', SSL: '1-11', ESL: '1-11' };

function MonthBtnGroup({ months, monthMode, onSelect }) {
  return (
    <div className="flex flex-wrap bg-slate-100 dark:bg-slate-700 rounded-lg p-1 gap-1">
      {months.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`month-btn flex-1 py-3 px-3 min-h-[44px] rounded-md text-sm font-medium dark:text-slate-300 ${monthMode === value ? 'active' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function SlLayout() {
  const state    = useCalculatorState();
  const dispatch = useCalculatorDispatch();
  const role     = state.role;

  const dispatch1 = (key, value) => dispatch({ type: 'UPDATE_STATE', payload: { key, value } });

  const months = ROLE_MONTHS[role] || GSL_MONTHS;

  // Sync monthMode khi switch role trong SL
  useEffect(() => {
    const validMonths = (ROLE_MONTHS[role] || []).map(m => m.value);
    if (!validMonths.includes(state.monthMode)) {
      dispatch1('monthMode', ROLE_MONTH_DEFAULTS[role] || '1-9');
    }
  }, [role]);

  const showHeadcount = state.slAppointmentType !== 'promotion';
  const showL1 = role === 'SSL' || role === 'ESL';
  const showL2 = role === 'ESL';

  return (
    <>
      {/* Card 2: Tháng Hoạt Động */}
      <div className="card-base">
        <h2 className="card-title">
          <i className="fa-regular fa-calendar-check text-teal-600 dark:text-teal-400"></i> Tháng Hoạt Động
        </h2>
        <MonthBtnGroup months={months} monthMode={state.monthMode} onSelect={v => dispatch1('monthMode', v)} />
      </div>

      {/* Card 4: Chỉ Số Nhóm / Ban — vị trí & thứ tự đồng bộ với FcLayout (FYP → field phụ → Thưởng Quý → Tỷ lệ HH) */}
      <div className="card-base fade-in" id="team-section">
        <h2 className="card-title">
          <i className="fa-solid fa-users text-teal-600 dark:text-teal-400"></i> Chỉ Số Nhóm / Ban
        </h2>

        {/* SL Appointment type */}
        <div id="sl-appointment-row" className="mb-4 flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/[0.05]">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Loại Bổ Nhiệm</label>
            <div className="text-xs text-slate-500">Chỉ áp dụng Phí Đào tạo cho Tuyển ngang</div>
          </div>
          <div className="flex bg-slate-200 dark:bg-slate-900 p-1 rounded-lg shrink-0">
            {[{label:'Tuyển ngang', value:'lateral'},{label:'Thăng cấp', value:'promotion'}].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => dispatch1('slAppointmentType', value)}
                className={`appointment-btn px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
                  ${state.slAppointmentType === value
                    ? 'active bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* FYP Nhóm TT + Số lượt — 2 cột bằng nhau, style nổi bật giống FYP Cá Nhân (FC) */}
        <div id="sl-team-direct-section" className="mb-6">
          <div className={`grid gap-3 ${showHeadcount ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* FYP TT */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">FYP Nhóm TT</label>
                <span className="text-teal-700 dark:text-teal-400 font-bold text-xs">
                  {Number(state.fycTeamDirect).toFixed(1)} tr
                </span>
              </div>
              <div className="relative">
                <VndInput
                  id="fyc-team-direct-number"
                  value={state.fycTeamDirect * 1_000_000}
                  onChange={num => dispatch1('fycTeamDirect', num / 1_000_000)}
                  placeholder="100.000.000"
                  className="w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 pl-3 pr-8 py-2.5 text-base font-extrabold rounded-lg focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 text-xs font-medium">₫</span>
              </div>
            </div>

            {/* Số lượt */}
            {showHeadcount && (
              <div id="active-headcount-row">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Số lượt HĐ</label>
                <div className="relative">
                  <input
                    type="number" id="active-headcount" value={state.activeHeadcount} min="1" max="99"
                    onChange={e => dispatch1('activeHeadcount', parseInt(e.target.value) || 1)}
                    className="w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 pl-3 pr-12 py-2.5 text-base font-extrabold rounded-lg outline-none focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500 dark:text-teal-400 text-xs font-medium">lượt</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SL Indirect fields (SSL, ESL) */}
        {(showL1 || showL2) && (
          <div className="flex flex-col sm:flex-row gap-4 mb-5 bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
            {showL1 && (
              <div id="indirect-l1-row" className="flex-1">
                <label className="input-label">FYP Gián Tiếp Lớp 1 (VNĐ)</label>
                <div className="relative">
                  <VndInput
                    id="fyc-team-indirect-l1"
                    value={state.fycTeamIndirectL1 * 1_000_000}
                    onChange={num => dispatch1('fycTeamIndirectL1', num / 1_000_000)}
                    placeholder="Ví dụ: 50.000.000"
                    className="vnd-input-large w-full pl-4 pr-14 py-4 text-lg font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">₫</span>
                </div>
              </div>
            )}
            {showL2 && (
              <div id="indirect-l2-row" className="flex-1">
                <label className="input-label">FYP Gián Tiếp Lớp 2 (VNĐ)</label>
                <div className="relative">
                  <VndInput
                    id="fyc-team-indirect-l2"
                    value={state.fycTeamIndirectL2 * 1_000_000}
                    onChange={num => dispatch1('fycTeamIndirectL2', num / 1_000_000)}
                    placeholder="Ví dụ: 30.000.000"
                    className="vnd-input-large w-full pl-4 pr-14 py-4 text-lg font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">₫</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tính Phí Khai Thác Quý — nổi bật giống panel Thưởng Quý của FC */}
        <div id="sl-quarter-section" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-medium text-sm text-slate-800 dark:text-slate-200">Tính Phí Khai Thác Quý</div>
              <div className="text-xs text-slate-500 mt-0.5">Tính phí khai thác dựa trên FYP nhóm quý</div>
            </div>
            <Toggle
              id="has-sl-quarter-bonus"
              checked={state.hasSlQuarterBonus}
              onChange={v => dispatch1('hasSlQuarterBonus', v)}
            />
          </div>

          {state.hasSlQuarterBonus && (
            <div className="grid grid-cols-2 gap-4 bg-teal-50 dark:bg-teal-950/20 p-4 rounded-xl border-2 border-teal-200 dark:border-teal-800/40 slide-in">
              {/* FYP TT Quý — col-span logic: GSL/ESL col-span-2; SSL col-span-1 */}
              <div id="sl-quarter-direct-col" className={role === 'SSL' ? 'col-span-1' : 'col-span-2'}>
                <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP Nhóm TT Quý (VNĐ)</label>
                <div className="relative">
                  <VndInput
                    id="fyp-team-quarter-number"
                    value={state.fypTeamQuarter}
                    onChange={v => dispatch1('fypTeamQuarter', v)}
                    placeholder="Ví dụ: 300.000.000"
                    className="vnd-input-base text-sm py-2 w-full pl-3 pr-6"
                  />
                </div>
              </div>
              {showL1 && (
                <div id="fyc-team-indirect-l1-quarter-col">
                  <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP GT L1 Quý (VNĐ)</label>
                  <div className="relative">
                    <VndInput
                      id="fyc-team-indirect-l1-quarter"
                      value={state.fycTeamIndirectL1Quarter}
                      onChange={v => dispatch1('fycTeamIndirectL1Quarter', v)}
                      placeholder="Ví dụ: 50.000.000"
                      className="vnd-input-base text-sm py-2 w-full pl-3 pr-6"
                    />
                  </div>
                </div>
              )}
              {showL2 && (
                <div id="fyc-team-indirect-l2-quarter-col">
                  <label className="block text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">FYP GT L2 Quý (VNĐ)</label>
                  <div className="relative">
                    <VndInput
                      id="fyc-team-indirect-l2-quarter"
                      value={state.fycTeamIndirectL2Quarter}
                      onChange={v => dispatch1('fycTeamIndirectL2Quarter', v)}
                      placeholder="Ví dụ: 30.000.000"
                      className="vnd-input-base text-sm py-2 w-full pl-3 pr-6"
                    />
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
            type="number" id="fyc-rate-sl"
            className="w-full bg-teal-50 dark:bg-teal-500/10 border-2 border-teal-200 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 text-base font-extrabold rounded-lg px-3 py-2.5 outline-none focus:ring-4 focus:ring-teal-500/40 focus:border-teal-400 transition-all duration-200 ease-out"
            value={state.fycRateSl}
            onChange={e => dispatch1('fycRateSl', Number(e.target.value) || 30)}
          />
        </div>
      </div>

      {/* SL has personal sales → render FcLayout's personal section */}
      {state.hasPersonalSales && (
        <SlPersonalSection state={state} dispatch1={dispatch1} />
      )}
    </>
  );
}

// Personal section shared when SL has personal sales
function SlPersonalSection({ state, dispatch1 }) {
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
            id="fyp-number-input-sl"
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
      <div id="sl-personal-quarter-section" className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium text-sm text-slate-800 dark:text-slate-200">Tính Thưởng Quý cá nhân</div>
          <Toggle
            id="has-quarter-bonus-sl"
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
                  id="fyp-quarter-number-sl"
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
                  id="quarter-active-months-sl"
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
        <div className="bg-slate-950/40 p-1.5 rounded-xl border border-white/[0.04] grid grid-cols-5 gap-1.5" id="aitom-btn-group-sl">
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
