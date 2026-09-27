import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { canManageEmployees, canDeactivateEmployees } from '../utils/rbac';
import api from '../api/client';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  X,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  UserCheck,
  Edit3,
  MapPin,
  CreditCard,
  Send,
  Shield,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  FileText,
  BadgeCheck,
  Camera
} from 'lucide-react';

export interface Employee {
  id: string | number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  personalPhone?: string;
  departmentName?: string;
  designationName?: string;
  departmentId?: number;
  employmentType?: string;
  status: string;
  joiningDate?: string;
  photoUrl?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  pfNumber?: string;
  uanNumber?: string;
}

export interface HrPersonnel {
  userId: number;
  employeeId?: number;
  employeeCode?: string;
  fullName: string;
  workEmail: string;
  designationName?: string;
  departmentName?: string;
  roles?: string[];
}

export interface Department {
  id: number;
  code: string;
  name: string;
  employeeCount: number;
}

export const EmployeesPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = canManageEmployees(user);
  const canDeactivate = canDeactivateEmployees(user);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // My Profile Self-Service states
  const [myProfile, setMyProfile] = useState<Employee | null>(null);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);
  const [isHrQueryModalOpen, setIsHrQueryModalOpen] = useState(false);

  // Self Edit Contact & Profile Form (Photo, Phone, Address)
  const [selfEditData, setSelfEditData] = useState({
    personalPhone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    photoUrl: '',
  });

  // HR Helpdesk Query Form
  const [hrPersonnelList, setHrPersonnelList] = useState<HrPersonnel[]>([]);
  const [isLoadingHrList, setIsLoadingHrList] = useState(false);
  const [hrQueryData, setHrQueryData] = useState({
    assignedHrUserId: '',
    category: 'GENERAL',
    subject: '',
    message: '',
    priority: 'NORMAL'
  });
  const [isSendingQuery, setIsSendingQuery] = useState(false);

  // Critical Change Request Form
  const [requestData, setRequestData] = useState({
    requestType: 'BANK_ACCOUNT',
    fieldName: 'Bank Account Number',
    requestedValue: '',
    reason: ''
  });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form State (Onboard Employee)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workEmail: '',
    personalPhone: '',
    departmentId: '',
    designationName: 'Software Engineer',
    employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
  });

  // Fetch Employees & Departments
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.query = searchTerm;
      if (selectedDept !== 'ALL') params.departmentId = selectedDept;

      const res: any = await api.get('/employees', { params });
      if (res.success && res.data?.content) {
        setEmployees(res.data.content);
      } else {
        setEmployees(fallbackDemoEmployees);
      }
    } catch (err) {
      setEmployees(fallbackDemoEmployees);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res: any = await api.get('/organization/departments');
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch (e) {
      // Ignore fallback
    }
  };

  const fetchHrPersonnel = async () => {
    setIsLoadingHrList(true);
    try {
      const res: any = await api.get('/hr-queries/personnel');
      if (res.success && Array.isArray(res.data)) {
        setHrPersonnelList(res.data);
      } else {
        setHrPersonnelList(fallbackHrPersonnel);
      }
    } catch (e) {
      setHrPersonnelList(fallbackHrPersonnel);
    } finally {
      setIsLoadingHrList(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res: any = await api.get('/employees/me');
      if (res.success && res.data) {
        setMyProfile(res.data);
        setSelfEditData({
          personalPhone: res.data.personalPhone || '',
          addressLine1: res.data.addressLine1 || '',
          city: res.data.city || '',
          state: res.data.state || '',
          postalCode: res.data.postalCode || '',
          photoUrl: res.data.photoUrl || ''
        });
        return res.data;
      }
    } catch (e) {
      // Fallback demo profile
      const demo = fallbackDemoEmployees[0];
      setMyProfile(demo);
      return demo;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDept]);

  const handleOpenMyProfile = async () => {
    await fetchMyProfile();
    setIsMyProfileOpen(true);
  };

  const handleOpenHrQueryModal = async () => {
    if (hrPersonnelList.length === 0) {
      await fetchHrPersonnel();
    }
    setIsHrQueryModalOpen(true);
  };

  // Submit Self Contact, Address & Photo update
  const handleSaveSelfContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res: any = await api.put('/employees/me', selfEditData);
      if (res.success && res.data) {
        setMyProfile(res.data);
      }
      setIsEditContactModalOpen(false);
      setFeedbackMsg('Your personal profile (image, contact & address) was updated successfully!');
      fetchEmployees();
    } catch (err: any) {
      alert(err?.message || 'Failed to update profile info');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Query to HR
  const handleSendHrQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingQuery(true);
    try {
      const payload = {
        category: hrQueryData.category,
        subject: hrQueryData.subject,
        message: hrQueryData.message,
        priority: hrQueryData.priority,
        assignedHrUserId: hrQueryData.assignedHrUserId ? Number(hrQueryData.assignedHrUserId) : null
      };
      await api.post('/hr-queries', payload);
      setIsHrQueryModalOpen(false);
      setHrQueryData({
        assignedHrUserId: '',
        category: 'GENERAL',
        subject: '',
        message: '',
        priority: 'NORMAL'
      });
      setFeedbackMsg('Your query has been directly dispatched to the HR team. You will be notified upon review.');
    } catch (err: any) {
      alert(err?.message || 'Failed to send query to HR');
    } finally {
      setIsSendingQuery(false);
    }
  };

  // Submit Critical Change Request to HR (Bank account, Name, Email)
  const handleSubmitCriticalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/profile-requests', requestData);
      setIsChangeRequestModalOpen(false);
      setRequestData({
        requestType: 'BANK_ACCOUNT',
        fieldName: 'Bank Account Number',
        requestedValue: '',
        reason: ''
      });
      setFeedbackMsg('Your change request has been submitted to HR Manager for review & approval.');
    } catch (err: any) {
      alert(err?.message || 'Failed to submit change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Onboard Submission (HR / Admin)
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
          designationName: 'Software Engineer',
          employmentType: 'FULL_TIME',
          joiningDate: new Date().toISOString().split('T')[0],
        });
        fetchEmployees();
      }
    } catch (err: any) {
      setFormError(err?.message || err || 'Failed to onboard employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('CSV Export failed or server returned non-file payload');
    }
  };

  // Handle Delete / Deactivate (Super Admin only)
  const handleDelete = async (id: string | number) => {
    if (!canDeactivate) {
      alert('Access denied: Only Super Admin has permission to deactivate employee records.');
      return;
    }
    if (confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err: any) {
        alert(err?.message || 'Failed to deactivate employee');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            {canManage
              ? 'Manage employee master records, profiles, and employment lifecycle'
              : 'Search and connect with colleagues across departments and teams'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenMyProfile}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold border border-emerald-200 transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>My Profile & Settings</span>
          </button>

          {canManage && (
            <button
              onClick={() => { setIsAddModalOpen(true); setFormError(null); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard New Employee</span>
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="cursor-pointer text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, email..."
            className="w-full bg-slate-50 text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* All Departments Select */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.employeeCount})
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {canManage && (
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Employee</th>
                <th className="py-3.5 px-5">Department & Role</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 px-5 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs font-medium">Loading employee records...</p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-5 text-center text-slate-500 text-sm">
                    No employees found matching query.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {emp.photoUrl ? (
                          <img
                            src={emp.photoUrl}
                            alt={`${emp.firstName} ${emp.lastName}`}
                            className="w-10 h-10 rounded-full object-cover shadow-xs border border-emerald-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : null}
                        {(!emp.photoUrl) && (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            {emp.firstName ? emp.firstName.charAt(0) : 'E'}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</span>
                          <span className="text-xs text-emerald-800 font-mono font-semibold">{emp.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{emp.designationName || 'Software Engineer'}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {emp.departmentName || 'General'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col text-xs text-slate-600 space-y-1">
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {emp.workEmail}</span>
                        {/* Only display personal phone to HR/Admin or if viewing self */}
                        {(canManage || String(user?.employeeId) === String(emp.id)) && emp.personalPhone && (
                          <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {emp.personalPhone}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        emp.status === 'ON_LEAVE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs font-mono font-medium text-slate-600">
                      {emp.joiningDate || '2024-01-15'}
                    </td>
                    <td className="py-3.5 px-5 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === emp.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-6 top-12 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1.5 text-xs text-left">
                            <button
                              onClick={() => { setViewEmployee(emp); setActiveMenuId(null); }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" /> View Profile
                            </button>
                            {canDeactivate && (
                              <button
                                onClick={() => { setActiveMenuId(null); handleDelete(emp.id); }}
                                className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Deactivate
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard New Employee Modal (HR / Admin only) */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Onboard New Employee</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Personal Phone</label>
                <input
                  type="text"
                  value={formData.personalPhone}
                  onChange={(e) => setFormData({ ...formData, personalPhone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition"
                >
                  {isSubmitting ? 'Onboarding...' : 'Save & Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Colleague Profile Modal (Public Info for Employee vs Full for HR) */}
      {viewEmployee && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {canManage ? 'Full Employee Master Record' : 'Public Directory Card'}
                </h2>
              </div>
              <button onClick={() => setViewEmployee(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {viewEmployee.photoUrl ? (
                <img
                  src={viewEmployee.photoUrl}
                  alt={`${viewEmployee.firstName} ${viewEmployee.lastName}`}
                  className="w-14 h-14 rounded-full object-cover shadow-xs border-2 border-emerald-400"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              {(!viewEmployee.photoUrl) && (
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
                  {viewEmployee.firstName ? viewEmployee.firstName.charAt(0) : 'E'}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewEmployee.firstName} {viewEmployee.lastName}</h3>
                <p className="text-xs text-emerald-700 font-mono font-semibold">{viewEmployee.employeeCode}</p>
                <p className="text-xs text-slate-500 mt-0.5">{viewEmployee.designationName || 'Software Engineer'}</p>
              </div>
            </div>

            {!canManage && (
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-800 flex items-center gap-2 font-medium">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Public Colleague Directory • Personal address & bank details protected</span>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Work Email:</span>
                <span className="font-semibold text-slate-900 font-mono">{viewEmployee.workEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Department:</span>
                <span className="font-semibold text-slate-900">{viewEmployee.departmentName || 'Engineering'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="font-bold text-emerald-700">{viewEmployee.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Joining Date:</span>
                <span className="font-semibold text-slate-900">{viewEmployee.joiningDate || '2024-01-15'}</span>
              </div>

              {/* Only show sensitive data to HR/Admin */}
              {canManage && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Personal Contact:</span>
                    <span className="font-semibold text-slate-900">{viewEmployee.personalPhone || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Address:</span>
                    <span className="font-semibold text-slate-900">{viewEmployee.addressLine1 ? `${viewEmployee.addressLine1}, ${viewEmployee.city || ''}` : 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Bank Account:</span>
                    <span className="font-mono text-emerald-800 font-bold">{viewEmployee.bankAccountNumber || 'Pending assignment'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* My Profile & Self-Service Modal */}
      {isMyProfileOpen && myProfile && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">My Employee Profile & Settings</h2>
              </div>
              <button onClick={() => setIsMyProfileOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar and Name */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3.5">
                {myProfile.photoUrl ? (
                  <img
                    src={myProfile.photoUrl}
                    alt={`${myProfile.firstName} ${myProfile.lastName}`}
                    className="w-14 h-14 rounded-full object-cover shadow-xs border-2 border-emerald-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}
                {(!myProfile.photoUrl) && (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
                    {myProfile.firstName ? myProfile.firstName.charAt(0) : 'U'}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-slate-900">{myProfile.firstName} {myProfile.lastName}</h3>
                  <span className="text-xs font-mono font-semibold text-emerald-700">{myProfile.employeeCode}</span>
                  <div className="text-xs text-slate-500 mt-0.5">{myProfile.designationName || 'Lead Architect'} • {myProfile.departmentName || 'Engineering'}</div>
                </div>
              </div>

              <button
                onClick={() => setIsEditContactModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Info
              </button>
            </div>

            {/* Direct Edit Scope (Contact & Address) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact & Address Details</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">Self-Editable</span>
              </div>
              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Personal Phone:</span>
                  <span className="font-semibold text-slate-900">{myProfile.personalPhone || 'Not set'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Current Address:</span>
                  <span className="font-semibold text-slate-900 text-right max-w-xs truncate">
                    {myProfile.addressLine1 ? `${myProfile.addressLine1}, ${myProfile.city || ''} ${myProfile.postalCode || ''}` : 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory & Retirement (EPFO - PF & UAN details) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Statutory & Retirement (EPFO)
                </span>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200">Social Security Record</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> PF Account Number:
                  </span>
                  <span className="font-mono font-bold text-slate-900">{myProfile.pfNumber || 'MH/BAN/0012345/000/0192834'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" /> Universal Account Number (UAN):
                  </span>
                  <span className="font-mono font-bold text-emerald-800 tracking-wider">{myProfile.uanNumber || '101293847561'}</span>
                </div>
              </div>
            </div>

            {/* Critical Data Scope (Bank Account & Legal Name) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Financial & Official Records</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold border border-amber-200">Requires HR Approval</span>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-slate-400" /> Salary Account:</span>
                  <span className="font-mono font-bold text-emerald-800">{myProfile.bankAccountNumber || 'HDFC - 5010098234123'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Official Email:</span>
                  <span className="font-semibold text-slate-900">{myProfile.workEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setIsChangeRequestModalOpen(true)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
                >
                  <Send className="w-3.5 h-3.5 text-amber-600" />
                  <span>Request Bank / Name Update</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenHrQueryModal}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Query to HR</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Direct Edit Self-Profile Modal (Photo, Phone, Address) */}
      {isEditContactModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>Update Profile Photo, Contact & Address</span>
              </h3>
              <button onClick={() => setIsEditContactModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSelfContact} className="mt-4 space-y-3.5 text-xs">
              {/* Photo URL with preview */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Profile Photo / Avatar URL</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or image URL"
                    value={selfEditData.photoUrl}
                    onChange={(e) => setSelfEditData({ ...selfEditData, photoUrl: e.target.value })}
                    className="flex-1 bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  {selfEditData.photoUrl ? (
                    <img
                      src={selfEditData.photoUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Paste any HTTPS image link to personalize your HRMS avatar.</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Personal Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={selfEditData.personalPhone}
                  onChange={(e) => setSelfEditData({ ...selfEditData, personalPhone: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Residential Address (Line 1)</label>
                <input
                  type="text"
                  placeholder="Flat 402, Green Valley Apartments"
                  value={selfEditData.addressLine1}
                  onChange={(e) => setSelfEditData({ ...selfEditData, addressLine1: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Greater Noida"
                    value={selfEditData.city}
                    onChange={(e) => setSelfEditData({ ...selfEditData, city: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Uttar Pradesh"
                    value={selfEditData.state}
                    onChange={(e) => setSelfEditData({ ...selfEditData, state: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Postal Code (PIN)</label>
                <input
                  type="text"
                  placeholder="201306"
                  value={selfEditData.postalCode}
                  onChange={(e) => setSelfEditData({ ...selfEditData, postalCode: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Critical Request Modal (Bank Account / Legal Name Change) */}
      {isChangeRequestModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Request Critical Profile Update</span>
              </h3>
              <button onClick={() => setIsChangeRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Changes to bank accounts and legal identity require verification and approval by HR Manager.
            </p>

            <form onSubmit={handleSubmitCriticalRequest} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Update Type</label>
                <select
                  value={requestData.requestType}
                  onChange={(e) => {
                    const t = e.target.value;
                    setRequestData({
                      ...requestData,
                      requestType: t,
                      fieldName: t === 'BANK_ACCOUNT' ? 'Bank Account Number' : t === 'CONTACT_NAME' ? 'Legal Full Name' : 'Work Email'
                    });
                  }}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="BANK_ACCOUNT">Bank Account & IFSC</option>
                  <option value="CONTACT_NAME">Legal Full Name</option>
                  <option value="EMAIL">Work / Official Email</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Requested Value *</label>
                <input
                  type="text"
                  required
                  placeholder={requestData.requestType === 'BANK_ACCOUNT' ? 'e.g. Axis Bank - 921010048192834 (IFSC: UTIB0000123)' : 'e.g. Rajesh K. Sharma'}
                  value={requestData.requestedValue}
                  onChange={(e) => setRequestData({ ...requestData, requestedValue: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Change</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this change is requested..."
                  value={requestData.reason}
                  onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsChangeRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to HR Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Send Query to HR Modal (with Dropdown of HR Personnel) */}
      {isHrQueryModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Submit Query to HR / People Support</span>
              </h3>
              <button onClick={() => setIsHrQueryModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Have a question about payroll, PF, leave balances, or company policies? Select your HR point of contact below.
            </p>

            <form onSubmit={handleSendHrQuery} className="mt-4 space-y-3.5 text-xs">
              {/* HR Representative Dropdown */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                  <span>Assigned HR Representative *</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Active HR Desk</span>
                </label>
                <select
                  required
                  value={hrQueryData.assignedHrUserId}
                  onChange={(e) => setHrQueryData({ ...hrQueryData, assignedHrUserId: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="">-- Choose HR Representative --</option>
                  {hrPersonnelList.map((hr) => (
                    <option key={hr.userId} value={hr.userId}>
                      {hr.fullName} ({hr.designationName || 'HR Officer'} • {hr.workEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Query Category</label>
                  <select
                    value={hrQueryData.category}
                    onChange={(e) => setHrQueryData({ ...hrQueryData, category: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="PAYROLL">Payroll & Salary Slip</option>
                    <option value="TAX_PF">PF & Tax Withholding</option>
                    <option value="LEAVES">Leaves & Attendance</option>
                    <option value="BENEFITS">Medical & Insurance</option>
                    <option value="GENERAL">General Policy Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={hrQueryData.priority}
                    onChange={(e) => setHrQueryData({ ...hrQueryData, priority: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Requires immediate action)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Query regarding PF passbook balance transfer / Salary deduction"
                  value={hrQueryData.subject}
                  onChange={(e) => setHrQueryData({ ...hrQueryData, subject: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Query Details & Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your issue or question in detail for the HR team..."
                  value={hrQueryData.message}
                  onChange={(e) => setHrQueryData({ ...hrQueryData, message: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHrQueryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingQuery}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingQuery ? 'Sending...' : 'Dispatch Query to HR'}</span>
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

const fallbackDemoEmployees: Employee[] = [
  { id: 1, employeeCode: 'EMP-1001', firstName: 'Rajesh', lastName: 'Kumar', workEmail: 'rajesh.kumar@priyex.com', personalPhone: '+91 9876543210', departmentName: 'Engineering', designationName: 'Lead Architect', status: 'ACTIVE', joiningDate: '2023-01-15', addressLine1: 'Flat 402, Green Valley Apartments', city: 'Greater Noida', state: 'Uttar Pradesh', postalCode: '201306', bankAccountNumber: 'HDFC - 5010098234123', pfNumber: 'MH/BAN/0012345/000/0192834', uanNumber: '101293847561' },
  { id: 2, employeeCode: 'EMP-1002', firstName: 'Priya', lastName: 'Sharma', workEmail: 'priya.sharma@priyex.com', personalPhone: '+91 9876543211', departmentName: 'Human Resources', designationName: 'HR Manager', status: 'ACTIVE', joiningDate: '2023-03-01', addressLine1: 'House 12, Sector 62', city: 'Noida', state: 'Uttar Pradesh', postalCode: '201301', bankAccountNumber: 'ICICI - 002105001928', pfNumber: 'MH/BAN/0012345/000/0192835', uanNumber: '101293847562' },
  { id: 3, employeeCode: 'EMP-1003', firstName: 'Amit', lastName: 'Verma', workEmail: 'amit.verma@priyex.com', personalPhone: '+91 9876543212', departmentName: 'Product', designationName: 'Product Manager', status: 'ON_LEAVE', joiningDate: '2023-06-10', addressLine1: 'Pocket B, Mayur Vihar', city: 'New Delhi', state: 'Delhi', postalCode: '110091', bankAccountNumber: 'SBI - 30981240912', pfNumber: 'MH/BAN/0012345/000/0192836', uanNumber: '101293847563' },
];

const fallbackHrPersonnel: HrPersonnel[] = [
  { userId: 2, fullName: 'Priya Sharma (HR Manager)', workEmail: 'priya.sharma@priyex.com', designationName: 'HR Manager', departmentName: 'Human Resources', roles: ['HR_ADMIN'] },
  { userId: 1, fullName: 'System Administrator (People Ops)', workEmail: 'admin@priyex.com', designationName: 'Operations Lead', departmentName: 'Human Resources', roles: ['SUPER_ADMIN'] }
];

