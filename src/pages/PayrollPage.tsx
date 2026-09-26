import React from 'react';
import { CircleDollarSign, Download, Play, FileText, CheckCircle2, Shield } from 'lucide-react';

export const PayrollPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <CircleDollarSign className="w-6 h-6 text-emerald-600" />
            <span>Payroll & Statutory Compliance</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">India-ready payroll processing (PF, ESI, Professional Tax, TDS withholding)</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer">
          <Play className="w-4 h-4" />
          <span>Execute Monthly Payroll Run</span>
        </button>
      </div>

      {/* Statutory Rules Banner */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">Configurable statutory rules enabled: EPF (12%), ESI (0.75%/3.25%), State Professional Tax slabs & New/Old Tax Regime TDS.</span>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shrink-0">Compliant</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs text-slate-500 font-bold uppercase">Gross Earnings</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">₹ 98,40,000</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs text-slate-500 font-bold uppercase">Total Statutory Deductions</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-2">₹ 13,90,000</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs text-slate-500 font-bold uppercase">Net Payout Amount</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">₹ 84,50,000</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <span className="text-xs text-slate-500 font-bold uppercase">Processing Status</span>
          <p className="text-base font-bold text-emerald-800 mt-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sep 2026 Draft Ready
          </p>
        </div>
      </div>

      {/* Payslips & Bank Advice Actions */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Monthly Reports & Bank File Generation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition flex items-center justify-between text-left group cursor-pointer">
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">HDFC Bank Salary Advice</p>
              <p className="text-xs text-slate-500">Generate encrypted CSV for NEFT/RTGS</p>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </button>

          <button className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition flex items-center justify-between text-left group cursor-pointer">
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">EPF ECR Return File</p>
              <p className="text-xs text-slate-500">Unified EPFO Portal upload format</p>
            </div>
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </button>

          <button className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition flex items-center justify-between text-left group cursor-pointer">
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Bulk Payslip PDF Dispatch</p>
              <p className="text-xs text-slate-500">Distribute via Email/ESS Portal</p>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
          </button>
        </div>
      </div>
    </div>
  );
};
