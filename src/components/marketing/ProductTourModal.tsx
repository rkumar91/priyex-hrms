import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Building2,
  Users,
  CalendarCheck,
  CircleDollarSign,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ProductTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookDemo: () => void;
}

const TOUR_STEPS = [
  {
    id: 'multitenant',
    stepNumber: '01',
    title: 'Multi-Tenant Cloud & Domain Isolation',
    tagline: 'Zero data leakage with automatic email routing',
    icon: Building2,
    color: 'from-blue-600 to-indigo-600',
    description:
      'Priyex operates on a true multi-tenant SaaS architecture. When your employees log in using their work email (@yourcompany.com, @subsidiary.com), Priyex instantly identifies their corporate tenant, renders their custom company logo, applies organization-specific policies, and isolates all database records.',
    highlights: [
      'Email domain auto-detection (@yourcompany.com)',
      'Tenant-isolated database queries via X-Company-Id & JWT',
      'White-label client branding & custom approval tiers',
      'Super-admin provisioning in under 60 seconds'
    ]
  },
  {
    id: 'onboarding',
    stepNumber: '02',
    title: 'Digital Employee Onboarding & Master Directory',
    tagline: 'Seamless paperless onboarding from offer to first day',
    icon: Users,
    color: 'from-emerald-600 to-teal-600',
    description:
      'Eliminate manual data entry with digital onboarding checklists. New hires upload government IDs, bank details, and emergency contacts. HR teams verify submissions through an intuitive review queue with full audit history.',
    highlights: [
      'Digital document repository with PDF/image preview',
      'Multi-level profile change approvals (Employee -> Manager -> HR)',
      'Dynamic org hierarchy & designation bands (L1 to L6)',
      'Immutable audit logging of every record change'
    ]
  },
  {
    id: 'attendance',
    stepNumber: '03',
    title: 'Biometric Attendance, Shifts & Geofencing',
    tagline: 'Real-time workforce presence tracking without disputes',
    icon: CalendarCheck,
    color: 'from-amber-600 to-orange-600',
    description:
      'Whether your teams are in the office, factory, or working remotely, Priyex captures biometric punches and geofenced mobile clock-ins. Managers approve attendance regularizations and compensatory offs in real time.',
    highlights: [
      'Geofenced mobile punch perimeters with radius enforcement',
      'Leave quota balances: Casual, Sick, Privilege & Maternity',
      'Overtime (OT) calculations and Compensatory-Off wallet',
      'Direct shift scheduling & holiday calendar mapping'
    ]
  },
  {
    id: 'payroll',
    stepNumber: '04',
    title: '1-Click Automated Statutory Payroll & Tax',
    tagline: 'Flawless monthly compensation runs in under an hour',
    icon: CircleDollarSign,
    color: 'from-purple-600 to-pink-600',
    description:
      'Calculate gross-to-net pay with automated statutory deductions: PF, ESI, Professional Tax, and Income Tax (TDS). Support both Old Tax and New Tax (Section 115BAC) regimes with Chapter VI-A investment declaration workflows.',
    highlights: [
      '1-click monthly payroll batch processing and disbursals',
      'Statutory EPF (12%), ESI, and state PT tables built-in',
      'Employee investment proof review (80C, 80D, HRA)',
      'Tamper-proof digitally generated PDF payslips'
    ]
  },
  {
    id: 'selfservice',
    stepNumber: '05',
    title: 'Employee Self-Service & Real-Time HR Desk',
    tagline: 'Delightful mobile experience with in-app query chat',
    icon: Smartphone,
    color: 'from-rose-600 to-red-600',
    description:
      'Empower your workforce with responsive self-service on any device. Employees request leaves, submit expense receipts, download payslips, and chat directly with HR via the floating support desk.',
    highlights: [
      'Responsive mobile web app experience for iOS & Android',
      'Multi-currency expense claims with camera receipt upload',
      'In-app live HR query chat with instant push notifications',
      'Company-wide urgent announcement broadcast banners'
    ]
  }
];

export const ProductTourModal: React.FC<ProductTourModalProps> = ({
  isOpen,
  onClose,
  onBookDemo
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onClose();
      onBookDemo();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Interactive Tour {currentStepIndex + 1} of {TOUR_STEPS.length}
            </span>
            <span className="text-xs text-slate-400">• Priyex Architecture</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="grid grid-cols-5 h-1.5 bg-slate-100">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-full transition-all duration-300 ${
                i <= currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${step.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-black/10`}
            >
              <Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Capability Module {step.stepNumber}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mt-0.5">
                {step.title}
              </h3>
              <p className="text-xs font-semibold text-emerald-600 mt-1">{step.tagline}</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            {step.description}
          </p>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
              Enterprise Highlights:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {step.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onBookDemo();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
            >
              Skip to Demo
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Book Custom Demo' : 'Next Module'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
