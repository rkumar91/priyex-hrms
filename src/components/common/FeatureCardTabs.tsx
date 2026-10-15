import React from 'react';
import { LucideIcon } from 'lucide-react';

export type FeatureCardColor = 'blue' | 'emerald' | 'amber' | 'indigo' | 'purple' | 'teal' | 'rose' | 'sky';

export interface FeatureCardTabItem<T extends string = string> {
  id: T;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string | number | null;
  badgeVariant?: 'primary' | 'warning' | 'success' | 'indigo' | 'slate';
  color?: FeatureCardColor;
  show?: boolean;
}

interface FeatureCardTabsProps<T extends string = string> {
  tabs: FeatureCardTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  gridColsClassName?: string;
}

const COLOR_STYLES: Record<FeatureCardColor, {
  accentLine: string;
  activeBorder: string;
  activeRing: string;
  activeBg: string;
  activeIcon: string;
  activeTitle: string;
  inactiveIcon: string;
  inactiveBorderHover: string;
  inactiveBgHover: string;
  activeBadge: string;
  inactiveBadge: string;
}> = {
  blue: {
    accentLine: 'bg-blue-600 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500',
    activeBorder: 'border-blue-500',
    activeRing: 'ring-2 ring-blue-500/25',
    activeBg: 'bg-blue-50/60 bg-gradient-to-b from-blue-50/70 via-white to-white',
    activeIcon: 'bg-blue-600 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30',
    activeTitle: 'text-blue-950 font-black',
    inactiveIcon: 'bg-blue-50 text-blue-600 border border-blue-200/70 group-hover:bg-blue-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-blue-300',
    inactiveBgHover: 'hover:bg-blue-50/25',
    activeBadge: 'bg-blue-100 text-blue-800 border border-blue-200',
    inactiveBadge: 'bg-blue-50 text-blue-700 border border-blue-200/80'
  },
  emerald: {
    accentLine: 'bg-emerald-600 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400',
    activeBorder: 'border-emerald-500',
    activeRing: 'ring-2 ring-emerald-500/25',
    activeBg: 'bg-emerald-50/60 bg-gradient-to-b from-emerald-50/70 via-white to-white',
    activeIcon: 'bg-emerald-600 bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/30',
    activeTitle: 'text-emerald-950 font-black',
    inactiveIcon: 'bg-emerald-50 text-emerald-600 border border-emerald-200/70 group-hover:bg-emerald-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-emerald-300',
    inactiveBgHover: 'hover:bg-emerald-50/25',
    activeBadge: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    inactiveBadge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
  },
  indigo: {
    accentLine: 'bg-indigo-600 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400',
    activeBorder: 'border-indigo-500',
    activeRing: 'ring-2 ring-indigo-500/25',
    activeBg: 'bg-indigo-50/60 bg-gradient-to-b from-indigo-50/70 via-white to-white',
    activeIcon: 'bg-indigo-600 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30',
    activeTitle: 'text-indigo-950 font-black',
    inactiveIcon: 'bg-indigo-50 text-indigo-600 border border-indigo-200/70 group-hover:bg-indigo-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-indigo-300',
    inactiveBgHover: 'hover:bg-indigo-50/25',
    activeBadge: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
    inactiveBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
  },
  amber: {
    accentLine: 'bg-amber-500 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400',
    activeBorder: 'border-amber-500',
    activeRing: 'ring-2 ring-amber-500/25',
    activeBg: 'bg-amber-50/60 bg-gradient-to-b from-amber-50/70 via-white to-white',
    activeIcon: 'bg-amber-600 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30',
    activeTitle: 'text-amber-950 font-black',
    inactiveIcon: 'bg-amber-50 text-amber-700 border border-amber-200/70 group-hover:bg-amber-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-amber-300',
    inactiveBgHover: 'hover:bg-amber-50/25',
    activeBadge: 'bg-amber-100 text-amber-800 border border-amber-200',
    inactiveBadge: 'bg-amber-50 text-amber-700 border border-amber-200/80'
  },
  purple: {
    accentLine: 'bg-purple-600 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-400',
    activeBorder: 'border-purple-500',
    activeRing: 'ring-2 ring-purple-500/25',
    activeBg: 'bg-purple-50/60 bg-gradient-to-b from-purple-50/70 via-white to-white',
    activeIcon: 'bg-purple-600 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/30',
    activeTitle: 'text-purple-950 font-black',
    inactiveIcon: 'bg-purple-50 text-purple-600 border border-purple-200/70 group-hover:bg-purple-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-purple-300',
    inactiveBgHover: 'hover:bg-purple-50/25',
    activeBadge: 'bg-purple-100 text-purple-800 border border-purple-200',
    inactiveBadge: 'bg-purple-50 text-purple-700 border border-purple-200/80'
  },
  teal: {
    accentLine: 'bg-teal-600 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400',
    activeBorder: 'border-teal-500',
    activeRing: 'ring-2 ring-teal-500/25',
    activeBg: 'bg-teal-50/60 bg-gradient-to-b from-teal-50/70 via-white to-white',
    activeIcon: 'bg-teal-600 bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/30',
    activeTitle: 'text-teal-950 font-black',
    inactiveIcon: 'bg-teal-50 text-teal-600 border border-teal-200/70 group-hover:bg-teal-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-teal-300',
    inactiveBgHover: 'hover:bg-teal-50/25',
    activeBadge: 'bg-teal-100 text-teal-800 border border-teal-200',
    inactiveBadge: 'bg-teal-50 text-teal-700 border border-teal-200/80'
  },
  rose: {
    accentLine: 'bg-rose-600 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400',
    activeBorder: 'border-rose-500',
    activeRing: 'ring-2 ring-rose-500/25',
    activeBg: 'bg-rose-50/60 bg-gradient-to-b from-rose-50/70 via-white to-white',
    activeIcon: 'bg-rose-600 bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/30',
    activeTitle: 'text-rose-950 font-black',
    inactiveIcon: 'bg-rose-50 text-rose-600 border border-rose-200/70 group-hover:bg-rose-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-rose-300',
    inactiveBgHover: 'hover:bg-rose-50/25',
    activeBadge: 'bg-rose-100 text-rose-800 border border-rose-200',
    inactiveBadge: 'bg-rose-50 text-rose-700 border border-rose-200/80'
  },
  sky: {
    accentLine: 'bg-sky-600 bg-gradient-to-r from-sky-500 via-blue-500 to-sky-400',
    activeBorder: 'border-sky-500',
    activeRing: 'ring-2 ring-sky-500/25',
    activeBg: 'bg-sky-50/60 bg-gradient-to-b from-sky-50/70 via-white to-white',
    activeIcon: 'bg-sky-600 bg-gradient-to-br from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/30',
    activeTitle: 'text-sky-950 font-black',
    inactiveIcon: 'bg-sky-50 text-sky-600 border border-sky-200/70 group-hover:bg-sky-100 group-hover:scale-105',
    inactiveBorderHover: 'hover:border-sky-300',
    inactiveBgHover: 'hover:bg-sky-50/25',
    activeBadge: 'bg-sky-100 text-sky-800 border border-sky-200',
    inactiveBadge: 'bg-sky-50 text-sky-700 border border-sky-200/80'
  }
};

