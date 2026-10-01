import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canApproveLeaves } from '../utils/rbac';
import api from '../api/client';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  X,
  FileText,
  Info,
  ExternalLink
} from 'lucide-react';

export interface LeaveRequestItem {
  id: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const canApprove = canApproveLeaves(user);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time Punch & Attendance Statistics
  const [punchStats, setPunchStats] = useState({
    onTimePunches: 0,
    lateArrivals: 0,
    missedPunchouts: 0,
    staffOnLeave: 0,
    totalStaff: 0
  });

  // Apply Leave Form State
  const [orgPolicies, setOrgPolicies] = useState<{ id: number; leaveCode: string; leaveName: string; annualDays: number }[]>([]);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave (CL)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Fetch real-time attendance and leave data
  const fetchAttendanceData = async () => {
    try {
      // Try dashboard stats first
      const statsRes: any = await api.get('/dashboard/stats');
      if (statsRes.success && statsRes.data) {
        const d = statsRes.data;
        setPunchStats({
          onTimePunches: d.presentToday ?? 0,
          lateArrivals: 0,
          missedPunchouts: 0,
          staffOnLeave: d.staffOnLeave ?? 0,
          totalStaff: d.totalStaff ?? 0
        });
      }
    } catch (e) {
      // Fallback: calculate from employees
      try {
        const empRes: any = await api.get('/employees');
        const empList = empRes?.data?.content || [];
        const total = empRes?.data?.totalElements ?? empList.length;
        const active = empList.filter((x: any) => x.status === 'ACTIVE').length;
        const onLeave = empList.filter((x: any) => x.status === 'ON_LEAVE').length;
        setPunchStats({
          onTimePunches: Math.max(0, active - onLeave),
          lateArrivals: 0,
          missedPunchouts: 0,
          staffOnLeave: onLeave,
          totalStaff: total
        });
      } catch (err) {
        // Fallback
      }
    }
  };

  // Fetch Leave Requests from API
  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/leaves');
      if (res.success && Array.isArray(res.data)) {
        setLeaveRequests(res.data);
      } else {
        setLeaveRequests(fallbackLeaves);
      }
    } catch (err) {
      setLeaveRequests(fallbackLeaves);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchAttendanceData();
    api.get('/organization/leave-policies').then((res: any) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setOrgPolicies(res.data);
        setLeaveForm((prev) => ({ ...prev, leaveType: res.data[0].leaveName }));
      }
    }).catch(() => {});
  }, []);

  // Approve Handler
  const handleApprove = async (id: number) => {
    setLeaveRequests(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
    try {
      await api.put(`/leaves/${id}/approve`);
      fetchAttendanceData();
    } catch (err) {
      // Ignore network fallback
    }
  };

  // Reject Handler
  const handleReject = async (id: number) => {
    setLeaveRequests(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'REJECTED' } : item))
    );
    try {
      await api.put(`/leaves/${id}/reject`);
      fetchAttendanceData();
    } catch (err) {
      // Ignore network fallback
    }
  };

  // Submit Leave Form
  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        status: 'PENDING'
      };

      const res: any = await api.post('/leaves', payload);
      if (res.success || res.data) {
        setIsModalOpen(false);
        setLeaveForm({
          leaveType: 'Annual Leave',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          reason: '',
        });
        fetchLeaves();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit leave application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingCount = leaveRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header Aligned Across All Modules */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-blue-600" />
            <span>Attendance & Leave Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Track daily biometric punches, shift rotas, and leave applications
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply Leave / Regularize</span>
        </button>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Today's Punch Statistics</span>
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">On Time Punches</span>
              <span className="font-bold text-emerald-700">{punchStats.onTimePunches.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Staff On Leave</span>
              <span className="font-bold text-amber-600">{punchStats.staffOnLeave.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Total Enrolled Workforce</span>
              <span className="font-bold text-blue-600">{punchStats.totalStaff.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Leave Approval Queue</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900">{pendingCount}</span>
            <p className="text-xs text-slate-500 mt-1">Pending manager approvals requiring action</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Shift Rota</span>
            <CalendarCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-4">
            <span className="text-base font-bold text-emerald-800">General Shift (09:30 AM - 06:30 PM)</span>
            <p className="text-xs text-slate-500 mt-1">Standard 9-hour shift schedule with 1-hr break</p>
          </div>
        </div>
      </div>

      {/* Org Policy Reference Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs">
        <div className="flex items-center gap-2 text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Organization Leave Policies:</strong> Quotas are managed at the org level (Casual: 12d, Sick: 10d, Privilege: 15d).
          </span>
        </div>
        <Link to="/organization" className="text-blue-700 font-bold hover:underline shrink-0 flex items-center gap-1">
          <span>View Quotas</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Leave Applications Table */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Leave Requests</h2>
        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading leave applications...</div>
        ) : (
          <div className="space-y-3">
            {leaveRequests.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{req.employeeName || 'Employee'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">{req.leaveType}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {req.totalDays || 1} Days ({req.startDate} to {req.endDate}) &bull; <span className="italic">{req.reason || 'Personal leave'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {req.status === 'PENDING' && canApprove ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      req.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Apply Leave Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Apply for Leave</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  {orgPolicies.length > 0 ? (
                    orgPolicies.map((p) => (
                      <option key={p.id} value={p.leaveName}>
                        {p.leaveName} ({p.annualDays} days/yr)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Casual Leave (CL)">Casual Leave (CL) (12 days/yr)</option>
                      <option value="Sick Leave (SL)">Sick Leave (SL) (10 days/yr)</option>
                      <option value="Privilege Leave (PL)">Privilege Leave (PL) (15 days/yr)</option>
                      <option value="Maternity Leave">Maternity Leave (180 days)</option>
                      <option value="Paternity Leave">Paternity Leave (15 days)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="State the reason for leave request..."
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const fallbackLeaves: LeaveRequestItem[] = [
  { id: 1, employeeName: 'Priya Sharma', leaveType: 'Annual Leave', startDate: '2026-10-01', endDate: '2026-10-03', totalDays: 3, reason: 'Family vacation', status: 'PENDING' },
  { id: 2, employeeName: 'Amit Verma', leaveType: 'Casual Leave', startDate: '2026-09-28', endDate: '2026-09-28', totalDays: 1, reason: 'Personal work', status: 'APPROVED' },
  { id: 3, employeeName: 'Siddharth Roy', leaveType: 'Sick Leave', startDate: '2026-09-25', endDate: '2026-09-26', totalDays: 2, reason: 'Medical recovery', status: 'APPROVED' },
];

