import crypto from 'crypto';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { AIProvider, AssistantQueryResult } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { FallbackAIProvider } from './FallbackAIProvider';
import { EmailAnalysisResult, CampusBriefingResult, EmailData, ActionItem } from '../../types';

export class AIService {
  private static instance: AIService;
  private provider: AIProvider;
  private cache: Map<string, EmailAnalysisResult> = new Map();
  private briefingCache: { timestamp: number; data: CampusBriefingResult } | null = null;
  private modelName: string;

  private constructor() {
    const aiProviderEnv = process.env.AI_PROVIDER || 'mock';
    const geminiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    if (aiProviderEnv.toLowerCase() === 'gemini' && geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      console.log(`🤖 AIService: Initializing Google Gemini AI Provider with model: ${this.modelName}`);
      this.provider = new GeminiProvider(geminiKey, this.modelName);
    } else {
      console.log('⚡ AIService: Initializing Deterministic Mock/Fallback AI Provider');
      this.provider = new FallbackAIProvider();
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public getActiveProviderName(): string {
    return this.provider.name;
  }

  public getModelName(): string {
    return this.modelName;
  }

  public async checkHealth(): Promise<{ aiProvider: string; model: string; status: string; details?: string }> {
    if (this.provider instanceof GeminiProvider) {
      const res = await this.provider.verifyConnection();
      return {
        aiProvider: 'gemini',
        model: res.model,
        status: res.connected ? 'connected' : 'error',
        details: res.connected ? 'Gemini API reachable and operational' : res.message
      };
    }
    return {
      aiProvider: 'mock-fallback',
      model: 'deterministic-heuristics',
      status: 'active',
      details: 'Deterministic local heuristic engine operational'
    };
  }

  private computeHash(subject: string, body: string, sender: string): string {
    return crypto
      .createHash('sha256')
      .update(`${sender}:${subject}:${body}`)
      .digest('hex');
  }

  public async analyzeEmail(email: {
    subject: string;
    body: string;
    sender: string;
  }): Promise<EmailAnalysisResult> {
    const hash = this.computeHash(email.subject, email.body, email.sender);

    if (this.cache.has(hash)) {
      return this.cache.get(hash)!;
    }

    const result = await this.provider.analyzeEmail(email);
    this.cache.set(hash, result);
    return result;
  }

  public async generateBriefing(emails: EmailData[], userName: string): Promise<CampusBriefingResult> {
    const now = Date.now();
    if (this.briefingCache && now - this.briefingCache.timestamp < 5 * 60 * 1000) {
      return this.briefingCache.data;
    }

    const briefing = await this.provider.generateBriefing(emails, userName);
    this.briefingCache = { timestamp: now, data: briefing };
    return briefing;
  }

  public async answerCampusQuery(
    query: string,
    contextEmails: EmailData[],
    actions: ActionItem[]
  ): Promise<AssistantQueryResult> {
    return this.provider.answerCampusQuery(query, contextEmails, actions);
  }

  public clearCache(): void {
    this.cache.clear();
    this.briefingCache = null;
  }
}
