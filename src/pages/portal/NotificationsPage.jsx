import { useState } from 'react';
import { Bell, CheckCheck, Mail, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCampusData } from '../../context/CampusDataContext';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'venue_change', label: 'Venue Changes' },
  { id: 'academic', label: 'CATs & Assignments' },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useCampusData();

  const [filter, setFilter] = useState('all');
  const [dispatchStatus, setDispatchStatus] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'venue_change') return n.category === 'venue_change' || n.category === 'timetable_change';
    if (filter === 'academic') return ['cat', 'assignment', 'makeup', 'announcement'].includes(n.category);
    return true;
  });

  async function sendTestEmailAlert() {
    setDispatchStatus('');
    setSendingEmail(true);
    const latest = notifications[0];
    try {
      const res = await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: user?.email,
          subject: latest?.title || 'CampusEcho Alert',
          message: latest?.message || 'Upcoming class alert from CampusEcho MUST.',
          category: latest?.category || 'announcement',
        }),
      });
      const data = await res.json();
      if (data.delivered) {
        setDispatchStatus(`Email alert sent to ${user?.email} via ${data.provider}.`);
      } else {
        setDispatchStatus(data.detail || data.error || 'Email provider configuration required.');
      }
    } catch {
      setDispatchStatus('Could not reach email notification dispatch endpoint.');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Notification Center
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 tabular-nums">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'} · Real-time venue, timetable, and academic updates
          </p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 self-start whitespace-nowrap"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Filters & Delivery Test */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                filter === f.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={sendingEmail}
            onClick={sendTestEmailAlert}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Mail className="h-3.5 w-3.5" />
            <span>{sendingEmail ? 'Sending...' : `Send Test Email (${user?.email || 'MUST Email'})`}</span>
          </button>
        </div>
      </div>

      {dispatchStatus && (
        <div className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 text-xs text-slate-700 dark:text-slate-200">
          {dispatchStatus}
        </div>
      )}

      {/* Notification List */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No notifications in this category.
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {notif.category === 'venue_change' ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <Bell className="h-3.5 w-3.5 text-indigo-700 dark:text-cyan-400" />
                  )}
                  <span className="capitalize font-semibold text-indigo-700 dark:text-cyan-400">
                    {notif.category.replace('_', ' ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {new Date(notif.createdAt).toLocaleString('en-KE', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {!notif.isRead && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-indigo-700 dark:text-cyan-400">Unread</span>
                    </>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {notif.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {notif.message}
                </p>

                {notif.oldVenue && notif.newVenue && (
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    Old Venue: {notif.oldVenue} → New Venue: {notif.newVenue}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => markNotificationRead(notif.id, !notif.isRead)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 self-start whitespace-nowrap"
              >
                {notif.isRead ? 'Mark Unread' : 'Mark Read'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
