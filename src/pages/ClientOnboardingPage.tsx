import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSuperAdmin } from '../utils/rbac';
import api from '../api/client';
import {
  Building2,
  ShieldCheck,
  Plus,
  Search,
  Globe,
  Users,
  Mail,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Trash2,
  ArrowRight,
  X,
  ExternalLink,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  UploadCloud
} from 'lucide-react';

interface ClientOverview {
  id: number;
  code: string;
  legalName: string;
  brandName?: string;
  industry?: string;
  timezone?: string;
  currencyCode?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  logoUrl?: string;
  isActive: boolean;
  domains: string[];
  employeeCount: number;
  adminEmail?: string;
  onboardingStatus: string;
}

const getClientBadgeStyle = (code: string) => {
  const c = code.toUpperCase();
  if (c === 'TCS') return { bg: 'bg-purple-50 text-purple-700 border-purple-200', circleBg: 'bg-purple-600 text-white' };
  if (c === 'WIPRO') return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', circleBg: 'bg-indigo-600 text-white' };
  if (c === 'INFOSYS') return { bg: 'bg-sky-50 text-sky-700 border-sky-200', circleBg: 'bg-sky-600 text-white' };
  if (c === 'PRIYEX') return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', circleBg: 'bg-emerald-600 text-white' };
  return { bg: 'bg-blue-50 text-blue-700 border-blue-200', circleBg: 'bg-blue-600 text-white' };
};

