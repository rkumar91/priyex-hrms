import React, { useState } from 'react';
import { Users, UserPlus, Search, Filter, Mail, Phone, Building2, ShieldCheck, MoreVertical } from 'lucide-react';

interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  employmentType: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION';
  joinedDate: string;
}

export const EmployeesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const sampleEmployees: Employee[] = [
    { id: '1', code: 'EMP-1001', name: 'Rajesh Kumar', email: 'rajesh.kumar@priyex.com', phone: '+91 98765 43210', department: 'Engineering', designation: 'Lead Frontend Architect', employmentType: 'FULL_TIME', status: 'ACTIVE', joinedDate: '2023-01-15' },
    { id: '2', code: 'EMP-1002', name: 'Priya Sharma', email: 'priya.sharma@priyex.com', phone: '+91 98765 43211', department: 'Human Resources', designation: 'HR Operations Manager', employmentType: 'FULL_TIME', status: 'ACTIVE', joinedDate: '2023-03-01' },
    { id: '3', code: 'EMP-1003', name: 'Amit Verma', email: 'amit.verma@priyex.com', phone: '+91 98765 43212', department: 'Product', designation: 'Senior Product Manager', employmentType: 'FULL_TIME', status: 'ON_LEAVE', joinedDate: '2023-06-10' },
    { id: '4', code: 'EMP-1004', name: 'Neha Gupta', email: 'neha.gupta@priyex.com', phone: '+91 98765 43213', department: 'Engineering', designation: 'Backend Staff Engineer', employmentType: 'FULL_TIME', status: 'ACTIVE', joinedDate: '2024-02-01' },
    { id: '5', code: 'EMP-1005', name: 'Siddharth Roy', email: 'siddharth.roy@priyex.com', phone: '+91 98765 43214', department: 'Finance', designation: 'Senior Financial Analyst', employmentType: 'PROBATION', status: 'PROBATION', joinedDate: '2026-08-01' },
  ];

  const filtered = sampleEmployees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage employee master records, profiles, and employment lifecycle</p>
        </div>
        <button className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 self-start sm:self-auto">
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
            placeholder="Search by name, code, email or department..."
            className="w-full bg-slate-950 text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>All Departments</span>
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition">
            Export CSV
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
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-900/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow">
                        {emp.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-100">{emp.name}</span>
                        <span className="text-xs text-indigo-400 font-mono">{emp.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-200">{emp.designation}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-500" />
                        {emp.department}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs text-slate-300 space-y-1">
                      <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-500" /> {emp.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-500" /> {emp.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      emp.status === 'ACTIVE' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' :
                      emp.status === 'ON_LEAVE' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' :
                      'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400">
                    {emp.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
