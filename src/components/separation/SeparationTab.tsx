import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { isHrAdmin } from '../../utils/rbac';
import api from '../../api/client';
import {
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  UserX,
  Calendar,
  Send,
  X,
  Plus,
  Settings,
  ChevronRight,
  HelpCircle,
  Laptop,
  CreditCard,
  Building2,
  KeyRound,
  Check,
  RefreshCw,
  Info,
  DollarSign
} from 'lucide-react';

export interface ExitClearance {
  id: number;
  separationCaseId: number;
  departmentType: 'REPORTING_MANAGER' | 'IT_INFRA' | 'ASSETS_ADMIN' | 'FINANCE_ACCOUNTS' | 'HR_OPS';
  title: string;
  description: string;
  status: 'PENDING' | 'CLEARED' | 'WAIVED' | 'FLAGGED';
  clearedByUserName?: string;
  clearedAt?: string;
  deductionAmount: number;
  remarks?: string;
}

export interface SeparationCase {
  id: number;
  companyId: number;
  employeeId: number;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  workEmail?: string;
  departmentName?: string;
  designationTitle?: string;
  reportingManagerName?: string;
  caseType: 'RESIGNATION' | 'TERMINATION' | 'MUTUAL_SEPARATION' | 'END_OF_CONTRACT';
  initiatorRole: string;
  reasonCategory: string;
  reasonDetails: string;
  submissionDate: string;
  requestedLastWorkingDay: string;
  approvedLastWorkingDay?: string;
  noticePeriodDays: number;
  isNoticeWaived: boolean;
  noticeShortfallDays: number;
  status: 'SUBMITTED' | 'NOTICE_PERIOD' | 'CLEARANCE_PENDING' | 'SETTLEMENT_PENDING' | 'EXITED' | 'WITHDRAWN' | 'REJECTED';
  handoverNotes?: string;
  managerApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
  managerRemarks?: string;
  hrApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  hrRemarks?: string;
  exitInterviewCompleted: boolean;
  exitInterviewNotes?: string;
  userDeactivatedAt?: string;
  createdAt: string;
  clearances?: ExitClearance[];
}

export interface SeparationPolicy {
  id?: number;
  defaultNoticeDays: number;
  probationNoticeDays: number;
  allowResignationWithdrawal: boolean;
  autoDeactivateUser: boolean;
  requireManagerApproval: boolean;
  requireItClearance: boolean;
  requireFinanceClearance: boolean;
}

