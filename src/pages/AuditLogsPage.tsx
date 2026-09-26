import React from 'react';
import { ShieldAlert, Filter } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const auditEntries = [
    { id: 1, action: 'USER_LOGIN_SUCCESS', user: 'superadmin@priyex.com', ip: '127.0.0.1', correlationId: 'c8f7a9d0-1234-4a5b-89ef-0123456789ab', timestamp: '2026-09-26 14:50:12' },
    { id: 2, action: 'EMPLOYEE_SALARY_UPDATE', user: 'superadmin@priyex.com', ip: '127.0.0.1', correlationId: 'd9e8f7a6-5432-10fe-dcba-9876543210fe', timestamp: '2026-09-26 14:45:05' },
    { id: 3, action: 'ROLE_PERMISSION_GRANT', user: 'superadmin@priyex.com', ip: '127.0.0.1', correlationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', timestamp: '2026-09-26 14:30:00' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-600" />
            <span>Immutable Audit Trail</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">Traceability log with correlation IDs for security compliance and SOC 2 audits</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-200 transition flex items-center gap-2 cursor-pointer">
          <Filter className="w-3.5 h-3.5" /> Filter by Event
        </button>
      </div>

      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-700">
            <thead className="bg-slate-100 uppercase text-slate-500 font-sans font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Initiated By</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Correlation ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditEntries.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{log.timestamp}</td>
                  <td className="px-4 py-3 font-bold text-emerald-700">{log.action}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{log.user}</td>
                  <td className="px-4 py-3 text-slate-500">{log.ip}</td>
                  <td className="px-4 py-3 text-slate-400">{log.correlationId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
