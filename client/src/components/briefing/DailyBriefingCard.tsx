import React, { useState } from 'react';
import { Sparkles, RefreshCw, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';

export const DailyBriefingCard: React.FC = () => {
  const { dashboard, openEmailById } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefing, setBriefing] = useState(dashboard?.briefing);

  // Sync if dashboard updates
  React.useEffect(() => {
    if (dashboard?.briefing) {
      setBriefing(dashboard.briefing);
    }
  }, [dashboard?.briefing]);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const refreshed = await ApiService.getBriefing();
      setBriefing(refreshed);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsGenerating(false), 600);
    }
  };

  if (!briefing) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 rounded-2xl border border-indigo-100 p-6 shadow-sm">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700">
                AI Campus Briefing
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded">
                Gemini Synthesized
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
              {briefing.greeting}
            </h3>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Briefing'}</span>
        </button>
      </div>

      {/* Main Headline */}
      <div className="mt-4 mb-4">
        <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
          {briefing.headline}
        </p>
      </div>

      {/* Key Summary Bullets */}
      <div className="space-y-2.5">
        {briefing.summaryBullets?.map((item, idx) => (
          <div
            key={idx}
            onClick={() => item.emailId && openEmailById(item.emailId)}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
              item.emailId ? 'cursor-pointer hover:bg-white hover:shadow-2xs' : ''
            } ${
              item.priority === 'CRITICAL'
                ? 'bg-red-50/50 border-red-100 text-red-950'
                : item.priority === 'HIGH'
                ? 'bg-orange-50/50 border-orange-100 text-orange-950'
                : 'bg-white/80 border-slate-200/80 text-slate-800'
            }`}
          >
            <span className="text-base select-none shrink-0">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-xs font-bold truncate">{item.title}</h4>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                    item.priority === 'CRITICAL'
                      ? 'bg-red-500 text-white'
                      : item.priority === 'HIGH'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.priority}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
            {item.emailId && (
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 self-center" />
            )}
          </div>
        ))}
      </div>

      {/* Motivational Student Wellness Note */}
      {briefing.motivationalNote && (
        <div className="mt-4 pt-3 border-t border-indigo-100/60 flex items-center gap-2 text-xs text-indigo-900/80 italic">
          <span>💡</span>
          <span>{briefing.motivationalNote}</span>
        </div>
      )}
    </div>
  );
};
