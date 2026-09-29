import { GoogleGenAI } from '@google/genai';
import { AIProvider, AssistantQueryResult } from './AIProvider';
import { EmailAnalysisResult, CampusBriefingResult, EmailData, ActionItem } from '../../types';
import { FallbackAIProvider } from './FallbackAIProvider';

export class GeminiProvider implements AIProvider {
  public name: 'gemini' = 'gemini';
  private ai: GoogleGenAI | null = null;
  private fallback: FallbackAIProvider;
  private modelName: string;

  constructor(apiKey?: string, modelName: string = 'gemini-3.8-flash') {
    this.fallback = new FallbackAIProvider();
    this.modelName = modelName;
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (err) {
        console.warn('Failed to initialize GoogleGenAI SDK, falling back to mock provider:', err);
      }
    }
  }

  public async verifyConnection(): Promise<{ connected: boolean; model: string; message: string }> {
    if (!this.ai) {
      return { connected: false, model: this.modelName, message: 'GoogleGenAI client not initialized (missing API key)' };
    }
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: 'Confirm operational status: reply OK'
      });
      return {
        connected: true,
        model: this.modelName,
        message: response.text?.trim() || 'OK'
      };
    } catch (err: any) {
      // Retry once on transient 503 high demand spikes
      if (err.status === 503 || (err.message && err.message.includes('503'))) {
        try {
          await new Promise(r => setTimeout(r, 800));
          const retryRes = await this.ai.models.generateContent({
            model: this.modelName,
            contents: 'reply OK'
          });
          return {
            connected: true,
            model: this.modelName,
            message: retryRes.text?.trim() || 'OK'
          };
        } catch (retryErr: any) {
          // Fall through to failure message
        }
      }
      return {
        connected: false,
        model: this.modelName,
        message: err.message || 'Connection test failed'
      };
    }
  }

  public async analyzeEmail(email: {
    subject: string;
    body: string;
    sender: string;
  }): Promise<EmailAnalysisResult> {
    if (!this.ai) {
      return this.fallback.analyzeEmail(email);
    }

    try {
      const prompt = `You are CampusPulse AI for SRM University-AP.
Your job is to analyze university communications and transform fragmented information into prioritized actions.
You must not invent university facts.
If a detail is not present in the supplied email or verified campus dataset, mark it unknown.
Use SRM AP terminology.
Distinguish: academic notices, administrative notices, student clubs, events, exams, attendance, transport, entrepreneurship, placements, emergency notifications.

Analyze this SRM University-AP communication and return strict structured JSON adhering to this schema:
{
  "category": "ACADEMICS" | "EXAMS" | "ATTENDANCE" | "ASSIGNMENTS" | "TRANSPORT" | "EVENTS" | "FEES" | "HOSTEL" | "PLACEMENTS" | "ADMINISTRATION" | "FACILITIES" | "EMERGENCY" | "CLUBS" | "SCHOLARSHIPS" | "ENTREPRENEURSHIP" | "GENERAL",
  "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "priorityScore": number between 1 and 99,
  "summary": "1 to 2 sentence crisp actionable summary",
  "deadline": "formatted deadline string like 'September 30, 2026' or null",
  "actionRequired": boolean,
  "action": "clear single action item sentence or null",
  "eventDate": "ISO date string or null",
  "location": "campus location such as 'S202, SR Block' or 'X-Lab Auditorium' if mentioned or null",
  "affectedGroup": "affected SRM AP student group e.g. 'SEAS CSE Semester 3 Students'",
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "reason": "Clear explanation of why this priority score was assigned based on academic/safety/deadline consequences at SRM AP",
  "categoryReason": "Brief explanation of category selection"
}

EMAIL TO ANALYZE:
Sender: ${email.sender}
Subject: ${email.subject}
Body:
${email.body}`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        category: parsed.category || 'GENERAL',
        priority: parsed.priority || 'MEDIUM',
        priorityScore: typeof parsed.priorityScore === 'number' ? parsed.priorityScore : 65,
        summary: parsed.summary || email.subject,
        deadline: parsed.deadline || undefined,
        actionRequired: Boolean(parsed.actionRequired),
        action: parsed.action || undefined,
        eventDate: parsed.eventDate || undefined,
        location: parsed.location || undefined,
        affectedGroup: parsed.affectedGroup || 'SRM AP Students',
        urgency: parsed.urgency || parsed.priority || 'MEDIUM',
        reason: parsed.reason || 'AI evaluated priority based on SRM AP academic consequence and deadlines.',
        categoryReason: parsed.categoryReason || 'Classified based on institutional communication context.',
        aiProvider: 'gemini'
      };
    } catch (error) {
      console.warn('Gemini analysis failed or returned non-JSON. Falling back to deterministic engine:', error);
      const fallbackResult = await this.fallback.analyzeEmail(email);
      return {
        ...fallbackResult,
        reason: `${fallbackResult.reason} (Gemini fallback active)`
      };
    }
  }

  public async generateBriefing(
    emails: EmailData[],
    userName: string
  ): Promise<CampusBriefingResult> {
    if (!this.ai) {
      return this.fallback.generateBriefing(emails, userName);
    }

    try {
      const topEmailsSummary = emails.slice(0, 10).map(e => ({
        id: e.id,
        subject: e.subject,
        category: e.category,
        priority: e.priority,
        summary: e.summary,
        deadline: e.actionDeadline
      }));

      const prompt = `You are CampusPulse AI generating the daily campus briefing for student ${userName} at SRM University-AP.
Based on these prioritized university communications, generate a structured JSON briefing:
{
  "date": "Wednesday, September 30, 2026",
  "greeting": "Good morning, ${userName}",
  "studentName": "${userName}",
  "headline": "punchy 1-sentence headline highlighting the most urgent SRM AP update",
  "criticalCount": number,
  "highCount": number,
  "upcomingDeadlinesCount": number,
  "academicUpdatesCount": number,
  "summaryBullets": [
    {
      "emoji": "emoji icon",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "title": "short title",
      "description": "crisp description",
      "emailId": "corresponding email id"
    }
  ],
  "motivationalNote": "short encouraging student productivity tip tailored to SRM AP SEAS students"
}

SRM AP EMAILS DATA:
${JSON.stringify(topEmailsSummary, null, 2)}`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        ...parsed,
        aiProvider: 'gemini'
      };
    } catch (err) {
      console.warn('Gemini briefing generation failed, using deterministic briefing:', err);
      return this.fallback.generateBriefing(emails, userName);
    }
  }

  public async answerCampusQuery(
    query: string,
    contextEmails: EmailData[],
    actions: ActionItem[]
  ): Promise<AssistantQueryResult> {
    const { AIToolRegistry } = await import('./AIToolRegistry');
    const toolRegistry = AIToolRegistry.getInstance();
    const q = query.toLowerCase();

    let retrievedData: any = null;
    let toolUsed = 'searchEmails()';
    let citations: any[] = [];

    // Dynamically retrieve only required application state via tools
    if (q.includes('what do i need to do') || q.includes('urgent') || q.includes('today') || q.includes('schedule')) {
      const scheduleRes = toolRegistry.getTodaySchedule();
      const actionsRes = toolRegistry.getPendingActions();
      retrievedData = { schedule: scheduleRes.data, actions: actionsRes.data };
      citations = [...scheduleRes.citations, ...actionsRes.citations.slice(0, 3)];
      toolUsed = 'getTodaySchedule() & getPendingActions()';
    } else if (q.includes('deadline') || q.includes('due') || q.includes('assignment')) {
      const toolRes = toolRegistry.getUpcomingDeadlines(7);
      const coursework = toolRegistry.getClassroomAssignments();
      retrievedData = { deadlines: toolRes.data, coursework: coursework.data };
      citations = [...toolRes.citations, ...coursework.citations].slice(0, 6);
      toolUsed = 'getUpcomingDeadlines() & getClassroomAssignments()';
    } else if (q.includes('exam') || q.includes('algorithms') || q.includes('cse 204')) {
      const toolRes = toolRegistry.getUpcomingExams();
      retrievedData = toolRes.data;
      citations = toolRes.citations;
      toolUsed = 'getUpcomingExams()';
    } else if (q.includes('attendance') || q.includes('condonation') || q.includes('shortage')) {
      const toolRes = toolRegistry.getAttendanceAlerts();
      retrievedData = toolRes.data;
      citations = toolRes.citations;
      toolUsed = 'getAttendanceAlerts()';
    } else if (q.includes('bus') || q.includes('transport') || q.includes('shuttle')) {
      const toolRes = toolRegistry.getTransportUpdates();
      retrievedData = toolRes.data;
      citations = toolRes.citations;
      toolUsed = 'getTransportUpdates()';
    } else if (q.includes('changed') || q.includes('what changed') || q.includes('postpone') || q.includes('closure')) {
      const toolRes = toolRegistry.getCampusChanges();
      retrievedData = toolRes.data;
      citations = toolRes.citations;
      toolUsed = 'getCampusChanges()';
    } else if (q.includes('classroom') || q.includes('course')) {
      const courses = toolRegistry.getClassroomCourses();
      const work = toolRegistry.getClassroomAssignments();
      retrievedData = { courses: courses.data, work: work.data };
      citations = [...courses.citations, ...work.citations];
      toolUsed = 'getClassroomCourses() & getClassroomAssignments()';
    } else if (q.includes('conflict') || q.includes('calendar')) {
      const conflictRes = await toolRegistry.checkCalendarConflict('2026-09-26T11:00:00.000Z', '2026-09-26T12:30:00.000Z');
      const eventsRes = toolRegistry.getCalendarEvents();
      retrievedData = { conflictCheck: conflictRes.data, upcomingCalendar: eventsRes.data };
      citations = [...conflictRes.citations, ...eventsRes.citations.slice(0, 2)];
      toolUsed = 'checkCalendarConflict() & getCalendarEvents()';
    } else {
      const searchRes = toolRegistry.searchEmails(query);
      retrievedData = searchRes.data;
      citations = searchRes.citations;
      toolUsed = 'searchEmails(query)';
    }

    if (!this.ai) {
      return this.fallback.answerCampusQuery(query, contextEmails, actions);
    }

    try {
      const prompt = `You are CampusPulse AI for SRM University-AP students.
You must answer strictly using the provided RETRIEVED APPLICATION DATA.
Never invent university facts, faculty names, locations, deadlines, or exams.
If no supporting data exists in the records below, say: "I couldn't find a matching university record."

STUDENT QUERY: "${query}"

DYNAMICALLY RETRIEVED APPLICATION RECORDS (Tool: ${toolUsed}):
${JSON.stringify(retrievedData, null, 2)}

Respond with strict JSON:
{
  "answer": "markdown-formatted helpful answer strictly grounded in the retrieved records with bold highlights, bullets, and exact SRM AP locations/times",
  "suggestedActions": ["Action label 1", "Action label 2"],
  "referencedEmailIds": ["email-id-if-applicable"]
}`;

      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        answer: parsed.answer,
        suggestedActions: parsed.suggestedActions || [],
        referencedEmailIds: parsed.referencedEmailIds || [],
        toolUsed,
        citations
      };
    } catch (err) {
      console.warn('Gemini assistant query failed, using deterministic fallback engine:', err);
      const fallbackResult = await this.fallback.answerCampusQuery(query, contextEmails, actions);
      return {
        ...fallbackResult,
        toolUsed: `${toolUsed} (Fallback Engine)`,
        citations: fallbackResult.citations && fallbackResult.citations.length > 0 ? fallbackResult.citations : citations
      };
    }
  }
}

