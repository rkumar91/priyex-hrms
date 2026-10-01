import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Megaphone,
  Flame,
  AlertTriangle,
  Info,
  Clock,
  User,
  X,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isHrAdmin } from '../../utils/rbac';
import api from '../../api/client';
import { PostAnnouncementModal } from './PostAnnouncementModal';
import { AnnouncementItem } from './BroadcastBanner';

interface NotificationCenterProps {
  onAnnouncementsChange?: (items: AnnouncementItem[]) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onAnnouncementsChange
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'URGENT'>('ALL');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch broadcasts
  const fetchBroadcasts = async () => {
    try {
      const res: any = await api.get('/notifications/broadcasts');
      if (res.success && Array.isArray(res.data)) {
        setAnnouncements(res.data);
        if (onAnnouncementsChange) onAnnouncementsChange(res.data);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchBroadcasts();
    // Poll every 15 seconds for updates
    const interval = setInterval(fetchBroadcasts, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = announcements.filter((a) => !a.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    );
    try {
      await api.put(`/notifications/broadcasts/${id}/read`);
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    setAnnouncements((prev) => prev.map((a) => ({ ...a, isRead: true })));
    try {
      await api.put('/notifications/broadcasts/read-all');
    } catch (e) {
      // ignore
    }
  };

  const filtered = announcements.filter((a) => {
    if (activeTab === 'UNREAD') return !a.isRead;
    if (activeTab === 'URGENT') return a.priority === 'URGENT' || a.priority === 'HIGH';
    return true;
  });

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return {
          icon: Flame,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'Urgent'
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: 'Important'
        };
      default:
        return {
          icon: Info,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Announcement'
        };
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications center"
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition-all duration-200 cursor-pointer active:scale-95"
        title="Organization Notifications & Announcements"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 sm:top-14 w-[calc(100vw-2rem)] max-w-sm sm:w-96 bg-white border border-slate-200/80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Notices & Broadcasts</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 p-1 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              {isHrAdmin(user) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsPostModalOpen(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                  title="Broadcast new announcement"
                >
                  <span>+ Broadcast</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 px-4 py-2 bg-slate-50/60 border-b border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({announcements.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('UNREAD')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'UNREAD'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('URGENT')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                activeTab === 'URGENT'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Urgent & Important
            </button>
          </div>

          {/* List of Announcements */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No announcements found</p>
                <p className="text-[11px] text-slate-400">All organization notices will appear here</p>
              </div>
            ) : (
              filtered.map((item) => {
                const pConfig = getPriorityConfig(item.priority);
                const Icon = pConfig.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!item.isRead) handleMarkAsRead(item.id);
                      setSelectedAnnouncement(item);
                    }}
                    className={`p-3.5 hover:bg-slate-50/90 transition-colors cursor-pointer text-xs space-y-1.5 ${
                      !item.isRead ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${pConfig.bg}`}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        <span>{pConfig.label}</span>
                      </span>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(item.createdAt || item.publishedAt)}</span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 leading-snug line-clamp-1">
                      {item.title}
                    </h4>

                    <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                      {item.body}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>By {item.creatorName || 'HR Management'}</span>
                      <span className="text-blue-600 font-semibold hover:underline">View details →</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Org-wide notices are broadcast to all team members in real-time
            </p>
          </div>
        </div>
      )}

      {/* Post Announcement Modal */}
      <PostAnnouncementModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSuccess={() => {
          fetchBroadcasts();
        }}
      />

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${
                    getPriorityConfig(selectedAnnouncement.priority).bg
                  }`}
                >
                  {getPriorityConfig(selectedAnnouncement.priority).label}
                </span>
                <span className="text-xs text-slate-400">
                  {formatTime(selectedAnnouncement.createdAt || selectedAnnouncement.publishedAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">
                {selectedAnnouncement.title}
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {selectedAnnouncement.body}
              </p>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>Announced by {selectedAnnouncement.creatorName || 'HR Management'}</span>
                <span>Audience: {selectedAnnouncement.targetAudience}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
