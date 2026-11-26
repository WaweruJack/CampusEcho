import { useState } from 'react';
import { ClipboardList, Plus, Search, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCampusData } from '../../context/CampusDataContext';

const NOTICE_CATEGORIES = [
  { id: 'all', label: 'All Notices' },
  { id: 'venue_change', label: 'Venue Changes' },
  { id: 'cat', label: 'CATs' },
  { id: 'assignment', label: 'Assignments' },
  { id: 'makeup', label: 'Class Makeups' },
  { id: 'deadline', label: 'Deadlines' },
  { id: 'academic', label: 'Academic' },
];

export default function NoticeBoardPage() {
  const { user } = useAuth();
  const { announcements, units, publishAnnouncement } = useCampusData();

  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showPublish, setShowPublish] = useState(false);

  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'academic',
    unitCode: units[0]?.code || 'CCS 3201',
    isUrgent: false,
  });
  const [publishFeedback, setPublishFeedback] = useState('');

  const canPublish = user?.role === 'lecturer' && user?.lecturerStatus === 'approved';

  const filtered = announcements.filter((a) => {
    const matchCat = category === 'all' || a.category === category;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.body.toLowerCase().includes(q) ||
      a.unitCode.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  async function handlePublish(e) {
    e.preventDefault();
    setPublishFeedback('');
    const res = await publishAnnouncement(form);
    if (res.error) {
      setPublishFeedback(res.error);
      return;
    }
    setForm({ title: '', body: '', category: 'academic', unitCode: units[0]?.code || 'CCS 3201', isUrgent: false });
    setShowPublish(false);
    setPublishFeedback('Official notice published and student notifications dispatched.');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Digital Notice Board
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Official academic notices, CAT schedules, assignment deadlines, and venue updates.
          </p>
        </div>

        {canPublish && (
          <button
            type="button"
            onClick={() => setShowPublish((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold self-start whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>{showPublish ? 'Close Form' : 'Publish Official Notice'}</span>
          </button>
        )}
      </div>

      {publishFeedback && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-200">
          {publishFeedback}
        </div>
      )}

      {/* Approved Lecturer Publish Form */}
      {canPublish && showPublish && (
        <form
          onSubmit={handlePublish}
          className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        >
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Publish Official Academic Notice
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notice Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. CAT 2 Timetable & Seating Arrangement"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Course Unit
              </label>
              <select
                value={form.unitCode}
                onChange={(e) => setForm((p) => ({ ...p, unitCode: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.code}>
                    {u.code} · {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Notice Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="academic">Academic Notice</option>
                <option value="cat">CAT Announcement</option>
                <option value="assignment">Assignment</option>
                <option value="makeup">Class Makeup</option>
                <option value="venue_change">Venue Change</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) => setForm((p) => ({ ...p, isUrgent: e.target.checked }))}
                  className="rounded border-slate-300 text-indigo-600"
                />
                <span>Mark as urgent notice</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Announcement Details
            </label>
            <textarea
              rows={3}
              required
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="Write clear instructions, times, and venues..."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 text-white text-xs font-semibold"
            >
              Publish Notice
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notices by unit code, keyword, or lecturer..."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {NOTICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                category === cat.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center text-sm text-slate-500">
            No announcements match your filter.
          </div>
        ) : (
          filtered.map((notice) => (
            <article
              key={notice.id}
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-indigo-700 dark:text-cyan-400">
                    {notice.unitCode}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{notice.category.replace('_', ' ')}</span>
                  <span aria-hidden="true">·</span>
                  <span>Posted by {notice.authorName}</span>
                </div>
                <div className="flex items-center gap-3">
                  {notice.isUrgent && (
                    <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Urgent</span>
                    </span>
                  )}
                  <span className="tabular-nums">
                    {new Date(notice.createdAt).toLocaleDateString('en-KE', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-2 flex items-start gap-2">
                <ClipboardList className="h-4.5 w-4.5 text-slate-400 mt-1 shrink-0" />
                <span>{notice.title}</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {notice.body}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
