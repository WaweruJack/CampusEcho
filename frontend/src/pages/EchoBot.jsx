import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BOT_RESPONSES, DEFAULT_BOT_REPLY } from '../data/mockData';
import { 
  Send, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  Cpu, 
  MessageSquare, 
  UserCircle 
} from 'lucide-react';

export default function EchoBot() {
  const { currentProfile } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Hello ${currentProfile.firstName}! I'm **EchoBot**, your intelligent campus companion. 🎓\n\nI can help you navigate university blocks, retrieve today's classes, look up graduation schedules, or find cafeteria menu prices.\n\nTry sending me one of the suggested prompts below or ask any question!`,
      time: 'Just now'
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  const suggestedPrompts = [
    'Where is the library?',
    'When is graduation?',
    'Show today\'s classes.',
    'Where is the ICT Lab?'
  ];

  // Scroll to bottom on updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Keyword match responder
  const getBotResponse = (query) => {
    const q = query.toLowerCase();
    
    // Scan keywords in data
    for (const item of BOT_RESPONSES) {
      const match = item.keywords.some(keyword => q.includes(keyword));
      if (match) {
        return item.response;
      }
    }
    
    return "I couldn't match any precise campus indicators with that query. " + DEFAULT_BOT_REPLY;
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Append User Message
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing latency
    setTimeout(() => {
      const botReplyText = getBotResponse(text);
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: botReplyText,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 450);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: `Chat reset! Let's start fresh, ${currentProfile.firstName}. How can I assist you on campus today?`,
        time: 'Just now'
      }
    ]);
  };

  const formatText = (text) => {
    // Basic bold markdown styling (e.g. **text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-blue-600 dark:text-blue-400">{part.slice(2, -2)}</strong>;
      }
      // Replace newline characters with <br />
      if (part.includes('\n')) {
        return part.split('\n').map((line, lIdx) => (
          <React.Fragment key={`${index}-${lIdx}`}>
            {line}
            {lIdx < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      }
      return part;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-170px)] min-h-[480px] animate-fade-in">
      
      {/* CHAT MESSAGES PANEL (8 Columns) */}
      <section id="echobot-workspace" className="lg:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
        
        {/* Workspace Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Cpu className="w-5.5 h-5.5 animate-spin-slow text-indigo-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1">
                <span>EchoBot Assistant</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">Active Campus Companion</span>
            </div>
          </div>
          
          <button
            onClick={resetChat}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden"
            title="Reset Chat Session"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable messages core */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/20">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={msg.id} 
                className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-2.5 max-w-[85%] ${!isBot && 'flex-row-reverse space-x-reverse'}`}>
                  
                  {/* Avatar wrapper */}
                  <div className="shrink-0">
                    {isBot ? (
                      <div className="w-7.5 h-7.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shadow-xs">
                        🤖
                      </div>
                    ) : (
                      <img
                        src={currentProfile.avatar}
                        alt="User"
                        className="w-7.5 h-7.5 rounded-lg object-cover bg-slate-200 shadow-xs"
                      />
                    )}
                  </div>

                  {/* Speech bubble */}
                  <div className="space-y-1">
                    <div 
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isBot 
                          ? 'bg-white dark:bg-slate-850 border border-slate-150/60 dark:border-slate-800 text-slate-700 dark:text-slate-250 rounded-tl-none shadow-xs' 
                          : 'bg-blue-600 text-white rounded-tr-none shadow-md'
                      }`}
                    >
                      {formatText(msg.text)}
                    </div>
                    <span className="block text-[8px] text-slate-400 font-medium px-1">
                      {msg.time}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2.5">
                <div className="w-7.5 h-7.5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400 shrink-0">
                  ⏳
                </div>
                <div className="p-3 bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none flex items-center space-x-1 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggested tap prompts bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/60 flex items-center space-x-2 overflow-x-auto shrink-0 select-none no-scrollbar bg-white dark:bg-slate-900">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-450 whitespace-nowrap">Suggested:</span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              id={`suggested-prompt-${idx}`}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold hover:border-indigo-200 transition-all whitespace-nowrap shrink-0 cursor-pointer focus:outline-hidden"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3 shrink-0 bg-white dark:bg-slate-900"
        >
          <input
            type="text"
            value={inputText}
            id="echobot-input"
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask EchoBot anything... (e.g. library, cafeteria, classes)"
            className="flex-1 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs px-4 py-3 rounded-2xl focus:bg-white focus:outline-hidden border border-transparent focus:border-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            id="echobot-send-btn"
            disabled={!inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-700 text-white rounded-2xl shadow-sm transition-all shrink-0 cursor-pointer focus:outline-hidden"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </section>

      {/* RIGHTS BASES: HELP ACCORDION SUMMARY (4 Columns) */}
      <section id="echobot-reference-pane" className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4 h-fit max-h-full overflow-y-auto w-full">
        <div className="flex items-center space-x-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">EchoBot Knowledge base</h4>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 pb-2 leading-relaxed">
          EchoBot maps queries to help coordinates dynamically. Try these query combinations for deep evaluations:
        </div>

        <div className="space-y-3.5">
          <div className="p-3 bg-slate-50/70 dark:bg-slate-850/45 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">📚 Books & Research</span>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Type <strong className="text-blue-500">"library"</strong> or <strong className="text-blue-500">"quiet"</strong> to get details on the three-story Main Library extension, prints, and operating hours.
            </p>
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-slate-850/45 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">🥩 Dining Prices</span>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Type <strong className="text-blue-500">"cafeteria"</strong> or <strong className="text-blue-500">"lunch"</strong> to check mess prices. For example, Ugali beef with Sukuma is KES 120.
            </p>
          </div>

          <div className="p-3 bg-slate-50/70 dark:bg-slate-850/45 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">🎓 Clearance & Graduation</span>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Type <strong className="text-blue-500">"graduation"</strong> to read about 10th Ceremony date (Nov 27th), rehearsal schedules, and portal clearance checklists.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/40 dark:border-slate-800 rounded-2xl flex items-start space-x-2">
          <Sparkles className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
          <p className="text-[9.5px] leading-relaxed text-indigo-700 dark:text-indigo-300">
            <strong>Phase 2 API Scope</strong>:<br />
            Our engineering roadmap includes hooking EchoBot directly to the Gemini API with vector-based ground databases of school syllabus archives!
          </p>
        </div>
      </section>

    </div>
  );
}
