import React from 'react';
import { CalendarCheck, Clock, CheckCircle2, XCircle, AlertCircle, PlusCircle } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const leaveRequests = [
    { id: 1, name: 'Priya Sharma', leaveType: 'Annual Leave', duration: '3 Days (Oct 01 - Oct 03)', reason: 'Family vacation', status: 'PENDING' },
    { id: 2, name: 'Amit Verma', leaveType: 'Casual Leave', duration: '1 Day (Sep 28)', reason: 'Personal work', status: 'APPROVED' },
    { id: 3, name: 'Siddharth Roy', leaveType: 'Sick Leave', duration: '2 Days (Sep 25 - Sep 26)', reason: 'Medical recovery', status: 'APPROVED' },
  ];

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
        <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2">
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
            <span className="text-3xl font-extrabold text-white">3</span>
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
        <div className="space-y-3">
          {leaveRequests.map((req) => (
            <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-100">{req.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 text-xs font-medium border border-indigo-800/50">{req.leaveType}</span>
                </div>
                <p className="text-xs text-slate-400">{req.duration} &bull; <span className="italic">{req.reason}</span></p>
              </div>

              <div className="flex items-center gap-3">
                {req.status === 'PENDING' ? (
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800">
                    {req.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
