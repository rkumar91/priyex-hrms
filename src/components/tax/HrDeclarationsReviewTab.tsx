import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { InvestmentDeclaration, CompanyOption } from '../../types/tax';
import {
  ShieldCheck,
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  Send,
  AlertCircle
} from 'lucide-react';
import { createPortal } from 'react-dom';

export const HrDeclarationsReviewTab: React.FC = () => {
  const [declarations, setDeclarations] = useState<InvestmentDeclaration[]>([]);
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [statusFilter, setStatusFilter] = useState('');
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Review Drawer state
  const [selectedDecl, setSelectedDecl] = useState<InvestmentDeclaration | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fetch Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res: any = await api.get('/organization/companies');
        if (res.success && Array.isArray(res.data)) {
          setCompanies(res.data);
        }
      } catch (e) {}
    };
    fetchCompanies();
  }, []);

  const fetchDeclarations = async () => {
    setIsLoading(true);
    try {
      let url = `/tax/declarations/company?companyId=${selectedCompanyId}&financialYear=${financialYear}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res: any = await api.get(url);
      if (res.success && Array.isArray(res.data)) {
        setDeclarations(res.data);
      }
    } catch (e) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, [selectedCompanyId, financialYear, statusFilter]);

  const handleVerify = async (action: 'VERIFIED' | 'REJECTED') => {
    if (!selectedDecl?.id) return;
    setIsUpdating(true);
    try {
      const res: any = await api.put(`/tax/declarations/${selectedDecl.id}/verify`, {
        status: action,
        hrNotes: reviewNotes || (action === 'VERIFIED' ? 'Verified by HR compliance' : 'Documentation rejected; please revise proofs')
      });
      if (res.success) {
        setFeedback(`Declaration successfully marked as ${action}`);
        setSelectedDecl(null);
        fetchDeclarations();
      } else {
        alert(res.message || 'Failed to update declaration status');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const fmt = (n?: number) => {
    if (!n) return '0.00';
    return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredList = declarations.filter(d => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.employeeName?.toLowerCase().includes(term) ||
      d.employeeCode?.toLowerCase().includes(term) ||
      d.departmentName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Employee Tax Declarations Review Register</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit and verify investment claims, proofs, and Chapter VI-A deductions for corporate payroll processing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Org */}
          <div>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
              className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.legalName}</option>
              ))}
            </select>
          </div>

          {/* FY */}
          <div>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="2026-2027">FY 2026-2027</option>
              <option value="2025-2026">FY 2025-2026</option>
              <option value="2024-2025">FY 2024-2025</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted (Pending Review)</option>
              <option value="VERIFIED">Verified</option>
              <option value="DRAFT">Draft</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-semibold">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search candidate by name, code..."
              className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-8 pr-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="p-3 pl-5">Employee</th>
                <th className="p-3">Chosen Regime</th>
                <th className="p-3 text-right">80C Declared</th>
                <th className="p-3 text-right">80D Medical</th>
                <th className="p-3 text-right">HRA Claim</th>
                <th className="p-3 text-right">Total Eligible (₹)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Loading declarations...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No investment declarations found for this criteria.
                  </td>
                </tr>
              ) : (
                filteredList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 pl-5">
                      <div className="font-bold text-slate-900">{d.employeeName || `EMP #${d.employeeId}`}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{d.employeeCode} • {d.departmentName}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.regime === 'NEW' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {d.regime === 'NEW' ? 'New Regime' : 'Old Regime'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">₹{fmt(d.sec80cTotal)}</td>
                    <td className="p-3 text-right font-mono">₹{fmt(d.sec80dTotal)}</td>
                    <td className="p-3 text-right font-mono">₹{fmt(d.annualRentPaid)}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">₹{fmt(d.totalEligibleDeductions)}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : d.status === 'SUBMITTED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : d.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedDecl(d);
                          setReviewNotes(d.hrNotes || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition cursor-pointer flex items-center gap-1.5 ml-auto text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Claims</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Verification Drawer Modal */}
      {selectedDecl && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Review Declaration • {selectedDecl.employeeName} ({selectedDecl.employeeCode})
                  </h3>
                  <p className="text-xs text-slate-500">Financial Year: {selectedDecl.financialYear}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDecl(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Chosen Regime:</span>
                  <span className="font-bold text-slate-900">{selectedDecl.regime === 'NEW' ? 'New Tax Regime' : 'Old Tax Regime'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Annual CTC:</span>
                  <span className="font-bold font-mono text-slate-900">₹{fmt(selectedDecl.annualCtc)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Declared Deductions:</span>
                  <span className="font-bold font-mono text-blue-700">₹{fmt(selectedDecl.totalDeclaredDeductions)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Eligible Deductions:</span>
                  <span className="font-bold font-mono text-emerald-700">₹{fmt(selectedDecl.totalEligibleDeductions)}</span>
                </div>
              </div>

              {/* Deduction Breakdown Details */}
              <div className="space-y-2 border border-slate-200 rounded-2xl p-4">
                <h4 className="font-bold text-slate-800">Declared Sections Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Section 80C:</span>
                    <span className="font-mono font-semibold">₹{fmt(selectedDecl.sec80cTotal)} (Eligible: ₹{fmt(selectedDecl.sec80cEligible)})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Section 80CCD(1B) NPS:</span>
                    <span className="font-mono font-semibold">₹{fmt(selectedDecl.sec80ccdEligible)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Section 80D Mediclaim:</span>
                    <span className="font-mono font-semibold">₹{fmt(selectedDecl.sec80dEligible)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Home Loan Interest (24b):</span>
                    <span className="font-mono font-semibold">₹{fmt(selectedDecl.sec24Eligible)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 sm:col-span-2">
                    <span>Annual Rent Paid (HRA):</span>
                    <span className="font-mono font-semibold">
                      ₹{fmt(selectedDecl.annualRentPaid)} {selectedDecl.landlordName ? `(Landlord: ${selectedDecl.landlordName}, PAN: ${selectedDecl.landlordPan || 'N/A'})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {selectedDecl.remarks && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700">
                  <span className="font-bold block text-slate-900 mb-0.5">Employee Submission Remarks:</span>
                  <span>{selectedDecl.remarks}</span>
                </div>
              )}

              {/* HR Verification Notes */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">HR Audit & Verification Remarks</label>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Notes on proof validation, receipts, or reasons for rejection..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedDecl(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer transition text-xs"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleVerify('REJECTED')}
                disabled={isUpdating}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition cursor-pointer flex items-center gap-1.5 text-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject / Request Revision</span>
              </button>
              <button
                type="button"
                onClick={() => handleVerify('VERIFIED')}
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-1.5 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Verify Declaration</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
