import React from 'react';
import { EmailList } from '../components/email/EmailList';
import { Inbox, Sparkles } from 'lucide-react';

export const InboxPage: React.FC = () => {
  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <Inbox className="w-6 h-6 text-indigo-600" />
            <span>Priority Inbox</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Every university communication analyzed, classified, and scored based on academic consequence.
          </p>
        </div>
      </div>

      <EmailList />
    </div>
  );
};
