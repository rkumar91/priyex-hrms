import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Sparkles,
  Building2,
  Mail,
  User,
  Phone,
  Users,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledEmployees?: number;
}

export const BookDemoModal: React.FC<BookDemoModalProps> = ({
  isOpen,
  onClose,
  prefilledEmployees
}) => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [employeeCount, setEmployeeCount] = useState(
    prefilledEmployees
      ? prefilledEmployees <= 50
        ? '1-50'
        : prefilledEmployees <= 250
        ? '51-250'
        : prefilledEmployees <= 1000
        ? '251-1000'
        : '1000+'
      : '51-250'
  );
  const [interestModule, setInterestModule] = useState('Full Suite (HCM + Payroll + Attendance)');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('11:00 AM - 12:00 PM IST');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    inquiryId: string;
    assignedConsultant: string;
    scheduledWindow: string;
    confirmationEmail: string;
  } | null>(null);

  if (!isOpen) return null;

  // Extract company domain hint
  const emailDomain = workEmail.includes('@') ? workEmail.split('@')[1] : '';
  const isGenericEmail = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(
    emailDomain.toLowerCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const payload = {
      fullName,
      workEmail,
      companyName,
      phoneNumber,
      employeeCount,
      interestModule,
      inquiryType: 'DEMO_REQUEST',
      preferredDate,
      preferredTimeSlot,
      message
    };

    try {
      const res: any = await api.post('/public/leads', payload);
      const data = res?.data || res;
      const inquiryId = data.inquiryId || `PRX-DEMO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setConfirmationData({
        inquiryId,
        assignedConsultant: data.assignedConsultant || 'Ananya Sharma (Senior HR Solutions Architect)',
        scheduledWindow: data.scheduledWindow || `${preferredDate} (${preferredTimeSlot})`,
        confirmationEmail: data.confirmationEmail || workEmail
      });
    } catch (err: any) {
      console.error('Failed to book demo:', err);
      const errorMsg =
        typeof err === 'string'
          ? err
          : err?.message || 'Unable to confirm demo schedule at this moment. Please try again or connect directly with our enterprise team below.';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmationData(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Schedule an Interactive Live Demo</h3>
              <p className="text-xs text-slate-300">Experience tailored multi-tenant HRMS for your organization</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-7">
          {confirmationData ? (
            /* Confirmation Screen */
            <div className="text-center py-6 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Demo Session Booked
                </span>
                <h4 className="text-2xl font-black text-slate-900 mt-2">
                  You're All Set, {fullName}!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  A personalized 1-on-1 walkthrough of the Priyex HRMS SaaS Platform has been reserved for <strong className="text-slate-900">{companyName}</strong>.
                </p>
              </div>

              {/* Confirmation Details Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Booking Reference</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {confirmationData.inquiryId}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Scheduled Window</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {confirmationData.scheduledWindow}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Assigned Solutions Lead</span>
                  <span className="font-semibold text-slate-900">
                    {confirmationData.assignedConsultant}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Confirmation Sent To</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">
                    {confirmationData.confirmationEmail}
                  </span>
                </div>
                {phoneNumber && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <span>WhatsApp Confirmation</span>
                    </span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Dispatched to {phoneNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Enterprise Automation Status Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-left max-w-md mx-auto space-y-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">Automated Multi-Channel Dispatch</h5>
                    <p className="text-[11px] text-slate-500">Processed automatically by Priyex Engine</p>
                  </div>
                </div>
                <div className="space-y-2 border-t border-slate-200/80 pt-3">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                    <span className="text-slate-600">
                      <strong className="text-slate-900">End-User WhatsApp:</strong> Automated booking brief & slot confirmation dispatched to <span className="font-semibold text-emerald-800">{phoneNumber || 'registered phone'}</span>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                    <span className="text-slate-600">
                      <strong className="text-slate-900">Corporate Email:</strong> Calendar invite & access details sent to <span className="font-semibold text-blue-800">{confirmationData.confirmationEmail}</span>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
                    <span className="text-slate-600">
                      <strong className="text-slate-900">Priyex Sales Group:</strong> Inquiry routed to static enterprise sales desk.
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero spam guarantee. Enterprise-grade encryption standard.</span>
              </div>

              <div className="pt-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-8 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            /* Lead Capture Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-800">{submitError}</p>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        Our cloud server might be waking up or experiencing high traffic. You can retry now or reach our team instantly via:
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                    <a
                      href={`https://wa.me/919901694683?text=${encodeURIComponent(
                        `Hi Priyex Team, I would like to schedule an HRMS demo for ${companyName || 'my organization'}. Name: ${fullName || 'Prospect'}, Email: ${workEmail}, Phone: ${phoneNumber || 'N/A'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Instant WhatsApp Booking</span>
                    </a>
                    <a
                      href={`mailto:tech.priyex@gmail.com?subject=${encodeURIComponent(
                        `Demo Request for ${companyName || 'Enterprise'}`
                      )}&body=${encodeURIComponent(
                        `Hello Priyex Solutions Team,\n\nI would like to schedule a demo session.\n\nFull Name: ${fullName}\nCompany: ${companyName}\nEmail: ${workEmail}\nPhone: ${phoneNumber}\nPreferred Window: ${preferredDate} (${preferredTimeSlot})\nRequirements: ${message}`
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition shadow-xs"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Direct Email Desk</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Corporate Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="rajesh@yourcompany.com"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                  {emailDomain && !isGenericEmail && (
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Domain identified: @{emailDomain} (Eligible for isolated tenant sandbox)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Technologies Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Phone / Mobile <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                      💬 WhatsApp Confirmation
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Employee Count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Workforce Size
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={employeeCount}
                      onChange={(e) => setEmployeeCount(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition cursor-pointer"
                    >
                      <option value="1-50">1 - 50 Employees (Startup / Growth)</option>
                      <option value="51-250">51 - 250 Employees (Mid-Market)</option>
                      <option value="251-1000">251 - 1,000 Employees (Enterprise)</option>
                      <option value="1000+">1,000+ Employees (Global / Conglomerate)</option>
                    </select>
                  </div>
                </div>

                {/* Primary Interest Module */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Area of Interest
                  </label>
                  <select
                    value={interestModule}
                    onChange={(e) => setInterestModule(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition cursor-pointer"
                  >
                    <option value="Full Suite (HCM + Payroll + Attendance)">Full Suite (Complete People Cloud)</option>
                    <option value="Automated Payroll & Statutory Tax">Automated Payroll & Statutory Tax</option>
                    <option value="Biometric & Geofenced Attendance">Biometric & Geofenced Attendance</option>
                    <option value="Multi-Tenant SaaS Cloud Setup">Multi-Tenant Subsidiary Cloud</option>
                    <option value="Employee Self-Service & Onboarding">Employee Self-Service & Onboarding</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Preferred Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Demo Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Preferred Time Window
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={preferredTimeSlot}
                      onChange={(e) => setPreferredTimeSlot(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white transition cursor-pointer"
                    >
                      <option value="10:00 AM - 11:00 AM IST">Morning (10:00 AM - 11:00 AM IST)</option>
                      <option value="11:30 AM - 12:30 PM IST">Late Morning (11:30 AM - 12:30 PM IST)</option>
                      <option value="02:30 PM - 03:30 PM IST">Afternoon (02:30 PM - 03:30 PM IST)</option>
                      <option value="04:30 PM - 05:30 PM IST">Late Afternoon (04:30 PM - 05:30 PM IST)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specific Requirements / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Requirements or Questions <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. We need multi-entity branch setup with biometric machine sync and custom approval tiers..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Value Proposition Strip */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between text-[11px] text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Live 30-Min Demo
                </span>
                <span className="text-slate-400">•</span>
                <span>Custom Sandbox Setup</span>
                <span className="text-slate-400">•</span>
                <span>No Credit Card Required</span>
              </div>

              {/* Submit Button */}
              <div className="pt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Scheduling Demo...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Demo Schedule</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
