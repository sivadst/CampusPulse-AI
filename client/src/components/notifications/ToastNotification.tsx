import React from 'react';
import { Mail, X, ArrowRight, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastNotification: React.FC = () => {
  const { toasts, removeToast, openEmailById } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isCritical = toast.priority === 'CRITICAL';
        const isHigh = toast.priority === 'HIGH';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl bg-white shadow-2xl border transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isCritical
                ? 'border-red-200 ring-2 ring-red-400/30'
                : isHigh
                ? 'border-orange-200 ring-2 ring-orange-400/30'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-2 rounded-xl text-white shrink-0 ${
                    isCritical ? 'bg-red-500' : isHigh ? 'bg-orange-500' : 'bg-indigo-600'
                  }`}
                >
                  <Mail className="w-4 h-4 animate-bounce" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                        isCritical
                          ? 'bg-red-100 text-red-700'
                          : isHigh
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {toast.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{toast.time}</span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                    {toast.title}
                  </h5>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {toast.message}
                  </p>

                  {toast.emailId && (
                    <button
                      onClick={() => {
                        openEmailById(toast.emailId!);
                        removeToast(toast.id);
                      }}
                      className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                    >
                      <span>View Email & Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
