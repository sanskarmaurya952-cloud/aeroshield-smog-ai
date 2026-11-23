import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, HouseholdProfile, AqiData } from '../types';
import { sendChatMessage } from '../services/api';
import { Send, Bot, User, HelpCircle, ShieldCheck } from 'lucide-react';

interface AiCopilotChatProps {
  profile: HouseholdProfile;
  aqiData: AqiData | null;
  currentCity: string;
}

const PRESET_QUERIES = [
  "My toddler has mild asthma and school is open, what should we do?",
  "How do I build a DIY air purifier for under $30?",
  "When is the safest time to open windows to air out today?",
  "Is it safe to go for an outdoor morning jog right now?",
  "How can I seal door cracks to prevent street smog from entering?"
];

export const AiCopilotChat: React.FC<AiCopilotChatProps> = ({ profile, aqiData, currentCity }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `### 🛡️ Welcome to AeroShield AI!
I am your **Clean Air & Winter Smog Defense Copilot**.

I'm aware that current air quality in **${aqiData?.location.city || currentCity}** is at **AQI ${aqiData?.current.aqi || 220} (${aqiData?.current.category || 'Hazardous'})**, and I have factored your household's profile into my reasoning.

Ask me anything about:
- **Low-emission daily schedule adjustments**
- **Low-cost DIY indoor air filtration hacks**
- **Pediatric and asthmatic emergency protection**
- **Thermal inversion ventilation windows**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'AeroShield Clean Air Intelligence'
    }
  ]);

  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: textToSend,
        profile,
        city: currentCity
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source,
        model: response.model
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ I encountered a temporary connection glitch. Please check that the server is running or try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'System Error Handler'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown renderer for chat responses
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-base font-bold text-white mt-3 mb-1.5">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-lg font-bold text-cyan-300 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-2 p-2.5 rounded-lg bg-cyan-950/40 border-l-4 border-cyan-400 text-xs text-cyan-200">
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start space-x-2 my-1 text-xs text-slate-300">
            <span className="text-cyan-400 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: line.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p
          key={idx}
          className="text-xs text-slate-300 leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
        />
      );
    });
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col h-[650px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
              <span>AeroShield Copilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-[11px] text-slate-400">Context-Aware GenAI Smog Reasoning</p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-cyan-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          City: {currentCity} | AQI: {aqiData?.current.aqi || 220}
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-slate-800/60">
        <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center space-x-1 flex-shrink-0">
          <HelpCircle className="w-3 h-3 text-cyan-400" />
          <span>Quick Ask:</span>
        </span>
        {PRESET_QUERIES.map((query, i) => (
          <button
            key={i}
            onClick={() => handleSend(query)}
            className="text-[11px] text-slate-300 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex-shrink-0 cursor-pointer"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                  isUser ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {isUser ? (
                  <p>{msg.text}</p>
                ) : (
                  <div>
                    {renderFormattedText(msg.text)}
                    {msg.source && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>Source: {msg.source}</span>
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[9px] opacity-60 block mt-1 text-right">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>AeroShield is formulating context-aware clean air guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="pt-3 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AeroShield about routines, air hacks, masks, or ventilation..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 cursor-pointer shadow-md shadow-cyan-900/30"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
