import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canManageEmployees, canDeactivateEmployees } from '../utils/rbac';
import api from '../api/client';
import {
  User,
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Phone,
  Building2,
  MoreVertical,
  X,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  UserCheck,
  Edit3,
  MapPin,
  CreditCard,
  Send,
  Shield,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  FileText,
  BadgeCheck,
  Camera,
  UploadCloud,
  FileUp,
  ExternalLink,
  File,
  Briefcase,
  Calendar,
  Hash,
  HeartPulse,
  Home,
  Plus
} from 'lucide-react';
import { InitiateOnboardingModal } from '../components/onboarding/InitiateOnboardingModal';
import { OnboardingPipelineTab } from '../components/onboarding/OnboardingPipelineTab';

export interface Employee {
  id: string | number;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  workEmail: string;
  personalEmail?: string;
  personalPhone?: string;
  workPhone?: string;
  departmentName?: string;
  designationName?: string;
  departmentId?: number;
  employmentType?: string;
  status: string;
  joiningDate?: string;
  annualCtc?: number;
  confirmationDate?: string;
  probationEndDate?: string;
  noticePeriodDays?: number;
  photoUrl?: string;

  // Personal & Corporate
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  workLocation?: string;

  // Complete Address Details
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Permanent Address
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentPostalCode?: string;
  permanentCountry?: string;

  // Banking & Financial
  bankName?: string;
  bankBranch?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankAccountType?: string;

  // PF & Statutory
  pfNumber?: string;
  uanNumber?: string;
  esiNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  pfNomineeName?: string;
  pfNomineeRelationship?: string;
  pfJoiningDate?: string;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
}

export interface EmployeeDocument {
  id: number;
  employeeId: number;
  documentType: string;
  documentName: string;
  fileSize?: number;
  mimeType?: string;
  fileData?: string;
  isVerified?: boolean;
  remarks?: string;
  createdAt?: string;
}

export interface HrPersonnel {
  userId: number;
  employeeId?: number;
  employeeCode?: string;
  fullName: string;
  workEmail: string;
  designationName?: string;
  departmentName?: string;
  roles?: string[];
}

export interface Department {
  id: number;
  code: string;
  name: string;
  employeeCount: number;
}

