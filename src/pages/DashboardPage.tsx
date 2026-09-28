import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canManageEmployees } from '../utils/rbac';
import api from '../api/client';
import {
  Users,
  UserCheck,
  Calendar,
  CalendarCheck,
  ClipboardCheck,
  CircleDollarSign,
  TrendingUp,
  Clock,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  UserPlus,
  FileCheck,
  FileText,
  Headphones,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';

export interface Department {
  id: number;
  name: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isManagerOrAdmin = canManageEmployees(user);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    personalPhone: '',
    departmentId: '',
    employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res: any = await api.get('/organization/departments');
        if (res.success && Array.isArray(res.data)) {
          setDepartments(res.data);
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchDepts();
  }, []);

  // Admin / HR company-wide metrics
  const adminStats = [
    {
      title: 'Total Employees',
      value: '1,248',
      unit: 'Active Staff',
      footer: '+12% vs last quarter',
      dotColor: 'bg-emerald-500',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      progress: 88,
      link: '/employees'
    },
    {
      title: 'Present Today',
      value: '1,180',
      unit: '/ 1,248 Staff',
      footer: '94.5% daily attendance',
      dotColor: 'bg-teal-500',
      icon: UserCheck,
      color: 'from-teal-500 to-cyan-600',
      progress: 94.5,
      link: '/attendance'
    },
    {
      title: 'Staff On Leave',
      value: '42',
      unit: 'Planned',
      footer: '3.3% daily leave rate',
      dotColor: 'bg-amber-500',
      icon: Calendar,
      color: 'from-amber-500 to-orange-500',
      progress: 15,
      link: '/attendance'
    },
    {
      title: 'Monthly Payroll',
      prefix: '₹',
      value: '84.5 L',
      unit: 'Gross',
      footer: '+4.2% disbursement run',
      dotColor: 'bg-emerald-600',
      icon: CircleDollarSign,
      color: 'from-emerald-600 to-teal-700',
      progress: 100,
      link: '/payroll'
    },
  ];

  // Employee personal self-service metrics
  const employeeStats = [
    {
      title: 'Days Present',
      value: '21',
      unit: '/ 22 Days',
      footer: '95.5% on-time attendance',
      dotColor: 'bg-emerald-500',
      icon: CalendarCheck,
      color: 'from-emerald-500 to-teal-600',
      progress: 95.5,
      link: '/attendance'
    },
    {
      title: 'Leave Balance',
      value: '14',
      unit: 'Days Available',
      footer: '14 of 18 annual leaves remaining',
      dotColor: 'bg-teal-500',
      icon: Calendar,
      color: 'from-teal-500 to-cyan-600',
      progress: 77.7,
      link: '/attendance'
    },
    {
      title: 'Latest Net Pay',
      prefix: '₹',
      value: '82,500',
      unit: '/ month',
      footer: 'Credited on Aug 31',
      dotColor: 'bg-blue-500',
      icon: CircleDollarSign,
      color: 'from-blue-600 to-indigo-600',
      progress: 100,
      link: '/payroll'
    },
    {
      title: 'Active Requests',
      value: '1',
      unit: 'In Review',
      footer: 'Casual leave awaiting approval',
      dotColor: 'bg-amber-500',
      icon: ClipboardCheck,
      color: 'from-amber-500 to-orange-500',
      progress: 50,
      link: '/requests'
    },
  ];

  const stats = isManagerOrAdmin ? adminStats : employeeStats;

  const adminActivities = [
    { id: 1, type: 'Employee Onboarded', title: 'Rajesh Kumar joined as Lead Frontend Engineer', time: '10 mins ago', icon: UserPlus, iconColor: 'text-emerald-600 bg-emerald-50' },
    { id: 2, type: 'Leave Approved', title: 'Priya Sharma - Annual Leave (3 Days)', time: '25 mins ago', icon: CheckCircle2, iconColor: 'text-teal-600 bg-teal-50' },
    { id: 3, type: 'Payroll Run', title: 'September 2026 Payroll Draft generated for 1,248 employees', time: '1 hour ago', icon: FileCheck, iconColor: 'text-cyan-600 bg-cyan-50' },
    { id: 4, type: 'Attendance Alert', title: '5 Missed Punchouts flagged for verification', time: '2 hours ago', icon: AlertTriangle, iconColor: 'text-amber-600 bg-amber-50' },
  ];

  const employeeActivities = [
    { id: 1, type: 'Leave Request', title: 'Casual Leave request submitted for Oct 2 — Pending Manager Approval', time: 'Today', icon: Clock, iconColor: 'text-amber-600 bg-amber-50' },
    { id: 2, type: 'Attendance Recorded', title: 'Biometric punch-in recorded today at 09:14 AM — On time', time: '09:14 AM', icon: CheckCircle2, iconColor: 'text-emerald-600 bg-emerald-50' },
    { id: 3, type: 'Payslip Released', title: 'August 2026 Monthly Salary Statement generated & ready for download', time: 'Yesterday', icon: FileCheck, iconColor: 'text-cyan-600 bg-cyan-50' },
    { id: 4, type: 'HR Support', title: 'PF & UAN query responded by HR Specialist', time: '2 days ago', icon: CheckCircle2, iconColor: 'text-teal-600 bg-teal-50' },
  ];

  const recentActivities = isManagerOrAdmin ? adminActivities : employeeActivities;

  // Onboard Employee Handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        workEmail: formData.workEmail,
        personalPhone: formData.personalPhone,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        status: 'ACTIVE'
      };

      const res: any = await api.post('/employees', payload);
      if (res.success || res.data) {
        setIsAddModalOpen(false);
        setFormData({
          firstName: '',
          lastName: '',
          workEmail: '',
          personalPhone: '',
          departmentId: '',
          employmentType: 'FULL_TIME',
          joiningDate: new Date().toISOString().split('T')[0],
        });
        navigate('/employees');
      }
    } catch (err: any) {
      setFormError(err?.message || err || 'Failed to onboard employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download Summary Handler
  const handleDownloadSummary = async () => {
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'executive_summary_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('Downloading executive summary report...');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-8 overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs font-bold mb-2.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isManagerOrAdmin ? 'Q3 2026 Enterprise Overview' : 'Employee Self-Service Workspace'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.displayName || user?.fullName || (user?.roles?.includes('SUPER_ADMIN') ? 'Super Admin' : 'User')} 👋
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-2 max-w-xl">
              {isManagerOrAdmin
                ? 'All systems nominal. Isolated PostgreSQL database hrms_db active with multi-tenant company isolation.'
                : 'Access your employee profile, attendance calendar, shift schedules, and apply for leave applications.'}
            </p>
          </div>
          {isManagerOrAdmin ? (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition cursor-pointer"
              >
                Download Summary
              </button>
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(true); setFormError(null); }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Employee</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('/attendance')}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold border border-white/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4 text-emerald-300" />
                <span>Apply for Leave</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/payroll')}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/30 transition flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Payslips</span>
              </button>
            </div>
          )}
        </div>
      </div>


      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(stat.link)}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Ambient Hover Glow */}
              <div className={`absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-15 rounded-full blur-2xl transition-all duration-300 pointer-events-none`}></div>

              {/* Card Header Row: Title & Styled Icon */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                    {stat.title}
                  </span>
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${stat.color} text-white flex items-center justify-center shadow-md shadow-slate-200 group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Main Metric Value Row */}
                <div className="mt-3.5 flex items-baseline gap-1.5 flex-wrap">
                  {stat.prefix && (
                    <span className="text-xl font-bold text-slate-400">
                      {stat.prefix}
                    </span>
                  )}
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular-nums">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      {stat.unit}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Progress Bar (if present) + Clean Status Indicator */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
                {stat.progress !== undefined && (
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                      style={{ width: `${stat.progress}%` }}
                    ></div>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${stat.dotColor || 'bg-emerald-500'} shrink-0`}></span>
                    <span className="truncate">{stat.footer}</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Log / Personal Timeline */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {isManagerOrAdmin ? 'Live System Activity' : 'My Recent Activity & Timeline'}
              </h2>
            </div>
            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={() => navigate('/audit-logs')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                View All
              </button>
            )}
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                  <div className={`p-2.5 rounded-xl border border-slate-200 ${act.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">{act.type}</span>
                      <span className="text-xs text-slate-400 font-medium">{act.time}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{act.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions & System / Self-Service Hub */}
        <div className="space-y-6">
          {isManagerOrAdmin ? (
            <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600" />
                <span>Company Scope</span>
              </h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Primary Entity</span>
                  <span className="font-bold text-slate-900">Priyex Software Pvt Ltd</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Active Branches</span>
                  <span className="font-bold text-emerald-700">4 (Bengaluru, Mumbai, Delhi, Remote)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Database Schema</span>
                  <span className="font-mono font-bold text-emerald-600">hrms_db (PostgreSQL 14+)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">Flyway Migrations</span>
                  <span className="font-mono font-bold text-slate-800">V1 to V13 Applied</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Quick Self-Service Hub</span>
              </h3>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">Apply for Leave</h4>
                      <p className="text-[11px] text-slate-500">Submit paid time off or casual leave</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/payroll')}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">View My Payslips</h4>
                      <p className="text-[11px] text-slate-500">Download monthly salary breakdown & tax</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/requests')}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition">Profile Update Requests</h4>
                      <p className="text-[11px] text-slate-500">Request address, phone or bank updates</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition" />
                </button>
              </div>

              {/* Employee Account Summary */}
              <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Portal Account ID:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {user?.id ? `USR-${1000 + Number(user.id)}` : 'EMP-1001'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Verification Status:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active • Biometric Linked
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onboard New Employee Modal (rendered via React Portal) */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs safe-area-top safe-area-bottom">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Onboard New Employee</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 sm:mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 sm:space-y-4 mt-3 sm:mt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Rajesh"
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Kumar"
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-base sm:text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  placeholder="rajesh.kumar@priyex.com"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-base sm:text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.personalPhone}
                    onChange={(e) => setFormData({ ...formData, personalPhone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-base sm:text-xs"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-base sm:text-xs"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 text-base sm:text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition"
                >
                  {isSubmitting ? 'Onboarding...' : 'Save & Create Employee'}
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

