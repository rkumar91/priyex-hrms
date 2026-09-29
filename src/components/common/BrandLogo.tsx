import React from 'react';
import { Users } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'row' | 'col' | 'icon';
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'sm',
  layout = 'row',
  className = '',
  showTagline = true,
}) => {
  const isLarge = size === 'lg';
  const isIconOnly = layout === 'icon';

  return (
    <div
      className={`flex ${
        layout === 'col' ? 'flex-col items-center text-center' : 'items-center gap-3'
      } ${className}`}
    >
      {/* Icon Badge: Modern Gradient Squircle with Crisp People Icon */}
      <div
        className={`${
          isLarge ? 'w-14 h-14 rounded-2xl p-3' : 'w-9 h-9 rounded-xl p-2'
        } bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-600 text-white shadow-md shadow-blue-900/20 flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-200 relative ${
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
              {!isLarge && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
              )}
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
