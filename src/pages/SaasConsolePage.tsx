import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  SaasConsoleOverview,
  SaasCommercialAccount,
  SaasPlan,
  SaasSubscription,
  SaasContract,
  SaasInvoice,
  SaasCustomerRequest,
  SaasAuditEvent,
  LeadInquiry
} from '../types/saas';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  FileSignature,
  PhoneCall,
  Receipt,
  Headphones,
  ShieldAlert,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
  ExternalLink,
  Ban,
  Archive,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

export const SaasConsolePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // Core Data States
  const [overview, setOverview] = useState<SaasConsoleOverview | null>(null);
  const [accounts, setAccounts] = useState<SaasCommercialAccount[]>([]);
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<SaasSubscription[]>([]);
  const [contracts, setContracts] = useState<SaasContract[]>([]);
  const [invoices, setInvoices] = useState<SaasInvoice[]>([]);
  const [leads, setLeads] = useState<LeadInquiry[]>([]);
  const [requests, setRequests] = useState<SaasCustomerRequest[]>([]);
  const [auditEvents, setAuditEvents] = useState<SaasAuditEvent[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal Visibility States
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDropLeadModal, setShowDropLeadModal] = useState<LeadInquiry | null>(null);
  const [showOffboardModal, setShowOffboardModal] = useState<SaasCommercialAccount | null>(null);

  // Form State: New Account
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    tenantSlug: '',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    billingAddress: '',
    gstin: '',
    lifecycleStatus: 'PROSPECT' as const
  });

  // Form State: New Plan
  const [newPlan, setNewPlan] = useState({
    planName: '',
    planCode: '',
    billingCycle: 'MONTHLY' as const,
    basePrice: 5000,
    perSeatPrice: 150,
    maxSeatsIncluded: 25,
    storageGbIncluded: 50,
    isActive: true
  });

  // Form State: New Subscription
  const [newSub, setNewSub] = useState({
    accountId: 0,
    planId: 0,
    allocatedSeats: 50,
    priceOverride: 0,
    autoRenew: true
  });

  // Form State: New Contract
  const [newContract, setNewContract] = useState({
    accountId: 0,
    contractType: 'ONE_TIME_SETUP' as const,
    title: '',
    contractAmount: 25000,
    slaResponseHours: 4,
    scopeSummary: '',
    billingStatus: 'PENDING' as const
  });

  // Form State: New Invoice
  const [newInvoice, setNewInvoice] = useState({
    accountId: 0,
    subtotalAmount: 10000,
    status: 'ISSUED' as const,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  });

  // Form State: Drop Lead
  const [dropReason, setDropReason] = useState('Budget Unaligned');
  const [dropNotes, setDropNotes] = useState('');

  // Form State: Offboard Client
  const [offboardReason, setOffboardReason] = useState('Contract Expired');
  const [offboardNotes, setOffboardNotes] = useState('');
  const [deactivateTenantNow, setDeactivateTenantNow] = useState(true);
  const [confirmOffboardKeyword, setConfirmOffboardKeyword] = useState('');

  // Show Toast Helper
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch all control plane data
  const loadConsoleData = async () => {
    setIsLoading(true);
    try {
      const [
        overviewRes,
        accountsRes,
        plansRes,
        subsRes,
        contractsRes,
        invoicesRes,
        leadsRes,
        requestsRes,
        auditRes
      ] = await Promise.all([
        api.get('/saas-console/overview').catch(() => null),
        api.get('/saas-console/accounts').catch(() => null),
        api.get('/saas-console/plans').catch(() => null),
        api.get('/saas-console/subscriptions').catch(() => null),
        api.get('/saas-console/contracts').catch(() => null),
        api.get('/saas-console/invoices').catch(() => null),
        api.get('/saas-console/leads').catch(() => null),
        api.get('/saas-console/requests').catch(() => null),
        api.get('/saas-console/audit-events').catch(() => null)
      ]);

      if (overviewRes?.data?.data) setOverview(overviewRes.data.data);
      if (accountsRes?.data?.data) setAccounts(accountsRes.data.data);
      if (plansRes?.data?.data) setPlans(plansRes.data.data);
      if (subsRes?.data?.data) setSubscriptions(subsRes.data.data);
      if (contractsRes?.data?.data) setContracts(contractsRes.data.data);
      if (invoicesRes?.data?.data) setInvoices(invoicesRes.data.data);
      if (leadsRes?.data?.data) setLeads(leadsRes.data.data);
      if (requestsRes?.data?.data) setRequests(requestsRes.data.data);
      if (auditRes?.data?.data) setAuditEvents(auditRes.data.data);
    } catch (err) {
      console.error('Failed to load SaaS console data:', err);
      showToast('Error syncing with Priyex Control Plane', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsoleData();
  }, []);

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Format INR Currency
  const formatInr = (amount?: number) => {
    if (amount === undefined || amount === null) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Status Pill Helpers
  const getLifecycleBadge = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PILOT':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONTRACT_SIGNED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CHURNED':
      case 'TERMINATED':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getLeadBadge = (status?: string) => {
    switch (status) {
      case 'CONVERTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'DEMO_SCHEDULED':
      case 'PROPOSAL_SENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'CONTACTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOST':
        return 'bg-slate-100 text-slate-600 border-slate-300 line-through';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Handler: Create Commercial Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/saas-console/accounts', newAccount);
      if (res?.data?.success) {
        showToast('Commercial account provisioned successfully!');
        setShowAccountModal(false);
        setNewAccount({
          accountName: '',
          tenantSlug: '',
          primaryContactName: '',
          primaryContactEmail: '',
          primaryContactPhone: '',
          billingAddress: '',
          gstin: '',
          lifecycleStatus: 'PROSPECT'
        });
        loadConsoleData();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create account', 'error');
    }
  };

  // Handler: Create Plan Tier
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/saas-console/plans', newPlan);
      if (res?.data?.success) {
        showToast('New SaaS plan tier published!');
        setShowPlanModal(false);
        loadConsoleData();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create plan', 'error');
    }
  };

  // Handler: Assign Subscription
  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.accountId || !newSub.planId) {
      showToast('Select both an Account and a Plan tier', 'error');
      return;
    }
    try {
      const res: any = await api.post('/saas-console/subscriptions', newSub);
      if (res?.data?.success) {
        showToast('Subscription assigned successfully!');
        setShowSubscriptionModal(false);
        loadConsoleData();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to assign subscription', 'error');
    }
  };

  // Handler: Add Contract
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContract.accountId || !newContract.title) {
      showToast('Account and Contract Title are required', 'error');
      return;
    }
    try {
      const res: any = await api.post('/saas-console/contracts', newContract);
      if (res?.data?.success) {
        showToast('Setup/AMC contract recorded!');
        setShowContractModal(false);
        loadConsoleData();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create contract', 'error');
    }
  };

  // Handler: Generate Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.accountId) {
      showToast('Select an account for billing', 'error');
      return;
    }
    try {
      const res: any = await api.post('/saas-console/invoices', newInvoice);
      if (res?.data?.success) {
        showToast('Commercial invoice generated!');
        setShowInvoiceModal(false);
        loadConsoleData();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create invoice', 'error');
    }
  };

  // Handler: Drop Lead
  const handleDropLead = async () => {
    if (!showDropLeadModal) return;
    try {
      const res: any = await api.post(`/saas-console/leads/${showDropLeadModal.id}/drop`, {
        dropReason,
        notes: dropNotes
      });
      if (res?.data?.success) {
        showToast(`Lead inquiry marked as LOST (${dropReason})`);
        setShowDropLeadModal(null);
        setDropNotes('');
        loadConsoleData();
      }
    } catch (err: any) {
      showToast('Failed to drop lead', 'error');
    }
  };

  // Handler: Update Lead Status
  const handleUpdateLeadStatus = async (id: number, status: string) => {
    try {
      const res: any = await api.put(`/saas-console/leads/${id}/status`, { status });
      if (res?.data?.success) {
        showToast(`Lead pipeline stage moved to ${status}`);
        loadConsoleData();
      }
    } catch (err: any) {
      showToast('Failed to update lead status', 'error');
    }
  };

  // Handler: Execute Offboard Account
  const handleOffboardAccount = async () => {
    if (!showOffboardModal) return;
    if (confirmOffboardKeyword.trim().toUpperCase() !== 'OFFBOARD') {
      showToast('Type "OFFBOARD" to confirm tenant workspace termination', 'error');
      return;
    }
    try {
      const res: any = await api.post(`/saas-console/accounts/${showOffboardModal.id}/offboard`, {
        reason: offboardReason,
        notes: offboardNotes,
        deactivateTenantNow
      });
      if (res?.data?.success) {
        showToast(`Client ${showOffboardModal.accountName} has been offboarded.`);
        setShowOffboardModal(null);
        setConfirmOffboardKeyword('');
        setOffboardNotes('');
        loadConsoleData();
      }
    } catch (err: any) {
      showToast('Failed to offboard client', 'error');
    }
  };

  // Handler: Update Invoice Status
  const handleUpdateInvoiceStatus = async (id: number, status: string, paymentReference?: string) => {
    try {
      const res: any = await api.put(`/saas-console/invoices/${id}/status`, {
        status,
        paymentReference: paymentReference || `TXN-${Date.now()}`
      });
      if (res?.data?.success) {
        showToast(`Invoice updated to ${status}`);
        loadConsoleData();
      }
    } catch (err: any) {
      showToast('Failed to update invoice status', 'error');
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(
      (l) =>
        l.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.workEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(
      (a) =>
        a.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.accountRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.tenantSlug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.linkedCompanyCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.taxId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.activePlanName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.primaryContactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const getHeaderMeta = () => {
    switch (activeTab) {
      case 'clients':
        return {
          title: 'Client Organizations',
          subtitle: 'Commercial customer accounts, workspace mapping, and tenant provisioning lifecycle.',
          badge: `${accounts.length} Accounts`
        };
      case 'subscriptions':
        return {
          title: 'Subscriptions & Pricing Plans',
          subtitle: 'Published pricing tiers, workforce seat quotas, and recurring license renewals.',
          badge: `${subscriptions.length} Subscriptions`
        };
      case 'contracts':
        return {
          title: 'Setup Fees & AMC Contracts',
          subtitle: 'One-time deployment fees, Annual Maintenance Contracts (AMC), and SLA guarantees.',
          badge: `${contracts.length} Contracts`
        };
      case 'leads':
        return {
          title: 'Sales Pipeline & Inquiries',
          subtitle: 'Inbound demo consultations, proposal tracking, and lead qualification / drop pipeline.',
          badge: `${leads.length} Inquiries`
        };
      case 'billing':
        return {
          title: 'Invoices & Revenue Register',
          subtitle: 'Automated usage invoices, 18% GST calculation, settlements, and overdue collections.',
          badge: `${invoices.length} Invoices`
        };
      case 'queries':
        return {
          title: 'Customer Requests & SLA Desk',
          subtitle: 'Pre-sales technical queries, commercial feature requests, and priority SLA escalations.',
          badge: `${requests.length} Requests`
        };
      case 'audit':
        return {
          title: 'Control Plane Audit Trail',
          subtitle: 'Immutable record of staff operations, commercial account edits, and security logs.',
          badge: `${auditEvents.length} Events`
        };
      case 'overview':
      default:
        return {
          title: 'Executive Dashboard',
          subtitle: 'Real-time ARR run-rate, monthly recurring revenue (MRR), and client growth telemetry.',
          badge: 'Live Telemetry'
        };
    }
  };
  const headerMeta = getHeaderMeta();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border transition-all animate-in slide-in-from-bottom-2 ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/50'
              : 'bg-rose-950 text-rose-100 border-rose-500/50'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header - Clean, Goal-Specific, Without Duplicate Tab Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                Priyex Control Plane
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {headerMeta.badge}
              </span>
              <span className="text-xs text-slate-400">&bull;</span>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Live Node (v28.0)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {headerMeta.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {headerMeta.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={loadConsoleData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
              Sync Data
            </button>

            {activeTab === 'clients' && (
              <button
                onClick={() => setShowAccountModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Commercial Account
              </button>
            )}

            {activeTab === 'subscriptions' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Plan Tier
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Assign Subscription
                </button>
              </div>
            )}

            {activeTab === 'contracts' && (
              <button
                onClick={() => setShowContractModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Setup / AMC Contract
              </button>
            )}

            {activeTab === 'billing' && (
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Generate Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW DASHBOARD                       */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active MRR</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatInr(overview?.activeMrr)}
                </div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                  <span className="text-emerald-600 font-bold">ARR: {formatInr(overview?.activeArr)}</span>
                  <span>run rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Clients</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {overview?.activeTenants || 0}
                  <span className="text-sm font-semibold text-slate-400 ml-1">/ {overview?.totalTenants || 0} total</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span><strong>{overview?.totalWorkforceEmployees || 0}</strong> active workforce seats</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Setup & AMC Value</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <FileSignature className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatInr(overview?.totalContractValue)}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  {overview?.activeContractsCount || 0} active maintenance SLA agreements
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receivables & Overdue</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatInr(overview?.overdueReceivables)}
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium text-emerald-600">
                  {formatInr(overview?.totalCollectedRevenue)} collected to date
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Operational Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Commercial Quick Actions
              </h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => setShowAccountModal(true)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Provision Commercial Account</div>
                      <div className="text-[11px] text-slate-500">Add client organization & tenant slug</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Assign Subscription Plan</div>
                      <div className="text-[11px] text-slate-500">Tier upgrade & seat allocation</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => setShowContractModal(true)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                      <FileSignature className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Create Setup / AMC Contract</div>
                      <div className="text-[11px] text-slate-500">One-time fees or SLA agreements</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </button>

                <button
                  onClick={() => setTab('leads')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Review Sales Inquiries</div>
                      <div className="text-[11px] text-slate-500">{overview?.totalLeads || 0} leads awaiting demo/proposal</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>

            {/* Inbound Lead Pipeline Highlights */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  Latest Sales Enquiries
                </h3>
                <button
                  onClick={() => setTab('leads')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View All ({leads.length})
                </button>
              </div>

              <div className="space-y-3">
                {leads.slice(0, 4).map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {lead.fullName} &bull; <span className="text-indigo-600">{lead.companyName}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{lead.workEmail}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${getLeadBadge(
                        lead.leadStatus
                      )}`}
                    >
                      {lead.leadStatus}
                    </span>
                  </div>
                ))}
                {leads.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No sales inquiries registered yet.</p>
                )}
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Operator Audit Feed
                </h3>
                <button
                  onClick={() => setTab('audit')}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Full Log
                </button>
              </div>

              <div className="space-y-3">
                {auditEvents.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="text-xs border-l-2 border-indigo-400 pl-3 py-1 space-y-0.5">
                    <div className="font-semibold text-slate-800">{ev.action}</div>
                    <div className="text-[11px] text-slate-500 leading-snug">{ev.details}</div>
                    <div className="text-[10px] text-slate-400">{ev.actor} &bull; {ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString() : 'Recent'}</div>
                  </div>
                ))}
                {auditEvents.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">No audit records recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CLIENT ORGANIZATIONS & TENANT LIFECYCLE            */}
      {/* ========================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search accounts, ref, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredAccounts.length}</strong> commercial customer accounts
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Client Organization</th>
                    <th className="p-4">Tenant Identifier</th>
                    <th className="p-4">Workforce Telemetry</th>
                    <th className="p-4">Active Plan & ARR</th>
                    <th className="p-4">Tax ID / Contact</th>
                    <th className="p-4">Lifecycle Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAccounts.map((acc) => {
                    const empCount = acc.activeEmployeeCount || acc.employeeCount || 0;
                    const seats = acc.licensedSeats || 25;
                    const seatPct = Math.min(100, Math.round((empCount / seats) * 100));
                    return (
                      <tr key={acc.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{acc.accountName}</span>
                            {acc.linkedCompanyId && (
                              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                #{acc.linkedCompanyId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] text-slate-400">{acc.accountRef}</span>
                            <span>&bull;</span>
                            <span>{acc.industry || 'Enterprise Software'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded border border-indigo-200/70 uppercase">
                            {acc.tenantSlug || acc.linkedCompanyCode || 'unmapped'}
                          </span>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {acc.city ? `${acc.city}, ${acc.state || 'India'}` : 'Headquarters (IN)'}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span>{empCount}</span>
                            <span className="text-slate-500 font-normal">/ {seats} seats</span>
                            <span className="text-[10px] font-semibold text-slate-400 ml-1">({seatPct}%)</span>
                          </div>
                          <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                seatPct > 90 ? 'bg-amber-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${seatPct}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">
                            {acc.activePlanName || 'Priyex Enterprise Growth'}
                          </div>
                          <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                            {formatInr(acc.annualContractValue || 250000)} / yr
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-mono text-[11px] font-bold text-slate-700">
                            {acc.taxId || acc.gstin || 'Tax-Exempt'}
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5 truncate max-w-[180px]">
                            {acc.primaryContactEmail || acc.primaryContactName || 'Admin Desk'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getLifecycleBadge(
                              acc.lifecycleStatus
                            )}`}
                          >
                            {acc.lifecycleStatus}
                          </span>
                          {acc.dropReason && (
                            <div className="text-[10px] text-rose-600 mt-1 italic">
                              Dropped: {acc.dropReason}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setNewSub((prev) => ({ ...prev, accountId: acc.id }));
                                setShowSubscriptionModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition cursor-pointer"
                            >
                              Assign Plan
                            </button>
                            {acc.lifecycleStatus !== 'TERMINATED' && (
                              <button
                                onClick={() => {
                                  setShowOffboardModal(acc);
                                  setConfirmOffboardKeyword('');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                              >
                                Offboard
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No commercial accounts match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SUBSCRIPTIONS & PLANS                              */}
      {/* ========================================================= */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Plan Catalog Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Published SaaS Plans & Tiers
              </h2>
              <button
                onClick={() => setShowPlanModal(true)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Tier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{p.planName}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {p.planCode}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-2xl font-black text-slate-900">
                      {formatInr(p.basePrice)}
                      <span className="text-xs font-normal text-slate-400 ml-1">/ {p.billingCycle?.toLowerCase() || 'month'}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      + {formatInr(p.perSeatPrice)} / employee seat / month
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Includes up to <strong>{p.maxSeatsIncluded}</strong> workforce seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span><strong>{p.storageGbIncluded} GB</strong> cloud document storage</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Subscriptions Register */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Active Client Subscriptions ({subscriptions.length})
              </h2>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Assign Subscription
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Subscription Ref</th>
                    <th className="p-4">Account ID / Name</th>
                    <th className="p-4">Plan Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Allocated Seats</th>
                    <th className="p-4">Billing Period</th>
                    <th className="p-4">Auto Renew</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {subscriptions.map((sub) => {
                    const matchedAccount = accounts.find((a) => a.id === sub.accountId || a.linkedCompanyId === sub.accountId);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-mono font-bold text-slate-900">{sub.subscriptionRef}</td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800">
                            {matchedAccount?.accountName || `Account #${sub.accountId}`}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {matchedAccount?.tenantSlug || matchedAccount?.linkedCompanyCode || 'tenant'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                            {sub.planName || plans.find((p) => p.id === sub.planId)?.planName || `Plan #${sub.planId}`}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              sub.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-800">
                          {sub.seatsLicensed || sub.allocatedSeats || 25} seats
                        </td>
                        <td className="p-4 text-slate-500">
                          {sub.periodStart || '—'} &rarr; {sub.periodEnd || '—'}
                        </td>
                        <td className="p-4">
                          {sub.autoRenew ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Enabled
                            </span>
                          ) : (
                            <span className="text-slate-400">Manual</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No client subscriptions active yet. Click "Assign Subscription" above to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SETUP & AMC CONTRACTS                              */}
      {/* ========================================================= */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Contract Ref & Type</th>
                    <th className="p-4">Client / Account</th>
                    <th className="p-4">Title & Scope</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">SLA Target</th>
                    <th className="p-4">Billing Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {contracts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-900">{c.contractRef}</div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {c.contractType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {c.accountName || `Account #${c.accountId}`}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{c.title}</div>
                        <div className="text-[11px] text-slate-500 max-w-xs truncate">{c.scopeSummary || 'Standard SLA'}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {formatInr(c.contractAmount)}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-indigo-600">
                          {c.slaResponseHours ? `< ${c.slaResponseHours}h Response` : 'Standard'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            c.billingStatus === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.billingStatus === 'BILLED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {c.billingStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {c.billingStatus !== 'PAID' && (
                          <button
                            onClick={async () => {
                              await api.put(`/saas-console/contracts/${c.id}/status`, { status: 'PAID' });
                              showToast(`Contract ${c.contractRef} marked as PAID`);
                              loadConsoleData();
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No one-time setup fees or recurring AMC contracts recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: SALES PIPELINE & LEADS                             */}
      {/* ========================================================= */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search leads by contact or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{filteredLeads.length}</strong> prospective inquiries
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Contact & Company</th>
                    <th className="p-4">Contact Info</th>
                    <th className="p-4">Team Size</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Pipeline Stage</th>
                    <th className="p-4 text-right">Stage Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{lead.fullName}</div>
                        <div className="text-indigo-600 font-semibold">{lead.companyName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-slate-800">{lead.workEmail}</div>
                        <div className="text-slate-400 text-[11px]">{lead.phone || '—'}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {lead.companySize ? `${lead.companySize} employees` : '—'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {lead.city || '—'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getLeadBadge(
                            lead.leadStatus
                          )}`}
                        >
                          {lead.leadStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {lead.leadStatus !== 'CONVERTED' && lead.leadStatus !== 'LOST' && (
                            <>
                              <select
                                value={lead.leadStatus}
                                onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-[11px] rounded-lg px-2 py-1 font-semibold text-slate-700 cursor-pointer"
                              >
                                <option value="NEW">New</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                                <option value="PROPOSAL_SENT">Proposal Sent</option>
                                <option value="CONVERTED">Converted</option>
                              </select>

                              <button
                                onClick={() => {
                                  setShowDropLeadModal(lead);
                                  setDropReason('Budget Unaligned');
                                  setDropNotes('');
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                              >
                                Drop
                              </button>
                            </>
                          )}
                          {lead.leadStatus === 'CONVERTED' && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Customer Won
                            </span>
                          )}
                          {lead.leadStatus === 'LOST' && (
                            <span className="text-slate-400 text-[11px] italic">
                              Archived / Lost
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No sales inquiries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: INVOICES & REVENUE BILLING                         */}
      {/* ========================================================= */}
      {activeTab === 'billing' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Customer Account</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">GST (18%)</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="p-4 font-bold text-slate-800">
                        {inv.accountName || `Account #${inv.accountId}`}
                      </td>
                      <td className="p-4">{formatInr(inv.subtotalAmount)}</td>
                      <td className="p-4 text-slate-500">{formatInr(inv.taxAmount)}</td>
                      <td className="p-4 font-black text-slate-900 text-sm">
                        {formatInr(inv.totalAmount)}
                      </td>
                      <td className="p-4 text-slate-600">{inv.dueDate || '—'}</td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : inv.status === 'OVERDUE'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => handleUpdateInvoiceStatus(inv.id, 'PAID')}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                          >
                            Mark Paid
                          </button>
                        )}
                        {inv.status === 'PAID' && (
                          <span className="text-emerald-700 font-semibold text-[11px]">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No commercial invoices generated yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: CUSTOMER INQUIRIES & SLA TICKETS                   */}
      {/* ========================================================= */}
      {activeTab === 'queries' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Ref & Subject</th>
                    <th className="p-4">Client Organization</th>
                    <th className="p-4">Request Type</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{r.subject}</div>
                        <div className="font-mono text-[10px] text-slate-400">{r.requestRef}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {r.accountName || `Account #${r.accountId}`}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {r.requestType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.priority === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-700'
                              : r.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 max-w-sm truncate">
                        {r.details || '—'}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No customer requests or SLA escalations recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 8: AUDIT LOGS & CONTROL PLANE GOVERNANCE              */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Operator</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target Entity</th>
                    <th className="p-4">Details</th>
                    <th className="p-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {auditEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition font-mono">
                      <td className="p-4 text-slate-500 text-[11px]">
                        {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : 'Recent'}
                      </td>
                      <td className="p-4 font-bold text-indigo-700">{ev.actor}</td>
                      <td className="p-4 font-semibold text-slate-900">{ev.action}</td>
                      <td className="p-4 text-slate-600">
                        {ev.entityType} #{ev.entityId}
                      </td>
                      <td className="p-4 font-sans text-slate-600 max-w-md truncate">
                        {ev.details}
                      </td>
                      <td className="p-4 text-slate-400 text-[11px]">
                        {ev.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                  {auditEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ENTERPRISE MODALS                                         */}
      {/* ========================================================= */}

      {/* MODAL: CREATE COMMERCIAL ACCOUNT */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Provision Commercial Account</h3>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tata Consultancy Services Ltd"
                  value={newAccount.accountName}
                  onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tenant Slug (Identifier) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tcs"
                    value={newAccount.tenantSlug}
                    onChange={(e) => setNewAccount({ ...newAccount, tenantSlug: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lifecycle Stage</label>
                  <select
                    value={newAccount.lifecycleStatus}
                    onChange={(e: any) => setNewAccount({ ...newAccount, lifecycleStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="PROSPECT">Prospect</option>
                    <option value="PILOT">Pilot Trial</option>
                    <option value="CONTRACT_SIGNED">Contract Signed</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={newAccount.primaryContactName}
                    onChange={(e) => setNewAccount({ ...newAccount, primaryContactName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    placeholder="admin@tcs.com"
                    value={newAccount.primaryContactEmail}
                    onChange={(e) => setNewAccount({ ...newAccount, primaryContactEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newAccount.primaryContactPhone}
                    onChange={(e) => setNewAccount({ ...newAccount, primaryContactPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="27AABCU9603R1ZX"
                    value={newAccount.gstin}
                    onChange={(e) => setNewAccount({ ...newAccount, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-sm"
                >
                  Save Commercial Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PLAN TIER */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add SaaS Plan Tier</h3>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Premier Plus"
                  value={newPlan.planName}
                  onChange={(e) => setNewPlan({ ...newPlan, planName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plan Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="ENTERPRISE_PREMIER"
                    value={newPlan.planCode}
                    onChange={(e) => setNewPlan({ ...newPlan, planCode: e.target.value.toUpperCase().trim() })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Cycle</label>
                  <select
                    value={newPlan.billingCycle}
                    onChange={(e: any) => setNewPlan({ ...newPlan, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Platform Fee (₹)</label>
                  <input
                    type="number"
                    value={newPlan.basePrice}
                    onChange={(e) => setNewPlan({ ...newPlan, basePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Per-Seat Fee (₹/seat)</label>
                  <input
                    type="number"
                    value={newPlan.perSeatPrice}
                    onChange={(e) => setNewPlan({ ...newPlan, perSeatPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Included Seats</label>
                  <input
                    type="number"
                    value={newPlan.maxSeatsIncluded}
                    onChange={(e) => setNewPlan({ ...newPlan, maxSeatsIncluded: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Included Storage (GB)</label>
                  <input
                    type="number"
                    value={newPlan.storageGbIncluded}
                    onChange={(e) => setNewPlan({ ...newPlan, storageGbIncluded: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Publish Plan Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN SUBSCRIPTION */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Assign Customer Subscription</h3>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Commercial Account *</label>
                <select
                  required
                  value={newSub.accountId}
                  onChange={(e) => setNewSub({ ...newSub, accountId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value={0}>-- Select Customer Account --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({acc.accountRef})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Select SaaS Plan Tier *</label>
                <select
                  required
                  value={newSub.planId}
                  onChange={(e) => setNewSub({ ...newSub, planId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value={0}>-- Select Plan Tier --</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.planName} ({formatInr(p.basePrice)} / {p.billingCycle?.toLowerCase() || 'month'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Allocated Seats</label>
                  <input
                    type="number"
                    value={newSub.allocatedSeats}
                    onChange={(e) => setNewSub({ ...newSub, allocatedSeats: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price Override (₹)</label>
                  <input
                    type="number"
                    placeholder="0 for default"
                    value={newSub.priceOverride}
                    onChange={(e) => setNewSub({ ...newSub, priceOverride: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={newSub.autoRenew}
                  onChange={(e) => setNewSub({ ...newSub, autoRenew: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
                <label htmlFor="autoRenew" className="font-semibold text-slate-700 cursor-pointer">
                  Enable automatic contract renewal at period end
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubscriptionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Activate Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SETUP / AMC CONTRACT */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Add Setup Fee or AMC Agreement</h3>
              </div>
              <button
                onClick={() => setShowContractModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Account *</label>
                <select
                  required
                  value={newContract.accountId}
                  onChange={(e) => setNewContract({ ...newContract, accountId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value={0}>-- Select Customer Account --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={newContract.contractType}
                    onChange={(e: any) => setNewContract({ ...newContract, contractType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="ONE_TIME_SETUP">One-Time Setup Fee</option>
                    <option value="RECURRING_AMC">Annual Maintenance (AMC)</option>
                    <option value="SLA_PREMIUM">Dedicated SLA Guarantee</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contract Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newContract.contractAmount}
                    onChange={(e) => setNewContract({ ...newContract, contractAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contract Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FY26 SLA & Enterprise Deployment Support"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SLA Target (Hours)</label>
                  <input
                    type="number"
                    value={newContract.slaResponseHours}
                    onChange={(e) => setNewContract({ ...newContract, slaResponseHours: parseInt(e.target.value) || 4 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Status</label>
                  <select
                    value={newContract.billingStatus}
                    onChange={(e: any) => setNewContract({ ...newContract, billingStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="PENDING">Pending Invoice</option>
                    <option value="BILLED">Billed</option>
                    <option value="PAID">Paid / Settled</option>
                    <option value="WAIVED">Waived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope Summary</label>
                <textarea
                  rows={2}
                  placeholder="Details of custom migration, biometric integration or SLA..."
                  value={newContract.scopeSummary}
                  onChange={(e) => setNewContract({ ...newContract, scopeSummary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContractModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE INVOICE */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Generate Commercial Invoice</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Customer Account *</label>
                <select
                  required
                  value={newInvoice.accountId}
                  onChange={(e) => setNewInvoice({ ...newInvoice, accountId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value={0}>-- Select Customer Account --</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtotal Amount (₹ Excl. Tax) *</label>
                <input
                  type="number"
                  required
                  value={newInvoice.subtotalAmount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, subtotalAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatInr(newInvoice.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%):</span>
                  <span className="font-semibold">{formatInr(newInvoice.subtotalAmount * 0.18)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span>{formatInr(newInvoice.subtotalAmount * 1.18)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newInvoice.status}
                    onChange={(e: any) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="ISSUED">Issued</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PAID">Paid / Settled</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Generate & Register Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DROP / DISQUALIFY LEAD INQUIRY */}
      {showDropLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">Drop Sales Inquiry (Mark Lost)</h3>
              </div>
              <button
                onClick={() => setShowDropLeadModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-slate-900">{showDropLeadModal.fullName}</div>
                <div className="text-slate-500">{showDropLeadModal.companyName} &bull; {showDropLeadModal.workEmail}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Dropping / Disqualifying *</label>
                <select
                  value={dropReason}
                  onChange={(e) => setDropReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Budget Unaligned">Budget Unaligned / Out of Range</option>
                  <option value="Competitor Chosen">Competitor Chosen (Darwinbox, GreytHR, etc.)</option>
                  <option value="Out of Product Scope">Out of Product Scope / Missing Specific Feature</option>
                  <option value="Unresponsive / No Show">Unresponsive / No Show to Demos</option>
                  <option value="Project Postponed">Internal HR Project Postponed</option>
                  <option value="Spam / Invalid Inquiry">Spam / Invalid Inquiry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Exit Debrief / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide context on why this lead did not convert for sales analytics..."
                  value={dropNotes}
                  onChange={(e) => setDropNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDropLeadModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDropLead}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  Confirm Drop Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TENANT OFFBOARDING & WORKSPACE DEACTIVATION WIZARD */}
      {showOffboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-rose-200 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/70">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-rose-900 text-sm">Client Offboarding & Tenant Deactivation</h3>
              </div>
              <button
                onClick={() => setShowOffboardModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-slate-900 text-sm">{showOffboardModal.accountName}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Ref: {showOffboardModal.accountRef} | Slug: {showOffboardModal.tenantSlug}
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed">
                Executing offboarding will terminate commercial billing, cancel active subscriptions, and archive contract accounts.
              </p>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Offboarding Primary Reason *</label>
                <select
                  value={offboardReason}
                  onChange={(e) => setOffboardReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="Contract Expired">Contract Expired / Non-Renewal</option>
                  <option value="Client Requested Cancellation">Client Requested Cancellation</option>
                  <option value="Non-Payment / Default">Non-Payment / Default</option>
                  <option value="Migrated to Competitor">Migrated to Competitor</option>
                  <option value="Operational Discontinuation">Operational Discontinuation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Debrief Notes & Handover Summary</label>
                <textarea
                  rows={2}
                  placeholder="Record exit interview or settlement details..."
                  value={offboardNotes}
                  onChange={(e) => setOffboardNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="deactivateWorkspace"
                    checked={deactivateTenantNow}
                    onChange={(e) => setDeactivateTenantNow(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 cursor-pointer"
                  />
                  <label htmlFor="deactivateWorkspace" className="font-bold text-slate-800 cursor-pointer">
                    Deactivate linked tenant workspace in DB immediately
                  </label>
                </div>
                <p className="text-[11px] text-amber-800 pl-6 leading-tight">
                  This prevents tenant employee logins while keeping database records intact for legal audit.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Security Confirmation: Type <span className="font-mono text-rose-600 font-bold">OFFBOARD</span> to proceed
                </label>
                <input
                  type="text"
                  placeholder="Type OFFBOARD"
                  value={confirmOffboardKeyword}
                  onChange={(e) => setConfirmOffboardKeyword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 font-mono text-center font-bold text-rose-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOffboardModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmOffboardKeyword.trim().toUpperCase() !== 'OFFBOARD'}
                  onClick={handleOffboardAccount}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold cursor-pointer transition shadow-sm"
                >
                  Execute Tenant Offboarding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaasConsolePage;
