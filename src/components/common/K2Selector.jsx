import React, { useEffect, useMemo } from 'react';
import { useCalculatorState, useCalculatorDispatch } from '../../context/CalculatorContext.jsx';
import { K2_DEFAULT_PCT, getK2Coefficient } from '../../logic/calculator.js';
import { getGroup } from '../../logic/role-groups.js';

export default function K2Selector() {
  const state = useCalculatorState();
  const dispatch = useCalculatorDispatch();
  const role = state.role;
  const group = getGroup(role);

  const curVal = state.k2Bracket;
  const hasVal = typeof curVal === 'number' && Number.isFinite(curVal);

  useEffect(() => {
    if (!hasVal) {
      dispatch({
        type: 'UPDATE_STATE',
        payload: { key: 'k2Bracket', value: K2_DEFAULT_PCT[group] }
      });
    }
  }, [hasVal, group, dispatch]);

  const subtitle = useMemo(() => {
    if (group === 'FC') return 'K2 cá nhân — ảnh hưởng đến Thưởng năng suất (FC)';
    if (group === 'SL') return 'K2 Toàn Nhóm — ảnh hưởng đến Phí đào tạo & Khai thác (SL+)';
    return 'K2 Toàn Nhóm — ảnh hưởng đến Phí đào tạo & Chăm sóc KH (SM+)';
  }, [group]);

  const coef = getK2Coefficient(state);
  // Tông màu theo tầng hệ số — nổi bật + tạo điểm nhấn theo mức đang chọn
  let tier = { text: 'text-red-500 dark:text-red-400', ring: 'focus-within:ring-red-500/40 focus-within:border-red-400', box: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30', num: 'text-red-600 dark:text-red-400' };
  if (coef >= 1.0) tier = { text: 'text-teal-600 dark:text-teal-400', ring: 'focus-within:ring-teal-500/40 focus-within:border-teal-400', box: 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/30', num: 'text-teal-700 dark:text-teal-300' };
  else if (coef >= 0.65) tier = { text: 'text-amber-600 dark:text-amber-400', ring: 'focus-within:ring-amber-500/40 focus-within:border-amber-400', box: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30', num: 'text-amber-700 dark:text-amber-300' };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Hệ số K2</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</span>
      </div>
      <label className={`flex items-center gap-1.5 w-full border-2 rounded-lg px-3 py-2.5 cursor-text focus-within:ring-4 transition-all duration-200 ease-out ${tier.box} ${tier.ring}`}>
        <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">K2 ≥</span>
        <span className="flex items-baseline shrink-0">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            style={{ width: `${Math.max(1, String(typeof curVal === 'number' ? curVal : '').length)}ch` }}
            className={`bg-transparent text-base font-extrabold outline-none ${tier.num}`}
            value={typeof curVal === 'number' ? curVal : ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              let v = digits === '' ? 0 : Number(digits);
              if (v > 150) v = 150;
              dispatch({ type: 'UPDATE_STATE', payload: { key: 'k2Bracket', value: v } });
            }}
          />
          <span className={`text-sm font-bold ml-0.5 ${tier.num} opacity-70`}>%</span>
        </span>
        <span className="flex-1"></span>
        <span className={`text-xs font-bold shrink-0 ${tier.text}`}>(Hệ số ×{coef.toFixed(2)})</span>
        <i className={`fa-solid fa-chevron-down text-xs shrink-0 ${tier.text}`}></i>
      </label>
    </div>
  );
}
