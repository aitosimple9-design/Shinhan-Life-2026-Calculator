import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ChangePasswordPage({ onDone, forced = false }) {
  const { updatePassword, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setSubmitting(true);
    const { error: updateError } = await updatePassword(newPassword);
    setSubmitting(false);
    if (updateError) {
      setError('Đổi mật khẩu thất bại: ' + updateError.message);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="card-base w-full max-w-sm space-y-4">
        <h1 className="font-[family-name:var(--font-display)] text-lg font-bold text-slate-900 dark:text-white text-center">Đổi mật khẩu</h1>
        {forced && !success && (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Bạn đang dùng mật khẩu mặc định. Vui lòng đặt mật khẩu mới để tiếp tục.
          </p>
        )}

        {success ? (
          <div className="space-y-4">
            <p className="text-sm text-teal-600 dark:text-teal-400 text-center">
              Đổi mật khẩu thành công.
            </p>
            <button
              onClick={onDone}
              className="w-full py-2.5 rounded-[var(--radius-control)] font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all duration-150"
            >
              Quay lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Mật khẩu mới</label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="input-label">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={forced ? signOut : onDone}
                className="flex-1 py-2.5 rounded-[var(--radius-control)] font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95 transition-all duration-150"
              >
                {forced ? 'Đăng xuất' : 'Huỷ'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-[var(--radius-control)] font-semibold text-white bg-teal-600 hover:bg-teal-700 active:scale-95 transition-all duration-150 disabled:opacity-60"
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
