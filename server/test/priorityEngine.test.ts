import { test, describe } from 'node:test';
import assert from 'node:assert';
import { PriorityEngine } from '../src/services/priority/PriorityEngine';
import { UniversityFilter } from '../src/services/filter/UniversityFilter';
import { ActionExtractor } from '../src/services/actions/ActionExtractor';
import { FallbackAIProvider } from '../src/services/ai/FallbackAIProvider';
import { RelationshipEngine } from '../src/services/relationships/RelationshipEngine';
import { EmailData } from '../src/types';

describe('PriorityEngine Tests — SRM AP Scenarios', () => {
  test('evaluates urgent exam venue change to S202 SR Block as CRITICAL', () => {
    const result = PriorityEngine.evaluate(
      'URGENT: Examination Venue Changed for CSE 204 Tomorrow',
      'The CSE 204 Design and Analysis of Algorithms examination has been shifted to S202, SR Block due to technical lab setup. Report by 09:30 AM with physical Hall Ticket.',
      'hod.cse@srmap.edu.in',
      '2026-09-30T10:00:00.000Z'
    );

    assert.strictEqual(result.priority, 'CRITICAL');
    assert.ok(result.priorityScore >= 90);
    assert.ok(result.priorityReason.includes('examination hall') || result.priorityReason.includes('venue'));
  });

  test('evaluates university rain closure circular as CRITICAL', () => {
    const result = PriorityEngine.evaluate(
      'CIRCULAR: University Closure on September 25 due to Heavy Rainfall',
      'University is closed today due to waterlogging and severe weather across Mangalagiri. Classes cancelled. October 10 is compensatory working day.',
      'registrar.office@srmap.edu.in',
      '2026-09-25T08:00:00.000Z'
    );

    assert.strictEqual(result.priority, 'CRITICAL');
    assert.ok(result.priorityScore >= 95);
    assert.ok(result.priorityReason.toLowerCase().includes('closure'));
  });

  test('evaluates attendance shortage warning as HIGH priority', () => {
    const result = PriorityEngine.evaluate(
      'Attendance Shortage Warning – CSE 204 & CSE 207',
      'Your attendance is below 75% in CSE 207 (68%). Submit medical condonation form to Room 114 before Friday or face semester debarment.',
      'dean.seas@srmap.edu.in',
      '2026-10-02T17:00:00.000Z'
    );

    assert.strictEqual(result.priority, 'HIGH');
    assert.ok(result.priorityScore >= 75);
    assert.ok(result.priorityReason.toLowerCase().includes('attendance'));
  });

  test('evaluates ACM recruitment deadline as MEDIUM priority with actionable deadline', () => {
    const result = PriorityEngine.evaluate(
      'ACM Student Chapter Recruitment 2026 — Applications Open',
      'Join R&D, Events, PR & Sponsorship, and Social Media teams. Apply before September 30 deadline.',
      'acm.core@srmap.edu.in',
      '2026-09-30T23:59:00.000Z'
    );

    assert.strictEqual(result.priority, 'MEDIUM');
    assert.ok(result.priorityScore >= 50);
  });

  test('evaluates monthly general newsletter as LOW priority', () => {
    const result = PriorityEngine.evaluate(
      'SRM AP Campus Newsletter — September Edition',
      'Read about research grants and cultural highlights at SRM University-AP in the September issue.',
      'communications@srmap.edu.in'
    );

    assert.strictEqual(result.priority, 'LOW');
    assert.ok(result.priorityScore <= 35);
  });
});

