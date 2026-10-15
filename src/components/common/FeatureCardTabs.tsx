import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface FeatureCardTabItem<T extends string = string> {
  id: T;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string | number | null;
  badgeVariant?: 'primary' | 'warning' | 'success' | 'indigo' | 'slate';
  show?: boolean;
}

interface FeatureCardTabsProps<T extends string = string> {
  tabs: FeatureCardTabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
  gridColsClassName?: string;
}

export function FeatureCardTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  gridColsClassName
}: FeatureCardTabsProps<T>) {
  const visibleTabs = tabs.filter(t => t.show !== false);

  const getGridCols = () => {
    if (gridColsClassName) return gridColsClassName;
    if (visibleTabs.length === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (visibleTabs.length === 3) return 'grid-cols-1 sm:grid-cols-3';
    if (visibleTabs.length === 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    if (visibleTabs.length === 5) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className={`grid ${getGridCols()} gap-3.5 ${className}`}>
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`group relative rounded-2xl p-3.5 sm:p-4 text-left transition-all duration-200 cursor-pointer border overflow-hidden flex items-start gap-3.5 ${
              isActive
                ? 'border-blue-500 bg-white shadow-md shadow-blue-500/10 ring-2 ring-blue-500/25 -translate-y-0.5'
                : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/70 hover:shadow-sm hover:-translate-y-0.5'
            }`}
          >
            {/* Top Accent Gradient Line for active state */}
            {isActive && (
              <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-blue-600 via-indigo-600 to-sky-500" />
            )}

            {/* Icon Container */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Content Details */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`text-sm font-bold truncate transition-colors ${
                    isActive ? 'text-blue-900 font-extrabold' : 'text-slate-800 group-hover:text-blue-700'
                  }`}
                >
                  {tab.label}
                </span>

                {tab.badge !== undefined && tab.badge !== null && tab.badge !== '' && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-blue-100 text-blue-800'
                        : tab.badgeVariant === 'warning'
                        ? 'bg-amber-100 text-amber-800'
                        : tab.badgeVariant === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-1 font-normal group-hover:text-slate-600 transition-colors">
                {tab.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
