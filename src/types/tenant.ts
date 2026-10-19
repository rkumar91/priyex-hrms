export interface CompanyClient {
  id: number;
  code: string;
  legalName: string;
  brandName?: string;
  industry?: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface TenantPolicyConfig {
  companyId: number;
  companyCode: string;
  companyName: string;
  leaveCalendarCycle: 'CALENDAR_YEAR' | 'FINANCIAL_YEAR';
  leaveSandwichRule: 'ENABLED' | 'DISABLED';
  probationLeaveAllowed: boolean;
  attendanceGraceMins: number;
  halfDayMinHours: number;
  fullDayMinHours: number;
  geofenceEnforcement: 'STRICT' | 'FLEXIBLE' | 'DISABLED';
  overtimeMultiplierWeekday: number;
  overtimeMultiplierWeekend: number;
  coffValidityDays: number;
  coffMinHoursFullDay: number;
  approvalTierCount: 1 | 2 | 3;
}