const DEFAULT_PALETTE: FeatureCardColor[] = ['blue', 'emerald', 'indigo', 'amber', 'purple', 'teal', 'sky', 'rose'];

export function FeatureCardTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  gridColsClassName
}: FeatureCardTabsProps<T>) {
  const visibleTabs = tabs.filter(t => t.show !== false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll active card into view on mobile/tablet swipe container
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector<HTMLElement>('[data-active="true"]');
      if (activeEl) {
        const container = scrollContainerRef.current;
        const targetLeft = activeEl.offsetLeft;
        const targetWidth = activeEl.offsetWidth;
        const containerWidth = container.offsetWidth;
        if (targetLeft < container.scrollLeft || (targetLeft + targetWidth) > (container.scrollLeft + containerWidth)) {
          container.scrollTo({
            left: Math.max(0, targetLeft - 12),
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeTab]);

  const getGridCols = () => {
    if (gridColsClassName) return gridColsClassName;
    if (visibleTabs.length === 2) return 'sm:grid-cols-2';
    if (visibleTabs.length === 3) return 'sm:grid-cols-3';
    if (visibleTabs.length === 4) return 'sm:grid-cols-2 lg:grid-cols-4';
    if (visibleTabs.length === 5) return 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
    return 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className="relative w-full">
      <div
        ref={scrollContainerRef}
        className={`flex sm:grid ${getGridCols()} gap-2.5 sm:gap-3.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth snap-x snap-mandatory ${className}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {visibleTabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const colorKey = tab.color || DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];
          const theme = COLOR_STYLES[colorKey] || COLOR_STYLES.blue;

          return (
            <button
              key={tab.id}
              data-active={isActive ? 'true' : 'false'}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`group relative rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left transition-all duration-200 cursor-pointer border overflow-hidden flex items-start gap-3 sm:gap-3.5 shrink-0 sm:shrink w-[240px] sm:w-auto snap-start select-none ${
                isActive
                  ? `${theme.activeBorder} ${theme.activeBg} ${theme.activeRing} shadow-md shadow-slate-200/50 -translate-y-0.5`
                  : `border-slate-200/90 bg-white ${theme.inactiveBorderHover} ${theme.inactiveBgHover} hover:shadow-md hover:-translate-y-0.5`
              }`}
            >
              {/* Top Accent Gradient Line for active state */}
              {isActive && (
                <div className={`absolute top-0 inset-x-0 h-1 ${theme.accentLine}`} />
              )}

              {/* Icon Container */}
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isActive ? `${theme.activeIcon} scale-105` : theme.inactiveIcon
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Content Details */}
              <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`text-xs sm:text-sm truncate transition-colors ${
                      isActive ? theme.activeTitle : 'text-slate-800 font-bold group-hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </span>

                  {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
                    <span
                      className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 ${
                        isActive ? theme.activeBadge : theme.inactiveBadge
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <p className="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1 font-medium group-hover:text-slate-600 transition-colors">
                  {tab.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
