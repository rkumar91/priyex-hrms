import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  Phone,
  Building2,
  Send,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import api from '../../api/client';

interface ContactSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactSalesModal: React.FC<ContactSalesModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [employeeCount, setEmployeeCount] = useState('51-250');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res: any = await api.post('/public/leads', {
        fullName,
        workEmail,
        companyName,
        phoneNumber,
        employeeCount,
        interestModule: 'Sales & Custom Enterprise Quotation',
        inquiryType: 'SALES_CONSULTATION',
        message
      });
      const data = res?.data || res;
      const ref = data.inquiryId || `PRX-SALES-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setInquiryId(ref);
    } catch (err: any) {
      console.error('Failed to submit sales consultation:', err);
      const errorMsg =
        typeof err === 'string'
          ? err
          : err?.message || 'Unable to submit consultation request. Please try again or reach out directly to our team below.';
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setInquiryId(null);
    setSubmitError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] max-h-[92dvh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Connect with Priyex Enterprise Sales</h3>
              <p className="text-xs text-blue-200">Custom volume pricing, subsidiary architecture & RFP inquiries</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto overscroll-contain">
          {inquiryId ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  Sales Consultation Dispatched
                </span>
                <h4 className="text-xl font-black text-slate-900 mt-2">Inquiry Received, {fullName}!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed mt-1">
                  Your requirements for <strong className="text-slate-900">{companyName}</strong> have been routed to our Enterprise Account Solutions team.
                </p>
              </div>

              {/* Reference ID card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-xs mx-auto flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Tracking Ref:</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {inquiryId}
                </span>
              </div>

              {/* Enterprise Automation Status Card */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-left max-w-sm mx-auto space-y-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">Automated Multi-Channel Dispatch</h5>
                    <p className="text-[10.5px] text-slate-500">Processed automatically by Priyex Engine</p>
                  </div>
                </div>
                <div className="space-y-1.5 border-t border-slate-200/80 pt-2.5">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                    <span className="text-slate-600">
                      <strong className="text-slate-900">End-User WhatsApp:</strong> Automated confirmation sent to <span className="font-semibold text-emerald-800">{phoneNumber || 'registered phone'}</span>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                    <span className="text-slate-600">
                      <strong className="text-slate-900">Corporate Email:</strong> Consultation scope dispatched to <span className="font-semibold text-blue-800">{workEmail}</span>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></span>
                    <span className="text-slate-600">
                      <strong className="text-slate-900">Priyex Sales Group:</strong> Lead alert routed to enterprise account team.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {submitError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-800">{submitError}</p>
                      <p className="text-[11px] text-rose-600 mt-0.5">
                        Our cloud server might be waking up. You can retry now or connect directly with our enterprise desk:
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1 pl-6">
                    <a
                      href={`https://wa.me/919901694683?text=${encodeURIComponent(
                        `Hi Priyex Sales Team, I would like to inquire about enterprise pricing for ${companyName || 'my organization'}. Contact: ${fullName || 'Prospect'}, Email: ${workEmail}, Phone: ${phoneNumber || 'N/A'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>WhatsApp Sales Desk</span>
                    </a>
                    <a
                      href={`mailto:tech.priyex@gmail.com?subject=${encodeURIComponent(
                        `Enterprise Sales Inquiry for ${companyName || 'Enterprise'}`
                      )}&body=${encodeURIComponent(
                        `Hello Priyex Enterprise Sales,\n\nI would like to inquire about pricing and architecture.\n\nFull Name: ${fullName}\nCompany: ${companyName}\nEmail: ${workEmail}\nPhone: ${phoneNumber}\nWorkforce: ${employeeCount}\nRequirements: ${message}`
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] transition shadow-xs"
                    >
                      <Mail className="w-3 h-3" />
                      <span>Direct Email</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Nair"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email *</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="ramesh@company.com"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Name *</label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Company Legal Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                      💬 WhatsApp Follow-up
                    </span>
                  </div>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+91 99000 11222"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee Count</label>
                <select
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="1-50">Under 50 Employees</option>
                  <option value="51-250">50 - 250 Employees</option>
                  <option value="251-1000">250 - 1,000 Employees</option>
                  <option value="1000+">1,000+ Employees (Global Enterprise)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tell Us About Your Project</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us about your team structure, current software, timelines, or specific multi-tenant requirements..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Consultation Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
