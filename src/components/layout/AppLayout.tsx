import React, { Suspense, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { LiveChatWidget } from '../chat/LiveChatWidget';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-600 p-4">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold animate-pulse text-center">Initializing Priyex HRMS Enterprise Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-slate-50 text-slate-900 w-full overflow-x-hidden">
      {/* Sidebar: Desktop Sticky + Mobile Slide Drawer */}
      <Sidebar
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header with hamburger toggle */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-24 lg:pb-8 overflow-y-auto overflow-x-hidden w-full">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-600 rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Loading view...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>

        {/* Mobile Bottom Navigation Dock */}
        <BottomNav onOpenMenu={() => setIsMobileMenuOpen(true)} />

        {/* Global Live HR Chat Floating Widget */}
        <LiveChatWidget />
      </div>
    </div>
  );
};
