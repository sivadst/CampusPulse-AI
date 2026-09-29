import React from 'react';
import { ActionChecklist } from '../components/actions/ActionChecklist';
import { CheckSquare } from 'lucide-react';

export const ActionsPage: React.FC = () => {
  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            <span>My Action Items</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Turn emails into actions. Every required form, venue reporting, and fee payment in one prioritized list.
          </p>
        </div>
      </div>

      <ActionChecklist />
    </div>
  );
};
