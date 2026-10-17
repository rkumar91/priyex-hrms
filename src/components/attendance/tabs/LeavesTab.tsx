import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Info,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import { LeaveRequestItem } from '../../../types/attendance';

interface LeavesTabProps {
  leaveRequests: LeaveRequestItem[];
  isLoadingLeaves: boolean;
  leaveScopeFilter: 'ALL' | 'TEAM' | 'MY';
  setLeaveScopeFilter: (scope: 'ALL' | 'TEAM' | 'MY') => void;
  leaveStatusFilter: string;
  setLeaveStatusFilter: (st: string) => void;
  user: any;
  canApprove: boolean;
  isHr: boolean;
  handleManagerApproveLeave: (id: number) => void;
  handleManagerRejectLeave: (id: number) => void;
  handleHrApproveLeave: (id: number) => void;
  handleHrRejectLeave: (id: number) => void;
  handleApproveLeave: (id: number) => void;
  handleRejectLeave: (id: number) => void;
}

export const LeavesTab: React.FC<LeavesTabProps> = ({
  leaveRequests,
  isLoadingLeaves,
  leaveScopeFilter,
  setLeaveScopeFilter,
  leaveStatusFilter,
  setLeaveStatusFilter,
  user,
  canApprove,
  isHr,
  handleManagerApproveLeave,
  handleManagerRejectLeave,
  handleHrApproveLeave,
  handleHrRejectLeave,
  handleApproveLeave,
  handleRejectLeave,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Leave Quota Balances Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Casual Leave (CL)</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">12 Days / yr</div>
          <span className="text-xs text-emerald-600 font-semibold">10 Days Remaining</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Sick Leave (SL)</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">10 Days / yr</div>
          <span className="text-xs text-emerald-600 font-semibold">8 Days Remaining</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Privilege Leave (PL)</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">15 Days / yr</div>
          <span className="text-xs text-blue-600 font-semibold">Carried forward permitted</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Maternity / Paternity</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">180d / 15d</div>
          <span className="text-xs text-purple-600 font-semibold">Statutory Compliance</span>
        </div>
      </div>

      {/* Org Policy Reference Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs">
        <div className="flex items-center gap-2 text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Organization Leave Policies:</strong> Quotas are managed at the organization level with automatic monthly accruals.
          </span>
        </div>
        <Link to="/organization" className="text-blue-700 font-bold hover:underline shrink-0 flex items-center gap-1">
          <span>View Quotas</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Leave Requests Master Register with Two-Tier Multi-Approval Workflow */}
      <div className="glass-panel rounded-3xl p-6 space-y-5 bg-white/95 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
              <span>Leave Applications & Multi-Tier Approvals</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tier 1: Direct Reporting Manager &bull; Tier 2: Human Resources Final Signoff
            </p>
          </div>

          {/* Scope Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setLeaveScopeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                leaveScopeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({leaveRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setLeaveScopeFilter('TEAM')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                leaveScopeFilter === 'TEAM'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Team Approvals</span>
              {leaveRequests.filter(l => l.status === 'PENDING_MANAGER').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setLeaveScopeFilter('MY')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                leaveScopeFilter === 'MY'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Requests
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0">Status:</span>
          {[
            { id: 'ALL', label: 'All Statuses' },
            { id: 'PENDING_MANAGER', label: 'Tier 1: Pending Manager' },
            { id: 'PENDING_HR', label: 'Tier 2: Pending HR' },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'REJECTED_MANAGER', label: 'Rejected by Mgr' },
            { id: 'REJECTED_HR', label: 'Rejected by HR' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setLeaveStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                leaveStatusFilter === st.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {isLoadingLeaves ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-xs">Loading leave applications...</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {leaveRequests
              .filter(req => {
                if (leaveScopeFilter === 'TEAM') {
                  const isMyTeam = req.managerId === user?.employeeId;
                  if (isHr) return isMyTeam || req.status === 'PENDING_MANAGER';
                  return isMyTeam;
                }
                if (leaveScopeFilter === 'MY') {
                  return req.employeeId === user?.employeeId || (req.employeeName && user?.fullName && req.employeeName.toLowerCase().includes(user.fullName.toLowerCase()));
                }
                if (leaveStatusFilter !== 'ALL') {
                  return req.status === leaveStatusFilter;
                }
                return true;
              })
              .map((req) => {
                const isManagerReview = req.status === 'PENDING_MANAGER';
                const isHrReview = req.status === 'PENDING_HR';
                const isFullyApproved = req.status === 'APPROVED';
                const isMgrRejected = req.status === 'REJECTED_MANAGER';
                const isHrRejected = req.status === 'REJECTED_HR' || req.status === 'REJECTED';
                const hasManager = Boolean(req.managerId || req.managerName);

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 shadow-xs space-y-3 transition"
                  >
                    {/* Header Row: Employee & Leave details */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900 text-sm">{req.employeeName || 'Staff Member'}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                          {req.leaveType}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                          {req.totalDays || 1} {req.totalDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 font-mono">
                        {req.startDate} &rarr; {req.endDate}
                      </div>
                    </div>

                    {/* Reason quote */}
                    {req.reason && (
                      <div className="text-xs text-slate-600 bg-white/70 p-2.5 rounded-xl border border-slate-200/70">
                        <span className="font-semibold text-slate-500">Reason:</span> &ldquo;{req.reason}&rdquo;
                      </div>
                    )}

                    {/* Two-Tier Workflow Stepper & Actions Row */}
                    <div className="pt-2 border-t border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Visual Stepper Pills */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Workflow:</span>
                        
                        {/* Step 1: Manager Review */}
                        <div className="flex items-center gap-1.5">
                          {hasManager ? (
                            isManagerReview ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Tier 1: Awaiting Manager ({req.managerName})</span>
                              </span>
                            ) : isMgrRejected ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px]" title={req.managerComment}>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Tier 1: Rejected by Mgr</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]" title={req.managerComment}>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Tier 1: Mgr Approved ({req.managerName})</span>
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-medium">
                              <span>Tier 1: Direct HR (No Mgr)</span>
                            </span>
                          )}
                        </div>

                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

                        {/* Step 2: HR Signoff */}
                        <div className="flex items-center gap-1.5">
                          {isFullyApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Tier 2: Final HR Approved</span>
                            </span>
                          ) : isHrRejected ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px]" title={req.hrComment}>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Tier 2: Rejected by HR</span>
                            </span>
                          ) : isHrReview ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-bold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                              <span>Tier 2: Awaiting HR Final Signoff</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[11px]">
                              <span>Tier 2: Awaiting Step 1</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons based on Review Tier */}
                      <div className="flex items-center gap-2 self-end md:self-auto">
                        {isManagerReview && (canApprove || isHr) && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleManagerApproveLeave(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve (Manager)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleManagerRejectLeave(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}

                        {isHrReview && isHr && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleHrApproveLeave(req.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" /> Final HR Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleHrRejectLeave(req.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}

                        {req.status === 'PENDING' && canApprove && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveLeave(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectLeave(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}

                        {/* Status badge when no pending action for current user */}
                        {!isManagerReview && !isHrReview && req.status !== 'PENDING' && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            isFullyApproved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {req.status === 'APPROVED' ? 'Fully Approved' : req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {leaveRequests.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No leave requests found in current view.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