export const ClientOnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal States
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [selectedClientForDomain, setSelectedClientForDomain] = useState<ClientOverview | null>(null);
  const [newDomainInput, setNewDomainInput] = useState('');
  
  // Logo Update Modal State
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [selectedClientForLogo, setSelectedClientForLogo] = useState<ClientOverview | null>(null);
  const [logoInputUrl, setLogoInputUrl] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New Client Form State
  const [formData, setFormData] = useState({
    code: '',
    legalName: '',
    brandName: '',
    industry: 'Information Technology & Services',
    domains: '',
    logoUrl: '',
    adminName: '',
    adminEmail: '',
    adminPassword: 'Admin@123',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/super-admin/clients');
      if (res.success && Array.isArray(res.data)) {
        setClients(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to fetch client organizations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleToggleStatus = async (client: ClientOverview) => {
    const nextStatus = !client.isActive;
    const confirmMsg = nextStatus
      ? `Activate workspace for ${client.brandName || client.legalName}? Users will be allowed to log in.`
      : `Deactivate workspace for ${client.brandName || client.legalName}? Users under this client will be locked from logging in.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const res: any = await api.put(`/super-admin/clients/${client.id}/status`, { isActive: nextStatus });
      if (res.success) {
        setClients((prev) =>
          prev.map((c) => (c.id === client.id ? { ...c, isActive: nextStatus } : c))
        );
        setSuccessMessage(nextStatus ? `${client.code} activated successfully.` : `${client.code} deactivated.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update client status');
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isModalUpdate = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Logo file must be under 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (isModalUpdate) {
        setLogoInputUrl(dataUri);
      } else {
        setFormData((prev) => ({ ...prev, logoUrl: dataUri }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForLogo) return;

    setIsSubmitting(true);
    try {
      const res: any = await api.put(`/super-admin/clients/${selectedClientForLogo.id}/logo`, {
        logoUrl: logoInputUrl.trim()
      });
      if (res.success) {
        setClients((prev) =>
          prev.map((c) => (c.id === selectedClientForLogo.id ? { ...c, logoUrl: logoInputUrl.trim() } : c))
        );
        setSuccessMessage(`Logo updated for ${selectedClientForLogo.code}`);
        setIsLogoModalOpen(false);
        fetchClients();
        setTimeout(() => setSuccessMessage(null), 3500);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update logo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const domainList = formData.domains
        .split(',')
        .map((d) => d.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        code: formData.code.trim().toUpperCase(),
        legalName: formData.legalName.trim(),
        brandName: formData.brandName.trim() || formData.legalName.trim(),
        industry: formData.industry,
        domains: domainList,
        logoUrl: formData.logoUrl.trim() || null,
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim().toLowerCase(),
        adminPassword: formData.adminPassword,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        phone: formData.phone
      };

      const res: any = await api.post('/super-admin/clients', payload);
      if (res.success) {
        setSuccessMessage(`Client organization ${payload.code} onboarded successfully!`);
        setIsOnboardModalOpen(false);
        setFormData({
          code: '',
          legalName: '',
          brandName: '',
          industry: 'Information Technology & Services',
          domains: '',
          logoUrl: '',
          adminName: '',
          adminEmail: '',
          adminPassword: 'Admin@123',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
          phone: ''
        });
        fetchClients();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to onboard client organization. Verify details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForDomain || !newDomainInput.trim()) return;

    try {
      const res: any = await api.post(`/super-admin/clients/${selectedClientForDomain.id}/domains`, {
        domainName: newDomainInput.trim(),
        isPrimary: selectedClientForDomain.domains.length === 0
      });
      if (res.success) {
        setNewDomainInput('');
        fetchClients();
        setSuccessMessage(`Domain added to ${selectedClientForDomain.code}`);
        setTimeout(() => setSuccessMessage(null), 3000);
        // Refresh local selected client
        setSelectedClientForDomain((prev) =>
          prev ? { ...prev, domains: [...prev.domains, newDomainInput.trim().toLowerCase()] } : null
        );
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to associate domain');
    }
  };

  if (!isSuperAdmin(user)) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Platform Access Restricted</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          The Client Onboarding and multi-tenant management module is restricted exclusively to the Platform Super Administrator.
        </p>
      </div>
    );
  }

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.brandName && c.brandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.domains.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'ACTIVE') return c.isActive;
    if (statusFilter === 'INACTIVE') return !c.isActive;
    return true;
  });

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.isActive).length;
  const totalDomains = clients.reduce((acc, c) => acc + (c.domains?.length || 0), 0);
  const totalEmployees = clients.reduce((acc, c) => acc + (c.employeeCount || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Client Onboarding</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Super Admin Exclusive
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Register, configure, and isolate enterprise tenant organizations with verified email domains.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsOnboardModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Onboard New Client
        </button>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Clients</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalClients}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Workspaces</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{activeClients}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Verified Domains</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalDomains}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Managed Users</p>
            <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalEmployees}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, company, or domain..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Deactivated Only</option>
          </select>

          <button
            onClick={fetchClients}
            title="Refresh List"
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clients Cards / Table */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Loading client organizations...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-700">No client organizations found</h3>
          <p className="text-sm text-slate-500">Try adjusting your search query or onboard a new client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const badge = getClientBadgeStyle(client.code);
            return (
              <div
                key={client.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
                  client.isActive ? 'border-slate-200/90' : 'border-rose-200 bg-rose-50/20'
                }`}
              >
                <div>
                  {/* Top Bar: Code Badge + Active Status Toggle */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-xs overflow-hidden bg-white border border-slate-200/90 ${badge.circleBg}`}
                      >
                        {client.logoUrl ? (
                          <img
                            src={client.logoUrl}
                            alt={client.code}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          client.code.slice(0, 3)
                        )}
                      </div>
                      <div>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold border uppercase tracking-wide ${badge.bg}`}>
                          {client.code}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(client)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                        client.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${client.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      {client.isActive ? 'Active' : 'Suspended'}
                    </button>
                  </div>

                  {/* Client Info */}
                  <div className="space-y-1 mb-4">
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {client.brandName || client.legalName}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{client.legalName}</p>
                    <p className="text-xs text-slate-400">
                      {client.industry || 'Technology'} • {client.city || 'India'}
                    </p>
                  </div>

                  {/* Verified Domains Section */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-indigo-600" />
                        Verified Email Domains
                      </span>
                      <button
                        onClick={() => {
                          setSelectedClientForDomain(client);
                          setIsDomainModalOpen(true);
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {client.domains && client.domains.length > 0 ? (
                        client.domains.map((dom) => (
                          <span
                            key={dom}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[11px] font-mono text-slate-700 shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {dom}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No custom domain mapped</span>
                      )}
                    </div>
                  </div>

                  {/* Admin & Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate" title={client.adminEmail || client.email}>
                        {client.adminEmail || client.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{client.employeeCount}</span>
                      <span>employees</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">ID #{client.id}</span>
                    <button
                      onClick={() => {
                        setSelectedClientForLogo(client);
                        setLogoInputUrl(client.logoUrl || '');
                        setIsLogoModalOpen(true);
                      }}
                      className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1 transition"
                      title="Update client logo"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      Logo
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedClientForDomain(client);
                      setIsDomainModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline"
                  >
                    Configure Domains
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard Client Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Onboard Client Organization</h3>
                  <p className="text-xs text-slate-500">Configure tenant isolation, email domain & initial administrator</p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Organization Profile */}
              <div>
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2.5">
                  1. Organization Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ACME"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Global"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Global Solutions Limited"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City & Country</label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, India"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  {/* Client Logo Upload Field */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization Logo
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      {formData.logoUrl ? (
                        <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs relative group">
                          <img
                            src={formData.logoUrl}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, logoUrl: '' })}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs shadow-xs hover:bg-rose-600 font-bold"
                            title="Remove logo"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center shrink-0 text-slate-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}

                      <div className="flex-1 w-full space-y-1.5">
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-2xs transition">
                            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                            Upload Logo Image
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              className="hidden"
                              onChange={(e) => handleLogoFileUpload(e, false)}
                            />
                          </label>
                          <span className="text-[11px] text-slate-400">PNG, JPG, SVG, WebP (max 3MB)</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Or paste direct image URL (https://...)"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Email Domains */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2.5">
                  2. Email Domain Auto-Identification
                </h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Email Domains (comma-separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. acme.com, acmeglobal.com"
                    value={formData.domains}
                    onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Users logging in with these domains will be automatically routed into this client workspace.
                  </p>
                </div>
              </div>

              {/* Initial Administrator Setup */}
              <div className="pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2.5">
                  3. Primary Client Administrator
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alexander Acme"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Corporate Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@acme.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Initial Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full px-3 py-2 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Provisioning Client...
                    </>
                  ) : (
                    'Provision & Launch Client'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Domains Modal */}
      {isDomainModalOpen && selectedClientForDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Manage Domains: {selectedClientForDomain.code}
                </h3>
              </div>
              <button
                onClick={() => setIsDomainModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">Active Associated Domains:</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedClientForDomain.domains.map((dom) => (
                  <div
                    key={dom}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono text-slate-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {dom}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">Add Email Domain</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. customdomain.com"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Client Logo Modal */}
      {isLogoModalOpen && selectedClientForLogo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Update Logo: {selectedClientForLogo.code}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedClientForLogo.brandName || selectedClientForLogo.legalName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLogoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateLogoSubmit} className="space-y-4">
              {/* Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                {logoInputUrl ? (
                  <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-xs relative group">
                    <img
                      src={logoInputUrl}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setLogoInputUrl('')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs shadow hover:bg-rose-600 font-bold"
                      title="Clear logo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                    <ImageIcon className="w-7 h-7" />
                    <span>No Logo</span>
                  </div>
                )}
                <span className="text-[11px] text-slate-400 mt-2 font-medium">Logo Preview</span>
              </div>

              {/* Upload image file */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Upload Logo File
                </label>
                <label className="cursor-pointer flex items-center justify-center gap-2 w-full p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-dashed border-indigo-300 rounded-xl text-xs font-semibold text-indigo-700 transition">
                  <UploadCloud className="w-4 h-4 text-indigo-600" />
                  Choose Image (PNG, JPG, SVG, WebP)
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={(e) => handleLogoFileUpload(e, true)}
                  />
                </label>
              </div>

              {/* Or paste URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Image URL / Data URI
                </label>
                <input
                  type="text"
                  placeholder="https://... or data:image/..."
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Update Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
