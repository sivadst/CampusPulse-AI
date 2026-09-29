import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  GitCompare,
  Calendar,
  MapPin,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
  BookOpen,
  ShieldCheck
} from 'lucide-react';
import { useApp, NavTab } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { currentTab, setCurrentTab, dashboard, actions, emails, setIsDemoControlOpen } = useApp();

  const urgentCount = dashboard?.metrics?.requireAttention || 0;
  const unreadCount = emails.filter(e => !e.isRead).length;
  const pendingActions = actions.filter(a => !a.completed).length;

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inbox', label: 'Priority Inbox', icon: Inbox, badge: unreadCount, badgeColor: 'bg-indigo-100 text-indigo-700' },
    { id: 'actions', label: 'My Actions', icon: CheckSquare, badge: pendingActions, badgeColor: 'bg-red-100 text-red-700' },
    { id: 'relationships', label: 'What Changed?', icon: GitCompare, badge: 3, badgeColor: 'bg-amber-100 text-amber-700' },
    { id: 'classroom', label: 'Google Classroom', icon: BookOpen, badge: 3, badgeColor: 'bg-emerald-100 text-emerald-700' },
    { id: 'calendar', label: 'Calendar & Conflict', icon: Calendar },
    { id: 'connections', label: 'Connected Accounts', icon: ShieldCheck },
    { id: 'map', label: 'Campus Map', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  return (
    <aside
      className={`relative flex flex-col justify-between h-screen bg-white border-r border-[#E7EAF3] transition-all duration-300 z-40 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding Section */}
      <div>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            {/* Custom CampusPulse SVG Icon */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l3 8 4-16 3 8h4" />
              </svg>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white animate-pulse"></span>
            </div>

            {!collapsed && (
              <div className="flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-slate-900 font-heading">
                    CampusPulse
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md tracking-wider">
                    AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded">
                    SRM AP
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 tracking-tight">
                    Your campus. Prioritized.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer group relative ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-r-full" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />

                {!collapsed && (
                  <span className="truncate text-left flex-1">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Hackathon Demo Center Controller */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={() => setIsDemoControlOpen(true)}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-emerald-800 hover:from-emerald-100 hover:to-teal-100 transition-all text-xs font-semibold shadow-xs cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Open Demo Control Center"
        >
          <Sliders className="w-4 h-4 text-emerald-600 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col text-left">
              <span>Demo Controls</span>
              <span className="text-[10px] text-emerald-600 font-normal">SIH PS02 Live Console</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
