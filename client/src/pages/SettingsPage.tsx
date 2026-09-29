import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Mail,
  Sparkles,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsPage: React.FC = () => {
  const { dashboard, addToast, resetDemo } = useApp();
  const [allowedDomains, setAllowedDomains] = useState('srmap.edu.in, srmist.edu.in');
  const [studentName, setStudentName] = useState(dashboard?.student?.name || 'Muthu');
  const [university, setUniversity] = useState(dashboard?.student?.university || 'SRM University-AP, Andhra Pradesh');
  const [program, setProgram] = useState(dashboard?.student?.program || 'B.Tech CSE – AI & ML (Semester 3)');
  const [school, setSchool] = useState(dashboard?.student?.school || 'School of Engineering and Sciences (SEAS)');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: "✅ Settings Saved",
      message: "University preferences and domain filters updated successfully.",
      priority: "LOW"
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>System & Privacy Settings</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure domain filters, AI processing parameters, and Google OAuth connections.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Student Profile */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">
              Student Profile (Simulated Persona)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">University</label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Program & Semester</label>
              <input
                type="text"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Card 2: University Domain Security Filter */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">
              Authorized University Email Domains
            </h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Only emails originating from these domain suffixes will be indexed into your CampusPulse priority feed. External solicitations and e-commerce receipts are filtered out.
          </p>

          <div>
            <label className="font-bold text-xs text-slate-700 block mb-1">
              Allowed Domains (Comma-separated)
            </label>
            <input
              type="text"
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-mono text-indigo-700"
            />
          </div>
        </div>

        {/* Card 3: AI Engine & Gemini Integration */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                AI Engine & Cost Control
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
              Provider: Google Gemini / Fallback
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700">SHA-256 Hash Caching</span>
              <p className="text-slate-500">
                Identical emails are served from memory to eliminate redundant Gemini API requests and avoid rate limits.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-700">Graceful Fallback Mode</span>
              <p className="text-slate-500">
                If Gemini API experiences network interruption, the deterministic priority engine maintains 100% functionality.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Google Workspace & Gmail OAuth Status */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7EAF3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Google Workspace / Gmail Integration
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              DEMO MODE ACTIVE
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs">
            <h4 className="font-bold text-indigo-900">
              Zero-Modification Privacy Guarantee
            </h4>
            <p className="text-slate-600 leading-relaxed">
              When Live Gmail mode is connected, CampusPulse uses strictly read-only authorization (<code className="font-mono text-indigo-700 bg-white px-1 rounded">gmail.readonly</code>). CampusPulse AI will never compose, send, modify, delete, or forward messages.
            </p>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={resetDemo}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Demo Database</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