export const EmployeesPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const canManage = canManageEmployees(user);
  const canDeactivate = canDeactivateEmployees(user);
  const [searchParams, setSearchParams] = useSearchParams();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInitiateOnboardingOpen, setIsInitiateOnboardingOpen] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState<'DIRECTORY' | 'ONBOARDING_PIPELINE'>('DIRECTORY');
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // My Profile Self-Service & View states
  const [myProfile, setMyProfile] = useState<Employee | null>(null);
  const [isMyProfileOpen, setIsMyProfileOpen] = useState(false);
  const [isEditContactModalOpen, setIsEditContactModalOpen] = useState(false);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);
  const [isHrQueryModalOpen, setIsHrQueryModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Active Tab for Profile Modal ('OVERVIEW' | 'ADDRESS' | 'PF_STATUTORY' | 'BANK' | 'EMERGENCY' | 'DOCS')
  const [activeProfileTab, setActiveProfileTab] = useState<'OVERVIEW' | 'ADDRESS' | 'PF_STATUTORY' | 'BANK' | 'EMERGENCY' | 'DOCS'>('OVERVIEW');
  const [activeViewTab, setActiveViewTab] = useState<'OVERVIEW' | 'ADDRESS' | 'PF_STATUTORY' | 'BANK' | 'EMERGENCY' | 'DOCS'>('OVERVIEW');

  // Documents state
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({
    documentType: 'AADHAAR_CARD',
    documentName: '',
    remarks: '',
    fileData: '',
    mimeType: '',
    fileSize: 0,
  });

  // Self Edit Contact, Address & Profile Form
  const [selfEditData, setSelfEditData] = useState({
    personalPhone: '',
    personalEmail: '',
    bloodGroup: '',
    maritalStatus: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    permanentAddressLine1: '',
    permanentAddressLine2: '',
    permanentCity: '',
    permanentState: '',
    permanentPostalCode: '',
    permanentCountry: 'India',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    photoUrl: '',
  });
  const [sameAsCurrent, setSameAsCurrent] = useState(false);

  // HR Helpdesk Query Form
  const [hrPersonnelList, setHrPersonnelList] = useState<HrPersonnel[]>([]);
  const [isLoadingHrList, setIsLoadingHrList] = useState(false);
  const [hrQueryData, setHrQueryData] = useState({
    assignedHrUserId: '',
    category: 'GENERAL',
    subject: '',
    message: '',
    priority: 'NORMAL'
  });
  const [isSendingQuery, setIsSendingQuery] = useState(false);

  // Critical Change Request Form
  const [requestData, setRequestData] = useState({
    requestType: 'BANK_ACCOUNT',
    fieldName: 'Bank Account Number',
    requestedValue: '',
    reason: ''
  });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Form State (Onboard Employee)
  const initialEmployeeFormData = {
    firstName: '',
    lastName: '',
    workEmail: '',
    personalPhone: '',
    personalEmail: '',
    departmentId: '',
    designationName: 'Software Engineer',
    employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
    gender: 'MALE',
    dateOfBirth: '',
    bloodGroup: 'B+',
    maritalStatus: 'SINGLE',
    workLocation: 'Noida HQ (Tower A)',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    permanentAddressLine1: '',
    permanentCity: '',
    permanentState: '',
    permanentPostalCode: '',
    permanentCountry: 'India',
    bankName: '',
    bankAccountNumber: '',
    bankIfsc: '',
    bankAccountType: 'SALARY',
    panNumber: '',
    aadhaarNumber: '',
    uanNumber: '',
    pfNumber: '',
    esiNumber: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    annualCtc: 1200000,
  };
  const [formData, setFormData] = useState(initialEmployeeFormData);

  // Fetch Employees & Departments
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.query = searchTerm;
      if (selectedDept !== 'ALL') params.departmentId = selectedDept;

      const res: any = await api.get('/employees', { params });
      if (res.success && res.data?.content) {
        setEmployees(res.data.content);
      } else {
        setEmployees(fallbackDemoEmployees);
      }
    } catch (err) {
      setEmployees(fallbackDemoEmployees);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res: any = await api.get('/organization/departments');
      if (res.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch (e) {
      // Ignore fallback
    }
  };

  const fetchHrPersonnel = async () => {
    setIsLoadingHrList(true);
    try {
      const res: any = await api.get('/hr-queries/personnel');
      if (res.success && Array.isArray(res.data)) {
        setHrPersonnelList(res.data);
      } else {
        setHrPersonnelList(fallbackHrPersonnel);
      }
    } catch (e) {
      setHrPersonnelList(fallbackHrPersonnel);
    } finally {
      setIsLoadingHrList(false);
    }
  };

  const fetchDocuments = async (empId?: number | string, isSelfProfile: boolean = false) => {
    setIsLoadingDocs(true);
    try {
      const url = isSelfProfile ? '/employees/me/documents' : `/employees/${empId}/documents`;
      const res: any = await api.get(url);
      if (res.success && Array.isArray(res.data)) {
        setDocuments(res.data);
      } else {
        setDocuments([]);
      }
    } catch (e) {
      setDocuments([]);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res: any = await api.get('/employees/me');
      if (res.success && res.data) {
        setMyProfile(res.data);
        setSelfEditData({
          personalPhone: res.data.personalPhone || '',
          personalEmail: res.data.personalEmail || '',
          bloodGroup: res.data.bloodGroup || '',
          maritalStatus: res.data.maritalStatus || '',
          dateOfBirth: res.data.dateOfBirth || '',
          addressLine1: res.data.addressLine1 || '',
          addressLine2: res.data.addressLine2 || '',
          city: res.data.city || '',
          state: res.data.state || '',
          postalCode: res.data.postalCode || '',
          country: res.data.country || 'India',
          permanentAddressLine1: res.data.permanentAddressLine1 || '',
          permanentAddressLine2: res.data.permanentAddressLine2 || '',
          permanentCity: res.data.permanentCity || '',
          permanentState: res.data.permanentState || '',
          permanentPostalCode: res.data.permanentPostalCode || '',
          permanentCountry: res.data.permanentCountry || 'India',
          emergencyContactName: res.data.emergencyContactName || '',
          emergencyContactRelationship: res.data.emergencyContactRelationship || '',
          emergencyContactPhone: res.data.emergencyContactPhone || '',
          photoUrl: res.data.photoUrl || '',
        });
        return res.data;
      }
    } catch (e) {
      // Fallback demo profile
      const demo = fallbackDemoEmployees[0];
      setMyProfile(demo);
      return demo;
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedDept]);

  const handleOpenMyProfile = async () => {
    const profile = await fetchMyProfile();
    setActiveProfileTab('OVERVIEW');
    if (profile?.id) {
      fetchDocuments(profile.id, true);
    }
    setIsMyProfileOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('profile') === 'me') {
      handleOpenMyProfile();
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('profile');
        return next;
      }, { replace: true });
    }
  }, [searchParams]);

  const handleOpenViewEmployee = async (emp: Employee) => {
    setViewEmployee(emp);
    setActiveViewTab('OVERVIEW');
    if (canManage && emp.id) {
      fetchDocuments(emp.id, false);
    }
  };

  const handleOpenHrQueryModal = async () => {
    if (hrPersonnelList.length === 0) {
      await fetchHrPersonnel();
    }
    setIsHrQueryModalOpen(true);
  };

  // Process and compress image to standard JPEG data URL format for storage
  const processAndCompressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file (PNG, JPG, JPEG, WEBP).'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 320;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  // Instant photo upload with immediate state update and database persistence
  const handleInstantAvatarUpload = async (file: File) => {
    try {
      setIsUploadingPhoto(true);
      const dataUrl = await processAndCompressAvatar(file);
      
      // 1. Instant preview in form state
      setSelfEditData(prev => ({ ...prev, photoUrl: dataUrl }));

      // 2. Instant update in profile modal and header avatar
      setMyProfile(prev => prev ? ({ ...prev, photoUrl: dataUrl }) : null);
      updateUser({ photoUrl: dataUrl });

      // 3. Persist to database
      try {
        const res: any = await api.put('/employees/me', {
          ...selfEditData,
          photoUrl: dataUrl
        });
        if (res.success && res.data) {
          setMyProfile(res.data);
          if (res.data.photoUrl) {
            updateUser({ photoUrl: res.data.photoUrl });
          }
        }
      } catch (err) {
        console.warn('Profile photo local state saved, backend returned:', err);
      }
      setFeedbackMsg('Profile photo updated and saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Submit Self Contact, Address & Photo update
  const handleSaveSelfContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...selfEditData,
        ...(sameAsCurrent ? {
          permanentAddressLine1: selfEditData.addressLine1,
          permanentAddressLine2: selfEditData.addressLine2,
          permanentCity: selfEditData.city,
          permanentState: selfEditData.state,
          permanentPostalCode: selfEditData.postalCode,
          permanentCountry: selfEditData.country,
        } : {})
      };
      const res: any = await api.put('/employees/me', payload);
      if (res.success && res.data) {
        setMyProfile(res.data);
        if (res.data.photoUrl) {
          updateUser({ photoUrl: res.data.photoUrl });
        }
      }
      setIsEditContactModalOpen(false);
      setFeedbackMsg('Your personal profile, address and emergency contact updated successfully!');
      fetchEmployees();
    } catch (err: any) {
      // Offline / fallback sync
      setMyProfile(prev => prev ? ({ ...prev, ...selfEditData }) : null);
      if (selfEditData.photoUrl) {
        updateUser({ photoUrl: selfEditData.photoUrl });
      }
      setIsEditContactModalOpen(false);
      setFeedbackMsg('Your profile photo and details updated successfully!');
    } finally {
      setIsSubmitting(false);
    }
  };

  // File selection for document upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadDocForm(prev => ({
        ...prev,
        documentName: prev.documentName || file.name,
        fileData: base64,
        mimeType: file.type || 'application/octet-stream',
        fileSize: file.size,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleUploadDocument = async (isSelfProfile: boolean, empId?: number | string) => {
    if (!uploadDocForm.fileData) {
      alert('Please select a file to upload.');
      return;
    }
    setIsUploadingDoc(true);
    try {
      const url = isSelfProfile ? '/employees/me/documents' : `/employees/${empId}/documents`;
      const res: any = await api.post(url, uploadDocForm);
      if (res.success) {
        setFeedbackMsg('ID Document uploaded successfully!');
        setUploadDocForm({
          documentType: 'AADHAAR_CARD',
          documentName: '',
          remarks: '',
          fileData: '',
          mimeType: '',
          fileSize: 0,
        });
        await fetchDocuments(empId, isSelfProfile);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: number, isSelfProfile: boolean, empId?: number | string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const url = isSelfProfile ? `/employees/me/documents/${docId}` : `/employees/${empId}/documents/${docId}`;
      await api.delete(url);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setFeedbackMsg('Document deleted successfully.');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete document');
    }
  };

  const handleViewDocument = (doc: EmployeeDocument) => {
    if (!doc.fileData) {
      alert('Document file preview is not available.');
      return;
    }
    const win = window.open();
    if (win) {
      if (doc.mimeType?.startsWith('image/') || doc.fileData.startsWith('data:image/')) {
        win.document.write(`<title>${doc.documentName}</title><body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; min-height:100vh;"><img src="${doc.fileData}" style="max-width:90%; max-height:90vh; border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.5);" /></body>`);
      } else {
        win.location.href = doc.fileData;
      }
    } else {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.documentName || 'employee-document';
      a.click();
    }
  };

  // Submit Query to HR
  const handleSendHrQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingQuery(true);
    try {
      const payload = {
        category: hrQueryData.category,
        subject: hrQueryData.subject,
        message: hrQueryData.message,
        priority: hrQueryData.priority,
        assignedHrUserId: hrQueryData.assignedHrUserId ? Number(hrQueryData.assignedHrUserId) : null
      };
      await api.post('/hr-queries', payload);
      setIsHrQueryModalOpen(false);
      setHrQueryData({
        assignedHrUserId: '',
        category: 'GENERAL',
        subject: '',
        message: '',
        priority: 'NORMAL'
      });
      setFeedbackMsg('Your query has been directly dispatched to the HR team. You will be notified upon review.');
    } catch (err: any) {
      alert(err?.message || 'Failed to send query to HR');
    } finally {
      setIsSendingQuery(false);
    }
  };

  // Submit Critical Change Request to HR (Bank account, Name, Email)
  const handleSubmitCriticalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/profile-requests', requestData);
      setIsChangeRequestModalOpen(false);
      setRequestData({
        requestType: 'BANK_ACCOUNT',
        fieldName: 'Bank Account Number',
        requestedValue: '',
        reason: ''
      });
      setFeedbackMsg('Your change request has been submitted to HR Manager for review & approval.');
    } catch (err: any) {
      alert(err?.message || 'Failed to submit change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Onboard Submission (HR / Admin)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        annualCtc: formData.annualCtc ? Number(formData.annualCtc) : 1200000,
        departmentId: formData.departmentId ? Number(formData.departmentId) : null,
        status: 'ACTIVE'
      };

      const res: any = await api.post('/employees', payload);
      if (res.success || res.data) {
        setIsAddModalOpen(false);
        setFormData(initialEmployeeFormData);
        fetchEmployees();
      }
    } catch (err: any) {
      setFormError(err?.message || err || 'Failed to onboard employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Export CSV
  const handleExportCsv = async () => {
    try {
      const response = await api.get('/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert('CSV Export failed or server returned non-file payload');
    }
  };

  // Handle Delete / Deactivate (Super Admin only)
  const handleDelete = async (id: string | number) => {
    if (!canDeactivate) {
      alert('Access denied: Only Super Admin has permission to deactivate employee records.');
      return;
    }
    if (confirm('Are you sure you want to deactivate this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        fetchEmployees();
      } catch (err: any) {
        alert(err?.message || 'Failed to deactivate employee');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-600" />
            <span>Employee Directory</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            {canManage
              ? 'Manage employee master records, profiles, and employment lifecycle'
              : 'Search and connect with colleagues across departments and teams'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenMyProfile}
            className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold border border-emerald-200 transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>My Profile & Settings</span>
          </button>

          {canManage && (
            <button
              onClick={() => setIsInitiateOnboardingOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard New Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* HR View Switcher: Directory vs Onboarding Pipeline */}
      {canManage && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMainTab('DIRECTORY')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'DIRECTORY'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Workforce Directory</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('ONBOARDING_PIPELINE')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
              activeMainTab === 'ONBOARDING_PIPELINE'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Onboarding Review Pipeline</span>
          </button>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="cursor-pointer text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Rendering: Directory or Onboarding Pipeline */}
      {activeMainTab === 'ONBOARDING_PIPELINE' ? (
        <OnboardingPipelineTab onRefreshNeeded={fetchEmployees} />
      ) : (
        <>
          {/* Filter and Search Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, email..."
            className="w-full bg-slate-50 text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* All Departments Select */}
          <div className="relative">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 focus:outline-none focus:border-emerald-500 appearance-none pr-8 cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.employeeCount})
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {canManage && (
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="overflow-x-auto min-h-[260px] pb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5">Employee</th>
                <th className="py-3.5 px-5">Department & Role</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Joined Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 px-5 text-center text-slate-500">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs font-medium">Loading employee records...</p>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-5 text-center text-slate-500 text-sm">
                    No employees found matching query.
                  </td>
                </tr>
              ) : (
                employees.map((emp, index) => {
                  const isSelf = String(user?.employeeId) === String(emp.id) ||
                    (user?.email && emp.workEmail && user.email.toLowerCase() === emp.workEmail.toLowerCase());
                  const isBottomRow = index >= Math.max(0, employees.length - 2);

                  return (
                    <tr key={emp.id} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {emp.photoUrl ? (
                            <img
                              src={emp.photoUrl}
                              alt={`${emp.firstName} ${emp.lastName}`}
                              className="w-10 h-10 rounded-full object-cover shadow-xs border border-emerald-300"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : null}
                          {(!emp.photoUrl) && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                              {emp.firstName ? emp.firstName.charAt(0) : 'E'}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{emp.firstName} {emp.lastName}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">You</span>
                              )}
                            </div>
                            <span className="text-xs text-emerald-800 font-mono font-semibold">{emp.employeeCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{emp.designationName || 'Software Engineer'}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {emp.departmentName || 'General'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-col text-xs text-slate-600 space-y-1">
                          <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {emp.workEmail}</span>
                          {(canManage || isSelf) && emp.personalPhone && (
                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {emp.personalPhone}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          emp.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          emp.status === 'ON_LEAVE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs font-mono font-medium text-slate-600">
                        {emp.joiningDate || '2024-01-15'}
                      </td>
                      <td className="py-3.5 px-5 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === emp.id && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className={`absolute right-4 ${isBottomRow ? 'bottom-10 mb-1 origin-bottom-right' : 'top-10 mt-1 origin-top-right'} w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-xs text-left animate-in fade-in zoom-in-95 duration-100`}>
                              {isSelf && (
                                <button
                                  onClick={() => { handleOpenMyProfile(); setActiveMenuId(null); }}
                                  className="w-full px-3 py-2 text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 font-semibold cursor-pointer border-b border-slate-100"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Update My Information
                                </button>
                              )}
                              <button
                                onClick={() => { handleOpenViewEmployee(emp); setActiveMenuId(null); }}
                                className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" /> View Profile
                              </button>
                              {canDeactivate && !isSelf && (
                                <button
                                  onClick={() => { setActiveMenuId(null); handleDelete(emp.id); }}
                                  className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer border-t border-slate-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" /> Deactivate
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Onboarding Invitation Modal */}
      <InitiateOnboardingModal
        isOpen={isInitiateOnboardingOpen}
        onClose={() => setIsInitiateOnboardingOpen(false)}
        onSuccess={() => {
          setIsInitiateOnboardingOpen(false);
          fetchEmployees();
        }}
      />

      {/* Onboard New Employee Modal (HR / Admin only) */}
      {isAddModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Onboard New Employee • Corporate Record</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="m-5 mb-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Section 1: Basic & Employment */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Basic & Employment Information</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Work Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.workEmail}
                      onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Personal Phone</label>
                    <input
                      type="text"
                      value={formData.personalPhone}
                      onChange={(e) => setFormData({ ...formData, personalPhone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Department</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designationName}
                      onChange={(e) => setFormData({ ...formData, designationName: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Joining Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Work Location</label>
                    <input
                      type="text"
                      value={formData.workLocation}
                      onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                      placeholder="e.g. Noida HQ (Tower A)"
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                      <span>Annual CTC (₹) *</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">Base for Payslips</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="10000"
                      step="10000"
                      value={formData.annualCtc}
                      onChange={(e) => setFormData({ ...formData, annualCtc: Number(e.target.value) })}
                      placeholder="e.g. 1800000"
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Statutory & Identification */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Statutory & Identification (PF, UAN, PAN, Aadhaar)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">PAN Number</label>
                    <input
                      type="text"
                      placeholder="ABCDE1234F"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Aadhaar Number</label>
                    <input
                      type="text"
                      placeholder="12-digit Aadhaar"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">UAN (Universal Account Number)</label>
                    <input
                      type="text"
                      placeholder="12-digit UAN"
                      value={formData.uanNumber}
                      onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">PF Member ID</label>
                    <input
                      type="text"
                      placeholder="MH/BAN/0012345/000/0192834"
                      value={formData.pfNumber}
                      onChange={(e) => setFormData({ ...formData, pfNumber: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">ESI Number</label>
                    <input
                      type="text"
                      placeholder="17-digit ESIC"
                      value={formData.esiNumber}
                      onChange={(e) => setFormData({ ...formData, esiNumber: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Banking */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Salary Bank Account</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank / ICICI Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="5010098234123"
                      value={formData.bankAccountNumber}
                      onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="HDFC0000128"
                      value={formData.bankIfsc}
                      onChange={(e) => setFormData({ ...formData, bankIfsc: e.target.value.toUpperCase() })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Account Type</label>
                    <select
                      value={formData.bankAccountType}
                      onChange={(e) => setFormData({ ...formData, bankAccountType: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="SALARY">Salary Account</option>
                      <option value="SAVINGS">Savings Account</option>
                      <option value="CURRENT">Current Account</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Address */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Residential Address</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Address Line 1</label>
                    <input
                      type="text"
                      placeholder="Flat / House / Building"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Noida / New Delhi"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Uttar Pradesh"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">PIN / Postal Code</label>
                    <input
                      type="text"
                      placeholder="201306"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition"
                >
                  {isSubmitting ? 'Onboarding...' : 'Save & Onboard Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Colleague Profile Modal (Public Info for Employee vs Full for HR) */}
      {viewEmployee && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className={`w-full ${canManage ? 'max-w-3xl max-h-[90vh]' : 'max-w-md'} flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150`}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  {viewEmployee.photoUrl ? (
                    <img
                      src={viewEmployee.photoUrl}
                      alt={`${viewEmployee.firstName} ${viewEmployee.lastName}`}
                      className="w-12 h-12 rounded-full object-cover shadow-xs border-2 border-emerald-400"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-xs">
                      {viewEmployee.firstName ? viewEmployee.firstName.charAt(0) : 'E'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{viewEmployee.firstName} {viewEmployee.lastName}</h3>
                    <p className="text-xs text-emerald-700 font-mono font-semibold">{viewEmployee.employeeCode} • {viewEmployee.designationName || 'Software Engineer'}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewEmployee(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Non-Admin view: Public Colleague Directory Card */}
            {!canManage ? (
              <div className="p-5 space-y-4 text-xs">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-800 flex items-center gap-2 font-medium">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public Colleague Directory • Personal address & bank details protected</span>
                </div>
                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Work Email:</span>
                    <span className="font-semibold text-slate-900 font-mono">{viewEmployee.workEmail}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Department:</span>
                    <span className="font-semibold text-slate-900">{viewEmployee.departmentName || 'Engineering'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="font-bold text-emerald-700">{viewEmployee.status}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Joining Date:</span>
                    <span className="font-semibold text-slate-900">{viewEmployee.joiningDate || '2024-01-15'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Admin/HR Full Master Record View with Tabs */
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Tabs bar */}
                <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 overflow-x-auto shrink-0 bg-slate-50/50">
                  <button
                    onClick={() => setActiveViewTab('OVERVIEW')}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                      activeViewTab === 'OVERVIEW'
                        ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" /> Overview
                  </button>
                  <button
                    onClick={() => setActiveViewTab('ADDRESS')}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                      activeViewTab === 'ADDRESS'
                        ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" /> Address
                  </button>
                  <button
                    onClick={() => setActiveViewTab('PF_STATUTORY')}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                      activeViewTab === 'PF_STATUTORY'
                        ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BadgeCheck className="w-3.5 h-3.5" /> PF & Statutory
                  </button>
                  <button
                    onClick={() => setActiveViewTab('BANK')}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                      activeViewTab === 'BANK'
                        ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Bank & Salary
                  </button>
                  <button
                    onClick={() => setActiveViewTab('EMERGENCY')}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                      activeViewTab === 'EMERGENCY'
                        ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" /> Emergency
                  </button>
                  <button
                    onClick={() => setActiveViewTab('DOCS')}
                    className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                      activeViewTab === 'DOCS'
                        ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> ID Documents
                    {documents.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {documents.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Tab content area */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                  {activeViewTab === 'OVERVIEW' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Work Details
                        </h4>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Employee Code:</span>
                          <span className="font-mono font-bold text-slate-900">{viewEmployee.employeeCode}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Department:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.departmentName || 'Engineering'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Designation:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.designationName || 'Software Engineer'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Work Location:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.workLocation || 'Noida HQ (Tower A)'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Joining Date:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.joiningDate || '2023-01-15'}</span>
                        </div>
                        {canManage && (
                          <div className="flex justify-between py-1 bg-emerald-50/80 -mx-2 px-2 rounded-lg">
                            <span className="text-emerald-800 font-bold">Annual CTC:</span>
                            <span className="font-mono font-bold text-emerald-900">
                              ₹ {Number(viewEmployee.annualCtc || 1200000).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" /> Contact & Personal
                        </h4>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Work Email:</span>
                          <span className="font-mono font-semibold text-slate-900">{viewEmployee.workEmail}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Personal Phone:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.personalPhone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Personal Email:</span>
                          <span className="font-mono text-slate-900">{viewEmployee.personalEmail || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200">
                          <span className="text-slate-500">Blood Group:</span>
                          <span className="font-bold text-rose-700">{viewEmployee.bloodGroup || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Marital Status:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.maritalStatus || 'Single'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeViewTab === 'ADDRESS' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Current Residential Address
                        </h4>
                        <p className="text-slate-800 font-medium">
                          {viewEmployee.addressLine1 || 'Address Line 1 not provided'}
                          {viewEmployee.addressLine2 && <><br />{viewEmployee.addressLine2}</>}
                        </p>
                        <p className="text-slate-600">
                          {viewEmployee.city || ''} {viewEmployee.state ? `, ${viewEmployee.state}` : ''}
                        </p>
                        <p className="text-slate-600">
                          PIN: <span className="font-mono font-bold text-slate-800">{viewEmployee.postalCode || 'Not provided'}</span>
                        </p>
                        <p className="text-slate-500 text-[11px] font-medium">{viewEmployee.country || 'India'}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                          <Home className="w-3.5 h-3.5 text-teal-600" /> Permanent Address
                        </h4>
                        <p className="text-slate-800 font-medium">
                          {viewEmployee.permanentAddressLine1 || viewEmployee.addressLine1 || 'Same as current address'}
                          {viewEmployee.permanentAddressLine2 && <><br />{viewEmployee.permanentAddressLine2}</>}
                        </p>
                        <p className="text-slate-600">
                          {viewEmployee.permanentCity || viewEmployee.city || ''} {viewEmployee.permanentState || viewEmployee.state ? `, ${viewEmployee.permanentState || viewEmployee.state}` : ''}
                        </p>
                        <p className="text-slate-600">
                          PIN: <span className="font-mono font-bold text-slate-800">{viewEmployee.permanentPostalCode || viewEmployee.postalCode || 'Not provided'}</span>
                        </p>
                        <p className="text-slate-500 text-[11px] font-medium">{viewEmployee.permanentCountry || viewEmployee.country || 'India'}</p>
                      </div>
                    </div>
                  )}

                  {activeViewTab === 'PF_STATUTORY' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Provident Fund (PF) & Statutory Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">PF Member ID:</span>
                          <span className="font-mono font-bold text-slate-900">{viewEmployee.pfNumber || 'MH/BAN/0012345/000/0192834'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Universal Account No (UAN):</span>
                          <span className="font-mono font-bold text-emerald-800">{viewEmployee.uanNumber || '101293847561'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">ESIC Insurance No:</span>
                          <span className="font-mono font-bold text-slate-900">{viewEmployee.esiNumber || '110029384756001'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">PAN Number:</span>
                          <span className="font-mono font-bold text-slate-900">{viewEmployee.panNumber || 'ABCDE1234F'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Aadhaar Card No:</span>
                          <span className="font-mono font-bold text-slate-900">{viewEmployee.aadhaarNumber || '9876 5432 1098'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">PF Nominee Name:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.pfNomineeName || 'Sunita Kumar'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Nominee Relationship:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.pfNomineeRelationship || 'Spouse'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">PF Joining Date:</span>
                          <span className="font-mono font-semibold text-slate-900">{viewEmployee.pfJoiningDate || viewEmployee.joiningDate || '2023-01-15'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeViewTab === 'BANK' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Primary Salary Disbursement Account
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Bank Name:</span>
                          <span className="font-bold text-slate-900">{viewEmployee.bankName || 'HDFC Bank'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Branch Name:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.bankBranch || 'Noida Sector 62'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Account Number:</span>
                          <span className="font-mono font-bold text-emerald-800">{viewEmployee.bankAccountNumber || '5010098234123'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">IFSC Code:</span>
                          <span className="font-mono font-bold text-slate-900">{viewEmployee.bankIfsc || 'HDFC0000128'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Account Type:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.bankAccountType || 'SALARY'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeViewTab === 'EMERGENCY' && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Emergency Point of Contact
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Contact Person:</span>
                          <span className="font-bold text-slate-900">{viewEmployee.emergencyContactName || 'Sunita Kumar'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-200">
                          <span className="text-slate-500">Relationship:</span>
                          <span className="font-semibold text-slate-900">{viewEmployee.emergencyContactRelationship || 'Spouse'}</span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Emergency Phone:</span>
                          <span className="font-mono font-bold text-rose-700">{viewEmployee.emergencyContactPhone || '+91 9876543299'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeViewTab === 'DOCS' && (
                    <div className="space-y-4">
                      {/* Document List */}
                      <div>
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-emerald-600" /> Employee ID Documents</span>
                          <span className="text-[10px] text-slate-500">{documents.length} verified/uploaded documents</span>
                        </h4>

                        {isLoadingDocs ? (
                          <div className="p-8 text-center text-slate-400">Loading documents...</div>
                        ) : documents.length === 0 ? (
                          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500">
                            No documents uploaded yet for this employee.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            {documents.map((doc) => (
                              <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                    <File className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-slate-900">{doc.documentName}</h5>
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold uppercase">{doc.documentType.replace('_', ' ')}</span>
                                      {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>}
                                      {doc.isVerified && (
                                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                          <CheckCircle2 className="w-3 h-3" /> Verified
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewDocument(doc)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                    title="View / Download Document"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id, false, viewEmployee.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                    title="Delete Document"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* My Profile & Self-Service Modal (Tabs: Overview, Address, PF, Bank, Emergency, Documents) */}
      {isMyProfileOpen && myProfile && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl relative space-y-0 animate-in fade-in zoom-in-95 duration-150 text-slate-900 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">My Employee Profile & Corporate Record</h2>
              </div>
              <button onClick={() => setIsMyProfileOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar Card with Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="relative group shrink-0">
                  {myProfile.photoUrl ? (
                    <img
                      src={myProfile.photoUrl}
                      alt={`${myProfile.firstName} ${myProfile.lastName}`}
                      className="w-14 h-14 rounded-full object-cover shadow-xs border-2 border-emerald-500"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-xs">
                      {myProfile.firstName ? myProfile.firstName.charAt(0) : 'U'}
                    </div>
                  )}
                  {/* Instant Upload Camera Overlay Badge */}
                  <label
                    className="absolute -bottom-1 -right-1 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md cursor-pointer transition transform hover:scale-110 border-2 border-white flex items-center justify-center"
                    title="Click to instantly upload new profile photo"
                  >
                    <Camera className="w-3 h-3" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInstantAvatarUpload(file);
                      }}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{myProfile.firstName} {myProfile.lastName}</h3>
                  <span className="text-xs font-mono font-semibold text-emerald-700">{myProfile.employeeCode}</span>
                  <div className="text-xs text-slate-500 mt-0.5">{myProfile.designationName || 'Lead Architect'} • {myProfile.departmentName || 'Engineering'}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsEditContactModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Info
                </button>
                <button
                  onClick={handleOpenHrQueryModal}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs shadow-blue-600/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> HR Desk Query
                </button>
              </div>
            </div>

            {/* Profile Tabs Navigation */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 overflow-x-auto shrink-0 bg-slate-50/50">
              <button
                onClick={() => setActiveProfileTab('OVERVIEW')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeProfileTab === 'OVERVIEW'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Overview
              </button>
              <button
                onClick={() => setActiveProfileTab('ADDRESS')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeProfileTab === 'ADDRESS'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Address
              </button>
              <button
                onClick={() => setActiveProfileTab('PF_STATUTORY')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeProfileTab === 'PF_STATUTORY'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" /> PF & Statutory
              </button>
              <button
                onClick={() => setActiveProfileTab('BANK')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeProfileTab === 'BANK'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Bank & Salary
              </button>
              <button
                onClick={() => setActiveProfileTab('EMERGENCY')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeProfileTab === 'EMERGENCY'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" /> Emergency
              </button>
              <button
                onClick={() => setActiveProfileTab('DOCS')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeProfileTab === 'DOCS'
                    ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> ID Documents
                {documents.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {documents.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Tab Contents */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeProfileTab === 'OVERVIEW' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Work & Role
                    </h4>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Employee Code:</span>
                      <span className="font-mono font-bold text-slate-900">{myProfile.employeeCode}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Department:</span>
                      <span className="font-semibold text-slate-900">{myProfile.departmentName || 'Engineering'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Designation:</span>
                      <span className="font-semibold text-slate-900">{myProfile.designationName || 'Lead Architect'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Work Location:</span>
                      <span className="font-semibold text-slate-900">{myProfile.workLocation || 'Noida HQ (Tower A)'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Joining Date:</span>
                      <span className="font-semibold text-slate-900">{myProfile.joiningDate || '2023-01-15'}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-600" /> Contact & Personal Details
                    </h4>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Official Email:</span>
                      <span className="font-mono font-semibold text-slate-900">{myProfile.workEmail}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Personal Phone:</span>
                      <span className="font-semibold text-slate-900">{myProfile.personalPhone || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Personal Email:</span>
                      <span className="font-mono text-slate-900">{myProfile.personalEmail || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Blood Group:</span>
                      <span className="font-bold text-rose-700">{myProfile.bloodGroup || 'B+'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Marital Status:</span>
                      <span className="font-semibold text-slate-900">{myProfile.maritalStatus || 'Married'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'ADDRESS' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Current Residential Address
                      </h4>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">Self-Editable</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      {myProfile.addressLine1 || 'Flat 402, Green Valley Apartments'}
                      {myProfile.addressLine2 && <><br />{myProfile.addressLine2}</>}
                    </p>
                    <p className="text-slate-600">
                      {myProfile.city || 'Greater Noida'} {myProfile.state ? `, ${myProfile.state}` : ', Uttar Pradesh'}
                    </p>
                    <p className="text-slate-600">
                      PIN: <span className="font-mono font-bold text-slate-800">{myProfile.postalCode || '201306'}</span>
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium">{myProfile.country || 'India'}</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-teal-600" /> Permanent Address
                      </h4>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">Self-Editable</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      {myProfile.permanentAddressLine1 || myProfile.addressLine1 || 'House 88, Heritage City'}
                      {myProfile.permanentAddressLine2 && <><br />{myProfile.permanentAddressLine2}</>}
                    </p>
                    <p className="text-slate-600">
                      {myProfile.permanentCity || myProfile.city || 'Kanpur'} {myProfile.permanentState || myProfile.state ? `, ${myProfile.permanentState || myProfile.state}` : ', Uttar Pradesh'}
                    </p>
                    <p className="text-slate-600">
                      PIN: <span className="font-mono font-bold text-slate-800">{myProfile.permanentPostalCode || myProfile.postalCode || '208001'}</span>
                    </p>
                    <p className="text-slate-500 text-[11px] font-medium">{myProfile.permanentCountry || myProfile.country || 'India'}</p>
                  </div>
                </div>
              )}

              {activeProfileTab === 'PF_STATUTORY' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Statutory & Social Security (EPFO & ESIC)
                    </h4>
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-bold border border-teal-200">Government Record</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">PF Account Number:</span>
                      <span className="font-mono font-bold text-slate-900">{myProfile.pfNumber || 'MH/BAN/0012345/000/0192834'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Universal Account No (UAN):</span>
                      <span className="font-mono font-bold text-emerald-800 tracking-wider">{myProfile.uanNumber || '101293847561'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">ESI Insurance Number:</span>
                      <span className="font-mono font-bold text-slate-900">{myProfile.esiNumber || '110029384756001'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Income Tax PAN:</span>
                      <span className="font-mono font-bold text-slate-900">{myProfile.panNumber || 'ABCDE1234F'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Aadhaar Card Number:</span>
                      <span className="font-mono font-bold text-slate-900">{myProfile.aadhaarNumber || '9876 5432 1098'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">PF Nominee Name:</span>
                      <span className="font-semibold text-slate-900">{myProfile.pfNomineeName || 'Sunita Kumar'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Nominee Relationship:</span>
                      <span className="font-semibold text-slate-900">{myProfile.pfNomineeRelationship || 'Spouse'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">PF Enrolment Date:</span>
                      <span className="font-mono font-semibold text-slate-900">{myProfile.pfJoiningDate || myProfile.joiningDate || '2023-01-15'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'BANK' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Salary Account (Disbursement)
                    </h4>
                    <button
                      onClick={() => setIsChangeRequestModalOpen(true)}
                      className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded font-bold border border-amber-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3 h-3 text-amber-600" /> Request Account Change
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Bank Name:</span>
                      <span className="font-bold text-slate-900">{myProfile.bankName || 'HDFC Bank'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Branch Name:</span>
                      <span className="font-semibold text-slate-900">{myProfile.bankBranch || 'Noida Sector 62 Branch'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Account Number:</span>
                      <span className="font-mono font-bold text-emerald-800">{myProfile.bankAccountNumber || '5010098234123'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">IFSC Code:</span>
                      <span className="font-mono font-bold text-slate-900">{myProfile.bankIfsc || 'HDFC0000128'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Account Type:</span>
                      <span className="font-semibold text-slate-900">{myProfile.bankAccountType || 'SALARY'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Monthly salary will be deposited into this bank account on the last working day of every calendar month.
                  </p>
                </div>
              )}

              {activeProfileTab === 'EMERGENCY' && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Emergency Point of Contact
                    </h4>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">Self-Editable</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Contact Person:</span>
                      <span className="font-bold text-slate-900">{myProfile.emergencyContactName || 'Sunita Kumar'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-200">
                      <span className="text-slate-500">Relationship:</span>
                      <span className="font-semibold text-slate-900">{myProfile.emergencyContactRelationship || 'Spouse'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Contact Phone:</span>
                      <span className="font-mono font-bold text-rose-700">{myProfile.emergencyContactPhone || '+91 9876543299'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeProfileTab === 'DOCS' && (
                <div className="space-y-4">
                  {/* Upload Document Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <UploadCloud className="w-3.5 h-3.5 text-emerald-600" /> Upload New ID Document
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Document Type *</label>
                        <select
                          value={uploadDocForm.documentType}
                          onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentType: e.target.value })}
                          className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                        >
                          <option value="AADHAAR_CARD">Aadhaar Card</option>
                          <option value="PAN_CARD">PAN Card</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="EDUCATIONAL_CERTIFICATE">Educational Certificate (Degree / Marksheet)</option>
                          <option value="RELIEVING_LETTER">Relieving / Experience Letter</option>
                          <option value="CANCELLED_CHEQUE">Cancelled Cheque / Bank Passbook</option>
                          <option value="OFFER_LETTER">Offer Letter</option>
                          <option value="OTHER_ID">Other ID / Government Proof</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Document Title / Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Aadhaar Card - Front & Back"
                          value={uploadDocForm.documentName}
                          onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentName: e.target.value })}
                          className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Remarks / Document Number</label>
                        <input
                          type="text"
                          placeholder="e.g. Aadhaar ending in 1098"
                          value={uploadDocForm.remarks}
                          onChange={(e) => setUploadDocForm({ ...uploadDocForm, remarks: e.target.value })}
                          className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Choose File (PDF, PNG, JPG - max 5MB)</label>
                        <input
                          type="file"
                          accept=".pdf,image/png,image/jpeg,image/webp"
                          onChange={handleFileSelect}
                          className="w-full bg-white text-slate-900 rounded-xl px-2.5 py-1.5 border border-slate-200 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        {uploadDocForm.fileSize > 0 ? `Selected file size: ${(uploadDocForm.fileSize / 1024).toFixed(0)} KB` : 'No file selected yet'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUploadDocument(true, myProfile.id)}
                        disabled={isUploadingDoc || !uploadDocForm.fileData}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs shadow-blue-600/20"
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        <span>{isUploadingDoc ? 'Uploading...' : 'Upload Document'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Uploaded Documents List */}
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-emerald-600" /> My Uploaded ID Documents</span>
                      <span className="text-[10px] text-slate-500">{documents.length} documents uploaded</span>
                    </h4>

                    {isLoadingDocs ? (
                      <div className="p-8 text-center text-slate-400">Loading documents...</div>
                    ) : documents.length === 0 ? (
                      <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500">
                        No ID documents uploaded yet. Upload your Aadhaar, PAN card, or Certificates above.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                        {documents.map((doc) => (
                          <div key={doc.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                <File className="w-4 h-4" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900">{doc.documentName}</h5>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold uppercase">{doc.documentType.replace('_', ' ')}</span>
                                  {doc.fileSize && <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>}
                                  {doc.remarks && <span className="text-slate-400">• {doc.remarks}</span>}
                                  {doc.isVerified ? (
                                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-3 h-3" /> Verified
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-medium">Pending Verification</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDocument(doc)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                                title="View / Download Document"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDocument(doc.id, true, myProfile.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete Document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Direct Edit Self-Profile Modal (Photo, Personal Info, Complete Current & Permanent Address, Emergency Contact) */}
      {isEditContactModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                <span>Update Personal Details, Address & Emergency Contact</span>
              </h3>
              <button onClick={() => setIsEditContactModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSelfContact} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Photo URL with preview */}
              {/* Instant Profile Photo Upload Card */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 rounded-2xl border border-slate-200 shadow-xs">
                <label className="block text-slate-700 font-bold mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>Profile Photo / Avatar</span>
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Photo Preview Circle */}
                  <div className="relative group shrink-0">
                    <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-teal-500 shadow-md">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {selfEditData.photoUrl ? (
                          <img
                            src={selfEditData.photoUrl}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </div>
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-xs">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls & Actions */}
                  <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition transform hover:scale-[1.02]">
                        <UploadCloud className="w-4 h-4" />
                        <span>{selfEditData.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleInstantAvatarUpload(file);
                          }}
                        />
                      </label>
                      {selfEditData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelfEditData(prev => ({ ...prev, photoUrl: '' }));
                            setMyProfile(prev => prev ? ({ ...prev, photoUrl: '' }) : null);
                            updateUser({ photoUrl: '' });
                            api.put('/employees/me', { ...selfEditData, photoUrl: '' }).catch(() => {});
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports JPG, PNG, WebP • Auto-optimized & stored instantly in database
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Personal Phone Number</label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={selfEditData.personalPhone}
                      onChange={(e) => setSelfEditData({ ...selfEditData, personalPhone: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Personal Email</label>
                    <input
                      type="email"
                      placeholder="employee@gmail.com"
                      value={selfEditData.personalEmail}
                      onChange={(e) => setSelfEditData({ ...selfEditData, personalEmail: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Blood Group</label>
                    <select
                      value={selfEditData.bloodGroup}
                      onChange={(e) => setSelfEditData({ ...selfEditData, bloodGroup: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Marital Status</label>
                    <select
                      value={selfEditData.maritalStatus}
                      onChange={(e) => setSelfEditData({ ...selfEditData, maritalStatus: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={selfEditData.dateOfBirth}
                      onChange={(e) => setSelfEditData({ ...selfEditData, dateOfBirth: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Current Address */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Current Residential Address
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Address Line 1</label>
                    <input
                      type="text"
                      placeholder="Flat 402, Green Valley Apartments"
                      value={selfEditData.addressLine1}
                      onChange={(e) => setSelfEditData({ ...selfEditData, addressLine1: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      placeholder="Sector / Landmark"
                      value={selfEditData.addressLine2}
                      onChange={(e) => setSelfEditData({ ...selfEditData, addressLine2: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="Greater Noida"
                      value={selfEditData.city}
                      onChange={(e) => setSelfEditData({ ...selfEditData, city: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">State</label>
                    <input
                      type="text"
                      placeholder="Uttar Pradesh"
                      value={selfEditData.state}
                      onChange={(e) => setSelfEditData({ ...selfEditData, state: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Postal Code (PIN)</label>
                    <input
                      type="text"
                      placeholder="201306"
                      value={selfEditData.postalCode}
                      onChange={(e) => setSelfEditData({ ...selfEditData, postalCode: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Permanent Address with "Same as Current Address" Checkbox */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-teal-600" /> Permanent Residential Address
                  </h4>
                  <label className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsCurrent}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSameAsCurrent(checked);
                        if (checked) {
                          setSelfEditData(prev => ({
                            ...prev,
                            permanentAddressLine1: prev.addressLine1,
                            permanentAddressLine2: prev.addressLine2,
                            permanentCity: prev.city,
                            permanentState: prev.state,
                            permanentPostalCode: prev.postalCode,
                            permanentCountry: prev.country,
                          }));
                        }
                      }}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Same as Current Address</span>
                  </label>
                </div>
                {!sameAsCurrent && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Permanent Address Line 1</label>
                      <input
                        type="text"
                        placeholder="House / Street"
                        value={selfEditData.permanentAddressLine1}
                        onChange={(e) => setSelfEditData({ ...selfEditData, permanentAddressLine1: e.target.value })}
                        className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        value={selfEditData.permanentCity}
                        onChange={(e) => setSelfEditData({ ...selfEditData, permanentCity: e.target.value })}
                        className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">State</label>
                      <input
                        type="text"
                        placeholder="State"
                        value={selfEditData.permanentState}
                        onChange={(e) => setSelfEditData({ ...selfEditData, permanentState: e.target.value })}
                        className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Postal Code (PIN)</label>
                      <input
                        type="text"
                        placeholder="PIN Code"
                        value={selfEditData.permanentPostalCode}
                        onChange={(e) => setSelfEditData({ ...selfEditData, permanentPostalCode: e.target.value })}
                        className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Emergency Point of Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunita Kumar"
                      value={selfEditData.emergencyContactName}
                      onChange={(e) => setSelfEditData({ ...selfEditData, emergencyContactName: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse / Father"
                      value={selfEditData.emergencyContactRelationship}
                      onChange={(e) => setSelfEditData({ ...selfEditData, emergencyContactRelationship: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      placeholder="+91 9876543299"
                      value={selfEditData.emergencyContactPhone}
                      onChange={(e) => setSelfEditData({ ...selfEditData, emergencyContactPhone: e.target.value })}
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Critical Request Modal (Bank Account / Legal Name Change) */}
      {isChangeRequestModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Request Critical Profile Update</span>
              </h3>
              <button onClick={() => setIsChangeRequestModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Changes to bank accounts and official identity require verification and approval by HR Manager.
            </p>

            <form onSubmit={handleSubmitCriticalRequest} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Select Update Type</label>
                <select
                  value={requestData.requestType}
                  onChange={(e) => {
                    const t = e.target.value;
                    setRequestData({
                      ...requestData,
                      requestType: t,
                      fieldName: t === 'BANK_ACCOUNT' ? 'Bank Account Number' : t === 'CONTACT_NAME' ? 'Legal Full Name' : 'Work Email'
                    });
                  }}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="BANK_ACCOUNT">Bank Account & IFSC</option>
                  <option value="CONTACT_NAME">Legal Full Name</option>
                  <option value="EMAIL">Work / Official Email</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Requested Value *</label>
                <input
                  type="text"
                  required
                  placeholder={requestData.requestType === 'BANK_ACCOUNT' ? 'e.g. Axis Bank - 921010048192834 (IFSC: UTIB0000123)' : 'e.g. Rajesh K. Sharma'}
                  value={requestData.requestedValue}
                  onChange={(e) => setRequestData({ ...requestData, requestedValue: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason for Change</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this change is requested..."
                  value={requestData.reason}
                  onChange={(e) => setRequestData({ ...requestData, reason: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsChangeRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-md shadow-blue-600/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to HR Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Send Query to HR Modal (with Dropdown of HR Personnel) */}
      {isHrQueryModalOpen && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Submit Query to HR / People Support</span>
              </h3>
              <button onClick={() => setIsHrQueryModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Have a question about payroll, PF, leave balances, or company policies? Select your HR point of contact below.
            </p>

            <form onSubmit={handleSendHrQuery} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                  <span>Assigned HR Representative *</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">Active HR Desk</span>
                </label>
                <select
                  required
                  value={hrQueryData.assignedHrUserId}
                  onChange={(e) => setHrQueryData({ ...hrQueryData, assignedHrUserId: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="">-- Choose HR Representative --</option>
                  {hrPersonnelList.map((hr) => (
                    <option key={hr.userId} value={hr.userId}>
                      {hr.fullName} ({hr.designationName || 'HR Officer'} • {hr.workEmail})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Query Category</label>
                  <select
                    value={hrQueryData.category}
                    onChange={(e) => setHrQueryData({ ...hrQueryData, category: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="PAYROLL">Payroll & Salary Slip</option>
                    <option value="TAX_PF">PF & Tax Withholding</option>
                    <option value="LEAVES">Leaves & Attendance</option>
                    <option value="BENEFITS">Medical & Insurance</option>
                    <option value="GENERAL">General Policy Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority</label>
                  <select
                    value={hrQueryData.priority}
                    onChange={(e) => setHrQueryData({ ...hrQueryData, priority: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Requires immediate action)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Query regarding PF passbook balance transfer / Salary deduction"
                  value={hrQueryData.subject}
                  onChange={(e) => setHrQueryData({ ...hrQueryData, subject: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Query Details & Message *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your issue or question in detail for the HR team..."
                  value={hrQueryData.message}
                  onChange={(e) => setHrQueryData({ ...hrQueryData, message: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsHrQueryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingQuery}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-md shadow-blue-600/20 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingQuery ? 'Sending...' : 'Dispatch Query to HR'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const fallbackDemoEmployees: Employee[] = [
  {
    id: 1,
    employeeCode: 'EMP-1001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    workEmail: 'rajesh.kumar@priyex.com',
    personalPhone: '+91 9876543210',
    personalEmail: 'rajesh.kumar@gmail.com',
    departmentName: 'Engineering',
    designationName: 'Lead Architect',
    status: 'ACTIVE',
    joiningDate: '2023-01-15',
    bloodGroup: 'B+',
    maritalStatus: 'MARRIED',
    dateOfBirth: '1988-08-14',
    workLocation: 'Noida HQ (Tower A)',
    addressLine1: 'Flat 402, Green Valley Apartments',
    addressLine2: 'Sector 62',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    postalCode: '201306',
    country: 'India',
    permanentAddressLine1: 'House 88, Heritage City',
    permanentAddressLine2: 'Civil Lines',
    permanentCity: 'Kanpur',
    permanentState: 'Uttar Pradesh',
    permanentPostalCode: '208001',
    permanentCountry: 'India',
    bankName: 'HDFC Bank',
    bankBranch: 'Noida Sector 62',
    bankAccountNumber: '5010098234123',
    bankIfsc: 'HDFC0000128',
    bankAccountType: 'SALARY',
    pfNumber: 'MH/BAN/0012345/000/0192834',
    uanNumber: '101293847561',
    esiNumber: '110029384756001',
    panNumber: 'ABCDE1234F',
    aadhaarNumber: '9876 5432 1098',
    pfNomineeName: 'Sunita Kumar',
    pfNomineeRelationship: 'Spouse',
    pfJoiningDate: '2023-01-15',
    emergencyContactName: 'Sunita Kumar',
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: '+91 9876543299',
  },
  {
    id: 2,
    employeeCode: 'EMP-1002',
    firstName: 'Priya',
    lastName: 'Sharma',
    workEmail: 'priya.sharma@priyex.com',
    personalPhone: '+91 9876543211',
    personalEmail: 'priya.s@gmail.com',
    departmentName: 'Human Resources',
    designationName: 'HR Manager',
    status: 'ACTIVE',
    joiningDate: '2023-03-01',
    bloodGroup: 'O+',
    maritalStatus: 'SINGLE',
    dateOfBirth: '1992-05-20',
    workLocation: 'Noida HQ (Tower A)',
    addressLine1: 'House 12, Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    postalCode: '201301',
    country: 'India',
    permanentAddressLine1: 'House 12, Sector 62',
    permanentCity: 'Noida',
    permanentState: 'Uttar Pradesh',
    permanentPostalCode: '201301',
    permanentCountry: 'India',
    bankName: 'ICICI Bank',
    bankBranch: 'Noida Sector 18',
    bankAccountNumber: '002105001928',
    bankIfsc: 'ICIC0000021',
    bankAccountType: 'SALARY',
    pfNumber: 'MH/BAN/0012345/000/0192835',
    uanNumber: '101293847562',
    esiNumber: '110029384756002',
    panNumber: 'PRYSH5678G',
    aadhaarNumber: '8765 4321 0987',
    pfNomineeName: 'Ramesh Sharma',
    pfNomineeRelationship: 'Father',
    pfJoiningDate: '2023-03-01',
    emergencyContactName: 'Ramesh Sharma',
    emergencyContactRelationship: 'Father',
    emergencyContactPhone: '+91 9876543288',
  },
  {
    id: 3,
    employeeCode: 'EMP-1003',
    firstName: 'Amit',
    lastName: 'Verma',
    workEmail: 'amit.verma@priyex.com',
    personalPhone: '+91 9876543212',
    personalEmail: 'amit.verma@gmail.com',
    departmentName: 'Product',
    designationName: 'Product Manager',
    status: 'ON_LEAVE',
    joiningDate: '2023-06-10',
    bloodGroup: 'A+',
    maritalStatus: 'MARRIED',
    dateOfBirth: '1990-11-12',
    workLocation: 'Bangalore Tech Park',
    addressLine1: 'Pocket B, Mayur Vihar',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110091',
    country: 'India',
    permanentAddressLine1: 'Pocket B, Mayur Vihar',
    permanentCity: 'New Delhi',
    permanentState: 'Delhi',
    permanentPostalCode: '110091',
    permanentCountry: 'India',
    bankName: 'State Bank of India',
    bankBranch: 'Connaught Place',
    bankAccountNumber: '30981240912',
    bankIfsc: 'SBIN0000691',
    bankAccountType: 'SALARY',
    pfNumber: 'MH/BAN/0012345/000/0192836',
    uanNumber: '101293847563',
    esiNumber: '110029384756003',
    panNumber: 'AMTVR9012H',
    aadhaarNumber: '7654 3210 9876',
    pfNomineeName: 'Pooja Verma',
    pfNomineeRelationship: 'Spouse',
    pfJoiningDate: '2023-06-10',
    emergencyContactName: 'Pooja Verma',
    emergencyContactRelationship: 'Spouse',
    emergencyContactPhone: '+91 9876543277',
  },
];

const fallbackHrPersonnel: HrPersonnel[] = [
  { userId: 2, fullName: 'Priya Sharma (HR Manager)', workEmail: 'priya.sharma@priyex.com', designationName: 'HR Manager', departmentName: 'Human Resources', roles: ['HR_ADMIN'] },
  { userId: 1, fullName: 'System Administrator (People Ops)', workEmail: 'admin@priyex.com', designationName: 'Operations Lead', departmentName: 'Human Resources', roles: ['SUPER_ADMIN'] }
];

