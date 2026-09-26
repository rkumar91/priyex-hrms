import React from 'react';
import { Building, GitFork, MapPin, Layers } from 'lucide-react';

export const OrganizationPage: React.FC = () => {
  const departments = [
    { name: 'Engineering & Technology', head: 'Rajesh Kumar', count: 65, costCenter: 'CC-ENG-01' },
    { name: 'Human Resources', head: 'Priya Sharma', count: 12, costCenter: 'CC-HR-01' },
    { name: 'Product Management', head: 'Amit Verma', count: 18, costCenter: 'CC-PRD-01' },
    { name: 'Finance & Accounts', head: 'Siddharth Roy', count: 8, costCenter: 'CC-FIN-01' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Building className="w-6 h-6 text-emerald-600" />
          <span>Organization Architecture</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Multi-company legal entities, branches, departments, and designations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Priyex Software Enterprise</h2>
              <span className="text-xs text-emerald-700 font-mono font-bold">CIN: U72900KA2023PTC123456</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Headquarters: Outer Ring Road, Bellandur, Bengaluru 560103</div>
            <div className="flex items-center gap-2"><GitFork className="w-4 h-4 text-slate-400" /> Active Branches: Bengaluru, Mumbai, New Delhi</div>
          </div>
        </div>

        {/* Departments List */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <span>Active Departments</span>
          </h2>
          <div className="space-y-3">
            {departments.map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{dept.name}</p>
                  <p className="text-slate-500 font-medium">Head: <span className="text-slate-800 font-semibold">{dept.head}</span></p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">{dept.count} Members</span>
                  <p className="text-[10px] text-slate-400 font-mono font-medium mt-1">{dept.costCenter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