export const SeparationTab: React.FC = () => {
  const { user } = useAuth();
  const isHr = isHrAdmin(user) || Boolean(user?.roles?.some(r => ['ADMIN', 'SUPER_ADMIN'].includes(r)));
  const isManager = Boolean(user?.roles?.some(r => ['MANAGER', 'HR_MANAGER'].includes(r)));

  const [isLoading, setIsLoading] = useState(true);
  const [policy, setPolicy] = useState<SeparationPolicy | null>(null);
  const [mySeparation, setMySeparation] = useState<SeparationCase | null>(null);
  const [allCases, setAllCases] = useState<SeparationCase[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modals
  const [isResignModalOpen, setIsResignModalOpen] = useState(false);
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SeparationCase | null>(null);

  // Form states
  const [resignForm, setResignForm] = useState({
    reasonCategory: 'CAREER_GROWTH',
    reasonDetails: '',
    requestedLastWorkingDay: '',
    handoverNotes: ''
  });

  const [terminateForm, setTerminateForm] = useState({
    employeeId: '',
    caseType: 'TERMINATION',
    reasonCategory: 'PERFORMANCE',
    reasonDetails: '',
    lastWorkingDay: '',
    isNoticeWaived: false,
    severanceNotes: '',
    handoverNotes: ''
  });

  const [reviewForm, setReviewForm] = useState({
    action: 'APPROVE',
    approvedLastWorkingDay: '',
    isNoticeWaived: false,
    remarks: ''
  });

  const [finalizeForm, setFinalizeForm] = useState({
    exitInterviewNotes: '',
    deactivateUser: true,
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Policy
      const policyRes = await api.get('/separation/policy');
      if (policyRes?.data?.data) {
        setPolicy(policyRes.data.data);
      }

      // 2. Fetch My Separation
      try {
        const myRes = await api.get('/separation/my');
        setMySeparation(myRes?.data?.data || null);
      } catch (e) {
        // Not active or not found
        setMySeparation(null);
      }

      // 3. If HR or Manager, fetch all cases and employee list
      if (isHr || isManager) {
        const casesRes = await api.get('/separation/cases');
        setAllCases(casesRes?.data?.data || []);

        try {
          const empRes = await api.get('/employees?size=100');
          const list = empRes?.data?.data?.items || empRes?.data?.data || [];
          setEmployees(Array.isArray(list) ? list.filter((e: any) => e.status !== 'EXITED') : []);
        } catch (e) {
          // Ignore
        }
      }
    } catch (err: any) {
      console.error('Failed to load separation data', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Resignation
  const handleSubmitResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.post('/separation/resignation', resignForm);
      setIsResignModalOpen(false);
      setResignForm({
        reasonCategory: 'CAREER_GROWTH',
        reasonDetails: '',
        requestedLastWorkingDay: '',
        handoverNotes: ''
      });
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit resignation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Withdraw Resignation
  const handleWithdrawResignation = async (separationId: number) => {
    if (!confirm('Are you sure you want to withdraw your resignation and restore your active status?')) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/separation/resignation/withdraw?separationId=${separationId}`);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to withdraw resignation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initiate Termination (Admin/HR)
  const handleInitiateTermination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminateForm.employeeId) {
      alert('Please select an employee');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.post('/separation/terminate', {
        ...terminateForm,
        employeeId: Number(terminateForm.employeeId)
      });
      setIsTerminateModalOpen(false);
      setTerminateForm({
        employeeId: '',
        caseType: 'TERMINATION',
        reasonCategory: 'PERFORMANCE',
        reasonDetails: '',
        lastWorkingDay: '',
        isNoticeWaived: false,
        severanceNotes: '',
        handoverNotes: ''
      });
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initiate separation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Review Case (Approve/Reject)
  const handleReviewCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setIsSubmitting(true);
    try {
      await api.put(`/separation/cases/${selectedCase.id}/review`, reviewForm);
      const updated = await api.get(`/separation/cases/${selectedCase.id}`);
      setSelectedCase(updated?.data?.data || null);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to review separation case');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Clearance Item
  const handleToggleClearance = async (clearance: ExitClearance, nextStatus: 'CLEARED' | 'WAIVED' | 'PENDING') => {
    try {
      await api.put(`/separation/clearances/${clearance.id}`, {
        status: nextStatus,
        remarks: clearance.remarks || `Marked ${nextStatus} by ${user?.fullName || 'HR'}`
      });
      if (selectedCase) {
        const updated = await api.get(`/separation/cases/${selectedCase.id}`);
        setSelectedCase(updated?.data?.data || null);
      }
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update clearance');
    }
  };

  // Finalize Exit
  const handleFinalizeExit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    if (!confirm(`Are you sure you want to finalize the exit for ${selectedCase.firstName} ${selectedCase.lastName}? This will mark their profile as EXITED and deactivate system login.`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post(`/separation/cases/${selectedCase.id}/finalize`, finalizeForm);
      setSelectedCase(null);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to finalize exit');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Policy
  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policy) return;
    setIsSubmitting(true);
    try {
      await api.put('/separation/policy', policy);
      setIsPolicyModalOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err?.message || 'Failed to save policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClearanceIcon = (type: string) => {
    switch (type) {
      case 'REPORTING_MANAGER':
        return <CheckCircle2 className="w-4 h-4 text-indigo-600" />;
      case 'IT_INFRA':
        return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'ASSETS_ADMIN':
        return <KeyRound className="w-4 h-4 text-emerald-600" />;
      case 'FINANCE_ACCOUNTS':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      default:
        return <Shield className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NOTICE_PERIOD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Notice Period
          </span>
        );
      case 'EXITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <UserX className="w-3 h-3 text-slate-500" />
            Exited
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
            Withdrawn
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            {status}
          </span>
        );
    }
  };

  const filteredCases = allCases.filter(c => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
            <LogOut className="w-3.5 h-3.5 text-indigo-400" />
            Separation &amp; Offboarding Lifecycle
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Employee Resignation, Notice &amp; Exit Policy
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Standardized notice calculation, multi-department clearances (IT, Assets, Finance, Manager), and automated system access revocation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Employee Resignation Action */}
          {!mySeparation && (
            <button
              onClick={() => {
                const noticeDays = policy?.defaultNoticeDays || 60;
                const defaultLwd = new Date();
                defaultLwd.setDate(defaultLwd.getDate() + noticeDays);
                setResignForm(prev => ({
                  ...prev,
                  requestedLastWorkingDay: defaultLwd.toISOString().split('T')[0]
                }));
                setIsResignModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Apply for Resignation</span>
            </button>
          )}

          {/* HR / Admin Involuntary Termination Action */}
          {isHr && (
            <button
              onClick={() => {
                const defaultLwd = new Date();
                defaultLwd.setDate(defaultLwd.getDate() + 30);
                setTerminateForm(prev => ({
                  ...prev,
                  lastWorkingDay: defaultLwd.toISOString().split('T')[0]
                }));
                setIsTerminateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-3.5 h-3.5" />
              <span>Initiate Separation / Termination</span>
            </button>
          )}

          {/* Org Exit Policy Settings */}
          {isHr && (
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
              title="Separation & Notice Period Policy"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Employee's Own Resignation Status Card (If in progress) */}
      {mySeparation && (
        <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-sm space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Case #{mySeparation.id} • {mySeparation.caseType}
                </span>
                {getStatusBadge(mySeparation.status)}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Your Separation Case is In Progress
              </h3>
              <p className="text-xs text-slate-500">
                Submitted on {mySeparation.submissionDate} • Notice Period: <strong>{mySeparation.noticePeriodDays} Days</strong>
              </p>
            </div>

            {/* Withdraw Button */}
            {policy?.allowResignationWithdrawal && ['SUBMITTED', 'NOTICE_PERIOD'].includes(mySeparation.status) && (
              <button
                onClick={() => handleWithdrawResignation(mySeparation.id)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start"
              >
                <X className="w-3.5 h-3.5 text-rose-500" />
                <span>Withdraw Resignation</span>
              </button>
            )}
          </div>

          {/* Key Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium">Requested Last Working Day</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {mySeparation.requestedLastWorkingDay}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
              <span className="text-indigo-700 font-medium">Approved Last Working Day</span>
              <p className="text-sm font-bold text-indigo-950 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                {mySeparation.approvedLastWorkingDay || mySeparation.requestedLastWorkingDay}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-slate-500 font-medium">Manager &amp; HR Review</span>
              <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                <span>Manager: {mySeparation.managerApprovalStatus}</span> • <span>HR: {mySeparation.hrApprovalStatus}</span>
              </p>
            </div>
          </div>

          {/* Clearance Progress */}
          {mySeparation.clearances && mySeparation.clearances.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Departmental Clearance Status
                </h4>
                <span className="text-xs font-bold text-emerald-700">
                  {mySeparation.clearances.filter(c => c.status === 'CLEARED' || c.status === 'WAIVED').length} of {mySeparation.clearances.length} Completed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {mySeparation.clearances.map(c => (
                  <div key={c.id} className="p-3 rounded-2xl border border-slate-200 bg-white flex items-start gap-2.5 text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      {getClearanceIcon(c.departmentType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 truncate">{c.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          c.status === 'CLEARED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : c.status === 'WAIVED'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HR / Manager Overview Console */}
      {(isHr || isManager) && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Company Separation Cases</h3>
              <p className="text-xs text-slate-500">Track notice period progress, clearances, and deactivations</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold self-start">
              {['ALL', 'NOTICE_PERIOD', 'EXITED'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    filterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'All Cases' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Cases Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading separation records...</div>
            ) : filteredCases.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No separation cases found</p>
                <p className="text-xs text-slate-400">All workforce members are currently active.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-3">Type</th>
                      <th className="py-3.5 px-3">Reason</th>
                      <th className="py-3.5 px-3">Submitted</th>
                      <th className="py-3.5 px-3">Last Working Day</th>
                      <th className="py-3.5 px-3">Clearances</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCases.map(sc => {
                      const clearedCount = sc.clearances?.filter(c => c.status === 'CLEARED' || c.status === 'WAIVED').length || 0;
                      const totalClearances = sc.clearances?.length || 5;

                      return (
                        <tr key={sc.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">
                              {sc.firstName} {sc.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {sc.employeeCode} • {sc.departmentName || 'General'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              sc.caseType === 'TERMINATION' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {sc.caseType}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-700 font-medium">
                            {sc.reasonCategory.replace(/_/g, ' ')}
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {sc.submissionDate}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-900">
                            {sc.approvedLastWorkingDay || sc.requestedLastWorkingDay}
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">{clearedCount}/{totalClearances}</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${(clearedCount / totalClearances) * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            {getStatusBadge(sc.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedCase(sc);
                                setReviewForm({
                                  action: 'APPROVE',
                                  approvedLastWorkingDay: sc.approvedLastWorkingDay || sc.requestedLastWorkingDay,
                                  isNoticeWaived: sc.isNoticeWaived || false,
                                  remarks: sc.hrRemarks || sc.managerRemarks || ''
                                });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition cursor-pointer"
                            >
                              Manage / Clearances
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL 1: Submit Resignation (Employee Self-Service) ── */}
      {isResignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base leading-tight">Submit Resignation</h3>
                <p className="text-xs text-slate-300">Initiates formal notice period &amp; handover checklist</p>
              </div>
              <button onClick={() => setIsResignModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitResignation} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Organization Notice Policy:</span> Standard notice period is <strong>{policy?.defaultNoticeDays || 60} days</strong>. Shortfall may require HR buyout approval.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason Category *</label>
                <select
                  required
                  value={resignForm.reasonCategory}
                  onChange={e => setResignForm({ ...resignForm, reasonCategory: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CAREER_GROWTH">Career Growth / New Opportunity</option>
                  <option value="BETTER_COMPENSATION">Better Compensation / Role</option>
                  <option value="PERSONAL_REASONS">Personal / Family Reasons</option>
                  <option value="RELOCATION">Relocation / Distance</option>
                  <option value="HIGHER_STUDIES">Higher Education</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Proposed Last Working Day *</label>
                <input
                  type="date"
                  required
                  value={resignForm.requestedLastWorkingDay}
                  onChange={e => setResignForm({ ...resignForm, requestedLastWorkingDay: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason Details *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide context on your decision..."
                  value={resignForm.reasonDetails}
                  onChange={e => setResignForm({ ...resignForm, reasonDetails: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project &amp; Knowledge Transfer Handover Notes</label>
                <textarea
                  rows={2}
                  placeholder="Brief handover roadmap, ongoing tasks, and successor..."
                  value={resignForm.handoverNotes}
                  onChange={e => setResignForm({ ...resignForm, handoverNotes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsResignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Resignation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Initiate Termination / Separation (Admin / HR) ── */}
      {isTerminateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4.5 bg-rose-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base leading-tight">Initiate Employee Separation</h3>
                <p className="text-xs text-rose-200">Formal involuntary exit or contract termination</p>
              </div>
              <button onClick={() => setIsTerminateModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateTermination} className="p-6 space-y-3.5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Employee *</label>
                <select
                  required
                  value={terminateForm.employeeId}
                  onChange={e => setTerminateForm({ ...terminateForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode}) - {emp.workEmail}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Separation Type *</label>
                  <select
                    value={terminateForm.caseType}
                    onChange={e => setTerminateForm({ ...terminateForm, caseType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="TERMINATION">Involuntary Termination</option>
                    <option value="MUTUAL_SEPARATION">Mutual Separation</option>
                    <option value="END_OF_CONTRACT">End of Contract</option>
                    <option value="RESIGNATION">Logged Resignation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Effective Last Working Day *</label>
                  <input
                    type="date"
                    required
                    value={terminateForm.lastWorkingDay}
                    onChange={e => setTerminateForm({ ...terminateForm, lastWorkingDay: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason Category *</label>
                <select
                  value={terminateForm.reasonCategory}
                  onChange={e => setTerminateForm({ ...terminateForm, reasonCategory: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="PERFORMANCE">Performance Inadequacy</option>
                  <option value="MISCONDUCT">Policy Violation / Misconduct</option>
                  <option value="REDUNDANCY">Organizational Redundancy</option>
                  <option value="END_OF_CONTRACT">Contract Term Expired</option>
                  <option value="MUTUAL">Mutual Agreement</option>
                  <option value="OTHER">Other Statutory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason &amp; Documentation Summary *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Official justification and details..."
                  value={terminateForm.reasonDetails}
                  onChange={e => setTerminateForm({ ...terminateForm, reasonDetails: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="waiveNotice"
                  checked={terminateForm.isNoticeWaived}
                  onChange={e => setTerminateForm({ ...terminateForm, isNoticeWaived: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="waiveNotice" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Waive Notice Period (Immediate Release / Garden Leave)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTerminateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing...' : 'Initiate Separation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Manage Separation Case Details & Clearances Drawer ── */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">Case #{selectedCase.id}</span>
                  {getStatusBadge(selectedCase.status)}
                </div>
                <h3 className="font-bold text-base leading-tight mt-0.5">
                  {selectedCase.firstName} {selectedCase.lastName} ({selectedCase.employeeCode})
                </h3>
              </div>
              <button onClick={() => setSelectedCase(null)} className="p-1 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-medium text-[11px]">Type</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedCase.caseType}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-medium text-[11px]">Submission Date</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedCase.submissionDate}</p>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                  <span className="text-indigo-600 font-medium text-[11px]">Approved LWD</span>
                  <p className="font-bold text-indigo-950 mt-0.5">{selectedCase.approvedLastWorkingDay || selectedCase.requestedLastWorkingDay}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 font-medium text-[11px]">Notice Period</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedCase.noticePeriodDays} Days</p>
                </div>
              </div>

              {/* Justification Details */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">Reason Category: {selectedCase.reasonCategory}</span>
                <p className="text-slate-600 leading-relaxed">{selectedCase.reasonDetails}</p>
                {selectedCase.handoverNotes && (
                  <p className="text-slate-500 pt-1 border-t border-slate-200/80">
                    <strong>Handover Plan:</strong> {selectedCase.handoverNotes}
                  </p>
                )}
              </div>

              {/* Manager & HR Review Action (If still in Notice or Submitted) */}
              {selectedCase.status !== 'EXITED' && (
                <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 space-y-3">
                  <h4 className="font-bold text-slate-900 flex items-center justify-between">
                    <span>Manager &amp; HR LWD Review</span>
                    <span className="text-indigo-700 text-[11px]">Negotiate / Waive Notice</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Approved Last Working Day</label>
                      <input
                        type="date"
                        value={reviewForm.approvedLastWorkingDay}
                        onChange={e => setReviewForm({ ...reviewForm, approvedLastWorkingDay: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Remarks</label>
                      <input
                        type="text"
                        placeholder="e.g. LWD agreed, KT in progress"
                        value={reviewForm.remarks}
                        onChange={e => setReviewForm({ ...reviewForm, remarks: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reviewForm.isNoticeWaived}
                        onChange={e => setReviewForm({ ...reviewForm, isNoticeWaived: e.target.checked })}
                        className="rounded text-indigo-600"
                      />
                      <span>Waive remaining notice period days</span>
                    </label>
                    <button
                      onClick={handleReviewCase}
                      disabled={isSubmitting}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs cursor-pointer"
                    >
                      Update Review &amp; LWD
                    </button>
                  </div>
                </div>
              )}

              {/* Departmental Clearances Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Departmental Clearances &amp; NOC Checklist
                  </h4>
                  <span className="text-emerald-700 font-bold">
                    {selectedCase.clearances?.filter(c => c.status === 'CLEARED' || c.status === 'WAIVED').length} of {selectedCase.clearances?.length || 5} Cleared
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedCase.clearances?.map(c => (
                    <div key={c.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0">
                          {getClearanceIcon(c.departmentType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{c.title}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'CLEARED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : c.status === 'WAIVED'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] mt-0.5">{c.description}</p>
                          {c.clearedByUserName && (
                            <span className="text-[10px] text-slate-400">Cleared by {c.clearedByUserName}</span>
                          )}
                        </div>
                      </div>

                      {/* Clearance Actions */}
                      {selectedCase.status !== 'EXITED' && (
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {c.status !== 'CLEARED' && (
                            <button
                              onClick={() => handleToggleClearance(c, 'CLEARED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] transition cursor-pointer"
                            >
                              ✓ Mark Cleared
                            </button>
                          )}
                          {c.status !== 'WAIVED' && (
                            <button
                              onClick={() => handleToggleClearance(c, 'WAIVED')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                            >
                              Waive
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Exit & Deactivation Card (HR Only) */}
              {isHr && selectedCase.status !== 'EXITED' && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <UserX className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-rose-950">Finalize Exit &amp; Access Lockout</h5>
                      <p className="text-[11px] text-rose-700">
                        Marks the employee master record as <strong>EXITED</strong>, sets official exit date, and terminates corporate system login.
                      </p>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Optional exit interview or final settlement remarks..."
                    value={finalizeForm.exitInterviewNotes}
                    onChange={e => setFinalizeForm({ ...finalizeForm, exitInterviewNotes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={finalizeForm.deactivateUser}
                        onChange={e => setFinalizeForm({ ...finalizeForm, deactivateUser: e.target.checked })}
                        className="rounded text-rose-600"
                      />
                      <span className="font-bold text-slate-800">Immediately deactivate user portal login</span>
                    </label>
                    <button
                      onClick={handleFinalizeExit}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Finalizing...' : 'Finalize & Mark Exited'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Separation & Notice Period Policy Settings ── */}
      {isPolicyModalOpen && policy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base leading-tight">Exit &amp; Separation Policy</h3>
                <p className="text-xs text-slate-300">Organization-wide rules and defaults</p>
              </div>
              <button onClick={() => setIsPolicyModalOpen(false)} className="p-1 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Standard Notice Period (Days) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={policy.defaultNoticeDays}
                  onChange={e => setPolicy({ ...policy, defaultNoticeDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Probation Notice Period (Days) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={policy.probationNoticeDays}
                  onChange={e => setPolicy({ ...policy, probationNoticeDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.allowResignationWithdrawal}
                    onChange={e => setPolicy({ ...policy, allowResignationWithdrawal: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-800">Allow employees to withdraw resignation</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.autoDeactivateUser}
                    onChange={e => setPolicy({ ...policy, autoDeactivateUser: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-800">Auto-deactivate system login on exit</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
