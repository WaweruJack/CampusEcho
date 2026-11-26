import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';
import { useCampusData } from '../../context/CampusDataContext';
import { DAYS_OF_WEEK } from '../../data/demoData';
import {
  computeFreePeriods,
  detectStudentOverlaps,
  minutesToDurationLabel,
  timeToMinutes,
} from '../../lib/validation';
import StatusIndicator from '../../components/StatusIndicator';

export default function TimetablePage() {
  const { timetableSlots, todayDayName } = useCampusData();
  const [viewMode, setViewMode] = useState('weekly');
  const [selectedDay, setSelectedDay] = useState(todayDayName);

  const slotsByDay = useMemo(() => {
    const grouped = {};
    for (const day of DAYS_OF_WEEK) {
      grouped[day] = timetableSlots
        .filter((s) => s.dayOfWeek === day)
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    }
    return grouped;
  }, [timetableSlots]);

  const dailySlots = slotsByDay[selectedDay] || [];
  const dailyOverlaps = useMemo(() => detectStudentOverlaps(dailySlots), [dailySlots]);
  const freePeriods = useMemo(() => computeFreePeriods(dailySlots), [dailySlots]);

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Smart Academic Timetable
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Inspect daily and weekly schedules, free study periods, overlapping sessions, and live venue updates.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 self-start">
          <button
            type="button"
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'weekly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Weekly View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('daily')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              viewMode === 'daily'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Daily View
          </button>
        </div>
      </div>

      {/* Day selector for Daily view */}
      {viewMode === 'daily' && (
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const count = (slotsByDay[day] || []).length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors whitespace-nowrap ${
                  selectedDay === day
                    ? 'bg-indigo-900 dark:bg-indigo-600 text-white border-indigo-900 dark:border-indigo-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
                }`}
              >
                {day} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Daily View */}
      {viewMode === 'daily' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            {dailyOverlaps.size > 0 && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-4 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-200">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Schedule Overlap Detected on {selectedDay}</p>
                  <p className="mt-0.5">
                    Two or more units in your {selectedDay} timetable overlap in time. Highlighted classes require coordinator attention.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {dailySlots.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No lectures or labs scheduled on {selectedDay}.
                </div>
              ) : (
                dailySlots.map((slot) => {
                  const isOverlapping = dailyOverlaps.has(slot.id);
                  return (
                    <div
                      key={slot.id}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isOverlapping ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono-nums text-xs font-semibold text-indigo-700 dark:text-cyan-400">
                            {slot.startTime} – {slot.endTime}
                          </span>
                          <StatusIndicator status={slot.status} />
                          {isOverlapping && (
                            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                              Overlapping Class
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                          {slot.unitCode} · {slot.unitName}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Venue: <strong>{slot.venueName}</strong> ({slot.buildingName}, {slot.floorLabel}) · {slot.lecturerName}
                        </p>
                        {slot.previousVenueName && (
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                            Venue Changed: {slot.previousVenueName} → {slot.venueName}
                          </p>
                        )}
                        {slot.changeNote && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{slot.changeNote}</p>
                        )}
                      </div>

                      <Link
                        to={`/dashboard/maps?building=${slot.buildingId || ''}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 self-start sm:self-center whitespace-nowrap"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        <span>Directions</span>
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Free Periods Panel */}
          <aside className="lg:col-span-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 h-fit">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Clock className="h-4 w-4 text-indigo-700 dark:text-cyan-400" />
              <span>Free Periods ({selectedDay})</span>
            </h3>
            <div className="mt-3 space-y-3">
              {freePeriods.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No breaks ≥ 30 minutes between 08:00 and 17:00.
                </p>
              ) : (
                freePeriods.map((fp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b last:border-b-0 border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <span className="font-mono-nums font-semibold text-slate-800 dark:text-slate-200">
                      {fp.startTime} – {fp.endTime}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {minutesToDurationLabel(fp.durationMins)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      ) : (
        /* Weekly Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {DAYS_OF_WEEK.map((day) => {
            const list = slotsByDay[day] || [];
            const dayOverlaps = detectStudentOverlaps(list);
            const dayFree = computeFreePeriods(list);
            return (
              <section
                key={day}
                className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {day}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      {list.length} {list.length === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>

                  {list.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      Free study day · No scheduled lectures
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-1">
                      {list.map((slot) => (
                        <div key={slot.id} className="py-3.5 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono-nums text-xs font-semibold text-indigo-700 dark:text-cyan-400">
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <StatusIndicator status={slot.status} />
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {slot.unitCode} · {slot.unitName}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {slot.venueName} · {slot.lecturerName}
                          </p>
                          {slot.previousVenueName && (
                            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                              Moved: {slot.previousVenueName} → {slot.venueName}
                            </p>
                          )}
                          {dayOverlaps.has(slot.id) && (
                            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              Overlapping time conflict
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {list.length > 0 && dayFree.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    Free windows:{' '}
                    {dayFree.map((fp) => `${fp.startTime}–${fp.endTime}`).join(', ')}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
