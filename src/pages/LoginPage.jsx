import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeCode || !password) return;
    setSubmitting(true);
    setError('');
    const { error: signInError } = await signIn(employeeCode.trim(), password);
    setSubmitting(false);
    if (signInError) {
      setError('Mã số nhân viên hoặc mật khẩu không đúng.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <form onSubmit={handleSubmit} className="card-base w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center text-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white text-xl mb-3">
            <i className="fa-solid fa-calculator"></i>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900 dark:text-white">Shinhan Life 2026 Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        <div>
          <label className="input-label">Mã số nhân viên</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="username"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            className="input-base"
            placeholder="VD: 6000zzxx"
          />
        </div>

        <div>
          <label className="input-label">Mật khẩu</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-[var(--radius-control)] font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all duration-150 disabled:opacity-60"
        >
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
