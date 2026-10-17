import React from 'react';
import { createPortal } from 'react-dom';
import { Send, X, AlertCircle } from 'lucide-react';

export interface ProfileChangeRequestForm {
  requestType: string;
  fieldName: string;
  requestedValue: string;
  reason: string;
}

interface CriticalChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  requestData: ProfileChangeRequestForm;
  setRequestData: React.Dispatch<React.SetStateAction<ProfileChangeRequestForm>>;
  pendingProfileRequests: any[];
  isSubmitting: boolean;
}

export const CriticalChangeRequestModal: React.FC<CriticalChangeRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  requestData,
  setRequestData,
  pendingProfileRequests,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  const activePendingReq = pendingProfileRequests.find((r: any) =>
    r.requestType?.toUpperCase() === requestData.requestType?.toUpperCase() && r.status === 'PENDING'
  );

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Request Critical Profile Update</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Changes to bank accounts and official identity require verification and approval by HR Manager.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Select Update Type</label>
            <select
              value={requestData.requestType}
              onChange={(e) => {
                const t = e.target.value;
                setRequestData({
                  ...requestData,
                  requestType: t,
                  fieldName:
                    t === 'BANK_ACCOUNT'
                      ? 'Bank Account Number'
                      : t === 'CONTACT_NAME'
                      ? 'Legal Full Name'
                      : 'Work Email',
                });
              }}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="BANK_ACCOUNT">Bank Account & IFSC</option>
              <option value="CONTACT_NAME">Legal Full Name</option>
              <option value="EMAIL">Work / Official Email</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">New Requested Value *</label>
            <input
              type="text"
              required
              placeholder={
                requestData.requestType === 'BANK_ACCOUNT'
                  ? 'e.g. Axis Bank - 921010048192834 (IFSC: UTIB0000123)'
                  : 'e.g. Rajesh K. Sharma'
              }
              value={requestData.requestedValue}
              onChange={(e) => setRequestData({ ...requestData, requestedValue: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Reason for Change</label>
            <textarea
              rows={2}
              placeholder="Explain why this change is requested..."
              value={requestData.reason}
              onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Duplicate / Pending Request Warning Banner */}
          {activePendingReq && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Pending Request Active:</span> A change request for{' '}
                {activePendingReq.fieldName || requestData.requestType} (Request #{activePendingReq.id}) is already
                awaiting HR review. Further requests cannot be submitted until your pending request is processed.
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || Boolean(activePendingReq)}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit to HR Manager'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
