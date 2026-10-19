import { UserProfile } from '../context/AuthContext';

export const hasRole = (user: UserProfile | null, allowedRoles: string[]): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((r) => allowedRoles.includes(r.toUpperCase()));
};

export const hasPermission = (user: UserProfile | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

/** Super Admin: Platform-wide access across all client organizations */
export const isSuperAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN']);
};

/** Organization Admin: Manages all HRMS data within their own organization */
export const isAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'COMPANY_ADMIN']);
};

/** HR Manager: Manages employee records and HR operations within their organization */
export const isHrAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'COMPANY_ADMIN', 'HR', 'HR_ADMIN', 'HR_EXECUTIVE']);
};

/** Team Manager: Manages and views team member information and approvals */
export const isManager = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'COMPANY_ADMIN', 'HR', 'HR_ADMIN', 'MANAGER']);
};

/** Employee: Self-service access */
export const isEmployee = (user: UserProfile | null): boolean => {
  return !!user;
};

export const canManageEmployees = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'HR', 'HR_ADMIN', 'HR_EXECUTIVE']);
};

export const canDeactivateEmployees = (user: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || isAdmin(user) || hasPermission(user, 'emp.manage_lifecycle');
};

export const canApproveLeaves = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'HR', 'HR_ADMIN', 'MANAGER']);
};

export const canViewAuditLogs = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'AUDITOR']);
};

export const canManageOrganization = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'HR', 'HR_ADMIN']);
};

export const canManageUserRoles = (user: UserProfile | null): boolean => {
  return isSuperAdmin(user) || isAdmin(user);
};

export const canApproveProfileRequests = (user: UserProfile | null): boolean => {
  return isHrAdmin(user);
};

/** Matches backend @PreAuthorize on /notifications/broadcasts management endpoints. */
export const canManageAnnouncements = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'ADMIN', 'HR', 'HR_ADMIN']);
};
