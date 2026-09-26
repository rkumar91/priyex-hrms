import React from 'react';
import { CircleDollarSign, Download, Play, FileText, CheckCircle2, Shield } from 'lucide-react';

export const PayrollPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-indigo-400" />
            <span>Payroll & Statutory Compliance</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">India-ready payroll processing (PF, ESI, Professional Tax, TDS withholding)</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2">
          <Play className="w-4 h-4" />
          <span>Execute Monthly Payroll Run</span>
        </button>
      </div>

      {/* Statutory Rules Banner */}
      <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>Configurable statutory rules enabled: EPF (12%), ESI (0.75%/3.25%), State Professional Tax slabs & New/Old Tax Regime TDS.</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-semibold border border-emerald-800 shrink-0">Compliant</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Gross Earnings</span>
          <p className="text-2xl font-extrabold text-white mt-2">₹ 98,40,000</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Total Statutory Deductions</span>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">₹ 13,90,000</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Net Payout Amount</span>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">₹ 84,50,000</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold uppercase">Processing Status</span>
          <p className="text-base font-bold text-amber-300 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sep 2026 Draft Ready
          </p>
        </div>
      </div>

      {/* Payslips & Bank Advice Actions */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white">Monthly Reports & Bank File Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between text-left group">
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">HDFC Bank Salary Advice</p>
              <p className="text-xs text-slate-400">Generate encrypted CSV for NEFT/RTGS</p>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
          </button>

          <button className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between text-left group">
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">EPF ECR Return File</p>
              <p className="text-xs text-slate-400">Unified EPFO Portal upload format</p>
            </div>
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
          </button>

          <button className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between text-left group">
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">Bulk Payslip PDF Dispatch</p>
              <p className="text-xs text-slate-400">Distribute via Email/ESS Portal</p>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
