import React, { lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { prewarmBackend } from './api/client';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage').then(m => ({ default: m.EmployeesPage })));
const ProfileRequestsPage = lazy(() => import('./pages/ProfileRequestsPage').then(m => ({ default: m.ProfileRequestsPage })));
const AttendancePage = lazy(() => import('./pages/AttendancePage').then(m => ({ default: m.AttendancePage })));
const PayrollPage = lazy(() => import('./pages/PayrollPage').then(m => ({ default: m.PayrollPage })));
const OrganizationPage = lazy(() => import('./pages/OrganizationPage').then(m => ({ default: m.OrganizationPage })));
const UsersRolesPage = lazy(() => import('./pages/UsersRolesPage').then(m => ({ default: m.UsersRolesPage })));
const AuditLogsPage = lazy(() => import('./pages/AuditLogsPage').then(m => ({ default: m.AuditLogsPage })));
const SupportDeskPage = lazy(() => import('./pages/SupportDeskPage').then(m => ({ default: m.SupportDeskPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));

export const App: React.FC = () => {
  useEffect(() => {
    // 1. Initial wake-up ping
    prewarmBackend();

    // 2. Keep-alive heartbeat: ping /health every 10 minutes to prevent Render free-tier sleep
    const interval = setInterval(() => {
      prewarmBackend();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/employees" element={<EmployeesPage />} />
                <Route path="/requests" element={<ProfileRequestsPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/payroll" element={<PayrollPage />} />
                <Route path="/organization" element={<OrganizationPage />} />
                <Route path="/support-desk" element={<SupportDeskPage />} />
                <Route path="/admin/users" element={<UsersRolesPage />} />
                <Route path="/audit-logs" element={<AuditLogsPage />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
