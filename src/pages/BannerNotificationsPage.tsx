import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate } from 'react-router-dom';
import {
  Megaphone,
  Plus,
  Radio,
  CalendarClock,
  Archive,
  Eye,
  Search,
  Flame,
  AlertTriangle,
  Info,
  Pencil,
  Trash2,
  StopCircle,
  PlayCircle,
  Users,
  Clock,
  Infinity as InfinityIcon,
  CheckCircle2,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { canManageAnnouncements } from '../utils/rbac';
import { AnnouncementItem } from '../components/notifications/BroadcastBanner';
import { PostAnnouncementModal } from '../components/notifications/PostAnnouncementModal';
import {
  AnnouncementStatus,
  formatDateTime,
  formatDuration,
  getAnnouncementStatus
} from '../components/notifications/announcementSchedule';

type Filter = 'ALL' | AnnouncementStatus;

const STATUS_STYLE: Record<AnnouncementStatus, { label: string; chip: string; dot: string }> = {
  LIVE: { label: 'Live', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  SCHEDULED: { label: 'Scheduled', chip: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  EXPIRED: { label: 'Expired', chip: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' }
};

const PRIORITY_STYLE: Record<string, { label: string; Icon: React.ElementType; stripe: string; chip: string; bar: string }> = {
  URGENT: { label: 'Urgent · Banner', Icon: Flame, stripe: 'from-rose-500 to-red-600', chip: 'bg-rose-50 text-rose-700 border-rose-200', bar: 'from-rose-500 to-red-500' },
  HIGH: { label: 'High · Banner', Icon: AlertTriangle, stripe: 'from-amber-400 to-orange-500', chip: 'bg-amber-50 text-amber-800 border-amber-200', bar: 'from-amber-400 to-orange-500' },
  NORMAL: { label: 'Normal · Feed only', Icon: Info, stripe: 'from-blue-400 to-indigo-500', chip: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'from-blue-400 to-indigo-500' }
};

export const BannerNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');
  const [now, setNow] = useState(() => Date.now());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AnnouncementItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AnnouncementItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const allowed = canManageAnnouncements(user);

  const fetchItems = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res: any = await api.get('/notifications/broadcasts/manage');
      if (res.success && Array.isArray(res.data)) setItems(res.data);
    } catch (e: any) {
      if (!silent) showToast('error', e?.message || 'Failed to load announcements');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!allowed) return;
    fetchItems();
    const tick = setInterval(() => setNow(Date.now()), 30000);
    const poll = setInterval(() => fetchItems(true), 60000);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [allowed]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: 'success' | 'error', msg: string) => setToast({ type, msg });

  const withStatus = useMemo(
    () => items.map((a) => ({ ...a, status: getAnnouncementStatus(a, now) })),
    [items, now]
  );

  const counts = useMemo(() => {
    const c = { LIVE: 0, SCHEDULED: 0, EXPIRED: 0, reads: 0 };
    withStatus.forEach((a) => {
      c[a.status]++;
      c.reads += Number(a.readCount || 0);
    });
    return c;
  }, [withStatus]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const order: Record<AnnouncementStatus, number> = { LIVE: 0, SCHEDULED: 1, EXPIRED: 2 };
    return withStatus
      .filter((a) => filter === 'ALL' || a.status === filter)
      .filter((a) => !q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q))
      .sort((a, b) => {
        if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
        const ta = new Date(a.publishedAt || a.createdAt || 0).getTime();
        const tb = new Date(b.publishedAt || b.createdAt || 0).getTime();
        // Scheduled: soonest first; others: most recent first
        return a.status === 'SCHEDULED' ? ta - tb : tb - ta;
      });
  }, [withStatus, filter, search]);

  if (!allowed) return <Navigate to="/" replace />;

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (a: AnnouncementItem) => {
    setEditing(a);
    setIsModalOpen(true);
  };

  const handleEndNow = async (a: AnnouncementItem) => {
    setBusyId(a.id);
    try {
      await api.put(`/notifications/broadcasts/${a.id}/end`);
      showToast('success', `"${a.title}" has been taken off-air`);
      fetchItems(true);
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to end announcement');
    } finally {
      setBusyId(null);
    }
  };

  const handleGoLiveNow = async (a: AnnouncementItem) => {
    setBusyId(a.id);
    try {
      await api.put(`/notifications/broadcasts/${a.id}`, {
        title: a.title,
        body: a.body,
        priority: a.priority,
        targetAudience: a.targetAudience,
        requiresAck: a.requiresAck ?? a.priority === 'URGENT',
        publishedAt: new Date().toISOString(),
        expiresAt: a.expiresAt || null
      });
      showToast('success', `"${a.title}" is now live`);
      fetchItems(true);
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to publish announcement');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setBusyId(target.id);
    try {
      await api.delete(`/notifications/broadcasts/${target.id}`);
      setItems((prev) => prev.filter((x) => x.id !== target.id));
      showToast('success', 'Announcement deleted');
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to delete announcement');
    } finally {
      setBusyId(null);
      setConfirmDelete(null);
    }
  };

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: withStatus.length },
    { key: 'LIVE', label: 'Live', count: counts.LIVE },
    { key: 'SCHEDULED', label: 'Scheduled', count: counts.SCHEDULED },
    { key: 'EXPIRED', label: 'Expired', count: counts.EXPIRED }
  ];

  const stats = [
    { key: 'LIVE' as Filter, label: 'Live now', value: counts.LIVE, Icon: Radio, tone: 'from-emerald-500 to-teal-500', ring: 'ring-emerald-200', pulse: counts.LIVE > 0 },
    { key: 'SCHEDULED' as Filter, label: 'Scheduled', value: counts.SCHEDULED, Icon: CalendarClock, tone: 'from-blue-500 to-indigo-500', ring: 'ring-blue-200', pulse: false },
    { key: 'EXPIRED' as Filter, label: 'Expired', value: counts.EXPIRED, Icon: Archive, tone: 'from-slate-400 to-slate-500', ring: 'ring-slate-200', pulse: false },
    { key: null, label: 'Total reads', value: counts.reads, Icon: Eye, tone: 'from-violet-500 to-fuchsia-500', ring: 'ring-violet-200', pulse: false }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/20">
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-10 w-56 h-56 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Banner Notifications</h1>
              <p className="text-sm text-white/80 mt-1 max-w-xl">
                Schedule organization-wide announcements. Banners appear automatically at the start time and disappear when the window ends.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => fetchItems()}
              title="Refresh"
              className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="banner-new-btn"
              type="button"
              onClick={openCreate}
              className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => {
          const Icon = s.Icon;
          const clickable = s.key !== null;
          const active = clickable && filter === s.key;
          return (
            <button
              key={s.label}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && setFilter(active ? 'ALL' : (s.key as Filter))}
              className={`group text-left bg-white rounded-2xl border p-4 transition-all ${
                active ? `border-transparent ring-2 ${s.ring} shadow-md` : 'border-slate-200/90 shadow-sm'
              } ${clickable ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <div className={`relative w-8 h-8 rounded-xl bg-gradient-to-br ${s.tone} text-white flex items-center justify-center shadow-sm`}>
                  <Icon className="w-4 h-4" />
                  {s.pulse && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-ping" />}
                </div>
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">{s.value}</div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              id={`banner-tab-${t.key.toLowerCase()}`}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                filter === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.key !== 'ALL' && <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLE[t.key as AnnouncementStatus].dot}`} />}
              {t.label}
              <span className="text-[10px] px-1.5 py-px rounded-full bg-slate-200/70 text-slate-600 tabular-nums">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            id="banner-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full bg-white text-sm rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition"
          />
        </div>
      </div>

      {/* List */}
      {isLoading && items.length === 0 ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 px-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600 flex items-center justify-center mb-3">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {filter === 'ALL' && !search ? 'No announcements yet' : 'Nothing matches this view'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'ALL' && !search
              ? 'Create your first scheduled banner to notify the whole organization.'
              : 'Try a different filter or search term.'}
          </p>
          {filter === 'ALL' && !search && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> New Announcement
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((a) => {
            const st = STATUS_STYLE[a.status];
            const pr = PRIORITY_STYLE[a.priority] || PRIORITY_STYLE.NORMAL;
            const PIcon = pr.Icon;
            const start = new Date(a.publishedAt || a.createdAt || now).getTime();
            const end = a.expiresAt ? new Date(a.expiresAt).getTime() : null;
            const progress =
              a.status === 'EXPIRED' ? 100 : a.status === 'SCHEDULED' ? 0 : end ? Math.min(100, Math.max(2, ((now - start) / (end - start)) * 100)) : 100;

            const countdown =
              a.status === 'SCHEDULED'
                ? `Starts in ${formatDuration(start - now)}`
                : a.status === 'LIVE'
                ? end
                  ? `Ends in ${formatDuration(end - now)}`
                  : 'Live until removed'
                : `Ended ${formatDuration(now - (end || now))} ago`;

            const busy = busyId === a.id;

            return (
              <article
                key={a.id}
                className={`group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden ${
                  a.status === 'EXPIRED' ? 'opacity-75 hover:opacity-100' : ''
                }`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${pr.stripe}`} />
                <div className="p-4 sm:p-5 pl-5 sm:pl-6 flex flex-col lg:flex-row gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${st.chip}`}>
                        <span className="relative flex w-1.5 h-1.5">
                          {a.status === 'LIVE' && <span className={`absolute inset-0 rounded-full ${st.dot} animate-ping opacity-75`} />}
                          <span className={`relative w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        </span>
                        {st.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${pr.chip}`}>
                        <PIcon className="w-3 h-3" />
                        {pr.label}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600">
                        <Users className="w-3 h-3" />
                        {a.targetAudience === 'ALL' ? 'Everyone' : a.targetAudience}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">{a.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{a.body}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                      <span>By {a.creatorName || 'HR Admin'}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {a.readCount || 0} read
                      </span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="lg:w-80 shrink-0 rounded-xl bg-slate-50/80 border border-slate-200/70 p-3 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-bold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {countdown}
                      </span>
                      {a.status === 'LIVE' && end && <span className="text-slate-400 tabular-nums">{Math.round(progress)}%</span>}
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${a.status === 'EXPIRED' ? 'from-slate-300 to-slate-400' : pr.bar} transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <div className="uppercase tracking-wider font-bold text-slate-400">Appears</div>
                        <div className="font-semibold text-slate-700 mt-0.5">{formatDateTime(a.publishedAt || a.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="uppercase tracking-wider font-bold text-slate-400">Disappears</div>
                        <div className="font-semibold text-slate-700 mt-0.5 flex items-center justify-end gap-1">
                          {a.expiresAt ? formatDateTime(a.expiresAt) : (<><InfinityIcon className="w-3 h-3" /> No end</>)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/70">
                      {a.status === 'SCHEDULED' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleGoLiveNow(a)}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                        >
                          <PlayCircle className="w-3.5 h-3.5" /> Go live
                        </button>
                      )}
                      {a.status === 'LIVE' && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleEndNow(a)}
                          className="flex-1 px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                        >
                          <StopCircle className="w-3.5 h-3.5" /> End now
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openEdit(a)}
                        className="flex-1 px-2 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:opacity-50"
                      >
                        <Pencil className="w-3.5 h-3.5" /> {a.status === 'EXPIRED' ? 'Reschedule' : 'Edit'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setConfirmDelete(a)}
                        title="Delete"
                        className="px-2 py-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 transition cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <PostAnnouncementModal
        isOpen={isModalOpen}
        editing={editing}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          showToast('success', editing ? 'Announcement updated' : 'Announcement saved');
          fetchItems(true);
        }}
      />

      {/* Delete confirmation */}
      {confirmDelete &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete announcement?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  "{confirmDelete.title}" will be permanently removed along with its read receipts.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busyId === confirmDelete.id}
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Toast */}
      {toast &&
        createPortal(
          <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold border ${
                toast.type === 'success'
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-rose-600 text-white border-rose-500'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{toast.msg}</span>
              <button type="button" onClick={() => setToast(null)} className="ml-1 opacity-80 hover:opacity-100 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
