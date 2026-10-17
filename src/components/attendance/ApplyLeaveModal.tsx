import React from 'react';
import { createPortal } from 'react-dom';
import { FileText, X, AlertCircle } from 'lucide-react';
import {
  findConflictingLeave,
  findConflictingOtForLeave
} from '../../utils/requestValidators';

export interface LeaveFormState {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeavePolicyOption {
  id: number;
  leaveCode: string;
  leaveName: string;
  annualDays: number;
}

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  leaveForm: LeaveFormState;
  setLeaveForm: React.Dispatch<React.SetStateAction<LeaveFormState>>;
  orgPolicies: LeavePolicyOption[];
  leaveRequests: any[];
  overtimeList: any[];
  isSubmitting: boolean;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leaveForm,
  setLeaveForm,
  orgPolicies,
  leaveRequests,
  overtimeList,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const isInvalidDateRange = Boolean(
    leaveForm.startDate && leaveForm.endDate && leaveForm.startDate > leaveForm.endDate
  );
  const activeLeaveConflict = findConflictingLeave(leaveRequests, leaveForm.startDate, leaveForm.endDate);
  const activeOtConflict = findConflictingOtForLeave(overtimeList, leaveForm.startDate, leaveForm.endDate);

  const hasConflict = isInvalidDateRange || Boolean(activeLeaveConflict) || Boolean(activeOtConflict);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Apply for Leave</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Leave Type</label>
            <select
              value={leaveForm.leaveType}
              onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              {orgPolicies.length > 0 ? (
                orgPolicies.map((p) => (
                  <option key={p.id} value={p.leaveName}>
                    {p.leaveName} ({p.annualDays} days/yr)
                  </option>
                ))
              ) : (
                <>
                  <option value="Casual Leave (CL)">Casual Leave (CL) (12 days/yr)</option>
                  <option value="Sick Leave (SL)">Sick Leave (SL) (10 days/yr)</option>
                  <option value="Privilege Leave (PL)">Privilege Leave (PL) (15 days/yr)</option>
                  <option value="Maternity Leave">Maternity Leave (180 days)</option>
                  <option value="Paternity Leave">Paternity Leave (15 days)</option>
                </>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={leaveForm.startDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-1">End Date *</label>
              <input
                type="date"
                required
                value={leaveForm.endDate}
                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Reason *</label>
            <textarea
              required
              rows={3}
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              placeholder="State the reason for leave request..."
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Live Conflict / Duplicate Warning Banner */}
          {isInvalidDateRange && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Start date cannot be after end date.</span>
            </div>
          )}

          {activeLeaveConflict && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Duplicate / Overlapping Leave:</span> You already have an active application ({activeLeaveConflict.leaveType} from {activeLeaveConflict.startDate} to {activeLeaveConflict.endDate} [{activeLeaveConflict.status}]). Duplicate requests are not permitted.
              </div>
            </div>
          )}

          {activeOtConflict && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Overtime Conflict:</span> You have an active Overtime entry on {activeOtConflict.date} ({activeOtConflict.shift} [{activeOtConflict.status}]).
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
              disabled={isSubmitting || hasConflict}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
