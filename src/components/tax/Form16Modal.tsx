import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Download, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
import { Form16Response } from '../../types/tax';

interface Form16ModalProps {
  form16: Form16Response | null;
  onClose: () => void;
}

export const Form16Modal: React.FC<Form16ModalProps> = ({ form16, onClose }) => {
  if (!form16) return null;

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
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span>FORM NO. 16 • TDS Certificate</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  AY {form16.assessmentYear}
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-mono">Certificate: {form16.certificateNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-600/20"
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

        {/* Certificate Printable Area */}
        <div id="form-16-print-container" className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs text-slate-900 bg-white">
          {/* Official Govt Heading */}
          <div className="border-2 border-slate-900 p-5 rounded-2xl space-y-3">
            <div className="text-center space-y-1">
              <p className="text-[10px] tracking-widest uppercase font-bold text-slate-500">Government of India • Income Tax Department</p>
              <h1 className="text-base sm:text-lg font-black tracking-tight uppercase">FORM NO. 16</h1>
              <p className="text-[11px] font-medium text-slate-700">
                [See rule 31(1)(a)] Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source on payments from 'Salaries'
              </p>
            </div>

            {/* Part A Certificate Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-300 font-medium text-[11px]">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Certificate No.</span>
                <span className="font-mono font-semibold">{form16.certificateNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Last Updated On</span>
                <span>{form16.lastUpdatedOn}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Financial Year</span>
                <span className="font-bold text-slate-900">{form16.financialYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-bold">Assessment Year</span>
                <span className="font-bold text-emerald-800">{form16.assessmentYear}</span>
              </div>
            </div>

            {/* Deductor & Deductee Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Employer / Deductor */}
              <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Name and Address of the Employer (Deductor)
                </span>
                <p className="font-bold text-slate-900">{form16.employerLegalName}</p>
                <p className="text-slate-600">{form16.employerAddress}</p>
                <p className="text-slate-600">{form16.employerCityState}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Employer PAN:</span>
                    <span className="font-mono font-bold text-slate-900">{form16.employerPan}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Employer TAN:</span>
                    <span className="font-mono font-bold text-slate-900">{form16.employerTan}</span>
                  </div>
                </div>
              </div>

              {/* Employee / Deductee */}
              <div className="border border-slate-300 rounded-xl p-3 bg-white space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Name and Designation of Employee (Deductee)
                </span>
                <p className="font-bold text-slate-900">{form16.employeeName} ({form16.employeeCode})</p>
                <p className="text-slate-600">{form16.employeeDesignation} • {form16.employeeDepartment}</p>
                <p className="text-slate-600">{form16.employeeAddress}</p>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[10px]">
                  <div>
                    <span className="text-slate-500 block">Employee PAN:</span>
                    <span className="font-mono font-bold text-emerald-800">{form16.employeePan}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Period with Employer:</span>
                    <span className="font-semibold text-slate-900">{form16.periodFrom} to {form16.periodTo}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Part A Summary of Tax Deducted and Deposited */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 font-bold uppercase text-[11px] tracking-wide text-slate-800">
              PART A: Summary of Tax Deducted and Deposited in the Central Government Account through Book Entry / Challan
            </div>
            <table className="w-full text-left text-[11px] divide-y divide-slate-200">
              <thead className="bg-slate-50 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">Quarter</th>
                  <th className="p-2.5">Receipt / BSR Code</th>
                  <th className="p-2.5">Challan Date</th>
                  <th className="p-2.5 text-right">Gross Amount Credited (₹)</th>
                  <th className="p-2.5 text-right">Tax Deducted (₹)</th>
                  <th className="p-2.5 text-right">Tax Deposited (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {form16.quarterlyTds.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-medium">{q.quarter}</td>
                    <td className="p-2.5 font-mono text-slate-600">{q.bsrCode} / {q.challanSerialNo}</td>
                    <td className="p-2.5 text-slate-600">{q.challanDate}</td>
                    <td className="p-2.5 text-right font-mono">{fmt(q.totalAmountCredited)}</td>
                    <td className="p-2.5 text-right font-mono text-blue-700 font-semibold">{fmt(q.taxDeducted)}</td>
                    <td className="p-2.5 text-right font-mono text-emerald-700 font-semibold">{fmt(q.taxDeposited)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right uppercase">Total TDS Deposited in Central Govt:</td>
                  <td className="p-2.5 text-right font-mono text-blue-800">₹{fmt(form16.totalTdsDeposited)}</td>
                  <td className="p-2.5 text-right font-mono text-emerald-800">₹{fmt(form16.totalTdsDeposited)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section: Part B Annexure - Computation of Taxable Income */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 font-bold uppercase text-[11px] tracking-wide text-slate-800 flex items-center justify-between">
              <span>PART B (Annexure): Details of Salary Paid and Any other Income and Tax Deducted</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Tax Regime: {form16.chosenRegime === 'OLD' ? 'Old Regime (with deductions)' : 'New Regime (Sec 115BAC)'}
              </span>
            </div>

            <div className="divide-y divide-slate-200 text-[11px]">
              <div className="flex justify-between p-2.5 hover:bg-slate-50">
                <span className="font-semibold">1. Gross Salary (under section 17(1) of Income-tax Act)</span>
                <span className="font-mono font-bold">₹{fmt(form16.grossSalary)}</span>
              </div>
              <div className="flex justify-between p-2.5 pl-6 text-slate-600 hover:bg-slate-50">
                <span>(a) Less: Allowances to the extent exempt under section 10 (HRA / LTA)</span>
                <span className="font-mono">₹{fmt(form16.allowancesUnderSection10)}</span>
              </div>
              <div className="flex justify-between p-2.5 hover:bg-slate-50">
                <span className="font-semibold">2. Balance Salary (1 - 1(a))</span>
                <span className="font-mono font-bold">₹{fmt(form16.balanceSalary)}</span>
              </div>
              <div className="flex justify-between p-2.5 pl-6 text-slate-600 hover:bg-slate-50">
                <span>(a) Less: Standard Deduction under section 16(ia)</span>
                <span className="font-mono">₹{fmt(form16.standardDeduction)}</span>
              </div>
              <div className="flex justify-between p-2.5 pl-6 text-slate-600 hover:bg-slate-50">
                <span>(b) Less: Professional Tax under section 16(iii)</span>
                <span className="font-mono">₹{fmt(form16.professionalTax)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50/80 font-bold">
                <span>3. Income chargeable under the head 'Salaries'</span>
                <span className="font-mono text-slate-900">₹{fmt(form16.incomeChargeableUnderSalaries)}</span>
              </div>

              {/* Chapter VI-A Breakdown */}
              <div className="p-2.5 bg-slate-100/60 font-bold uppercase text-[10px] text-slate-700 tracking-wider">
                4. Deductions under Chapter VI-A of the Income-tax Act
              </div>
              <div className="flex justify-between p-2 pl-6 text-slate-600">
                <span>(a) Section 80C (EPF, PPF, ELSS, Housing Principal, Life Insurance)</span>
                <span className="font-mono">₹{fmt(form16.deduction80C)}</span>
              </div>
              <div className="flex justify-between p-2 pl-6 text-slate-600">
                <span>(b) Section 80CCD(1B) (National Pension Scheme - NPS)</span>
                <span className="font-mono">₹{fmt(form16.deduction80CCD)}</span>
              </div>
              <div className="flex justify-between p-2 pl-6 text-slate-600">
                <span>(c) Section 80D (Health / Mediclaim Insurance)</span>
                <span className="font-mono">₹{fmt(form16.deduction80D)}</span>
              </div>
              <div className="flex justify-between p-2 pl-6 text-slate-600">
                <span>(d) Section 24(b) (Interest on Housing Loan for self-occupied property)</span>
                <span className="font-mono">₹{fmt(form16.deductionSection24)}</span>
              </div>
              <div className="flex justify-between p-2 pl-6 text-slate-600">
                <span>(e) Other sections (80E, 80G, 80TTA)</span>
                <span className="font-mono">₹{fmt(form16.otherChapterViADeductions)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 font-bold">
                <span>Aggregate of deductible amount under Chapter VI-A</span>
                <span className="font-mono text-slate-900">₹{fmt(form16.totalDeductionsChapterViA)}</span>
              </div>

              {/* Net Tax Computation */}
              <div className="flex justify-between p-3 bg-emerald-50/50 font-bold text-emerald-950 text-xs">
                <span>5. Total Taxable Income (Rounded off to nearest rupee)</span>
                <span className="font-mono text-sm">₹{fmt(form16.totalTaxableIncome)}</span>
              </div>
              <div className="flex justify-between p-2.5 pl-6 text-slate-700">
                <span>6. Tax on Total Income</span>
                <span className="font-mono">₹{fmt(form16.taxOnTotalIncome)}</span>
              </div>
              <div className="flex justify-between p-2.5 pl-6 text-slate-700">
                <span>7. Less: Rebate under section 87A (if applicable)</span>
                <span className="font-mono text-emerald-700">-₹{fmt(form16.rebateUnder87A)}</span>
              </div>
              <div className="flex justify-between p-2.5 pl-6 text-slate-700">
                <span>8. Health and Education Cess @ 4%</span>
                <span className="font-mono">₹{fmt(form16.cess4Percent)}</span>
              </div>
              <div className="flex justify-between p-3 bg-blue-50/80 font-bold text-blue-950 text-xs">
                <span>9. Net Tax Payable for Assessment Year {form16.assessmentYear}</span>
                <span className="font-mono text-sm">₹{fmt(form16.netTaxPayable)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 font-medium">
                <span>10. Total Tax Deducted at Source (TDS) and deposited</span>
                <span className="font-mono font-bold text-emerald-800">₹{fmt(form16.totalTaxDeductedAtSource)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 font-medium">
                <span>11. Tax Payable / Refundable</span>
                <span className="font-mono font-bold text-slate-900">₹{fmt(form16.refundOrBalanceDue)} (NIL Balance)</span>
              </div>
            </div>
          </div>

          {/* Verification & Digital Signature Declaration */}
          <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/60 space-y-3">
            <h4 className="font-bold uppercase text-[10px] text-slate-700 tracking-wider">Verification</h4>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              I, <strong className="text-slate-900">{form16.signatoryName}</strong>, working in the capacity of <strong className="text-slate-900">{form16.signatoryDesignation}</strong> do hereby certify that a sum of <strong className="text-slate-900">₹{fmt(form16.totalTdsDeposited)}</strong> has been deducted and a credit thereof has been deposited to the credit of the Central Government. I further certify that the information given above is complete and correct and is based on the books of account and other relevant records.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-200 text-[10px] text-slate-600">
              <div>
                <p>Place: <span className="font-semibold text-slate-900">{form16.verificationPlace}</span></p>
                <p>Date: <span className="font-semibold text-slate-900">{form16.verificationDate}</span></p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-800 font-semibold mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Digitally Verified & Generated by Priyex HRMS
                </div>
                <p className="text-slate-500 font-mono text-[9px]">Auth Code: PRY-TRACES-SEC203-{form16.employeePan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
