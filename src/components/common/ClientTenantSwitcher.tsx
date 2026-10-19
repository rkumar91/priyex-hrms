import React, { useState, useEffect, useRef } from 'react';
import { Building2, ChevronDown, Check, Shield } from 'lucide-react';
import api from '../../api/client';
import { CompanyClient } from '../../types/tenant';

const fallbackClients: CompanyClient[] = [
  { id: 1, code: 'PRIYEX', legalName: 'Priyex Technologies Pvt Ltd', brandName: 'Priyex', industry: 'Information Technology', city: 'Greater Noida', state: 'Uttar Pradesh', country: 'India', isActive: true },
  { id: 2, code: 'TCS', legalName: 'Tata Consultancy Services Ltd', brandName: 'TCS', industry: 'IT Services & Consulting', city: 'Mumbai', state: 'Maharashtra', country: 'India', isActive: true },
  { id: 3, code: 'WIPRO', legalName: 'Wipro Limited', brandName: 'Wipro', industry: 'Technology Consulting', city: 'Bengaluru', state: 'Karnataka', country: 'India', isActive: true },
  { id: 4, code: 'INFOSYS', legalName: 'Infosys Limited', brandName: 'Infosys', industry: 'Digital Services & Consulting', city: 'Bengaluru', state: 'Karnataka', country: 'India', isActive: true },
];

export const ClientTenantSwitcher: React.FC = () => {
  const [clients, setClients] = useState<CompanyClient[]>(fallbackClients);
  const [activeCompanyId, setActiveCompanyId] = useState<number>(() => {
    const saved = localStorage.getItem('priyex_active_company_id');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/tenant/clients')
      .then((res: any) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setClients(res.data);
        }
      })
      .catch(() => {
        // use fallback clients
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectClient = (client: CompanyClient) => {
    setActiveCompanyId(client.id);
    localStorage.setItem('priyex_active_company_id', String(client.id));
    localStorage.setItem('priyex_active_company_code', client.code);
    setIsOpen(false);

    // Dispatch global custom event so pages automatically refresh their data
    window.dispatchEvent(new CustomEvent('tenant-changed', { detail: { companyId: client.id, code: client.code } }));
  };

  const currentClient = clients.find(c => c.id === activeCompanyId) || clients[0] || fallbackClients[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs"
        title="Switch Enterprise Client Tenant Workspace"
      >
        <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
          {currentClient.code?.[0] || 'C'}
        </div>
        <div className="hidden xl:flex flex-col text-left leading-tight">
          <span className="font-bold truncate max-w-[140px] text-slate-900">{currentClient.brandName || currentClient.legalName}</span>
          <span className="text-[10px] text-slate-400 font-mono">Workspace #{currentClient.id}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 mb-1 flex items-center justify-between">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Enterprise Client Workspaces</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Multi-Tenant</span>
          </div>

          <div className="space-y-1">
            {clients.map(client => {
              const isSelected = client.id === activeCompanyId;
              return (
                <button
                  key={client.id}
                  onClick={() => handleSelectClient(client)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl transition cursor-pointer text-left ${
                    isSelected ? 'bg-blue-50/80 border border-blue-200 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {client.code?.[0] || 'C'}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="truncate text-xs">{client.legalName}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{client.city}, {client.state} &bull; {client.code}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 px-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-600" /> Isolated Policies
            </span>
            <span>Client Row-Level Security</span>
          </div>
        </div>
      )}
    </div>
  );
};
