import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSaasOwner } from '../utils/rbac';
import { BrandLogo } from '../components/common/BrandLogo';
import { checkBackendHealth, prewarmBackend } from '../api/client';
import api from '../api/client';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

// Catalog of known enterprise domains for instant client-side resolution
const KNOWN_TENANT_DOMAINS: Record<string, { code: string; brandName: string }> = {
  'priyex.com': { code: 'PRIYEX', brandName: 'Priyex Technologies' },
  'tcs.com': { code: 'TCS', brandName: 'Tata Consultancy Services' },
  'wipro.com': { code: 'WIPRO', brandName: 'Wipro Limited' },
  'infosys.com': { code: 'INFOSYS', brandName: 'Infosys Limited' },
  'gpn.com': { code: 'GPN', brandName: 'Global Payments (GPN)' },
  'globalpayments.com': { code: 'GPN', brandName: 'Global Payments (GPN)' },
};

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [companyCode, setCompanyCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberOrg, setRememberOrg] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email Domain Auto-Detection & Mismatch State
  const [detectedCompany, setDetectedCompany] = useState<{ code: string; brandName: string } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const debounceTimerRef = useRef<any>(null);

  // Cloud backend warm-up indicator
  const [serverState, setServerState] = useState<'checking' | 'ready' | 'waking'>('checking');

  useEffect(() => {
    if (isAuthenticated) {
      if (isSaasOwner(user)) {
        navigate('/saas-console?tab=overview', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Proactive background ping for cold start
  useEffect(() => {
    prewarmBackend();
    let isMounted = true;
    checkBackendHealth(3500).then((isUp) => {
      if (!isMounted) return;
      setServerState(isUp ? 'ready' : 'waking');
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced real-time email domain detection
  const handleEmailChange = (val: string) => {
    setEmail(val);
    setError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val || !val.includes('@')) {
      setDetectedCompany(null);
      setIsDetecting(false);
      return;
    }

    const domainPart = val.substring(val.indexOf('@') + 1).trim().toLowerCase();
    if (!domainPart || !domainPart.includes('.')) {
      setDetectedCompany(null);
      setIsDetecting(false);
      return;
    }

    // 1. Instant resolution from known tenant catalog
    if (KNOWN_TENANT_DOMAINS[domainPart]) {
      const match = KNOWN_TENANT_DOMAINS[domainPart];
      setDetectedCompany(match);
      if (!companyCode.trim()) {
        setCompanyCode(match.code);
      }
      setIsDetecting(false);
      return;
    }

    // 2. Debounced API domain lookup for dynamic customer tenants
    setIsDetecting(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res: any = await api.get(`/tenant/detect-domain?email=${encodeURIComponent(val.trim())}`);
        if (res.success && res.data?.identified && res.data?.company) {
          const match = {
            code: res.data.company.code,
            brandName: res.data.company.brandName || res.data.company.legalName || res.data.company.code,
          };
          setDetectedCompany(match);
          if (!companyCode.trim()) {
            setCompanyCode(match.code);
          }
        }
      } catch (e) {
        // Fallback silently if domain detection fails
      } finally {
        setIsDetecting(false);
      }
    }, 250);
  };

  // Check if there is an explicit mismatch between company code and email domain
  const isMismatch = Boolean(
    detectedCompany &&
    companyCode.trim() &&
    detectedCompany.code.toUpperCase() !== companyCode.trim().toUpperCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyCode.trim()) {
      setError('Organization / Company Code is required. Please enter your Organization ID.');
      return;
    }

    if (!email.trim() || !password) {
      setError('Please provide both your work email and password.');
      return;
    }

    // Block submission if there is an active domain-workspace mismatch
    if (isMismatch && detectedCompany) {
      setError(
        `Workspace Mismatch: "${email.trim()}" belongs to ${detectedCompany.brandName} (${detectedCompany.code}), not ${companyCode.trim().toUpperCase()}. Please switch your Organization Code to "${detectedCompany.code}" to sign in.`
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login({
        email: email.trim(),
        password,
        companyCode: companyCode.trim() ? companyCode.trim().toUpperCase() : undefined,
      });

      if (loggedUser) {
        if (isSaasOwner(loggedUser)) {
          navigate('/saas-console?tab=overview', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError('Invalid credentials. Please verify your company code, email, and password.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errMsg =
        err?.message ||
        err?.response?.data?.message ||
        (typeof err === 'string' ? err : 'Login failed. Please verify credentials.');
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-gradient-to-b from-slate-50/80 via-indigo-50/30 to-white flex items-center justify-center p-3.5 sm:p-6 py-8 relative overflow-x-hidden font-sans">
      {/* Technical Dot Matrix Background */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Multi-Color Radial Mesh Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[380px] bg-gradient-to-r from-blue-400/15 via-indigo-400/20 to-teal-400/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Navigation & Header Brand Bar */}
        <div className="mb-4 flex items-center justify-between px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-200/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Priyex Platform</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-500">Multi-Tenant Gateway</span>
        </div>

        {/* Unified Direct Sign-In Card (Identical to Landing Page Hero Form) */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/90 p-5 sm:p-7 relative overflow-hidden">
          
          {/* Top Ambient Gradient Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500" />

          {/* Brand Logo & Header */}
          <div className="mb-4 pb-3 border-b border-slate-100 flex items-start justify-between">
            <div>
              <div className="mb-2">
                <BrandLogo size="md" layout="row" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Client Portal Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Access your organization's workspace
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Multi-Tenant SSO
            </span>
          </div>

          {/* Cloud Server Warming notice */}
          {serverState === 'waking' && !isSubmitting && (
            <div className="mb-3.5 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-800 flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Connecting to cloud engine... Please allow a few seconds.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <div className="flex-1 font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Organization & Domain Mismatch Interactive Warning Banner */}
            {isMismatch && detectedCompany && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-1.5 animate-in fade-in duration-150">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium leading-relaxed">
                    <span className="font-bold">Workspace Mismatch:</span> Your email (<strong className="text-slate-900">{email}</strong>) is associated with <strong>{detectedCompany.brandName} ({detectedCompany.code})</strong>, but Organization Code is set to <strong>{companyCode}</strong>.
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-6 pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyCode(detectedCompany.code);
                      setError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                  >
                    Switch Organization to {detectedCompany.code}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyCode('');
                      setError(null);
                    }}
                    className="text-[11px] text-amber-700 hover:underline font-medium cursor-pointer"
                  >
                    Clear Code
                  </button>
                </div>
              </div>
            )}

            {/* Company Code / Tenant Identifier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Organization / Company Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyCode}
                  onChange={(e) => {
                    setCompanyCode(e.target.value.toUpperCase());
                    setError(null);
                  }}
                  placeholder="Enter your Organization ID / Code"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 tracking-wider placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition uppercase"
                />
              </div>
            </div>

            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username or Work Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter your work email or username"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoComplete="username"
                  autoFocus
                />
                {isDetecting && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer font-medium">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Notice */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberOrg}
                  onChange={(e) => setRememberOrg(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-600 font-medium">Remember Organization</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">256-bit TLS</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-indigo-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating Workspace...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Status Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold truncate">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Form 16 & Tax Window Live</span>
              </span>
              <span className="text-slate-400 text-[10px] font-mono">
                v3.3 Cloud
              </span>
            </div>
          </form>
        </div>

        {/* Security & Compliance Badges Row */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            SOC 2 Type II
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            ISO 27001 Certified
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            100% Tenant Isolation
          </span>
        </div>

        {/* Footer Copyright */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Priyex Platform. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
};
