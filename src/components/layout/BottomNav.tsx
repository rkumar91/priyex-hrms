import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarCheck,
  Menu
} from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu }) => {
  const tabs = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Directory', path: '/employees', icon: Users },
    { name: 'Requests', path: '/requests', icon: ClipboardCheck },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-lg lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-15 items-center px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? 'text-emerald-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-emerald-50 text-emerald-600' : ''}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 truncate max-w-full">
                    {tab.name}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-emerald-600 -mt-0.5"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open Full Menu"
          className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-all active:scale-95 cursor-pointer"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
