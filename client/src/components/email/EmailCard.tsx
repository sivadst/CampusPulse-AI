import React from 'react';
import { Clock, MapPin, CheckCircle, AlertCircle, AlertTriangle, ArrowRight, Tag } from 'lucide-react';
import { EmailData } from '../../types';

interface EmailCardProps {
  email: EmailData;
  onClick: () => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, onClick }) => {
  const isCritical = email.priority === 'CRITICAL';
  const isHigh = email.priority === 'HIGH';
  const isMedium = email.priority === 'MEDIUM';

  const priorityBadgeClasses = isCritical
    ? 'bg-red-500 text-white'
    : isHigh
    ? 'bg-orange-500 text-white'
    : isMedium
    ? 'bg-amber-500 text-white'
    : 'bg-slate-500 text-white';

  const cardBorderClasses = isCritical
    ? 'border-l-4 border-l-red-500 border-r border-t border-b border-slate-200 hover:border-red-300'
    : isHigh
    ? 'border-l-4 border-l-orange-500 border-r border-t border-b border-slate-200 hover:border-orange-300'
    : isMedium
    ? 'border-l-4 border-l-amber-500 border-r border-t border-b border-slate-200 hover:border-amber-300'
    : 'border-l-4 border-l-slate-300 border-r border-t border-b border-slate-200 hover:border-slate-300';

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-xl bg-white shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer ${cardBorderClasses} ${
        !email.isRead ? 'bg-indigo-50/20' : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        {/* Left: Priority Badge & Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${priorityBadgeClasses}`}>
            {isCritical && <AlertCircle className="w-3 h-3 animate-pulse" />}
            {isHigh && <AlertTriangle className="w-3 h-3" />}
            <span>{email.priority}</span>
            <span className="opacity-80 text-[10px]">({email.priorityScore})</span>
          </span>

          <span className="px-2 py-0.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-md">
            {email.category}
          </span>

          {!email.isRead && (
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" title="Unread" />
          )}
        </div>

        {/* Right: Timestamp */}
        <span className="text-xs text-slate-400 font-medium">
          {email.dateFormatted}
        </span>
      </div>

      {/* Sender and Subject */}
      <div className="mb-2">
        <p className="text-xs font-semibold text-slate-500 mb-0.5">
          {email.senderName} · <span className="text-slate-400 font-normal">{email.sender}</span>
        </p>
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
          {email.subject}
        </h4>
      </div>

      {/* AI Crisp Summary */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
        {email.summary}
      </p>

      {/* Action / Deadline / Location Tags */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {email.actionRequired && email.actionText && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md">
              <CheckCircle className="w-3 h-3 text-indigo-500" />
              <span className="line-clamp-1 max-w-[200px] sm:max-w-xs">{email.actionText}</span>
            </span>
          )}

          {email.actionDeadline && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{email.actionDeadline}</span>
            </span>
          )}

          {email.location && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span className="truncate max-w-[120px]">{email.location}</span>
            </span>
          )}
        </div>

        <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5 shrink-0 ml-auto">
          <span>Read Notice</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
