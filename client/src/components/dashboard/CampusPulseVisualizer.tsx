import React from 'react';
import { Activity, ShieldAlert, Sparkles, AlertTriangle, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CampusPulseVisualizer: React.FC = () => {
  const { dashboard, simulateEmail } = useApp();

  const metrics = dashboard?.metrics || {
    totalAnalyzed: 108,
    requireAttention: 5,
    criticalCount: 1,
    highPriorityCount: 4,
    upcomingDeadlinesCount: 4
  };

  const waveform = dashboard?.campusPulse?.waveform || [35, 60, 40, 85, 95, 75, 50, 65, 90, 80, 55, 45, 70, 85, 40];

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-800/50">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Greeting & Summary */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              SRM AP CAMPUS PULSE · LIVE
            </span>
            <span className="text-xs text-slate-300">
              SRM University-AP, Andhra Pradesh · Neerukonda Campus
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            Good morning, Muthu 👋
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            Here's what is happening at SRM AP today. CampusPulse AI synchronized your communications across departmental channels into clear, prioritized actions.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <span className="text-xs font-bold text-cyan-400">{metrics.totalAnalyzed}</span>
              <span className="text-xs text-slate-300">Messages Analyzed</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 backdrop-blur-sm border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="text-xs font-bold text-red-300">{metrics.criticalCount} Critical</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 backdrop-blur-sm border border-amber-500/30">
              <span className="text-xs font-bold text-amber-300">{metrics.highPriorityCount} High Priority</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/20 backdrop-blur-sm border border-indigo-500/30">
              <span className="text-xs font-bold text-indigo-300">{metrics.requireAttention} Need Action</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Audio/Signal Waveform Visualizer */}
        <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 w-full sm:w-auto">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Campus Activity Wave
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-300">
                15 Signal Nodes
              </span>
            </div>

            {/* Dynamic Waveform Bars */}
            <div className="flex items-end gap-1.5 h-12 px-2 py-1 bg-black/20 rounded-lg">
              {waveform.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    height: `${Math.max(15, (val / 100) * 44)}px`,
                    animationDelay: `${idx * 0.08}s`
                  }}
                  className={`w-2.5 rounded-full transition-all duration-300 wave-bar ${
                    idx % 3 === 0
                      ? 'bg-gradient-to-t from-cyan-500 to-indigo-400'
                      : idx % 3 === 1
                      ? 'bg-gradient-to-t from-indigo-400 to-purple-400'
                      : 'bg-gradient-to-t from-purple-400 to-pink-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Quick Demo Simulator CTA */}
          <button
            onClick={() => simulateEmail()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all hover:scale-102 cursor-pointer w-full sm:w-auto justify-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Incoming Email</span>
          </button>
        </div>
      </div>
    </div>
  );
};
