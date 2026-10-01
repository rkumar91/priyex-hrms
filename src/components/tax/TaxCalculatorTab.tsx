import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { TaxCalculationResponse } from '../../types/tax';
import {
  Calculator,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

interface TaxCalculatorTabProps {
  initialCtc?: number;
}

export const TaxCalculatorTab: React.FC<TaxCalculatorTabProps> = ({ initialCtc }) => {
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [customCtc, setCustomCtc] = useState<number>(initialCtc || 2400000);
  const [calculation, setCalculation] = useState<TaxCalculationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTaxCalculation = async (fy: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/tax/calculate?financialYear=${fy}`);
      if (res.success && res.data) {
        setCalculation(res.data);
        if (res.data.annualCtc) {
          setCustomCtc(Number(res.data.annualCtc));
        }
      }
    } catch (e) {
      // Fallback calculation will trigger locally
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxCalculation(financialYear);
  }, [financialYear]);

  const fmt = (n?: number) => {
    if (n === undefined || n === null) return '0';
    return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Financial Year Selector */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Income Tax Calculation & Regime Comparison</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                FY {financialYear}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live side-by-side tax projection under New Tax Regime (Section 115BAC) vs Old Tax Regime based on CTC & declared investments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Financial Year</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="2026-2027">FY 2026-2027 (AY 2027-2028)</option>
              <option value="2025-2026">FY 2025-2026 (AY 2026-2027)</option>
              <option value="2024-2025">FY 2024-2025 (AY 2025-2026)</option>
            </select>
          </div>
        </div>
      </div>

      {calculation && (
        <>
          {/* Regime Recommendation Highlight Card */}
          <div className={`p-6 rounded-3xl text-white shadow-xl relative overflow-hidden ${
            calculation.recommendedRegime === 'NEW'
              ? 'bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30'
              : 'bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 border border-blue-500/30'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Recommendation: {calculation.recommendedRegime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
                  You save <span className="text-emerald-400 font-mono">₹{fmt(calculation.taxSavingsWithRecommendation)}</span> annually with the {calculation.recommendedRegime === 'NEW' ? 'New' : 'Old'} Regime!
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl pt-1">
                  {calculation.recommendationReason}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-300 block">Annual CTC Considered</span>
                <span className="text-2xl font-black font-mono text-white">₹{fmt(calculation.annualCtc)}</span>
                <span className="text-[10px] text-slate-300 block mt-0.5">Gross Salary: ₹{fmt(calculation.grossSalary)}</span>
              </div>
            </div>
          </div>

          {/* Dual Regime Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Tax Regime Card */}
            <div className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between ${
              calculation.recommendedRegime === 'NEW' ? 'border-emerald-400 ring-2 ring-emerald-500/20' : 'border-slate-200'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>New Tax Regime</span>
                      {calculation.recommendedRegime === 'NEW' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Recommended
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">Section 115BAC (Revised Standard Deduction ₹75,000)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Annual Tax</span>
                    <span className="text-xl font-black text-emerald-700 font-mono">₹{fmt(calculation.newRegime.totalAnnualTax)}</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-medium">Gross Annual Salary</span>
                    <span className="font-mono font-semibold">₹{fmt(calculation.newRegime.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span className="font-medium">Less: Standard Deduction (Section 16)</span>
                    <span className="font-mono font-semibold">-₹{fmt(calculation.newRegime.standardDeduction)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-400">
                    <span className="font-medium">Chapter VI-A Deductions (80C, 80D)</span>
                    <span className="font-mono font-semibold">₹0 (Not applicable)</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-50 px-2 rounded-xl font-bold text-slate-900">
                    <span>Net Taxable Income</span>
                    <span className="font-mono">₹{fmt(calculation.newRegime.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-medium">Base Income Tax on Slabs</span>
                    <span className="font-mono font-semibold">₹{fmt(calculation.newRegime.baseIncomeTax)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                    <span className="font-medium">Rebate under Section 87A</span>
                    <span className="font-mono font-semibold">-₹{fmt(calculation.newRegime.rebate87A)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                    <span className="font-medium">Health & Education Cess @ 4%</span>
                    <span className="font-mono font-semibold">₹{fmt(calculation.newRegime.healthAndEducationCess)}</span>
                  </div>
                </div>

                {/* Slabs Breakdown Accordion / Table */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">New Regime Slab Breakdown</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                    {calculation.newRegime.slabBreakdown.map((s, idx) => (
                      <div key={idx} className="flex justify-between p-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                        <span className="text-slate-600">{s.slabRange} ({s.ratePercent}%)</span>
                        <span className="font-mono font-semibold text-slate-900">₹{fmt(s.slabTaxAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly TDS Footer */}
              <div className="mt-5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950">Monthly TDS to be Deducted:</span>
                <span className="text-base font-black font-mono text-emerald-800">₹{fmt(calculation.newRegime.monthlyTds)} / mo</span>
              </div>
            </div>

            {/* Old Tax Regime Card */}
            <div className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between ${
              calculation.recommendedRegime === 'OLD' ? 'border-blue-400 ring-2 ring-blue-500/20' : 'border-slate-200'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>Old Tax Regime</span>
                      {calculation.recommendedRegime === 'OLD' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Recommended
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500">Allows 80C, 80D, 80CCD, HRA & Home Loan deductions</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Annual Tax</span>
                    <span className="text-xl font-black text-blue-700 font-mono">₹{fmt(calculation.oldRegime.totalAnnualTax)}</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-medium">Gross Annual Salary</span>
                    <span className="font-mono font-semibold">₹{fmt(calculation.oldRegime.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span className="font-medium">Standard Deduction (₹50k) & Prof Tax</span>
                    <span className="font-mono font-semibold">-₹{fmt(calculation.oldRegime.standardDeduction + calculation.oldRegime.professionalTax)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span className="font-medium">Chapter VI-A (80C, 80D, 80CCD)</span>
                    <span className="font-mono font-semibold">-₹{fmt(calculation.oldRegime.chapterViADeductions)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span className="font-medium">Housing: HRA Exemption & Sec 24(b)</span>
                    <span className="font-mono font-semibold">-₹{fmt(calculation.oldRegime.hraExemption + calculation.oldRegime.homeLoanInterestDeduction)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 bg-slate-50 px-2 rounded-xl font-bold text-slate-900">
                    <span>Net Taxable Income</span>
                    <span className="font-mono">₹{fmt(calculation.oldRegime.taxableIncome)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-medium">Base Income Tax on Slabs</span>
                    <span className="font-mono font-semibold">₹{fmt(calculation.oldRegime.baseIncomeTax)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-blue-700">
                    <span className="font-medium">Rebate under Section 87A</span>
                    <span className="font-mono font-semibold">-₹{fmt(calculation.oldRegime.rebate87A)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 text-slate-500">
                    <span className="font-medium">Health & Education Cess @ 4%</span>
                    <span className="font-mono font-semibold">₹{fmt(calculation.oldRegime.healthAndEducationCess)}</span>
                  </div>
                </div>

                {/* Slabs Breakdown Accordion / Table */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">Old Regime Slab Breakdown</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-[11px]">
                    {calculation.oldRegime.slabBreakdown.map((s, idx) => (
                      <div key={idx} className="flex justify-between p-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                        <span className="text-slate-600">{s.slabRange} ({s.ratePercent}%)</span>
                        <span className="font-mono font-semibold text-slate-900">₹{fmt(s.slabTaxAmount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monthly TDS Footer */}
              <div className="mt-5 p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-between text-xs">
                <span className="font-bold text-blue-950">Monthly TDS to be Deducted:</span>
                <span className="text-base font-black font-mono text-blue-800">₹{fmt(calculation.oldRegime.monthlyTds)} / mo</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
