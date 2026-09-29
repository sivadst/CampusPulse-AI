import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, ExternalLink, Mail, Award, Filter, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';
import { ClassroomCourse, ClassroomCoursework, ClassroomAnnouncement } from '../types';
import { useApp } from '../context/AppContext';

export const ClassroomPage: React.FC = () => {
  const { openEmailById, addToast } = useApp();
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [coursework, setCoursework] = useState<ClassroomCoursework[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  useEffect(() => {
    loadClassroomData();
  }, []);

  const loadClassroomData = async () => {
    setLoading(true);
    try {
      const [c, w, a] = await Promise.all([
        ApiService.getClassroomCourses(),
        ApiService.getClassroomCoursework(),
        ApiService.getClassroomAnnouncements()
      ]);
      setCourses(c);
      setCoursework(w);
      setAnnouncements(a);
    } catch (err) {
      console.warn('Failed to load classroom records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await ApiService.syncGoogle();
      addToast({
        title: "Classroom Synced",
        message: `Synced ${res.classroomCourses} courses & ${res.classroomAssignments} assignments in ${res.durationMs}ms`,
        priority: "LOW"
      });
      await loadClassroomData();
    } catch (err) {
      addToast({
        title: "Sync Failed",
        message: "Could not synchronize Google Classroom",
        priority: "HIGH"
      });
    } finally {
      setSyncing(false);
    }
  };

  const filteredCoursework = selectedCourseId === 'ALL'
    ? coursework
    : coursework.filter(w => w.courseId === selectedCourseId);

  const filteredAnnouncements = selectedCourseId === 'ALL'
    ? announcements
    : announcements.filter(a => a.courseId === selectedCourseId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-800/30 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Google Classroom Intelligence</h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Read-Only API
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Synchronized coursework, deadlines, quizzes, and class announcements for B.Tech CSE (AI & ML)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Classroom'}
          </button>
        </div>
      </div>

      {/* Course Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        <button
          onClick={() => setSelectedCourseId('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            selectedCourseId === 'ALL'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50'
          }`}
        >
          All Courses ({courses.length})
        </button>
        {courses.map(course => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseId(course.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              selectedCourseId === course.id
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50'
            }`}
          >
            {course.name.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Active Courses Grid */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <span>Active Enrolled Courses</span>
          <span className="text-xs font-normal text-slate-400">({courses.length} courses tracked)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map(c => (
            <div
              key={c.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedCourseId === c.id
                  ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {c.section || 'SEAS'}
                </span>
                {c.alternateLink && (
                  <a
                    href={c.alternateLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-emerald-400 transition-colors"
                    title="Open in Google Classroom"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <h3 className="font-semibold text-white text-sm line-clamp-1 mb-1">{c.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3 h-8">
                {c.descriptionHeading || 'Coursework & laboratory assignments'}
              </p>
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Room: <strong className="text-slate-300">{c.room || 'Campus'}</strong></span>
                <span>{c.teacherName?.split(' ')[0] || 'Faculty'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coursework & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Assignments & Evaluated Work</span>
              <span className="text-xs font-normal text-slate-400">({filteredCoursework.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {filteredCoursework.map(w => {
              const isTurnedIn = w.submissionStatus === 'TURNED_IN';
              return (
                <div
                  key={w.id}
                  className="p-5 bg-slate-900/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {w.courseName.split(':')[0]}
                      </span>
                      {w.priority === 'CRITICAL' && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                          CRITICAL DUE
                        </span>
                      )}
                      {w.priority === 'HIGH' && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {isTurnedIn ? (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Turned In
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-medium">
                          <Clock className="w-3.5 h-3.5" /> Assigned
                        </span>
                      )}
                      {w.maxPoints && (
                        <span className="flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          <Award className="w-3 h-3 text-amber-400" /> {w.maxPoints} pts
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-semibold text-white text-base mb-1.5">{w.title}</h3>
                  {w.description && (
                    <p className="text-xs text-slate-300 leading-relaxed mb-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/40">
                      {w.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Due: <strong className="text-slate-200">{w.dueDate || 'No due date'} {w.dueTime ? `· ${w.dueTime}` : ''}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      {w.relatedEmailId && (
                        <button
                          onClick={() => openEmailById(w.relatedEmailId!)}
                          className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded transition-colors cursor-pointer border border-indigo-500/20"
                          title="Open associated email notification"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Linked Gmail notice</span>
                        </button>
                      )}
                      {w.alternateLink && (
                        <a
                          href={w.alternateLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded transition-colors"
                        >
                          <span>Open in Classroom</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Announcements Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-400" />
              <span>Course Announcements</span>
            </h2>
          </div>

          <div className="space-y-3">
            {filteredAnnouncements.map(a => (
              <div
                key={a.id}
                className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {a.courseName.split(':')[0]}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(a.creationTime).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {a.text}
                </p>
                {a.relatedEmailId && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => openEmailById(a.relatedEmailId!)}
                      className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3 h-3" />
                      <span>View matching email notice</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
