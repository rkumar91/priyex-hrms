import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  isSuperAdmin,
  isSaasOwner,
  canViewAuditLogs,
  canManageOrganization,
  canManageUserRoles,
  isHrAdmin,
  canManageAnnouncements
} from '../../utils/rbac';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CircleDollarSign,
  Building,
  Building2,
  ShieldAlert,
  ClipboardCheck,
  UserCog,
  Headphones,
  Megaphone,
  Receipt,
  CreditCard,
  FileSignature,
  PhoneCall,
  ChevronDown,
  X,
  ShieldCheck
} from 'lucide-react';

interface SubNavItem {
  name: string;
  tabKey: string;
  badge?: string | number | null;
}

interface NavItem {
  name: string;
  path: string;
  icon: any;
  show: boolean;
  badge?: string | number | null;
  children?: SubNavItem[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab')?.toLowerCase();

  const isSaas = isSaasOwner(user);

  // Map to track expanded accordion state per parent route
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>(() => {
    return { [location.pathname]: true };
  });

  // Automatically expand the current route when location changes
  useEffect(() => {
    setExpandedPaths((prev) => ({
      ...prev,
      [location.pathname]: true
    }));
  }, [location.pathname]);

  // Close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  }, [location.pathname]);

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const isManagerOrAdmin =
    isHrAdmin(user) ||
    Boolean(user?.roles?.some((r) => ['ADMIN', 'SUPER_ADMIN', 'HR_MANAGER', 'MANAGER'].includes(r)));

  // Tenant HRMS Navigation Items
  const navigationItems: NavItem[] = [
    {
      name: t('nav.dashboard', 'Dashboard'),
      path: '/dashboard',
      icon: LayoutDashboard,
      show: true
    },
    {
      name: t('nav.employees', 'Employees'),
      path: '/employees',
      icon: Users,
      show: true
    },
    {
      name: t('nav.attendance', 'Attendance & Leave'),
      path: '/attendance',
      icon: CalendarCheck,
      show: true,
      children: [
        { name: 'Biometric & Punch', tabKey: 'attendance' },
        { name: 'Leave Management', tabKey: 'leaves' },
        { name: 'Overtime (OT)', tabKey: 'overtime' },
        { name: 'C-Off Wallet', tabKey: 'coff' },
        { name: 'Geo-Perimeters', tabKey: 'geofences' }
      ]
    },
    {
      name: t('nav.payroll', 'Payroll & Compensation'),
      path: '/payroll',
      icon: CircleDollarSign,
      show: true,
      children: isManagerOrAdmin
        ? [
            { name: 'Company Operations', tabKey: 'operations' },
            { name: 'CTC Register', tabKey: 'ctc_register' },
            { name: 'Declarations Review', tabKey: 'declarations' },
            { name: 'Forms & Payslips', tabKey: 'forms' },
            { name: 'Investment Declaration', tabKey: 'investment_declaration' },
            { name: 'Tax Calculator', tabKey: 'calculator' },
            { name: 'My CTC & Payslips', tabKey: 'my_payslips' }
          ]
        : [
            { name: 'Forms & Payslips', tabKey: 'forms' },
            { name: 'Investment Declaration', tabKey: 'investment_declaration' },
            { name: 'Tax Calculator', tabKey: 'calculator' },
            { name: 'My CTC & Payslips', tabKey: 'my_payslips' }
          ]
    },
    {
      name: t('nav.requests', 'Requests & Approvals'),
      path: '/requests',
      icon: ClipboardCheck,
      show: true,
      children: [
        { name: 'Profile Requests', tabKey: 'profile_requests' },
        { name: 'HR Queries', tabKey: 'hr_queries' },
        { name: 'Separations & Exits', tabKey: 'separations' }
      ]
    },
    {
      name: t('nav.supportDesk', 'Live Support Desk'),
      path: '/support-desk',
      icon: Headphones,
      show: isHrAdmin(user),
      children: [
        { name: 'Available Pool', tabKey: 'pool' },
        { name: 'My Active Chats', tabKey: 'active' },
        { name: 'Resolved Transcripts', tabKey: 'history' }
      ]
    },
    {
      name: t('nav.expenses', 'Expense Claims'),
      path: '/expenses',
      icon: Receipt,
      show: true
    },
    {
      name: t('nav.organization', 'Organization'),
      path: '/organization',
      icon: Building,
      show: canManageOrganization(user),
      children: [
        { name: 'Annual Leave Quotas', tabKey: 'quotas' },
        { name: 'Departments & Entities', tabKey: 'entities' }
      ]
    },
    {
      name: t('nav.usersRoles', 'User & Roles'),
      path: '/admin/users',
      icon: UserCog,
      show: canManageUserRoles(user),
      children: [
        { name: 'Employee Roles', tabKey: 'roles' },
        { name: 'System Logins', tabKey: 'logins' }
      ]
    },
    {
      name: t('nav.bannerNotifications', 'Banner Notifications'),
      path: '/banner-notifications',
      icon: Megaphone,
      show: canManageAnnouncements(user)
    },
    {
      name: 'Client Onboarding',
      path: '/client-onboarding',
      icon: Building2,
      show: isSuperAdmin(user)
    },
    {
      name: t('nav.auditLogs', 'Audit & Compliance'),
      path: '/audit-logs',
      icon: ShieldAlert,
      show: canViewAuditLogs(user)
    }
  ].filter((item) => item.show);

  // Dedicated SaaS Owner Control Plane Nav Items
  const saasNavItems = [
    {
      name: 'Executive Dashboard',
      tabKey: 'overview',
      icon: LayoutDashboard,
      badge: 'Live'
    },
    {
      name: 'Client Organizations',
      tabKey: 'clients',
      icon: Building2,
      badge: null
    },
    {
      name: 'Subscriptions & Plans',
      tabKey: 'subscriptions',
      icon: CreditCard,
      badge: null
    },
    {
      name: 'Setup & AMC Contracts',
      tabKey: 'contracts',
      icon: FileSignature,
      badge: null
    },
    {
      name: 'Sales Pipeline & Leads',
      tabKey: 'leads',
      icon: PhoneCall,
      badge: null
    },
    {
      name: 'Invoices & Billing',
      tabKey: 'billing',
      icon: Receipt,
      badge: null
    },
    {
      name: 'Customer Inquiries',
      tabKey: 'queries',
      icon: Headphones,
      badge: null
    },
    {
      name: 'Control Plane Audit',
      tabKey: 'audit',
      icon: ShieldAlert,
      badge: null
    }
  ];

  const handleParentClick = (item: NavItem, e: React.MouseEvent) => {
    e.preventDefault();
    const isCurrentRoute = location.pathname === item.path;

    if (item.children && item.children.length > 0) {
      if (isCurrentRoute) {
        toggleExpand(item.path);
      } else {
        setExpandedPaths((prev) => ({ ...prev, [item.path]: true }));
        const defaultTab = item.children[0].tabKey;
        navigate(`${item.path}?tab=${defaultTab}`);
        if (mobileOpen && onCloseMobile) onCloseMobile();
      }
    } else {
      navigate(item.path);
      if (mobileOpen && onCloseMobile) onCloseMobile();
    }
  };

  const handleSubItemClick = (parentPath: string, tabKey: string) => {
    navigate(`${parentPath}?tab=${tabKey}`);
    if (mobileOpen && onCloseMobile) onCloseMobile();
  };

  const handleSaasTabClick = (tabKey: string) => {
    navigate(`/saas-console?tab=${tabKey}`);
    if (mobileOpen && onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-white select-none">
      <div className="flex flex-col h-full min-h-0">
        {/* Brand Logo Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <BrandLogo size="sm" layout="row" />
            {isSaas && (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 tracking-wider uppercase border border-indigo-200/60">
                HQ
              </span>
            )}
          </div>
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

        {/* Navigation Section */}
        {isSaas ? (
          /* SaaS OWNER CONTROL PLANE MENU */
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                  Control Plane
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Priyex SaaS
                </span>
              </div>
            </div>

            <nav className="p-3 space-y-1 overflow-y-auto flex-1 no-scrollbar">
              {saasNavItems.map((item) => {
                const Icon = item.icon;
                const isSelected =
                  location.pathname === '/saas-console' &&
                  (currentTab === item.tabKey || (!currentTab && item.tabKey === 'overview'));

                return (
                  <button
                    key={item.tabKey}
                    type="button"
                    onClick={() => handleSaasTabClick(item.tabKey)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer group ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isSelected
                            ? 'bg-indigo-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/70'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isSelected
                            ? 'bg-indigo-400/30 text-indigo-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* SaaS Operator Status Footer */}
            <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">SaaS Command Center</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Zero client tenant interference. All operational changes are logged.
              </p>
            </div>
          </div>
        ) : (
          /* TENANT HRMS MODULES (Employees, Attendance, Payroll, Org, etc.) */
          <nav className="p-3.5 space-y-1 overflow-y-auto flex-1 no-scrollbar">
            <div className="px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              {t('nav.coreModules', 'Workforce Suite')}
            </div>

            {navigationItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isCurrentRoute = location.pathname === item.path;
              const isExpanded = Boolean(expandedPaths[item.path]);

              return (
                <div key={item.path} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={(e) => handleParentClick(item, e)}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer group ${
                      isCurrentRoute
                        ? 'bg-slate-100 text-slate-900 border border-slate-200/90 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isCurrentRoute
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/60'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          {item.badge}
                        </span>
                      )}
                      {hasChildren && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-slate-700' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                      )}
                    </div>
                  </button>

                  {hasChildren && isExpanded && (
                    <div className="relative ml-4.5 pl-3.5 border-l-2 border-slate-200/90 py-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {item.children!.map((child) => {
                        const isSubActive =
                          isCurrentRoute &&
                          (currentTab === child.tabKey ||
                            (!currentTab && child.tabKey === item.children![0].tabKey));

                        return (
                          <button
                            key={child.tabKey}
                            type="button"
                            onClick={() => handleSubItemClick(item.path, child.tabKey)}
                            className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all duration-150 cursor-pointer select-none group/sub ${
                              isSubActive
                                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/70 shadow-2xs'
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${
                                  isSubActive
                                    ? 'bg-blue-600 scale-125'
                                    : 'bg-slate-300 group-hover/sub:bg-slate-400'
                                }`}
                              />
                              <span className="truncate">{child.name}</span>
                            </div>
                            {child.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                                  isSubActive
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {child.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 h-screen sticky top-0 z-20 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Backdrop + Smooth Slide) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 safe-area-top">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
