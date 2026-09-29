import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { isSuperAdmin } from '../utils/rbac';
import api from '../api/client';
import {
  UserCog,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Mail,
  Building2,
  Briefcase,
  KeyRound,
  Shield,
  Layers,
  Sparkles,
  ArrowRight
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
  active: boolean;
  roles: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export const UsersRolesPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = isSuperAdmin(user);

  // Tab State: 'EMPLOYEE_ROLES' vs 'SYSTEM_ACCOUNTS'
  const [activeTab, setActiveTab] = useState<'EMPLOYEE_ROLES' | 'SYSTEM_ACCOUNTS'>('EMPLOYEE_ROLES');

  // Employee Roles State
  const [employeeRoles, setEmployeeRoles] = useState<EmployeeUserRole[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeUserRole | null>(null);

  // System Users State
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('EMPLOYEE');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Employee Roles (every employee in the company)
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

  useEffect(() => {
    fetchEmployeeRoles();
    fetchUsers();
  }, []);

  // Update role for an Employee
  const handleEmployeeRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsUpdating(true);
    setMessage(null);
    try {
      const res: any = await api.put(`/admin/users/employees/${selectedEmp.employeeId}/role`, { role: selectedRole });
      if (res.success || res.data) {
        setMessage({
          type: 'success',
          text: `Successfully assigned role "${selectedRole}" to ${selectedEmp.firstName} ${selectedEmp.lastName} (${selectedEmp.employeeCode})!`
        });
        setSelectedEmp(null);
        fetchEmployeeRoles();
        fetchUsers();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update employee role' });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update role for raw User account
  const handleUserRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true);
    setMessage(null);
    try {
      const res: any = await api.put(`/admin/users/${selectedUser.id}/role`, { role: selectedRole });
      if (res.success || res.data) {
        setMessage({
          type: 'success',
          text: `Successfully updated ${selectedUser.displayName}'s role to ${selectedRole}!`
        });
        setSelectedUser(null);
        fetchUsers();
        fetchEmployeeRoles();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to update user role' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (targetUser: AdminUser) => {
    try {
      const newStatus = !targetUser.active;
      await api.put(`/admin/users/${targetUser.id}/status`, { active: newStatus });
      fetchUsers();
      fetchEmployeeRoles();
    } catch (err: any) {
      alert(err?.message || 'Failed to update user status');
    }
  };

  // Filter lists based on search
  const filteredEmployees = employeeRoles.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.workEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.primaryRole && e.primaryRole.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredUsers = usersList.filter(u =>
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const superAdminCount = employeeRoles.filter(e => e.primaryRole === 'SUPER_ADMIN' || e.primaryRole === 'ADMIN').length;
  const hrAdminCount = employeeRoles.filter(e => e.primaryRole === 'HR_ADMIN' || e.primaryRole === 'HR_EXECUTIVE').length;
  const regularEmployeeCount = employeeRoles.filter(e => e.primaryRole === 'EMPLOYEE').length;
  const noAccountCount = employeeRoles.filter(e => !e.userId || e.primaryRole === 'NO_ACCOUNT').length;

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-sm text-slate-500">
          Only Super Administrators have authority to manage user system roles and security privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <UserCog className="w-6 h-6 text-emerald-600" />
              <span>Admin Role & User Governance</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              Manage system roles for every employee in the company, promote to HR Manager, and configure access permissions.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => { setActiveTab('EMPLOYEE_ROLES'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'EMPLOYEE_ROLES'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>All Employees & Roles ({employeeRoles.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('SYSTEM_ACCOUNTS'); setSearchTerm(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'SYSTEM_ACCOUNTS'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-teal-600" />
              <span>System Logins ({usersList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="cursor-pointer text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{employeeRoles.length}</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Every employee mapped</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Super Admins</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{superAdminCount}</div>
          <span className="text-[11px] text-emerald-600/80 mt-0.5 block">Full platform control</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">HR Managers</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">{hrAdminCount}</div>
          <span className="text-[11px] text-teal-600/80 mt-0.5 block">Maker-checker approvers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Self-Service Users</span>
          <div className="text-2xl font-extrabold text-cyan-600 mt-1">{regularEmployeeCount}</div>
          <span className="text-[11px] text-cyan-600/80 mt-0.5 block">Employee portal role</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'EMPLOYEE_ROLES' ? "Search by employee name, code, email, or role..." : "Search users by name or login email..."}
            className="w-full bg-slate-50 text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>
      </div>

      {/* TAB 1: EMPLOYEE ROLES TABLE (Every employee in company) */}
      {activeTab === 'EMPLOYEE_ROLES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Employee Master Role Governance Table ({filteredEmployees.length} records)
            </span>
            <span className="text-xs text-slate-500">
              Shows all active company personnel and their current system security role.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3.5 px-5">Employee</th>
                  <th className="py-3.5 px-5">Department & Title</th>
                  <th className="py-3.5 px-5">Work Email</th>
                  <th className="py-3.5 px-5">Account Status</th>
                  <th className="py-3.5 px-5">Assigned System Role</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-5 text-center text-slate-500">
                      <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="mt-2 text-xs font-medium">Loading employee role table...</p>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-5 text-center text-slate-500 text-sm">
                      No employees match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const role = emp.primaryRole || 'NO_ROLE';
                    const hasAccount = !!emp.userId;

                    return (
                      <tr key={emp.employeeId} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                              {emp.firstName ? emp.firstName.charAt(0) : 'E'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{emp.firstName} {emp.lastName}</span>
                              <span className="text-[11px] font-mono font-semibold text-blue-700">{emp.employeeCode}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-xs text-slate-600">
                          <span className="font-semibold text-slate-800 block">{emp.designationName || 'Software Engineer'}</span>
                          <span className="text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3" />
                            {emp.departmentName || 'Engineering'}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-xs text-slate-600 font-mono">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {emp.workEmail}</span>
                        </td>

                        <td className="py-3.5 px-5">
                          {hasAccount ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Linked (User #{emp.userId})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              No Login Yet
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold font-mono ${
                            role === 'SUPER_ADMIN' || role === 'ADMIN'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : role === 'HR_ADMIN' || role === 'HR_EXECUTIVE'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : role === 'MANAGER'
                              ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              : role === 'EMPLOYEE'
                              ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}>
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {role}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              setSelectedEmp(emp);
                              setSelectedRole(role === 'NO_ROLE' || role === 'NO_ACCOUNT' ? 'EMPLOYEE' : role);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                          >
                            Assign / Change Role
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

      {/* TAB 2: SYSTEM LOGIN ACCOUNTS */}
      {activeTab === 'SYSTEM_ACCOUNTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              System Login Credentials & Auth Accounts ({filteredUsers.length} records)
            </span>
            <span className="text-xs text-slate-500">
              Manage password status, login activity, and direct auth accounts.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-5">Email</th>
                  <th className="py-3.5 px-5">System Role</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Last Login</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-5 text-center text-slate-500 text-sm">
                      No system users found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const primaryRole = u.roles?.[0] || 'EMPLOYEE';
                    return (
                      <tr key={u.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                              {u.displayName ? u.displayName.charAt(0) : 'U'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{u.displayName}</span>
                              <span className="text-[11px] font-mono text-slate-400">USR-{1000 + u.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {u.email}</span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold font-mono ${
                            primaryRole === 'SUPER_ADMIN' || primaryRole === 'ADMIN'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : primaryRole === 'HR_ADMIN' || primaryRole === 'HR_EXECUTIVE'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                          }`}>
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {primaryRole}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold cursor-pointer transition ${
                              u.active
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {u.active ? 'ACTIVE' : 'INACTIVE'}
                          </button>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => { setSelectedUser(u); setSelectedRole(primaryRole); }}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition cursor-pointer"
                          >
                            Change Role
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

      {/* Role Assignment Modal for an EMPLOYEE */}
      {selectedEmp && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-emerald-600" />
                <span>Assign Role for Employee</span>
              </h2>
              <button onClick={() => setSelectedEmp(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedEmp.firstName} {selectedEmp.lastName}</span>
                <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{selectedEmp.employeeCode}</span>
              </div>
              <div className="text-slate-500">{selectedEmp.designationName || 'Software Engineer'} • {selectedEmp.departmentName || 'Engineering'}</div>
              <div className="text-slate-600 font-mono text-[11px] pt-1 border-t border-slate-200">{selectedEmp.workEmail}</div>
            </div>

            {!selectedEmp.userId && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  This employee does not have a user account yet. Assigning a role will automatically create their system credentials with default password <b>Admin@123</b>.
                </span>
              </div>
            )}

            <form onSubmit={handleEmployeeRoleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold mb-1">Select System Role *</label>

                {[
                  { role: 'SUPER_ADMIN', title: 'Super Administrator', desc: 'Full platform access, user role assignment, employee lifecycle deactivation' },
                  { role: 'HR_ADMIN', title: 'HR Manager', desc: 'Manage employee master records, onboard hires, review & approve profile change requests, answer HR queries' },
                  { role: 'EMPLOYEE', title: 'Employee (Self-Service)', desc: 'View public colleague directory, self-update contact/address, submit profile requests & HR queries' },
                  { role: 'MANAGER', title: 'Manager', desc: 'Team attendance, leave reviews, and shift approvals' },
                ].map((item) => (
                  <label
                    key={item.role}
                    onClick={() => setSelectedRole(item.role)}
                    className={`block p-3 rounded-2xl border cursor-pointer transition ${
                      selectedRole === item.role
                        ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                      <span className="font-mono text-[10px] text-blue-700 font-bold">{item.role}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                  </label>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Apply Role to Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Role Assignment Modal for Raw User */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-emerald-600" />
                <span>Assign System Role</span>
              </h2>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="font-bold text-slate-900">{selectedUser.displayName}</div>
              <div className="text-slate-500">{selectedUser.email}</div>
            </div>

            <form onSubmit={handleUserRoleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-700 font-bold mb-1">Select System Role *</label>

                {[
                  { role: 'SUPER_ADMIN', title: 'Super Administrator', desc: 'Full platform access, user role assignment, employee lifecycle deactivation' },
                  { role: 'HR_ADMIN', title: 'HR Manager', desc: 'Manage employee master records, onboard hires, review & approve profile change requests' },
                  { role: 'EMPLOYEE', title: 'Employee (Self-Service)', desc: 'View public colleague directory, self-update contact/address, submit profile requests' },
                  { role: 'MANAGER', title: 'Manager', desc: 'Team attendance, leave reviews, and shift approvals' },
                ].map((item) => (
                  <label
                    key={item.role}
                    onClick={() => setSelectedRole(item.role)}
                    className={`block p-3 rounded-2xl border cursor-pointer transition ${
                      selectedRole === item.role
                        ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                      <span className="font-mono text-[10px] text-blue-700 font-bold">{item.role}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{item.desc}</p>
                  </label>
                ))}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating Role...' : 'Save & Update Role'}
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
  { employeeId: 1, employeeCode: 'EMP-1001', firstName: 'Rajesh', lastName: 'Kumar', departmentName: 'Engineering', designationName: 'Lead Architect', workEmail: 'rajesh.kumar@priyex.com', userId: 3, userEmail: 'employee@priyex.com', userActive: true, roles: ['EMPLOYEE'], primaryRole: 'EMPLOYEE' },
  { employeeId: 2, employeeCode: 'EMP-1002', firstName: 'Priya', lastName: 'Sharma', departmentName: 'Human Resources', designationName: 'HR Manager', workEmail: 'priya.sharma@priyex.com', userId: 2, userEmail: 'hr@priyex.com', userActive: true, roles: ['HR_ADMIN'], primaryRole: 'HR_ADMIN' },
  { employeeId: 3, employeeCode: 'EMP-1003', firstName: 'Amit', lastName: 'Verma', departmentName: 'Product', designationName: 'Product Manager', workEmail: 'amit.verma@priyex.com', primaryRole: 'NO_ACCOUNT' },
];

const fallbackUsers: AdminUser[] = [
  { id: 1, email: 'admin@priyex.com', displayName: 'System Administrator', active: true, roles: ['SUPER_ADMIN'], createdAt: '2026-01-01' },
  { id: 2, email: 'hr@priyex.com', displayName: 'Priya Sharma (HR Manager)', active: true, roles: ['HR_ADMIN'], createdAt: '2026-01-10' },
  { id: 3, email: 'employee@priyex.com', displayName: 'Rajesh Kumar (Employee)', active: true, roles: ['EMPLOYEE'], createdAt: '2026-01-15' },
];
