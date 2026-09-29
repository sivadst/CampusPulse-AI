import { GoogleOAuthService } from './GoogleOAuthService';
import { GmailService } from '../gmail/GmailService';
import { ClassroomService } from './ClassroomService';
import { CalendarService } from './CalendarService';
import { DatabaseService } from '../../db/DatabaseService';
import { PriorityEngine } from '../priority/PriorityEngine';
import { ActionExtractor } from '../actions/ActionExtractor';
import { RelationshipEngine } from '../relationships/RelationshipEngine';
import { GoogleSyncResult, EmailData } from '../../types';

export class SyncService {
  private static instance: SyncService;

  private constructor() {}

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public async syncAll(): Promise<GoogleSyncResult> {
    const startTime = Date.now();
    const oauth = GoogleOAuthService.getInstance();
    const db = DatabaseService.getInstance();
    const classroomService = ClassroomService.getInstance();
    const calendarService = CalendarService.getInstance();

    let gmailImported = 0;
    let gmailSkipped = 0;
    let updatedItems = 0;
    let newActions = 0;

    // 1. Fetch Gmail messages if connected, otherwise keep existing state
    if (oauth.isAuthConnected()) {
      try {
        const liveEmails = await GmailService.fetchUniversityEmails();
        const existingEmails = db.getEmails();
        const existingMap = new Map<string, EmailData>();
        existingEmails.forEach(e => existingMap.set(e.id, e));

        const newlyAdded: EmailData[] = [];

        for (const email of liveEmails) {
          if (existingMap.has(email.id)) {
            gmailSkipped++;
            // Check if updated
            const existing = existingMap.get(email.id)!;
            if (existing.subject !== email.subject || existing.body !== email.body) {
              updatedItems++;
            }
          } else {
            // Apply priority engine
            const priorityResult = PriorityEngine.evaluate(
              email.subject,
              email.body,
              email.sender,
              email.deadlineDate || email.timestamp
            );

            email.priority = priorityResult.priority;
            email.priorityScore = priorityResult.priorityScore;
            email.priorityReason = priorityResult.priorityReason;
            email.urgency = priorityResult.priority;

            newlyAdded.push(email);

            gmailImported++;
          }
        }

        if (newlyAdded.length > 0) {
          db.addEmails(newlyAdded);
        }
      } catch (err) {
        console.warn('Gmail sync warning:', err);
      }
    } else {
      // Demo sync: ensure initial dataset is healthy
      gmailImported = 0;
      gmailSkipped = db.getEmails().length;
    }

    // 2. Sync Google Classroom
    const classroomData = await classroomService.syncClassroom();
    db.setClassroomData(classroomData.courses, classroomData.coursework, classroomData.announcements);

    // 3. Cross-link Classroom notifications with Gmail
    const allEmails = db.getEmails();
    for (const email of allEmails) {
      for (const work of classroomData.coursework) {
        const titleWords = work.title.toLowerCase().split(' ').filter(w => w.length > 3);
        const matchesTitle = titleWords.some(w => email.subject.toLowerCase().includes(w) || email.body.toLowerCase().includes(w));
        if (matchesTitle) {
          email.relatedClassroomCourseId = work.courseId;
          email.relatedClassroomWorkId = work.id;
          work.relatedEmailId = email.id;
        }
      }
    }

    // 4. Sync Google Calendar
    const calendarEvents = await calendarService.getUpcomingEvents();
    db.setCalendarEvents(calendarEvents);

    // 5. Extract Actions and Recalculate Priorities
    const currentActions = db.getActions();
    const existingActionTitles = new Set(currentActions.map(a => a.title.toLowerCase()));

    const extractedActions = ActionExtractor.extractActions(db.getEmails());
    for (const act of extractedActions) {
      if (!existingActionTitles.has(act.title.toLowerCase())) {
        newActions++;
      }
    }
    db.refreshActions();

    // 6. Update Sync Metadata
    const nowIso = new Date().toISOString();
    oauth.setLastSync(nowIso);
    db.setLastSyncTime(nowIso);

    const durationMs = Date.now() - startTime;

    return {
      success: true,
      timestamp: nowIso,
      gmailImported,
      gmailSkipped,
      classroomCourses: classroomData.courses.length,
      classroomAssignments: classroomData.coursework.length,
      classroomAnnouncements: classroomData.announcements.length,
      calendarEvents: calendarEvents.length,
      newActions,
      updatedItems,
      durationMs
    };
  }
}

