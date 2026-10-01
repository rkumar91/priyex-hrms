import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, CheckCircle2, Building2, User } from 'lucide-react';
import { Form12bbResponse } from '../../types/tax';

interface Form12bbModalProps {
  form12bb: Form12bbResponse | null;
  onClose: () => void;
}

export const Form12bbModal: React.FC<Form12bbModalProps> = ({ form12bb, onClose }) => {
  if (!form12bb) return null;

  const handlePrint = () => {
    window.print();
  };

  const fmt = (n?: number) => {
    if (n === undefined || n === null) return '0.00';
    return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>FORM NO. 12BB • Statement of Claims</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  FY {form12bb.financialYear}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">Rule 26C Income Tax Rules, 1962</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md shadow-purple-600/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div id="form-12bb-print-container" className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs text-slate-900 bg-white">
          <div className="border-2 border-slate-900 p-5 rounded-2xl space-y-3">
            <div className="text-center space-y-1">
              <p className="text-[10px] tracking-widest uppercase font-bold text-slate-500">Income Tax Department • Government of India</p>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase">FORM NO. 12BB</h1>
              <p className="text-[11px] font-medium text-slate-700">
                [See rule 26C] Statement of claims by an employee for deduction of tax under section 192
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-300 font-medium text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Financial Year</span>
                <span className="font-bold text-slate-900">{form12bb.financialYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Assessment Year</span>
                <span className="font-bold text-purple-900">{form12bb.assessmentYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Employee PAN</span>
                <span className="font-mono font-bold text-slate-900">{form12bb.employeePan}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Status</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {form12bb.status || 'SUBMITTED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" /> Employee Particulars
                </span>
                <p className="font-bold text-slate-900">{form12bb.employeeName}</p>
                <p className="text-slate-600">{form12bb.employeeDesignation} • {form12bb.employeeDepartment}</p>
                <p className="text-slate-600">{form12bb.employeeAddress}</p>
              </div>

              <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Employer Particulars
                </span>
                <p className="font-bold text-slate-900">{form12bb.employerLegalName}</p>
                <p className="text-slate-600">{form12bb.employerAddress}</p>
                <p className="text-slate-600 font-mono text-[10px]">TAN: {form12bb.employerTan} | PAN: {form12bb.employerPan}</p>
              </div>
            </div>
          </div>

          {/* Statement of Claims Table */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-[11px] divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-800">
                <tr>
                  <th className="p-3 w-12 text-center">Sl.</th>
                  <th className="p-3">Nature of Claim</th>
                  <th className="p-3 text-right">Amount Claimed (₹)</th>
                  <th className="p-3">Evidence / Particulars Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. HRA */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 text-center font-bold">1</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">House Rent Allowance (HRA)</span>
                    <span className="text-slate-500 text-[10px]">Rent paid to landlord under section 10(13A)</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{fmt(form12bb.annualRentPaid)}</td>
                  <td className="p-3 text-slate-600 text-[10px]">
                    {form12bb.annualRentPaid > 0 ? (
                      <>
                        Landlord: <strong className="text-slate-800">{form12bb.landlordName || 'N/A'}</strong> (PAN: {form12bb.landlordPan || 'N/A'})
                        <br />Location: {form12bb.rentalCityType} Region • Rent receipts and agreement attached
                      </>
                    ) : 'No HRA claimed'}
                  </td>
                </tr>

                {/* 2. LTA */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 text-center font-bold">2</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">Leave Travel Concession / Assistance (LTA)</span>
                    <span className="text-slate-500 text-[10px]">Exemption under section 10(5)</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{fmt(form12bb.ltaClaimAmount)}</td>
                  <td className="p-3 text-slate-600 text-[10px]">
                    {form12bb.ltaClaimAmount > 0 ? 'Travel tickets and boarding passes submitted' : 'No LTA claim for this period'}
                  </td>
                </tr>

                {/* 3. Home Loan Interest */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 text-center font-bold">3</td>
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">Deduction of Interest on Borrowing (Home Loan)</span>
                    <span className="text-slate-500 text-[10px]">Section 24(b) for self-occupied residential property</span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-900">₹{fmt(form12bb.homeLoanInterest)}</td>
                  <td className="p-3 text-slate-600 text-[10px]">
                    {form12bb.homeLoanInterest > 0 ? (
                      <>
                        Lender: <strong className="text-slate-800">{form12bb.lenderName || 'Financial Institution'}</strong> (PAN: {form12bb.lenderPan || 'AAACH1234G'})
                        <br />Interest certificate issued by bank submitted
                      </>
                    ) : 'No home loan interest claimed'}
                  </td>
                </tr>

                {/* 4. Chapter VI-A */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-3 text-center font-bold">4</td>
                  <td className="p-3" colSpan={3}>
                    <span className="font-bold text-slate-900 block mb-1">Deduction under Chapter VI-A</span>
                    <div className="space-y-1.5 pl-3 border-l-2 border-purple-300">
                      <div className="flex justify-between text-[10px]">
                        <span>(a) Section 80C (EPF, PPF, ELSS, Life Insurance, Housing Principal)</span>
                        <span className="font-mono font-bold">₹{fmt(form12bb.sec80cEligible)} (Declared: ₹{fmt(form12bb.sec80cTotal)})</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>(b) Section 80CCD(1B) (National Pension Scheme - NPS)</span>
                        <span className="font-mono font-bold">₹{fmt(form12bb.sec80ccdNps)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>(c) Section 80D (Health Insurance / Mediclaim for self, family & parents)</span>
                        <span className="font-mono font-bold">₹{fmt(form12bb.sec80dMedical)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>(d) Other Sections (80E Education loan interest, 80G donations)</span>
                        <span className="font-mono font-bold">₹{fmt(form12bb.otherDeductions)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-purple-50 font-bold text-purple-950 border-t-2 border-purple-200">
                <tr>
                  <td colSpan={2} className="p-3 text-right uppercase">Total Declared Deductions & Exemptions:</td>
                  <td className="p-3 text-right font-mono text-sm">₹{fmt(form12bb.totalClaims)}</td>
                  <td className="p-3 text-[10px] text-purple-800">Verified by Priyex HRMS Internal Auditor</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Declaration by Employee */}
          <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/60 space-y-3">
            <h4 className="font-bold uppercase text-[10px] text-slate-700 tracking-wider">Employee Declaration</h4>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              I, <strong className="text-slate-900">{form12bb.employeeName}</strong>, son/daughter of the designated guardian, do hereby declare that all the information provided above regarding investment declarations, deductions, and exemptions are true, correct, and complete to the best of my knowledge and belief. In case of any false or misleading declaration, I shall be personally liable for penalty or recovery of taxes.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 text-[10px] text-slate-600">
              <div>
                <p>Place: <span className="font-semibold text-slate-900">{form12bb.declarationPlace}</span></p>
                <p>Date: <span className="font-semibold text-slate-900">{form12bb.declarationDate}</span></p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-800 font-semibold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Electronically Signed & Lodged
                </div>
                <p className="text-slate-500 font-mono text-[9px]">Aadhaar / e-Sign Token: {form12bb.employeePan}-ESIGN</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
