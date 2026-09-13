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
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-black/5 p-6 space-y-4"
      >
        <div className="text-center mb-2">
          <i className="fa-solid fa-calculator text-teal-600 dark:text-teal-400 text-3xl mb-2"></i>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Shinhan Life 2026 Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Mã số nhân viên</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="username"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:outline-none block p-2.5 transition-all duration-200 ease-out"
            placeholder="VD: 60004226"
          />
        </div>

        <div>
          <label className="block text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Mật khẩu</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 focus:outline-none block p-2.5 transition-all duration-200 ease-out"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all duration-150 disabled:opacity-60"
        >
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
