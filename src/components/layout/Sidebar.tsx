import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { canViewAuditLogs, canManageOrganization, canManageUserRoles, isHrAdmin } from '../../utils/rbac';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CircleDollarSign,
  Building,
  ShieldAlert,
  ClipboardCheck,
  UserCog,
  Headphones,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname]);

  const navigationItems = [
    { name: t('nav.dashboard', 'Dashboard'), path: '/', icon: LayoutDashboard, show: true },
    { name: t('nav.employees', 'Employees'), path: '/employees', icon: Users, show: true },
    { name: t('nav.supportDesk', 'Live Support Desk'), path: '/support-desk', icon: Headphones, show: isHrAdmin(user) },
    { name: t('nav.requests', 'Requests & Approvals'), path: '/requests', icon: ClipboardCheck, show: true },
    { name: t('nav.attendance', 'Attendance & Leave'), path: '/attendance', icon: CalendarCheck, show: true },
    { name: t('nav.payroll', 'Payroll & Compensation'), path: '/payroll', icon: CircleDollarSign, show: true },
    { name: t('nav.organization', 'Organization'), path: '/organization', icon: Building, show: canManageOrganization(user) },
    { name: t('nav.usersRoles', 'User & Roles'), path: '/admin/users', icon: UserCog, show: canManageUserRoles(user) },
    { name: t('nav.auditLogs', 'Audit & Compliance'), path: '/audit-logs', icon: ShieldAlert, show: canViewAuditLogs(user) },
  ].filter(item => item.show);

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
          <BrandLogo size="sm" layout="row" />
          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {t('nav.coreModules', 'Core Modules')}
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 h-screen sticky top-0 z-20 shadow-sm">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (with Backdrop & Smooth Slide In) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          {/* Drawer container */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 safe-area-top">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
