import React, { Suspense, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { LiveChatWidget } from '../chat/LiveChatWidget';
import { BroadcastBanner, AnnouncementItem } from '../notifications/BroadcastBanner';
import { ForceChangePasswordModal } from '../auth/ForceChangePasswordModal';
import { X, Flame, AlertTriangle, Info } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [selectedBannerAnnouncement, setSelectedBannerAnnouncement] = useState<AnnouncementItem | null>(null);

  const handleDismissBanner = (id: number) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
  };

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
    <div
      className="flex min-h-screen min-h-[100dvh] text-slate-900 w-full overflow-x-hidden transition-colors duration-300"
      style={{ background: 'var(--theme-page-bg, #f8fafc)' }}
    >
      {/* Sidebar: Desktop Sticky + Mobile Slide Drawer */}
      <Sidebar
        mobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Header with hamburger toggle & notification callback */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onAnnouncementsChange={setAnnouncements}
        />

        {/* Global Broadcast Announcement Top Banner (Visible to all users) */}
        <BroadcastBanner
          announcements={announcements}
          onDismiss={handleDismissBanner}
          onViewDetails={setSelectedBannerAnnouncement}
        />

        {/* Banner Announcement Detail Modal */}
        {selectedBannerAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  {selectedBannerAnnouncement.priority === 'URGENT' ? (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-600" />
                      Urgent Announcement
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Important Notice
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBannerAnnouncement(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedBannerAnnouncement.title}
                </h3>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedBannerAnnouncement.body}
                </p>
                <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
                  Broadcast to all employees across the organization
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleDismissBanner(selectedBannerAnnouncement.id);
                    setSelectedBannerAnnouncement(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                >
                  Acknowledge & Close
                </button>
              </div>
            </div>
          </div>
        )}

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

        {/* Mandatory Password Change Modal on First Login */}
        <ForceChangePasswordModal />
      </div>
    </div>
  );
};
