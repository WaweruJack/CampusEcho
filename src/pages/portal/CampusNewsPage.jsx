import { useState } from 'react';
import { Newspaper, Calendar } from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';

const NEWS_CATEGORIES = [
  { id: 'all', label: 'All Updates' },
  { id: 'events', label: 'University Events' },
  { id: 'graduation', label: 'Graduation' },
  { id: 'academic_calendar', label: 'Academic Calendar' },
  { id: 'developments', label: 'Developments' },
];

export default function CampusNewsPage() {
  const { news } = useCampusData();
  const [category, setCategory] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState(news[0] || null);

  const filtered = news.filter((item) => category === 'all' || item.category === category);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          MUST Campus News & Events
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          University developments, graduation guidelines, student activities, and academic calendar updates.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              category === cat.id
                ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          {filtered.map((item) => {
            const isSelected = selectedArticle?.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedArticle(item)}
                className={`w-full text-left rounded-xl p-5 border transition-colors ${
                  isSelected
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-700'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-700 dark:text-cyan-400 capitalize">
                    {item.category.replace('_', ' ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{item.publishedAt}</span>
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mt-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {item.summary}
                </p>
              </button>
            );
          })}
        </div>

        <aside className="lg:col-span-5">
          {selectedArticle ? (
            <article className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Newspaper className="h-3.5 w-3.5 text-indigo-700 dark:text-cyan-400" />
                <span className="capitalize">{selectedArticle.category.replace('_', ' ')}</span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Calendar className="h-3.5 w-3.5" />
                  {selectedArticle.publishedAt}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-3">
                {selectedArticle.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                By {selectedArticle.authorName}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3">
                <p>{selectedArticle.summary}</p>
                <p>{selectedArticle.content}</p>
              </div>
            </article>
          ) : (
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-sm text-slate-500">
              Select a news update to read full details.
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
