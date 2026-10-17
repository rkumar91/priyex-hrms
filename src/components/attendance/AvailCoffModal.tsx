import React from 'react';
import { createPortal } from 'react-dom';
import { Wallet, X, AlertCircle } from 'lucide-react';
import {
  findConflictingLeaveForDate,
  findConflictingCoffAvail
} from '../../utils/requestValidators';

interface AvailCoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  availableCoffCredits: number;
  availDate: string;
  setAvailDate: React.Dispatch<React.SetStateAction<string>>;
  leaveRequests: any[];
  coffList: any[];
}

export const AvailCoffModal: React.FC<AvailCoffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableCoffCredits,
  availDate,
  setAvailDate,
  leaveRequests,
  coffList,
}) => {
  if (!isOpen) return null;

  const conflictingLeave = findConflictingLeaveForDate(leaveRequests, availDate);
  const conflictingAvail = findConflictingCoffAvail(coffList, availDate);
  const hasConflict = Boolean(conflictingLeave) || Boolean(conflictingAvail) || availableCoffCredits <= 0;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>Avail C-Off Balance as Leave</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <span className="font-bold">Available Balance: {availableCoffCredits} Days</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Availing C-Off grants a full paid day off without deducting your Casual or Sick leave balance.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Choose Date to Take Off *</label>
            <input
              type="date"
              required
              value={availDate}
              onChange={(e) => setAvailDate(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Conflict banner for availing C-Off */}
          {conflictingLeave && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Leave Conflict:</span> You already have an active leave ({conflictingLeave.leaveType} [{conflictingLeave.status}]) on {availDate}.
              </div>
            </div>
          )}

          {conflictingAvail && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Already Availed:</span> A C-Off credit is already redeemed for {availDate}.
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
              Confirm C-Off Redemption
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
