import React from 'react';
import { OvertimeItem } from '../../../types/attendance';

interface OvertimeTabProps {
  overtimeList: OvertimeItem[];
  canApprove: boolean;
  handleApproveOt: (id: number) => void;
  handleRejectOt: (id: number) => void;
  totalOtHoursApproved: number;
  totalOtPayout: number;
}

export const OvertimeTab: React.FC<OvertimeTabProps> = ({
  overtimeList,
  canApprove,
  handleApproveOt,
  handleRejectOt,
  totalOtHoursApproved,
  totalOtPayout,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Overtime Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Approved OT</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalOtHoursApproved} Hours</div>
          <span className="text-xs text-slate-500">Across current payroll month</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated OT Payout</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600">₹{totalOtPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          <span className="text-xs text-emerald-700 font-semibold">Credited in monthly payslips</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending OT Approvals</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">
            {overtimeList.filter(o => o.status === 'PENDING').length} Requests
          </div>
          <span className="text-xs text-slate-500">Awaiting manager authorization</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">OT Multiplier Policy</span>
          <div className="mt-2 text-base font-bold text-blue-700">1.5x Wkday / 2.0x Wkend</div>
          <span className="text-xs text-slate-500">Indian Factories Act compliant</span>
        </div>
      </div>

      {/* Overtime Requests Master Register */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <span className="font-bold text-slate-900 text-sm">Overtime (OT) Duty Register & Timesheets</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
            {overtimeList.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date & Shift</th>
                <th className="py-3 px-4 text-center">OT Hours</th>
                <th className="py-3 px-4 text-center">Rate</th>
                <th className="py-3 px-4 text-right">Est. Payout</th>
                <th className="py-3 px-4">Project & Reason</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {overtimeList.map((ot) => (
                <tr key={ot.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{ot.employeeName}</div>
                    <div className="text-[11px] text-slate-400">{ot.department}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono font-semibold text-slate-800">{ot.date}</div>
                    <div className="text-[11px] text-slate-500">
                      {ot.shift}
                      {ot.startTime && ot.endTime ? (
                        <span className="ml-1 text-blue-600 font-mono font-medium">({ot.startTime} - {ot.endTime})</span>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                    {ot.hours}h
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold border border-blue-200 font-mono text-[11px]">
                      {ot.rateMultiplier}x
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700 text-sm">
                    ₹{ot.estimatedPayout.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-slate-800 truncate" title={ot.reason}>{ot.reason}</div>
                    <span className="text-[10px] font-mono text-slate-400">[{ot.projectCode}]</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                      ot.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      ot.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {ot.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {ot.status === 'PENDING' && canApprove ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApproveOt(ot.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectOt(ot.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        {ot.approverRemarks || 'Verified'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
