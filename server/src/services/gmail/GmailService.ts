import { google } from 'googleapis';
import sanitizeHtml from 'sanitize-html';
import { EmailData } from '../../types';
import { UniversityFilter } from '../filter/UniversityFilter';
import { GoogleOAuthService } from '../google/GoogleOAuthService';

export class GmailService {
  /**
   * Sanitizes raw email HTML content to guarantee 100% XSS-free safe rendering
   */
  public static sanitizeEmailContent(rawHtml: string): string {
    return sanitizeHtml(rawHtml, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'table', 'tr', 'td', 'th', 'span', 'div'],
      allowedAttributes: {
        'a': ['href', 'target', 'rel'],
        '*': ['class', 'style']
      },
      allowedSchemes: ['http', 'https', 'mailto']
    });
  }

  /**
   * Helper to decode Base64 / Base64URL encoded Gmail message payload body parts
   */
  public static decodeBase64(data: string): string {
    try {
      // Replace URL-safe characters
      const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
      return Buffer.from(base64, 'base64').toString('utf-8');
    } catch (e) {
      return '';
    }
  }

  /**
   * Recursively extracts plain text and HTML from MIME payload
   */
  public static extractBodyFromPayload(payload: any): { text: string; html: string } {
    let text = '';
    let html = '';

    if (!payload) return { text, html };

    if (payload.body && payload.body.data) {
      const decoded = GmailService.decodeBase64(payload.body.data);
      if (payload.mimeType === 'text/html') {
        html += decoded;
      } else {
        text += decoded;
      }
    }

    if (payload.parts && Array.isArray(payload.parts)) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          text += GmailService.decodeBase64(part.body.data);
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          html += GmailService.decodeBase64(part.body.data);
        } else if (part.parts) {
          const nested = GmailService.extractBodyFromPayload(part);
          text += nested.text;
          html += nested.html;
        }
      }
    }

    return { text, html };
  }

  /**
   * Fetches messages using Gmail API and applies university-domain filtering and deduplication
   */
  public static async fetchUniversityEmails(): Promise<EmailData[]> {
    const oauthService = GoogleOAuthService.getInstance();
    if (!oauthService.isAuthConnected()) {
      throw new Error('Google OAuth is not connected. Please connect your Google account or use Demo Mode.');
    }

    const auth = oauthService.getClient();
    const gmail = google.gmail({ version: 'v1', auth });

    // Fetch message IDs with a query to prioritize relevant messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 50,
      q: 'srmap OR classroom OR "srm university" OR exam OR assignment OR workshop'
    });

    const messages = response.data.messages || [];
    const results: EmailData[] = [];
    const seenIds = new Set<string>();

    for (const msg of messages) {
      if (!msg.id || seenIds.has(msg.id)) continue;
      seenIds.add(msg.id);

      try {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'full'
        });

        const payload = detail.data.payload;
        const headers = payload?.headers || [];

        const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';
        const from = getHeader('from');
        const subject = getHeader('subject') || '(No Subject)';
        const date = getHeader('date') || new Date().toISOString();
        const to = getHeader('to') || 'student@srmap.edu.in';

        // Apply institutional domain filter
        if (!UniversityFilter.isUniversityEmail(from, to)) {
          continue;
        }

        // Extract body
        const { text, html } = GmailService.extractBodyFromPayload(payload);
        const rawBody = text || html || detail.data.snippet || '';
        const sanitized = GmailService.sanitizeEmailContent(rawBody);

        // Detect if related to Classroom
        const isClassroomNotification =
          from.toLowerCase().includes('classroom') ||
          subject.toLowerCase().includes('google classroom') ||
          rawBody.toLowerCase().includes('classroom.google.com');

        let senderName = from.split('<')[0].replace(/"/g, '').trim();
        if (!senderName) senderName = from;

        results.push({
          id: `gmail-${msg.id}`,
          threadId: detail.data.threadId || `thread-${msg.id}`,
          sender: from,
          senderName,
          recipient: to,
          subject,
          body: sanitized,
          timestamp: new Date(date).toISOString(),
          dateFormatted: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          category: isClassroomNotification ? 'ASSIGNMENTS' : 'ACADEMICS',
          priority: 'MEDIUM',
          priorityScore: 60,
          priorityReason: isClassroomNotification ? 'Classroom notification ingested from Gmail' : 'Verified university communication',
          categoryReason: 'University institutional sender domain confirmed',
          summary: detail.data.snippet || subject,
          actionRequired: isClassroomNotification,
          urgency: 'MEDIUM',
          tags: isClassroomNotification ? ['gmail', 'live', 'classroom'] : ['gmail', 'live', 'university'],
          isRead: false,
          source: 'gmail',
          systemOrigin: isClassroomNotification ? 'Google Classroom' : 'SRM Mail Gateway',
          relatedClassroomCourseId: isClassroomNotification ? 'srm-course-213' : undefined
        });
      } catch (msgErr) {
        console.warn(`Failed to fetch details for Gmail message ${msg.id}:`, msgErr);
      }
    }

    return results;
  }
}
