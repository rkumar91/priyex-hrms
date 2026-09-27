import { UserProfile } from '../context/AuthContext';

export const hasRole = (user: UserProfile | null, allowedRoles: string[]): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((r) => allowedRoles.includes(r.toUpperCase()));
};

export const hasPermission = (user: UserProfile | null, permission: string): boolean => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

export const isSuperAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN']);
};

export const isHrAdmin = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_EXECUTIVE']);
};

export const isManager = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'MANAGER']);
};

export const canManageEmployees = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'HR_EXECUTIVE']);
};

export const canDeactivateEmployees = (user: UserProfile | null): boolean => {
  if (!user) return false;
  return isSuperAdmin(user) || hasPermission(user, 'emp.manage_lifecycle');
};

export const canApproveLeaves = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN', 'MANAGER']);
};

export const canViewAuditLogs = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN', 'AUDITOR']);
};

export const canManageOrganization = (user: UserProfile | null): boolean => {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN', 'HR_ADMIN']);
};

export const canManageUserRoles = (user: UserProfile | null): boolean => {
  return isSuperAdmin(user);
};

export const canApproveProfileRequests = (user: UserProfile | null): boolean => {
  return isHrAdmin(user);
};

