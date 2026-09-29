import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Share2,
  Calendar,
  Sparkles,
  ExternalLink,
  Download,
  FileText,
  BookmarkCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EmailDetailModal: React.FC = () => {
  const { selectedEmail, setSelectedEmail, actions, toggleAction, addToast, setCurrentTab } = useApp();
  const [taskAdded, setTaskAdded] = useState(false);

  if (!selectedEmail) return null;

  const isCritical = selectedEmail.priority === 'CRITICAL';
  const isHigh = selectedEmail.priority === 'HIGH';
  const isMedium = selectedEmail.priority === 'MEDIUM';

  const priorityColor = isCritical
    ? 'text-red-700 bg-red-50 border-red-200'
    : isHigh
    ? 'text-orange-700 bg-orange-50 border-orange-200'
    : isMedium
    ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-slate-700 bg-slate-100 border-slate-200';

  const priorityBadgeBg = isCritical
    ? 'bg-red-500'
    : isHigh
    ? 'bg-orange-500'
    : isMedium
    ? 'bg-amber-500'
    : 'bg-slate-500';

  // Check if this email already has a completed action
  const relatedAction = actions.find(a => a.emailId === selectedEmail.id);
  const isActionCompleted = relatedAction ? relatedAction.completed : selectedEmail.isActionCompleted;

  const handleActionToggle = () => {
    if (relatedAction) {
      toggleAction(relatedAction.id);
    } else {
      setTaskAdded(true);
      setTimeout(() => setTaskAdded(false), 2000);
    }
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(`SRM University-AP Andhra Pradesh ${selectedEmail.location || 'Campus'}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white ${priorityBadgeBg}`}>
              {isCritical && <AlertCircle className="w-3.5 h-3.5 animate-pulse" />}
              {isHigh && <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{selectedEmail.priority} PRIORITY</span>
            </span>

            <span className="px-2.5 py-0.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-md">
              {selectedEmail.category}
            </span>

            <span className="text-xs font-mono font-bold text-slate-500">
              Score: {selectedEmail.priorityScore}/100
            </span>
          </div>

          <button
            onClick={() => setSelectedEmail(null)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Email Subject & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug font-heading mb-3">
              {selectedEmail.subject}
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
                  {selectedEmail.senderName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{selectedEmail.senderName}</p>
                  <p className="text-slate-500">{selectedEmail.sender}</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-slate-500">To: {selectedEmail.recipient}</p>
                <p className="font-medium text-slate-700">{selectedEmail.dateFormatted}</p>
              </div>
            </div>
          </div>

          {/* AI SUMMARY CARD (Distinctive Notion/Linear hybrid aesthetic) */}
          <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-cyan-50/50 border border-indigo-100 shadow-2xs">
            <div className="flex items-center gap-2 mb-2 text-indigo-700">
              <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                CampusPulse AI Summary
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-3">
              {selectedEmail.summary}
            </p>

            <div className="pt-3 border-t border-indigo-100/80">
              <p className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                Why This Is Ranked {selectedEmail.priority}:
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedEmail.priorityReason}
              </p>
            </div>
          </div>

          {/* ACTION REQUIRED & LOCATION CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Required Action Box */}
            {selectedEmail.actionRequired && selectedEmail.actionText && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    Required Action
                  </span>
                  {selectedEmail.actionDeadline && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                      {selectedEmail.actionDeadline}
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  {selectedEmail.actionText}
                </p>

                <button
                  onClick={handleActionToggle}
                  className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isActionCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isActionCompleted ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Action Completed ✓</span>
                    </>
                  ) : (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>{taskAdded ? 'Added to My Actions!' : 'Add to My Actions'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Campus Location Box */}
            {selectedEmail.location && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                    Campus Location Context
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-2">
                    {selectedEmail.location}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    SRM University-AP · Neerukonda Campus Grounds
                  </p>
                </div>

                <button
                  onClick={openGoogleMaps}
                  className="w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Open in Google Maps</span>
                </button>
              </div>
            )}
          </div>

          {/* Original Email Body */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Original Message
            </h4>
            <div className="p-5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans shadow-2xs">
              {selectedEmail.body}
            </div>
          </div>

          {/* Attachments Section if present */}
          {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Attachments ({selectedEmail.attachments.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedEmail.attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => {
                      addToast({
                        title: "📎 Attachment Downloaded",
                        message: `Saved ${att.name} (${att.size}) to downloads.`,
                        priority: "LOW"
                      });
                    }}
                  >
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{att.name}</span>
                    <span className="text-[10px] text-slate-400">({att.size})</span>
                    <Download className="w-3 h-3 text-slate-400 ml-1" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => {
              setCurrentTab('inbox');
              setSelectedEmail(null);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            ← Back to Priority Inbox
          </button>

          <button
            onClick={() => setSelectedEmail(null)}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
