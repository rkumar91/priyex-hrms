import React from 'react';
import { Wallet, Award, Clock } from 'lucide-react';
import { CoffItem } from '../../../types/attendance';

interface CoffTabProps {
  coffList: CoffItem[];
  canApprove: boolean;
  handleApproveCoff: (id: number) => void;
  handleRejectCoff: (id: number) => void;
  availableCoffCredits: number;
  totalCoffEarned: number;
}

export const CoffTab: React.FC<CoffTabProps> = ({
  coffList,
  canApprove,
  handleApproveCoff,
  handleRejectCoff,
  availableCoffCredits,
  totalCoffEarned,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* C-Off Explainer & Balance Wallet Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Available C-Off Wallet</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-800">{availableCoffCredits.toFixed(1)} Days</div>
          <p className="text-xs text-emerald-700 mt-1">Ready to redeem as paid leave anytime</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Earned Credits</span>
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalCoffEarned.toFixed(1)} Days</div>
          <p className="text-xs text-slate-500 mt-1">Granted for working on weekends/public holidays</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credit Validity Rule</span>
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mt-3 text-base font-bold text-slate-800">60 Days Expiry Window</div>
          <p className="text-xs text-slate-500 mt-1">Credits must be availed within 60 calendar days</p>
        </div>
      </div>

      {/* C-Off Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <span className="font-bold text-slate-900 text-sm">Compensatory Off Credit Ledger & Redemptions</span>
          <span className="text-xs text-slate-400">1 Worked Holiday/Weekend = 1.0 C-Off Day</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Worked Date</th>
                <th className="py-3 px-4">Holiday / Type</th>
                <th className="py-3 px-4 text-center">Hours Worked</th>
                <th className="py-3 px-4 text-center">Credits Earned</th>
                <th className="py-3 px-4">Valid Until</th>
                <th className="py-3 px-4 text-center">Redemption</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coffList.map((coff) => (
                <tr key={coff.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{coff.employeeName}</div>
                    <div className="text-[11px] text-slate-400">{coff.department}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {coff.workedDate}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px]">
                      {coff.workedType === 'WEEKEND' ? 'Weekly Off (Sunday)' : 'National Public Holiday'}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{coff.reason}</div>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                    {coff.hoursWorked}h
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                      +{coff.creditsEarned} Day
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {coff.expiryDate}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {coff.isAvailed ? (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]" title={`Availed on ${coff.availedDate}`}>
                        Availed ({coff.availedDate})
                      </span>
                    ) : coff.status === 'APPROVED' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Available in Wallet
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Awaiting Approval</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                      coff.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      coff.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {coff.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {coff.status === 'PENDING' && canApprove ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApproveCoff(coff.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Approve Credit
                        </button>
                        <button
                          onClick={() => handleRejectCoff(coff.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">--</span>
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
