import React from 'react';
import { Building, GitFork, MapPin, Layers, Hash } from 'lucide-react';

export const OrganizationPage: React.FC = () => {
  const departments = [
    { name: 'Engineering & Technology', head: 'Rajesh Kumar', count: 65, costCenter: 'CC-ENG-01' },
    { name: 'Human Resources', head: 'Priya Sharma', count: 12, costCenter: 'CC-HR-01' },
    { name: 'Product Management', head: 'Amit Verma', count: 18, costCenter: 'CC-PRD-01' },
    { name: 'Finance & Accounts', head: 'Siddharth Roy', count: 8, costCenter: 'CC-FIN-01' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header Aligned Across All Modules */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Building className="w-6 h-6 text-emerald-600" />
          <span>Organization Architecture</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-normal">
          Multi-company legal entities, branches, departments, and designations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Priyex Software Enterprise</h2>
              <div className="mt-1">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-bold">
                  CIN: U72900KA2023PTC123456
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-100 font-medium">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong className="text-slate-900 font-semibold">Headquarters:</strong> Outer Ring Road, Bellandur, Bengaluru 560103</span>
            </div>
            <div className="flex items-start gap-2.5">
              <GitFork className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span><strong className="text-slate-900 font-semibold">Active Branches:</strong> Bengaluru, Mumbai, New Delhi, Remote</span>
            </div>
          </div>
        </div>

        {/* Departments List Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>Active Departments</span>
          </h2>
          <div className="space-y-3">
            {departments.map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-sm hover:border-emerald-300 transition-colors">
                <div>
                  <p className="font-bold text-slate-900">{dept.name}</p>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Department Head: <strong className="text-slate-800 font-semibold">{dept.head}</strong>
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs">
                    {dept.count} Members
                  </span>
                  <p className="text-[11px] text-slate-500 font-mono">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                      {dept.costCenter}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
