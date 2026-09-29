import fs from 'fs';
import path from 'path';
import { EmailData, ActionItem, DashboardData, Category, Priority, ClassroomCourse, ClassroomCoursework, ClassroomAnnouncement, GoogleCalendarEvent } from '../types';
import { ActionExtractor } from '../services/actions/ActionExtractor';
import { RelationshipEngine } from '../services/relationships/RelationshipEngine';
import { AIService } from '../services/ai/AIService';
import { UniversityFilter } from '../services/filter/UniversityFilter';
import { ClassroomService } from '../services/google/ClassroomService';
import { CalendarService } from '../services/google/CalendarService';

export class DatabaseService {
  private static instance: DatabaseService;
  private emails: EmailData[] = [];
  private actions: ActionItem[] = [];
  private classroomCourses: ClassroomCourse[] = [];
  private classroomCoursework: ClassroomCoursework[] = [];
  private classroomAnnouncements: ClassroomAnnouncement[] = [];
  private calendarEvents: GoogleCalendarEvent[] = [];
  private lastSyncTime: string | null = null;
  private mode: 'demo' | 'gmail' = 'demo';
  private simulatedCount = 0;
  private pulseWaveform: number[] = [45, 60, 35, 75, 95, 85, 65, 70, 90, 85, 60, 50, 80, 95, 45];
  private lastPulseTime: string = new Date().toISOString();

  private studentProfile = {
    name: "Muthu",
    university: "SRM University-AP",
    school: "School of Engineering and Sciences (SEAS)",
    program: "B.Tech Computer Science and Engineering",
    specialisation: "AI & ML",
    semester: 3,
    email: "demo.student@srmap.edu.in"
  };

