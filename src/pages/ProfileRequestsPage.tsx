import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { canApproveProfileRequests } from '../utils/rbac';
import api from '../api/client';
import {
  ClipboardCheck,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  User,
  ArrowRight,
  Filter,
  AlertCircle,
  X,
  CreditCard,
  Mail,
  UserCheck,
  MessageSquare,
  Send,
  HelpCircle,
  Reply,
  Shield,
  Tag
} from 'lucide-react';

export interface ProfileRequest {
  id: number;
  companyId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  requestType: string;
  fieldName: string;
  currentValue: string;
  requestedValue: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerId?: number;
  reviewerName?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface HrQueryItem {
  id: number;
  companyId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  assignedHrId?: number;
  assignedHrName?: string;
  assignedHrEmail?: string;
  category: string;
  subject: string;
  message: string;
  priority: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  hrResponse?: string;
  respondedAt?: string;
  createdAt: string;
}

export const ProfileRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const canApprove = canApproveProfileRequests(user);

  // Tabs: 'PROFILE_REQUESTS' vs 'HR_QUERIES'
  const [activeTab, setActiveTab] = useState<'PROFILE_REQUESTS' | 'HR_QUERIES'>('PROFILE_REQUESTS');

  // Profile Requests State
  const [requests, setRequests] = useState<ProfileRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // HR Queries State
  const [queries, setQueries] = useState<HrQueryItem[]>([]);
  const [isLoadingQueries, setIsLoadingQueries] = useState(true);
  const [queryFilterStatus, setQueryFilterStatus] = useState<string>('ALL');

