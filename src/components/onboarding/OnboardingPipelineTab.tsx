import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Search,
  Users
} from 'lucide-react';
import api from '../../api/client';
import { OnboardingReviewModal } from './OnboardingReviewModal';

export interface PendingOnboardingDto {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  personalPhone: string;
  departmentId: number;
  departmentName: string;
  designationId: number;
  designationName: string;
  joiningDate: string;
  status: string; // ONBOARDING, PENDING_APPROVAL, ACTIVE
  documentCount: number;
  isSubmitted: boolean;
  panNumber?: string;
  aadhaarNumber?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
}

interface OnboardingPipelineTabProps {
  onRefreshNeeded?: () => void;
}

export const OnboardingPipelineTab: React.FC<OnboardingPipelineTabProps> = ({
  onRefreshNeeded
}) => {
  const [candidates, setCandidates] = useState<PendingOnboardingDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<PendingOnboardingDto | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/employees/onboarding/pending');
      if (res.success && Array.isArray(res.data)) {
        setCandidates(res.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const filtered = candidates.filter(
    (c) =>
      c.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      c.workEmail?.toLowerCase().includes(search.toLowerCase()) ||
      c.employeeCode?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingVerificationCount = candidates.filter((c) => c.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-4">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total in Pipeline</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{candidates.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Awaiting Verification</p>
            <p className="text-xl font-extrabold text-amber-600 mt-0.5">{pendingVerificationCount}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profile In Progress</p>
            <p className="text-xl font-extrabold text-blue-600 mt-0.5">
              {candidates.filter((c) => c.status === 'ONBOARDING').length}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter candidates by name, email, or employee code..."
          className="w-full bg-white text-slate-900 rounded-xl pl-10 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:border-blue-500 text-xs shadow-xs"
        />
      </div>

      {/* Candidate Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading onboarding pipeline...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Pending Onboardings</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All employee onboarding requests have been reviewed and activated. Initiate a new hire using "+ Onboard Employee".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((candidate) => {
            const isReadyForReview = candidate.status === 'PENDING_APPROVAL';
            return (
              <div
                key={candidate.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 shadow-sm text-sm">
                    {candidate.firstName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm">
                        {candidate.firstName} {candidate.lastName}
                      </h4>
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {candidate.employeeCode}
                      </span>
                      {isReadyForReview ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Submitted for Approval</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Invite Sent (Filling Form)
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 mt-0.5 text-[11px] truncate">
                      {candidate.designationName} • {candidate.departmentName} • {candidate.workEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right hidden md:block">
                    <p className="text-[10px] text-slate-400">Attached Documents</p>
                    <p className="font-bold text-slate-700">{candidate.documentCount} Files</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCandidate(candidate);
                      setIsReviewModalOpen(true);
                    }}
                    className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                      isReadyForReview
                        ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{isReadyForReview ? 'Review & Approve' : 'View Candidate'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <OnboardingReviewModal
        isOpen={isReviewModalOpen}
        employee={selectedCandidate}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedCandidate(null);
        }}
        onSuccess={() => {
          fetchPending();
          if (onRefreshNeeded) onRefreshNeeded();
        }}
      />
    </div>
  );
};
