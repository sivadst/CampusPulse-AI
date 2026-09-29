import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sparkles, Plus, CheckCircle, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    dashboard,
    searchQuery,
    setSearchQuery,
    setCurrentTab,
    openEmailById,
    simulateEmail,
    setIsDemoControlOpen,
    setIsAssistantOpen,
    actions
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const urgentCount = dashboard?.metrics?.requireAttention || 0;
  const criticalCount = dashboard?.metrics?.criticalCount || 0;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-white/90 backdrop-blur-md border-b border-[#E7EAF3] shadow-xs">
      {/* Search Input with quick suggestions */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search emails, exams, deadlines, transport... (Cmd+K)"
            className="w-full pl-10 pr-12 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-slate-800 placeholder-slate-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
            ⌘K
          </kbd>
        </div>

        {/* Quick Search Suggestions Popover */}
        {isSearchFocused && !searchQuery && (
          <div className="absolute left-0 right-0 top-full mt-1.5 p-3 bg-white border border-slate-200 rounded-xl shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Popular Campus Searches
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['CSE 204 Exam', 'Robotics Workshop S202', 'Attendance Warning', 'ACM Recruitment', 'Bus Route 5', 'Fee Deadline Oct 5'].map((tag) => (
                <button
                  key={tag}
                  onMouseDown={() => {
                    setSearchQuery(tag);
                    setCurrentTab('inbox');
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Action Icons & Badges */}
      <div className="flex items-center gap-3 ml-4">
        {/* Quick Simulate Live Email Button */}
        <button
          onClick={() => simulateEmail()}
          title="Simulate incoming SRM AP university email for live demonstration"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all shadow-xs hover:scale-102 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-600" />
          <span>Simulate Email</span>
        </button>

        {/* Mode Selector Badge */}
        <button
          onClick={() => setIsDemoControlOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
          title="Click to open Demo Control Center"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SRM AP DEMO</span>
          <span className="text-[10px] text-emerald-600 bg-white/70 px-1 rounded">SIH PS02</span>
        </button>

        {/* Floating AI Assistant trigger button */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all cursor-pointer shadow-xs"
          title="Open CampusPulse AI Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
          <span className="hidden md:inline">Ask AI</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Campus Alerts ({urgentCount})
                </h4>
                <button
                  onClick={() => {
                    setCurrentTab('actions');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  View Tasks
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                {actions.filter(a => !a.completed).slice(0, 4).map((action) => (
                  <div
                    key={action.id}
                    onClick={() => {
                      openEmailById(action.emailId);
                      setIsNotifOpen(false);
                    }}
                    className="py-2.5 px-1 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        action.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-orange-500'
                      }`} />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">{action.title}</p>
                        <p className="text-[11px] text-slate-500">{action.deadline || 'Action Required'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
            M
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">Muthu</p>
            <p className="text-[10px] text-slate-500 leading-tight">CSE · AI & ML</p>
          </div>
        </div>
      </div>
    </header>
  );
};
