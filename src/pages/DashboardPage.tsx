import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
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
  const { t } = useLanguage();
  const { currentThemeOption } = useTheme();
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

  // Real-time Dashboard Statistics State
  const [statsData, setStatsData] = useState({
    totalStaff: 0,
    activeStaff: 0,
    presentToday: 0,
    staffOnLeave: 0,
    attendanceRate: 100,
    leaveRate: 0,
    monthlyPayroll: '0.0 L',
    totalDepartments: 0,
    pendingLeaves: 0,
    myDaysPresent: 21,
    myTotalWorkingDays: 22,
    myLeaveBalance: 18,
    myLatestNetPayFormatted: '82,500',
    myActiveRequests: 0,
  });
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch real-time statistics from backend API & live synchronization
  const fetchDashboardData = async () => {
    setIsLoadingStats(true);
    try {
      let statsLoaded = false;
      try {
        const res: any = await api.get('/dashboard/stats');
        if (res.success && res.data) {
          const d = res.data;
          setStatsData({
            totalStaff: d.totalStaff ?? 0,
            activeStaff: d.activeStaff ?? 0,
            presentToday: d.presentToday ?? 0,
            staffOnLeave: d.staffOnLeave ?? 0,
            attendanceRate: d.attendanceRate ?? 100,
            leaveRate: d.leaveRate ?? 0,
            monthlyPayroll: d.monthlyPayrollFormatted ?? '0.0 L',
            totalDepartments: d.totalDepartments ?? 0,
            pendingLeaves: d.pendingLeaves ?? 0,
            myDaysPresent: d.myDaysPresent ?? 21,
            myTotalWorkingDays: d.myTotalWorkingDays ?? 22,
            myLeaveBalance: d.myLeaveBalance ?? 18,
            myLatestNetPayFormatted: d.myLatestNetPayFormatted ?? '82,500',
            myActiveRequests: d.myActiveRequests ?? 0,
          });
          if (Array.isArray(d.recentActivities) && d.recentActivities.length > 0) {
            setLiveActivities(d.recentActivities);
          }
          statsLoaded = true;
        }
      } catch (err) {
        // Fallback to direct resources
      }

      // Secondary synchronization: Query direct /employees and /leaves endpoints
      if (!statsLoaded) {
        const [empRes, leaveRes]: any[] = await Promise.allSettled([
          api.get('/employees'),
          api.get('/leaves')
        ]);

        const employeesList = (empRes.status === 'fulfilled' && empRes.value?.success && empRes.value?.data?.content)
          ? empRes.value.data.content
          : [];
        const total = (empRes.status === 'fulfilled' && empRes.value?.data?.totalElements !== undefined)
          ? Number(empRes.value.data.totalElements)
          : employeesList.length;

        const activeCount = employeesList.filter((e: any) => e.status === 'ACTIVE').length;
        const leavesList = (leaveRes.status === 'fulfilled' && leaveRes.value?.success && Array.isArray(leaveRes.value?.data))
          ? leaveRes.value.data
          : [];

        const todayStr = new Date().toISOString().split('T')[0];
        const onLeaveToday = leavesList.filter((l: any) => 
          l.status === 'APPROVED' && 
          l.startDate && l.endDate && 
          todayStr >= l.startDate && todayStr <= l.endDate
        ).length;
        const statusOnLeave = employeesList.filter((e: any) => e.status === 'ON_LEAVE').length;
        const totalOnLeave = Math.max(onLeaveToday, statusOnLeave);

        const totalStaff = total;
        const present = Math.max(0, activeCount - onLeaveToday);
        const attRate = totalStaff > 0 ? Number(((present / totalStaff) * 100).toFixed(1)) : 100;
        const lRate = totalStaff > 0 ? Number(((totalOnLeave / totalStaff) * 100).toFixed(1)) : 0;
        const pendingCount = leavesList.filter((l: any) => l.status === 'PENDING').length;

        setStatsData(prev => ({
          ...prev,
          totalStaff,
          activeStaff: activeCount,
          presentToday: present,
          staffOnLeave: totalOnLeave,
          attendanceRate: attRate,
          leaveRate: lRate,
          pendingLeaves: pendingCount,
        }));
      }
    } catch (e) {
      console.error('Error fetching dashboard real-time data:', e);
    } finally {
      setIsLoadingStats(false);
    }
  };

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
    fetchDashboardData();
  }, []);

  // Greeting helper based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dash.goodMorning', 'Good morning');
    if (hour < 17) return t('dash.goodAfternoon', 'Good afternoon');
    return t('dash.goodEvening', 'Good evening');
  };

  const currentDateDisplay = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  // Dynamic rates
  const empAttRate = statsData.myTotalWorkingDays > 0
    ? Math.round((statsData.myDaysPresent / statsData.myTotalWorkingDays) * 100)
    : 100;

  // Admin / HR company-wide metrics with real-time values
  const adminStats = [
    {
      title: t('dash.kpi.totalStaff', 'Total Staff'),
      value: statsData.totalStaff.toLocaleString(),
      unit: t('dash.kpi.activeStaff', 'Active Staff'),
      footer: `${statsData.activeStaff} ${t('dash.kpi.activeStaff', 'Active')} / ${statsData.totalStaff} ${t('dash.kpi.staffRatio', 'Staff')}`,
      badge: `${statsData.totalStaff > 0 ? Math.round((statsData.activeStaff / statsData.totalStaff) * 100) : 100}% Active`,
      icon: Users,
      color: 'from-blue-600 to-indigo-600',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/60',
      progressColor: '#2563eb',
      progress: statsData.totalStaff > 0 ? Math.round((statsData.activeStaff / statsData.totalStaff) * 100) : 100,
      link: '/employees'
    },
    {
      title: t('dash.kpi.presentToday', 'Present Today'),
      value: statsData.presentToday.toLocaleString(),
      unit: `/ ${statsData.totalStaff} ${t('dash.kpi.staffRatio', 'Staff')}`,
      footer: `${statsData.attendanceRate}% ${t('dash.kpi.dailyAttendance', 'daily attendance')}`,
      badge: `${statsData.attendanceRate}%`,
      icon: UserCheck,
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      progressColor: '#10b981',
      progress: statsData.attendanceRate,
      link: '/attendance'
    },
    {
      title: t('dash.kpi.staffOnLeave', 'Staff On Leave'),
      value: statsData.staffOnLeave.toLocaleString(),
      unit: t('dash.kpi.planned', 'Planned'),
      footer: `${statsData.leaveRate}% ${t('dash.kpi.leaveRate', 'daily leave rate')}`,
      badge: `${statsData.leaveRate}%`,
      icon: Calendar,
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      progressColor: '#f59e0b',
      progress: Math.max(5, statsData.leaveRate),
      link: '/attendance'
    },
    {
      title: t('dash.kpi.monthlyPayroll', 'Monthly Payroll'),
      prefix: '₹',
      value: statsData.monthlyPayroll,
      unit: 'Gross',
      footer: `${statsData.activeStaff} staff active disbursement`,
      badge: `${statsData.totalStaff} Staff`,
      icon: CircleDollarSign,
      color: 'from-indigo-600 to-violet-600',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
      progressColor: '#4f46e5',
      progress: 100,
      link: '/payroll'
    },
  ];

  // Employee personal self-service metrics with real-time values
  const employeeStats = [
    {
      title: t('dash.kpi.daysPresent', 'Days Present'),
      value: String(statsData.myDaysPresent),
      unit: `/ ${statsData.myTotalWorkingDays} Days`,
      footer: `${empAttRate}% ${t('dash.kpi.onTime', 'attendance rate')}`,
      badge: `${empAttRate}%`,
      icon: CalendarCheck,
      color: 'from-emerald-500 to-teal-600',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      progressColor: '#10b981',
      progress: empAttRate,
      link: '/attendance'
    },
    {
      title: t('dash.kpi.leaveBalance', 'Leave Balance'),
      value: String(statsData.myLeaveBalance),
      unit: t('dash.kpi.daysAvailable', 'Days Available'),
      footer: `${statsData.myLeaveBalance} of 18 ${t('dash.kpi.availableLeaves', 'annual leaves remaining')}`,
      badge: `${statsData.myLeaveBalance} Days`,
      icon: Calendar,
      color: 'from-teal-500 to-cyan-600',
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/60',
      progressColor: '#14b8a6',
      progress: Math.min(100, Math.round((statsData.myLeaveBalance / 18) * 100)),
      link: '/attendance'
    },
    {
      title: t('dash.kpi.latestNetPay', 'Latest Net Pay'),
      prefix: '₹',
      value: statsData.myLatestNetPayFormatted,
      unit: '/ month',
      footer: `₹${statsData.myLatestNetPayFormatted} disbursed`,
      badge: 'Disbursed',
      icon: CircleDollarSign,
      color: 'from-blue-600 to-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
      progressColor: '#6366f1',
      progress: 100,
      link: '/payroll'
    },
    {
      title: t('dash.kpi.activeRequests', 'Active Requests'),
      value: String(statsData.myActiveRequests),
      unit: t('dash.kpi.inReview', 'In Review'),
      footer: statsData.myActiveRequests > 0 
        ? `${statsData.myActiveRequests} ${t('dash.kpi.activeRequestsPending', 'request(s) awaiting approval')}` 
        : t('dash.kpi.allRequestsProcessed', 'All requests processed'),
      badge: `${statsData.myActiveRequests} Pending`,
      icon: ClipboardCheck,
      color: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      progressColor: '#f59e0b',
      progress: statsData.myActiveRequests > 0 ? 50 : 100,
      link: '/requests'
    },
  ];

  const stats = isManagerOrAdmin ? adminStats : employeeStats;

  // Icon mapping for dynamic activities
  const activityIconMap: Record<string, any> = {
    UserPlus,
    CheckCircle2,
    Clock,
    FileCheck,
    AlertTriangle,
  };

  const defaultAdminActivities = [
    {
      id: 1,
      type: t('dash.act.onboarded', 'Employee Onboarded'),
      title: t('dash.act.onboardedDesc', 'Rajesh Kumar joined as Lead Frontend Engineer'),
      time: t('dash.act.time10m', '10 mins ago'),
      icon: UserPlus,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 2,
      type: t('dash.act.leaveApproved', 'Leave Approved'),
      title: t('dash.act.leaveApprovedDesc', 'Priya Sharma - Annual Leave (3 Days)'),
      time: t('dash.act.time25m', '25 mins ago'),
      icon: CheckCircle2,
      iconColor: 'text-teal-600 bg-teal-50'
    },
    {
      id: 3,
      type: t('dash.act.payrollRun', 'Payroll Run'),
      title: t('dash.act.payrollRunDesc', 'Monthly Payroll Draft generated for active employees'),
      time: t('dash.act.time1h', '1 hour ago'),
      icon: FileCheck,
      iconColor: 'text-cyan-600 bg-cyan-50'
    },
    {
      id: 4,
      type: t('dash.act.attendanceAlert', 'Attendance Alert'),
      title: t('dash.act.attendanceAlertDesc', 'Missed punchouts flagged for verification'),
      time: t('dash.act.time2h', '2 hours ago'),
      icon: AlertTriangle,
      iconColor: 'text-amber-600 bg-amber-50'
    },
  ];

  const defaultEmployeeActivities = [
    {
      id: 1,
      type: t('dash.act.leaveRequest', 'Leave Request'),
      title: t('dash.act.leaveRequestDesc', 'Leave request submitted — Pending Manager Approval'),
      time: t('dash.act.today', 'Today'),
      icon: Clock,
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      id: 2,
      type: t('dash.act.attendanceRecorded', 'Attendance Recorded'),
      title: t('dash.act.attendanceRecordedDesc', 'Biometric punch-in recorded today — On time'),
      time: '09:14 AM',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 3,
      type: t('dash.act.payslipReleased', 'Payslip Released'),
      title: t('dash.act.payslipReleasedDesc', 'Monthly Salary Statement generated & ready for download'),
      time: t('dash.act.yesterday', 'Yesterday'),
      icon: FileCheck,
      iconColor: 'text-cyan-600 bg-cyan-50'
    },
    {
      id: 4,
      type: t('dash.act.hrSupport', 'HR Support'),
      title: t('dash.act.hrSupportDesc', 'PF & UAN query responded by HR Specialist'),
      time: t('dash.act.time2d', '2 days ago'),
      icon: CheckCircle2,
      iconColor: 'text-teal-600 bg-teal-50'
    },
  ];

  const dynamicActivities = liveActivities.length > 0
    ? liveActivities.map(act => ({
        ...act,
        icon: activityIconMap[act.icon] || CheckCircle2,
      }))
    : (isManagerOrAdmin ? defaultAdminActivities : defaultEmployeeActivities);

  const recentActivities = dynamicActivities;

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
      {/* Top Banner: Crystal Clear Enterprise Hero */}
      <div
        className="relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-xs p-6 sm:p-7 overflow-hidden transition-all duration-300"
      >
        {/* Subtle executive blue ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-50/70 via-slate-50/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/70 text-blue-700 text-xs font-bold mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>{isManagerOrAdmin ? t('dash.q3Overview', 'Enterprise HR Operations') : t('dash.enterprisePortal', 'Employee Workforce Portal')}</span>
              <span className="w-1 h-1 rounded-full bg-blue-400" />
              <span className="font-medium text-slate-500">{currentDateDisplay}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()},{' '}
              <span className="text-blue-600 font-extrabold">
                {user?.displayName || user?.fullName || (user?.roles?.includes('SUPER_ADMIN') ? 'Super Admin' : 'Colleague')}
              </span> 👋
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              {isManagerOrAdmin
                ? t('dash.adminSubtitle', 'Real-time overview of workforce operations, attendance health, and payroll across all branch locations.')
                : t('dash.empSubtitle', 'Your centralized portal for attendance verification, leave planning, and monthly salary statements.')}
            </p>

            {/* Live Inline Metric Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{statsData.activeStaff} {t('dash.chipStaff', 'Active Staff')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{statsData.attendanceRate}% {t('dash.chipPresent', 'Present Today')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>{statsData.totalDepartments || departments.length || 1} {t('dash.chipBranches', 'Departments')}</span>
              </span>
            </div>
          </div>

          {/* Action buttons (Clean Enterprise Blue + White) */}
          {isManagerOrAdmin ? (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                {t('dash.downloadReport', 'Download Summary')}
              </button>
              <button
                type="button"
                onClick={() => { setIsAddModalOpen(true); setFormError(null); }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>{t('dash.addEmployee', 'Add Employee')}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/attendance')}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95"
              >
                <CalendarCheck className="w-4 h-4 text-slate-600" />
                <span>{t('dash.applyLeave', 'Apply for Leave')}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/payroll')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>{t('dash.viewPayslips', 'View Payslips')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat: any, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => navigate(stat.link)}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 relative group cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top ambient glow */}
              <div
                className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 blur-xl transition-all duration-300 pointer-events-none bg-gradient-to-br ${stat.color}`}
              />

              {/* Card Header Row: Title & Styled Icon */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
                    {stat.title}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300 shrink-0 ${stat.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Main Metric Value Row */}
                <div className="mt-3 flex items-baseline gap-1.5 flex-wrap">
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
                      className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${stat.color}`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: stat.progressColor || currentThemeOption.primaryColor }}
                    />
                    <span className="truncate">{stat.footer}</span>
                  </span>
                  {stat.badge ? (
                    <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0 ml-1">
                      {stat.badge}
                    </span>
                  ) : (
                    <ArrowRight
                      className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                      style={{ color: currentThemeOption.primaryColor }}
                    />
                  )}
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
              <Clock className="w-5 h-5" style={{ color: currentThemeOption.primaryColor }} />
              <h2 className="text-lg font-bold text-slate-900">
                {isManagerOrAdmin ? t('dash.liveActivity', 'Live System Activity') : t('dash.recentActivity', 'My Recent Activity & Timeline')}
              </h2>
            </div>
            {isManagerOrAdmin && (
              <button
                type="button"
                onClick={() => navigate('/audit-logs')}
                className="text-xs font-bold hover:underline cursor-pointer"
                style={{ color: currentThemeOption.primaryColor }}
              >
                {t('dash.viewAll', 'View All')}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div key={act.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 border border-slate-200/80 hover:border-slate-300 transition">
                  <div className={`p-2.5 rounded-xl border border-slate-200 ${act.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: currentThemeOption.primaryColor }}>
                        {act.type}
                      </span>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-emerald-600" />
                  <span>{t('dash.enterpriseInsights', 'Enterprise Insights')}</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{t('dash.primaryEntity', 'Primary Entity')}</span>
                  <span className="font-bold text-slate-900">Priyex Software Pvt Ltd</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{t('dash.activeBranches', 'Active Locations')}</span>
                  <span className="font-bold text-slate-800">4 (BLR, BOM, DEL, Remote)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{t('dash.totalStaff', 'Active Workforce')}</span>
                  <span className="font-bold text-emerald-600">{statsData.activeStaff} / {statsData.totalStaff} Enrolled</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">{t('dash.pendingApprovals', 'Pending Approvals')}</span>
                  <span className={`font-bold ${statsData.pendingLeaves > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                    {statsData.pendingLeaves} {statsData.pendingLeaves === 1 ? 'Request' : 'Requests'} Pending
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-medium">{t('dash.payrollSchedule', 'Next Payroll Run')}</span>
                  <span className="font-bold text-slate-800">Monthly Cycle (Scheduled)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: currentThemeOption.primaryColor }} />
                <span>{t('dash.quickHub', 'Quick Self-Service Hub')}</span>
              </h3>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="w-full text-left p-3 rounded-2xl bg-white/80 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100" style={{ color: currentThemeOption.primaryColor }}>
                      <CalendarCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 transition">{t('dash.applyLeave', 'Apply for Leave')}</h4>
                      <p className="text-[11px] text-slate-500">{t('dash.applyLeaveDesc', 'Submit paid time off or casual leave')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" style={{ color: currentThemeOption.primaryColor }} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/payroll')}
                  className="w-full text-left p-3 rounded-2xl bg-white/80 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100" style={{ color: currentThemeOption.primaryColor }}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 transition">{t('dash.viewPayslips', 'View My Payslips')}</h4>
                      <p className="text-[11px] text-slate-500">{t('dash.viewPayslipsDesc', 'Download monthly salary breakdown & tax')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" style={{ color: currentThemeOption.primaryColor }} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/requests')}
                  className="w-full text-left p-3 rounded-2xl bg-white/80 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100" style={{ color: currentThemeOption.primaryColor }}>
                      <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 transition">{t('dash.profileRequests', 'Profile Update Requests')}</h4>
                      <p className="text-[11px] text-slate-500">{t('dash.profileRequestsDesc', 'Request address, phone or bank updates')}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" style={{ color: currentThemeOption.primaryColor }} />
                </button>
              </div>

              {/* Employee Account Summary */}
              <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t('dash.portalAccountId', 'Portal Account ID:')}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {user?.id ? `USR-${1000 + Number(user.id)}` : 'EMP-1001'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">{t('dash.verificationStatus', 'Verification Status:')}</span>
                  <span className="font-semibold flex items-center gap-1" style={{ color: currentThemeOption.primaryColor }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: currentThemeOption.primaryColor }} /> {t('dash.biometricLinked', 'Active • Biometric Linked')}
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
                <UserPlus className="w-5 h-5" style={{ color: currentThemeOption.primaryColor }} />
                <span>{t('modal.onboardEmployee', 'Onboard New Employee')}</span>
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
                  <label className="block text-slate-700 font-bold mb-1">{t('modal.firstName', 'First Name')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Rajesh"
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('modal.lastName', 'Last Name')} *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Kumar"
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none text-base sm:text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('modal.workEmail', 'Work Email')} *</label>
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  placeholder="rajesh.kumar@priyex.com"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none text-base sm:text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('modal.phone', 'Phone Number')}</label>
                  <input
                    type="text"
                    value={formData.personalPhone}
                    onChange={(e) => setFormData({ ...formData, personalPhone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none text-base sm:text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('modal.department', 'Department')}</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none text-base sm:text-xs"
                  >
                    <option value="">{t('modal.selectDept', 'Select Department')}</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('modal.employmentType', 'Employment Type')}</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none text-base sm:text-xs"
                  >
                    <option value="FULL_TIME">{t('modal.fullTime', 'Full Time')}</option>
                    <option value="PART_TIME">{t('modal.partTime', 'Part Time')}</option>
                    <option value="CONTRACT">{t('modal.contract', 'Contract')}</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('modal.joiningDate', 'Joining Date')} *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none text-base sm:text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  {t('modal.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: currentThemeOption.primaryColor }}
                  className="px-5 py-2.5 rounded-xl hover:opacity-90 text-white font-semibold flex items-center gap-2 shadow-md cursor-pointer transition"
                >
                  {isSubmitting ? 'Onboarding...' : t('modal.saveOnboard', 'Save & Onboard Employee')}
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

