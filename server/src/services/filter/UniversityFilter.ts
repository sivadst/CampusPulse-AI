export class UniversityFilter {
  private static defaultDomains: string[] = [
    'srmap.edu.in',
    'srmist.edu.in',
    'university.edu',
    'edu'
  ];

  public static getAllowedDomains(): string[] {
    const envDomains = process.env.ALLOWED_UNIVERSITY_DOMAINS;
    if (envDomains) {
      return envDomains.split(',').map(d => d.trim().toLowerCase().replace(/^@/, ''));
    }
    return UniversityFilter.defaultDomains;
  }

  /**
   * Checks whether an email originates from an authorized university domain or Google Classroom notification.
   */
  public static isUniversityEmail(sender: string, recipient?: string): boolean {
    const allowed = UniversityFilter.getAllowedDomains();
    const extractDomain = (addr: string): string => {
      const match = addr.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      return match ? match[1].toLowerCase() : '';
    };

    const senderDomain = extractDomain(sender);
    const recipientDomain = recipient ? extractDomain(recipient) : '';
    const senderLower = sender.toLowerCase();

    // 1. Google Classroom notifications are allowed as they correspond to academic coursework
    if (
      senderLower.includes('classroom.google.com') ||
      senderLower.includes('google.classroom') ||
      senderLower.includes('classroom-notifications@google.com') ||
      senderLower.includes('no-reply@classroom.google.com')
    ) {
      return true;
    }

    // 2. Check sender domain against allowed university domains
    const senderMatches = allowed.some(d => senderDomain === d || senderDomain.endsWith(`.${d}`));
    if (senderMatches) return true;

    // 3. Check recipient if sender is university-adjacent
    if (recipientDomain) {
      const recipientMatches = allowed.some(d => recipientDomain === d || recipientDomain.endsWith(`.${d}`));
      if (recipientMatches && (senderLower.includes('admin') || senderLower.includes('dept') || senderLower.includes('edu') || senderLower.includes('classroom'))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Returns human-readable filtering reason for non-university emails
   */
  public static getFilterReason(sender: string): string {
    const s = sender.toLowerCase();
    if (s.includes('amazon') || s.includes('flipkart') || s.includes('order')) {
      return "Commercial e-commerce delivery notification filtered out";
    }
    if (s.includes('instagram') || s.includes('facebook') || s.includes('twitter') || s.includes('linkedin')) {
      return "External social media notification filtered out";
    }
    if (s.includes('promo') || s.includes('deals') || s.includes('edutech')) {
      return "External marketing promotion filtered out";
    }
    return "Non-institutional domain filtered out by University Domain Security Policy";
  }
}

