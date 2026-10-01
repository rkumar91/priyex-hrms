import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  CreditCard,
  Home,
  ExternalLink,
  ShieldCheck,
  Send,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import api from '../../api/client';
import { PendingOnboardingDto } from './OnboardingPipelineTab';

interface OnboardingReviewModalProps {
  employee: PendingOnboardingDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OnboardingReviewModal: React.FC<OnboardingReviewModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [fullEmployee, setFullEmployee] = useState<any | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employee?.id) {
      setIsLoading(true);
      setError(null);
      setShowFeedbackInput(false);
      setFeedback('');

      Promise.all([
        api.get(`/employees/${employee.id}`),
        api.get(`/employees/${employee.id}/documents`)
      ])
        .then(([empRes, docRes]: [any, any]) => {
          if (empRes.success && empRes.data) setFullEmployee(empRes.data);
          if (docRes.success && Array.isArray(docRes.data)) setDocuments(docRes.data);
        })
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, employee?.id]);

  if (!isOpen || !employee) return null;

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      const res: any = await api.post(`/employees/onboarding/${employee.id}/approve`, {
        remarks: 'Approved by HR Operations'
      });

      if (res.success || res.data) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to approve onboarding');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with server');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback notes explaining what revisions are needed');
      return;
    }

    setIsRevising(true);
    setError(null);

    try {
      const res: any = await api.post(`/employees/onboarding/${employee.id}/request-revisions`, {
        feedback: feedback.trim()
      });

      if (res.success || res.data) {
        onSuccess();
        onClose();
      } else {
        setError(res.message || 'Failed to send revision request');
      }
    } catch (err: any) {
      setError(err?.message || 'Error communicating with server');
    } finally {
      setIsRevising(false);
    }
  };

  const emp = fullEmployee || employee;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Review Onboarding Application: {emp.firstName} {emp.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-200">
                  {emp.employeeCode}
                </span>
                <span className="text-[11px] text-slate-400">
                  Status:{' '}
                  <strong className={emp.status === 'PENDING_APPROVAL' ? 'text-amber-600' : 'text-blue-600'}>
                    {emp.status}
                  </strong>
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Contact summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{emp.workEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{emp.personalPhone || 'No phone'}</span>
            </div>
          </div>

          {/* Bank & Tax Details */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Salary Account & Tax IDs</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bank Name</span>
                <span className="font-bold text-slate-800">{emp.bankName || 'Not filled'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">A/C Number</span>
                <span className="font-mono font-bold text-slate-800">{emp.bankAccountNumber || 'Not filled'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">IFSC Code</span>
                <span className="font-mono font-bold text-slate-800">{emp.bankIfsc || 'Not filled'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">PAN Number</span>
                <span className="font-mono font-bold text-slate-800">{emp.panNumber || 'Not filled'}</span>
              </div>
            </div>
          </div>

          {/* Uploaded Verification Documents */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Uploaded Identity & Bank Documents ({documents.length})</span>
            </h3>

            {documents.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                Candidate has not uploaded any documents yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{doc.documentName}</p>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {doc.documentType}
                      </span>
                    </div>

                    {doc.fileData && (
                      <a
                        href={doc.fileData}
                        download={doc.documentName}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 flex items-center gap-1 font-semibold text-[11px] shrink-0"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Revision Feedback Input */}
          {showFeedbackInput && (
            <div className="space-y-2 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <label className="block text-amber-900 font-bold">Feedback / Revision Instructions *</label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. Please upload a clearer copy of your PAN card and verify your bank IFSC..."
                className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 border border-amber-300 focus:outline-none focus:border-amber-500 text-xs"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFeedbackInput(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestRevision}
                  disabled={isRevising}
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3 h-3" />
                  <span>{isRevising ? 'Sending...' : 'Send Revision Request'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {!showFeedbackInput && (
            <button
              type="button"
              onClick={() => setShowFeedbackInput(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Request Revisions
            </button>
          )}

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? 'Activating...' : 'Approve & Activate Employee'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
