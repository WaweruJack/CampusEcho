import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, Send, Trash2, Sparkles } from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';

const SUGGESTED_QUESTIONS = [
  'When is my next class?',
  'Where is the computer laboratory?',
  'What classes do I have tomorrow?',
  'Are there any upcoming university events?',
  'Where can I get food on campus?',
  'How do I find the administration block?',
  'Have there been any timetable changes?',
  'What announcements have been posted?',
];

export default function EchoBotPage() {
  const { echoBotMessages, sendEchoBotMessage, clearEchoBotHistory } = useCampusData();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const bottomRef = useRef(null);
  const handledQueryRef = useRef('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [echoBotMessages, sending]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== handledQueryRef.current) {
      handledQueryRef.current = q;
      setSearchParams({}, { replace: true });
      handleAsk(q);
    }
  }, [searchParams]);

  async function handleAsk(questionText) {
    const q = (questionText ?? input).trim();
    if (!q || sending) return;
    if (!questionText) setInput('');
    setSending(true);
    await sendEchoBotMessage(q);
    setSending(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-11rem)] min-h-[540px]">
      {/* Chat Main Viewport */}
      <section className="lg:col-span-8 flex flex-col rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-indigo-900 dark:bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
                EchoBot · MUST Smart Campus Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grounded in your live timetable, venue updates, campus map, and notices
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearEchoBotHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {echoBotMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-indigo-900 dark:bg-indigo-600 text-white'
                      : msg.isError
                      ? 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start">
              <div className="rounded-xl px-4 py-3 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                EchoBot is checking your CampusEcho records...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask EchoBot about classes, venues, cafeterias, or campus locations..."
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-4 py-2.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>

      {/* Suggested Questions & Grounding Sidebar */}
      <aside className="lg:col-span-4 space-y-5">
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
          <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
            <span>Suggested Questions</span>
          </h3>
          <div className="mt-3 space-y-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                disabled={sending}
                onClick={() => handleAsk(q)}
                className="w-full text-left px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-900 dark:text-white mb-1.5">
            Accuracy & Grounding Policy
          </p>
          <p>
            EchoBot answers strictly from your CampusEcho timetable, venue updates, campus directory, and posted notices. When information is unavailable, EchoBot states so rather than guessing.
          </p>
        </div>
      </aside>
    </div>
  );
}
