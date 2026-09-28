import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { isHrAdmin } from '../../utils/rbac';
import api from '../../api/client';
import {
  Bell,
  Search,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  ChevronDown,
  Mail,
  IdCard,
  CheckCircle2,
  Menu,
  Headphones
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [poolCount, setPoolCount] = useState<number>(0);
  const profileRef = useRef<HTMLDivElement>(null);

  // Poll pool count if user is HR/Admin
  useEffect(() => {
    if (!isHrAdmin(user)) return;

    const checkPool = async () => {
      try {
        const res: any = await api.get('/hr-queries/pool');
        if (res.success && Array.isArray(res.data)) {
          setPoolCount(res.data.length);
        }
      } catch (e) {
        // ignore
      }
    };

    checkPool();
    const interval = setInterval(checkPool, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryRole = user?.roles?.[0] || 'EMPLOYEE';
  const displayName = user?.fullName || user?.displayName || (user?.roles?.includes('SUPER_ADMIN') ? 'Super Admin' : user?.email?.split('@')[0] || 'User');

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs safe-area-top">
      {/* Left Area: Mobile Menu Toggle + Logo / Search */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {/* Hamburger Menu Toggle on Mobile */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer active:scale-95 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand Logo */}
        <div className="lg:hidden flex items-center shrink-0">
          <BrandLogo size="sm" layout="row" />
        </div>

        {/* Search Bar (Visible from medium screens up) */}
        <div className="hidden md:flex items-center gap-3 w-56 lg:w-96">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search directory, requests, records..."
              className="w-full bg-slate-100 text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition text-base sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Company Badge (Hidden on small mobile) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Priyex Software Enterprise</span>
        </div>

        {/* HR Live Pool Alert Badge */}
        {isHrAdmin(user) && (
          <Link
            to="/support-desk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer active:scale-95"
            title="Live HR Support Desk Queue"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Pool</span>
            {poolCount > 0 ? (
              <span className="bg-amber-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full animate-pulse">
                {poolCount}
              </span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </Link>
        )}

        {/* Notifications Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 relative transition cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>

        {/* User Profile Container */}
        <div className="relative pl-1 sm:pl-3 border-l border-slate-200" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 sm:gap-3 p-1 rounded-xl hover:bg-slate-100/80 transition cursor-pointer group"
          >
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[11px] text-emerald-600 flex items-center justify-end gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" />
                {primaryRole}
              </span>
            </div>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/50 transition shrink-0">
              {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180 text-emerald-600' : ''}`} />
          </button>

          {/* Profile Details Dropdown Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 top-12 sm:top-14 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-2xl z-50 p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
              {/* Popover Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white text-base font-extrabold shadow-md shrink-0">
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                    {displayName}
                  </h3>
                  <span className="text-xs text-slate-500 truncate flex items-center gap-1 font-medium mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {user?.email || 'admin@priyex.com'}
                  </span>
                </div>
              </div>

              {/* Role & Access Info */}
              <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl sm:rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> System Role
                  </span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md font-mono text-[11px]">
                    {primaryRole}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-slate-400" /> Account ID
                  </span>
                  <span className="font-mono text-slate-800 font-bold">
                    {user?.id ? `USR-${1000 + Number(user.id)}` : 'EMP-1001'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Session Status
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Active Online
                  </span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-rose-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
