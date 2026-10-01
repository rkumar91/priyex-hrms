import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { InvestmentDeclaration } from '../../types/tax';
import {
  Shield,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Home,
  HeartPulse,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';

interface InvestmentDeclarationTabProps {
  onDeclarationUpdated?: () => void;
}

export const InvestmentDeclarationTab: React.FC<InvestmentDeclarationTabProps> = ({ onDeclarationUpdated }) => {
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [regime, setRegime] = useState<'NEW' | 'OLD'>('NEW');
  const [status, setStatus] = useState<'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'>('DRAFT');
  const [hrNotes, setHrNotes] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Section 80C
  const [sec80cEpf, setSec80cEpf] = useState<number>(0);
  const [sec80cPpf, setSec80cPpf] = useState<number>(0);
  const [sec80cElss, setSec80cElss] = useState<number>(0);
  const [sec80cLifeInsurance, setSec80cLifeInsurance] = useState<number>(0);
  const [sec80cHousingPrincipal, setSec80cHousingPrincipal] = useState<number>(0);
  const [sec80cTuitionFees, setSec80cTuitionFees] = useState<number>(0);
  const [sec80cNscFd, setSec80cNscFd] = useState<number>(0);

  // Section 80CCD(1B) - NPS
  const [sec80ccdNps, setSec80ccdNps] = useState<number>(0);

  // Section 80D
  const [sec80dSelfFamily, setSec80dSelfFamily] = useState<number>(0);
  const [sec80dParents, setSec80dParents] = useState<number>(0);
  const [sec80dPreventiveCheckup, setSec80dPreventiveCheckup] = useState<number>(0);

  // Section 24(b)
  const [sec24HomeLoanInterest, setSec24HomeLoanInterest] = useState<number>(0);

  // HRA
  const [annualRentPaid, setAnnualRentPaid] = useState<number>(0);
  const [landlordName, setLandlordName] = useState('');
  const [landlordPan, setLandlordPan] = useState('');
  const [rentalCityType, setRentalCityType] = useState<'METRO' | 'NON_METRO'>('METRO');

  // Other
  const [sec80eEducationLoan, setSec80eEducationLoan] = useState<number>(0);
  const [sec80gDonations, setSec80gDonations] = useState<number>(0);
  const [sec80ttaSavingsInterest, setSec80ttaSavingsInterest] = useState<number>(0);

  // Computed Live Totals
  const total80c = Number(sec80cEpf || 0) + Number(sec80cPpf || 0) + Number(sec80cElss || 0) +
    Number(sec80cLifeInsurance || 0) + Number(sec80cHousingPrincipal || 0) +
    Number(sec80cTuitionFees || 0) + Number(sec80cNscFd || 0);
  const eligible80c = Math.min(total80c, 150000);

  const eligible80ccd = Math.min(Number(sec80ccdNps || 0), 50000);

  const eligible80d = Math.min(Number(sec80dSelfFamily || 0), 25000) + Math.min(Number(sec80dParents || 0), 50000);

  const eligibleSec24 = Math.min(Number(sec24HomeLoanInterest || 0), 200000);

  const totalDeclared = total80c + Number(sec80ccdNps || 0) + Number(sec80dSelfFamily || 0) +
    Number(sec80dParents || 0) + Number(sec80dPreventiveCheckup || 0) +
    Number(sec24HomeLoanInterest || 0) + Number(annualRentPaid || 0) +
    Number(sec80eEducationLoan || 0) + Number(sec80gDonations || 0) +
    Number(sec80ttaSavingsInterest || 0);

  const totalEligible = eligible80c + eligible80ccd + eligible80d + eligibleSec24 +
    Math.min(Number(sec80ttaSavingsInterest || 0), 10000) +
    Number(sec80eEducationLoan || 0) + Number(sec80gDonations || 0);

  const loadDeclaration = async (fy: string) => {
    setIsLoading(true);
    try {
      const res: any = await api.get(`/tax/declarations/my?financialYear=${fy}`);
      if (res.success && res.data) {
        const d: InvestmentDeclaration = res.data;
        setRegime(d.regime || 'NEW');
        setStatus(d.status || 'DRAFT');
        setHrNotes(d.hrNotes || null);
        setRemarks(d.remarks || '');

        setSec80cEpf(Number(d.sec80cEpf) || 0);
        setSec80cPpf(Number(d.sec80cPpf) || 0);
        setSec80cElss(Number(d.sec80cElss) || 0);
        setSec80cLifeInsurance(Number(d.sec80cLifeInsurance) || 0);
        setSec80cHousingPrincipal(Number(d.sec80cHousingPrincipal) || 0);
        setSec80cTuitionFees(Number(d.sec80cTuitionFees) || 0);
        setSec80cNscFd(Number(d.sec80cNscFd) || 0);

        setSec80ccdNps(Number(d.sec80ccdNps) || 0);

        setSec80dSelfFamily(Number(d.sec80dSelfFamily) || 0);
        setSec80dParents(Number(d.sec80dParents) || 0);
        setSec80dPreventiveCheckup(Number(d.sec80dPreventiveCheckup) || 0);

        setSec24HomeLoanInterest(Number(d.sec24HomeLoanInterest) || 0);

        setAnnualRentPaid(Number(d.annualRentPaid) || 0);
        setLandlordName(d.landlordName || '');
        setLandlordPan(d.landlordPan || '');
        setRentalCityType((d.rentalCityType as any) || 'METRO');

        setSec80eEducationLoan(Number(d.sec80eEducationLoan) || 0);
        setSec80gDonations(Number(d.sec80gDonations) || 0);
        setSec80ttaSavingsInterest(Number(d.sec80ttaSavingsInterest) || 0);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeclaration(financialYear);
  }, [financialYear]);

  const handleSaveOrSubmit = async (isDraft: boolean) => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const payload = {
        financialYear,
        regime,
        sec80cEpf,
        sec80cPpf,
        sec80cElss,
        sec80cLifeInsurance,
        sec80cHousingPrincipal,
        sec80cTuitionFees,
        sec80cNscFd,
        sec80ccdNps,
        sec80dSelfFamily,
        sec80dParents,
        sec80dPreventiveCheckup,
        sec24HomeLoanInterest,
        annualRentPaid,
        landlordName,
        landlordPan,
        rentalCityType,
        sec80eEducationLoan,
        sec80gDonations,
        sec80ttaSavingsInterest,
        remarks,
        isDraft
      };

      const res: any = await api.post('/tax/declarations/submit', payload);
      if (res.success) {
        setStatus(isDraft ? 'DRAFT' : 'SUBMITTED');
        setFeedback({
          type: 'success',
          message: isDraft
            ? 'Investment declaration draft saved successfully!'
            : 'Declaration submitted to HR for verification and tax computation.'
        });
        if (onDeclarationUpdated) onDeclarationUpdated();
      } else {
        setFeedback({ type: 'error', message: res.message || 'Failed to save declaration' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Error occurred saving declaration' });
    } finally {
      setIsSaving(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('en-IN');

  return (
    <div className="space-y-6">
      {/* Header & FY Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span>Investment & Tax Exemption Declaration</span>
                {status === 'VERIFIED' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified by HR
                  </span>
                )}
                {status === 'SUBMITTED' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> Pending HR Verification
                  </span>
                )}
                {status === 'DRAFT' && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Draft
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Declare deductions under Chapter VI-A & HRA to minimize monthly TDS salary deductions
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Financial Year</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="2026-2027">FY 2026-2027 (AY 2027-2028)</option>
              <option value="2025-2026">FY 2025-2026 (AY 2026-2027)</option>
              <option value="2024-2025">FY 2024-2025 (AY 2025-2026)</option>
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={() => handleSaveOrSubmit(true)}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
          </div>
          <div className="pt-4">
            <button
              onClick={() => handleSaveOrSubmit(false)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Submitting...' : 'Submit to HR'}</span>
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 font-medium ${
          feedback.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {hrNotes && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">HR Review Notes:</span>
            <span>{hrNotes}</span>
          </div>
        </div>
      )}

      {/* Tax Regime Choice Banner */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Choice of Income Tax Regime</span>
            <h3 className="text-base sm:text-lg font-bold mt-1">Select your preferred calculation scheme</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Under Finance Act revisions, the <strong>New Tax Regime (Section 115BAC)</strong> is default with flat lower tax rates and ₹75,000 standard deduction. Choose <strong>Old Tax Regime</strong> if you claim substantial 80C, 80D, HRA or Home loan interest deductions.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setRegime('NEW')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                regime === 'NEW'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>New Regime (Default)</span>
            </button>
            <button
              onClick={() => setRegime('OLD')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                regime === 'OLD'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Old Regime (With Exemptions)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Declared Deductions</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-mono">₹{fmt(totalDeclared)}</p>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Across all 80C, 80D, 24b, and HRA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Eligible Tax-Exempt Deductions</span>
          <p className="text-xl font-black text-emerald-700 mt-1 font-mono">₹{fmt(totalEligible)}</p>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Applied to reduce taxable income (Old Regime)</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Section 80C Cap Status</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-blue-700 font-mono">₹{fmt(eligible80c)}</span>
            <span className="text-xs font-bold text-slate-500">/ ₹1,50,000 max</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${eligible80c >= 150000 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${Math.min(100, (eligible80c / 150000) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Categorized Declaration Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 80C Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Section 80C Deductions</h3>
            </div>
            <span className="text-xs font-bold text-slate-500 font-mono">Max Limit: ₹1,50,000</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">EPF (Employee Provident Fund)</label>
              <input
                type="number"
                value={sec80cEpf || ''}
                onChange={(e) => setSec80cEpf(Number(e.target.value))}
                placeholder="Auto-calculated from payroll"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Public Provident Fund (PPF)</label>
              <input
                type="number"
                value={sec80cPpf || ''}
                onChange={(e) => setSec80cPpf(Number(e.target.value))}
                placeholder="e.g. 50000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Equity Linked Savings (ELSS)</label>
              <input
                type="number"
                value={sec80cElss || ''}
                onChange={(e) => setSec80cElss(Number(e.target.value))}
                placeholder="Tax saver mutual funds"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Life Insurance Premium (LIC)</label>
              <input
                type="number"
                value={sec80cLifeInsurance || ''}
                onChange={(e) => setSec80cLifeInsurance(Number(e.target.value))}
                placeholder="Annual premium"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Housing Loan Principal Repayment</label>
              <input
                type="number"
                value={sec80cHousingPrincipal || ''}
                onChange={(e) => setSec80cHousingPrincipal(Number(e.target.value))}
                placeholder="Principal component"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Children Tuition Fees (Max 2)</label>
              <input
                type="number"
                value={sec80cTuitionFees || ''}
                onChange={(e) => setSec80cTuitionFees(Number(e.target.value))}
                placeholder="School/College fees"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">National Savings Certificate (NSC) / Tax Saver FD</label>
              <input
                type="number"
                value={sec80cNscFd || ''}
                onChange={(e) => setSec80cNscFd(Number(e.target.value))}
                placeholder="5-year tax saver fixed deposit"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs font-semibold text-blue-900">
            <span>80C Total Declared: ₹{fmt(total80c)}</span>
            <span className="font-bold text-blue-700">Eligible Exemption: ₹{fmt(eligible80c)}</span>
          </div>
        </div>

        {/* Section 80D & Section 80CCD Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Medical Insurance & NPS</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Sec 80D & 80CCD(1B)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">Section 80CCD(1B) • NPS (National Pension Scheme)</label>
                <span className="text-[10px] text-slate-500 font-mono">Max: ₹50,000</span>
              </div>
              <input
                type="number"
                value={sec80ccdNps || ''}
                onChange={(e) => setSec80ccdNps(Number(e.target.value))}
                placeholder="Tier-1 NPS contribution"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">80D: Self, Spouse & Dependent Children</label>
                <span className="text-[10px] text-slate-500 font-mono">Max: ₹25,000</span>
              </div>
              <input
                type="number"
                value={sec80dSelfFamily || ''}
                onChange={(e) => setSec80dSelfFamily(Number(e.target.value))}
                placeholder="Mediclaim premium for self & family"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">80D: Parents Health Insurance</label>
                <span className="text-[10px] text-slate-500 font-mono">Max: ₹50,000 (Senior Citizen)</span>
              </div>
              <input
                type="number"
                value={sec80dParents || ''}
                onChange={(e) => setSec80dParents(Number(e.target.value))}
                placeholder="Mediclaim premium for parents"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">80D: Preventive Health Checkup</label>
                <span className="text-[10px] text-slate-500 font-mono">Max: ₹5,000 (within overall 80D)</span>
              </div>
              <input
                type="number"
                value={sec80dPreventiveCheckup || ''}
                onChange={(e) => setSec80dPreventiveCheckup(Number(e.target.value))}
                placeholder="Annual health checkup receipt"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs font-semibold text-rose-900">
            <span>NPS Eligible: ₹{fmt(eligible80ccd)}</span>
            <span className="font-bold text-rose-700">80D Medical Eligible: ₹{fmt(eligible80d)}</span>
          </div>
        </div>

        {/* Section 24(b) Home Loan Interest & HRA */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Housing: Home Loan & HRA</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Sec 24(b) & Sec 10(13A)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">Interest on Housing Loan (Self-Occupied)</label>
                <span className="text-[10px] text-slate-500 font-mono">Max: ₹2,00,000</span>
              </div>
              <input
                type="number"
                value={sec24HomeLoanInterest || ''}
                onChange={(e) => setSec24HomeLoanInterest(Number(e.target.value))}
                placeholder="Annual interest from provisional loan certificate"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Annual Rent Paid (HRA Claim)</label>
                <input
                  type="number"
                  value={annualRentPaid || ''}
                  onChange={(e) => setAnnualRentPaid(Number(e.target.value))}
                  placeholder="Total rent paid in year"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rental City Accommodation</label>
                <select
                  value={rentalCityType}
                  onChange={(e) => setRentalCityType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="METRO">Metro (Delhi-NCR, Mumbai, Kolkata, Chennai - 50%)</option>
                  <option value="NON_METRO">Non-Metro (All other cities - 40%)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Landlord Full Name</label>
                <input
                  type="text"
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  placeholder="As per rent agreement"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Landlord PAN (Required if rent &gt; ₹1L)</label>
                <input
                  type="text"
                  value={landlordPan}
                  onChange={(e) => setLandlordPan(e.target.value.toUpperCase())}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Other Sections & Remarks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Other Deductions & Remarks</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">Sec 80E, 80G & 80TTA</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Section 80E • Higher Education Loan Interest</label>
              <input
                type="number"
                value={sec80eEducationLoan || ''}
                onChange={(e) => setSec80eEducationLoan(Number(e.target.value))}
                placeholder="No upper limit on interest paid"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Section 80G • Eligible Charitable Donations</label>
              <input
                type="number"
                value={sec80gDonations || ''}
                onChange={(e) => setSec80gDonations(Number(e.target.value))}
                placeholder="Donations with 80G receipt"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 font-semibold">Section 80TTA • Savings Account Interest</label>
                <span className="text-[10px] text-slate-500 font-mono">Max: ₹10,000</span>
              </div>
              <input
                type="number"
                value={sec80ttaSavingsInterest || ''}
                onChange={(e) => setSec80ttaSavingsInterest(Number(e.target.value))}
                placeholder="Interest from savings bank"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Employee Remarks & Notes</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Provide details of uploaded proof documents or special circumstances..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
