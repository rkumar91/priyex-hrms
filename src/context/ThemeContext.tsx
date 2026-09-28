import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'emerald' | 'indigo' | 'violet' | 'teal' | 'rose' | 'amber' | 'blue';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  subtitle: string;
  previewColor: string; // hex
  badgeClass: string;
  gradient: string;
  accentClass: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'emerald',
    name: 'Emerald Forest',
    subtitle: 'Classic enterprise green (Default)',
    previewColor: '#10b981',
    badgeClass: 'bg-emerald-500',
    gradient: 'from-emerald-900 via-teal-900 to-slate-900',
    accentClass: 'text-emerald-600',
  },
  {
    id: 'indigo',
    name: 'Royal Indigo',
    subtitle: 'Modern corporate deep blue',
    previewColor: '#6366f1',
    badgeClass: 'bg-indigo-500',
    gradient: 'from-indigo-950 via-slate-900 to-blue-950',
    accentClass: 'text-indigo-600',
  },
  {
    id: 'violet',
    name: 'Amethyst Violet',
    subtitle: 'Futuristic purple & lilac',
    previewColor: '#8b5cf6',
    badgeClass: 'bg-violet-500',
    gradient: 'from-purple-950 via-slate-900 to-violet-950',
    accentClass: 'text-violet-600',
  },
  {
    id: 'teal',
    name: 'Ocean Teal',
    subtitle: 'Crisp cyan & coastal teal',
    previewColor: '#14b8a6',
    badgeClass: 'bg-teal-500',
    gradient: 'from-teal-950 via-slate-900 to-cyan-950',
    accentClass: 'text-teal-600',
  },
  {
    id: 'rose',
    name: 'Crimson Rose',
    subtitle: 'Bold ruby & energetic rose',
    previewColor: '#f43f5e',
    badgeClass: 'bg-rose-500',
    gradient: 'from-rose-950 via-slate-900 to-pink-950',
    accentClass: 'text-rose-600',
  },
  {
    id: 'amber',
    name: 'Sunset Amber',
    subtitle: 'Warm golden honey & amber',
    previewColor: '#f59e0b',
    badgeClass: 'bg-amber-500',
    gradient: 'from-amber-950 via-slate-900 to-orange-950',
    accentClass: 'text-amber-600',
  },
  {
    id: 'blue',
    name: 'Sapphire Blue',
    subtitle: 'High-trust executive cobalt',
    previewColor: '#3b82f6',
    badgeClass: 'bg-blue-500',
    gradient: 'from-blue-950 via-slate-900 to-sky-950',
    accentClass: 'text-blue-600',
  },
];

const THEME_SCALES: Record<ThemeId, Record<string, string>> = {
  emerald: {
    '--brand-50': '#ecfdf5',
    '--brand-100': '#d1fae5',
    '--brand-200': '#a7f3d0',
    '--brand-300': '#6ee7b7',
    '--brand-400': '#34d399',
    '--brand-500': '#10b981',
    '--brand-600': '#059669',
    '--brand-700': '#047857',
    '--brand-800': '#065f46',
    '--brand-900': '#064e3b',
    '--brand-950': '#022c22',
    '--brand-primary': '#059669',
    '--brand-glow': 'rgba(16, 185, 129, 0.25)',
  },
  indigo: {
    '--brand-50': '#eef2ff',
    '--brand-100': '#e0e7ff',
    '--brand-200': '#c7d2fe',
    '--brand-300': '#a5b4fc',
    '--brand-400': '#818cf8',
    '--brand-500': '#6366f1',
    '--brand-600': '#4f46e5',
    '--brand-700': '#4338ca',
    '--brand-800': '#3730a3',
    '--brand-900': '#312e81',
    '--brand-950': '#1e1b4b',
    '--brand-primary': '#4f46e5',
    '--brand-glow': 'rgba(99, 102, 241, 0.25)',
  },
  violet: {
    '--brand-50': '#f5f3ff',
    '--brand-100': '#ede9fe',
    '--brand-200': '#ddd6fe',
    '--brand-300': '#c4b5fd',
    '--brand-400': '#a78bfa',
    '--brand-500': '#8b5cf6',
    '--brand-600': '#7c3aed',
    '--brand-700': '#6d28d9',
    '--brand-800': '#5b21b6',
    '--brand-900': '#4c1d95',
    '--brand-950': '#2e1065',
    '--brand-primary': '#7c3aed',
    '--brand-glow': 'rgba(139, 92, 246, 0.25)',
  },
  teal: {
    '--brand-50': '#f0fdfa',
    '--brand-100': '#ccfbf1',
    '--brand-200': '#99f6e4',
    '--brand-300': '#5eead4',
    '--brand-400': '#2dd4bf',
    '--brand-500': '#14b8a6',
    '--brand-600': '#0d9488',
    '--brand-700': '#0f766e',
    '--brand-800': '#115e59',
    '--brand-900': '#134e4a',
    '--brand-950': '#042f2e',
    '--brand-primary': '#0d9488',
    '--brand-glow': 'rgba(20, 184, 166, 0.25)',
  },
  rose: {
    '--brand-50': '#fff1f2',
    '--brand-100': '#ffe4e6',
    '--brand-200': '#fecdd3',
    '--brand-300': '#fda4af',
    '--brand-400': '#fb7185',
    '--brand-500': '#f43f5e',
    '--brand-600': '#e11d48',
    '--brand-700': '#be123c',
    '--brand-800': '#9f1239',
    '--brand-900': '#881337',
    '--brand-950': '#4c0519',
    '--brand-primary': '#e11d48',
    '--brand-glow': 'rgba(244, 63, 94, 0.25)',
  },
  amber: {
    '--brand-50': '#fffbeb',
    '--brand-100': '#fef3c7',
    '--brand-200': '#fde68a',
    '--brand-300': '#fcd34d',
    '--brand-400': '#fbbf24',
    '--brand-500': '#f59e0b',
    '--brand-600': '#d97706',
    '--brand-700': '#b45309',
    '--brand-800': '#92400e',
    '--brand-900': '#78350f',
    '--brand-950': '#451a03',
    '--brand-primary': '#d97706',
    '--brand-glow': 'rgba(245, 158, 11, 0.25)',
  },
  blue: {
    '--brand-50': '#eff6ff',
    '--brand-100': '#dbeafe',
    '--brand-200': '#bfdbfe',
    '--brand-300': '#93c5fd',
    '--brand-400': '#60a5fa',
    '--brand-500': '#3b82f6',
    '--brand-600': '#2563eb',
    '--brand-700': '#1d4ed8',
    '--brand-800': '#1e40af',
    '--brand-900': '#1e3a8a',
    '--brand-950': '#172554',
    '--brand-primary': '#2563eb',
    '--brand-glow': 'rgba(59, 130, 246, 0.25)',
  },
};

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  currentThemeOption: ThemeOption;
  availableThemes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('priyex_hrms_theme') as ThemeId;
    return saved && THEME_SCALES[saved] ? saved : 'emerald';
  });

  const applyThemeVariables = (themeId: ThemeId) => {
    const root = document.documentElement;
    const scale = THEME_SCALES[themeId] || THEME_SCALES.emerald;
    Object.entries(scale).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
    root.setAttribute('data-theme', themeId);
  };

  useEffect(() => {
    applyThemeVariables(theme);
    localStorage.setItem('priyex_hrms_theme', theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
  };

  const currentThemeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        currentThemeOption,
        availableThemes: THEME_OPTIONS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
