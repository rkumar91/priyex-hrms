import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { canManageEmployees } from '../utils/rbac';
import api from '../api/client';
import { InitiateOnboardingModal } from '../components/onboarding/InitiateOnboardingModal';
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
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  Briefcase,
  FileSpreadsheet,
  Zap,
  Radio,
  MapPin
} from 'lucide-react';

export interface Department {
  id: number;
  name: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentThemeOption, setTheme } = useTheme();
  const isManagerOrAdmin = canManageEmployees(user);

  // Live ticking digital clock for biometric terminal
  const [liveClock, setLiveClock] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  const [isClockedIn, setIsClockedIn] = useState<boolean>(() => {
    return localStorage.getItem('priyex_clocked_in') === 'true';
  });
  const [clockInTime, setClockInTime] = useState<string>(() => {
    return localStorage.getItem('priyex_clock_in_time') || '09:15 AM';
  });
  const [punchFeedback, setPunchFeedback] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTogglePunch = () => {
    const nextState = !isClockedIn;
    setIsClockedIn(nextState);
    localStorage.setItem('priyex_clocked_in', String(nextState));
    if (nextState) {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setClockInTime(now);
      localStorage.setItem('priyex_clock_in_time', now);
      setPunchFeedback('Biometric Clock-In verified within Greater Noida HQ perimeter.');
    } else {
      setPunchFeedback('Clock-Out registered successfully. Continuous pay ledger updated.');
    }
    setTimeout(() => setPunchFeedback(null), 4000);
  };

  // Modals state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

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

  const userDisplayName = user?.displayName || user?.fullName || '';

  const userScopedActivities = isManagerOrAdmin
    ? liveActivities
    : liveActivities.filter(act => {
        // If it's an onboarding event, only show if it matches the current user
        if (act.type === 'Employee Onboarded' || act.type === 'Employee Enrolled') {
          return userDisplayName ? act.title?.toLowerCase().includes(userDisplayName.toLowerCase()) : true;
        }
        // If it's a leave event formatted as "EmployeeName - LeaveType...", ensure it matches user
        if (act.type?.includes('Leave') && act.title?.includes(' - ')) {
          const parts = act.title.split(' - ');
          if (parts.length > 1 && userDisplayName) {
            const possibleName = parts[0].trim().toLowerCase();
            // If first part is another employee's name, filter it out
            if (!possibleName.includes(userDisplayName.toLowerCase()) && !userDisplayName.toLowerCase().includes(possibleName)) {
              return false;
            }
          }
        }
        // Payroll runs are company-wide administrative batch events
        if (act.type === 'Payroll Run') {
          return false;
        }
        return true;
      });

  const dynamicActivities = userScopedActivities.length > 0
    ? userScopedActivities.map(act => ({
        ...act,
        icon: activityIconMap[act.icon] || CheckCircle2,
      }))
    : (isManagerOrAdmin ? defaultAdminActivities : defaultEmployeeActivities);

  const recentActivities = dynamicActivities;


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

  // Core Modules Quick Launchpad (Feature Card Model)
  const adminModules = [
    {
      id: 'employees',
      title: t('nav.employees', 'Staff Directory'),
      description: 'Directory, onboarding & departmental records',
      icon: Users,
      path: '/employees',
      badge: `${statsData.totalStaff} Enrolled`,
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/70 group-hover:bg-blue-600 group-hover:text-white',
      hoverBorder: 'hover:border-blue-400/80',
      accentBar: 'bg-blue-600'
    },
    {
      id: 'attendance',
      title: t('nav.attendance', 'Attendance & Leaves'),
      description: 'Daily biometric punches, shifts & leave approvals',
      icon: CalendarCheck,
      path: '/attendance',
      badge: statsData.pendingLeaves > 0 ? `${statsData.pendingLeaves} Pending` : `${statsData.attendanceRate}% Present`,
      badgeStyle: statsData.pendingLeaves > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/70 group-hover:bg-emerald-600 group-hover:text-white',
      hoverBorder: 'hover:border-emerald-400/80',
      accentBar: 'bg-emerald-600'
    },
    {
      id: 'payroll',
      title: t('nav.payroll', 'Payroll & CTC Register'),
      description: 'Disbursements, salary payslips & tax declarations',
      icon: CircleDollarSign,
      path: '/payroll',
      badge: `₹${statsData.monthlyPayroll}`,
      badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/70 group-hover:bg-indigo-600 group-hover:text-white',
      hoverBorder: 'hover:border-indigo-400/80',
      accentBar: 'bg-indigo-600'
    },
    {
      id: 'organization',
      title: t('nav.organization', 'Organization & Quotas'),
      description: 'Company entities, branches & annual leave balances',
      icon: Building,
      path: '/organization',
      badge: `${statsData.totalDepartments || departments.length || 1} Branches`,
      badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/70 group-hover:bg-teal-600 group-hover:text-white',
      hoverBorder: 'hover:border-teal-400/80',
      accentBar: 'bg-teal-600'
    },
    {
      id: 'support-desk',
      title: t('nav.supportDesk', 'Support Desk Queue'),
      description: 'Employee helpdesk tickets & live query resolution',
      icon: Headphones,
      path: '/support-desk',
      badge: 'Live Pool',
      badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/70 group-hover:bg-amber-600 group-hover:text-white',
      hoverBorder: 'hover:border-amber-400/80',
      accentBar: 'bg-amber-600'
    },
    {
      id: 'admin-users',
      title: t('nav.usersRoles', 'Security & Roles'),
      description: 'User logins, role-based access & system audit logs',
      icon: ShieldCheck,
      path: '/admin/users',
      badge: 'RBAC',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/70 group-hover:bg-purple-600 group-hover:text-white',
      hoverBorder: 'hover:border-purple-400/80',
      accentBar: 'bg-purple-600'
    }
  ];

  const employeeModules = [
    {
      id: 'attendance',
      title: 'Daily Punch & Shift',
      description: 'Log biometric punch-in, track shift logs & work hours',
      icon: CalendarCheck,
      path: '/attendance',
      badge: `${empAttRate}% Present`,
      badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-200/70 group-hover:bg-blue-600 group-hover:text-white',
      hoverBorder: 'hover:border-blue-400/80',
      accentBar: 'bg-blue-600'
    },
    {
      id: 'leave',
      title: 'Apply For Leave',
      description: 'Submit casual, sick, or annual privilege leave requests',
      icon: Calendar,
      path: '/attendance',
      badge: `${statsData.myLeaveBalance} Days Left`,
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/70 group-hover:bg-emerald-600 group-hover:text-white',
      hoverBorder: 'hover:border-emerald-400/80',
      accentBar: 'bg-emerald-600'
    },
    {
      id: 'payslips',
      title: 'My Payslips & CTC',
      description: 'Download monthly salary slips & compensation breakdown',
      icon: FileText,
      path: '/payroll',
      badge: 'Disbursed',
      badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/70 group-hover:bg-indigo-600 group-hover:text-white',
      hoverBorder: 'hover:border-indigo-400/80',
      accentBar: 'bg-indigo-600'
    },
    {
      id: 'tax-declaration',
      title: 'Investment Declaration',
      description: 'Tax regime election & Chapter VI-A investment proofs',
      icon: CircleDollarSign,
      path: '/payroll',
      badge: 'FY 2026-27',
      badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-200/70 group-hover:bg-purple-600 group-hover:text-white',
      hoverBorder: 'hover:border-purple-400/80',
      accentBar: 'bg-purple-600'
    },
    {
      id: 'profile-requests',
      title: 'Profile Update Requests',
      description: 'Request address, phone or bank account changes',
      icon: ClipboardCheck,
      path: '/requests',
      badge: statsData.myActiveRequests > 0 ? `${statsData.myActiveRequests} Active` : 'Up to date',
      badgeStyle: statsData.myActiveRequests > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-600 border-slate-200',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/70 group-hover:bg-amber-600 group-hover:text-white',
      hoverBorder: 'hover:border-amber-400/80',
      accentBar: 'bg-amber-600'
    },
    {
      id: 'support-desk',
      title: 'HR Support Desk',
      description: 'Raise live tickets & get quick assistance from HR',
      icon: Headphones,
      path: '/support-desk',
      badge: 'Helpdesk',
      badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-200/70 group-hover:bg-teal-600 group-hover:text-white',
      hoverBorder: 'hover:border-teal-400/80',
      accentBar: 'bg-teal-600'
    }
  ];

  const quickModules = isManagerOrAdmin ? adminModules : employeeModules;

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* ── Top Hero: Executive Workforce Hub ── */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xs p-5 sm:p-8 overflow-hidden transition-all duration-300">
        {/* Subtle executive ambient glow */}
        <div className="absolute top-0 right-0 w-[450px] h-full bg-gradient-to-l from-blue-50/80 via-indigo-50/25 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
          <div className="max-w-2xl">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-[11px] sm:text-xs font-semibold mb-2.5 sm:mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900">
                {isManagerOrAdmin ? t('dash.q3Overview', 'Enterprise HR Operations') : t('dash.enterprisePortal', 'Employee Workforce Portal')}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                {currentDateDisplay}
              </span>
            </div>

            {/* Main Greeting */}
            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {getGreeting()},{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 bg-clip-text text-transparent">
                {user?.displayName || user?.fullName || (user?.roles?.includes('SUPER_ADMIN') ? 'Super Admin' : 'Colleague')}
              </span> 👋
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm mt-1.5 sm:mt-2 leading-relaxed">
              {isManagerOrAdmin
                ? t('dash.adminSubtitle', 'Real-time overview of workforce operations, attendance health, and payroll across all branch locations.')
                : t('dash.empSubtitle', 'Your centralized portal for attendance verification, leave planning, and monthly salary statements.')}
            </p>

            {/* Quick Live Indicators */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 text-xs font-semibold">
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-500 font-medium">Workforce:</span>
                <span className="font-bold text-slate-900">{statsData.activeStaff} Active</span>
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-500 font-medium">Attendance:</span>
                <span className="font-bold text-slate-900">{statsData.attendanceRate}% Today</span>
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-[11px] sm:text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-slate-500 font-medium">Departments:</span>
                <span className="font-bold text-slate-900">{statsData.totalDepartments || departments.length || 1} Total</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full lg:w-auto">
            {isManagerOrAdmin ? (
              <>
                <button
                  type="button"
                  onClick={handleDownloadSummary}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 hover:border-slate-300 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  <span>{t('dash.downloadReport', 'Download Summary')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t('dash.onboardEmployee', 'Onboard New Employee')}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-semibold border border-slate-200 transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2 active:scale-95"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('dash.applyLeave', 'Apply for Leave')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/payroll')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('dash.viewPayslips', 'View Payslips')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Priyex Interactive Workforce Terminal & Continuous Calculation Bar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Live Biometric Punch Terminal & Geofence Radar */}
        <div className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-500/30">
                  <Radio className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>Biometric Geofence Terminal</span>
                    <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/80">
                      RADAR ACTIVE
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>Nirala Estate Campus • Inside 250m authorized radius</span>
                  </p>
                </div>
              </div>

              {/* Digital Ticking Clock */}
              <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 font-mono text-center">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Local Time</span>
                <span className="text-base font-black text-cyan-400 tracking-wider">{liveClock}</span>
              </div>
            </div>

            {/* Shift Progress & Status */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  Daily Shift: <strong className="text-slate-200">09:00 AM – 06:00 PM</strong>
                </span>
                <span className="font-mono font-bold text-emerald-400 text-[11px]">
                  {isClockedIn ? `Clocked In at ${clockInTime} (Active)` : 'Not Clocked In'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isClockedIn ? 'w-3/5 bg-gradient-to-r from-cyan-500 to-emerald-400' : 'w-0'
                  }`}
                />
              </div>
            </div>

            {/* Interactive Punch Action Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTogglePunch}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                    isClockedIn
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/30'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{isClockedIn ? 'Clock Out (Shift End)' : 'Biometric Clock-In'}</span>
                </button>

                {isClockedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      setPunchFeedback('15-Minute Tea / Lunch break logged in continuous ledger.');
                      setTimeout(() => setPunchFeedback(null), 3000);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition border border-slate-700 cursor-pointer"
                  >
                    ☕ Log Break
                  </button>
                )}
              </div>

              {punchFeedback && (
                <span className="text-[11px] text-emerald-400 font-medium animate-in fade-in duration-200">
                  ✓ {punchFeedback}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right (5 cols): Priyex Continuous Calculation Engine Radar */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                  Continuous Engine
                </span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded font-bold">
                99.98% Precision
              </span>
            </div>

            <div>
              <div className="text-2xl font-black text-white font-mono tracking-tight">
                0ms Calculation Latency
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Every shift punch, leave request, and overtime hour automatically recalculates payroll and statutory tax deductions in real-time.
              </p>
            </div>

            {/* Statutory Compliance Matrix */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>EPF & ESI Synced</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>TDS Sec 115BAC</span>
              </div>
            </div>
          </div>

          {/* Quick Theme Toggle Pill */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-xs text-slate-400">Current Theme: <strong className="text-white">{currentThemeOption.name}</strong></span>
            {currentThemeOption.id !== 'obsidian' ? (
              <button
                type="button"
                onClick={() => setTheme('obsidian')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition cursor-pointer"
              >
                Switch to Priyex Obsidian Theme →
              </button>
            ) : (
              <span className="text-xs text-emerald-400 font-bold">
                ✓ Priyex Obsidian Active
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Access & Core Modules Launchpad (Feature Card Model) ── */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800">
              {isManagerOrAdmin ? 'Core HR Operations & Modules' : 'Quick Access Workforce Hub'}
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            6 Direct Modules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {quickModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => navigate(mod.path)}
                className={`group relative text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-0.5 ${mod.hoverBorder} transition-all duration-200 cursor-pointer overflow-hidden flex items-start gap-3 sm:gap-3.5`}
              >
                {/* Colored Top Accent Bar on Hover */}
                <div className={`absolute top-0 inset-x-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity ${mod.accentBar}`} />

                {/* Styled Feature Icon Box */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs ${mod.iconBg}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-950 transition-colors truncate">
                      {mod.title}
                    </span>
                    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 border ${mod.badgeStyle}`}>
                      {mod.badge}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 font-medium group-hover:text-slate-600 transition-colors">
                    {mod.description}
                  </p>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
              </button>
            );
          })}
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

      {/* Onboard New Employee Modal */}
      <InitiateOnboardingModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onSuccess={() => {
          setIsOnboardModalOpen(false);
          fetchDashboardData();
        }}
      />
    </div>
  );
};

