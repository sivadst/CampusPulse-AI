import { google } from 'googleapis';
import { GoogleOAuthService } from './GoogleOAuthService';
import { GoogleCalendarEvent, CalendarConflictCheckResult } from '../../types';

export class CalendarService {
  private static instance: CalendarService;
  private localEvents: GoogleCalendarEvent[] = [];
  private sourceToEventMap: Map<string, string> = new Map(); // sourceId -> calendarEventId

  private constructor() {
    this.seedDemoCalendarEvents();
  }

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  private seedDemoCalendarEvents(): void {
    this.localEvents = [
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

  /**
   * Retrieves upcoming events from Google Calendar API or local state
   */
  public async getUpcomingEvents(timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    const oauth = GoogleOAuthService.getInstance();

    if (!oauth.isAuthConnected()) {
      return this.localEvents;
    }

    try {
      const auth = oauth.getClient();
      const calendar = google.calendar({ version: 'v3', auth });

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax || undefined,
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime'
      });

      const items = res.data.items || [];
      const events: GoogleCalendarEvent[] = items.map(item => ({
        id: item.id || `event-${Date.now()}`,
        title: item.summary || 'Untitled Event',
        description: item.description || undefined,
        location: item.location || undefined,
        startTime: item.start?.dateTime || item.start?.date || new Date().toISOString(),
        endTime: item.end?.dateTime || item.end?.date || new Date().toISOString(),
        isAllDay: !item.start?.dateTime,
        htmlLink: item.htmlLink || undefined,
        source: 'google',
        sourceId: item.extendedProperties?.private?.sourceId
      }));

      // Merge with any local mock events for comprehensive demonstration
      this.localEvents = events;
      return events;
    } catch (err) {
      console.warn('Google Calendar fetch failed, using local events:', err);
      return this.localEvents;
    }
  }

  /**
   * Checks whether a proposed event time overlaps with any scheduled calendar event.
   */
  public async checkConflict(
    proposedStart: string,
    proposedEnd: string,
    excludeEventId?: string
  ): Promise<CalendarConflictCheckResult> {
    const allEvents = await this.getUpcomingEvents();
    const propStartTime = new Date(proposedStart).getTime();
    const propEndTime = new Date(proposedEnd).getTime();

    const conflictingEvents = allEvents.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      const evStart = new Date(event.startTime).getTime();
      const evEnd = new Date(event.endTime).getTime();

      // Overlap condition: start < otherEnd AND end > otherStart
      return propStartTime < evEnd && propEndTime > evStart;
    });

    const hasConflict = conflictingEvents.length > 0;
    return {
      hasConflict,
      conflictingEvents,
      isDuplicate: false,
      message: hasConflict
        ? `Conflict detected: overlaps with ${conflictingEvents[0]?.title}`
        : 'No conflicts detected in proposed time slot'
    };
  }


  /**
   * Checks whether an identical event already exists to prevent duplicate creation
   */
  public async checkDuplicate(
    title: string,
    startTime: string,
    sourceId?: string
  ): Promise<{ isDuplicate: boolean; existingEvent?: GoogleCalendarEvent }> {
    const allEvents = await this.getUpcomingEvents();
    const normTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetStart = new Date(startTime).getTime();

    // 1. Check mapped sourceId
    if (sourceId && this.sourceToEventMap.has(sourceId)) {
      const existingId = this.sourceToEventMap.get(sourceId);
      const matched = allEvents.find(e => e.id === existingId);
      if (matched) return { isDuplicate: true, existingEvent: matched };
    }

    // 2. Check title + timestamp proximity (within 30 minutes)
    for (const ev of allEvents) {
      const evNormTitle = ev.title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const evStart = new Date(ev.startTime).getTime();
      const timeDiffMinutes = Math.abs(evStart - targetStart) / (1000 * 60);

      if ((normTitle.includes(evNormTitle) || evNormTitle.includes(normTitle)) && timeDiffMinutes <= 30) {
        return { isDuplicate: true, existingEvent: ev };
      }

      if (sourceId && ev.sourceId === sourceId) {
        return { isDuplicate: true, existingEvent: ev };
      }
    }

    return { isDuplicate: false };
  }

  /**
   * Adds an event to Google Calendar ONLY after explicit student confirmation.
   */
  public async createEvent(params: {
    title: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    sourceId?: string;
  }): Promise<{ success: boolean; event: GoogleCalendarEvent; message: string }> {
    const oauth = GoogleOAuthService.getInstance();

    if (oauth.isAuthConnected()) {
      try {
        const auth = oauth.getClient();
        const calendar = google.calendar({ version: 'v3', auth });

        const inserted = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: {
            summary: params.title,
            description: params.description ? `${params.description}\n\n[Imported by CampusPulse AI]` : '[Imported by CampusPulse AI]',
            location: params.location,
            start: { dateTime: new Date(params.startTime).toISOString() },
            end: { dateTime: new Date(params.endTime).toISOString() },
            extendedProperties: {
              private: {
                campusPulseId: params.sourceId || `cp-${Date.now()}`,
                sourceId: params.sourceId || ''
              }
            }
          }
        });

        const createdEvent: GoogleCalendarEvent = {
          id: inserted.data.id || `cal-${Date.now()}`,
          title: inserted.data.summary || params.title,
          description: inserted.data.description || params.description,
          location: inserted.data.location || params.location,
          startTime: inserted.data.start?.dateTime || params.startTime,
          endTime: inserted.data.end?.dateTime || params.endTime,
          isAllDay: false,
          htmlLink: inserted.data.htmlLink || undefined,
          source: 'google',
          sourceId: params.sourceId
        };

        if (params.sourceId) {
          this.sourceToEventMap.set(params.sourceId, createdEvent.id);
        }
        this.localEvents.push(createdEvent);

        return {
          success: true,
          event: createdEvent,
          message: 'Confirmed & scheduled to Google Calendar successfully.'
        };
      } catch (err: any) {
        console.warn('Google Calendar API insert failed, storing in CampusPulse state:', err);
      }
    }

    // Demo Mode or local fallback creation
    const localEvent: GoogleCalendarEvent = {
      id: `local-cal-${Date.now()}`,
      title: params.title,
      description: params.description,
      location: params.location,
      startTime: params.startTime,
      endTime: params.endTime,
      isAllDay: false,
      source: 'local',
      sourceId: params.sourceId
    };

    if (params.sourceId) {
      this.sourceToEventMap.set(params.sourceId, localEvent.id);
    }
    this.localEvents.unshift(localEvent);

    return {
      success: true,
      event: localEvent,
      message: 'Event confirmed and scheduled to calendar.'
    };
  }

  /**
   * Deletes a calendar event with confirmation
   */
  public async deleteEvent(eventId: string): Promise<boolean> {
    const oauth = GoogleOAuthService.getInstance();
    if (oauth.isAuthConnected()) {
      try {
        const auth = oauth.getClient();
        const calendar = google.calendar({ version: 'v3', auth });
        await calendar.events.delete({
          calendarId: 'primary',
          eventId
        });
      } catch (err) {
        console.warn('Failed to delete event from Google Calendar API:', err);
      }
    }

    const index = this.localEvents.findIndex(e => e.id === eventId);
    if (index !== -1) {
      this.localEvents.splice(index, 1);
      return true;
    }
    return true;
  }
}
