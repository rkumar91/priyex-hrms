import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canApproveLeaves, isHrAdmin } from '../utils/rbac';
import api from '../api/client';
import { ApplyLeaveModal } from '../components/attendance/ApplyLeaveModal';
import { SubmitOvertimeModal } from '../components/attendance/SubmitOvertimeModal';
import { ClaimCoffModal } from '../components/attendance/ClaimCoffModal';
import { AvailCoffModal } from '../components/attendance/AvailCoffModal';
import { AddGeofenceModal } from '../components/attendance/AddGeofenceModal';
import {
  findConflictingLeave,
  findConflictingOtForLeave,
  findConflictingLeaveForDate,
  findConflictingOvertime,
  findConflictingCoffClaim,
  findConflictingCoffAvail
} from '../utils/requestValidators';
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

import {
  LeaveRequestItem,
  OvertimeItem,
  CoffItem,
  OfficeGeofence,
  DEFAULT_GEOFENCES
} from '../types/attendance';
import { AttendanceTab } from '../components/attendance/tabs/AttendanceTab';
import { OvertimeTab } from '../components/attendance/tabs/OvertimeTab';
import { CoffTab } from '../components/attendance/tabs/CoffTab';
import { LeavesTab } from '../components/attendance/tabs/LeavesTab';
import { GeofencesTab } from '../components/attendance/tabs/GeofencesTab';

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
      { id: 1, employeeName: 'Rajesh Kumar', department: 'Engineering', date: '2026-10-12', startTime: '18:00', endTime: '21:30', shift: 'Evening Extension', hours: 3.5, rateMultiplier: 1.5, estimatedPayout: 2100.00, reason: 'Sprint release critical bugfixes and deployment testing', projectCode: 'PRJ-FINTECH-01', status: 'APPROVED' },
      { id: 2, employeeName: 'Amit Verma', department: 'Engineering', date: '2026-10-13', startTime: '22:00', endTime: '02:00', shift: 'Night Deployment', hours: 4.0, rateMultiplier: 1.5, estimatedPayout: 2400.00, reason: 'Core database migration and failover validation', projectCode: 'INFRA-PROD-MIG', status: 'PENDING' },
      { id: 3, employeeName: 'Siddharth Roy', department: 'Operations', date: '2026-10-11', startTime: '10:00', endTime: '16:00', shift: 'Weekend Maintenance', hours: 6.0, rateMultiplier: 2.0, estimatedPayout: 3600.00, reason: 'Emergency server patch rollout during maintenance window', projectCode: 'OPS-MAINT-Q4', status: 'APPROVED' },
    ];
  });
  const [isOtModalOpen, setIsOtModalOpen] = useState(false);
  const [otForm, setOtForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '18:00',
    endTime: '20:30',
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
    if (leaveForm.startDate > leaveForm.endDate) {
      alert('Leave start date cannot be after end date.');
      return;
    }

    // 1. Check for overlapping existing active leaves
    const conflictingLeave = findConflictingLeave(leaveRequests, leaveForm.startDate, leaveForm.endDate);
    if (conflictingLeave) {
      alert(`You already have an active leave application (${conflictingLeave.leaveType} from ${conflictingLeave.startDate} to ${conflictingLeave.endDate} [${conflictingLeave.status}]). Overlapping or duplicate leaves are not permitted.`);
      return;
    }

    // 2. Check for conflicting approved/pending Overtime during this leave window
    const conflictingOt = findConflictingOtForLeave(overtimeList, leaveForm.startDate, leaveForm.endDate);
    if (conflictingOt) {
      alert(`Conflict detected: You have an active Overtime entry on ${conflictingOt.date} (${conflictingOt.shift} [${conflictingOt.status}]). You cannot apply for full-day leave on a scheduled overtime date.`);
      return;
    }

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
      alert(err?.response?.data?.message || err?.message || 'Failed to submit leave application');
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
    if (isNaN(hrs) || hrs <= 0) {
      alert('Please enter valid overtime hours.');
      return;
    }

    // 1. Conflict Check: Check if employee has an active Leave on this date
    const conflictingLeave = findConflictingLeaveForDate(leaveRequests, otForm.date);
    if (conflictingLeave) {
      alert(`Cannot submit Overtime on ${otForm.date}: You have an active leave application (${conflictingLeave.leaveType} [${conflictingLeave.status}]) on this date.`);
      return;
    }

    // 2. Duplicate / Overlapping OT Check on same date and time
    const conflictingOt = findConflictingOvertime(overtimeList, otForm.date, otForm.startTime, otForm.endTime);
    if (conflictingOt) {
      const timeInfo = conflictingOt.startTime ? ` (${conflictingOt.startTime} - ${conflictingOt.endTime})` : '';
      alert(`An active Overtime request already exists for ${otForm.date}${timeInfo} [${conflictingOt.status}]. Duplicate or overlapping overtime entries are not permitted.`);
      return;
    }

    const multiplier = otForm.isWeekend ? 2.0 : 1.5;
    const hourlyBase = 350; // standard hourly rate
    const payout = hrs * hourlyBase * multiplier;

    const newOt: OvertimeItem = {
      id: Date.now(),
      employeeName: user?.fullName || 'Current Employee',
      department: 'Engineering',
      date: otForm.date,
      startTime: otForm.startTime,
      endTime: otForm.endTime,
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
      startTime: '18:00',
      endTime: '20:30',
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

    // 1. Check if a C-off credit claim already exists for this worked date
    const conflictingCoff = findConflictingCoffClaim(coffList, coffForm.workedDate);
    if (conflictingCoff) {
      alert(`A C-Off credit request for ${coffForm.workedDate} already exists [${conflictingCoff.status}]. Duplicate claims for the same worked date are not permitted.`);
      return;
    }

    // 2. Check if employee was on active Leave on workedDate
    const conflictingLeave = findConflictingLeaveForDate(leaveRequests, coffForm.workedDate);
    if (conflictingLeave) {
      alert(`Conflict: You had an active leave application (${conflictingLeave.leaveType} [${conflictingLeave.status}]) on ${coffForm.workedDate}. You cannot claim C-Off credit for a day on leave.`);
      return;
    }

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

    // Check if employee already has an active leave on availDate
    const conflictingLeave = findConflictingLeaveForDate(leaveRequests, availDate);
    if (conflictingLeave) {
      alert(`Conflict: You already have an active leave application (${conflictingLeave.leaveType} [${conflictingLeave.status}]) on ${availDate}.`);
      return;
    }

    // Check if another C-Off is already availed on availDate
    const conflictingAvail = findConflictingCoffAvail(coffList, availDate);
    if (conflictingAvail) {
      alert(`Conflict: A C-Off credit is already redeemed for leave on ${availDate}. Duplicate redemptions for the same date are not allowed.`);
      return;
    }

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
      {/* TABS SECTION                                            */}
      {/* ======================================================== */}
      {activeTab === 'ATTENDANCE' && (
        <AttendanceTab
          isClockedIn={isClockedIn}
          clockInTime={clockInTime}
          clockElapsedSeconds={clockElapsedSeconds}
          formatElapsedTime={formatElapsedTime}
          handleToggleClock={handleToggleClock}
          userCoords={userCoords}
          punchLog={punchLog}
        />
      )}

      {activeTab === 'OVERTIME' && (
        <OvertimeTab
          overtimeList={overtimeList}
          canApprove={canApprove}
          handleApproveOt={handleApproveOt}
          handleRejectOt={handleRejectOt}
          totalOtHoursApproved={totalOtHoursApproved}
          totalOtPayout={totalOtPayout}
        />
      )}

      {activeTab === 'COFF' && (
        <CoffTab
          coffList={coffList}
          canApprove={canApprove}
          handleApproveCoff={handleApproveCoff}
          handleRejectCoff={handleRejectCoff}
          availableCoffCredits={availableCoffCredits}
          totalCoffEarned={totalCoffEarned}
        />
      )}

      {activeTab === 'LEAVES' && (
        <LeavesTab
          leaveRequests={leaveRequests}
          isLoadingLeaves={isLoadingLeaves}
          leaveScopeFilter={leaveScopeFilter}
          setLeaveScopeFilter={setLeaveScopeFilter}
          leaveStatusFilter={leaveStatusFilter}
          setLeaveStatusFilter={setLeaveStatusFilter}
          user={user}
          canApprove={canApprove}
          isHr={isHr}
          handleManagerApproveLeave={handleManagerApproveLeave}
          handleManagerRejectLeave={handleManagerRejectLeave}
          handleHrApproveLeave={handleHrApproveLeave}
          handleHrRejectLeave={handleHrRejectLeave}
          handleApproveLeave={handleApproveLeave}
          handleRejectLeave={handleRejectLeave}
        />
      )}

      {activeTab === 'GEOFENCES' && (
        <GeofencesTab geofences={geofences} />
      )}

      {/* ======================================================== */}
      {/* MODALS SECTION                                          */}
      {/* ======================================================== */}

      {/* 1. APPLY LEAVE MODAL */}
      <ApplyLeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleApplyLeaveSubmit}
        leaveForm={leaveForm}
        setLeaveForm={setLeaveForm}
        orgPolicies={orgPolicies}
        leaveRequests={leaveRequests}
        overtimeList={overtimeList}
        isSubmitting={isSubmittingLeave}
      />

      {/* 2. SUBMIT OVERTIME MODAL */}
      <SubmitOvertimeModal
        isOpen={isOtModalOpen}
        onClose={() => setIsOtModalOpen(false)}
        onSubmit={handleApplyOt}
        otForm={otForm}
        setOtForm={setOtForm}
        leaveRequests={leaveRequests}
        overtimeList={overtimeList}
      />

      {/* 3. CLAIM C-OFF CREDIT MODAL */}
      <ClaimCoffModal
        isOpen={isCoffModalOpen}
        onClose={() => setIsCoffModalOpen(false)}
        onSubmit={handleClaimCoff}
        coffForm={coffForm}
        setCoffForm={setCoffForm}
        leaveRequests={leaveRequests}
        coffList={coffList}
      />

      {/* 4. AVAIL C-OFF LEAVE MODAL */}
      <AvailCoffModal
        isOpen={isAvailCoffModalOpen}
        onClose={() => setIsAvailCoffModalOpen(false)}
        onSubmit={handleAvailCoffSubmit}
        availableCoffCredits={availableCoffCredits}
        availDate={availDate}
        setAvailDate={setAvailDate}
        leaveRequests={leaveRequests}
        coffList={coffList}
      />

      {/* 5. ADD GEOFENCE MODAL */}
      <AddGeofenceModal
        isOpen={isGeofenceModalOpen}
        onClose={() => setIsGeofenceModalOpen(false)}
        onSubmit={handleAddGeofence}
        newFenceForm={newFenceForm}
        setNewFenceForm={setNewFenceForm}
      />
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
