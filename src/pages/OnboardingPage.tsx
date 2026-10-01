import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  User,
  HeartPulse,
  Home,
  CreditCard,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileText,
  Trash2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface EmployeeDoc {
  id: number;
  documentType: string;
  documentName: string;
  mimeType: string;
  fileSize: number;
  fileData?: string;
  isVerified: boolean;
  createdAt?: string;
}

export const OnboardingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<any | null>(null);
  const [documents, setDocuments] = useState<EmployeeDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    maritalStatus: 'SINGLE',
    emergencyContactName: '',
    emergencyContactRelationship: 'PARENT',
    emergencyContactPhone: '',

    // Step 2: Addresses
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',

    sameAsCurrent: true,
    permanentAddressLine1: '',
    permanentAddressLine2: '',
    permanentCity: '',
    permanentState: '',
    permanentPostalCode: '',
    permanentCountry: 'India',

    // Step 3: Banking & Statutory
    bankName: '',
    bankBranch: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankAccountType: 'SALARY',

    panNumber: '',
    aadhaarNumber: '',
    pfNumber: '',
    uanNumber: '',
    pfNomineeName: '',
    pfNomineeRelationship: 'SPOUSE'
  });

  // Document Upload State
  const [selectedDocType, setSelectedDocType] = useState('AADHAAR');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const fetchProfileAndDocs = async () => {
    setIsLoading(true);
    try {
      const pRes: any = await api.get('/employees/me');
      if (pRes.success && pRes.data) {
        const d = pRes.data;
        setProfile(d);
        setFormData((prev) => ({
          ...prev,
          dateOfBirth: d.dateOfBirth || '',
          gender: d.gender || 'MALE',
          bloodGroup: d.bloodGroup || 'O+',
          maritalStatus: d.maritalStatus || 'SINGLE',
          emergencyContactName: d.emergencyContactName || '',
          emergencyContactRelationship: d.emergencyContactRelationship || 'PARENT',
          emergencyContactPhone: d.emergencyContactPhone || '',

          addressLine1: d.addressLine1 || '',
          addressLine2: d.addressLine2 || '',
          city: d.city || '',
          state: d.state || '',
          postalCode: d.postalCode || '',

          permanentAddressLine1: d.permanentAddressLine1 || d.addressLine1 || '',
          permanentAddressLine2: d.permanentAddressLine2 || d.addressLine2 || '',
          permanentCity: d.permanentCity || d.city || '',
          permanentState: d.permanentState || d.state || '',
          permanentPostalCode: d.permanentPostalCode || d.postalCode || '',

          bankName: d.bankName || '',
          bankBranch: d.bankBranch || '',
          bankAccountNumber: d.bankAccountNumber || '',
          bankIfsc: d.bankIfsc || '',
          bankAccountType: d.bankAccountType || 'SALARY',

          panNumber: d.panNumber || '',
          aadhaarNumber: d.aadhaarNumber || '',
          pfNumber: d.pfNumber || '',
          uanNumber: d.uanNumber || '',
          pfNomineeName: d.pfNomineeName || '',
          pfNomineeRelationship: d.pfNomineeRelationship || 'SPOUSE'
        }));
      }

      const dRes: any = await api.get('/employees/me/documents');
      if (dRes.success && Array.isArray(dRes.data)) {
        setDocuments(dRes.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDocs();
  }, [user?.id]);

  // Handle Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const res: any = await api.post('/employees/me/documents', {
          documentType: selectedDocType,
          documentName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
          fileData: base64Data,
          remarks: 'Uploaded during onboarding self-service'
        });

        if (res.success || res.data) {
          const dRes: any = await api.get('/employees/me/documents');
          if (dRes.success && Array.isArray(dRes.data)) {
            setDocuments(dRes.data);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to upload document');
      } finally {
        setIsUploadingDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = async (docId: number) => {
    try {
      await api.delete(`/employees/me/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (e) {
      // ignore
    }
  };

  // Submit Final Application
  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        permanentAddressLine1: formData.sameAsCurrent ? formData.addressLine1 : formData.permanentAddressLine1,
        permanentAddressLine2: formData.sameAsCurrent ? formData.addressLine2 : formData.permanentAddressLine2,
        permanentCity: formData.sameAsCurrent ? formData.city : formData.permanentCity,
        permanentState: formData.sameAsCurrent ? formData.state : formData.permanentState,
        permanentPostalCode: formData.sameAsCurrent ? formData.postalCode : formData.permanentPostalCode,
      };

      const res: any = await api.post('/employees/onboarding/submit', payload);
      if (res.success || res.data) {
        setIsSubmittedSuccess(true);
        setProfile((prev: any) => ({ ...prev, status: 'PENDING_APPROVAL' }));
      } else {
        setError(res.message || 'Failed to submit onboarding application');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with server');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
        <div className="w-8 h-8 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold">Loading your onboarding profile...</span>
      </div>
    );
  }

  // If already active
  if (profile?.status === 'ACTIVE') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Onboarding Completed!</h2>
          <p className="text-sm text-slate-500 mt-1">
            Your profile has been fully verified and activated by HR Operations.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 text-left space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Employee Code</span>
            <span className="font-mono font-bold text-blue-700">{profile.employeeCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Employment Status</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              ACTIVE
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Work Email</span>
            <span className="font-medium text-slate-800">{profile.workEmail}</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // If submitted and pending approval
  if (isSubmittedSuccess || profile?.status === 'PENDING_APPROVAL') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-xs animate-pulse">
          <Clock className="w-9 h-9" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Onboarding Submitted for Review</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Your personal details and verification documents are currently under review by our People Operations team.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 text-xs text-left space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 font-semibold bg-amber-50/70 p-3 rounded-xl border border-amber-200">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Status: Awaiting HR Verification & Approval</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            You will receive a notification and confirmation email at{' '}
            <strong className="text-slate-800">{profile?.workEmail}</strong> once HR approves your application.
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Hire Onboarding Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Welcome to Priyex People, {profile?.firstName || 'Colleague'}!
          </h1>
          <p className="text-xs text-blue-100 max-w-xl font-normal leading-relaxed">
            Please complete your personal, statutory, banking, and document verification details to complete your onboarding.
          </p>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-2 overflow-x-auto text-xs">
        {[
          { step: 1, label: 'Personal & Family', icon: User },
          { step: 2, label: 'Addresses', icon: Home },
          { step: 3, label: 'Bank & Statutory', icon: CreditCard },
          { step: 4, label: 'Document Upload', icon: FileCheck },
          { step: 5, label: 'Review & Submit', icon: ShieldCheck }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStep(s.step)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono ${
                  isActive ? 'bg-white/25 text-white' : isDone ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ─── STEP 1: PERSONAL & EMERGENCY DETAILS ─── */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Personal & Emergency Contact Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other / Non-Binary</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Marital Status *</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
              >
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>Emergency Contact Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Relationship *</label>
                <select
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARENT">Parent</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="FRIEND">Friend</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Continue to Addresses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: ADDRESSES ─── */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Residential & Permanent Addresses</h2>
          </div>

          {/* Current Address */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-900">Current Residential Address</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Flat/House No., Building, Street"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bengaluru"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Karnataka"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Postal Code (PIN) *</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="560103"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Same as current toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.sameAsCurrent}
                onChange={(e) => setFormData({ ...formData, sameAsCurrent: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-bold text-slate-800">Permanent address is same as current residential address</span>
            </label>
          </div>

          {!formData.sameAsCurrent && (
            <div className="space-y-3 text-xs pt-2 border-t border-slate-100">
              <h3 className="font-bold text-slate-900">Permanent Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-bold mb-1">Permanent Address Line 1 *</label>
                  <input
                    type="text"
                    value={formData.permanentAddressLine1}
                    onChange={(e) => setFormData({ ...formData, permanentAddressLine1: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Permanent City *</label>
                  <input
                    type="text"
                    value={formData.permanentCity}
                    onChange={(e) => setFormData({ ...formData, permanentCity: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Permanent State *</label>
                  <input
                    type="text"
                    value={formData.permanentState}
                    onChange={(e) => setFormData({ ...formData, permanentState: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Continue to Banking & Tax</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: BANKING & STATUTORY DETAILS ─── */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Salary Bank Account & Statutory Tax IDs</h2>
          </div>

          {/* Bank details */}
          <div className="space-y-3 text-xs">
            <h3 className="font-bold text-slate-900">Salary Disbursement Bank Account</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank / ICICI Bank / SBI"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bank Account Number *</label>
                <input
                  type="text"
                  required
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  placeholder="5010023456789"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Bank IFSC Code *</label>
                <input
                  type="text"
                  required
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                  placeholder="HDFC0001234"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Account Type</label>
                <select
                  value={formData.bankAccountType}
                  onChange={(e) => setFormData({ ...formData, bankAccountType: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="SALARY">Salary Account</option>
                  <option value="SAVINGS">Savings Account</option>
                  <option value="CURRENT">Current Account</option>
                </select>
              </div>
            </div>
          </div>

          {/* Statutory Tax IDs */}
          <div className="space-y-3 text-xs pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-900">Statutory Tax & Social Security Identification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Income Tax PAN Number *</label>
                <input
                  type="text"
                  required
                  value={formData.panNumber}
                  onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Aadhaar Card Number *</label>
                <input
                  type="text"
                  required
                  value={formData.aadhaarNumber}
                  onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                  placeholder="1234 5678 9012"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Universal Account Number (UAN / PF)</label>
                <input
                  type="text"
                  value={formData.uanNumber}
                  onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                  placeholder="100123456789"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">PF Nominee Name</label>
                <input
                  type="text"
                  value={formData.pfNomineeName}
                  onChange={(e) => setFormData({ ...formData, pfNomineeName: e.target.value })}
                  placeholder="Nominee full legal name"
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Continue to Document Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 4: MANDATORY DOCUMENT UPLOADS ─── */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Mandatory Document Verification Upload</h2>
          </div>

          <p className="text-xs text-slate-500 font-normal">
            Upload clear copies of your government-issued identity cards and bank account verification.
            Supported formats: PDF, PNG, JPG (Max 10MB per document).
          </p>

          {/* Upload Area */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Document Category *</label>
                <select
                  value={selectedDocType}
                  onChange={(e) => setSelectedDocType(e.target.value)}
                  className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 font-medium"
                >
                  <option value="AADHAAR">Aadhaar Card (Front & Back)</option>
                  <option value="PAN">Income Tax PAN Card</option>
                  <option value="BANK_PROOF">Bank Passbook / Cancelled Cheque</option>
                  <option value="DEGREE">Degree / Educational Certificate</option>
                  <option value="RELIEVING">Previous Experience / Relieving Letter</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Choose File to Upload</label>
                <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition">
                  <UploadCloud className="w-4 h-4" />
                  <span>{isUploadingDoc ? 'Uploading...' : 'Browse & Upload Document'}</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isUploadingDoc}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-xs">Uploaded Documents ({documents.length})</h3>
            {documents.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80 text-xs text-slate-400">
                No documents uploaded yet. Please upload at least your Aadhaar Card and PAN Card.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{doc.documentName}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">{doc.documentType}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {doc.fileData && (
                        <a
                          href={doc.fileData}
                          download={doc.documentName}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition"
                          title="View / Download"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <span>Review Application Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 5: REVIEW & SUBMIT TO HR ─── */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Review & Final Submission to HR Operations</h2>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Personal info summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Personal & Emergency</span>
              </h3>
              <div className="space-y-1 text-slate-600">
                <p>DOB: <strong>{formData.dateOfBirth || 'Not specified'}</strong></p>
                <p>Gender: <strong>{formData.gender}</strong> | Blood Group: <strong>{formData.bloodGroup}</strong></p>
                <p>Emergency Contact: <strong>{formData.emergencyContactName || 'N/A'}</strong> ({formData.emergencyContactRelationship})</p>
                <p>Emergency Phone: <strong>{formData.emergencyContactPhone || 'N/A'}</strong></p>
              </div>
            </div>

            {/* Address summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-blue-600" />
                <span>Current Address</span>
              </h3>
              <div className="space-y-1 text-slate-600">
                <p>{formData.addressLine1 || 'No address provided'}</p>
                <p>{formData.city}, {formData.state} - {formData.postalCode}</p>
                <p className="text-[11px] text-slate-400">
                  {formData.sameAsCurrent ? 'Permanent address matches current' : 'Separate permanent address provided'}
                </p>
              </div>
            </div>

            {/* Banking summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Bank Details</span>
              </h3>
              <div className="space-y-1 text-slate-600">
                <p>Bank: <strong>{formData.bankName || 'N/A'}</strong> ({formData.bankAccountType})</p>
                <p>A/C: <strong className="font-mono">{formData.bankAccountNumber || 'N/A'}</strong></p>
                <p>IFSC: <strong className="font-mono">{formData.bankIfsc || 'N/A'}</strong></p>
              </div>
            </div>

            {/* Statutory & Documents */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-blue-600" />
                <span>Statutory & Uploaded Files</span>
              </h3>
              <div className="space-y-1 text-slate-600">
                <p>PAN: <strong className="font-mono">{formData.panNumber || 'N/A'}</strong></p>
                <p>Aadhaar: <strong className="font-mono">{formData.aadhaarNumber || 'N/A'}</strong></p>
                <p>Uploaded Documents: <strong className="text-emerald-700">{documents.length} Files Attached</strong></p>
              </div>
            </div>
          </div>

          {/* Submission Notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p>
              By clicking <strong>Submit Onboarding Application</strong>, your details will be sent directly to HR Operations for formal verification and final account activation.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitOnboarding}
              disabled={isSubmitting}
              className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting to HR...' : 'Submit Onboarding Application'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
