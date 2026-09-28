import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/client';
import {
  MessageSquare,
  X,
  Send,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronDown,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';

export interface ChatMessage {
  id: number;
  queryId: number;
  senderUserId?: number;
  senderType: 'EMPLOYEE' | 'HR';
  senderName: string;
  messageText: string;
  createdAt: string;
}

export interface ActiveQuery {
  id: number;
  employeeId: number;
  assignedHrId?: number;
  assignedHrName?: string;
  category: string;
  subject: string;
  message: string;
  status: 'WAITING_IN_POOL' | 'ACTIVE' | 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
}

export const LiveChatWidget: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { currentThemeOption } = useTheme();
  const location = useLocation();

  // Flag: hide widget on Support Desk page (checked before render, after all hooks)
  const isSupportDeskPage = location.pathname === '/support-desk';

  const [isOpen, setIsOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState<ActiveQuery | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New query form state
  const [category, setCategory] = useState('PAYROLL');
  const [subject, setSubject] = useState('');
  const [initialQuestion, setInitialQuestion] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const userJustSentRef = useRef(false);
  const prevMessageCountRef = useRef(0);
  const pollIntervalRef = useRef<any>(null);

  // Check if user is scrolled near the bottom (within 100px)
  const isNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return false; // Don't auto-scroll if container not mounted
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  // Check for existing active query on mount and when opening
  const fetchActiveQuery = async () => {
    if (!user) return;
    try {
      const res: any = await api.get('/hr-queries/active');
      if (res.success && res.data) {
        setActiveQuery(res.data);
      } else {
        setActiveQuery(null);
      }
    } catch (e) {
      // Ignore network errors in widget
    }
  };

  // Fetch messages for active query (only update state if messages actually changed)
  const fetchMessages = async (queryId: number) => {
    try {
      const res: any = await api.get(`/hr-queries/${queryId}/messages`);
      if (res.success && Array.isArray(res.data)) {
        setMessages((prev) => {
          const lastPrevId = prev.length > 0 ? prev[prev.length - 1].id : null;
          const lastNewId = res.data.length > 0 ? res.data[res.data.length - 1].id : null;
          if (prev.length === res.data.length && lastPrevId === lastNewId) {
            return prev; // Same reference — no re-render
          }
          return res.data;
        });
      }
    } catch (e) {
      // Ignore poll error
    }
  };

  // Initial check
  useEffect(() => {
    fetchActiveQuery();
  }, [user]);

  // Polling loop when widget is active
  useEffect(() => {
    if (activeQuery && activeQuery.id) {
      fetchMessages(activeQuery.id);

      // Poll messages and query status every 3 seconds
      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes: any = await api.get(`/hr-queries/${activeQuery.id}/messages`);
          if (statusRes.success && Array.isArray(statusRes.data)) {
            setMessages((prev) => {
              const lastPrevId = prev.length > 0 ? prev[prev.length - 1].id : null;
              const lastNewId = statusRes.data.length > 0 ? statusRes.data[statusRes.data.length - 1].id : null;
              if (prev.length === statusRes.data.length && lastPrevId === lastNewId) {
                return prev;
              }
              return statusRes.data;
            });
          }

          // If waiting in pool, check if HR claimed it
          if (activeQuery.status === 'WAITING_IN_POOL' || !activeQuery.assignedHrId) {
            const queryRes: any = await api.get('/hr-queries/active');
            if (queryRes.success && queryRes.data) {
              setActiveQuery(queryRes.data);
            }
          }
        } catch (err) {
          // ignore polling errors
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [activeQuery?.id, activeQuery?.status]);

  useEffect(() => {
    const hasNewMessages = messages.length !== prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (userJustSentRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      userJustSentRef.current = false;
    } else if (hasNewMessages && isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Submit initial query to HR pool
  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialQuestion.trim()) {
      setFormError('Please enter a brief topic and your question.');
      return;
    }

    setFormError(null);
    setIsLoading(true);

    try {
      const res: any = await api.post('/hr-queries', {
        category,
        subject: subject.trim(),
        message: initialQuestion.trim(),
        priority: 'MEDIUM',
      });

      if (res.success && res.data) {
        setActiveQuery(res.data);
        setSubject('');
        setInitialQuestion('');
        fetchMessages(res.data.id);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Failed to submit request to HR. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message in existing thread
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !activeQuery) return;

    const text = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic message append
    const tempMsg: ChatMessage = {
      id: Date.now(),
      queryId: activeQuery.id,
      senderType: 'EMPLOYEE',
      senderName: user?.displayName || user?.fullName || 'You',
      messageText: text,
      createdAt: new Date().toISOString(),
    };
    userJustSentRef.current = true;
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post(`/hr-queries/${activeQuery.id}/messages`, {
        message: text,
      });
      fetchMessages(activeQuery.id);
    } catch (err) {
      // Revert or show notification
    } finally {
      setIsSending(false);
    }
  };

  // End or resolve chat
  const handleResolveChat = async () => {
    if (!activeQuery) return;
    if (!window.confirm('Are you sure you want to mark this support request as resolved?')) return;

    try {
      await api.post(`/hr-queries/${activeQuery.id}/resolve`);
      setActiveQuery(null);
      setMessages([]);
    } catch (err) {
      // ignore
    }
  };

  const categories = [
    { id: 'PAYROLL', label: 'Payroll & Salary' },
    { id: 'LEAVE', label: 'Leave & Attendance' },
    { id: 'PF_UAN', label: 'PF & UAN Transfer' },
    { id: 'TAX', label: 'TDS & Tax Regime' },
    { id: 'GENERAL', label: 'General Policy' },
  ];


  const isConnectedWithHr = activeQuery?.status === 'ACTIVE' && activeQuery.assignedHrName;

  // Don't render the floating widget on the Support Desk page (avoids overlap with reply input)
  if (isSupportDeskPage) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40 select-none">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            fetchActiveQuery();
          }}
          style={{ background: currentThemeOption.primaryColor }}
          className="relative group flex items-center gap-2.5 text-white px-4 sm:px-5 py-3 rounded-full shadow-xl hover:opacity-95 transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <div className="relative">
            <Headphones className="w-5 h-5 transition-transform group-hover:scale-110" />
            {activeQuery && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white animate-pulse"></span>
            )}
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-wide">
            {activeQuery ? (isConnectedWithHr ? 'Live with HR' : 'HR Pool (Waiting)') : t('chat.liveHelpdesk', 'Live HR Helpdesk')}
          </span>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[82vh] bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div
            className="text-white p-4 flex items-center justify-between shadow-sm shrink-0"
            style={{ background: currentThemeOption.gradientStyle }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">{t('chat.liveHelpdesk', 'Live HR Helpdesk')}</h3>
                  <span className="text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                    {t('chat.online', 'Online')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
                  {activeQuery ? (
                    isConnectedWithHr ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-emerald-300 truncate max-w-[170px]">
                          {activeQuery.assignedHrName}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        <span className="text-amber-200">{t('chat.waitingInPool', 'Waiting in Available Pool...')}</span>
                      </>
                    )
                  ) : (
                    <span>Instant Employee Assistance</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Minimize chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/60 overflow-hidden">
            {!activeQuery ? (
              /* State A: Start New Live Query */
              <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-950">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>{t('chat.startSupportChat', 'Live HR Support Queue')}</span>
                  </div>
                  {t('chat.describeQuery', 'Ask any question about your payroll, leaves, tax regimes, or PF. Your request will enter the queue and connect directly to an available HR specialist.')}
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleStartChat} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {t('chat.category', 'Select Topic Category')}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`text-left text-xs py-2 px-2.5 rounded-xl border font-medium transition cursor-pointer ${
                            category === cat.id
                              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Brief Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., Question about my September payslip deduction"
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Describe your query
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={initialQuestion}
                      onChange={(e) => setInitialQuestion(e.target.value)}
                      placeholder="Type details so the HR representative can assist you..."
                      className="w-full bg-white text-slate-900 rounded-xl px-3 py-2 text-xs border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{ background: currentThemeOption.primaryColor }}
                    className="w-full mt-2 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 hover:opacity-90"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Connecting to HR Pool...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{t('chat.startSession', 'Send Request to Available HR')}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* State B & C: Waiting in Pool or Active Live Chat */
              <div className="flex-1 flex flex-col min-h-0">
                {/* Active Session Info Bar */}
                <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between text-xs shrink-0">
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-900 truncate">
                      {activeQuery.subject}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <span>#{activeQuery.id}</span>
                      <span>•</span>
                      <span className="uppercase text-brand-700 font-semibold">{activeQuery.category}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResolveChat}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer border border-slate-200 hover:bg-slate-100 text-slate-800"
                  >
                    {t('chat.resolveClose', 'Resolve & Close')}
                  </button>
                </div>

                {/* Waiting Beacon Notice if in pool */}
                {!isConnectedWithHr && (
                  <div className="m-3 p-3 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 shrink-0">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                    <div>
                      <p className="font-bold text-amber-950">{t('chat.waitingForHr', 'Waiting for HR Specialist...')}</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {t('chat.queueNotice', 'Your query has entered the live support queue. An active HR admin will pick up your chat in a few moments.')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages Feed */}
                <div ref={messagesContainerRef} className="flex-1 p-3.5 overflow-y-auto space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.senderType === 'EMPLOYEE';
                    const displaySender = msg.senderName === 'Employee' ? t('chat.employee', 'Employee') : msg.senderName;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1">
                          {!isMe && <ShieldCheck className="w-3 h-3 text-brand-600" />}
                          <span>{displaySender}</span>
                          <span>•</span>
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </span>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            isMe
                              ? 'text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                          style={isMe ? { background: currentThemeOption.primaryColor } : {}}
                        >
                          {msg.messageText}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={
                      isConnectedWithHr
                        ? t('chat.typeMessage', 'Type a reply to HR specialist...')
                        : t('chat.addDetailsPlaceholder', 'Add more details while waiting...')
                    }
                    className="flex-1 bg-slate-100 text-slate-900 text-xs rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:bg-white focus:border-brand-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    style={{ background: currentThemeOption.primaryColor }}
                    className="p-2.5 rounded-xl text-white shadow-xs transition disabled:opacity-50 cursor-pointer hover:opacity-90"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
