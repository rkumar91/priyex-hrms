import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  UserPlus,
  Send,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Mail,
  Lock,
  Building,
  Briefcase,
  Calendar,
  Phone
} from 'lucide-react';
import api from '../../api/client';

interface InitiateOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Department {
  id: number;
  name: string;
}

export const InitiateOnboardingModal: React.FC<InitiateOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    workEmail: '',
    personalPhone: '',
    departmentId: 1,
    designationId: 1,
    designationName: 'Software Engineer',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    workLocation: 'Bangalore HQ',
    annualCtc: 1200000
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccessResult(null);
      setError(null);
      api.get('/organization/departments')
        .then((res: any) => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setDepartments(res.data);
            setFormData((prev) => ({ ...prev, departmentId: res.data[0].id }));
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.workEmail.trim()) {
      setError('First name, last name, and work email are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res: any = await api.post('/employees/onboarding/initiate', {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName ? formData.middleName.trim() : null,
        lastName: formData.lastName.trim(),
        workEmail: formData.workEmail.trim().toLowerCase(),
        personalPhone: formData.personalPhone.trim(),
        departmentId: Number(formData.departmentId),
        designationId: Number(formData.designationId),
        joiningDate: formData.joiningDate,
        employmentType: formData.employmentType,
        workLocation: formData.workLocation,
        annualCtc: Number(formData.annualCtc)
      });

      if (res.success || res.data) {
        setSuccessResult(res.data);
        onSuccess();
      } else {
        setError(res.message || 'Failed to initiate onboarding');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!successResult) return;
    const text = `Priyex People HRMS — Onboarding Credentials\nPortal URL: ${successResult.inviteUrl}\nEmail: ${successResult.workEmail}\nTemporary Password: ${successResult.tempPassword}\n\n*Please login and set your new permanent password.*`;
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2500);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Initiate Employee Onboarding</h2>
              <p className="text-[11px] text-slate-500">Auto-generates account and dispatches email invite</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Form OR Success Result */}
        {successResult ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Onboarding Initiated Successfully!</h3>
              <p className="text-xs text-slate-500 mt-1">
                An invitation email with temporary login credentials has been dispatched to{' '}
                <strong className="text-slate-800">{successResult.workEmail}</strong> from{' '}
                <strong className="text-blue-600">tech.priyex@gmail.com</strong>.
              </p>
            </div>

            {/* Credential Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Employee Code</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {successResult.employeeCode}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200/70">
                <span className="text-slate-500 font-medium">Work Email</span>
                <span className="font-semibold text-slate-900">{successResult.workEmail}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Temporary Password</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {successResult.tempPassword}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Upon initial login, the candidate will be prompted to change their temporary password and submit their personal & banking verification documents.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopied ? 'Credentials Copied!' : 'Copy Login Details'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Dispatch Notice */}
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Invitation email with auto-generated temporary password will be dispatched from{' '}
                <strong className="font-semibold text-blue-700">tech.priyex@gmail.com</strong>.
              </span>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="e.g. Arun"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="e.g. Patel"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Email (Login ID) *</label>
                <input
                  type="email"
                  required
                  value={formData.workEmail}
                  onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                  placeholder="arun.patel@priyex.com"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Personal Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.personalPhone}
                  onChange={(e) => setFormData({ ...formData, personalPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Department & Role */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  {departments.length > 0 ? (
                    departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="1">Engineering & Technology</option>
                      <option value="2">Human Resources</option>
                      <option value="3">Product Management</option>
                      <option value="4">Finance & Accounts</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Designation Title</label>
                <input
                  type="text"
                  value={formData.designationName}
                  onChange={(e) => setFormData({ ...formData, designationName: e.target.value })}
                  placeholder="e.g. Associate Software Engineer"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Joining Date & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Joining Date *</label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="FULL_TIME">Full Time Permanent</option>
                  <option value="PROBATION">Probation (6 Months)</option>
                  <option value="CONTRACT">Contractual</option>
                  <option value="INTERN">Internship</option>
                </select>
              </div>
            </div>

            {/* Location & Annual CTC */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Work Location</label>
                <select
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="Bangalore HQ">Bangalore HQ</option>
                  <option value="Mumbai Branch">Mumbai Branch</option>
                  <option value="New Delhi Hub">New Delhi Hub</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Annual CTC (₹)</label>
                <input
                  type="number"
                  value={formData.annualCtc}
                  onChange={(e) => setFormData({ ...formData, annualCtc: Number(e.target.value) || 0 })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Dispatching Invite...' : 'Initiate & Send Invite'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