  private constructor() {
    this.loadInitialDataset();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public loadInitialDataset(): void {
    try {
      const dataPath = path.resolve(__dirname, '../data/demo-emails.json');
      if (fs.existsSync(dataPath)) {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        this.emails = JSON.parse(raw);
      } else {
        console.warn('demo-emails.json not found, using empty array');
        this.emails = [];
      }
    } catch (err) {
      console.error('Failed to load demo-emails.json:', err);
      this.emails = [];
    }

    // Filter out external noise emails from primary university communications
    this.emails = this.emails.filter(e => !e.isNoise && UniversityFilter.isUniversityEmail(e.sender, e.recipient));
    this.actions = ActionExtractor.extractActions(this.emails);

    // Load initial Classroom and Calendar records
    const demoClassroom = ClassroomService.getInstance().getDemoClassroomData();
    this.classroomCourses = demoClassroom.courses;
    this.classroomCoursework = demoClassroom.coursework;
    this.classroomAnnouncements = demoClassroom.announcements;

    // Cross-link Classroom work with emails if applicable
    for (const email of this.emails) {
      for (const work of this.classroomCoursework) {
        if (work.relatedEmailId === email.id) {
          email.relatedClassroomCourseId = work.courseId;
          email.relatedClassroomWorkId = work.id;
        }
      }
    }

    this.mode = 'demo';
    this.simulatedCount = 0;
    this.lastPulseTime = new Date().toISOString();
  }


  public getEmails(): EmailData[] {
    return this.emails;
  }

  public getEmailById(id: string): EmailData | undefined {
    return this.emails.find(e => e.id === id);
  }

  public markEmailRead(id: string, isRead: boolean = true): boolean {
    const email = this.emails.find(e => e.id === id);
    if (email) {
      email.isRead = isRead;
      return true;
    }
    return false;
  }

  public getActions(): ActionItem[] {
    return this.actions;
  }

  public toggleAction(actionId: string): ActionItem | undefined {
    const action = this.actions.find(a => a.id === actionId);
    if (action) {
      action.completed = !action.completed;
      action.completedAt = action.completed ? new Date().toISOString() : undefined;
      const email = this.emails.find(e => e.id === action.emailId);
      if (email) {
        email.isActionCompleted = action.completed;
      }
      return action;
    }
    return undefined;
  }

  public addAction(item: Omit<ActionItem, 'id'>): ActionItem {
    const newItem: ActionItem = {
      ...item,
      id: `custom-action-${Date.now()}`
    };
    this.actions.unshift(newItem);
    return newItem;
  }

  public getMode(): 'demo' | 'gmail' {
    return this.mode;
  }

  public setMode(mode: 'demo' | 'gmail'): void {
    this.mode = mode;
  }

  public getStudentProfile() {
    return this.studentProfile;
  }

  public updateStudentProfile(profile: Partial<typeof this.studentProfile>) {
    this.studentProfile = { ...this.studentProfile, ...profile };
  }

  // --- Classroom State ---
  public getClassroomCourses(): ClassroomCourse[] {
    return this.classroomCourses;
  }

  public getClassroomCoursework(): ClassroomCoursework[] {
    return this.classroomCoursework;
  }

  public getClassroomAnnouncements(): ClassroomAnnouncement[] {
    return this.classroomAnnouncements;
  }

  public setClassroomData(
    courses: ClassroomCourse[],
    coursework: ClassroomCoursework[],
    announcements: ClassroomAnnouncement[]
  ): void {
    this.classroomCourses = courses;
    this.classroomCoursework = coursework;
    this.classroomAnnouncements = announcements;
  }

  // --- Calendar State ---
  public getCalendarEvents(): GoogleCalendarEvent[] {
    return this.calendarEvents.length > 0 ? this.calendarEvents : [
      {
        id: 'cal-event-1',
        title: 'CSE 204: Algorithms Laboratory & Theory',
        description: 'Design and Analysis of Algorithms mandatory laboratory session.',
        startTime: '2026-09-30T09:00:00.000Z',
        endTime: '2026-09-30T11:00:00.000Z',
        location: 'S202, SR Block',
        isAllDay: false,
        source: 'google'
      },
      {
        id: 'cal-event-2',
        title: 'CEL Mentor Review — Team Pitching',
        description: 'In-person mentor review with Rakesh Sir at Directorate of Entrepreneurship.',
        startTime: '2026-09-29T15:50:00.000Z',
        endTime: '2026-09-29T16:30:00.000Z',
        location: 'Directorate of Entrepreneurship, Level 2',
        isAllDay: false,
        source: 'google'
      },
      {
        id: 'cal-event-3',
        title: 'CSE Expert Talk: Securing Autonomous AI Platforms',
        description: 'Guest talk on AI Governance, threat modeling, and OWASP Agentic Top 10.',
        startTime: '2026-09-26T11:00:00.000Z',
        endTime: '2026-09-26T12:30:00.000Z',
        location: 'Online (Zoom / University Stream)',
        isAllDay: false,
        source: 'google'
      },
      {
        id: 'cal-event-4',
        title: 'Terrathon 2026 — Sustainability Hackathon',
        description: 'Green computing & sustainable systems hackathon kickoff.',
        startTime: '2026-09-26T10:00:00.000Z',
        endTime: '2026-09-26T11:00:00.000Z',
        location: 'APJ Abdul Kalam Auditorium',
        isAllDay: false,
        source: 'google'
      }
    ];
  }

  public setCalendarEvents(events: GoogleCalendarEvent[]): void {
    this.calendarEvents = events;
  }

  // --- Dynamic Ingestion & Action Refresh ---
  public addEmails(newEmails: EmailData[]): void {
    const existingIds = new Set(this.emails.map(e => e.id));
    const toAdd = newEmails.filter(e => !existingIds.has(e.id));
    this.emails.unshift(...toAdd);
    this.refreshActions();
  }

  public refreshActions(): void {
    this.actions = ActionExtractor.extractActions(this.emails);
  }

  public getLastSyncTime(): string | null {
    return this.lastSyncTime;
  }

  public setLastSyncTime(time: string): void {
    this.lastSyncTime = time;
  }


  public simulateNewEmail(preset?: string): EmailData {
    this.simulatedCount++;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formattedTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    let simulated: EmailData;

    switch (preset) {
      case 'srm_acm':
        simulated = {
          id: `sim-srm-${Date.now()}`,
          sender: "acm.core@srmap.edu.in",
          senderName: "ACM Student Chapter, SRM AP",
          recipient: "demo.student@srmap.edu.in",
          subject: "REMINDER: ACM Student Chapter Recruitment Applications Close Tomorrow!",
          body: `Dear Engineering Students,\n\nThis is a final reminder that applications for ACM Student Chapter Sub-Teams (R&D, Hackathons, PR, and Design) close tomorrow, September 30, at 11:59 PM.\n\nShortlisted candidates will be notified for interviews at SR Block ACM Hub.\n\nApply now: forms.srmap.edu.in/acm-recruitment-2026\n\nACM Core Committee, SRM University-AP`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: "STUDENT CLUBS",
          priority: "HIGH",
          priorityScore: 82,
          priorityReason: "ACM Student Chapter recruitment applications closing within 24 hours.",
          categoryReason: "Student club and technical chapter application deadline.",
          summary: "Final reminder: ACM Chapter recruitment applications close tomorrow night at 11:59 PM.",
          actionRequired: true,
          actionText: "Submit ACM Student Chapter application before tomorrow 11:59 PM",
          actionDeadline: "Tomorrow, 11:59 PM",
          deadlineDate: new Date(now.getTime() + 24 * 3600 * 1000).toISOString(),
          location: "ACM Hub, SR Block",
          affectedGroup: "All SEAS Students",
          urgency: "HIGH",
          tags: ["acm", "recruitment", "deadline", "student-clubs"],
          isRead: false,
          source: "demo",
          systemOrigin: "Student Activity",
          threadId: "thread-acm-recruitment"
        };
        break;

      case 'srm_closure':
        simulated = {
          id: `sim-srm-${Date.now()}`,
          sender: "registrar.office@srmap.edu.in",
          senderName: "Registrar Office, SRM University-AP",
          recipient: "demo.student@srmap.edu.in",
          subject: "CIRCULAR: Severe Weather Red Alert – Academic Operations Suspended",
          body: `URGENT CAMPUS ADVISORY:\n\nIn compliance with Andhra Pradesh State Disaster Authority meteorological advisories regarding squally storm surges, all in-person classes, laboratory examinations, and administrative cells at the Neerukonda campus are suspended tomorrow.\n\nHostel mess services in Ganga and Yamuna blocks remain active 24/7. Emergency contact: Security Desk Ext 100.\n\nRegistrar, SRM University-AP, Andhra Pradesh`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: "EMERGENCY",
          priority: "CRITICAL",
          priorityScore: 99,
          priorityReason: "Severe weather red alert. Physical campus operations and labs suspended tomorrow.",
          categoryReason: "Institutional emergency safety circular.",
          summary: "Severe weather alert: in-person classes and labs suspended tomorrow. Hostel mess active 24/7.",
          actionRequired: true,
          actionText: "Remain inside hostel premises; track online makeup class schedules",
          actionDeadline: "Tonight by 8:00 PM",
          deadlineDate: now.toISOString(),
          location: "Neerukonda Campus Grounds",
          affectedGroup: "All Students and Faculty",
          urgency: "CRITICAL",
          tags: ["emergency", "weather", "campus-closed", "srmap"],
          isRead: false,
          source: "demo",
          systemOrigin: "Administrative Portal",
          threadId: "thread-closure-schedule"
        };
        break;

      case 'srm_transport':
        simulated = {
          id: `sim-srm-${Date.now()}`,
          sender: "communications@srmap.edu.in",
          senderName: "Campus Transit & Fleet Operations, SRM AP",
          recipient: "demo.student@srmap.edu.in",
          subject: "Transport Alert: Vijayawada Express Shuttle Delayed 25 Minutes",
          body: `Notice to all day-scholar commuters:\n\nDue to heavy traffic congestions near Prakasam Barrage, University Shuttle Bus #12 (Vijayawada Benz Circle to Neerukonda) is operating with a 25-minute delay.\n\nExpected arrival at campus: 8:50 AM. Drop-off will be at Main Gate Bay 2.\n\nTransport Directorate, SRM University-AP`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: "TRANSPORT",
          priority: "HIGH",
          priorityScore: 85,
          priorityReason: "Vijayawada express shuttle delayed by 25 mins. Arrival at 8:50 AM close to morning class cutoff.",
          categoryReason: "Campus transit route delay notice.",
          summary: "Vijayawada Shuttle Bus #12 delayed by 25 mins due to Barrage congestion; arrives at 8:50 AM at Gate Bay 2.",
          actionRequired: true,
          actionText: "Account for 25m transit delay for morning 9:00 AM class",
          actionDeadline: "Today, Morning Commute",
          location: "Main Gate Bay 2",
          affectedGroup: "Vijayawada Route Commuters",
          urgency: "HIGH",
          tags: ["transport", "delay", "vijayawada", "bus"],
          isRead: false,
          source: "demo",
          systemOrigin: "Campus Location",
          threadId: "thread-transport-transit"
        };
        break;

      case 'srm_exam':
      default:
        simulated = {
          id: `sim-srm-${Date.now()}`,
          sender: "hod.cse@srmap.edu.in",
          senderName: "Department of Computer Science and Engineering",
          recipient: "demo.student@srmap.edu.in",
          subject: "URGENT: Tomorrow's CSE 204 Exam Shifted to S202 SR Block",
          body: `URGENT NOTICE TO B.TECH CSE BATCH 2026:\n\nDue to server diagnostics in Central Hall, tomorrow's CSE 204 (Design and Analysis of Algorithms) examination has been relocated:\n\nNEW VENUE: Room S202, SR Block\nREPORTING CUTOFF: 8:40 AM sharp\nEXAM TIME: 9:00 AM – 11:00 AM\n\nPlease bring physical hall ticket and student ID.\n\nDepartment of CSE, SEAS, SRM University-AP`,
          timestamp: now.toISOString(),
          dateFormatted: `${formattedDate} · ${formattedTime}`,
          category: "EXAMS",
          priority: "CRITICAL",
          priorityScore: 98,
          priorityReason: "Emergency examination venue shift to S202 SR Block. Reporting required by 8:40 AM.",
          categoryReason: "Critical examination hall reassignment notice.",
          summary: "URGENT: Tomorrow's CSE 204 exam relocated to Room S202, SR Block. Arrive by 8:40 AM.",
          actionRequired: true,
          actionText: "Report to Room S202 SR Block by 8:40 AM for CSE 204 Algorithms exam",
          actionDeadline: "Tomorrow, 8:40 AM",
          deadlineDate: new Date(now.getTime() + 20 * 3600 * 1000).toISOString(),
          location: "S202, SR Block",
          affectedGroup: "B.Tech CSE Semester 3",
          urgency: "CRITICAL",
          tags: ["exam", "venue-change", "cse204", "sr-block"],
          isRead: false,
          source: "demo",
          systemOrigin: "Exam System",
          threadId: "thread-cse204-exam"
        };
        break;
    }

    this.emails.unshift(simulated);

    if (simulated.actionRequired && simulated.actionText) {
      this.actions.unshift({
        id: `action-${simulated.id}`,
        emailId: simulated.id,
        title: simulated.actionText,
        category: simulated.category as any,
        priority: simulated.priority,
        deadline: simulated.actionDeadline,
        deadlineDate: simulated.deadlineDate,
        completed: false,
        sourceEmailSubject: simulated.subject,
        sourceSender: simulated.senderName,
        location: simulated.location
      });
    }

    this.pulseWaveform = [95, 100, 85, 95, 80, 85, 90, 70, 75, 90, 95, 100, 85, 70, 55];
    this.lastPulseTime = now.toISOString();

    return simulated;
  }

  public async getDashboardData(): Promise<DashboardData> {
    const aiService = AIService.getInstance();
    const briefing = await aiService.generateBriefing(this.emails, this.studentProfile.name);
    const whatChanged = RelationshipEngine.getWhatChanged(this.emails);

    const criticalCount = this.emails.filter(e => e.priority === 'CRITICAL').length;
    const highPriorityCount = this.emails.filter(e => e.priority === 'HIGH').length;
    const mediumPriorityCount = this.emails.filter(e => e.priority === 'MEDIUM').length;
    const lowPriorityCount = this.emails.filter(e => e.priority === 'LOW').length;

    const requireAttention = this.actions.filter(a => !a.completed && (a.priority === 'CRITICAL' || a.priority === 'HIGH')).length;
    const actionsCompleted = this.actions.filter(a => a.completed).length;
    const actionsPending = this.actions.filter(a => !a.completed).length;

    const categoryCounts: Record<string, number> = {};
    this.emails.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });

