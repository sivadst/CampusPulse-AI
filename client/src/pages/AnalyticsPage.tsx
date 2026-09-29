import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, ShieldAlert, PieChart, Activity, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart as RePieChart, Pie } from 'recharts';
import { useApp } from '../context/AppContext';

export const AnalyticsPage: React.FC = () => {
  const { dashboard, actions } = useApp();

  const categoryData = [
    { name: 'Exams', count: 14, color: '#EF4444' },
    { name: 'Academics', count: 24, color: '#4F46E5' },
    { name: 'Attendance', count: 9, color: '#F97316' },
    { name: 'Transport', count: 11, color: '#06B6D4' },
    { name: 'Placements', count: 12, color: '#8B5CF6' },
    { name: 'Fees', count: 8, color: '#10B981' },
    { name: 'Hostel', count: 10, color: '#F59E0B' },
    { name: 'Events', count: 15, color: '#EC4899' },
    { name: 'Scholarships', count: 5, color: '#3B82F6' },
  ];

  const priorityData = [
    { name: 'Critical', count: dashboard?.metrics?.criticalCount || 1, color: '#EF4444' },
    { name: 'High', count: dashboard?.metrics?.highPriorityCount || 4, color: '#F97316' },
    { name: 'Medium', count: dashboard?.metrics?.mediumPriorityCount || 24, color: '#F59E0B' },
    { name: 'Low', count: dashboard?.metrics?.lowPriorityCount || 79, color: '#64748B' },
  ];

  const completedActions = actions.filter(a => a.completed).length;
  const pendingActions = actions.filter(a => !a.completed).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          <span>Campus Communication Intelligence</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Quantifying how CampusPulse AI eliminates information overload for university students.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E7EAF3] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Ingested
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {dashboard?.metrics?.totalAnalyzed || 108}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600">
            Across 15 University Channels
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7EAF3] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Noise Reduction
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 font-heading">
            97.2%
          </p>
          <span className="text-[11px] font-semibold text-slate-500">
            108 notices → 3 urgent actions
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7EAF3] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Urgent Interventions
            </span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-red-600 font-heading">
            {(dashboard?.metrics?.criticalCount || 1) + (dashboard?.metrics?.highPriorityCount || 4)}
          </p>
          <span className="text-[11px] font-semibold text-red-500">
            Debarment & Venue changes caught
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7EAF3] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tasks Resolved
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            {completedActions} / {completedActions + pendingActions}
          </p>
          <span className="text-[11px] font-semibold text-slate-500">
            {pendingActions} pending actions remaining
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            Communication Volume by University Channel
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 font-heading">
            AI Priority Tier Distribution
          </h3>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700">{item.name}: {item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
