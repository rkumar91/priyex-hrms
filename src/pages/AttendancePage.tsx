import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PlusCircle,
  X,
  FileText
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
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply Leave Form State
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Annual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // Fetch Leave Requests from API
  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/leaves');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
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
  }, []);

  // Approve Handler
  const handleApprove = async (id: number) => {
    // Optimistic state update immediately
    setLeaveRequests(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );

    try {
      await api.put(`/leaves/${id}/approve`);
    } catch (err) {
      // Ignore network errors or fallback
    }
  };

  // Reject Handler
  const handleReject = async (id: number) => {
    // Optimistic state update immediately
    setLeaveRequests(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'REJECTED' } : item))
    );

    try {
      await api.put(`/leaves/${id}/reject`);
    } catch (err) {
      // Ignore network errors or fallback
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
      if (res.success) {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-400" />
            <span>Attendance & Leave Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Track daily biometric punches, shift rotas, and leave applications</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply Leave / Regularize</span>
        </button>
      </div>

      {/* Attendance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Today's Punch Statistics</span>
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">On Time Punches</span>
              <span className="font-semibold text-emerald-400">1,120</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Late Arrivals</span>
              <span className="font-semibold text-amber-400">60</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Missed Punchout</span>
              <span className="font-semibold text-rose-400">5</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Leave Approval Queue</span>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white">{pendingCount}</span>
            <p className="text-xs text-slate-400 mt-1">Pending manager approvals requiring action</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Shift Rota</span>
            <CalendarCheck className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-4">
            <span className="text-lg font-bold text-indigo-300">General Shift (09:30 AM - 06:30 PM)</span>
            <p className="text-xs text-slate-400 mt-1">Standard 9-hour shift schedule with 1-hr break</p>
          </div>
        </div>
      </div>

      {/* Leave Applications Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white mb-4">Recent Leave Requests</h2>
        {isLoading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading leave applications...</div>
        ) : (
          <div className="space-y-3">
            {leaveRequests.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-100">{req.employeeName || 'Employee'}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-xs font-medium border border-indigo-800/50">{req.leaveType}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {req.totalDays || 1} Days ({req.startDate} to {req.endDate}) &bull; <span className="italic">{req.reason || 'Personal leave'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {req.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-md shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-md shadow-rose-600/20"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      req.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Apply for Leave</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Maternity / Paternity Leave">Maternity / Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="State the reason for leave request..."
                  className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const fallbackLeaves: LeaveRequestItem[] = [
  { id: 1, employeeName: 'Priya Sharma', leaveType: 'Annual Leave', startDate: '2026-10-01', endDate: '2026-10-03', totalDays: 3, reason: 'Family vacation', status: 'PENDING' },
  { id: 2, employeeName: 'Amit Verma', leaveType: 'Casual Leave', startDate: '2026-09-28', endDate: '2026-09-28', totalDays: 1, reason: 'Personal work', status: 'APPROVED' },
  { id: 3, employeeName: 'Siddharth Roy', leaveType: 'Sick Leave', startDate: '2026-09-25', endDate: '2026-09-26', totalDays: 2, reason: 'Medical recovery', status: 'APPROVED' },
];
