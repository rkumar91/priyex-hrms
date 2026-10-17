import React from 'react';
import { createPortal } from 'react-dom';
import { Timer, X, AlertCircle } from 'lucide-react';
import {
  findConflictingLeaveForDate,
  findConflictingOvertime
} from '../../utils/requestValidators';

export interface OvertimeFormState {
  date: string;
  startTime: string;
  endTime: string;
  hours: string;
  reason: string;
  projectCode: string;
  isWeekend: boolean;
}

interface SubmitOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  otForm: OvertimeFormState;
  setOtForm: React.Dispatch<React.SetStateAction<OvertimeFormState>>;
  leaveRequests: any[];
  overtimeList: any[];
}

export const SubmitOvertimeModal: React.FC<SubmitOvertimeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  otForm,
  setOtForm,
  leaveRequests,
  overtimeList,
}) => {
  if (!isOpen) return null;

  const leaveConflict = findConflictingLeaveForDate(leaveRequests, otForm.date);
  const otConflict = findConflictingOvertime(overtimeList, otForm.date, otForm.startTime, otForm.endTime);
  const hasConflict = Boolean(leaveConflict) || Boolean(otConflict);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span>Submit Overtime (OT) Request</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Overtime Date *</label>
              <input
                type="date"
                required
                value={otForm.date}
                onChange={(e) => setOtForm({ ...otForm, date: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Total OT Hours *</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                required
                value={otForm.hours}
                onChange={(e) => setOtForm({ ...otForm, hours: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Start Time (24h) *</label>
              <input
                type="time"
                required
                value={otForm.startTime}
                onChange={(e) => {
                  const newStart = e.target.value;
                  let updatedHours = otForm.hours;
                  if (newStart && otForm.endTime) {
                    const [sh, sm] = newStart.split(':').map(Number);
                    const [eh, em] = otForm.endTime.split(':').map(Number);
                    let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
                    if (diffMinutes < 0) diffMinutes += 24 * 60;
                    if (diffMinutes > 0) {
                      updatedHours = (diffMinutes / 60).toFixed(1);
                    }
                  }
                  setOtForm({ ...otForm, startTime: newStart, hours: updatedHours });
                }}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">End Time (24h) *</label>
              <input
                type="time"
                required
                value={otForm.endTime}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  let updatedHours = otForm.hours;
                  if (otForm.startTime && newEnd) {
                    const [sh, sm] = otForm.startTime.split(':').map(Number);
                    const [eh, em] = newEnd.split(':').map(Number);
                    let diffMinutes = (eh * 60 + em) - (sh * 60 + sm);
                    if (diffMinutes < 0) diffMinutes += 24 * 60;
                    if (diffMinutes > 0) {
                      updatedHours = (diffMinutes / 60).toFixed(1);
                    }
                  }
                  setOtForm({ ...otForm, endTime: newEnd, hours: updatedHours });
                }}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Project Code / Client Tag</label>
            <input
              type="text"
              value={otForm.projectCode}
              onChange={(e) => setOtForm({ ...otForm, projectCode: e.target.value })}
              placeholder="e.g. PRJ-FINTECH-01"
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={otForm.isWeekend}
                onChange={(e) => setOtForm({ ...otForm, isWeekend: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="font-semibold text-slate-800">
                Worked on Weekend / Public Holiday (2.0x Rate Multiplier)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Business Justification / Reason *</label>
            <textarea
              required
              rows={2}
              value={otForm.reason}
              onChange={(e) => setOtForm({ ...otForm, reason: e.target.value })}
              placeholder="Describe sprint emergency, release tasks, or client delivery..."
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Conflict check warning */}
          {leaveConflict && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Leave Conflict:</span> You have an active leave application ({leaveConflict.leaveType} [{leaveConflict.status}]) on this date.
              </div>
            </div>
          )}

          {otConflict && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Duplicate/Overlap Warning:</span> An active overtime request already exists on {otConflict.date} {otConflict.startTime ? `(${otConflict.startTime} - ${otConflict.endTime})` : ''} [{otConflict.status}].
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={hasConflict}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Overtime Request
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
