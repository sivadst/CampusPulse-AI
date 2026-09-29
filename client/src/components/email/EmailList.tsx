import React, { useState } from 'react';
import { Filter, ArrowUpDown, Search, Inbox, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EmailCard } from './EmailCard';
import { Priority, Category } from '../../types';

export const EmailList: React.FC = () => {
  const {
    emails,
    selectedPriority,
    setSelectedPriority,
    selectedCategory,
    setSelectedCategory,
    openEmailById
  } = useApp();

  const [sortBy, setSortBy] = useState<'recency' | 'priority' | 'deadline'>('priority');
  const [localSearch, setLocalSearch] = useState('');

  const priorityTabs: { id: string; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All Messages', count: emails.length },
    { id: 'CRITICAL', label: 'Critical', count: emails.filter(e => e.priority === 'CRITICAL').length },
    { id: 'HIGH', label: 'High Priority', count: emails.filter(e => e.priority === 'HIGH').length },
    { id: 'MEDIUM', label: 'Medium', count: emails.filter(e => e.priority === 'MEDIUM').length },
    { id: 'LOW', label: 'Low', count: emails.filter(e => e.priority === 'LOW').length },
  ];

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'EXAMS', label: 'Exams' },
    { id: 'ATTENDANCE', label: 'Attendance' },
    { id: 'TRANSPORT', label: 'Transport' },
    { id: 'ACADEMICS', label: 'Academics' },
    { id: 'ASSIGNMENTS', label: 'Assignments' },
    { id: 'FEES', label: 'Fees' },
    { id: 'PLACEMENTS', label: 'Placements' },
    { id: 'HOSTEL', label: 'Hostel' },
    { id: 'EVENTS', label: 'Events' },
    { id: 'SCHOLARSHIPS', label: 'Scholarships' },
    { id: 'FACILITIES', label: 'Facilities' },
    { id: 'CLUBS', label: 'Clubs' }
  ];

  // Filtering
  let filtered = [...emails];

  if (selectedPriority !== 'ALL') {
    filtered = filtered.filter(e => e.priority.toUpperCase() === selectedPriority.toUpperCase());
  }

  if (selectedCategory !== 'ALL') {
    filtered = filtered.filter(e => e.category.toUpperCase() === selectedCategory.toUpperCase());
  }

  if (localSearch.trim()) {
    const q = localSearch.toLowerCase();
    filtered = filtered.filter(e =>
      e.subject.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q) ||
      e.senderName.toLowerCase().includes(q) ||
      e.sender.toLowerCase().includes(q) ||
      (e.location && e.location.toLowerCase().includes(q))
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'priority') {
      return b.priorityScore - a.priorityScore;
    }
    if (sortBy === 'deadline') {
      if (!a.deadlineDate) return 1;
      if (!b.deadlineDate) return -1;
      return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Controls Bar */}
      <div className="bg-white border border-[#E7EAF3] rounded-2xl p-4 shadow-2xs space-y-3">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {priorityTabs.map((tab) => {
            const isActive = selectedPriority === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPriority(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Bar: Category chips, Search & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Dropdown/Chips */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 shrink-0">Channel:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg outline-none focus:border-indigo-500 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {selectedCategory !== 'ALL' && (
              <button
                onClick={() => setSelectedCategory('ALL')}
                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Search within inbox & Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter inbox..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2 rounded-lg outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="priority">Priority Score</option>
                <option value="deadline">Closest Deadline</option>
                <option value="recency">Most Recent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Email Cards Feed */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E7EAF3] rounded-2xl p-12 text-center">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No Messages Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No university emails match your current priority or channel filter criteria.
          </p>
          <button
            onClick={() => {
              setSelectedPriority('ALL');
              setSelectedCategory('ALL');
              setLocalSearch('');
            }}
            className="mt-4 px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((email) => (
            <EmailCard
              key={email.id}
              email={email}
              onClick={() => openEmailById(email.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
