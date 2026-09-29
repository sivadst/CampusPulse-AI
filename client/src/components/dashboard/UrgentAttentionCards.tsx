import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, Clock, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UrgentAttentionCards: React.FC = () => {
  const { actions, openEmailById, toggleAction } = useApp();

  const urgentActions = actions
    .filter(a => !a.completed && (a.priority === 'CRITICAL' || a.priority === 'HIGH'))
    .slice(0, 3);

  if (urgentActions.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-emerald-800">You're All Caught Up!</h3>
        <p className="text-xs text-emerald-600 mt-1">No pending critical or high-priority campus actions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading">
            Needs Your Attention ({urgentActions.length})
          </h3>
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Ranked by Academic & Safety Impact
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {urgentActions.map((action) => {
          const isCritical = action.priority === 'CRITICAL';

          return (
            <div
              key={action.id}
              className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                isCritical
                  ? 'bg-gradient-to-b from-red-50/70 to-white border-red-200 hover:border-red-300'
                  : 'bg-gradient-to-b from-orange-50/70 to-white border-orange-200 hover:border-orange-300'
              }`}
              onClick={() => openEmailById(action.emailId)}
            >
              <div>
                {/* Header Priority Badge & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isCritical
                        ? 'bg-red-500 text-white shadow-xs shadow-red-200'
                        : 'bg-orange-500 text-white shadow-xs shadow-orange-200'
                    }`}
                  >
                    {isCritical ? (
                      <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    <span>{action.priority}</span>
                  </span>

                  <span className="text-[11px] font-bold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                    {action.category}
                  </span>
                </div>

                {/* Task Title */}
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-2">
                  {action.title}
                </h4>

                {/* Source Subject */}
                <p className="text-xs text-slate-500 line-clamp-1 mb-3">
                  Source: {action.sourceEmailSubject}
                </p>

                {/* Location if present */}
                {action.location && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-lg w-fit mb-3">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{action.location}</span>
                  </div>
                )}
              </div>

              {/* Bottom Footer: Deadline & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-600 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{action.deadline || 'Immediate'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEmailById(action.emailId);
                  }}
                  className={`inline-flex items-center gap-1 font-bold ${
                    isCritical ? 'text-red-600 hover:text-red-700' : 'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
