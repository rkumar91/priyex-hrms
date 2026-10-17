import React from 'react';
import { createPortal } from 'react-dom';
import { Award, X, AlertCircle } from 'lucide-react';
import {
  findConflictingCoffClaim,
  findConflictingLeaveForDate
} from '../../utils/requestValidators';

export interface CoffFormState {
  workedDate: string;
  workedType: 'WEEKEND' | 'PUBLIC_HOLIDAY';
  hoursWorked: string;
  reason: string;
}

interface ClaimCoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  coffForm: CoffFormState;
  setCoffForm: React.Dispatch<React.SetStateAction<CoffFormState>>;
  leaveRequests: any[];
  coffList: any[];
}

export const ClaimCoffModal: React.FC<ClaimCoffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  coffForm,
  setCoffForm,
  leaveRequests,
  coffList,
}) => {
  if (!isOpen) return null;

  const conflictingCoff = findConflictingCoffClaim(coffList, coffForm.workedDate);
  const conflictingLeave = findConflictingLeaveForDate(leaveRequests, coffForm.workedDate);
  const hasConflict = Boolean(conflictingCoff) || Boolean(conflictingLeave);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>Claim Compensatory Off (C-Off) Credit</span>
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
              <label className="block text-slate-700 font-bold mb-1">Date Worked *</label>
              <input
                type="date"
                required
                value={coffForm.workedDate}
                onChange={(e) => setCoffForm({ ...coffForm, workedDate: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Holiday Type *</label>
              <select
                value={coffForm.workedType}
                onChange={(e) => setCoffForm({ ...coffForm, workedType: e.target.value as any })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="WEEKEND">Weekly Off (Sunday/Saturday)</option>
                <option value="PUBLIC_HOLIDAY">Company Public Holiday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Hours Worked on Holiday (Min 7h for 1.0 Day Credit)
            </label>
            <input
              type="number"
              step="0.5"
              min="4.0"
              max="14.0"
              required
              value={coffForm.hoursWorked}
              onChange={(e) => setCoffForm({ ...coffForm, hoursWorked: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Reason / Manager Pre-Approval Notes *
            </label>
            <textarea
              required
              rows={2}
              value={coffForm.reason}
              onChange={(e) => setCoffForm({ ...coffForm, reason: e.target.value })}
              placeholder="e.g. Worked Sunday on client go-live deployment as pre-approved by Team Lead..."
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Conflict / Duplicate check banner */}
          {conflictingCoff && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Duplicate C-Off Request:</span> A credit claim for {conflictingCoff.workedDate} already exists [{conflictingCoff.status}]. Duplicate submissions for the same date are not allowed.
              </div>
            </div>
          )}

          {conflictingLeave && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Leave Conflict:</span> You have an active leave application ({conflictingLeave.leaveType} [{conflictingLeave.status}]) on {coffForm.workedDate}.
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
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Claim 1.0 Day C-Off Credit
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
