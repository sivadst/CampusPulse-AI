import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ExternalLink,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiService } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestedActions?: string[];
  referencedEmailIds?: string[];
  toolUsed?: string;
  citations?: any[];
  time: string;
}


export const AIChatDrawer: React.FC = () => {
  const { isAssistantOpen, setIsAssistantOpen, openEmailById } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Hello Muthu! I'm **CampusPulse AI Assistant for SRM University-AP**, grounded in your indexed university communications.\n\nAsk me about tomorrow's exams, attendance status, shuttle delays, or your urgent action items.",
      suggestedActions: [
        "What do I need to do today?",
        "When is my next exam?",
        "Do I have attendance warnings?",
        "What changed recently?"
      ],
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isAssistantOpen) return null;

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const response = await ApiService.askAssistant(q);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        suggestedActions: response.suggestedActions,
        referencedEmailIds: response.referencedEmailIds,
        toolUsed: response.toolUsed,
        citations: response.citations,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Top Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-indigo-50 to-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 font-heading">CampusPulse AI</h3>
            <p className="text-[10px] text-purple-700 font-semibold">Verified against SRM University-AP records</p>
          </div>
        </div>

        <button
          onClick={() => setIsAssistantOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/90 text-slate-800 border border-slate-200/80 shadow-2xs'
              }`}
            >
              {msg.toolUsed && (
                <div className="text-[9px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60 mb-2 inline-block">
                  ⚡ Tool: {msg.toolUsed}
                </div>
              )}

              <div className="whitespace-pre-line font-sans space-y-1">
                {msg.text}
              </div>

              {/* Source Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Grounded Sources:</span>
                  <div className="space-y-1">
                    {msg.citations.map((cite, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cite.id && cite.id.startsWith('email-')) {
                            openEmailById(cite.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg border text-[10px] transition-all ${
                          cite.id && cite.id.startsWith('email-') ? 'cursor-pointer hover:border-indigo-300 bg-white/80' : 'bg-white/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                            cite.type === 'classroom' ? 'bg-emerald-100 text-emerald-700' :
                            cite.type === 'calendar' ? 'bg-purple-100 text-purple-700' :
                            cite.type === 'gmail' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {cite.type}
                          </span>
                          <span className="truncate">{cite.title}</span>
                        </div>
                        {cite.snippet && (
                          <p className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{cite.snippet}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referenced Emails */}
              {msg.referencedEmailIds && msg.referencedEmailIds.length > 0 && (!msg.citations || msg.citations.length === 0) && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 w-full">Referenced Notices:</span>
                  {msg.referencedEmailIds.map(eid => (
                    <button
                      key={eid}
                      onClick={() => openEmailById(eid)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <span>View Notice ({eid})</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              )}


              {/* Suggested Action Chips */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(act)}
                      className="px-2 py-1 text-[10px] font-semibold bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-9">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.4s]" />
            <span>Scanning university database...</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about exams, attendance, buses..."
            className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
