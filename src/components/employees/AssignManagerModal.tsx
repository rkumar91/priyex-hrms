import React from 'react';
import { createPortal } from 'react-dom';
import { UserCheck, X, Shield, AlertCircle } from 'lucide-react';

interface EmployeeSimple {
  id: string | number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  designationName?: string;
  reportingManagerName?: string;
}

interface AssignManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedEmpForManager: EmployeeSimple | null;
  assignManagerId: string;
  setAssignManagerId: (id: string) => void;
  employees: EmployeeSimple[];
  assignManagerError: string | null;
  isAssigningManager: boolean;
}

export const AssignManagerModal: React.FC<AssignManagerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedEmpForManager,
  assignManagerId,
  setAssignManagerId,
  employees,
  assignManagerError,
  isAssigningManager
}) => {
  if (!isOpen || !selectedEmpForManager) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-5 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <span>Assign Reporting Manager</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Employee Info Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-sm flex items-center justify-center shrink-0">
            {selectedEmpForManager.firstName?.[0]}{selectedEmpForManager.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 text-xs truncate">
              {selectedEmpForManager.firstName} {selectedEmpForManager.lastName}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {selectedEmpForManager.employeeCode} &bull; {selectedEmpForManager.designationName || 'Employee'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Current: <strong className="text-slate-700">{selectedEmpForManager.reportingManagerName || 'None (Direct to HR)'}</strong>
            </div>
          </div>
        </div>

        {/* Workflow Notice */}
        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed flex items-start gap-2">
          <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>Approval Routing:</strong> The assigned manager will review all Leave and Expense submissions at <strong>Level 1</strong>. Upon manager approval, requests route automatically to <strong>HR (Level 2)</strong> for final disbursement.
          </span>
        </div>

        {assignManagerError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{assignManagerError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">
              Select Reporting Manager (Level 1 Reviewer)
            </label>
            <select
              value={assignManagerId}
              onChange={(e) => setAssignManagerId(e.target.value)}
              className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              <option value="">No Direct Manager (Direct HR Approval Only)</option>
              {employees
                .filter(e => String(e.id) !== String(selectedEmpForManager.id))
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode} - {emp.designationName || 'Staff'})
                  </option>
                ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              You can reassign or remove manager assignment at any time.
            </p>
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
              disabled={isAssigningManager}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition cursor-pointer shadow-md shadow-indigo-600/20 flex items-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isAssigningManager ? 'Saving Assignment...' : 'Save Manager Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
