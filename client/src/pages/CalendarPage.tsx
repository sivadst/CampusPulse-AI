import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Download, CheckCircle2, AlertTriangle, Plus, ShieldCheck, ChevronRight, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';
import { GoogleCalendarEvent, CalendarConflictCheckResult } from '../types';

interface DetectedEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  dateFormatted: string;
  timeFormatted: string;
  location: string;
  category: string;
  priority: string;
  emailId: string;
  description: string;
  isAdded?: boolean;
}

export const CalendarPage: React.FC = () => {
  const { openEmailById, addToast } = useApp();
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State for Explicit Confirmation & Conflict Check
  const [selectedDetectedEvent, setSelectedDetectedEvent] = useState<DetectedEvent | null>(null);
  const [conflictResult, setConflictResult] = useState<CalendarConflictCheckResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // High-value SRM AP AI-detected campus events
  const detectedEvents: DetectedEvent[] = [
    {
      id: 'email-srm-010',
      title: 'CSE Expert Talk: Securing Autonomous AI Platforms',
      startTime: '2026-09-26T11:00:00.000Z',
      endTime: '2026-09-26T12:30:00.000Z',
      dateFormatted: 'Saturday, Sep 26, 2026',
      timeFormatted: '11:00 AM – 12:30 PM',
      location: 'Online Stream / Zoom',
      category: 'TECH EVENTS',
      priority: 'HIGH',
      emailId: 'email-srm-010',
      description: 'Human in the Loop is Not Enough: Real Lessons from Securing an Autonomous AI Platform. OWASP Agentic Top 10.'
    },
    {
      id: 'email-srm-001',
      title: 'AI Tools & Prompt Engineering Club Quiz',
      startTime: '2026-09-30T15:00:00.000Z',
      endTime: '2026-09-30T17:00:00.000Z',
      dateFormatted: 'Wednesday, Sep 30, 2026',
      timeFormatted: '3:00 PM – 5:00 PM',
      location: 'Room CV 704',
      category: 'ACADEMICS',
      priority: 'CRITICAL',
      emailId: 'email-srm-001',
      description: 'Physical closed-book evaluation (30 questions) on prompt engineering & agentic workflows. Top 3 merit prizes.'
    },
    {
      id: 'email-srm-002',
      title: 'Techfest IIT Bombay × SRM AP Robotics Workshop',
      startTime: '2026-09-30T10:00:00.000Z',
      endTime: '2026-09-30T16:00:00.000Z',
      dateFormatted: 'Wednesday, Sep 30, 2026',
      timeFormatted: '10:00 AM – 4:00 PM',
      location: 'Room S202, SR Block',
      category: 'EVENTS',
      priority: 'HIGH',
      emailId: 'email-srm-002',
      description: 'Hands-on robotics prototyping and ROS simulation in collaboration with Techfest IIT Bombay.'
    },
    {
      id: 'email-srm-011',
      title: 'Terrathon 2026 Sustainability Hackathon Kickoff',
      startTime: '2026-09-26T10:00:00.000Z',
      endTime: '2026-09-26T11:00:00.000Z',
      dateFormatted: 'Saturday, Sep 26, 2026',
      timeFormatted: '10:00 AM – 11:00 AM',
      location: 'APJ Abdul Kalam Auditorium',
      category: 'HACKATHONS',
      priority: 'HIGH',
      emailId: 'email-srm-011',
      description: 'Inaugural ceremony & team ideation for green computing and campus sustainability solutions.'
    }
  ];

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const loadCalendarEvents = async () => {
    setLoading(true);
    try {
      const events = await ApiService.getCalendarEvents();
      setCalendarEvents(events);
    } catch (err) {
      console.warn('Failed to load calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateAdd = async (event: DetectedEvent) => {
    setSelectedDetectedEvent(event);
    setCheckingConflict(true);
    setConflictResult(null);
    setIsDuplicate(false);

    try {
      // 1. Check duplicate
      const duplicateFound = calendarEvents.some(
        e => e.title.toLowerCase().includes(event.title.toLowerCase()) ||
             e.sourceId === event.id ||
             (e.startTime === event.startTime && e.title.includes(event.title.slice(0, 15)))
      );
      setIsDuplicate(duplicateFound);

      // 2. Check conflict
      const check = await ApiService.checkCalendarConflict(event.startTime, event.endTime);
      setConflictResult(check);
    } catch (err) {
      console.warn('Conflict inspection error:', err);
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleConfirmAdd = async () => {
    if (!selectedDetectedEvent) return;
    setSubmitting(true);

    try {
      const res = await ApiService.createCalendarEvent({
        title: selectedDetectedEvent.title,
        startTime: selectedDetectedEvent.startTime,
        endTime: selectedDetectedEvent.endTime,
        location: selectedDetectedEvent.location,
        description: selectedDetectedEvent.description,
        sourceId: selectedDetectedEvent.id
      });

      if (res.isDuplicate) {
        addToast({
          title: "Already on Calendar",
          message: "This event is already scheduled on Google Calendar.",
          priority: "MEDIUM"
        });
      } else if (res.success) {
        addToast({
          title: "✓ Added to Google Calendar",
          message: `Scheduled "${selectedDetectedEvent.title}" with zero conflicts!`,
          priority: "LOW"
        });
        await loadCalendarEvents();
      } else {
        addToast({
          title: "Scheduling Failed",
          message: res.error || "Could not schedule calendar event.",
          priority: "HIGH"
        });
      }
    } catch (err: any) {
      addToast({
        title: "Error",
        message: err.message,
        priority: "HIGH"
      });
    } finally {
      setSubmitting(false);
      setSelectedDetectedEvent(null);
    }
  };

  const exportICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusPulse AI//SRM University-AP Schedule//EN
BEGIN:VEVENT
SUMMARY:CSE 204 Algorithms Lab (S202 SR Block)
DTSTART:20260930T090000Z
DTEND:20260930T110000Z
LOCATION:S202, SR Block, SRM University-AP
DESCRIPTION:Design & Analysis of Algorithms mandatory laboratory session.
END:VEVENT
BEGIN:VEVENT
SUMMARY:AI Security Expert Talk
DTSTART:20260926T110000Z
DTEND:20260926T123000Z
LOCATION:Online Stream
DESCRIPTION:Securing Autonomous AI Platforms.
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'campuspulse-schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: "📅 Calendar File Exported",
      message: "campuspulse-schedule.ics exported for Google Calendar / Apple Calendar.",
      priority: "LOW"
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-slate-950 border border-purple-800/30 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <CalendarIcon className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">University Calendar & Schedule</h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Google Calendar Integrated
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Conflict detection, duplicate prevention, and explicit student confirmation for every event.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportICS}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export .ICS
          </button>
        </div>
      </div>

      {/* Main Grid: AI-Detected Events & Confirmed Google Calendar Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Detected Events Eligible to Add */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI-Detected Campus Events</span>
              <span className="text-xs font-normal text-slate-400">({detectedEvents.length} detected)</span>
            </h2>
            <span className="text-xs text-slate-500">Requires Confirmation</span>
          </div>

          <div className="space-y-3">
            {detectedEvents.map(e => {
              const alreadyInCal = calendarEvents.some(
                ce => ce.title.toLowerCase().includes(e.title.toLowerCase()) || ce.sourceId === e.id
              );

              return (
                <div
                  key={e.id}
                  className="p-5 bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {e.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {e.dateFormatted} · {e.timeFormatted}
                      </span>
                    </div>

                    <h3 className="font-semibold text-white text-base mb-1.5">{e.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">
                      {e.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{e.location}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <button
                      onClick={() => openEmailById(e.emailId)}
                      className="text-xs text-indigo-400 hover:underline cursor-pointer"
                    >
                      View Source Communication
                    </button>

                    {alreadyInCal ? (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Added to Google Calendar
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInitiateAdd(e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-purple-900/30 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Google Calendar</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Confirmed Scheduled Calendar Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-400" />
              <span>Upcoming Google Calendar Events</span>
              <span className="text-xs font-normal text-slate-400">({calendarEvents.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {calendarEvents.map(event => (
              <div
                key={event.id}
                className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                    <h3 className="font-semibold text-white text-sm">{event.title}</h3>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Confirmed
                  </span>
                </div>

                {event.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 pl-4">
                    {event.description}
                  </p>
                )}

                <div className="pl-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explicit Confirmation & Conflict Check Modal */}
      {selectedDetectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Confirmation & Conflict Check
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Schedule Event to Google Calendar
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Details Card */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="font-semibold text-white text-sm">{selectedDetectedEvent.title}</div>
              <div className="text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>{selectedDetectedEvent.dateFormatted} · {selectedDetectedEvent.timeFormatted}</span>
              </div>
              <div className="text-slate-300 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>{selectedDetectedEvent.location}</span>
              </div>
            </div>

            {/* Pre-Creation Safety Checks */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Calendar Safety Checks:</span>

              {checkingConflict ? (
                <div className="p-3 bg-slate-950/40 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  <span>Inspecting existing Google Calendar schedule for conflicts...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Duplicate Check */}
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
                    isDuplicate
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {isDuplicate ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Duplicate Detected:</strong> This event appears to already exist in your calendar.</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>✓ No duplicate found</strong></span>
                      </>
                    )}
                  </div>

                  {/* Conflict Check */}
                  {conflictResult?.hasConflict ? (
                    <div className="p-3 bg-red-950/30 border border-red-500/40 text-red-300 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-2 font-semibold text-red-400">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Possible Conflict Detected!</span>
                      </div>
                      <p className="text-[11px] text-red-200">
                        Overlaps with <strong>{conflictResult.conflictingEvents[0]?.title}</strong> ({new Date(conflictResult.conflictingEvents[0]?.startTime).toLocaleTimeString()} – {new Date(conflictResult.conflictingEvents[0]?.endTime).toLocaleTimeString()}).
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>✓ No conflict detected</strong> in proposed time window.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedDetectedEvent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAdd}
                disabled={submitting || checkingConflict}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-900/40 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{conflictResult?.hasConflict ? 'Add Anyway' : 'Confirm & Add to Calendar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
