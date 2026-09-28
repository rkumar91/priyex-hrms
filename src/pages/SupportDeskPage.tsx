import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  Headphones,
  Clock,
  CheckCircle2,
  Users,
  Search,
  MessageSquare,
  Send,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Inbox,
  AlertCircle,
  FileCheck,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface PoolQuery {
  id: number;
  companyId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  category: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  createdAt: string;
}

interface MessageItem {
  id: number;
  queryId: number;
  senderUserId?: number;
  senderType: 'EMPLOYEE' | 'HR';
  senderName: string;
  messageText: string;
  createdAt: string;
}

export const SupportDeskPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pool' | 'active' | 'history'>('pool');

  // Pool state
  const [poolQueries, setPoolQueries] = useState<PoolQuery[]>([]);
  const [isPoolLoading, setIsPoolLoading] = useState(false);

  // Active chats state
  const [myChats, setMyChats] = useState<PoolQuery[]>([]);
  const [selectedChat, setSelectedChat] = useState<PoolQuery | null>(null);
  const [chatMessages, setChatMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // History state
  const [historyQueries, setHistoryQueries] = useState<PoolQuery[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch pool queries
  const fetchPool = async () => {
    try {
      setIsPoolLoading(true);
      const res: any = await api.get('/hr-queries/pool');
      if (res.success && Array.isArray(res.data)) {
        setPoolQueries(res.data);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsPoolLoading(false);
    }
  };

  // Fetch my active assigned chats
  const fetchMyChats = async () => {
    try {
      const res: any = await api.get('/hr-queries', {
        params: { status: 'ACTIVE', assignedHrId: user?.id },
      });
      if (res.success && Array.isArray(res.data)) {
        setMyChats(res.data);
        if (res.data.length > 0 && !selectedChat) {
          setSelectedChat(res.data[0]);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Fetch history resolved queries
  const fetchHistory = async () => {
    try {
      const res: any = await api.get('/hr-queries', {
        params: { status: 'RESOLVED' },
      });
      if (res.success && Array.isArray(res.data)) {
        setHistoryQueries(res.data);
      }
    } catch (e) {
      // ignore
    }
  };

  // Fetch messages for selected active chat
  const fetchSelectedMessages = async (queryId: number) => {
    try {
      const res: any = await api.get(`/hr-queries/${queryId}/messages`);
      if (res.success && Array.isArray(res.data)) {
        setChatMessages(res.data);
      }
    } catch (e) {
      // ignore
    }
  };

  // Initial load & periodic polling
  useEffect(() => {
    fetchPool();
    fetchMyChats();
    fetchHistory();

    const interval = setInterval(() => {
      fetchPool();
      if (activeTab === 'active' && selectedChat) {
        fetchSelectedMessages(selectedChat.id);
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [activeTab, selectedChat?.id]);

  useEffect(() => {
    if (selectedChat) {
      fetchSelectedMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Claim query from pool
  const handleClaimQuery = async (query: PoolQuery) => {
    try {
      const res: any = await api.post(`/hr-queries/${query.id}/claim`);
      if (res.success && res.data) {
        await fetchPool();
        await fetchMyChats();
        setSelectedChat(res.data);
        setActiveTab('active');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to claim query');
    }
  };

  // Send reply from HR
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedChat) return;

    const text = replyText.trim();
    setReplyText('');
    setIsSending(true);

    const tempMsg: MessageItem = {
      id: Date.now(),
      queryId: selectedChat.id,
      senderType: 'HR',
      senderName: user?.displayName || user?.fullName || 'HR Specialist',
      messageText: text,
      createdAt: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);

    try {
      await api.post(`/hr-queries/${selectedChat.id}/messages`, {
        message: text,
      });
      fetchSelectedMessages(selectedChat.id);
    } catch (err) {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  // Resolve chat
  const handleResolveChat = async () => {
    if (!selectedChat) return;
    if (!window.confirm(`Mark query #${selectedChat.id} as Resolved?`)) return;

    try {
      await api.post(`/hr-queries/${selectedChat.id}/resolve`);
      setSelectedChat(null);
      await fetchMyChats();
      await fetchHistory();
    } catch (err: any) {
      alert(err?.message || 'Failed to resolve query');
    }
  };

  // Quick responses
  const quickTemplates = [
    'I have verified your records. This has been updated in the portal.',
    'Checking the status with our finance/payroll department right now.',
    'Could you please share your UAN or employee proof document?',
    'This policy query has been approved as per enterprise guidelines.',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live HR Support Desk & Helpdesk Pool
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time incoming employee questions, ticket claim queue, and live chat assistance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              fetchPool();
              fetchMyChats();
              fetchHistory();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pool')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'pool'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Live Available Pool</span>
          {poolQueries.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
              activeTab === 'pool' ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {poolQueries.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Active Chats</span>
          {myChats.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
              activeTab === 'active' ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-800'
            }`}>
              {myChats.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Resolved Transcripts</span>
        </button>
      </div>

      {/* Tab 1: Live Pool (Unassigned Questions) */}
      {activeTab === 'pool' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing {poolQueries.length} unassigned employee request{poolQueries.length !== 1 ? 's' : ''} in pool
            </span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Pool Listening
            </span>
          </div>

          {poolQueries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">HR Support Pool is All Clear</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are currently no unanswered employee queries waiting in the queue. New questions will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poolQueries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-[10px] tracking-wide uppercase border border-emerald-200">
                        {item.category}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                        {item.subject}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{item.message}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
                      <span className="font-bold text-slate-900">{item.employeeName}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-slate-400">{item.employeeCode}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleClaimQuery(item)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Claim & Start Live Chat</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Active Chats Split Screen */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[620px]">
          {/* Left: Chat List */}
          <div className="w-full md:w-80 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
            <div className="p-3.5 border-b border-slate-200 bg-white">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assigned to You ({myChats.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {myChats.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  You have no active chats right now. Pick one from the Live Pool tab.
                </div>
              ) : (
                myChats.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedChat(c)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1 cursor-pointer ${
                      selectedChat?.id === c.id
                        ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {c.employeeName}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-mono font-semibold">
                        #{c.id}
                      </span>
                    </div>
                    <span className="text-xs text-slate-600 truncate">
                      {c.subject}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {c.category}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Live Chat Window */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {selectedChat ? (
              <>
                {/* Chat Top Banner */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {selectedChat.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {selectedChat.employeeName} ({selectedChat.employeeCode})
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="font-semibold text-emerald-700">{selectedChat.category}</span>
                        <span>•</span>
                        <span className="truncate max-w-xs">{selectedChat.subject}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResolveChat}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                  {chatMessages.map((m) => {
                    const isHr = m.senderType === 'HR';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isHr ? 'items-end' : 'items-start'}`}
                      >
                        <span className="text-[10px] text-slate-400 mb-1 px-1">
                          {m.senderName} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                            isHr
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                          }`}
                        >
                          {m.messageText}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Templates */}
                <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    Quick Reply:
                  </span>
                  {quickTemplates.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyText(tmpl)}
                      className="text-[11px] whitespace-nowrap bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 rounded-lg px-2.5 py-1 transition cursor-pointer"
                    >
                      {tmpl.substring(0, 32)}...
                    </button>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response to the employee..."
                    className="flex-1 bg-slate-100 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !replyText.trim()}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Select a conversation</p>
                <p className="text-xs">Pick an active chat on the left to start responding.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: History & Past Transcripts */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Resolved Support Transcripts</h3>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search subject or employee..."
                className="w-full bg-slate-50 text-slate-900 text-xs rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {historyQueries
              .filter(
                (q) =>
                  !historySearch ||
                  q.subject.toLowerCase().includes(historySearch.toLowerCase()) ||
                  q.employeeName.toLowerCase().includes(historySearch.toLowerCase())
              )
              .map((q) => (
                <div key={q.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {q.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{q.subject}</h4>
                    </div>
                    <p className="text-xs text-slate-500">
                      Requested by <strong className="text-slate-800">{q.employeeName}</strong> ({q.employeeCode})
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                      "{q.message}"
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    <span className="text-emerald-700 font-bold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                    <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
