import React from 'react';
import { Clock, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export interface UserCoords {
  lat: number;
  lng: number;
  accuracy: number;
  distanceMeters: number;
  insideFence: boolean;
}

export interface PunchLogItem {
  time: string;
  type: string;
  geoStatus: string;
  location: string;
}

interface AttendanceTabProps {
  isClockedIn: boolean;
  clockInTime: string;
  clockElapsedSeconds: number;
  formatElapsedTime: (sec: number) => string;
  handleToggleClock: () => void;
  userCoords: UserCoords;
  punchLog: PunchLogItem[];
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  isClockedIn,
  clockInTime,
  clockElapsedSeconds,
  formatElapsedTime,
  handleToggleClock,
  userCoords,
  punchLog,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Live Geo-Fence Radar & Clock Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clock-In Interactive Terminal */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-7 border border-slate-200/90 bg-white/95 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Biometric Attendance Terminal</span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Shift Duty Status</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                isClockedIn ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span>{isClockedIn ? 'Active On Shift' : 'Shift Not Started'}</span>
              </span>
            </div>
          </div>

          {/* Real-time Clock Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium">Clock In Time</span>
              <div className="text-xl font-extrabold text-slate-900 mt-1 font-mono">{isClockedIn ? clockInTime : '--:--'}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Shift: 09:30 AM - 06:30 PM</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium">Shift Duration Elapsed</span>
              <div className="text-xl font-extrabold text-blue-700 mt-1 font-mono">{isClockedIn ? formatElapsedTime(clockElapsedSeconds) : '00h 00m 00s'}</div>
              <span className="text-[11px] text-slate-500 font-medium">Required: 08h 00m standard</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-xs text-slate-500 font-medium">Overtime (OT) Accrued</span>
              <div className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
                {clockElapsedSeconds > 28800 ? formatElapsedTime(clockElapsedSeconds - 28800) : '00h 00m 00s'}
              </div>
              <span className="text-[11px] text-amber-600 font-semibold">
                {clockElapsedSeconds > 28800 ? 'Eligible for 1.5x OT' : 'Threshold: > 8 hrs'}
              </span>
            </div>
          </div>

          {/* Punch Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 space-y-0.5">
              <p className="flex items-center gap-1 font-medium text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hardware Biometric & GPS Tamper Protection Enabled</span>
              </p>
              <p>IP: 103.212.89.14 • Device Fingerprint: Verified Chrome Browser</p>
            </div>

            <button
              type="button"
              onClick={handleToggleClock}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 ${
                isClockedIn
                  ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isClockedIn ? 'Clock Out of Shift' : 'Punch In / Clock In Now'}</span>
            </button>
          </div>
        </div>

        {/* Live GPS Geo-Fencing Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/90 bg-white/95 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Geo-Fencing Radar</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">GPS Live</span>
            </div>

            {/* Radar Visual Status */}
            <div className={`p-4 rounded-2xl border ${
              userCoords.insideFence ? 'bg-emerald-50/80 border-emerald-200' : 'bg-amber-50/80 border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${userCoords.insideFence ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-xs font-extrabold uppercase tracking-wide ${userCoords.insideFence ? 'text-emerald-900' : 'text-amber-900'}`}>
                    {userCoords.insideFence ? 'Inside Registered Office Perimeter' : 'Outside Office Geo-Fence'}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Distance from HQ: <strong>{userCoords.distanceMeters}m</strong> (Allowed fence: <strong>250m</strong>).
                  </p>
                </div>
              </div>
            </div>

            {/* Location Telemetry */}
            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Office Branch:</span>
                <span className="font-semibold text-slate-800">Greater Noida HQ</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Device Latitude:</span>
                <span className="text-slate-700">{userCoords.lat.toFixed(5)}° N</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Device Longitude:</span>
                <span className="text-slate-700">{userCoords.lng.toFixed(5)}° E</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">GPS Precision:</span>
                <span className="text-emerald-700 font-bold">±{userCoords.accuracy} meters</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Policy: Geo-tag required on punch</span>
            <span className="font-bold text-emerald-700">Compliance 100%</span>
          </div>
        </div>
      </div>

      {/* Today's Punch Audit Log */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>Today's Verified Biometric Punch Trail</span>
        </h3>

        <div className="space-y-2.5">
          {punchLog.map((log, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-800">{log.time}</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                  log.type === 'CLOCK_IN' ? 'bg-emerald-100 text-emerald-800' :
                  log.type === 'CLOCK_OUT' ? 'bg-rose-100 text-rose-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {log.type}
                </span>
                <span className="text-slate-600">{log.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{log.geoStatus}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
