import { EmailData, ActionItem } from '../../types';

export class ActionExtractor {
  /**
   * Derives actionable student tasks directly from prioritized email contents
   */
  public static extractActions(emails: EmailData[]): ActionItem[] {
    const actions: ActionItem[] = [];

    emails.forEach(email => {
      if (email.actionRequired && email.actionText) {
        actions.push({
          id: `action-${email.id}`,
          emailId: email.id,
          title: email.actionText,
          category: email.category,
          priority: email.priority,
          deadline: email.actionDeadline,
          deadlineDate: email.deadlineDate,
          completed: Boolean(email.isActionCompleted),
          sourceEmailSubject: email.subject,
          sourceSender: email.senderName,
          location: email.location
        });
      }
    });

    // Sort by priority (CRITICAL first, then HIGH, MEDIUM, LOW) then deadline
    const priorityWeights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    actions.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const weightDiff = priorityWeights[b.priority] - priorityWeights[a.priority];
      if (weightDiff !== 0) return weightDiff;
      if (a.deadlineDate && b.deadlineDate) {
        return new Date(a.deadlineDate).getTime() - new Date(b.deadlineDate).getTime();
      }
      return 0;
    });

    return actions;
  }
}
