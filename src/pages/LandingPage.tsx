import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { BrandLogo } from '../components/common/BrandLogo';
import { BookDemoModal } from '../components/marketing/BookDemoModal';
import { ContactSalesModal } from '../components/marketing/ContactSalesModal';
import { ProductTourModal } from '../components/marketing/ProductTourModal';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  Receipt,
  Headphones,
  Sliders,
  Lock,
  Globe,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  Smartphone,
  Flame,
  Award,
  BarChart3,
  Check,
  Menu,
  X,
  ExternalLink,
  MapPin,
  TrendingUp,
  Cpu,
  Database,
  Bot,
  Zap,
  Radio,
  SlidersHorizontal,
  Send,
  Activity,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Phone
} from 'lucide-react';
import { isSaasOwner } from '../utils/rbac';

// Catalog of known enterprise domains for instant client-side resolution
const KNOWN_TENANT_DOMAINS: Record<string, { code: string; brandName: string }> = {
  'priyex.com': { code: 'PRIYEX', brandName: 'Priyex Technologies' },
  'tcs.com': { code: 'TCS', brandName: 'Tata Consultancy Services' },
  'wipro.com': { code: 'WIPRO', brandName: 'Wipro Limited' },
  'infosys.com': { code: 'INFOSYS', brandName: 'Infosys Limited' },
  'gpn.com': { code: 'GPN', brandName: 'Global Payments (GPN)' },
  'globalpayments.com': { code: 'GPN', brandName: 'Global Payments (GPN)' },
};

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Modals
  const [isBookDemoOpen, setIsBookDemoOpen] = useState(false);
  const [isContactSalesOpen, setIsContactSalesOpen] = useState(false);
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);

  // Hero interactive architectural demo state
  const [heroTenant, setHeroTenant] = useState<'HQ_GLOBAL' | 'TECH_SUBSIDIARY' | 'FINANCE_DIVISION' | 'REGIONAL_BRANCH'>('HQ_GLOBAL');

  // Embedded Hero Live Login State
  const [heroCompanyCode, setHeroCompanyCode] = useState('');
  const [heroEmail, setHeroEmail] = useState('');
  const [heroPassword, setHeroPassword] = useState('');
  const [heroShowPassword, setHeroShowPassword] = useState(false);
  const [heroRememberOrg, setHeroRememberOrg] = useState(true);
  const [heroLoginError, setHeroLoginError] = useState<string | null>(null);
  const [heroIsSubmitting, setHeroIsSubmitting] = useState(false);

  // Email Domain Auto-Detection & Mismatch State
  const [heroDetectedCompany, setHeroDetectedCompany] = useState<{ code: string; brandName: string } | null>(null);
  const heroDebounceRef = useRef<any>(null);

  // Real-time email change handler with automatic tenant detection
  const handleHeroEmailChange = (val: string) => {
    setHeroEmail(val);
    setHeroLoginError(null);

    if (heroDebounceRef.current) {
      clearTimeout(heroDebounceRef.current);
    }

    if (!val || !val.includes('@')) {
      setHeroDetectedCompany(null);
      return;
    }

    const domain = val.substring(val.indexOf('@') + 1).trim().toLowerCase();
    if (!domain || !domain.includes('.')) {
      setHeroDetectedCompany(null);
      return;
    }

    // 1. Instant resolution from known tenant catalog
    if (KNOWN_TENANT_DOMAINS[domain]) {
      const match = KNOWN_TENANT_DOMAINS[domain];
      setHeroDetectedCompany(match);
      if (!heroCompanyCode.trim()) {
        setHeroCompanyCode(match.code);
      }
      return;
    }

    // 2. Debounced query to backend domain resolver
    heroDebounceRef.current = setTimeout(async () => {
      try {
        const res: any = await api.get(`/tenant/detect-domain?email=${encodeURIComponent(val.trim())}`);
        if (res.success && res.data?.identified && res.data?.company) {
          const match = {
            code: res.data.company.code,
            brandName: res.data.company.brandName || res.data.company.legalName || res.data.company.code,
          };
          setHeroDetectedCompany(match);
          if (!heroCompanyCode.trim()) {
            setHeroCompanyCode(match.code);
          }
        }
      } catch (e) {
        // Fallback silently if domain detection fails
      }
    }, 250);
  };

  // Check if there is an organization code mismatch between input and detected email domain
  const isHeroMismatch = Boolean(
    heroDetectedCompany &&
    heroCompanyCode.trim() &&
    heroDetectedCompany.code.toUpperCase() !== heroCompanyCode.trim().toUpperCase()
  );

  const handleHeroLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!heroCompanyCode.trim()) {
      setHeroLoginError('Organization / Company Code is required. Please enter your Organization ID.');
      return;
    }

    if (!heroEmail.trim() || !heroPassword) {
      setHeroLoginError('Please enter both your work email/username and password.');
      return;
    }

    // Pre-flight check: Warn and block explicit workspace domain mismatches
    if (isHeroMismatch && heroDetectedCompany) {
      setHeroLoginError(
        `Workspace Mismatch: "${heroEmail.trim()}" belongs to ${heroDetectedCompany.brandName} (${heroDetectedCompany.code}), not ${heroCompanyCode.trim().toUpperCase()}. Please switch your Organization Code to "${heroDetectedCompany.code}" to sign in.`
      );
      return;
    }

    setHeroLoginError(null);
    setHeroIsSubmitting(true);

    try {
      const loggedUser = await login({
        email: heroEmail.trim(),
        password: heroPassword,
        companyCode: heroCompanyCode ? heroCompanyCode.trim().toUpperCase() : undefined,
      });

      if (loggedUser) {
        if (isSaasOwner(loggedUser)) {
          navigate('/saas-console?tab=overview', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setHeroLoginError('Invalid credentials. Please verify your company code, email, and password.');
      }
    } catch (err: any) {
      console.error('Hero login error:', err);
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        (typeof err === 'string' ? err : 'Login failed. Please verify credentials.');
      setHeroLoginError(msg);
    } finally {
      setHeroIsSubmitting(false);
    }
  };

  // Interactive Product Sandbox State (Includes Priyex Continuous Engine & AI Assistant)
  const [sandboxTab, setSandboxTab] = useState<'continuous-engine' | 'ai-assistant' | 'overview' | 'payroll' | 'attendance' | 'multitenant' | 'mobile'>('continuous-engine');

  // Priyex Continuous Calculation Engine State
  const [ceMonthlyBase, setCeMonthlyBase] = useState(85000);
  const [ceWorkHours, setCeWorkHours] = useState(9.5); // standard 8h + 1.5h OT
  const [ceOvertimeType, setCeOvertimeType] = useState<'regular' | 'holiday'>('regular');
  const [ceTaxRegime, setCeTaxRegime] = useState<'new' | 'old'>('new');
  const [ceEngineView, setCeEngineView] = useState<'continuous' | 'traditional'>('continuous');

  // Priyex Intelligence AI Assistant State
  const [aiActivePromptId, setAiActivePromptId] = useState<number>(1);
  const [aiIsTyping, setAiIsTyping] = useState<boolean>(false);
  const [aiCustomInput, setAiCustomInput] = useState<string>('');
  const [aiConversation, setAiConversation] = useState<Array<{ sender: 'user' | 'ai'; text: string; data?: any; actions?: string[] }>>([
    {
      sender: 'user',
      text: 'Run April 2026 payroll variance check for Greater Noida and Bangalore tech hubs.'
    },
    {
      sender: 'ai',
      text: 'Audited 1,280 active headcount across Greater Noida HQ and Bangalore campuses. Continuous Calculation Engine has reconciled 100% of shift punches against biometric geofence logs.',
      data: {
        variance: '0.00% (Clean)',
        auditedStaff: 1280,
        statutoryPassed: 'EPF, ESI, PT, TDS Section 115BAC',
        overtimeApproved: '₹1,42,800 across 34 engineers',
        complianceHash: 'SHA256-PRIYEX-2026-04-OK'
      },
      actions: ['Download Statutory Audit Sheet', 'Auto-Approve 4 Clean Exceptions', 'Send Summary to Leadership']
    }
  ]);

  // Top Announcement Ticker State (Enterprise HCM)
  const [tickerIndex, setTickerIndex] = useState(0);

  // Sandbox: Payroll simulator
  const [simMonthlyGross, setSimMonthlyGross] = useState(85000);
  const [simTaxRegime, setSimTaxRegime] = useState<'new' | 'old'>('new');
  const [isPayrollRunning, setIsPayrollRunning] = useState(false);
  const [payrollRunCompleted, setPayrollRunCompleted] = useState(false);

  // Sandbox: Attendance clock-in simulator
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [punchTime, setPunchTime] = useState('09:14 AM');

  // Sandbox: Multi-tenant policy preview (Generic operational tiers)
  const [policyTier, setPolicyTier] = useState<'ENTERPRISE_3TIER' | 'STANDARD_2TIER' | 'AGILE_DIRECT'>('ENTERPRISE_3TIER');

  // ROI Calculator State
  const [roiEmployees, setRoiEmployees] = useState(150);
  const [roiHrStaff, setRoiHrStaff] = useState(4);

  // Pricing State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Real-time clock for attendance simulator
  const [currentTime, setCurrentTime] = useState(() =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate dynamic payroll simulation figures
  const basicSalary = Math.round(simMonthlyGross * 0.5);
  const hraSalary = Math.round(simMonthlyGross * 0.25);
  const specialAllowance = simMonthlyGross - basicSalary - hraSalary;
  const pfDeduction = Math.min(Math.round(basicSalary * 0.12), 1800);
  const esiDeduction = simMonthlyGross <= 21000 ? Math.round(simMonthlyGross * 0.0075) : 0;
  const ptDeduction = 200;
  const estimatedTax = simTaxRegime === 'new' ? Math.round(simMonthlyGross * 0.04) : Math.round(simMonthlyGross * 0.065);
  const totalDeductions = pfDeduction + esiDeduction + ptDeduction + estimatedTax;
  const netTakeHome = simMonthlyGross - totalDeductions;

  // Calculate ROI Metrics
  const monthlyHoursSaved = Math.round(roiEmployees * 0.85 + roiHrStaff * 18);
  const annualHoursSaved = monthlyHoursSaved * 12;
  const hourlyRate = 650; // INR average hourly cost of HR specialist
  const annualSavingsInLakhs = ((annualHoursSaved * hourlyRate) / 100000).toFixed(1);

  // Continuous Engine dynamic calculations (Real-time calculation)
  const ceDailyBase = Math.round(ceMonthlyBase / 26);
  const ceHourlyRate = Math.round(ceDailyBase / 8);
  const ceOvertimeHours = Math.max(0, ceWorkHours - 8);
  const ceOvertimeMultiplierVal = ceOvertimeType === 'holiday' ? 2.0 : 1.5;
  const ceOvertimePay = Math.round(ceOvertimeHours * ceHourlyRate * ceOvertimeMultiplierVal * 26);
  const ceCalculatedGross = ceMonthlyBase + ceOvertimePay;
  const ceBasic = Math.round(ceCalculatedGross * 0.5);
  const ceHra = Math.round(ceCalculatedGross * 0.25);
  const cePfEmployee = Math.min(Math.round(ceBasic * 0.12), 1800);
  const cePfEmployer = Math.min(Math.round(ceBasic * 0.12), 1800);
  const ceEsi = ceCalculatedGross <= 21000 ? Math.round(ceCalculatedGross * 0.0075) : 0;
  const cePt = 200;
  const ceTds = ceTaxRegime === 'new' ? Math.round(ceCalculatedGross * 0.04) : Math.round(ceCalculatedGross * 0.065);
  const ceTotalDeductions = cePfEmployee + ceEsi + cePt + ceTds;
  const ceNetTakeHome = ceCalculatedGross - ceTotalDeductions;

  // Continuous Calculation Ticker Announcements
  const tickerAnnouncements = [
    {
      badge: 'Enterprise Benchmark',
      text: 'Continuous Calculation Engine Active — 0ms calculation latency across 100% of shift punches.',
      linkText: 'Explore Engine'
    },
    {
      badge: 'Multi-Tenant Cloud 2.0',
      text: 'Strict Logical Tenant Perimeters, JWT Cryptographic Verification & Biometric Geofences.',
      linkText: 'Read Architecture'
    },
    {
      badge: 'Forrester Model Impact',
      text: 'Delivers 176% Estimated Enterprise ROI with 45-Minute Month-End Payroll Closure.',
      linkText: 'Calculate ROI'
    }
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % 3);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  // AI Prompt Library for Interactive Assistant
  const aiPromptLibrary = [
    {
      id: 1,
      chip: '⚡ April 2026 Payroll Variance & Tax Audit',
      query: 'Run April 2026 payroll variance check for Greater Noida and Bangalore tech hubs.',
      reply: 'Audited 1,280 active headcount across Greater Noida HQ and Bangalore campuses. Continuous Calculation Engine has reconciled 100% of shift punches against biometric geofence logs.',
      data: {
        variance: '0.00% (Clean)',
        auditedStaff: 1280,
        statutoryPassed: 'EPF, ESI, PT, TDS Section 115BAC',
        overtimeApproved: '₹1,42,800 across 34 engineers',
        complianceHash: 'SHA256-PRIYEX-2026-04-OK'
      },
      actions: ['Download Statutory Audit Sheet', 'Auto-Approve 4 Clean Exceptions', 'Send Summary to Leadership']
    },
    {
      id: 2,
      chip: '📍 Greater Noida Geofence Attendance Anomaly',
      query: 'Check biometric geofence attendance exceptions for Greater Noida Campus today.',
      reply: 'Scanned 842 clock-in attempts against the 250m perimeter (Lat 28.5355, Lon 77.3910). 838 punches verified successfully within radius; 4 field engineers logged remote check-ins with client-site GPS tags.',
      data: {
        variance: '99.5% In-Perimeter',
        auditedStaff: 842,
        statutoryPassed: 'Biometric Authenticated',
        overtimeApproved: '4 Field Approvals Pending',
        complianceHash: 'GEOFENCE-RADAR-OK'
      },
      actions: ['Approve 4 Field Client GPS Logs', 'View Geofence Map Radar', 'Notify Security Desk']
    },
    {
      id: 3,
      chip: '⚖️ Compare Old vs New Tax Regime (Sec 115BAC)',
      query: 'Compare tax deduction impact between Old and New Tax Regime for ₹15 Lakhs CTC.',
      reply: 'Analysis completed for ₹15,00,000 CTC. Under the New Tax Regime (Section 115BAC revised slabs), employee tax liability is ₹1,40,400 with standard deduction ₹75,000. Under the Old Regime, employee requires minimum ₹3,85,000 in 80C, 80D, and HRA deductions to break even.',
      data: {
        variance: '₹22,400 Avg Savings',
        auditedStaff: '₹15,00,000 CTC',
        statutoryPassed: 'Section 115BAC Compliant',
        overtimeApproved: '72% Opted for New Regime',
        complianceHash: 'CBDT-CIRCULAR-VALID'
      },
      actions: ['Generate Tax Comparison PDF', 'Send Regime Election Reminder', 'Update Payroll Preferences']
    },
    {
      id: 4,
      chip: '📋 Generate Statutory EPF/ESI Reconciliation',
      query: 'Prepare statutory ECR file preview and remittance statement for EPFO & ESIC.',
      reply: 'Generated automated Electronic Challan cum Return (ECR) for current cycle. Total EPF contribution ₹15,36,000 (12% Employee + 12% Employer split into EPS & EPF A/c 1). ESIC contribution calculated for 42 eligible staff under ₹21,000 ceiling.',
      data: {
        variance: 'ECR Format Ready',
        auditedStaff: 1280,
        statutoryPassed: 'EPFO & ESIC Compliant',
        overtimeApproved: '₹15.36 Lakhs Remittance',
        complianceHash: 'ECR-PORTAL-VALID-2026'
      },
      actions: ['Download ECR Text File', 'Export Challan Payment Receipt', 'Lock Payroll Cycle']
    }
  ];

  const handleSelectAiPrompt = (prompt: typeof aiPromptLibrary[0]) => {
    setAiActivePromptId(prompt.id);
    setAiIsTyping(true);
    setAiConversation([
      { sender: 'user', text: prompt.query }
    ]);
    setTimeout(() => {
      setAiConversation([
        { sender: 'user', text: prompt.query },
        { sender: 'ai', text: prompt.reply, data: prompt.data, actions: prompt.actions }
      ]);
      setAiIsTyping(false);
    }, 700);
  };

  const handleSendCustomAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCustomInput.trim()) return;
    const q = aiCustomInput.trim();
    setAiCustomInput('');
    setAiIsTyping(true);
    setAiConversation((prev) => [...prev, { sender: 'user', text: q }]);
    setTimeout(() => {
      setAiConversation((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Analyzing "${q}" across active multi-tenant workspace perimeters. Continuous Calculation Engine verified all queries against your tenant policy.`,
          data: {
            variance: 'Analyzed in 0.12s',
            auditedStaff: 'Workspace Live',
            statutoryPassed: '100% Policy Match',
            overtimeApproved: 'Priyex AI Audited',
            complianceHash: 'AI-REPLY-OK'
          },
          actions: ['View Detailed Audit Logs', 'Create Automated Policy', 'Ask Follow-up Query']
        }
      ]);
      setAiIsTyping(false);
    }, 900);
  };

  // Simulated Payroll Run
  const handleTriggerPayrollRun = () => {
    setIsPayrollRunning(true);
    setPayrollRunCompleted(false);
    setTimeout(() => {
      setIsPayrollRunning(false);
      setPayrollRunCompleted(true);
    }, 1200);
  };

  // Generic multi-tenant demonstration entities (Zero client-specific data)
  const heroTenantInfo = {
    HQ_GLOBAL: {
      name: 'Enterprise Parent Holdings',
      headcount: '1,250 Active Team Members (Sample)',
      attendance: '97.4% Attendance Rate',
      payrollStatus: 'Monthly Batch Disbursed (Sample)',
      domain: '@enterprise-holding.com',
      badge: 'Parent Organization Tenant',
      code: 'HQ',
      label: 'Parent Holding'
    },
    TECH_SUBSIDIARY: {
      name: 'Digital & Cloud Solutions Subsidiary',
      headcount: '680 Active Team Members (Sample)',
      attendance: '98.2% Attendance Rate',
      payrollStatus: 'Statutory Taxes Computed (Sample)',
      domain: '@tech.enterprise-holding.com',
      badge: 'Isolated Subsidiary Tenant',
      code: 'TC',
      label: 'Tech Subsidiary'
    },
    FINANCE_DIVISION: {
      name: 'Financial & Capital Division',
      headcount: '420 Active Team Members (Sample)',
      attendance: '96.8% Attendance Rate',
      payrollStatus: 'Audit-Ready Batch (Sample)',
      domain: '@fin.enterprise-holding.com',
      badge: 'Isolated Subsidiary Tenant',
      code: 'FS',
      label: 'Finance Division'
    },
    REGIONAL_BRANCH: {
      name: 'Regional Operations Hub',
      headcount: '310 Active Team Members (Sample)',
      attendance: '97.1% Attendance Rate',
      payrollStatus: 'Shift Perimeters Enforced (Sample)',
      domain: '@apac.enterprise-holding.com',
      badge: 'Regional Branch Tenant',
      code: 'RO',
      label: 'Regional Hub'
    }
  };

  const faqs = [
    {
      q: 'How does Priyex guarantee multi-tenant data isolation?',
      a: 'Priyex is built from the ground up on strict multi-tenant isolation. Every client organization operates in a dedicated logical space with tenant-scoped database queries, JWT authentication context verification, and separate storage perimeters. One client can never see, query, or infer data from another client.'
    },
    {
      q: 'How does email domain auto-detection work during sign-in?',
      a: 'When an employee types their corporate email (e.g. alex@yourcompany.com), our system detects the domain in real-time, displays their organization’s white-label branding and logo, and routes authentication requests directly to their organization’s policy perimeter without requiring manual tenant selection.'
    },
    {
      q: 'Can each client organization configure its own approval tiers and policies?',
      a: 'Yes. Priyex features a Multi-Tenant Policy Engine. Each client organization can configure independent approval tiers (e.g., Direct HR, Manager -> HR, or Team Lead -> Manager -> HR), custom leave quota allocations, geofence coordinates, and shift timings.'
    },
    {
      q: 'Is Priyex compliant with statutory Indian payroll regulations?',
      a: '100% compliant. Priyex handles Employee Provident Fund (EPF), Employee State Insurance (ESI), state-specific Professional Tax (PT), and Income Tax TDS under both the Old Tax Regime and the New Tax Regime (Section 115BAC), with Chapter VI-A investment declaration workflows.'
    },
    {
      q: 'How long does it take to migrate from legacy HRMS to Priyex?',
      a: 'With our bulk employee import templates, automated client onboarding engine, and assisted data migration, most organizations go live within 3 to 7 business days.'
    },
    {
      q: 'Can we try the platform before committing to a contract?',
      a: 'Absolutely. You can schedule a 30-minute tailored live demo with one of our HR Solutions Architects, during which we provision an isolated test sandbox for your company.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      
      {/* ─── 1. TOP ANNOUNCEMENT BANNER ─── */}
      {isAuthenticated ? (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs safe-area-top">
          <div className="max-w-7xl xl:max-w-[1440px] mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0" />
              <span className="truncate">
                Welcome back, <strong>{user?.fullName}</strong>! You are currently signed in to the{' '}
                <strong>{user?.company?.brandName || 'Priyex'}</strong> workspace.
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50 px-3 py-1 rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-slate-300 px-4 py-2 text-xs font-medium border-b border-indigo-900/40 safe-area-top relative overflow-hidden">
          <div className="max-w-7xl xl:max-w-[1440px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 truncate">
              <span className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-cyan-300 border border-indigo-500/30 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 animate-pulse">
                {tickerAnnouncements[tickerIndex].badge}
              </span>
              <span className="text-slate-200 truncate text-[11px] sm:text-xs transition-opacity duration-300">
                {tickerAnnouncements[tickerIndex].text}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden md:flex items-center gap-1.5">
                {tickerAnnouncements.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTickerIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      tickerIndex === i ? 'w-4 bg-cyan-400' : 'bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  if (tickerIndex === 0) {
                    setSandboxTab('continuous-engine');
                    document.getElementById('sandbox')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (tickerIndex === 1) {
                    setIsProductTourOpen(true);
                  } else {
                    document.getElementById('roi-calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition text-xs cursor-pointer group"
              >
                <span>{tickerAnnouncements[tickerIndex].linkText}</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 2. STICKY NAVBAR (Page-Fitted & Responsive) ─── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs transition-all">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[68px] sm:h-[72px] flex items-center justify-between gap-3 xl:gap-6">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="cursor-pointer flex items-center hover:opacity-95 transition">
              <BrandLogo size="md" layout="row" showTagline={true} useTenantContext={false} />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-xs xl:text-[13px] font-semibold text-slate-600">
            {/* Solutions Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={() => setSolutionsDropdownOpen(true)}
              onMouseLeave={() => setSolutionsDropdownOpen(false)}
            >
              <a
                href="#features"
                className={`flex items-center gap-1.5 px-2.5 xl:px-3.5 py-2 rounded-xl transition ${
                  solutionsDropdownOpen
                    ? 'text-slate-900 bg-slate-100/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span>Solutions & Modules</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    solutionsDropdownOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'
                  }`}
                />
              </a>

              {/* Flyout Panel */}
              {solutionsDropdownOpen && (
                <div className="absolute top-full left-0 pt-2 w-88 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200/80 p-2 space-y-1">
                    <a
                      href="#features"
                      onClick={() => setSolutionsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">
                          Core HR & Directory
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Master employee directory, org hierarchy & document vault
                        </p>
                      </div>
                    </a>

                    <a
                      href="#features"
                      onClick={() => setSolutionsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <CalendarCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition">
                          Attendance & Geofencing
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Biometric syncing, shift rosters & mobile GPS punch
                        </p>
                      </div>
                    </a>

                    <a
                      href="#features"
                      onClick={() => setSolutionsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <CircleDollarSign className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          Payroll & Indian Tax
                        </p>
                        <p className="text-[11px] text-slate-500">
                          EPF, ESI, TDS, 115BAC regimes & Form 16 payslips
                        </p>
                      </div>
                    </a>

                    <a
                      href="#multitenant"
                      onClick={() => setSolutionsDropdownOpen(false)}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition group border-t border-slate-100 pt-2"
                    >
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition">
                        <ShieldCheck className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition">
                          Multi-Tenant SaaS Perimeters
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Logical data isolation with organization-specific policies
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#multitenant"
              className="px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              Multi-Tenancy
            </a>
            <a
              href="#sandbox"
              className="px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              Interactive Preview
            </a>
            <a
              href="#roi-calculator"
              className="px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              ROI Calculator
            </a>
            <a
              href="#security"
              className="px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              Enterprise Trust
            </a>
            <a
              href="#pricing"
              className="px-2.5 xl:px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 transition"
            >
              Plans & Pricing
            </a>
          </nav>

            {/* CTA Buttons */}
          <div className="flex items-center gap-2 xl:gap-3 shrink-0">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-[13px] shadow-sm shadow-indigo-600/20 hover:shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Launch Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsBookDemoOpen(true)}
                className="px-3.5 xl:px-4.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs xl:text-[13px] shadow-sm shadow-indigo-600/20 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                <span>Book a Demo</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-4 sm:px-5 py-4 space-y-3.5 animate-in slide-in-from-top-4 duration-200 shadow-xl">
            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-800">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition flex items-center justify-between"
              >
                <span>Solutions & Modules</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#multitenant"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition flex items-center justify-between"
              >
                <span>Multi-Tenant Architecture</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#sandbox"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition flex items-center justify-between"
              >
                <span>Interactive Preview</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#roi-calculator"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition flex items-center justify-between"
              >
                <span>ROI Calculator</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#security"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition flex items-center justify-between"
              >
                <span>Enterprise Security</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition flex items-center justify-between"
              >
                <span>Plans & Pricing</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsBookDemoOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-bold text-sm text-center shadow-md shadow-indigo-600/20 active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Schedule a 1-on-1 Live Demo</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ─── 3. HERO SECTION (Page-Fitted, Enterprise Brand Aesthetics) ─── */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/80 via-indigo-50/30 to-white">
        {/* Subtle Technical Dot Matrix Background */}
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient Multi-Color Radial Mesh Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[380px] bg-gradient-to-r from-blue-400/15 via-indigo-400/20 to-teal-400/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* ── 2-Column Split Hero: Left Enterprise Value & Helpdesk + Right Live Login Form ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center pt-2 sm:pt-4">
            
            {/* ── LEFT COLUMN (7 Cols): Brand, Value Proposition & Helpdesk Widget ── */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6 sm:space-y-7 text-left">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-indigo-200/80 shadow-2xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600" />
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                  The Enterprise Multi-Tenant People Cloud
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[44px] xl:text-[50px] font-black tracking-tight text-slate-950 leading-[1.14]">
                One Unified Platform to Power Your Entire{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                  Workforce Lifecycle
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed font-normal">
                Priyex delivers modern SaaS HRMS with guaranteed multi-tenant data perimeters, automated statutory payroll, real-time biometric attendance, and seamless employee self-service. Built for high-growth enterprises and conglomerates.
              </p>

              {/* Action Buttons & Triggers */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setIsBookDemoOpen(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Schedule a 1-on-1 Live Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#sandbox"
                  className="px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
                  <span>Test-Drive Live Sandbox</span>
                </a>
              </div>

              {/* Trust Badges Row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  SOC 2 Type II
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Lock className="w-4 h-4 text-blue-600" />
                  ISO 27001 Certified
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  100% Tenant Isolation
                </span>
                <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  99.99% Uptime SLA
                </span>
              </div>
            </div>

            {/* ── RIGHT COLUMN (5 Cols): Embedded Interactive Client Portal Sign-In Card ── */}
            <div id="login-hero" className="lg:col-span-5 xl:col-span-5 w-full flex justify-center lg:justify-end">
              {isAuthenticated ? (
                /* Authenticated State Card */
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/90 p-7 text-center space-y-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Portal Session Active
                    </span>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      Welcome Back!
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Signed in as <strong className="text-slate-800">{user?.fullName || user?.email}</strong>
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{user?.company?.brandName || user?.company?.code || 'Priyex Platform'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <span>Launch Workspace Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Interactive Direct Sign-In Form (Compact, Secure, No Public User Details) */
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/90 p-5 sm:p-6 relative overflow-hidden max-w-[420px] mx-auto lg:ml-auto lg:mr-0">
                  {/* Top ambient color bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500" />

                  {/* Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div>
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

                  {/* Form */}
                  <form onSubmit={handleHeroLogin} className="space-y-3.5 pt-3.5">
                    {heroLoginError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <div className="flex-1 font-medium leading-relaxed">{heroLoginError}</div>
                      </div>
                    )}

                    {/* Organization & Domain Mismatch Interactive Warning Banner */}
                    {isHeroMismatch && heroDetectedCompany && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col gap-1.5 animate-in fade-in duration-150">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1 font-medium leading-relaxed">
                            <span className="font-bold">Workspace Mismatch:</span> Your email (<strong className="text-slate-900">{heroEmail}</strong>) is associated with <strong>{heroDetectedCompany.brandName} ({heroDetectedCompany.code})</strong>, but Organization Code is set to <strong>{heroCompanyCode}</strong>.
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pl-6 pt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setHeroCompanyCode(heroDetectedCompany.code);
                              setHeroLoginError(null);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-[11px] transition shadow-2xs cursor-pointer"
                          >
                            Switch Organization to {heroDetectedCompany.code}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHeroCompanyCode('');
                              setHeroLoginError(null);
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
                          value={heroCompanyCode}
                          onChange={(e) => {
                            setHeroCompanyCode(e.target.value.toUpperCase());
                            setHeroLoginError(null);
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
                          id="hero-email-input"
                          type="text"
                          value={heroEmail}
                          onChange={(e) => handleHeroEmailChange(e.target.value)}
                          placeholder="Enter your work email or username"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          autoComplete="username"
                        />
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
                          type={heroShowPassword ? 'text' : 'password'}
                          value={heroPassword}
                          onChange={(e) => setHeroPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setHeroShowPassword(!heroShowPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {heroShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember me & Notice */}
                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={heroRememberOrg}
                          onChange={(e) => setHeroRememberOrg(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-slate-600 font-medium">Remember Organization</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">256-bit TLS</span>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={heroIsSubmitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-indigo-600/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-1"
                    >
                      {heroIsSubmitting ? (
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

                    {/* Notice line */}
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
              )}
            </div>
          </div>

          {/* ── Enterprise Solutions & Sales Desk Banner (Centered, Spanning Hero Width) ── */}
          <div className="mt-8 sm:mt-10 max-w-5xl mx-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-blue-100/90 shadow-md p-4 sm:p-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      Enterprise Solutions & Sales Desk
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Custom Implementation, RFPs & Multi-Tenant Procurement
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Response SLA &lt; 2h</span>
                </div>
              </div>

              {/* 4 Inquiries Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {/* 1. Direct Tech & Sales Email */}
                <a
                  href="mailto:tech.priyex@gmail.com?subject=Enterprise%20HRMS%20Sales%20Inquiry"
                  className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-200 transition group block"
                >
                  <div className="flex items-center gap-2 text-slate-700 group-hover:text-blue-700 font-bold text-xs truncate">
                    <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">tech.priyex@gmail.com</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    Enterprise RFPs, bids & security questionnaires
                  </div>
                </a>

                {/* 2. Schedule Live Architecture Tour */}
                <button
                  type="button"
                  onClick={() => setIsBookDemoOpen(true)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-slate-700 group-hover:text-indigo-700 font-bold text-xs truncate">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">Schedule Live Tour</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    30-minute customized tenant walkthrough
                  </div>
                </button>

                {/* 3. Custom Enterprise Pricing */}
                <button
                  type="button"
                  onClick={() => setIsContactSalesOpen(true)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200/80 hover:border-teal-200 transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-slate-700 group-hover:text-teal-700 font-bold text-xs truncate">
                    <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="truncate">Enterprise Pricing</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    Volume discounts for 500+ employees
                  </div>
                </button>

                {/* 4. Digital In-App Helpdesk */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs truncate">
                    <Headphones className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">Digital In-App Helpdesk</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    Active tenant support tickets & SLA desk
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Mutual NDA signed on request • 100% tenant data privacy</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsContactSalesOpen(true)}
                  className="text-blue-600 hover:text-blue-700 font-bold hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <span>Open Sales Inquiry Form</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Dynamic Hero Interactive Showcase Card (Enterprise Architecture) ── */}
          <div className="relative mt-8 sm:mt-10 max-w-5xl mx-auto">
            {/* Subtle Ambient Backlight Glow under Console */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-teal-500/20 rounded-3xl blur-xl -z-10 opacity-70 pointer-events-none" />

            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-3xl p-2 sm:p-3 shadow-2xl shadow-indigo-950/30 border border-slate-800/90 ring-1 ring-white/10">
              
              {/* Window Header with Multi-Tenant Switcher */}
              <div className="px-4 py-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                
                {/* Traffic lights + Status */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">
                    cloud.priyex.com • Multi-Tenant Enterprise Engine
                  </span>
                </div>

                {/* Tenant Switcher Simulator Pills */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 sm:gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-500 px-2 hidden md:inline shrink-0">
                    Simulate Multi-Tenant Workspace:
                  </span>
                  {(['HQ_GLOBAL', 'TECH_SUBSIDIARY', 'FINANCE_DIVISION', 'REGIONAL_BRANCH'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setHeroTenant(t)}
                      className={`px-2.5 sm:px-3 py-1.5 sm:py-1 rounded-lg font-bold text-[11px] text-center transition-all cursor-pointer ${
                        heroTenant === t
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {heroTenantInfo[t].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Showcase Body Preview */}
              <div className="p-4 sm:p-6 text-white space-y-6">
                
                {/* Top Tenant Header in Simulator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-950 to-blue-900 border border-indigo-700/50 flex items-center justify-center font-black text-lg text-cyan-300 shadow-inner shrink-0">
                      {heroTenantInfo[heroTenant].code}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-white truncate">
                          {heroTenantInfo[heroTenant].name}
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/15 text-cyan-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                          {heroTenantInfo[heroTenant].badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        Domain: <span className="font-mono text-slate-300">{heroTenantInfo[heroTenant].domain}</span> • Zero Cross-Tenant Data Leakage
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Isolated Tenant Storage Perimeter
                    </span>
                  </div>
                </div>

                {/* Real-time Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Workforce Size</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1.5">
                      {heroTenantInfo[heroTenant].headcount.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Sample Demonstration
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Daily Attendance Rate</span>
                      <CalendarCheck className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1.5">
                      {heroTenantInfo[heroTenant].attendance.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-teal-400 font-medium mt-1">
                      Biometric & Geofenced sync active
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Statutory Payroll Batch</span>
                      <CircleDollarSign className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1.5">
                      Disbursed
                    </div>
                    <div className="text-[10px] text-purple-400 font-medium mt-1">
                      Automated TDS & EPF calculations
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 font-semibold flex items-center justify-between">
                      <span>Approval Pipeline</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xl font-bold text-white mt-1.5">Standard Workflow</div>
                    <div className="text-[10px] text-amber-400 font-medium mt-1">
                      Multi-tier governance active
                    </div>
                  </div>
                </div>

                {/* Live Activity Stream in Simulator */}
                <div className="p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-slate-300 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-slate-400 font-mono text-[11px]">[System Preview]</span>
                    <span className="truncate">
                      Simulated punch recorded within verified corporate office geofenced perimeter (Coordinates Verified)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsBookDemoOpen(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request Full Walkthrough</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. INDUSTRY-AGNOSTIC HCM PLATFORM CAPABILITIES ─── */}
      <section className="py-12 border-y border-slate-200/80 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            Priyex HCM Solutions Across Key Industry Verticals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-700 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>Technology & SaaS Enterprises</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-700 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <CircleDollarSign className="w-4 h-4 text-purple-600" />
              <span>Financial Services & FinTech</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-700 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Healthcare & Life Sciences</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-700 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Manufacturing & Industrial</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-700 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Retail & Multi-Unit Stores</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-700 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Professional Services</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-5">
            Every client organization operates on a strictly isolated multi-tenant perimeter with customized policies, approval workflows, and branding.
          </p>
        </div>
      </section>

      {/* ─── 5. INTERACTIVE LIVE PRODUCT SANDBOX (The Priyex Continuum Experience) ─── */}
      <section id="sandbox" className="py-20 lg:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Interactive Product Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Test-Drive Priyex In Action — Right Now
            </h2>
            <p className="text-sm text-slate-600">
              Interact with simulated modules below to see how Priyex streamlines day-to-day HR automation, multi-tenant isolation, and accurate calculations.
            </p>
          </div>

          {/* Sandbox Module Tabs (Horizontally swipeable on mobile/iPhone, neatly wrapped on desktop) */}
          <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap items-center sm:justify-center gap-2 mb-8 pb-2 sm:pb-0 px-1 -mx-1">
            <button
              onClick={() => setSandboxTab('continuous-engine')}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px] ${
                sandboxTab === 'continuous-engine'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span>Continuous Pay Engine</span>
              <span className="text-[9px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase font-black">
                Priyex Live
              </span>
            </button>

            <button
              onClick={() => setSandboxTab('ai-assistant')}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px] ${
                sandboxTab === 'ai-assistant'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white shadow-lg shadow-cyan-600/30 ring-2 ring-cyan-400'
                  : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Priyex AI Copilot</span>
              <span className="text-[9px] bg-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded uppercase font-black">
                Interactive
              </span>
            </button>

            <button
              onClick={() => setSandboxTab('overview')}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px] ${
                sandboxTab === 'overview'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Executive Dashboard</span>
            </button>

            <button
              onClick={() => setSandboxTab('payroll')}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px] ${
                sandboxTab === 'payroll'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CircleDollarSign className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Automated Payroll Simulator</span>
            </button>

            <button
              onClick={() => setSandboxTab('attendance')}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px] ${
                sandboxTab === 'attendance'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CalendarCheck className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Biometric & Geofenced Time Clock</span>
            </button>

            <button
              onClick={() => setSandboxTab('multitenant')}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px] ${
                sandboxTab === 'multitenant'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Multi-Tenant Policy Engine</span>
            </button>

            <button
              onClick={() => setSandboxTab('mobile')}
              className={`shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer min-h-[42px] ${
                sandboxTab === 'mobile'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Smartphone className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Mobile Self-Service View</span>
            </button>
          </div>

          {/* Sandbox Interactive Stage */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl min-h-[440px]">
            
            {/* TAB: CONTINUOUS CALCULATION ENGINE (Priyex Real-Time) */}
            {sandboxTab === 'continuous-engine' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <h3 className="font-black text-xl text-slate-950 flex items-center gap-2">
                        <span>Continuous Calculation Engine</span>
                        <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                          0ms Calculation Latency
                        </span>
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      Traditional batch payroll waits until month-end, creating 5 days of manual spreadsheets and calculation errors. Priyex continuously recalculates gross earnings, statutory EPF/ESI, and net take-home with every shift punch.
                    </p>
                  </div>

                  {/* Architecture Comparison Toggle */}
                  <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl self-start">
                    <button
                      onClick={() => setCeEngineView('continuous')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ceEngineView === 'continuous'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ⚡ Priyex Continuous
                    </button>
                    <button
                      onClick={() => setCeEngineView('traditional')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ceEngineView === 'traditional'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ⏳ Traditional Batch
                    </button>
                  </div>
                </div>

                {ceEngineView === 'traditional' ? (
                  <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 text-slate-800 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                        ⚠️
                      </div>
                      <div>
                        <h4 className="font-extrabold text-rose-950 text-base">The Hidden Cost of Traditional Batch HRMS</h4>
                        <p className="text-xs text-rose-800/90 mt-1 leading-relaxed">
                          In legacy systems, payroll only processes once every 30 days. When an employee logs overtime, swaps a shift, or applies for leave, calculations are held in static queues.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      <div className="bg-white p-3.5 rounded-xl border border-rose-200/70">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Turnaround Delay</span>
                        <div className="text-2xl font-black text-rose-950 mt-1">4 to 5 Days</div>
                        <span className="text-[11px] text-slate-500">Spent on manual Excel cross-checks</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-rose-200/70">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Discrepancy Rate</span>
                        <div className="text-2xl font-black text-rose-950 mt-1">12.4%</div>
                        <span className="text-[11px] text-slate-500">Of payslips require retro corrections</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-rose-200/70">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Employee Friction</span>
                        <div className="text-2xl font-black text-rose-950 mt-1">High</div>
                        <span className="text-[11px] text-slate-500">Employees cannot see their live pay accrual</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCeEngineView('continuous')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Switch to Priyex Continuous Engine →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: Interactive Controls */}
                    <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Simulate Shift & Pay</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          LIVE REACTIVE
                        </span>
                      </div>

                      {/* Control 1: Monthly Base CTC */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600">Base Monthly Salary:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            ₹{ceMonthlyBase.toLocaleString()}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={30000}
                          max={250000}
                          step={5000}
                          value={ceMonthlyBase}
                          onChange={(e) => setCeMonthlyBase(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>₹30K</span>
                          <span>₹1.4L</span>
                          <span>₹2.5L</span>
                        </div>
                      </div>

                      {/* Control 2: Daily Hours Logged (Overtime Slider) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-600">Shift Working Hours:</span>
                          <span className="font-mono font-bold text-emerald-600 text-sm">
                            {ceWorkHours} hrs {ceWorkHours > 8 ? `(+${(ceWorkHours - 8).toFixed(1)}h OT)` : '(Standard)'}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={8}
                          max={12}
                          step={0.5}
                          value={ceWorkHours}
                          onChange={(e) => setCeWorkHours(Number(e.target.value))}
                          className="w-full accent-emerald-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>8h (Standard)</span>
                          <span>10h (+2h OT)</span>
                          <span>12h (+4h Double)</span>
                        </div>
                      </div>

                      {/* Control 3: Overtime Multiplier */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-600 block">Overtime Rate Multiplier:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setCeOvertimeType('regular')}
                            className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                              ceOvertimeType === 'regular'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Standard OT (1.5x)
                          </button>
                          <button
                            onClick={() => setCeOvertimeType('holiday')}
                            className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                              ceOvertimeType === 'holiday'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Weekend/Holiday (2.0x)
                          </button>
                        </div>
                      </div>

                      {/* Control 4: Tax Regime */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-slate-600 block">Statutory Tax Regime:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setCeTaxRegime('new')}
                            className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                              ceTaxRegime === 'new'
                                ? 'bg-cyan-50 border-cyan-300 text-cyan-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            New Regime (Sec 115BAC)
                          </button>
                          <button
                            onClick={() => setCeTaxRegime('old')}
                            className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                              ceTaxRegime === 'old'
                                ? 'bg-cyan-50 border-cyan-300 text-cyan-900'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Old Regime (80C / HRA)
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right: Real-time Live Computed Payslip Output Card */}
                    <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest">
                            Real-Time Continuous Ledger
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                          Audited SHA-256
                        </span>
                      </div>

                      {/* Net Take-Home Highlight Banner */}
                      <div className="bg-gradient-to-r from-emerald-950/60 to-teal-950/60 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-emerald-300 font-semibold block">Continuous Net Take-Home Pay</span>
                          <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight mt-0.5 block">
                            ₹{ceNetTakeHome.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">Accrued automatically with zero month-end variance</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Accrual</span>
                          <span className="text-lg font-bold text-white font-mono">
                            ₹{ceCalculatedGross.toLocaleString()}
                          </span>
                          {ceOvertimePay > 0 && (
                            <span className="text-[10px] text-teal-400 block font-semibold">
                              +₹{ceOvertimePay.toLocaleString()} OT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Statutory Breakdown Matrix */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">EPF (12%)</span>
                          <span className="text-sm font-bold text-slate-100 font-mono">₹{cePfEmployee.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-500 block">EPFO Cap Valid</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">ESI (0.75%)</span>
                          <span className="text-sm font-bold text-slate-100 font-mono">₹{ceEsi.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-500 block">{ceCalculatedGross <= 21000 ? 'Eligible' : 'Exempt (>21K)'}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">State PT</span>
                          <span className="text-sm font-bold text-slate-100 font-mono">₹{cePt.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-500 block">Monthly Slab</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">TDS Tax</span>
                          <span className="text-sm font-bold text-amber-400 font-mono">₹{ceTds.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-500 block">{ceTaxRegime === 'new' ? '115BAC Slab' : 'Old Regime'}</span>
                        </div>
                      </div>

                      {/* Engine Heartbeat Footer */}
                      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-2">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Status: Continuous Calculation active for 1,280 employees</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[10px]">Audit Checksum: 0ms Latency</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: PRIYEX AI COPILOT INTERACTIVE PLAYGROUND */}
            {sandboxTab === 'ai-assistant' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                      <Bot className="w-6 h-6 text-cyan-600" />
                      <span>Priyex Intelligence Copilot — AI Assistant</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Ask complex workforce, statutory compliance, or headcount queries in natural language. Powered by strictly tenant-isolated multi-tenant RAG.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold bg-cyan-50 text-cyan-800 px-3 py-1 rounded-full border border-cyan-200">
                      Priyex Copilot Experience
                    </span>
                  </div>
                </div>

                {/* Prompt Suggestion Chips */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Click an Executive Query to Test-Drive AI:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {aiPromptLibrary.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectAiPrompt(p)}
                        className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer border ${
                          aiActivePromptId === p.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/50'
                        }`}
                      >
                        {p.chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Chat Stage */}
                <div className="bg-slate-900 rounded-2xl p-5 text-white border border-slate-800 space-y-4 min-h-[320px] flex flex-col justify-between">
                  <div className="space-y-4">
                    {aiConversation.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 text-xs leading-relaxed ${
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.sender === 'ai' && (
                          <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 font-bold">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}
                        <div
                          className={`p-3.5 rounded-2xl max-w-xl ${
                            msg.sender === 'user'
                              ? 'bg-emerald-600 text-white font-medium'
                              : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 space-y-3'
                          }`}
                        >
                          <p>{msg.text}</p>

                          {/* Structured Dynamic Data Cards */}
                          {msg.data && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700">
                              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Calculation Status</span>
                                <span className="text-xs font-bold text-emerald-400">{msg.data.variance}</span>
                              </div>
                              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Headcount Verified</span>
                                <span className="text-xs font-bold text-cyan-400">{msg.data.auditedStaff}</span>
                              </div>
                              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-700/60 col-span-2 sm:col-span-1">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Statutory Gate</span>
                                <span className="text-xs font-bold text-indigo-300">{msg.data.statutoryPassed}</span>
                              </div>
                            </div>
                          )}

                          {/* Quick Action Buttons */}
                          {msg.actions && msg.actions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.actions.map((act, i) => (
                                <button
                                  key={i}
                                  onClick={() => alert(`Simulated Action Executed: ${act}`)}
                                  className="text-[10px] font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/80 px-2.5 py-1 rounded-md transition cursor-pointer"
                                >
                                  ⚡ {act}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {aiIsTyping && (
                      <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                        <Bot className="w-4 h-4 animate-spin" />
                        <span>Priyex AI Copilot is verifying tenant data perimeters...</span>
                      </div>
                    )}
                  </div>

                  {/* Working Input Box */}
                  <form onSubmit={handleSendCustomAiQuery} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask Priyex AI anything about payroll, statutory compliance, or attendance..."
                      value={aiCustomInput}
                      onChange={(e) => setAiCustomInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={aiIsTyping || !aiCustomInput.trim()}
                      className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Ask AI</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 1: EXECUTIVE DASHBOARD */}
            {sandboxTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Workforce Pulse & Department Distribution
                    </h3>
                    <p className="text-xs text-slate-500">Live analytics aggregated across active corporate units</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Viewing Period:</span>
                    <span className="text-xs font-bold text-slate-800 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      October 2026 (Live Cycle)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>Total Employees</span>
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">1,280</div>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">98.2% Active on Payroll</div>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>Today's Attendance</span>
                      <CalendarCheck className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">96.8%</div>
                    <div className="text-[11px] text-teal-600 font-bold mt-1">1,239 Clocked In Today</div>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>On Approved Leave</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">28</div>
                    <div className="text-[11px] text-amber-600 font-bold mt-1">Casual, Sick & Privilege</div>
                  </div>

                  <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <span>Open Approvals</span>
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">5</div>
                    <div className="text-[11px] text-indigo-600 font-bold mt-1">Manager & HR Pipeline</div>
                  </div>
                </div>

                {/* Simulated Department Chart Bars */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Workforce Allocation by Department
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">Engineering & Product Development</span>
                        <span className="text-slate-900 font-bold">538 Employees (42%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">Sales & Customer Success</span>
                        <span className="text-slate-900 font-bold">307 Employees (24%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '24%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">Operations & Infrastructure</span>
                        <span className="text-slate-900 font-bold">230 Employees (18%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">People Operations & Talent Acquisition</span>
                        <span className="text-slate-900 font-bold">103 Employees (8%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '8%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: AUTOMATED PAYROLL SIMULATOR */}
            {sandboxTab === 'payroll' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Interactive CTC & Net Pay Calculator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Simulate gross pay breakdown, statutory deductions (PF, ESI, PT), and tax regime impact
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 px-2">Tax Regime:</span>
                    <button
                      onClick={() => setSimTaxRegime('new')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        simTaxRegime === 'new'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      New (Sec 115BAC)
                    </button>
                    <button
                      onClick={() => setSimTaxRegime('old')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                        simTaxRegime === 'old'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Old Regime
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Slider Control */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <label className="block text-xs font-bold text-slate-700">
                      Adjust Monthly Gross Salary (CTC Component):
                    </label>
                    <div className="text-3xl font-black text-slate-900">
                      ₹{simMonthlyGross.toLocaleString('en-IN')}
                      <span className="text-xs font-semibold text-slate-400"> / month</span>
                    </div>
                    <input
                      type="range"
                      min={25000}
                      max={350000}
                      step={5000}
                      value={simMonthlyGross}
                      onChange={(e) => setSimMonthlyGross(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                      <span>₹25,000</span>
                      <span>₹1,50,000</span>
                      <span>₹3,50,000</span>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleTriggerPayrollRun}
                        disabled={isPayrollRunning}
                        className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isPayrollRunning ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Computing Statutory Payroll Batch...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Simulate 1-Click Monthly Payroll Run</span>
                          </>
                        )}
                      </button>
                      {payrollRunCompleted && (
                        <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-xs font-bold text-emerald-800 animate-in fade-in">
                          ✓ Payroll Batch Computed: 1,280 slips generated with 0 discrepancies!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                      Earnings Breakdown
                    </h4>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Basic Salary (50%)</span>
                      <span className="font-bold text-slate-900">₹{basicSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">House Rent Allowance (HRA 25%)</span>
                      <span className="font-bold text-slate-900">₹{hraSalary.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Special Allowance</span>
                      <span className="font-bold text-slate-900">₹{specialAllowance.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-extrabold text-slate-900">
                      <span>Total Gross Pay</span>
                      <span>₹{simMonthlyGross.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Deductions & Take Home */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                      Statutory Deductions & Net Take-Home
                    </h4>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Employee PF (12% of Basic)</span>
                      <span className="font-bold text-rose-600">-₹{pfDeduction.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Professional Tax (PT)</span>
                      <span className="font-bold text-rose-600">-₹{ptDeduction}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Estimated Income Tax (TDS)</span>
                      <span className="font-bold text-rose-600">-₹{estimatedTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-emerald-700 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                      <span>Net Take-Home Pay</span>
                      <span>₹{netTakeHome.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BIOMETRIC & GEOFENCED TIME CLOCK */}
            {sandboxTab === 'attendance' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Real-Time Biometric Punch & Geofenced Time Clock
                    </h3>
                    <p className="text-xs text-slate-500">
                      Simulate employee clock-in, coordinate validation against corporate office perimeter
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Clock: {currentTime}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Punch In Widget */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-4">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Interactive Clock Simulator
                    </div>
                    
                    <button
                      onClick={() => setIsClockedIn(!isClockedIn)}
                      className={`w-32 h-32 rounded-full mx-auto flex flex-col items-center justify-center font-black transition-all cursor-pointer shadow-lg ${
                        isClockedIn
                          ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25 ring-8 ring-rose-100'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-8 ring-emerald-100'
                      }`}
                    >
                      <Clock className="w-8 h-8 mb-1" />
                      <span className="text-sm">{isClockedIn ? 'CLOCK OUT' : 'CLOCK IN'}</span>
                    </button>

                    <div className="text-xs font-semibold text-slate-600">
                      {isClockedIn ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          Active Status: Clocked In at {punchTime}
                        </span>
                      ) : (
                        <span className="text-slate-400">Click the button above to punch attendance</span>
                      )}
                    </div>
                  </div>

                  {/* Geofence & GPS Verification */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                      Perimeter & Geofence Coordinates
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Bangalore Tech Park Periphery</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Coordinates: 12.9716° N, 77.5946° E
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Inside Allowed Work Perimeter (Radius: 250m)
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Grace Time Allowed:</span>
                        <span className="font-bold text-slate-900">15 Minutes</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Standard Shift Hours:</span>
                        <span className="font-bold text-slate-900">09:00 AM - 06:00 PM</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Overtime Auto-Calculation:</span>
                        <span className="font-bold text-emerald-600">Active (1.5x Rate)</span>
                      </div>
                    </div>
                  </div>

                  {/* Leave Quota Summary */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100">
                      Leave Quotas & Balances
                    </h4>
                    <div className="space-y-2.5">
                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">Casual Leave (CL)</span>
                        <span className="font-bold text-slate-900">8 / 12 Remaining</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">Sick Leave (SL)</span>
                        <span className="font-bold text-slate-900">5 / 7 Remaining</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">Privilege Leave (PL)</span>
                        <span className="font-bold text-slate-900">14 / 18 Remaining</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700">Compensatory Off (C-Off)</span>
                        <span className="font-bold text-emerald-600">2 Days in Wallet</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MULTI-TENANT POLICY ENGINE */}
            {sandboxTab === 'multitenant' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Multi-Tenant Architecture & Policy Engine
                    </h3>
                    <p className="text-xs text-slate-500">
                      Demonstrating how each client organization enforces isolated rules, domain routing & branding
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 px-2">Policy Tier:</span>
                    {(
                      [
                        { id: 'ENTERPRISE_3TIER', label: 'Enterprise (3-Tier)' },
                        { id: 'STANDARD_2TIER', label: 'Mid-Market (2-Tier)' },
                        { id: 'AGILE_DIRECT', label: 'Agile (Direct)' }
                      ] as const
                    ).map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setPolicyTier(tier.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                          policyTier === tier.id
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Policy Configuration Card */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-800">
                        {policyTier === 'ENTERPRISE_3TIER'
                          ? 'Global Enterprise Policy Model'
                          : policyTier === 'STANDARD_2TIER'
                          ? 'Standard Corporate Policy Model'
                          : 'Agile Subsidiary Policy Model'}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Isolated Tenant Perimeter
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Corporate Domain Scope:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {policyTier === 'ENTERPRISE_3TIER'
                            ? '@enterprise-global.com (Auto-Isolated)'
                            : policyTier === 'STANDARD_2TIER'
                            ? '@regional-corp.com (Auto-Isolated)'
                            : '@tech-subsidiary.io (Auto-Isolated)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Approval Workflow Tiers:</span>
                        <span className="font-bold text-blue-600">
                          {policyTier === 'ENTERPRISE_3TIER'
                            ? '3-Tier (Team Lead -> Dept Head -> HR Exec)'
                            : policyTier === 'STANDARD_2TIER'
                            ? '2-Tier (Direct Manager -> HR Operations)'
                            : '1-Tier Fast-Track (Direct Manager)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Attendance Grace Window:</span>
                        <span className="font-bold text-slate-900">
                          {policyTier === 'ENTERPRISE_3TIER'
                            ? '10 Minutes'
                            : policyTier === 'STANDARD_2TIER'
                            ? '15 Minutes'
                            : '30 Minutes (Flextime Policy)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Mandatory Shift Length:</span>
                        <span className="font-bold text-slate-900">
                          {policyTier === 'ENTERPRISE_3TIER' ? '8.5 Hours' : policyTier === 'STANDARD_2TIER' ? '9.0 Hours' : '8.0 Hours (Core Flex)'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-500">Database Query Isolation:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4" /> Enforced via X-Company-Id Header
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Architecture Diagram Card */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Zero-Leakage Cloud Data Flow
                    </h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="font-mono text-slate-300">1. Client Request</span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          domain: {policyTier === 'ENTERPRISE_3TIER' ? 'enterprise-global.com' : policyTier === 'STANDARD_2TIER' ? 'regional-corp.com' : 'tech-subsidiary.io'}
                        </span>
                      </div>
                      <div className="text-center text-slate-500 text-xs">↓</div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span className="font-mono text-slate-300">2. Security Gateway</span>
                        <span className="text-[10px] text-indigo-400 font-bold">JWT Tenant Context & Role Authority Validation</span>
                      </div>
                      <div className="text-center text-slate-500 text-xs">↓</div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-emerald-900/40 bg-emerald-950/20 flex items-center justify-between">
                        <span className="font-mono text-emerald-300">3. Isolated Tenant Data</span>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          WHERE company_id = {policyTier === 'ENTERPRISE_3TIER' ? '1001' : policyTier === 'STANDARD_2TIER' ? '1002' : '1003'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 pt-1">
                      No client organization can ever read or alter records from another tenant under any circumstance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: MOBILE SELF-SERVICE VIEW */}
            {sandboxTab === 'mobile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      Responsive Employee Self-Service (Mobile Experience)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Delight your workforce on any device with 1-tap punch, leave requests, and digital payslips
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Works on iOS & Android Web
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-2">
                  {/* Smartphone Mockup */}
                  <div className="w-[300px] h-[520px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 relative shrink-0">
                    {/* Screen Notch */}
                    <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

                    <div className="bg-slate-50 h-[470px] rounded-[30px] p-3.5 overflow-hidden text-slate-900 flex flex-col justify-between text-xs">
                      <div className="space-y-3">
                        {/* Mobile Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                              P
                            </div>
                            <span className="font-black text-xs">Priyex People</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                            Online
                          </span>
                        </div>

                        {/* Mobile Punch Card */}
                        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-sm text-center">
                          <span className="text-[10px] opacity-80 uppercase tracking-widest">Office Clock-In</span>
                          <div className="text-xl font-black mt-0.5">{currentTime}</div>
                          <div className="text-[10px] opacity-90 mt-1">Bangalore Campus Geofence OK</div>
                        </div>

                        {/* Quick Mobile Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs font-bold text-[11px] text-slate-800">
                            Apply Leave
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs font-bold text-[11px] text-slate-800">
                            Payslips
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs font-bold text-[11px] text-slate-800">
                            Expense Claim
                          </div>
                          <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs font-bold text-[11px] text-slate-800">
                            HR Live Chat
                          </div>
                        </div>

                        {/* Recent Announcement */}
                        <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-950">
                          <span className="font-bold text-indigo-900 block">Company Townhall Notice</span>
                          <span>All-hands quarterly meeting scheduled for Friday at 4 PM IST.</span>
                        </div>
                      </div>

                      {/* Mobile Bottom Bar */}
                      <div className="pt-2 border-t border-slate-200 flex justify-around text-[10px] text-slate-500 font-bold">
                        <span className="text-emerald-600">Home</span>
                        <span>Directory</span>
                        <span>Requests</span>
                        <span>Profile</span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Next to Mockup */}
                  <div className="max-w-md space-y-4">
                    <h4 className="text-xl font-black text-slate-900">
                      No Native App Downloads Required
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Priyex runs as a high-performance Progressive Web Application (PWA). Employees can access all features from any smartphone browser without needing MDM profile installs or cumbersome app store updates.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Biometric fingerprint / FaceID recognition on supported devices</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Instant PDF payslip generation and local download</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Live push notifications for approval updates & urgent broadcasts</span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setIsBookDemoOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                      >
                        Schedule Mobile Walkthrough
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 6. CORE FEATURE SUITES (Enterprise Deep Dive) ─── */}
      <section id="features" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              The Priyex Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Enterprise HCM Capabilities Engineered for Growth
            </h2>
            <p className="text-sm text-slate-600">
              From day-one onboarding to retirement compensation, Priyex automates every stage of the employee journey with state-of-the-art security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Feature 1: Core HR & Master Directory */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Core HR & Digital Onboarding
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralize employee master records, digital document uploads, emergency contacts, and organizational hierarchies. Paperless onboarding with step-by-step verification checklists.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Custom designation bands (L1 - L6)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Profile edit requests with approval audits</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bulk employee CSV import engine</span>
                </div>
              </div>
            </div>

            {/* Feature 2: Automated Statutory Payroll */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                <CircleDollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Automated Payroll & Statutory Tax
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete compensation engine supporting EPF, ESI, Professional Tax, and Income Tax (TDS). Dual tax regime support with automated Chapter VI-A investment declarations and proof reviews.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>1-click monthly batch disbursals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Form 16 & statutory export files</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-purple-600" />
                  <span>Digitally signed PDF payslips</span>
                </div>
              </div>
            </div>

            {/* Feature 3: Biometric Attendance & Geofencing */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Biometric Shifts & Geofencing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eliminate buddy punching with real-time biometric machine integration and mobile geofenced perimeter verification. Manage shift rotations, compensatory off wallets, and regularization.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>GPS perimeters with radius enforcement</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Automated overtime & late mark deductions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-teal-600" />
                  <span>Multi-tier regularization approval chains</span>
                </div>
              </div>
            </div>

            {/* Feature 4: Expense Management */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Multi-Tier Expense Claims
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Capture corporate travel and meal expenses on the go. Attach receipt images, specify business rationale, and route through customizable multi-level approval hierarchies.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Receipt attachment with in-app preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Mileage & per-diem automated allowances</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Direct payroll reimbursement link</span>
                </div>
              </div>
            </div>

            {/* Feature 5: In-App Support Desk & Broadcasts */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Headphones className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Live HR Helpdesk & Alerts
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide instant resolution with a floating HR live chat widget. Broadcast company-wide announcements with urgent/important priority flags visible directly in the top app banner.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Floating in-app employee query chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Emergency banner broadcasts with acknowledge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>SLA tracking and ticket escalation</span>
                </div>
              </div>
            </div>

            {/* Feature 6: Multi-Tenant Provisioning */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Multi-Client SaaS Provisioning
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Super-Admin controls to onboard new client companies in under 60 seconds. Map custom domains (@client.com), upload white-label brand logos, and configure independent policies.
              </p>
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Zero-leakage isolated data perimeters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Automatic email domain detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Custom branch locations & holiday calendars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. INTERACTIVE BUSINESS VALUE & ROI CALCULATOR (Enterprise Suite) ─── */}
      <section id="roi-calculator" className="py-20 lg:py-28 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Explanatory Copy */}
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Measurable Business ROI
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                Calculate What You Save With Priyex Automation
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Manual spreadsheets, attendance reconciliations, and payroll disputes consume hundreds of productive hours every month. See how much time and money Priyex saves your business.
              </p>

              <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Eliminate 99% of monthly payroll calculation errors</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Reduce month-end attendance closure from 5 days to 45 mins</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </div>
                  <span>Self-service reduces repetitive HR queries by up to 60%</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Sliders & Live Results Card */}
            <div className="lg:col-span-7 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-3xl p-6 sm:p-9 text-white shadow-2xl border border-slate-800">
              
              <div className="space-y-6">
                
                {/* Slider 1: Employee Count */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Total Workforce Size</span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {roiEmployees} Employees
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={2500}
                    step={10}
                    value={roiEmployees}
                    onChange={(e) => setRoiEmployees(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>20</span>
                    <span>1,000</span>
                    <span>2,500+</span>
                  </div>
                </div>

                {/* Slider 2: HR Admin Team Size */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300">Dedicated HR / Payroll Specialists</span>
                    <span className="text-base font-black text-teal-400 font-mono">
                      {roiHrStaff} Staff Members
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={roiHrStaff}
                    onChange={(e) => setRoiHrStaff(Number(e.target.value))}
                    className="w-full accent-teal-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>1 Member</span>
                    <span>8 Members</span>
                    <span>15 Members</span>
                  </div>
                </div>

                {/* Dynamic Calculated Outputs */}
                <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Estimated Monthly Hours Saved
                    </span>
                    <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                      ~{monthlyHoursSaved} hrs
                    </div>
                    <span className="text-[10px] text-slate-400">
                      ~{annualHoursSaved.toLocaleString('en-IN')} hours freed annually
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Annual Financial Cost Savings
                    </span>
                    <div className="text-3xl font-black text-teal-400 font-mono mt-1">
                      ₹{annualSavingsInLakhs} Lakhs
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Based on automated operations & error reduction
                    </span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsBookDemoOpen(true)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Request Custom ROI Assessment for {roiEmployees} Employees</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. MULTI-TENANT SAAS ARCHITECTURE BREAKDOWN ─── */}
      <section id="multitenant" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              True SaaS Cloud Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Engineered with Enterprise-Grade Multi-Tenant Isolation
            </h2>
            <p className="text-sm text-slate-600">
              Unlike generic single-tenant installs or shared tables, Priyex provides a hardened multi-tenant gateway ensuring complete tenant boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Automatic Domain Routing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prospects and employees log in using their company email address. The system automatically detects corporate domains and loads the corresponding workspace branding.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Tenant Context Interceptor</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every API call verifies the JWT claims and active organization context. Cross-company access attempts are strictly rejected at the Spring Boot filter layer.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Isolated Policy Engine</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Each client organization enforces independent approval tiers, shifts, geofence coordinates, and leave quota rules tailored to their operational policies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900">Immutable Audit Logging</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every sensitive action—salary structure edits, employee promotions, and login attempts—is permanently timestamped and logged for enterprise compliance reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. ENTERPRISE TRUST, SECURITY & COMPLIANCE ─── */}
      <section id="security" className="py-20 lg:py-28 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Enterprise Trust & Compliance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Bank-Grade Security for Your Most Sensitive Employee Data
            </h2>
            <p className="text-sm text-slate-400">
              We understand that compensation, bank accounts, and personal records demand the highest level of protection and regulatory compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">256-Bit TLS & Data Encryption</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All data in transit is encrypted using modern TLS 1.3 encryption. Confidential compensation and banking attributes are encrypted at rest with AES-256.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Granular Role-Based Access (RBAC)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict separation of privileges between Super Admins, Client HR Admins, Department Managers, and Employees. Zero unauthorized elevation of privilege.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">SOC 2 & ISO 27001 Standards</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Engineered in compliance with ISO/IEC 27001 security standards, SOC 2 Type II audit readiness, and India's Digital Personal Data Protection (DPDP) Act.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Automated Daily Backups & Disaster Recovery</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Continuous point-in-time database backups with geo-redundant snapshots ensuring an RPO of under 15 minutes and rapid automated failover.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">99.99% Uptime SLA Commitment</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-availability cloud container clusters with health checking, automated traffic pre-warming, and zero scheduled downtime during business hours.
              </p>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white">Mandatory First-Login Password Policy</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Forced password reset upon initial employee login with bcrypt password hashing (12 rounds) and proactive session revocation mechanisms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. CLIENT TESTIMONIALS & CASE PROOFS ─── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Customer Success
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Trusted by HR Directors & Technology Leaders
            </h2>
            <p className="text-sm text-slate-600">
              See what forward-thinking enterprises say about switching from fragmented tools to Priyex HCM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-slate-50 p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "Priyex transformed our payroll operations completely. What previously took 5 full business days of Excel cross-checking now runs in under 45 minutes with zero statutory calculation disputes."
              </p>
              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                  SV
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Siddharth Verma</h4>
                  <p className="text-[11px] text-slate-500">Chief People Officer, Enterprise Tech</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "The multi-tenant isolation and email domain auto-detection are pure brilliance. We manage 3 subsidiary brands under one parent umbrella, and each company has its own logo, policy, and isolated database."
              </p>
              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  AN
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Archana Nair</h4>
                  <p className="text-[11px] text-slate-500">VP of HR Operations & Technology</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-7 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                "Our employees love the mobile web self-service. They punch in seamlessly, apply for leaves, and download their salary slips in seconds. Our HR support query volume dropped by over 60% in month one."
              </p>
              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  RS
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Rohit Sengupta</h4>
                  <p className="text-[11px] text-slate-500">Head of Talent & People Operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. TRANSPARENT SAAS PRICING PLANS ─── */}
      <section id="pricing" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Simple, Predictable Plans for Growing Organizations
            </h2>
            <p className="text-sm text-slate-600">
              Choose the package that fits your organization size. No hidden setup fees or surprise charges.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
                Monthly Billing
              </span>
              <button
                type="button"
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-12 h-6 bg-slate-200 rounded-full p-0.5 transition-colors relative cursor-pointer"
              >
                <div
                  className={`w-5 h-5 bg-emerald-600 rounded-full transition-transform ${
                    billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
                <span>Annual Billing</span>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Plan 1: Starter Growth */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-slate-500">
                  Starter Growth
                </span>
                <h3 className="text-xl font-black text-slate-900">Workforce Foundation</h3>
                <p className="text-xs text-slate-600">
                  Ideal for emerging teams up to 50 employees establishing formal HR processes.
                </p>

                <div className="pt-2">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{billingCycle === 'annual' ? '79' : '99'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium"> / employee / month</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Core HR & Employee Directory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Biometric & Web Attendance Clock</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Leave Quota & Balance Management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Employee Self-Service Mobile Web</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="line-through">Automated Statutory Payroll</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsBookDemoOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                Start Free Trial
              </button>
            </div>

            {/* Plan 2: Enterprise Business (Most Popular) */}
            <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-8 rounded-3xl border-2 border-emerald-500 shadow-2xl shadow-indigo-950/30 flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                Most Popular for Enterprises
              </div>

              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                  Enterprise Business
                </span>
                <h3 className="text-xl font-black text-white">Complete People Cloud</h3>
                <p className="text-xs text-slate-300">
                  Comprehensive HCM, automated multi-state payroll, geofencing & multi-level approvals.
                </p>

                <div className="pt-2">
                  <span className="text-3xl font-black text-white">
                    ₹{billingCycle === 'annual' ? '149' : '179'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium"> / employee / month</span>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Everything in Starter Growth</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>1-Click Statutory Payroll & TDS (Old & New)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Chapter VI-A Investment Proof Reviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>GPS Geofenced Mobile Punch Perimeters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Multi-Tier Expense Claims & Receipts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Live HR Support Desk & Broadcast Banners</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Email Domain Auto-Detection (@yourcompany)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsBookDemoOpen(true)}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer"
              >
                Schedule Live Enterprise Demo
              </button>
            </div>

            {/* Plan 3: Global Conglomerate */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold uppercase text-slate-500">
                  Global Conglomerate
                </span>
                <h3 className="text-xl font-black text-slate-900">Multi-Client Subsidiaries</h3>
                <p className="text-xs text-slate-600">
                  Engineered for holding corporations managing multiple distinct client subsidiaries.
                </p>

                <div className="pt-2">
                  <span className="text-3xl font-black text-slate-900">Custom</span>
                  <span className="text-xs text-slate-400 font-medium"> volume agreement</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Unlimited Client Tenant Provisioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Dedicated Database Schema / Instance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>White-Label Branding & Custom Domains</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>99.99% Financial Uptime SLA Contract</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Dedicated Enterprise Solutions Lead (24/7)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsContactSalesOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 12. ENTERPRISE FAQ ACCORDION ─── */}
      <section className="py-20 lg:py-28 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
              Everything You Need to Know
            </h2>
            <p className="text-sm text-slate-600">
              Have questions about multi-tenancy, data security, or implementation? We've got answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-emerald-700 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-3 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── 13. BOTTOM HIGH-CONVERTING CALL TO ACTION ─── */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for the Next Generation of People Management?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Accelerate Your Workforce Growth with{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Priyex HCM Cloud
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Join enterprise leaders who trust Priyex for flawless payroll, biometric attendance, and strict tenant isolation. Schedule your personalized 30-minute demo today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsBookDemoOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Book Your Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsContactSalesOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Contact Enterprise Sales</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 pt-2">
            No credit card required • Dedicated test sandbox • Live consultation with Senior Solutions Architect
          </p>
        </div>
      </section>

      {/* ─── 14. MINIMALIST MODERN ENTERPRISE FOOTER (EMERGENT-STYLE CLEAN WHITE) ─── */}
      <footer className="bg-white text-slate-900 border-t border-slate-200">
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-8 lg:gap-10">
            
            {/* Brand Wordmark & Mission Description */}
            <div className="col-span-2 md:col-span-6 lg:col-span-4 space-y-5">
              <Link to="/" className="inline-flex items-center gap-2 group">
                <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 text-white shadow-xs flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" strokeWidth={2.4} />
                  </span>
                  priyex
                </span>
              </Link>
              <p className="text-slate-500 text-[14px] leading-relaxed max-w-sm font-normal">
                Build production-ready HRMS & payroll operations through unified intelligence. Automate statutory compliance, biometric time tracking, and tenant data isolation from start to finish.
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  All Systems Operational (99.99%)
                </span>
              </div>
            </div>

            {/* Col 1: Product */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h4 className="font-bold text-slate-900 text-[15px]">Product</h4>
              <ul className="space-y-3 text-[14px] text-slate-500 font-normal">
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Build</a></li>
                <li><a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Integrations</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Biometric Time</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Expense Desk</a></li>
                <li><Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">Client Portal</Link></li>
              </ul>
            </div>

            {/* Col 2: Solutions */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h4 className="font-bold text-slate-900 text-[15px]">Solutions</h4>
              <ul className="space-y-3 text-[14px] text-slate-500 font-normal">
                <li><a href="#multitenant" className="hover:text-slate-900 transition-colors">Enterprise</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">SMB Owners</a></li>
                <li><a href="#multitenant" className="hover:text-slate-900 transition-colors">IT Agencies</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Product Managers</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Operations Team</a></li>
                <li><a href="#roi-calculator" className="hover:text-slate-900 transition-colors">ROI Calculator</a></li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h4 className="font-bold text-slate-900 text-[15px]">Resources</h4>
              <ul className="space-y-3 text-[14px] text-slate-500 font-normal">
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Docs</a></li>
                <li><a href="#sandbox" className="hover:text-slate-900 transition-colors">Tutorials</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Case Studies</a></li>
                <li><a href="#features" className="hover:text-slate-900 transition-colors">Blog</a></li>
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Security Center</a></li>
                <li><a href="#security" className="hover:text-slate-900 transition-colors">Compliance Guide</a></li>
              </ul>
            </div>

            {/* Col 4: Company */}
            <div className="col-span-1 md:col-span-3 lg:col-span-2 space-y-3.5">
              <h4 className="font-bold text-slate-900 text-[15px]">Company</h4>
              <ul className="space-y-3 text-[14px] text-slate-500 font-normal">
                <li><button onClick={() => setIsBookDemoOpen(true)} className="hover:text-slate-900 transition-colors text-left cursor-pointer">Affiliates</button></li>
                <li><button onClick={() => setIsContactSalesOpen(true)} className="hover:text-slate-900 transition-colors text-left cursor-pointer">Careers</button></li>
                <li><a href="#multitenant" className="hover:text-slate-900 transition-colors">Company Info</a></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Cookie Policy</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Data Processing Agreement</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Sub-processors</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Cookie preferences</span></li>
              </ul>
            </div>
          </div>

          {/* Emergent-Style Minimalist Bottom Bar */}
          <div className="border-t border-slate-200/90 pt-8 mt-14 sm:mt-16 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            {/* Copyright */}
            <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold order-2 md:order-1">
              COPYRIGHT ⓒ PRIYEXLABS {new Date().getFullYear()}
            </div>

            {/* Center Heartline */}
            <div className="font-mono text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-center gap-1 order-1 md:order-2">
              <span>DESIGNED AND BUILT BY THE AWESOME PEOPLE OF PRIYEX</span>
              <span className="text-sky-500 text-sm">💙</span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-5 text-slate-500 order-3">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="hover:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>

              {/* X (formerly Twitter) */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="hover:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="hover:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="hover:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── MODALS ─── */}
      <BookDemoModal
        isOpen={isBookDemoOpen}
        onClose={() => setIsBookDemoOpen(false)}
        prefilledEmployees={roiEmployees}
      />

      <ContactSalesModal
        isOpen={isContactSalesOpen}
        onClose={() => setIsContactSalesOpen(false)}
      />

      <ProductTourModal
        isOpen={isProductTourOpen}
        onClose={() => setIsProductTourOpen(false)}
        onBookDemo={() => setIsBookDemoOpen(true)}
      />
    </div>
  );
};
