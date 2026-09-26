import React from 'react';
import { Building, GitFork, MapPin, Layers, Award } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-indigo-400" />
          <span>Organization Architecture</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">Multi-company legal entities, branches, departments, and designations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Priyex Software Enterprise</h2>
              <span className="text-xs text-indigo-300 font-mono">CIN: U72900KA2023PTC123456</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500" /> Headquarters: Outer Ring Road, Bellandur, Bengaluru 560103</div>
            <div className="flex items-center gap-2"><GitFork className="w-4 h-4 text-slate-500" /> Active Branches: Bengaluru, Mumbai, New Delhi</div>
          </div>
        </div>

        {/* Departments List */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Active Departments</span>
          </h2>
          <div className="space-y-3">
            {departments.map((dept, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <p className="font-semibold text-slate-100">{dept.name}</p>
                  <p className="text-slate-400">Head: <span className="text-slate-200">{dept.head}</span></p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">{dept.count} Members</span>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">{dept.costCenter}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
