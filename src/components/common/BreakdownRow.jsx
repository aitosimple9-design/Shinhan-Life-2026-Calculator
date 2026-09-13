import React, { useCallback } from 'react';
import { useCalculatorState, useCalculatorDispatch } from '../../context/CalculatorContext.jsx';
import { formatCurrencyPhone } from '../../utils/format.js';

// Chấm màu trang trí đầu mỗi dòng — phân loại nhanh bằng mắt theo nhóm khoản
const DOT_COLORS = {
  fyc: 'bg-teal-400',
  bonusMonth: 'bg-amber-400',
  bonusQuarter: 'bg-blue-400',
  starSupport: 'bg-yellow-400',
  mgmtTraining: 'bg-indigo-400',
  mgmtDirect: 'bg-sky-400',
  mgmtQuarter: 'bg-blue-400',
  mgmtIndirect: 'bg-violet-400',
  mgmtIndirectSm: 'bg-violet-400',
  partner: 'bg-purple-400',
  mdrt: 'bg-pink-400',
};

// BreakdownRow: 1 dòng trong bảng breakdown phone.
// Nhận key, label, val (triệu). Hiển thị eye icon, ẩn/hiện qua hiddenKeys.
export default function BreakdownRow({ rowKey, label, val, className = '' }) {
  const state = useCalculatorState();
  const dispatch = useCalculatorDispatch();

  const isHidden = state.hiddenKeys.includes(rowKey);

  const toggle = useCallback((e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_HIDDEN_KEY', payload: rowKey });
  }, [rowKey, dispatch]);

  if (val <= 0.0001 && !isHidden) return null;

  return (
    <div
      className={`breakdown-row flex items-center gap-3 py-2.5 border-b border-white/[0.06] last:border-0 ${className}`}
      data-key={rowKey}
    >
      <button
        className="eye-btn shrink-0"
        onClick={toggle}
        title="Ẩn/hiện khoản này"
      >
        <i className={`fa-regular ${isHidden ? 'fa-eye-slash text-slate-500' : 'fa-eye text-teal-400/60 hover:text-teal-300'} transition-colors`}></i>
      </button>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHidden ? 'bg-slate-600' : (DOT_COLORS[rowKey] || 'bg-teal-400')}`}></span>
      <span className="text-slate-300 flex-1 truncate text-sm">{label}</span>
      <span className={`breakdown-val text-yellow-400 font-semibold text-sm shrink-0 ${isHidden ? 'val-hidden' : ''}`}>
        {formatCurrencyPhone(val)}
      </span>
    </div>
  );
}
