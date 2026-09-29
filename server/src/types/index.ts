export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type Category = 
  | 'ACADEMICS'
  | 'EXAMS'
  | 'ATTENDANCE'
  | 'ASSIGNMENTS'
  | 'TIMETABLE'
  | 'COURSE REGISTRATION'
  | 'EVENTS'
  | 'TECH EVENTS'
  | 'HACKATHONS'
  | 'STUDENT CLUBS'
  | 'CLUBS'
  | 'PLACEMENTS'
  | 'ENTREPRENEURSHIP'
  | 'FEES'
  | 'HOSTEL'
  | 'TRANSPORT'
  | 'ADMINISTRATION'
  | 'EMERGENCY'
  | 'FACILITIES'
  | 'LIBRARY'
  | 'SCHOLARSHIPS'
  | 'GENERAL';

export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface EmailData {
  id: string;
  sender: string;
  senderName: string;
  recipient: string;
  cc?: string[];
  subject: string;
  body: string;
  timestamp: string; // ISO
  dateFormatted: string;
  category: Category;
  priority: Priority;
  priorityScore: number;
  priorityReason: string;
  categoryReason: string;
  summary: string;
  actionRequired: boolean;
  actionText?: string;
  actionDeadline?: string;
  deadlineDate?: string;
  eventDate?: string;
  location?: string;
  affectedGroup?: string;
  urgency: Priority;
  tags: string[];
  isRead: boolean;
  isActionCompleted?: boolean;
  source: 'demo' | 'gmail';
  attachments?: EmailAttachment[];
  threadId?: string;
  isNoise?: boolean;
  systemOrigin?: string;
  // Cross-system links
  relatedClassroomCourseId?: string;
  relatedClassroomWorkId?: string;
  relatedCalendarEventId?: string;
  isCalendarAdded?: boolean;
  calendarEventId?: string;
}

export interface ActionItem {
  id: string;
  emailId: string;
  title: string;
  category: Category;
  priority: Priority;
  deadline?: string;
  deadlineDate?: string;
  completed: boolean;
  completedAt?: string;
  snoozedUntil?: string;
  sourceEmailSubject: string;
  sourceSender: string;
  location?: string;
  relatedCalendarEventId?: string;
  isCalendarEligible?: boolean;
}

export interface FactorBreakdown {
  deadlineProximityScore: number;
  immediateActionScore: number;
  academicConsequenceScore: number;
  financialConsequenceScore: number;
  safetyScore: number;
  transportDisruptionScore: number;
  examAttendanceImpactScore: number;
  urgencyKeywordsScore: number;
}

export interface PriorityEvaluation {
  priority: Priority;
  priorityScore: number;
  priorityReason: string;
  categoryReason: string;
  factors: FactorBreakdown;
}

export interface EmailAnalysisResult {
  category: Category;
  priority: Priority;
  priorityScore: number;
  summary: string;
  deadline?: string;
  actionRequired: boolean;
  action?: string;
  eventDate?: string;
  location?: string;
  affectedGroup?: string;
  urgency: Priority;
  reason: string;
  categoryReason: string;
  aiProvider: 'gemini' | 'mock-fallback';
}

export interface CampusBriefingResult {
  date: string;
  greeting: string;
  studentName: string;
  headline: string;
  criticalCount: number;
  highCount: number;
  upcomingDeadlinesCount: number;
  academicUpdatesCount: number;
  summaryBullets: {
    emoji: string;
    priority: Priority;
    title: string;
    description: string;
    emailId?: string;
    sourceType?: 'email' | 'classroom' | 'calendar';
  }[];
  motivationalNote: string;
  aiProvider: 'gemini' | 'mock-fallback';
}

export interface ScheduleChangeItem {
  topic: string;
  previousValue: string;
  newValue: string;
  changeType: 'LOCATION' | 'DEADLINE' | 'TIMING' | 'CANCELLATION';
  summary: string;
  emailId: string;
  whatChanged?: string;
  whyItMatters?: string;
  whatYouNeedToDo?: string;
}

// Google Classroom Models
export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  alternateLink?: string;
  courseState?: string;
  teacherName?: string;
  enrollmentCode?: string;
}

