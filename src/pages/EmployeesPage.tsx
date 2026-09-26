import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Download,
  Trash2,
  Edit,
  Eye,
  AlertCircle
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
}

export interface Department {
  id: number;
  code: string;
  name: string;
  employeeCount: number;
}

export const EmployeesPage: React.FC = () => {
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

  // Form State
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

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDept]);

  // Handle Onboard Submission
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
      if (res.success) {
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

  // Handle Delete / Deactivate
  const handleDelete = async (id: string | number) => {
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage employee master records, profiles, and employment lifecycle</p>
        </div>
        <button
          onClick={() => { setIsAddModalOpen(true); setFormError(null); }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Employee</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, email..."
            className="w-full bg-slate-950 text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* All Departments Select */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-800 focus:outline-none focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.employeeCount})
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department & Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs">Loading employee records from API...</p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No employees found matching query.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow">
                          {emp.firstName ? emp.firstName.charAt(0) : 'E'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">{emp.firstName} {emp.lastName}</span>
                          <span className="text-xs text-indigo-400 font-mono">{emp.employeeCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{emp.designationName || 'Software Engineer'}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          {emp.departmentName || 'General'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs text-slate-300 space-y-1">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /> {emp.workEmail}</span>
                        {emp.personalPhone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {emp.personalPhone}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        emp.status === 'ACTIVE' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' :
                        emp.status === 'ON_LEAVE' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' :
                        'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {emp.joiningDate || '2024-01-15'}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === emp.id && (
                        <div className="absolute right-6 top-12 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-20 py-1.5 text-xs text-left">
                          <button
                            onClick={() => { setViewEmployee(emp); setActiveMenuId(null); }}
                            className="w-full px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5 text-indigo-400" /> View Profile
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="w-full px-3 py-2 text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Deactivate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard New Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <span>Onboard New Employee</span>
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Rajesh"
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Kumar"
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  placeholder="rajesh.kumar@priyex.com"
                  className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.personalPhone}
                    onChange={(e) => setFormData({ ...formData, personalPhone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full bg-slate-950 text-slate-100 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  {isSubmitting ? 'Onboarding...' : 'Save & Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employee Profile Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Employee Profile</h2>
              <button onClick={() => setViewEmployee(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {viewEmployee.firstName.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{viewEmployee.firstName} {viewEmployee.lastName}</h3>
                <p className="text-xs text-indigo-400 font-mono">{viewEmployee.employeeCode}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-white">{viewEmployee.workEmail}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-white">{viewEmployee.departmentName || 'Engineering'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className="font-semibold text-emerald-400">{viewEmployee.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Joining Date:</span>
                <span className="font-semibold text-white">{viewEmployee.joiningDate || '2024-01-15'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const fallbackDemoEmployees: Employee[] = [
  { id: 1, employeeCode: 'EMP-1001', firstName: 'Rajesh', lastName: 'Kumar', workEmail: 'rajesh.kumar@priyex.com', personalPhone: '+91 9876543210', departmentName: 'Engineering', designationName: 'Lead Architect', status: 'ACTIVE', joiningDate: '2023-01-15' },
  { id: 2, employeeCode: 'EMP-1002', firstName: 'Priya', lastName: 'Sharma', workEmail: 'priya.sharma@priyex.com', personalPhone: '+91 9876543211', departmentName: 'Human Resources', designationName: 'HR Manager', status: 'ACTIVE', joiningDate: '2023-03-01' },
  { id: 3, employeeCode: 'EMP-1003', firstName: 'Amit', lastName: 'Verma', workEmail: 'amit.verma@priyex.com', personalPhone: '+91 9876543212', departmentName: 'Product', designationName: 'Product Manager', status: 'ON_LEAVE', joiningDate: '2023-06-10' },
];
