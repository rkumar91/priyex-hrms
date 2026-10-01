import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Megaphone, AlertTriangle, Flame, Info } from 'lucide-react';
import api from '../../api/client';

interface PostAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostAnnouncementModal: React.FC<PostAnnouncementModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and announcement content are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res: any = await api.post('/notifications/broadcasts', {
        title: title.trim(),
        body: body.trim(),
        priority,
        targetAudience,
        requiresAck: priority === 'URGENT'
      });

      if (res.success || res.data) {
        setTitle('');
        setBody('');
        setPriority('NORMAL');
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to post announcement');
      }
    } catch (err: any) {
      setError(err?.message || 'Error broadcasting announcement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Broadcast Company Announcement</h2>
              <p className="text-xs text-slate-500">Visible to all employees across the organization</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Announcement Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q4 Town Hall Meeting / Office Holiday Notice / Leave Policy Update"
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('NORMAL')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  priority === 'NORMAL'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Normal</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority('HIGH')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  priority === 'HIGH'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>High</span>
              </button>
              <button
                type="button"
                onClick={() => setPriority('URGENT')}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  priority === 'URGENT'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Urgent</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {priority === 'URGENT'
                ? 'Urgent notices trigger an immediate high-priority banner at the top of all user screens.'
                : priority === 'HIGH'
                ? 'High priority notices appear prominently in notification feeds.'
                : 'Standard company updates and information.'}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-medium"
            >
              <option value="ALL">Entire Organization (All Employees)</option>
              <option value="ENGINEERING">Engineering & Technology</option>
              <option value="HR">Human Resources</option>
              <option value="MANAGEMENT">Managers & Team Leads</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Announcement Details *</label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter detailed information, agendas, dates, instructions, or links..."
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-normal"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
