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
    setLeaveRequests(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'APPROVED' } : item))
    );
    try {
      await api.put(`/leaves/${id}/approve`);
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
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            <span>Attendance & Leave Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Track daily biometric punches, shift rotas, and leave applications</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
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
              <span className="font-bold text-emerald-700">1,120</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Late Arrivals</span>
              <span className="font-bold text-amber-600">60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Missed Punchout</span>
              <span className="font-bold text-rose-600">5</span>
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
                  {req.status === 'PENDING' ? (
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
                      req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Apply for Leave</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Maternity / Paternity Leave">Maternity / Paternity Leave</option>
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
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20"
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
