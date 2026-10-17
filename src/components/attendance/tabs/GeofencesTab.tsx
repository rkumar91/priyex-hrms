import React from 'react';
import { Building2 } from 'lucide-react';
import { OfficeGeofence } from '../../../types/attendance';

interface GeofencesTabProps {
  geofences: OfficeGeofence[];
}

export const GeofencesTab: React.FC<GeofencesTabProps> = ({ geofences }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Authorized Office Branch Geofences</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            When employees clock in from their mobile or laptop browser, the system calculates their distance to these registered geofences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {geofences.map((fence) => (
            <div key={fence.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs truncate">{fence.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">Active</span>
              </div>
              <div className="text-xs text-slate-500 font-mono space-y-1">
                <div>City: <span className="text-slate-800 font-semibold">{fence.city}</span></div>
                <div>Lat/Lng: <span className="text-slate-800">{fence.latitude.toFixed(4)}, {fence.longitude.toFixed(4)}</span></div>
                <div>Fence Radius: <span className="text-blue-700 font-bold">{fence.radiusMeters} meters</span></div>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                <span>Enforcement: Strict</span>
                <span className="text-emerald-700 font-semibold">100% Monitored</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
