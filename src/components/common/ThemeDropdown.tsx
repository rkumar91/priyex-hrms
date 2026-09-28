import React, { useState, useRef, useEffect } from 'react';
import { useTheme, THEME_OPTIONS, ThemeId } from '../../context/ThemeContext';
import { Palette, Check, ChevronDown } from 'lucide-react';

interface ThemeDropdownProps {
  compact?: boolean;
}

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ compact = false }) => {
  const { theme, setTheme, currentThemeOption } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: ThemeId) => {
    setTheme(id);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Theme Color"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition cursor-pointer active:scale-95 hover:border-slate-300"
      >
        <Palette className="w-3.5 h-3.5 text-slate-500" />
        <span
          className="w-3 h-3 rounded-full ring-2 ring-white shadow-2xs shrink-0"
          style={{ backgroundColor: currentThemeOption.previewColor }}
        />
        {!compact && (
          <span className="hidden sm:inline font-medium text-slate-800">
            {currentThemeOption.name.split(' ')[0]}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Theme Accent</span>
            <Palette className="w-3 h-3 text-slate-400" />
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {THEME_OPTIONS.map((item) => {
              const isSelected = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-100 font-bold text-slate-900'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-4 h-4 rounded-full ring-2 ring-white shadow-xs shrink-0"
                      style={{ backgroundColor: item.previewColor }}
                    />
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check
                      className="w-4 h-4 shrink-0 ml-2"
                      style={{ color: item.previewColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
