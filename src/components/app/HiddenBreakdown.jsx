import { useState } from 'react';
import { formatCurrencyPhone } from '../../utils/format.js';
import { BREAKDOWN_LABELS } from '../../constants/app-meta.js';

// Accordion "Các khoản đã ẩn" trong màn hình điện thoại.
export default function HiddenBreakdown({ state, dispatch, breakdown }) {
  const [open, setOpen] = useState(false);
  const hiddenCount = state.hiddenKeys.length;
  if (hiddenCount === 0) return null;

  const rows = state.hiddenKeys.map(key => {
    if (key.startsWith('extra_')) {
      const id = parseInt(key.split('_')[1]);
      const b = state.extraBonuses.find(x => x.id === id);
      return b
        ? {
          key, label: b.name || 'Khoản thưởng khác',
          val: b.type === 'quarter' ? b.amountVND / 3_000_000 : b.amountVND / 1_000_000
        }
        : null;
    }
    return { key, label: BREAKDOWN_LABELS[key] || key, val: breakdown[key] || 0 };
  }).filter(Boolean);

  return (
    <div id="hidden-breakdown-container" className="mt-4 pt-4 border-t border-white/[0.1]">
      <button
        id="toggle-hidden-breakdown"
        className="w-full text-xs text-teal-400/80 mb-2 flex items-center justify-between p-2 rounded hover:bg-white/[0.05] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span>
          <i className="fa-solid fa-eye-slash mr-1"></i>
          Các khoản đã ẩn (<span id="hidden-count">{hiddenCount}</span>)
        </span>
        <i className={`fa-solid fa-chevron-down transition-transform duration-200 ${open ? 'rotate-180' : ''}`} id="hidden-chevron"></i>
      </button>
      {open && (
        <div id="hidden-rows-list" className="space-y-0">
          {rows.map(({ key, label, val }) => (
            <div key={key} className="flex items-center gap-2 py-2 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors rounded px-2">
              <button
                className="eye-btn-restore shrink-0"
                data-key={key}
                title="Khôi phục khoản này"
                onClick={() => dispatch({ type: 'DELETE_HIDDEN_KEY', payload: key })}
              >
                <i className="fa-regular fa-eye-slash text-teal-400/80 hover:text-teal-300 transition-colors"></i>
              </button>
              <span className="text-slate-400 text-xs flex-1 line-through decoration-white/20 truncate">{label}</span>
              <span className="text-slate-500 font-semibold text-xs shrink-0">{formatCurrencyPhone(val)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
