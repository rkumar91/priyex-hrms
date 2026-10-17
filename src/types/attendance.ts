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
  startTime?: string;
  endTime?: string;
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

export const DEFAULT_GEOFENCES: OfficeGeofence[] = [
  { id: 'HQ-GRNOIDA', name: 'Priyex Technologies HQ - Nirala Estate', city: 'Greater Noida, UP', latitude: 28.5355, longitude: 77.3910, radiusMeters: 250, isActive: true },
  { id: 'BLR-CAMPUS', name: 'Bengaluru Tech Park - Whitefield Hub', city: 'Bengaluru, KA', latitude: 12.9716, longitude: 77.5946, radiusMeters: 300, isActive: true },
  { id: 'MUM-OFFICE', name: 'Bandra Kurla Complex (BKC) Branch', city: 'Mumbai, MH', latitude: 19.0660, longitude: 72.8680, radiusMeters: 200, isActive: true },
];
