import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  MapPin,
  Bell,
  ClipboardList,
  UtensilsCrossed,
  AlertTriangle,
  Send,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCampusData } from '../../context/CampusDataContext';
import StatusIndicator from '../../components/StatusIndicator';

export default function DashboardOverview() {
  const { user } = useAuth();
  const {
    todaysClasses,
    nextClass,
    todayDayName,
    announcements,
    notifications,
    services,
  } = useCampusData();
  const [quickQuestion, setQuickQuestion] = useState('');
  const navigate = useNavigate();

  const formattedDate = new Date().toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function handleEchoBotShortcut(e) {
    e.preventDefault();
    if (!quickQuestion.trim()) {
      navigate('/dashboard/echobot');
      return;
    }
    navigate(`/dashboard/echobot?q=${encodeURIComponent(quickQuestion.trim())}`);
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <section className="rounded-xl bg-slate-900 dark:bg-slate-900 border border-slate-800 text-white p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <p className="text-xs font-medium text-cyan-300 tabular-nums">{formattedDate}</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1.5 tracking-tight">
            Welcome back, {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {user?.role === 'lecturer'
              ? `${user?.department || 'Faculty'} · Staff ID ${user?.staffId || 'MUST'}`
              : `${user?.programme || 'MUST Student'} · ${user?.regNumber || ''}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/dashboard/timetable"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Full Timetable</span>
          </Link>
          {user?.role === 'lecturer' ? (
            <Link
              to="/dashboard/lecturer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Building2 className="h-4 w-4" />
              <span>Manage Classes & Venues</span>
            </Link>
          ) : (
            <Link
              to="/dashboard/maps"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <MapPin className="h-4 w-4" />
              <span>Campus Maps</span>
            </Link>
          )}
        </div>
      </section>

      {/* Primary Row: Next Class + EchoBot Shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Next Class Card */}
        <section className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-indigo-700 dark:text-cyan-400">
                Next Scheduled Class
              </span>
              {nextClass && <StatusIndicator status={nextClass.status} />}
            </div>

            {nextClass ? (
              <div className="mt-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    {nextClass.unitCode} · {nextClass.unitName}
                  </h3>
                  <span className="font-mono-nums text-sm font-semibold text-indigo-700 dark:text-cyan-400">
                    {nextClass.dayOfWeek} · {nextClass.startTime} – {nextClass.endTime}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Venue: <strong className="text-slate-900 dark:text-white">{nextClass.venueName}</strong> ({nextClass.buildingName}, {nextClass.floorLabel})
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Lecturer: {nextClass.lecturerName}
                </p>

                {nextClass.previousVenueName && (
                  <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <p className="font-semibold">
                        Venue Updated: Moved from {nextClass.previousVenueName} to {nextClass.venueName}
                      </p>
                      {nextClass.changeNote && <p className="mt-0.5 opacity-90">{nextClass.changeNote}</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                No upcoming scheduled classes found on your timetable.
              </p>
            )}
          </div>

          {nextClass && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={`/dashboard/maps?building=${nextClass.buildingId || ''}`}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Navigate to {nextClass.venueName}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/dashboard/timetable"
                className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                View weekly schedule
              </Link>
            </div>
          )}
        </section>

        {/* EchoBot AI Shortcut */}
        <section className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-cyan-400">
                <Bot className="h-4 w-4" />
                <span>EchoBot AI Shortcut</span>
              </span>
              <Link to="/dashboard/echobot" className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white">
                Open Full Chat
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ask about your next lecture room, tomorrow’s timetable, campus cafeterias, or recent announcements.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['When is my next class?', 'Where is Computer Lab 1?', 'Any timetable changes?'].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => navigate(`/dashboard/echobot?q=${encodeURIComponent(prompt)}`)}
                  className="text-xs px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950 dark:hover:text-cyan-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleEchoBotShortcut} className="mt-5 flex items-center gap-2">
            <input
              type="text"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              placeholder="Ask EchoBot anything about MUST..."
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-indigo-900 hover:bg-indigo-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Ask</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </section>
      </div>

      {/* Second Row: Today's Timetable & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Today’s Timetable ({todayDayName})
            </h3>
            <Link to="/dashboard/timetable" className="text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline">
              Daily & Weekly View
            </Link>
          </div>

          {todaysClasses.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No classes scheduled for {todayDayName}.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
              {todaysClasses.map((slot) => (
                <div key={slot.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono-nums text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {slot.unitCode} · {slot.unitName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {slot.venueName} ({slot.buildingName}) · {slot.lecturerName}
                    </p>
                    {slot.previousVenueName && (
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-medium">
                        Venue changed: {slot.previousVenueName} → {slot.venueName}
                      </p>
                    )}
                  </div>
                  <StatusIndicator status={slot.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Notifications */}
        <section className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <Bell className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
              <span>Recent Notifications</span>
            </h3>
            <Link to="/dashboard/notifications" className="text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {notifications.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No notifications yet. Live schedule changes and campus alerts will appear here.
              </p>
            ) : (
              notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="text-[11px] font-semibold text-indigo-700 dark:text-cyan-400 shrink-0">
                        Unread
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Third Row: Important Campus Announcements & Quick Access Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
              <span>Important Campus Announcements</span>
            </h3>
            <Link to="/dashboard/notices" className="text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline">
              Notice Board
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {announcements.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No official announcements published yet.
              </p>
            ) : (
              announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="py-3.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-indigo-700 dark:text-cyan-400">{ann.unitCode}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{ann.category.replace('_', ' ')}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ann.authorName}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {ann.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
              <span>Quick Access Services</span>
            </h3>
            <Link to="/dashboard/services" className="text-xs font-semibold text-indigo-700 dark:text-cyan-400 hover:underline">
              All Services
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
            {services.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                Campus service directories have not been published yet.
              </p>
            ) : (
              services.slice(0, 4).map((srv) => (
                <Link
                  key={srv.id}
                  to="/dashboard/services"
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {srv.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {srv.operatingHours}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
