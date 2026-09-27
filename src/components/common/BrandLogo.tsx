import React from 'react';
import { Users } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  layout?: 'row' | 'col';
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
        } bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-md shadow-emerald-600/25 flex items-center justify-center shrink-0 transition-transform hover:scale-105 duration-200 relative ${
          layout === 'col' ? 'mb-3.5' : ''
        }`}
      >
        <Users className="w-full h-full text-white" strokeWidth={2.4} />

        {/* Live Active Platform Indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 border border-white"></span>
        </span>
      </div>

      {/* Brand Typography */}
      <div className={`flex flex-col ${layout === 'col' ? 'items-center' : 'justify-center min-w-0'}`}>
        <div
          className={`${
            isLarge
              ? 'text-2xl sm:text-[26px] font-black tracking-tight text-slate-900'
              : 'text-[15px] font-black tracking-tight text-slate-900 leading-none whitespace-nowrap'
          }`}
        >
          Priyex{' '}
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent font-black">
            People
          </span>
        </div>

        {showTagline && (
          <div
            className={`flex items-center gap-1.5 uppercase font-bold whitespace-nowrap ${
              isLarge
                ? 'text-[11px] text-teal-600 font-extrabold tracking-widest mt-1.5'
                : 'text-[9.5px] text-slate-400 tracking-wider mt-1'
            }`}
          >
            {!isLarge && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
            )}
            <span className={isLarge ? 'text-teal-700' : 'text-slate-500 font-semibold truncate'}>
              {isLarge ? 'Intelligent Workforce Cloud' : 'Workforce Cloud'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
