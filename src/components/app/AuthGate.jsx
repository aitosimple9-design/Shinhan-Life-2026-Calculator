import { useAuth } from '../../context/AuthContext.jsx';
import LoginPage from '../../pages/LoginPage.jsx';

const FULL_SCREEN = 'min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900';

// Cổng xác thực: đang tải / chưa đăng nhập / chưa gán chức danh.
export default function AuthGate({ children }) {
  const { session, profile, loading } = useAuth();

  // Dev-only bypass: cho phép PreviewPage/launcher xem nhanh giao diện qua
  // ?debugTitle= mà không cần đăng nhập thật — CHỈ hoạt động ở môi trường dev
  // (import.meta.env.DEV === true), tự động tắt hẳn khi build production.
  const devBypass = import.meta.env.DEV && new URLSearchParams(window.location.search).get('debugTitle');
  if (devBypass) return children;

  if (loading) {
    return <div className={`${FULL_SCREEN} text-slate-400`}>Đang tải...</div>;
  }
  if (!session) return <LoginPage />;

  if (!profile?.role) {
    return (
      <div className={`${FULL_SCREEN} px-4`}>
        <div className="max-w-sm text-center space-y-4">
          <i className="fa-solid fa-circle-exclamation text-amber-500 text-3xl"></i>
          <p className="text-slate-700 dark:text-slate-200 font-medium">
            Tài khoản chưa được gán chức danh, liên hệ quản trị viên.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
