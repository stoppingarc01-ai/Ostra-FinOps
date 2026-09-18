import React from 'react';
import {
  LayoutGrid,
  CheckSquare,
  Calendar,
  BarChart2,
  Boxes,
  Settings,
  HelpCircle,
  LogOut,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'models', label: 'Models', icon: Boxes },
  ];

  const soloItems = [
    { id: 'account', label: 'Account & Gateway', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
    { id: 'logout', label: 'Reset Session', icon: LogOut },
  ];

  return (
    <aside className="w-64 bg-[#F5F2EB] border-r border-[#E8E2D5] min-h-screen flex flex-col justify-between py-6 px-4 select-none shrink-0 transition-all font-sans">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg viewBox="0 0 36 36" fill="none" className="w-9 h-9 transition-transform duration-200 hover:scale-105">
              <ellipse
                cx="18"
                cy="18"
                rx="14"
                ry="14"
                stroke="#0C2419"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeDasharray="60 30"
              />
              <path
                d="M12 7 C 22 12, 22 24, 12 29"
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="18" cy="18" r="2.5" fill="#10B981" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-charcoal-900 block leading-tight">
              OsterdOps
            </span>
            <span className="text-[10px] font-medium text-charcoal-500 block tracking-tight">
              AI Control • Cost Guardrails • Observability
            </span>
          </div>
        </div>

        {/* MENU Section */}
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase font-bold text-charcoal-400 px-3 pb-1 tracking-wider">
            Menu
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E5F2EB] text-[#0C2419] font-bold shadow-2xs'
                    : 'text-charcoal-600 hover:bg-[#EFEAE0] hover:text-charcoal-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#0C2419]' : 'text-charcoal-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* SOLO MODE Section */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between px-3 pb-1">
            <span className="text-[10px] font-mono uppercase font-bold text-charcoal-400 tracking-wider">
              Solo Mode
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-[#E5F2EB] text-emerald-800 font-mono">
              Personal
            </span>
          </div>
          {soloItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || (item.id === 'auth' && (currentTab === 'login' || currentTab === 'signup'));
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id === 'logout' ? 'auth' : item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E5F2EB] text-[#0C2419] font-bold shadow-2xs'
                    : 'text-charcoal-600 hover:bg-[#EFEAE0] hover:text-charcoal-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#0C2419]' : 'text-charcoal-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
