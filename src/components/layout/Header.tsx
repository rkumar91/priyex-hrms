import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageDropdown } from '../common/LanguageDropdown';
import { BrandLogo } from '../common/BrandLogo';
import { isHrAdmin } from '../../utils/rbac';
import api from '../../api/client';
import {
  Bell,
  Search,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Mail,
  Menu,
  Headphones,
  Fingerprint,
  Sparkles,
  Zap,
  Crown,
  UserCircle,
  Command
} from 'lucide-react';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { AnnouncementItem } from '../notifications/BroadcastBanner';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
  onAnnouncementsChange?: (items: AnnouncementItem[]) => void;
}

// Helper to get role display config
const getRoleConfig = (role: string) => {
  const r = role.toUpperCase();
  if (r.includes('SUPER_ADMIN')) return { label: 'Super Admin', icon: Crown, gradient: 'from-amber-500 to-orange-500', bg: 'bg-gradient-to-r from-amber-50 to-orange-50', border: 'border-amber-200/60', text: 'text-amber-700' };
  if (r.includes('ADMIN')) return { label: 'Admin', icon: ShieldCheck, gradient: 'from-violet-500 to-purple-600', bg: 'bg-gradient-to-r from-violet-50 to-purple-50', border: 'border-violet-200/60', text: 'text-violet-700' };
  if (r.includes('HR')) return { label: 'HR Manager', icon: Sparkles, gradient: 'from-blue-500 to-indigo-500', bg: 'bg-gradient-to-r from-blue-50 to-indigo-50', border: 'border-blue-200/60', text: 'text-blue-700' };
  if (r.includes('MANAGER')) return { label: 'Manager', icon: Zap, gradient: 'from-teal-500 to-emerald-500', bg: 'bg-gradient-to-r from-teal-50 to-emerald-50', border: 'border-teal-200/60', text: 'text-teal-700' };
  return { label: 'Employee', icon: UserCircle, gradient: 'from-brand-500 to-emerald-500', bg: 'bg-gradient-to-r from-brand-50 to-emerald-50', border: 'border-brand-200/60', text: 'text-brand-700' };
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onAnnouncementsChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [poolCount, setPoolCount] = useState<number>(0);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const getPageTitle = (pathname: string) => {
    if (pathname === '/') return t('nav.dashboard', 'Dashboard');
    if (pathname.startsWith('/employees')) return t('nav.employees', 'Employees');
    if (pathname.startsWith('/attendance')) return t('nav.attendance', 'Attendance & Leave');
    if (pathname.startsWith('/payroll')) return t('nav.payroll', 'Payroll & Compensation');
    if (pathname.startsWith('/requests')) return t('nav.requests', 'Requests & Approvals');
    if (pathname.startsWith('/support-desk')) return t('nav.supportDesk', 'Support Desk');
    if (pathname.startsWith('/organization')) return t('nav.organization', 'Organization');
    if (pathname.startsWith('/admin/users')) return t('nav.usersRoles', 'Users & Roles');
    if (pathname.startsWith('/audit-logs')) return t('nav.auditLogs', 'Audit & Compliance');
    return t('nav.workspace', 'Workspace');
  };
  const pageTitle = getPageTitle(location.pathname);

  // Sync profile photo on initial load
  useEffect(() => {
    if (user && !user.photoUrl) {
      api.get('/employees/me')
        .then((res: any) => {
          if (res.success && res.data?.photoUrl) {
            updateUser({ photoUrl: res.data.photoUrl });
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

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

  // ⌘K / Ctrl+K focuses the search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const primaryRole = user?.roles?.[0] || 'EMPLOYEE';
  const displayName = user?.fullName || user?.displayName || (user?.roles?.includes('SUPER_ADMIN') ? 'Super Admin' : user?.email?.split('@')[0] || 'User');
  const roleConfig = getRoleConfig(primaryRole);
  const RoleIcon = roleConfig.icon;

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 safe-area-top shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
      <div className="h-full flex items-center px-3 sm:px-5 gap-3">

        {/* ── LEFT: Mobile Hamburger + Logo / Desktop Breadcrumb Context (No duplicate logo on desktop!) ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile view: Hamburger toggle + Logo (since desktop sidebar is hidden on mobile) */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open Navigation Menu"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer active:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo size="sm" layout="row" />
          </div>

          {/* Desktop view: Clean Section Breadcrumb (Sidebar already features the logo) */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400 font-medium">HRMS</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-bold">{pageTitle}</span>
          </div>
        </div>

        {/* ── CENTER: Command-bar Search (dominant, centered) ── */}
        <div className="flex-1 flex justify-center px-2 sm:px-6">
          <div className="relative w-full max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              placeholder={t('header.searchPlaceholder', 'Search employees, requests, payroll...')}
              className="w-full bg-slate-50 hover:bg-white text-sm text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-20 py-2.5 border border-slate-200 hover:border-slate-300 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-200"
            />
            {/* ⌘K shortcut hint */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
              <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-400 text-[10px] font-mono font-semibold leading-none">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Controls ── */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

          {/* Language Dropdown */}
          <LanguageDropdown />

          {/* HR Live Pool Alert Badge */}
          {isHrAdmin(user) && (
            <Link
              to="/support-desk"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
              title="Live HR Support Desk Queue"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="hidden sm:inline">{t('header.supportPool', 'Pool')}</span>
              {poolCount > 0 ? (
                <span className="bg-amber-600 text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full animate-pulse min-w-[18px] text-center">
                  {poolCount}
                </span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              )}
            </Link>
          )}

          {/* Notifications Center */}
          <NotificationCenter onAnnouncementsChange={onAnnouncementsChange} />

          {/* ─── User Profile Cluster ─── */}
          <div className="relative pl-1.5 sm:pl-2 border-l border-slate-200/70" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 sm:gap-2.5 px-2 py-1.5 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
            >
              {/* Name & Role */}
              <div className="hidden sm:flex flex-col text-right gap-0.5">
                <span className="text-[13px] font-bold text-slate-800 group-hover:text-slate-950 transition-colors truncate max-w-[130px] leading-tight">
                  {displayName}
                </span>
                <span className={`inline-flex items-center justify-end gap-1 text-[9px] font-extrabold tracking-widest uppercase ${roleConfig.text} ${roleConfig.bg} self-end px-1.5 py-0.5 rounded-md border ${roleConfig.border} leading-tight`}>
                  <RoleIcon className="w-2.5 h-2.5" strokeWidth={3} />
                  {roleConfig.label}
                </span>
              </div>

              {/* Avatar with gradient ring */}
              <div className="relative shrink-0">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleConfig.gradient} p-[2px] shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-[1.05]`}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user?.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={displayName || 'Avatar'}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className={`font-extrabold text-sm bg-gradient-to-br ${roleConfig.gradient} bg-clip-text text-transparent`}>
                        {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-500" />}
                      </span>
                    )}
                  </div>
                </div>
                {/* Online status dot */}
                <span className="absolute -bottom-px -right-px flex h-3 w-3">
                  <span className="profile-status-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white" />
                </span>
              </div>

              {/* Chevron */}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-all duration-300 group-hover:text-slate-600 ${isProfileOpen ? 'rotate-180 text-brand-600' : ''}`} />
            </button>

            {/* ─── Profile Dropdown Popover ─── */}
            {isProfileOpen && (
              <div className="absolute right-0 top-14 sm:top-[3.75rem] w-[calc(100vw-1.5rem)] max-w-[280px] sm:w-[280px] bg-white border border-slate-200/60 rounded-2xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)] z-50 overflow-hidden profile-dropdown-enter text-slate-900">

                {/* Gradient Banner */}
                <div className={`relative bg-gradient-to-br ${roleConfig.gradient} px-4 pt-4 pb-3.5 overflow-hidden`}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />
                  <div className="absolute -bottom-4 -left-3 w-16 h-16 rounded-full bg-white/10 blur-xl" />

                  <div className="relative flex flex-col items-center text-center">
                    {user?.photoUrl ? (
                      <div className="w-10 h-10 rounded-full ring-2 ring-white/70 shadow-md mb-2 overflow-hidden bg-white/20">
                        <img
                          src={user.photoUrl}
                          alt={displayName || 'Avatar'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white text-sm font-black shadow-md mb-2">
                        {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <h3 className="text-sm font-extrabold text-white leading-tight">{displayName}</h3>
                    <span className="text-[10px] text-white/70 mt-0.5 flex items-center gap-1 font-medium">
                      <Mail className="w-2.5 h-2.5 text-white/50" />
                      {user?.email || 'admin@priyex.com'}
                    </span>
                    <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md">
                      <RoleIcon className="w-3 h-3 text-white/90" strokeWidth={2.5} />
                      <span className="text-[9px] font-bold text-white tracking-wider uppercase">
                        {roleConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="px-3 pt-2.5 pb-1.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-600 font-semibold flex items-center gap-2 text-[11px]">
                        <div className="w-6 h-6 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3 h-3 text-brand-600" />
                        </div>
                        System Role
                      </span>
                      <span className="font-extrabold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-mono text-[10px]">
                        {primaryRole}
                      </span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-600 font-semibold flex items-center gap-2 text-[11px]">
                        <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Fingerprint className="w-3 h-3 text-orange-500" />
                        </div>
                        Account ID
                      </span>
                      <span className="font-mono text-slate-700 font-bold text-[10px]">
                        {user?.id ? `USR-${1000 + Number(user.id)}` : 'EMP-1001'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="mx-3 h-px bg-slate-100" />

                {/* Footer Actions */}
                <div className="px-3 pt-2 pb-3 space-y-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/employees?profile=me');
                    }}
                    className="w-full py-2 px-3 rounded-lg hover:bg-brand-50 text-brand-600 text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-transparent hover:border-brand-100"
                  >
                    <User className="w-3 h-3" />
                    <span>View Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200/80 hover:border-rose-200 group/btn"
                  >
                    <LogOut className="w-3 h-3 transition-transform group-hover/btn:-translate-x-0.5" />
                    <span>{t('header.signOut', 'Sign Out')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
