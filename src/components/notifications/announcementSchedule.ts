/**
 * Shared helpers for scheduled announcements / banner notifications.
 * An announcement is "live" while now ∈ [publishedAt, expiresAt).
 */

export type AnnouncementStatus = 'SCHEDULED' | 'LIVE' | 'EXPIRED';

interface Windowed {
  publishedAt?: string | null;
  expiresAt?: string | null;
}

export const getAnnouncementStatus = (a: Windowed, now: number = Date.now()): AnnouncementStatus => {
  const start = a.publishedAt ? new Date(a.publishedAt).getTime() : null;
  const end = a.expiresAt ? new Date(a.expiresAt).getTime() : null;
  if (start !== null && start > now) return 'SCHEDULED';
  if (end !== null && end <= now) return 'EXPIRED';
  return 'LIVE';
};

export const isLiveNow = (a: Windowed, now: number = Date.now()): boolean =>
  getAnnouncementStatus(a, now) === 'LIVE';

/** Converts a Date to the value format expected by <input type="datetime-local"> (local time). */
export const toLocalInputValue = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/** Converts a datetime-local value (local time) to an ISO-8601 UTC string for the API. */
export const localInputToIso = (value: string): string | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

/** Human friendly duration like "2d 4h", "3h 12m", "45m", "<1m". */
export const formatDuration = (ms: number): string => {
  const abs = Math.abs(ms);
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return hours % 24 ? `${days}d ${hours % 24}h` : `${days}d`;
  if (hours > 0) return mins % 60 ? `${hours}h ${mins % 60}m` : `${hours}h`;
  if (mins > 0) return `${mins}m`;
  return '<1m';
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};
