import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Send,
  Megaphone,
  AlertTriangle,
  Flame,
  Info,
  CalendarClock,
  Zap,
  Infinity as InfinityIcon,
  Timer,
  Save,
  Eye
} from 'lucide-react';
import api from '../../api/client';
import { AnnouncementItem } from './BroadcastBanner';
import {
  formatDateTime,
  formatDuration,
  localInputToIso,
  toLocalInputValue
} from './announcementSchedule';

interface PostAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** When provided, the modal edits this announcement instead of creating a new one. */
  editing?: AnnouncementItem | null;
}

type Priority = 'NORMAL' | 'HIGH' | 'URGENT';

const QUICK_DURATIONS: { label: string; ms: number }[] = [
  { label: '1 hour', ms: 60 * 60 * 1000 },
  { label: '1 day', ms: 24 * 60 * 60 * 1000 },
  { label: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  { label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
  { label: '1 month', ms: 30 * 24 * 60 * 60 * 1000 }
];

const segBtn = (active: boolean, tone: 'blue' | 'slate' = 'blue') =>
  `flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition cursor-pointer ${
    active
      ? tone === 'blue'
        ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
        : 'bg-white text-slate-800 shadow-sm ring-1 ring-slate-200'
      : 'text-slate-500 hover:text-slate-800'
  }`;

const inputCls =
  'w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 text-xs font-medium transition';

export const PostAnnouncementModal: React.FC<PostAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editing = null
}) => {
  const isEdit = !!editing;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>('NORMAL');
  const [targetAudience, setTargetAudience] = useState('ALL');

  const [startMode, setStartMode] = useState<'NOW' | 'SCHEDULE'>('NOW');
  const [startValue, setStartValue] = useState('');
  const [endMode, setEndMode] = useState<'NONE' | 'SET'>('SET');
  const [endValue, setEndValue] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // (Re)initialise form whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    if (editing) {
      setTitle(editing.title || '');
      const p = editing.priority as string;
      setPriority(p === 'URGENT' ? 'URGENT' : p === 'HIGH' ? 'HIGH' : 'NORMAL');
      setStartMode('SCHEDULE');
      setStartValue(toLocalInputValue(new Date(editing.publishedAt || editing.createdAt || Date.now())));
      if (editing.expiresAt) {
        setEndMode('SET');
        setEndValue(toLocalInputValue(new Date(editing.expiresAt)));
      } else {
        setEndMode('NONE');
        setEndValue('');
      }
    } else {
      const now = new Date();
      setTitle('');
      setBody('');
      setPriority('NORMAL');
      setTargetAudience('ALL');
      setStartMode('NOW');
      setStartValue(toLocalInputValue(new Date(now.getTime() + 60 * 60 * 1000)));
      setEndMode('SET');
      setEndValue(toLocalInputValue(new Date(now.getTime() + 24 * 60 * 60 * 1000)));
    }
  }, [isOpen, editing]);

  const startMs = useMemo(
    () => (startMode === 'NOW' ? Date.now() : startValue ? new Date(startValue).getTime() : NaN),
    [startMode, startValue]
  );
  const endMs = useMemo(
    () => (endMode === 'NONE' ? null : endValue ? new Date(endValue).getTime() : NaN),
    [endMode, endValue]
  );

  const windowError =
    endMs !== null && !isNaN(endMs) && !isNaN(startMs) && endMs <= startMs
      ? 'End must be after the start time'
      : null;

  if (!isOpen) return null;

  const applyQuickDuration = (ms: number) => {
    const base = isNaN(startMs) ? Date.now() : startMs;
    setEndMode('SET');
    setEndValue(toLocalInputValue(new Date(base + ms)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and announcement content are required');
      return;
    }
    if (startMode === 'SCHEDULE' && !startValue) {
      setError('Please pick a start date & time');
      return;
    }
    if (endMode === 'SET' && !endValue) {
      setError('Please pick an end date & time or choose "No end"');
      return;
    }
    if (windowError) {
      setError(windowError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      title: title.trim(),
      body: body.trim(),
      priority,
      targetAudience,
      requiresAck: priority === 'URGENT',
      publishedAt: startMode === 'NOW' ? new Date().toISOString() : localInputToIso(startValue),
      expiresAt: endMode === 'NONE' ? null : localInputToIso(endValue)
    };

    try {
      const res: any = isEdit
        ? await api.put(`/notifications/broadcasts/${editing!.id}`, payload)
        : await api.post('/notifications/broadcasts', payload);

      if (res.success || res.data) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to save announcement');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showsAsBanner = priority === 'HIGH' || priority === 'URGENT';
  const isScheduledFuture = !isNaN(startMs) && startMs > Date.now() + 30000;

  const summary = (() => {
    if (isNaN(startMs)) return 'Pick a start time';
    const startTxt =
      startMode === 'NOW' || !isScheduledFuture
        ? 'Goes live immediately'
        : `Goes live in ${formatDuration(startMs - Date.now())} (${formatDateTime(new Date(startMs).toISOString())})`;
    if (endMs === null) return `${startTxt} · stays until removed`;
    if (isNaN(endMs) || windowError) return startTxt;
    return `${startTxt} · auto-hides after ${formatDuration(endMs - startMs)} (${formatDateTime(new Date(endMs).toISOString())})`;
  })();

  const submitLabel = isEdit
    ? isSubmitting ? 'Saving...' : 'Save Changes'
    : isSubmitting
    ? 'Publishing...'
    : isScheduledFuture
    ? 'Schedule'
    : 'Broadcast Now';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Announcement' : 'New Banner Announcement'}
              </h2>
              <p className="text-xs text-slate-500">Schedule when it appears and when it auto-hides</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 text-xs">
          <div className="p-6 space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="ann-title" className="block text-slate-700 font-bold mb-1.5">Announcement Title *</label>
              <input
                id="ann-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Town Hall Meeting / Office Holiday Notice / Leave Policy Update"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Priority Level</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'NORMAL', label: 'Normal', Icon: Info, on: 'bg-blue-50 border-blue-500 text-blue-700', ic: 'text-blue-600' },
                  { key: 'HIGH', label: 'High', Icon: AlertTriangle, on: 'bg-amber-50 border-amber-500 text-amber-800', ic: 'text-amber-600' },
                  { key: 'URGENT', label: 'Urgent', Icon: Flame, on: 'bg-rose-50 border-rose-500 text-rose-800', ic: 'text-rose-600' }
                ] as const).map(({ key, label, Icon, on, ic }) => (
                  <button
                    key={key}
                    id={`ann-priority-${key.toLowerCase()}`}
                    type="button"
                    onClick={() => setPriority(key)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      priority === key ? `${on} shadow-xs` : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${ic}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {priority === 'URGENT'
                  ? 'Shows a red banner at the top of every screen during the display window. Requires acknowledgement.'
                  : priority === 'HIGH'
                  ? 'Shows an amber banner at the top of every screen during the display window.'
                  : 'Appears only in the notification bell feed (no top banner).'}
              </p>
            </div>

            {/* ── Display Window ── */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800">Display Window</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Start */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Appears</span>
                  <div className="flex p-1 rounded-xl bg-slate-100">
                    <button id="ann-start-now" type="button" onClick={() => setStartMode('NOW')} className={segBtn(startMode === 'NOW')}>
                      <Zap className="w-3.5 h-3.5" /> Now
                    </button>
                    <button id="ann-start-schedule" type="button" onClick={() => setStartMode('SCHEDULE')} className={segBtn(startMode === 'SCHEDULE')}>
                      <CalendarClock className="w-3.5 h-3.5" /> Schedule
                    </button>
                  </div>
                  {startMode === 'SCHEDULE' && (
                    <input
                      id="ann-start-at"
                      type="datetime-local"
                      value={startValue}
                      onChange={(e) => setStartValue(e.target.value)}
                      className={inputCls}
                    />
                  )}
                </div>

                {/* End */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">Disappears</span>
                  <div className="flex p-1 rounded-xl bg-slate-100">
                    <button id="ann-end-set" type="button" onClick={() => setEndMode('SET')} className={segBtn(endMode === 'SET')}>
                      <Timer className="w-3.5 h-3.5" /> On date
                    </button>
                    <button id="ann-end-none" type="button" onClick={() => setEndMode('NONE')} className={segBtn(endMode === 'NONE', 'slate')}>
                      <InfinityIcon className="w-3.5 h-3.5" /> No end
                    </button>
                  </div>
                  {endMode === 'SET' && (
                    <input
                      id="ann-end-at"
                      type="datetime-local"
                      value={endValue}
                      min={startMode === 'SCHEDULE' ? startValue : undefined}
                      onChange={(e) => setEndValue(e.target.value)}
                      className={`${inputCls} ${windowError ? '!border-rose-400 !bg-rose-50/40' : ''}`}
                    />
                  )}
                </div>
              </div>

              {/* Quick durations */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-semibold mr-1">Show for:</span>
                {QUICK_DURATIONS.map((d) => {
                  const active =
                    endMs !== null && !isNaN(endMs) && !isNaN(startMs) && Math.abs(endMs - startMs - d.ms) < 60000;
                  return (
                    <button
                      key={d.label}
                      type="button"
                      onClick={() => applyQuickDuration(d.ms)}
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold transition cursor-pointer ${
                        active
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>

              <div
                className={`flex items-start gap-2 px-3 py-2 rounded-xl text-[11px] font-medium ${
                  windowError ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <CalendarClock className="w-3.5 h-3.5 mt-px shrink-0" />
                <span>{windowError || summary}</span>
              </div>
            </div>

            <div>
              <label htmlFor="ann-audience" className="block text-slate-700 font-bold mb-1.5">Target Audience</label>
              <select
                id="ann-audience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className={inputCls}
              >
                <option value="ALL">Entire Organization (All Employees)</option>
                <option value="ENGINEERING">Engineering &amp; Technology</option>
                <option value="HR">Human Resources</option>
                <option value="MANAGEMENT">Managers &amp; Team Leads</option>
              </select>
            </div>

            <div>
              <label htmlFor="ann-body" className="block text-slate-700 font-bold mb-1.5">Announcement Details *</label>
              <textarea
                id="ann-body"
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter detailed information, agendas, dates, instructions, or links..."
                className={`${inputCls} font-normal`}
              />
            </div>

            {/* Live banner preview */}
            {showsAsBanner && (
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <Eye className="w-3.5 h-3.5" /> Banner preview
                </span>
                <div
                  className={`rounded-xl px-3 py-2 flex items-center gap-2 text-white shadow-md ${
                    priority === 'URGENT'
                      ? 'bg-gradient-to-r from-rose-700 via-rose-600 to-red-600'
                      : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-white/20 shrink-0">
                    {priority === 'URGENT' ? <Flame className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  </div>
                  <span className="font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/25 text-[9px] shrink-0">
                    {priority === 'URGENT' ? 'URGENT NOTICE' : 'IMPORTANT NOTICE'}
                  </span>
                  <span className="font-bold truncate text-[11px]">{title || 'Your announcement title'}</span>
                  <span className="hidden sm:inline text-white/80 truncate text-[11px]">— {body || 'details...'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              id="ann-submit"
              type="submit"
              disabled={isSubmitting || !!windowError}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEdit ? <Save className="w-3.5 h-3.5" /> : isScheduledFuture ? <CalendarClock className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{submitLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
