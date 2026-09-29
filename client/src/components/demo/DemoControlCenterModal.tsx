import React from 'react';
import {
  X,
  Sliders,
  RotateCcw,
  Sparkles,
  AlertOctagon,
  ShieldCheck,
  CheckCircle,
  Database,
  ExternalLink,
  Mail
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoControlCenterModal: React.FC = () => {
  const { isDemoControlOpen, setIsDemoControlOpen, simulateEmail, resetDemo, dashboard } = useApp();

  if (!isDemoControlOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-slate-900 font-heading">
                  Demo Control Center
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                  SIH PS02 Demonstration
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Trigger live scenarios to showcase how CampusPulse AI prioritizes university noise.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDemoControlOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Preset Buttons Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              SRM AP Live Simulation Presets
            </h4>
            <p className="text-xs text-slate-500">
              Click any verified SRM University-AP scenario to inject and prioritize an authentic communication in real-time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              {[
                { id: 'srm_exam', label: 'SRM AP — Exam Alert', desc: 'CSE 204 venue shifted to S202 SR Block', color: 'border-red-200 bg-red-50/70 text-red-900 hover:bg-red-100' },
                { id: 'srm_attendance', label: 'SRM AP — Attendance Warning', desc: 'Critical shortage warning in CSE 207 (68%)', color: 'border-amber-200 bg-amber-50/70 text-amber-900 hover:bg-amber-100' },
                { id: 'srm_closure', label: 'SRM AP — University Closure', desc: 'Rain closure Sept 25; compensatory day Oct 10', color: 'border-purple-200 bg-purple-50/70 text-purple-900 hover:bg-purple-100' },
                { id: 'srm_transport', label: 'SRM AP — Transport Alert', desc: 'Bypass road delay on Route 5 & 8 to Neerukonda', color: 'border-cyan-200 bg-cyan-50/70 text-cyan-900 hover:bg-cyan-100' },
                { id: 'srm_acm', label: 'SRM AP — Club Recruitment', desc: 'ACM Chapter recruitment deadline Sept 30', color: 'border-violet-200 bg-violet-50/70 text-violet-900 hover:bg-violet-100' },
                { id: 'robotics', label: 'SRM AP — New Workshop', desc: 'Techfest IIT Bombay Robotics Workshop at S202', color: 'border-blue-200 bg-blue-50/70 text-blue-900 hover:bg-blue-100' },
                { id: 'ecell', label: 'SRM AP — Entrepreneurship Update', desc: 'STARTUP WARS postponed revised dates announcement', color: 'border-orange-200 bg-orange-50/70 text-orange-900 hover:bg-orange-100' },
                { id: 'gdg', label: 'SRM AP — Event Announcement', desc: 'GDG Google Solution Hunt Challenge at X-Lab', color: 'border-emerald-200 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100' }
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    simulateEmail(preset.id);
                    setIsDemoControlOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all hover:scale-101 cursor-pointer flex flex-col justify-between ${preset.color}`}
                >
                  <p className="text-xs font-bold">{preset.label}</p>
                  <p className="text-[11px] opacity-80 mt-1 line-clamp-1">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Scenario 3: Reset Demo Dataset */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-slate-600" />
                Reset To Clean State
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Restores the 107 synthetic SRM AP communications, marks unread notices, and resets custom tasks.
              </p>
            </div>

            <button
              onClick={() => {
                resetDemo();
                setIsDemoControlOpen(false);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
            >
              Reset Demo
            </button>
          </div>

          {/* Domain Security & Filtering Inspection */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              University Domain Security Guard
            </h4>
            <p className="text-xs text-slate-600">
              Primary Institutional Domain: <code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">@srmap.edu.in</code>
            </p>
            <p className="text-[11px] text-slate-500">
              Approved official channels: Directorate of Communications, Registrar Office, Dean SEAS, HOD CSE, E-Cell, CEL, ACM Student Chapter, and GDG on Campus. External marketing, phishing, and non-institutional spam are automatically filtered out.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setIsDemoControlOpen(false)}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};
