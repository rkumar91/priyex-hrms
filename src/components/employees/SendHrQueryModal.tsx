import React from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, X, Send } from 'lucide-react';

export interface HrPersonnelItem {
  userId: number;
  fullName: string;
  workEmail: string;
  designationName?: string;
  departmentName?: string;
  roles?: string[];
}

export interface HrQueryFormData {
  assignedHrUserId: string;
  category: string;
  priority: string;
  subject: string;
  message: string;
}

interface SendHrQueryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  hrQueryData: HrQueryFormData;
  setHrQueryData: React.Dispatch<React.SetStateAction<HrQueryFormData>>;
  hrPersonnelList: HrPersonnelItem[];
  isSendingQuery: boolean;
}

export const SendHrQueryModal: React.FC<SendHrQueryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  hrQueryData,
  setHrQueryData,
  hrPersonnelList,
  isSendingQuery
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Submit Query to HR / People Support</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          Have a question about payroll, PF, leave balances, or company policies? Select your HR point of contact below.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
              <span>Assigned HR Representative *</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Active HR Desk</span>
            </label>
            <select
              required
              value={hrQueryData.assignedHrUserId}
              onChange={(e) => setHrQueryData({ ...hrQueryData, assignedHrUserId: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              <option value="">-- Choose HR Representative --</option>
              {hrPersonnelList.map((hr) => (
                <option key={hr.userId} value={hr.userId}>
                  {hr.fullName} ({hr.designationName || 'HR Officer'} • {hr.workEmail})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Query Category</label>
              <select
                value={hrQueryData.category}
                onChange={(e) => setHrQueryData({ ...hrQueryData, category: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="PAYROLL">Payroll & Salary Slip</option>
                <option value="TAX_PF">PF & Tax Withholding</option>
                <option value="LEAVES">Leaves & Attendance</option>
                <option value="BENEFITS">Medical & Insurance</option>
                <option value="GENERAL">General Policy Query</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Priority</label>
              <select
                value={hrQueryData.priority}
                onChange={(e) => setHrQueryData({ ...hrQueryData, priority: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent (Requires immediate action)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Query regarding PF passbook balance transfer / Salary deduction"
              value={hrQueryData.subject}
              onChange={(e) => setHrQueryData({ ...hrQueryData, subject: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Query Details & Message *</label>
            <textarea
              required
              rows={3}
              placeholder="Describe your issue or question in detail for the HR team..."
              value={hrQueryData.message}
              onChange={(e) => setHrQueryData({ ...hrQueryData, message: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

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
              disabled={isSendingQuery}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSendingQuery ? 'Sending...' : 'Dispatch Query to HR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
