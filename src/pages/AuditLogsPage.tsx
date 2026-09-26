import React from 'react';
import { ShieldAlert, Filter, Hash, User, Globe, Calendar } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const auditEntries = [
    { id: 1, action: 'USER_LOGIN_SUCCESS', user: 'superadmin@priyex.com', ip: '127.0.0.1', correlationId: 'c8f7a9d0-1234-4a5b-89ef-0123456789ab', timestamp: '2026-09-26 14:50:12' },
    { id: 2, action: 'EMPLOYEE_SALARY_UPDATE', user: 'superadmin@priyex.com', ip: '127.0.0.1', correlationId: 'd9e8f7a6-5432-10fe-dcba-9876543210fe', timestamp: '2026-09-26 14:45:05' },
    { id: 3, action: 'ROLE_PERMISSION_GRANT', user: 'superadmin@priyex.com', ip: '127.0.0.1', correlationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', timestamp: '2026-09-26 14:30:00' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-emerald-600" />
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-normal">
            Traceability log with correlation IDs for security compliance and SOC 2 audits
          </p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter by Event</span>
        </button>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="py-3.5 px-5 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp</th>
                <th className="py-3.5 px-5">Action Type</th>
                <th className="py-3.5 px-5"><User className="w-3.5 h-3.5 text-slate-400 inline mr-1" /> Initiated By</th>
                <th className="py-3.5 px-5"><Globe className="w-3.5 h-3.5 text-slate-400 inline mr-1" /> IP Address</th>
                <th className="py-3.5 px-5"><Hash className="w-3.5 h-3.5 text-slate-400 inline mr-1" /> Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {auditEntries.map((log) => (
                <tr key={log.id} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-600 font-medium">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-emerald-700">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold tracking-wide">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-slate-800">
                    {log.user}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                    {log.ip}
                  </td>
                  <td className="py-3.5 px-5">
                    <code className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-mono text-slate-600 select-all">
                      {log.correlationId}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
