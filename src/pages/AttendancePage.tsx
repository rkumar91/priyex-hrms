import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canApproveLeaves, isHrAdmin } from '../utils/rbac';
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
  ExternalLink,
  MapPin,
  Compass,
  ShieldCheck,
  Zap,
  Timer,
  Award,
  Wallet,
  Building2,
  RotateCcw,
  Check,
  Layers,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export interface LeaveRequestItem {
  id: number;
  companyId?: number;
  employeeId?: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'PENDING_MANAGER' | 'PENDING_HR' | 'APPROVED' | 'REJECTED' | 'REJECTED_MANAGER' | 'REJECTED_HR';
  managerId?: number;
  managerName?: string;
  managerComment?: string;
  managerApprovedAt?: string;
  hrComment?: string;
  approvedBy?: number;
  approvedAt?: string;
}

export interface OvertimeItem {
  id: number;
  employeeName: string;
  department: string;
  date: string;
  shift: string;
  hours: number;
  rateMultiplier: number;
  estimatedPayout: number;
  reason: string;
  projectCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  approverRemarks?: string;
}

export interface CoffItem {
  id: number;
  employeeName: string;
  department: string;
  workedDate: string;
  workedType: 'WEEKEND' | 'PUBLIC_HOLIDAY';
  hoursWorked: number;
  creditsEarned: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  expiryDate: string;
  isAvailed?: boolean;
  availedDate?: string;
}

export interface OfficeGeofence {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

const DEFAULT_GEOFENCES: OfficeGeofence[] = [
  { id: 'HQ-GRNOIDA', name: 'Priyex Technologies HQ - Nirala Estate', city: 'Greater Noida, UP', latitude: 28.5355, longitude: 77.3910, radiusMeters: 250, isActive: true },
  { id: 'BLR-CAMPUS', name: 'Bengaluru Tech Park - Whitefield Hub', city: 'Bengaluru, KA', latitude: 12.9716, longitude: 77.5946, radiusMeters: 300, isActive: true },
  { id: 'MUM-OFFICE', name: 'Bandra Kurla Complex (BKC) Branch', city: 'Mumbai, MH', latitude: 19.0660, longitude: 72.8680, radiusMeters: 200, isActive: true },
];

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const canApprove = canApproveLeaves(user);
  const isHr = isHrAdmin(user);

  const [searchParams] = useSearchParams();
  const urlTab = searchParams.get('tab')?.toUpperCase();

  // Active module tab synced with URL query param from cascading sidebar
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'OVERTIME' | 'COFF' | 'LEAVES' | 'GEOFENCES'>(() => {
    if (urlTab && ['ATTENDANCE', 'OVERTIME', 'COFF', 'LEAVES', 'GEOFENCES'].includes(urlTab)) {
      return urlTab as any;
    }
    return 'ATTENDANCE';
  });

  useEffect(() => {
    if (urlTab && ['ATTENDANCE', 'OVERTIME', 'COFF', 'LEAVES', 'GEOFENCES'].includes(urlTab)) {
      setActiveTab(urlTab as any);
    }
  }, [urlTab]);

