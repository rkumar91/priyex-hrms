import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSuperAdmin, isAdmin } from '../utils/rbac';
import api from '../api/client';
import {
  UserCog,
  ShieldCheck,
  ShieldAlert,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Mail,
  Building2,
  Shield,
  Layers,
  Sparkles,
  Check,
  Plus,
  Sliders,
  RotateCcw,
  Save,
  Lock,
  ChevronRight,
  Filter
} from 'lucide-react';

export interface EmployeeUserRole {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  departmentName?: string;
  designationName?: string;
  workEmail: string;
  userId?: number;
  userEmail?: string;
  userActive?: boolean;
  roles?: string[];
  primaryRole?: string;
}

export interface AdminUser {
  id: number;
  email: string;
  displayName: string;
  avatarUrl?: string;
  employeeId?: number;
  companyId?: number;
  companyName?: string;
  active: boolean;
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface FeatureCapability {
  code: string;
  name: string;
  description: string;
  module: 'EXPENSES' | 'LEAVES' | 'PAYROLL' | 'EMPLOYEES' | 'GOVERNANCE';
  moduleLabel: string;
  roles: {
    EMPLOYEE: boolean;
    MANAGER: boolean;
    HR_ADMIN: boolean;
    ADMIN: boolean;
  };
}

export const STANDARD_FEATURE_POLICIES: FeatureCapability[] = [
  // ── 1. Expense Claims Module ──
  {
    code: 'expense.submit',
    name: 'Submit Personal Expense Claims',
    description: 'File corporate expense claims, upload receipts, and track approval status',
    module: 'EXPENSES',
    moduleLabel: 'Expense Claims & Reimbursements',
    roles: { EMPLOYEE: true, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'expense.view_team',
    name: 'View Team Direct Report Claims',
    description: 'Inspect filings submitted by team members reporting directly to this manager',
    module: 'EXPENSES',
    moduleLabel: 'Expense Claims & Reimbursements',
    roles: { EMPLOYEE: false, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'expense.mgr_approve',
    name: 'Stage 1: Direct Manager Review & Signoff',
    description: 'Approve or decline Tier 1 expense submissions from direct reports',
    module: 'EXPENSES',
    moduleLabel: 'Expense Claims & Reimbursements',
    roles: { EMPLOYEE: false, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'expense.hr_approve',
    name: 'Stage 2: HR / Finance Financial Audit',
    description: 'Audit merchant compliance, policy thresholds, and approve claims for payout',
    module: 'EXPENSES',
    moduleLabel: 'Expense Claims & Reimbursements',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'expense.reimburse',
    name: 'Execute Bank Reimbursement Payout',
    description: 'Trigger corporate bank transfer / payroll reimbursement with UTR reference',
    module: 'EXPENSES',
    moduleLabel: 'Expense Claims & Reimbursements',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'expense.export_audit',
    name: 'Export Corporate Expense Audit Log',
    description: 'Download full CSV/PDF expense registers for statutory tax accounting',
    module: 'EXPENSES',
    moduleLabel: 'Expense Claims & Reimbursements',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },

  // ── 2. Attendance & Leaves Module ──
  {
    code: 'leave.apply',
    name: 'Apply for Personal Leave & Time-Off',
    description: 'Request casual, paid, or medical leaves against allocated quota',
    module: 'LEAVES',
    moduleLabel: 'Attendance & Leave Management',
    roles: { EMPLOYEE: true, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'leave.approve_team',
    name: 'Approve Direct Reports’ Leave Requests',
    description: 'Review and approve/reject leave applications submitted by team members',
    module: 'LEAVES',
    moduleLabel: 'Attendance & Leave Management',
    roles: { EMPLOYEE: false, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'leave.quota_adjust',
    name: 'Adjust / Override Employee Leave Quota',
    description: 'Manually credit or debit leave balances for employees during exceptional events',
    module: 'LEAVES',
    moduleLabel: 'Attendance & Leave Management',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'leave.regularize',
    name: 'Regularize Team Timesheet & Shifts',
    description: 'Approve punch-in/out corrections and shift regularization for team members',
    module: 'LEAVES',
    moduleLabel: 'Attendance & Leave Management',
    roles: { EMPLOYEE: false, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'leave.holiday_config',
    name: 'Configure Company Holiday Calendar',
    description: 'Define national and regional holiday schedules per office location',
    module: 'LEAVES',
    moduleLabel: 'Attendance & Leave Management',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },

  // ── 3. Payroll & Compensation Module ──
  {
    code: 'payroll.view_own',
    name: 'View & Download Own Payslips',
    description: 'Self-service access to monthly salary statements and Form 16 summaries',
    module: 'PAYROLL',
    moduleLabel: 'Payroll & Compensation',
    roles: { EMPLOYEE: true, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'payroll.view_company',
    name: 'View Organization Salary Structure',
    description: 'Access salary master records, CTC breakups, and department payroll totals',
    module: 'PAYROLL',
    moduleLabel: 'Payroll & Compensation',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'payroll.run_batch',
    name: 'Execute Monthly Payroll Batch',
    description: 'Process end-of-month salary calculations, deductions, and banking files',
    module: 'PAYROLL',
    moduleLabel: 'Payroll & Compensation',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },

  // ── 4. Employee Directory & Lifecycle ──
  {
    code: 'emp.view_directory',
    name: 'Access Colleague Directory',
    description: 'Browse active organization employee directory, designations, and departments',
    module: 'EMPLOYEES',
    moduleLabel: 'Employee Directory & Lifecycle',
    roles: { EMPLOYEE: true, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'emp.edit_profile',
    name: 'Update Personal Profile & Address',
    description: 'Request updates to personal contact numbers, residential address, and emergency contacts',
    module: 'EMPLOYEES',
    moduleLabel: 'Employee Directory & Lifecycle',
    roles: { EMPLOYEE: true, MANAGER: true, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'emp.manage_lifecycle',
    name: 'Onboard & Deactivate Employees',
    description: 'Create new employee profiles, assign employee codes, and process terminations/separations',
    module: 'EMPLOYEES',
    moduleLabel: 'Employee Directory & Lifecycle',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },
  {
    code: 'emp.manage_documents',
    name: 'Access Confidential Employee Documents',
    description: 'Audit government IDs, academic certificates, and background verification records',
    module: 'EMPLOYEES',
    moduleLabel: 'Employee Directory & Lifecycle',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: true, ADMIN: true }
  },

  // ── 5. Governance & System Admin ──
  {
    code: 'gov.manage_roles',
    name: 'Assign & Revoke User Roles',
    description: 'Authorize or revoke Manager, HR Admin, and Organization Admin privileges per user',
    module: 'GOVERNANCE',
    moduleLabel: 'Governance & Platform Administration',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: false, ADMIN: true }
  },
  {
    code: 'gov.policy_matrix',
    name: 'Configure Role Feature Enablement Matrix',
    description: 'Enable or disable functional capabilities across system roles organization-wide',
    module: 'GOVERNANCE',
    moduleLabel: 'Governance & Platform Administration',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: false, ADMIN: true }
  },
  {
    code: 'gov.audit_logs',
    name: 'View System Security Audit Logs',
    description: 'Inspect user logins, permission alterations, and role delegation history',
    module: 'GOVERNANCE',
    moduleLabel: 'Governance & Platform Administration',
    roles: { EMPLOYEE: false, MANAGER: false, HR_ADMIN: false, ADMIN: true }
  }
];

const AVAILABLE_ROLES = [
  { id: 'EMPLOYEE', label: 'Employee', desc: 'Self-service claimant & profile owner', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'MANAGER', label: 'Manager', desc: 'Direct team reviewer & shift approver', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'HR_ADMIN', label: 'HR Admin', desc: 'Financial auditor & employee lifecycle manager', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'ADMIN', label: 'Admin', desc: 'Full organization authority & governance control', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
] as const;

export const UsersRolesPage: React.FC = () => {
  const { user } = useAuth();
  // Authorized for Super Admins, Organization Admins, and Company Admins
  const isAuthorized = isSuperAdmin(user) || isAdmin(user);

  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab')?.toLowerCase();

  const getRolesTab = (key?: string | null): 'EMPLOYEE_ROLES' | 'ROLE_POLICIES' | 'SYSTEM_ACCOUNTS' => {
    if (key === 'policies' || key === 'matrix' || key === 'features') return 'ROLE_POLICIES';
    if (key === 'logins' || key === 'accounts' || key === 'system_accounts') return 'SYSTEM_ACCOUNTS';
    return 'EMPLOYEE_ROLES';
  };

  const [activeTab, setActiveTab] = useState<'EMPLOYEE_ROLES' | 'ROLE_POLICIES' | 'SYSTEM_ACCOUNTS'>(() => getRolesTab(rawTab));

  useEffect(() => {
    if (rawTab) {
      setActiveTab(getRolesTab(rawTab));
      setSearchTerm('');
    }
  }, [rawTab]);

  const handleTabChange = (tab: 'EMPLOYEE_ROLES' | 'ROLE_POLICIES' | 'SYSTEM_ACCOUNTS') => {
    setActiveTab(tab);
    setSearchTerm('');
    if (tab === 'ROLE_POLICIES') setSearchParams({ tab: 'policies' });
    else if (tab === 'SYSTEM_ACCOUNTS') setSearchParams({ tab: 'accounts' });
    else setSearchParams({ tab: 'roles' });
  };

  // State: Employee User Roles
  const [employeeRoles, setEmployeeRoles] = useState<EmployeeUserRole[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeUserRole | null>(null);
  const [empModalRoles, setEmpModalRoles] = useState<string[]>(['EMPLOYEE']);

  // State: System Users
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userModalRoles, setUserModalRoles] = useState<string[]>(['EMPLOYEE']);

  // State: Role Feature Policy Matrix
  const [policies, setPolicies] = useState<FeatureCapability[]>(STANDARD_FEATURE_POLICIES);
  const [isPolicyDirty, setIsPolicyDirty] = useState<boolean>(false);
  const [policyModuleFilter, setPolicyModuleFilter] = useState<string>('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Employee Roles
  const fetchEmployeeRoles = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/admin/users/employees-roles');
      if (res.success && Array.isArray(res.data)) {
        setEmployeeRoles(res.data);
      } else {
        setEmployeeRoles(fallbackEmployeeRoles);
      }
    } catch (e) {
      setEmployeeRoles(fallbackEmployeeRoles);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch System Users
  const fetchUsers = async () => {
    try {
      const res: any = await api.get('/admin/users');
      if (res.success && Array.isArray(res.data)) {
        setUsersList(res.data);
      } else {
        setUsersList(fallbackUsers);
      }
    } catch (e) {
      setUsersList(fallbackUsers);
    }
  };

  // Fetch Role Feature Policies from Backend
  const fetchRolePolicies = async () => {
    try {
      const res: any = await api.get('/admin/users/roles/policies');
      if (res.success && res.data) {
        try {
          const parsed = JSON.parse(res.data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPolicies(parsed);
            return;
          }
        } catch {
          // ignore parsing error, fallback to standard
        }
      }
      setPolicies(STANDARD_FEATURE_POLICIES);
    } catch {
      setPolicies(STANDARD_FEATURE_POLICIES);
    }
  };

  useEffect(() => {
    fetchEmployeeRoles();
    fetchUsers();
    fetchRolePolicies();
  }, []);

  // Inline Quick Toggle for specific role assigned to employee
  const handleQuickToggleRole = async (emp: EmployeeUserRole, roleToToggle: string) => {
    const currentRoles = (emp.roles && emp.roles.length > 0) ? emp.roles : (emp.primaryRole ? [emp.primaryRole] : ['EMPLOYEE']);
    const exists = currentRoles.some(r => r.toUpperCase() === roleToToggle.toUpperCase());

    let nextRoles: string[];
    if (exists) {
      // Disabling: keep at least 1 role
      nextRoles = currentRoles.filter(r => r.toUpperCase() !== roleToToggle.toUpperCase());
      if (nextRoles.length === 0) {
        nextRoles = ['EMPLOYEE'];
      }
    } else {
      // Enabling
      nextRoles = [...currentRoles, roleToToggle];
    }

    // Anti-lockout guard: If editing own account, do not remove Admin
    if (user?.employeeId && Number(user.employeeId) === Number(emp.employeeId)) {
      if (exists && (roleToToggle === 'ADMIN' || roleToToggle === 'SUPER_ADMIN')) {
        alert('Anti-Lockout Protection: You cannot remove your own Administrator role.');
        return;
      }
    }

    try {
      const res: any = await api.put(`/admin/users/employees/${emp.employeeId}/roles`, { roles: nextRoles });
      if (res?.success) {
        setMessage({
          type: 'success',
          text: `Updated roles for ${emp.firstName} ${emp.lastName}: [${nextRoles.join(', ')}]`
        });
        await fetchEmployeeRoles();
        await fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update roles' });
    }
  };

  // Submit Multi-Role Modal for Employee
  const handleSaveEmployeeRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsUpdating(true);
    setMessage(null);

    // Ensure at least one role is selected
    const rolesToApply = empModalRoles.length > 0 ? empModalRoles : ['EMPLOYEE'];

    // Anti-lockout guard
    if (user?.employeeId && Number(user.employeeId) === Number(selectedEmp.employeeId)) {
      if (!rolesToApply.includes('ADMIN') && !rolesToApply.includes('SUPER_ADMIN')) {
        alert('Anti-Lockout Protection: You cannot remove your own Administrator role.');
        setIsUpdating(false);
        return;
      }
    }

    try {
      const res: any = await api.put(`/admin/users/employees/${selectedEmp.employeeId}/roles`, { roles: rolesToApply });
      if (res?.success) {
        setMessage({
          type: 'success',
          text: `Successfully assigned roles [${rolesToApply.join(', ')}] to ${selectedEmp.firstName} ${selectedEmp.lastName} (${selectedEmp.employeeCode})!`
        });
        setSelectedEmp(null);
        await fetchEmployeeRoles();
        await fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save roles' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle Feature Policy Cell
  const handleTogglePolicy = (featureCode: string, role: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'ADMIN') => {
    setPolicies(prev => prev.map(f => {
      if (f.code === featureCode) {
        return {
          ...f,
          roles: {
            ...f.roles,
            [role]: !f.roles[role]
          }
        };
      }
      return f;
    }));
    setIsPolicyDirty(true);
  };

  // Save Policy Matrix Changes
  const handleSavePolicyMatrix = async () => {
    setIsUpdating(true);
    try {
      const matrixJson = JSON.stringify(policies);
      const res: any = await api.put('/admin/users/roles/policies', { matrix: matrixJson });
      if (res?.success) {
        setMessage({ type: 'success', text: 'Role-Based Feature Policy Matrix saved and deployed organization-wide.' });
        setIsPolicyDirty(false);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save feature policies' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset Policy Matrix to Defaults
  const handleResetPolicyMatrix = () => {
    if (confirm('Are you sure you want to reset all feature policies to industry standard defaults?')) {
      setPolicies(STANDARD_FEATURE_POLICIES);
      setIsPolicyDirty(true);
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (targetUser: AdminUser) => {
    if (String(user?.id) === String(targetUser.id) && targetUser.active) {
      alert('Anti-Lockout Protection: You cannot deactivate your own administrative login account.');
      return;
    }
    const actionWord = targetUser.active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${actionWord} the platform login for "${targetUser.displayName}" (${targetUser.email})?`)) {
      return;
    }
    try {
      const newStatus = !targetUser.active;
      await api.put(`/admin/users/${targetUser.id}/status`, { active: newStatus });
      fetchUsers();
      fetchEmployeeRoles();
      setMessage({ type: 'success', text: `Account for ${targetUser.displayName} marked ${newStatus ? 'ACTIVE' : 'INACTIVE'}` });
    } catch (err: any) {
      alert(err?.message || 'Failed to update user status');
    }
  };

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employeeRoles.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.workEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.roles && e.roles.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (e.primaryRole && e.primaryRole.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employeeRoles, searchTerm]);

  // Filtered system users list
  const filteredUsers = useMemo(() => {
    return usersList.filter(u =>
      u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [usersList, searchTerm]);

  // Filtered policy matrix list
  const filteredPolicies = useMemo(() => {
    return policies.filter(p => {
      const matchModule = policyModuleFilter === 'ALL' || p.module === policyModuleFilter;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.moduleLabel.toLowerCase().includes(searchTerm.toLowerCase());
      return matchModule && matchSearch;
    });
  }, [policies, policyModuleFilter, searchTerm]);

  // Dynamic counts
  const adminCount = employeeRoles.filter(e => (e.roles && e.roles.some(r => r === 'ADMIN' || r === 'SUPER_ADMIN')) || e.primaryRole === 'ADMIN' || e.primaryRole === 'SUPER_ADMIN').length;
  const hrAdminCount = employeeRoles.filter(e => (e.roles && e.roles.some(r => r === 'HR_ADMIN' || r === 'HR_EXECUTIVE')) || e.primaryRole === 'HR_ADMIN').length;
  const managerCount = employeeRoles.filter(e => (e.roles && e.roles.includes('MANAGER')) || e.primaryRole === 'MANAGER').length;
  const regularEmployeeCount = employeeRoles.length;

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500">
          Only Organization Administrators have authority to manage user roles and feature governance policies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <UserCog className="w-6 h-6 text-indigo-600" />
              <span>User & Role Governance</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Organization Scope
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Configure multi-role user privileges and tabular role feature policies in real-time.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-semibold self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleTabChange('EMPLOYEE_ROLES')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'EMPLOYEE_ROLES'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Roles Roster</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {employeeRoles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('ROLE_POLICIES')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ROLE_POLICIES'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Role Feature Matrix</span>
            {isPolicyDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" title="Unsaved policy changes" />
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('SYSTEM_ACCOUNTS')}
            className={`px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SYSTEM_ACCOUNTS'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>System Logins</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
              {usersList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Global Alerts / Messages */}
      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in duration-200 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="cursor-pointer text-slate-400 hover:text-slate-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Staff Mapped</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{regularEmployeeCount}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Every active employee</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reporting Managers</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{managerCount}</div>
          <span className="text-[11px] text-indigo-600/80 mt-0.5 block">Team review & Tier 1 approval</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">HR Administrators</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{hrAdminCount}</div>
          <span className="text-[11px] text-amber-600/80 mt-0.5 block">Auditor & compliance signoff</span>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Org Administrators</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{adminCount}</div>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Full governance control</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === 'EMPLOYEE_ROLES'
                ? "Search employee by name, code, email, or role..."
                : activeTab === 'ROLE_POLICIES'
                ? "Search capability, feature code, or description..."
                : "Search system logins by name or email..."
            }
            className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
          />
        </div>

        {activeTab === 'ROLE_POLICIES' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Module:</span>
              <select
                value={policyModuleFilter}
                onChange={(e) => setPolicyModuleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="ALL">All Modules</option>
                <option value="EXPENSES">Expenses & Reimbursements</option>
                <option value="LEAVES">Attendance & Leaves</option>
                <option value="PAYROLL">Payroll & Compensation</option>
                <option value="EMPLOYEES">Employee Directory & Core HR</option>
                <option value="GOVERNANCE">Governance & System Admin</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetPolicyMatrix}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Reset all feature policies to standard industry defaults"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSavePolicyMatrix}
              disabled={isUpdating || !isPolicyDirty}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                isPolicyDirty
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isUpdating ? 'Saving...' : 'Deploy Policy'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ── TAB 1: USER ROLES ROSTER (Multi-Role Toggles per User) ── */}
      {activeTab === 'EMPLOYEE_ROLES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                Employee Multi-Role Roster
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                {filteredEmployees.length} staff
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Click individual role pills to toggle roles in real time, or click "Manage Roles" for details.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department & Designation</th>
                  <th className="py-3 px-4">Work Email</th>
                  <th className="py-3 px-4">Login Status</th>
                  <th className="py-3 px-4">Assigned Roles (Click to Toggle)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-xs font-medium">Loading user roster...</p>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 text-xs font-semibold">
                      No employees match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const assignedRoles = (emp.roles && emp.roles.length > 0)
                      ? emp.roles
                      : (emp.primaryRole && emp.primaryRole !== 'NO_ACCOUNT' && emp.primaryRole !== 'NO_ROLE' ? [emp.primaryRole] : ['EMPLOYEE']);
                    const hasAccount = !!emp.userId;

                    return (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                              {emp.firstName ? emp.firstName.charAt(0) : 'E'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{emp.firstName} {emp.lastName}</span>
                              <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                {emp.employeeCode}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          <span className="font-semibold text-slate-800 block">{emp.designationName || 'Staff Member'}</span>
                          <span className="text-slate-400 flex items-center gap-1 text-[11px] mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {emp.departmentName || 'General'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {emp.workEmail}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          {hasAccount ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Active (User #{emp.userId})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              No Account Yet
                            </span>
                          )}
                        </td>

                        {/* Interactive Role Toggle Pills */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {AVAILABLE_ROLES.map((r) => {
                              const isAssigned = assignedRoles.some(ar => ar.toUpperCase() === r.id);
                              return (
                                <button
                                  key={r.id}
                                  type="button"
                                  onClick={() => handleQuickToggleRole(emp, r.id)}
                                  className={`px-2 py-0.8 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer select-none active:scale-95 ${
                                    isAssigned
                                      ? `${r.color} shadow-2xs`
                                      : 'bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-dashed border-slate-300'
                                  }`}
                                  title={isAssigned ? `Active: Click to remove ${r.label} role` : `Inactive: Click to grant ${r.label} role`}
                                >
                                  {isAssigned ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                                  <span>{r.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEmp(emp);
                              setEmpModalRoles(assignedRoles);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 font-bold transition cursor-pointer flex items-center gap-1 ml-auto shadow-2xs"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>Manage Roles</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 2: ROLE-BASED FEATURE POLICY MATRIX (Tabular Format) ── */}
      {activeTab === 'ROLE_POLICIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Role-Based Feature Policy Matrix
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  {filteredPolicies.length} Capabilities Mapped
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enabled / disabled toggles per role dictate real-time application behavior across all modules.
              </p>
            </div>

            {isPolicyDirty && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>You have unsaved policy changes. Click "Deploy Policy" above to apply.</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3 px-4 w-1/3">Module Feature & Capability</th>
                  <th className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-blue-700 font-extrabold">Employee</span>
                      <span className="text-[9px] text-slate-400 font-normal">Base Self-Service</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-indigo-700 font-extrabold">Manager</span>
                      <span className="text-[9px] text-slate-400 font-normal">Team Reviewer</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-amber-800 font-extrabold">HR Admin</span>
                      <span className="text-[9px] text-slate-400 font-normal">Auditor & Finance</span>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-emerald-800 font-extrabold">Company Admin</span>
                      <span className="text-[9px] text-slate-400 font-normal">Organization Governance</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPolicies.map((f, idx) => {
                  const isNewModule = idx === 0 || filteredPolicies[idx - 1].module !== f.module;

                  return (
                    <React.Fragment key={f.code}>
                      {isNewModule && (
                        <tr className="bg-slate-100/70 border-y border-slate-200">
                          <td colSpan={5} className="py-2.5 px-4 font-bold text-slate-800 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{f.moduleLabel}</span>
                          </td>
                        </tr>
                      )}

                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{f.name}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{f.description}</div>
                          <span className="font-mono text-[9px] text-slate-400">[{f.code}]</span>
                        </td>

                        {/* EMPLOYEE Cell */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePolicy(f.code, 'EMPLOYEE')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer select-none active:scale-95 inline-flex items-center gap-1 shadow-2xs ${
                              f.roles.EMPLOYEE
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/80'
                            }`}
                            title={`Toggle ${f.name} for Employee role`}
                          >
                            {f.roles.EMPLOYEE ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                            <span>{f.roles.EMPLOYEE ? 'ENABLED' : 'DISABLED'}</span>
                          </button>
                        </td>

                        {/* MANAGER Cell */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePolicy(f.code, 'MANAGER')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer select-none active:scale-95 inline-flex items-center gap-1 shadow-2xs ${
                              f.roles.MANAGER
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/80'
                            }`}
                            title={`Toggle ${f.name} for Manager role`}
                          >
                            {f.roles.MANAGER ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                            <span>{f.roles.MANAGER ? 'ENABLED' : 'DISABLED'}</span>
                          </button>
                        </td>

                        {/* HR_ADMIN Cell */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePolicy(f.code, 'HR_ADMIN')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer select-none active:scale-95 inline-flex items-center gap-1 shadow-2xs ${
                              f.roles.HR_ADMIN
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/80'
                            }`}
                            title={`Toggle ${f.name} for HR Admin role`}
                          >
                            {f.roles.HR_ADMIN ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                            <span>{f.roles.HR_ADMIN ? 'ENABLED' : 'DISABLED'}</span>
                          </button>
                        </td>

                        {/* ADMIN Cell */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleTogglePolicy(f.code, 'ADMIN')}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer select-none active:scale-95 inline-flex items-center gap-1 shadow-2xs ${
                              f.roles.ADMIN
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/80'
                            }`}
                            title={`Toggle ${f.name} for Company Admin role`}
                          >
                            {f.roles.ADMIN ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3 text-slate-400" />}
                            <span>{f.roles.ADMIN ? 'ENABLED' : 'DISABLED'}</span>
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: SYSTEM LOGIN ACCOUNTS ── */}
      {activeTab === 'SYSTEM_ACCOUNTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  System Auth Credentials & Login Status
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  {filteredUsers.length} logins
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage raw authentication logins, activate/deactivate accounts, and inspect last login timestamps.
              </p>
            </div>

            {/* Tenant Boundary Indicator */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isSuperAdmin(user) ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Platform Scope (Super Admin) &bull; Cross-Tenant Enabled</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tenant Isolated &bull; Scoped to Your Organization</span>
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3 px-4">User Identity</th>
                  <th className="py-3 px-4">Login Email</th>
                  <th className="py-3 px-4">Organization / Tenant</th>
                  <th className="py-3 px-4">Active System Roles</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 text-xs font-semibold">
                      No system accounts found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const uRoles = (u.roles && u.roles.length > 0) ? u.roles : ['EMPLOYEE'];
                    const isSelf = String(user?.id) === String(u.id) || user?.email === u.email;

                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${isSelf ? 'bg-indigo-50/30' : ''}`}>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                              {u.displayName ? u.displayName.charAt(0) : 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900">{u.displayName}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">USR-{1000 + u.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {u.email}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            <span>{u.companyName || (u.companyId ? `Company #${u.companyId}` : 'Default Org')}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {uRoles.map((r) => (
                              <span
                                key={r}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200"
                              >
                                <ShieldCheck className="w-2.5 h-2.5 mr-1 text-indigo-600" />
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isSelf && u.active}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition select-none ${
                              u.active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            } ${isSelf && u.active ? 'opacity-70 cursor-not-allowed' : ''}`}
                            title={isSelf && u.active ? 'Anti-Lockout Protection: You cannot deactivate your own account' : 'Click to toggle active status'}
                          >
                            {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{u.active ? 'ACTIVE' : 'INACTIVE'}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never logged in'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(u);
                              setUserModalRoles(uRoles);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 font-bold transition cursor-pointer"
                          >
                            Edit Roles
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Slide-Out Drawer / Modal: Multi-Role Assignment for Employee ── */}
      {selectedEmp && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Manage Assigned Roles</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Employee Profile Preview Header */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedEmp.firstName} {selectedEmp.lastName}</span>
                <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {selectedEmp.employeeCode}
                </span>
              </div>
              <div className="text-slate-500">{selectedEmp.designationName || 'Staff'} &bull; {selectedEmp.departmentName || 'General'}</div>
              <div className="text-slate-600 font-mono text-[11px] pt-1 border-t border-slate-200">{selectedEmp.workEmail}</div>
            </div>

            <form onSubmit={handleSaveEmployeeRoles} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Select Multiple Roles (User inherits capabilities of all checked roles):
                </label>

                <div className="space-y-2">
                  {[
                    {
                      role: 'EMPLOYEE',
                      title: 'Employee (Self-Service Base Access)',
                      desc: 'Submit personal claims, request leaves, download own payslips, and view colleague directory.'
                    },
                    {
                      role: 'MANAGER',
                      title: 'Reporting Manager (Team Lead)',
                      desc: 'Audit and approve direct reports’ leave requests, attendance timesheets, and Tier 1 expense claims.'
                    },
                    {
                      role: 'HR_ADMIN',
                      title: 'HR Administrator (Auditor / Finance)',
                      desc: 'Full employee lifecycle onboarding, confidential documents review, Tier 2 claim approvals, and reimbursement payout.'
                    },
                    {
                      role: 'ADMIN',
                      title: 'Organization Administrator',
                      desc: 'Full tenant governance, policy matrix configuration, user role management, and organizational settings.'
                    }
                  ].map((item) => {
                    const isChecked = empModalRoles.includes(item.role);

                    return (
                      <label
                        key={item.role}
                        className={`block p-3 rounded-2xl border transition cursor-pointer ${
                          isChecked
                            ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-400'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEmpModalRoles(prev => [...prev, item.role]);
                              } else {
                                // Keep at least one role
                                if (empModalRoles.length === 1) {
                                  alert('A user must have at least one role assigned.');
                                  return;
                                }
                                setEmpModalRoles(prev => prev.filter(r => r !== item.role));
                              }
                            }}
                            className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                              <span className="font-mono text-[10px] text-indigo-700 font-bold bg-white px-1.5 py-0.2 rounded border border-indigo-200">
                                {item.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving Changes...' : 'Save & Deploy Roles'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Slide-Out Drawer / Modal: Multi-Role Assignment for Raw User Account ── */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Manage User Account Roles</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedUser.displayName}</div>
              <div className="text-slate-500 font-mono text-[11px]">{selectedUser.email}</div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsUpdating(true);
                try {
                  const res: any = await api.put(`/admin/users/${selectedUser.id}/roles`, { roles: userModalRoles });
                  if (res?.success) {
                    setMessage({ type: 'success', text: `Updated roles for ${selectedUser.displayName} to [${userModalRoles.join(', ')}]` });
                    setSelectedUser(null);
                    await fetchUsers();
                    await fetchEmployeeRoles();
                  }
                } catch (err: any) {
                  setMessage({ type: 'error', text: err?.message || 'Failed to update roles' });
                } finally {
                  setIsUpdating(false);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-2">
                {['EMPLOYEE', 'MANAGER', 'HR_ADMIN', 'ADMIN'].map((rName) => {
                  const isChecked = userModalRoles.includes(rName);
                  return (
                    <label
                      key={rName}
                      className={`block p-3 rounded-2xl border transition cursor-pointer ${
                        isChecked
                          ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setUserModalRoles(prev => [...prev, rName]);
                            } else {
                              if (userModalRoles.length === 1) {
                                alert('A user must have at least one role assigned.');
                                return;
                              }
                              setUserModalRoles(prev => prev.filter(r => r !== rName));
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold text-slate-900 text-xs">{rName}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Apply Roles'}</span>
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

const fallbackEmployeeRoles: EmployeeUserRole[] = [
  { employeeId: 1, employeeCode: 'EMP-1001', firstName: 'Rakesh', lastName: 'Kumar Sharma', departmentName: 'Engineering', designationName: 'Lead Architect', workEmail: 'rakesh.sharma@priyex.com', userId: 3, userEmail: 'rakesh@priyex.com', userActive: true, roles: ['EMPLOYEE', 'MANAGER'], primaryRole: 'EMPLOYEE' },
  { employeeId: 2, employeeCode: 'EMP-1002', firstName: 'Priya', lastName: 'Sharma', departmentName: 'Human Resources', designationName: 'HR Manager', workEmail: 'priya.sharma@priyex.com', userId: 2, userEmail: 'hr@priyex.com', userActive: true, roles: ['EMPLOYEE', 'HR_ADMIN'], primaryRole: 'HR_ADMIN' },
  { employeeId: 3, employeeCode: 'EMP-1003', firstName: 'Amit', lastName: 'Verma', departmentName: 'Engineering', designationName: 'Fullstack Developer', workEmail: 'amit.verma@priyex.com', userId: 4, roles: ['EMPLOYEE'], primaryRole: 'EMPLOYEE' },
  { employeeId: 4, employeeCode: 'EMP-1004', firstName: 'Pooja', lastName: 'Verma', departmentName: 'Human Resources', designationName: 'HR Executive', workEmail: 'pooja.verma@priyex.com', userId: 5, roles: ['EMPLOYEE', 'HR_ADMIN'], primaryRole: 'HR_ADMIN' }
];

const fallbackUsers: AdminUser[] = [
  { id: 1, email: 'admin@priyex.com', displayName: 'System Administrator', active: true, roles: ['ADMIN', 'SUPER_ADMIN'], createdAt: '2026-01-01' },
  { id: 2, email: 'hr@priyex.com', displayName: 'Priya Sharma (HR Manager)', active: true, roles: ['HR_ADMIN', 'EMPLOYEE'], createdAt: '2026-01-10' },
  { id: 3, email: 'employee@priyex.com', displayName: 'Rakesh Kumar (Employee)', active: true, roles: ['EMPLOYEE', 'MANAGER'], createdAt: '2026-01-15' },
  { id: 4, email: 'amit@priyex.com', displayName: 'Amit Verma (Developer)', active: true, roles: ['EMPLOYEE'], createdAt: '2026-01-18' }
];
