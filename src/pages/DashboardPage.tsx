import React from 'react';
import {
  Users,
  UserCheck,
  Calendar,
  CircleDollarSign,
  TrendingUp,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  UserPlus,
  FileCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const stats = [
    { title: 'Total Employees', value: '1,248', change: '+12%', icon: Users, color: 'from-emerald-500 to-teal-600' },
    { title: 'Present Today', value: '1,180', change: '94.5%', icon: UserCheck, color: 'from-teal-500 to-cyan-600' },
    { title: 'On Leave', value: '42', change: '3.3%', icon: Calendar, color: 'from-amber-500 to-orange-600' },
    { title: 'Monthly Payroll', value: '₹ 84.5 L', change: '+4.2%', icon: CircleDollarSign, color: 'from-emerald-600 to-emerald-800' },
  ];

  const recentActivities = [
    { id: 1, type: 'Employee Onboarded', title: 'Rajesh Kumar joined as Lead Frontend Engineer', time: '10 mins ago', icon: UserPlus, iconColor: 'text-emerald-400' },
    { id: 2, type: 'Leave Approved', title: 'Priya Sharma - Annual Leave (3 Days)', time: '25 mins ago', icon: CheckCircle2, iconColor: 'text-teal-400' },
    { id: 3, type: 'Payroll Run', title: 'September 2026 Payroll Draft generated for 1,248 employees', time: '1 hour ago', icon: FileCheck, iconColor: 'text-cyan-400' },
    { id: 4, type: 'Attendance Alert', title: '5 Missed Punchouts flagged for verification', time: '2 hours ago', icon: AlertTriangle, iconColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-bold mb-3">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Q3 2026 Enterprise Overview</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, Super Admin 👋
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-xl">
              All systems nominal. Isolated PostgreSQL database <code className="text-emerald-300 font-mono">hrms_db</code> active with multi-tenant company isolation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition">
              Download Summary
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 transition flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card rounded-2xl p-6 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">{stat.value}</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
                  {stat.change}
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Log */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Live System Activity</h2>
            </div>
            <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">View All</button>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
                  <div className={`p-2.5 rounded-xl bg-slate-800 ${act.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{act.type}</span>
                      <span className="text-xs text-slate-500">{act.time}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-200 mt-1">{act.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & System Info */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-400" />
              <span>Company Scope</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Primary Entity</span>
                <span className="font-semibold text-slate-100">Priyex Software Pvt Ltd</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Active Branches</span>
                <span className="font-semibold text-emerald-300">4 (Bengaluru, Mumbai, Delhi, Remote)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Database Schema</span>
                <span className="font-mono text-emerald-400">hrms_db (PostgreSQL 14+)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Flyway Migrations</span>
                <span className="font-mono text-slate-200">V1 to V6 Applied</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
