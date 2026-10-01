import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { CompanyOption, Form16Response, Form12bbResponse } from '../../types/tax';
import { EmployeePayslip } from '../../pages/PayrollPage';
import { Form16Modal } from './Form16Modal';
import { Form12bbModal } from './Form12bbModal';
import { useAuth } from '../../context/AuthContext';
import { isHrAdmin } from '../../utils/rbac';
import {
  Download,
  Building2,
  Calendar,
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Eye,
  FileCheck2,
  Award,
  Search,
  DollarSign
} from 'lucide-react';

interface FormsDownloadCenterTabProps {
  onViewPayslip: (payslip: EmployeePayslip) => void;
}

const MONTHS = [
  { value: '', label: 'All Months' },
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const YEARS = [
  { value: '2026', label: '2026 (FY 2026-27)' },
  { value: '2025', label: '2025 (FY 2025-26)' },
  { value: '2024', label: '2024 (FY 2024-25)' }
];

export const FormsDownloadCenterTab: React.FC<FormsDownloadCenterTabProps> = ({ onViewPayslip }) => {
  const { user } = useAuth();
  const canManage = isHrAdmin(user);

  // Filters State
  const [companies, setCompanies] = useState<CompanyOption[]>([
    { id: 1, code: 'PRIYEX', legalName: 'Priyex Technologies Private Limited', brandName: 'Priyex Technologies' },
    { id: 2, code: 'PRIYEX-DIGITAL', legalName: 'Priyex Digital Solutions Private Limited', brandName: 'Priyex Digital' },
    { id: 3, code: 'PRIYEX-CONSULT', legalName: 'Priyex Global Consulting Private Limited', brandName: 'Priyex Consulting' }
  ]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Payslips Data
  const [filteredPayslips, setFilteredPayslips] = useState<EmployeePayslip[]>([]);
  const [isLoadingPayslips, setIsLoadingPayslips] = useState(false);

  // Modal States
  const [selectedForm16, setSelectedForm16] = useState<Form16Response | null>(null);
  const [selectedForm12bb, setSelectedForm12bb] = useState<Form12bbResponse | null>(null);
  const [isFetchingForm, setIsFetchingForm] = useState(false);

  // Load Companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res: any = await api.get('/organization/companies');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCompanies(res.data);
        }
      } catch (e) {
        // Fallback kept
      }
    };
    fetchCompanies();
  }, []);

  // Fetch Filtered Payslips
  const fetchPayslips = async () => {
    setIsLoadingPayslips(true);
    try {
      let url = `/payroll/payslips?companyId=${selectedCompanyId}&year=${selectedYear}`;
      if (selectedMonth) {
        url += `&month=${selectedMonth}`;
      }
      const res: any = await api.get(url);
      if (res.success && Array.isArray(res.data)) {
        setFilteredPayslips(res.data);
      } else {
        setFilteredPayslips([]);
      }
    } catch (e) {
      setFilteredPayslips([]);
    } finally {
      setIsLoadingPayslips(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [selectedCompanyId, selectedYear, selectedMonth]);

  // Load & Open Form 16
  const handleOpenForm16 = async (employeeId?: number) => {
    setIsFetchingForm(true);
    try {
      const fy = `${selectedYear}-${Number(selectedYear) + 1}`;
      let url = `/tax/form16?financialYear=${fy}&companyId=${selectedCompanyId}`;
      if (employeeId) url += `&employeeId=${employeeId}`;

      const res: any = await api.get(url);
      if (res.success && res.data) {
        setSelectedForm16(res.data);
      } else {
        alert('Form 16 data not available for this period');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to fetch Form 16');
    } finally {
      setIsFetchingForm(false);
    }
  };

  // Load & Open Form 12BB
  const handleOpenForm12bb = async (employeeId?: number) => {
    setIsFetchingForm(true);
    try {
      const fy = `${selectedYear}-${Number(selectedYear) + 1}`;
      let url = `/tax/form12bb?financialYear=${fy}&companyId=${selectedCompanyId}`;
      if (employeeId) url += `&employeeId=${employeeId}`;

      const res: any = await api.get(url);
      if (res.success && res.data) {
        setSelectedForm12bb(res.data);
      } else {
        alert('Form 12BB data not available for this period');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to fetch Form 12BB');
    } finally {
      setIsFetchingForm(false);
    }
  };

  const selectedCompany = companies.find(c => c.id === Number(selectedCompanyId));
  const currentFyLabel = `FY ${selectedYear}-${Number(selectedYear) + 1} (AY ${Number(selectedYear) + 1}-${Number(selectedYear) + 2})`;

  const fmt = (n?: number) => {
    if (!n) return '0.00';
    return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const displayPayslips = filteredPayslips.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.employeeName?.toLowerCase().includes(term) ||
      p.employeeCode?.toLowerCase().includes(term) ||
      p.departmentName?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Universal Multi-Organization, Year & Month Dropdown Toolbar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span>Multi-Organization & Period Filter Console</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter statutory tax forms and payroll payslips across enterprise legal entities, financial years, and months
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 text-slate-700">
            Active: <strong className="text-blue-700">{selectedCompany?.brandName || selectedCompany?.legalName}</strong> • {currentFyLabel}
          </div>
        </div>

        {/* The 3 Core Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Organization Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Organization Name</span>
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
            >
              {companies.map(comp => (
                <option key={comp.id} value={comp.id}>
                  {comp.legalName} ({comp.code})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Year Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Financial / Calendar Year</span>
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
            >
              {YEARS.map(yr => (
                <option key={yr.value} value={yr.value}>
                  {yr.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Month Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              <span>Disbursement Month</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-500 cursor-pointer shadow-2xs"
            >
              {MONTHS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statutory Tax Certificates & Forms Download Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Statutory Tax Forms & Certificates ({currentFyLabel})</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">Ready for instant download & printing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Form 16 */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-blue-300 transition group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-105 transition">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">FORM NO. 16</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">Part A & B</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Official certificate of tax deducted at source (TDS) under Section 203 with quarterly challan deposits and Chapter VI-A salary computation.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400">Section 203</span>
              <button
                onClick={() => handleOpenForm16()}
                disabled={isFetchingForm}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-blue-600/20"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View & Print</span>
              </button>
            </div>
          </div>

          {/* Card 2: Form 12BB */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-purple-300 transition group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">FORM NO. 12BB</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800">Rule 26C</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Official statement of claims by employee for deduction of tax under Section 192 (HRA, Home Loan Interest, 80C, 80D).
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400">Rule 26C</span>
              <button
                onClick={() => handleOpenForm12bb()}
                disabled={isFetchingForm}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-purple-600/20"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View & Print</span>
              </button>
            </div>
          </div>

          {/* Card 3: Annual Tax Computation Sheet */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Tax Computation Sheet</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">Annual</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Full annual salary computation, slab-by-slab tax calculation, cess, and 12-month projected TDS deduction schedule.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono font-medium text-slate-400">Dual Regime</span>
              <button
                onClick={() => handleOpenForm16()}
                disabled={isFetchingForm}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sheet</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Payslips Matching the Selected Filters */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Available Payslips for Download ({selectedCompany?.legalName})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered for {selectedYear} • {selectedMonth ? MONTHS.find(m => m.value === selectedMonth)?.label : 'All Months'}
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee / code..."
              className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-100">
            <thead className="bg-slate-50/80 font-bold text-slate-700">
              <tr>
                <th className="p-3 pl-5">Pay Period</th>
                <th className="p-3">Employee</th>
                <th className="p-3 text-right">Gross (₹)</th>
                <th className="p-3 text-right">Deductions (₹)</th>
                <th className="p-3 text-right">Net Take-Home (₹)</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingPayslips ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading records from enterprise register...
                  </td>
                </tr>
              ) : displayPayslips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No payslips found for {selectedCompany?.legalName} in {selectedYear} {selectedMonth ? `(${MONTHS.find(m => m.value === selectedMonth)?.label})` : ''}.
                  </td>
                </tr>
              ) : (
                displayPayslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-3 pl-5 font-bold text-slate-900">{slip.payPeriod}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{slip.employeeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{slip.employeeCode} • {slip.departmentName}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-slate-700">₹{fmt(slip.monthlyGross || slip.totalEarnings)}</td>
                    <td className="p-3 text-right font-mono font-medium text-rose-600">-₹{fmt(slip.totalDeductions)}</td>
                    <td className="p-3 text-right font-mono font-black text-emerald-700 text-sm">₹{fmt(slip.netSalary)}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {slip.status || 'PAID'}
                      </span>
                    </td>
                    <td className="p-3 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewPayslip(slip)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition cursor-pointer text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => onViewPayslip(slip)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition cursor-pointer text-xs shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Download / Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Render Modals */}
      <Form16Modal form16={selectedForm16} onClose={() => setSelectedForm16(null)} />
      <Form12bbModal form12bb={selectedForm12bb} onClose={() => setSelectedForm12bb(null)} />
    </div>
  );
};