  // Submit Profile Request Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newRequestType, setNewRequestType] = useState('BANK_ACCOUNT');
  const [newFieldName, setNewFieldName] = useState('Bank Account Number');
  const [newRequestedValue, setNewRequestedValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Profile Request Modal state
  const [reviewModalData, setReviewModalData] = useState<{ id: number; action: 'APPROVE' | 'REJECT' } | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Respond to HR Query Modal state
  const [selectedQuery, setSelectedQuery] = useState<HrQueryItem | null>(null);
  const [queryResponseText, setQueryResponseText] = useState('');
  const [queryNewStatus, setQueryNewStatus] = useState<'RESOLVED' | 'IN_PROGRESS' | 'CLOSED'>('RESOLVED');
  const [isRespondingQuery, setIsRespondingQuery] = useState(false);

  // Notification message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch Requests
  const fetchRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const params: any = {};
      if (filterStatus !== 'ALL') params.status = filterStatus;
      const res: any = await api.get('/profile-requests', { params });
      if (res.success && Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests(fallbackDemoRequests);
      }
    } catch (e) {
      setRequests(fallbackDemoRequests);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch HR Queries
  const fetchQueries = async () => {
    setIsLoadingQueries(true);
    try {
      const params: any = {};
      if (queryFilterStatus !== 'ALL') params.status = queryFilterStatus;
      const res: any = await api.get('/hr-queries', { params });
      if (res.success && Array.isArray(res.data)) {
        setQueries(res.data);
      } else {
        setQueries(fallbackDemoQueries);
      }
    } catch (e) {
      setQueries(fallbackDemoQueries);
    } finally {
      setIsLoadingQueries(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  useEffect(() => {
    fetchQueries();
  }, [queryFilterStatus]);

  // Quick field presets based on type
  const handleTypeChange = (type: string) => {
    setNewRequestType(type);
    if (type === 'BANK_ACCOUNT') setNewFieldName('Bank Account Number');
    else if (type === 'CONTACT_NAME') setNewFieldName('Legal Full Name');
    else if (type === 'EMAIL') setNewFieldName('Work / Official Email');
    else setNewFieldName('Other Detail');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        requestType: newRequestType,
        fieldName: newFieldName,
        requestedValue: newRequestedValue,
        reason: newReason,
      };
      const res: any = await api.post('/profile-requests', payload);
      if (res.success || res.data) {
        setIsSubmitModalOpen(false);
        setNewRequestedValue('');
        setNewReason('');
        setFeedback({ type: 'success', text: 'Change request submitted successfully to HR Manager for review!' });
        fetchRequests();
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalData) return;
    setIsReviewing(true);
    try {
      const endpoint = reviewModalData.action === 'APPROVE'
        ? `/profile-requests/${reviewModalData.id}/approve`
        : `/profile-requests/${reviewModalData.id}/reject`;
      await api.post(endpoint, { reviewerNotes });
      setReviewModalData(null);
      setReviewerNotes('');
      setFeedback({
        type: 'success',
        text: `Request was ${reviewModalData.action === 'APPROVE' ? 'APPROVED and employee record updated' : 'REJECTED'}.`
      });
      fetchRequests();
    } catch (err: any) {
      alert(err?.message || 'Failed to process request');
    } finally {
      setIsReviewing(false);
    }
  };

  // Submit HR Query Response
  const handleQueryResponseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery) return;
    setIsRespondingQuery(true);
    try {
      await api.post(`/hr-queries/${selectedQuery.id}/respond`, {
        response: queryResponseText,
        status: queryNewStatus
      });
      setSelectedQuery(null);
      setQueryResponseText('');
      setFeedback({ type: 'success', text: 'HR Response submitted and query status updated!' });
      fetchQueries();
    } catch (err: any) {
      alert(err?.message || 'Failed to respond to query');
    } finally {
      setIsRespondingQuery(false);
    }
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const openQueriesCount = queries.filter(q => q.status === 'OPEN' || q.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
              <span>HR Operations & Request Desk</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              Review employee profile update approvals and respond to employee HR inquiries.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('PROFILE_REQUESTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'PROFILE_REQUESTS'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Profile Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('HR_QUERIES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'HR_QUERIES'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-teal-600" />
              <span>HR Helpdesk & Queries</span>
              {openQueriesCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
                  {openQueriesCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: PROFILE CHANGE REQUESTS */}
      {activeTab === 'PROFILE_REQUESTS' && (
        <div className="space-y-6">
          {/* Subheader action & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Status:</span>
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterStatus === s
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setIsSubmitModalOpen(true); setSubmitError(null); }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-2 self-start sm:self-auto cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Change Request</span>
            </button>
          </div>

          {/* Profile Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-3.5 px-5">Employee</th>
                    <th className="py-3.5 px-5">Requested Change</th>
                    <th className="py-3.5 px-5">Current vs Requested</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Submitted At</th>
                    {canApprove && <th className="py-3.5 px-5 text-right">Review Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoadingRequests ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-5 text-center text-slate-500">
                        <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-xs font-medium">Loading requests...</p>
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-5 text-center text-slate-500 text-sm">
                        No profile change requests found.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                              {req.employeeName ? req.employeeName.charAt(0) : 'E'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block text-xs">{req.employeeName}</span>
                              <span className="text-[11px] font-mono text-blue-700">{req.employeeCode}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-xs">
                          <span className="font-bold text-slate-900 block">{req.fieldName}</span>
                          <span className="text-[10px] uppercase font-mono text-slate-400">{req.requestType}</span>
                        </td>

                        <td className="py-3.5 px-5 text-xs max-w-xs">
                          <div className="flex items-center gap-2">
                            <span className="line-through text-slate-400 truncate max-w-[120px]">{req.currentValue || 'None'}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-bold text-emerald-700 truncate max-w-[150px]">{req.requestedValue}</span>
                          </div>
                          {req.reason && <p className="text-[11px] text-slate-400 mt-0.5 truncate">Reason: {req.reason}</p>}
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            req.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {req.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> :
                             req.status === 'REJECTED' ? <XCircle className="w-3 h-3" /> :
                             <Clock className="w-3 h-3" />}
                            {req.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}
                        </td>

                        {canApprove && (
                          <td className="py-3.5 px-5 text-right">
                            {req.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setReviewModalData({ id: req.id, action: 'APPROVE' })}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setReviewModalData({ id: req.id, action: 'REJECT' })}
                                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-bold transition cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Reviewed by {req.reviewerName || 'HR'}</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HR HELPDESK & QUERIES */}
      {activeTab === 'HR_QUERIES' && (
        <div className="space-y-6">
          {/* Subheader and Filters */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 self-start">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Query Status:</span>
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setQueryFilterStatus(s)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  queryFilterStatus === s
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Queries List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="py-3.5 px-5">Employee & Code</th>
                    <th className="py-3.5 px-5">Subject & Category</th>
                    <th className="py-3.5 px-5">Assigned HR</th>
                    <th className="py-3.5 px-5">Priority</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoadingQueries ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-5 text-center text-slate-500">
                        <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-2 text-xs font-medium">Loading HR queries...</p>
                      </td>
                    </tr>
                  ) : queries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 px-5 text-center text-slate-500 text-sm">
                        No queries found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    queries.map((q) => (
                      <tr key={q.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                              {q.employeeName ? q.employeeName.charAt(0) : 'E'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block text-xs">{q.employeeName}</span>
                              <span className="text-[11px] font-mono text-blue-700">{q.employeeCode}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-5 text-xs max-w-sm">
                          <span className="font-bold text-slate-900 block truncate">{q.subject}</span>
                          <span className="text-slate-500 block truncate line-clamp-1 mt-0.5">{q.message}</span>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                            {q.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-xs">
                          <span className="font-semibold text-slate-800 block">{q.assignedHrName || 'HR Team'}</span>
                          <span className="text-[11px] font-mono text-slate-400">{q.assignedHrEmail || 'hr@priyex.com'}</span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            q.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' :
                            q.priority === 'HIGH' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {q.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            q.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            q.status === 'CLOSED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            q.status === 'IN_PROGRESS' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {q.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={() => {
                              setSelectedQuery(q);
                              setQueryResponseText(q.hrResponse || '');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            {q.hrResponse ? 'View / Update Reply' : 'Reply'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Review Profile Request (Approve / Reject) */}
      {reviewModalData && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {reviewModalData.action === 'APPROVE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <span>{reviewModalData.action === 'APPROVE' ? 'Approve Change Request' : 'Reject Change Request'}</span>
              </h3>
              <button onClick={() => setReviewModalData(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Reviewer Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder={reviewModalData.action === 'APPROVE' ? 'Approved after verification of bank cheque copy...' : 'Reason for rejection...'}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setReviewModalData(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReviewing}
                  className={`px-5 py-2 rounded-xl text-white font-semibold transition cursor-pointer shadow-md ${
                    reviewModalData.action === 'APPROVE'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  {isReviewing ? 'Processing...' : reviewModalData.action === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: New Profile Change Request */}
      {isSubmitModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Submit Profile Change Request</span>
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Change Type</label>
                <select
                  value={newRequestType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="BANK_ACCOUNT">Bank Account & IFSC</option>
                  <option value="CONTACT_NAME">Legal Full Name</option>
                  <option value="EMAIL">Work / Official Email</option>
                  <option value="OTHER">Other Official Record</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">New Requested Value *</label>
                <input
                  type="text"
                  required
                  placeholder={newRequestType === 'BANK_ACCOUNT' ? 'e.g. HDFC Bank - 5010098234123 (IFSC: HDFC0000123)' : 'e.g. Rajesh K. Sharma'}
                  value={newRequestedValue}
                  onChange={(e) => setNewRequestedValue(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Reason / Supporting Note</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this change is requested..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to HR Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: View & Respond to HR Query */}
      {selectedQuery && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl relative text-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>HR Query & Response</span>
              </h3>
              <button onClick={() => setSelectedQuery(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{selectedQuery.employeeName} ({selectedQuery.employeeCode})</span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {selectedQuery.category}
                </span>
              </div>
              <div className="font-bold text-slate-800 text-xs">{selectedQuery.subject}</div>
              <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                {selectedQuery.message}
              </p>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Submitted: {new Date(selectedQuery.createdAt).toLocaleString()}</span>
                <span>Assigned HR: {selectedQuery.assignedHrName || 'HR Desk'}</span>
              </div>
            </div>

            <form onSubmit={handleQueryResponseSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">HR Reply & Resolution Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide resolution or clarification for the employee..."
                  value={queryResponseText}
                  onChange={(e) => setQueryResponseText(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Update Status to</label>
                <select
                  value={queryNewStatus}
                  onChange={(e) => setQueryNewStatus(e.target.value as any)}
                  className="w-full bg-slate-50 text-slate-900 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="RESOLVED">Resolved (Query answered & closed)</option>
                  <option value="IN_PROGRESS">In Progress (Under investigation with finance/payroll)</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedQuery(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRespondingQuery}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition cursor-pointer shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isRespondingQuery ? 'Submitting...' : 'Send Resolution to Employee'}</span>
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

const fallbackDemoRequests: ProfileRequest[] = [
  { id: 1, companyId: 1, employeeId: 1, employeeName: 'Rajesh Kumar', employeeCode: 'EMP-1001', requestType: 'BANK_ACCOUNT', fieldName: 'Bank Account Number', currentValue: 'HDFC - 5010098234123', requestedValue: 'ICICI - 002105009988', reason: 'Salary account changed to ICICI Corporate branch', status: 'PENDING', createdAt: '2026-03-20T10:00:00Z' },
  { id: 2, companyId: 1, employeeId: 3, employeeName: 'Amit Verma', employeeCode: 'EMP-1003', requestType: 'CONTACT_NAME', fieldName: 'Legal Full Name', currentValue: 'Amit Verma', requestedValue: 'Amit K. Verma', reason: 'Passport matching full name update', status: 'APPROVED', reviewerName: 'Priya Sharma (HR)', reviewerNotes: 'Verified with passport copy', createdAt: '2026-03-18T14:30:00Z' }
];

const fallbackDemoQueries: HrQueryItem[] = [
  { id: 1, companyId: 1, employeeId: 1, employeeName: 'Rajesh Kumar', employeeCode: 'EMP-1001', assignedHrName: 'Priya Sharma', assignedHrEmail: 'priya.sharma@priyex.com', category: 'TAX_PF', subject: 'PF UAN passbook transfer from previous employer', message: 'Hello HR, I need assistance transferring my previous EPF balance to my current UAN 101293847561. Please share Annexure K details.', priority: 'NORMAL', status: 'OPEN', createdAt: '2026-03-21T09:15:00Z' },
  { id: 2, companyId: 1, employeeId: 3, employeeName: 'Amit Verma', employeeCode: 'EMP-1003', assignedHrName: 'Priya Sharma', assignedHrEmail: 'priya.sharma@priyex.com', category: 'PAYROLL', subject: 'Tax deduction under Section 80C on latest payslip', message: 'Hi Priya, I submitted my investment proofs for ELSS last week but tax was still deducted in the March payroll run.', priority: 'HIGH', status: 'RESOLVED', hrResponse: 'Hi Amit, verified your ELSS submission. The refund adjustment has been credited into your April salary cycle.', createdAt: '2026-03-19T11:00:00Z' }
];
