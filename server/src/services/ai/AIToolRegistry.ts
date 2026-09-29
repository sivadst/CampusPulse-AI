import { DatabaseService } from '../../db/DatabaseService';
import { CalendarService } from '../google/CalendarService';
import { RelationshipEngine } from '../relationships/RelationshipEngine';
import { EmailData, SourceCitation, ActionItem, ClassroomCourse, ClassroomCoursework, ClassroomAnnouncement, GoogleCalendarEvent } from '../../types';

export interface ToolExecutionResult {
  toolName: string;
  data: any;
  citations: SourceCitation[];
}

export class AIToolRegistry {
  private static instance: AIToolRegistry;

  private constructor() {}

  public static getInstance(): AIToolRegistry {
    if (!AIToolRegistry.instance) {
      AIToolRegistry.instance = new AIToolRegistry();
    }
    return AIToolRegistry.instance;
  }

  private getDb(): DatabaseService {
    return DatabaseService.getInstance();
  }

  // 1. searchEmails
  public searchEmails(query: string, filters?: { category?: string; priority?: string }): ToolExecutionResult {
    const q = query.toLowerCase();
    let emails = this.getDb().getEmails().filter(e =>
      e.subject.toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q) ||
      e.sender.toLowerCase().includes(q) ||
      e.senderName.toLowerCase().includes(q) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.actionText && e.actionText.toLowerCase().includes(q))
    );

    if (filters?.category) {
      emails = emails.filter(e => e.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.priority) {
      emails = emails.filter(e => e.priority.toLowerCase() === filters.priority!.toLowerCase());
    }

    const citations: SourceCitation[] = emails.slice(0, 5).map(e => ({
      id: e.id,
      title: e.subject,
      type: 'gmail',
      snippet: e.summary || e.body.slice(0, 100),
      timestamp: e.timestamp
    }));

    return { toolName: 'searchEmails', data: emails.slice(0, 8), citations };
  }

  // 2. getRecentEmails
  public getRecentEmails(limit: number = 5): ToolExecutionResult {
    const emails = this.getDb().getEmails().slice(0, limit);
    const citations: SourceCitation[] = emails.map(e => ({
      id: e.id,
      title: e.subject,
      type: 'gmail',
      snippet: e.summary,
      timestamp: e.timestamp
    }));
    return { toolName: 'getRecentEmails', data: emails, citations };
  }

  // 3. getEmailById
  public getEmailById(id: string): ToolExecutionResult {
    const email = this.getDb().getEmailById(id);
    const citations: SourceCitation[] = email ? [{
      id: email.id,
      title: email.subject,
      type: 'gmail',
      snippet: email.summary,
      timestamp: email.timestamp
    }] : [];
    return { toolName: 'getEmailById', data: email || null, citations };
  }

  // 4. getUpcomingDeadlines
  public getUpcomingDeadlines(days: number = 7): ToolExecutionResult {
    const now = new Date('2026-09-29T12:00:00.000Z').getTime();
    const maxTime = now + days * 24 * 3600 * 1000;

    const emails = this.getDb().getEmails().filter(e => {
      if (!e.deadlineDate) return false;
      const d = new Date(e.deadlineDate).getTime();
      return d >= now && d <= maxTime;
    });

    const coursework = this.getDb().getClassroomCoursework().filter(w => {
      if (!w.dueDate) return false;
      const d = new Date(w.dueDate).getTime();
      return d >= now && d <= maxTime;
    });

    const citations: SourceCitation[] = [
      ...emails.map(e => ({
        id: e.id,
        title: `${e.subject} (Deadline: ${e.actionDeadline || e.deadlineDate})`,
        type: 'gmail' as const,
        snippet: e.actionText || e.summary
      })),
      ...coursework.map(w => ({
        id: w.id,
        title: `${w.title} (${w.courseName})`,
        type: 'classroom' as const,
        snippet: `Due: ${w.dueDate} ${w.dueTime || ''}. Points: ${w.maxPoints || 'N/A'}`
      }))
    ];

    return { toolName: 'getUpcomingDeadlines', data: { emails, coursework }, citations };
  }

  // 5. getTodaySchedule
  public getTodaySchedule(): ToolExecutionResult {
    const calEvents = this.getDb().getCalendarEvents().filter(e => {
      return e.startTime.includes('2026-09-29') || e.startTime.includes('2026-09-30');
    });

    const todayEmails = this.getDb().getEmails().filter(e =>
      e.timestamp.includes('2026-09-29') || (e.deadlineDate && e.deadlineDate.includes('2026-09-29'))
    );

    const citations: SourceCitation[] = [
      ...calEvents.map(c => ({
        id: c.id,
        title: `${c.title} (${c.location || 'Campus'})`,
        type: 'calendar' as const,
        snippet: `Scheduled: ${new Date(c.startTime).toLocaleTimeString()} - ${new Date(c.endTime).toLocaleTimeString()}`
      })),
      ...todayEmails.slice(0, 3).map(e => ({
        id: e.id,
        title: e.subject,
        type: 'gmail' as const,
        snippet: e.summary
      }))
    ];

    return { toolName: 'getTodaySchedule', data: { events: calEvents, emails: todayEmails }, citations };
  }

  // 6. getTomorrowSchedule
  public getTomorrowSchedule(): ToolExecutionResult {
    const tomorrowCal = this.getDb().getCalendarEvents().filter(e => e.startTime.includes('2026-09-30'));
    const tomorrowEmails = this.getDb().getEmails().filter(e =>
      e.subject.toLowerCase().includes('tomorrow') ||
      e.body.toLowerCase().includes('september 30') ||
      (e.deadlineDate && e.deadlineDate.includes('2026-09-30'))
    );

    const citations: SourceCitation[] = [
      ...tomorrowCal.map(c => ({
        id: c.id,
        title: `${c.title} (${c.location || 'Campus'})`,
        type: 'calendar' as const,
        snippet: `Time: ${new Date(c.startTime).toLocaleTimeString()} - ${new Date(c.endTime).toLocaleTimeString()}`
      })),
      ...tomorrowEmails.slice(0, 3).map(e => ({
        id: e.id,
        title: e.subject,
        type: 'gmail' as const,
        snippet: e.summary
      }))
    ];

    return { toolName: 'getTomorrowSchedule', data: { events: tomorrowCal, notices: tomorrowEmails }, citations };
  }

  // 7. getUpcomingExams
  public getUpcomingExams(): ToolExecutionResult {
    const examEmails = this.getDb().getEmails().filter(e =>
      e.category === 'EXAMS' ||
      e.subject.toLowerCase().includes('exam') ||
      e.body.toLowerCase().includes('hall ticket') ||
      e.body.toLowerCase().includes('mid-term')
    );

    const citations: SourceCitation[] = examEmails.map(e => ({
      id: e.id,
      title: e.subject,
      type: 'gmail',
      snippet: `Location: ${e.location || 'SR Block'}. ${e.summary}`
    }));

    return { toolName: 'getUpcomingExams', data: examEmails, citations };
  }

  // 8. getClassroomCourses
  public getClassroomCourses(): ToolExecutionResult {
    const courses = this.getDb().getClassroomCourses();
    const citations: SourceCitation[] = courses.map(c => ({
      id: c.id,
      title: `${c.name} (${c.room || 'Campus'})`,
      type: 'classroom',
      snippet: c.descriptionHeading || c.section || 'Enrolled Course'
    }));
    return { toolName: 'getClassroomCourses', data: courses, citations };
  }

  // 9. getClassroomAssignments
  public getClassroomAssignments(courseId?: string): ToolExecutionResult {
    let coursework = this.getDb().getClassroomCoursework();
    if (courseId) {
      coursework = coursework.filter(w => w.courseId === courseId || w.courseName.toLowerCase().includes(courseId.toLowerCase()));
    }

    const citations: SourceCitation[] = coursework.map(w => ({
      id: w.id,
      title: `${w.title} [${w.courseName}]`,
      type: 'classroom',
      snippet: `Due: ${w.dueDate} ${w.dueTime || ''}. Status: ${w.submissionStatus || 'ASSIGNED'}`
    }));

    return { toolName: 'getClassroomAssignments', data: coursework, citations };
  }

  // 10. getClassroomAnnouncements
  public getClassroomAnnouncements(courseId?: string): ToolExecutionResult {
    let announcements = this.getDb().getClassroomAnnouncements();
    if (courseId) {
      announcements = announcements.filter(a => a.courseId === courseId);
    }

    const citations: SourceCitation[] = announcements.map(a => ({
      id: a.id,
      title: `Announcement: ${a.courseName}`,
      type: 'classroom',
      snippet: a.text.slice(0, 120),
      timestamp: a.creationTime
    }));

    return { toolName: 'getClassroomAnnouncements', data: announcements, citations };
  }

  // 11. getStudentSubmissions
  public getStudentSubmissions(courseId?: string): ToolExecutionResult {
    const coursework = this.getDb().getClassroomCoursework();
    const submissions = coursework.map(w => ({
      courseWorkId: w.id,
      title: w.title,
      courseName: w.courseName,
      status: w.submissionStatus || 'ASSIGNED',
      dueDate: w.dueDate
    }));

    const citations: SourceCitation[] = coursework.map(w => ({
      id: w.id,
      title: w.title,
      type: 'classroom',
      snippet: `Status: ${w.submissionStatus || 'ASSIGNED'} | Due: ${w.dueDate}`
    }));

    return { toolName: 'getStudentSubmissions', data: submissions, citations };
  }

  // 12. getAttendanceAlerts
  public getAttendanceAlerts(): ToolExecutionResult {
    const alerts = this.getDb().getEmails().filter(e =>
      e.category === 'ATTENDANCE' ||
      e.subject.toLowerCase().includes('attendance') ||
      e.body.toLowerCase().includes('condonation') ||
      e.body.toLowerCase().includes('75%')
    );

    const citations: SourceCitation[] = alerts.map(e => ({
      id: e.id,
      title: e.subject,
      type: 'gmail',
      snippet: e.summary
    }));

    return { toolName: 'getAttendanceAlerts', data: alerts, citations };
  }

  // 13. getCampusChanges
  public getCampusChanges(): ToolExecutionResult {
    const changes = RelationshipEngine.getWhatChanged(this.getDb().getEmails());
    const citations: SourceCitation[] = changes.map(c => ({
      id: c.emailId,
      title: c.topic,
      type: 'university',
      snippet: `${c.changeType.toUpperCase()}: ${c.summary || c.whatChanged || c.newValue}`
    }));
    return { toolName: 'getCampusChanges', data: changes, citations };
  }

  // 14. getTransportUpdates
  public getTransportUpdates(): ToolExecutionResult {
    const transportEmails = this.getDb().getEmails().filter(e =>
      e.category === 'TRANSPORT' ||
      e.subject.toLowerCase().includes('transport') ||
      e.subject.toLowerCase().includes('bus') ||
      e.body.toLowerCase().includes('shuttle')
    );

    const citations: SourceCitation[] = transportEmails.map(e => ({
      id: e.id,
      title: e.subject,
      type: 'gmail',
      snippet: e.summary
    }));

    return { toolName: 'getTransportUpdates', data: transportEmails, citations };
  }

  // 15. getUpcomingEvents
  public getUpcomingEvents(): ToolExecutionResult {
    const events = this.getDb().getEmails().filter(e =>
      ['EVENTS', 'TECH EVENTS', 'HACKATHONS', 'STUDENT CLUBS'].includes(e.category) ||
      Boolean(e.eventDate)
    );

    const citations: SourceCitation[] = events.slice(0, 6).map(e => ({
      id: e.id,
      title: e.subject,
      type: 'gmail',
      snippet: `${e.eventDate ? `Date: ${e.eventDate}. ` : ''}${e.location ? `Venue: ${e.location}. ` : ''}${e.summary}`
    }));


    return { toolName: 'getUpcomingEvents', data: events.slice(0, 10), citations };
  }

  // 16. getPendingActions
  public getPendingActions(): ToolExecutionResult {
    const actions = this.getDb().getActions().filter(a => !a.completed);
    const citations: SourceCitation[] = actions.slice(0, 8).map(a => ({
      id: a.id,
      title: a.title,
      type: 'university',
      snippet: `Deadline: ${a.deadline || 'Pending'}. Priority: ${a.priority}`
    }));
    return { toolName: 'getPendingActions', data: actions, citations };
  }

  // 17. getCalendarEvents
  public getCalendarEvents(start?: string, end?: string): ToolExecutionResult {
    const events = this.getDb().getCalendarEvents();
    const citations: SourceCitation[] = events.map(c => ({
      id: c.id,
      title: c.title,
      type: 'calendar',
      snippet: `From ${new Date(c.startTime).toLocaleString()} to ${new Date(c.endTime).toLocaleTimeString()} @ ${c.location || 'Campus'}`
    }));
    return { toolName: 'getCalendarEvents', data: events, citations };
  }

  // 18. checkCalendarConflict
  public async checkCalendarConflict(start: string, end: string): Promise<ToolExecutionResult> {
    const result = await CalendarService.getInstance().checkConflict(start, end);
    const citations: SourceCitation[] = result.conflictingEvents.map(c => ({
      id: c.id,
      title: `Conflicting: ${c.title}`,
      type: 'calendar',
      snippet: `${new Date(c.startTime).toLocaleTimeString()} - ${new Date(c.endTime).toLocaleTimeString()} (${c.location || 'Campus'})`
    }));
    return { toolName: 'checkCalendarConflict', data: result, citations };
  }

  // 19. getCourseInformation
  public getCourseInformation(courseQuery: string): ToolExecutionResult {
    const q = courseQuery.toLowerCase();
    const courses = this.getDb().getClassroomCourses().filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.descriptionHeading && c.descriptionHeading.toLowerCase().includes(q))
    );
    const relatedWork = this.getDb().getClassroomCoursework().filter(w =>
      w.courseName.toLowerCase().includes(q) || w.title.toLowerCase().includes(q)
    );

    const citations: SourceCitation[] = [
      ...courses.map(c => ({
        id: c.id,
        title: c.name,
        type: 'classroom' as const,
        snippet: `${c.room ? `Room: ${c.room}. ` : ''}${c.descriptionHeading || ''}`
      })),
      ...relatedWork.map(w => ({
        id: w.id,
        title: w.title,
        type: 'classroom' as const,
        snippet: `Due: ${w.dueDate || 'N/A'}`
      }))
    ];

    return { toolName: 'getCourseInformation', data: { courses, relatedWork }, citations };
  }

  // 20. getRelatedMessages
  public getRelatedMessages(id: string): ToolExecutionResult {
    const email = this.getDb().getEmailById(id);
    if (!email) {
      return { toolName: 'getRelatedMessages', data: [], citations: [] };
    }

    const clusters = RelationshipEngine.clusterByTopic(this.getDb().getEmails());
    const matchedCluster = clusters.find(c => c.emails.some(e => e.id === id));

    const related = matchedCluster ? matchedCluster.emails.filter(e => e.id !== id) : [];
    const citations: SourceCitation[] = related.map(e => ({
      id: e.id,
      title: e.subject,
      type: 'gmail',
      snippet: e.summary
    }));

    return { toolName: 'getRelatedMessages', data: related, citations };
  }
}

