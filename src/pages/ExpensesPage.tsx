import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { isHrAdmin } from '../utils/rbac';
import api from '../api/client';
import {
  Receipt,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Filter,
  Search,
  Download,
  FileText,
  AlertCircle,
  Eye,
  X,
  CreditCard,
  Building,
  Plane,
  Coffee,
  Laptop,
  Smartphone,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Tag,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Paperclip
} from 'lucide-react';

export interface ExpenseClaim {
  id: number;
  claimNumber: string;
  companyId?: number;
  employeeId?: number;
  employeeName: string;
  department: string;
  category: 'TRAVEL' | 'MEALS' | 'LODGING' | 'OFFICE_SUPPLIES' | 'CLIENT_ENTERTAINMENT' | 'MOBILE_INTERNET' | 'TRAINING';
  merchant: string;
  amount: number;
  currency: string;
  expenseDate: string;
  submittedAt: string;
  description: string;
  projectCode?: string;
  gstin?: string;
  receiptName?: string;
  receiptUrl?: string;
  status: 'PENDING' | 'PENDING_MANAGER' | 'PENDING_HR' | 'APPROVED' | 'REJECTED' | 'REJECTED_MANAGER' | 'REJECTED_HR' | 'REIMBURSED';
  managerId?: number;
  managerName?: string;
  managerComment?: string;
  managerApprovedAt?: string;
  hrComment?: string;
  hrApprovedBy?: number;
  hrApprovedAt?: string;
  approverRemarks?: string;
  reimbursedDate?: string;
  reimbursementRef?: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  TRAVEL: { label: 'Travel & Transport', icon: Plane, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-200' },
  MEALS: { label: 'Meals & Per Diem', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  LODGING: { label: 'Hotel & Lodging', icon: Building, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200' },
  OFFICE_SUPPLIES: { label: 'Office & Tech Supplies', icon: Laptop, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  CLIENT_ENTERTAINMENT: { label: 'Client Entertainment', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' },
  MOBILE_INTERNET: { label: 'Mobile & Internet Reimbursement', icon: Smartphone, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200' },
  TRAINING: { label: 'Training & Certifications', icon: Tag, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' },
};

const INITIAL_EXPENSES: ExpenseClaim[] = [
  {
    id: 1,
    claimNumber: 'EXP-2026-081',
    employeeName: 'Rakesh K. Sharma',
    department: 'Engineering',
    category: 'TRAVEL',
    merchant: 'Air India / Indigo Express',
    amount: 14850.00,
    currency: 'INR',
    expenseDate: '2026-10-10',
    submittedAt: '2026-10-11',
    description: 'Roundtrip flights for on-site client kickoff meeting in Bengaluru.',
    projectCode: 'PRJ-FINTECH-01',
    receiptName: 'Flight_Tickets_Indigo_BLR.pdf',
    status: 'APPROVED',
    managerId: 2,
    managerName: 'Priya Sharma',
    managerComment: 'Verified travel dates and itinerary.',
    hrComment: 'Approved for payout per travel policy band 4.',
    approverRemarks: 'Approved for payout per travel policy band 4.',
  },
  {
    id: 2,
    claimNumber: 'EXP-2026-082',
    employeeName: 'Amit Verma',
    department: 'Engineering',
    category: 'CLIENT_ENTERTAINMENT',
    merchant: 'The Oberoi Grand Hotel',
    amount: 6420.00,
    currency: 'INR',
    expenseDate: '2026-10-12',
    submittedAt: '2026-10-13',
    description: 'Executive campus recruitment partner dinner and leadership discussion.',
    projectCode: 'HR-TALENT-2026',
    receiptName: 'Oberoi_Invoice_RecruitersDinner.pdf',
    status: 'PENDING_MANAGER',
    managerId: 1,
    managerName: 'Rakesh K. Sharma',
  },
  {
    id: 3,
    claimNumber: 'EXP-2026-083',
    employeeName: 'Rakesh K. Sharma',
    department: 'Engineering',
    category: 'MOBILE_INTERNET',
    merchant: 'Airtel Broadband Fiber',
    amount: 1799.00,
    currency: 'INR',
    expenseDate: '2026-10-03',
    submittedAt: '2026-10-04',
    description: 'Monthly remote WFH high-speed fiber internet reimbursement allowance.',
    projectCode: 'CORP-WFH-ALLOWANCE',
    receiptName: 'Airtel_Bill_Oct2026.pdf',
    status: 'REIMBURSED',
    managerId: 2,
    managerName: 'Priya Sharma',
    managerComment: 'Approved WFH recurring allowance.',
    hrComment: 'Processed via September payroll cycle.',
    approverRemarks: 'Processed via September payroll cycle.',
    reimbursedDate: '2026-10-06',
    reimbursementRef: 'NEFT-88902143',
  },
  {
    id: 4,
    claimNumber: 'EXP-2026-084',
    employeeName: 'Amit Verma',
    department: 'Engineering',
    category: 'TRAINING',
    merchant: 'AWS Cloud Certification Portal',
    amount: 12500.00,
    currency: 'INR',
    expenseDate: '2026-10-07',
    submittedAt: '2026-10-08',
    description: 'AWS Certified Solutions Architect Exam registration fees.',
    projectCode: 'DEV-UPSKILL-Q4',
    receiptName: 'AWS_Exam_Receipt_12500.pdf',
    status: 'PENDING_HR',
    managerId: 1,
    managerName: 'Rakesh K. Sharma',
    managerComment: 'Approved under tech skills enhancement budget.',
    approverRemarks: 'Approved under tech skills enhancement budget.',
  },
  {
    id: 5,
    claimNumber: 'EXP-2026-085',
    employeeName: 'Siddharth Roy',
    department: 'Operations',
    category: 'MEALS',
    merchant: 'Cafe Coffee Day & Team Catering',
    amount: 3200.00,
    currency: 'INR',
    expenseDate: '2026-10-11',
    submittedAt: '2026-10-12',
    description: 'Late night sprint release team dinner during production rollout.',
    projectCode: 'OPS-RELEASE-V2',
    receiptName: 'CCD_Snacks_Receipt.pdf',
    status: 'PENDING',
  },
];

export const ExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const isHrOrAdmin = isHrAdmin(user);

  const [claims, setClaims] = useState<ExpenseClaim[]>(() => {
    const saved = localStorage.getItem('priyex_expense_claims');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [scopeFilter, setScopeFilter] = useState<'ALL' | 'TEAM' | 'MY'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedReceiptClaim, setSelectedReceiptClaim] = useState<ExpenseClaim | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New claim form state with real file upload
  const [claimForm, setClaimForm] = useState({
    category: 'TRAVEL' as ExpenseClaim['category'],
    merchant: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    projectCode: '',
    gstin: '',
    description: '',
    receiptFileName: '',
    receiptFileSize: '',
    receiptPreviewUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setClaimForm((prev) => ({
          ...prev,
          receiptFileName: file.name,
          receiptFileSize: sizeStr,
          receiptPreviewUrl: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setClaimForm((prev) => ({
        ...prev,
        receiptFileName: file.name,
        receiptFileSize: sizeStr,
        receiptPreviewUrl: '',
      }));
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClaimForm((prev) => ({
      ...prev,
      receiptFileName: '',
      receiptFileSize: '',
      receiptPreviewUrl: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('priyex_expense_claims', JSON.stringify(claims));
  }, [claims]);

  // Fetch from backend API
  const fetchApiClaims = async () => {
    try {
      const res: any = await api.get('/expenses');
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setClaims(res.data);
      }
    } catch (e) {
      // Fallback to local stored/mock data
    }
  };

  useEffect(() => {
    fetchApiClaims();
  }, []);

  // Filtered claims
  const filteredClaims = claims.filter((c) => {
    if (scopeFilter === 'TEAM') {
      const isMyTeam = c.managerId === user?.employeeId;
      if (isHrOrAdmin) return isMyTeam || c.status === 'PENDING_MANAGER';
      return isMyTeam;
    }
    if (scopeFilter === 'MY') {
      return c.employeeId === user?.employeeId || (c.employeeName && user?.fullName && c.employeeName.toLowerCase().includes(user.fullName.toLowerCase()));
    }
    const matchCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchSearch =
      c.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  });

  // Analytics Metrics
  const totalClaimed = claims.reduce((acc, c) => acc + c.amount, 0);
  const totalApproved = claims.filter(c => c.status === 'APPROVED' || c.status === 'REIMBURSED').reduce((acc, c) => acc + c.amount, 0);
  const pendingCount = claims.filter(c => c.status === 'PENDING' || c.status === 'PENDING_MANAGER' || c.status === 'PENDING_HR').length;
  const pendingAmount = claims.filter(c => c.status === 'PENDING' || c.status === 'PENDING_MANAGER' || c.status === 'PENDING_HR').reduce((acc, c) => acc + c.amount, 0);
  const reimbursedCount = claims.filter(c => c.status === 'REIMBURSED').length;

  // Actions (Multi-Tier Workflow)
  const handleManagerApprove = async (id: number) => {
    try {
      await api.put(`/expenses/${id}/manager-approve`, { remarks: 'Approved by Reporting Manager' });
      await fetchApiClaims();
    } catch (err: any) {
      // Fallback local update
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'PENDING_HR', managerComment: 'Approved by Reporting Manager' } : c));
    }
  };

  const handleManagerReject = async (id: number) => {
    const reason = prompt('Please enter manager rejection reason:');
    if (reason === null) return;
    try {
      await api.put(`/expenses/${id}/manager-reject`, { remarks: reason || 'Declined by direct manager' });
      await fetchApiClaims();
    } catch (err: any) {
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED_MANAGER', managerComment: reason } : c));
    }
  };

  const handleHrApprove = async (id: number) => {
    try {
      await api.put(`/expenses/${id}/hr-approve`, { remarks: 'Approved for payout by HR' });
      await fetchApiClaims();
    } catch (err: any) {
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'APPROVED', hrComment: 'Approved by HR' } : c));
    }
  };

  const handleHrReject = async (id: number) => {
    const reason = prompt('Please enter HR rejection reason:');
    if (reason === null) return;
    try {
      await api.put(`/expenses/${id}/hr-reject`, { remarks: reason || 'Declined by HR' });
      await fetchApiClaims();
    } catch (err: any) {
      setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'REJECTED_HR', hrComment: reason } : c));
    }
  };

  const handleReimburse = async (id: number) => {
    const ref = prompt('Enter Bank Transaction / Payout Reference (e.g. UTR-99214488):', `NEFT-${Math.floor(10000000 + Math.random() * 90000000)}`);
    if (ref === null) return;
    try {
      await api.put(`/expenses/${id}/reimburse`, { reference: ref });
      await fetchApiClaims();
    } catch (err: any) {
      setClaims(prev => prev.map(c => c.id === id ? {
        ...c,
        status: 'REIMBURSED',
        reimbursedDate: new Date().toISOString().split('T')[0],
        reimbursementRef: ref
      } : c));
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimForm.merchant || !claimForm.amount || !claimForm.description) {
      alert('Please fill out all required fields.');
      return;
    }

    const parsedAmount = parseFloat(claimForm.amount);
    // Duplicate Pending Claim Check
    const duplicatePendingClaim = claims.find(c =>
      (c.status === 'PENDING_MANAGER' || c.status === 'PENDING_HR') &&
      c.expenseDate === claimForm.expenseDate &&
      c.merchant?.trim().toLowerCase() === claimForm.merchant?.trim().toLowerCase() &&
      Math.abs(c.amount - parsedAmount) < 0.01
    );
    if (duplicatePendingClaim) {
      alert(`An identical expense claim (${duplicatePendingClaim.claimNumber} - ${duplicatePendingClaim.merchant} for ₹${duplicatePendingClaim.amount.toFixed(2)}) is already under review [${duplicatePendingClaim.status}]. Duplicate submissions are not allowed.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        category: claimForm.category,
        merchant: claimForm.merchant,
        amount: parseFloat(claimForm.amount),
        currency: 'INR',
        expenseDate: claimForm.expenseDate,
        description: claimForm.description,
        projectCode: claimForm.projectCode || 'GENERAL-OPEX',
        gstin: claimForm.gstin,
        receiptName: claimForm.receiptFileName || 'Vendor_Invoice.pdf',
        receiptUrl: claimForm.receiptPreviewUrl || undefined
      };

      const res: any = await api.post('/expenses', payload);
      if (res?.success) {
        await fetchApiClaims();
      } else {
        // Fallback local addition
        const newClaim: ExpenseClaim = {
          id: Date.now(),
          claimNumber: `EXP-2026-${String(Math.floor(100 + Math.random() * 900))}`,
          employeeName: user?.fullName || 'Current Employee',
          department: 'Operations',
          category: claimForm.category,
          merchant: claimForm.merchant,
          amount: parseFloat(claimForm.amount),
          currency: 'INR',
          expenseDate: claimForm.expenseDate,
          submittedAt: new Date().toISOString().split('T')[0],
          description: claimForm.description,
          projectCode: claimForm.projectCode || 'GENERAL-OPEX',
          gstin: claimForm.gstin,
          receiptName: claimForm.receiptFileName || 'Vendor_Invoice.pdf',
          receiptUrl: claimForm.receiptPreviewUrl || undefined,
          status: 'PENDING_MANAGER'
        };
        setClaims(prev => [newClaim, ...prev]);
      }

      setIsSubmitModalOpen(false);
      setClaimForm({
        category: 'TRAVEL',
        merchant: '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        projectCode: '',
        gstin: '',
        description: '',
        receiptFileName: '',
        receiptFileSize: '',
        receiptPreviewUrl: ''
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(err?.message || 'Failed to submit expense claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportClaimsCSV = () => {
    const headers = 'Claim ID,Employee,Department,Category,Merchant,Amount (INR),Date,Status,Project Code\n';
    const rows = claims.map(c =>
      `"${c.claimNumber}","${c.employeeName}","${c.department}","${c.category}","${c.merchant}",${c.amount},"${c.expenseDate}","${c.status}","${c.projectCode || ''}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Priyex_HRMS_Expense_Claims_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-blue-600" />
            <span>Expense Claims & Reimbursement</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Automated corporate expense reporting, digital receipt audits, and direct employee payouts
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={exportClaimsCSV}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit Log</span>
          </button>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Expense Claim</span>
          </button>
        </div>
      </div>

      {/* Corporate Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Claims Filed</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">₹{totalClaimed.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <p className="text-xs text-slate-500 mt-0.5">{claims.length} total corporate filings</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600">₹{pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <p className="text-xs text-slate-500 mt-0.5">{pendingCount} claims awaiting manager review</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved for Payout</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600">₹{totalApproved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            <p className="text-xs text-slate-500 mt-0.5">Compliant with financial policy thresholds</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Disbursed via Payroll</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-purple-700">{reimbursedCount} Claims</span>
            <p className="text-xs text-slate-500 mt-0.5">Direct bank transfer via payroll cycle</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar with Scope Tabs */}
      <div className="glass-panel rounded-2xl p-4 bg-white/95 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Scope Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setScopeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              scopeFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Filings ({claims.length})
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('TEAM')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              scopeFilter === 'TEAM'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Team Approvals</span>
            {claims.filter(c => c.status === 'PENDING_MANAGER').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setScopeFilter('MY')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              scopeFilter === 'MY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Expenses
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by claim ID, employee, merchant or description..."
              className="w-full bg-slate-50/80 text-slate-900 rounded-xl pl-10 pr-4 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 text-xs font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none font-semibold cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_MANAGER">Tier 1: Pending Manager</option>
              <option value="PENDING_HR">Tier 2: Pending HR</option>
              <option value="APPROVED">Approved for Payout</option>
              <option value="REIMBURSED">Reimbursed</option>
              <option value="REJECTED_MANAGER">Rejected by Manager</option>
              <option value="REJECTED_HR">Rejected by HR</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none font-semibold cursor-pointer max-w-[170px] truncate"
            >
              <option value="ALL">All Categories</option>
              <option value="TRAVEL">Travel & Transport</option>
              <option value="MEALS">Meals & Food</option>
              <option value="LODGING">Hotel & Lodging</option>
              <option value="OFFICE_SUPPLIES">Office Supplies</option>
              <option value="CLIENT_ENTERTAINMENT">Client Entertainment</option>
              <option value="MOBILE_INTERNET">Mobile & Internet</option>
              <option value="TRAINING">Training & Certification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Corporate Expense Register</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {filteredClaims.length} records
            </span>
          </div>
          <span className="text-xs text-slate-400">Two-Tier Approval: Manager Review &rarr; HR Signoff &rarr; Bank Reimbursement</span>
        </div>

        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold">No expense claims match your search or filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the status or category filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3 px-4">Claim ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Merchant & Details</th>
                  <th className="py-3 px-4">Expense Date</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                  <th className="py-3 px-4 text-center">Approval Workflow</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredClaims.map((claim) => {
                  const cat = CATEGORY_CONFIG[claim.category] || CATEGORY_CONFIG.TRAVEL;
                  const Icon = cat.icon;
                  const isManagerPending = claim.status === 'PENDING_MANAGER';
                  const isHrPending = claim.status === 'PENDING_HR';
                  const isReadyForPayout = claim.status === 'APPROVED';
                  const isPaid = claim.status === 'REIMBURSED';
                  const isMgrDeclined = claim.status === 'REJECTED_MANAGER';
                  const isHrDeclined = claim.status === 'REJECTED_HR' || claim.status === 'REJECTED';

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {claim.claimNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{claim.employeeName}</div>
                        <div className="text-[11px] text-slate-400">{claim.department}</div>
                        {claim.managerName && (
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                            Mgr: <span className="text-slate-700">{claim.managerName}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${cat.bg} ${cat.color}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{cat.label}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{claim.merchant}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={claim.description}>
                          {claim.description}
                        </div>
                        {claim.projectCode && (
                          <span className="text-[10px] text-slate-400 font-mono">[{claim.projectCode}]</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {claim.expenseDate}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 text-sm">
                        ₹{claim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {claim.receiptName ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptClaim(claim)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition cursor-pointer"
                            title="View attached digital invoice receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Two-Tier Approval Status Stepper Cell */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            isReadyForPayout ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            isPaid ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            isHrPending ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            isManagerPending ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            isMgrDeclined || isHrDeclined ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {isManagerPending ? 'Tier 1: Pending Manager' :
                             isHrPending ? 'Tier 2: Pending HR' :
                             isReadyForPayout ? 'Approved for Payout' :
                             isPaid ? 'Reimbursed' :
                             isMgrDeclined ? 'Rejected by Manager' :
                             isHrDeclined ? 'Rejected by HR' :
                             claim.status}
                          </span>

                          {/* Micro Sub-tracker */}
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                            {isManagerPending ? (
                              <span className="text-amber-600 flex items-center gap-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Awaiting {claim.managerName || 'Manager'}
                              </span>
                            ) : isHrPending ? (
                              <span className="text-indigo-600 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Mgr Approved &bull; Awaiting HR
                              </span>
                            ) : isReadyForPayout ? (
                              <span className="text-emerald-700 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                All Approvals Complete
                              </span>
                            ) : isPaid ? (
                              <span className="text-purple-700">
                                Disbursed {claim.reimbursedDate || ''}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Contextual Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isManagerPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleManagerApprove(claim.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Approve as Direct Manager"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Approve (Mgr)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleManagerReject(claim.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Reject as Direct Manager"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}

                          {isHrPending && isHrOrAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleHrApprove(claim.id)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Grant Final HR Signoff"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Final HR Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleHrReject(claim.id)}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                                title="Reject as HR"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}

                          {isReadyForPayout && isHrOrAdmin && (
                            <button
                              type="button"
                              onClick={() => handleReimburse(claim.id)}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Disburse payout via corporate banking"
                            >
                              <CreditCard className="w-3 h-3" /> Reimburse
                            </button>
                          )}

                          {isPaid && (
                            <span className="text-[11px] text-purple-700 font-mono font-semibold" title={`Ref: ${claim.reimbursementRef}`}>
                              Paid: {claim.reimbursementRef || 'Direct Transfer'}
                            </span>
                          )}

                          {(isMgrDeclined || isHrDeclined) && (
                            <span className="text-[11px] text-rose-600 italic">
                              {claim.approverRemarks || claim.managerComment || claim.hrComment || 'Declined'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit New Expense Claim Modal */}
      {isSubmitModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">File Corporate Expense Claim</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expense Category *</label>
                  <select
                    value={claimForm.category}
                    onChange={(e) => setClaimForm({ ...claimForm, category: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="TRAVEL">Travel & Transport</option>
                    <option value="MEALS">Meals & Per Diem</option>
                    <option value="LODGING">Hotel & Lodging</option>
                    <option value="OFFICE_SUPPLIES">Office & Tech Supplies</option>
                    <option value="CLIENT_ENTERTAINMENT">Client Entertainment</option>
                    <option value="MOBILE_INTERNET">Mobile & Internet</option>
                    <option value="TRAINING">Training & Certification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={claimForm.expenseDate}
                    onChange={(e) => setClaimForm({ ...claimForm, expenseDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Merchant / Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indigo Airlines, Uber, Marriott"
                    value={claimForm.merchant}
                    onChange={(e) => setClaimForm({ ...claimForm, merchant: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Claim Amount (INR ₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="e.g. 4500.00"
                    value={claimForm.amount}
                    onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Project / Cost Center</label>
                  <input
                    type="text"
                    placeholder="e.g. PRJ-FINTECH-01"
                    value={claimForm.projectCode}
                    onChange={(e) => setClaimForm({ ...claimForm, projectCode: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vendor GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    value={claimForm.gstin}
                    onChange={(e) => setClaimForm({ ...claimForm, gstin: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Business Purpose / Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Explain the business context of this expenditure..."
                  value={claimForm.description}
                  onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              {/* Real Receipt File Upload Dropzone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-bold">
                    Attach Tax Invoice / Bill (PDF / PNG / JPG) *
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Max 10MB</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!claimForm.receiptFileName ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        const fakeEvent = { target: { files: [file] } } as any;
                        handleFileChange(fakeEvent);
                      }
                    }}
                    className="p-5 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl bg-blue-50/40 hover:bg-blue-50/70 transition cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
                  >
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-blue-700 group-hover:underline">
                        Click here to browse and upload bill
                      </span>
                      <span className="text-xs text-slate-500"> or drag file here</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Supports PDF, PNG, JPG, JPEG documents up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 border-2 border-emerald-300 rounded-2xl bg-emerald-50/70 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
                        {claimForm.receiptPreviewUrl ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 truncate max-w-xs">
                          {claimForm.receiptFileName}
                        </p>
                        <p className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{claimForm.receiptFileSize || 'Attached'} • Ready for audit review</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer shadow-xs"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Duplicate Pending Claim Warning */}
              {(() => {
                const parsedAmount = parseFloat(claimForm.amount);
                if (!claimForm.merchant || isNaN(parsedAmount) || !claimForm.expenseDate) return null;
                const duplicatePendingClaim = claims.find(c =>
                  (c.status === 'PENDING_MANAGER' || c.status === 'PENDING_HR') &&
                  c.expenseDate === claimForm.expenseDate &&
                  c.merchant?.trim().toLowerCase() === claimForm.merchant?.trim().toLowerCase() &&
                  Math.abs(c.amount - parsedAmount) < 0.01
                );
                if (duplicatePendingClaim) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">Duplicate Claim Warning:</span> An identical claim ({duplicatePendingClaim.claimNumber}) for ₹{duplicatePendingClaim.amount.toFixed(2)} on {duplicatePendingClaim.expenseDate} is currently pending review. Duplicate claims cannot be submitted.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !!claims.find(c =>
                      (c.status === 'PENDING_MANAGER' || c.status === 'PENDING_HR') &&
                      c.expenseDate === claimForm.expenseDate &&
                      c.merchant?.trim().toLowerCase() === claimForm.merchant?.trim().toLowerCase() &&
                      Math.abs(c.amount - parseFloat(claimForm.amount)) < 0.01
                    )
                  }
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Verifying & Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Receipt Preview Modal */}
      {selectedReceiptClaim && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedReceiptClaim.claimNumber} Digital Invoice</h3>
                <p className="text-xs text-slate-500">{selectedReceiptClaim.merchant}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptClaim(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If uploaded image exists, display it directly */}
            {selectedReceiptClaim.receiptUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center max-h-72">
                <img
                  src={selectedReceiptClaim.receiptUrl}
                  alt="Uploaded Receipt"
                  className="max-h-72 w-auto object-contain"
                />
              </div>
            ) : null}

            {/* Simulated Digital Tax Invoice Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-800">TAX INVOICE AUDIT RECORD</span>
                <span className="text-slate-500">{selectedReceiptClaim.expenseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Merchant:</span>
                <span className="font-bold text-slate-900">{selectedReceiptClaim.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Employee:</span>
                <span className="text-slate-800">{selectedReceiptClaim.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-800">{selectedReceiptClaim.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document:</span>
                <span className="text-blue-600 underline truncate max-w-[220px]">{selectedReceiptClaim.receiptName}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span>Total Reimbursable:</span>
                <span className="text-emerald-700">₹{selectedReceiptClaim.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Multi-Tier Approval Trail */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">
              <span className="font-bold text-indigo-900 uppercase text-[10px] tracking-wider block">Approval Audit Trail</span>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600">Reporting Manager:</span>
                <span className="font-semibold text-slate-800">
                  {selectedReceiptClaim.managerName || 'Direct to HR'}
                  {selectedReceiptClaim.managerComment && ` ("${selectedReceiptClaim.managerComment}")`}
                </span>
              </div>
              {selectedReceiptClaim.hrComment && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600">HR Review Remarks:</span>
                  <span className="font-semibold text-slate-800">&ldquo;{selectedReceiptClaim.hrComment}&rdquo;</span>
                </div>
              )}
              {selectedReceiptClaim.reimbursementRef && (
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600">Bank Transfer Ref:</span>
                  <span className="font-mono font-bold text-purple-700">{selectedReceiptClaim.reimbursementRef}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setSelectedReceiptClaim(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ExpensesPage;