    const urgentActions = this.actions
      .filter(a => !a.completed && (a.priority === 'CRITICAL' || a.priority === 'HIGH'))
      .slice(0, 5);

    const todayTimeline = [
      {
        time: "8:40 AM",
        title: "CSE 204 Exam Reporting Cutoff (Design & Analysis of Algorithms)",
        category: "EXAMS" as Category,
        priority: "CRITICAL" as Priority,
        emailId: "email-srm-003",
        location: "S202, SR Block"
      },
      {
        time: "10:00 AM",
        title: "Hands-On Robotics Workshop (Techfest IIT Bombay)",
        category: "EVENTS" as Category,
        priority: "HIGH" as Priority,
        emailId: "email-srm-002",
        location: "S202, SR Block"
      },
      {
        time: "12:00 PM",
        title: "CEL Presentation Deck Upload Deadline",
        category: "ACADEMICS" as Category,
        priority: "HIGH" as Priority,
        emailId: "email-srm-007",
        location: "CEL Portal / Admin Block"
      },
      {
        time: "3:50 PM",
        title: "CEL Mentor Review — Rakesh Sir's Team Reporting",
        category: "ACADEMICS" as Category,
        priority: "HIGH" as Priority,
        emailId: "email-srm-007",
        location: "Directorate of Entrepreneurship"
      },
      {
        time: "5:00 PM",
        title: "Attendance Condonation Form Submission Deadline",
        category: "ATTENDANCE" as Category,
        priority: "HIGH" as Priority,
        emailId: "email-srm-004",
        location: "Room 114, Administrative Block"
      }
    ];

    return {
      mode: this.mode,
      student: this.studentProfile,
      metrics: {
        totalAnalyzed: this.emails.length,
        requireAttention,
        criticalCount,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
        upcomingDeadlinesCount: 4,
        actionsCompleted,
        actionsPending
      },
      campusPulse: {
        activityLevel: criticalCount > 0 ? 'HIGH' : 'NORMAL',
        recentSignalsCount: this.emails.length,
        waveform: this.pulseWaveform,
        lastSignalTime: this.lastPulseTime
      },
      urgentActions,
      recentEmails: this.emails.slice(0, 10),
      categoryCounts,
      todayTimeline,
      briefing,
      whatChanged
    };
  }
}
