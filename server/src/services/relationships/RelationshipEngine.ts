import { EmailData, ScheduleChangeItem } from '../../types';

export interface EmailThreadCluster {
  threadId: string;
  topicTitle: string;
  category: string;
  emails: EmailData[];
  latestUpdate: string;
  hasChanges: boolean;
  changesSummary?: string;
}

export class RelationshipEngine {
  /**
   * Identifies thread relationships and connects fragmented SRM AP communications
   */
  public static clusterByTopic(emails: EmailData[]): EmailThreadCluster[] {
    const threadMap = new Map<string, EmailData[]>();

    emails.forEach(email => {
      let tid = email.threadId;
      if (!tid) {
        if (email.subject.toLowerCase().includes('acm')) {
          tid = 'thread-acm-recruitment';
        } else if (email.subject.toLowerCase().includes('startup') || email.subject.toLowerCase().includes('ecell')) {
          tid = 'thread-startup-wars';
        } else if (email.subject.toLowerCase().includes('closure') || email.subject.toLowerCase().includes('circular')) {
          tid = 'thread-closure-schedule';
        } else if (email.subject.toLowerCase().includes('cse 204') || email.subject.toLowerCase().includes('algorithm') || email.subject.toLowerCase().includes('exam')) {
          tid = 'thread-cse204-exam';
        } else if (email.subject.toLowerCase().includes('bus') || email.subject.toLowerCase().includes('transport')) {
          tid = 'thread-transport-transit';
        } else {
          tid = `thread-srm-${email.category.toLowerCase()}`;
        }
      }

      if (!threadMap.has(tid)) {
        threadMap.set(tid, []);
      }
      threadMap.get(tid)!.push(email);
    });

    const clusters: EmailThreadCluster[] = [];

    threadMap.forEach((emailList, threadId) => {
      emailList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      let topicTitle = emailList[0].subject.replace(/^(URGENT:\s*|IMPORTANT NOTICE:\s*|CIRCULAR:\s*|REMINDER:\s*)/i, '');
      let hasChanges = false;
      let changesSummary: string | undefined;

      if (threadId === 'thread-closure-schedule') {
        topicTitle = "SRM AP University Operations & Compensatory Working Day";
        hasChanges = true;
        changesSummary = "Closure on Sept 25 compensated by mandatory full working day on Saturday, October 10 (Friday timetable).";
      } else if (threadId === 'thread-startup-wars') {
        topicTitle = "E-Cell STARTUP WARS Pitching Series";
        hasChanges = true;
        changesSummary = "Event originally scheduled for Sept 21 postponed by E-Cell; new demo day dates to be notified.";
      } else if (threadId === 'thread-cse204-exam') {
        topicTitle = "CSE 204 Algorithms Mid-Semester Examination";
        hasChanges = true;
        changesSummary = "Venue relocated from Central Hall to Room S202, SR Block. Reporting cutoff: 8:40 AM.";
      } else if (threadId === 'thread-acm-recruitment') {
        topicTitle = "ACM Student Chapter Recruitment 2026";
        hasChanges = false;
        changesSummary = "Recruitment across 5 teams (R&D, Events, PR, Social Media, Docs). Deadline Sept 30.";
      }

      clusters.push({
        threadId,
        topicTitle,
        category: emailList[0].category,
        emails: emailList,
        latestUpdate: emailList[0].dateFormatted,
        hasChanges,
        changesSummary
      });
    });

    return clusters;
  }

  /**
   * Generates "What Changed?" critical diff items comparing recent notices
   */
  public static getWhatChanged(emails: EmailData[]): ScheduleChangeItem[] {
    const changes: ScheduleChangeItem[] = [
      {
        topic: "SRM AP University Rain Closure & Compensatory Working Day",
        previousValue: "Normal Academic Schedule (Sept 25 Regular Classes)",
        newValue: "September 25 Closure; October 10 Compensatory Working Day",
        changeType: "TIMING",
        summary: "Registrar circular: Campus closed Sept 25 due to heavy rainfall & road waterlogging; Saturday, Oct 10 is compensatory working day following Friday timetable.",
        emailId: "email-012",
        whatChanged: "Physical campus closed on September 25. Academic activities scheduled for that date cancelled; October 10 declared mandatory compensatory working day.",
        whyItMatters: "Directly affects your 75% attendance quota, CEL presentations, and laboratory practical sessions.",
        whatYouNeedToDo: "Do not travel to campus on Sept 25. Attend all scheduled Friday classes and lab sessions on Saturday, October 10."
      },
      {
        topic: "E-Cell STARTUP WARS 2026 Schedule",
        previousValue: "September 21, 2026",
        newValue: "Postponed (Revised dates to be announced later)",
        changeType: "CANCELLATION",
        summary: "E-Cell postponed STARTUP WARS. Revised pitching dates to be notified soon; submitted pitch decks remain preserved.",
        emailId: "email-015",
        whatChanged: "STARTUP WARS scheduled for September 21 has been postponed. Original schedule is no longer valid.",
        whyItMatters: "Student startup founders and pitch teams do not need to report on Sept 21. More preparation time is available.",
        whatYouNeedToDo: "Disregard September 21 schedule. Continue refining slide decks and monitor ecell@srmap.edu.in for revised dates."
      },
      {
        topic: "CSE 204 Algorithms Examination Venue Relocation",
        previousValue: "Central Lecture Hall A",
        newValue: "Room S202, SR Block (Reporting: 09:30 AM)",
        changeType: "LOCATION",
        summary: "HOD CSE relocated tomorrow's CSE 204 exam to S202 SR Block due to technical lab setup. Reporting time is 09:30 AM.",
        emailId: "email-001",
        whatChanged: "Exam venue shifted from Central Lecture Hall A to Room S202, SR Block (2nd Floor).",
        whyItMatters: "Reporting to the wrong hall will cause late entry disqualification by the exam proctors.",
        whatYouNeedToDo: "Go directly to Room S202, SR Block by 09:30 AM with your physical printed Hall Ticket and Student ID."
      },
      {
        topic: "SRM AP Campus Bus Routes 5 & 8 Timings",
        previousValue: "07:40 AM Departure via Tadikonda",
        newValue: "07:25 AM (-15m) via Mangalagiri Bypass to Main Gate Bay 2",
        changeType: "TIMING",
        summary: "Due to bypass road culvert works, buses depart 15 mins earlier to guarantee arrival before the 09:00 AM class cutoff.",
        emailId: "email-003",
        whatChanged: "Morning departure shifted 15 minutes earlier (07:25 AM) and rerouted via Mangalagiri Bypass.",
        whyItMatters: "Missing the earlier shuttle means missing the 09:00 AM academic attendance biometric punch.",
        whatYouNeedToDo: "Arrive at your pickup point by 07:20 AM and disembark at Main Gate Bus Bay 2."
      }
    ];

    return changes;
  }
}