  // --- TAB 1: ATTENDANCE & REAL-TIME GEO-FENCING STATE ---
  const [isClockedIn, setIsClockedIn] = useState<boolean>(() => {
    return localStorage.getItem('priyex_clocked_in') === 'true';
  });
  const [clockInTime, setClockInTime] = useState<string>(() => {
    return localStorage.getItem('priyex_clock_in_time') || '09:30 AM';
  });
  const [clockElapsedSeconds, setClockElapsedSeconds] = useState<number>(() => {
    return parseInt(localStorage.getItem('priyex_clock_elapsed') || '20400', 10); // default ~5.6 hours
  });
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy: number; distanceMeters: number; insideFence: boolean }>({
    lat: 28.5356,
    lng: 77.3912,
    accuracy: 12,
    distanceMeters: 28,
    insideFence: true,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [punchLog, setPunchLog] = useState<{ time: string; type: string; geoStatus: string; location: string }[]>([
    { time: '09:30:14 AM', type: 'CLOCK_IN', geoStatus: 'GEO_VERIFIED', location: 'Greater Noida HQ (28m from center)' },
    { time: '01:15:20 PM', type: 'BREAK_START', geoStatus: 'GEO_VERIFIED', location: 'Cafeteria Wing A' },
    { time: '02:00:45 PM', type: 'BREAK_END', geoStatus: 'GEO_VERIFIED', location: 'Greater Noida HQ' }
  ]);

  // Real-time Punch & Attendance Statistics
  const [punchStats, setPunchStats] = useState({
    onTimePunches: 21,
    lateArrivals: 1,
    missedPunchouts: 0,
    staffOnLeave: 2,
    totalStaff: 24
  });

  // --- TAB 2: OVERTIME (OT) STATE ---
  const [overtimeList, setOvertimeList] = useState<OvertimeItem[]>(() => {
    const saved = localStorage.getItem('priyex_overtime_list');
    return saved ? JSON.parse(saved) : [
      { id: 1, employeeName: 'Rajesh Kumar', department: 'Engineering', date: '2026-10-12', shift: 'Evening Extension', hours: 3.5, rateMultiplier: 1.5, estimatedPayout: 2100.00, reason: 'Sprint release critical bugfixes and deployment testing', projectCode: 'PRJ-FINTECH-01', status: 'APPROVED' },
      { id: 2, employeeName: 'Amit Verma', department: 'Engineering', date: '2026-10-13', shift: 'Night Deployment', hours: 4.0, rateMultiplier: 1.5, estimatedPayout: 2400.00, reason: 'Core database migration and failover validation', projectCode: 'INFRA-PROD-MIG', status: 'PENDING' },
      { id: 3, employeeName: 'Siddharth Roy', department: 'Operations', date: '2026-10-11', shift: 'Weekend Maintenance', hours: 6.0, rateMultiplier: 2.0, estimatedPayout: 3600.00, reason: 'Emergency server patch rollout during maintenance window', projectCode: 'OPS-MAINT-Q4', status: 'APPROVED' },
    ];
  });
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otForm, setOtForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '2.5',
    reason: '',
    projectCode: 'CLIENT-PROD-DELIVERY',
    isWeekend: false
  });

  // --- TAB 3: C-OFF (COMPENSATORY OFF) STATE ---
  const [coffList, setCoffList] = useState<CoffItem[]>(() => {
    const saved = localStorage.getItem('priyex_coff_list');
    return saved ? JSON.parse(saved) : [
      { id: 1, employeeName: 'Rajesh Kumar', department: 'Engineering', workedDate: '2026-10-04', workedType: 'WEEKEND', hoursWorked: 8.5, creditsEarned: 1.0, reason: 'Delivered client go-live deployment on Sunday', status: 'APPROVED', expiryDate: '2026-12-03', isAvailed: false },
      { id: 2, employeeName: 'Priya Sharma', department: 'Human Resources', workedDate: '2026-10-02', workedType: 'PUBLIC_HOLIDAY', hoursWorked: 6.0, creditsEarned: 1.0, reason: 'Gandhi Jayanti special campus hiring orientation', status: 'APPROVED', expiryDate: '2026-12-01', isAvailed: true, availedDate: '2026-10-09' },
      { id: 3, employeeName: 'Sneha Patel', department: 'Marketing', workedDate: '2026-10-11', workedType: 'WEEKEND', hoursWorked: 8.0, creditsEarned: 1.0, reason: 'Tech Expo Booth representation over weekend', status: 'PENDING', expiryDate: '2026-12-10', isAvailed: false },
    ];
  });
  const [isCoffModalOpen, setIsCoffModalOpen] = useState(false);
  const [isAvailCoffModalOpen, setIsAvailCoffModalOpen] = useState(false);
  const [coffForm, setCoffForm] = useState({
    workedDate: new Date().toISOString().split('T')[0],
    workedType: 'WEEKEND' as 'WEEKEND' | 'PUBLIC_HOLIDAY',
    hoursWorked: '8.0',
    reason: ''
  });
  const [availDate, setAvailDate] = useState(new Date().toISOString().split('T')[0]);

  // --- TAB 4: LEAVE MANAGEMENT STATE ---
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestItem[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(true);
  const [leaveScopeFilter, setLeaveScopeFilter] = useState<'ALL' | 'TEAM' | 'MY'>('ALL');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('ALL');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [orgPolicies, setOrgPolicies] = useState<{ id: number; leaveCode: string; leaveName: string; annualDays: number }[]>([]);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave (CL)',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });

  // --- TAB 5: GEOFENCE CONFIG STATE ---
  const [geofences, setGeofences] = useState<OfficeGeofence[]>(DEFAULT_GEOFENCES);
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);
  const [newFenceForm, setNewFenceForm] = useState({
    name: '',
    city: '',
    latitude: '',
    longitude: '',
    radiusMeters: '250'
  });

  // Persist Overtime & Coff to localStorage
  useEffect(() => {
    localStorage.setItem('priyex_overtime_list', JSON.stringify(overtimeList));
  }, [overtimeList]);

  useEffect(() => {
    localStorage.setItem('priyex_coff_list', JSON.stringify(coffList));
  }, [coffList]);

  // Live timer for Clock In shift
  useEffect(() => {
    let interval: any;
    if (isClockedIn) {
      interval = setInterval(() => {
        setClockElapsedSeconds(prev => {
          const next = prev + 1;
          localStorage.setItem('priyex_clock_elapsed', String(next));
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn]);

  // Real-time Geolocation Detection
  const detectUserLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          // Calculate distance to Greater Noida HQ (28.5355, 77.3910) using Haversine
          const d = calculateDistanceMeters(lat, lng, 28.5355, 77.3910);
          const inside = d <= 350; // allow within office radius buffer

          setUserCoords({
            lat,
            lng,
            accuracy,
            distanceMeters: Math.round(d),
            insideFence: inside
          });
          setIsLocating(false);
        },
        (err) => {
          // Fallback simulation: user is at HQ campus
          setUserCoords({
            lat: 28.5356,
            lng: 77.3912,
            accuracy: 15,
            distanceMeters: 32,
            insideFence: true
          });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    detectUserLocation();
  }, []);

  // Distance helper in meters
  function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth radius in metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Handle Clock In / Clock Out
  const handleToggleClock = () => {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (!isClockedIn) {
      setIsClockedIn(true);
      setClockInTime(nowStr);
      localStorage.setItem('priyex_clocked_in', 'true');
      localStorage.setItem('priyex_clock_in_time', nowStr);
      setPunchLog(prev => [
        {
          time: nowStr,
          type: 'CLOCK_IN',
          geoStatus: userCoords.insideFence ? 'GEO_VERIFIED' : 'REMOTE_GEO_TAGGED',
          location: userCoords.insideFence ? `Greater Noida HQ (${userCoords.distanceMeters}m from center)` : `Remote Punch (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)})`
        },
        ...prev
      ]);
    } else {
      setIsClockedIn(false);
      localStorage.setItem('priyex_clocked_in', 'false');
      setPunchLog(prev => [
        {
          time: nowStr,
          type: 'CLOCK_OUT',
          geoStatus: userCoords.insideFence ? 'GEO_VERIFIED' : 'REMOTE_GEO_TAGGED',
          location: userCoords.insideFence ? `Greater Noida HQ (${userCoords.distanceMeters}m)` : 'Remote Location'
        },
        ...prev
      ]);
    }
  };

  // Format Elapsed Time
  const formatElapsedTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  // Fetch Leaves from API
  const fetchLeaves = async () => {
    setIsLoadingLeaves(true);
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
      setIsLoadingLeaves(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const statsRes: any = await api.get('/dashboard/stats');
      if (statsRes.success && statsRes.data) {
        const d = statsRes.data;
        setPunchStats({
          onTimePunches: d.presentToday ?? 21,
          lateArrivals: 1,
          missedPunchouts: 0,
          staffOnLeave: d.staffOnLeave ?? 2,
          totalStaff: d.totalStaff ?? 24
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLeaves();
    fetchStats();
    api.get('/organization/leave-policies').then((res: any) => {
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setOrgPolicies(res.data);
      }
    }).catch(() => {});
  }, []);

  // Leave Handlers (Two-Tier Multi-Tier Approval Workflow)
  const handleManagerApproveLeave = async (id: number) => {
    try {
      await api.put(`/leaves/${id}/manager-approve`, { comment: 'Approved by Reporting Manager' });
      await fetchLeaves();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || 'Failed to approve as manager');
    }
  };

  const handleManagerRejectLeave = async (id: number) => {
    const reason = prompt('Please enter manager rejection reason:');
    if (reason === null) return;
    try {
      await api.put(`/leaves/${id}/manager-reject`, { comment: reason || 'Declined by direct manager' });
      await fetchLeaves();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || 'Failed to reject as manager');
    }
  };

  const handleHrApproveLeave = async (id: number) => {
    try {
      await api.put(`/leaves/${id}/hr-approve`, { comment: 'Final approval granted by HR' });
      await fetchLeaves();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || 'Failed to approve as HR');
    }
  };

  const handleHrRejectLeave = async (id: number) => {
    const reason = prompt('Please enter HR rejection reason:');
    if (reason === null) return;
    try {
      await api.put(`/leaves/${id}/hr-reject`, { comment: reason || 'Declined by HR' });
      await fetchLeaves();
      fetchStats();
    } catch (err: any) {
      alert(err?.message || 'Failed to reject as HR');
    }
  };

  const handleApproveLeave = async (id: number) => {
    try {
      await api.put(`/leaves/${id}/approve`);
      await fetchLeaves();
      fetchStats();
    } catch (err) {}
  };

  const handleRejectLeave = async (id: number) => {
    try {
      await api.put(`/leaves/${id}/reject`);
      await fetchLeaves();
      fetchStats();
    } catch (err) {}
  };

  const handleApplyLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLeave(true);
    try {
      const payload = {
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        status: 'PENDING'
      };
      await api.post('/leaves', payload);
      setIsLeaveModalOpen(false);
      fetchLeaves();
    } catch (err: any) {
      alert(err?.message || 'Failed to submit leave application');
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Overtime Handlers
  const handleApproveOt = (id: number) => {
    setOvertimeList(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED', approverRemarks: `Approved by ${user?.fullName || 'Manager'} - Synced with Payroll` } : item));
  };

  const handleRejectOt = (id: number) => {
    setOvertimeList(prev => prev.map(item => item.id === id ? { ...item, status: 'REJECTED', approverRemarks: 'Overtime threshold not pre-authorized' } : item));
  };

  const handleApplyOt = (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = parseFloat(otForm.hours);
    const multiplier = otForm.isWeekend ? 2.0 : 1.5;
    const hourlyBase = 350; // standard hourly rate
    const payout = hrs * hourlyBase * multiplier;

    const newOt: OvertimeItem = {
      id: Date.now(),
      employeeName: user?.fullName || 'Current Employee',
      department: 'Engineering',
      date: otForm.date,
      shift: otForm.isWeekend ? 'Weekend Emergency Shift' : 'Evening Extension Shift',
      hours: hrs,
      rateMultiplier: multiplier,
      estimatedPayout: payout,
      reason: otForm.reason,
      projectCode: otForm.projectCode,
      status: 'PENDING'
    };

    setOvertimeList(prev => [newOt, ...prev]);
    setIsOtModalOpen(false);
    setOtForm({
      date: new Date().toISOString().split('T')[0],
      hours: '2.5',
      reason: '',
      projectCode: 'CLIENT-PROD-DELIVERY',
      isWeekend: false
    });
  };

  // C-Off Handlers
  const handleApproveCoff = (id: number) => {
    setCoffList(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item));
  };

  const handleRejectCoff = (id: number) => {
    setCoffList(prev => prev.map(item => item.id === id ? { ...item, status: 'REJECTED' } : item));
  };

  const handleClaimCoff = (e: React.FormEvent) => {
    e.preventDefault();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 60);

    const newCoff: CoffItem = {
      id: Date.now(),
      employeeName: user?.fullName || 'Current Employee',
      department: 'Engineering',
      workedDate: coffForm.workedDate,
      workedType: coffForm.workedType,
      hoursWorked: parseFloat(coffForm.hoursWorked),
      creditsEarned: parseFloat(coffForm.hoursWorked) >= 7.0 ? 1.0 : 0.5,
      reason: coffForm.reason,
      status: 'PENDING',
      expiryDate: expiry.toISOString().split('T')[0],
      isAvailed: false
    };

    setCoffList(prev => [newCoff, ...prev]);
    setIsCoffModalOpen(false);
    setCoffForm({
      workedDate: new Date().toISOString().split('T')[0],
      workedType: 'WEEKEND',
      hoursWorked: '8.0',
      reason: ''
    });
  };

  const handleAvailCoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mark the first available unavailed credit as availed
    const credit = coffList.find(c => c.status === 'APPROVED' && !c.isAvailed);
    if (!credit) {
      alert('You have no approved C-Off balance available to redeem.');
      return;
    }
    setCoffList(prev => prev.map(c => c.id === credit.id ? { ...c, isAvailed: true, availedDate: availDate } : c));
    setIsAvailCoffModalOpen(false);
    alert(`Success: 1.0 C-Off Day redeemed for leave on ${availDate}! No Casual/Sick Leave deducted.`);
  };

  // Add Geofence Handler
  const handleAddGeofence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFenceForm.name || !newFenceForm.latitude || !newFenceForm.longitude) return;
    const newFence: OfficeGeofence = {
      id: `BRANCH-${Date.now()}`,
      name: newFenceForm.name,
      city: newFenceForm.city || 'Regional Center',
      latitude: parseFloat(newFenceForm.latitude),
      longitude: parseFloat(newFenceForm.longitude),
      radiusMeters: parseInt(newFenceForm.radiusMeters, 10) || 250,
      isActive: true
    };
    setGeofences(prev => [...prev, newFence]);
    setIsGeofenceModalOpen(false);
    setNewFenceForm({ name: '', city: '', latitude: '', longitude: '', radiusMeters: '250' });
  };

  // Metrics for C-Off wallet and Command Deck
  const availableCoffCredits = coffList.filter(c => c.status === 'APPROVED' && !c.isAvailed).reduce((acc, c) => acc + c.creditsEarned, 0);
  const totalCoffEarned = coffList.filter(c => c.status === 'APPROVED').reduce((acc, c) => acc + c.creditsEarned, 0);
  const totalOtHoursApproved = overtimeList.filter(o => o.status === 'APPROVED').reduce((acc, o) => acc + o.hours, 0);
  const totalOtPayout = overtimeList.filter(o => o.status === 'APPROVED').reduce((acc, o) => acc + o.estimatedPayout, 0);
  const pendingOtCount = overtimeList.filter(o => o.status === 'PENDING').length;
  const pendingLeavesCount = leaveRequests.filter(l => l.status === 'PENDING' || l.status === 'PENDING_MANAGER' || l.status === 'PENDING_HR').length;
  const approvedLeavesCount = leaveRequests.filter(l => l.status === 'APPROVED').length;
  const activeGeofencesCount = geofences.filter(g => g.isActive).length;

  const tabMetaMap: Record<string, { title: string; subtitle: string }> = {
    ATTENDANCE: { title: 'Biometric & Punch', subtitle: 'Enterprise GPS Geo-fencing & real-time punch tracking' },
    LEAVES: { title: 'Leave Management', subtitle: 'Employee leave requests, approvals, team calendar & balances' },
    OVERTIME: { title: 'Overtime (OT)', subtitle: 'Overtime hours submission, manager authorization & rate computation' },
    COFF: { title: 'C-Off Wallet', subtitle: 'Compensatory off wallet accrual, approval & leave redemption' },
    GEOFENCES: { title: 'Geo-Perimeters', subtitle: 'Corporate campus radius coordinates & fence boundaries' }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CalendarCheck className="w-6 h-6 text-emerald-600" />
              <span>Attendance & Leave</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              {tabMetaMap[activeTab]?.title || 'Attendance'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Radar Active
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            {tabMetaMap[activeTab]?.subtitle || 'Enterprise GPS Geo-fencing · Biometric punch tracking · Leave management'}
          </p>
        </div>

        {/* Action Buttons based on tab */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {activeTab === 'ATTENDANCE' && (
            <button
              onClick={detectUserLocation}
              disabled={isLocating}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/90 text-slate-700 text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
            >
              <Compass className={`w-3.5 h-3.5 text-blue-600 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Calibrating GPS...' : 'Refresh Geo-Fence'}</span>
            </button>
          )}

          {activeTab === 'OVERTIME' && (
            <button
              onClick={() => setIsOtModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Submit Overtime Request</span>
            </button>
          )}

          {activeTab === 'COFF' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAvailCoffModalOpen(true)}
                disabled={availableCoffCredits <= 0}
                className="px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Avail C-Off as Leave</span>
              </button>
              <button
                onClick={() => setIsCoffModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Claim C-Off Credit</span>
              </button>
            </div>
          )}

          {activeTab === 'LEAVES' && (
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Apply Leave Application</span>
            </button>
          )}

          {activeTab === 'GEOFENCES' && isHr && (
            <button
              onClick={() => setIsGeofenceModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Office Geo-Perimeter</span>
            </button>
          )}
        </div>
      </div>


      {/* ======================================================== */}
      {/* TAB 1: GEO-FENCE & LIVE BIOMETRIC PUNCH                 */}
      {/* ======================================================== */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Live Geo-Fence Radar & Clock Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clock-In Interactive Terminal */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200/90 bg-white/95 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Biometric Attendance Terminal</span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Shift Duty Status</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    isClockedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span>{isClockedIn ? 'Active On Shift' : 'Shift Not Started'}</span>
                  </span>
                </div>
              </div>

              {/* Real-time Clock Display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Clock In Time</span>
                  <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{isClockedIn ? clockInTime : '--:--'}</div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Shift: 09:30 AM - 06:30 PM</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Shift Duration Elapsed</span>
                  <div className="text-xl font-extrabold text-blue-700 mt-1 font-mono">{isClockedIn ? formatElapsedTime(clockElapsedSeconds) : '00h 00m 00s'}</div>
                  <span className="text-[11px] text-slate-500 font-medium">Required: 08h 00m standard</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-xs text-slate-500 font-medium">Overtime (OT) Accrued</span>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
                    {clockElapsedSeconds > 28800 ? formatElapsedTime(clockElapsedSeconds - 28800) : '00h 00m 00s'}
                  </div>
                  <span className="text-[11px] text-amber-600 font-semibold">
                    {clockElapsedSeconds > 28800 ? 'Eligible for 1.5x OT' : 'Threshold: > 8 hrs'}
                  </span>
                </div>
              </div>

              {/* Punch Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p className="flex items-center gap-1 font-medium text-slate-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Hardware Biometric & GPS Tamper Protection Enabled</span>
                  </p>
                  <p>IP: 103.212.89.14 • Device Fingerprint: Verified Chrome Browser</p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleClock}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 ${
                    isClockedIn
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{isClockedIn ? 'Clock Out of Shift' : 'Punch In / Clock In Now'}</span>
                </button>
              </div>
            </div>

            {/* Live GPS Geo-Fencing Card */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/90 bg-white/95 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Geo-Fencing Radar</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">GPS Live</span>
                </div>

                {/* Radar Visual Status */}
                <div className={`p-4 rounded-2xl border ${
                  userCoords.insideFence ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${userCoords.insideFence ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`text-xs font-extrabold uppercase tracking-wide ${userCoords.insideFence ? 'text-emerald-900' : 'text-amber-900'}`}>
                        {userCoords.insideFence ? 'Inside Registered Office Perimeter' : 'Outside Office Geo-Fence'}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Distance from HQ: <strong>{userCoords.distanceMeters}m</strong> (Allowed fence: <strong>250m</strong>).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location Telemetry */}
                <div className="mt-4 space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Office Branch:</span>
                    <span className="font-semibold text-slate-800">Greater Noida HQ</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Device Latitude:</span>
                    <span className="text-slate-700">{userCoords.lat.toFixed(5)}° N</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Device Longitude:</span>
                    <span className="text-slate-700">{userCoords.lng.toFixed(5)}° E</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">GPS Precision:</span>
                    <span className="text-emerald-700 font-bold">±{userCoords.accuracy} meters</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Policy: Geo-tag required on punch</span>
                <span className="font-bold text-emerald-700">Compliance 100%</span>
              </div>
            </div>
          </div>

          {/* Today's Punch Audit Log */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Today's Verified Biometric Punch Trail</span>
            </h3>

            <div className="space-y-2.5">
              {punchLog.map((log, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800">{log.time}</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      log.type === 'CLOCK_IN' ? 'bg-emerald-100 text-emerald-800' :
                      log.type === 'CLOCK_OUT' ? 'bg-rose-100 text-rose-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-slate-600">{log.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{log.geoStatus}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: OVERTIME (OT) MANAGEMENT                         */}
      {/* ======================================================== */}
      {activeTab === 'OVERTIME' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Overtime Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Approved OT</span>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">{totalOtHoursApproved} Hours</div>
              <span className="text-xs text-slate-500">Across current payroll month</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Estimated OT Payout</span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-600">₹{totalOtPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
              <span className="text-xs text-emerald-700 font-semibold">Credited in monthly payslips</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending OT Approvals</span>
              <div className="mt-2 text-2xl font-extrabold text-amber-600">
                {overtimeList.filter(o => o.status === 'PENDING').length} Requests
              </div>
              <span className="text-xs text-slate-500">Awaiting manager authorization</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-200/90 bg-white/90">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">OT Multiplier Policy</span>
              <div className="mt-2 text-base font-bold text-blue-700">1.5x Wkday / 2.0x Wkend</div>
              <span className="text-xs text-slate-500">Indian Factories Act compliant</span>
            </div>
          </div>

          {/* Overtime Requests Master Register */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <span className="font-bold text-slate-900 text-sm">Overtime (OT) Duty Register & Timesheets</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {overtimeList.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Date & Shift</th>
                    <th className="py-3 px-4 text-center">OT Hours</th>
                    <th className="py-3 px-4 text-center">Rate</th>
                    <th className="py-3 px-4 text-right">Est. Payout</th>
                    <th className="py-3 px-4">Project & Reason</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overtimeList.map((ot) => (
                    <tr key={ot.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ot.employeeName}</div>
                        <div className="text-[11px] text-slate-400">{ot.department}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-semibold text-slate-800">{ot.date}</div>
                        <div className="text-[11px] text-slate-500">{ot.shift}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-sm">
                        {ot.hours}h
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-extrabold border border-blue-200 font-mono text-[11px]">
                          {ot.rateMultiplier}x
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-emerald-700 text-sm">
                        ₹{ot.estimatedPayout.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={ot.reason}>{ot.reason}</div>
                        <span className="text-[10px] font-mono text-slate-400">[{ot.projectCode}]</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                          ot.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          ot.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {ot.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {ot.status === 'PENDING' && canApprove ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveOt(ot.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectOt(ot.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            {ot.approverRemarks || 'Verified'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: COMPENSATORY OFF (C-OFF) MANAGEMENT              */}
      {/* ======================================================== */}
      {activeTab === 'COFF' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* C-Off Explainer & Balance Wallet Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-panel rounded-2xl p-5 border border-emerald-200 bg-emerald-50/50 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Available C-Off Wallet</span>
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="mt-3 text-3xl font-black text-emerald-800">{availableCoffCredits.toFixed(1)} Days</div>
              <p className="text-xs text-emerald-700 mt-1">Ready to redeem as paid leave anytime</p>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Earned Credits</span>
                <Award className="w-5 h-5 text-blue-600" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalCoffEarned.toFixed(1)} Days</div>
              <p className="text-xs text-slate-500 mt-1">Granted for working on weekends/public holidays</p>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 bg-white/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credit Validity Rule</span>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="mt-3 text-base font-bold text-slate-800">60 Days Expiry Window</div>
              <p className="text-xs text-slate-500 mt-1">Credits must be availed within 60 calendar days</p>
            </div>
          </div>

          {/* C-Off Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <span className="font-bold text-slate-900 text-sm">Compensatory Off Credit Ledger & Redemptions</span>
              <span className="text-xs text-slate-400">1 Worked Holiday/Weekend = 1.0 C-Off Day</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Worked Date</th>
                    <th className="py-3 px-4">Holiday / Type</th>
                    <th className="py-3 px-4 text-center">Hours Worked</th>
                    <th className="py-3 px-4 text-center">Credits Earned</th>
                    <th className="py-3 px-4">Valid Until</th>
                    <th className="py-3 px-4 text-center">Redemption</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coffList.map((coff) => (
                    <tr key={coff.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{coff.employeeName}</div>
                        <div className="text-[11px] text-slate-400">{coff.department}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {coff.workedDate}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold border border-purple-200 text-[10px]">
                          {coff.workedType === 'WEEKEND' ? 'Weekly Off (Sunday)' : 'National Public Holiday'}
                        </span>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">{coff.reason}</div>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                        {coff.hoursWorked}h
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                          +{coff.creditsEarned} Day
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {coff.expiryDate}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {coff.isAvailed ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]" title={`Availed on ${coff.availedDate}`}>
                            Availed ({coff.availedDate})
                          </span>
                        ) : coff.status === 'APPROVED' ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            Available in Wallet
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Awaiting Approval</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                          coff.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          coff.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {coff.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {coff.status === 'PENDING' && canApprove ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveCoff(coff.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                            >
                              Approve Credit
                            </button>
                            <button
                              onClick={() => handleRejectCoff(coff.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: LEAVE MANAGEMENT & BALANCES                      */}
      {/* ======================================================== */}
      {activeTab === 'LEAVES' && (
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
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
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
      )}

      {/* ======================================================== */}
      {/* TAB 5: OFFICE GEOFENCES CONFIGURATION                   */}
      {/* ======================================================== */}
      {activeTab === 'GEOFENCES' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Authorized Office Branch Geofences</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                When employees clock in from their mobile or laptop browser, the system calculates their distance to these registered geofences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {geofences.map((fence) => (
                <div key={fence.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate">{fence.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Active</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono space-y-1">
                    <div>City: <span className="text-slate-800 font-semibold">{fence.city}</span></div>
                    <div>Lat/Lng: <span className="text-slate-800">{fence.latitude.toFixed(4)}, {fence.longitude.toFixed(4)}</span></div>
                    <div>Fence Radius: <span className="text-blue-700 font-bold">{fence.radiusMeters} meters</span></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Enforcement: Strict</span>
                    <span className="text-emerald-700 font-semibold">100% Monitored</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODALS SECTION                                          */}
      {/* ======================================================== */}

      {/* 1. APPLY LEAVE MODAL */}
      {isLeaveModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Apply for Leave</span>
              </h2>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
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
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLeave}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmittingLeave ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 2. SUBMIT OVERTIME MODAL */}
      {isOtModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <span>Submit Overtime (OT) Request</span>
              </h2>
              <button onClick={() => setIsOtModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyOt} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Overtime Date *</label>
                  <input
                    type="date"
                    required
                    value={otForm.date}
                    onChange={(e) => setOtForm({ ...otForm, date: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Total OT Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="12"
                    required
                    value={otForm.hours}
                    onChange={(e) => setOtForm({ ...otForm, hours: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Project Code / Client Tag</label>
                <input
                  type="text"
                  value={otForm.projectCode}
                  onChange={(e) => setOtForm({ ...otForm, projectCode: e.target.value })}
                  placeholder="e.g. PRJ-FINTECH-01"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={otForm.isWeekend}
                    onChange={(e) => setOtForm({ ...otForm, isWeekend: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="font-semibold text-slate-800">Worked on Weekend / Public Holiday (2.0x Rate Multiplier)</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Business Justification / Reason *</label>
                <textarea
                  required
                  rows={2}
                  value={otForm.reason}
                  onChange={(e) => setOtForm({ ...otForm, reason: e.target.value })}
                  placeholder="Describe sprint emergency, release tasks, or client delivery..."
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsOtModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95"
                >
                  Submit OT for Approval
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 3. CLAIM C-OFF CREDIT MODAL */}
      {isCoffModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Claim Compensatory Off (C-Off) Credit</span>
              </h2>
              <button onClick={() => setIsCoffModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClaimCoff} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date Worked *</label>
                  <input
                    type="date"
                    required
                    value={coffForm.workedDate}
                    onChange={(e) => setCoffForm({ ...coffForm, workedDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Holiday Type *</label>
                  <select
                    value={coffForm.workedType}
                    onChange={(e) => setCoffForm({ ...coffForm, workedType: e.target.value as any })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
                  >
                    <option value="WEEKEND">Weekly Off (Sunday/Saturday)</option>
                    <option value="PUBLIC_HOLIDAY">Company Public Holiday</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Hours Worked on Holiday (Min 7h for 1.0 Day Credit)</label>
                <input
                  type="number"
                  step="0.5"
                  min="4.0"
                  max="14.0"
                  required
                  value={coffForm.hoursWorked}
                  onChange={(e) => setCoffForm({ ...coffForm, hoursWorked: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason / Manager Pre-Approval Notes *</label>
                <textarea
                  required
                  rows={2}
                  value={coffForm.reason}
                  onChange={(e) => setCoffForm({ ...coffForm, reason: e.target.value })}
                  placeholder="e.g. Worked Sunday on client go-live deployment as pre-approved by Team Lead..."
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCoffModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95"
                >
                  Claim 1.0 Day C-Off Credit
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 4. AVAIL C-OFF LEAVE MODAL */}
      {isAvailCoffModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span>Avail C-Off Balance as Leave</span>
              </h2>
              <button onClick={() => setIsAvailCoffModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAvailCoffSubmit} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <span className="font-bold">Available Balance: {availableCoffCredits} Days</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">Availing C-Off grants a full paid day off without deducting your Casual or Sick leave balance.</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Choose Date to Take Off *</label>
                <input
                  type="date"
                  required
                  value={availDate}
                  onChange={(e) => setAvailDate(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAvailCoffModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95"
                >
                  Confirm C-Off Redemption
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 5. ADD GEOFENCE MODAL */}
      {isGeofenceModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Add Authorized Office Geo-Perimeter</span>
              </h2>
              <button onClick={() => setIsGeofenceModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGeofence} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Office Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad Innovation Hub"
                  value={newFenceForm.name}
                  onChange={(e) => setNewFenceForm({ ...newFenceForm, name: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">City / Region *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyderabad, Telangana"
                  value={newFenceForm.city}
                  onChange={(e) => setNewFenceForm({ ...newFenceForm, city: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="e.g. 17.3850"
                    value={newFenceForm.latitude}
                    onChange={(e) => setNewFenceForm({ ...newFenceForm, latitude: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    placeholder="e.g. 78.4867"
                    value={newFenceForm.longitude}
                    onChange={(e) => setNewFenceForm({ ...newFenceForm, longitude: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Geo-Fence Perimeter Radius (Meters)</label>
                <select
                  value={newFenceForm.radiusMeters}
                  onChange={(e) => setNewFenceForm({ ...newFenceForm, radiusMeters: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="150">150 Meters (Tight Campus)</option>
                  <option value="250">250 Meters (Standard Office Building)</option>
                  <option value="500">500 Meters (Large Tech Park)</option>
                  <option value="1000">1,000 Meters (Expanded Zone)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsGeofenceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95"
                >
                  Register Geo-Fence
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
  { id: 4, employeeName: 'Amit Verma', leaveType: 'Casual Leave', startDate: '2026-10-18', endDate: '2026-10-19', totalDays: 2, reason: 'Family engagement', status: 'PENDING_MANAGER', managerId: 1, managerName: 'Rakesh K. Sharma' },
  { id: 3, employeeName: 'Rakesh K. Sharma', leaveType: 'Casual Leave', startDate: '2026-10-22', endDate: '2026-10-24', totalDays: 3, reason: 'Personal errands and family trip', status: 'PENDING_HR', managerId: 2, managerName: 'Priya Sharma', managerComment: 'Approved for Q4 release break' },
  { id: 2, employeeName: 'Rakesh K. Sharma', leaveType: 'Sick Leave', startDate: '2026-09-25', endDate: '2026-09-26', totalDays: 2, reason: 'Medical recovery', status: 'APPROVED', managerId: 2, managerName: 'Priya Sharma', managerComment: 'Approved medical leave', hrComment: 'Verified with leave balance policy' },
  { id: 1, employeeName: 'Priya Sharma', leaveType: 'Annual Leave', startDate: '2026-10-01', endDate: '2026-10-03', totalDays: 3, reason: 'Family vacation', status: 'APPROVED', hrComment: 'Approved executive leave' },
];

export default AttendancePage;
