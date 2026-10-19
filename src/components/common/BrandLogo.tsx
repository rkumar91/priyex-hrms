import React, { useState } from 'react';
import { Users, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSuperAdmin } from '../../utils/rbac';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'row' | 'col' | 'icon';
  className?: string;
  showTagline?: boolean;
  customLogoUrl?: string | null;
  customBrandName?: string | null;
  customLegalName?: string | null;
  useTenantContext?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  layout = 'row',
  className = '',
  showTagline = true,
  customLogoUrl,
  customBrandName,
  customLegalName,
  useTenantContext = true,
}) => {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);

  // Check if we should resolve branding from tenant context
  const activeCompany = user?.company;
  const isSuper = isSuperAdmin(user);

  // Determine logo URL
  const resolvedLogoUrl =
    customLogoUrl !== undefined
      ? customLogoUrl
      : useTenantContext && !isSuper && activeCompany?.logoUrl
      ? activeCompany.logoUrl
      : useTenantContext && !isSuper
      ? localStorage.getItem('priyex_active_company_logo')
      : null;

  // Determine brand name
  const resolvedBrandName =
    customBrandName !== undefined && customBrandName !== null
      ? customBrandName
      : useTenantContext && !isSuper && (activeCompany?.brandName || activeCompany?.legalName)
      ? activeCompany.brandName || activeCompany.legalName
      : useTenantContext && !isSuper && localStorage.getItem('priyex_active_company_name')
      ? localStorage.getItem('priyex_active_company_name')
      : null;

  const isLarge = size === 'lg' || size === 'xl';
  const isIconOnly = layout === 'icon';

  // Sizing definitions
  const badgeSize =
    size === 'xl'
      ? 'w-16 h-16 rounded-2xl p-2.5'
      : size === 'lg'
      ? 'w-14 h-14 rounded-2xl p-2'
      : size === 'md'
      ? 'w-11 h-11 rounded-xl p-1.5'
      : 'w-9 h-9 rounded-xl p-1';

  // If a client logo is active and image hasn't errored
  if (resolvedLogoUrl && !imgError) {
    return (
      <div
        className={`flex ${
          layout === 'col' ? 'flex-col items-center text-center' : 'items-center gap-3'
        } ${className}`}
      >
        {/* Dynamic Tenant Logo Container */}
        <div
          className={`${badgeSize} bg-white border border-slate-200/90 shadow-sm flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-200 relative overflow-hidden ${
            layout === 'col' ? 'mb-3' : ''
          }`}
        >
          <img
            src={resolvedLogoUrl}
            alt={resolvedBrandName || 'Organization Logo'}
            className="w-full h-full object-contain"
            onError={() => setImgError(true)}
          />

          {/* Active status indicator dot */}
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
          </span>
        </div>

        {/* Dynamic Client Name Typography */}
        {!isIconOnly && (
          <div className={`flex flex-col ${layout === 'col' ? 'items-center' : 'justify-center min-w-0'}`}>
            <div
              className={`font-black tracking-tight text-slate-900 leading-tight truncate ${
                isLarge ? 'text-2xl sm:text-[24px]' : size === 'md' ? 'text-[17px]' : 'text-[15px]'
              }`}
              title={resolvedBrandName || undefined}
            >
              {resolvedBrandName || 'Workspace'}
            </div>

            {showTagline && (
              <div
                className={`flex items-center gap-1.5 uppercase font-bold whitespace-nowrap ${
                  isLarge
                    ? 'text-[11px] text-blue-600 font-extrabold tracking-widest mt-1'
                    : 'text-[9.5px] text-slate-400 tracking-wider mt-0.5'
                }`}
              >
                {!isLarge && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>}
                <span className={isLarge ? 'text-blue-700' : 'text-slate-500 font-semibold truncate'}>
                  {customLegalName || 'Enterprise HRMS Workspace'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // If a client brand name is detected but no image URL or image errored, show elegant initials badge
  if (resolvedBrandName && resolvedBrandName !== 'Priyex') {
    const initials = resolvedBrandName
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div
        className={`flex ${
          layout === 'col' ? 'flex-col items-center text-center' : 'items-center gap-3'
        } ${className}`}
      >
        <div
          className={`${badgeSize} bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-600 text-white shadow-md shadow-blue-900/20 flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-200 relative ${
            layout === 'col' ? 'mb-3' : ''
          }`}
        >
          <span className="font-black text-sm tracking-wide">{initials}</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
          </span>
        </div>

        {!isIconOnly && (
          <div className={`flex flex-col ${layout === 'col' ? 'items-center' : 'justify-center min-w-0'}`}>
            <div
              className={`font-black tracking-tight text-slate-900 leading-tight truncate ${
                isLarge ? 'text-2xl sm:text-[24px]' : size === 'md' ? 'text-[17px]' : 'text-[15px]'
              }`}
            >
              {resolvedBrandName}
            </div>

            {showTagline && (
              <div
                className={`flex items-center gap-1.5 uppercase font-bold whitespace-nowrap ${
                  isLarge
                    ? 'text-[11px] text-blue-600 font-extrabold tracking-widest mt-1'
                    : 'text-[9.5px] text-slate-400 tracking-wider mt-0.5'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span className={isLarge ? 'text-blue-700' : 'text-slate-500 font-semibold truncate'}>
                  {customLegalName || 'Enterprise HRMS Workspace'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Master Priyex Platform Branding Fallback (used for Super Admin or default workspace)
  return (
    <div
      className={`flex ${
        layout === 'col' ? 'flex-col items-center text-center' : 'items-center gap-3'
      } ${className}`}
    >
      {/* Icon Badge: Modern Gradient Squircle with Crisp People Icon */}
      <div
        className={`${badgeSize} bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 text-white shadow-md shadow-blue-900/20 flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-200 relative ${
          layout === 'col' ? 'mb-3.5' : ''
        }`}
      >
        <Users className="w-full h-full text-white" strokeWidth={2.4} />

        {/* Live Active Platform Indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
        </span>
      </div>

      {/* Brand Typography */}
      {!isIconOnly && (
        <div className={`flex flex-col ${layout === 'col' ? 'items-center' : 'justify-center min-w-0'}`}>
          <div
            className={`${
              isLarge
                ? 'text-2xl sm:text-[26px] font-black tracking-tight text-slate-900'
                : 'text-[15px] font-black tracking-tight text-slate-900 leading-none whitespace-nowrap'
            }`}
          >
            Priyex{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">
              People
            </span>
          </div>

          {showTagline && (
            <div
              className={`flex items-center gap-1.5 uppercase font-bold whitespace-nowrap ${
                isLarge
                  ? 'text-[11px] text-blue-600 font-extrabold tracking-widest mt-1.5'
                  : 'text-[9.5px] text-slate-400 tracking-wider mt-1'
              }`}
            >
              {!isLarge && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>}
              <span className={isLarge ? 'text-blue-700' : 'text-slate-500 font-semibold truncate'}>
                {isLarge ? 'Intelligent Workforce Cloud' : 'Workforce Cloud'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
