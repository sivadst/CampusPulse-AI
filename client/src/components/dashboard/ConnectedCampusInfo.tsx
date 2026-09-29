import React, { useState } from 'react';
import { Mail, Calendar, MapPin, CheckCircle, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';

interface SystemNode {
  system: string;
  badge: string;
  source: string;
  icon: React.ReactNode;
  detail: string;
  color: string;
  borderColor: string;
  bgLight: string;
}

export const ConnectedCampusInfo: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'exam' | 'closure' | 'robotics'>('exam');

  const scenarios = {
    exam: {
      title: 'CSE 204 Exam Venue Reallocation',
      integratedInsight: 'Your CSE 204 Design & Analysis of Algorithms examination is tomorrow, and the venue was shifted to S202, SR Block due to technical lab setup. CampusPulse consolidated this across your official email, student timetable, and campus facility locator.',
      recommendedAction: 'Head directly to S202, SR Block by 09:30 AM with your physical Hall Ticket.',
      nodes: [
        {
          system: 'SYSTEM 1: EMAIL',
          badge: '📧 SRM AP Email',
          source: 'hod.cse@srmap.edu.in',
          icon: <Mail className="w-4 h-4 text-blue-600" />,
          detail: 'Urgent venue relocation circular for CSE 204 Mid-Term Exam',
          color: 'text-blue-700',
          borderColor: 'border-blue-200',
          bgLight: 'bg-blue-50/70'
        },
        {
          system: 'SYSTEM 2: TIMETABLE',
          badge: '🗓️ Timetable Portal',
          source: 'CSE 2nd Year Sem 3 Schedule',
          icon: <Calendar className="w-4 h-4 text-purple-600" />,
          detail: 'CSE 204 slot scheduled tomorrow 10:00 AM – 01:00 PM',
          color: 'text-purple-700',
          borderColor: 'border-purple-200',
          bgLight: 'bg-purple-50/70'
        },
        {
          system: 'SYSTEM 3: LOCATION',
          badge: '📍 Campus Maps',
          source: 'S202, SR Block (2nd Floor)',
          icon: <MapPin className="w-4 h-4 text-emerald-600" />,
          detail: 'SR Block Academic Wing (Neerukonda Campus)',
          color: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          bgLight: 'bg-emerald-50/70'
        },
        {
          system: 'SYSTEM 4: ACTION',
          badge: '✅ Student Task',
          source: 'CampusPulse Priority Engine',
          icon: <CheckCircle className="w-4 h-4 text-amber-600" />,
          detail: 'Update exam destination & arrive 30 mins early with ID',
          color: 'text-amber-700',
          borderColor: 'border-amber-200',
          bgLight: 'bg-amber-50/70'
        }
      ]
    },
    closure: {
      title: 'Heavy Rain Closure & Compensatory Working Day',
      integratedInsight: 'University closed on Sept 25 due to Mangalagiri road conditions. CampusPulse synchronized this with your academic calendar and registered Oct 10 as your compensatory working Saturday following the Friday timetable.',
      recommendedAction: 'Suspend travel on Sept 25; adjust attendance log and project review to Oct 10 compensatory working day.',
      nodes: [
        {
          system: 'SYSTEM 1: REGISTRAR CIRCULAR',
          badge: '📧 SRM AP Email',
          source: 'registrar.office@srmap.edu.in',
          icon: <Mail className="w-4 h-4 text-blue-600" />,
          detail: 'Official rain closure circular for Sept 25; Oct 10 compensatory day',
          color: 'text-blue-700',
          borderColor: 'border-blue-200',
          bgLight: 'bg-blue-50/70'
        },
        {
          system: 'SYSTEM 2: ACADEMIC CALENDAR',
          badge: '📊 Academic Portal',
          source: 'SRM AP Academic Operations',
          icon: <Calendar className="w-4 h-4 text-purple-600" />,
          detail: 'Compensatory working Saturday Oct 10 follows Friday timetable',
          color: 'text-purple-700',
          borderColor: 'border-purple-200',
          bgLight: 'bg-purple-50/70'
        },
        {
          system: 'SYSTEM 3: TRANSPORT & ACCESS',
          badge: '🚌 SRM AP Transport',
          source: 'Neerukonda – Vijayawada Route',
          icon: <MapPin className="w-4 h-4 text-emerald-600" />,
          detail: 'All university buses cancelled on Sept 25; resume on normal working days',
          color: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          bgLight: 'bg-emerald-50/70'
        },
        {
          system: 'SYSTEM 4: WHAT CHANGED?',
          badge: '⚡ Schedule Sync',
          source: 'CampusPulse Relationship Engine',
          icon: <CheckCircle className="w-4 h-4 text-amber-600" />,
          detail: 'Auto-postpone CEL presentations & attendance tracking',
          color: 'text-amber-700',
          borderColor: 'border-amber-200',
          bgLight: 'bg-amber-50/70'
        }
      ]
    },
    robotics: {
      title: 'Techfest IIT Bombay Robotics Workshop Integration',
      integratedInsight: 'Directorate of Communications announced the Robotics workshop with IIT Bombay at S202 SR Block. CampusPulse cross-referenced your B.Tech CSE AI/ML track and flagged zero timetable conflicts for Sept 30.',
      recommendedAction: 'Register by Sept 29 05:00 PM; contact Dr. Teja Krishna Mamidi (Mech) at S202 SR Block.',
      nodes: [
        {
          system: 'SYSTEM 1: COMMUNICATIONS',
          badge: '📧 SRM AP Email',
          source: 'communications@srmap.edu.in',
          icon: <Mail className="w-4 h-4 text-blue-600" />,
          detail: 'Joint Workshop on Robotics with Techfest, IIT Bombay',
          color: 'text-blue-700',
          borderColor: 'border-blue-200',
          bgLight: 'bg-blue-50/70'
        },
        {
          system: 'SYSTEM 2: STUDENT PROFILE',
          badge: '🎓 Academic Profile',
          source: 'Muthu · CSE (AI & ML) · Sem 3',
          icon: <Layers className="w-4 h-4 text-purple-600" />,
          detail: 'Matches Hardware/Robotics & AI/ML elective profile',
          color: 'text-purple-700',
          borderColor: 'border-purple-200',
          bgLight: 'bg-purple-50/70'
        },
        {
          system: 'SYSTEM 3: VENUE & LAB',
          badge: '📍 Campus Location',
          source: 'S202, SR Block',
          icon: <MapPin className="w-4 h-4 text-emerald-600" />,
          detail: 'School of Engineering and Sciences (SEAS)',
          color: 'text-emerald-700',
          borderColor: 'border-emerald-200',
          bgLight: 'bg-emerald-50/70'
        },
        {
          system: 'SYSTEM 4: DEADLINE & ACTION',
          badge: '⏰ Action Item',
          source: 'Priority Engine (Score: 84)',
          icon: <CheckCircle className="w-4 h-4 text-amber-600" />,
          detail: 'Submit registration form before Sept 29 05:00 PM',
          color: 'text-amber-700',
          borderColor: 'border-amber-200',
          bgLight: 'bg-amber-50/70'
        }
      ]
    }
  };

  const current = scenarios[activeScenario];

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-5 space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                CONNECTED CAMPUS INFORMATION
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                PS02 ARCHITECTURE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Transforming disconnected university silos into unified student intelligence
            </p>
          </div>
        </div>

        {/* Scenario Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveScenario('exam')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeScenario === 'exam'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Exam Shift
          </button>
          <button
            onClick={() => setActiveScenario('closure')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeScenario === 'closure'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rain Closure
          </button>
          <button
            onClick={() => setActiveScenario('robotics')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeScenario === 'robotics'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Robotics Workshop
          </button>
        </div>
      </div>

      {/* Visual Pipeline with animated connection arrows */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {current.nodes.map((node, index) => (
          <div key={index} className="relative group">
            <div className={`h-full p-3.5 rounded-xl border ${node.borderColor} ${node.bgLight} transition-all hover:shadow-md hover:scale-101 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                    {node.system}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                    {node.badge}
                  </span>
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <div className="mt-0.5 shrink-0">{node.icon}</div>
                  <div>
                    <p className={`text-xs font-bold ${node.color} line-clamp-1`}>
                      {node.source}
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {node.detail}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connecting arrow for larger screens */}
            {index < current.nodes.length - 1 && (
              <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-indigo-200 text-indigo-600 items-center justify-center shadow-xs">
                <ArrowRight className="w-3.5 h-3.5 animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Synthesis Output Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              CAMPUSPULSE AI SYNTHESIS
            </h4>
          </div>
          <p className="text-xs text-indigo-900 leading-relaxed font-medium">
            "{current.integratedInsight}"
          </p>
        </div>
        <div className="shrink-0 sm:max-w-xs p-2.5 bg-white/90 backdrop-blur-xs rounded-lg border border-indigo-200 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Recommended Action</p>
          <p className="text-xs font-bold text-slate-800 mt-0.5">{current.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
};