describe('UniversityFilter Tests — SRM AP Domain Security Policy', () => {
  test('allows official SRM AP institutional email addresses', () => {
    assert.strictEqual(UniversityFilter.isUniversityEmail('communications@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('registrar.office@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('ecell@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('cel@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('acm.core@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('dean.seas@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('hod.cse@srmap.edu.in'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('demo.student@srmap.edu.in'), true);
  });

  test('rejects external commercial and promotional noise', () => {
    assert.strictEqual(UniversityFilter.isUniversityEmail('orders@amazon.in'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('notifications@instagram.com'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('promo@edutech-deals.com'), false);
    assert.strictEqual(UniversityFilter.isUniversityEmail('marketing@commercial-bank.com'), false);
  });
});

describe('ActionExtractor Tests', () => {
  test('extracts actionable tasks with deadlines for SRM AP student', () => {
    const mockEmails: EmailData[] = [
      {
        id: 'srm-test-1',
        sender: 'dean.seas@srmap.edu.in',
        senderName: 'Dean SEAS',
        recipient: 'demo.student@srmap.edu.in',
        subject: 'Attendance Shortage Warning',
        body: 'Submit condonation explanation',
        timestamp: new Date().toISOString(),
        dateFormatted: 'Today',
        category: 'ATTENDANCE',
        priority: 'HIGH',
        priorityScore: 88,
        priorityReason: 'Shortage warning',
        categoryReason: 'Official attendance record',
        summary: 'Submit explanation before Friday',
        actionRequired: true,
        actionText: 'Submit signed medical attendance condonation form to Room 114 Admin Block',
        actionDeadline: 'Friday 5:00 PM',
        deadlineDate: '2026-10-02T17:00:00.000Z',
        urgency: 'HIGH',
        tags: ['attendance', 'srmap'],
        isRead: false,
        source: 'demo'
      }
    ];

    const actions = ActionExtractor.extractActions(mockEmails);
    assert.strictEqual(actions.length, 1);
    assert.strictEqual(actions[0].title, 'Submit signed medical attendance condonation form to Room 114 Admin Block');
    assert.strictEqual(actions[0].priority, 'HIGH');
    assert.strictEqual(actions[0].completed, false);
  });
});

describe('RelationshipEngine — "What Changed?" Tests', () => {
  test('detects schedule changes and postponements in university communications', () => {
    const mockEmails: EmailData[] = [
      {
        id: 'change-1',
        sender: 'registrar.office@srmap.edu.in',
        senderName: 'Registrar Office',
        recipient: 'demo.student@srmap.edu.in',
        subject: 'CIRCULAR: University Closure on September 25 & Compensatory Working Day',
        body: 'University closed Sept 25 due to heavy rainfall. October 10 will be compensatory working Saturday following Friday timetable.',
        timestamp: new Date().toISOString(),
        dateFormatted: 'Sept 25, 2026',
        category: 'EMERGENCY',
        priority: 'CRITICAL',
        priorityScore: 98,
        priorityReason: 'Emergency campus closure',
        categoryReason: 'Official circular',
        summary: 'Sept 25 closed; Oct 10 compensatory working day',
        actionRequired: true,
        actionText: 'Stay indoors Sept 25; Attend classes on Oct 10 compensatory working day',
        actionDeadline: 'Oct 10, 2026',
        urgency: 'CRITICAL',
        tags: ['closure', 'rain'],
        isRead: false,
        source: 'demo'
      },
      {
        id: 'change-2',
        sender: 'ecell@srmap.edu.in',
        senderName: 'SRMAP - Entrepreneurship Cell',
        recipient: 'demo.student@srmap.edu.in',
        subject: 'IMPORTANT: STARTUP WARS 2026 Postponed',
        body: 'STARTUP WARS scheduled for September 21 has been postponed. Revised dates will be announced shortly.',
        timestamp: new Date().toISOString(),
        dateFormatted: 'Sept 21, 2026',
        category: 'ENTREPRENEURSHIP',
        priority: 'HIGH',
        priorityScore: 82,
        priorityReason: 'Event postponement',
        categoryReason: 'E-Cell notice',
        summary: 'STARTUP WARS postponed; new dates TBA',
        actionRequired: true,
        actionText: 'Update startup pitch schedule; disregard Sept 21 slot',
        actionDeadline: 'TBA',
        urgency: 'HIGH',
        tags: ['postponed', 'startup-wars'],
        isRead: false,
        source: 'demo'
      }
    ];

    const changes = RelationshipEngine.getWhatChanged(mockEmails);
    assert.ok(changes.length >= 2);
    const rainChange = changes.find(c => c.topic.includes('Rain') || c.topic.includes('Closure'));
    assert.ok(rainChange);
    assert.ok(rainChange.whatChanged.includes('October 10') || rainChange.whatChanged.includes('closed'));
  });
});

describe('FallbackAIProvider Tests — SRM AP Category Mapping', () => {
  test('extracts structured analysis deterministically for SRM AP notices', async () => {
    const fallback = new FallbackAIProvider();
    const analysis = await fallback.analyzeEmail({
      subject: 'URGENT: Examination Hall Changed for CSE 204 Tomorrow',
      body: 'The CSE 204 examination venue changed to S202, SR Block.',
      sender: 'hod.cse@srmap.edu.in'
    });

    assert.strictEqual(analysis.category, 'EXAMS');
    assert.strictEqual(analysis.priority, 'CRITICAL');
    assert.strictEqual(analysis.actionRequired, true);
    assert.ok(analysis.location?.includes('S202') || analysis.location?.includes('SR Block'));
  });
});

describe('Demo Dataset Verification — Exactly 50 High-Quality Emails', () => {
  test('confirms demo dataset contains EXACTLY 50 university emails', () => {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.resolve(__dirname, '../src/data/demo-emails.json');
    assert.ok(fs.existsSync(dataPath), 'demo-emails.json must exist');
    const emails = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    assert.strictEqual(emails.length, 50, `Expected exactly 50 emails, but got ${emails.length}`);
  });

  test('confirms demo dataset includes all mandatory SRM AP scenarios', () => {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.resolve(__dirname, '../src/data/demo-emails.json');
    const emails: EmailData[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // 1. AI security expert talk
    const securityTalk = emails.find(e => e.subject.toLowerCase().includes('autonomous ai') || e.body.toLowerCase().includes('securing an autonomous ai'));
    assert.ok(securityTalk, 'Autonomous AI Security talk must be present');

    // 2. Early closure Sept 24 at 3 PM
    const earlyClosure = emails.find(e => e.body.toLowerCase().includes('3:00 pm') || e.body.toLowerCase().includes('3:15 pm') || e.subject.toLowerCase().includes('early closure'));
    assert.ok(earlyClosure, 'Early closure Sept 24 must be present');

    // 3. University rain closure Sept 25 with Oct 10 compensatory working day
    const rainClosure = emails.find(e => e.body.toLowerCase().includes('october 10') && (e.subject.toLowerCase().includes('closure') || e.body.toLowerCase().includes('closure')));
    assert.ok(rainClosure, 'University closure with Oct 10 compensatory day must be present');

    // 4. Agentic AI Hackathon (Ziro.Digital)
    const agenticHack = emails.find(e => e.subject.toLowerCase().includes('agentic ai') || e.body.toLowerCase().includes('ziro.digital'));
    assert.ok(agenticHack, 'Agentic AI Hackathon (Ziro.Digital) must be present');

    // 5. Terrathon 2026
    const terrathon = emails.find(e => e.subject.toLowerCase().includes('terrathon') || e.body.toLowerCase().includes('terrathon'));
    assert.ok(terrathon, 'Terrathon 2026 must be present');

    // 6. AI Quiz in CV 704
    const aiQuiz = emails.find(e => e.subject.toLowerCase().includes('ai quiz') || e.body.toLowerCase().includes('cv 704'));
    assert.ok(aiQuiz, 'AI Quiz in CV 704 must be present');

    // 7. Robotics workshop in S202 SR Block
    const robotics = emails.find(e => e.subject.toLowerCase().includes('robotics') && e.location?.includes('S202'));
    assert.ok(robotics, 'Robotics workshop in S202 SR Block must be present');

    // 8. STARTUP WARS postponement
    const startupWars = emails.find(e => e.subject.toLowerCase().includes('startup wars') && (e.body.toLowerCase().includes('postponed') || e.subject.toLowerCase().includes('postponed')));
    assert.ok(startupWars, 'STARTUP WARS postponement must be present');
  });
});

describe('Google Calendar Integration Tests', () => {
  test('detects conflict when proposed event overlaps existing event', async () => {
    const { CalendarService } = await import('../src/services/google/CalendarService');
    const calendarService = CalendarService.getInstance();

    // S202 Lab is scheduled on 2026-09-30 09:00:00 to 11:00:00
    const conflictResult = await calendarService.checkConflict(
      '2026-09-30T09:30:00.000Z',
      '2026-09-30T10:30:00.000Z'
    );
    assert.strictEqual(conflictResult.hasConflict, true);
    assert.ok(conflictResult.conflictingEvents.length > 0);
  });

  test('reports no conflict for a free time slot', async () => {
    const { CalendarService } = await import('../src/services/google/CalendarService');
    const calendarService = CalendarService.getInstance();

    const freeResult = await calendarService.checkConflict(
      '2026-10-05T02:00:00.000Z',
      '2026-10-05T03:00:00.000Z'
    );
    assert.strictEqual(freeResult.hasConflict, false);
    assert.strictEqual(freeResult.conflictingEvents.length, 0);
  });

  test('prevents duplicate event insertion with identical sourceId', async () => {
    const { CalendarService } = await import('../src/services/google/CalendarService');
    const calendarService = CalendarService.getInstance();

    const created = await calendarService.createEvent({
      title: 'Unique Hackathon Demo Session',
      startTime: '2026-10-06T10:00:00.000Z',
      endTime: '2026-10-06T11:00:00.000Z',
      sourceId: 'demo-source-dup-test-123'
    });
    assert.strictEqual(created.success, true);

    const dupCheck = await calendarService.checkDuplicate(
      'Unique Hackathon Demo Session',
      '2026-10-06T10:00:00.000Z',
      'demo-source-dup-test-123'
    );
    assert.strictEqual(dupCheck.isDuplicate, true);
    assert.ok(dupCheck.existingEvent);
  });
});

describe('Google Classroom Integration & Normalization Tests', () => {
  test('returns normalized courses with active state and room locations', () => {
    const { ClassroomService } = require('../src/services/google/ClassroomService');
    const data = ClassroomService.getInstance().getDemoClassroomData();

    assert.ok(data.courses.length >= 3);
    const cse213 = data.courses.find((c: any) => c.id === 'srm-course-213');
    assert.ok(cse213);
    assert.strictEqual(cse213.name, 'CSE 213: AI Tools & Prompt Engineering');
    assert.strictEqual(cse213.courseState, 'ACTIVE');

    assert.ok(data.coursework.length >= 2);
    const quiz = data.coursework.find((w: any) => w.id === 'srm-work-213-quiz');
    assert.ok(quiz);
    assert.strictEqual(quiz.dueDate, '2026-09-30');
    assert.strictEqual(quiz.priority, 'CRITICAL');
  });
});

describe('AI Tool Retrieval & Grounding Tests', () => {
  test('AIToolRegistry retrieves real database state with citations', async () => {
    const { AIToolRegistry } = await import('../src/services/ai/AIToolRegistry');
    const registry = AIToolRegistry.getInstance();

    const deadlines = registry.getUpcomingDeadlines(7);
    assert.ok(deadlines.data.coursework.length > 0 || deadlines.data.emails.length > 0);
    assert.ok(deadlines.citations.length > 0);
    assert.ok(deadlines.citations.some(c => c.type === 'classroom' || c.type === 'gmail'));

    const exams = registry.getUpcomingExams();
    assert.ok(exams.citations.length > 0);
    assert.ok(exams.citations.some(c => c.title.toLowerCase().includes('exam') || c.title.toLowerCase().includes('cse 204')));
  });

  test('FallbackAIProvider produces grounded answer with citations', async () => {
    const fallback = new FallbackAIProvider();
    const result = await fallback.answerCampusQuery('Which assignments are due this week?', [], []);

    assert.ok(result.answer.length > 10);
    assert.ok(result.citations && result.citations.length > 0, 'Must contain source citations');
    assert.ok(result.toolUsed?.includes('getUpcomingDeadlines'));
  });
});

describe('Gmail Normalization & Filtering Tests', () => {
  test('decodes base64 MIME payload correctly', () => {
    const { GmailService } = require('../src/services/gmail/GmailService');
    const sampleText = 'Important CSE 204 Circular from SRM University-AP';
    const encoded = Buffer.from(sampleText).toString('base64');
    const decoded = GmailService.decodeBase64(encoded);
    assert.strictEqual(decoded, sampleText);
  });

  test('allows Google Classroom notification emails via UniversityFilter', () => {
    assert.strictEqual(UniversityFilter.isUniversityEmail('no-reply@classroom.google.com'), true);
    assert.strictEqual(UniversityFilter.isUniversityEmail('classroom-notifications@google.com'), true);
  });
});

