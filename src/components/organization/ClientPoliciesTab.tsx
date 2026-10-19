import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Sliders,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  Users2
} from 'lucide-react';
import api from '../../api/client';
import { CompanyClient, TenantPolicyConfig } from '../../types/tenant';

interface ClientPoliciesTabProps {
  canManage: boolean;
  onClientSwitch?: (company: CompanyClient) => void;
}

export const ClientPoliciesTab: React.FC<ClientPoliciesTabProps> = ({ canManage, onClientSwitch }) => {
  const [clients, setClients] = useState<CompanyClient[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(() => {
    const saved = localStorage.getItem('priyex_active_company_id');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [policyConfig, setPolicyConfig] = useState<TenantPolicyConfig | null>(null);
  const [initialConfig, setInitialConfig] = useState<TenantPolicyConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch available client tenants
  const fetchClients = useCallback(async () => {
    try {
      const res: any = await api.get('/tenant/clients');
      if (res.success && Array.isArray(res.data)) {
        setClients(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load client tenants:', err);
    }
  }, []);

  // 2. Fetch policy config for the chosen companyId
  const fetchPolicyConfig = useCallback(async (compId: number) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSaveSuccess(false);
    try {
      const res: any = await api.get(`/tenant/policies?companyId=${compId}`);
      if (res.success && res.data) {
        setPolicyConfig(res.data);
        setInitialConfig(res.data);
      } else {
        setErrorMessage(res.message || 'Unable to retrieve client policy rules');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with Policy Engine');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    if (selectedCompanyId) {
      fetchPolicyConfig(selectedCompanyId);
    }
  }, [selectedCompanyId, fetchPolicyConfig]);

  // Listen to global workspace tenant changes from Header switcher
  useEffect(() => {
    const handleGlobalTenantChange = (e: any) => {
      if (e.detail?.id && e.detail.id !== selectedCompanyId) {
        setSelectedCompanyId(e.detail.id);
      }
    };
    window.addEventListener('tenant-changed', handleGlobalTenantChange);
    return () => window.removeEventListener('tenant-changed', handleGlobalTenantChange);
  }, [selectedCompanyId]);

  const handleSelectClient = (client: CompanyClient) => {
    setSelectedCompanyId(client.id);
    localStorage.setItem('priyex_active_company_id', String(client.id));
    window.dispatchEvent(new CustomEvent('tenant-changed', { detail: client }));
    if (onClientSwitch) {
      onClientSwitch(client);
    }
  };

  const handleFieldChange = <K extends keyof TenantPolicyConfig>(field: K, value: TenantPolicyConfig[K]) => {
    if (!policyConfig) return;
    setPolicyConfig({
      ...policyConfig,
      [field]: value,
    });
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyConfig) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const res: any = await api.put('/tenant/policies', policyConfig);
      if (res.success && res.data) {
        setPolicyConfig(res.data);
        setInitialConfig(res.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(res.message || 'Failed to update policy settings');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error occurred while saving policy configurations');
    } finally {
      setIsSaving(false);
    }
  };

  const hasUnsavedChanges = JSON.stringify(policyConfig) !== JSON.stringify(initialConfig);

  const currentClient = clients.find((c) => c.id === selectedCompanyId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ─── Client Tenant Selection Tabs ─── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Select Client Organization</h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              Multi-Tenant Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Each client maintains isolated leave cycles, attendance grace, OT multipliers, & approval chains.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {clients.map((client) => {
            const isSelected = client.id === selectedCompanyId;
            return (
              <button
                key={client.id}
                type="button"
                onClick={() => handleSelectClient(client)}
                className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {client.code}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>}
                </div>
                <div className="mt-2">
                  <p className="font-bold text-xs truncate leading-tight">{client.legalName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{client.city || 'India HQ'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Status Notifications ─── */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Policy engine rules for {currentClient?.legalName} successfully updated and propagated live!</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
            Synchronized
          </span>
        </div>
      )}

      {/* ─── Policy Configuration Form ─── */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading {currentClient?.legalName || 'Client'} Policy Matrix...</p>
        </div>
      ) : policyConfig ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Active Tenant Overview Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-extrabold text-base tracking-wider text-white">
                {policyConfig.companyCode}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">{policyConfig.companyName}</h3>
                  <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-indigo-400/30">
                    Tenant ID: #{policyConfig.companyId}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Custom organization policies enforced for all payroll, leaves, attendance, and approvals.
                </p>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-2.5 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => fetchPolicyConfig(selectedCompanyId)}
                  disabled={isLoading || isSaving}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                <button
                  type="submit"
                  disabled={!hasUnsavedChanges || isSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Updating...' : hasUnsavedChanges ? 'Save Policy Changes' : 'Saved'}</span>
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ─── SECTION 1: LEAVE ACCRUAL & CALENDAR RULES ─── */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Leave Calendar & Accrual Rules</h4>
                  <p className="text-[11px] text-slate-500">Cycle windows, sandwich deductions, and probation rights</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Calendar Cycle */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Leave Quota Calendar Cycle</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => handleFieldChange('leaveCalendarCycle', 'CALENDAR_YEAR')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        policyConfig.leaveCalendarCycle === 'CALENDAR_YEAR'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">Jan 1 – Dec 31</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Standard Calendar Year</div>
                    </button>

                    <button
                      type="button"
                      disabled={!canManage}
                      onClick={() => handleFieldChange('leaveCalendarCycle', 'FINANCIAL_YEAR')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        policyConfig.leaveCalendarCycle === 'FINANCIAL_YEAR'
                          ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">Apr 1 – Mar 31</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Indian Financial Year</div>
                    </button>
                  </div>
                </div>

                {/* Sandwich Rule */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">Sandwich Rule Enforcement</span>
                      <span className="text-[10px] text-slate-500">
                        Treat intervening weekends & holidays as leave if surrounded by leave days.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!canManage}
                        checked={policyConfig.leaveSandwichRule === 'ENABLED'}
                        onChange={(e) =>
                          handleFieldChange('leaveSandwichRule', e.target.checked ? 'ENABLED' : 'DISABLED')
                        }
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      Current status:{' '}
                      <strong className={policyConfig.leaveSandwichRule === 'ENABLED' ? 'text-blue-700' : 'text-slate-700'}>
                        {policyConfig.leaveSandwichRule === 'ENABLED'
                          ? 'Strict (Weekend/holiday in between is counted in leave balance)'
                          : 'Relaxed (Only actual working days deducted)'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Probation Leave Rights */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Probation Paid Leaves Allowed</span>
                    <span className="text-[10px] text-slate-500">Allow employees on probation to claim paid leave balances.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      disabled={!canManage}
                      checked={policyConfig.probationLeaveAllowed}
                      onChange={(e) => handleFieldChange('probationLeaveAllowed', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* ─── SECTION 2: ATTENDANCE, SHIFTS & GEOFENCING ─── */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Attendance & Working Hours</h4>
                  <p className="text-[11px] text-slate-500">Late grace windows, min work durations, and geofence policy</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* Late Grace Period */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">Attendance Late Grace Window</label>
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {policyConfig.attendanceGraceMins} Minutes
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    disabled={!canManage}
                    value={policyConfig.attendanceGraceMins}
                    onChange={(e) => handleFieldChange('attendanceGraceMins', parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>0 mins (Strict On-Time)</span>
                    <span>15 mins (Standard)</span>
                    <span>30 mins (Flexible)</span>
                    <span>60 mins</span>
                  </div>
                </div>

                {/* Min Hours Half-Day & Full-Day */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Half-Day Min Hours</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="2"
                        max="6"
                        disabled={!canManage}
                        value={policyConfig.halfDayMinHours}
                        onChange={(e) => handleFieldChange('halfDayMinHours', parseFloat(e.target.value) || 4.0)}
                        className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">hrs</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Full-Day Min Hours</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="6"
                        max="12"
                        disabled={!canManage}
                        value={policyConfig.fullDayMinHours}
                        onChange={(e) => handleFieldChange('fullDayMinHours', parseFloat(e.target.value) || 8.0)}
                        className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">hrs</span>
                    </div>
                  </div>
                </div>

                {/* Geofence Enforcement Mode */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Mobile Geofence Punch Mode</label>
                  <select
                    disabled={!canManage}
                    value={policyConfig.geofenceEnforcement}
                    onChange={(e) => handleFieldChange('geofenceEnforcement', e.target.value as any)}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-amber-500 font-semibold cursor-pointer"
                  >
                    <option value="STRICT">STRICT — Block punch if outside client office geofence</option>
                    <option value="FLEXIBLE">FLEXIBLE — Record punch with out-of-range flag for HR</option>
                    <option value="DISABLED">DISABLED — No geofence location enforcement</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ─── SECTION 3: OVERTIME & COMPENSATORY OFF (C-OFF) ─── */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Overtime Multipliers & C-Off</h4>
                  <p className="text-[11px] text-slate-500">Overtime rate formulas and compensatory leave validity</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                {/* OT Multipliers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Weekday OT Multiplier</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.25"
                        min="1.0"
                        max="3.0"
                        disabled={!canManage}
                        value={policyConfig.overtimeMultiplierWeekday}
                        onChange={(e) =>
                          handleFieldChange('overtimeMultiplierWeekday', parseFloat(e.target.value) || 1.0)
                        }
                        className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">x</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Weekend / Holiday OT</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.25"
                        min="1.0"
                        max="3.0"
                        disabled={!canManage}
                        value={policyConfig.overtimeMultiplierWeekend}
                        onChange={(e) =>
                          handleFieldChange('overtimeMultiplierWeekend', parseFloat(e.target.value) || 1.5)
                        }
                        className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">x</span>
                    </div>
                  </div>
                </div>

                {/* C-Off Validity Window & Min Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">C-Off Expiry Window</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="5"
                        min="15"
                        max="180"
                        disabled={!canManage}
                        value={policyConfig.coffValidityDays}
                        onChange={(e) => handleFieldChange('coffValidityDays', parseInt(e.target.value) || 60)}
                        className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">days</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Min Hours for 1 C-Off</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="4"
                        max="12"
                        disabled={!canManage}
                        value={policyConfig.coffMinHoursFullDay}
                        onChange={(e) => handleFieldChange('coffMinHoursFullDay', parseFloat(e.target.value) || 8.0)}
                        className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-purple-500 font-bold"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── SECTION 4: MULTI-LEVEL APPROVAL HIERARCHY ─── */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Users2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Multi-Tier Approval Hierarchy</h4>
                  <p className="text-[11px] text-slate-500">Tier requirements for leave requests, OT claims, & profile updates</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-2">Workflow Approval Tier Depth</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { tier: 1 as const, title: '1 Tier', subtitle: 'Manager Only' },
                      { tier: 2 as const, title: '2 Tiers', subtitle: 'Manager + HR' },
                      { tier: 3 as const, title: '3 Tiers', subtitle: 'Manager + Head + HR' },
                    ].map((item) => {
                      const isActive = policyConfig.approvalTierCount === item.tier;
                      return (
                        <button
                          key={item.tier}
                          type="button"
                          disabled={!canManage}
                          onClick={() => handleFieldChange('approvalTierCount', item.tier)}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                            isActive
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="font-extrabold text-sm">{item.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Tier Route Visualization:</span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span className="px-2.5 py-1 rounded bg-white border border-slate-200 shadow-2xs">Employee</span>
                    <span>&rarr;</span>
                    <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Direct Manager
                    </span>
                    {policyConfig.approvalTierCount >= 2 && (
                      <>
                        <span>&rarr;</span>
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {policyConfig.approvalTierCount === 3 ? 'Department Head' : 'HR Admin'}
                        </span>
                      </>
                    )}
                    {policyConfig.approvalTierCount === 3 && (
                      <>
                        <span>&rarr;</span>
                        <span className="px-2.5 py-1 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          HR Admin
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
};
