import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { ScheduleChangeItem } from '../types';

export const RelationshipsPage: React.FC = () => {
  const { openEmailById } = useApp();
  const [changes, setChanges] = useState<ScheduleChangeItem[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    ApiService.getRelationships().then(res => {
      setChanges(res.whatChanged);
      setClusters(res.clusters);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header Banner explaining PS02 Value */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-white border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white rounded-md">
            SIH PS02 Core Innovation
          </span>
          <span className="text-xs font-bold text-amber-800">
            Cross-Department Information Synthesis
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          What Changed? & Communication Clusters
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
          When university departments operate in silos, students receive isolated emails about venue changes, delayed buses, and extended deadlines. CampusPulse connects related notices into unified stories and highlights critical diffs.
        </p>
      </div>

      {/* Section 1: Critical Changes Detected */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-600" />
            <span>Critical Schedule & Logistics Changes</span>
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Detected from recent notices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {changes.map((item, idx) => (
            <div
              key={idx}
              onClick={() => openEmailById(item.emailId)}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {item.changeType} DIFF
                </span>
                <span className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
                  <span>View Source Notice</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                {item.topic}
              </h4>

              {/* Before vs After Visual Diff */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Previous
                  </span>
                  <p className="font-semibold text-slate-500 line-through">
                    {item.previousValue}
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-200 pl-3">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    Updated Now
                  </span>
                  <p className="font-bold text-emerald-700">
                    {item.newValue}
                  </p>
                </div>
              </div>

              {/* Requirement 29: WHAT CHANGED? WHY IT MATTERS? WHAT YOU NEED TO DO? */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 space-y-1">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                    WHAT CHANGED?
                  </span>
                  <p className="text-slate-700 font-medium leading-snug">
                    {item.whatChanged || item.summary}
                  </p>
                </div>

                {item.whyItMatters && (
                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/60 space-y-1">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                      WHY IT MATTERS
                    </span>
                    <p className="text-slate-700 font-medium leading-snug">
                      {item.whyItMatters}
                    </p>
                  </div>
                )}

                {item.whatYouNeedToDo && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      WHAT YOU NEED TO DO
                    </span>
                    <p className="text-slate-700 font-bold leading-snug">
                      {item.whatYouNeedToDo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Connected Communication Chains (ACM, GDG, Exams, Transport) */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Connected SRM AP Topic Threads</span>
        </h3>
        <p className="text-xs text-slate-500">
          Individual department communications clustered together under unified academic narratives.
        </p>

        <div className="space-y-4">
          {/* Thread 1: ACM Student Chapter Recruitment 2026 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
                  STUDENT CLUBS CLUSTER
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  ACM Student Chapter Recruitment 2026
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                3 Connected Communications
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => openEmailById('email-011')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-violet-50/60 border border-violet-200 hover:bg-violet-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                  <span className="font-bold text-violet-950">ACM Recruitment 2026 — Applications Open</span>
                </div>
                <span className="text-slate-500 font-mono">acm.core@srmap.edu.in</span>
              </div>

              <div
                onClick={() => openEmailById('email-011')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="font-medium text-slate-700">Team Breakdown: R&D, Events, PR, Social Media, Docs</span>
                </div>
                <span className="text-slate-500 font-mono">SEAS Disciplinary Tracks</span>
              </div>

              <div
                onClick={() => openEmailById('email-011')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 hover:bg-amber-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-bold text-amber-950">Application Deadline Approaching: Sept 30, 11:59 PM</span>
                </div>
                <span className="text-amber-700 font-mono font-bold">Action Required</span>
              </div>
            </div>
          </div>

          {/* Thread 2: Google Solution Hunt Challenge 2026 (GDG on Campus) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  HACKATHONS CLUSTER
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  Google Solution Hunt Challenge 2026 — GDG on Campus
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                3 Connected Communications
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => openEmailById('email-014')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-200 hover:bg-blue-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="font-bold text-blue-950">GDG on Campus — Announcement: Think → Build → Present → Win</span>
                </div>
                <span className="text-slate-500 font-mono">GDG Lead</span>
              </div>

              <div
                onClick={() => openEmailById('email-014')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-emerald-950">Venue Confirmed: X-Lab Auditorium, Neerukonda Campus (522240)</span>
                </div>
                <span className="text-emerald-700 font-mono">Oct 4</span>
              </div>
            </div>
          </div>

          {/* Thread 3: CSE 204 Exam Logistics */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                  EXAMS CLUSTER
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  CSE 204 Algorithms Mid-Semester Examination Logistics
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                2 Connected Communications
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => openEmailById('email-001')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/60 border border-red-200 hover:bg-red-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-red-950">URGENT: Tomorrow's CSE 204 Exam Shifted to S202, SR Block</span>
                </div>
                <span className="text-red-700 font-mono font-bold">Reporting 09:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
