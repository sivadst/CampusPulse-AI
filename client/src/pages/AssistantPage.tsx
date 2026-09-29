import React, { useState } from 'react';
import { Bot, Sparkles, Send, ArrowRight, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiService } from '../services/api';

export const AssistantPage: React.FC = () => {
  const { openEmailById } = useApp();
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'init',
      sender: 'assistant',
      text: "👋 Welcome to CampusPulse AI Assistant! I am connected to your university inbox and schedule.\n\nYou can ask me questions such as:\n• **'What do I need to do today?'**\n• **'When is my next exam and where?'**\n• **'Are there any attendance shortage warnings?'**\n• **'What changed since yesterday?'**",
      suggestedActions: [
        "What do I need to do today?",
        "When is my next exam?",
        "Do I have attendance warnings?",
        "What changed recently?"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (qText?: string) => {
    const q = qText || input;
    if (!q.trim()) return;

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: q }]);
    if (!qText) setInput('');
    setIsTyping(true);

    try {
      const res = await ApiService.askAssistant(q);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        suggestedActions: res.suggestedActions,
        referencedEmailIds: res.referencedEmailIds,
        toolUsed: res.toolUsed
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[82vh] flex flex-col bg-white border border-[#E7EAF3] rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-4 px-6 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-indigo-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 font-heading">
              CampusPulse AI Assistant
            </h2>
            <p className="text-xs text-indigo-700 font-semibold">
              SIH PS02 Information Synthesis Agent
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          ● Indexed to University Database
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs'
              }`}
            >
              {msg.toolUsed && (
                <div className="text-[10px] font-mono text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded border border-purple-200 mb-2 inline-block">
                  ⚡ Tool Invocation: {msg.toolUsed}
                </div>
              )}

              <div className="whitespace-pre-line space-y-1.5">
                {msg.text}
              </div>

              {msg.referencedEmailIds && msg.referencedEmailIds.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold text-slate-500 w-full">Referenced Notices:</span>
                  {msg.referencedEmailIds.map((eid: string) => (
                    <button
                      key={eid}
                      onClick={() => openEmailById(eid)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <span>View Notice ({eid})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}

              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                  {msg.suggestedActions.map((act: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSend(act)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
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
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-11">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce [animation-delay:0.4s]" />
            <span>CampusPulse AI is reasoning over your emails...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your campus communications..."
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
