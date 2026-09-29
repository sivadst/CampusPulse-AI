import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, BookOpen, Calendar, Sparkles, MapPin, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, LogOut, ArrowRight } from 'lucide-react';
import { ApiService } from '../services/api';
import { useApp } from '../context/AppContext';

export const ConnectionsPage: React.FC = () => {
  const { addToast } = useApp();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSummary, setSyncSummary] = useState<any>(null);

  useEffect(() => {
    loadStatus();
    // Check if redirected from OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      addToast({
        title: "Google Connected",
        message: "Successfully authorized Gmail, Classroom & Calendar with CampusPulse AI!",
        priority: "LOW"
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getGoogleStatus();
      setStatus(data);
    } catch (err) {
      console.warn('Failed to load Google status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const authUrl = await ApiService.getGoogleAuthUrl();
      if (authUrl && authUrl.startsWith('http')) {
        window.location.href = authUrl;
      } else {
        addToast({
          title: "Connection URL Error",
          message: "Please check GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI environment settings.",
          priority: "HIGH"
        });
      }
    } catch (err) {
      addToast({
        title: "OAuth Start Error",
        message: "Failed to initiate Google Single Sign-On flow.",
        priority: "HIGH"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await ApiService.disconnectGoogle();
      addToast({
        title: "Google Disconnected",
        message: "Tokens revoked on server. Reverted to Demo Mode.",
        priority: "MEDIUM"
      });
      await loadStatus();
    } catch (err) {
      addToast({
        title: "Disconnect Failed",
        message: "Could not revoke Google session.",
        priority: "HIGH"
      });
    }
  };

  const handleSyncEverything = async () => {
    setSyncing(true);
    try {
      const summary = await ApiService.syncGoogle();
      setSyncSummary(summary);
      addToast({
        title: "⚡ Synchronized Everything",
        message: `Sync completed in ${summary.durationMs}ms: ${summary.classroomCourses} courses, ${summary.classroomAssignments} tasks, ${summary.calendarEvents} calendar events.`,
        priority: "LOW"
      });
      await loadStatus();
    } catch (err) {
      addToast({
        title: "Sync Failed",
        message: "Failed to synchronize Google services.",
        priority: "HIGH"
      });
    } finally {
      setSyncing(false);
    }
  };

  const isConnected = status?.connected || false;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 border border-indigo-800/30 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Connected University Services</h1>
                <span className={`text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {isConnected ? 'Live Student Mode' : 'Demo Mode Active'}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Server-side OAuth token security. Zero client secrets exposed. One Google authorization.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <button
                onClick={handleSyncEverything}
                disabled={syncing}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-900/40 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing All Services...' : 'Sync Everything'}
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-300 rounded-xl text-sm font-medium border border-slate-700/60 transition-all cursor-pointer"
                title="Disconnect Google account and clear server token store"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleConnectGoogle}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-900/50 cursor-pointer"
            >
              <span>Connect Google</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sync Summary Modal / Callout if recently synced */}
      {syncSummary && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Latest Sync Result ({syncSummary.durationMs}ms):</strong> {syncSummary.classroomCourses} courses, {syncSummary.classroomAssignments} coursework tasks, {syncSummary.classroomAnnouncements} announcements, {syncSummary.calendarEvents} calendar events.
            </span>
          </div>
          <button
            onClick={() => setSyncSummary(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connected Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Google Account */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-white text-base">Google Account</h3>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Single OAuth authorization for read-only Gmail & Classroom plus explicit Calendar event creation.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Email:</span>
                <span className="font-medium text-slate-200">{status?.userEmail || 'demo.student@srmap.edu.in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allowed Domains:</span>
                <span className="font-medium text-slate-200">srmap.edu.in</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token Storage:</span>
                <span className="font-medium text-emerald-400">Server-Side In-Memory</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Last Synced:</span>
            <span className="text-slate-300">{status?.lastSync ? new Date(status.lastSync).toLocaleTimeString() : 'Pristine Demo State'}</span>
          </div>
        </div>

        {/* 2. Gmail */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
                  <Mail className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-white text-base">Gmail API</h3>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              }`}>
                {isConnected ? 'Connected' : 'Demo 50 Dataset'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Restricted read-only scope (<code className="text-indigo-300">gmail.readonly</code>). Zero send or delete capabilities.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex justify-between">
                <span className="text-slate-500">Ingestion Scope:</span>
                <span className="font-medium text-emerald-400">Read-Only Enforced</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">University Messages:</span>
                <span className="font-medium text-slate-200">50 SRM AP Records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Filter Policy:</span>
                <span className="font-medium text-slate-200">Institutional & Classroom</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status:</span>
            <span className="text-slate-300">{isConnected ? 'Live Sync Enabled' : 'Deterministic SRM Demo'}</span>
          </div>
        </div>

        {/* 3. Google Classroom */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-white text-base">Google Classroom</h3>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}>
                Active Courses
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enrolled courses, coursework deadlines, announcements, and cross-system duplicate linking.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex justify-between">
                <span className="text-slate-500">Enrolled Courses:</span>
                <span className="font-medium text-slate-200">4 Active (CSE 213, 204, etc.)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coursework Tracked:</span>
                <span className="font-medium text-slate-200">3 Deadlines & Quizzes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gmail Cross-Linking:</span>
                <span className="font-medium text-emerald-400">Bidirectional</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">API Access:</span>
            <span className="text-slate-300">courses.readonly + coursework.me.readonly</span>
          </div>
        </div>

        {/* 4. Google Calendar */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                  <Calendar className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-white text-base">Google Calendar</h3>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
              }`}>
                Conflict Protected
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real calendar queries, conflict detection, duplicate prevention, and explicit confirmation creation.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex justify-between">
                <span className="text-slate-500">Upcoming Events:</span>
                <span className="font-medium text-slate-200">4 Events Scheduled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Conflict Detection:</span>
                <span className="font-medium text-emerald-400">Active (Overlap Check)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Creation Policy:</span>
                <span className="font-medium text-amber-400">Explicit Confirmation Only</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Silent Event Creation:</span>
            <span className="text-red-400 font-semibold">Strictly Forbidden</span>
          </div>
        </div>

        {/* 5. Gemini AI Engine */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                  <Sparkles className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-white text-base">Gemini 3.8 Flash</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Grounded Retrieval
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Dynamic tool calling layer (<code className="text-amber-300">@google/genai</code>) with zero hallucination and source citations.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex justify-between">
                <span className="text-slate-500">Active Model:</span>
                <span className="font-medium text-slate-200">gemini-3.8-flash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Retrieval Tools:</span>
                <span className="font-medium text-slate-200">20 Grounded Tool Endpoints</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fallback Provider:</span>
                <span className="font-medium text-emerald-400">Deterministic Engine Ready</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Frontend Keys Exposed:</span>
            <span className="text-emerald-400 font-semibold">0 (Zero Exposure)</span>
          </div>
        </div>

        {/* 6. Campus Map */}
        <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
                  <MapPin className="w-5 h-5" />
                </span>
                <h3 className="font-semibold text-white text-base">Campus Navigation</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                SRM AP Coordinates
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Geolocated building mapping for SR Block, CV Hall, Admin Block, X-Lab, and Bus Bays.
            </p>
            <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <div className="flex justify-between">
                <span className="text-slate-500">Primary Campus:</span>
                <span className="font-medium text-slate-200">Neerukonda, Amaravati</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mapped Venues:</span>
                <span className="font-medium text-slate-200">S202, CV 704, Room 114, Bay 2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Maps Provider:</span>
                <span className="font-medium text-slate-200">Interactive Map / Search Fallback</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-500">Status:</span>
            <span className="text-emerald-400 font-semibold">Active & Mapped</span>
          </div>
        </div>
      </div>
    </div>
  );
};
