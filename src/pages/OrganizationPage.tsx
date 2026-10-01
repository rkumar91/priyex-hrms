import React, { useState, useEffect } from 'react';
import {
  Building,
  GitFork,
  MapPin,
  Layers,
  CalendarCheck2,
  PlusCircle,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  Save,
  Search,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isHrAdmin } from '../utils/rbac';
import api from '../api/client';

export interface OrgLeavePolicy {
  id: number;
  companyId: number;
  leaveCode: string;
  leaveName: string;
  annualDays: number;
  isPaid: boolean;
  carryForwardAllowed: boolean;
  maxCarryForwardDays: number;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const defaultPolicies: OrgLeavePolicy[] = [
  {
    id: 1,
    companyId: 1,
    leaveCode: 'CL',
    leaveName: 'Casual Leave (CL)',
    annualDays: 12,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    description: 'Annual casual leaves for personal exigencies and short planned breaks. Lapses annually.',
    isActive: true
  },
  {
    id: 2,
    companyId: 1,
    leaveCode: 'SL',
    leaveName: 'Sick Leave (SL)',
    annualDays: 10,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    description: 'Medical and sickness leave with health recovery entitlement. Medical cert required for >2 days.',
    isActive: true
  },
  {
    id: 3,
    companyId: 1,
    leaveCode: 'PL',
    leaveName: 'Privilege Leave (PL / Earned Leave)',
    annualDays: 15,
    isPaid: true,
    carryForwardAllowed: true,
    maxCarryForwardDays: 10,
    description: 'Privilege/Earned leaves accrued annually for vacation and long absences. Roll over up to 10 days.',
    isActive: true
  },
  {
    id: 4,
    companyId: 1,
    leaveCode: 'MATERNITY',
    leaveName: 'Maternity Leave',
    annualDays: 180,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    description: 'Statutory maternity leave entitlement for eligible female employees under the Maternity Benefit Act.',
    isActive: true
  },
  {
    id: 5,
    companyId: 1,
    leaveCode: 'PATERNITY',
    leaveName: 'Paternity Leave',
    annualDays: 15,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    description: 'Paternity leave for new fathers upon childbirth, available within 6 months of delivery.',
    isActive: true
  },
  {
    id: 6,
    companyId: 1,
    leaveCode: 'BEREAVEMENT',
    leaveName: 'Bereavement / Compassionate Leave',
    annualDays: 5,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    description: 'Compassionate leave granted in bereavement of immediate family members.',
    isActive: true
  }
];

export const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const canManage = isHrAdmin(user);

  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'LEAVE_POLICIES'>('LEAVE_POLICIES');
  const [policies, setPolicies] = useState<OrgLeavePolicy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<OrgLeavePolicy | null>(null);
  const [policyForm, setPolicyForm] = useState({
    leaveCode: '',
    leaveName: '',
    annualDays: 12,
    isPaid: true,
    carryForwardAllowed: false,
    maxCarryForwardDays: 0,
    description: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const departments = [
    { name: 'Engineering & Technology', head: 'Rajesh Kumar', count: 65, costCenter: 'CC-ENG-01' },
    { name: 'Human Resources', head: 'Priya Sharma', count: 12, costCenter: 'CC-HR-01' },
    { name: 'Product Management', head: 'Amit Verma', count: 18, costCenter: 'CC-PRD-01' },
    { name: 'Finance & Accounts', head: 'Siddharth Roy', count: 8, costCenter: 'CC-FIN-01' },
  ];

  // Fetch Policies
  const fetchPolicies = async () => {
    setIsLoadingPolicies(true);
    try {
      const res: any = await api.get('/organization/leave-policies');
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPolicies(res.data);
      } else {
        setPolicies(defaultPolicies);
      }
    } catch (e) {
      setPolicies(defaultPolicies);
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const openCreateModal = () => {
    setEditingPolicy(null);
    setPolicyForm({
      leaveCode: '',
      leaveName: '',
      annualDays: 12,
      isPaid: true,
      carryForwardAllowed: false,
      maxCarryForwardDays: 0,
      description: '',
      isActive: true
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: OrgLeavePolicy) => {
    setEditingPolicy(p);
    setPolicyForm({
      leaveCode: p.leaveCode,
      leaveName: p.leaveName,
      annualDays: p.annualDays,
      isPaid: p.isPaid,
      carryForwardAllowed: p.carryForwardAllowed,
      maxCarryForwardDays: p.maxCarryForwardDays || 0,
      description: p.description || '',
      isActive: p.isActive
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyForm.leaveCode.trim() || !policyForm.leaveName.trim()) {
      setFormError('Leave code and leave name are required');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingPolicy) {
        // Update existing
        const res: any = await api.put(`/organization/leave-policies/${editingPolicy.id}`, policyForm);
        if (res.success || res.data) {
          setIsModalOpen(false);
          fetchPolicies();
        } else {
          setFormError(res.message || 'Failed to update leave policy');
        }
      } else {
        // Create new
        const res: any = await api.post('/organization/leave-policies', policyForm);
        if (res.success || res.data) {
          setIsModalOpen(false);
          fetchPolicies();
        } else {
          setFormError(res.message || 'Failed to create leave policy');
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePolicy = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this leave policy?')) return;
    try {
      await api.delete(`/organization/leave-policies/${id}`);
      fetchPolicies();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete leave policy');
    }
  };

  // Color config for leave codes
  const getCodeBadge = (code: string) => {
    const c = code.toUpperCase();
    if (c === 'CL') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (c === 'SL') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (c === 'PL') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (c.includes('MATERNITY')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (c.includes('PATERNITY')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredPolicies = policies.filter(
    (p) =>
      p.leaveName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.leaveCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAnnualDays = policies
    .filter((p) => p.isPaid && p.leaveCode !== 'MATERNITY')
    .reduce((sum, p) => sum + (p.annualDays || 0), 0);

  const carryForwardCount = policies.filter((p) => p.carryForwardAllowed).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building className="w-6 h-6 text-blue-600" />
            <span>Organization Architecture & Policy Center</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Configure legal entities, organizational branches, departments, and annual leave quotas
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('LEAVE_POLICIES')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'LEAVE_POLICIES'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Annual Leave Quotas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Departments & Entities</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: ANNUAL LEAVE POLICIES & QUOTAS ─── */}
      {activeTab === 'LEAVE_POLICIES' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Categories</p>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">{policies.length} Active</p>
                <p className="text-[11px] text-slate-400">CL, SL, PL, Maternity, etc.</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Standard Paid Pool</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{totalAnnualDays} Days / Year</p>
                <p className="text-[11px] text-slate-400">Excl. statutory extended</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Carry Forward Rules</p>
                <p className="text-xl font-extrabold text-purple-700 mt-0.5">{carryForwardCount} Category</p>
                <p className="text-[11px] text-slate-400">Rolls over to next calendar yr</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Statutory Compliance</p>
                <p className="text-base font-extrabold text-amber-700 mt-0.5">Maternity & Labor Act</p>
                <p className="text-[11px] text-slate-400">Compliant with Indian Law</p>
              </div>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leave policy by name or code..."
                className="w-full bg-slate-50 text-slate-900 rounded-xl pl-9 pr-3.5 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            {canManage && (
              <button
                type="button"
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Configure New Leave Policy</span>
              </button>
            )}
          </div>

          {/* Leave Policies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPolicies.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top line: Code badge + Type badges */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-extrabold border ${getCodeBadge(p.leaveCode)}`}>
                      {p.leaveCode}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {p.isPaid ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                          Unpaid
                        </span>
                      )}
                      {p.carryForwardAllowed ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          Rolls Over
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200 text-[10px]">
                          Lapses
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Quota */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{p.leaveName}</h3>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-2xl font-black text-blue-600">{p.annualDays}</span>
                      <span className="text-xs text-slate-500 font-semibold">Days / Year (Annual Quota)</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    {p.description || 'No special policy restrictions configured.'}
                  </p>
                </div>

                {/* Footer details & HR Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400">
                    {p.carryForwardAllowed
                      ? `Max rollover: ${p.maxCarryForwardDays || 10} days`
                      : 'Annual reset on Dec 31'}
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        title="Edit policy"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePolicy(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete policy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 2: DEPARTMENTS & LEGAL ENTITIES ─── */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Company Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-xs">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Priyex Software Enterprise</h2>
                <div className="mt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-mono font-bold">
                    CIN: U72900KA2023PTC123456
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-100 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 font-semibold">Headquarters:</strong> Outer Ring Road, Bellandur, Bengaluru 560103
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <GitFork className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 font-semibold">Active Branches:</strong> Bengaluru, Mumbai, New Delhi, Remote
                </span>
              </div>
            </div>
          </div>

          {/* Departments List Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Active Departments</span>
            </h2>
            <div className="space-y-3">
              {departments.map((dept, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-sm hover:border-blue-300 transition-colors"
                >
                  <div>
                    <p className="font-bold text-slate-900">{dept.name}</p>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      Department Head: <strong className="text-slate-800 font-semibold">{dept.head}</strong>
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200 text-xs">
                      {dept.count} Members
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                        {dept.costCenter}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD / EDIT POLICY MODAL ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <CalendarCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingPolicy ? 'Edit Leave Policy Quota' : 'Configure New Leave Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Leave Code *</label>
                  <input
                    type="text"
                    required
                    value={policyForm.leaveCode}
                    onChange={(e) => setPolicyForm({ ...policyForm, leaveCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. CL, SL, PL"
                    disabled={!!editingPolicy}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Annual Days Quota *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={365}
                    value={policyForm.annualDays}
                    onChange={(e) => setPolicyForm({ ...policyForm, annualDays: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Leave Category Name *</label>
                <input
                  type="text"
                  required
                  value={policyForm.leaveName}
                  onChange={(e) => setPolicyForm({ ...policyForm, leaveName: e.target.value })}
                  placeholder="e.g. Casual Leave (CL) / Sick Leave (SL)"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyForm.isPaid}
                    onChange={(e) => setPolicyForm({ ...policyForm, isPaid: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Paid Leave</span>
                    <span className="text-[10px] text-slate-500">Credited without pay deduction</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policyForm.carryForwardAllowed}
                    onChange={(e) => setPolicyForm({ ...policyForm, carryForwardAllowed: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Carry Forward</span>
                    <span className="text-[10px] text-slate-500">Unused days roll over to next year</span>
                  </div>
                </label>
              </div>

              {policyForm.carryForwardAllowed && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Carry Forward Days</label>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={policyForm.maxCarryForwardDays}
                    onChange={(e) => setPolicyForm({ ...policyForm, maxCarryForwardDays: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-bold mb-1">Policy Description & Rules</label>
                <textarea
                  rows={3}
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                  placeholder="Explain eligibility, medical certificates, notice periods, or approval constraints..."
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
