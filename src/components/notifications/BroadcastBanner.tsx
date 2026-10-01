import React, { useState } from 'react';
import { Flame, AlertTriangle, X, ChevronRight } from 'lucide-react';
import api from '../../api/client';

export interface AnnouncementItem {
  id: number;
  title: string;
  body: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  targetAudience: string;
  isRead?: boolean;
  publishedAt?: string;
  createdAt?: string;
  creatorName?: string;
}

interface BroadcastBannerProps {
  announcements: AnnouncementItem[];
  onDismiss: (id: number) => void;
  onViewDetails: (announcement: AnnouncementItem) => void;
}

export const BroadcastBanner: React.FC<BroadcastBannerProps> = ({
  announcements,
  onDismiss,
  onViewDetails
}) => {
  // Find the top unread URGENT or HIGH priority announcement
  const urgentAnnouncement = announcements.find(
    (a) => !a.isRead && (a.priority === 'URGENT' || a.priority === 'HIGH')
  );

  if (!urgentAnnouncement) return null;

  const isUrgent = urgentAnnouncement.priority === 'URGENT';

  const handleDismiss = async () => {
    try {
      await api.put(`/notifications/broadcasts/${urgentAnnouncement.id}/read`);
    } catch (e) {
      // ignore
    }
    onDismiss(urgentAnnouncement.id);
  };

  return (
    <div
      className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-white shadow-md transition-all z-20 ${
        isUrgent
          ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-600'
          : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="p-1 rounded-lg bg-white/20 shrink-0">
          {isUrgent ? <Flame className="w-4 h-4 animate-bounce" /> : <AlertTriangle className="w-4 h-4" />}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-wrap text-xs">
          <span className="font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/25 text-[10px]">
            {isUrgent ? 'URGENT NOTICE' : 'IMPORTANT NOTICE'}
          </span>
          <span className="font-bold truncate">{urgentAnnouncement.title}</span>
          <span className="hidden md:inline text-white/85 font-normal truncate max-w-md">
            — {urgentAnnouncement.body}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onViewDetails(urgentAnnouncement)}
          className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
        >
          <span>View</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
