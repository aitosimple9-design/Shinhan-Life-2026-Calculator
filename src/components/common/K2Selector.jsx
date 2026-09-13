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
  let badgeColor = 'text-red-400';
  if (coef >= 1.0) badgeColor = 'text-teal-500';
  else if (coef >= 0.65) badgeColor = 'text-yellow-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Hệ số K2</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</span>
      </div>
      <label className="flex items-center gap-1.5 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 cursor-text focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all duration-200 ease-out">
        <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">K2 ≥</span>
        <input
          type="number"
          min="0"
          max="150"
          step="1"
          className="w-12 bg-transparent text-sm font-bold text-slate-900 dark:text-slate-100 outline-none [appearance:textfield]"
          value={typeof curVal === 'number' ? curVal : ''}
          onChange={(e) => {
            let v = Number(e.target.value);
            if (!Number.isFinite(v) || v < 0) v = 0;
            if (v > 150) v = 150;
            dispatch({ type: 'UPDATE_STATE', payload: { key: 'k2Bracket', value: v } });
          }}
        />
        <span className="text-sm text-slate-500 dark:text-slate-400 shrink-0">%</span>
        <span className="flex-1"></span>
        <span className={`text-xs font-semibold shrink-0 ${badgeColor}`}>(Hệ số ×{coef.toFixed(2)})</span>
        <i className="fa-solid fa-chevron-down text-slate-400 dark:text-slate-500 text-xs shrink-0"></i>
      </label>
    </div>
  );
}