export interface ClassroomCoursework {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description?: string;
  state?: 'PUBLISHED' | 'DRAFT' | 'DELETED' | string;
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  dueDateTimeISO?: string;
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION' | string;
  submissionStatus?: 'SUBMITTED' | 'NEW' | 'TURNED_IN' | 'RETURNED' | 'LATE' | 'ASSIGNED' | string;
  priority: Priority;
  relatedEmailId?: string;
  isCalendarAdded?: boolean;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  courseName: string;
  text: string;
  alternateLink?: string;
  creationTime: string;
  updateTime?: string;
  creatorName?: string;
  relatedEmailId?: string;
}

export interface ClassroomSubmission {
  id: string;
  courseId: string;
  courseWorkId: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT' | string;
  late?: boolean;
  assignedGrade?: number;
}

// Google Calendar Models
export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string; // ISO
  endTime: string; // ISO
  allDay?: boolean;
  isAllDay?: boolean;
  status?: string;
  htmlLink?: string;
  source?: string;
  sourceType?: 'google' | 'detected_email' | 'detected_classroom' | string;
  sourceId?: string;
  isCreatedByApp?: boolean;
}

export interface CalendarConflictCheckResult {
  hasConflict: boolean;
  conflictingEvents: GoogleCalendarEvent[];
  isDuplicate?: boolean;
  existingEventId?: string;
  message?: string;
}

// Google Unified Sync & Connection Status
export interface GoogleServiceStatus {
  isConnected?: boolean;
  connected?: boolean;
  configured?: boolean;
  userEmail: string | null;
  userName?: string | null;
  userPicture?: string | null;
  lastSync?: string | null;
  scopes?: string[];
  gmail?: {
    connected: boolean;
    lastSync: string | null;
    messageCount?: number;
    readOnly?: boolean;
  };
  classroom?: {
    connected: boolean;
    lastSync: string | null;
    courseCount?: number;
    assignmentCount?: number;
    announcementCount?: number;
    readOnly?: boolean;
  };
  calendar?: {
    connected: boolean;
    lastSync: string | null;
    eventCount?: number;
    readOnly?: boolean;
  };
  gemini?: {
    connected?: boolean;
    configured?: boolean;
    model: string;
    status?: string;
  };
  maps?: {
    configured: boolean;
  };
  services?: any;
}

export interface GoogleSyncResult {
  success?: boolean;
  gmailImported: number;
  gmailSkipped: number;
  classroomCourses: number;
  classroomAssignments: number;
  classroomAnnouncements: number;
  calendarEvents: number;
  newActions: number;
  updatedItems: number;
  durationMs: number;
  timestamp?: string;
  message?: string;
}

// AI Tool Calling & Grounding Models
export interface SourceCitation {
  sourceType?: 'email' | 'classroom' | 'calendar' | string;
  type?: 'gmail' | 'classroom' | 'calendar' | 'university' | string;
  id: string;
  title: string;
  detail?: string;
  snippet?: string;
  date?: string;
  timestamp?: string;
  url?: string;
}

export interface AssistantQueryResult {
  answer: string;
  suggestedActions: string[];
  referencedEmailIds: string[];
  toolUsed?: string;
  citations?: SourceCitation[];
}


export interface DashboardData {
  mode: 'demo' | 'live' | 'gmail';
  student: {
    name: string;
    university: string;
    program: string;
    school?: string;
    email?: string;
    semester: number;
  };
  metrics: {
    totalAnalyzed: number;
    requireAttention: number;
    criticalCount: number;
    highPriorityCount: number;
    mediumPriorityCount: number;
    lowPriorityCount: number;
    upcomingDeadlinesCount: number;
    actionsCompleted: number;
    actionsPending: number;
    classroomAssignmentsCount?: number;
    calendarEventsCount?: number;
  };
  campusPulse: {
    activityLevel: 'HIGH' | 'NORMAL' | 'ELEVATED';
    recentSignalsCount: number;
    waveform: number[];
    lastSignalTime: string;
  };
  urgentActions: ActionItem[];
  recentEmails: EmailData[];
  categoryCounts: Record<string, number>;
  todayTimeline: {
    time: string;
    title: string;
    category: Category;
    priority: Priority;
    emailId: string;
    location?: string;
    sourceType?: 'email' | 'classroom' | 'calendar';
  }[];
  briefing: CampusBriefingResult;
  whatChanged: ScheduleChangeItem[];
  classroomAssignments?: ClassroomCoursework[];
  classroomAnnouncements?: ClassroomAnnouncement[];
  calendarEvents?: GoogleCalendarEvent[];
  googleStatus?: GoogleServiceStatus;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  priority?: Priority | string;
  emailId?: string;
  time?: string;
}

