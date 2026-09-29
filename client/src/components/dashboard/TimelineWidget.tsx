import React from 'react';
import { Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TimelineWidget: React.FC = () => {
  const { dashboard, openEmailById } = useApp();
  const timeline = dashboard?.todayTimeline || [];

  return (
    <div className="bg-white border border-[#E7EAF3] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight font-heading">
            Today's Schedule & Deadlines
          </h3>
        </div>
        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
          Wednesday, Sep 30
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {timeline.map((item, idx) => {
          const isCritical = item.priority === 'CRITICAL';
          const isHigh = item.priority === 'HIGH';

          return (
            <div
              key={idx}
              onClick={() => openEmailById(item.emailId)}
              className="relative group cursor-pointer"
            >
              {/* Timeline Node Marker */}
              <div
                className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white ring-2 ${
                  isCritical
                    ? 'bg-red-500 ring-red-200 animate-pulse'
                    : isHigh
                    ? 'bg-orange-500 ring-orange-200'
                    : 'bg-indigo-500 ring-indigo-200'
                }`}
              />

              <div className="p-3 rounded-xl bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-100 hover:border-indigo-200 transition-all">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-800 font-mono">
                    {item.time}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isCritical
                        ? 'bg-red-100 text-red-700'
                        : isHigh
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {item.title}
                </p>

                {item.location && (
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
