import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, User, LogOut, ShieldCheck, Building2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, departments, policies..."
            className="w-full bg-slate-950/80 text-sm text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Company Badge */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Priyex Software Enterprise</span>
        </div>

        {/* Notifications Button */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 relative transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-slate-100">{user?.fullName || 'Super Admin'}</span>
            <span className="text-xs text-emerald-400 flex items-center justify-end gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              {user?.roles?.[0] || 'SUPER_ADMIN'}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-emerald-500/20">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
