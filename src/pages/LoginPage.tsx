import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from '../components/common/BrandLogo';
import { checkBackendHealth, prewarmBackend } from '../api/client';
import api from '../api/client';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronDown,
  UserCheck
} from 'lucide-react';

interface DetectedCompany {
  id: number;
  code: string;
  legalName: string;
  brandName?: string;
  logoUrl?: string;
}

interface DomainDetectionResult {
  identified: boolean;
  shared: boolean;
  domain?: string;
  company?: DetectedCompany;
  message?: string;
}

interface ValidatedCompany {
  companyId: number;
  companyCode: string;
  brandName: string;
  legalName?: string;
  logoUrl?: string | null;
  industry?: string;
  message?: string;
}

const getClientBadgeStyle = (code: string) => {
  const c = code.toUpperCase();
  if (c === 'PRIYEX') return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', circleBg: 'bg-emerald-600' };
  if (c.includes('A')) return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', circleBg: 'bg-purple-600' };
  if (c.includes('B')) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', circleBg: 'bg-indigo-600' };
  return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', circleBg: 'bg-sky-600' };
};

export const LoginPage: React.FC = () => {
  // 2-Step Login State (Dayforce pattern)
  const [loginStep, setLoginStep] = useState<'company' | 'credentials'>('company');
  const [companyIdInput, setCompanyIdInput] = useState('');
  const [validatedCompany, setValidatedCompany] = useState<ValidatedCompany | null>(null);
  const [isValidatingCompany, setIsValidatingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [serverState, setServerState] = useState<'checking' | 'ready' | 'waking'>('checking');
  const [wakeElapsed, setWakeElapsed] = useState(0);

  // Email Domain Auto-Detection State
  const [detection, setDetection] = useState<DomainDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  // Quick Test Accounts Matrix State
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [demoClientTab, setDemoClientTab] = useState<'PRIYEX' | 'TENANT_A' | 'TENANT_B' | 'TENANT_C'>('PRIYEX');

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Proactive background ping and health status on mount
  useEffect(() => {
    prewarmBackend();
    let isMounted = true;
    let pollInterval: any;

    const testHealth = async () => {
      const isUp = await checkBackendHealth(4000);
      if (!isMounted) return;
      if (isUp) {
        setServerState('ready');
        setIsWakingUp(false);
        if (pollInterval) clearInterval(pollInterval);
      } else {
        setServerState('waking');
        if (!pollInterval) {
          pollInterval = setInterval(async () => {
            const up = await checkBackendHealth(4000);
            if (up && isMounted) {
              setServerState('ready');
              setIsWakingUp(false);
              clearInterval(pollInterval);
            }
          }, 4000);
        }
      }
    };

    testHealth();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  // Elapsed timer when waiting for cold start during submit
  useEffect(() => {
    let timer: any;
    let interval: any;
    if (isSubmitting) {
      timer = setTimeout(() => {
        setIsWakingUp(true);
      }, 3000);
      interval = setInterval(() => {
        setWakeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setIsWakingUp(false);
      setWakeElapsed(0);
    }
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isSubmitting]);

  // Debounced Domain Auto-Detection
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || !val.includes('@')) {
      setDetection(null);
      setIsDetecting(false);
      return;
    }

    const domainPart = val.substring(val.indexOf('@') + 1).trim();
    if (!domainPart || !domainPart.includes('.')) {
      setDetection(null);
      setIsDetecting(false);
      return;
    }

    setIsDetecting(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res: any = await api.get(`/tenant/detect-domain?email=${encodeURIComponent(val.trim())}`);
        if (res.success && res.data) {
          setDetection(res.data);
        }
      } catch (e) {
        // Fallback silently if domain detection fails
      } finally {
        setIsDetecting(false);
      }
    }, 250);
  };

  // Well-known demo tenants catalog for instant resolution & fallback resilience
  const KNOWN_TENANTS: Record<string, ValidatedCompany> = {
    gpn: {
      companyId: 5,
      companyCode: 'GPN',
      brandName: 'Global Payments (GPN)',
      legalName: 'Global Payments Inc.',
      logoUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=128&auto=format&fit=crop&q=80',
      industry: 'Fintech & Digital Payments'
    },
    priyex: {
      companyId: 1,
      companyCode: 'PRIYEX',
      brandName: 'Priyex Technologies',
      legalName: 'Priyex Technologies Pvt. Ltd.',
      logoUrl: null,
      industry: 'Software & Cloud HRMS'
    },
    tcs: {
      companyId: 2,
      companyCode: 'TCS',
      brandName: 'Tata Consultancy Services',
      legalName: 'Tata Consultancy Services Limited',
      logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&auto=format&fit=crop&q=80',
      industry: 'IT Services & Consulting'
    },
    wipro: {
      companyId: 3,
      companyCode: 'WIPRO',
      brandName: 'Wipro',
      legalName: 'Wipro Limited',
      logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=128&auto=format&fit=crop&q=80',
      industry: 'Information Technology & Consulting'
    },
    infosys: {
      companyId: 4,
      companyCode: 'INFOSYS',
      brandName: 'Infosys',
      legalName: 'Infosys Limited',
      logoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=128&auto=format&fit=crop&q=80',
      industry: 'Digital Services & Consulting'
    }
  };

  const handleValidateCompany = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = companyIdInput.trim();
    if (!cleanId) {
      setCompanyError('Please enter your Company ID.');
      return;
    }
    setCompanyError(null);
    setIsValidatingCompany(true);

    try {
      const res: any = await api.get(`/tenant/validate-company?identifier=${encodeURIComponent(cleanId)}`);
      if (res.success && res.data?.valid) {
        setValidatedCompany(res.data);
        setLoginStep('credentials');
        setCompanyError(null);
      } else {
        // Fallback to local catalog if known (e.g. gpn or offline seed)
        const match = KNOWN_TENANTS[cleanId.toLowerCase()];
        if (match) {
          setValidatedCompany(match);
          setLoginStep('credentials');
          setCompanyError(null);
        } else {
          setCompanyError(res.data?.message || `Company ID "${cleanId}" not found in Priyex directory.`);
        }
      }
    } catch (err: any) {
      const match = KNOWN_TENANTS[cleanId.toLowerCase()];
      if (match) {
        setValidatedCompany(match);
        setLoginStep('credentials');
        setCompanyError(null);
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          `Company ID "${cleanId}" not found. Please verify your organization identifier.`;
        setCompanyError(msg);
      }
    } finally {
      setIsValidatingCompany(false);
    }
  };

  const handleFillDemo = async (demoEmail: string) => {
    let comp = 'PRIYEX';
    if (demoEmail.includes('globalpayments.com') || demoEmail.includes('gpn')) comp = 'gpn';
    else if (demoEmail.includes('tcs.com')) comp = 'TCS';
    else if (demoEmail.includes('wipro.com')) comp = 'WIPRO';
    else if (demoEmail.includes('infosys.com')) comp = 'INFOSYS';

    setCompanyIdInput(comp);
    setEmail(demoEmail);
    setPassword('Admin@123');
    setError(null);
    setCompanyError(null);

    try {
      const res: any = await api.get(`/tenant/validate-company?identifier=${encodeURIComponent(comp)}`);
      if (res.success && res.data?.valid) {
        setValidatedCompany(res.data);
      } else if (KNOWN_TENANTS[comp.toLowerCase()]) {
        setValidatedCompany(KNOWN_TENANTS[comp.toLowerCase()]);
      }
    } catch (e) {
      if (KNOWN_TENANTS[comp.toLowerCase()]) {
        setValidatedCompany(KNOWN_TENANTS[comp.toLowerCase()]);
      }
    }

    setLoginStep('credentials');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your work email and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg =
        err?.message || (typeof err === 'string' ? err : 'Invalid email or password. Please verify your credentials.');
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const detectedBadge = detection?.company ? getClientBadgeStyle(detection.company.code) : null;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 flex items-center justify-center p-3.5 sm:p-6 py-6 safe-area-top safe-area-bottom relative overflow-x-hidden font-sans">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-indigo-500/15 rounded-full blur-[100px] sm:blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-blue-500/15 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>

      {/* Decorative Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      ></div>

      <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Back to Homepage Link */}
        <div className="mb-3.5 flex items-center justify-between px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Priyex SaaS Platform</span>
          </Link>
          <span className="text-[11px] font-medium text-slate-400">Multi-Tenant Gateway</span>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl shadow-black/40 rounded-2xl sm:rounded-[28px] p-5 sm:p-8 text-slate-900">
          
          {/* Logo & Brand Header with dynamic tenant logo on domain detection */}
          <BrandLogo
            size="lg"
            layout="col"
            className="mb-4 sm:mb-5"
            customLogoUrl={validatedCompany?.logoUrl || (detection?.identified && detection.company ? detection.company.logoUrl : undefined)}
            customBrandName={validatedCompany?.brandName || (detection?.identified && detection.company ? (detection.company.brandName || detection.company.legalName) : undefined)}
            customLegalName={validatedCompany?.legalName || (detection?.identified && detection.company ? detection.company.legalName : undefined)}
          />

          {/* Cloud Server Warming notice */}
          {serverState === 'waking' && !isSubmitting && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
              <span>Connecting to cloud database... Please allow a few seconds.</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PART 1: ENTER COMPANY ID (Dayforce Multi-Tenant Workflow)  */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {loginStep === 'company' && (
            <div className="animate-in fade-in duration-200">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Sign in
                </h2>
              </div>

              {/* Company Validation Error Banner */}
              {companyError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{companyError}</div>
                </div>
              )}

              <form onSubmit={handleValidateCompany} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company ID <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoFocus
                      value={companyIdInput}
                      onChange={(e) => {
                        setCompanyIdInput(e.target.value);
                        setCompanyError(null);
                      }}
                      placeholder="e.g. gpn"
                      className="w-full px-3.5 py-3 bg-white border border-slate-300 rounded-lg text-base font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0062cc]/20 focus:border-[#0062cc] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isValidatingCompany || !companyIdInput.trim()}
                  className="w-full py-3.5 px-6 bg-[#0062cc] hover:bg-[#0052ad] active:bg-[#00479e] text-white rounded-full text-base font-bold transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isValidatingCompany ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Company ID...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to username</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PART 2: ENTER USERNAME & PASSWORD                          */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {loginStep === 'credentials' && (
            <div className="animate-in fade-in duration-200">
              {/* Verified Company Header Bar */}
              <div className="flex items-center justify-between p-2.5 mb-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Workspace</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {validatedCompany?.brandName || validatedCompany?.companyCode}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoginStep('company');
                    setError(null);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 py-1 px-2 rounded-md hover:bg-blue-50 transition cursor-pointer shrink-0"
                >
                  Change company
                </button>
              </div>

              <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Sign in
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your credentials for <strong className="text-slate-800">{validatedCompany?.brandName || validatedCompany?.companyCode}</strong>.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">{error}</div>
                </div>
              )}

              {/* Login Credentials Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username or Work Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    />
                    {isDetecting && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-0.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim() || !password}
                  className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full text-base font-bold transition-all shadow-md shadow-blue-600/25 hover:shadow-blue-600/35 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick Demo Logins & Test Accounts Matrix */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-indigo-600 transition py-1"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Test Accounts & Multi-Tenant Role Matrix
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showDemoAccounts ? 'rotate-180' : ''}`} />
            </button>

            {showDemoAccounts && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 animate-in fade-in duration-150">
                {/* Platform Super Admin Fast Fill */}
                <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      Platform-Wide Access
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate">superadmin@priyex.com</p>
                    <p className="text-[10px] text-slate-500">Role: SUPER_ADMIN • Manages All Clients</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillDemo('superadmin@priyex.com')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs"
                  >
                    Select
                  </button>
                </div>

                {/* Client Tabs */}
                <div>
                  <div className="flex rounded-lg bg-slate-200/70 p-0.5 text-xs font-medium text-slate-600 mb-2">
                    {(
                      [
                        { id: 'PRIYEX', label: 'Priyex Platform' },
                        { id: 'TENANT_A', label: 'Tenant Alpha' },
                        { id: 'TENANT_B', label: 'Tenant Beta' },
                        { id: 'TENANT_C', label: 'Tenant Gamma' }
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setDemoClientTab(tab.id)}
                        className={`flex-1 py-1 rounded-md transition text-[11px] font-bold ${
                          demoClientTab === tab.id ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* 4 Roles per client */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {demoClientTab === 'PRIYEX' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('admin@priyex.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Platform Admin</p>
                          <p className="text-[10px] text-slate-400 truncate">admin@priyex.com</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-700">ADMIN</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('hr@priyex.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Platform HR</p>
                          <p className="text-[10px] text-slate-400 truncate">hr@priyex.com</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-pink-100 text-pink-700">HR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('manager@priyex.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Platform Manager</p>
                          <p className="text-[10px] text-slate-400 truncate">manager@priyex.com</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-700">MANAGER</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('employee@priyex.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Platform Employee</p>
                          <p className="text-[10px] text-slate-400 truncate">employee@priyex.com</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">EMPLOYEE</span>
                        </button>
                      </>
                    )}

                    {demoClientTab === 'TENANT_A' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('admin@tcs.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-purple-300 hover:bg-purple-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Tenant A Admin</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-a-admin</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-purple-100 text-purple-700">ADMIN</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('hr@tcs.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-purple-300 hover:bg-purple-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Tenant A HR Lead</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-a-hr</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-pink-100 text-pink-700">HR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('manager@tcs.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-purple-300 hover:bg-purple-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Tenant A Manager</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-a-manager</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-700">MANAGER</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('employee@tcs.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-purple-300 hover:bg-purple-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Tenant A Staff</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-a-staff</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">EMPLOYEE</span>
                        </button>
                      </>
                    )}

                    {demoClientTab === 'TENANT_B' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('admin@wipro.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Tenant B Admin</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-b-admin</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-100 text-indigo-700">ADMIN</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('hr@wipro.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Tenant B HR Lead</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-b-hr</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-pink-100 text-pink-700">HR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('manager@wipro.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Tenant B Manager</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-b-manager</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-700">MANAGER</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('employee@wipro.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Tenant B Staff</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-b-staff</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">EMPLOYEE</span>
                        </button>
                      </>
                    )}

                    {demoClientTab === 'TENANT_C' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('admin@infosys.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-300 hover:bg-sky-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700">Tenant C Admin</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-c-admin</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-sky-100 text-sky-700">ADMIN</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('hr@infosys.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-300 hover:bg-sky-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700">Tenant C HR Lead</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-c-hr</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-pink-100 text-pink-700">HR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('manager@infosys.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-300 hover:bg-sky-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700">Tenant C Manager</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-c-manager</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-700">MANAGER</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFillDemo('employee@infosys.com')}
                          className="p-2 bg-white border border-slate-200 rounded-lg text-left hover:border-sky-300 hover:bg-sky-50/50 transition group"
                        >
                          <p className="text-xs font-bold text-slate-800 group-hover:text-sky-700">Tenant C Staff</p>
                          <p className="text-[10px] text-slate-400 truncate">tenant-c-staff</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-700">EMPLOYEE</span>
                        </button>
                      </>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 text-center mt-2">
                    Password for all test accounts: <span className="font-mono font-bold text-slate-600">Admin@123</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Secure SSL & Compliance Footer */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit Encrypted Multi-Tenant Isolation • SOC-2 Type II Certified</span>
          </div>

          {/* Dayforce-Style Copyright & Legal Links */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1.5">
            <p className="text-[12px] text-slate-500">
              © {new Date().getFullYear()} Dayforce. Built on {new Date().toLocaleDateString('en-US')} {new Date().toLocaleTimeString('en-US')}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
              <Link to="/" className="hover:text-[#0062cc] underline underline-offset-2 transition flex items-center gap-1">
                <span>Terms of Use</span>
                <span className="text-[11px]">↗</span>
              </Link>
              <Link to="/" className="hover:text-[#0062cc] underline underline-offset-2 transition flex items-center gap-1">
                <span>Privacy Policy</span>
                <span className="text-[11px]">↗</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
