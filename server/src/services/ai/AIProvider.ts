import { EmailAnalysisResult, CampusBriefingResult, EmailData, ActionItem, AssistantQueryResult, SourceCitation } from '../../types';

export { AssistantQueryResult, SourceCitation };


export interface AIProvider {
  name: 'gemini' | 'mock-fallback';
  
  analyzeEmail(email: {
    subject: string;
    body: string;
    sender: string;
    recipient?: string;
  }): Promise<EmailAnalysisResult>;

  generateBriefing(
    emails: EmailData[],
    userName: string
  ): Promise<CampusBriefingResult>;

  answerCampusQuery(
    query: string,
    contextEmails: EmailData[],
    actions: ActionItem[]
  ): Promise<AssistantQueryResult>;
}
