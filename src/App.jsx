import React, { useState } from 'react';
import { CalculatorProvider, useCalculatorState, useCalculatorDispatch } from './context/CalculatorContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { usePermissions } from './hooks/usePermissions.js';
import { useDarkMode } from './hooks/useDarkMode.js';
import { useCalculator } from './hooks/useCalculator.js';
import { useAnimatedNumber } from './hooks/useAnimatedNumber.js';
import { useUrlInit } from './hooks/useUrlInit.js';
import { isFC, isSL } from './logic/role-groups.js';
import { getK2Coefficient } from './logic/calculator.js';
import FcLayout from './components/layouts/FcLayout.jsx';
import SlLayout from './components/layouts/SlLayout.jsx';
import SmLayout from './components/layouts/SmLayout.jsx';
import { ExtraBonusList } from './components/common/ExtraBonusList.jsx';
import AppHeader from './components/app/AppHeader.jsx';
import RoleCard from './components/app/RoleCard.jsx';
import PerksCard from './components/app/PerksCard.jsx';
import PhonePreview from './components/app/PhonePreview.jsx';
import AuthGate from './components/app/AuthGate.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import './App.css';

const PreviewPage = React.lazy(() => import('./pages/PreviewPage.jsx'));

function AppInner() {
  const state = useCalculatorState();
  const dispatch = useCalculatorDispatch();
  const perms = usePermissions();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const { signOut, profile } = useAuth();

  const { visible: visibleTotal, full } = useCalculator();
  const animatedTotal = useAnimatedNumber(visibleTotal, 280);

  const [activeTab, setActiveTab] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Khởi tạo từ URL params (một lần khi mount)
  useUrlInit(perms, dispatch, toggleDark, isDark, setActiveTab);

  // Mật khẩu mặc định (ngày sinh + CCCD) phải được đổi ở lần đăng nhập đầu.
  if (profile?.must_change_password) {
    return <ChangePasswordPage forced onDone={() => {}} />;
  }
  if (showChangePassword) {
    return <ChangePasswordPage onDone={() => setShowChangePassword(false)} />;
  }

  const role = state.role;
  const layout = isFC(role) ? 'fc' : isSL(role) ? 'sl' : 'sm';
  const showPerks = isFC(role) || state.hasPersonalSales;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans antialiased min-h-screen transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AppHeader
          isDark={isDark}
          onToggleDark={toggleDark}
          onChangePassword={() => setShowChangePassword(true)}
          onSignOut={signOut}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="w-full lg:col-span-7 space-y-6">
            <RoleCard state={state} dispatch={dispatch} perms={perms} activeTab={activeTab} onTabChange={setActiveTab} />

            {layout === 'fc' && <FcLayout />}
            {layout === 'sl' && <SlLayout />}
            {layout === 'sm' && <SmLayout />}

            {showPerks && <PerksCard state={state} dispatch={dispatch} />}

            <div className="card-base">
              <h2 className="card-title">
                <i className="fa-solid fa-circle-plus text-teal-600 dark:text-teal-400"></i> Khoản Thưởng Khác (Nếu có)
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                Áp dụng cho tất cả chức danh. Số tiền sẽ được cộng trực tiếp vào Tổng Thu Nhập.
              </p>
              <ExtraBonusList />
            </div>
          </div>

          <PhonePreview
            state={state}
            dispatch={dispatch}
            breakdown={full.breakdown}
            animatedTotal={animatedTotal}
            k2Coef={getK2Coefficient(state)}
          />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  // Launcher nội bộ xem nhanh giao diện theo chức danh — chỉ có ở dev,
  // bản production không lộ trang này cho người chưa đăng nhập.
  if (import.meta.env.DEV && window.location.pathname === '/previewpage') {
    return (
      <React.Suspense fallback={<div className="p-8 text-slate-400">Đang tải...</div>}>
        <PreviewPage />
      </React.Suspense>
    );
  }

  return (
    <AuthProvider>
      <CalculatorProvider>
        <AuthGate>
          <AppInner />
        </AuthGate>
      </CalculatorProvider>
    </AuthProvider>
  );
}
